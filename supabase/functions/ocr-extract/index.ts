/**
 * OCR Extract — Supabase Edge Function
 * Receives an image/PDF (base64), calls Google Vision API,
 * returns structured accounting data (accounts, amounts, labels).
 *
 * Secret: GOOGLE_VISION_API_KEY (set in Supabase Dashboard > Edge Functions > Secrets)
 */

import { corsHeaders } from '../_shared/cors.ts'
import { authenticate, auditLog } from '../_shared/auth.ts'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

interface OcrLine {
  numero_compte: string
  libelle: string
  debit: number
  credit: number
  confidence: number
}

interface OcrResult {
  raw_text: string
  lines: OcrLine[]
  metadata: {
    pages: number
    language: string
    processing_time_ms: number
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const ctx = await authenticate(req)
    const body = await req.json()
    const { image_base64, mime_type = 'image/png' } = body

    if (!image_base64) {
      return jsonResponse({ error: 'image_base64 required' }, 400)
    }

    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    if (!apiKey) {
      return jsonResponse({ error: 'OCR service not configured (missing API key)' }, 503)
    }

    // Call Google Vision API
    const visionPayload = {
      requests: [{
        image: { content: image_base64 },
        features: [
          { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
        ],
        imageContext: {
          languageHints: ['fr'],
        },
      }],
    }

    const visionRes = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visionPayload),
    })

    if (!visionRes.ok) {
      const errText = await visionRes.text()
      throw new Error(`Google Vision API error: ${visionRes.status} ${errText}`)
    }

    const visionData = await visionRes.json()
    const fullText = visionData.responses?.[0]?.fullTextAnnotation?.text || ''
    const pages = visionData.responses?.[0]?.fullTextAnnotation?.pages?.length || 1

    // Parse accounting data from OCR text
    const lines = parseAccountingLines(fullText)

    const result: OcrResult = {
      raw_text: fullText,
      lines,
      metadata: {
        pages,
        language: 'fr',
        processing_time_ms: Date.now() - startTime,
      },
    }

    await auditLog(ctx, 'CREATE', 'ocr', undefined, {
      lines_detected: lines.length,
      pages,
      mime_type,
    })

    return jsonResponse({ data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('Missing') || msg.includes('Invalid') ? 401 : 500
    return jsonResponse({ error: msg }, status)
  }
})

/**
 * Parse accounting lines from raw OCR text.
 * Recognizes patterns like:
 *   601000  Achats de marchandises     1,234,567
 *   70100   Ventes de marchandises                  2,345,678
 *   401     Fournisseurs               500 000      800 000
 */
function parseAccountingLines(text: string): OcrLine[] {
  const lines: OcrLine[] = []
  const textLines = text.split('\n').filter(l => l.trim())

  // Pattern: account_number (3-8 digits) followed by label and amounts
  const accountPattern = /^(\d{3,8})\s+(.+?)(?:\s+([\d\s.,]+))?(?:\s+([\d\s.,]+))?$/

  for (const line of textLines) {
    const cleaned = line.trim().replace(/\t+/g, ' ')
    const match = cleaned.match(accountPattern)

    if (match) {
      const [, compte, libelle, amount1Str, amount2Str] = match
      const amount1 = parseAmount(amount1Str)
      const amount2 = parseAmount(amount2Str)

      // Heuristic: if only one amount, determine debit/credit by account class
      let debit = 0
      let credit = 0
      const classe = parseInt(compte[0])

      if (amount1 !== null && amount2 !== null) {
        debit = amount1
        credit = amount2
      } else if (amount1 !== null) {
        // Classes 1-5 = bilan, 6 = charges (debit), 7 = produits (credit)
        if (classe === 7) {
          credit = amount1
        } else {
          debit = amount1
        }
      }

      lines.push({
        numero_compte: compte,
        libelle: libelle.trim(),
        debit,
        credit,
        confidence: calculateConfidence(compte, libelle, amount1, amount2),
      })
    }
  }

  return lines
}

/**
 * Parse a French-formatted number: "1 234 567,89" or "1,234,567.89"
 */
function parseAmount(str?: string): number | null {
  if (!str) return null
  // Remove spaces, handle both , and . as decimal separator
  let cleaned = str.trim().replace(/\s/g, '')
  if (!cleaned || !/\d/.test(cleaned)) return null

  // French format: 1.234.567,89 or 1 234 567,89
  if (cleaned.includes(',') && cleaned.indexOf(',') > cleaned.lastIndexOf('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Could be 1,234,567 (English) or 567,89 (French decimal)
    const parts = cleaned.split(',')
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

/**
 * Confidence score based on data quality
 */
function calculateConfidence(
  compte: string,
  libelle: string,
  amount1: number | null,
  amount2: number | null,
): number {
  let score = 0.5

  // Valid SYSCOHADA account number (3-8 digits, starts with 1-8)
  if (/^[1-8]\d{2,7}$/.test(compte)) score += 0.2

  // Has a meaningful label (>3 chars, not just numbers)
  if (libelle.length > 3 && /[a-zA-ZàâéèêëïîôùûüÿçæœÀÂÉÈÊ]/.test(libelle)) score += 0.1

  // Has at least one amount
  if (amount1 !== null || amount2 !== null) score += 0.1

  // Has both debit and credit
  if (amount1 !== null && amount2 !== null) score += 0.1

  return Math.min(score, 1.0)
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
