/**
 * Module Audit & Controle - Moteur 108 points SYSCOHADA
 * 4 onglets: Tableau de bord, Anomalies, Rapport corrections, Historique
 */

import React, { useState, useCallback, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Alert,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  GetApp as ExportIcon,
  PlayArrow as PlayIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
} from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  setSession,
  startAudit,
  stopAudit,
  setAuditProgress,
  setAuditError,
} from '@/store/auditSlice'
import type {
  SessionAudit,
  ResultatControle,
  NiveauControle,
  Severite,
} from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'
import { auditOrchestrator } from '@/services/audit/auditOrchestrator'
import { getAllSessions } from '@/services/audit/auditStorage'
import { getLatestBalance, getLatestBalanceN1 } from '@/services/balanceStorageService'

import AuditProgressDialog from '@/components/audit/AuditProgressDialog'
import AuditResultsView from '@/components/audit/AuditResultsView'
import CorrectionReportView from '@/components/audit/CorrectionReportView'

// --- Composant principal ---

const ModernAudit: React.FC = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { currentSession, resultats, correctionReport, isRunning } = useAppSelector((s) => s.audit)

  const [activeTab, setActiveTab] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)
  const [progressResultats, setProgressResultats] = useState<ResultatControle[]>([])
  const [progressNiveau, setProgressNiveau] = useState<NiveauControle>(0)
  const [progressPct, setProgressPct] = useState(0)
  const cancelledRef = useRef(false)
  const [sessions, setSessions] = useState<SessionAudit[]>(() => getAllSessions())

  // Charger la balance importée (pas de fallback demo)
  const importedBalance = getLatestBalance()
  const importedBalanceN1 = getLatestBalanceN1()
  const balanceToAudit = importedBalance?.entries?.length
    ? importedBalance.entries
    : []
  const balanceN1ToAudit = importedBalanceN1?.entries?.length
    ? importedBalanceN1.entries
    : undefined
  const usingImported = !!(importedBalance?.entries?.length)
  const exerciceToAudit = importedBalance?.exercice || String(new Date().getFullYear())

  // Lancer l'audit Phase 1
  const handleStartAudit = useCallback(async () => {
    cancelledRef.current = false
    setProgressResultats([])
    setProgressNiveau(0)
    setProgressPct(0)
    setProgressOpen(true)
    dispatch(startAudit())

    try {
      const session = await auditOrchestrator.startPhase1Audit(
        balanceToAudit,
        balanceN1ToAudit,
        exerciceToAudit,
        {
          onProgress: (niveau, index, total, ref) => {
            setProgressNiveau(niveau)
            setProgressPct(Math.min(99, Math.round(((index + 1) / Math.max(total, 1)) * 100)))
            dispatch(setAuditProgress({ stage: `${ref}`, niveauCourant: niveau }))
          },
          onLevelStart: (niveau) => {
            setProgressNiveau(niveau)
          },
          onLevelEnd: (_niveau, res) => {
            setProgressResultats((prev) => [...prev, ...res])
          },
          onComplete: () => {
            setProgressPct(100)
          },
          isCancelled: () => cancelledRef.current,
        }
      )

      dispatch(setSession(session))
      dispatch(stopAudit())
      setSessions(getAllSessions())
    } catch (err) {
      dispatch(setAuditError(err instanceof Error ? err.message : 'Erreur inconnue'))
    }
  }, [dispatch, balanceToAudit, balanceN1ToAudit, exerciceToAudit])

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
    dispatch(stopAudit())
  }, [dispatch])

  // Couleurs severite
  const sevColors: Record<Severite, string> = {
    BLOQUANT: theme.palette.error.main,
    MAJEUR: theme.palette.warning.main,
    MINEUR: '#fbbf24',
    INFO: theme.palette.info.main,
    OK: theme.palette.success.main,
  }

  const resume = currentSession?.resume
  const score = resume?.scoreGlobal ?? 0

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children, value, index,
  }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Audit & Controles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Moteur de controles 108 points - SYSCOHADA Revise
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              disabled={!currentSession}
              onClick={() => {
                if (currentSession) {
                  import('@/services/audit/reportGenerator').then(({ reportGenerator }) => {
                    reportGenerator.downloadReport('html', currentSession, resultats)
                  })
                }
              }}
            >
              Rapport
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleStartAudit}
              disabled={isRunning}
            >
              Lancer l'audit
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Indicateur source des donnees */}
      {usingImported ? (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
          Audit sur votre balance importee — {balanceToAudit.length} comptes
          — Import du {new Date(importedBalance!.importDate).toLocaleDateString('fr-FR')}
          — Exercice {exerciceToAudit}
          {balanceN1ToAudit ? ` — N-1 disponible (${balanceN1ToAudit.length} comptes)` : ''}
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucune balance importee. Importez votre balance via le menu "Import Balance" pour lancer un audit.
        </Alert>
      )}

      {/* Metriques de synthese */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Bloquants', count: resume?.parSeverite.BLOQUANT ?? 0, color: sevColors.BLOQUANT, icon: <ErrorIcon /> },
          { label: 'Majeurs', count: resume?.parSeverite.MAJEUR ?? 0, color: sevColors.MAJEUR, icon: <WarningIcon /> },
          { label: 'Mineurs', count: resume?.parSeverite.MINEUR ?? 0, color: sevColors.MINEUR, icon: <WarningIcon /> },
          { label: 'Info', count: resume?.parSeverite.INFO ?? 0, color: sevColors.INFO, icon: <InfoIcon /> },
          { label: 'Score', count: score, color: score >= 80 ? sevColors.OK : score >= 50 ? sevColors.MINEUR : sevColors.BLOQUANT, icon: <TrendingUpIcon />, suffix: '%' },
        ].map(({ label, count, color, icon, suffix }) => (
          <Grid item xs={6} sm={4} lg key={label}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(color, 0.1), color, mr: 2, width: 40, height: 40 }}>
                    {icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                      {count}{suffix || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Barre de progression si audit en cours */}
      {currentSession && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {resume?.totalControles ?? 0} controles executes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {resultats.filter((r) => r.statut === 'OK').length} OK / {resultats.filter((r) => r.statut === 'ANOMALIE').length} anomalies
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.divider, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: score >= 80 ? sevColors.OK : score >= 50 ? sevColors.MINEUR : sevColors.BLOQUANT,
              },
            }}
          />
        </Box>
      )}

      {/* Onglets */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Tableau de bord" />
            <Tab label={`Anomalies (${resultats.filter((r) => r.statut === 'ANOMALIE').length})`} />
            <Tab label="Rapport corrections" disabled={!correctionReport} />
            <Tab label="Historique" />
          </Tabs>
        </Box>

        {/* Tab 0: Tableau de bord */}
        <TabPanel value={activeTab} index={0}>
          <CardContent sx={{ p: 3 }}>
            {!currentSession ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <SecurityIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun audit en cours
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Cliquez sur "Lancer l'audit" pour executer les 108 controles SYSCOHADA.
                </Typography>
                <Button variant="contained" startIcon={<PlayIcon />} onClick={handleStartAudit}>
                  Lancer l'audit
                </Button>
              </Box>
            ) : (
              <Box>
                {/* Resume par niveau */}
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Resultats par niveau
                </Typography>
                <Grid container spacing={2}>
                  {([0, 1, 2, 3, 4, 5, 6, 7, 8] as NiveauControle[]).map((n) => {
                    const niveauRes = resultats.filter((r) => r.niveau === n)
                    if (niveauRes.length === 0) return null
                    const okCount = niveauRes.filter((r) => r.statut === 'OK').length
                    const anomCount = niveauRes.filter((r) => r.statut === 'ANOMALIE').length
                    const pct = Math.round((okCount / niveauRes.length) * 100)
                    return (
                      <Grid item xs={12} md={6} lg={4} key={n}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              N{n} - {NIVEAUX_NOMS[n]}
                            </Typography>
                            <Chip label={`${pct}%`} size="small"
                              sx={{ bgcolor: pct >= 80 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2',
                                color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626', fontWeight: 600 }} />
                          </Box>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 6, borderRadius: 3, mb: 1,
                              bgcolor: alpha(theme.palette.divider, 0.1),
                              '& .MuiLinearProgress-bar': { bgcolor: pct >= 80 ? '#16a34a' : pct >= 50 ? '#fbbf24' : '#dc2626' } }} />
                          <Typography variant="caption" color="text.secondary">
                            {okCount} OK, {anomCount} anomalies / {niveauRes.length} controles
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>

                {/* Validation */}
                {resume && resume.bloquantsRestants === 0 && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    Aucune anomalie bloquante - la balance peut etre validee.
                  </Alert>
                )}
                {resume && resume.bloquantsRestants > 0 && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {resume.bloquantsRestants} anomalie(s) bloquante(s) a corriger avant validation.
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </TabPanel>

        {/* Tab 1: Anomalies */}
        <TabPanel value={activeTab} index={1}>
          <CardContent sx={{ p: 3 }}>
            {resultats.length > 0 ? (
              <AuditResultsView resultats={resultats} />
            ) : (
              <Alert severity="info">Lancez un audit pour voir les resultats.</Alert>
            )}
          </CardContent>
        </TabPanel>

        {/* Tab 2: Rapport corrections */}
        <TabPanel value={activeTab} index={2}>
          <CardContent sx={{ p: 3 }}>
            {correctionReport ? (
              <CorrectionReportView rapport={correctionReport} />
            ) : (
              <Alert severity="info">
                Le rapport de corrections sera disponible apres une reimportation de balance (Phase 2).
              </Alert>
            )}
          </CardContent>
        </TabPanel>

        {/* Tab 3: Historique */}
        <TabPanel value={activeTab} index={3}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Sessions precedentes
            </Typography>
            {sessions.length === 0 ? (
              <Alert severity="info">Aucune session d'audit enregistree.</Alert>
            ) : (
              <Box>
                {sessions.map((sess, index) => (
                  <React.Fragment key={sess.id}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => {
                        dispatch(setSession(sess))
                        setActiveTab(0)
                      }}
                    >
                      <Avatar sx={{
                        bgcolor: sess.statut === 'TERMINEE' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                        color: sess.statut === 'TERMINEE' ? theme.palette.success.main : theme.palette.warning.main,
                        mr: 2, width: 36, height: 36,
                      }}>
                        {sess.statut === 'TERMINEE' ? <CheckIcon fontSize="small" /> : <HistoryIcon fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {sess.phase} - Exercice {sess.exercice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(sess.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' - '}Score: {sess.resume.scoreGlobal}%
                          {' - '}{sess.resultats.length} controles
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        {(['BLOQUANT', 'MAJEUR', 'MINEUR'] as Severite[]).map((sev) => {
                          const c = sess.resume.parSeverite[sev]
                          if (!c) return null
                          return (
                            <Chip key={sev} label={`${c}`} size="small"
                              sx={{ bgcolor: sevColors[sev] + '20', color: sevColors[sev], fontWeight: 600, height: 22, fontSize: '0.65rem' }} />
                          )
                        })}
                      </Stack>
                    </Box>
                    {index < sessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            )}
          </CardContent>
        </TabPanel>
      </Card>

      {/* Dialog de progression */}
      <AuditProgressDialog
        open={progressOpen}
        niveauCourant={progressNiveau}
        pourcentage={isRunning ? progressPct : 100}
        resultatsEnCours={progressResultats}
        isRunning={isRunning}
        onCancel={handleCancel}
        onClose={() => setProgressOpen(false)}
      />
    </Box>
  )
}

export default ModernAudit
