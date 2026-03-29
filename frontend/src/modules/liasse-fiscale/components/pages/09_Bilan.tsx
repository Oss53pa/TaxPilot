import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getActifBrut, getAmortProv, getPassif, getBalanceSolde, fmt, detecterAnomaliesActif, detecterAnomaliesPassif } from '../../services/liasse-calculs'
import type { AnomalieComptable } from '../../services/liasse-calculs'
import { BILAN_ACTIF, BILAN_PASSIF, ALL_ACTIF_PREFIXES, ALL_PASSIF_PREFIXES } from '@/constants/syscohada-mappings'

// ── ACTIF data definitions ──

interface ActifDetail {
  ref: string; label: string; comptes: string[]; amort: string[]
  note?: string; isTotal?: boolean; isSub?: boolean; indent?: number
}

const ACTIF_LINES: ActifDetail[] = [
  { ref: '', label: 'ACTIF IMMOBILISE', comptes: [], amort: [], isSub: true },
  { ref: 'AD', label: 'IMMOBILISATIONS INCORPORELLES', comptes: [...BILAN_ACTIF.AE.comptes, ...BILAN_ACTIF.AF.comptes, ...BILAN_ACTIF.AG.comptes, ...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AE.amort, ...BILAN_ACTIF.AF.amort, ...BILAN_ACTIF.AG.amort, ...BILAN_ACTIF.AH.amort], note: '3' },
  { ref: 'AE', label: 'Frais de développement et de prospection', comptes: [...BILAN_ACTIF.AE.comptes], amort: [...BILAN_ACTIF.AE.amort], indent: 1 },
  { ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires', comptes: [...BILAN_ACTIF.AF.comptes], amort: [...BILAN_ACTIF.AF.amort], indent: 1 },
  { ref: 'AG', label: 'Fonds commercial et droit au bail', comptes: [...BILAN_ACTIF.AG.comptes], amort: [...BILAN_ACTIF.AG.amort], indent: 1 },
  { ref: 'AH', label: 'Autres immobilisations incorporelles', comptes: [...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AH.amort], indent: 1 },
  { ref: 'AI', label: 'IMMOBILISATIONS CORPORELLES', comptes: [...BILAN_ACTIF.AJ.comptes, ...BILAN_ACTIF.AK.comptes, ...BILAN_ACTIF.AL.comptes, ...BILAN_ACTIF.AM.comptes, ...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AJ.amort, ...BILAN_ACTIF.AK.amort, ...BILAN_ACTIF.AL.amort, ...BILAN_ACTIF.AM.amort, ...BILAN_ACTIF.AN.amort], note: '3' },
  { ref: 'AJ', label: 'Terrains', comptes: [...BILAN_ACTIF.AJ.comptes], amort: [...BILAN_ACTIF.AJ.amort], indent: 1 },
  { ref: 'AK', label: 'Bâtiments', comptes: [...BILAN_ACTIF.AK.comptes], amort: [...BILAN_ACTIF.AK.amort], indent: 1 },
  { ref: 'AL', label: 'Aménagements, agencements et installations', comptes: [...BILAN_ACTIF.AL.comptes], amort: [...BILAN_ACTIF.AL.amort], indent: 1 },
  { ref: 'AM', label: 'Matériel, mobilier et actifs biologiques', comptes: [...BILAN_ACTIF.AM.comptes], amort: [...BILAN_ACTIF.AM.amort], indent: 1 },
  { ref: 'AN', label: 'Matériel de transport', comptes: [...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AN.amort], indent: 1 },
  { ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', comptes: [...BILAN_ACTIF.AP.comptes], amort: [...BILAN_ACTIF.AP.amort], note: '3' },
  { ref: 'AQ', label: 'IMMOBILISATIONS FINANCIERES', comptes: [...BILAN_ACTIF.AR.comptes, ...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AR.amort, ...BILAN_ACTIF.AS.amort], note: '4' },
  { ref: 'AR', label: 'Titres de participation', comptes: [...BILAN_ACTIF.AR.comptes], amort: [...BILAN_ACTIF.AR.amort], indent: 1 },
  { ref: 'AS', label: 'Autres immobilisations financières', comptes: [...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AS.amort], indent: 1 },
  { ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISE', comptes: [], amort: [], isTotal: true },
  { ref: '', label: 'ACTIF CIRCULANT', comptes: [], amort: [], isSub: true },
  { ref: 'BA', label: 'ACTIF CIRCULANT HAO', comptes: [...BILAN_ACTIF.BA.comptes], amort: [...BILAN_ACTIF.BA.amort], note: '5' },
  { ref: 'BB', label: 'STOCKS ET ENCOURS', comptes: [...BILAN_ACTIF.BB.comptes], amort: [...BILAN_ACTIF.BB.amort], note: '6' },
  { ref: 'BG', label: 'CREANCES ET EMPLOIS ASSIMILES', comptes: [...BILAN_ACTIF.BH.comptes, ...BILAN_ACTIF.BI.comptes, ...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BH.amort, ...BILAN_ACTIF.BI.amort, ...BILAN_ACTIF.BJ.amort] },
  { ref: 'BH', label: 'Fournisseurs avances versées', comptes: [...BILAN_ACTIF.BH.comptes], amort: [...BILAN_ACTIF.BH.amort], note: '17', indent: 1 },
  { ref: 'BI', label: 'Clients', comptes: [...BILAN_ACTIF.BI.comptes], amort: [...BILAN_ACTIF.BI.amort], note: '7', indent: 1 },
  { ref: 'BJ', label: 'Autres créances', comptes: [...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BJ.amort], note: '8', indent: 1 },
  { ref: 'BK', label: 'TOTAL ACTIF CIRCULANT', comptes: [], amort: [], isTotal: true },
  { ref: '', label: 'TRESORERIE - ACTIF', comptes: [], amort: [], isSub: true },
  { ref: 'BQ', label: 'Titres de placement', comptes: [...BILAN_ACTIF.BQ.comptes], amort: [...BILAN_ACTIF.BQ.amort], note: '9' },
  { ref: 'BR', label: 'Valeurs à encaisser', comptes: [...BILAN_ACTIF.BR.comptes], amort: [...BILAN_ACTIF.BR.amort], note: '10' },
  { ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', comptes: [...BILAN_ACTIF.BS.comptes], amort: [...BILAN_ACTIF.BS.amort], note: '11' },
  { ref: 'BT', label: 'TOTAL TRESORERIE-ACTIF', comptes: [], amort: [], isTotal: true },
  { ref: 'BU', label: 'Ecart de conversion-Actif', comptes: [...BILAN_ACTIF.BU.comptes], amort: [...BILAN_ACTIF.BU.amort], note: '12' },
  { ref: 'BZ', label: 'TOTAL GENERAL', comptes: [], amort: [], isTotal: true },
]

// ── PASSIF data definitions ──

interface PassifDetail {
  ref: string; label: string; comptes: string[]
  note?: string; isTotal?: boolean; isSub?: boolean; special?: string
}

const PASSIF_LINES: PassifDetail[] = [
  { ref: '', label: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptes: [], isSub: true },
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
  { ref: '', label: 'DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isSub: true },
  { ref: 'DA', label: 'Emprunts et dettes financières diverses', comptes: [...BILAN_PASSIF.DA.comptes], note: '16' },
  { ref: 'DB', label: 'Dettes de location-acquisition', comptes: [...BILAN_PASSIF.DB.comptes], note: '16' },
  { ref: 'DC', label: 'Provisions pour risques et charges', comptes: [...BILAN_PASSIF.DC.comptes], note: '16' },
  { ref: 'DD', label: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DF', label: 'TOTAL RESSOURCES STABLES', comptes: [], isTotal: true },
  { ref: '', label: 'PASSIF CIRCULANT', comptes: [], isSub: true },
  { ref: 'DH', label: 'Dettes circulantes HAO', comptes: [...BILAN_PASSIF.DH.comptes], note: '5' },
  { ref: 'DI', label: 'Clients, avances reçues', comptes: [...BILAN_PASSIF.DI.comptes], note: '7' },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', comptes: [...BILAN_PASSIF.DJ.comptes], note: '17' },
  { ref: 'DK', label: 'Dettes fiscales et sociales', comptes: [...BILAN_PASSIF.DK.comptes], note: '18' },
  { ref: 'DM', label: 'Autres dettes', comptes: [...BILAN_PASSIF.DM.comptes], note: '19' },
  { ref: 'DN', label: 'Provisions pour risques et charges à court terme', comptes: [...BILAN_PASSIF.DN.comptes], note: '19' },
  { ref: 'DP', label: 'TOTAL PASSIF CIRCULANT', comptes: [], isTotal: true },
  { ref: '', label: 'TRESORERIE - PASSIF', comptes: [], isSub: true },
  { ref: 'DQ', label: 'Banques, crédits d\'escompte', comptes: [...BILAN_PASSIF.DQ.comptes], note: '20' },
  { ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', comptes: [...BILAN_PASSIF.DR.comptes], note: '20' },
  { ref: 'DT', label: 'TOTAL TRESORERIE-PASSIF', comptes: [], isTotal: true },
  { ref: 'DV', label: 'Ecart de conversion-Passif', comptes: [...BILAN_PASSIF.DV.comptes], note: '12' },
  { ref: 'DZ', label: 'TOTAL GENERAL', comptes: [], isTotal: true },
]

// ── Compute functions ──

function computeActif(bal: BalanceEntry[]) {
  const vals = new Map<string, { brut: number; amort: number; net: number }>()

  for (const r of ACTIF_LINES) {
    if (r.isSub || r.isTotal || r.comptes.length === 0) continue
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

  return ACTIF_LINES.map(r => {
    const v = vals.get(r.ref) || { brut: 0, amort: 0, net: 0 }
    return { ...r, brut: v.brut, amortV: v.amort, net: v.net }
  })
}

function computePassif(bal: BalanceEntry[]) {
  const vals = new Map<string, number>()

  for (const r of PASSIF_LINES) {
    if (r.isSub || r.isTotal) continue
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

  return PASSIF_LINES.map(r => ({
    ...r, montant: vals.get(r.ref) || 0,
  }))
}

// ── Component ──

const Bilan: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const actifData = computeActif(balance)
  const actifN1 = balanceN1 && balanceN1.length > 0 ? computeActif(balanceN1) : null
  const actifN1Map = actifN1 ? new Map(actifN1.map(r => [r.ref, r])) : null

  const passifData = computePassif(balance)
  const passifN1 = balanceN1 && balanceN1.length > 0 ? computePassif(balanceN1) : null
  const passifN1Map = passifN1 ? new Map(passifN1.map(r => [r.ref, r])) : null

  // Anomalies
  const anomaliesActif = detecterAnomaliesActif(balance, ALL_ACTIF_PREFIXES)
  const anomaliesPassif = detecterAnomaliesPassif(balance, ALL_PASSIF_PREFIXES)
  const anomalies: AnomalieComptable[] = [...anomaliesActif, ...anomaliesPassif]

  // ── ACTIF table (Bilan synthétique = NET only, no BRUT/AMORT) ──
  const actifColumns: Column[] = [
    { key: 'ref', label: 'REF', width: 40, align: 'center' },
    { key: 'label', label: 'ACTIF', width: '45%' },
    { key: 'note', label: 'Note', width: 35, align: 'center' },
    { key: 'net', label: 'NET', width: 110, align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', width: 110, align: 'right', subLabel: 'Exercice N-1' },
  ]

  const actifRows: Row[] = actifData.map((r, i) => ({
    id: `a${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSub || r.isTotal ? '' : (r.note || ''),
      net: r.isSub ? '' : (r.net || null),
      net_n1: r.isSub ? '' : (r.ref && actifN1Map?.get(r.ref)?.net ? actifN1Map.get(r.ref)!.net : null),
    },
    isSectionHeader: r.isSub,
    isTotal: r.isTotal,
    indent: r.indent,
    bold: !!r.isTotal,
  }))

  // ── PASSIF table ──
  const passifColumns: Column[] = [
    { key: 'ref', label: 'REF', width: 40, align: 'center' },
    { key: 'label', label: 'PASSIF', width: '45%' },
    { key: 'note', label: 'Note', width: 35, align: 'center' },
    { key: 'montant', label: 'NET', width: 110, align: 'right', subLabel: 'Exercice N' },
    { key: 'montant_n1', label: 'NET', width: 110, align: 'right', subLabel: 'Exercice N-1' },
  ]

  const passifRows: Row[] = passifData.map((r, i) => ({
    id: `p${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSub || r.isTotal ? '' : (r.note || ''),
      montant: r.isSub ? '' : (r.montant || null),
      montant_n1: r.isSub ? '' : (r.ref && passifN1Map?.get(r.ref)?.montant ? passifN1Map.get(r.ref)!.montant : null),
    },
    isSectionHeader: r.isSub,
    isTotal: r.isTotal,
    bold: !!r.isSub,
  }))

  const totalActif = actifData.find(r => r.ref === 'BZ')?.net || 0
  const totalPassif = passifData.find(r => r.ref === 'DZ')?.montant || 0

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="7" />

      <Typography sx={{ fontSize: '11pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        BILAN AU {new Date(entreprise.exercice_clos || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
      </Typography>

      {/* ACTIF + PASSIF côte à côte */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        {/* ACTIF */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '10pt', fontWeight: 700, textAlign: 'center', mb: 0.5, fontFamily: 'inherit' }}>
            ACTIF
          </Typography>
          <LiasseTable columns={actifColumns} rows={actifRows} compact onNoteClick={onNoteClick} />
        </Box>

        {/* PASSIF */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '10pt', fontWeight: 700, textAlign: 'center', mb: 0.5, fontFamily: 'inherit' }}>
            PASSIF
          </Typography>
          <LiasseTable columns={passifColumns} rows={passifRows} compact onNoteClick={onNoteClick} />
        </Box>
      </Box>

      {/* Alertes soldes anormaux */}
      {anomalies.length > 0 && (
        <Box sx={{ mt: 1, px: 1, py: 0.5, bgcolor: '#fff3e0', border: '1px solid #ff9800', borderRadius: 1 }}>
          <Typography sx={{ fontSize: '9pt', fontWeight: 700, color: '#e65100', fontFamily: 'inherit', mb: 0.25 }}>
            ALERTES SOLDES ANORMAUX ({anomalies.length})
          </Typography>
          {anomalies.map((a, i) => (
            <Typography key={i} sx={{ fontSize: '8pt', color: '#bf360c', fontFamily: 'inherit' }}>
              {a.type === 'actif_crediteur'
                ? `Compte ${a.compte} (${a.libelle}) : solde créditeur ${fmt(a.montant)} sur un compte d'actif`
                : `Compte ${a.compte} (${a.libelle}) : solde débiteur ${fmt(a.montant)} sur un compte de passif`
              }
            </Typography>
          ))}
        </Box>
      )}

      {/* Contrôle d'équilibre */}
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography sx={{
          fontSize: '10pt', fontWeight: 700, fontFamily: 'inherit',
          color: Math.abs(totalActif - totalPassif) < 1 ? 'success.main' : 'error.main',
        }}>
          Contrôle : Total Actif (BZ) = {fmt(totalActif)} | Total Passif (DZ) = {fmt(totalPassif)}
          {Math.abs(totalActif - totalPassif) < 1 ? ' ✓ Équilibré' : ' ✗ DÉSÉQUILIBRE'}
        </Typography>
      </Box>
    </Box>
  )
}

export default Bilan
