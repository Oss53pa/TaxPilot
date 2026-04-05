import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { liasseDataService } from '@/services/liasseDataService'

const v = (n: number) => n || null

/**
 * SYSCOHADA Révisé 2017 — Compte de Résultat
 *
 * Delegates to liasseDataService.generateCompteResultat() as single source of truth.
 * The component only builds display rows with sub-totals; it does not compute line values.
 *
 * Convention: produits are positive, charges are negative (so addition gives net result).
 */
function buildResultatRows(field: 'montant' | 'montant_n1') {
  const { charges, produits } = liasseDataService.generateCompteResultat()

  const c = (ref: string) => {
    const row = charges.find(r => r.ref === ref)
    return row ? -(row[field] ?? 0) : 0  // negate: charges displayed as negative
  }
  const p = (ref: string) => {
    const row = produits.find(r => r.ref === ref)
    return row ? (row[field] ?? 0) : 0   // produits displayed as positive
  }

  const TA = p('TA'), RA = c('RA'), RB = c('RB')
  const XA = TA + RA + RB

  const TB = p('TB'), TC = p('TC'), TD = p('TD')
  const XB = TA + TB + TC + TD

  const TE = p('TE'), TF = p('TF'), TG = p('TG'), TH = p('TH'), TI = p('TI')
  const RC = c('RC'), RD = c('RD'), RE = c('RE'), RF = c('RF')
  const RG = c('RG'), RH = c('RH'), RI = c('RI'), RJ = c('RJ')
  const XC = XA + TB + TC + TD + TE + TF + TG + TH + TI + RC + RD + RE + RF + RG + RH + RI + RJ

  const RK = c('RK')
  const XD = XC + RK

  const TJ = p('TJ'), RL = c('RL')
  const XE = XD + TJ + RL

  const TK = p('TK'), TL = p('TL'), TM = p('TM')
  const RM = c('RM'), RN = c('RN')
  const XF = TK + TL + TM + RM + RN

  const XG = XE + XF

  const TN = p('TN'), TO = p('TO')
  const RO = c('RQ'), RP = c('RR')  // SYSCOHADA mapping: RQ->81 (VCE), RR->83/85 (autres HAO)
  const XH = TN + TO + RO + RP

  const RS = c('RS')
  const XI = XG + XH + RS

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
    { ref: 'XC', label: 'VALEUR AJOUTEE (XA+somme TB à TI+somme RC à RJ)', note: '', net: XC, isTotal: true },
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
    { ref: 'RQ', label: 'Participation des travailleurs', note: '30', net: 0 },
    { ref: 'RS', label: 'Impôts sur le résultat', note: '37', net: RS },
    { ref: 'XI', label: 'RESULTAT NET (XG+XH+RQ+RS)', note: '', net: XI, isTotal: true },
  ]
}

const Resultat: React.FC<PageProps> = ({ entreprise, onNoteClick }) => {
  const lines = useMemo(() => buildResultatRows('montant'), [])
  const linesN1 = useMemo(() => {
    if (!liasseDataService.hasN1) return null
    return buildResultatRows('montant_n1')
  }, [])

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 52, align: 'center' },
    { key: 'label', label: 'LIBELLES', width: '45%' },
    { key: 'note', label: 'Note', width: 44, align: 'center' },
    { key: 'net', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N-1' },
  ]

  // Build a ref->value map for N-1 lookup (skip section headers)
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
