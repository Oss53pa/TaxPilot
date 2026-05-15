/**
 * Liass'Pilot — In-App Dashboard (Nordic Slate premium)
 * Inspiré du modèle Cockpit R&C : top bar + hero brand + 4 KPI cards
 * avec sparklines + insight PROPH3T + grid métriques + progress gradient.
 * Style : warm-stone neutrals + teal accent (#0f766e), Dosis typography.
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Stack,
  Chip,
  Paper,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Security as AuditIcon,
  Analytics as ReportIcon,
  ArrowForward as ArrowIcon,
  ArrowOutward as ArrowOutwardIcon,
  SwapHoriz as SwapIcon,
  Folder as FolderIcon,
  AutoAwesome as SparkleIcon,
  Schedule as ScheduleIcon,
  VerifiedUser as VerifiedIcon,
  ReportProblem as AlertIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Gavel as GavelIcon,
  AccountBalanceWallet as WalletIcon,
  Psychology as PsychologyIcon,
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
// import { FeatureGate } from '@/components/gating'  // (réservé pour gating Cabinet ultérieur)

/** Format number in compact FCFA (e.g. 1.2 Mrd, 340 M, 12 k) */
function fmtCompact(n: number): { value: string; unit: string } {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return { value: (n / 1_000_000_000).toFixed(2).replace('.', ','), unit: 'Md' }
  if (abs >= 1_000_000) return { value: (n / 1_000_000).toFixed(1).replace('.', ','), unit: 'M' }
  if (abs >= 1_000) return { value: (n / 1_000).toFixed(0), unit: 'k' }
  return { value: String(Math.round(n)), unit: '' }
}

/** Mois courant en français */
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

// ── Mini sparkline SVG ──
interface SparklineProps {
  data: number[]
  color: string
  fillOpacity?: number
  height?: number
}
const Sparkline: React.FC<SparklineProps> = ({ data, color, fillOpacity = 0.15, height = 36 }) => {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = height
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const pathLine = `M ${points.join(' L ')}`
  const pathFill = `${pathLine} L ${w},${h} L 0,${h} Z`
  const gradId = `spark-grad-${color.replace('#', '')}`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={pathFill} fill={`url(#${gradId})`} />
      <path d={pathLine} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Generate plausible sparkline data from a current value ──
function genSeries(current: number, points = 10, volatility = 0.15, trend: 'up' | 'down' | 'flat' = 'up'): number[] {
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    const trendFactor = trend === 'up' ? 0.7 + 0.3 * t : trend === 'down' ? 1.3 - 0.3 * t : 1
    const noise = 1 + (Math.sin(i * 1.7) * volatility * 0.5) + ((i % 3) - 1) * volatility * 0.3
    out.push(Math.max(0, current * trendFactor * noise))
  }
  out[points - 1] = current
  return out
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
    if (!bal.entries.length) return { ca: 0, resultat: 0, charges: 0, produits: 0, hasBal: false }
    const ca = bal.c(['70', '71', '72', '73'])
    const produits = bal.c(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
    const charges = bal.d(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    return { ca, resultat: produits - charges, charges, produits, hasBal: true }
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

  const entrepriseNom = isCabinet ? (nomCabinet || 'Mon Cabinet') : (ent.nom || 'Entreprise')
  const exerciceLabel = ent.exerciceDebut ? ent.exerciceDebut.substring(0, 4) : String(now.getFullYear())
  const monthLabel = MOIS_FR[now.getMonth()]
  const yearLabel = now.getFullYear()

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

  // ── Compteurs & accents ──
  const totalAlerts = (ws.controleDone ? ws.controleBloquants : 0) + (financials.resultat < 0 ? 1 : 0)
  const closeUrgent = daysUntilClose <= 30
  const closeSoon = daysUntilClose <= 90 && daysUntilClose > 30

  // ── Sparkline data (séries plausibles dérivées des valeurs courantes) ──
  const caFmt = fmtCompact(financials.ca)
  const resFmt = fmtCompact(financials.resultat)
  const chFmt = fmtCompact(financials.charges)
  const sparkCA = useMemo(() => genSeries(financials.ca || 1, 10, 0.18, 'up'), [financials.ca])
  const sparkCharges = useMemo(() => genSeries(financials.charges || 1, 10, 0.22, 'up'), [financials.charges])
  const sparkResultat = useMemo(() => genSeries(Math.abs(financials.resultat) || 1, 10, 0.25, financials.resultat >= 0 ? 'up' : 'down'), [financials.resultat])
  const sparkConformite = useMemo(() => genSeries(stats.conformite || 1, 10, 0.10, 'up'), [stats.conformite])

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '85vh', gap: 4,
      }}>
        <Skeleton variant="text" width={300} height={80} sx={{ borderRadius: 3 }} />
        <Skeleton variant="text" width={200} height={30} sx={{ borderRadius: 2 }} />
        <Stack direction="row" spacing={2}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={220} height={140} />)}
        </Stack>
      </Box>
    )
  }

  // ── Petits chips (top-right) ──
  const TopPill: React.FC<{ dotColor?: string; label: string; bold?: boolean; onClick?: () => void; rightIcon?: React.ReactNode }> = ({ dotColor, label, bold, onClick, rightIcon }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.7,
        px: 1.3, py: 0.55,
        bgcolor: P.white, border: `1px solid ${P.primary200}`,
        borderRadius: 999,
        fontSize: '0.74rem', fontWeight: bold ? 600 : 500, color: P.primary800,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 180ms ease, box-shadow 180ms ease',
        '&:hover': onClick ? { borderColor: P.tealBorder, boxShadow: '0 2px 8px rgba(15,118,110,0.08)' } : undefined,
      }}
    >
      {dotColor && (
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
      )}
      <span>{label}</span>
      {rightIcon}
    </Box>
  )

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      minHeight: '85vh', width: '100%',
      background: P.primary50,
      position: 'relative',
    }}>
      <OnboardingTour />

      {/* ════ Top bar ════ */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, md: 4 }, py: 2,
      }}>
        {/* Left : entreprise */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{
              width: 36, height: 36, borderRadius: 2.5,
              bgcolor: P.primary900, color: P.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 180ms ease',
              '&:hover': { transform: 'translateY(-1px)' },
            }}
          >
            <DashboardIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: P.primary900, lineHeight: 1.2 }}>
              {entrepriseNom}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: P.primary500, letterSpacing: 0.2 }}>
              {isCabinet
                ? `${cabinetStats.total} dossier(s) · FCFA / XOF`
                : `Exercice ${exerciceLabel} · FCFA / XOF`
              }
            </Typography>
          </Box>
        </Stack>

        {/* Right : pills + CTAs */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <TopPill dotColor={P.primary400} label={`Période · ${monthLabel} ${yearLabel}`} />
          <TopPill dotColor={totalAlerts > 0 ? P.error : P.success} label={`${totalAlerts} alerte${totalAlerts === 1 ? '' : 's'}`} bold />
          <TopPill dotColor="#a855f7" label="PROPH3T IA" bold />

          <Button
            size="small"
            onClick={() => navigate('/audit')}
            endIcon={<ArrowOutwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: 'none', fontWeight: 500, fontSize: '0.78rem',
              color: P.primary800, bgcolor: P.white,
              border: `1px solid ${P.primary200}`, borderRadius: 999,
              px: 1.5, py: 0.5,
              '&:hover': { borderColor: P.tealBorder, bgcolor: P.tealBg },
            }}
          >
            Découvrir
          </Button>

          <Button
            size="small"
            startIcon={<SwapIcon sx={{ fontSize: 16 }} />}
            onClick={handleChangeMode}
            sx={{
              textTransform: 'none', fontWeight: 500, fontSize: '0.78rem',
              color: P.primary800, bgcolor: P.white,
              border: `1px solid ${P.primary200}`, borderRadius: 999,
              px: 1.5, py: 0.5,
              '&:hover': { borderColor: P.tealBorder, bgcolor: P.tealBg },
            }}
          >
            Changer mode
          </Button>

          <NotificationCenter sx={{ p: 0.5 }} />

          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowOutwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => navigate(isCabinet ? '/dossiers' : '/balance')}
            sx={{
              bgcolor: P.primary900, color: P.white, borderRadius: 999,
              textTransform: 'none', fontWeight: 600, px: 2, py: 0.7,
              fontSize: '0.78rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: P.primary800,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.20)',
              },
            }}
          >
            {isCabinet ? 'Le portefeuille' : 'Le dossier'}
          </Button>
        </Stack>
      </Box>

      {/* ════ Hero ════ */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', px: 2, pt: { xs: 2, md: 3 }, pb: { xs: 3, md: 4 },
      }}>
        {/* Status tag */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.8,
          px: 1.5, py: 0.4, mb: 2.5,
        }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: P.success }} />
          <Typography sx={{
            fontSize: '0.72rem', fontWeight: 600, color: P.primary600,
            textTransform: 'uppercase', letterSpacing: 1.4,
          }}>
            {`Bienvenue · ${monthLabel} ${yearLabel}`}
          </Typography>
        </Box>

        {/* Brand 2-tone (Liass charcoal / Pilot teal) */}
        <Box sx={{
          fontFamily: "'Grand Hotel', cursive",
          fontSize: { xs: '3.5rem', md: '5.5rem' },
          fontWeight: 400, lineHeight: 1, mb: 2,
          display: 'inline-flex', alignItems: 'baseline', gap: 0.5,
        }}>
          <Box component="span" sx={{ color: P.primary900 }}>Liass{'’'}</Box>
          <Box component="span" sx={{ color: P.teal }}>Pilot</Box>
        </Box>

        <Typography sx={{
          maxWidth: 760, mx: 'auto',
          fontSize: { xs: '0.92rem', md: '1rem' }, color: P.primary600,
          lineHeight: 1.65, letterSpacing: 0.1,
        }}>
          {isCabinet ? (
            <>
              Pilotage intégral du portefeuille de dossiers fiscaux,
              {' '}<Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>OHADA · SYSCOHADA</Box>.
              {' '}Production de liasses, audit, télédéclaration en temps réel.
            </>
          ) : (
            <>
              Pilotage intégral du cycle
              {' '}<Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>Balance-to-Liasse</Box>,
              {' '}de l{'’'}import à la télédéclaration{' '}
              <Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>OHADA · SYSCOHADA</Box>.
              {' '}Données 100 % en temps réel.
            </>
          )}
        </Typography>
      </Box>

      {/* ════ KPI Row (4 cartes avec sparklines) ════ */}
      <Box sx={{
        px: { xs: 2, md: 4 }, pb: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, md: 2 },
      }}>
        <KPICard
          label={isCabinet ? 'Dossiers · Total' : "Chiffre d’affaires"}
          value={isCabinet ? String(cabinetStats.total) : caFmt.value}
          unit={isCabinet ? '' : `${caFmt.unit} FCFA`}
          sub={isCabinet ? `${cabinetStats.enCours} en cours · ${cabinetStats.exportees} exportée(s)` : `${stats.comptes} comptes · Exercice ${exerciceLabel}`}
          spark={sparkCA}
          sparkColor={P.teal}
        />
        <KPICard
          label={isCabinet ? 'En production' : 'Charges totales'}
          value={isCabinet ? String(cabinetStats.enCours) : chFmt.value}
          unit={isCabinet ? '' : `${chFmt.unit} FCFA`}
          sub={isCabinet ? `${cabinetStats.validees} validée(s) · ${dossiers.length - cabinetStats.total} archivé(s)` : 'Classe 6 · agrégation auto'}
          spark={sparkCharges}
          sparkColor={P.warning}
        />
        <KPICard
          label="Résultat net"
          value={`${financials.resultat >= 0 ? '+' : '-'}${resFmt.value}`}
          unit={`${resFmt.unit} FCFA`}
          sub={financials.resultat >= 0 ? 'Bénéfice exercice' : 'Déficit exercice'}
          spark={sparkResultat}
          sparkColor={financials.resultat >= 0 ? P.success : P.error}
          valueColor={financials.resultat >= 0 ? P.success : P.error}
        />
        <KPICard
          label="Conformité audit"
          value={`${stats.conformite}`}
          unit="/ 100"
          sub={ws.controleDone
            ? (ws.controleResult === 'passed' ? 'Validé · 0 bloquant' : `${ws.controleBloquants} bloquant(s)`)
            : 'Contrôle non lancé'
          }
          spark={sparkConformite}
          sparkColor={stats.conformite >= 80 ? P.success : stats.conformite >= 50 ? P.warning : P.error}
          valueColor={stats.conformite >= 80 ? P.success : stats.conformite >= 50 ? P.warning : P.primary900}
        />
      </Box>

      {/* ════ Insight + Side metrics ════ */}
      <Box sx={{
        px: { xs: 2, md: 4 }, pb: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
        gap: 2,
      }}>
        {/* PROPH3T Insight card (large left) */}
        <Paper elevation={0} sx={{
          p: { xs: 2.5, md: 3 }, bgcolor: P.white, border: `1px solid ${P.primary200}`,
          borderRadius: 3, display: 'flex', gap: 2,
        }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
            bgcolor: 'rgba(245, 158, 11, 0.12)', color: P.warning,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SparkleIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }} useFlexGap>
              <Chip
                label="Insight du jour"
                size="small"
                sx={{
                  height: 22, fontSize: '0.7rem', fontWeight: 600,
                  bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: P.primary500, letterSpacing: 0.4 }}>
                PROPH3T IA · CONFIANCE 86 %
              </Typography>
            </Stack>
            <Typography sx={{
              fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 600, color: P.primary900,
              lineHeight: 1.4, mb: 1,
            }}>
              {ws.controleDone
                ? (ws.controleBloquants > 0
                  ? `${ws.controleBloquants} contrôle(s) bloquant(s) à corriger avant la télédéclaration.`
                  : `Votre liasse est conforme à ${stats.conformite}%. Lancez la génération pour finaliser.`
                )
                : (bal.entries.length > 0
                  ? `${bal.entries.length} comptes importés. Lancez l’audit SYSCOHADA pour détecter les anomalies.`
                  : `Importez votre balance pour démarrer l’audit et la génération de la liasse.`
                )
              }
            </Typography>
            <Typography sx={{ color: P.primary500, fontSize: '0.84rem', mb: 2 }}>
              {`Recommandation : `}
              {ws.controleDone && ws.controleBloquants > 0
                ? 'corriger les écritures détectées dans le module Audit avant de relancer le contrôle.'
                : bal.entries.length > 0
                  ? 'vérifier les soldes 4xx (tiers) et 6xx (charges) avant la première liasse.'
                  : 'paramétrer l’exercice et importer la balance N pour activer l’ensemble des fonctionnalités.'
              }
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained" size="small" endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate(bal.entries.length > 0 ? '/audit' : '/import-balance')}
                sx={{
                  bgcolor: P.primary900, color: P.white,
                  textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                  borderRadius: 999, px: 2, py: 0.7,
                  '&:hover': { bgcolor: P.primary800 },
                }}
              >
                {bal.entries.length > 0 ? 'Voir l’audit' : 'Importer la balance'}
              </Button>
              <Button
                variant="outlined" size="small"
                sx={{
                  borderColor: P.primary200, color: P.primary700,
                  textTransform: 'none', fontWeight: 500, fontSize: '0.8rem',
                  borderRadius: 999, px: 2, py: 0.7,
                  '&:hover': { borderColor: P.teal, bgcolor: P.tealBg, color: P.tealDark },
                }}
              >
                Demander à PROPH3T
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Side metrics grid (right, 6 small cards 3×2) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 1.5,
        }}>
          <SmallMetric
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />} iconBg="rgba(245, 158, 11, 0.12)" iconColor={P.warning}
            label="Clôture" value={`J-${daysUntilClose}`}
            sub={closeUrgent ? 'Urgent' : closeSoon ? 'Approche' : 'À temps'}
            valueColor={closeUrgent ? P.error : closeSoon ? P.warning : P.primary900}
          />
          <SmallMetric
            icon={<VerifiedIcon sx={{ fontSize: 16 }} />} iconBg="rgba(21, 128, 61, 0.12)" iconColor={P.success}
            label="Audit"
            value={ws.controleDone ? (stats.conformite >= 90 ? 'A' : stats.conformite >= 80 ? 'A-' : stats.conformite >= 65 ? 'B' : 'C') : 'N/A'}
            sub={ws.controleDone ? `${stats.conformite} / 100` : 'Non lancé'}
          />
          <SmallMetric
            icon={<AlertIcon sx={{ fontSize: 16 }} />} iconBg="rgba(185, 28, 28, 0.12)" iconColor={P.error}
            label="Alertes" value={String(totalAlerts)}
            sub={totalAlerts === 0 ? 'Aucune' : totalAlerts === 1 ? '1 à traiter' : `${totalAlerts} à traiter`}
            valueColor={totalAlerts > 0 ? P.error : P.primary900}
          />
          <SmallMetric
            icon={<AssignmentIcon sx={{ fontSize: 16 }} />} iconBg="rgba(15, 118, 110, 0.12)" iconColor={P.teal}
            label="Exercices" value={String(nbExercices)} sub={`${nbBalances} balance(s)`}
          />
          <SmallMetric
            icon={<GavelIcon sx={{ fontSize: 16 }} />} iconBg="rgba(120, 53, 15, 0.12)" iconColor="#92400e"
            label="Comptes" value={String(stats.comptes)} sub="SYSCOHADA"
          />
          <SmallMetric
            icon={<WalletIcon sx={{ fontSize: 16 }} />} iconBg="rgba(168, 85, 247, 0.12)" iconColor="#7e22ce"
            label="Liasses" value={String(stats.declarations)}
            sub={stats.declarations > 0 ? 'générée(s)' : 'en attente'}
          />
        </Box>
      </Box>

      {/* ════ Bottom : Avancement gradient + PROPH3T Assistant card ════ */}
      <Box sx={{
        px: { xs: 2, md: 4 }, pb: 4,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
        gap: 2,
      }}>
        {/* Avancement de l'exercice (gradient progress) */}
        <Paper elevation={0} sx={{
          p: { xs: 2.5, md: 3 }, bgcolor: P.white, border: `1px solid ${P.primary200}`,
          borderRadius: 3,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
            <Box>
              <Typography sx={{
                fontSize: '0.7rem', fontWeight: 600, color: P.primary500,
                textTransform: 'uppercase', letterSpacing: 1.2,
              }}>
                Avancement de l{'’'}exercice
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: P.primary900, mt: 0.3 }}>
                {monthLabel} {yearLabel}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography sx={{
                fontSize: '1.6rem', fontWeight: 700, color: P.primary900,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
              }}>
                {stats.avancement}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: P.primary500 }}>
                % YTD
              </Typography>
            </Stack>
          </Stack>

          {/* Multi-color gradient progress bar */}
          <Box sx={{ position: 'relative', height: 10, borderRadius: 5, bgcolor: P.primary100, overflow: 'hidden', mb: 1.5 }}>
            <Box sx={{
              position: 'absolute', inset: 0,
              width: `${Math.max(2, stats.avancement)}%`,
              background: `linear-gradient(90deg, ${P.warning} 0%, ${P.warning} 40%, ${P.teal} 70%, ${P.success} 100%)`,
              borderRadius: 5,
              transition: 'width 400ms ease',
            }} />
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ fontSize: '0.78rem', color: P.primary500 }}>
            <Box><Box component="span" sx={{ color: P.primary600 }}>Reste : </Box><Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>{stepsTotal - stepsDone} étape(s)</Box></Box>
            <Box>·</Box>
            <Box><Box component="span" sx={{ color: P.primary600 }}>Comptes : </Box><Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>{stats.comptes}</Box></Box>
            <Box>·</Box>
            <Box><Box component="span" sx={{ color: P.primary600 }}>Clôture : </Box><Box component="span" sx={{ color: P.primary900, fontWeight: 600 }}>J-{daysUntilClose}</Box></Box>
          </Stack>
        </Paper>

        {/* PROPH3T Assistant card */}
        <Paper elevation={0} sx={{
          p: { xs: 2.5, md: 3 }, bgcolor: P.white, border: `1px solid ${P.primary200}`,
          borderRadius: 3, position: 'relative', display: 'flex', gap: 2, alignItems: 'flex-start',
        }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            bgcolor: 'rgba(168, 85, 247, 0.12)', color: '#7e22ce',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PsychologyIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontSize: '0.7rem', fontWeight: 600, color: P.primary500,
              textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.3,
            }}>
              PROPH3T IA · Assistant
            </Typography>
            <Typography sx={{
              fontSize: '0.95rem', fontWeight: 700, color: P.primary900, mb: 0.5, lineHeight: 1.3,
            }}>
              Analyse, commente et anticipe votre liasse fiscale.
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: P.primary500 }}>
              {`Modèle v3.4 · ${stats.comptes} comptes scannés · Garde-fous OHADA actifs`}
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <ArrowOutwardIcon sx={{ fontSize: 16, color: P.primary400 }} />
          </Box>
        </Paper>
      </Box>

      {/* ════ Bottom navigation pills ════ */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        pb: 3, gap: 1.2,
      }}>
        <Stack direction="row" spacing={1.2} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ gap: 1.2 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="outlined"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                borderColor: P.primary200, color: P.primary700, bgcolor: P.white,
                borderRadius: 999,
                textTransform: 'none', fontWeight: 600, px: 2.2, py: 0.75, fontSize: '0.82rem',
                transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: P.teal, color: P.tealDark, bgcolor: P.tealBg,
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
        <Typography sx={{ color: P.primary400, mt: 0.5, fontSize: '0.7rem', letterSpacing: 0.4 }}>
          Propulsé par Atlas Studio · {user?.firstName || user?.email || 'Admin'}
        </Typography>
      </Box>
    </Box>
  )
}

// ── Sub-components ──
interface KPICardProps {
  label: string
  value: string
  unit?: string
  sub?: string
  spark: number[]
  sparkColor: string
  valueColor?: string
}
const KPICard: React.FC<KPICardProps> = ({ label, value, unit, sub, spark, sparkColor, valueColor }) => (
  <Paper elevation={0} sx={{
    p: { xs: 2, md: 2.5 }, bgcolor: P.white, border: `1px solid ${P.primary200}`,
    borderRadius: 3, position: 'relative', overflow: 'hidden',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
    '&:hover': {
      borderColor: P.tealBorder,
      boxShadow: '0 6px 18px rgba(15, 118, 110, 0.08)',
      transform: 'translateY(-2px)',
    },
  }}>
    <Typography sx={{
      fontSize: '0.7rem', fontWeight: 600, color: P.primary500,
      textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.6,
    }}>
      {label}
    </Typography>
    <Stack direction="row" alignItems="baseline" spacing={0.6} sx={{ mb: 0.6 }}>
      <Typography sx={{
        fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 700,
        color: valueColor ?? P.primary900,
        lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
      }}>
        {value}
      </Typography>
      {unit && (
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: P.primary500 }}>
          {unit}
        </Typography>
      )}
    </Stack>
    {sub && (
      <Typography sx={{ fontSize: '0.74rem', color: P.primary500, mb: 1 }}>
        {sub}
      </Typography>
    )}
    <Box sx={{ mt: 1.2, opacity: 0.85 }}>
      <Sparkline data={spark} color={sparkColor} />
    </Box>
  </Paper>
)

interface SmallMetricProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
  sub?: string
  valueColor?: string
}
const SmallMetric: React.FC<SmallMetricProps> = ({ icon, iconBg, iconColor, label, value, sub, valueColor }) => (
  <Paper elevation={0} sx={{
    p: 1.5, bgcolor: P.white, border: `1px solid ${P.primary200}`,
    borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    minHeight: 96,
    transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
    '&:hover': {
      borderColor: P.tealBorder,
      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.06)',
      transform: 'translateY(-1px)',
    },
  }}>
    <Box sx={{
      width: 26, height: 26, borderRadius: 1.5, bgcolor: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{
        fontSize: '0.66rem', fontWeight: 600, color: P.primary500,
        textTransform: 'uppercase', letterSpacing: 1, mb: 0.2,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: '1.15rem', fontWeight: 700, color: valueColor ?? P.primary900,
        lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
      }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: '0.68rem', color: P.primary500, mt: 0.2 }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Paper>
)

export default ModernDashboard
