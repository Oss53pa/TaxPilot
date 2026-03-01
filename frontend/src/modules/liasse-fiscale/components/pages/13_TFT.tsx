import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getCharges, getProduits, getActifBrut, getPassif, getBalanceSolde } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

const v = (n: number | null | undefined) => n || null

function computeTFT(bal: BalanceEntry[], balPrev: BalanceEntry[]) {
  const c = (p: string[]) => getCharges(bal, p)
  const pr = (p: string[]) => getProduits(bal, p)
  const hasPrev = balPrev.length > 0

  // ── Resultat net ──
  const totalCharges = c(['60','61','62','63','64','65','66','67','68','69','81','83','85','87','89'])
  const totalProduits = pr(['70','71','72','73','75','77','78','79','82','84','86','88'])
  const FA = totalProduits - totalCharges

  // Dotations
  const FB = c(['681','687','691','697'])
  // Reprises
  const FC = pr(['791','797','798','799','787'])
  // Plus-values cessions
  const FD = pr(['82']) - c(['81'])
  // CAFG
  const FE = FA + FB - FC - FD

  // ── Variation BFR ──
  const stocksN = getActifBrut(bal, ['3'])
  const stocksPrev = hasPrev ? getActifBrut(balPrev, ['3']) : 0
  const creancesN = getActifBrut(bal, ['4'])
  const creancesPrev = hasPrev ? getActifBrut(balPrev, ['4']) : 0
  const dettesCircN = getPassif(bal, ['40','41','42','43','44'])
  const dettesCircPrev = hasPrev ? getPassif(balPrev, ['40','41','42','43','44']) : 0

  const bfrN = stocksN + creancesN - dettesCircN
  const bfrPrev = stocksPrev + creancesPrev - dettesCircPrev
  const FF = hasPrev ? -(bfrN - bfrPrev) : 0

  // Flux exploitation
  const FG = FE + FF

  // ── Investissement ──
  const immoGrossN = getActifBrut(bal, ['2'])
  const immoGrossPrev = hasPrev ? getActifBrut(balPrev, ['2']) : 0
  const FH = hasPrev ? Math.max(immoGrossN - immoGrossPrev, 0) : 0
  const FI = pr(['82']) // cessions
  const FJ = getBalanceSolde(bal, ['26','27']) - (hasPrev ? getBalanceSolde(balPrev, ['26','27']) : 0)
  const FK = -FH + FI - FJ

  // ── Financement ──
  const FL = 0 // Augmentation capital (manual)
  const FM = 0 // Emprunts (manual)
  const FN = 0 // Remboursements emprunts (manual)
  const FO = 0 // Dividendes (manual)
  const FP = FL + FM - FN - FO

  // ── Synthese ──
  const FQ = FG + FK + FP

  // ── Tresorerie ──
  const tresoActif = getActifBrut(bal, ['50','51','52','53','54','55','56','57','58'])
  const tresoPassif = getPassif(bal, ['52','561','564','565'])
  const FS = tresoActif - tresoPassif

  const tresoActifPrev = hasPrev ? getActifBrut(balPrev, ['50','51','52','53','54','55','56','57','58']) : 0
  const tresoPassifPrev = hasPrev ? getPassif(balPrev, ['52','561','564','565']) : 0
  const FR = tresoActifPrev - tresoPassifPrev

  const FT = FS - FR - FQ

  return { FA, FB, FC, FD, FE, FF, FG, FH, FI, FJ, FK, FL, FM, FN, FO, FP, FQ, FR, FS, FT }
}

const TFT: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const bal = balance
  const balN1 = balanceN1 || []
  const hasN1 = balN1.length > 0

  // Compute for N (using N-1 for BFR variations)
  const n = computeTFT(bal, balN1)

  // Compute for N-1 column (using empty for its own prev)
  const prev = hasN1 ? computeTFT(balN1, []) : null

  const lines: { ref: string; label: string; note: string; montant: number | null; montant_n1: number | null; isTotal?: boolean; isSub?: boolean }[] = [
    { ref: 'ZA', label: 'Tresorerie nette au 1er janvier (Treso actif N-1 - Treso passif N-1)', note: 'A', montant: n.FR, montant_n1: prev ? v(prev.FR) : null, isTotal: true },
    { ref: '', label: 'Flux de tresorerie provenant des activites operationnelles', note: '', montant: 0, montant_n1: null, isSub: true },
    { ref: 'FA', label: 'Capacite d\'Autofinancement Globale (CAFG)', note: '', montant: n.FE, montant_n1: prev ? v(prev.FE) : null },
    { ref: 'FB', label: '- Variation d\'actif circulant HAO', note: '', montant: 0, montant_n1: null },
    { ref: 'FC', label: '- Variation des stocks', note: '', montant: v(-(getActifBrut(bal, ['3']) - (hasN1 ? getActifBrut(balN1, ['3']) : 0))), montant_n1: null },
    { ref: 'FD', label: '- Variation des creances', note: '', montant: v(-(getActifBrut(bal, ['4']) - (hasN1 ? getActifBrut(balN1, ['4']) : 0))), montant_n1: null },
    { ref: 'FE', label: '+ Variation du passif circulant', note: '', montant: v(getPassif(bal, ['40','41','42','43','44']) - (hasN1 ? getPassif(balN1, ['40','41','42','43','44']) : 0)), montant_n1: null },
    { ref: 'ZB', label: 'Flux de tresorerie provenant des activites operationnelles (Somme FA a FE)', note: 'B', montant: n.FG, montant_n1: prev ? v(prev.FG) : null, isTotal: true },
    { ref: '', label: 'Flux de tresorerie provenant des activites d\'investissements', note: '', montant: 0, montant_n1: null, isSub: true },
    { ref: 'FF', label: '- Decaissements lies aux acquisitions d\'immobilisations incorporelles', note: '', montant: v(-Math.max(getActifBrut(bal, ['21']) - (hasN1 ? getActifBrut(balN1, ['21']) : 0), 0)), montant_n1: null },
    { ref: 'FG', label: '- Decaissements lies aux acquisitions d\'immobilisations corporelles', note: '', montant: v(-Math.max(getActifBrut(bal, ['22','23','24']) - (hasN1 ? getActifBrut(balN1, ['22','23','24']) : 0), 0)), montant_n1: null },
    { ref: 'FH', label: '- Decaissements lies aux acquisitions d\'immobilisations financieres', note: '', montant: v(-Math.max(getActifBrut(bal, ['26','27']) - (hasN1 ? getActifBrut(balN1, ['26','27']) : 0), 0)), montant_n1: null },
    { ref: 'FI', label: '+ Encaissements lies aux cessions d\'immobilisations incorporelles et corporelles', note: '', montant: v(getProduits(bal, ['82'])), montant_n1: prev ? v(getProduits(balN1, ['82'])) : null },
    { ref: 'FJ', label: '+ Encaissements lies aux cessions d\'immobilisations financieres', note: '', montant: 0, montant_n1: null },
    { ref: 'ZC', label: 'Flux de tresorerie provenant des activites d\'investissement (somme FF a FJ)', note: 'C', montant: n.FK, montant_n1: prev ? v(prev.FK) : null, isTotal: true },
    { ref: '', label: 'Flux de tresorerie provenant du financement par les capitaux propres', note: '', montant: 0, montant_n1: null, isSub: true },
    { ref: 'FK', label: '+ Augmentations de capital par apports nouveaux', note: '', montant: 0, montant_n1: null },
    { ref: 'FL', label: '+ Subventions d\'investissement recues', note: '', montant: 0, montant_n1: null },
    { ref: 'FM', label: '- Prelevements sur le capital', note: '', montant: 0, montant_n1: null },
    { ref: 'FN', label: '- Dividendes verses', note: '', montant: 0, montant_n1: null },
    { ref: 'ZD', label: 'Flux de tresorerie provenant des capitaux propres (somme FK a FN)', note: 'D', montant: n.FP, montant_n1: prev ? v(prev.FP) : null, isTotal: true },
    { ref: '', label: 'Tresorerie provenant du financement par les capitaux etrangers', note: '', montant: 0, montant_n1: null, isSub: true },
    { ref: 'FO', label: '+ Emprunts', note: '', montant: 0, montant_n1: null },
    { ref: 'FP', label: '+ Autres dettes financieres diverses', note: '', montant: 0, montant_n1: null },
    { ref: 'FQ', label: '- Remboursements des emprunts et autres dettes financieres', note: '', montant: 0, montant_n1: null },
    { ref: 'ZE', label: 'Flux de tresorerie provenant des capitaux etrangers (somme FO a FQ)', note: 'E', montant: 0, montant_n1: null, isTotal: true },
    { ref: 'ZF', label: 'Flux de tresorerie provenant des activites de financement (D+E)', note: 'F', montant: n.FP, montant_n1: prev ? v(prev.FP) : null, isTotal: true },
    { ref: 'ZG', label: 'VARIATION DE LA TRESORERIE NETTE DE LA PERIODE (B+C+F)', note: 'G', montant: n.FQ, montant_n1: prev ? v(prev.FQ) : null, isTotal: true },
    { ref: 'ZH', label: 'Tresorerie nette au 31 Decembre (G+A)', note: 'H', montant: n.FS, montant_n1: prev ? v(prev.FS) : null, isTotal: true },
    { ref: '', label: 'Controle : Tresorerie actif N - Tresorerie passif N', note: '', montant: n.FS, montant_n1: null },
  ]

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'TABLEAU DES FLUX DE TRESORERIE', width: '50%' },
    { key: 'note', label: 'Note', width: 30, align: 'center' },
    { key: 'montant', label: 'Exercice N', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', align: 'right' },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      montant: r.isSub ? '' : v(r.montant),
      montant_n1: r.isSub ? '' : r.montant_n1,
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSub,
    bold: r.isSub || r.isTotal,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="11" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        TABLEAU DES FLUX DE TRESORERIE
      </Typography>
      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default TFT
