/**
 * Layout principal de l'application Liass'Pilot
 * Palette Grayscale monochrome
 * Sidebar adaptée au mode Entreprise / Cabinet
 */

import React, { useState } from 'react'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import '../../styles/liasse-fixes.css'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  Chip,
  Badge,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  Settings,
  AccountBalance,
  Assignment,
  Security,
  CloudUpload,
  Analytics,
  Home as HomeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  SupportAgent as SupportIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useModeStore } from '../../store/modeStore'
import { useDossierStore } from '../../store/dossierStore'
import NotificationCenter from '../notifications/NotificationCenter'
import ExerciceSelector from '../exercice/ExerciceSelector'
import UsageAssistant from '../assistant/UsageAssistant'
import { Proph3tFloatingBall } from '../prophet'
import { HelpOutline as HelpOutlineIcon, Tour as TourIcon } from '@mui/icons-material'
import GuidedTour from '../onboarding/GuidedTour'
import { useGuidedTour } from '@/hooks/useGuidedTour'
import { useTenantPlan } from '@/hooks/useTenantPlan'
import InstallAppButton from '../pwa/InstallAppButton'

const DRAWER_WIDTH = 270
const DRAWER_WIDTH_COLLAPSED = 68

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout } = useAuthStore()
  const { userMode, nomCabinet } = useModeStore()
  const { activeDossierId, getActiveDossier, deactivateDossier } = useDossierStore()

  const isCabinet = userMode === 'cabinet'
  const activeDossier = isCabinet ? getActiveDossier() : null

  // Demo mode: auto-collapse sidebar when ?demo=1 in URL or sessionStorage flag
  const isDemoMode = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('demo') === '1' || sessionStorage.getItem('liasspilot-demo-mode') === '1'
  }, [])

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(isDemoMode)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  // Guided tour: auto-launches on first visit, can be restarted manually
  const tour = useGuidedTour()

  // Plan / feature gating
  const { hasFeature } = useTenantPlan()
  const hasSupport = hasFeature('support_dedie')
  const canMultiSocietes = hasFeature('multi_societes_illimite')

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorElUser(null)
  }

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/login')
  }

  const handleBackToDossiers = () => {
    deactivateDossier()
    navigate('/dossiers')
  }

  /**
   * Bouton « Home » du sidebar : navigation contextuelle.
   *
   * Bug précédent : navigate('/dashboard') sans condition → en mode Cabinet
   * sans dossier actif, le DossierGuard interceptait et renvoyait vers
   * /dossiers, donnant l'impression que le bouton ne fonctionnait pas.
   *
   * Désormais on aiguille selon le contexte effectif :
   *   - Cabinet sans dossier actif    → /dossiers (la « home » du cabinet)
   *   - Cabinet avec dossier actif    → /dashboard du dossier
   *   - Entreprise                    → /dashboard
   *   - Non authentifié (cas limite) → / (Landing publique)
   */
  const handleHomeClick = () => {
    if (!user) {
      navigate('/')
      return
    }
    if (isCabinet && !activeDossierId) {
      navigate('/dossiers')
      return
    }
    navigate('/dashboard')
  }

  // ── Menu items ──
  // Cabinet mode without active dossier: show cabinet-level menu
  // Cabinet mode with active dossier: show dossier-level menu (same as entreprise)
  // Entreprise mode: show standard menu

  const cabinetGlobalItems = [
    { text: 'Dossiers Clients', icon: <FolderIcon />, path: '/dossiers', divider: 'Portefeuille' },
    { text: 'Veille Réglementaire', icon: <Analytics />, path: '/veille' },
    { text: 'Collaboration', icon: <BusinessIcon />, path: '/collaboration' },

    { text: 'Membres & Rôles', icon: <Settings />, path: '/settings/members', divider: 'Administration' },
    { text: 'Abonnement', icon: <AccountBalance />, path: '/settings/subscription' },
    { text: 'Invitations', icon: <BusinessIcon />, path: '/settings/invitations' },
    { text: 'Sécurité', icon: <Security />, path: '/security' },

    { text: 'Formation', icon: <SchoolIcon />, path: '/formation', divider: 'Aide' },
    { text: 'Support', icon: <SupportIcon />, path: '/support' },
  ]

  const dossierItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },

    // « Config. Fiscale » retiré de la sidebar : c'était un DOUBLON exact du
    // panneau « Config. Fiscale » de la page Configuration (même <FiscalConfigPage/>).
    // On y accède désormais via l'onglet dédié dans Configuration.
    { text: 'Configuration', icon: <Settings />, path: '/parametrage', divider: 'Configuration' },
    { text: 'Plans Comptables', icon: <AccountBalance />, path: '/plans-comptables' },
    { text: 'Points de Contrôle IA', icon: <Security />, path: '/control-points' },

    // Module unique « Import & Contrôle » à onglets (Import / Journal /
    // Consultation / Audit) — voir pages/import/ImportControle.tsx.
    { text: 'Import & Contrôle', icon: <CloudUpload />, path: '/import-controle', divider: 'Import & Contrôle' },

    // Module unique « Production Liasse » à onglets (Liasse / Contrôle / Génération / Templates)
    { text: 'Production Liasse', icon: <Assignment />, path: '/production-liasse', divider: 'Production Liasse' },

    // Module unique « Finalisation » à onglets (Télédéclaration / Reporting / Archives)
    { text: 'Finalisation', icon: <Analytics />, path: '/finalisation', divider: 'Finalisation' },

    { text: 'Support', icon: <SupportIcon />, path: '/support', divider: 'Aide' },
  ]

  const onDossiersPage = location.pathname === '/dossiers'
  const menuItems = (isCabinet && (!activeDossierId || onDossiersPage)) ? cabinetGlobalItems : dossierItems

  // ── Regroupement de la navigation en MODULES repliables ──
  // La liste plate (marquée par `divider`) devient des groupes-modules. Les
  // items avant le 1er divider (Tableau de bord) restent hors groupe (toujours
  // visibles). Le module contenant la route active est déplié par défaut.
  type NavItem = { text: string; icon: React.ReactNode; path: string; divider?: string }
  const navGroups = React.useMemo(() => {
    const groups: { label: string | null; items: NavItem[] }[] = []
    let current: { label: string | null; items: NavItem[] } = { label: null, items: [] }
    for (const it of menuItems as NavItem[]) {
      if (it.divider) {
        if (current.items.length) groups.push(current)
        current = { label: it.divider, items: [] }
      }
      current.items.push(it)
    }
    if (current.items.length) groups.push(current)
    return groups
  }, [menuItems])

  const isActivePath = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const groupOpen = (label: string | null, items: NavItem[]) => {
    if (label === null) return true
    if (label in openGroups) return openGroups[label]
    return items.some((it) => isActivePath(it.path))
  }

  const renderNavItem = (item: NavItem, isCollapsed: boolean) => (
    <ListItem disablePadding key={item.text}>
      <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow>
        <ListItemButton
          selected={isActivePath(item.path)}
          onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false) }}
          sx={{
            position: 'relative',
            borderRadius: 3,
            mx: isCollapsed ? 0.5 : 1,
            my: 0.25,
            py: 0.75,
            px: isCollapsed ? 1.5 : 2,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            color: P.primary300,
            transition: 'background-color 180ms cubic-bezier(0.4, 0, 0.2, 1), color 180ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""', position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
              borderRadius: 2, backgroundColor: 'transparent',
              transition: 'background-color 180ms cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&:hover': {
              backgroundColor: 'rgba(15, 118, 110, 0.12)',
              color: P.white,
              '& .MuiListItemIcon-root': { color: P.tealLight },
              '& .MuiListItemText-primary': { color: P.white },
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(15, 118, 110, 0.20)',
              color: P.white,
              '&::before': { backgroundColor: P.teal },
              '& .MuiListItemIcon-root': { color: P.tealLight },
              '& .MuiListItemText-primary': { color: P.white, fontWeight: 600 },
              '&:hover': { backgroundColor: 'rgba(15, 118, 110, 0.28)' },
            },
            '& .MuiListItemIcon-root': {
              color: P.primary400,
              minWidth: isCollapsed ? 0 : 40,
              transition: 'color 180ms cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .MuiListItemText-primary': { color: P.primary300 },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          {!isCollapsed && (
            <ListItemText
              primary={item.text}
              sx={{ '& .MuiTypography-root': { fontSize: '0.85rem', fontWeight: 500 } }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  )

  const renderDrawerContent = (isCollapsed: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo + Accueil */}
      <Toolbar sx={{ bgcolor: 'transparent', px: isCollapsed ? 1 : 2.5, py: 1, display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', flexShrink: 0, minHeight: '56px !important' }}>
        {!isCollapsed && (
          <Typography
            variant="h6"
            onClick={handleHomeClick}
            sx={{
              fontFamily: "'Grand Hotel', cursive",
              fontSize: '1.6rem',
              fontWeight: 400,
              color: P.white,
              letterSpacing: 0.5,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            Liass'Pilot
          </Typography>
        )}
        {/* Bouton Home contextuel : voir handleHomeClick().
            Tooltip dynamique selon mode + état dossier. */}
        {(() => {
          const homeLabel = isCabinet && !activeDossierId
            ? 'Mes dossiers'
            : 'Tableau de bord'
          return isCollapsed ? (
            <Tooltip title={homeLabel} placement="right">
              <IconButton
                onClick={handleHomeClick}
                size="small"
                sx={{
                  color: P.white,
                  '&:hover': { color: P.white, bgcolor: P.primary800 },
                }}
                aria-label={homeLabel}
              >
                <HomeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={homeLabel} placement="bottom">
              <IconButton
                onClick={handleHomeClick}
                size="small"
                sx={{
                  color: P.tealLight,
                  bgcolor: 'rgba(94,234,212,0.10)',
                  '&:hover': { color: P.white, bgcolor: P.teal },
                }}
                aria-label={homeLabel}
              >
                <HomeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        })()}
      </Toolbar>

      {/* ── Dossier context (cabinet mode with active dossier, hidden on /dossiers) ── */}
      {isCabinet && activeDossier && !onDossiersPage && !isCollapsed && (
        <Box sx={{ mx: 1, mb: 1 }}>
          {/* Nom du cabinet */}
          <Box sx={{ px: 2, py: 1, bgcolor: P.primary700, borderRadius: '8px 8px 0 0' }}>
            <Typography sx={{ fontSize: '0.6rem', color: P.primary400, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
              Cabinet
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: P.white, lineHeight: 1.3 }} noWrap>
              {nomCabinet || 'Mon Cabinet'}
            </Typography>
          </Box>
          {/* Dossier actif + exercice */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: P.primary800, borderRadius: '0 0 8px 8px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: P.white, lineHeight: 1.2 }} noWrap>
                {activeDossier.nomClient}
              </Typography>
              <Chip
                label={activeDossier.statut === 'en_cours' ? 'En cours' : activeDossier.statut === 'validee' ? 'Validée' : 'Exportée'}
                size="small"
                sx={{
                  height: 18, fontSize: '0.6rem', fontWeight: 700, ml: 0.5,
                  bgcolor: activeDossier.statut === 'en_cours' ? P.warning : P.success,
                  color: '#fff',
                }}
              />
            </Box>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, px: 1, py: 0.5, mb: 1,
            }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: P.white }}>
                Exercice {activeDossier.exerciceN}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: P.primary400 }}>
                — {activeDossier.regime === 'normal' ? 'Syst. Normal' : activeDossier.regime === 'simplifie' ? 'SMT' : 'Forfait'}
              </Typography>
            </Box>
            <Box
              onClick={handleBackToDossiers}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                cursor: 'pointer', color: P.primary400,
                '&:hover': { color: P.white },
                transition: 'color 0.15s',
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                Retour aux dossiers
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      {isCabinet && activeDossier && !onDossiersPage && isCollapsed && (
        <Tooltip title={`${activeDossier.nomClient} — Retour aux dossiers`} placement="right">
          <IconButton
            onClick={handleBackToDossiers}
            size="small"
            sx={{ mx: 'auto', my: 0.5, color: P.primary400, '&:hover': { color: P.white, bgcolor: P.primary800 } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* ── Cabinet global: nom cabinet + bouton nouveau dossier ── */}
      {isCabinet && (!activeDossierId || onDossiersPage) && !isCollapsed && (
        <Box sx={{ px: 1.5, mb: 1 }}>
          {/* Nom du cabinet */}
          <Box sx={{ px: 1.5, py: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.6rem', color: P.primary500, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
              Cabinet
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: P.white, lineHeight: 1.3 }} noWrap>
              {nomCabinet || 'Mon Cabinet'}
            </Typography>
          </Box>
          <Tooltip
            title={!canMultiSocietes ? 'Passez en plan Cabinet pour gerer un portefeuille illimite' : ''}
            placement="right"
          >
            <Box
              onClick={() => {
                if (!canMultiSocietes) {
                  navigate('/settings/billing')
                  return
                }
                navigate('/dossiers')
              }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: P.primary800, cursor: 'pointer',
                opacity: canMultiSocietes ? 1 : 0.55,
                '&:hover': { bgcolor: P.primary700 },
                transition: 'background-color 0.15s',
              }}
            >
              <AddIcon sx={{ fontSize: 18, color: P.white }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: P.white }}>
                Nouveau dossier
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      )}

      {!onDossiersPage && <ExerciceSelector collapsed={isCollapsed} />}

      <List sx={{ px: isCollapsed ? 0.25 : 0.5, overflowY: 'auto', flexGrow: 1 }}>
        {isCollapsed
          ? menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                {(item as NavItem).divider && index > 0 && (
                  <Divider sx={{ my: 1, mx: 1, borderColor: P.primary700, opacity: 0.5 }} />
                )}
                {renderNavItem(item as NavItem, true)}
              </React.Fragment>
            ))
          : navGroups.map((g) => {
              if (g.label === null) {
                return <React.Fragment key="__top">{g.items.map((it) => renderNavItem(it, false))}</React.Fragment>
              }
              // Module à item unique (ex. « Import & Contrôle » à onglets) :
              // rendu comme un lien simple, sans en-tête repliable.
              if (g.items.length === 1) {
                return <React.Fragment key={g.label}>{renderNavItem(g.items[0], false)}</React.Fragment>
              }
              const open = groupOpen(g.label, g.items)
              return (
                <Box key={g.label} sx={{ mt: 1 }}>
                  <ListItemButton
                    onClick={() => setOpenGroups((p) => ({ ...p, [g.label as string]: !open }))}
                    sx={{
                      borderRadius: 2, mx: 1, py: 0.5, px: 2,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                    }}
                  >
                    <ListItemText
                      primary={g.label}
                      sx={{ '& .MuiTypography-root': { fontWeight: 700, color: P.primary500, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.65rem' } }}
                    />
                    {open
                      ? <ExpandLessIcon sx={{ fontSize: 16, color: P.primary500 }} />
                      : <ExpandMoreIcon sx={{ fontSize: 16, color: P.primary500 }} />}
                  </ListItemButton>
                  <Collapse in={open} timeout="auto" unmountOnExit>
                    {g.items.map((it) => renderNavItem(it, false))}
                  </Collapse>
                </Box>
              )
            })}
      </List>

      {/* Collapse toggle button — desktop only */}
      {!isMobile && (
        <Box sx={{ flexShrink: 0, p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setCollapsed(c => !c)}
            size="small"
            sx={{
              color: P.primary400,
              '&:hover': { color: P.white, bgcolor: P.primary800 },
            }}
            title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  )

  // AppBar title
  const appBarTitle = isCabinet && activeDossier && !onDossiersPage
    ? `Liass'Pilot — ${activeDossier.nomClient}`
    : "Liass'Pilot"

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          // Surface PLEINE et nette (le glass translucide rendait un gris sale
          // car le flou échantillonnait le contenu gris derrière).
          bgcolor: '#ffffff',
          backgroundImage: 'none',
          color: 'text.primary',
          borderBottom: `1px solid ${P.primary200}`,
          boxShadow: '0 1px 3px rgba(28,25,23,0.04)',
          zIndex: theme.zIndex.drawer + 1,
          transition: 'width 0.25s ease, margin-left 0.25s ease',
        }}
      >
        <Toolbar sx={{ bgcolor: '#ffffff', color: 'text.primary' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}
          >
            {appBarTitle}
          </Typography>

          {/* Install PWA button \u2014 visible uniquement si l'app n'est pas d\u00e9j\u00e0
              install\u00e9e et que le navigateur supporte beforeinstallprompt
              (Chrome/Edge/Brave) ou est iOS Safari. Permet \u00e0 l'utilisateur
              d'\u00e9pingler Liass'Pilot \u00e0 sa barre des t\u00e2ches / \u00e9cran d'accueil. */}
          <Box sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}>
            <InstallAppButton variant="outlined" size="small" />
          </Box>

          <NotificationCenter />

          <Tooltip title="Visite guid\u00e9e">
            <IconButton onClick={tour.restart} color="inherit" data-tour="help">
              <TourIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={hasSupport ? 'Support prioritaire 24h' : 'Aide & FAQ'}>
            <IconButton onClick={() => setHelpOpen(true)} color="inherit">
              <Badge
                variant="dot"
                invisible={!hasSupport}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#EF9F27',
                    boxShadow: '0 0 0 2px #fff',
                  },
                }}
              >
                <HelpOutlineIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'text.primary', color: P.white, fontSize: '0.85rem', fontWeight: 600 }}
            >
              {user?.firstName?.[0] || user?.email?.[0] || <AccountCircle />}
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleUserMenuClose} disabled>
              <Typography variant="subtitle2" color="text.secondary">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose} disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        data-tour="sidebar"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.25s ease' }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: P.primary900,
              backgroundImage:
                'radial-gradient(120% 55% at 50% 0%, rgba(15,118,110,0.14) 0%, rgba(15,118,110,0) 55%), linear-gradient(180deg, #211d1b 0%, #1c1917 45%, #0e0c0b 100%)',
              borderRight: 'none',
            },
          }}
        >
          {renderDrawerContent(false)}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              position: 'relative',
              backgroundColor: P.primary900,
              backgroundImage:
                'radial-gradient(120% 55% at 50% 0%, rgba(15,118,110,0.14) 0%, rgba(15,118,110,0) 55%), linear-gradient(180deg, #211d1b 0%, #1c1917 45%, #0e0c0b 100%)',
              height: '100vh',
              borderRight: `1px solid ${P.primary800}`,
              transition: 'width 0.25s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {renderDrawerContent(collapsed)}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'grey.50',
          // Voile d'ambiance teal en tête du canvas de travail — profondeur
          // subtile plutôt qu'un aplat gris « mort ».
          backgroundImage:
            'radial-gradient(90% 60% at 50% 0%, rgba(15,118,110,0.05) 0%, rgba(15,118,110,0) 55%)',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 1, overflow: 'auto', minHeight: 0 }}>
          {children}
        </Box>
      </Box>

      <UsageAssistant open={helpOpen} onClose={() => setHelpOpen(false)} />

      <GuidedTour open={tour.isOpen} onClose={tour.close} />
      <Proph3tFloatingBall />
    </Box>
  )
}

export default Layout
