/**
 * Interface de Contrôle de Liasse Fiscale — Rapport d'Audit Complet
 * Score gauge, résumé exécutif, plan d'action, contrôles détaillés
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
  Drawer,
} from '@mui/material'
import {
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PlayArrow as RunIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowForwardIcon,
  FileDownload as ExportIcon,
  Gavel as LegalIcon,
  Lightbulb as SuggestionIcon,
  AccountBalance as FiscalIcon,
  History as HistoryIcon,
  Archive as ArchiveIcon,
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material'

import { auditOrchestrator, reportGenerator } from '@/services/audit'
import { getAllSessions } from '@/services/audit/auditStorage'
import type { SessionAudit, Severite, NiveauControle, ResultatControle } from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'
import { updateWorkflowState } from '@/services/workflowStateService'
import type { BalanceEntry } from '@/services/liasseDataService'

const SEVERITE_CONFIG: Record<Severite, { color: string; label: string; bg: string }> = {
  BLOQUANT: { color: '#dc2626', label: 'Bloquant', bg: '#fef2f2' },
  MAJEUR: { color: '#ea580c', label: 'Majeur', bg: '#fff7ed' },
  MINEUR: { color: '#d97706', label: 'Mineur', bg: '#fffbeb' },
  INFO: { color: '#3b82f6', label: 'Info', bg: '#eff6ff' },
  OK: { color: '#16a34a', label: 'OK', bg: '#f0fdf4' },
}

interface BalanceData {
  entries: BalanceEntry[]
  entriesN1?: BalanceEntry[]
  version?: number
  exercice?: string
  fileName?: string
}

function loadBalanceFromStorage(): BalanceData | null {
  // Try fiscasync_balance_latest first
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.entries) && parsed.entries.length > 0) {
        const result: BalanceData = {
          entries: parsed.entries,
          version: parsed.version || 1,
          exercice: parsed.exercice,
          fileName: parsed.fileName,
        }
        // Check for embedded N-1
        if (Array.isArray(parsed.entriesN1) && parsed.entriesN1.length > 0) {
          result.entriesN1 = parsed.entriesN1
        }
        return result
      }
    }
  } catch { /* next */ }

  // Try fiscasync_balance_list
  try {
    const raw = localStorage.getItem('fiscasync_balance_list')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0 && Array.isArray(list[0]?.entries) && list[0].entries.length > 0) {
        const result: BalanceData = {
          entries: list[0].entries,
          version: list[0].version || 1,
          exercice: list[0].exercice,
          fileName: list[0].fileName,
        }
        if (Array.isArray(list[0].entriesN1) && list[0].entriesN1.length > 0) {
          result.entriesN1 = list[0].entriesN1
        }
        return result
      }
    }
  } catch { /* next */ }

  return null
}

function loadBalanceN1FromStorage(): BalanceEntry[] | undefined {
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest_n1')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.entries) && parsed.entries.length > 0) return parsed.entries
    }
  } catch { /* ignore */ }
  return undefined
}

// --- Score Gauge Component ---
const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 140 }) => {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 90 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626'
  const label = score >= 90 ? 'Conforme' : score >= 70 ? 'A corriger' : 'Non conforme'

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e5e5" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{score}</Typography>
        <Typography variant="caption" sx={{ color: '#737373', fontWeight: 600, fontSize: '0.6rem' }}>/100</Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.6rem', mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  )
}

// --- Control Card Component ---
const ControlCard: React.FC<{ result: ResultatControle; selected?: boolean; onSelect?: (r: ResultatControle) => void }> = ({ result: r, selected, onSelect }) => {
  const cfg = SEVERITE_CONFIG[r.severite]
  const isOk = r.statut === 'OK'
  const isNA = r.statut === 'NON_APPLICABLE'
  const clickable = !isOk && !isNA && !!onSelect

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: selected ? cfg.color : isOk ? '#e5e5e5' : `${cfg.color}30`,
        borderLeft: `4px solid ${cfg.color}`,
        mb: 1,
        bgcolor: selected ? cfg.bg : 'white',
        transition: 'all 0.2s',
        '&:hover': clickable ? { bgcolor: cfg.bg, borderColor: `${cfg.color}60` } : {},
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, cursor: clickable ? 'pointer' : 'default', gap: 1.5 }}
        onClick={() => clickable && onSelect(r)}
      >
        {/* Status icon */}
        {isOk ? (
          <ValidIcon sx={{ color: '#16a34a', fontSize: 18, flexShrink: 0 }} />
        ) : r.severite === 'BLOQUANT' || r.severite === 'MAJEUR' ? (
          <ErrorIcon sx={{ color: cfg.color, fontSize: 18, flexShrink: 0 }} />
        ) : (
          <WarningIcon sx={{ color: cfg.color, fontSize: 18, flexShrink: 0 }} />
        )}

        {/* Ref */}
        <Typography variant="caption" fontWeight={700} fontFamily="monospace" sx={{ color: '#525252', minWidth: 55 }}>
          {r.ref}
        </Typography>

        {/* Name + short message */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={isOk ? 400 : 600} sx={{ color: isOk ? '#737373' : '#171717' }} noWrap>
            {r.nom}
          </Typography>
          {!isOk && r.message && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {r.message}
            </Typography>
          )}
        </Box>

        {/* Level chip */}
        <Chip label={`N${r.niveau}`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18, minWidth: 30 }} />

        {/* Severity chip */}
        <Chip
          label={cfg.label}
          size="small"
          sx={{ bgcolor: `${cfg.color}15`, color: cfg.color, fontWeight: 600, fontSize: '0.6rem', height: 20, minWidth: 60 }}
        />

        {/* Arrow indicator for clickable */}
        {clickable && (
          <ArrowForwardIcon sx={{ fontSize: 14, color: '#a3a3a3' }} />
        )}
      </Box>
    </Paper>
  )
}

// --- Anomaly Detail Sidebar ---
const SIDEBAR_WIDTH = 420

const AnomalyDetailSidebar: React.FC<{
  anomaly: ResultatControle | null
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  currentIndex?: number
  totalCount?: number
}> = ({ anomaly, onClose, onNavigate, currentIndex, totalCount }) => {
  if (!anomaly) return null
  const r = anomaly
  const cfg = SEVERITE_CONFIG[r.severite]

  return (
    <Drawer
      anchor="right"
      open={!!anomaly}
      onClose={onClose}
      variant="persistent"
      slotProps={{ backdrop: { invisible: true } }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#ffffff',
          borderLeft: `3px solid ${cfg.color}`,
          boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: cfg.bg, borderBottom: '1px solid #e5e5e5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {r.severite === 'BLOQUANT' || r.severite === 'MAJEUR' ? (
                <ErrorIcon sx={{ color: cfg.color, fontSize: 20 }} />
              ) : (
                <WarningIcon sx={{ color: cfg.color, fontSize: 20 }} />
              )}
              <Chip
                label={cfg.label}
                size="small"
                sx={{ bgcolor: `${cfg.color}20`, color: cfg.color, fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Chip label={`Niveau ${r.niveau}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <Typography variant="caption" fontWeight={700} fontFamily="monospace" sx={{ color: '#525252', display: 'block', mb: 0.5 }}>
            {r.ref}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#171717', lineHeight: 1.3 }}>
            {r.nom}
          </Typography>
        </Box>

        {/* Navigation between anomalies */}
        {onNavigate && totalCount && totalCount > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            <IconButton size="small" onClick={() => onNavigate('prev')} disabled={currentIndex === 0}>
              <PrevIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {(currentIndex ?? 0) + 1} / {totalCount} anomalies
            </Typography>
            <IconButton size="small" onClick={() => onNavigate('next')} disabled={currentIndex === (totalCount - 1)}>
              <NextIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {/* Message */}
          {r.message && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                Diagnostic
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#171717', lineHeight: 1.6 }}>
                {r.message}
              </Typography>
            </Box>
          )}

          {/* Attendu / Constate */}
          {(r.details?.attendu || r.details?.constate) && (
            <Box sx={{ mb: 2.5 }}>
              <Grid container spacing={1.5}>
                {r.details?.attendu && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                        Attendu
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25, fontSize: '0.82rem' }}>{r.details.attendu}</Typography>
                    </Paper>
                  </Grid>
                )}
                {r.details?.constate && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                        Constate
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25, fontSize: '0.82rem' }}>{r.details.constate}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Ecart */}
          {r.details?.ecart !== undefined && r.details.ecart !== 0 && (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                Ecart
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#ea580c' }}>
                {r.details.ecart.toLocaleString('fr-FR')} FCFA
              </Typography>
            </Box>
          )}

          {/* Description */}
          {r.details?.description && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#525252', fontSize: '0.82rem', lineHeight: 1.7 }}>
                {r.details.description}
              </Typography>
            </Box>
          )}

          {/* Montants */}
          {r.details?.montants && Object.keys(r.details.montants).length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                Montants
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {Object.entries(r.details.montants).map(([key, val]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#525252' }}>{key}</Typography>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace" sx={{ fontSize: '0.8rem' }}>
                      {val.toLocaleString('fr-FR')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Accounts concerned */}
          {r.details?.comptes && r.details.comptes.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                Comptes concernes ({r.details.comptes.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                {r.details.comptes.map((c, i) => (
                  <Chip key={i} label={c} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 24, fontFamily: 'monospace' }} />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Suggestion */}
          {r.suggestion && (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <SuggestionIcon sx={{ fontSize: 18, color: '#3b82f6', mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                    Suggestion de correction
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25, color: '#1d4ed8', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {r.suggestion}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Legal reference */}
          {r.referenceReglementaire && (
            <Box sx={{ mb: 2.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <LegalIcon sx={{ fontSize: 16, color: '#737373', mt: 0.25, flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                  Reference reglementaire
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25, color: '#525252', fontStyle: 'italic', fontSize: '0.82rem' }}>
                  {r.referenceReglementaire}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Fiscal impact */}
          {r.details?.impactFiscal && (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FiscalIcon sx={{ fontSize: 18, color: '#ea580c', mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                    Impact fiscal
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25, color: '#ea580c', fontWeight: 500, fontSize: '0.82rem' }}>
                    {r.details.impactFiscal}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Corrective entries */}
          {r.ecrituresCorrectives && r.ecrituresCorrectives.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#737373', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
                Ecritures correctives proposees
              </Typography>
              {r.ecrituresCorrectives.map((ec, i) => (
                <Paper key={i} elevation={0} sx={{ mt: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} fontFamily="monospace" sx={{ fontSize: '0.72rem', color: '#525252' }}>
                    Journal {ec.journal} — {ec.date}
                  </Typography>
                  {ec.lignes.map((l, j) => (
                    <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, pl: 1 }}>
                      <Chip
                        label={l.sens === 'D' ? 'D' : 'C'}
                        size="small"
                        sx={{
                          fontSize: '0.6rem', height: 18, minWidth: 24, fontWeight: 700, fontFamily: 'monospace',
                          bgcolor: l.sens === 'D' ? '#dbeafe' : '#fce7f3',
                          color: l.sens === 'D' ? '#1d4ed8' : '#be185d',
                        }}
                      />
                      <Typography variant="caption" fontFamily="monospace" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        {l.compte}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.72rem', flex: 1 }} noWrap>
                        {l.libelle}
                      </Typography>
                      <Typography variant="caption" fontFamily="monospace" fontWeight={700} sx={{ fontSize: '0.72rem' }}>
                        {l.montant.toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

// --- Main Component ---
const LiasseControlInterface: React.FC = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionAudit | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterSeverite, setFilterSeverite] = useState<Severite | 'ALL'>('ALL')
  const [filterNiveau, setFilterNiveau] = useState<NiveauControle | -1>(-1)
  const [showOk, setShowOk] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [balanceMeta, setBalanceMeta] = useState<{ version?: number; exercice?: string; fileName?: string }>({})
  const [selectedAnomaly, setSelectedAnomaly] = useState<ResultatControle | null>(null)

  // Load last session on mount — only if a balance is currently imported
  useEffect(() => {
    const balData = loadBalanceFromStorage()
    if (balData) {
      setBalanceMeta({ version: balData.version, exercice: balData.exercice, fileName: balData.fileName })

      // Only show cached session if a balance is present
      try {
        const sessions = getAllSessions()
        if (sessions.length > 0) {
          const lastCompleted = sessions.find(s => s.statut === 'TERMINEE')
          if (lastCompleted) {
            setSession(lastCompleted)
          }
        }
      } catch { /* ignore */ }
    }
  }, [])

  // Audit history
  const auditHistory = useMemo(() => {
    try {
      return getAllSessions().filter(s => s.statut === 'TERMINEE').slice(0, 10)
    } catch { return [] }
  }, [session]) // re-compute after new audit

  const handleRunAudit = useCallback(async () => {
    setError(null)
    const balData = loadBalanceFromStorage()
    if (!balData || balData.entries.length === 0) {
      setError('Aucune balance trouvee. Importez une balance avant de lancer le controle.')
      return
    }

    const normalizeEntries = (entries: BalanceEntry[]) => entries.map(e => ({
      compte: String(e.compte || ''),
      intitule: String(e.intitule || (e as unknown as Record<string, unknown>).libelle || ''),
      debit: Number(e.debit) || 0,
      credit: Number(e.credit) || 0,
      solde_debit: Number(e.solde_debit) || 0,
      solde_credit: Number(e.solde_credit) || 0,
    }))

    const balanceN = normalizeEntries(balData.entries)

    // Load N-1 balance for year-over-year controls
    let balanceN1: BalanceEntry[] | undefined
    if (balData.entriesN1 && balData.entriesN1.length > 0) {
      balanceN1 = normalizeEntries(balData.entriesN1)
    } else {
      const n1 = loadBalanceN1FromStorage()
      if (n1 && n1.length > 0) balanceN1 = normalizeEntries(n1)
    }

    setBalanceMeta({ version: balData.version, exercice: balData.exercice, fileName: balData.fileName })
    setRunning(true)
    setProgress(0)
    setProgressLabel('Initialisation...')
    setSession(null)
    setSelectedAnomaly(null)

    try {
      const result = await auditOrchestrator.startPhase1Audit(
        balanceN, balanceN1, balData.exercice,
        {
          onProgress: (_niveau, index, total) => {
            setProgress(Math.round((index / Math.max(total, 1)) * 100))
          },
          onLevelStart: (niveau, nom) => {
            setProgressLabel(`Niveau ${niveau} : ${nom}`)
          },
          onLevelEnd: () => {},
          onComplete: () => { setProgress(100); setProgressLabel('Termine') },
        }
      )

      const fullResult = await auditOrchestrator.startPhase3Audit(
        balanceN, result,
        { onLevelStart: (niveau, nom) => { setProgressLabel(`Niveau ${niveau} : ${nom}`) } }
      )

      setSession(fullResult)

      const bloquants = fullResult.resume.bloquantsRestants || 0
      const score = fullResult.resume.scoreGlobal || 0
      updateWorkflowState({
        controleDone: true,
        controleScore: score,
        controleBloquants: bloquants,
        controleResult: bloquants > 0 ? 'failed' : score >= 90 ? 'passed' : 'passed_with_warnings',
      })
    } catch (err) {
      setError(`Erreur lors de l'audit : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setRunning(false)
    }
  }, [])

  const handleDeploy = useCallback(async (force = false) => {
    if (!session) return
    if (force && !window.confirm(`${session.resume.bloquantsRestants} controle(s) bloquant(s). Deployer quand meme ?`)) {
      return
    }
    setDeploying(true)
    try {
      // Archive the audit session
      await auditOrchestrator.archiveSession(session.id)
      // Update workflow state for generation
      updateWorkflowState({
        generationDone: true,
        generationDate: new Date().toISOString(),
      })
      navigate('/liasse-fiscale')
    } catch (err) {
      // Archive may fail if snapshot is missing — still navigate
      console.warn('Archive failed:', err)
      navigate('/liasse-fiscale')
    } finally {
      setDeploying(false)
    }
  }, [session, navigate])

  const filteredResults = useMemo(() => {
    if (!session) return []
    return session.resultats.filter(r => {
      if (!showOk && r.statut === 'OK' && filterSeverite !== 'OK') return false
      if (filterSeverite !== 'ALL' && r.severite !== filterSeverite) return false
      if (filterNiveau !== -1 && r.niveau !== filterNiveau) return false
      return true
    })
  }, [session, filterSeverite, filterNiveau, showOk])

  // Action plan: sorted by severity
  const actionPlan = useMemo(() => {
    if (!session) return []
    const order: Record<Severite, number> = { BLOQUANT: 0, MAJEUR: 1, MINEUR: 2, INFO: 3, OK: 4 }
    return session.resultats
      .filter(r => r.statut === 'ANOMALIE')
      .sort((a, b) => order[a.severite] - order[b.severite])
  }, [session])

  // Anomalies only (for sidebar navigation)
  const anomaliesOnly = useMemo(() => {
    return filteredResults.filter(r => r.statut === 'ANOMALIE')
  }, [filteredResults])

  const selectedAnomalyIndex = useMemo(() => {
    if (!selectedAnomaly) return -1
    return anomaliesOnly.findIndex(r => r.ref === selectedAnomaly.ref)
  }, [selectedAnomaly, anomaliesOnly])

  const handleSelectAnomaly = useCallback((r: ResultatControle) => {
    setSelectedAnomaly(r)
  }, [])

  const handleNavigateAnomaly = useCallback((direction: 'prev' | 'next') => {
    if (selectedAnomalyIndex === -1) return
    const newIndex = direction === 'prev' ? selectedAnomalyIndex - 1 : selectedAnomalyIndex + 1
    if (newIndex >= 0 && newIndex < anomaliesOnly.length) {
      setSelectedAnomaly(anomaliesOnly[newIndex])
    }
  }, [selectedAnomalyIndex, anomaliesOnly])

  const handleExportCSV = useCallback(() => {
    if (!session) return
    reportGenerator.downloadReport('csv', session, session.resultats)
  }, [session])

  const handleExportHTML = useCallback(() => {
    if (!session) return
    reportGenerator.downloadReport('html', session, session.resultats)
  }, [session])

  const getScoreColor = (score: number) => score >= 90 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626'

  return (
    <Box sx={{ maxWidth: selectedAnomaly ? 'none' : 1100, mx: 'auto', mr: selectedAnomaly ? `${SIDEBAR_WIDTH}px` : 'auto', transition: 'margin 0.3s ease' }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Rapport d'Audit de Liasse Fiscale
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Validation SYSCOHADA : {session ? session.resume.totalControles : '125+'} controles sur 9 niveaux
      </Typography>

      {/* Balance metadata banner */}
      {balanceMeta.exercice && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={`Exercice ${balanceMeta.exercice}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          {balanceMeta.version && balanceMeta.version > 1 && (
            <Chip label={`Version ${balanceMeta.version} (re-import)`} size="small" color="info" sx={{ fontWeight: 600 }} />
          )}
          {balanceMeta.fileName && (
            <Typography variant="caption" color="text.secondary">{balanceMeta.fileName}</Typography>
          )}
        </Box>
      )}

      {/* Re-import banner */}
      {balanceMeta.version && balanceMeta.version > 1 && !session && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Balance re-importee (V{balanceMeta.version}). Lancez le controle pour comparer avec la version precedente.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Launch button + progress */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<RunIcon />}
            onClick={handleRunAudit}
            disabled={running}
            sx={{ fontWeight: 600, px: 4, bgcolor: '#171717', '&:hover': { bgcolor: '#404040' } }}
          >
            {running ? 'Controle en cours...' : session ? 'Relancer le controle' : 'Lancer le controle'}
          </Button>

          {session && !running && (
            <>
              <Tooltip title="Exporter en HTML">
                <Button variant="outlined" size="small" startIcon={<ExportIcon />} onClick={handleExportHTML} sx={{ fontSize: '0.75rem' }}>
                  HTML
                </Button>
              </Tooltip>
              <Tooltip title="Exporter en CSV">
                <Button variant="outlined" size="small" startIcon={<ExportIcon />} onClick={handleExportCSV} sx={{ fontSize: '0.75rem' }}>
                  CSV
                </Button>
              </Tooltip>
            </>
          )}
        </Box>

        {running && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{progressLabel}</Typography>
              <Typography variant="caption" color="text.secondary">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}
      </Paper>

      {/* Results */}
      {session && (
        <>
          {/* Executive Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              {/* Score Gauge */}
              <Grid item xs={12} sm="auto">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreGauge score={session.resume.scoreGlobal} />
                </Box>
              </Grid>

              {/* Summary metrics */}
              <Grid item xs={12} sm>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Resume executif
                </Typography>
                <Grid container spacing={1}>
                  {(['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK'] as Severite[]).map(sev => {
                    const count = session.resume.parSeverite[sev] || 0
                    const cfg = SEVERITE_CONFIG[sev]
                    return (
                      <Grid item key={sev}>
                        <Box
                          onClick={() => setFilterSeverite(filterSeverite === sev ? 'ALL' : sev)}
                          sx={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            px: 2, py: 1,
                            borderRadius: 1.5,
                            border: filterSeverite === sev ? `2px solid ${cfg.color}` : '2px solid transparent',
                            bgcolor: count > 0 && sev !== 'OK' ? cfg.bg : 'transparent',
                            '&:hover': { bgcolor: cfg.bg },
                            transition: 'all 0.15s',
                          }}
                        >
                          <Typography variant="h5" fontWeight={800} sx={{ color: cfg.color, lineHeight: 1 }}>
                            {count}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} sx={{ color: cfg.color, fontSize: '0.65rem' }}>
                            {cfg.label}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>

                {/* Quick verdict */}
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: session.resume.bloquantsRestants > 0 ? '#fef2f2' : '#f0fdf4' }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: session.resume.bloquantsRestants > 0 ? '#dc2626' : '#16a34a' }}>
                    {session.resume.bloquantsRestants > 0
                      ? `${session.resume.bloquantsRestants} anomalie(s) bloquante(s) — Liasse non deployable en l'etat`
                      : session.resume.scoreGlobal >= 90
                        ? 'Liasse conforme — Prete pour deploiement'
                        : 'Liasse deployable avec reserves — Corrections recommandees'
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Plan (only if anomalies exist) */}
          {actionPlan.length > 0 && (
            <Paper sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Plan d'action ({actionPlan.length} anomalie{actionPlan.length > 1 ? 's' : ''})
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Corrections prioritaires classees par severite
              </Typography>
              {actionPlan.slice(0, 10).map((r, i) => {
                const cfg = SEVERITE_CONFIG[r.severite]
                return (
                  <Box
                    key={r.ref}
                    onClick={() => handleSelectAnomaly(r)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75,
                      borderBottom: i < 9 ? '1px solid #f5f5f5' : 'none',
                      cursor: 'pointer', borderRadius: 1, px: 0.5,
                      bgcolor: selectedAnomaly?.ref === r.ref ? cfg.bg : 'transparent',
                      '&:hover': { bgcolor: cfg.bg },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#a3a3a3', minWidth: 16, fontWeight: 600 }}>
                      {i + 1}.
                    </Typography>
                    <Chip label={cfg.label} size="small" sx={{ bgcolor: `${cfg.color}15`, color: cfg.color, fontWeight: 600, fontSize: '0.6rem', height: 18, minWidth: 55 }} />
                    <Typography variant="caption" fontWeight={700} fontFamily="monospace" sx={{ color: '#525252', minWidth: 50 }}>
                      {r.ref}
                    </Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.8rem' }} noWrap>
                      {r.nom}: {r.message}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#a3a3a3', flexShrink: 0 }} />
                  </Box>
                )
              })}
              {actionPlan.length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  ... et {actionPlan.length - 10} autre(s) anomalie(s)
                </Typography>
              )}
            </Paper>
          )}

          {/* Level filters */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight={700} sx={{ mr: 1, color: '#525252' }}>NIVEAUX:</Typography>
            <Chip
              label="Tous"
              size="small"
              variant={filterNiveau === -1 ? 'filled' : 'outlined'}
              onClick={() => setFilterNiveau(-1)}
              sx={{ fontWeight: 600 }}
            />
            {Object.entries(session.resume.parNiveau)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([niv, data]) => (
              <Chip
                key={niv}
                label={`N${niv}: ${NIVEAUX_NOMS[Number(niv) as NiveauControle] || niv} (${data.anomalies}/${data.total})`}
                size="small"
                variant={filterNiveau === Number(niv) ? 'filled' : 'outlined'}
                color={data.anomalies > 0 ? 'warning' : 'success'}
                onClick={() => setFilterNiveau(filterNiveau === Number(niv) ? -1 : Number(niv) as NiveauControle)}
              />
            ))}
          </Box>

          {/* Show OK toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredResults.length} controle{filteredResults.length > 1 ? 's' : ''} affiche{filteredResults.length > 1 ? 's' : ''}
              {filterSeverite !== 'ALL' || filterNiveau !== -1 ? ' (filtre)' : ''}
            </Typography>
            <Chip
              label={showOk ? 'Masquer OK' : 'Afficher OK'}
              size="small"
              variant={showOk ? 'filled' : 'outlined'}
              onClick={() => setShowOk(!showOk)}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Control Cards */}
          <Box>
            {filteredResults.map(r => (
              <ControlCard
                key={r.ref}
                result={r}
                selected={selectedAnomaly?.ref === r.ref}
                onSelect={handleSelectAnomaly}
              />
            ))}
          </Box>

          {/* Footer + Navigation */}
          <Paper sx={{ p: 2, mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {session.resume.bloquantsRestants === 0 ? (
              <Button
                variant="contained"
                color="success"
                size="large"
                endIcon={deploying ? undefined : <ArrowForwardIcon />}
                onClick={() => handleDeploy(false)}
                disabled={deploying}
                sx={{ fontWeight: 600 }}
              >
                {deploying ? 'Archivage...' : 'Deployer la liasse'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="warning"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleDeploy(true)}
                disabled={deploying}
                sx={{ fontWeight: 600 }}
              >
                Forcer ({session.resume.bloquantsRestants} bloquants)
              </Button>
            )}

            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/import-balance')}
              sx={{ fontSize: '0.75rem', color: '#525252' }}
            >
              Re-importer la balance
            </Button>

            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Score: <Typography component="span" fontWeight={700} sx={{ color: getScoreColor(session.resume.scoreGlobal) }}>{session.resume.scoreGlobal}/100</Typography>
            </Typography>
          </Paper>

          {/* Audit History */}
          {auditHistory.length > 1 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                onClick={() => setShowHistory(!showHistory)}
              >
                <HistoryIcon sx={{ fontSize: 18, color: '#737373' }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#525252' }}>
                  Historique des audits ({auditHistory.length})
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton size="small">
                  {showHistory ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Box>

              <Collapse in={showHistory}>
                <Divider sx={{ my: 1 }} />
                {auditHistory.map((s, i) => {
                  const isCurrent = s.id === session.id
                  const scoreColor = getScoreColor(s.resume.scoreGlobal)
                  return (
                    <Box
                      key={s.id}
                      onClick={() => !isCurrent && setSession(s)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, py: 1, px: 1,
                        cursor: isCurrent ? 'default' : 'pointer',
                        bgcolor: isCurrent ? '#f5f5f5' : 'transparent',
                        borderRadius: 1,
                        '&:hover': { bgcolor: isCurrent ? '#f5f5f5' : '#fafafa' },
                        borderBottom: i < auditHistory.length - 1 ? '1px solid #f5f5f5' : 'none',
                      }}
                    >
                      {isCurrent && <ArchiveIcon sx={{ fontSize: 14, color: '#3b82f6' }} />}
                      <Typography variant="caption" fontFamily="monospace" sx={{ color: '#737373', minWidth: 130 }}>
                        {s.dateDebut ? new Date(s.dateDebut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </Typography>
                      <Chip label={`${s.resume.scoreGlobal}/100`} size="small" sx={{ bgcolor: `${scoreColor}15`, color: scoreColor, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                      <Typography variant="caption" color="text.secondary">
                        {s.resume.totalControles} ctrl — {s.resume.bloquantsRestants} bloq.
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#a3a3a3' }}>
                        {s.exercice}
                      </Typography>
                      {isCurrent && <Chip label="actuel" size="small" variant="outlined" color="primary" sx={{ fontSize: '0.6rem', height: 16 }} />}
                    </Box>
                  )
                })}
              </Collapse>
            </Paper>
          )}
        </>
      )}
      {/* Anomaly Detail Sidebar */}
      <AnomalyDetailSidebar
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        onNavigate={handleNavigateAnomaly}
        currentIndex={selectedAnomalyIndex}
        totalCount={anomaliesOnly.length}
      />
    </Box>
  )
}

export default LiasseControlInterface
