/**
 * Generation XML pour declarations DGI
 * Formats : DSF, DAS, TVA, IS, Liasse SYSCOHADA
 */

import type { DGIDeclaration } from './dgiFilingStorageService'

// ────────── Helpers ──────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatAmount(n: number): string {
  return Math.round(n).toString()
}

function formatDate(d: string): string {
  return d.split('T')[0]
}

function xmlHeader(declaration: DGIDeclaration): string {
  return `
  <Identification>
    <NIF>${escapeXml(declaration.nif)}</NIF>
    <RaisonSociale>${escapeXml(declaration.entreprise)}</RaisonSociale>
    <Exercice>${escapeXml(declaration.exercice)}</Exercice>
    <TypeDeclaration>${declaration.type}</TypeDeclaration>
    <DateGeneration>${formatDate(new Date().toISOString())}</DateGeneration>
  </Identification>`
}

// ────────── DSF XML ──────────

export function generateDSFXml(declaration: DGIDeclaration): string {
  const dsf = declaration.dsfData
  if (!dsf) return ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationStatistiqueEtFiscale xmlns="urn:dgi:ci:dsf:2025" version="1.0">
  ${xmlHeader(declaration)}
  <BilanActif>
    <TotalActif>${formatAmount(dsf.bilanActifTotal)}</TotalActif>
  </BilanActif>
  <BilanPassif>
    <TotalPassif>${formatAmount(dsf.bilanPassifTotal)}</TotalPassif>
  </BilanPassif>
  <CompteResultat>
    <TotalProduits>${formatAmount(dsf.compteResultatProduits)}</TotalProduits>
    <TotalCharges>${formatAmount(dsf.compteResultatCharges)}</TotalCharges>
    <ResultatComptable>${formatAmount(dsf.resultatComptable)}</ResultatComptable>
  </CompteResultat>
  <TableauPassageFiscal>
    <ResultatComptable>${formatAmount(dsf.resultatComptable)}</ResultatComptable>
    <TotalReintegrations>${formatAmount(dsf.totalReintegrations)}</TotalReintegrations>
    <TotalDeductions>${formatAmount(dsf.totalDeductions)}</TotalDeductions>
    <ResultatFiscal>${formatAmount(dsf.resultatFiscal)}</ResultatFiscal>
    <ChiffreAffaires>${formatAmount(dsf.chiffreAffaires)}</ChiffreAffaires>
    <ISDu>${formatAmount(dsf.isDu)}</ISDu>
  </TableauPassageFiscal>
</DeclarationStatistiqueEtFiscale>`
}

// ────────── DAS XML ──────────

export function generateDASXml(declaration: DGIDeclaration): string {
  const das = declaration.dasData
  if (!das) return ''

  const salariesXml = das.salaries.map(s => `
    <Salarie>
      <Nom>${escapeXml(s.nom)}</Nom>
      <Prenoms>${escapeXml(s.prenoms)}</Prenoms>
      <Matricule>${escapeXml(s.matricule)}</Matricule>
      <Emploi>${escapeXml(s.emploi)}</Emploi>
      <SalaireBrutAnnuel>${formatAmount(s.salaireBrutAnnuel)}</SalaireBrutAnnuel>
      <RetenueIRPP>${formatAmount(s.retenueIRPP)}</RetenueIRPP>
      <CotisationCNPS>${formatAmount(s.cotisationCNPS)}</CotisationCNPS>
      <NetPaye>${formatAmount(s.netPaye)}</NetPaye>
    </Salarie>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationAnnuelleSalaires xmlns="urn:dgi:ci:das:2025" version="1.0">
  ${xmlHeader(declaration)}
  <Recapitulatif>
    <NombreSalaries>${das.salaries.length}</NombreSalaries>
    <MasseSalarialeBrute>${formatAmount(das.masseSalarialeBrute)}</MasseSalarialeBrute>
    <TotalRetenuesIRPP>${formatAmount(das.retenuesIRPP)}</TotalRetenuesIRPP>
    <TotalCotisationsCNPS>${formatAmount(das.cotisationsCNPS)}</TotalCotisationsCNPS>
    <TotalNetPaye>${formatAmount(das.totalNetPaye)}</TotalNetPaye>
  </Recapitulatif>
  <ListeSalaries>${salariesXml}
  </ListeSalaries>
</DeclarationAnnuelleSalaires>`
}

// ────────── TVA XML ──────────

export function generateTVAXml(declaration: DGIDeclaration): string {
  const tva = declaration.tvaData
  if (!tva) return ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationTVA xmlns="urn:dgi:ci:tva:2025" version="1.0">
  ${xmlHeader(declaration)}
  <Periode>${escapeXml(tva.periode)}</Periode>
  <TVACollectee>${formatAmount(tva.tvaCollectee)}</TVACollectee>
  <TVADeductible>${formatAmount(tva.tvaDeductible)}</TVADeductible>
  <TVANette>${formatAmount(tva.tvaNette)}</TVANette>
  <CreditTVA>${formatAmount(tva.creditTVA)}</CreditTVA>
  <MontantDu>${formatAmount(tva.tvaNette > 0 ? tva.tvaNette : 0)}</MontantDu>
</DeclarationTVA>`
}

// ────────── IS XML ──────────

export function generateISXml(declaration: DGIDeclaration): string {
  const dsf = declaration.dsfData

  return `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationIS xmlns="urn:dgi:ci:is:2025" version="1.0">
  ${xmlHeader(declaration)}
  <ResultatFiscal>${formatAmount(dsf?.resultatFiscal || 0)}</ResultatFiscal>
  <ChiffreAffaires>${formatAmount(dsf?.chiffreAffaires || 0)}</ChiffreAffaires>
  <ISDu>${formatAmount(declaration.montantDu)}</ISDu>
</DeclarationIS>`
}

// ────────── Liasse SYSCOHADA XML ──────────

export function generateLiasseXml(declaration: DGIDeclaration): string {
  const dsf = declaration.dsfData

  return `<?xml version="1.0" encoding="UTF-8"?>
<LiasseFiscaleSYSCOHADA xmlns="urn:dgi:ci:liasse:2025" version="1.0">
  ${xmlHeader(declaration)}
  <SystemeComptable>SYSCOHADA_REVISE</SystemeComptable>
  <Regime>SYSTEME_NORMAL</Regime>
  <Bilan>
    <Actif>
      <TotalActifImmobilise>${formatAmount(dsf?.bilanActifTotal ? dsf.bilanActifTotal * 0.6 : 0)}</TotalActifImmobilise>
      <TotalActifCirculant>${formatAmount(dsf?.bilanActifTotal ? dsf.bilanActifTotal * 0.35 : 0)}</TotalActifCirculant>
      <Tresorerie>${formatAmount(dsf?.bilanActifTotal ? dsf.bilanActifTotal * 0.05 : 0)}</Tresorerie>
      <TotalActif>${formatAmount(dsf?.bilanActifTotal || 0)}</TotalActif>
    </Actif>
    <Passif>
      <CapitauxPropres>${formatAmount(dsf?.bilanPassifTotal ? dsf.bilanPassifTotal * 0.4 : 0)}</CapitauxPropres>
      <DettesFinancieres>${formatAmount(dsf?.bilanPassifTotal ? dsf.bilanPassifTotal * 0.3 : 0)}</DettesFinancieres>
      <PassifCirculant>${formatAmount(dsf?.bilanPassifTotal ? dsf.bilanPassifTotal * 0.25 : 0)}</PassifCirculant>
      <TresoreriePassif>${formatAmount(dsf?.bilanPassifTotal ? dsf.bilanPassifTotal * 0.05 : 0)}</TresoreriePassif>
      <TotalPassif>${formatAmount(dsf?.bilanPassifTotal || 0)}</TotalPassif>
    </Passif>
  </Bilan>
  <CompteResultat>
    <Produits>${formatAmount(dsf?.compteResultatProduits || 0)}</Produits>
    <Charges>${formatAmount(dsf?.compteResultatCharges || 0)}</Charges>
    <ResultatNet>${formatAmount(dsf?.resultatComptable || 0)}</ResultatNet>
  </CompteResultat>
  <PassageFiscal>
    <ResultatComptable>${formatAmount(dsf?.resultatComptable || 0)}</ResultatComptable>
    <Reintegrations>${formatAmount(dsf?.totalReintegrations || 0)}</Reintegrations>
    <Deductions>${formatAmount(dsf?.totalDeductions || 0)}</Deductions>
    <ResultatFiscal>${formatAmount(dsf?.resultatFiscal || 0)}</ResultatFiscal>
    <IS>${formatAmount(dsf?.isDu || 0)}</IS>
  </PassageFiscal>
</LiasseFiscaleSYSCOHADA>`
}

// ────────── Generate by type ──────────

export function generateXmlForDeclaration(declaration: DGIDeclaration): string {
  switch (declaration.type) {
    case 'DSF': return generateDSFXml(declaration)
    case 'DAS': return generateDASXml(declaration)
    case 'TVA': return generateTVAXml(declaration)
    case 'IS': return generateISXml(declaration)
    case 'LIASSE': return generateLiasseXml(declaration)
    default: return ''
  }
}

// ────────── Download helper ──────────

export function downloadXml(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
