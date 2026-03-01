/**
 * Interface de Contrôle de Liasse Fiscale
 * Lance l'audit sur la balance importée et affiche les résultats
 */

import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material'
import {
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PlayArrow as RunIcon,
  Speed as ScoreIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'

import { auditOrchestrator } from '@/services/audit'
import type { SessionAudit, Severite, NiveauControle } from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'
import { updateWorkflowState } from '@/services/workflowStateService'

const SEVERITE_CONFIG: Record<Severite, { color: string; label: string }> = {
  BLOQUANT: { color: '#dc2626', label: 'Bloquant' },
  MAJEUR: { color: '#ea580c', label: 'Majeur' },
  MINEUR: { color: '#d97706', label: 'Mineur' },
  INFO: { color: '#3b82f6', label: 'Info' },
  OK: { color: '#16a34a', label: 'OK' },
}

function loadBalanceFromStorage(): { entries: { compte: string; intitule?: string; libelle?: string; debit: number; credit: number; solde_debit: number; solde_credit: number }[] } | null {
  for (const key of ['fiscasync_balance_latest', 'fiscasync_balance_list']) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (key === 'fiscasync_balance_list' && Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0]?.entries) && parsed[0].entries.length > 0) return parsed[0]
      } else if (Array.isArray(parsed?.entries) && parsed.entries.length > 0) {
        return parsed
      }
    } catch { /* next */ }
  }
  try {
    const raw = localStorage.getItem('fiscasync_db_balance_entries')
    if (raw) {
      const items = JSON.parse(raw)
      if (Array.isArray(items) && items.length > 0) return { entries: items }
    }
  } catch { /* ignore */ }
  return null
}

const LiasseControlInterface: React.FC = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionAudit | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterSeverite, setFilterSeverite] = useState<Severite | 'ALL'>('ALL')
  const [filterNiveau, setFilterNiveau] = useState<NiveauControle | -1>(-1)

  const handleRunAudit = useCallback(async () => {
    setError(null)
    const balData = loadBalanceFromStorage()
    if (!balData || balData.entries.length === 0) {
      setError('Aucune balance trouvée. Importez une balance avant de lancer le contrôle.')
      return
    }

    const balanceN = balData.entries.map(e => ({
      compte: String(e.compte || ''),
      intitule: String(e.intitule || e.libelle || ''),
      debit: Number(e.debit) || 0,
      credit: Number(e.credit) || 0,
      solde_debit: Number(e.solde_debit) || 0,
      solde_credit: Number(e.solde_credit) || 0,
    }))

    setRunning(true)
    setProgress(0)
    setProgressLabel('Initialisation...')
    setSession(null)

    try {
      const result = await auditOrchestrator.startPhase1Audit(
        balanceN,
        undefined,
        undefined,
        {
          onProgress: (_niveau, index, total) => {
            setProgress(Math.round((index / Math.max(total, 1)) * 100))
          },
          onLevelStart: (niveau, nom) => {
            setProgressLabel(`Niveau ${niveau} : ${nom}`)
          },
          onLevelEnd: () => {},
          onComplete: () => {
            setProgress(100)
            setProgressLabel('Terminé')
          },
        }
      )

      // Also run phase 3 (financial statements)
      const fullResult = await auditOrchestrator.startPhase3Audit(
        balanceN,
        result,
        {
          onLevelStart: (niveau, nom) => {
            setProgressLabel(`Niveau ${niveau} : ${nom}`)
          },
        }
      )

      setSession(fullResult)

      // Update workflow state
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

  const filteredResults = session?.resultats.filter(r => {
    if (filterSeverite !== 'ALL' && r.severite !== filterSeverite) return false
    if (filterNiveau !== -1 && r.niveau !== filterNiveau) return false
    return true
  }) || []

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#16a34a'
    if (score >= 70) return '#d97706'
    return '#dc2626'
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Contrôle de Liasse Fiscale
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Validation avancée : 113 contrôles sur 9 niveaux (structurel, OHADA, fiscal, inter-états)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Bouton principal + progression */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<RunIcon />}
            onClick={handleRunAudit}
            disabled={running}
            sx={{ fontWeight: 600, px: 4 }}
          >
            {running ? 'Contrôle en cours...' : 'Lancer le contrôle'}
          </Button>

          {session && !running && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ScoreIcon sx={{ color: getScoreColor(session.resume.scoreGlobal) }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: getScoreColor(session.resume.scoreGlobal) }}>
                {session.resume.scoreGlobal}/100
              </Typography>
              <Chip label={`${session.resume.totalControles} contrôles`} size="small" />
              {session.resume.bloquantsRestants > 0 && (
                <Chip label={`${session.resume.bloquantsRestants} bloquants`} size="small" color="error" />
              )}
            </Box>
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

      {/* Résultats */}
      {session && (
        <>
          {/* Cartes résumé par sévérité */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {(['OK', 'INFO', 'MINEUR', 'MAJEUR', 'BLOQUANT'] as Severite[]).map(sev => {
              const count = session.resume.parSeverite[sev] || 0
              const cfg = SEVERITE_CONFIG[sev]
              return (
                <Grid item xs={6} sm key={sev}>
                  <Card
                    onClick={() => setFilterSeverite(filterSeverite === sev ? 'ALL' : sev)}
                    sx={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: filterSeverite === sev ? `2px solid ${cfg.color}` : '2px solid transparent',
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: cfg.color }}>
                        {count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {cfg.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          {/* Filtres par niveau */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Tous"
              size="small"
              variant={filterNiveau === -1 ? 'filled' : 'outlined'}
              onClick={() => setFilterNiveau(-1)}
              sx={{ fontWeight: 600 }}
            />
            {Object.entries(session.resume.parNiveau).map(([niv, data]) => (
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

          {/* Tableau des résultats */}
          <Paper>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 80 }}>Réf</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 70 }}>Niveau</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contrôle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Résultat</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 90 }}>Sévérité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((r) => {
                    const cfg = SEVERITE_CONFIG[r.severite]
                    const isOk = r.statut === 'OK'
                    return (
                      <TableRow key={r.ref} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600} fontFamily="monospace">{r.ref}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`N${r.niveau}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{r.nom}</Typography>
                          {!isOk && r.message && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                              {r.message}
                            </Typography>
                          )}
                          {!isOk && r.suggestion && (
                            <Typography variant="caption" sx={{ color: '#3b82f6', display: 'block' }}>
                              → {r.suggestion}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {isOk ? (
                            <ValidIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                          ) : r.severite === 'BLOQUANT' || r.severite === 'MAJEUR' ? (
                            <ErrorIcon sx={{ color: cfg.color, fontSize: 20 }} />
                          ) : (
                            <WarningIcon sx={{ color: cfg.color, fontSize: 20 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              bgcolor: `${cfg.color}15`,
                              color: cfg.color,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 22,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {filteredResults.length} contrôle{filteredResults.length > 1 ? 's' : ''} affiché{filteredResults.length > 1 ? 's' : ''}
                {filterSeverite !== 'ALL' || filterNiveau !== -1 ? ' (filtré)' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Score global : {session.resume.scoreGlobal}/100
              </Typography>
            </Box>
          </Paper>

          {/* Navigation buttons */}
          <Paper sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            {session.resume.bloquantsRestants === 0 ? (
              <Button
                variant="contained"
                color="success"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/liasse-fiscale')}
                sx={{ fontWeight: 600 }}
              >
                Generer la liasse
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="warning"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  if (window.confirm(`${session.resume.bloquantsRestants} controle(s) bloquant(s) detecte(s). Continuer quand meme ?`)) {
                    navigate('/liasse-fiscale')
                  }
                }}
                sx={{ fontWeight: 600 }}
              >
                Forcer la generation ({session.resume.bloquantsRestants} bloquants)
              </Button>
            )}
            <Typography variant="body2" color="text.secondary">
              Score : {session.resume.scoreGlobal}/100
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default LiasseControlInterface
