/**
 * Liass'Pilot - Landing Page
 * Style minimaliste avec palette Grayscale monochrome
 * Adapté au mode Entreprise / Cabinet
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
  People as PeopleIcon,
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

  const entrepriseNom = isCabinet ? (nomCabinet || 'Mon Cabinet') : (ent.nom || '\u2014')
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

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '85vh',
      bgcolor: 'background.paper',
      position: 'relative',
    }}>
      <OnboardingTour />

      {/* ── Header bar ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 1.5,
        borderBottom: `1px solid ${P.primary200}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5, lineHeight: 1.2 }}
              >
                {entrepriseNom}
              </Typography>
              <Chip
                label={isCabinet ? 'Cabinet' : 'Entreprise'}
                size="small"
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: isCabinet ? P.primary900 : P.primary200,
                  color: isCabinet ? P.white : P.primary700,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: 0.3 }}>
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
              color: P.primary500, borderRadius: 3,
              '&:hover': { bgcolor: P.primary50 },
            }}
          >
            Changer de mode
          </Button>

          <NotificationCenter sx={{ p: 0.5 }} />

          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.85rem' }}>
            {user?.username || 'Admin'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Clôture:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
              J-{daysUntilClose}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate(isCabinet ? '/dossiers' : '/dashboard')}
            sx={{
              bgcolor: 'text.primary', color: P.white, borderRadius: 3,
              textTransform: 'none', fontWeight: 600, px: 2,
              '&:hover': { bgcolor: 'grey.900' },
            }}
          >
            {isCabinet ? 'Mes dossiers' : 'Accéder'}
          </Button>
        </Stack>
      </Box>

      {/* ── Main content ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        px: 2,
        py: { xs: 3, md: 0 },
      }}>
        {/* Brand */}
        <Typography
          sx={{
            fontFamily: "'Grand Hotel', cursive",
            fontSize: { xs: '3rem', md: '4.2rem' },
            fontWeight: 400,
            color: 'text.primary',
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          Liass{'\u2019'}Pilot
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: P.primary400, fontSize: '1rem', letterSpacing: 1, mb: 0.5 }}
        >
          {isCabinet
            ? 'Votre portefeuille de dossiers fiscaux SYSCOHADA, centralisé.'
            : 'La liasse fiscale SYSCOHADA, pilotée de bout en bout.'
          }
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: P.primary300, fontSize: '0.9rem', letterSpacing: 0.3, mb: { xs: 3, md: 4 } }}
        >
          {isCabinet
            ? 'Gérez vos clients. Produisez leurs liasses. En toute conformité.'
            : 'Votre balance entre. Votre liasse sort. Conforme.'
          }
        </Typography>

        {/* ── Mode Entreprise : Hero Financial KPIs ── */}
        {!isCabinet && financials.hasBal && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 6 }}
            sx={{ mb: 3 }}
          >
            {/* CA */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{
                color: P.primary400, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem',
              }}>
                Chiffre d{'\u2019'}affaires
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '3rem' }, fontWeight: 200, color: 'text.primary', lineHeight: 1.1,
                }}>
                  {caFmt.value}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: P.primary400 }}>
                  {caFmt.unit}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: P.primary300, fontSize: '0.7rem' }}>
                FCFA
              </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{
              width: '1px', alignSelf: 'stretch', bgcolor: P.primary200,
              display: { xs: 'none', sm: 'block' },
            }} />

            {/* Résultat Net */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{
                color: P.primary400, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem',
              }}>
                Résultat net
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '3rem' }, fontWeight: 200, lineHeight: 1.1,
                  color: resPositif ? P.success : P.error,
                }}>
                  {resPositif ? '+' : ''}{resFmt.value}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: resPositif ? P.success : P.error, opacity: 0.7 }}>
                  {resFmt.unit}
                </Typography>
                {resPositif
                  ? <TrendingUp sx={{ fontSize: 18, color: P.success, opacity: 0.6, ml: 0.5 }} />
                  : <TrendingDown sx={{ fontSize: 18, color: P.error, opacity: 0.6, ml: 0.5 }} />
                }
              </Box>
              <Typography variant="caption" sx={{ color: P.primary300, fontSize: '0.7rem' }}>
                FCFA
              </Typography>
            </Box>
          </Stack>
        )}

        {/* ── Mode Cabinet : Hero Portfolio KPIs ── */}
        {isCabinet && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 6 }}
            sx={{ mb: 3 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{
                color: P.primary400, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem',
              }}>
                Dossiers clients
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '3rem' }, fontWeight: 200, color: 'text.primary', lineHeight: 1.1,
                }}>
                  {cabinetStats.total}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: P.primary300, fontSize: '0.7rem' }}>
                au total
              </Typography>
            </Box>

            <Box sx={{
              width: '1px', alignSelf: 'stretch', bgcolor: P.primary200,
              display: { xs: 'none', sm: 'block' },
            }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{
                color: P.primary400, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem',
              }}>
                En cours
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '3rem' }, fontWeight: 200, color: P.warning, lineHeight: 1.1,
                }}>
                  {cabinetStats.enCours}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: P.primary300, fontSize: '0.7rem' }}>
                dossier(s)
              </Typography>
            </Box>

            <Box sx={{
              width: '1px', alignSelf: 'stretch', bgcolor: P.primary200,
              display: { xs: 'none', sm: 'block' },
            }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{
                color: P.primary400, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem',
              }}>
                Validées
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: { xs: '2.4rem', md: '3rem' }, fontWeight: 200, color: P.success, lineHeight: 1.1,
                }}>
                  {cabinetStats.validees + cabinetStats.exportees}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: P.primary300, fontSize: '0.7rem' }}>
                liasse(s)
              </Typography>
            </Box>
          </Stack>
        )}

        {/* ── Thin separator ── */}
        <Box sx={{ width: 60, height: '1px', bgcolor: P.primary200, mb: 3 }} />

        {/* ── Operational KPIs — Entreprise ── */}
        {!isCabinet && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0}
            sx={{
              gap: { xs: 2, sm: 0 },
              bgcolor: P.primary50,
              borderRadius: 3,
              px: { xs: 2, sm: 1 },
              py: 2,
            }}
          >
            {[
              { value: String(nbExercices), label: 'Exercices', sub: nbExercices > 0 ? 'enregistré(s)' : '\u2014' },
              { value: String(nbBalances), label: 'Balances', sub: nbBalances > 0 ? 'importée(s)' : '\u2014' },
              { value: String(stats.comptes), label: 'Comptes', sub: stats.comptes > 0 ? 'dans la balance' : '\u2014' },
              { value: String(stats.declarations), label: 'Liasses', sub: stats.declarations > 0 ? 'générée(s)' : 'en attente' },
              { value: `${stats.conformite}%`, label: 'Conformité', sub: ws.controleDone ? (ws.controleResult === 'passed' ? 'validé' : ws.controleBloquants > 0 ? `${ws.controleBloquants} bloquant(s)` : 'avertissements') : 'non contrôlé' },
              { value: `${stats.avancement}%`, label: 'Avancement', progress: stats.avancement },
            ].map((stat, i, arr) => (
              <Box key={stat.label} sx={{
                textAlign: 'center',
                px: { xs: 2, sm: 3, md: 4 },
                borderRight: i < arr.length - 1 ? { xs: 'none', sm: `1px solid ${P.primary200}` } : 'none',
                minWidth: 90,
              }}>
                <Typography sx={{
                  fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 300, color: 'text.primary', lineHeight: 1.2,
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: P.primary500, fontWeight: 600, fontSize: '0.78rem', mt: 0.3 }}>
                  {stat.label}
                </Typography>
                {stat.progress !== undefined ? (
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      mt: 0.8, height: 3, borderRadius: 2, bgcolor: P.primary200,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: stat.progress >= 100 ? P.success : P.primary700,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: P.primary400, fontSize: '0.68rem' }}>
                    {stat.sub}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}

        {/* ── Operational KPIs — Cabinet ── */}
        {isCabinet && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0}
            sx={{
              gap: { xs: 2, sm: 0 },
              bgcolor: P.primary50,
              borderRadius: 3,
              px: { xs: 2, sm: 1 },
              py: 2,
            }}
          >
            {[
              { value: String(cabinetStats.total), label: 'Dossiers', sub: cabinetStats.total > 0 ? 'dans le portefeuille' : 'aucun dossier' },
              { value: String(cabinetStats.enCours), label: 'En cours', sub: cabinetStats.enCours > 0 ? 'en production' : '\u2014' },
              { value: String(cabinetStats.validees), label: 'Validées', sub: cabinetStats.validees > 0 ? 'prêtes à exporter' : '\u2014' },
              { value: String(cabinetStats.exportees), label: 'Exportées', sub: cabinetStats.exportees > 0 ? 'envoyée(s) DGI' : '\u2014' },
              {
                value: cabinetStats.total > 0
                  ? `${Math.round(((cabinetStats.validees + cabinetStats.exportees) / cabinetStats.total) * 100)}%`
                  : '0%',
                label: 'Avancement',
                progress: cabinetStats.total > 0
                  ? Math.round(((cabinetStats.validees + cabinetStats.exportees) / cabinetStats.total) * 100)
                  : 0,
              },
            ].map((stat, i, arr) => (
              <Box key={stat.label} sx={{
                textAlign: 'center',
                px: { xs: 2, sm: 3, md: 4 },
                borderRight: i < arr.length - 1 ? { xs: 'none', sm: `1px solid ${P.primary200}` } : 'none',
                minWidth: 90,
              }}>
                <Typography sx={{
                  fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 300, color: 'text.primary', lineHeight: 1.2,
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: P.primary500, fontWeight: 600, fontSize: '0.78rem', mt: 0.3 }}>
                  {stat.label}
                </Typography>
                {stat.progress !== undefined ? (
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      mt: 0.8, height: 3, borderRadius: 2, bgcolor: P.primary200,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: stat.progress >= 100 ? P.success : P.primary700,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: P.primary400, fontSize: '0.68rem' }}>
                    {stat.sub}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Bottom Navigation ── */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 3,
        gap: 1.5,
      }}>
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ gap: 1.5 }}
        >
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="outlined"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                borderColor: P.primary200, color: P.primary600, borderRadius: 3,
                textTransform: 'none', fontWeight: 500, px: 2.5, py: 0.8, fontSize: '0.85rem',
                '&:hover': { borderColor: P.primary400, bgcolor: 'grey.50' },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Typography variant="caption" sx={{ color: P.primary300, mt: 1, fontSize: '0.7rem' }}>
          Powered by Atlas Studio
        </Typography>
      </Box>
    </Box>
  )
}

export default ModernDashboard
