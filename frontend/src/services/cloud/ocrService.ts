/**
 * OCR Service — Frontend client for the ocr-extract Edge Function
 * Handles file upload, base64 conversion, and result parsing.
 */

import { supabase } from '@/config/supabase'

// ============================================================
// Types
// ============================================================

export interface OcrLine {
  numero_compte: string
  libelle: string
  debit: number
  credit: number
  confidence: number
}

export interface OcrResult {
  raw_text: string
  lines: OcrLine[]
  metadata: {
    pages: number
    language: string
    processing_time_ms: number
  }
}

// ============================================================
// Core: extract accounting data from image/PDF
// ============================================================

/**
 * Send an image file to the OCR Edge Function and get structured accounting data
 */
export async function extractFromImage(file: File): Promise<OcrResult> {
  // Convert file to base64
  const base64 = await fileToBase64(file)

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('ocr-extract', {
    body: {
      image_base64: base64,
      mime_type: file.type,
    },
  })

  if (error) throw new Error(error.message || 'OCR extraction failed')
  if (data?.error) throw new Error(data.error)

  return data.data as OcrResult
}

/**
 * Extract from a base64 string directly (e.g., from canvas capture)
 */
export async function extractFromBase64(base64: string, mimeType = 'image/png'): Promise<OcrResult> {
  const { data, error } = await supabase.functions.invoke('ocr-extract', {
    body: {
      image_base64: base64,
      mime_type: mimeType,
    },
  })

  if (error) throw new Error(error.message || 'OCR extraction failed')
  if (data?.error) throw new Error(data.error)

  return data.data as OcrResult
}

// ============================================================
// Helpers
// ============================================================

/**
 * Convert File to base64 string (without data:mime;base64, prefix)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data:*;base64, prefix
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert OCR lines to the balance import format expected by the app
 */
export function ocrLinesToBalanceEntries(lines: OcrLine[]): Array<{
  numeroCompte: string
  libelle: string
  debitSolde: number
  creditSolde: number
  debitMouvement: number
  creditMouvement: number
  debitOuverture: number
  creditOuverture: number
}> {
  return lines
    .filter(l => l.confidence >= 0.5) // Only keep high-confidence lines
    .map(l => ({
      numeroCompte: l.numero_compte,
      libelle: l.libelle,
      debitSolde: l.debit,
      creditSolde: l.credit,
      debitMouvement: l.debit,
      creditMouvement: l.credit,
      debitOuverture: 0,
      creditOuverture: 0,
    }))
}

/**
 * Supported file types for OCR
 */
export const OCR_SUPPORTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/webp',
  'application/pdf',
]

export const OCR_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function isOcrSupported(file: File): boolean {
  return OCR_SUPPORTED_TYPES.includes(file.type) && file.size <= OCR_MAX_FILE_SIZE
}
