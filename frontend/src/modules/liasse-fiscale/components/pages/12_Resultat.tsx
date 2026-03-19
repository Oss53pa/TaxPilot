import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getBalanceSolde } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

const v = (n: number) => n || null

/**
 * Credit line (products T*): credit balance shown as positive.
 * getBalanceSolde returns debit-credit, so negate it.
 */
const credit = (bal: BalanceEntry[], comptes: string[]): number =>
  -getBalanceSolde(bal, comptes)

/**
 * Debit line (charges R*): debit balance shown as negative.
 * getBalanceSolde returns debit-credit (positive for debits), negate to show negative.
 */
const debit = (bal: BalanceEntry[], comptes: string[]): number =>
  -getBalanceSolde(bal, comptes)

/**
 * Signed line (variations): debit-credit, then negate.
 * Stock increase (debit) => negative; stock decrease (credit) => positive.
 */
const signed = (bal: BalanceEntry[], comptes: string[]): number =>
  -getBalanceSolde(bal, comptes)

function computeResultat(bal: BalanceEntry[]) {
  // --- Activité commerciale ---
  const TA = credit(bal, ['701'])
  const RA = debit(bal, ['601'])
  const RB = signed(bal, ['6031'])
  const XA = TA + RA + RB

  // --- Chiffre d'affaires ---
  const TB = credit(bal, ['702', '703', '704'])
  const TC = credit(bal, ['705', '706', '707'])
  const TD = credit(bal, ['708'])
  const XB = TA + TB + TC + TD

  // --- Valeur ajoutée ---
  const TE = signed(bal, ['73'])
  const TF = credit(bal, ['72'])
  const TG = credit(bal, ['71'])
  const TH = credit(bal, ['75'])
  const TI = credit(bal, ['781', '791'])
  const RC = debit(bal, ['602'])
  const RD = signed(bal, ['6032'])
  const RE = debit(bal, ['604', '605', '608'])
  const RF = signed(bal, ['6033', '6038'])
  const RG = debit(bal, ['61'])
  const RH = debit(bal, ['62', '63'])
  const RI = debit(bal, ['64'])
  const RJ = debit(bal, ['65'])
  const XC = XB + RA + RB + TE + TF + TG + TH + TI + RC + RD + RE + RF + RG + RH + RI + RJ

  // --- Excédent brut d'exploitation ---
  const RK = debit(bal, ['66'])
  const XD = XC + RK

  // --- Résultat d'exploitation ---
  const TJ = credit(bal, ['791', '797', '798', '799'])
  const RL = debit(bal, ['681', '691'])
  const XE = XD + TJ + RL

  // --- Résultat financier ---
  const TK = credit(bal, ['77'])
  const TL = credit(bal, ['797'])
  const TM = credit(bal, ['787'])
  const RM = debit(bal, ['67'])
  const RN = debit(bal, ['697'])
  const XF = TK + TL + TM + RM + RN

  // --- Résultat des activités ordinaires ---
  const XG = XE + XF

  // --- Résultat HAO ---
  const TN = credit(bal, ['82'])
  const TO = credit(bal, ['84', '86', '88'])
  const RO = debit(bal, ['81'])
  const RP = debit(bal, ['83', '85', '87'])
  const XH = TN + TO + RO + RP

  // --- Résultat net ---
  const RQ = debit(bal, ['87'])
  const RS = debit(bal, ['89'])
  const XI = XG + XH + RQ + RS

  return [
    { ref: 'TA', label: 'Ventes de marchandises', note: '21', net: TA },
    { ref: 'RA', label: 'Achats de marchandises', note: '22', net: RA },
    { ref: 'RB', label: 'Variation de stocks de marchandises', note: '6', net: RB },
    { ref: 'XA', label: 'MARGE COMMERCIALE (Somme TA à RB)', note: '', net: XA, isTotal: true },
    { ref: 'TB', label: 'Ventes de produits fabriqués', note: '21', net: TB },
    { ref: 'TC', label: 'Travaux, services vendus', note: '21', net: TC },
    { ref: 'TD', label: 'Produits accessoires', note: '21', net: TD },
    { ref: 'XB', label: 'CHIFFRE D\'AFFAIRES (A + B + C + D)', note: '', net: XB, isTotal: true },
    { ref: 'TE', label: 'Production stockée (ou déstockage)', note: '6', net: TE },
    { ref: 'TF', label: 'Production immobilisée', note: '21', net: TF },
    { ref: 'TG', label: 'Subventions d\'exploitation', note: '21', net: TG },
    { ref: 'TH', label: 'Autres produits', note: '21', net: TH },
    { ref: 'TI', label: 'Transferts de charges d\'exploitation', note: '12', net: TI },
    { ref: 'RC', label: 'Achats de matières premières et fournitures liées', note: '22', net: RC },
    { ref: 'RD', label: 'Variation de stocks de matières premières et fournitures liées', note: '6', net: RD },
    { ref: 'RE', label: 'Autres achats', note: '22', net: RE },
    { ref: 'RF', label: 'Variation de stocks d\'autres approvisionnements', note: '6', net: RF },
    { ref: 'RG', label: 'Transports', note: '23', net: RG },
    { ref: 'RH', label: 'Services extérieurs', note: '24', net: RH },
    { ref: 'RI', label: 'Impôts et taxes', note: '25', net: RI },
    { ref: 'RJ', label: 'Autres charges', note: '26', net: RJ },
    { ref: 'XC', label: 'VALEUR AJOUTEE (XB +RA+RB) + (somme TE à RJ)', note: '', net: XC, isTotal: true },
    { ref: 'RK', label: 'Charges de personnel', note: '27', net: RK },
    { ref: 'XD', label: 'EXCEDENT BRUT D\'EXPLOITATION (XC+RK)', note: '', net: XD, isTotal: true },
    { ref: 'TJ', label: 'Reprises d\'amortissements, provisions et dépréciations', note: '28', net: TJ },
    { ref: 'RL', label: 'Dotations aux amortissements, aux provisions et dépréciations', note: '3C&28', net: RL },
    { ref: 'XE', label: 'RESULTAT D\'EXPLOITATION (XD+TJ+ RL)', note: '', net: XE, isTotal: true },
    { ref: 'TK', label: 'Revenus financiers et assimilés', note: '29', net: TK },
    { ref: 'TL', label: 'Reprises de provisions et dépréciations financières', note: '28', net: TL },
    { ref: 'TM', label: 'Transferts de charges financières', note: '12', net: TM },
    { ref: 'RM', label: 'Frais financiers et charges assimilées', note: '29', net: RM },
    { ref: 'RN', label: 'Dotations aux provisions et aux dépréciations financières', note: '3C&28', net: RN },
    { ref: 'XF', label: 'RESULTAT FINANCIER (somme TK à RN)', note: '', net: XF, isTotal: true },
    { ref: 'XG', label: 'RESULTAT DES ACTIVITES ORDINAIRES (XE+XF)', note: '', net: XG, isTotal: true },
    { ref: 'TN', label: 'Produits des cessions d\'immobilisations', note: '3D', net: TN },
    { ref: 'TO', label: 'Autres Produits HAO', note: '30', net: TO },
    { ref: 'RO', label: 'Valeurs comptables des cessions d\'immobilisations', note: '3D', net: RO },
    { ref: 'RP', label: 'Autres Charges HAO', note: '30', net: RP },
    { ref: 'XH', label: 'RESULTAT HORS ACTIVITES ORDINAIRES (somme TN à RP)', note: '', net: XH, isTotal: true },
    { ref: 'RQ', label: 'Participation des travailleurs', note: '30', net: RQ },
    { ref: 'RS', label: 'Impôts sur le résultat', note: '37', net: RS },
    { ref: 'XI', label: 'RESULTAT NET (XG+XH+RQ+RS)', note: '', net: XI, isTotal: true },
  ]
}

const Resultat: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const lines = computeResultat(balance)
  const linesN1 = balanceN1 && balanceN1.length > 0 ? computeResultat(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'LIBELLES', width: '45%' },
    { key: 'note', label: 'NOTE', width: 30, align: 'center' },
    { key: 'net', label: 'NET', align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', align: 'right', subLabel: 'Exercice N-1' },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      net: v(r.net),
      net_n1: linesN1 ? v(linesN1[i].net) : null,
    },
    isTotal: r.isTotal,
    bold: r.isTotal,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="8" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        COMPTE DE RESULTAT
      </Typography>
      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default Resultat
