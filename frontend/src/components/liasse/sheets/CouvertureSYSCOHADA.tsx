/**
 * Page de Couverture - Liasse Fiscale SYSCOHADA
 * Donnees pre-remplies depuis Parametrage > Entreprise
 */

import React from 'react'
import { useRegimeImposition } from '@/config/regimeContext'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  Divider,
  Alert,
  useTheme,
  alpha,
} from '@mui/material'
import {
  AccountBalance,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// 18 pays OHADA avec nom officiel et devise
const PAYS_OHADA_DETAILS: Record<string, { nomOfficiel: string; devise: string }> = {
  BJ: { nomOfficiel: 'REPUBLIQUE DU BENIN', devise: 'Union - Discipline - Travail' },
  BF: { nomOfficiel: 'BURKINA FASO', devise: 'Unite - Progres - Justice' },
  CM: { nomOfficiel: 'REPUBLIQUE DU CAMEROUN', devise: 'Paix - Travail - Patrie' },
  CF: { nomOfficiel: 'REPUBLIQUE CENTRAFRICAINE', devise: 'Unite - Dignite - Travail' },
  KM: { nomOfficiel: 'UNION DES COMORES', devise: 'Unite - Solidarite - Developpement' },
  CG: { nomOfficiel: 'REPUBLIQUE DU CONGO', devise: 'Unite - Travail - Progres' },
  CI: { nomOfficiel: "REPUBLIQUE DE COTE D'IVOIRE", devise: 'Union - Discipline - Travail' },
  DJ: { nomOfficiel: 'REPUBLIQUE DE DJIBOUTI', devise: 'Unite - Egalite - Paix' },
  GA: { nomOfficiel: 'REPUBLIQUE GABONAISE', devise: 'Union - Travail - Justice' },
  GN: { nomOfficiel: 'REPUBLIQUE DE GUINEE', devise: 'Travail - Justice - Solidarite' },
  GW: { nomOfficiel: 'REPUBLIQUE DE GUINEE-BISSAU', devise: 'Unite - Lutte - Progres' },
  GQ: { nomOfficiel: 'REPUBLIQUE DE GUINEE EQUATORIALE', devise: 'Unidad - Paz - Justicia' },
  ML: { nomOfficiel: 'REPUBLIQUE DU MALI', devise: 'Un Peuple - Un But - Une Foi' },
  NE: { nomOfficiel: 'REPUBLIQUE DU NIGER', devise: 'Fraternite - Travail - Progres' },
  CD: { nomOfficiel: 'REPUBLIQUE DEMOCRATIQUE DU CONGO', devise: 'Justice - Paix - Travail' },
  SN: { nomOfficiel: 'REPUBLIQUE DU SENEGAL', devise: 'Un Peuple - Un But - Une Foi' },
  TD: { nomOfficiel: 'REPUBLIQUE DU TCHAD', devise: 'Unite - Travail - Progres' },
  TG: { nomOfficiel: 'REPUBLIQUE TOGOLAISE', devise: 'Travail - Liberte - Patrie' },
}

const REGIME_LABELS: Record<string, string> = {
  REEL_NORMAL: 'SYSTEME NORMAL',
  REEL_SIMPLIFIE: 'SYSTEME MINIMAL DE TRESORERIE',
  FORFAITAIRE: 'REGIME FORFAITAIRE',
  MICRO: 'REGIME MICRO-ENTREPRISE',
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const v = (val: any): string => val || '\u2014'

const CouvertureSYSCOHADA: React.FC<{ entreprise?: any }> = ({ entreprise }) => {
  const theme = useTheme()
  const ent = entreprise || {}

  // Derive from entreprise data
  const paysInfo = PAYS_OHADA_DETAILS[ent.pays] || { nomOfficiel: v(ent.pays), devise: '' }
  const ctxRegime = useRegimeImposition()
  const regimeLabel = REGIME_LABELS[ctxRegime] || REGIME_LABELS[ent.regime_imposition] || v(ent.regime_imposition)
  const dateDebut = formatDate(ent.exercice_debut)
  const dateFin = formatDate(ent.exercice_fin)
  const exerciceYear = ent.exercice_fin
    ? new Date(ent.exercice_fin).getFullYear()
    : new Date().getFullYear()

  const infoRow = (label: string, value: string) => (
    <Grid container sx={{ py: 0.5 }}>
      <Grid item xs={5}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{label}</Typography>
      </Grid>
      <Grid item xs={7}>
        <Typography variant="body2">{value}</Typography>
      </Grid>
    </Grid>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Info banner */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
        Les donnees de cette page proviennent de <strong>Parametrage &gt; Entreprise</strong>. Modifiez-les depuis ce menu pour mettre a jour la couverture.
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: 6,
          backgroundColor: P.white,
          border: `2px solid ${theme.palette.primary.main}`,
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* En-tete officiel */}
        <Box sx={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 1 }}>
            {paysInfo.nomOfficiel}
          </Typography>
          {paysInfo.devise && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">{paysInfo.devise}</Typography>
            </Box>
          )}
          <Divider sx={{ mt: 2, mx: 'auto', width: '60%' }} />
        </Box>

        {/* Titre principal */}
        <Stack spacing={4} alignItems="center" sx={{ mt: -10 }}>
          <Box sx={{
            p: 3,
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.03)
          }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                textAlign: 'center',
                letterSpacing: 2
              }}
            >
              LIASSE FISCALE
            </Typography>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                {regimeLabel}
              </Typography>
            </Box>
          </Box>

          {/* Systeme comptable */}
          <Card sx={{
            width: '80%',
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${theme.palette.info.main}`
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <AccountBalance sx={{ fontSize: 40, color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    SYSTEME COMPTABLE OHADA REVISE
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Acte uniforme relatif au droit comptable et a l'information financiere
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Identification entreprise */}
          <Card sx={{ width: '80%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, textAlign: 'center' }}>
                IDENTIFICATION DE L'ENTREPRISE
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {infoRow('Raison sociale', v(ent.raison_sociale))}
              {ent.sigle && infoRow('Sigle / Enseigne', ent.sigle)}
              {infoRow('Forme juridique', v(ent.forme_juridique))}
              {infoRow('N° Compte contribuable (NCC)', v(ent.numero_contribuable))}
              {infoRow('RCCM', v(ent.rccm))}
              {infoRow('Secteur d\'activite', v(ent.secteur_activite))}
              {infoRow('Adresse', v(ent.adresse_ligne1 || ent.adresse))}
              {ent.ville && infoRow('Ville', ent.ville)}
              {ent.telephone && infoRow('Telephone', ent.telephone)}
              {ent.capital_social != null && infoRow('Capital social', `${Number(ent.capital_social).toLocaleString('fr-FR')} FCFA`)}
              {ent.nom_dirigeant && infoRow('Dirigeant', `${ent.nom_dirigeant}${ent.fonction_dirigeant ? ` (${ent.fonction_dirigeant})` : ''}`)}
            </CardContent>
          </Card>

          {/* Exercice fiscal */}
          <Card sx={{ width: '60%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                  <CalendarIcon color="primary" />
                  <Typography variant="h6">
                    EXERCICE FISCAL {exerciceYear}
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Du : {dateDebut}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Au : {dateFin}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Informations de conformite */}
          <Box sx={{
            mt: 4,
            p: 3,
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${theme.palette.warning.main}`,
            borderRadius: 1,
            width: '80%'
          }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              DECLARATION CONFORME
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {'\u2022'} Loi de Finances {exerciceYear}
                </Typography>
                <Typography variant="body2">
                  {'\u2022'} Code General des Impots
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {'\u2022'} Systeme Comptable OHADA Revise
                </Typography>
                <Typography variant="body2">
                  {'\u2022'} Acte Uniforme OHADA
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>

        {/* Pied de page */}
        <Box sx={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center' }}>
          <Divider sx={{ mb: 2, mx: 'auto', width: '60%' }} />
          <Typography variant="caption" color="textSecondary">
            Direction Generale des Impots - Ministere des Finances
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default CouvertureSYSCOHADA
