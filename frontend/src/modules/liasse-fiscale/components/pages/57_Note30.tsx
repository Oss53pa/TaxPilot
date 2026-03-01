import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits, variation } from '../../services/liasse-calculs'

const v = (n: number) => n || null

const Note30: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const bN1 = balanceN1 || []
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '40%', align: 'left' },
    { key: 'n', label: 'Annee N', align: 'right' },
    { key: 'n1', label: 'Annee N-1', align: 'right' },
    { key: 'var', label: 'Variation en %', align: 'right' },
  ]

  // ── Section 1: Charges HAO ──
  const chargesHAO831 = getCharges(balance, ['831'])
  const chargesRestructur = getCharges(balance, ['832'])
  const pertesCreances = getCharges(balance, ['834'])
  const donsAccordes = getCharges(balance, ['835'])
  const abandonsConsentis = getCharges(balance, ['836'])
  const chargesDeprecProv = getCharges(balance, ['837'])
  const dotationsHAO = getCharges(balance, ['85'])
  const participTravailleurs = getCharges(balance, ['87'])
  const sousTotalCharges = chargesHAO831 + chargesRestructur + pertesCreances + donsAccordes + abandonsConsentis + chargesDeprecProv + dotationsHAO + participTravailleurs

  const chargesHAO831N1 = getCharges(bN1, ['831'])
  const chargesRestructurN1 = getCharges(bN1, ['832'])
  const pertesCreancesN1 = getCharges(bN1, ['834'])
  const donsAccordesN1 = getCharges(bN1, ['835'])
  const abandonsConsentisN1 = getCharges(bN1, ['836'])
  const chargesDeprecProvN1 = getCharges(bN1, ['837'])
  const dotationsHAON1 = getCharges(bN1, ['85'])
  const participTravailleursN1 = getCharges(bN1, ['87'])
  const sousTotalChargesN1 = chargesHAO831N1 + chargesRestructurN1 + pertesCreancesN1 + donsAccordesN1 + abandonsConsentisN1 + chargesDeprecProvN1 + dotationsHAON1 + participTravailleursN1

  // ── Section 2: Produits HAO ──
  const produitsHAO841 = getProduits(balance, ['841'])
  const produitsRestructur = getProduits(balance, ['842'])
  const indemnitesSubv = getProduits(balance, ['844'])
  const donsObtenus = getProduits(balance, ['845'])
  const abandonsObtenus = getProduits(balance, ['846'])
  const reprisesProvHAO = getProduits(balance, ['847'])
  const reprisesAmortHAO = getProduits(balance, ['848'])
  const reprisesHAO = getProduits(balance, ['86'])
  const sousTotalProduits = produitsHAO841 + produitsRestructur + indemnitesSubv + donsObtenus + abandonsObtenus + reprisesProvHAO + reprisesAmortHAO + reprisesHAO

  const produitsHAO841N1 = getProduits(bN1, ['841'])
  const produitsRestructurN1 = getProduits(bN1, ['842'])
  const indemnitesSubvN1 = getProduits(bN1, ['844'])
  const donsObtenusN1 = getProduits(bN1, ['845'])
  const abandonsObtenusN1 = getProduits(bN1, ['846'])
  const reprisesProvHAON1 = getProduits(bN1, ['847'])
  const reprisesAmortHAON1 = getProduits(bN1, ['848'])
  const reprisesHAON1 = getProduits(bN1, ['86'])
  const sousTotalProduitsN1 = produitsHAO841N1 + produitsRestructurN1 + indemnitesSubvN1 + donsObtenusN1 + abandonsObtenusN1 + reprisesProvHAON1 + reprisesAmortHAON1 + reprisesHAON1

  // ── Resultat HAO ──
  const resultat = sousTotalProduits - sousTotalCharges
  const resultatN1 = sousTotalProduitsN1 - sousTotalChargesN1

  const pct = (a: number, b: number) => {
    const r = variation(a, b)
    return r ? `${r > 0 ? '+' : ''}${r.toFixed(1)} %` : null
  }

  const rows: Row[] = [
    // Section 1: Charges HAO
    { id: 'sh1', cells: { label: 'CHARGES HAO' }, isSectionHeader: true },
    { id: 'c1', cells: { label: 'Charges HAO constatees (compte 831)', n: v(chargesHAO831), n1: v(chargesHAO831N1), var: pct(chargesHAO831, chargesHAO831N1) }, isSectionHeader: true },
    { id: 'c1a', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'c1b', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'c1c', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'c2', cells: { label: 'Charges liees aux operations de restructuration', n: v(chargesRestructur), n1: v(chargesRestructurN1), var: pct(chargesRestructur, chargesRestructurN1) } },
    { id: 'c3', cells: { label: 'Pertes sur creances HAO', n: v(pertesCreances), n1: v(pertesCreancesN1), var: pct(pertesCreances, pertesCreancesN1) } },
    { id: 'c4', cells: { label: 'Dons et liberalites accordes', n: v(donsAccordes), n1: v(donsAccordesN1), var: pct(donsAccordes, donsAccordesN1) } },
    { id: 'c5', cells: { label: 'Abandons de creances consentis', n: v(abandonsConsentis), n1: v(abandonsConsentisN1), var: pct(abandonsConsentis, abandonsConsentisN1) } },
    { id: 'c6', cells: { label: 'Charges pour depreciations et provisions HAO', n: v(chargesDeprecProv), n1: v(chargesDeprecProvN1), var: pct(chargesDeprecProv, chargesDeprecProvN1) } },
    { id: 'c7', cells: { label: 'Dotations hors activites ordinaires', n: v(dotationsHAO), n1: v(dotationsHAON1), var: pct(dotationsHAO, dotationsHAON1) } },
    { id: 'c8', cells: { label: 'Participation des travailleurs', n: v(participTravailleurs), n1: v(participTravailleursN1), var: pct(participTravailleurs, participTravailleursN1) } },
    { id: 'st1', cells: { label: 'SOUS TOTAL : AUTRES CHARGES HAO', n: v(sousTotalCharges), n1: v(sousTotalChargesN1), var: pct(sousTotalCharges, sousTotalChargesN1) }, isSubtotal: true, bold: true },

    // Section 2: Produits HAO
    { id: 'sh2', cells: { label: 'PRODUITS HAO' }, isSectionHeader: true },
    { id: 'p1', cells: { label: 'Produits HAO constates (compte 841)', n: v(produitsHAO841), n1: v(produitsHAO841N1), var: pct(produitsHAO841, produitsHAO841N1) }, isSectionHeader: true },
    { id: 'p1a', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'p1b', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'p1c', cells: { label: '- ', n: null, n1: null, var: null }, indent: 1 },
    { id: 'p2', cells: { label: 'Produits lies aux operations de restructuration', n: v(produitsRestructur), n1: v(produitsRestructurN1), var: pct(produitsRestructur, produitsRestructurN1) } },
    { id: 'p3', cells: { label: 'Indemnites et subventions HAO', n: v(indemnitesSubv), n1: v(indemnitesSubvN1), var: pct(indemnitesSubv, indemnitesSubvN1) } },
    { id: 'p4', cells: { label: 'Dons et liberalites obtenus', n: v(donsObtenus), n1: v(donsObtenusN1), var: pct(donsObtenus, donsObtenusN1) } },
    { id: 'p5', cells: { label: 'Abandons de creances obtenus', n: v(abandonsObtenus), n1: v(abandonsObtenusN1), var: pct(abandonsObtenus, abandonsObtenusN1) } },
    { id: 'p6', cells: { label: 'Reprises de charges provisionnees HAO', n: v(reprisesProvHAO), n1: v(reprisesProvHAON1), var: pct(reprisesProvHAO, reprisesProvHAON1) } },
    { id: 'p7', cells: { label: 'Reprises d\'amortissements HAO', n: v(reprisesAmortHAO), n1: v(reprisesAmortHAON1), var: pct(reprisesAmortHAO, reprisesAmortHAON1) } },
    { id: 'p8', cells: { label: 'Reprises hors activites ordinaires', n: v(reprisesHAO), n1: v(reprisesHAON1), var: pct(reprisesHAO, reprisesHAON1) } },
    { id: 'st2', cells: { label: 'SOUS TOTAL : AUTRES PRODUITS HAO', n: v(sousTotalProduits), n1: v(sousTotalProduitsN1), var: pct(sousTotalProduits, sousTotalProduitsN1) }, isSubtotal: true, bold: true },

    // Resultat
    { id: 'total', cells: { label: 'RESULTAT HAO', n: v(resultat), n1: v(resultatN1), var: pct(resultat, resultatN1) }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 30"
      noteTitle="NOTE 30 : AUTRES CHARGES ET PRODUITS HAO"
      pageNumber="53"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note30
