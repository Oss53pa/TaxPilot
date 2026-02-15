/**
 * Fiche R1 - Renseignements Généraux SYSCOHADA
 * Toutes les données sont auto-remplies depuis props.entreprise (injecté par withBackendData)
 * Modifiez dans Paramétrage > Entreprise > onglets correspondants
 */

import React from 'react'
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
  useTheme,
  InputAdornment,
  Chip,
} from '@mui/material'
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise } from '@/types'

// Dictionnaires de mapping code → label
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
  REEL_NORMAL: 'RNI - Régime Normal d\'Imposition',
  REEL_SIMPLIFIE: 'RSI - Régime Simplifié d\'Imposition',
  FORFAITAIRE: 'Régime Forfaitaire',
  MICRO: 'RME - Régime des Micro-Entreprises',
  RNI: 'RNI - Régime Normal d\'Imposition',
  RSI: 'RSI - Régime Simplifié d\'Imposition',
  RME: 'RME - Régime des Micro-Entreprises',
}

/** Formate une date ISO (YYYY-MM-DD) en DD/MM/YYYY */
function formatDateFR(isoDate?: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return isoDate
}

/** Calcule la durée en mois entre deux dates ISO */
function calcDureeMois(debut?: string, fin?: string): number {
  if (!debut || !fin) return 12
  const d = new Date(debut)
  const f = new Date(fin)
  return Math.round((f.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30))
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

interface FicheR1SYSCOHADAProps {
  entreprise?: Entreprise
}

const FicheR1SYSCOHADA: React.FC<FicheR1SYSCOHADAProps> = ({ entreprise }) => {
  const theme = useTheme()
  const ent = entreprise

  // --- Tous les champs depuis entreprise (lecture seule) ---
  // Section 1: Identification
  const raisonSociale = ent?.raison_sociale || ''
  const formeJuridique = formesJuridiquesMap[ent?.forme_juridique || ''] || ent?.forme_juridique || ''
  const capitalSocial = ent?.capital_social || 0
  const rccm = ent?.rccm || ''
  const ifu = ent?.ifu || ''

  // Section 2: Coordonnées
  const adresse = ent?.adresse_ligne1 || ''
  const ville = ent?.ville || ''
  const pays = paysOhadaMap[ent?.pays || ''] || ent?.pays || ''
  const telephone = ent?.telephone || ''
  const email = ent?.email || ''
  const siteWeb = ent?.site_web || ''

  // Section 3: Activité & Exercice
  const activitePrincipale = ent?.secteur_activite || ''
  const dateOuverture = ent?.exercice_debut || `${new Date().getFullYear()}-01-01`
  const dateCloture = ent?.exercice_fin || `${new Date().getFullYear()}-12-31`
  const dureeExercice = calcDureeMois(dateOuverture, dateCloture)
  const nombreEtablissements = ent?.nombre_etablissements || 1

  // Section 4: Régime fiscal
  const regimeFiscal = regimesMap[ent?.regime_imposition || ''] || ent?.regime_imposition || ''
  const centreImpots = ent?.centre_impots || ''

  // Section 5: Effectifs
  const effectifPermanent = ent?.effectif_permanent || 0
  const effectifTemporaire = ent?.effectif_temporaire || 0
  const effectifTotal = effectifPermanent + effectifTemporaire
  const masseSalariale = ent?.masse_salariale || 0

  // Section 6: Groupe
  const isGroupe = ent?.is_groupe || false
  const nomGroupe = ent?.nom_groupe || ''
  const paysSiegeGroupe = paysOhadaMap[ent?.pays_siege_groupe || ''] || ent?.pays_siege_groupe || ''

  // Section 7: CAC & Expert
  const cacNom = ent?.cac_nom || ''
  const cacAdresse = ent?.cac_adresse || ''
  const cacNumero = ent?.cac_numero_inscription || ''
  const expertNom = ent?.expert_nom || ''
  const expertAdresse = ent?.expert_adresse || ''
  const expertNumero = ent?.expert_numero_inscription || ''

  const formatMontant = (montant: number) => montant.toLocaleString('fr-FR')

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R1 - RENSEIGNEMENTS GÉNÉRAUX
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
              Imprimer
            </Button>
            <Button variant="outlined" size="small" startIcon={<ExportIcon />}>
              Exporter
            </Button>
          </Stack>
        </Stack>

        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          Toutes les données sont automatiquement issues du paramétrage.
          Modifiez-les dans <strong>Paramétrage &gt; Entreprise</strong>.
        </Alert>
      </Box>

      {/* Section 1: Identification */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            1. IDENTIFICATION DE L'ENTREPRISE
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Raison sociale" value={raisonSociale}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Sigle" value="" InputProps={{ readOnly: true }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Forme juridique" value={formeJuridique}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Capital social" value={formatMontant(capitalSocial)}
              InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">XOF</InputAdornment> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="N° RCCM" value={rccm}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="N° IFU / NIF" value={ifu}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="N° Employeur CNSS" value=""
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 2: Coordonnées */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            2. COORDONNÉES
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Siège social" value={adresse}
              InputProps={{ readOnly: true, startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} /> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Boîte postale" value=""
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Ville" value={ville}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField fullWidth label="Pays" value={pays}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Téléphone" value={telephone}
              InputProps={{ readOnly: true, startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} /> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Télécopie" value=""
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Email" value={email}
              InputProps={{ readOnly: true, startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} /> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Site web" value={siteWeb}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 3: Activité & Exercice */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            3. ACTIVITÉ ET EXERCICE
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Activité principale" value={activitePrincipale}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Code NACEMA" value=""
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Date ouverture exercice" value={formatDateFR(dateOuverture)}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Date clôture exercice" value={formatDateFR(dateCloture)}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Durée exercice (mois)" value={dureeExercice}
              InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">mois</InputAdornment> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Nombre d'établissements" value={nombreEtablissements}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 4: Régime fiscal */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            4. RÉGIME FISCAL
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Régime fiscal" value={regimeFiscal}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Centre des impôts" value={centreImpots}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 5: Effectifs et masse salariale */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            5. EFFECTIFS ET MASSE SALARIALE
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Effectif permanent" value={effectifPermanent}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Effectif temporaire" value={effectifTemporaire}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Effectif total" value={effectifTotal}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Masse salariale" value={formatMontant(masseSalariale)}
              InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">XOF</InputAdornment> }}
              variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 6: Appartenance à un groupe */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            6. APPARTENANCE À UN GROUPE
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Appartient à un groupe" value={isGroupe ? 'Oui' : 'Non'}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>

          {isGroupe && (
            <>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Nom du groupe" value={nomGroupe}
                  InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Pays du siège social du groupe" value={paysSiegeGroupe}
                  InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 7: CAC et Expert comptable */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            7. COMMISSAIRE AUX COMPTES ET EXPERT COMPTABLE
          </Typography>
          <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
        </Stack>

        {/* CAC */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
          Commissaire aux comptes
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nom du CAC" value={cacNom}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Adresse" value={cacAdresse}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="N° Inscription" value={cacNumero}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>

        {/* Expert comptable */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
          Expert comptable
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nom de l'expert" value={expertNom}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Adresse" value={expertAdresse}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="N° Inscription" value={expertNumero}
              InputProps={{ readOnly: true }} variant="outlined" size="small" sx={readOnlyFieldSx} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default FicheR1SYSCOHADA
