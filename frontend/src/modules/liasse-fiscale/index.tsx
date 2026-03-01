import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box, CircularProgress, Typography, Button, Chip, Paper, IconButton, Alert,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Send as SendIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ChevronRight,
  ChevronLeft,
  TableChart as ExcelIcon,
  FactCheck as ControleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { getWorkflowState } from '@/services/workflowStateService'
import type { WorkflowState } from '@/services/workflowStateService'
import LiasseNav from './components/LiasseNav'
import LiassePage from './components/LiassePage'
import LiasseStats from './components/LiasseStats'
import { LiasseRegimeContext } from './components/LiasseHeader'
import { PAGES } from './config'
import type { EntrepriseData, BalanceEntry, RegimeImposition } from './types'
import { NOTE_TO_PAGE_ID } from './types'
import { exporterLiasse } from './services/liasse-export-excel'

const EMPTY_ENTREPRISE: EntrepriseData = {
  denomination: '', sigle: '', adresse: '', ncc: '', ntd: '',
  exercice_clos: '', exercice_precedent_fin: '', duree_mois: 12,
  regime: '', forme_juridique: '', code_forme_juridique: '',
  code_regime: '', code_pays: '', centre_depot: '', ville: '',
  boite_postale: '', capital_social: 0, nom_dirigeant: '',
  fonction_dirigeant: '', greffe: '', numero_repertoire_entites: '',
  numero_caisse_sociale: '', numero_code_importateur: '',
  code_ville: '', pourcentage_capacite_production: 0,
  branche_activite: '', code_secteur: '', nombre_etablissements: 0,
  effectif_permanent: 0, effectif_temporaire: 0,
  effectif_debut: 0, effectif_fin: 0, masse_salariale: 0,
  nom_groupe: '', pays_siege_groupe: '',
  cac_nom: '', cac_adresse: '', cac_numero_inscription: '',
  expert_nom: '', expert_adresse: '', expert_numero_inscription: '',
  personne_contact: '', etats_financiers_approuves: false,
  date_signature_etats: '', domiciliations_bancaires: [],
  dirigeants: [], commissaires_comptes: [], participations_filiales: [],
}

const loadEntreprise = (): EntrepriseData => {
  const keys = ['fiscasync_entreprise_settings', 'fiscasync_db_entreprise_settings']
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const e = Array.isArray(parsed) ? parsed[0] : parsed
      if (!e) continue
      console.log(`[Liasse] Entreprise loaded from "${key}"`, e.raison_sociale || e.denomination || '(sans nom)')
      return {
        denomination: e.raison_sociale || e.denomination || '',
        sigle: e.sigle || '',
        adresse: [e.adresse_ligne1, e.adresse_ligne2, e.ville].filter(Boolean).join(' - '),
        ncc: e.numero_contribuable || '',
        ntd: e.numero_teledeclarant || '',
        exercice_clos: e.exercice_fin || e.date_arrete_comptes || '',
        exercice_precedent_fin: e.exercice_precedent_fin || '',
        duree_mois: e.duree_exercice_precedent || 12,
        regime: e.regime_imposition || 'Reel normal',
        forme_juridique: e.forme_juridique || '',
        code_forme_juridique: e.code_forme_juridique || '01',
        code_regime: e.code_regime || '1',
        code_pays: e.code_pays || '03',
        centre_depot: e.centre_impots || '',
        ville: e.ville || '',
        boite_postale: e.boite_postale || '',
        capital_social: e.capital_social || 0,
        nom_dirigeant: e.nom_dirigeant || '',
        fonction_dirigeant: e.fonction_dirigeant || '',
        greffe: e.greffe || '',
        numero_repertoire_entites: e.numero_repertoire_entites || '',
        numero_caisse_sociale: e.numero_caisse_sociale || '',
        numero_code_importateur: e.numero_code_importateur || '',
        code_ville: e.code_ville || '',
        pourcentage_capacite_production: e.pourcentage_capacite_production || 0,
        branche_activite: e.branche_activite || '',
        code_secteur: e.code_secteur || '',
        nombre_etablissements: e.nombre_etablissements || 0,
        effectif_permanent: e.effectif_permanent || 0,
        effectif_temporaire: e.effectif_temporaire || 0,
        effectif_debut: e.effectif_debut || 0,
        effectif_fin: e.effectif_fin || 0,
        masse_salariale: e.masse_salariale || 0,
        nom_groupe: e.nom_groupe || '',
        pays_siege_groupe: e.pays_siege_groupe || '',
        cac_nom: e.cac_nom || '',
        cac_adresse: e.cac_adresse || '',
        cac_numero_inscription: e.cac_numero_inscription || '',
        expert_nom: e.expert_nom || '',
        expert_adresse: e.expert_adresse || '',
        expert_numero_inscription: e.expert_numero_inscription || '',
        personne_contact: e.personne_contact || '',
        etats_financiers_approuves: e.etats_financiers_approuves || false,
        date_signature_etats: e.date_signature_etats || '',
        domiciliations_bancaires: e.domiciliations_bancaires || [],
        dirigeants: e.dirigeants || [],
        commissaires_comptes: e.commissaires_comptes || [],
        participations_filiales: e.participations_filiales || [],
      }
    } catch { /* try next key */ }
  }
  console.warn('[Liasse] Aucune donnée entreprise trouvée dans localStorage')
  return EMPTY_ENTREPRISE
}

const parseEntries = (entries: unknown[]): BalanceEntry[] =>
  entries.map((item: unknown) => {
    const e = item as Record<string, unknown>
    return {
    compte: String(e.compte || ''),
    libelle: String(e.intitule || e.libelle || e.libelle_compte || ''),
    debit: Number(e.debit) || 0,
    credit: Number(e.credit) || 0,
    solde_debit: Number(e.solde_debit) || 0,
    solde_credit: Number(e.solde_credit) || 0,
  }
  })

const loadBalanceN1 = (): BalanceEntry[] => {
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest_n1')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entries) && stored.entries.length > 0) {
        console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_latest_n1": ${stored.entries.length} comptes`)
        return parseEntries(stored.entries)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_latest')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entriesN1) && stored.entriesN1.length > 0) {
        console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_latest.entriesN1": ${stored.entriesN1.length} comptes`)
        return parseEntries(stored.entriesN1)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_list')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 1) {
        const entries = list[1]?.entries
        if (Array.isArray(entries) && entries.length > 0) {
          console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_list[1]": ${entries.length} comptes`)
          return parseEntries(entries)
        }
      }
    }
  } catch { /* ignore */ }

  console.warn('[Liasse] Aucune balance N-1 trouvée')
  return []
}

const loadBalance = (): BalanceEntry[] => {
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entries) && stored.entries.length > 0) {
        console.log(`[Liasse] Balance loaded from "fiscasync_balance_latest": ${stored.entries.length} comptes`)
        return parseEntries(stored.entries)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_list')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        const entries = list[0]?.entries
        if (Array.isArray(entries) && entries.length > 0) {
          console.log(`[Liasse] Balance loaded from "fiscasync_balance_list[0]": ${entries.length} comptes`)
          return parseEntries(entries)
        }
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_db_balance_entries')
    if (raw) {
      const items = JSON.parse(raw)
      if (Array.isArray(items) && items.length > 0) {
        console.log(`[Liasse] Balance loaded from "fiscasync_db_balance_entries": ${items.length} comptes`)
        return parseEntries(items)
      }
    }
  } catch { /* ignore */ }

  console.warn('[Liasse] Aucune balance trouvée dans localStorage. Clés cherchées: fiscasync_balance_latest, fiscasync_balance_list, fiscasync_db_balance_entries')
  return []
}

const detectRegime = (entreprise: EntrepriseData): RegimeImposition => {
  const r = (entreprise.regime || '').toLowerCase()
  if (r.includes('simplif') || r.includes('allege') || r.includes('allég')) return 'REEL_SIMPLIFIE'
  if (r.includes('forfait')) return 'FORFAITAIRE'
  if (r.includes('micro')) return 'MICRO_ENTREPRISE'
  if (r.includes('smt') || r.includes('minimal')) return 'SMT'
  return 'REEL_NORMAL'
}

const SIDEBAR_TRANSITION = 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)'
const COLLAPSED_WIDTH = 40

const LiasseFiscaleModule: React.FC = () => {
  const navigate = useNavigate()
  const [currentPageId, setCurrentPageId] = useState(PAGES[0].id)
  const [entreprise, setEntreprise] = useState<EntrepriseData>(EMPTY_ENTREPRISE)
  const [balance, setBalance] = useState<BalanceEntry[]>([])
  const [balanceN1, setBalanceN1] = useState<BalanceEntry[]>([])
  const [regime, setRegime] = useState<RegimeImposition>('REEL_NORMAL')
  const [zoom, setZoom] = useState(100)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)

  useEffect(() => {
    const ent = loadEntreprise()
    const bal = loadBalance()
    const balN1 = loadBalanceN1()
    setEntreprise(ent)
    setBalance(bal)
    setBalanceN1(balN1)
    setRegime(detectRegime(ent))
    setWorkflowState(getWorkflowState())
  }, [])

  const handleFocus = useCallback(() => {
    const ent = loadEntreprise()
    const bal = loadBalance()
    const balN1 = loadBalanceN1()
    setEntreprise(ent)
    setBalance(bal)
    setBalanceN1(balN1)
  }, [])

  useEffect(() => {
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [handleFocus])

  const currentPage = useMemo(
    () => PAGES.find(p => p.id === currentPageId) || PAGES[0],
    [currentPageId]
  )

  const PageComponent = currentPage.component

  const handleNoteClick = useCallback((noteNumber: string) => {
    const pageId = NOTE_TO_PAGE_ID[noteNumber.toUpperCase()] || NOTE_TO_PAGE_ID[noteNumber]
    if (pageId) {
      setCurrentPageId(pageId)
    }
  }, [])

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 10, 200)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 10, 50)), [])
  const handleZoomReset = useCallback(() => setZoom(100), [])

  const handleExportExcel = useCallback(() => {
    const dateFin = entreprise.exercice_clos || '31/12/2024'
    const annee = parseInt(dateFin.slice(-4)) || 2024
    exporterLiasse(balance, balanceN1, entreprise, {
      annee,
      dateDebut: `01/01/${annee}`,
      dateFin,
      dureeMois: entreprise.duree_mois || 12,
    })
  }, [balance, balanceN1, entreprise])

  return (
    <LiasseRegimeContext.Provider value={regime}>
    <Box sx={{ display: 'flex', gap: 0, height: '100%', overflow: 'hidden', '@media print': { height: 'auto', overflow: 'visible' } }}>
      {/* ── Left sidebar ── */}
      <Box sx={{
        width: leftOpen ? 280 : COLLAPSED_WIDTH,
        minWidth: leftOpen ? 280 : COLLAPSED_WIDTH,
        transition: SIDEBAR_TRANSITION,
        overflow: 'hidden',
        flexShrink: 0,
        '@media print': { display: 'none' },
      }}>
        {leftOpen ? (
          <LiasseNav
            currentPageId={currentPageId}
            onPageSelect={setCurrentPageId}
            regime={regime}
            onRegimeChange={setRegime}
            onCollapse={() => setLeftOpen(false)}
          />
        ) : (
          <Box
            onClick={() => setLeftOpen(true)}
            sx={{
              width: COLLAPSED_WIDTH,
              height: '100%',
              bgcolor: '#171717',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1.5,
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#262626' },
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronRight sx={{ fontSize: 18, color: '#a3a3a3' }} />
            <Typography sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#a3a3a3',
              letterSpacing: 1,
              mt: 1,
            }}>
              Navigation
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ flexGrow: 1, minWidth: 0, mx: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Paper
          elevation={1}
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 2,
            '@media print': { display: 'none' },
          }}
        >
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: P.primary600, fontWeight: 500, fontSize: '0.78rem', minWidth: 0, '&:hover': { bgcolor: 'grey.100' } }}
          >
            Retour
          </Button>

          <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>
            {entreprise.denomination || 'Liasse Fiscale'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {entreprise.exercice_clos ? `Ex. ${entreprise.exercice_clos}` : ''}
          </Typography>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`${currentPage.numero}/84`} size="small" sx={{ bgcolor: 'text.primary', color: P.white, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
            <Chip label={regime.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />
            {balance.length > 0 && (
              <Chip label={`${balance.length} comptes`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />
            )}

            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

            {/* Zoom controls */}
            <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50} sx={{ p: 0.5 }}>
              <ZoomOutIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Chip
              label={`${zoom}%`}
              size="small"
              onClick={handleZoomReset}
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                height: 22,
                cursor: 'pointer',
                bgcolor: zoom !== 100 ? '#e5e5e5' : 'transparent',
                '&:hover': { bgcolor: '#d4d4d4' },
              }}
            />
            <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200} sx={{ p: 0.5 }}>
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

            <Button size="small" variant="outlined" startIcon={<ControleIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/validation-liasse')} sx={{ minWidth: 0, fontSize: '0.75rem', fontWeight: 600 }}>Contrôle</Button>
            <Button size="small" startIcon={<ExcelIcon sx={{ fontSize: 16 }} />} onClick={handleExportExcel} sx={{ minWidth: 0, fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Excel</Button>
            <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()} sx={{ minWidth: 0, fontSize: '0.75rem' }}>PDF</Button>
            <Button size="small" startIcon={<PrintIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()} sx={{ minWidth: 0, fontSize: '0.75rem' }}>Imprimer</Button>
            <Button size="small" startIcon={<SendIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/teledeclaration')} sx={{ minWidth: 0, fontSize: '0.75rem' }}>Envoyer</Button>
          </Box>
        </Paper>

        {/* Controle status banner */}
        {workflowState && (
          <Box sx={{ mb: 1, '@media print': { display: 'none' } }}>
            {workflowState.controleDone && workflowState.controleResult === 'passed' && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ py: 0.25 }}
                action={<Chip label={`${workflowState.controleScore}/100`} size="small" color="success" sx={{ fontWeight: 700 }} />}>
                Controle de coherence valide
              </Alert>
            )}
            {workflowState.controleDone && workflowState.controleResult === 'passed_with_warnings' && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ py: 0.25 }}
                action={<Chip label={`${workflowState.controleScore}/100`} size="small" color="warning" sx={{ fontWeight: 700 }} />}>
                Controle valide avec avertissements
              </Alert>
            )}
            {workflowState.controleDone && workflowState.controleResult === 'failed' && (
              <Alert severity="error" sx={{ py: 0.25 }}
                action={
                  <Button size="small" color="inherit" onClick={() => navigate('/validation-liasse')}>
                    Voir les bloquants
                  </Button>
                }>
                {workflowState.controleBloquants} controle(s) bloquant(s) — Score: {workflowState.controleScore}/100
              </Alert>
            )}
            {!workflowState.controleDone && (
              <Alert severity="info" sx={{ py: 0.25 }}
                action={
                  <Button size="small" color="inherit" onClick={() => navigate('/validation-liasse')}>
                    Lancer le controle
                  </Button>
                }>
                Controle de coherence non lance
              </Alert>
            )}
          </Box>
        )}

        {/* Page content */}
        <Paper sx={{ p: 0, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
          <Box sx={{ textAlign: 'center', py: 0.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', '@media print': { display: 'none' } }}>
            <Typography variant="caption" color="text.secondary">
              {currentPage.ongletExcel}
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={32} />
              </Box>
            }>
              <LiassePage orientation={currentPage.orientation} zoom={zoom}>
                <PageComponent entreprise={entreprise} balance={balance} balanceN1={balanceN1} regime={regime} onNoteClick={handleNoteClick} />
              </LiassePage>
            </Suspense>
          </Box>
        </Paper>
      </Box>

      {/* ── Right sidebar ── */}
      <Box sx={{
        width: rightOpen ? 300 : COLLAPSED_WIDTH,
        minWidth: rightOpen ? 300 : COLLAPSED_WIDTH,
        transition: SIDEBAR_TRANSITION,
        overflow: 'hidden',
        flexShrink: 0,
        '@media print': { display: 'none' },
      }}>
        {rightOpen ? (
          <LiasseStats
            currentPage={currentPage}
            entreprise={entreprise}
            balance={balance}
            balanceN1={balanceN1}
            onCollapse={() => setRightOpen(false)}
          />
        ) : (
          <Box
            onClick={() => setRightOpen(true)}
            sx={{
              width: COLLAPSED_WIDTH,
              height: '100%',
              bgcolor: '#fafafa',
              border: '1px solid #e5e5e5',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1.5,
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f0f0f0' },
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronLeft sx={{ fontSize: 18, color: '#737373' }} />
            <Typography sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#737373',
              letterSpacing: 1,
              mt: 1,
            }}>
              Statistiques
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
    </LiasseRegimeContext.Provider>
  )
}

export default LiasseFiscaleModule
