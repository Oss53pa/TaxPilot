import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits, getBalanceSolde } from '../../services/liasse-calculs'
import type { BalanceEntry } from '../../types'

const v = (n: number) => n || null

function computeDetail(bal: BalanceEntry[]) {
  const c = (p: string[]) => getCharges(bal, p)
  const p = (pf: string[]) => getProduits(bal, pf)
  const s = (pf: string[]) => getBalanceSolde(bal, pf)

  // CHARGES
  const achatsMarchandises = c(['601'])
  const varStocksMarchandises = s(['6031'])
  const achatsMatieresPremieres = c(['602'])
  const varStocksMatieres = s(['6032'])
  const autresAchats = c(['604','605','608'])
  const varStocksAutres = s(['6033'])
  const transports = c(['61'])
  const servicesExterieurs = c(['62','63'])
  const impotsEtTaxes = c(['64'])
  const autresCharges = c(['65'])
  const chargesPersonnel = c(['66'])
  const dotationsAmort = c(['681'])
  const dotationsDepreciations = c(['691'])
  const chargesFinancieres = c(['67','697'])
  const chargesHAO = c(['81','83','85'])
  const impotResultat = c(['89'])

  const totalCharges = achatsMarchandises + varStocksMarchandises
    + achatsMatieresPremieres + varStocksMatieres
    + autresAchats + varStocksAutres
    + transports + servicesExterieurs + impotsEtTaxes + autresCharges
    + chargesPersonnel + dotationsAmort + dotationsDepreciations
    + chargesFinancieres + chargesHAO + impotResultat

  // PRODUITS
  const ventesMarchandises = p(['701'])
  const ventesProduitsFabriques = p(['702','703'])
  const travauxServices = p(['704','705','706'])
  const produitsAccessoires = p(['707'])
  const productionStockee = -s(['73'])
  const productionImmobilisee = p(['72'])
  const subventions = p(['71'])
  const autresProduits = p(['75'])
  const reprisesAmortProv = p(['791','798','799'])
  const produitsFinanciers = p(['77'])
  const produitsHAO = p(['82','84','86','88'])

  const totalProduits = ventesMarchandises + ventesProduitsFabriques + travauxServices
    + produitsAccessoires + productionStockee + productionImmobilisee
    + subventions + autresProduits + reprisesAmortProv
    + produitsFinanciers + produitsHAO

  const resultatNet = totalProduits - totalCharges

  return {
    // Charges
    achatsMarchandises, varStocksMarchandises,
    achatsMatieresPremieres, varStocksMatieres,
    autresAchats, varStocksAutres,
    transports, servicesExterieurs, impotsEtTaxes, autresCharges,
    chargesPersonnel, dotationsAmort, dotationsDepreciations,
    chargesFinancieres, chargesHAO, impotResultat, totalCharges,
    // Produits
    ventesMarchandises, ventesProduitsFabriques, travauxServices,
    produitsAccessoires, productionStockee, productionImmobilisee,
    subventions, autresProduits, reprisesAmortProv,
    produitsFinanciers, produitsHAO, totalProduits,
    // Net
    resultatNet,
  }
}

const Note38: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const n = computeDetail(balance)
  const n1 = computeDetail(balanceN1 || [])
  const hasN1 = balanceN1 && balanceN1.length > 0

  const columns: Column[] = [
    { key: 'designation', label: 'Elements', width: '40%', align: 'left' },
    { key: 'charges_n', label: 'Charges N', width: '15%', align: 'right' },
    { key: 'produits_n', label: 'Produits N', width: '15%', align: 'right' },
    { key: 'charges_n1', label: 'Charges N-1', width: '15%', align: 'right' },
    { key: 'produits_n1', label: 'Produits N-1', width: '15%', align: 'right' },
  ]

  type Line = {
    label: string
    charges_n: number | null
    produits_n: number | null
    charges_n1: number | null
    produits_n1: number | null
    isTotal?: boolean
    isSectionHeader?: boolean
    indent?: number
  }

  const lines: Line[] = [
    // CHARGES
    { label: 'CHARGES', charges_n: null, produits_n: null, charges_n1: null, produits_n1: null, isSectionHeader: true },
    { label: 'Achats de marchandises', charges_n: v(n.achatsMarchandises), produits_n: null, charges_n1: hasN1 ? v(n1.achatsMarchandises) : null, produits_n1: null, indent: 1 },
    { label: 'Variation de stocks de marchandises', charges_n: v(n.varStocksMarchandises), produits_n: null, charges_n1: hasN1 ? v(n1.varStocksMarchandises) : null, produits_n1: null, indent: 1 },
    { label: 'Achats de matieres premieres', charges_n: v(n.achatsMatieresPremieres), produits_n: null, charges_n1: hasN1 ? v(n1.achatsMatieresPremieres) : null, produits_n1: null, indent: 1 },
    { label: 'Variation de stocks de matieres', charges_n: v(n.varStocksMatieres), produits_n: null, charges_n1: hasN1 ? v(n1.varStocksMatieres) : null, produits_n1: null, indent: 1 },
    { label: 'Autres achats', charges_n: v(n.autresAchats), produits_n: null, charges_n1: hasN1 ? v(n1.autresAchats) : null, produits_n1: null, indent: 1 },
    { label: 'Variation de stocks autres', charges_n: v(n.varStocksAutres), produits_n: null, charges_n1: hasN1 ? v(n1.varStocksAutres) : null, produits_n1: null, indent: 1 },
    { label: 'Transports', charges_n: v(n.transports), produits_n: null, charges_n1: hasN1 ? v(n1.transports) : null, produits_n1: null, indent: 1 },
    { label: 'Services exterieurs', charges_n: v(n.servicesExterieurs), produits_n: null, charges_n1: hasN1 ? v(n1.servicesExterieurs) : null, produits_n1: null, indent: 1 },
    { label: 'Impots et taxes', charges_n: v(n.impotsEtTaxes), produits_n: null, charges_n1: hasN1 ? v(n1.impotsEtTaxes) : null, produits_n1: null, indent: 1 },
    { label: 'Autres charges', charges_n: v(n.autresCharges), produits_n: null, charges_n1: hasN1 ? v(n1.autresCharges) : null, produits_n1: null, indent: 1 },
    { label: 'Charges de personnel', charges_n: v(n.chargesPersonnel), produits_n: null, charges_n1: hasN1 ? v(n1.chargesPersonnel) : null, produits_n1: null, indent: 1 },
    { label: 'Dotations aux amortissements', charges_n: v(n.dotationsAmort), produits_n: null, charges_n1: hasN1 ? v(n1.dotationsAmort) : null, produits_n1: null, indent: 1 },
    { label: 'Dotations aux depreciations', charges_n: v(n.dotationsDepreciations), produits_n: null, charges_n1: hasN1 ? v(n1.dotationsDepreciations) : null, produits_n1: null, indent: 1 },
    { label: 'Charges financieres', charges_n: v(n.chargesFinancieres), produits_n: null, charges_n1: hasN1 ? v(n1.chargesFinancieres) : null, produits_n1: null, indent: 1 },
    { label: 'Charges HAO', charges_n: v(n.chargesHAO), produits_n: null, charges_n1: hasN1 ? v(n1.chargesHAO) : null, produits_n1: null, indent: 1 },
    { label: 'Impot sur le resultat', charges_n: v(n.impotResultat), produits_n: null, charges_n1: hasN1 ? v(n1.impotResultat) : null, produits_n1: null, indent: 1 },
    { label: 'TOTAL CHARGES', charges_n: v(n.totalCharges), produits_n: null, charges_n1: hasN1 ? v(n1.totalCharges) : null, produits_n1: null, isTotal: true },

    // PRODUITS
    { label: 'PRODUITS', charges_n: null, produits_n: null, charges_n1: null, produits_n1: null, isSectionHeader: true },
    { label: 'Ventes de marchandises', charges_n: null, produits_n: v(n.ventesMarchandises), charges_n1: null, produits_n1: hasN1 ? v(n1.ventesMarchandises) : null, indent: 1 },
    { label: 'Ventes de produits fabriques', charges_n: null, produits_n: v(n.ventesProduitsFabriques), charges_n1: null, produits_n1: hasN1 ? v(n1.ventesProduitsFabriques) : null, indent: 1 },
    { label: 'Travaux, services vendus', charges_n: null, produits_n: v(n.travauxServices), charges_n1: null, produits_n1: hasN1 ? v(n1.travauxServices) : null, indent: 1 },
    { label: 'Produits accessoires', charges_n: null, produits_n: v(n.produitsAccessoires), charges_n1: null, produits_n1: hasN1 ? v(n1.produitsAccessoires) : null, indent: 1 },
    { label: 'Production stockee', charges_n: null, produits_n: v(n.productionStockee), charges_n1: null, produits_n1: hasN1 ? v(n1.productionStockee) : null, indent: 1 },
    { label: 'Production immobilisee', charges_n: null, produits_n: v(n.productionImmobilisee), charges_n1: null, produits_n1: hasN1 ? v(n1.productionImmobilisee) : null, indent: 1 },
    { label: 'Subventions d\'exploitation', charges_n: null, produits_n: v(n.subventions), charges_n1: null, produits_n1: hasN1 ? v(n1.subventions) : null, indent: 1 },
    { label: 'Autres produits', charges_n: null, produits_n: v(n.autresProduits), charges_n1: null, produits_n1: hasN1 ? v(n1.autresProduits) : null, indent: 1 },
    { label: 'Reprises amortissements et provisions', charges_n: null, produits_n: v(n.reprisesAmortProv), charges_n1: null, produits_n1: hasN1 ? v(n1.reprisesAmortProv) : null, indent: 1 },
    { label: 'Produits financiers', charges_n: null, produits_n: v(n.produitsFinanciers), charges_n1: null, produits_n1: hasN1 ? v(n1.produitsFinanciers) : null, indent: 1 },
    { label: 'Produits HAO', charges_n: null, produits_n: v(n.produitsHAO), charges_n1: null, produits_n1: hasN1 ? v(n1.produitsHAO) : null, indent: 1 },
    { label: 'TOTAL PRODUITS', charges_n: null, produits_n: v(n.totalProduits), charges_n1: null, produits_n1: hasN1 ? v(n1.totalProduits) : null, isTotal: true },

    // RESULTAT NET
    {
      label: 'RESULTAT NET (Total Produits - Total Charges)',
      charges_n: n.resultatNet < 0 ? v(Math.abs(n.resultatNet)) : null,
      produits_n: n.resultatNet >= 0 ? v(n.resultatNet) : null,
      charges_n1: hasN1 ? (n1.resultatNet < 0 ? v(Math.abs(n1.resultatNet)) : null) : null,
      produits_n1: hasN1 ? (n1.resultatNet >= 0 ? v(n1.resultatNet) : null) : null,
      isTotal: true,
    },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      designation: r.label,
      charges_n: r.charges_n,
      produits_n: r.produits_n,
      charges_n1: r.charges_n1,
      produits_n1: r.produits_n1,
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
      noteLabel="NOTE 38"
      noteTitle="NOTE 38 : DETAIL COMPTE DE RESULTAT"
      pageNumber="62"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note38
