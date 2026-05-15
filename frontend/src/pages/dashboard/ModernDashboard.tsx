/**
 * Liass'Pilot — In-App Dashboard (Nordic Slate premium)
 * Style : warm-stone neutrals + teal accent (#0f766e), Dosis typography,
 * 4-layer shadows, hover lift micro-interactions.
 * Adapté au mode Entreprise / Cabinet.
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Stack,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Security as AuditIcon,
  Analytics as ReportIcon,
  ArrowForward as ArrowIcon,
  TrendingUp,
  TrendingDown,
  SwapHoriz as SwapIcon,
  Folder as FolderIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useEntrepriseData } from '@/hooks/useEntrepriseData'
import { useBalanceData } from '@/hooks/useBalanceData'
import { getWorkflowState } from '@/services/workflowStateService'
import { getAllExercices } from '@/services/exerciceStorageService'
import { getAllBalances } from '@/services/balanceStorageService'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useModeStore } from '@/store/modeStore'
import { useDossierStore } from '@/store/dossierStore'
import { FeatureGate } from '@/components/gating'

/** Format number in compact FCFA (e.g. 1.2 Mrd, 340 M, 12 k) */
function fmtCompact(n: number): { value: string; unit: string } {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return { value: (n / 1_000_000_000).toFixed(1), unit: 'Mrd' }
  if (abs >= 1_000_000) return { value: (n / 1_000_000).toFixed(0), unit: 'M' }
  if (abs >= 1_000) return { value: (n / 1_000).toFixed(0), unit: 'k' }
  return { value: String(Math.round(n)), unit: '' }
}

const ModernDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const ent = useEntrepriseData()
  const bal = useBalanceData()
  const { userMode, nomCabinet, reset: resetMode } = useModeStore()
  const { dossiers } = useDossierStore()

  const isCabinet = userMode === 'cabinet'

  const ws = getWorkflowState()
  const stepsTotal = 4
  const stepsDone = [ws.configurationDone, ws.balanceImported, ws.controleDone, ws.generationDone].filter(Boolean).length

  // Financial KPIs from balance
  const financials = useMemo(() => {
    if (!bal.entries.length) return { ca: 0, resultat: 0, hasBal: false }
    const ca = bal.c(['70', '71', '72', '73'])
    const produits = bal.c(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
    const charges = bal.d(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    return { ca, resultat: produits - charges, hasBal: true }
  }, [bal])

  const nbExercices = getAllExercices().length
  const nbBalances = getAllBalances().length

  const stats = {
    declarations: ws.generationDone ? 1 : 0,
    comptes: bal.entries.length,
    conformite: ws.controleDone ? ws.controleScore : 0,
    avancement: Math.round((stepsDone / stepsTotal) * 100),
  }

  // Cabinet stats
  const cabinetStats = useMemo(() => {
    const enCours = dossiers.filter(d => d.statut === 'en_cours').length
    const validees = dossiers.filter(d => d.statut === 'validee').length
    const exportees = dossiers.filter(d => d.statut === 'exportee').length
    return { total: dossiers.length, enCours, validees, exportees }
  }, [dossiers])

  useEffect(() => { setLoading(false) }, [])

  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const diffTime = endOfYear.getTime() - now.getTime()
  const daysUntilClose = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  const entrepriseNom = isCabinet ? (nomCabinet || 'Mon Cabinet') : (ent.nom || '—')
  const exercice = ent.exerciceDebut ? ent.exerciceDebut.substring(0, 4) : String(new Date().getFullYear())

  const navItemsEntreprise = [
    { label: 'Application', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { label: 'Balance', icon: <BalanceIcon fontSize="small" />, path: '/balance' },
    { label: 'Audit', icon: <AuditIcon fontSize="small" />, path: '/audit' },
    { label: 'Rapports', icon: <ReportIcon fontSize="small" />, path: '/reporting' },
  ]

  const navItemsCabinet = [
    { label: 'Dossiers', icon: <FolderIcon fontSize="small" />, path: '/dossiers' },
    { label: 'Application', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { label: 'Audit', icon: <AuditIcon fontSize="small" />, path: '/audit' },
    { label: 'Rapports', icon: <ReportIcon fontSize="small" />, path: '/reporting' },
  ]

  const navItems = isCabinet ? navItemsCabinet : navItemsEntreprise

  const handleChangeMode = () => {
    resetMode()
    navigate('/mode-selection')
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        gap: 4,
      }}>
        <Skeleton variant="text" width={300} height={80} sx={{ borderRadius: 3 }} />
        <Skeleton variant="text" width={200} height={30} sx={{ borderRadius: 2 }} />
        <Stack direction="row" spacing={6}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="text" width={80} height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Box>
    )
  }

  const caFmt = fmtCompact(financials.ca)
  const resFmt = fmtCompact(financials.resultat)
  const resPositif = financials.resultat >= 0

  // ── Visual tokens (Nordic Slate premium) ──
  const closeUrgent = daysUntilClose <= 30
  const closeSoon = daysUntilClose <= 90 && daysUntilClose > 30

  // ── Reusable KPI Card renderer (premium card style) ──
  type StatItem = {
    value: string
    label: string
    sub?: string
    progress?: number
    accent?: 'neutral' | 'teal' | 'success' | 'warning'
  }
  const renderStatCard = (stat: StatItem) => {
    const valueColor =
      stat.accent === 'success' ? P.success :
      stat.accent === 'warning' ? P.warning :
      stat.accent === 'teal' ? P.teal :
      P.primary900
    return (
      <Paper
        key={stat.label}
        elevation={0}
        sx={{
          p: 2,
          bgcolor: P.white,
          border: `1px solid ${P.primary200}`,
          borderRadius: 2.5,
          transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
          cursor: 'default',
          '&:hover': {
            borderColor: P.tealBorder,
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Typography sx={{
          fontSize: { xs: '1.4rem', md: '1.75rem' }, fontWeight: 700, color: valueColor,
          lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        }}>
          {stat.value}
        </Typography>
        <Typography sx={{
          color: P.primary600, fontWeight: 600, fontSize: '0.72rem',
          textTransform: 'uppercase', letterSpacing: 1, mt: 0.5,
        }}>
          {stat.label}
        </Typography>
        {stat.progress !== undefined ? (
          <LinearProgress
            variant="determinate"
            value={stat.progress}
            sx={{
              mt: 1, height: 4, borderRadius: 2, bgcolor: P.primary100,
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: stat.progress >= 100 ? P.success : P.teal,
              },
            }}
          />
        ) : (
          <Typography sx={{ color: P.primary500, fontSize: '0.68rem', mt: 0.5 }}>
            {stat.sub}
          </Typography>
        )}
      </Paper>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '85vh',
      width: '100%',
      // Fond subtil warm-stone (au lieu du flat blanc) — donne de la profondeur.
      background: `linear-gradient(180deg, ${P.white} 0%, ${P.primary50} 100%)`,
      position: 'relative',
    }}>
      <OnboardingTour />

      {/* Header bar premium */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        borderBottom: `1px solid ${P.primary200}`,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Accent rail teal a gauche du nom */}
          <Box sx={{
            width: 3, height: 36, bgcolor: P.teal, borderRadius: 2,
          }} />
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: P.primary900, letterSpacing: 0.3, lineHeight: 1.2 }}
              >
                {entrepriseNom}
              </Typography>
              <Chip
                label={isCabinet ? 'Cabinet' : 'Entreprise'}
                size="small"
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.4,
                  bgcolor: isCabinet ? P.primary900 : 'rgba(15, 118, 110, 0.10)',
                  color: isCabinet ? P.white : P.tealDark,
                  border: isCabinet ? 'none' : `1px solid ${P.tealBorder}`,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: P.primary500, letterSpacing: 0.2 }}>
              {isCabinet ? `${cabinetStats.total} dossier(s) client(s)` : `Exercice ${exercice}`}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="small"
            startIcon={<SwapIcon sx={{ fontSize: 16 }} />}
            onClick={handleChangeMode}
            sx={{
              textTransform: 'none', fontWeight: 500, fontSize: '0.78rem',
              color: P.primary600, borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.08)', color: P.tealDark },
            }}
          >
            Changer de mode
          </Button>

          <NotificationCenter sx={{ p: 0.5 }} />

          <Typography variant="body2" sx={{ color: P.primary900, fontWeight: 600, fontSize: '0.85rem' }}>
            {user?.firstName || user?.email || 'Admin'}
          </Typography>

          {/* Compteur de cloture teinte selon urgence */}
          <Box sx={{
            display: 'flex', alignItems: 'baseline', gap: 0.6,
            px: 1.5, py: 0.6,
            bgcolor: closeUrgent ? 'rgba(185, 28, 28, 0.08)' : closeSoon ? 'rgba(180, 83, 9, 0.08)' : 'rgba(15, 118, 110, 0.08)',
            border: `1px solid ${closeUrgent ? 'rgba(185, 28, 28, 0.20)' : closeSoon ? 'rgba(180, 83, 9, 0.20)' : P.tealBorder}`,
            borderRadius: 2,
          }}>
            <Typography variant="caption" sx={{
              color: closeUrgent ? P.errorText : closeSoon ? P.warningText : P.tealDark,
              fontWeight: 500, fontSize: '0.7rem', letterSpacing: 0.3,
            }}>
              Clôture
            </Typography>
            <Typography sx={{
              fontWeight: 700, fontSize: '0.95rem', lineHeight: 1,
              color: closeUrgent ? P.error : closeSoon ? P.warning : P.teal,
              fontVariantNumeric: 'tabular-nums',
            }}>
              J-{daysUntilClose}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate(isCabinet ? '/dossiers' : '/dashboard')}
            sx={{
              bgcolor: P.primary900, color: P.white, borderRadius: 2,
              textTransform: 'none', fontWeight: 600, px: 2.2, py: 0.8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: P.primary800,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.18)',
              },
            }}
          >
            {isCabinet ? 'Mes dossiers' : 'Accéder'}
          </Button>
        </Stack>
      </Box>

      {/* Main content */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 5 },
      }}>
        {/* Eyebrow tag teal */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.8,
          px: 1.5, py: 0.4, mb: 2.5,
          bgcolor: P.tealBg,
          border: `1px solid ${P.tealBorder}`,
          borderRadius: 999,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: P.teal }} />
          <Typography sx={{
            fontSize: '0.7rem', fontWeight: 600, color: P.tealDark,
            textTransform: 'uppercase', letterSpacing: 1.2,
          }}>
            {'SYSCOHADA · OHADA révisé 2017'}
          </Typography>
        </Box>

        {/* Brand */}
        <Typography
          sx={{
            fontFamily: "'Grand Hotel', cursive",
            fontSize: { xs: '3.2rem', md: '4.5rem' },
            fontWeight: 400,
            color: P.primary900,
            lineHeight: 1.1,
            mb: 1,
          }}
        >
          Liass{'’'}Pilot
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: P.primary700, fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 500, letterSpacing: 0.2, mb: 0.5, textAlign: 'center',
          }}
        >
          {isCabinet
            ? 'Votre portefeuille de dossiers fiscaux SYSCOHADA, centralisé.'
            : 'La liasse fiscale SYSCOHADA, pilotée de bout en bout.'
          }
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: P.primary500, fontSize: '0.875rem', letterSpacing: 0.2,
            mb: { xs: 3, md: 4 }, textAlign: 'center',
          }}
        >
          {isCabinet
            ? 'Gérez vos clients. Produisez leurs liasses. En toute conformité.'
            : 'Votre balance entre. Votre liasse sort. Conforme.'
          }
        </Typography>

        {/* Mode Entreprise : Hero Financial KPIs (Premium cards CA + Resultat) */}
        {!isCabinet && financials.hasBal && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(220px, 280px))' },
            gap: 2,
            mb: 4,
          }}>
            {/* CA */}
            <Paper elevation={0} sx={{
              p: 3, bgcolor: P.white, border: `1px solid ${P.primary200}`,
              borderRadius: 3, position: 'relative', overflow: 'hidden',
              transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
              '&:hover': {
                borderColor: P.tealBorder,
                boxShadow: '0 8px 24px rgba(15, 118, 110, 0.10)',
                transform: 'translateY(-2px)',
              },
            }}>
              {/* Accent rail teal en haut */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                bgcolor: P.teal,
              }} />
              <Typography variant="caption" sx={{
                color: P.primary500, textTransform: 'uppercase', letterSpacing: 1.4,
                fontSize: '0.7rem', fontWeight: 600,
              }}>
                {'Chiffre d’affaires'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, mt: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '2.8rem' }, fontWeight: 700, color: P.primary900,
                  lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                }}>
                  {caFmt.value}
                </Typography>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: P.primary500 }}>
                  {caFmt.unit}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: P.primary400, ml: 0.5 }}>
                  FCFA
                </Typography>
              </Box>
              <Typography sx={{ color: P.primary500, fontSize: '0.78rem', mt: 0.5 }}>
                {'Exercice ' + exercice}
              </Typography>
            </Paper>

            {/* Resultat Net */}
            <Paper elevation={0} sx={{
              p: 3, bgcolor: P.white, border: `1px solid ${P.primary200}`,
              borderRadius: 3, position: 'relative', overflow: 'hidden',
              transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
              '&:hover': {
                borderColor: resPositif ? 'rgba(21, 128, 61, 0.4)' : 'rgba(185, 28, 28, 0.4)',
                boxShadow: resPositif ? '0 8px 24px rgba(21, 128, 61, 0.10)' : '0 8px 24px rgba(185, 28, 28, 0.10)',
                transform: 'translateY(-2px)',
              },
            }}>
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                bgcolor: resPositif ? P.success : P.error,
              }} />
              <Typography variant="caption" sx={{
                color: P.primary500, textTransform: 'uppercase', letterSpacing: 1.4,
                fontSize: '0.7rem', fontWeight: 600,
              }}>
                Résultat net
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, mt: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '2.8rem' }, fontWeight: 700,
                  color: resPositif ? P.success : P.error,
                  lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                }}>
                  {resPositif ? '+' : ''}{resFmt.value}
                </Typography>
                <Typography sx={{
                  fontSize: '1.1rem', fontWeight: 500,
                  color: resPositif ? P.success : P.error, opacity: 0.7,
                }}>
                  {resFmt.unit}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: P.primary400, ml: 0.5 }}>
                  FCFA
                </Typography>
                {resPositif
                  ? <TrendingUp sx={{ fontSize: 18, color: P.success, opacity: 0.7, ml: 0.5 }} />
                  : <TrendingDown sx={{ fontSize: 18, color: P.error, opacity: 0.7, ml: 0.5 }} />
                }
              </Box>
              <Typography sx={{ color: P.primary500, fontSize: '0.78rem', mt: 0.5 }}>
                {resPositif ? 'Bénéfice' : 'Déficit'}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Mode Cabinet : Hero Portfolio KPIs (Premium cards) */}
        {isCabinet && (
          <FeatureGate feature="tableau_de_bord_portefeuille">
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(160px, 220px))' },
              gap: 2,
              mb: 4,
            }}>
              {[
                { label: 'Dossiers clients', value: String(cabinetStats.total), sub: 'au total', accent: 'neutral' as const },
                { label: 'En cours', value: String(cabinetStats.enCours), sub: 'dossier(s)', accent: 'warning' as const },
                { label: 'Terminés', value: String(cabinetStats.validees + cabinetStats.exportees), sub: 'liasse(s)', accent: 'success' as const },
              ].map(stat => {
                const railColor = stat.accent === 'success' ? P.success : stat.accent === 'warning' ? P.warning : P.teal
                const valueColor = stat.accent === 'success' ? P.success : stat.accent === 'warning' ? P.warning : P.primary900
                return (
                  <Paper key={stat.label} elevation={0} sx={{
                    p: 3, bgcolor: P.white, border: `1px solid ${P.primary200}`,
                    borderRadius: 3, position: 'relative', overflow: 'hidden',
                    transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
                    '&:hover': {
                      borderColor: P.tealBorder,
                      boxShadow: '0 8px 24px rgba(15, 118, 110, 0.10)',
                      transform: 'translateY(-2px)',
                    },
                  }}>
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: railColor,
                    }} />
                    <Typography variant="caption" sx={{
                      color: P.primary500, textTransform: 'uppercase', letterSpacing: 1.4,
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{
                      fontSize: { xs: '2.4rem', md: '2.8rem' }, fontWeight: 700, color: valueColor,
                      lineHeight: 1, mt: 0.5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: P.primary500, fontSize: '0.78rem', mt: 0.5 }}>
                      {stat.sub}
                    </Typography>
                  </Paper>
                )
              })}
            </Box>
          </FeatureGate>
        )}

        {/* Thin separator teal */}
        <Box sx={{
          width: 48, height: 2, bgcolor: P.teal, borderRadius: 1, mb: 4, opacity: 0.6,
        }} />

        {/* Operational KPIs Entreprise (grid of premium cards) */}
        {!isCabinet && (
          <Box sx={{
            width: '100%', maxWidth: 1100,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}>
            {[
              { value: String(nbExercices), label: 'Exercices', sub: nbExercices > 0 ? 'enregistré(s)' : 'aucun', accent: 'neutral' as const },
              { value: String(nbBalances), label: 'Balances', sub: nbBalances > 0 ? 'importée(s)' : 'aucune', accent: 'neutral' as const },
              { value: String(stats.comptes), label: 'Comptes', sub: stats.comptes > 0 ? 'dans la balance' : 'aucun', accent: 'neutral' as const },
              { value: String(stats.declarations), label: 'Liasses', sub: stats.declarations > 0 ? 'générée(s)' : 'en attente', accent: 'neutral' as const },
              {
                value: `${stats.conformite}%`,
                label: 'Conformité',
                sub: ws.controleDone
                  ? (ws.controleResult === 'passed' ? 'validé' : ws.controleBloquants > 0 ? `${ws.controleBloquants} bloquant(s)` : 'avertissements')
                  : 'non contrôlé',
                accent: (ws.controleDone ? (ws.controleResult === 'passed' ? 'success' : 'warning') : 'neutral') as 'success' | 'warning' | 'neutral',
              },
              { value: `${stats.avancement}%`, label: 'Avancement', progress: stats.avancement, accent: 'teal' as const },
            ].map(renderStatCard)}
          </Box>
        )}

        {/* Operational KPIs Cabinet (grid of premium cards) */}
        {isCabinet && (
          <Box sx={{
            width: '100%', maxWidth: 1100,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}>
            {[
              { value: String(cabinetStats.total), label: 'Dossiers', sub: cabinetStats.total > 0 ? 'portefeuille' : 'aucun', accent: 'neutral' as const },
              { value: String(cabinetStats.enCours), label: 'En cours', sub: cabinetStats.enCours > 0 ? 'en production' : 'aucun', accent: 'warning' as const },
              { value: String(cabinetStats.validees), label: 'Validées', sub: cabinetStats.validees > 0 ? 'à exporter' : 'aucun', accent: 'teal' as const },
              { value: String(cabinetStats.exportees), label: 'Exportées', sub: cabinetStats.exportees > 0 ? 'envoyée(s) DGI' : 'aucun', accent: 'success' as const },
              {
                value: cabinetStats.total > 0
                  ? `${Math.round(((cabinetStats.validees + cabinetStats.exportees) / cabinetStats.total) * 100)}%`
                  : '0%',
                label: 'Avancement',
                progress: cabinetStats.total > 0
                  ? Math.round(((cabinetStats.validees + cabinetStats.exportees) / cabinetStats.total) * 100)
                  : 0,
                accent: 'teal' as const,
              },
            ].map(renderStatCard)}
          </Box>
        )}
      </Box>

      {/* Bottom Navigation — pill cards with teal hover */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 4,
        gap: 1.5,
      }}>
        <Stack
          direction="row"
          spacing={1.2}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ gap: 1.2 }}
        >
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="outlined"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                borderColor: P.primary200, color: P.primary700, bgcolor: P.white,
                borderRadius: 999,
                textTransform: 'none', fontWeight: 600, px: 2.5, py: 0.9, fontSize: '0.85rem',
                transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: P.teal,
                  color: P.tealDark,
                  bgcolor: P.tealBg,
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.10)',
                  transform: 'translateY(-1px)',
                  '& .MuiSvgIcon-root': { color: P.teal },
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Typography sx={{ color: P.primary400, mt: 1, fontSize: '0.7rem', letterSpacing: 0.4 }}>
          Powered by Atlas Studio
        </Typography>
      </Box>
    </Box>
  )
}

export default ModernDashboard
