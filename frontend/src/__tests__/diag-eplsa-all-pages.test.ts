/**
 * Audit complet de toutes les pages de la liasse sur la balance réelle EPL SA.
 * Détecte : pages vides, totaux page incohérents avec les refs Bilan/CdR,
 * cascades SIG/TFT incohérentes.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseExcelFile, detectStructure, parseBalanceData } from '@/services/balanceParserService'
import { LiasseDataService } from '@/services/liasseDataService'

const BAL = 'C:/Users/admin/Downloads/Modele_Balance_2026_28052026 (1).xlsx'

interface PageReport {
  page: string
  rowCount: number
  emptyOrAllZero: boolean
  totalNet?: number
  totalBrut?: number
  notes?: string
}

describe.skipIf(!fs.existsSync(BAL))('Audit toutes pages — EPL SA', () => {
  it('produit le rapport diag-eplsa-all-pages.json', () => {
    const bytes = new Uint8Array(fs.readFileSync(BAL))
    const sheets = parseExcelFile(bytes as unknown as ArrayBuffer)
    const parsed = parseBalanceData(sheets[0], detectStructure(sheets[0]).mapping!)
    const svc = new LiasseDataService()
    svc.loadBalance(parsed.entries)

    const pages: PageReport[] = []
    const sumRows = (rows: unknown[], pick: string[]): number =>
      rows.reduce((s: number, r: unknown) => {
        const row = r as Record<string, unknown>
        for (const k of pick) if (typeof row[k] === 'number') return s + (row[k] as number)
        return s
      }, 0)

    // ── Bilan Actif ──
    try {
      const actif = svc.generateBilanActif() as { brut?: number; net?: number; netN1?: number }[]
      pages.push({
        page: 'Bilan Actif',
        rowCount: actif.length,
        emptyOrAllZero: actif.every((r) => !(r.brut || r.net)),
        totalBrut: Math.round(actif.reduce((s, r) => s + (r.brut || 0), 0)),
        totalNet: Math.round(actif.reduce((s, r) => s + (r.net || 0), 0)),
      })
    } catch (e) { pages.push({ page: 'Bilan Actif', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── Bilan Passif ──
    try {
      const passif = svc.generateBilanPassif() as { montant?: number; montantN1?: number }[]
      pages.push({
        page: 'Bilan Passif',
        rowCount: passif.length,
        emptyOrAllZero: passif.every((r) => !r.montant),
        totalNet: Math.round(passif.reduce((s, r) => s + (r.montant || 0), 0)),
      })
    } catch (e) { pages.push({ page: 'Bilan Passif', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── Compte de Résultat ──
    try {
      const cr = svc.generateCompteResultat() as { charges?: unknown[]; produits?: unknown[]; resultat?: number }
      const charges = cr.charges || []
      const produits = cr.produits || []
      pages.push({
        page: 'Compte de Résultat',
        rowCount: charges.length + produits.length,
        emptyOrAllZero: charges.length === 0 && produits.length === 0,
        totalBrut: Math.round(sumRows(charges, ['montant', 'montantN', 'net'])),
        totalNet: Math.round(sumRows(produits, ['montant', 'montantN', 'net'])),
        notes: `résultat=${Math.round(cr.resultat || 0)}`,
      })
    } catch (e) { pages.push({ page: 'Compte de Résultat', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── SIG ──
    try {
      const sig = svc.generateSIG() as { ref?: string; montant?: number }[]
      pages.push({
        page: 'SIG',
        rowCount: sig.length,
        emptyOrAllZero: sig.every((r) => !r.montant),
        notes: sig.filter((r) => ['SIG1', 'SIG4', 'SIG7', 'SIG9'].includes(r.ref || '')).map((r) => `${r.ref}=${Math.round(r.montant || 0)}`).join(' | '),
      })
    } catch (e) { pages.push({ page: 'SIG', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── TFT ──
    try {
      const tft = svc.generateTFT() as unknown as Record<string, number>
      pages.push({
        page: 'TFT',
        rowCount: Object.keys(tft).length,
        emptyOrAllZero: Object.values(tft).every((v) => !v),
        notes: ['FA', 'FG', 'FK', 'FP', 'FQ', 'FS'].map((k) => `${k}=${Math.round(tft[k] || 0)}`).join(' | '),
      })
    } catch (e) { pages.push({ page: 'TFT', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── TAFIRE ──
    try {
      const taf = svc.generateTAFIRE() as Record<string, unknown>
      const keys = Object.keys(taf)
      pages.push({ page: 'TAFIRE', rowCount: keys.length, emptyOrAllZero: keys.length === 0, notes: keys.slice(0, 8).join(',') })
    } catch (e) { pages.push({ page: 'TAFIRE', rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` }) }

    // ── Notes individuelles ──
    const noteMethods: [string, () => unknown[]][] = [
      ['Note 3A (Immo)', () => svc.generateNote3A()],
      ['Note 3C (Cessions)', () => svc.generateNote3C()],
      ['Note 6 (Stocks)', () => svc.generateNote6()],
      ['Note 8 (Trésorerie)', () => svc.generateNote8()],
      ['Note 11 (Capitaux)', () => svc.generateNote11()],
      ['Note 14 (Capitaux propres)', () => svc.generateNote14()],
      ['Note 17 (CA)', () => svc.generateNote17()],
      ['Note 19 (Charges)', () => svc.generateNote19()],
    ]
    for (const [name, fn] of noteMethods) {
      try {
        const rows = fn()
        const sum = sumRows(rows, ['montant', 'total', 'net', 'valeur'])
        pages.push({
          page: name,
          rowCount: rows.length,
          emptyOrAllZero: rows.length === 0 || sum === 0,
          totalNet: Math.round(sum),
        })
      } catch (e) {
        pages.push({ page: name, rowCount: 0, emptyOrAllZero: true, notes: `ERREUR: ${e instanceof Error ? e.message : e}` })
      }
    }

    // ── Cohérences clés ──
    const coherence = svc.validateCoherenceDetailed() as { checks?: Array<{ label?: string; valeurA?: number; valeurB?: number; ecart?: number; ok?: boolean }> }
    const checks = (coherence.checks || []).map((c) => ({
      label: c.label,
      A: Math.round(c.valeurA || 0),
      B: Math.round(c.valeurB || 0),
      ecart: Math.round(c.ecart || 0),
      ok: c.ok,
    }))

    const report = { pageCount: pages.length, pages, coherenceChecks: checks }
    fs.writeFileSync(
      path.resolve(__dirname, './fixtures/diag-eplsa-all-pages.json'),
      JSON.stringify(report, null, 2),
    )
    expect(pages.length).toBeGreaterThan(0)
  })
})
