/**
 * Fiche de Renseignements - Informations détaillées pour l'administration fiscale
 * Données d'identification auto-remplies depuis props.entreprise (injecté par withBackendData)
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  Divider,
  Stack,
  Alert,
} from '@mui/material'
import {
  Business,
  Person,
  AccountBalance,
  Assessment,
  Security,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise } from '@/types'

// Dictionnaires de mapping code → label
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
  REEL_NORMAL: 'Régime réel',
  REEL_SIMPLIFIE: 'Régime réel simplifié',
  FORFAITAIRE: 'Régime forfaitaire',
  MICRO: 'Régime micro-entreprise',
  RNI: 'Régime réel',
  RSI: 'Régime réel simplifié',
  RME: 'Régime micro-entreprise',
}

/** Formate une date ISO (YYYY-MM-DD) en DD/MM/YYYY */
function formatDateFR(isoDate?: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return isoDate
}

interface FicheRenseignementsProps {
  entreprise?: Entreprise
}

const FicheRenseignements: React.FC<FicheRenseignementsProps> = ({ entreprise }) => {
  const theme = useTheme()
  const ent = entreprise

  // Données mappées depuis entreprise
  const raisonSociale = ent?.raison_sociale || 'Non renseigné'
  const rccm = ent?.rccm || 'Non renseigné'
  const ifu = ent?.ifu || 'Non renseigné'
  const adresse = [ent?.adresse_ligne1, ent?.ville, paysOhadaMap[ent?.pays || ''] || ent?.pays].filter(Boolean).join(', ') || 'Non renseigné'
  const telephone = ent?.telephone || '-'
  const email = ent?.email || '-'
  const chiffreAffaires = ent?.chiffre_affaires_annuel || 0
  const nomDirigeant = ent?.nom_dirigeant || 'Non renseigné'
  const fonctionDirigeant = ent?.fonction_dirigeant || ''
  const dateFin = ent?.exercice_fin || `${new Date().getFullYear()}-12-31`
  const regime = regimesMap[ent?.regime_imposition || ''] || ent?.regime_imposition || 'Régime réel'

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Fiche de Renseignements
        </Typography>
        <Typography variant="h6">
          Informations détaillées pour l'Administration Fiscale
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Exercice clos le {new Date(dateFin).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Typography>
      </Paper>

      {ent && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
          Les informations d'identification sont automatiquement issues du paramétrage.
          Modifiez-les dans <strong>Paramétrage &gt; Entreprise</strong>.
        </Alert>
      )}

      {/* Identification de l'entreprise */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Business sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Identification de l'Entreprise
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">RAISON SOCIALE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {raisonSociale}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">N° RCCM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {rccm}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">N° IFU</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ifu}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">ADRESSE COMPLÈTE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adresse}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">TÉLÉPHONE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {telephone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {email}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                    Chiffre d'Affaires Annuel
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatMontant(chiffreAffaires)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dirigeant */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dirigeant Principal
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">NOM ET PRÉNOMS</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {nomDirigeant}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">FONCTION</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {fonctionDirigeant || '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Situation fiscale */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assessment sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Situation Fiscale
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">RÉGIME D'IMPOSITION</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {regime}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">CENTRE DES IMPÔTS</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {ent?.centre_impots || '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attestations */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette fiche de renseignements est établie conformément aux dispositions du Code général des Impôts
            et accompagne la déclaration fiscale annuelle.
          </Typography>
        </Alert>
        <Alert severity="success">
          <Typography variant="body2">
            L'entreprise certifie que les informations déclarées sont exactes et complètes.
            Les documents justificatifs sont tenus à la disposition de l'Administration fiscale.
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}

export default FicheRenseignements
