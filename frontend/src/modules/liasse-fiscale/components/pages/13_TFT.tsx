import React, { useState, useCallback, useEffect } from 'react'
import { Box, Typography, Paper, TextField, Button, Collapse, IconButton, Alert } from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Save as SaveIcon } from '@mui/icons-material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getActifBrut, getPassif, getCharges, getProduits } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

/* ── Account prefix groups matching Bilan Actif / Passif definitions ── */

// Trésorerie actif: BQ + BR + BS
const TRESO_ACTIF = ['50', '51', '52', '53', '54', '55', '56', '57', '58']
// Trésorerie passif: DQ + DR
const TRESO_PASSIF = ['52', '561', '564', '565']

// Actif circulant HAO (BA)
const ACTIF_CIRC_HAO = ['485', '486', '487', '488']
// Stocks (BB = BC+BD+BE+BF+BG)
const STOCKS = ['31', '32', '33', '34', '35', '36', '37', '38']
// Créances (BI+BJ+BK)
const CREANCES = ['409', '411', '412', '413', '414', '415', '416', '418', '43', '44', '45', '46', '47']
// Passif circulant (DH+DI+DJ+DK+DL+DM)
const PASSIF_CIRC = ['481', '482', '483', '484', '419', '401', '402', '403', '404', '405', '408', '43', '44', '421', '422', '423', '424', '425', '426', '427', '428', '499']

// Immobilisations incorporelles brut (charges immo + incorp: AQ+AR+AS+AD+AE+AF+AG)
const IMMO_INCORP = ['201', '202', '206', '211', '212', '213', '214', '215', '216', '217', '218', '219']
// Immobilisations corporelles brut (AJ+AK+AL+AM+AN+AP)
const IMMO_CORP = ['22', '231', '232', '233', '234', '235', '237', '238', '241', '242', '243', '244', '245', '251', '252']
// Immobilisations financières brut (AT+AU)
const IMMO_FIN = ['26', '271', '272', '273', '274', '275', '276', '277']

// Capital (CA)
const CAPITAL = ['101', '102', '103']
// Subventions d'investissement (CI)
const SUBV_INVEST = ['14']
// Emprunts et autres dettes financières — désormais en saisie manuelle (FO/FP/FQ)

const v = (n: number | null | undefined): number | null =>
  n == null || n === 0 ? null : n

// ── Saisies manuelles TFT ──

const STORAGE_KEY = 'tft_manual_entries'

interface TFTManualEntries {
  FJ: number
  FM: number
  FN: number
  FO: number
  FP: number
  FQ: number
}

const DEFAULT_MANUAL: TFTManualEntries = { FJ: 0, FM: 0, FN: 0, FO: 0, FP: 0, FQ: 0 }

function loadManualEntries(): TFTManualEntries {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_MANUAL, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_MANUAL }
}

function saveManualEntries(entries: TFTManualEntries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

const MANUAL_FIELDS: { key: keyof TFTManualEntries; label: string; hint: string }[] = [
  { key: 'FJ', label: 'FJ — Encaissements cessions immo financières', hint: 'Montant positif' },
  { key: 'FM', label: 'FM — Prélèvements sur le capital', hint: 'Montant négatif' },
  { key: 'FN', label: 'FN — Dividendes versés', hint: 'Montant négatif' },
  { key: 'FO', label: 'FO — Emprunts nouveaux', hint: 'Montant positif' },
  { key: 'FP', label: 'FP — Autres dettes financières diverses', hint: 'Montant positif ou négatif' },
  { key: 'FQ', label: 'FQ — Remboursements emprunts', hint: 'Montant négatif' },
]

/* ── Compute all TFT lines ── */

function computeTFT(bal: BalanceEntry[], balN1: BalanceEntry[], manual: TFTManualEntries = DEFAULT_MANUAL) {
  const hasN1 = balN1.length > 0

  // ── ZA: Trésorerie nette au 1er janvier ──
  // = Trésorerie actif N-1 - Trésorerie passif N-1
  const tresoActifN1 = hasN1 ? getActifBrut(balN1, TRESO_ACTIF) : 0
  const tresoPassifN1 = hasN1 ? getPassif(balN1, TRESO_PASSIF) : 0
  const ZA = tresoActifN1 - tresoPassifN1

  // ── FA: Capacité d'Autofinancement Globale (CAFG) ──
  // = Résultat net
  //   + Dotations amort/prov (681, 691, 697)
  //   - Reprises amort/prov (791, 797, 798, 799)
  //   + Valeurs comptables cessions (81)
  //   - Produits cessions (82)
  const totalCharges = getCharges(bal, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '81', '83', '85', '87', '89'])
  const totalProduits = getProduits(bal, ['70', '71', '72', '73', '75', '77', '78', '79', '82', '84', '86', '88'])
  const resultatNet = totalProduits - totalCharges

  const dotations = getCharges(bal, ['681', '691', '697'])
  const reprises = getProduits(bal, ['791', '797', '798', '799'])
  const vcCessions = getCharges(bal, ['81'])
  const prodCessions = getProduits(bal, ['82'])

  const FA = resultatNet + dotations - reprises + vcCessions - prodCessions

  // ── Variation lines (compare N vs N-1) ──
  // FB: Variation actif circulant HAO = -(BA_N - BA_N-1)
  const FB = hasN1 ? -(getActifBrut(bal, ACTIF_CIRC_HAO) - getActifBrut(balN1, ACTIF_CIRC_HAO)) : 0

  // FC: Variation des stocks = -(BB_N - BB_N-1)
  const FC = hasN1 ? -(getActifBrut(bal, STOCKS) - getActifBrut(balN1, STOCKS)) : 0

  // FD: Variation des créances = -(BG_N - BG_N-1)
  const FD = hasN1 ? -(getActifBrut(bal, CREANCES) - getActifBrut(balN1, CREANCES)) : 0

  // FE: Variation du passif circulant = DP_N - DP_N-1 (positive if increase)
  const FE = hasN1 ? getPassif(bal, PASSIF_CIRC) - getPassif(balN1, PASSIF_CIRC) : 0

  // ── ZB: Flux activités opérationnelles = FA+FB+FC+FD+FE ──
  const ZB = FA + FB + FC + FD + FE

  // ── Investment flows ──
  // FF: -(increase in immo incorporelles brut)
  const FF = hasN1 ? -(getActifBrut(bal, IMMO_INCORP) - getActifBrut(balN1, IMMO_INCORP)) : 0

  // FG: -(increase in immo corporelles brut)
  const FG = hasN1 ? -(getActifBrut(bal, IMMO_CORP) - getActifBrut(balN1, IMMO_CORP)) : 0

  // FH: -(increase in immo financières brut)
  const FH = hasN1 ? -(getActifBrut(bal, IMMO_FIN) - getActifBrut(balN1, IMMO_FIN)) : 0

  // FI: Produits cessions immo corp+incorp (compte 82)
  const FI = getProduits(bal, ['82'])

  // FJ: Encaissements cessions immo financières (saisie manuelle)
  const FJ = manual.FJ

  // ── ZC: Flux activités d'investissement = FF+FG+FH+FI+FJ ──
  const ZC = FF + FG + FH + FI + FJ

  // ── Financing flows - capitaux propres ──
  // FK: Augmentation capital = increase in CA
  const FK = hasN1 ? Math.max(getPassif(bal, CAPITAL) - getPassif(balN1, CAPITAL), 0) : 0

  // FL: Subventions d'investissement reçues = increase in CI
  const FL = hasN1 ? Math.max(getPassif(bal, SUBV_INVEST) - getPassif(balN1, SUBV_INVEST), 0) : 0

  // FM: Prélèvements sur le capital (saisie manuelle, négatif)
  const FM = manual.FM

  // FN: Dividendes versés (saisie manuelle, négatif)
  const FN = manual.FN

  // ── ZD: Flux capitaux propres = FK+FL+FM+FN ──
  const ZD = FK + FL + FM + FN

  // ── Financing flows - capitaux étrangers ──
  // FO: Emprunts nouveaux (saisie manuelle — la balance ne distingue pas emprunts vs remboursements)
  const FO = manual.FO

  // FP: Autres dettes financières diverses (saisie manuelle)
  const FP = manual.FP

  // FQ: Remboursements des emprunts (saisie manuelle, négatif)
  const FQ = manual.FQ

  // ── ZE: Flux capitaux étrangers = FO+FP+FQ ──
  const ZE = FO + FP + FQ

  // ── ZF: Flux activités de financement = ZD+ZE ──
  const ZF = ZD + ZE

  // ── ZG: Variation trésorerie nette = ZB+ZC+ZF ──
  const ZG = ZB + ZC + ZF

  // ── ZH: Trésorerie nette au 31 décembre = ZG+ZA ──
  const ZH = ZG + ZA

  return { ZA, FA, FB, FC, FD, FE, ZB, FF, FG, FH, FI, FJ, ZC, FK, FL, FM, FN, ZD, FO, FP, FQ, ZE, ZF, ZG, ZH }
}

/* ── Component ── */

const TFT: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const bal = balance
  const balN1 = balanceN1 || []
  const hasN1 = balN1.length > 0

  // Manual entries state
  const [manual, setManual] = useState<TFTManualEntries>(loadManualEntries)
  // P0-5: Panel open by default when manual values are missing
  const [formOpen, setFormOpen] = useState(() => { const saved = loadManualEntries(); return Object.values(saved).some(v => v === 0) })
  const [formDraft, setFormDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    // Init form draft from saved values
    const draft: Record<string, string> = {}
    for (const f of MANUAL_FIELDS) {
      draft[f.key] = manual[f.key] !== 0 ? String(manual[f.key]) : ''
    }
    setFormDraft(draft)
  }, [manual])

  const handleSave = useCallback(() => {
    const updated = { ...manual }
    for (const f of MANUAL_FIELDS) {
      const val = parseFloat((formDraft[f.key] || '0').replace(/\s/g, '').replace(',', '.'))
      updated[f.key] = isNaN(val) ? 0 : val
    }
    setManual(updated)
    saveManualEntries(updated)
    setFormOpen(false)
  }, [formDraft, manual])

  // Compute N (needs N-1 for variations)
  const n = computeTFT(bal, balN1, manual)

  // Compute N-1 column (uses empty [] as its own previous year)
  const p = hasN1 ? computeTFT(balN1, []) : null

  const lines: { ref: string; label: string; note: string; valN: number | null; valN1: number | null; isTotal?: boolean }[] = [
    { ref: 'ZA', label: 'Trésorerie nette au 1er janvier (= Trésorerie actif N-1 - Trésorerie passif N-1)', note: 'A', valN: v(n.ZA), valN1: p ? v(p.ZA) : null, isTotal: true },
    { ref: 'FA', label: "Capacité d'Autofinancement Globale (CAFG)", note: '', valN: v(n.FA), valN1: p ? v(p.FA) : null },
    { ref: 'FB', label: "- Variation d'actif circulant HAO", note: '', valN: v(n.FB), valN1: p ? v(p.FB) : null },
    { ref: 'FC', label: '- Variation des stocks', note: '', valN: v(n.FC), valN1: p ? v(p.FC) : null },
    { ref: 'FD', label: '- Variation des créances', note: '', valN: v(n.FD), valN1: p ? v(p.FD) : null },
    { ref: 'FE', label: '+ Variation du passif circulant', note: '', valN: v(n.FE), valN1: p ? v(p.FE) : null },
    { ref: 'ZB', label: 'Flux de trésorerie provenant des activités opérationnelles (Somme FA à FE)', note: 'B', valN: v(n.ZB), valN1: p ? v(p.ZB) : null, isTotal: true },
    { ref: 'FF', label: "- Décaissements liés aux acquisitions d'immobilisations incorporelles", note: '', valN: v(n.FF), valN1: p ? v(p.FF) : null },
    { ref: 'FG', label: "- Décaissements liés aux acquisitions d'immobilisations corporelles", note: '', valN: v(n.FG), valN1: p ? v(p.FG) : null },
    { ref: 'FH', label: "- Décaissements liés aux acquisitions d'immobilisations financières", note: '', valN: v(n.FH), valN1: p ? v(p.FH) : null },
    { ref: 'FI', label: "+ Encaissements liés aux cessions d'immobilisations incorporelles et corporelles", note: '', valN: v(n.FI), valN1: p ? v(p.FI) : null },
    { ref: 'FJ', label: '+ Encaissements liés aux cessions d\'immobilisations financières', note: '', valN: v(n.FJ), valN1: p ? v(p.FJ) : null },
    { ref: 'ZC', label: "Flux de trésorerie provenant des activités d'investissement (somme FF à FJ)", note: 'C', valN: v(n.ZC), valN1: p ? v(p.ZC) : null, isTotal: true },
    { ref: 'FK', label: '+ Augmentations de capital par apports nouveaux', note: '', valN: v(n.FK), valN1: p ? v(p.FK) : null },
    { ref: 'FL', label: "+ Subventions d'investissement reçues", note: '', valN: v(n.FL), valN1: p ? v(p.FL) : null },
    { ref: 'FM', label: '- Prélèvements sur le capital', note: '', valN: v(n.FM), valN1: p ? v(p.FM) : null },
    { ref: 'FN', label: '- Dividendes versés', note: '', valN: v(n.FN), valN1: p ? v(p.FN) : null },
    { ref: 'ZD', label: 'Flux de trésorerie provenant des capitaux propres (somme FK à FN)', note: 'D', valN: v(n.ZD), valN1: p ? v(p.ZD) : null, isTotal: true },
    { ref: 'FO', label: '+ Emprunts', note: '', valN: v(n.FO), valN1: p ? v(p.FO) : null },
    { ref: 'FP', label: '+ Autres dettes financières diverses', note: '', valN: v(n.FP), valN1: p ? v(p.FP) : null },
    { ref: 'FQ', label: '- Remboursements des emprunts et autres dettes financières', note: '', valN: v(n.FQ), valN1: p ? v(p.FQ) : null },
    { ref: 'ZE', label: 'Flux de trésorerie provenant des capitaux étrangers (somme FO à FQ)', note: 'E', valN: v(n.ZE), valN1: p ? v(p.ZE) : null, isTotal: true },
    { ref: 'ZF', label: 'Flux de trésorerie provenant des activités de financement (D+E)', note: 'F', valN: v(n.ZF), valN1: p ? v(p.ZF) : null, isTotal: true },
    { ref: 'ZG', label: 'VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE (B+C+F)', note: 'G', valN: v(n.ZG), valN1: p ? v(p.ZG) : null, isTotal: true },
    { ref: 'ZH', label: 'Trésorerie nette au 31 Décembre (G+A)', note: 'H', valN: v(n.ZH), valN1: p ? v(p.ZH) : null, isTotal: true },
  ]

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'TABLEAU DES FLUX DE TRÉSORERIE', width: '50%' },
    { key: 'note', label: 'Note', width: 30, align: 'center' },
    { key: 'valN', label: 'Exercice N', align: 'right' },
    { key: 'valN1', label: 'Exercice N-1', align: 'right' },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      valN: r.valN,
      valN1: r.valN1,
    },
    isTotal: r.isTotal,
    bold: r.isTotal,
  }))

  const hasManualValues = Object.values(manual).some(v => v !== 0)

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="11" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        TABLEAU DES FLUX DE TRÉSORERIE
      </Typography>

      {/* P0-2: Alert when TFT manual entries are missing */}
      {balance.length > 0 && (['FO', 'FP', 'FQ', 'FM', 'FN', 'FJ'] as const).some(k => manual[k] === 0) && (
        <Alert severity="warning" sx={{ mb: 1.5, '@media print': { display: 'none' } }}>
          6 lignes du TFT nécessitent une saisie manuelle (FM, FN, FJ, FO, FP, FQ). Le tableau des flux sera incomplet sans ces valeurs.
        </Alert>
      )}

      {/* ── Formulaire de saisie manuelle ── */}
      <Paper variant="outlined" sx={{ mb: 1.5, '@media print': { display: 'none' } }}>
        <Box
          onClick={() => setFormOpen(!formOpen)}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.5, py: 0.75, cursor: 'pointer',
            bgcolor: hasManualValues ? '#eff6ff' : 'grey.50',
            '&:hover': { bgcolor: hasManualValues ? '#dbeafe' : 'grey.100' },
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
            Saisies manuelles TFT
            {hasManualValues && (
              <Typography component="span" sx={{ fontSize: 10, color: 'primary.main', ml: 1 }}>
                ({Object.values(manual).filter(v => v !== 0).length} valeur(s) saisie(s))
              </Typography>
            )}
          </Typography>
          <IconButton size="small" sx={{ p: 0.25 }}>
            {formOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>

        <Collapse in={formOpen}>
          <Box sx={{ px: 1.5, py: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {MANUAL_FIELDS.map(f => (
              <TextField
                key={f.key}
                label={f.label}
                helperText={f.hint}
                size="small"
                type="text"
                inputMode="numeric"
                value={formDraft[f.key] || ''}
                onChange={e => setFormDraft(prev => ({ ...prev, [f.key]: e.target.value }))}
                InputProps={{ sx: { fontSize: 12, fontFamily: 'inherit' } }}
                InputLabelProps={{ sx: { fontSize: 11 } }}
                FormHelperTextProps={{ sx: { fontSize: 9 } }}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#fff' } }}
              />
            ))}
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" onClick={() => setFormOpen(false)} sx={{ fontSize: 11 }}>
                Annuler
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
                onClick={handleSave}
                sx={{ fontSize: 11 }}
              >
                Enregistrer
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default TFT
