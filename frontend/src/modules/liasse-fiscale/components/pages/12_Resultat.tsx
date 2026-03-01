import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getCharges, getProduits, getBalanceSolde } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

const v = (n: number) => n || null

function computeResultat(bal: BalanceEntry[]) {
  // Produits (+) = positive, Charges (-) = negative, Variations (-/+) = signed
  const TA = getProduits(bal, ['701'])
  const RA = -getCharges(bal, ['601'])
  const RB = -getBalanceSolde(bal, ['6031'])
  const XA = TA + RA + RB

  const TB = getProduits(bal, ['702', '703', '704', '705'])
  const TC = getProduits(bal, ['706'])
  const TD = getProduits(bal, ['707'])
  const XB = TA + TB + TC + TD

  const TE = -getBalanceSolde(bal, ['73'])
  const TF = getProduits(bal, ['72'])
  const TG = getProduits(bal, ['71'])
  const TH = getProduits(bal, ['75'])
  const TI = getProduits(bal, ['781'])
  const RC = -getCharges(bal, ['602'])
  const RD = -getBalanceSolde(bal, ['6032'])
  const RE = -getCharges(bal, ['604', '605', '608'])
  const RF = -getBalanceSolde(bal, ['6033'])
  const RG = -getCharges(bal, ['61'])
  const RH = -getCharges(bal, ['62', '63'])
  const RI = -getCharges(bal, ['64'])
  const RJ = -getCharges(bal, ['65'])
  const XC = XB + RA + RB + TE + TF + TG + TH + TI + RC + RD + RE + RF + RG + RH + RI + RJ

  const RK = -getCharges(bal, ['66'])
  const XD = XC + RK

  const TJ = getProduits(bal, ['791', '798', '799'])
  const RL = -getCharges(bal, ['681', '691'])
  const XE = XD + TJ + RL

  const TK = getProduits(bal, ['77'])
  const TL = getProduits(bal, ['797'])
  const TM = getProduits(bal, ['787'])
  const RM = -getCharges(bal, ['67'])
  const RN = -getCharges(bal, ['697'])
  const XF = TK + TL + TM + RM + RN

  const XG = XE + XF

  const TN = getProduits(bal, ['82'])
  const TO = getProduits(bal, ['84', '86', '88'])
  const RO = -getCharges(bal, ['81'])
  const RP = -getCharges(bal, ['83', '85'])
  const XH = TN + TO + RO + RP

  const RQ = 0
  const RS = -getCharges(bal, ['89'])
  const XI = XG + XH + RQ + RS

  return [
    { ref: 'TA', label: 'Ventes de marchandises', sign: '+', note: '21', net: TA },
    { ref: 'RA', label: 'Achats de marchandises', sign: '-', note: '22', net: RA },
    { ref: 'RB', label: 'Variation de stocks de marchandises', sign: '-/+', note: '6', net: RB },
    { ref: 'XA', label: 'MARGE COMMERCIALE (Somme TA a RB)', sign: '', note: '', net: XA, isTotal: true },
    { ref: 'TB', label: 'Ventes de produits fabriques', sign: '+', note: '21', net: TB },
    { ref: 'TC', label: 'Travaux, services vendus', sign: '+', note: '21', net: TC },
    { ref: 'TD', label: 'Produits accessoires', sign: '+', note: '21', net: TD },
    { ref: 'XB', label: 'CHIFFRE D\'AFFAIRES (A + B + C + D)', sign: '', note: '', net: XB, isTotal: true },
    { ref: 'TE', label: 'Production stockee (ou destockage)', sign: '-/+', note: '6', net: TE },
    { ref: 'TF', label: 'Production immobilisee', sign: '+', note: '21', net: TF },
    { ref: 'TG', label: 'Subventions d\'exploitation', sign: '+', note: '21', net: TG },
    { ref: 'TH', label: 'Autres produits', sign: '+', note: '21', net: TH },
    { ref: 'TI', label: 'Transferts de charges d\'exploitation', sign: '+', note: '12', net: TI },
    { ref: 'RC', label: 'Achats de matieres premieres et fournitures liees', sign: '-', note: '22', net: RC },
    { ref: 'RD', label: 'Variation de stocks de matieres premieres et fournitures liees', sign: '-/+', note: '6', net: RD },
    { ref: 'RE', label: 'Autres achats', sign: '-', note: '22', net: RE },
    { ref: 'RF', label: 'Variation de stocks d\'autres approvisionnements', sign: '-/+', note: '6', net: RF },
    { ref: 'RG', label: 'Transports', sign: '-', note: '23', net: RG },
    { ref: 'RH', label: 'Services exterieurs', sign: '-', note: '24', net: RH },
    { ref: 'RI', label: 'Impots et taxes', sign: '-', note: '25', net: RI },
    { ref: 'RJ', label: 'Autres charges', sign: '-', note: '26', net: RJ },
    { ref: 'XC', label: 'VALEUR AJOUTEE (XB+RA+RB) + (Somme TE a RJ)', sign: '', note: '', net: XC, isTotal: true },
    { ref: 'RK', label: 'Charges de personnel', sign: '-', note: '27', net: RK },
    { ref: 'XD', label: 'EXCEDENT BRUT D\'EXPLOITATION (XC+RK)', sign: '', note: '', net: XD, isTotal: true },
    { ref: 'TJ', label: 'Reprises d\'amortissements, provisions et depreciations', sign: '+', note: '28', net: TJ },
    { ref: 'RL', label: 'Dotations aux amortissements, aux provisions et depreciations', sign: '-', note: '3C&28', net: RL },
    { ref: 'XE', label: 'RESULTAT D\'EXPLOITATION (XD+TJ+RL)', sign: '', note: '', net: XE, isTotal: true },
    { ref: 'TK', label: 'Revenus financiers et assimiles', sign: '+', note: '29', net: TK },
    { ref: 'TL', label: 'Reprises de provisions et depreciations financieres', sign: '+', note: '28', net: TL },
    { ref: 'TM', label: 'Transferts de charges financieres', sign: '+', note: '12', net: TM },
    { ref: 'RM', label: 'Frais financiers et charges assimilees', sign: '-', note: '29', net: RM },
    { ref: 'RN', label: 'Dotations aux provisions et aux depreciations financieres', sign: '-', note: '3C&28', net: RN },
    { ref: 'XF', label: 'RESULTAT FINANCIER (Somme TK a RN)', sign: '', note: '', net: XF, isTotal: true },
    { ref: 'XG', label: 'RESULTAT DES ACTIVITES ORDINAIRES (XE+XF)', sign: '', note: '', net: XG, isTotal: true },
    { ref: 'TN', label: 'Produits des cessions d\'immobilisations', sign: '+', note: '3D', net: TN },
    { ref: 'TO', label: 'Autres Produits HAO', sign: '+', note: '30', net: TO },
    { ref: 'RO', label: 'Valeurs comptables des cessions d\'immobilisations', sign: '-', note: '3D', net: RO },
    { ref: 'RP', label: 'Autres Charges HAO', sign: '-', note: '30', net: RP },
    { ref: 'XH', label: 'RESULTAT HORS ACTIVITES ORDINAIRES (Somme TN a RP)', sign: '', note: '', net: XH, isTotal: true },
    { ref: 'RQ', label: 'Participation des travailleurs', sign: '-', note: '30', net: RQ },
    { ref: 'RS', label: 'Impots sur le resultat', sign: '-', note: '37', net: RS },
    { ref: 'XI', label: 'RESULTAT NET (XG+XH+RQ+RS)', sign: '', note: '', net: XI, isTotal: true },
  ]
}

const Resultat: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const lines = computeResultat(balance)
  const linesN1 = balanceN1 && balanceN1.length > 0 ? computeResultat(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'LIBELLES', width: '45%' },
    { key: 'sign', label: '(+/-)', width: 30, align: 'center' },
    { key: 'note', label: 'NOTE', width: 30, align: 'center' },
    { key: 'net', label: 'NET', align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', align: 'right', subLabel: 'Exercice N-1' },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      sign: r.sign,
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
