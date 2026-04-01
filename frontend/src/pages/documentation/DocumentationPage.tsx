/**
 * DocumentationPage.tsx — Aide en ligne FiscaSync / Liass'Pilot
 */
import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as DocsIcon,
  PlayCircleOutline as StartIcon,
  Assignment as LiasseIcon,
  CloudUpload as ImportIcon,
  BugReport as AuditIcon,
  Settings as SettingsIcon,
  HelpOutline as FaqIcon,
  Keyboard as ShortcutIcon,
  Info as InfoIcon,
  Gavel as FiscalIcon,
  Article as NoteIcon,
} from '@mui/icons-material'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface GuideSection {
  id: string
  title: string
  icon: React.ReactElement
  description: string
  steps: string[]
}

const guides: GuideSection[] = [
  {
    id: 'demarrage',
    title: 'Prise en main',
    icon: <StartIcon />,
    description: 'Premiers pas avec FiscaSync : configuration initiale et import de votre balance.',
    steps: [
      'Connectez-vous ou créez un compte depuis la page de connexion.',
      'Choisissez votre mode : Entreprise (mono-dossier) ou Cabinet (multi-dossiers).',
      'Complétez l\'assistant d\'onboarding : informations de l\'entreprise, exercice fiscal et régime OHADA.',
      'Importez votre balance générale au format Excel ou CSV via le module Import Balance.',
      'Vérifiez la balance importée dans la page Balance Générale.',
    ],
  },
  {
    id: 'import',
    title: 'Import de la balance',
    icon: <ImportIcon />,
    description: 'Importer, vérifier et corriger votre balance comptable.',
    steps: [
      'Accédez à Comptabilité > Import Balance.',
      'Glissez-déposez votre fichier Excel (.xlsx) ou CSV.',
      'FiscaSync détecte automatiquement les colonnes : N° compte, Libellé, Débit N, Crédit N, Débit N-1, Crédit N-1.',
      'Vérifiez que les totaux Débit / Crédit sont équilibrés.',
      'Si des comptes sont invalides, corrigez-les dans l\'éditeur intégré avant de valider.',
      'Un historique de vos imports est consultable dans Import > Historique.',
    ],
  },
  {
    id: 'liasse',
    title: 'Production de la liasse fiscale',
    icon: <LiasseIcon />,
    description: 'Générer la liasse SYSCOHADA Révisé (système normal) à partir de votre balance.',
    steps: [
      'Accédez à Production > Liasse Fiscale.',
      'Les feuillets (Bilan Actif, Bilan Passif, Compte de Résultat, etc.) sont alimentés automatiquement.',
      'Naviguez entre les onglets : chaque feuillet correspond à un tableau OHADA officiel.',
      'Les Notes Annexes (Notes 1 à 45+) sont calculées selon les mappings SYSCOHADA Révisé.',
      'Utilisez le zoom et le mode plein écran pour une lecture confortable.',
      'Exportez la liasse complète au format Excel via le bouton Exporter.',
    ],
  },
  {
    id: 'audit',
    title: 'Audit et contrôles',
    icon: <AuditIcon />,
    description: 'Contrôler la cohérence de vos données avec les 149 points de contrôle intégrés.',
    steps: [
      'Accédez à Conformité > Audit.',
      'Les contrôles sont organisés par niveaux : cohérence interne, cohérence inter-feuillets, conformité fiscale.',
      'Lancez un audit complet ou sélectionnez des contrôles spécifiques.',
      'Les anomalies sont classées par sévérité : Erreur (bloquant), Avertissement, Information.',
      'Cliquez sur une anomalie pour voir le détail et la recommandation de correction.',
      'Corrigez les écarts dans la balance ou les paramètres, puis relancez l\'audit.',
    ],
  },
  {
    id: 'notes',
    title: 'Notes annexes SYSCOHADA',
    icon: <NoteIcon />,
    description: 'Comprendre le calcul des notes annexes et les tableaux de passage.',
    steps: [
      'Les Notes 1 à 13 reprennent les tableaux de synthèse du bilan et du compte de résultat.',
      'Les Notes 14 à 28 détaillent les postes du bilan (immobilisations, amortissements, provisions, etc.).',
      'Les Notes 29 à 39 détaillent les postes du compte de résultat.',
      'Les Notes 40+ couvrent les informations complémentaires (effectifs, engagements, etc.).',
      'Chaque note est liée aux comptes SYSCOHADA via les mappings définis dans le plan comptable.',
      'Les montants N-1 sont alimentés automatiquement si la balance N-1 est disponible.',
    ],
  },
  {
    id: 'fiscal',
    title: 'Passage comptable → fiscal',
    icon: <FiscalIcon />,
    description: 'Réintégrations, déductions et calcul de l\'impôt BIC/IS.',
    steps: [
      'Le passage fiscal est accessible via les paramètres de l\'exercice.',
      'Renseignez les réintégrations extra-comptables (amendes, charges non déductibles, etc.).',
      'Renseignez les déductions (plus-values exonérées, produits non imposables, etc.).',
      'Le résultat fiscal est calculé : Résultat comptable + Réintégrations - Déductions.',
      'L\'IMF (Impôt Minimum Forfaitaire) et l\'IS sont calculés selon les taux en vigueur en Côte d\'Ivoire.',
      'Le montant d\'impôt dû est le maximum entre l\'IS calculé et l\'IMF.',
    ],
  },
  {
    id: 'export',
    title: 'Export Excel',
    icon: <CloudUpload />,
    description: 'Exporter la liasse complète au format Excel officiel.',
    steps: [
      'Depuis la page Liasse Fiscale, cliquez sur le bouton "Exporter Excel".',
      'Le fichier généré utilise le modèle officiel V9 (84 feuilles).',
      'Toutes les cellules sont injectées : en-têtes entreprise, feuillets comptables, notes annexes.',
      'Les contrôles inter-feuillets sont embarqués dans le fichier Excel.',
      'Le fichier est prêt pour le dépôt auprès de la DGI ou l\'envoi au commissaire aux comptes.',
    ],
  },
  {
    id: 'parametrage',
    title: 'Paramétrage',
    icon: <SettingsIcon />,
    description: 'Configurer l\'entreprise, l\'exercice fiscal et les préférences.',
    steps: [
      'Accédez à Administration > Paramétrage.',
      'Onglet Entreprise : raison sociale, RCCM, NCC, régime fiscal, adresse.',
      'Onglet Exercice : dates de début/fin, durée, exercice de référence N-1.',
      'Onglet Affichage : thème (clair/sombre), langue, format des nombres.',
      'Les paramètres sont sauvegardés automatiquement et appliqués à toute la liasse.',
    ],
  },
]

interface FaqItem {
  question: string
  answer: string
  tags: string[]
}

const faqItems: FaqItem[] = [
  {
    question: 'Comment importer une balance depuis mon logiciel comptable ?',
    answer: 'Exportez votre balance générale au format Excel (.xlsx) ou CSV depuis votre logiciel comptable. Le fichier doit contenir au minimum les colonnes : numéro de compte, libellé, débit et crédit. FiscaSync détecte automatiquement la structure du fichier.',
    tags: ['import', 'balance', 'excel'],
  },
  {
    question: 'Pourquoi certains montants sont à zéro dans la liasse ?',
    answer: 'Vérifiez que votre balance contient bien les comptes correspondants. Par exemple, si le poste "Immobilisations corporelles" est vide, c\'est que les comptes 21x/22x/23x ne sont pas présents dans votre balance. Consultez le plan comptable SYSCOHADA pour les correspondances.',
    tags: ['liasse', 'montants', 'comptes'],
  },
  {
    question: 'Comment corriger une erreur dans la balance après import ?',
    answer: 'Accédez à la page Balance Générale, identifiez le compte erroné et modifiez-le directement dans l\'éditeur. Vous pouvez aussi réimporter une balance corrigée — la nouvelle version remplacera l\'ancienne.',
    tags: ['balance', 'correction', 'import'],
  },
  {
    question: 'Quelle est la différence entre le mode Entreprise et Cabinet ?',
    answer: 'Le mode Entreprise gère un seul dossier fiscal. Le mode Cabinet permet de gérer plusieurs dossiers clients avec un sélecteur de dossier actif. Les fonctionnalités comptables et fiscales sont identiques dans les deux modes.',
    tags: ['mode', 'cabinet', 'entreprise'],
  },
  {
    question: 'Comment sont calculées les Notes Annexes ?',
    answer: 'Chaque note est alimentée par des mappings entre les comptes SYSCOHADA et les lignes du tableau. Par exemple, la Note 14 (Immobilisations) additionne les soldes des comptes 21x à 23x. Les variations sont calculées automatiquement entre N et N-1.',
    tags: ['notes', 'annexes', 'calcul'],
  },
  {
    question: 'L\'audit signale des erreurs de cohérence, que faire ?',
    answer: 'Les contrôles de cohérence vérifient par exemple que Total Actif = Total Passif, que les sous-totaux correspondent à la somme de leurs composantes, etc. Cliquez sur chaque erreur pour voir le détail. La plupart des écarts proviennent de comptes manquants ou mal classifiés dans la balance.',
    tags: ['audit', 'cohérence', 'erreurs'],
  },
  {
    question: 'Peut-on exporter la liasse pour la DGI ?',
    answer: 'Oui, l\'export Excel génère un fichier conforme au modèle officiel. Il est directement utilisable pour le dépôt physique ou la télédéclaration auprès de la Direction Générale des Impôts de Côte d\'Ivoire.',
    tags: ['export', 'DGI', 'télédéclaration'],
  },
  {
    question: 'Comment gérer l\'exercice N-1 ?',
    answer: 'Importez une balance contenant les colonnes N-1 (Débit N-1, Crédit N-1). FiscaSync utilisera ces montants pour remplir automatiquement les colonnes "Exercice précédent" dans tous les feuillets et notes annexes.',
    tags: ['N-1', 'exercice', 'balance'],
  },
  {
    question: 'Le résultat fiscal ne correspond pas, comment vérifier ?',
    answer: 'Le résultat fiscal = Résultat comptable + Réintégrations - Déductions. Vérifiez d\'abord le résultat comptable (Compte de Résultat, ligne "Résultat Net"). Puis vérifiez les réintégrations et déductions saisies dans le module de passage fiscal.',
    tags: ['fiscal', 'résultat', 'impôt'],
  },
  {
    question: 'Comment ajouter un collaborateur à mon cabinet ?',
    answer: 'En mode Cabinet, accédez à Administration > Sécurité & Accès. Vous pouvez inviter des collaborateurs par email et leur attribuer un rôle (administrateur, collaborateur, observateur). Chaque rôle définit les permissions d\'accès aux dossiers et fonctionnalités.',
    tags: ['cabinet', 'collaborateur', 'rôles'],
  },
]

const shortcuts = [
  { keys: 'Ctrl + S', action: 'Sauvegarder les modifications' },
  { keys: 'Ctrl + E', action: 'Exporter la liasse Excel' },
  { keys: 'Ctrl + P', action: 'Imprimer le feuillet courant' },
  { keys: 'Ctrl + F', action: 'Rechercher dans la page' },
  { keys: 'Ctrl + /', action: 'Ouvrir l\'aide contextuelle' },
  { keys: 'Esc', action: 'Fermer le dialogue / annuler' },
  { keys: 'Tab', action: 'Naviguer entre les champs' },
  { keys: '← →', action: 'Naviguer entre les onglets de la liasse' },
]

// Fix: import CloudUpload used in export guide
import { CloudUpload } from '@mui/icons-material'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DocumentationPage: React.FC = () => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false)

  // Filter guides and FAQ by search
  const filteredGuides = useMemo(() => {
    if (!search.trim()) return guides
    const q = search.toLowerCase()
    return guides.filter(
      g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.steps.some(s => s.toLowerCase().includes(q))
    )
  }, [search])

  const filteredFaq = useMemo(() => {
    if (!search.trim()) return faqItems
    const q = search.toLowerCase()
    return faqItems.filter(
      f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [search])

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 4, px: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <DocsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Documentation
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Guides, tutoriels et FAQ pour utiliser FiscaSync / Liass'Pilot
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Rechercher dans la documentation..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2 }}
        >
          <Tab label="Guides" icon={<StartIcon />} iconPosition="start" />
          <Tab label="FAQ" icon={<FaqIcon />} iconPosition="start" />
          <Tab label="Raccourcis" icon={<ShortcutIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab: Guides */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {filteredGuides.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucun guide ne correspond à votre recherche.
              </Typography>
            </Grid>
          )}
          {filteredGuides.map(guide => (
            <Grid item xs={12} key={guide.id}>
              <Accordion
                sx={{
                  borderRadius: '12px !important',
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {guide.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {guide.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {guide.description}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {guide.steps.map((step, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Chip
                            label={i + 1}
                            size="small"
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab: FAQ */}
      {tab === 1 && (
        <Box>
          {filteredFaq.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune question ne correspond à votre recherche.
            </Typography>
          )}
          {filteredFaq.map((faq, i) => (
            <Accordion
              key={i}
              expanded={expandedFaq === `faq-${i}`}
              onChange={(_, isExpanded) => setExpandedFaq(isExpanded ? `faq-${i}` : false)}
              sx={{
                mb: 1,
                borderRadius: '8px !important',
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                '&:before': { display: 'none' },
                boxShadow: 'none',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FaqIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                  {faq.answer}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {faq.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Tab: Raccourcis clavier */}
      {tab === 2 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Raccourcis clavier
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gagnez en productivité avec ces raccourcis.
            </Typography>
          </Box>
          <Divider />
          <List dense>
            {shortcuts.map((s, i) => (
              <React.Fragment key={i}>
                <ListItem sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon sx={{ minWidth: 140 }}>
                    <Chip
                      label={s.keys}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.text.primary, 0.06),
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={s.action} />
                </ListItem>
                {i < shortcuts.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Footer info */}
      <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <InfoIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Besoin d'aide supplémentaire ?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Contactez le support via le menu Support ou envoyez un email à support@fiscasync.com.
          La documentation est mise à jour régulièrement avec les nouvelles fonctionnalités.
        </Typography>
      </Box>
    </Box>
  )
}

export default DocumentationPage
