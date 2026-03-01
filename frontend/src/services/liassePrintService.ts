/**
 * Service d'impression/export de la liasse fiscale SYSCOHADA par regime
 * Utilise window.open() + window.print() pour l'export PDF (pattern existant)
 */

import { liasseDataService } from './liasseDataService'
import { arrondiFCFA } from '@/config/taux-fiscaux-ci'
import type { RegimeFiscal, EntrepriseInfo } from '@/components/liasse/templates/LiassePrintTemplate'

// ── Libelles ──

const LIBELLES_ACTIF: Record<string, string> = {
  AQ: "Frais d'etablissement", AR: 'Charges a repartir', AS: 'Primes de remboursement des obligations',
  AD: 'Brevets, licences, logiciels', AE: 'Fonds commercial', AF: 'Autres immobilisations incorporelles',
  AG: 'Immobilisations incorporelles en cours', AJ: 'Terrains', AK: 'Batiments',
  AL: 'Installations et agencements', AM: 'Materiel', AN: 'Materiel de transport',
  AP: 'Avances et acomptes sur immobilisations', AT: 'Titres de participation',
  AU: 'Autres immobilisations financieres', BA: 'Actif circulant HAO',
  BC: 'Marchandises', BD: 'Matieres premieres', BE: 'Autres approvisionnements',
  BF: 'En-cours', BG: 'Produits fabriques', BI: 'Fournisseurs, avances versees',
  BJ: 'Clients', BK: 'Autres creances', BQ: 'Titres de placement',
  BR: 'Valeurs a encaisser', BS: 'Banques, cheques postaux, caisse',
  BU: 'Ecart de conversion-Actif',
}

const LIBELLES_PASSIF: Record<string, string> = {
  CA: 'Capital', CB: 'Actionnaires capital non appele', CC: 'Primes et reserves',
  CD: 'Reserves', CE: 'Report a nouveau', CF: "Resultat net de l'exercice",
  CG: "Subventions d'investissement", CH: 'Provisions reglementees',
  CI: "Resultat net de l'exercice", CJ: 'Provisions pour risques et charges',
  DA: 'Emprunts obligataires', DB: 'Emprunts aupres des etab. de credit',
  DC: 'Dettes de location-acquisition', DD: 'Autres dettes financieres',
  DE: 'Dettes de credit-bail', DF: 'Provisions financieres',
  DH: 'Passif circulant HAO', DI: 'Clients, avances recues',
  DJ: "Fournisseurs d'exploitation", DK: 'Dettes fiscales et sociales',
  DL: 'Autres dettes', DM: 'Risques provisionnes', DQ: "Banques, credits d'escompte",
  DR: 'Banques, credits de tresorerie', DT: 'Ecart de conversion-Passif',
}

const fmt = (n: number): string => {
  const v = arrondiFCFA(n)
  if (v === 0) return ''
  return v.toLocaleString('fr-FR')
}

// ── CSS commune ──

const printCSS = `
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; margin: 20px; color: #171717; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 5px; }
  h2 { font-size: 13px; border-bottom: 2px solid #171717; padding-bottom: 3px; margin-top: 30px; }
  .cover { text-align: center; page-break-after: always; padding-top: 60px; }
  .cover-box { border: 2px solid #171717; padding: 30px; max-width: 500px; margin: 40px auto; }
  .cover p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: auto; }
  th { background: #171717; color: #fff; padding: 5px 8px; text-align: left; font-size: 10px; }
  td { padding: 4px 8px; border-bottom: 1px solid #e5e5e5; font-size: 10px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .section td { font-weight: bold; background: #f5f5f5; font-size: 10px; }
  .total td { font-weight: bold; border-top: 2px solid #171717; background: #f5f5f5; }
  .sig td { font-weight: bold; background: #f5f5f5; }
  .grandtotal td { font-weight: bold; background: #171717; color: #fff; }
  .page-break { page-break-after: always; }
  @page { size: A4 portrait; }
  @page landscape-page { size: A4 landscape; }
  .landscape { page: landscape-page; }
  @media print { .no-print { display: none; } body { margin: 10mm; } }
  .footer { text-align: center; margin-top: 30px; font-size: 8px; color: #a3a3a3; border-top: 1px solid #e5e5e5; padding-top: 8px; }
`

// ── HTML Generators ──

function generateCoverHTML(regime: RegimeFiscal, entreprise: EntrepriseInfo, exercice: string): string {
  const regimeLabels: Record<RegimeFiscal, string> = {
    normal: 'SYSTEME NORMAL (SN)',
    simplifie: 'SYSTEME MINIMAL DE TRESORERIE (SMT)',
    forfaitaire: 'REGIME FORFAITAIRE',
    micro: 'MICRO-ENTREPRISE',
  }

  return `
    <div class="cover">
      <p style="font-size:12px;color:#737373;">Direction Generale des Impots</p>
      <div class="cover-box">
        <h1>LIASSE FISCALE</h1>
        <p style="font-size:14px;font-weight:600;color:#404040;">${regimeLabels[regime]}</p>
        <hr/>
        <p style="font-size:16px;font-weight:700;">${entreprise.raison_sociale}</p>
        ${entreprise.sigle ? `<p style="font-size:12px;color:#404040;">${entreprise.sigle}</p>` : ''}
        <p>N° Contribuable : ${entreprise.numero_contribuable}</p>
        ${entreprise.rccm ? `<p>RCCM : ${entreprise.rccm}</p>` : ''}
        ${entreprise.forme_juridique ? `<p>Forme juridique : ${entreprise.forme_juridique}</p>` : ''}
        ${entreprise.secteur_activite ? `<p>Activite : ${entreprise.secteur_activite}</p>` : ''}
        ${entreprise.adresse ? `<p>Adresse : ${entreprise.adresse}${entreprise.ville ? ' — ' + entreprise.ville : ''}</p>` : ''}
        ${entreprise.telephone ? `<p>Tel : ${entreprise.telephone}</p>` : ''}
        ${entreprise.capital_social ? `<p>Capital : ${entreprise.capital_social.toLocaleString('fr-FR')} FCFA</p>` : ''}
        ${entreprise.nom_dirigeant ? `<p>Dirigeant : ${entreprise.nom_dirigeant}</p>` : ''}
        <hr/>
        <p style="font-size:13px;font-weight:600;">Exercice clos le ${exercice}</p>
      </div>
      <p style="font-size:9px;color:#a3a3a3;margin-top:60px;">Conforme au Plan Comptable SYSCOHADA revise — OHADA</p>
    </div>`
}

function generateBilanActifHTML(typeLiasse: 'SN' | 'SMT'): string {
  const actif = liasseDataService.generateBilanActif(typeLiasse)
  const totalNet = arrondiFCFA(actif.reduce((s: number, r: any) => s + r.net, 0))
  const totalNetN1 = arrondiFCFA(actif.reduce((s: number, r: any) => s + r.net_n1, 0))

  const colHeaders = typeLiasse === 'SN'
    ? '<th>Ref</th><th>ACTIF</th><th class="num">Brut</th><th class="num">Amort./Prov.</th><th class="num">Net N</th><th class="num">Net N-1</th>'
    : '<th>Ref</th><th>ACTIF</th><th class="num">Net N</th><th class="num">Net N-1</th>'

  const rows = actif.map((r: any) => {
    const brutCols = typeLiasse === 'SN'
      ? `<td class="num">${fmt(r.brut)}</td><td class="num">${fmt(r.amortProv)}</td>`
      : ''
    return `<tr><td style="font-weight:600">${r.ref}</td><td>${LIBELLES_ACTIF[r.ref] || r.ref}</td>${brutCols}<td class="num">${fmt(r.net)}</td><td class="num">${fmt(r.net_n1)}</td></tr>`
  }).join('')

  const totalBrutCols = typeLiasse === 'SN' ? '<td></td><td></td>' : ''

  return `
    <div class="page-break">
      <h2>BILAN ACTIF</h2>
      <table>
        <tr>${colHeaders}</tr>
        ${rows}
        <tr class="total"><td></td><td>TOTAL ACTIF</td>${totalBrutCols}<td class="num">${fmt(totalNet)}</td><td class="num">${fmt(totalNetN1)}</td></tr>
      </table>
    </div>`
}

function generateBilanPassifHTML(typeLiasse: 'SN' | 'SMT'): string {
  const passif = liasseDataService.generateBilanPassif(typeLiasse)
  const totalN = arrondiFCFA(passif.reduce((s: number, r: any) => s + r.montant, 0))
  const totalN1 = arrondiFCFA(passif.reduce((s: number, r: any) => s + r.montant_n1, 0))

  const rows = passif.map((r: any) =>
    `<tr><td style="font-weight:600">${r.ref}</td><td>${LIBELLES_PASSIF[r.ref] || r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`
  ).join('')

  return `
    <div class="page-break">
      <h2>BILAN PASSIF</h2>
      <table>
        <tr><th>Ref</th><th>PASSIF</th><th class="num">Montant N</th><th class="num">Montant N-1</th></tr>
        ${rows}
        <tr class="total"><td></td><td>TOTAL PASSIF</td><td class="num">${fmt(totalN)}</td><td class="num">${fmt(totalN1)}</td></tr>
      </table>
    </div>`
}

function generateCompteResultatHTML(typeLiasse: 'SN' | 'SMT'): string {
  const cdr = liasseDataService.generateCompteResultat(typeLiasse)
  const totalCharges = arrondiFCFA(cdr.charges.reduce((s: number, r: any) => s + r.montant, 0))
  const totalProduits = arrondiFCFA(cdr.produits.reduce((s: number, r: any) => s + r.montant, 0))

  const chargesRows = cdr.charges.map((r: any) =>
    `<tr><td>${r.ref}</td><td>${r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`
  ).join('')

  const produitsRows = cdr.produits.map((r: any) =>
    `<tr><td>${r.ref}</td><td>${r.ref}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`
  ).join('')

  return `
    <div class="page-break">
      <h2>COMPTE DE RESULTAT</h2>
      <table>
        <tr class="section"><td colspan="4">CHARGES</td></tr>
        <tr><th>Ref</th><th>Poste</th><th class="num">N</th><th class="num">N-1</th></tr>
        ${chargesRows}
        <tr class="total"><td></td><td>TOTAL CHARGES</td><td class="num">${fmt(totalCharges)}</td><td></td></tr>
      </table>
      <table>
        <tr class="section"><td colspan="4">PRODUITS</td></tr>
        <tr><th>Ref</th><th>Poste</th><th class="num">N</th><th class="num">N-1</th></tr>
        ${produitsRows}
        <tr class="total"><td></td><td>TOTAL PRODUITS</td><td class="num">${fmt(totalProduits)}</td><td></td></tr>
      </table>
      <table>
        <tr class="grandtotal"><td></td><td>RESULTAT NET</td><td class="num">${fmt(totalProduits - totalCharges)}</td><td></td></tr>
      </table>
    </div>`
}

function generateSIGHTML(): string {
  const sig = liasseDataService.generateSIG()
  const rows = sig.map((r: any) => {
    const cls = r.type === 'grandtotal' ? 'grandtotal' : r.type === 'sig' ? 'sig' : ''
    return `<tr class="${cls}"><td>${r.ref}</td><td>${r.label}</td><td class="num">${fmt(r.montant)}</td><td class="num">${fmt(r.montant_n1)}</td></tr>`
  }).join('')

  return `
    <div class="page-break">
      <h2>SOLDES INTERMEDIAIRES DE GESTION (SIG)</h2>
      <table>
        <tr><th>Ref</th><th>Libelle</th><th class="num">N</th><th class="num">N-1</th></tr>
        ${rows}
      </table>
    </div>`
}

function generateTAFIREHTML(): string {
  const tafire = liasseDataService.generateTAFIRE()

  return `
    <div class="page-break">
      <h2>TAFIRE — TABLEAU FINANCIER DES RESSOURCES ET EMPLOIS</h2>
      <table>
        <tr><th>Libelle</th><th class="num">Exercice N</th><th class="num">Exercice N-1</th></tr>
        <tr class="section"><td colspan="3">PARTIE I — ACTIVITE</td></tr>
        <tr><td>Capacite d'Autofinancement Globale (CAFG)</td><td class="num">${fmt(tafire.CAFG)}</td><td class="num">${fmt(tafire.CAFG_N1)}</td></tr>
        <tr><td>(-) Dividendes distribues</td><td class="num">${fmt(-tafire.dividendes)}</td><td></td></tr>
        <tr class="sig"><td>= Autofinancement</td><td class="num">${fmt(tafire.autofinancement)}</td><td></td></tr>
        <tr class="section"><td colspan="3">PARTIE II — INVESTISSEMENT</td></tr>
        <tr><td>Acquisitions d'immobilisations</td><td class="num">${fmt(tafire.acquisImmo)}</td><td></td></tr>
        <tr><td>Cessions d'immobilisations</td><td class="num">${fmt(tafire.cessions)}</td><td></td></tr>
        <tr class="section"><td colspan="3">PARTIE III — FINANCEMENT</td></tr>
        <tr><td>Augmentation de capital</td><td class="num">${fmt(tafire.augCapital)}</td><td></td></tr>
        <tr><td>Emprunts nouveaux</td><td class="num">${fmt(tafire.empruntsNouveaux)}</td><td></td></tr>
        <tr><td>Remboursement d'emprunts</td><td class="num">${fmt(-tafire.remboursements)}</td><td></td></tr>
        <tr class="section"><td colspan="3">VARIATION DU BFR</td></tr>
        <tr><td>Variation des stocks</td><td class="num">${fmt(tafire.varStocks)}</td><td></td></tr>
        <tr><td>Variation des creances</td><td class="num">${fmt(tafire.varCreances)}</td><td></td></tr>
        <tr><td>Variation des dettes fournisseurs</td><td class="num">${fmt(tafire.varFournisseurs)}</td><td></td></tr>
        <tr class="sig"><td>Variation du BFR</td><td class="num">${fmt(tafire.varBFR)}</td><td></td></tr>
        <tr class="section"><td colspan="3">SYNTHESE</td></tr>
        <tr class="sig"><td>Total des emplois</td><td class="num">${fmt(tafire.totalEmplois)}</td><td></td></tr>
        <tr class="sig"><td>Total des ressources</td><td class="num">${fmt(tafire.totalRessources)}</td><td></td></tr>
        <tr class="grandtotal"><td>VARIATION DE TRESORERIE</td><td class="num">${fmt(tafire.varTresorerie)}</td><td></td></tr>
      </table>
    </div>`
}

function generateTFTHTML(): string {
  const tft = liasseDataService.generateTFT()

  return `
    <div class="page-break">
      <h2>TABLEAU DES FLUX DE TRESORERIE (TFT)</h2>
      <table>
        <tr><th>Ref</th><th>Libelle</th><th class="num">Montant</th></tr>
        <tr><td>FA</td><td>Resultat net</td><td class="num">${fmt(tft.FA)}</td></tr>
        <tr><td>FB</td><td>Dotations aux amortissements et provisions</td><td class="num">${fmt(tft.FB)}</td></tr>
        <tr><td>FC</td><td>Reprises sur provisions</td><td class="num">${fmt(tft.FC)}</td></tr>
        <tr><td>FD</td><td>Plus-values de cession</td><td class="num">${fmt(tft.FD)}</td></tr>
        <tr class="sig"><td>FE</td><td>CAFG</td><td class="num">${fmt(tft.FE)}</td></tr>
        <tr><td>FF</td><td>Variation du BFR</td><td class="num">${fmt(tft.FF)}</td></tr>
        <tr class="sig"><td>FG</td><td>FLUX OPERATIONNELS</td><td class="num">${fmt(tft.FG)}</td></tr>
        <tr><td>FH</td><td>Acquisitions d'immobilisations</td><td class="num">${fmt(tft.FH)}</td></tr>
        <tr><td>FI</td><td>Cessions d'immobilisations</td><td class="num">${fmt(tft.FI)}</td></tr>
        <tr><td>FJ</td><td>Variation immobilisations financieres</td><td class="num">${fmt(tft.FJ)}</td></tr>
        <tr class="sig"><td>FK</td><td>FLUX D'INVESTISSEMENT</td><td class="num">${fmt(tft.FK)}</td></tr>
        <tr><td>FL</td><td>Augmentation de capital</td><td class="num">${fmt(tft.FL)}</td></tr>
        <tr><td>FM</td><td>Emprunts nouveaux</td><td class="num">${fmt(tft.FM)}</td></tr>
        <tr><td>FN</td><td>Remboursement d'emprunts</td><td class="num">${fmt(tft.FN)}</td></tr>
        <tr><td>FO</td><td>Dividendes verses</td><td class="num">${fmt(tft.FO)}</td></tr>
        <tr class="sig"><td>FP</td><td>FLUX DE FINANCEMENT</td><td class="num">${fmt(tft.FP)}</td></tr>
        <tr class="grandtotal"><td>FQ</td><td>VARIATION TRESORERIE</td><td class="num">${fmt(tft.FQ)}</td></tr>
        <tr><td>FR</td><td>Tresorerie debut d'exercice</td><td class="num">${fmt(tft.FR)}</td></tr>
        <tr><td>FS</td><td>Tresorerie fin d'exercice</td><td class="num">${fmt(tft.FS)}</td></tr>
        <tr><td>FT</td><td>Controle (FQ = FS - FR)</td><td class="num">${fmt(tft.FT)}</td></tr>
      </table>
    </div>`
}

function generatePassageFiscalHTML(): string {
  const sig = liasseDataService.generateSIG()
  const resultatNet = sig.find((s: any) => s.ref === 'SIG9')?.montant ?? 0

  return `
    <div class="page-break">
      <h2>TABLEAU DE PASSAGE — RESULTAT COMPTABLE AU RESULTAT FISCAL</h2>
      <table>
        <tr><th>Designation</th><th class="num">Montant (FCFA)</th></tr>
        <tr><td style="font-weight:bold">Resultat comptable net</td><td class="num">${fmt(resultatNet)}</td></tr>
        <tr class="section"><td colspan="2">REINTEGRATIONS</td></tr>
        <tr><td>Charges non deductibles</td><td class="num"></td></tr>
        <tr><td>Amortissements excedentaires</td><td class="num"></td></tr>
        <tr><td>Provisions non deductibles</td><td class="num"></td></tr>
        <tr class="total"><td>Total reintegrations</td><td class="num"></td></tr>
        <tr class="section"><td colspan="2">DEDUCTIONS</td></tr>
        <tr><td>Produits non imposables</td><td class="num"></td></tr>
        <tr><td>Dividendes recus (regime mere-fille)</td><td class="num"></td></tr>
        <tr class="total"><td>Total deductions</td><td class="num"></td></tr>
        <tr class="grandtotal"><td>RESULTAT FISCAL</td><td class="num">${fmt(resultatNet)}</td></tr>
      </table>
      <p style="font-size:9px;color:#a3a3a3;margin-top:8px;">Note : Les reintegrations et deductions sont a renseigner manuellement.</p>
    </div>`
}

function generateForfaitaireHTML(entreprise: EntrepriseInfo, exercice: string): string {
  const cdr = liasseDataService.generateCompteResultat('SMT')
  const totalProduits = arrondiFCFA(cdr.produits.reduce((s: number, r: any) => s + r.montant, 0))
  const totalCharges = arrondiFCFA(cdr.charges.reduce((s: number, r: any) => s + r.montant, 0))

  const recettesRows = cdr.produits.map((r: any) =>
    `<tr><td>${r.ref} — Produit</td><td class="num">${fmt(r.montant)}</td></tr>`
  ).join('')

  const depensesRows = cdr.charges.map((r: any) =>
    `<tr><td>${r.ref} — Charge</td><td class="num">${fmt(r.montant)}</td></tr>`
  ).join('')

  return `
    <div>
      <h2>ETAT DES RECETTES ET DES DEPENSES — Regime Forfaitaire</h2>
      <p>${entreprise.raison_sociale} — Exercice ${exercice}</p>
      <table>
        <tr><th>Designation</th><th class="num">Montant (FCFA)</th></tr>
        <tr class="section"><td colspan="2">RECETTES</td></tr>
        ${recettesRows}
        <tr class="total"><td>TOTAL RECETTES</td><td class="num">${fmt(totalProduits)}</td></tr>
        <tr class="section"><td colspan="2">DEPENSES</td></tr>
        ${depensesRows}
        <tr class="total"><td>TOTAL DEPENSES</td><td class="num">${fmt(totalCharges)}</td></tr>
        <tr class="grandtotal"><td>RESULTAT (Recettes - Depenses)</td><td class="num">${fmt(totalProduits - totalCharges)}</td></tr>
      </table>
    </div>`
}

function generateMicroHTML(entreprise: EntrepriseInfo, exercice: string): string {
  const cdr = liasseDataService.generateCompteResultat('SMT')
  const chiffreAffaires = arrondiFCFA(cdr.produits.reduce((s: number, r: any) => s + r.montant, 0))
  const totalCharges = arrondiFCFA(cdr.charges.reduce((s: number, r: any) => s + r.montant, 0))

  return `
    <div>
      <h2>DECLARATION SIMPLIFIEE — Regime Micro-Entreprise</h2>
      <p>${entreprise.raison_sociale} — N° ${entreprise.numero_contribuable} — Exercice ${exercice}</p>
      <table>
        <tr><th>Element</th><th class="num">Montant (FCFA)</th></tr>
        <tr><td style="font-weight:bold">Raison sociale</td><td>${entreprise.raison_sociale}</td></tr>
        <tr><td style="font-weight:bold">N° Contribuable</td><td>${entreprise.numero_contribuable}</td></tr>
        ${entreprise.forme_juridique ? `<tr><td style="font-weight:bold">Forme juridique</td><td>${entreprise.forme_juridique}</td></tr>` : ''}
        ${entreprise.secteur_activite ? `<tr><td style="font-weight:bold">Activite</td><td>${entreprise.secteur_activite}</td></tr>` : ''}
      </table>
      <br/>
      <table>
        <tr><th>Element</th><th class="num">Montant (FCFA)</th></tr>
        <tr><td style="font-weight:bold">Chiffre d'affaires</td><td class="num">${fmt(chiffreAffaires)}</td></tr>
        <tr><td style="font-weight:bold">Total des charges</td><td class="num">${fmt(totalCharges)}</td></tr>
        <tr class="grandtotal"><td>Resultat net</td><td class="num">${fmt(chiffreAffaires - totalCharges)}</td></tr>
      </table>
    </div>`
}

// ══════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════

export function printLiasse(
  regime: RegimeFiscal,
  entreprise: EntrepriseInfo,
  exercice: string,
): void {
  let bodyContent = generateCoverHTML(regime, entreprise, exercice)

  switch (regime) {
    case 'normal':
      bodyContent += generateBilanActifHTML('SN')
      bodyContent += generateBilanPassifHTML('SN')
      bodyContent += generateCompteResultatHTML('SN')
      bodyContent += generateSIGHTML()
      bodyContent += generateTAFIREHTML()
      bodyContent += generateTFTHTML()
      bodyContent += generatePassageFiscalHTML()
      break
    case 'simplifie':
      bodyContent += generateBilanActifHTML('SMT')
      bodyContent += generateBilanPassifHTML('SMT')
      bodyContent += generateCompteResultatHTML('SMT')
      bodyContent += generateTFTHTML()
      bodyContent += generatePassageFiscalHTML()
      break
    case 'forfaitaire':
      bodyContent += generateForfaitaireHTML(entreprise, exercice)
      break
    case 'micro':
      bodyContent += generateMicroHTML(entreprise, exercice)
      break
  }

  bodyContent += `<div class="footer">Genere par FiscaSync — Conforme SYSCOHADA revise — ${new Date().getFullYear()}</div>`

  const regimeLabel: Record<RegimeFiscal, string> = {
    normal: 'SN', simplifie: 'SMT', forfaitaire: 'Forfaitaire', micro: 'Micro',
  }

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Liasse Fiscale ${regimeLabel[regime]} — ${entreprise.raison_sociale}</title>
<style>${printCSS}</style>
</head><body>
${bodyContent}
<script class="no-print">window.onload = () => window.print();<\/script>
</body></html>`

  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

export function exportLiassePDFByRegime(
  regime: RegimeFiscal,
  entreprise: EntrepriseInfo,
  exercice: string,
): void {
  printLiasse(regime, entreprise, exercice)
}
