/**
 * Page de Garde - Liasse Fiscale SYSCOHADA
 * Les champs entreprise sont auto-remplis depuis props.entreprise (injecté par withBackendData)
 */

import React, { useState } from 'react'
import { formatDateFR } from '@/utils/formatting'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AssignmentTurnedIn as ValidIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Error as ErrorIcon,
  Description as DocIcon,
  Group as GroupIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise } from '@/types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// Dictionnaires de mapping code → label (partagés avec Couverture.tsx)
const formesJuridiquesMap: Record<string, string> = {
  SARL: 'SARL',
  SA: 'SA',
  SAS: 'SAS',
  EI: 'EI',
  SNC: 'SNC',
  GIE: 'GIE',
  SCS: 'SCS',
  COOP: 'Coopérative',
  ASSOCIATION: 'Association',
}

const paysOhadaMap: Record<string, string> = {
  BJ: 'Bénin',
  BF: 'Burkina Faso',
  CM: 'Cameroun',
  CF: 'République Centrafricaine',
  KM: 'Comores',
  CG: 'Congo',
  CI: "Côte d'Ivoire",
  DJ: 'Djibouti',
  GA: 'Gabon',
  GN: 'Guinée',
  GW: 'Guinée-Bissau',
  GQ: 'Guinée Équatoriale',
  ML: 'Mali',
  NE: 'Niger',
  CD: 'République Démocratique du Congo',
  SN: 'Sénégal',
  TD: 'Tchad',
  TG: 'Togo',
}

const regimesMap: Record<string, string> = {
  REEL_NORMAL: 'Régime Normal d\'Imposition',
  REEL_SIMPLIFIE: 'Régime Simplifié d\'Imposition',
  FORFAITAIRE: 'Régime Forfaitaire',
  MICRO: 'Régime des Micro-Entreprises',
  RNI: 'Régime Normal d\'Imposition',
  RSI: 'Régime Simplifié d\'Imposition',
  RME: 'Régime des Micro-Entreprises',
}

// formatDateFR imported from '@/utils/formatting' (using '' as default for empty fields)

/** Calcule la durée en mois entre deux dates ISO */
function calcDureeMois(debut?: string, fin?: string): number {
  if (!debut || !fin) return 12
  const d = new Date(debut)
  const f = new Date(fin)
  return Math.round((f.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30))
}

// Types de pages de garde
export type PageGardeVariant = 'default' | 'dgi_ins' | 'bic' | 'bnc' | 'ba' | 'etat301' | 'etat302' | 'etat3'

interface PageGardeSYSCOHADAProps {
  variant?: PageGardeVariant
  entreprise?: Entreprise
}

const GARDE_CONFIG: Record<PageGardeVariant, {
  titre: string
  sousTitre: string
  description: string
  documents: Record<string, string>
}> = {
  default: {
    titre: 'ÉTATS FINANCIERS ANNUELS',
    sousTitre: 'SYSTÈME COMPTABLE OHADA',
    description: 'Liasse fiscale complète selon le référentiel SYSCOHADA révisé',
    documents: {
      bilan: 'Bilan (Actif et Passif)',
      compteResultat: 'Compte de résultat',
      tft: 'Tableau de flux de trésorerie',
      notes: 'Notes annexes (1 à 35)',
      rapportCAC: 'Rapport du Commissaire aux Comptes',
      rapportGestion: 'Rapport de gestion',
      pv: 'PV d\'Assemblée Générale',
    }
  },
  dgi_ins: {
    titre: 'DÉCLARATION STATISTIQUE ET FISCALE',
    sousTitre: 'DGI - INS',
    description: 'Déclaration annuelle destinée à la Direction Générale des Impôts et à l\'Institut National de la Statistique',
    documents: {
      dsf: 'Déclaration Statistique et Fiscale (DSF)',
      bilanFiscal: 'Bilan fiscal certifié',
      resultatFiscal: 'Compte de résultat fiscal',
      tableauPassage: 'Tableau de passage comptabilité-fiscalité',
      annexesStat: 'Annexes statistiques (effectifs, investissements)',
      attestation: 'Attestation de l\'expert-comptable',
      questionnaire: 'Questionnaire INS annuel',
    }
  },
  bic: {
    titre: 'BÉNÉFICES INDUSTRIELS ET COMMERCIAUX',
    sousTitre: 'DÉCLARATION BIC',
    description: 'Déclaration des bénéfices industriels et commerciaux - Régime du réel normal d\'imposition',
    documents: {
      declarationBIC: 'Déclaration annuelle des résultats BIC',
      bilanActif: 'Bilan - Actif',
      bilanPassif: 'Bilan - Passif',
      resultat: 'Compte de résultat',
      tableauAmort: 'Tableau des amortissements',
      tableauProv: 'Tableau des provisions',
      tableauResultat: 'Détermination du résultat fiscal',
      relevePrix: 'Relevé des prix de transfert',
    }
  },
  bnc: {
    titre: 'BÉNÉFICES NON COMMERCIAUX',
    sousTitre: 'DÉCLARATION BNC',
    description: 'Déclaration des bénéfices des professions libérales et activités non commerciales',
    documents: {
      declarationBNC: 'Déclaration annuelle des résultats BNC',
      recettes: 'État des recettes encaissées',
      depenses: 'État des dépenses professionnelles',
      immobilisations: 'Registre des immobilisations et amortissements',
      creancesDettes: 'État des créances et dettes',
      resultatFiscal: 'Détermination du résultat fiscal BNC',
      attestation: 'Attestation du déclarant',
    }
  },
  ba: {
    titre: 'BÉNÉFICES AGRICOLES',
    sousTitre: 'DÉCLARATION BA',
    description: 'Déclaration des bénéfices agricoles pour les exploitations soumises au régime du réel',
    documents: {
      declarationBA: 'Déclaration annuelle des résultats BA',
      bilanExploitation: 'Bilan de l\'exploitation agricole',
      resultatExploitation: 'Compte de résultat de l\'exploitation',
      stocks: 'État des stocks (cheptel, récoltes, approvisionnements)',
      immobAgricoles: 'Immobilisations agricoles et amortissements',
      subventions: 'État des subventions agricoles perçues',
      resultatFiscal: 'Détermination du résultat fiscal BA',
    }
  },
  etat301: {
    titre: 'ÉTAT 301',
    sousTitre: 'HONORAIRES, COMMISSIONS, COURTAGES ET RISTOURNES',
    description: 'État récapitulatif des honoraires, commissions, courtages, ristournes et autres rémunérations versées à des tiers au cours de l\'exercice',
    documents: {
      etat301: 'État 301 - Formulaire principal',
      listeHonoraires: 'Liste détaillée des honoraires versés',
      listeCommissions: 'Liste détaillée des commissions versées',
      listeCourtages: 'Liste des courtages et ristournes',
      justificatifs: 'Justificatifs de paiement (références)',
      attestation: 'Attestation de sincérité',
    }
  },
  etat302: {
    titre: 'ÉTAT 302',
    sousTitre: 'FOURNISSEURS',
    description: 'État récapitulatif des achats et services auprès des fournisseurs dont le montant annuel excède le seuil réglementaire (1 000 000 FCFA)',
    documents: {
      etat302: 'État 302 - Formulaire principal',
      listeFournisseurs: 'Liste des fournisseurs (> seuil)',
      detailAchats: 'Détail des achats par fournisseur',
      detailServices: 'Détail des services par prestataire',
      rapprochement: 'Rapprochement avec la comptabilité',
      attestation: 'Attestation de sincérité',
    }
  },
  etat3: {
    titre: 'ÉTAT 3',
    sousTitre: 'DÉCLARATION COMPLÉMENTAIRE',
    description: 'Déclaration complémentaire regroupant les informations additionnelles requises par l\'administration fiscale',
    documents: {
      etat3: 'État 3 - Formulaire principal',
      detailCharges: 'Détail des charges déductibles',
      detailProduits: 'Détail des produits non imposables',
      mouvementsCapital: 'Mouvements de capitaux propres',
      operationsExcep: 'Opérations exceptionnelles de l\'exercice',
      engagements: 'État des engagements hors bilan',
      attestation: 'Attestation de conformité',
    }
  },
}

// Style commun pour les champs auto-remplis (lecture seule)
const readOnlyFieldSx = {
  '& .MuiInputBase-input': {
    color: 'text.primary',
    WebkitTextFillColor: 'unset',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'action.hover',
  },
}

const PageGardeSYSCOHADA: React.FC<PageGardeSYSCOHADAProps> = ({ variant = 'default', entreprise }) => {
  const config = GARDE_CONFIG[variant]
  const theme = useTheme()
  const ent = entreprise

  // Initialize documentsJoints from config
  const initialDocs: Record<string, boolean> = {}
  Object.keys(config.documents).forEach((key, i) => {
    initialDocs[key] = i < 4 // First 4 checked by default
  })

  // --- Champs auto-remplis depuis entreprise (lecture seule) ---
  const raisonSociale = ent?.raison_sociale || ''
  const formeJuridique = ent?.forme_juridique || ''
  const formeJuridiqueLabel = formesJuridiquesMap[formeJuridique] || formeJuridique
  const rccm = ent?.rccm || ''
  const ifu = ent?.ifu || ''
  const numeroComptable = ent?.numero_comptable || ''
  const adresse = ent?.adresse_ligne1 || ''
  const ville = ent?.ville || ''
  const pays = paysOhadaMap[ent?.pays || ''] || ent?.pays || ''
  const telephone = ent?.telephone || ''
  void (ent?.email || '')
  const dateDebut = ent?.exercice_debut || `${new Date().getFullYear()}-01-01`
  const dateFin = ent?.exercice_fin || `${new Date().getFullYear()}-12-31`
  const exerciceComptable = dateDebut.substring(0, 4)
  const dureeExercice = calcDureeMois(dateDebut, dateFin)
  const regimeFiscal = regimesMap[ent?.regime_imposition || ''] || ent?.regime_imposition || ''
  const centreImpots = ent?.centre_impots || ''
  const dateDepot = ent?.date_depot || ''
  const nomDeclarant = ent?.nom_dirigeant || ''
  const qualiteDeclarant = ent?.fonction_dirigeant || ''
  const telephoneDeclarant = ent?.telephone_dirigeant || ''
  const emailDeclarant = ent?.email_dirigeant || ''

  // --- Champs éditables localement (non liés au paramétrage) ---
  const [documentsJoints, setDocumentsJoints] = useState<Record<string, boolean>>(initialDocs)

  const handleDocumentToggle = (doc: string) => {
    setDocumentsJoints(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  // Validation
  const isValid = raisonSociale && rccm && ifu && nomDeclarant

  return (
    <Box>
      {/* Info auto-remplissage */}
      {ent && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          Les champs d'identification, exercice et déclarant sont automatiquement remplis depuis
          le paramétrage de l'entreprise. Modifiez-les dans <strong>Paramétrage &gt; Entreprise</strong>.
        </Alert>
      )}

      {/* En-tête officiel */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center',
          borderRadius: 2,
          '@media print': {
            backgroundColor: 'transparent',
            color: 'black',
            border: '2px solid black'
          }
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: P.white }}>
          {config.titre}
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: P.white }}>
          {config.sousTitre}
        </Typography>
        <Typography variant="body1" sx={{ color: P.white }}>
          EXERCICE CLOS LE {new Date(dateFin).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).toUpperCase()}
        </Typography>
      </Paper>

      {/* Informations de l'entreprise — LECTURE SEULE */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            IDENTIFICATION DE L'ENTREPRISE
          </Typography>
          {ent && <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />}
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              label="Raison sociale"
              value={raisonSociale}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Forme juridique"
              value={formeJuridiqueLabel}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="N° RCCM"
              value={rccm}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="N° IFU"
              value={ifu}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="N° Comptable"
              value={numeroComptable}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Adresse du siège social"
              value={adresse}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Ville"
              value={ville}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Pays"
              value={pays}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Téléphone"
              value={telephone}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Informations sur l'exercice — LECTURE SEULE */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <CalendarIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            EXERCICE COMPTABLE
          </Typography>
          {ent && <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />}
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Exercice"
              value={exerciceComptable}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date début"
              value={formatDateFR(dateDebut)}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date fin"
              value={formatDateFR(dateFin)}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Durée (mois)"
              value={dureeExercice}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Régime fiscal"
              value={regimeFiscal}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Centre des impôts"
              value={centreImpots}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Date de dépôt"
              value={formatDateFR(dateDepot)}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Documents joints (ÉDITABLE) + Déclarant (LECTURE SEULE) */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <DocIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                DOCUMENTS JOINTS
              </Typography>
            </Stack>

            <List>
              {Object.entries(config.documents).map(([key, label]) => (
                <ListItem
                  key={key}
                  button
                  onClick={() => handleDocumentToggle(key)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: documentsJoints[key]
                      ? alpha(theme.palette.success.main, 0.1)
                      : 'transparent'
                  }}
                >
                  <ListItemIcon>
                    {documentsJoints[key] ? (
                      <CheckIcon color="success" />
                    ) : (
                      <UncheckedIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Déclarant — LECTURE SEULE */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <GroupIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                DÉCLARANT
              </Typography>
              {ent && <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />}
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom et prénoms"
                  value={nomDeclarant}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualité"
                  value={qualiteDeclarant}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={telephoneDeclarant}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={emailDeclarant}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Signature */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Signature et cachet
              </Typography>
              <Box sx={{
                height: 80,
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 1,
                mt: 1
              }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Validation et actions */}
      <Paper elevation={0} sx={{ p: 2.5, mt: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            {isValid ? (
              <Alert severity="success" icon={<ValidIcon />}>
                Page de garde complète et prête pour l'impression
              </Alert>
            ) : (
              <Alert severity="warning" icon={<ErrorIcon />}>
                Veuillez compléter les informations dans Paramétrage &gt; Entreprise
              </Alert>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimer
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
            >
              Exporter PDF
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default PageGardeSYSCOHADA
