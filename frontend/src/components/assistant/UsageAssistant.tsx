/**
 * UsageAssistant — Guide d'utilisation intégré
 * Drawer contextuel avec recherche, guides par catégorie et navigation
 */

import React, { useState, useMemo } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material'
import {
  Close as CloseIcon,
  Search as SearchIcon,
  SearchOff as SearchOffIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  LightbulbOutlined as TipIcon,
  RocketLaunch as RocketIcon,
  Settings as SettingsIcon,
  CloudUpload as ImportIcon,
  Security as AuditIcon,
  Assignment as LiasseIcon,
  Send as SendIcon,
  Bolt as BoltIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  CloudDownload as TemplateIcon,
  Analytics as ReportingIcon,
  Archive as ArchiveIcon,
  Groups as CollabIcon,
  Extension as IntegrationIcon,
  CalendarMonth as CalendarIcon,
  Lock as SecurityIcon,
  Checklist as ChecklistIcon,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Guide {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  steps: string[]
  tips: string[]
  path: string
  category: string
}

interface UsageAssistantProps {
  open: boolean
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'demarrage', label: 'Demarrage rapide', icon: <RocketIcon fontSize="small" /> },
  { key: 'configuration', label: 'Configuration', icon: <SettingsIcon fontSize="small" /> },
  { key: 'import', label: 'Import & Balance', icon: <ImportIcon fontSize="small" /> },
  { key: 'audit', label: 'Audit & Controle', icon: <AuditIcon fontSize="small" /> },
  { key: 'liasse', label: 'Production Liasse', icon: <LiasseIcon fontSize="small" /> },
  { key: 'finalisation', label: 'Finalisation', icon: <SendIcon fontSize="small" /> },
  { key: 'avance', label: 'Avance', icon: <BoltIcon fontSize="small" /> },
]

/* ------------------------------------------------------------------ */
/*  Guides data                                                        */
/* ------------------------------------------------------------------ */

const GUIDES: Guide[] = [
  // --- Demarrage ---
  {
    id: 'workflow',
    title: 'Flux de travail complet',
    icon: <RocketIcon />,
    description: 'Les 9 etapes pour produire votre liasse fiscale de A a Z, du parametrage a la teledeclaration.',
    steps: [
      'Configurez votre exercice fiscal dans Parametrage',
      'Importez votre plan comptable SYSCOHADA',
      'Importez votre balance comptable (Excel/CSV)',
      'Verifiez la balance dans Consultation Balance',
      'Effectuez le rapprochement bancaire',
      'Lancez l\'audit IA pour detecter les anomalies',
      'Generez la liasse fiscale automatiquement',
      'Controlez la liasse (coherence inter-feuillets)',
      'Teledeclarez ou exportez au format requis',
    ],
    tips: [
      'Suivez les etapes dans l\'ordre pour eviter les erreurs',
      'Le tableau de bord affiche votre progression globale',
    ],
    path: '/dashboard',
    category: 'demarrage',
  },

  // --- Configuration ---
  {
    id: 'parametrage',
    title: 'Parametrage general',
    icon: <SettingsIcon />,
    description: 'Configurez votre entreprise, exercice fiscal, devise et options de calcul.',
    steps: [
      'Accedez a la page Parametrage',
      'Renseignez les informations de l\'entreprise (RCCM, NIF, adresse)',
      'Definissez l\'exercice fiscal (dates debut/fin)',
      'Configurez la devise et les options de calcul',
      'Sauvegardez les parametres',
    ],
    tips: [
      'Les parametres sont sauvegardes automatiquement',
      'Vous pouvez modifier l\'exercice fiscal a tout moment',
    ],
    path: '/parametrage',
    category: 'configuration',
  },
  {
    id: 'plans-comptables',
    title: 'Plans comptables',
    icon: <AccountBalanceIcon />,
    description: 'Consultez et gerez le plan comptable SYSCOHADA revise avec tous les comptes normalises.',
    steps: [
      'Accedez a Plans Comptables',
      'Parcourez les classes de comptes (1 a 9)',
      'Utilisez la recherche pour trouver un compte specifique',
      'Consultez les details de chaque compte (numero, intitule, nature)',
    ],
    tips: [
      'Le plan SYSCOHADA revise est pre-charge avec tous les comptes',
      'Vous pouvez filtrer par classe ou rechercher par numero/intitule',
    ],
    path: '/plans-comptables',
    category: 'configuration',
  },
  {
    id: 'control-points',
    title: 'Points de controle IA',
    icon: <ChecklistIcon />,
    description: 'Configurez les regles de controle automatique pour l\'audit IA de votre comptabilite.',
    steps: [
      'Accedez a Points de Controle IA',
      'Consultez les regles predefinies par categorie',
      'Activez ou desactivez des regles selon vos besoins',
      'Ajustez les seuils de tolerance si necessaire',
      'Les regles seront appliquees lors de l\'audit automatique',
    ],
    tips: [
      'Les regles couvrent : equilibre, coherence, completude, conformite',
      'Commencez avec les regles par defaut, puis affinez progressivement',
    ],
    path: '/control-points',
    category: 'configuration',
  },

  // --- Import & Balance ---
  {
    id: 'import-balance',
    title: 'Import de balance',
    icon: <ImportIcon />,
    description: 'Importez votre balance comptable au format Excel ou CSV avec mapping automatique des colonnes.',
    steps: [
      'Accedez a Import Balance',
      'Glissez-deposez votre fichier Excel/CSV ou cliquez pour parcourir',
      'Verifiez le mapping automatique des colonnes',
      'Corrigez les correspondances si necessaire',
      'Validez l\'import pour charger les donnees',
    ],
    tips: [
      'Les formats supportes : .xlsx, .xls, .csv',
      'Le mapping detecte automatiquement les colonnes Debit, Credit, Solde',
      'Vous pouvez reimporter pour mettre a jour les donnees',
    ],
    path: '/import-balance',
    category: 'import',
  },
  {
    id: 'import-history',
    title: 'Journal des imports',
    icon: <HistoryIcon />,
    description: 'Consultez l\'historique de tous vos imports avec statut, date et details.',
    steps: [
      'Accedez au Journal des Imports',
      'Consultez la liste des imports passes',
      'Filtrez par date, statut ou type',
      'Cliquez sur un import pour voir les details',
    ],
    tips: [
      'Chaque import conserve une trace complete pour l\'audit',
      'Vous pouvez identifier rapidement les imports en erreur',
    ],
    path: '/import-history',
    category: 'import',
  },
  {
    id: 'balance',
    title: 'Consultation balance',
    icon: <AccountBalanceIcon />,
    description: 'Visualisez votre balance comptable importee avec filtres et recherche par compte.',
    steps: [
      'Accedez a Consultation Balance',
      'Parcourez la liste des comptes avec soldes',
      'Utilisez la recherche pour trouver un compte',
      'Filtrez par classe, nature ou mouvement',
      'Exportez la balance si necessaire',
    ],
    tips: [
      'Les totaux Debit/Credit doivent etre equilibres',
      'Les anomalies sont signalees visuellement en rouge',
    ],
    path: '/balance',
    category: 'import',
  },
  // --- Audit & Controle ---
  {
    id: 'audit',
    title: 'Audit & corrections',
    icon: <AuditIcon />,
    description: 'Lancez l\'audit IA de votre comptabilite et corrigez les anomalies detectees.',
    steps: [
      'Accedez a Audit & Corrections',
      'Lancez l\'analyse IA sur la balance importee',
      'Consultez les anomalies detectees par severite',
      'Pour chaque anomalie, consultez l\'explication et la suggestion',
      'Appliquez les corrections recommandees ou ignorez',
    ],
    tips: [
      'L\'audit verifie : equilibre, coherence, conformite SYSCOHADA',
      'Les anomalies critiques sont a traiter en priorite',
      'Vous pouvez relancer l\'audit apres corrections',
    ],
    path: '/audit',
    category: 'audit',
  },
  {
    id: 'validation-liasse',
    title: 'Controle de liasse',
    icon: <ChecklistIcon />,
    description: 'Verifiez la coherence inter-feuillets de votre liasse fiscale avant soumission.',
    steps: [
      'Accedez a Controle de Liasse',
      'Lancez le controle de coherence',
      'Consultez les resultats par feuillet',
      'Corrigez les incoherences signalees',
      'Validez lorsque tous les controles passent au vert',
    ],
    tips: [
      'Le controle verifie les recoupements entre feuillets (ex: Bilan ↔ Compte de resultat)',
      'Un feuillet au vert signifie qu\'il est coherent avec les autres',
    ],
    path: '/validation-liasse',
    category: 'audit',
  },
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    icon: <DashboardIcon />,
    description: 'Vue synthetique de votre avancement : indicateurs cles, alertes et progression.',
    steps: [
      'Le tableau de bord s\'affiche automatiquement a la connexion',
      'Consultez les indicateurs cles (soldes, ecarts, taux de completion)',
      'Verifiez les alertes et notifications en cours',
      'Cliquez sur un indicateur pour acceder au detail',
    ],
    tips: [
      'Le tableau de bord se met a jour en temps reel',
      'Utilisez-le comme point de depart pour votre travail quotidien',
    ],
    path: '/dashboard',
    category: 'audit',
  },

  // --- Production Liasse ---
  {
    id: 'generation',
    title: 'Generation automatique',
    icon: <DescriptionIcon />,
    description: 'Generez automatiquement les feuillets de la liasse fiscale a partir de votre balance.',
    steps: [
      'Accedez a Generation Auto',
      'Verifiez que la balance est importee et a jour',
      'Selectionnez le type de liasse (Systeme Normal / SMT)',
      'Lancez la generation automatique',
      'Consultez les feuillets generes',
    ],
    tips: [
      'La generation utilise le plan de regroupement SYSCOHADA',
      'Vous pouvez regenerer a tout moment si la balance change',
    ],
    path: '/generation',
    category: 'liasse',
  },
  {
    id: 'liasse-fiscale',
    title: 'Liasse fiscale',
    icon: <LiasseIcon />,
    description: 'Consultez, editez et finalisez votre liasse fiscale feuillet par feuillet.',
    steps: [
      'Accedez a Liasse Fiscale',
      'Parcourez les feuillets (Bilan Actif, Bilan Passif, Compte de Resultat...)',
      'Verifiez les montants remplis automatiquement',
      'Ajustez manuellement si necessaire',
      'Marquez les feuillets comme valides',
    ],
    tips: [
      'Les feuillets sont pre-remplis a partir de la generation automatique',
      'Les modifications manuelles sont tracees pour l\'audit',
    ],
    path: '/liasse-fiscale',
    category: 'liasse',
  },
  {
    id: 'templates',
    title: 'Templates export',
    icon: <TemplateIcon />,
    description: 'Gerez les modeles d\'export pour generer la liasse aux formats requis (PDF, Excel, XML).',
    steps: [
      'Accedez a Templates Export',
      'Consultez les templates disponibles',
      'Selectionnez le format souhaite (PDF, Excel, EDI)',
      'Configurez les options d\'export',
      'Telechargez le fichier genere',
    ],
    tips: [
      'Le format EDI est requis pour la teledeclaration DGI',
      'Vous pouvez creer des templates personnalises',
    ],
    path: '/templates',
    category: 'liasse',
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: <DescriptionIcon />,
    description: 'Gerez tous les documents generes : liasses, rapports, annexes et justificatifs.',
    steps: [
      'Accedez a Documents',
      'Parcourez les documents par type et date',
      'Utilisez la recherche pour trouver un document',
      'Telechargez ou partagez les documents',
    ],
    tips: [
      'Les documents sont classes automatiquement par exercice',
      'Vous pouvez ajouter des pieces justificatives manuellement',
    ],
    path: '/documents',
    category: 'liasse',
  },

  // --- Finalisation ---
  {
    id: 'teledeclaration',
    title: 'Teledeclaration',
    icon: <SendIcon />,
    description: 'Soumettez votre liasse fiscale a la DGI par voie electronique.',
    steps: [
      'Accedez a Teledeclaration',
      'Verifiez que la liasse est validee (tous les controles au vert)',
      'Selectionnez le mode d\'envoi (e-Filing direct ou export)',
      'Renseignez les identifiants DGI si necessaire',
      'Soumettez et conservez l\'accuse de reception',
    ],
    tips: [
      'La teledeclaration n\'est possible qu\'apres validation complete',
      'L\'accuse de reception est stocke automatiquement dans les archives',
    ],
    path: '/teledeclaration',
    category: 'finalisation',
  },
  {
    id: 'reporting',
    title: 'Reporting',
    icon: <ReportingIcon />,
    description: 'Generez des rapports analytiques et des tableaux de bord de suivi.',
    steps: [
      'Accedez a Reporting',
      'Selectionnez le type de rapport souhaite',
      'Configurez les filtres (periode, perimetre)',
      'Generez le rapport',
      'Exportez en PDF ou Excel',
    ],
    tips: [
      'Les rapports predefinissent couvrent les principaux indicateurs comptables',
      'Vous pouvez comparer plusieurs exercices',
    ],
    path: '/reporting',
    category: 'finalisation',
  },
  {
    id: 'archives',
    title: 'Archives',
    icon: <ArchiveIcon />,
    description: 'Accedez aux liasses et documents des exercices anterieurs.',
    steps: [
      'Accedez a Archives',
      'Selectionnez l\'exercice fiscal',
      'Parcourez les documents archives',
      'Telechargez les fichiers necessaires',
    ],
    tips: [
      'Les archives sont conservees pour la duree legale (10 ans)',
      'Chaque archive inclut la liasse, les rapports et les accuses',
    ],
    path: '/archives',
    category: 'finalisation',
  },

  // --- Avance ---
  {
    id: 'consolidation',
    title: 'Consolidation',
    icon: <AccountBalanceIcon />,
    description: 'Consolidez les comptes de plusieurs entites pour un groupe d\'entreprises.',
    steps: [
      'Accedez a Consolidation',
      'Ajoutez les entites du groupe',
      'Importez les balances de chaque entite',
      'Definissez les eliminations intra-groupe',
      'Lancez la consolidation automatique',
    ],
    tips: [
      'La consolidation supporte les methodes : integration globale, proportionnelle, mise en equivalence',
      'Les ecritures d\'elimination sont generees automatiquement',
    ],
    path: '/consolidation',
    category: 'avance',
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: <CollabIcon />,
    description: 'Travaillez en equipe avec gestion des roles, commentaires et suivi des modifications.',
    steps: [
      'Accedez a Collaboration',
      'Invitez des collaborateurs par email',
      'Attribuez les roles (admin, comptable, auditeur, lecteur)',
      'Utilisez les commentaires pour communiquer sur les ecritures',
      'Suivez les modifications dans le journal d\'activite',
    ],
    tips: [
      'Les roles definissent les permissions d\'acces et de modification',
      'Les commentaires sont horodates et lies aux ecritures',
    ],
    path: '/collaboration',
    category: 'avance',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: <IntegrationIcon />,
    description: 'Connectez vos outils comptables, bancaires et fiscaux via API.',
    steps: [
      'Accedez a Integrations',
      'Parcourez les connecteurs disponibles',
      'Configurez la connexion (cles API, identifiants)',
      'Testez la connexion',
      'Activez la synchronisation automatique',
    ],
    tips: [
      'Les integrations supportees : banques, logiciels comptables, DGI',
      'La synchronisation peut etre automatique ou manuelle',
    ],
    path: '/integrations',
    category: 'avance',
  },
  {
    id: 'calendar',
    title: 'Calendrier fiscal',
    icon: <CalendarIcon />,
    description: 'Suivez les echeances fiscales et comptables avec rappels automatiques.',
    steps: [
      'Accedez au Calendrier Fiscal',
      'Consultez les echeances a venir',
      'Configurez les rappels (email, notification)',
      'Marquez les echeances traitees',
    ],
    tips: [
      'Les echeances sont pre-configurees selon le pays OHADA',
      'Vous recevez un rappel 7 jours avant chaque echeance',
    ],
    path: '/calendar',
    category: 'avance',
  },
  {
    id: 'security',
    title: 'Securite',
    icon: <SecurityIcon />,
    description: 'Gerez la securite de votre compte : authentification, sessions et journaux d\'acces.',
    steps: [
      'Accedez a Securite',
      'Activez l\'authentification a deux facteurs (2FA)',
      'Consultez les sessions actives',
      'Verifiez le journal des connexions',
      'Configurez les politiques de mot de passe',
    ],
    tips: [
      'L\'activation du 2FA est fortement recommandee',
      'Le journal d\'acces permet de detecter les connexions suspectes',
    ],
    path: '/security',
    category: 'avance',
  },
]

/* ------------------------------------------------------------------ */
/*  Helper: find category for current page                             */
/* ------------------------------------------------------------------ */

function getCategoryForPath(pathname: string): string | null {
  const guide = GUIDES.find(g => pathname === g.path || pathname.startsWith(g.path + '/'))
  return guide?.category ?? null
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const UsageAssistant: React.FC<UsageAssistantProps> = ({ open, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [expandedCats, setExpandedCats] = useState<string[]>([])

  // Current page category for auto-expand
  const currentCategory = getCategoryForPath(location.pathname)
  const currentGuide = GUIDES.find(
    g => location.pathname === g.path || location.pathname.startsWith(g.path + '/')
  )

  // Effective expanded categories (include current category if no manual interaction)
  const effectiveExpanded = useMemo(() => {
    if (expandedCats.length > 0) return expandedCats
    return currentCategory ? [currentCategory] : []
  }, [expandedCats, currentCategory])

  // Filtered guides
  const filteredGuides = useMemo(() => {
    if (!search.trim()) return GUIDES
    const q = search.toLowerCase()
    return GUIDES.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.steps.some(s => s.toLowerCase().includes(q)) ||
      g.tips.some(t => t.toLowerCase().includes(q))
    )
  }, [search])

  // Group by category
  const groupedGuides = useMemo(() => {
    const map = new Map<string, Guide[]>()
    for (const g of filteredGuides) {
      const list = map.get(g.category) || []
      list.push(g)
      map.set(g.category, list)
    }
    return map
  }, [filteredGuides])

  const handleAccordionToggle = (cat: string) => {
    setExpandedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  // Reset search when opening
  React.useEffect(() => {
    if (open) {
      setSearch('')
      setExpandedCats([])
    }
  }, [open])

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 440,
          bgcolor: P.primary50,
          color: P.primary900,
          borderLeft: `1px solid ${P.primary200}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${P.primary200}`,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: P.primary900, fontSize: '1.1rem' }}>
            Guide d'utilisation
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: P.primary500 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search */}
        <Box sx={{ px: 2.5, py: 1.5, flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher dans le guide..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: P.primary400, fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: P.white,
                borderRadius: 2,
                '& fieldset': { borderColor: P.primary200 },
                '&:hover fieldset': { borderColor: P.primary400 },
                '&.Mui-focused fieldset': { borderColor: P.primary500 },
              },
            }}
          />
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
          {/* Current page guide — highlighted */}
          {currentGuide && !search.trim() && (
            <Box sx={{ px: 1, mb: 1.5 }}>
              <Typography
                variant="overline"
                sx={{ color: P.primary500, fontWeight: 700, letterSpacing: 1.2, fontSize: '0.65rem', px: 0.5 }}
              >
                Page actuelle
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  p: 2,
                  bgcolor: P.white,
                  borderRadius: 2,
                  border: `1.5px solid ${P.info}`,
                  boxShadow: `0 0 0 3px ${alpha(P.info, 0.08)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: P.info, display: 'flex' }}>{currentGuide.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: P.primary900 }}>
                    {currentGuide.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: P.primary600, mb: 1.5, lineHeight: 1.5 }}>
                  {currentGuide.description}
                </Typography>

                {/* Steps */}
                <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 1 }}>
                  {currentGuide.steps.map((step, i) => (
                    <Typography
                      component="li"
                      key={i}
                      variant="body2"
                      sx={{ color: P.primary700, mb: 0.3, lineHeight: 1.5, fontSize: '0.82rem' }}
                    >
                      {step}
                    </Typography>
                  ))}
                </Box>

                {/* Tips */}
                {currentGuide.tips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.5 }}>
                    <TipIcon sx={{ fontSize: '0.95rem', color: P.warning, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: P.primary600, fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {tip}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Empty state */}
          {filteredGuides.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <SearchOffIcon sx={{ fontSize: 48, color: P.primary300, mb: 1 }} />
              <Typography sx={{ color: P.primary500, fontWeight: 500 }}>
                Aucun resultat
              </Typography>
              <Typography variant="body2" sx={{ color: P.primary400, mt: 0.5 }}>
                Essayez un autre terme de recherche
              </Typography>
            </Box>
          )}

          {/* Category accordions */}
          {CATEGORIES.filter(cat => groupedGuides.has(cat.key)).map(cat => {
            const guides = groupedGuides.get(cat.key)!
            const isExpanded = search.trim()
              ? true // expand all when searching
              : effectiveExpanded.includes(cat.key)

            return (
              <Accordion
                key={cat.key}
                expanded={isExpanded}
                onChange={() => !search.trim() && handleAccordionToggle(cat.key)}
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: 'transparent',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    minHeight: 40,
                    px: 1.5,
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: alpha(P.primary900, 0.04) },
                  },
                  '& .MuiAccordionSummary-content': { my: 0.5 },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: P.primary500 }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: P.primary600, display: 'flex' }}>{cat.icon}</Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: P.primary800 }}>
                      {cat.label}
                    </Typography>
                    <Chip
                      label={guides.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: alpha(P.primary900, 0.08),
                        color: P.primary600,
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                  <List disablePadding>
                    {guides.map(guide => (
                      <ListItem key={guide.id} disablePadding sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            p: 1.5,
                            bgcolor: P.white,
                            borderRadius: 2,
                            border: `1px solid ${P.primary200}`,
                            transition: 'border-color 0.15s',
                            '&:hover': { borderColor: P.primary400 },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                            <Box sx={{ color: P.primary600, display: 'flex', fontSize: '1.1rem' }}>
                              {guide.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: P.primary900 }}>
                              {guide.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: P.primary600, mb: 1, lineHeight: 1.5, fontSize: '0.8rem' }}
                          >
                            {guide.description}
                          </Typography>

                          {/* Steps */}
                          <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 0.75 }}>
                            {guide.steps.map((step, i) => (
                              <Typography
                                component="li"
                                key={i}
                                variant="body2"
                                sx={{ color: P.primary700, mb: 0.2, lineHeight: 1.4, fontSize: '0.78rem' }}
                              >
                                {step}
                              </Typography>
                            ))}
                          </Box>

                          {/* Tips */}
                          {guide.tips.map((tip, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.3 }}>
                              <TipIcon sx={{ fontSize: '0.85rem', color: P.warning, mt: 0.2 }} />
                              <Typography
                                variant="body2"
                                sx={{ color: P.primary600, fontSize: '0.75rem', lineHeight: 1.4 }}
                              >
                                {tip}
                              </Typography>
                            </Box>
                          ))}

                          {/* Navigate button */}
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              endIcon={<ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
                              onClick={() => handleNavigate(guide.path)}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: P.info,
                                px: 1.5,
                                '&:hover': { bgcolor: alpha(P.info, 0.08) },
                              }}
                            >
                              Acceder
                            </Button>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      </Box>
    </Drawer>
  )
}

export default UsageAssistant
