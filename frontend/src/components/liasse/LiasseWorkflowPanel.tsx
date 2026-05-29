/**
 * LiasseWorkflowPanel — pilotage du statut de la liasse (Supabase).
 * Cycle BROUILLON → VALIDEE → VERROUILLEE (immuable) → DECLAREE → ARCHIVEE.
 * Mode-agnostic : utilise le dossier actif (Cabinet) ou l'exercice entreprise.
 */
import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material'
import { Lock, LockOpen, VerifiedUser, Fingerprint } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { format as formatDate } from 'date-fns'
import { useDossierStore } from '@/store/dossierStore'
import { getEntreprise } from '@/services/entrepriseStorageService'
import {
  getLiasseStatus,
  transitionLiasse,
  getAvailableActions,
  STATUT_LABELS,
  STATUT_ORDER,
  type LiasseStatus,
  type WorkflowAction,
} from '@/services/liasseWorkflowService'

const STATUT_COLOR: Record<string, 'default' | 'success' | 'warning' | 'primary'> = {
  BROUILLON: 'default',
  VALIDEE: 'success',
  VERROUILLEE: 'warning',
  DECLAREE: 'primary',
  ARCHIVEE: 'primary',
}

const LiasseWorkflowPanel: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()

  const activeDossier = useDossierStore((s) =>
    s.activeDossierId ? s.dossiers.find((d) => d.id === s.activeDossierId) || null : null,
  )

  const exercice = String(
    activeDossier?.exerciceN ??
      (getEntreprise()?.exercice_fin ? String(getEntreprise()?.exercice_fin).slice(0, 4) : null) ??
      new Date().getFullYear(),
  )
  const typeLiasse = 'SN'

  const [status, setStatus] = useState<LiasseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<WorkflowAction | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setStatus(await getLiasseStatus(exercice, typeLiasse))
    } finally {
      setLoading(false)
    }
  }, [exercice])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (action: WorkflowAction) => {
    setConfirm(null)
    setBusy(true)
    try {
      await transitionLiasse(exercice, action.action, typeLiasse)
      enqueueSnackbar(`Statut mis à jour : ${action.label}`, { variant: 'success' })
      await load()
    } catch (e) {
      enqueueSnackbar(e instanceof Error ? e.message : 'Action impossible', { variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const onActionClick = (action: WorkflowAction) => {
    if (action.irreversible) setConfirm(action)
    else void runAction(action)
  }

  const actions = status ? getAvailableActions(status.statut) : []
  const activeStep = status ? STATUT_ORDER.indexOf(status.statut) : 0

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'stretch', gap: 1.75 }}>
        <Box sx={{ width: 4, borderRadius: 2, flexShrink: 0, background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 55%, #115e59 100%)' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>
            Statut & Verrouillage de la liasse
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cycle OHADA — validation, verrouillage immuable (empreinte SHA-256), déclaration, archivage.
            {activeDossier ? ` Dossier : ${activeDossier.nomClient}.` : ''} Exercice {exercice}.
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardHeader
          avatar={<VerifiedUser color="primary" />}
          title="Cycle de vie"
          action={
            status ? (
              <Chip
                icon={status.isLocked ? <Lock /> : <LockOpen />}
                label={STATUT_LABELS[status.statut]}
                color={STATUT_COLOR[status.statut]}
                sx={{ fontWeight: 600 }}
              />
            ) : undefined
          }
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !status ? (
            <Alert severity="info">Statut indisponible (cloud non configuré).</Alert>
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {STATUT_ORDER.map((s) => (
                  <Step key={s} completed={STATUT_ORDER.indexOf(s) < activeStep}>
                    <StepLabel>{STATUT_LABELS[s]}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {status.isLocked && status.hash && (
                <Alert severity="success" icon={<Fingerprint />} sx={{ mb: 2 }}>
                  Liasse verrouillée (immuable)
                  {status.lockedAt && ` le ${formatDate(new Date(status.lockedAt), 'dd/MM/yyyy HH:mm')}`}.
                  <Tooltip title={status.hash}>
                    <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', ml: 1 }}>
                      empreinte {status.hash.slice(0, 16)}…
                    </Typography>
                  </Tooltip>
                </Alert>
              )}

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {actions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Aucune action disponible (liasse {STATUT_LABELS[status.statut].toLowerCase()}).
                  </Typography>
                ) : (
                  actions.map((a) => (
                    <Button
                      key={a.action}
                      variant={a.irreversible ? 'contained' : 'outlined'}
                      color={a.color === 'inherit' ? undefined : a.color}
                      startIcon={a.action === 'verrouiller' ? <Lock /> : undefined}
                      disabled={busy}
                      onClick={() => onActionClick(a)}
                    >
                      {a.label}
                    </Button>
                  ))
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirm} onClose={() => !busy && setConfirm(null)}>
        <DialogTitle>Confirmer : {confirm?.label}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm?.confirmation}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={busy}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => confirm && void runAction(confirm)}
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Lock />}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LiasseWorkflowPanel
