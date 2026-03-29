import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps, BalanceEntry } from '../../types'
import { getActifBrut, getAmortProv, getBalanceSolde, getPassif, fmt, detecterAnomaliesActif, detecterAnomaliesPassif } from '../../services/liasse-calculs'
import type { AnomalieComptable } from '../../services/liasse-calculs'
import { BILAN_ACTIF, BILAN_PASSIF, ALL_ACTIF_PREFIXES, ALL_PASSIF_PREFIXES } from '@/constants/syscohada-mappings'

interface ActifRowDef {
  ref: string; label: string; comptes: string[]; amort: string[]
  note?: string; isTotal?: boolean; indent?: number; bold?: boolean
}
interface PassifRowDef {
  ref: string; label: string; comptes: string[]
  note?: string; isTotal?: boolean; indent?: number; bold?: boolean; special?: 'debit' | 'signed'
}

const ACTIF_ROWS: ActifRowDef[] = [
  { ref: 'AD', label: 'IMMOBILISATIONS INCORPORELLES', comptes: [...BILAN_ACTIF.AE.comptes, ...BILAN_ACTIF.AF.comptes, ...BILAN_ACTIF.AG.comptes, ...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AE.amort, ...BILAN_ACTIF.AF.amort, ...BILAN_ACTIF.AG.amort, ...BILAN_ACTIF.AH.amort], note: '3', bold: true },
  { ref: 'AE', label: 'Frais de développement et de prospection', comptes: [...BILAN_ACTIF.AE.comptes], amort: [...BILAN_ACTIF.AE.amort], indent: 1 },
  { ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires', comptes: [...BILAN_ACTIF.AF.comptes], amort: [...BILAN_ACTIF.AF.amort], indent: 1 },
  { ref: 'AG', label: 'Fonds commercial et droit au bail', comptes: [...BILAN_ACTIF.AG.comptes], amort: [...BILAN_ACTIF.AG.amort], indent: 1 },
  { ref: 'AH', label: 'Autres immobilisations incorporelles', comptes: [...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AH.amort], indent: 1 },
  { ref: 'AI', label: 'IMMOBILISATIONS CORPORELLES', comptes: [...BILAN_ACTIF.AJ.comptes, ...BILAN_ACTIF.AK.comptes, ...BILAN_ACTIF.AL.comptes, ...BILAN_ACTIF.AM.comptes, ...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AJ.amort, ...BILAN_ACTIF.AK.amort, ...BILAN_ACTIF.AL.amort, ...BILAN_ACTIF.AM.amort, ...BILAN_ACTIF.AN.amort], note: '3', bold: true },
  { ref: 'AJ', label: 'Terrains', comptes: [...BILAN_ACTIF.AJ.comptes], amort: [...BILAN_ACTIF.AJ.amort], indent: 1 },
  { ref: 'AK', label: 'Bâtiments', comptes: [...BILAN_ACTIF.AK.comptes], amort: [...BILAN_ACTIF.AK.amort], indent: 1 },
  { ref: 'AL', label: 'Aménagements, agencements et installations', comptes: [...BILAN_ACTIF.AL.comptes], amort: [...BILAN_ACTIF.AL.amort], indent: 1 },
  { ref: 'AM', label: 'Matériel, mobilier et actifs biologiques', comptes: [...BILAN_ACTIF.AM.comptes], amort: [...BILAN_ACTIF.AM.amort], indent: 1 },
  { ref: 'AN', label: 'Matériel de transport', comptes: [...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AN.amort], indent: 1 },
  { ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', comptes: [...BILAN_ACTIF.AP.comptes], amort: [...BILAN_ACTIF.AP.amort], note: '3', bold: true },
  { ref: 'AQ', label: 'IMMOBILISATIONS FINANCIERES', comptes: [...BILAN_ACTIF.AR.comptes, ...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AR.amort, ...BILAN_ACTIF.AS.amort], note: '4', bold: true },
  { ref: 'AR', label: 'Titres de participation', comptes: [...BILAN_ACTIF.AR.comptes], amort: [...BILAN_ACTIF.AR.amort], indent: 1 },
  { ref: 'AS', label: 'Autres immobilisations financières', comptes: [...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AS.amort], indent: 1 },
  { ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISE', comptes: [], amort: [], isTotal: true },
  { ref: 'BA', label: 'ACTIF CIRCULANT HAO', comptes: [...BILAN_ACTIF.BA.comptes], amort: [...BILAN_ACTIF.BA.amort], note: '5', bold: true },
  { ref: 'BB', label: 'STOCKS ET ENCOURS', comptes: [...BILAN_ACTIF.BB.comptes], amort: [...BILAN_ACTIF.BB.amort], note: '6', bold: true },
  { ref: 'BG', label: 'CREANCES ET EMPLOIS ASSIMILES', comptes: [...BILAN_ACTIF.BH.comptes, ...BILAN_ACTIF.BI.comptes, ...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BH.amort, ...BILAN_ACTIF.BI.amort, ...BILAN_ACTIF.BJ.amort], bold: true },
  { ref: 'BH', label: 'Fournisseurs avances versées', comptes: [...BILAN_ACTIF.BH.comptes], amort: [...BILAN_ACTIF.BH.amort], note: '17', indent: 1 },
  { ref: 'BI', label: 'Clients', comptes: [...BILAN_ACTIF.BI.comptes], amort: [...BILAN_ACTIF.BI.amort], note: '7', indent: 1 },
  { ref: 'BJ', label: 'Autres créances', comptes: [...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BJ.amort], note: '8', indent: 1 },
  { ref: 'BK', label: 'TOTAL ACTIF CIRCULANT', comptes: [], amort: [], isTotal: true },
  { ref: 'BQ', label: 'Titres de placement', comptes: [...BILAN_ACTIF.BQ.comptes], amort: [...BILAN_ACTIF.BQ.amort], note: '9' },
  { ref: 'BR', label: 'Valeurs à encaisser', comptes: [...BILAN_ACTIF.BR.comptes], amort: [...BILAN_ACTIF.BR.amort], note: '10' },
  { ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', comptes: [...BILAN_ACTIF.BS.comptes], amort: [...BILAN_ACTIF.BS.amort], note: '11' },
  { ref: 'BT', label: 'TOTAL TRESORERIE-ACTIF', comptes: [], amort: [], isTotal: true },
  { ref: 'BU', label: 'Ecart de conversion-Actif', comptes: [...BILAN_ACTIF.BU.comptes], amort: [...BILAN_ACTIF.BU.amort], note: '12' },
  { ref: 'BZ', label: 'TOTAL GENERAL', comptes: [], amort: [], isTotal: true },
]

const PASSIF_ROWS: PassifRowDef[] = [
  { ref: 'CA', label: 'Capital', comptes: [...BILAN_PASSIF.CA.comptes], note: '13' },
  { ref: 'CB', label: 'Apporteurs capital non appelé (-)', comptes: [...BILAN_PASSIF.CB.comptes], note: '13', special: 'debit' },
  { ref: 'CD', label: 'Primes liées au capital social', comptes: [...BILAN_PASSIF.CD.comptes], note: '14' },
  { ref: 'CE', label: 'Ecarts de réévaluation', comptes: [...BILAN_PASSIF.CE.comptes], note: '3e' },
  { ref: 'CF', label: 'Réserves indisponibles', comptes: [...BILAN_PASSIF.CF.comptes], note: '14' },
  { ref: 'CG', label: 'Réserves libres', comptes: [...BILAN_PASSIF.CG.comptes], note: '14' },
  { ref: 'CH', label: 'Report à nouveau (+ ou -)', comptes: [...BILAN_PASSIF.CH.comptes], note: '14', special: 'signed' },
  { ref: 'CJ', label: 'Résultat net de l\'exercice (bénéfice + ou perte -)', comptes: [...BILAN_PASSIF.CJ.comptes], special: 'signed' },
  { ref: 'CL', label: 'Subventions d\'investissement', comptes: [...BILAN_PASSIF.CL.comptes], note: '15' },
  { ref: 'CM', label: 'Provisions réglementées', comptes: [...BILAN_PASSIF.CM.comptes], note: '15' },
  { ref: 'CP', label: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DA', label: 'Emprunts et dettes financières diverses', comptes: [...BILAN_PASSIF.DA.comptes], note: '16' },
  { ref: 'DB', label: 'Dettes de location-acquisition', comptes: [...BILAN_PASSIF.DB.comptes], note: '16' },
  { ref: 'DC', label: 'Provisions pour risques et charges', comptes: [...BILAN_PASSIF.DC.comptes], note: '16' },
  { ref: 'DD', label: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DF', label: 'TOTAL RESSOURCES STABLES', comptes: [], isTotal: true },
  { ref: 'DH', label: 'Dettes circulantes HAO', comptes: [...BILAN_PASSIF.DH.comptes], note: '5' },
  { ref: 'DI', label: 'Clients, avances reçues', comptes: [...BILAN_PASSIF.DI.comptes], note: '7' },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', comptes: [...BILAN_PASSIF.DJ.comptes], note: '17' },
  { ref: 'DK', label: 'Dettes fiscales et sociales', comptes: [...BILAN_PASSIF.DK.comptes], note: '18' },
  { ref: 'DM', label: 'Autres dettes', comptes: [...BILAN_PASSIF.DM.comptes], note: '19' },
  { ref: 'DN', label: 'Provisions pour risques et charges à court terme', comptes: [...BILAN_PASSIF.DN.comptes], note: '19' },
  { ref: 'DP', label: 'TOTAL PASSIF CIRCULANT', comptes: [], isTotal: true },
  { ref: 'DQ', label: 'Banques, crédits d\'escompte', comptes: [...BILAN_PASSIF.DQ.comptes], note: '20' },
  { ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', comptes: [...BILAN_PASSIF.DR.comptes], note: '20' },
  { ref: 'DT', label: 'TOTAL TRESORERIE-PASSIF', comptes: [], isTotal: true },
  { ref: 'DV', label: 'Ecart de conversion-Passif', comptes: [...BILAN_PASSIF.DV.comptes], note: '12' },
  { ref: 'DZ', label: 'TOTAL GENERAL', comptes: [], isTotal: true },
]

function computeActif(bal: BalanceEntry[]) {
  const vals = new Map<string, { brut: number; amort: number; net: number }>()

  for (const r of ACTIF_ROWS) {
    if (r.isTotal) continue
    const brut = getActifBrut(bal, r.comptes)
    const amort = r.amort.length > 0 ? getAmortProv(bal, r.amort) : 0
    vals.set(r.ref, { brut, amort, net: brut - amort })
  }

  const sumRefs = (refs: string[]) => {
    let b = 0, a = 0
    for (const ref of refs) {
      const v = vals.get(ref)
      if (v) { b += v.brut; a += v.amort }
    }
    return { brut: b, amort: a, net: b - a }
  }

  vals.set('AZ', sumRefs(['AD', 'AI', 'AP', 'AQ']))
  vals.set('BK', sumRefs(['BA', 'BB', 'BG']))
  vals.set('BT', sumRefs(['BQ', 'BR', 'BS']))
  vals.set('BZ', sumRefs(['AZ', 'BK', 'BT', 'BU']))

  return ACTIF_ROWS.map(r => {
    const v = vals.get(r.ref) || { brut: 0, amort: 0, net: 0 }
    return { ref: r.ref, label: r.label, note: r.note || '', brut: v.brut, amort: v.amort, net: v.net, isTotal: !!r.isTotal, indent: r.indent, bold: r.bold }
  })
}

function computePassif(bal: BalanceEntry[]) {
  const vals = new Map<string, number>()

  for (const r of PASSIF_ROWS) {
    if (r.isTotal) continue
    let montant: number
    if (r.special === 'debit') montant = Math.abs(getBalanceSolde(bal, r.comptes))
    else if (r.special === 'signed') montant = -getBalanceSolde(bal, r.comptes)
    else montant = getPassif(bal, r.comptes)
    vals.set(r.ref, montant)
  }

  const sumRefs = (refs: string[]) => refs.reduce((s, ref) => s + (vals.get(ref) || 0), 0)

  vals.set('CP', sumRefs(['CA', 'CD', 'CE', 'CF', 'CG', 'CH', 'CJ', 'CL', 'CM']) - (vals.get('CB') || 0))
  vals.set('DD', sumRefs(['DA', 'DB', 'DC']))
  vals.set('DF', sumRefs(['CP', 'DD']))
  vals.set('DP', sumRefs(['DH', 'DI', 'DJ', 'DK', 'DM', 'DN']))
  vals.set('DT', sumRefs(['DQ', 'DR']))
  vals.set('DZ', sumRefs(['DF', 'DP', 'DT', 'DV']))

  return PASSIF_ROWS.map(r => ({
    ref: r.ref, label: r.label, note: r.note || '',
    montant: vals.get(r.ref) || 0,
    isTotal: !!r.isTotal, indent: r.indent, bold: r.bold,
  }))
}

const Bilan: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const actifData = computeActif(balance)
  const actifN1Arr = balanceN1 && balanceN1.length > 0 ? computeActif(balanceN1) : null
  const actifN1Map = actifN1Arr ? new Map(actifN1Arr.map(r => [r.ref, r])) : null
  const passifData = computePassif(balance)
  const passifN1Arr = balanceN1 && balanceN1.length > 0 ? computePassif(balanceN1) : null
  const passifN1Map = passifN1Arr ? new Map(passifN1Arr.map(r => [r.ref, r])) : null

  // Détection des anomalies comptables (Bugs #7-8)
  const anomaliesActif = detecterAnomaliesActif(balance, ALL_ACTIF_PREFIXES)
  const anomaliesPassif = detecterAnomaliesPassif(balance, ALL_PASSIF_PREFIXES)
  const anomalies: AnomalieComptable[] = [...anomaliesActif, ...anomaliesPassif]

  // Build merged rows: pad shorter side with empties so BZ and DZ are on the same line
  const emptyA = { ref: '', label: '', note: '', brut: 0, amort: 0, net: 0, isTotal: false, indent: undefined, bold: false }
  const emptyP = { ref: '', label: '', note: '', montant: 0, isTotal: false, indent: undefined, bold: false }

  // Pad passif at the end (before last row = DZ) to match actif length
  const passifPadded = [...passifData]
  while (passifPadded.length < actifData.length) {
    passifPadded.splice(passifPadded.length - 1, 0, { ...emptyP })
  }
  const actifPadded = [...actifData]
  while (actifPadded.length < passifPadded.length) {
    actifPadded.splice(actifPadded.length - 1, 0, { ...emptyA })
  }

  const totalRows = actifPadded.length

  // P0-4: Minimum font-size 10px for readability (was 8px)
  const cellSx = (isTotal: boolean, bold: boolean, align: 'left' | 'right' | 'center' = 'left') => ({
    fontSize: isTotal ? 11 : 10,
    fontWeight: isTotal ? 700 : bold ? 600 : 400,
    color: isTotal ? '#fff' : undefined,
    bgcolor: isTotal ? '#1a1a1a' : undefined,
    py: 0.15,
    px: 0.5,
    height: 22,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    borderBottom: '1px solid #e0e0e0',
    textAlign: align,
    fontFamily: 'inherit',
  })

  const noteCellSx = (isTotal: boolean) => ({
    ...cellSx(isTotal, false, 'center'),
  })

  const noteChipSx = {
    height: 16,
    minWidth: 16,
    fontSize: 8,
    fontWeight: 600,
    borderRadius: '8px',
    cursor: 'pointer',
    '& .MuiChip-label': { px: '3px', py: 0, lineHeight: 1 },
    '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' },
  }

  const numFmt = (n: number | undefined) => {
    if (!n || n === 0) return ''
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  }

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="" pageNumber="7" />

      <Typography sx={{ fontSize: '10pt', fontWeight: 700, textAlign: 'center', mb: 0.5, fontFamily: 'inherit' }}>
        BILAN AU {new Date(entreprise.exercice_clos || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
      </Typography>

      {/* Single unified table: ACTIF left | separator | PASSIF right */}
      <Box component="table" sx={{ width: '100%', minWidth: 'calc(100vw - 160px)', borderCollapse: 'collapse', tableLayout: 'auto', fontFamily: 'inherit' }}>
        {/* Column widths */}
        <colgroup>
          {/* ACTIF: ref, label, note, brut, amort, net, net_n1 */}
          <col style={{ width: '3%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '3%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          {/* Separator */}
          <col style={{ width: '0.5%' }} />
          {/* PASSIF: ref, label, note, net, net_n1 */}
          <col style={{ width: '3%' }} />
          <col style={{ width: '15.5%' }} />
          <col style={{ width: '3%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>

        {/* Header */}
        <Box component="thead">
          <Box component="tr" sx={{ bgcolor: 'grey.100' }}>
            {/* ACTIF headers */}
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'center' }}>REF</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'left' }}>ACTIF</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'center' }}>NOTE</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              BRUT<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N</Box>
            </Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              AMORT.<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N</Box>
            </Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              NET<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N</Box>
            </Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              NET<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N-1</Box>
            </Box>
            {/* Separator */}
            <Box component="th" sx={{ bgcolor: '#d0d0d0', px: 0 }} />
            {/* PASSIF headers */}
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'center' }}>REF</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'left' }}>PASSIF</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'center' }}>NOTE</Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              NET<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N</Box>
            </Box>
            <Box component="th" sx={{ fontSize: 9, fontWeight: 600, py: 0.25, px: 0.5, textAlign: 'right' }}>
              NET<Box component="span" sx={{ display: 'block', fontSize: 8, fontWeight: 400, color: 'text.secondary' }}>N-1</Box>
            </Box>
          </Box>
        </Box>

        {/* Body */}
        <Box component="tbody">
          {Array.from({ length: totalRows }, (_, i) => {
            const a = actifPadded[i]
            const p = passifPadded[i]
            const aTotal = a.isTotal
            const pTotal = p.isTotal
            const aBold = a.bold || aTotal
            const pBold = p.bold || pTotal
            const aIndent = a.indent ? a.indent * 12 + 4 : 0

            return (
              <Box component="tr" key={i}>
                {/* ACTIF cells */}
                <Box component="td" sx={cellSx(aTotal, aBold, 'center')}>{a.ref}</Box>
                <Box component="td" sx={{ ...cellSx(aTotal, aBold), pl: aIndent ? `${aIndent}px` : 0.5 }}>{a.label}</Box>
                <Box component="td" sx={noteCellSx(aTotal)}>
                  {a.note && <Chip label={a.note} size="small" variant="outlined" clickable color="primary" onClick={() => onNoteClick?.(a.note)} sx={noteChipSx} />}
                </Box>
                <Box component="td" sx={cellSx(aTotal, aBold, 'right')}>{numFmt(a.brut)}</Box>
                <Box component="td" sx={cellSx(aTotal, aBold, 'right')}>{numFmt(a.amort)}</Box>
                <Box component="td" sx={cellSx(aTotal, aBold, 'right')}>{numFmt(a.net)}</Box>
                <Box component="td" sx={cellSx(aTotal, aBold, 'right')}>{actifN1Map && a.ref ? numFmt(actifN1Map.get(a.ref)?.net) : ''}</Box>
                {/* Separator */}
                <Box component="td" sx={{ bgcolor: '#d0d0d0', px: 0, borderBottom: '1px solid #d0d0d0' }} />
                {/* PASSIF cells */}
                <Box component="td" sx={cellSx(pTotal, pBold, 'center')}>{p.ref}</Box>
                <Box component="td" sx={{ ...cellSx(pTotal, pBold), pl: p.indent ? `${p.indent * 12 + 4}px` : 0.5 }}>{p.label}</Box>
                <Box component="td" sx={noteCellSx(pTotal)}>
                  {p.note && <Chip label={p.note} size="small" variant="outlined" clickable color="primary" onClick={() => onNoteClick?.(p.note)} sx={noteChipSx} />}
                </Box>
                <Box component="td" sx={cellSx(pTotal, pBold, 'right')}>{numFmt(p.montant)}</Box>
                <Box component="td" sx={cellSx(pTotal, pBold, 'right')}>{passifN1Map && p.ref ? numFmt(passifN1Map.get(p.ref)?.montant) : ''}</Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Alertes soldes anormaux */}
      {anomalies.length > 0 && (
        <Box sx={{ mt: 0.5, mb: 0.5, px: 1, py: 0.5, bgcolor: '#fff3e0', border: '1px solid #ff9800', borderRadius: 1 }}>
          <Typography sx={{ fontSize: '8pt', fontWeight: 700, color: '#e65100', fontFamily: 'inherit', mb: 0.25 }}>
            ALERTES SOLDES ANORMAUX ({anomalies.length})
          </Typography>
          {anomalies.map((a, i) => (
            <Typography key={i} sx={{ fontSize: '7pt', color: '#bf360c', fontFamily: 'inherit' }}>
              {a.type === 'actif_crediteur'
                ? `Compte ${a.compte} (${a.libelle}) : solde créditeur ${fmt(a.montant)} sur un compte d'actif`
                : `Compte ${a.compte} (${a.libelle}) : solde débiteur ${fmt(a.montant)} sur un compte de passif`
              }
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 0.5, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '8pt', fontWeight: 700, fontFamily: 'inherit' }}>
          Controle : Total Actif (BZ) = {fmt(actifData.find(r => r.ref === 'BZ')?.net || 0)} | Total Passif (DZ) = {fmt(passifData.find(r => r.ref === 'DZ')?.montant || 0)}
        </Typography>
      </Box>
    </Box>
  )
}

export default Bilan
