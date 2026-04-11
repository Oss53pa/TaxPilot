import React, { useState, useMemo } from 'react'
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  TextField, InputAdornment, Chip, Stack, Paper, Button,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  Email as EmailIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface FAQItem {
  id: string
  category: 'demarrage' | 'balance' | 'liasse' | 'audit' | 'fiscal' | 'export' | 'compte' | 'technique'
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  // Demarrage
  {
    id: 'D01',
    category: 'demarrage',
    question: 'Comment cr\u00e9er mon premier dossier client ?',
    answer: 'Apr\u00e8s la connexion, l\'assistant d\'onboarding vous guide en 4 \u00e9tapes : choix du mode (Cabinet ou Entreprise), informations soci\u00e9t\u00e9, exercice fiscal et r\u00e9gime. Vous pouvez aussi cr\u00e9er un dossier manuellement depuis la page Dossiers > Nouveau dossier.',
  },
  {
    id: 'D02',
    category: 'demarrage',
    question: 'Quelle est la diff\u00e9rence entre mode Cabinet et mode Entreprise ?',
    answer: 'Le mode Cabinet vous permet de g\u00e9rer plusieurs dossiers clients (id\u00e9al pour les experts-comptables). Le mode Entreprise est mono-soci\u00e9t\u00e9 et plus simple. Vous choisissez le mode lors de l\'onboarding initial et pouvez le changer plus tard.',
  },
  {
    id: 'D03',
    category: 'demarrage',
    question: 'Puis-je tester sans cr\u00e9er de compte ?',
    answer: 'Oui, visitez la page /demo qui propose une visite guid\u00e9e compl\u00e8te avec des donn\u00e9es fictives (SARL AKWABA) sans cr\u00e9ation de compte n\u00e9cessaire.',
  },

  // Balance
  {
    id: 'B01',
    category: 'balance',
    question: 'Quels formats de balance sont accept\u00e9s ?',
    answer: 'LiassPilot accepte les formats Excel (.xlsx, .xls) et CSV (s\u00e9parateurs ; ou ,). Les colonnes attendues sont : num\u00e9ro de compte (2 \u00e0 8 chiffres), libell\u00e9, d\u00e9bit, cr\u00e9dit. La d\u00e9tection des colonnes est automatique.',
  },
  {
    id: 'B02',
    category: 'balance',
    question: 'Ma balance n\'est pas \u00e9quilibr\u00e9e, que faire ?',
    answer: 'L\'audit de balance d\u00e9tecte automatiquement les d\u00e9s\u00e9quilibres. Consultez le rapport d\'audit pour identifier les comptes probl\u00e9matiques. Les contr\u00f4les de niveau 0 (Structurel) et niveau 1 (Fondamental) doivent \u00eatre OK pour permettre la g\u00e9n\u00e9ration de la liasse.',
  },
  {
    id: 'B03',
    category: 'balance',
    question: 'Comment importer la balance N-1 pour les comparatifs ?',
    answer: 'Lors de l\'import, s\u00e9lectionnez l\'ann\u00e9e (N ou N-1) avant de t\u00e9l\u00e9verser le fichier. Si vous importez les deux dans le m\u00eame fichier, ajoutez les colonnes "solde N-1 d\u00e9bit/cr\u00e9dit" et le syst\u00e8me les d\u00e9tectera automatiquement.',
  },
  {
    id: 'B04',
    category: 'balance',
    question: 'Que faire si un compte n\'est pas reconnu dans le plan SYSCOHADA ?',
    answer: 'Une alerte appara\u00eet pour chaque compte non reconnu. Vous pouvez : (1) corriger le num\u00e9ro de compte dans votre balance source, (2) ajouter un sous-compte personnalis\u00e9 dans le plan, ou (3) ignorer le compte si non significatif.',
  },

  // Liasse
  {
    id: 'L01',
    category: 'liasse',
    question: 'Combien de pages contient la liasse fiscale g\u00e9n\u00e9r\u00e9e ?',
    answer: 'La liasse compl\u00e8te SYSCOHADA Syst\u00e8me Normal contient 80+ pages : Bilan Actif, Bilan Passif, Compte de R\u00e9sultat, SIG, TFT, Notes Annexes (jusqu\'\u00e0 40 notes), Passage Fiscal et annexes sp\u00e9cifiques au pays.',
  },
  {
    id: 'L02',
    category: 'liasse',
    question: 'Pourquoi le bouton "G\u00e9n\u00e9rer la liasse" est-il bloqu\u00e9 ?',
    answer: 'La g\u00e9n\u00e9ration est bloqu\u00e9e tant que des contr\u00f4les BLOQUANT \u00e9chouent. Consultez la page Audit pour voir les erreurs \u00e0 corriger. Une fois tous les contr\u00f4les bloquants r\u00e9solus, le bouton se d\u00e9bloquera.',
  },
  {
    id: 'L03',
    category: 'liasse',
    question: 'Puis-je modifier manuellement les valeurs de la liasse g\u00e9n\u00e9r\u00e9e ?',
    answer: 'Oui, certaines pages permettent la saisie manuelle (notamment les notes annexes qualitatives). Les valeurs calcul\u00e9es depuis la balance restent verrouill\u00e9es par d\u00e9faut pour garantir la coh\u00e9rence.',
  },
  {
    id: 'L04',
    category: 'liasse',
    question: 'Une fois g\u00e9n\u00e9r\u00e9e, la liasse est-elle modifiable ?',
    answer: 'La liasse en statut BROUILLON peut \u00eatre modifi\u00e9e. Une fois VALIDEE, elle est verrouill\u00e9e via un hash SHA-256 pour garantir son int\u00e9grit\u00e9 (obligation OHADA). Vous pouvez n\u00e9anmoins cr\u00e9er une nouvelle version.',
  },

  // Audit
  {
    id: 'A01',
    category: 'audit',
    question: 'Que sont les 129 contr\u00f4les PROPH3T ?',
    answer: 'Ce sont 129 r\u00e8gles automatiques qui v\u00e9rifient la coh\u00e9rence comptable et fiscale de votre balance, r\u00e9parties en 9 niveaux : Structurel (S), Fondamental (F), Conformit\u00e9 OHADA (C), Sens des comptes (SNS), Inter-comptes (IA), Year-over-Year, \u00c9tats financiers (EF), Fiscal (FI) et Archive (AR).',
  },
  {
    id: 'A02',
    category: 'audit',
    question: 'Quelle est la diff\u00e9rence entre BLOQUANT, AVERTISSEMENT et INFORMATION ?',
    answer: 'BLOQUANT : emp\u00eache la g\u00e9n\u00e9ration de la liasse (\u00e9quilibre bilan, comptes fondamentaux). AVERTISSEMENT : signal\u00e9 mais n\'emp\u00eache pas la g\u00e9n\u00e9ration (anomalies probables). INFORMATION : indications p\u00e9dagogiques.',
  },
  {
    id: 'A03',
    category: 'audit',
    question: 'L\'audit prend-il en compte mon pays OHADA ?',
    answer: 'Oui, certains contr\u00f4les sont sp\u00e9cifiques au pays (taux IS, IMF, plafond v\u00e9hicules, etc.). Configurez votre pays dans Param\u00e9trage > Configuration fiscale.',
  },

  // Fiscal
  {
    id: 'F01',
    category: 'fiscal',
    question: 'Comment est calcul\u00e9 l\'imp\u00f4t sur les soci\u00e9t\u00e9s (IS) ?',
    answer: 'IS = Max(IS_brut, IMF) o\u00f9 IS_brut = R\u00e9sultat fiscal \u00d7 Taux IS du pays, et IMF = Max(CA \u00d7 Taux IMF, Minimum forfaitaire). Le r\u00e9sultat fiscal int\u00e8gre les r\u00e9int\u00e9grations et d\u00e9ductions du passage fiscal.',
  },
  {
    id: 'F02',
    category: 'fiscal',
    question: 'Quels sont les 17 pays OHADA support\u00e9s ?',
    answer: 'B\u00e9nin, Burkina Faso, Cameroun, Centrafrique, Comores, Congo, C\u00f4te d\'Ivoire, Gabon, Guin\u00e9e, Guin\u00e9e-Bissau, Guin\u00e9e \u00c9quatoriale, Mali, Niger, RD Congo, S\u00e9n\u00e9gal, Tchad, Togo. Chaque pays a ses propres taux IS, IMF, TVA et r\u00e8gles de r\u00e9int\u00e9gration.',
  },
  {
    id: 'F03',
    category: 'fiscal',
    question: 'Comment ajouter mes propres r\u00e9int\u00e9grations fiscales ?',
    answer: 'Dans la page Passage Fiscal, vous pouvez saisir manuellement des r\u00e9int\u00e9grations et d\u00e9ductions sp\u00e9cifiques en plus des 7 r\u00e9int\u00e9grations automatiques (amendes, cadeaux, dons, frais r\u00e9ception, etc.).',
  },
  {
    id: 'F04',
    category: 'fiscal',
    question: 'Puis-je g\u00e9rer les reports d\u00e9ficitaires ?',
    answer: 'Oui, le report d\u00e9ficitaire est automatiquement appliqu\u00e9 si vous avez enregistr\u00e9 des d\u00e9ficits ant\u00e9rieurs. Configurez la dur\u00e9e maximale de report (3 \u00e0 5 ans selon le pays) dans la configuration fiscale.',
  },

  // Export
  {
    id: 'E01',
    category: 'export',
    question: 'Quels formats d\'export sont disponibles ?',
    answer: 'Excel (mod\u00e8le DGI conforme avec 80+ onglets), PDF (impression A4 prof\u00e9ssionnelle), et XML pour la t\u00e9l\u00e9d\u00e9claration aux administrations fiscales.',
  },
  {
    id: 'E02',
    category: 'export',
    question: 'Mon export Excel est-il accept\u00e9 par la DGI ?',
    answer: 'Oui, l\'export Excel suit le mod\u00e8le officiel SYSCOHADA r\u00e9vis\u00e9 2017 avec mapping cellule par cellule. Chaque rubrique atterrit dans la bonne cellule du mod\u00e8le DGI.',
  },
  {
    id: 'E03',
    category: 'export',
    question: 'Comment imprimer une page de la liasse ?',
    answer: 'Utilisez le bouton "Aper\u00e7u / Imprimer" disponible sur chaque page. Vous pouvez choisir le format (A3/A4/A5), l\'orientation et zoomer avant impression.',
  },

  // Compte
  {
    id: 'C01',
    category: 'compte',
    question: 'Comment changer mon mot de passe ?',
    answer: 'Allez dans Param\u00e9trage > Mon profil > S\u00e9curit\u00e9 > Changer le mot de passe. Si vous l\'avez oubli\u00e9, utilisez "Mot de passe oubli\u00e9" sur la page de connexion.',
  },
  {
    id: 'C02',
    category: 'compte',
    question: 'Comment ajouter un collaborateur \u00e0 mon cabinet ?',
    answer: 'Dans Param\u00e9trage > \u00c9quipe, cliquez sur "Inviter un membre". L\'invitation est envoy\u00e9e par email avec un lien de cr\u00e9ation de compte. Vous pouvez attribuer un r\u00f4le (Admin, Collaborateur, Lecteur).',
  },
  {
    id: 'C03',
    category: 'compte',
    question: 'Comment passer \u00e0 un plan sup\u00e9rieur ?',
    answer: 'Les abonnements sont g\u00e9r\u00e9s depuis Atlas Studio (https://atlasstudio.app/pricing). Cliquez sur "Mettre \u00e0 niveau" depuis n\'importe quelle alerte de quota dans LiassPilot.',
  },
  {
    id: 'C04',
    category: 'compte',
    question: 'Mes donn\u00e9es sont-elles sauvegard\u00e9es ?',
    answer: 'Oui, toutes vos donn\u00e9es sont stock\u00e9es dans Supabase avec sauvegarde automatique. Les liasses valid\u00e9es sont conserv\u00e9es 10 ans (obligation OHADA Art. 24).',
  },

  // Technique
  {
    id: 'T01',
    category: 'technique',
    question: 'L\'application fonctionne-t-elle hors ligne ?',
    answer: 'Partiellement. Vous pouvez consulter et \u00e9diter les donn\u00e9es d\u00e9j\u00e0 charg\u00e9es. Les actions n\u00e9cessitant Supabase (synchronisation, g\u00e9n\u00e9ration cloud) requi\u00e8rent une connexion.',
  },
  {
    id: 'T02',
    category: 'technique',
    question: 'Sur quels navigateurs LiassPilot fonctionne-t-il ?',
    answer: 'Chrome, Firefox, Edge et Safari (versions r\u00e9centes). Pour une exp\u00e9rience optimale sur les tableaux denses, nous recommandons une r\u00e9solution minimum de 1280px (desktop ou tablette).',
  },
  {
    id: 'T03',
    category: 'technique',
    question: 'L\'application est-elle s\u00e9curis\u00e9e ?',
    answer: 'Oui : authentification Supabase avec tokens JWT, isolation stricte des donn\u00e9es par dossier (Row Level Security), chiffrement TLS 1.3, hash SHA-256 pour les liasses valid\u00e9es, conformit\u00e9 RGPD.',
  },
]

const CATEGORIES: Array<{ id: FAQItem['category'] | 'tous'; label: string }> = [
  { id: 'tous', label: 'Toutes' },
  { id: 'demarrage', label: 'D\u00e9marrage' },
  { id: 'balance', label: 'Balance' },
  { id: 'liasse', label: 'Liasse' },
  { id: 'audit', label: 'Audit' },
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'export', label: 'Export' },
  { id: 'compte', label: 'Compte' },
  { id: 'technique', label: 'Technique' },
]

const FAQPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<FAQItem['category'] | 'tous'>('tous')

  const filtered = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      const matchCategory = category === 'tous' || item.category === category
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [search, category])

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <HelpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700}>Foire aux questions</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Trouvez rapidement les r\u00e9ponses aux questions les plus fr\u00e9quentes sur LiassPilot.
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Rechercher une question..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            onClick={() => setCategory(cat.id)}
            color={category === cat.id ? 'primary' : 'default'}
            variant={category === cat.id ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Stack>

      {filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Aucune question ne correspond \u00e0 votre recherche.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {filtered.map((item) => (
            <Accordion key={item.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <Paper sx={{ mt: 5, p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Vous n\'avez pas trouv\u00e9 votre r\u00e9ponse ?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Notre \u00e9quipe support et nos formations sont l\u00e0 pour vous aider.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={() => navigate('/support')}
          >
            Contacter le support
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/formation')}
          >
            Voir les formations
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default FAQPage
