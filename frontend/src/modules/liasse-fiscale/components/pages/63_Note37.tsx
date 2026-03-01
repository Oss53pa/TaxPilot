import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits, getBalanceSolde } from '../../services/liasse-calculs'
import type { BalanceEntry } from '../../types'

const v = (n: number) => n || null

/** Compute all SIG intermediate balances for a given balance array */
function computeSIG(bal: BalanceEntry[]) {
  const c = (p: string[]) => getCharges(bal, p)
  const p = (pf: string[]) => getProduits(bal, pf)
  const s = (pf: string[]) => getBalanceSolde(bal, pf)

  // 1. Marge brute sur marchandises
  const ventesMarchandises = p(['701'])
  const achatsMarchandises = c(['601']) + s(['6031'])
  const margeBrute = ventesMarchandises - achatsMarchandises

  // 2. Production
  const productionVendue = p(['702','703','704','705','706'])
  const productionStockee = -s(['73'])
  const productionImmobilisee = p(['72'])

  // 3. Consommations
  const achatsMatieres = c(['602']) + s(['6032'])
  const autresAchats = c(['604','605','608']) + s(['6033'])
  const transports = c(['61'])
  const servicesExterieurs = c(['62','63'])

  // 4. Valeur ajoutee
  const valeurAjoutee = margeBrute + productionVendue + productionStockee + productionImmobilisee
    - achatsMatieres - autresAchats - transports - servicesExterieurs

  // 5. EBE
  const subventionsExploitation = p(['71'])
  const impotsEtTaxes = c(['64'])
  const chargesPersonnel = c(['66'])
  const ebe = valeurAjoutee + subventionsExploitation - impotsEtTaxes - chargesPersonnel

  // 6. Resultat d'exploitation
  const autresProduits = p(['75'])
  const autresCharges = c(['65'])
  const dotationsAmortProv = c(['681','691'])
  const reprisesAmortProv = p(['791','798','799'])
  const resultatExploitation = ebe + autresProduits - autresCharges - dotationsAmortProv + reprisesAmortProv

  // 7. Resultat financier
  const produitsFinanciers = p(['77'])
  const chargesFinancieres = c(['67','697'])
  const resultatFinancier = produitsFinanciers - chargesFinancieres

  // 8. Resultat des activites ordinaires
  const resultatActivitesOrdinaires = resultatExploitation + resultatFinancier

  // 9. Resultat HAO
  const produitsHAO = p(['82','84','86','88'])
  const chargesHAO = c(['81','83','85'])
  const resultatHAO = produitsHAO - chargesHAO

  // 10. Resultat net
  const impot = c(['89'])
  const resultatNet = resultatActivitesOrdinaires + resultatHAO - impot

  return {
    ventesMarchandises, achatsMarchandises, margeBrute,
    productionVendue, productionStockee, productionImmobilisee,
    achatsMatieres, autresAchats, transports, servicesExterieurs,
    valeurAjoutee,
    subventionsExploitation, impotsEtTaxes, chargesPersonnel, ebe,
    autresProduits, autresCharges, dotationsAmortProv, reprisesAmortProv, resultatExploitation,
    produitsFinanciers, chargesFinancieres, resultatFinancier,
    resultatActivitesOrdinaires,
    produitsHAO, chargesHAO, resultatHAO,
    impot, resultatNet,
  }
}

const Note37: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const n = computeSIG(balance)
  const n1 = computeSIG(balanceN1 || [])
  const hasN1 = balanceN1 && balanceN1.length > 0

  const columns: Column[] = [
    { key: 'designation', label: 'Soldes intermediaires de gestion', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]

  const lines: {
    label: string; montant_n: number | null; montant_n1: number | null
    isTotal?: boolean; isSectionHeader?: boolean; indent?: number
  }[] = [
    // Marge brute
    { label: 'ACTIVITE COMMERCIALE', montant_n: null, montant_n1: null, isSectionHeader: true },
    { label: 'Ventes de marchandises (+)', montant_n: v(n.ventesMarchandises), montant_n1: hasN1 ? v(n1.ventesMarchandises) : null, indent: 1 },
    { label: 'Achats de marchandises (-)', montant_n: v(-n.achatsMarchandises), montant_n1: hasN1 ? v(-n1.achatsMarchandises) : null, indent: 1 },
    { label: 'MARGE BRUTE SUR MARCHANDISES', montant_n: v(n.margeBrute), montant_n1: hasN1 ? v(n1.margeBrute) : null, isTotal: true },

    // Production
    { label: 'ACTIVITE DE PRODUCTION', montant_n: null, montant_n1: null, isSectionHeader: true },
    { label: 'Production vendue (+)', montant_n: v(n.productionVendue), montant_n1: hasN1 ? v(n1.productionVendue) : null, indent: 1 },
    { label: 'Production stockee (+/-)', montant_n: v(n.productionStockee), montant_n1: hasN1 ? v(n1.productionStockee) : null, indent: 1 },
    { label: 'Production immobilisee (+)', montant_n: v(n.productionImmobilisee), montant_n1: hasN1 ? v(n1.productionImmobilisee) : null, indent: 1 },

    // Consommations
    { label: 'CONSOMMATIONS DE L\'EXERCICE', montant_n: null, montant_n1: null, isSectionHeader: true },
    { label: 'Achats de matieres premieres (-)', montant_n: v(-n.achatsMatieres), montant_n1: hasN1 ? v(-n1.achatsMatieres) : null, indent: 1 },
    { label: 'Autres achats (-)', montant_n: v(-n.autresAchats), montant_n1: hasN1 ? v(-n1.autresAchats) : null, indent: 1 },
    { label: 'Transports (-)', montant_n: v(-n.transports), montant_n1: hasN1 ? v(-n1.transports) : null, indent: 1 },
    { label: 'Services exterieurs (-)', montant_n: v(-n.servicesExterieurs), montant_n1: hasN1 ? v(-n1.servicesExterieurs) : null, indent: 1 },

    // Valeur ajoutee
    { label: 'VALEUR AJOUTEE', montant_n: v(n.valeurAjoutee), montant_n1: hasN1 ? v(n1.valeurAjoutee) : null, isTotal: true },

    // EBE
    { label: 'Subventions d\'exploitation (+)', montant_n: v(n.subventionsExploitation), montant_n1: hasN1 ? v(n1.subventionsExploitation) : null, indent: 1 },
    { label: 'Impots et taxes (-)', montant_n: v(-n.impotsEtTaxes), montant_n1: hasN1 ? v(-n1.impotsEtTaxes) : null, indent: 1 },
    { label: 'Charges de personnel (-)', montant_n: v(-n.chargesPersonnel), montant_n1: hasN1 ? v(-n1.chargesPersonnel) : null, indent: 1 },
    { label: 'EXCEDENT BRUT D\'EXPLOITATION (EBE)', montant_n: v(n.ebe), montant_n1: hasN1 ? v(n1.ebe) : null, isTotal: true },

    // Resultat d'exploitation
    { label: 'Autres produits (+)', montant_n: v(n.autresProduits), montant_n1: hasN1 ? v(n1.autresProduits) : null, indent: 1 },
    { label: 'Autres charges (-)', montant_n: v(-n.autresCharges), montant_n1: hasN1 ? v(-n1.autresCharges) : null, indent: 1 },
    { label: 'Dotations amortissements et provisions (-)', montant_n: v(-n.dotationsAmortProv), montant_n1: hasN1 ? v(-n1.dotationsAmortProv) : null, indent: 1 },
    { label: 'Reprises amortissements et provisions (+)', montant_n: v(n.reprisesAmortProv), montant_n1: hasN1 ? v(n1.reprisesAmortProv) : null, indent: 1 },
    { label: 'RESULTAT D\'EXPLOITATION', montant_n: v(n.resultatExploitation), montant_n1: hasN1 ? v(n1.resultatExploitation) : null, isTotal: true },

    // Resultat financier
    { label: 'OPERATIONS FINANCIERES', montant_n: null, montant_n1: null, isSectionHeader: true },
    { label: 'Produits financiers (+)', montant_n: v(n.produitsFinanciers), montant_n1: hasN1 ? v(n1.produitsFinanciers) : null, indent: 1 },
    { label: 'Charges financieres (-)', montant_n: v(-n.chargesFinancieres), montant_n1: hasN1 ? v(-n1.chargesFinancieres) : null, indent: 1 },
    { label: 'RESULTAT FINANCIER', montant_n: v(n.resultatFinancier), montant_n1: hasN1 ? v(n1.resultatFinancier) : null, isTotal: true },

    // Resultat des activites ordinaires
    { label: 'RESULTAT DES ACTIVITES ORDINAIRES', montant_n: v(n.resultatActivitesOrdinaires), montant_n1: hasN1 ? v(n1.resultatActivitesOrdinaires) : null, isTotal: true },

    // HAO
    { label: 'OPERATIONS HAO', montant_n: null, montant_n1: null, isSectionHeader: true },
    { label: 'Produits HAO (+)', montant_n: v(n.produitsHAO), montant_n1: hasN1 ? v(n1.produitsHAO) : null, indent: 1 },
    { label: 'Charges HAO (-)', montant_n: v(-n.chargesHAO), montant_n1: hasN1 ? v(-n1.chargesHAO) : null, indent: 1 },
    { label: 'RESULTAT HAO', montant_n: v(n.resultatHAO), montant_n1: hasN1 ? v(n1.resultatHAO) : null, isTotal: true },

    // Resultat net
    { label: 'Impot sur le resultat (-)', montant_n: v(-n.impot), montant_n1: hasN1 ? v(-n1.impot) : null, indent: 1 },
    { label: 'RESULTAT NET', montant_n: v(n.resultatNet), montant_n1: hasN1 ? v(n1.resultatNet) : null, isTotal: true },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      designation: r.label,
      montant_n: r.montant_n,
      montant_n1: r.montant_n1,
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSectionHeader,
    bold: r.isSectionHeader || r.isTotal,
    indent: r.indent,
  }))

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 37"
      noteTitle="NOTE 37 : TABLEAU DE PASSAGE AUX SOLDES INTERMEDIAIRES DE GESTION (SIG)"
      pageNumber="61"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note37
