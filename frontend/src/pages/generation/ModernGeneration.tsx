/**
 * Module Generation - Workflow local en 3 etapes
 * Prerequis → Selection regime → Confirmation → Navigation vers /liasse-fiscale
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ArrowBack,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { getWorkflowState, updateWorkflowState } from '@/services/workflowStateService'
import type { WorkflowState } from '@/services/workflowStateService'

const REGIMES = [
  { value: 'REEL_NORMAL', label: 'Systeme Normal', description: 'CA >= 60M FCFA - Liasse complete 84 pages' },
  { value: 'REEL_SIMPLIFIE', label: 'Systeme Allege / Simplifie', description: 'CA < 60M FCFA - Liasse simplifiee' },
  { value: 'SMT', label: 'Systeme Minimal de Tresorerie', description: 'Micro-entites' },
  { value: 'FORFAITAIRE', label: 'Forfaitaire', description: 'Regime forfaitaire' },
]

const ModernGeneration: React.FC = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)
  const [selectedRegime, setSelectedRegime] = useState('REEL_NORMAL')

  useEffect(() => {
    const ws = getWorkflowState()
    setWorkflowState(ws)

    // Auto-detect regime from entreprise settings
    try {
      const raw = localStorage.getItem('fiscasync_entreprise_settings') || localStorage.getItem('fiscasync_db_entreprise_settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        const e = Array.isArray(parsed) ? parsed[0] : parsed
        const r = (e?.regime_imposition || '').toLowerCase()
        if (r.includes('simplif') || r.includes('allege') || r.includes('allég')) setSelectedRegime('REEL_SIMPLIFIE')
        else if (r.includes('forfait')) setSelectedRegime('FORFAITAIRE')
        else if (r.includes('smt') || r.includes('minimal')) setSelectedRegime('SMT')
        else setSelectedRegime('REEL_NORMAL')
      }
    } catch { /* ignore */ }

    // If prerequisites are met, auto-advance
    if (ws.balanceImported) {
      setActiveStep(ws.controleDone ? 1 : 0)
    }
  }, [])

  const handleConfirmGeneration = () => {
    const updated = updateWorkflowState({
      generationDone: true,
      generationDate: new Date().toISOString(),
      generationRegime: selectedRegime,
    })
    setWorkflowState(updated)
    setActiveStep(2)
  }

  const prerequisOk = workflowState?.balanceImported ?? false
  const controleOk = workflowState?.controleDone ?? false

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2, color: P.primary600, fontWeight: 500, '&:hover': { bgcolor: 'grey.100' } }}
        >
          Retour au menu principal
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Generation de la liasse fiscale
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verification des prerequis et lancement de la generation SYSCOHADA
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 0: Prerequisites */}
                <Step>
                  <StepLabel>Verification des prerequis</StepLabel>
                  <StepContent>
                    <Stack spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {prerequisOk ? (
                          <CheckIcon sx={{ color: '#16a34a' }} />
                        ) : (
                          <ErrorIcon sx={{ color: '#dc2626' }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                          Balance importee
                        </Typography>
                        {!prerequisOk && (
                          <Button size="small" variant="outlined" onClick={() => navigate('/import-balance')}>
                            Importer
                          </Button>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {controleOk ? (
                          <CheckIcon sx={{ color: '#16a34a' }} />
                        ) : (
                          <ErrorIcon sx={{ color: '#d97706' }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                          Controle de coherence lance
                        </Typography>
                        {controleOk && workflowState && (
                          <Chip
                            label={`Score: ${workflowState.controleScore}/100`}
                            size="small"
                            color={workflowState.controleScore >= 90 ? 'success' : workflowState.controleScore >= 70 ? 'warning' : 'error'}
                          />
                        )}
                        {!controleOk && (
                          <Button size="small" variant="outlined" onClick={() => navigate('/validation-liasse')}>
                            Lancer le controle
                          </Button>
                        )}
                      </Box>

                      {!controleOk && prerequisOk && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Le controle n'est pas obligatoire mais fortement recommande avant la generation.
                        </Alert>
                      )}
                    </Stack>

                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      disabled={!prerequisOk}
                      sx={{ mt: 1 }}
                    >
                      Continuer
                    </Button>
                  </StepContent>
                </Step>

                {/* Step 1: Regime selection */}
                <Step>
                  <StepLabel>Selection du regime</StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Le regime est auto-detecte depuis les parametres entreprise. Vous pouvez le modifier si necessaire.
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Regime d'imposition</InputLabel>
                      <Select
                        value={selectedRegime}
                        label="Regime d'imposition"
                        onChange={(e) => setSelectedRegime(e.target.value)}
                      >
                        {REGIMES.map(r => (
                          <MenuItem key={r.value} value={r.value}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>{r.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{r.description}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Stack direction="row" spacing={1}>
                      <Button onClick={() => setActiveStep(0)}>Retour</Button>
                      <Button variant="contained" onClick={handleConfirmGeneration}>
                        Confirmer et generer
                      </Button>
                    </Stack>
                  </StepContent>
                </Step>

                {/* Step 2: Confirmation */}
                <Step>
                  <StepLabel>Generation terminee</StepLabel>
                  <StepContent>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <AlertTitle>Liasse prete</AlertTitle>
                      La liasse fiscale {REGIMES.find(r => r.value === selectedRegime)?.label} est prete a etre consultee.
                      Les pages sont calculees a la volee depuis votre balance.
                    </Alert>

                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/liasse-fiscale')}
                      sx={{ fontWeight: 600 }}
                    >
                      Ouvrir la liasse fiscale
                    </Button>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right sidebar - Status summary */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Statut du workflow
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: 'Configuration', done: workflowState?.configurationDone },
                  { label: 'Import balance', done: workflowState?.balanceImported },
                  { label: 'Controle', done: workflowState?.controleDone },
                  { label: 'Generation', done: workflowState?.generationDone },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.done ? (
                      <CheckIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                    ) : (
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #d4d4d4' }} />
                    )}
                    <Typography variant="body2" sx={{ color: item.done ? 'text.primary' : 'text.secondary' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {workflowState?.controleDone && (
                <Paper sx={{ p: 1.5, mt: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Dernier controle</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {workflowState.controleScore}/100
                  </Typography>
                  {workflowState.controleBloquants > 0 && (
                    <Chip label={`${workflowState.controleBloquants} bloquants`} size="small" color="error" sx={{ mt: 0.5 }} />
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ModernGeneration
