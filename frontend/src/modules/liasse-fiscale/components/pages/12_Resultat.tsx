import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getBalanceSolde } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'
import { COMPTE_RESULTAT_MAPPING as CR } from '@/constants/syscohada-mappings'

const v = (n: number) => n || null

/**
 * SYSCOHADA Révisé 2017 — Convention de signe pour le Compte de Résultat :
 *
 * getBalanceSolde() retourne (solde_debit - solde_credit).
 * - Produits (T*) : solde naturellement créditeur → getBalanceSolde négatif → on négate pour afficher positif
 * - Charges (R*) : solde naturellement débiteur → getBalanceSolde positif → on négate pour afficher négatif
 * - Variations (stocks) : le signe résultant indique augmentation (-) ou diminution (+)
 *
 * Mathématiquement, les trois cas appliquent -getBalanceSolde(). C'est correct :
 * Total = Σ(produits) + Σ(charges) = positifs + négatifs → résultat net.
 */
const montantCR = (bal: BalanceEntry[], comptes: string[]): number =>
  -getBalanceSolde(bal, comptes)

function computeResultat(bal: BalanceEntry[]) {
  // --- Activité commerciale ---
  const TA = montantCR(bal, [...CR.TA.comptes])
  const RA = montantCR(bal, [...CR.RA.comptes])
  const RB = montantCR(bal, [...CR.RB.comptes])
  const XA = TA + RA + RB

  // --- Chiffre d'affaires ---
  const TB = montantCR(bal, [...CR.TB.comptes])
  const TC = montantCR(bal, [...CR.TC.comptes])
  const TD = montantCR(bal, [...CR.TD.comptes])
  const XB = TA + TB + TC + TD

  // --- Valeur ajoutée ---
  const TE = montantCR(bal, [...CR.TE.comptes])
  const TF = montantCR(bal, [...CR.TF.comptes])
  const TG = montantCR(bal, [...CR.TG.comptes])
  const TH = montantCR(bal, [...CR.TH.comptes])
  // SYSCOHADA Révisé 2017 — Classe 78/79 :
  // 781 = Transferts de charges d'exploitation → poste TI uniquement
  // 791 = Reprises de provisions d'exploitation → poste TJ uniquement
  // 797 = Reprises de provisions financières → poste TL uniquement (ne pas dupliquer)
  // 798 = Reprises d'amortissements → poste TJ
  // 799 = Reprises de dépréciations → poste TJ
  const TI = montantCR(bal, [...CR.TI.comptes])
  const RC = montantCR(bal, [...CR.RC.comptes])
  const RD = montantCR(bal, [...CR.RD.comptes])
  const RE = montantCR(bal, [...CR.RE.comptes])
  const RF = montantCR(bal, [...CR.RF.comptes])
  const RG = montantCR(bal, [...CR.RG.comptes])
  const RH = montantCR(bal, [...CR.RH.comptes])
  const RI = montantCR(bal, [...CR.RI.comptes])
  const RJ = montantCR(bal, [...CR.RJ.comptes])
  const XC = XB + RA + RB + TE + TF + TG + TH + TI + RC + RD + RE + RF + RG + RH + RI + RJ

  // --- Excédent brut d'exploitation ---
  const RK = montantCR(bal, [...CR.RK.comptes])
  const XD = XC + RK

  // --- Résultat d'exploitation ---
  const TJ = montantCR(bal, [...CR.TJ.comptes])
  const RL = montantCR(bal, [...CR.RL.comptes])
  const XE = XD + TJ + RL

  // --- Résultat financier ---
  const TK = montantCR(bal, [...CR.TK.comptes])
  const TL = montantCR(bal, [...CR.TL.comptes])
  const TM = montantCR(bal, [...CR.TM.comptes])
  const RM = montantCR(bal, [...CR.RM.comptes])
  const RN = montantCR(bal, [...CR.RN.comptes])
  const XF = TK + TL + TM + RM + RN

  // --- Résultat des activités ordinaires ---
  const XG = XE + XF

  // --- Résultat HAO ---
  const TN = montantCR(bal, [...CR.TN.comptes])
  const TO = montantCR(bal, [...CR.TO.comptes])
  const RO = montantCR(bal, [...CR.RO.comptes])
  // SYSCOHADA: 87 est exclusif à RQ (Participation travailleurs), pas dans RP
  const RP = montantCR(bal, [...CR.RP.comptes])
  const XH = TN + TO + RO + RP

  // --- Résultat net ---
  const RQ = montantCR(bal, [...CR.RQ.comptes])
  const RS = montantCR(bal, [...CR.RS.comptes])
  const XI = XG + XH + RQ + RS

  return [
    { ref: '', label: 'ACTIVITE D\'EXPLOITATION', note: '', net: 0, isSub: true },
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
    { ref: '', label: 'ACTIVITE FINANCIERE', note: '', net: 0, isSub: true },
    { ref: 'TK', label: 'Revenus financiers et assimilés', note: '29', net: TK },
    { ref: 'TL', label: 'Reprises de provisions et dépréciations financières', note: '28', net: TL },
    { ref: 'TM', label: 'Transferts de charges financières', note: '12', net: TM },
    { ref: 'RM', label: 'Frais financiers et charges assimilées', note: '29', net: RM },
    { ref: 'RN', label: 'Dotations aux provisions et aux dépréciations financières', note: '3C&28', net: RN },
    { ref: 'XF', label: 'RESULTAT FINANCIER (somme TK à RN)', note: '', net: XF, isTotal: true },
    { ref: 'XG', label: 'RESULTAT DES ACTIVITES ORDINAIRES (XE+XF)', note: '', net: XG, isTotal: true },
    { ref: '', label: 'HORS ACTIVITES ORDINAIRES (H.A.O.)', note: '', net: 0, isSub: true },
    { ref: 'TN', label: 'Produits des cessions d\'immobilisations', note: '3D', net: TN },
    { ref: 'TO', label: 'Autres Produits HAO', note: '30', net: TO },
    { ref: 'RO', label: 'Valeurs comptables des cessions d\'immobilisations', note: '3D', net: RO },
    { ref: 'RP', label: 'Autres Charges HAO', note: '30', net: RP },
    { ref: 'XH', label: 'RESULTAT HORS ACTIVITES ORDINAIRES (somme TN à RP)', note: '', net: XH, isTotal: true },
    { ref: '', label: 'DETERMINATION DU RESULTAT NET', note: '', net: 0, isSub: true },
    { ref: 'RQ', label: 'Participation des travailleurs', note: '30', net: RQ },
    { ref: 'RS', label: 'Impôts sur le résultat', note: '37', net: RS },
    { ref: 'XI', label: 'RESULTAT NET (XG+XH+RQ+RS)', note: '', net: XI, isTotal: true },
  ]
}

const Resultat: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const lines = computeResultat(balance)
  const linesN1 = balanceN1 && balanceN1.length > 0 ? computeResultat(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 52, align: 'center' },
    { key: 'label', label: 'LIBELLES', width: '45%' },
    { key: 'note', label: 'Note', width: 44, align: 'center' },
    { key: 'net', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N-1' },
  ]

  // Build a ref->index map for N-1 lookup (skip section headers)
  const n1Map: Record<string, number> = {}
  if (linesN1) {
    for (const r of linesN1) {
      if (r.ref) n1Map[r.ref] = r.net
    }
  }

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSub || r.isTotal ? '' : r.note,
      net: r.isSub ? '' : v(r.net),
      net_n1: r.isSub ? '' : (r.ref && n1Map[r.ref] != null ? v(n1Map[r.ref]) : null),
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSub,
    bold: r.isTotal || r.isSub,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="10" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        COMPTE DE RESULTAT
      </Typography>
      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default Resultat
