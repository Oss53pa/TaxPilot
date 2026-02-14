/**
 * TaxPilot - Landing Page
 * Style minimaliste avec palette Grayscale monochrome
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Stack,
  Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Security as AuditIcon,
  Analytics as ReportIcon,
  ArrowForward as ArrowIcon,
  NotificationsNone as NotifIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const ModernDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    declarations: 0,
    comptes: 0,
    conformite: 0,
    avancement: 0,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        declarations: 18,
        comptes: 247,
        conformite: 92,
        avancement: 67.5,
      })
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const diffTime = endOfYear.getTime() - now.getTime()
  const daysUntilClose = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  const entrepriseNom = 'TAXPILOT DEMO SARL'
  const exercice = '2024'

  const navItems = [
    { label: 'Application', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { label: 'Balance', icon: <BalanceIcon fontSize="small" />, path: '/balance' },
    { label: 'Audit', icon: <AuditIcon fontSize="small" />, path: '/audit' },
    { label: 'Rapports', icon: <ReportIcon fontSize="small" />, path: '/reporting' },
  ]

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

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '85vh',
      bgcolor: '#ffffff',
      position: 'relative',
    }}>
      {/* Header bar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        borderBottom: '1px solid #e5e5e5',
      }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#171717', letterSpacing: 0.5, lineHeight: 1.2 }}
          >
            {entrepriseNom}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#a3a3a3', letterSpacing: 0.3 }}
          >
            Exercice {exercice}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <NotifIcon sx={{ fontSize: 18, color: '#a3a3a3' }} />
            <Chip
              label="3"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: '#ef4444',
                color: '#fff',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: '#171717', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {user?.username || 'Admin'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#a3a3a3' }}>
              Clôture:
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#171717', lineHeight: 1 }}
            >
              J-{daysUntilClose}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: '#171717',
              color: '#fff',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              '&:hover': { bgcolor: '#262626' },
            }}
          >
            Accéder
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
        gap: 2,
        px: 2,
      }}>
        <Typography
          sx={{
            fontFamily: "'Grand Hotel', cursive",
            fontSize: { xs: '3rem', md: '4.5rem' },
            fontWeight: 400,
            color: '#171717',
            lineHeight: 1.2,
            mb: 0,
          }}
        >
          TaxPilot
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#a3a3a3',
            fontSize: '1.1rem',
            letterSpacing: 1,
            mb: 4,
          }}
        >
          Gestion Fiscale SYSCOHADA
        </Typography>

        {/* Stats Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={0}
          divider={
            <Box
              sx={{
                width: '1px',
                height: 60,
                bgcolor: '#e5e5e5',
                alignSelf: 'center',
                display: { xs: 'none', sm: 'block' },
              }}
            />
          }
          sx={{ gap: { xs: 3, sm: 0 } }}
        >
          {[
            { value: stats.declarations, label: 'Déclarations' },
            { value: stats.comptes, label: 'Comptes' },
            { value: stats.conformite, label: 'Conformité' },
            { value: `${stats.avancement}%`, label: 'Avancement' },
          ].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center', px: { xs: 2, sm: 5, md: 7 } }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 300, color: '#171717', fontSize: { xs: '2.5rem', md: '3rem' } }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: '#a3a3a3', mt: 0.5 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Bottom Navigation */}
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
                borderColor: '#e5e5e5',
                color: '#525252',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 500,
                px: 2.5,
                py: 0.8,
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: '#a3a3a3',
                  bgcolor: '#fafafa',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: '#d4d4d4', mt: 1, fontSize: '0.7rem' }}
        >
          Powered by TaxPilot
        </Typography>
      </Box>
    </Box>
  )
}

export default ModernDashboard
