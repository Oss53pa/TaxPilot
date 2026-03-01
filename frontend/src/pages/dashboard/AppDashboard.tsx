/**
 * TaxPilot - Tableau de bord principal
 * Dashboard fiscal - Palette Grayscale monochrome
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Avatar,
  Divider,
  Button,
  Tooltip,
  Skeleton,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning as WarningIcon,
  CheckCircle,
  Schedule,
  Assignment,
  AccountBalance,
  CloudUpload,
  Security,
  Description,
  Analytics,
  ArrowForward,
  CalendarMonth,
  AccessTime,
  BarChart,
  Refresh,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { fiscasyncPalette } from '@/theme/fiscasyncTheme'
import { useEntrepriseData } from '@/hooks/useEntrepriseData'
import { useBalanceData } from '@/hooks/useBalanceData'
import { getWorkflowState } from '@/services/workflowStateService'
import type { WorkflowState } from '@/services/workflowStateService'

// ─── Palette tokens (derived from central theme) ─────────────────────
const C = {
  bg:       fiscasyncPalette.primary50,
  surface:  fiscasyncPalette.white,
  card:     fiscasyncPalette.primary100,
  border:   fiscasyncPalette.primary200,
  subtle:   fiscasyncPalette.primary300,
  placeholder: fiscasyncPalette.primary400,
  secondary: fiscasyncPalette.primary500,
  label:    fiscasyncPalette.primary600,
  ghost:    fiscasyncPalette.primary700,
  hover:    fiscasyncPalette.primary800,
  text:     fiscasyncPalette.primary900,
  active:   fiscasyncPalette.primary950,
  white:    fiscasyncPalette.white,
  success:  fiscasyncPalette.success,
  warning:  fiscasyncPalette.warning,
  error:    fiscasyncPalette.error,
  info:     fiscasyncPalette.info,
  critical: fiscasyncPalette.critical,
}

// ─── Types ───────────────────────────────────────────────────────────
interface KPI {
  label: string
  value: string
  subtitle: string
  trend: number
  trendLabel: string
  icon: React.ReactNode
}

interface Deadline {
  label: string
  date: string
  daysLeft: number
  type: 'urgent' | 'warning' | 'normal'
  description: string
}

interface Activity {
  action: string
  detail: string
  time: string
  icon: React.ReactNode
}

interface WorkflowStep {
  label: string
  status: 'done' | 'active' | 'pending'
  path: string
}

// ─── Component ───────────────────────────────────────────────────────
const AppDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const ent = useEntrepriseData()
  const bal = useBalanceData()
  const [ws, setWs] = useState<WorkflowState | null>(null)

  useEffect(() => {
    setWs(getWorkflowState())
    setLoading(false)
  }, [])

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  // ── Balance Summary (computed from real data) ──
  const balanceSummary = useMemo(() => {
    const totalDebit = bal.entries.reduce((s, e) => s + (e.solde_debit || 0), 0)
    const totalCredit = bal.entries.reduce((s, e) => s + (e.solde_credit || 0), 0)
    const ca = bal.c(['70', '71', '72', '73'])
    const charges = bal.d(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    const produits = bal.c(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
    return {
      totalDebit: bal.entries.length ? fmt(totalDebit) : '\u2014',
      totalCredit: bal.entries.length ? fmt(totalCredit) : '\u2014',
      nbComptes: bal.entries.length,
      chiffreAffaires: bal.entries.length ? fmt(ca) : '\u2014',
      resultatNet: bal.entries.length ? fmt(produits - charges) : '\u2014',
      ecart: Math.abs(totalDebit - totalCredit),
    }
  }, [bal])

  // ── KPIs (computed from balance + workflow state) ──
  const workflowSteps = ws ? [ws.configurationDone, ws.balanceImported, ws.controleDone, ws.generationDone].filter(Boolean).length : 0
  const kpis: KPI[] = [
    {
      label: 'Avancement Liasse',
      value: ws ? `${workflowSteps}/4` : '\u2014',
      subtitle: ws?.generationDone ? 'Liasse generee' : ws?.controleDone ? 'Controle termine' : ws?.balanceImported ? 'Balance importee' : 'Non demarre',
      trend: 0,
      trendLabel: '',
      icon: <Assignment sx={{ fontSize: 20 }} />,
    },
    {
      label: 'Score Conformite',
      value: ws?.controleDone ? `${ws.controleScore}%` : '\u2014',
      subtitle: ws?.controleDone ? (ws.controleResult === 'passed' ? 'Tous controles OK' : ws.controleResult === 'passed_with_warnings' ? 'Avertissements' : `${ws.controleBloquants} bloquant(s)`) : 'Controle non lance',
      trend: 0,
      trendLabel: '',
      icon: <Security sx={{ fontSize: 20 }} />,
    },
    {
      label: 'Bloquants',
      value: ws?.controleDone ? String(ws.controleBloquants) : '\u2014',
      subtitle: ws?.controleDone ? (ws.controleBloquants === 0 ? 'Aucun bloquant' : 'Action requise') : 'Controle non lance',
      trend: 0,
      trendLabel: '',
      icon: <WarningIcon sx={{ fontSize: 20 }} />,
    },
    {
      label: 'Comptes Balance',
      value: bal.entries.length ? String(bal.entries.length) : '\u2014',
      subtitle: bal.entries.length ? 'Balance importee' : 'Aucune balance importee',
      trend: 0,
      trendLabel: '',
      icon: <AccountBalance sx={{ fontSize: 20 }} />,
    },
  ]

  // ── Workflow (dynamic from workflowState) ──
  const workflow: WorkflowStep[] = [
    { label: 'Configuration', status: ws?.configurationDone ? 'done' : ent.hasEntreprise ? 'done' : 'pending', path: '/parametrage' },
    { label: 'Import Balance', status: ws?.balanceImported ? 'done' : bal.usingImported ? 'done' : 'pending', path: '/import-balance' },
    { label: 'Controle', status: ws?.controleDone ? 'done' : ws?.balanceImported ? 'active' : 'pending', path: '/validation-liasse' },
    { label: 'Generation', status: ws?.generationDone ? 'done' : ws?.controleDone ? 'active' : 'pending', path: '/generation' },
    { label: 'Liasse Fiscale', status: ws?.generationDone ? 'active' : 'pending', path: '/liasse-fiscale' },
    { label: 'Teledeclaration', status: ws?.teledeclarationStatus === 'submitted' || ws?.teledeclarationStatus === 'accepted' ? 'done' : ws?.generationDone ? 'active' : 'pending', path: '/teledeclaration' },
  ]

  // ── Deadlines (generic fiscal calendar — static reference data) ──
  const deadlines: Deadline[] = [
    { label: 'Déclaration TVA mensuelle', date: '15 du mois', daysLeft: 0, type: 'normal', description: 'DGI - Formulaire DSF' },
    { label: 'Dépôt Liasse Fiscale SYSCOHADA', date: '31 Mars', daysLeft: 0, type: 'warning', description: 'États financiers annuels' },
    { label: 'Déclaration IS - Acompte T1', date: '15 Avril', daysLeft: 0, type: 'normal', description: 'Impôt sur les sociétés' },
    { label: 'Patente annuelle', date: '30 Juin', daysLeft: 0, type: 'normal', description: 'Contribution des patentes' },
  ]

  // ── Activity (empty — real activity log doesn't exist yet) ──
  const activities: Activity[] = []

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={300} height={40} sx={{ borderRadius: 2 }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: C.text, mb: 0.5 }}>
            Tableau de bord
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ color: C.secondary }}>
              {ent.nom || '\u2014'}
            </Typography>
            <Chip
              label={ent.exerciceDebut ? `Exercice ${ent.exerciceDebut.substring(0, 4)}` : 'Exercice \u2014'}
              size="small"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: C.card, color: C.label, border: `1px solid ${C.border}` }}
            />
            <Chip
              label="Système Normal"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.75rem', borderColor: C.border, color: C.secondary }}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualiser">
            <IconButton size="small" sx={{ bgcolor: C.surface, border: `1px solid ${C.border}` }}>
              <Refresh fontSize="small" sx={{ color: C.secondary }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<Assignment />}
            onClick={() => navigate('/liasse-fiscale')}
            sx={{
              bgcolor: C.text,
              color: C.white,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: C.hover, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
            }}
          >
            Ouvrir la Liasse
          </Button>
        </Stack>
      </Box>

      {/* ── Alert Banner ── */}
      {!bal.usingImported && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            mb: 2.5,
            borderRadius: 4,
            bgcolor: 'warning.50',
            border: '1px solid #fde68a',
          }}
        >
          <WarningIcon sx={{ color: C.warning, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500, flex: 1 }}>
            Aucune balance importée — importez votre balance pour commencer
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/import-balance')}
            sx={{ textTransform: 'none', color: '#92400e', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Importer
          </Button>
        </Box>
      )}

      {/* ── KPI Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${C.border}`,
                bgcolor: C.surface,
                height: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: C.secondary, fontWeight: 500, fontSize: '0.8rem' }}>
                    {kpi.label}
                  </Typography>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: C.card, color: C.label }}>
                    {kpi.icon}
                  </Avatar>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: C.text, mb: 0.5, lineHeight: 1.1 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: C.placeholder, display: 'block', mb: 1 }}>
                  {kpi.subtitle}
                </Typography>
                {kpi.trend !== 0 && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {kpi.trend > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: C.success }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: C.error }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{ color: kpi.trend > 0 ? C.success : C.error, fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      {kpi.trend > 0 ? '+' : ''}{kpi.trend}% {kpi.trendLabel}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Workflow + Échéancier ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Workflow Progress */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, bgcolor: C.surface, height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, mb: 0.25 }}>
                    Processus de production
                  </Typography>
                  <Typography variant="caption" sx={{ color: C.secondary }}>
                    Avancement global de la liasse fiscale
                  </Typography>
                </Box>
                <Chip
                  label={`${workflow.filter(s => s.status === 'done').length}/${workflow.length} étapes`}
                  size="small"
                  sx={{ bgcolor: 'warning.50', color: '#92400e', fontWeight: 600, fontSize: '0.75rem', border: '1px solid #fde68a' }}
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.round((workflow.filter(s => s.status === 'done').length / workflow.length) * 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mb: 3,
                  bgcolor: C.border,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: C.text,
                  },
                }}
              />

              {/* Workflow Steps */}
              <Box sx={{ display: 'flex', gap: 0 }}>
                {workflow.map((step, index) => (
                  <Box
                    key={step.label}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover .step-circle': { transform: 'scale(1.15)' },
                    }}
                    onClick={() => navigate(step.path)}
                  >
                    {index > 0 && (
                      <Box
                        sx={{
                          position: 'absolute', top: 16, left: 0, right: '50%', height: 2,
                          bgcolor: step.status === 'done' || step.status === 'active' ? C.text : C.border,
                        }}
                      />
                    )}
                    {index < workflow.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute', top: 16, left: '50%', right: 0, height: 2,
                          bgcolor: step.status === 'done' ? C.text : C.border,
                        }}
                      />
                    )}

                    <Box
                      className="step-circle"
                      sx={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 1, zIndex: 1, transition: 'transform 0.2s',
                        bgcolor: step.status === 'done' ? C.text : step.status === 'active' ? C.warning : C.border,
                        color: step.status === 'pending' ? C.secondary : C.white,
                      }}
                    >
                      {step.status === 'done' ? (
                        <CheckCircle sx={{ fontSize: 18 }} />
                      ) : step.status === 'active' ? (
                        <Schedule sx={{ fontSize: 18 }} />
                      ) : (
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                          {index + 1}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: step.status === 'active' ? 700 : 500,
                        color: step.status === 'active' ? C.ghost : step.status === 'done' ? C.text : C.placeholder,
                        textAlign: 'center', lineHeight: 1.2, px: 0.5,
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Échéancier fiscal */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, bgcolor: C.surface, height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                  Échéancier fiscal
                </Typography>
                <CalendarMonth sx={{ color: C.placeholder, fontSize: 20 }} />
              </Stack>

              <Stack spacing={1.5}>
                {deadlines.map((d, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 3,
                      bgcolor: d.type === 'urgent' ? '#fef2f2' : d.type === 'warning' ? '#fffbeb' : C.card,
                      border: '1px solid',
                      borderColor: d.type === 'urgent' ? '#fecaca' : d.type === 'warning' ? '#fde68a' : C.border,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 40, height: 40, borderRadius: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: d.type === 'urgent' ? C.error : d.type === 'warning' ? C.warning : C.text,
                        color: C.white,
                      }}
                    >
                      <CalendarMonth sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: C.text, lineHeight: 1.3 }}>
                        {d.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.7rem' }}>
                        {d.date} — {d.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Synthèse Balance + Activité récente ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Balance Summary */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, bgcolor: C.surface, height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                  Synthèse financière
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/balance')}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', color: C.secondary, '&:hover': { color: C.text } }}
                >
                  Balance
                </Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: C.card, textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.7rem', display: 'block' }}>
                      Total Débit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, mt: 0.5 }}>
                      {balanceSummary.totalDebit}
                    </Typography>
                    <Typography variant="caption" sx={{ color: C.placeholder, fontSize: '0.65rem' }}></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: C.card, textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.7rem', display: 'block' }}>
                      Total Crédit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, mt: 0.5 }}>
                      {balanceSummary.totalCredit}
                    </Typography>
                    <Typography variant="caption" sx={{ color: C.placeholder, fontSize: '0.65rem' }}></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.50', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.7rem', display: 'block' }}>
                      Chiffre d'Affaires
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', mt: 0.5 }}>
                      {balanceSummary.chiffreAffaires}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.65rem' }}></Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'info.50', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontSize: '0.7rem', display: 'block' }}>
                      Résultat Net
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af', mt: 0.5 }}>
                      {balanceSummary.resultatNet}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontSize: '0.65rem' }}></Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: C.border }} />

              <Stack direction="row" justifyContent="space-around">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: C.text }}>{balanceSummary.nbComptes || '\u2014'}</Typography>
                  <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.7rem' }}>Comptes</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: C.border }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: bal.entries.length ? (balanceSummary.ecart < 1 ? C.success : C.error) : C.placeholder }}>{bal.entries.length ? fmt(balanceSummary.ecart) : '\u2014'}</Typography>
                  <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.7rem' }}>Écart D/C</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, bgcolor: C.surface, height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                  Activité récente
                </Typography>
                <AccessTime sx={{ color: C.placeholder, fontSize: 20 }} />
              </Stack>

              <Stack spacing={0}>
                {activities.map((act, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5,
                      borderBottom: i < activities.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: C.card, color: C.label, mt: 0.25 }}>
                      {act.icon}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
                        {act.action}
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.secondary, fontSize: '0.75rem' }}>
                        {act.detail}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: C.placeholder, fontSize: '0.7rem', whiteSpace: 'nowrap', mt: 0.5 }}>
                      {act.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Quick Access ── */}
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, bgcolor: C.surface, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, mb: 2 }}>
            Accès rapide
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { label: 'Import Balance', icon: <CloudUpload />, path: '/import-balance' },
              { label: 'Controle Balance', icon: <Security />, path: '/validation-liasse' },
              { label: 'Generation Auto', icon: <Description />, path: '/generation' },
              { label: 'Liasse Fiscale', icon: <Assignment />, path: '/liasse-fiscale' },
              { label: 'Templates Export', icon: <CheckCircle />, path: '/templates' },
              { label: 'Teledeclaration', icon: <Analytics />, path: '/teledeclaration' },
              { label: 'Reporting', icon: <BarChart />, path: '/reporting' },
              { label: 'Plans Comptables', icon: <AccountBalance />, path: '/plans-comptables' },
            ].map((m) => (
              <Grid item xs={6} sm={4} md={3} lg={1.5} key={m.label}>
                <Box
                  onClick={() => navigate(m.path)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
                    p: 1.5, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { bgcolor: C.card, transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Avatar sx={{ width: 40, height: 40, bgcolor: C.card, color: C.label, border: `1px solid ${C.border}` }}>
                    {m.icon}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 500, fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.2, color: C.label }}
                  >
                    {m.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AppDashboard
