/**
 * Composant de validation de la balance
 *
 * P0-2 : Remplace la simulation mock (setTimeout + score 85)
 * par l'exécution réelle des 169 contrôles d'audit.
 */

import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  PlayArrow,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  ExpandMore,
  AutoAwesome,
  Visibility,
  Assessment,
  Block,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '@/store'
import { startAudit, setAuditProgress, setCurrentAudit } from '@/store/auditSlice'
import { AuditAnomalie } from '@/types'
import {
  executeBalanceValidation,
  type BalanceValidationResult,
  type ControlResult,
} from '@/services/balanceValidationService'

const BalanceValidation: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isRunning, progress } = useAppSelector(state => state.audit)
  const { balances } = useAppSelector(state => state.balance)

  const [validationResult, setValidationResult] = useState<BalanceValidationResult | null>(null)
  const [selectedControl, setSelectedControl] = useState<ControlResult | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)

  const lancerValidation = useCallback(async () => {
    if (balances.length === 0) return

    dispatch(startAudit())

    // Convertir les balances Redux en format attendu par le moteur d'audit
    const balanceN = balances.map(b => ({
      compte: b.compte || '',
      libelle: b.libelle_compte || '',
      solde_debit: b.debit ?? 0,
      solde_credit: b.credit ?? 0,
    }))

    const result = await executeBalanceValidation(
      balanceN,
      undefined,
      (stage, current, total) => {
        dispatch(setAuditProgress({ current, total, stage }))
      },
    )

    setValidationResult(result)

    // Convertir en format du store audit pour compatibilité
    const anomalies: AuditAnomalie[] = result.controls
      .filter(c => c.status !== 'OK' && c.status !== 'INFO')
      .map((c, i) => ({
        id: `ctrl-${i}`,
        type: c.status === 'BLOQUANT' ? 'ERROR' as const : 'WARNING' as const,
        compte: c.code,
        description: c.message,
        priorite: c.status === 'BLOQUANT' ? 'HAUTE' as const
          : c.status === 'MAJEUR' ? 'MOYENNE' as const
          : 'BASSE' as const,
        suggestion_correction: c.suggestion,
      }))

    dispatch(setCurrentAudit({
      score_global: result.score,
      nb_anomalies: anomalies.length,
      anomalies,
      recommandations: result.isBlocking
        ? ['Corriger les anomalies bloquantes avant de poursuivre']
        : result.summary.majeur > 0
        ? ['Vérifier les anomalies majeures avant la génération de la liasse']
        : ['La balance est conforme — vous pouvez générer la liasse'],
      last_audit: new Date().toISOString(),
    }))

    dispatch(setAuditProgress({
      current: result.controls.length,
      total: result.controls.length,
      stage: 'Validation terminée',
    }))
  }, [balances, dispatch])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle color="success" />
      case 'INFO': return <Info color="info" />
      case 'MINEUR': return <Warning color="warning" />
      case 'MAJEUR': return <ErrorIcon color="warning" />
      case 'BLOQUANT': return <Block color="error" />
      default: return <Info color="disabled" />
    }
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'OK': return 'success'
      case 'INFO': return 'info'
      case 'MINEUR': return 'warning'
      case 'MAJEUR': return 'warning'
      case 'BLOQUANT': return 'error'
      default: return 'default'
    }
  }

  const groupedControls = validationResult?.controls.reduce<Record<string, ControlResult[]>>((acc, ctrl) => {
    const group = ctrl.status
    if (!acc[group]) acc[group] = []
    acc[group].push(ctrl)
    return acc
  }, {})

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec bouton de lancement */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Validation de la Balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exécution des contrôles d'audit SYSCOHADA (niveaux 0-5 + 8)
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={lancerValidation}
          disabled={isRunning || balances.length === 0}
        >
          {isRunning ? 'Validation en cours...' : 'Lancer Validation'}
        </Button>
      </Box>

      {/* Progression */}
      {isRunning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {progress.stage}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Contrôle {progress.current + 1} sur {progress.total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
            sx={{ mt: 1 }}
          />
        </Alert>
      )}

      {/* Score global */}
      {validationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: validationResult.score >= 80 ? 'success.main'
                        : validationResult.score >= 50 ? 'warning.main'
                        : 'error.main',
                    }}
                  >
                    {validationResult.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score Global
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={9}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {validationResult.summary.bloquant > 0 && (
                    <Chip label={`${validationResult.summary.bloquant} BLOQUANT`} color="error" icon={<Block />} />
                  )}
                  {validationResult.summary.majeur > 0 && (
                    <Chip label={`${validationResult.summary.majeur} MAJEUR`} color="warning" icon={<ErrorIcon />} />
                  )}
                  {validationResult.summary.mineur > 0 && (
                    <Chip label={`${validationResult.summary.mineur} MINEUR`} color="warning" variant="outlined" icon={<Warning />} />
                  )}
                  <Chip label={`${validationResult.summary.ok} OK`} color="success" icon={<CheckCircle />} />
                  <Chip label={`${validationResult.controls.length} contrôles exécutés`} color="info" variant="outlined" />
                </Box>

                {validationResult.isBlocking && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Des anomalies bloquantes empêchent la génération de la liasse.
                    Corrigez-les avant de poursuivre.
                  </Alert>
                )}
                {!validationResult.isBlocking && validationResult.summary.majeur > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    La balance peut être utilisée mais des anomalies majeures sont à vérifier.
                  </Alert>
                )}
                {!validationResult.isBlocking && validationResult.summary.majeur === 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    La balance est conforme. Vous pouvez générer la liasse.
                  </Alert>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Résultats détaillés par sévérité */}
      {groupedControls && (
        <Card>
          <CardHeader
            title="Résultats des Contrôles"
            avatar={<Assessment color="primary" />}
            subheader={`${validationResult?.controls.length || 0} contrôles exécutés`}
          />
          <CardContent>
            {(['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK'] as const).map(severity => {
              const controls = groupedControls[severity]
              if (!controls || controls.length === 0) return null

              return (
                <Accordion key={severity} defaultExpanded={severity === 'BLOQUANT' || severity === 'MAJEUR'}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getStatusIcon(severity)}
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {severity} ({controls.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <List dense>
                      {controls.map((ctrl) => (
                        <ListItem
                          key={ctrl.code}
                          sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {getStatusIcon(ctrl.status)}
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={ctrl.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {ctrl.label}
                                </Typography>
                              </Box>
                            }
                            secondary={ctrl.message}
                          />

                          {(ctrl.suggestion || ctrl.reference) && (
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedControl(ctrl); setDetailDialog(true) }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      {validationResult && !validationResult.isBlocking && (
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Prochaine étape" avatar={<AutoAwesome color="primary" />} />
          <CardContent>
            <Alert severity="success">
              Score de {validationResult.score}/100 — La balance est validée.
              Vous pouvez procéder à la génération de la liasse fiscale.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Dialog détail contrôle */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détail du Contrôle {selectedControl?.code}
        </DialogTitle>
        <DialogContent>
          {selectedControl && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Code</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedControl.code}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Sévérité</Typography>
                  <Chip label={selectedControl.status} color={getStatusColor(selectedControl.status)} size="small" />
                </Grid>
              </Grid>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Résultat :</strong> {selectedControl.message}
              </Typography>

              {selectedControl.suggestion && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Suggestion de correction :</strong> {selectedControl.suggestion}
                  </Typography>
                </Alert>
              )}

              {selectedControl.reference && (
                <Alert severity="warning" variant="outlined">
                  <Typography variant="body2">
                    <strong>Référence :</strong> {selectedControl.reference}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BalanceValidation
