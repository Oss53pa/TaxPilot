/**
 * Service d'export — TaxPilot
 * Export Excel (format DGI) et PDF pour la liasse fiscale SYSCOHADA
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { arrondiFCFA } from '@/config/taux-fiscaux-ci'
import { liasseDataService } from './liasseDataService'
import type { TypeLiasse } from '../types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// ============================================================
// Libellés SYSCOHADA pour les références
// ============================================================
const LIBELLES_ACTIF: Record<string, string> = {
  AQ: 'Frais d\'établissement', AR: 'Charges à répartir', AS: 'Primes de remboursement des obligations',
  AD: 'Brevets, licences, logiciels', AE: 'Fonds commercial', AF: 'Autres immobilisations incorporelles',
  AG: 'Immobilisations incorporelles en cours', AJ: 'Terrains', AK: 'Bâtiments',
  AL: 'Installations et agencements', AM: 'Matériel', AN: 'Matériel de transport',
  AP: 'Avances et acomptes versés sur immobilisations', AT: 'Titres de participation',
  AU: 'Autres immobilisations financières', BA: 'Actif circulant HAO',
  BC: 'Marchandises', BD: 'Matières premières', BE: 'Autres approvisionnements',
  BF: 'En-cours', BG: 'Produits fabriqués', BI: 'Fournisseurs, avances versées',
  BJ: 'Clients', BK: 'Autres créances', BQ: 'Titres de placement',
  BR: 'Valeurs à encaisser', BS: 'Banques, chèques postaux, caisse',
  BU: 'Écart de conversion-Actif',
}

const LIBELLES_PASSIF: Record<string, string> = {
  CA: 'Capital', CB: 'Actionnaires capital non appelé', CC: 'Primes et réserves',
  CD: 'Réserves', CE: 'Report à nouveau', CF: 'Résultat net de l\'exercice (bénéfice +)',
  CG: 'Subventions d\'investissement', CH: 'Provisions réglementées et fonds assimilés',
  CI: 'Résultat net de l\'exercice', CJ: 'Provisions pour risques et charges',
  DA: 'Emprunts obligataires', DB: 'Emprunts et dettes auprès des établissements de crédit',
  DC: 'Dettes de location-acquisition', DD: 'Autres dettes financières diverses',
  DE: 'Dettes de crédit-bail et contrats assimilés', DF: 'Provisions financières pour risques et charges',
  DH: 'Passif circulant HAO', DI: 'Clients, avances reçues',
  DJ: 'Fournisseurs d\'exploitation', DK: 'Dettes fiscales et sociales',
  DL: 'Autres dettes', DM: 'Risques provisionnés', DQ: 'Banques, crédits d\'escompte',
  DR: 'Banques, crédits de trésorerie', DT: 'Écart de conversion-Passif',
}

// ============================================================
// EXCEL EXPORT — Format DGI
// ============================================================

export function exportLiasseExcel(
  entreprise: { raison_sociale: string; numero_contribuable: string },
  exercice: string,
  typeLiasse: TypeLiasse = 'SN'
) {
  const wb = XLSX.utils.book_new()

  // 1. Bilan Actif
  const actif = liasseDataService.generateBilanActif(typeLiasse)
  const actifRows = [
    ['BILAN ACTIF', '', '', '', ''],
    [entreprise.raison_sociale, '', 'N° Contribuable:', entreprise.numero_contribuable, ''],
    ['Exercice clos le:', exercice, '', '', ''],
    ['', '', '', '', ''],
    ['Réf.', 'Poste', 'Brut', 'Amort./Prov.', 'Net N', 'Net N-1'],
    ...actif.map((row: any) => [
      row.ref,
      LIBELLES_ACTIF[row.ref] || row.ref,
      arrondiFCFA(row.brut),
      arrondiFCFA(row.amortProv),
      arrondiFCFA(row.net),
      arrondiFCFA(row.net_n1),
    ]),
    ['', 'TOTAL ACTIF', '', '',
      arrondiFCFA(actif.reduce((s: number, r: any) => s + r.net, 0)),
      arrondiFCFA(actif.reduce((s: number, r: any) => s + r.net_n1, 0)),
    ],
  ]
  const wsActif = XLSX.utils.aoa_to_sheet(actifRows)
  wsActif['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsActif, 'Bilan Actif')

  // 2. Bilan Passif
  const passif = liasseDataService.generateBilanPassif(typeLiasse)
  const passifRows = [
    ['BILAN PASSIF', '', ''],
    [entreprise.raison_sociale, '', 'Exercice:', exercice],
    ['', '', ''],
    ['Réf.', 'Poste', 'Montant N', 'Montant N-1'],
    ...passif.map((row: any) => [
      row.ref,
      LIBELLES_PASSIF[row.ref] || row.ref,
      arrondiFCFA(row.montant),
      arrondiFCFA(row.montant_n1),
    ]),
    ['', 'TOTAL PASSIF',
      arrondiFCFA(passif.reduce((s: number, r: any) => s + r.montant, 0)),
      arrondiFCFA(passif.reduce((s: number, r: any) => s + r.montant_n1, 0)),
    ],
  ]
  const wsPassif = XLSX.utils.aoa_to_sheet(passifRows)
  wsPassif['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsPassif, 'Bilan Passif')

  // 3. Compte de Résultat
  const cdr = liasseDataService.generateCompteResultat(typeLiasse)
  const cdrRows = [
    ['COMPTE DE RÉSULTAT', '', ''],
    [entreprise.raison_sociale, '', 'Exercice:', exercice],
    ['', '', ''],
    ['CHARGES', '', ''],
    ['Réf.', 'Poste', 'Montant N', 'Montant N-1'],
    ...cdr.charges.map((row: any) => [row.ref, row.ref, arrondiFCFA(row.montant), arrondiFCFA(row.montant_n1)]),
    ['', '', '', ''],
    ['PRODUITS', '', ''],
    ['Réf.', 'Poste', 'Montant N', 'Montant N-1'],
    ...cdr.produits.map((row: any) => [row.ref, row.ref, arrondiFCFA(row.montant), arrondiFCFA(row.montant_n1)]),
  ]
  const wsCdr = XLSX.utils.aoa_to_sheet(cdrRows)
  wsCdr['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsCdr, 'Compte de Résultat')

  // 4. SIG
  const sig = liasseDataService.generateSIG()
  const sigRows = [
    ['SOLDES INTERMÉDIAIRES DE GESTION', '', ''],
    ['', '', ''],
    ['Réf.', 'Libellé', 'Montant N', 'Montant N-1'],
    ...sig.map((row: any) => [row.ref, row.label, arrondiFCFA(row.montant), arrondiFCFA(row.montant_n1)]),
  ]
  const wsSig = XLSX.utils.aoa_to_sheet(sigRows)
  wsSig['!cols'] = [{ wch: 8 }, { wch: 50 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsSig, 'SIG')

  // 5. TFT
  const tft = liasseDataService.generateTFT()
  const tftRows = [
    ['TABLEAU DES FLUX DE TRÉSORERIE', ''],
    ['', ''],
    ['Réf.', 'Libellé', 'Montant'],
    ['FA', 'Résultat net', arrondiFCFA(tft.FA)],
    ['FB', 'Dotations aux amortissements et provisions', arrondiFCFA(tft.FB)],
    ['FC', 'Reprises sur provisions', arrondiFCFA(tft.FC)],
    ['FD', 'Plus-values de cession', arrondiFCFA(tft.FD)],
    ['FE', 'CAFG', arrondiFCFA(tft.FE)],
    ['FF', 'Variation du BFR', arrondiFCFA(tft.FF)],
    ['FG', 'FLUX DE TRÉSORERIE OPÉRATIONNELS', arrondiFCFA(tft.FG)],
    ['FH', 'Acquisitions d\'immobilisations', arrondiFCFA(tft.FH)],
    ['FI', 'Cessions d\'immobilisations', arrondiFCFA(tft.FI)],
    ['FJ', 'Variation immo financières', arrondiFCFA(tft.FJ)],
    ['FK', 'FLUX DE TRÉSORERIE D\'INVESTISSEMENT', arrondiFCFA(tft.FK)],
    ['FL', 'Augmentation de capital', arrondiFCFA(tft.FL)],
    ['FM', 'Emprunts nouveaux', arrondiFCFA(tft.FM)],
    ['FN', 'Remboursement d\'emprunts', arrondiFCFA(tft.FN)],
    ['FO', 'Dividendes versés', arrondiFCFA(tft.FO)],
    ['FP', 'FLUX DE TRÉSORERIE DE FINANCEMENT', arrondiFCFA(tft.FP)],
    ['FQ', 'VARIATION DE TRÉSORERIE', arrondiFCFA(tft.FQ)],
    ['FR', 'Trésorerie début d\'exercice', arrondiFCFA(tft.FR)],
    ['FS', 'Trésorerie fin d\'exercice', arrondiFCFA(tft.FS)],
    ['FT', 'Contrôle (FQ = FS - FR)', arrondiFCFA(tft.FT)],
  ]
  const wsTft = XLSX.utils.aoa_to_sheet(tftRows)
  wsTft['!cols'] = [{ wch: 6 }, { wch: 45 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsTft, 'TFT')

  // Generate file
  const filename = `Liasse_${typeLiasse}_${entreprise.raison_sociale.replace(/\s+/g, '_')}_${exercice}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename)

  return filename
}

// ============================================================
// PDF EXPORT — Using browser print
// ============================================================

export function exportLiassePDF(
  entreprise: { raison_sociale: string; numero_contribuable: string },
  exercice: string,
  typeLiasse: TypeLiasse = 'SN'
) {
  const actif = liasseDataService.generateBilanActif(typeLiasse)
  const passif = liasseDataService.generateBilanPassif(typeLiasse)
  const cdr = liasseDataService.generateCompteResultat(typeLiasse)
  const sig = liasseDataService.generateSIG()
  const tft = liasseDataService.generateTFT()

  const fmt = (n: number) => arrondiFCFA(n).toLocaleString('fr-FR')
  const totalActifNet = arrondiFCFA(actif.reduce((s: number, r: any) => s + r.net, 0))
  const totalPassif = arrondiFCFA(passif.reduce((s: number, r: any) => s + r.montant, 0))
  const totalCharges = arrondiFCFA(cdr.charges.reduce((s: number, r: any) => s + r.montant, 0))
  const totalProduits = arrondiFCFA(cdr.produits.reduce((s: number, r: any) => s + r.montant, 0))

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Liasse Fiscale ${typeLiasse} — ${entreprise.raison_sociale}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; margin: 20px; color: #333; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 5px; }
  h2 { font-size: 13px; border-bottom: 2px solid #1976d2; padding-bottom: 3px; margin-top: 30px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: auto; }
  th { background: #1976d2; color: white; padding: 5px 8px; text-align: left; font-size: 10px; }
  td { padding: 4px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total td { font-weight: bold; border-top: 2px solid #333; background: ${P.primary100}; }
  .sig td { font-weight: bold; background: #e3f2fd; }
  .grandtotal td { font-weight: bold; background: #1976d2; color: white; }
  @media print { .no-print { display: none; } body { margin: 10mm; } }
  .footer { text-align: center; margin-top: 30px; font-size: 9px; color: #999; }
</style>
</head><body>
<div class="header">
  <h1>LIASSE FISCALE SYSCOHADA — ${typeLiasse}</h1>
  <p><strong>${entreprise.raison_sociale}</strong> — N° Contribuable: ${entreprise.numero_contribuable}</p>
  <p>Exercice clos le ${exercice}</p>
</div>

<h2>BILAN ACTIF</h2>
<table>
  <tr><th>Réf.</th><th>Poste</th><th class="num">Brut</th><th class="num">Amort./Prov.</th><th class="num">Net N</th><th class="num">Net N-1</th></tr>
  ${actif.map((r: any) => `<tr><td>${r.ref}</td><td>${LIBELLES_ACTIF[r.ref] || r.ref}</td><td class="num">${fmt(r.brut)}</td><td class="num">${fmt(r.amortProv)}</td><td class="num">${fmt(r.net)}</td><td class="num">${fmt(r.net_n1)}</td></tr>`).join('')}
  <tr class="total"><td></td><td>TOTAL ACTIF</td><td></td><td></td><td class="num">${fmt(totalActifNet)}</td><td></td></tr>
</table>

<h2>BILAN PASSIF</h2>
<table>
  <tr><th>Réf.</th><th>Poste</th><th class="num">Montant N</th><th class="num">Montant N-1</th></tr>
  ${passif.map((r: any) => `<tr><td>${r.ref}</td><td>${LIBELLES_PASSIF[r.ref] || r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`).join('')}
  <tr class="total"><td></td><td>TOTAL PASSIF</td><td class="num">${fmt(totalPassif)}</td><td></td></tr>
</table>

<h2>COMPTE DE RÉSULTAT</h2>
<table>
  <tr><th colspan="4">CHARGES</th></tr>
  <tr><th>Réf.</th><th>Poste</th><th class="num">N</th><th class="num">N-1</th></tr>
  ${cdr.charges.map((r: any) => `<tr><td>${r.ref}</td><td>${r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`).join('')}
  <tr class="total"><td></td><td>TOTAL CHARGES</td><td class="num">${fmt(totalCharges)}</td><td></td></tr>
</table>
<table>
  <tr><th colspan="4">PRODUITS</th></tr>
  <tr><th>Réf.</th><th>Poste</th><th class="num">N</th><th class="num">N-1</th></tr>
  ${cdr.produits.map((r: any) => `<tr><td>${r.ref}</td><td>${r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`).join('')}
  <tr class="total"><td></td><td>TOTAL PRODUITS</td><td class="num">${fmt(totalProduits)}</td><td></td></tr>
</table>

<h2>SOLDES INTERMÉDIAIRES DE GESTION</h2>
<table>
  <tr><th>Réf.</th><th>Libellé</th><th class="num">N</th><th class="num">N-1</th></tr>
  ${sig.map((r: any) => `<tr class="${r.type === 'grandtotal' ? 'grandtotal' : r.type === 'sig' ? 'sig' : ''}"><td>${r.ref}</td><td>${r.label}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`).join('')}
</table>

<h2>TABLEAU DES FLUX DE TRÉSORERIE</h2>
<table>
  <tr><th>Réf.</th><th>Libellé</th><th class="num">Montant</th></tr>
  <tr><td>FA</td><td>Résultat net</td><td class="num">${fmt(tft.FA)}</td></tr>
  <tr><td>FB</td><td>Dotations</td><td class="num">${fmt(tft.FB)}</td></tr>
  <tr><td>FC</td><td>Reprises</td><td class="num">${fmt(tft.FC)}</td></tr>
  <tr><td>FD</td><td>Plus-values cession</td><td class="num">${fmt(tft.FD)}</td></tr>
  <tr class="sig"><td>FE</td><td>CAFG</td><td class="num">${fmt(tft.FE)}</td></tr>
  <tr><td>FF</td><td>Variation BFR</td><td class="num">${fmt(tft.FF)}</td></tr>
  <tr class="sig"><td>FG</td><td>FLUX OPÉRATIONNELS</td><td class="num">${fmt(tft.FG)}</td></tr>
  <tr class="sig"><td>FK</td><td>FLUX D'INVESTISSEMENT</td><td class="num">${fmt(tft.FK)}</td></tr>
  <tr class="sig"><td>FP</td><td>FLUX DE FINANCEMENT</td><td class="num">${fmt(tft.FP)}</td></tr>
  <tr class="grandtotal"><td>FQ</td><td>VARIATION TRÉSORERIE</td><td class="num">${fmt(tft.FQ)}</td></tr>
  <tr><td>FS</td><td>Trésorerie fin</td><td class="num">${fmt(tft.FS)}</td></tr>
</table>

<div class="footer">
  <p>Généré par TaxPilot — &copy; ${new Date().getFullYear()} Atlas Studio. Tous droits réservés.</p>
</div>

<script class="no-print">window.onload = () => window.print();</script>
</body></html>`

  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}
