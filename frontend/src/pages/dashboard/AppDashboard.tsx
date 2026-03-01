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
  Settings,
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

  const loadData = () => {
    setWs(getWorkflowState())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  // ── Balance Summary (computed from real data) ──
  const balanceSummary = useMemo(() => {
    const totalDebit = bal.entries.reduce((s, e) => s + (e.solde_debit ?? 0), 0)
    const totalCredit = bal.entries.reduce((s, e) => s + (e.solde_credit ?? 0), 0)
    const ca = bal.c(['70', '71', '72', '73'])
    const charges = bal.d(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    const produits = bal.c(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
    const resultat = produits - charges
    return {
      totalDebit: bal.entries.length ? fmt(Math.round(totalDebit)) : '\u2014',
      totalCredit: bal.entries.length ? fmt(Math.round(totalCredit)) : '\u2014',
      nbComptes: bal.entries.length,
      chiffreAffaires: bal.entries.length ? fmt(ca) : '\u2014',
      resultatNet: bal.entries.length ? fmt(resultat) : '\u2014',
      resultatPositif: resultat >= 0,
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

  // ── Deadlines (fiscal calendar with dynamic daysLeft) ──
  const deadlines: Deadline[] = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-based

    // TVA: 15th of next month
    const tvaDate = new Date(year, month + 1, 15)
    const tvaDays = Math.ceil((tvaDate.getTime() - now.getTime()) / 86400000)

    // Liasse SYSCOHADA: 31 March
    let liasseDate = new Date(year, 2, 31)
    if (liasseDate < now) liasseDate = new Date(year + 1, 2, 31)
    const liasseDays = Math.ceil((liasseDate.getTime() - now.getTime()) / 86400000)

    // IS Acompte T1: 15 April
    let isDate = new Date(year, 3, 15)
    if (isDate < now) isDate = new Date(year + 1, 3, 15)
    const isDays = Math.ceil((isDate.getTime() - now.getTime()) / 86400000)

    // Patente: 30 June
    let patenteDate = new Date(year, 5, 30)
    if (patenteDate < now) patenteDate = new Date(year + 1, 5, 30)
    const patenteDays = Math.ceil((patenteDate.getTime() - now.getTime()) / 86400000)

    const typeFor = (days: number): 'urgent' | 'warning' | 'normal' =>
      days <= 7 ? 'urgent' : days <= 30 ? 'warning' : 'normal'

    return [
      { label: 'Déclaration TVA mensuelle', date: `15/${String(month + 2).padStart(2, '0')}`, daysLeft: tvaDays, type: typeFor(tvaDays), description: 'DGI - Formulaire DSF' },
      { label: 'Dépôt Liasse Fiscale SYSCOHADA', date: `31/03/${liasseDate.getFullYear()}`, daysLeft: liasseDays, type: typeFor(liasseDays), description: 'États financiers annuels' },
      { label: 'Déclaration IS - Acompte T1', date: `15/04/${isDate.getFullYear()}`, daysLeft: isDays, type: typeFor(isDays), description: 'Impôt sur les sociétés' },
      { label: 'Patente annuelle', date: `30/06/${patenteDate.getFullYear()}`, daysLeft: patenteDays, type: typeFor(patenteDays), description: 'Contribution des patentes' },
    ].sort((a, b) => a.daysLeft - b.daysLeft)
  }, [])

  // ── Activity (built from localStorage traces) ──
  const activities: Activity[] = useMemo(() => {
    const acts: Activity[] = []
    const timeAgo = (dateStr: string | null): string => {
      if (!dateStr) return ''
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return "À l'instant"
      if (mins < 60) return `Il y a ${mins} min`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `Il y a ${hours}h`
      const days = Math.floor(hours / 24)
      return `Il y a ${days}j`
    }

    // Balance import
    try {
      const balRaw = localStorage.getItem('fiscasync_balance_latest')
      if (balRaw) {
        const balData = JSON.parse(balRaw)
        const nbEntries = balData?.entries?.length || 0
        const importDate = balData?.importDate || balData?.date || null
        if (nbEntries > 0) {
          acts.push({
            action: 'Balance importée',
            detail: `${nbEntries} comptes chargés`,
            time: importDate ? timeAgo(importDate) : '',
            icon: <CloudUpload sx={{ fontSize: 16 }} />,
          })
        }
      }
    } catch { /* ignore */ }

    // Workflow state events
    if (ws) {
      if (ws.controleDone) {
        acts.push({
          action: 'Contrôle exécuté',
          detail: ws.controleResult === 'passed' ? 'Tous les contrôles OK' : ws.controleResult === 'passed_with_warnings' ? `Score ${ws.controleScore}% — avertissements` : `Score ${ws.controleScore}% — ${ws.controleBloquants} bloquant(s)`,
          time: '',
          icon: <Security sx={{ fontSize: 16 }} />,
        })
      }
      if (ws.generationDone && ws.generationDate) {
        acts.push({
          action: 'Liasse générée',
          detail: ws.generationRegime || 'Système Normal',
          time: timeAgo(ws.generationDate),
          icon: <Description sx={{ fontSize: 16 }} />,
        })
      }
      if (ws.lastExportDate) {
        acts.push({
          action: 'Export effectué',
          detail: ws.lastExportFormat ? `Format ${ws.lastExportFormat.toUpperCase()}` : 'Fichier exporté',
          time: timeAgo(ws.lastExportDate),
          icon: <Analytics sx={{ fontSize: 16 }} />,
        })
      }
      if (ws.teledeclarationStatus !== 'not_started' && ws.teledeclarationDate) {
        const statusLabels: Record<string, string> = { draft: 'Brouillon', submitted: 'Soumise', accepted: 'Acceptée' }
        acts.push({
          action: 'Télédéclaration',
          detail: statusLabels[ws.teledeclarationStatus] || ws.teledeclarationStatus,
          time: timeAgo(ws.teledeclarationDate),
          icon: <Analytics sx={{ fontSize: 16 }} />,
        })
      }
      if (ws.configurationDone) {
        acts.push({
          action: 'Configuration entreprise',
          detail: ent.nom || 'Paramètres enregistrés',
          time: '',
          icon: <Settings sx={{ fontSize: 16 }} />,
        })
      }
    }

    return acts
  }, [ws, ent.nom])

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
              label={ent.exerciceFin ? `Exercice ${ent.exerciceFin.substring(0, 4)}` : ent.exerciceDebut ? `Exercice ${ent.exerciceDebut.substring(0, 4)}` : 'Exercice \u2014'}
              size="small"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: C.card, color: C.label, border: `1px solid ${C.border}` }}
            />
            {ent.regimeImposition && (
              <Chip
                label={ent.regimeImposition}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.75rem', borderColor: C.border, color: C.secondary }}
              />
            )}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualiser">
            <IconButton size="small" onClick={() => { setLoading(true); setTimeout(loadData, 300) }} sx={{ bgcolor: C.surface, border: `1px solid ${C.border}` }}>
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
                    <Chip
                      label={d.daysLeft <= 0 ? 'Échu' : d.daysLeft === 1 ? 'Demain' : `${d.daysLeft}j`}
                      size="small"
                      sx={{
                        height: 22, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                        bgcolor: d.type === 'urgent' ? '#fecaca' : d.type === 'warning' ? '#fde68a' : C.border,
                        color: d.type === 'urgent' ? '#991b1b' : d.type === 'warning' ? '#92400e' : C.label,
                      }}
                    />
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
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: balanceSummary.resultatPositif ? 'success.50' : '#fef2f2', textAlign: 'center', border: `1px solid ${balanceSummary.resultatPositif ? '#bbf7d0' : '#fecaca'}` }}>
                    <Typography variant="caption" sx={{ color: balanceSummary.resultatPositif ? '#166534' : '#991b1b', fontSize: '0.7rem', display: 'block' }}>
                      Résultat Net
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: balanceSummary.resultatPositif ? '#166534' : '#991b1b', mt: 0.5 }}>
                      {balanceSummary.resultatNet}
                    </Typography>
                    <Typography variant="caption" sx={{ color: balanceSummary.resultatPositif ? '#166534' : '#991b1b', fontSize: '0.65rem' }}></Typography>
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

              {activities.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <AccessTime sx={{ fontSize: 40, color: C.border, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: C.placeholder, fontWeight: 500 }}>
                    Aucune activité enregistrée
                  </Typography>
                  <Typography variant="caption" sx={{ color: C.border }}>
                    Importez une balance pour commencer
                  </Typography>
                </Box>
              ) : (
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
                      {act.time && (
                        <Typography variant="caption" sx={{ color: C.placeholder, fontSize: '0.7rem', whiteSpace: 'nowrap', mt: 0.5 }}>
                          {act.time}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
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
