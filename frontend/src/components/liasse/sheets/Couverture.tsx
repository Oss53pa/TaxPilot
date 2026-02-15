/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 * Lit automatiquement les données entreprise depuis props.entreprise (injecté par withBackendData)
 */

import React from 'react'
import { formatDateFR } from '@/utils/formatting'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Stack,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import type { Entreprise } from '@/types'

// Dictionnaires de mapping code → label
const formesJuridiquesMap: Record<string, string> = {
  SARL: 'Société à Responsabilité Limitée (SARL)',
  SA: 'Société Anonyme (SA)',
  SAS: 'Société par Actions Simplifiée (SAS)',
  EI: 'Entreprise Individuelle (EI)',
  GIE: "Groupement d'Intérêt Économique (GIE)",
  ASSOCIATION: 'Association',
  COOPERATIVES: 'Coopératives',
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

const regimesImpositionMap: Record<string, string> = {
  REEL_NORMAL: 'Régime du Système Normal',
  REEL_SIMPLIFIE: 'Régime Réel Simplifié',
  FORFAITAIRE: 'Régime Forfaitaire',
  MICRO: 'Régime Micro-entreprise',
}

// formatDateFR imported from '@/utils/formatting' (using '' as default for empty fields)

/** Calcule la durée en mois entre deux dates ISO */
function calcDureeMois(debut?: string, fin?: string): number {
  if (!debut || !fin) return 12
  const d = new Date(debut)
  const f = new Date(fin)
  const months = (f.getFullYear() - d.getFullYear()) * 12 + (f.getMonth() - d.getMonth()) + (f.getDate() >= d.getDate() ? 1 : 0)
  return months > 0 ? months : 12
}

interface CouvertureProps {
  data?: {
    entreprise?: {
      raisonSociale?: string
      formeJuridique?: string
      capitalSocial?: number
      rccm?: string
      ifu?: string
      adresse?: string
      telephone?: string
      email?: string
    }
    exercice?: {
      debut?: string
      fin?: string
      duree?: number
    }
    declaration?: {
      type?: string
      regime?: string
      dateDepot?: string
      numeroDeclaration?: string
    }
  }
  entreprise?: Entreprise // injecté par withBackendData
}

const Couverture: React.FC<CouvertureProps> = ({ data = {}, entreprise }) => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  // Si props.entreprise existe (venant du backend), mapper vers les champs d'affichage
  // Sinon, utiliser data (ancien format) puis les valeurs hardcodées en dernier recours
  const ent = entreprise
  const hasEntreprise = !!ent

  const displayData = {
    entreprise: {
      raisonSociale: ent?.raison_sociale || data.entreprise?.raisonSociale || 'ENTREPRISE EXEMPLE SA',
      formeJuridique: ent
        ? (formesJuridiquesMap[ent.forme_juridique] || ent.forme_juridique)
        : (data.entreprise?.formeJuridique || 'Société Anonyme (SA)'),
      capitalSocial: ent?.capital_social ?? data.entreprise?.capitalSocial ?? 100000000,
      rccm: ent?.rccm || data.entreprise?.rccm || 'RB/COT/2020/B/1234',
      ifu: ent?.ifu || data.entreprise?.ifu || '3202010123456',
      numeroComptable: ent?.numero_comptable || '',
      adresse: ent
        ? [ent.adresse_ligne1, ent.adresse_ligne2, ent.ville, paysOhadaMap[ent.pays] || ent.pays].filter(Boolean).join(', ')
        : (data.entreprise?.adresse || '01 BP 1234 Cotonou, Bénin'),
      telephone: ent?.telephone || data.entreprise?.telephone || '+229 21 31 00 00',
      email: ent?.email || data.entreprise?.email || 'contact@entreprise.bj',
    },
    exercice: {
      debut: ent?.exercice_debut
        ? formatDateFR(ent.exercice_debut)
        : (data.exercice?.debut || `01/01/${currentYear}`),
      fin: ent?.exercice_fin
        ? formatDateFR(ent.exercice_fin)
        : (data.exercice?.fin || `31/12/${currentYear}`),
      duree: ent?.exercice_debut && ent?.exercice_fin
        ? calcDureeMois(ent.exercice_debut, ent.exercice_fin)
        : (data.exercice?.duree || 12),
    },
    declaration: {
      type: data.declaration?.type || 'DÉCLARATION STATISTIQUE ET FISCALE',
      regime: ent
        ? (regimesImpositionMap[ent.regime_imposition] || ent.regime_imposition)
        : (data.declaration?.regime || 'Régime du Système Normal'),
      centreImpots: ent?.centre_impots || '',
      dateDepot: ent?.date_depot
        ? formatDateFR(ent.date_depot)
        : (data.declaration?.dateDepot || new Date().toLocaleDateString('fr-FR')),
      numeroDeclaration: data.declaration?.numeroDeclaration || `DSF/${currentYear}/001`,
    },
    declarant: {
      nom: ent?.nom_dirigeant || '',
      qualite: ent?.fonction_dirigeant || '',
      telephone: ent?.telephone_dirigeant || '',
      email: ent?.email_dirigeant || '',
    },
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec logo République */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          RÉPUBLIQUE DU BÉNIN
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Fraternité - Justice - Travail
        </Typography>
        <Divider sx={{ width: '50%', mx: 'auto', mb: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          MINISTÈRE DE L'ÉCONOMIE ET DES FINANCES
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          DIRECTION GÉNÉRALE DES IMPÔTS
        </Typography>
      </Box>

      {/* Titre principal */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
            textTransform: 'uppercase',
          }}
        >
          Liasse Fiscale
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {displayData.declaration.type}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 400, mt: 2, color: 'text.secondary' }}
        >
          Exercice {currentYear}
        </Typography>
      </Paper>

      {/* Informations de l'entreprise */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
                mr: 2,
              }}
            >
              <BusinessIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {displayData.entreprise.raisonSociale}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayData.entreprise.formeJuridique}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CAPITAL SOCIAL
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {displayData.entreprise.capitalSocial.toLocaleString('fr-FR')} FCFA
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    RCCM
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.entreprise.rccm}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    IFU
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.entreprise.ifu}
                  </Typography>
                </Box>
                {displayData.entreprise.numeroComptable && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      N° COMPTABLE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {displayData.entreprise.numeroComptable}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ADRESSE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.entreprise.adresse}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    TÉLÉPHONE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.entreprise.telephone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    EMAIL
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.entreprise.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informations de l'exercice et de la déclaration */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Exercice Comptable
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    PÉRIODE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Du {displayData.exercice.debut} au {displayData.exercice.fin}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DURÉE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.exercice.duree} mois
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Déclaration
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    RÉGIME FISCAL
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.declaration.regime}
                  </Typography>
                </Box>
                {displayData.declaration.centreImpots && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      CENTRE DES IMPÔTS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {displayData.declaration.centreImpots}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    NUMÉRO DE DÉCLARATION
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.declaration.numeroDeclaration}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DATE DE DÉPÔT
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayData.declaration.dateDepot}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Déclarant */}
      {hasEntreprise && displayData.declarant.nom && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Déclarant
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      NOM
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {displayData.declarant.nom}
                    </Typography>
                  </Box>
                  {displayData.declarant.qualite && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        QUALITÉ
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {displayData.declarant.qualite}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {displayData.declarant.telephone && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        TÉLÉPHONE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {displayData.declarant.telephone}
                      </Typography>
                    </Box>
                  )}
                  {displayData.declarant.email && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        EMAIL
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {displayData.declarant.email}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statut de conformité */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Chip
          icon={<CheckIcon />}
          label="DÉCLARATION CONFORME AUX NORMES SYSCOHADA RÉVISÉ"
          color="success"
          sx={{ fontSize: '0.9rem', py: 2.5, px: 2 }}
        />
      </Box>

      {/* Note de bas de page */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Cette liasse fiscale est établie conformément aux dispositions du Système Comptable OHADA (SYSCOHADA) révisé
          et aux exigences de la Direction Générale des Impôts du Bénin.
        </Typography>
      </Box>
    </Box>
  )
}

export default Couverture
