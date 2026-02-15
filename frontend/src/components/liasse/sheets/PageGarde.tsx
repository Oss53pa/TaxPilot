/**
 * Page de Garde - Renseignements généraux de l'entreprise
 * Données auto-remplies depuis props.entreprise (injecté par withBackendData)
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  useTheme,
  alpha,
  Alert,
} from '@mui/material'
import {
  Business,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  // Group,
  Assessment,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise } from '@/types'

// Dictionnaires de mapping code → label
const formesJuridiquesMap: Record<string, string> = {
  SARL: 'Société à Responsabilité Limitée (SARL)',
  SA: 'Société Anonyme (SA)',
  SAS: 'Société par Actions Simplifiée (SAS)',
  EI: 'Entreprise Individuelle (EI)',
  SNC: 'Société en Nom Collectif (SNC)',
  GIE: "Groupement d'Intérêt Économique (GIE)",
  SCS: 'Société en Commandite Simple (SCS)',
  COOP: 'Société Coopérative',
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

interface PageGardeProps {
  entreprise?: Entreprise
}

const PageGarde: React.FC<PageGardeProps> = ({ entreprise }) => {
  const theme = useTheme()
  const ent = entreprise

  // Données mappées depuis entreprise ou valeurs par défaut
  const raisonSociale = ent?.raison_sociale || 'Non renseigné'
  const formeJuridique = formesJuridiquesMap[ent?.forme_juridique || ''] || ent?.forme_juridique || 'Non renseigné'
  const capitalSocial = ent?.capital_social || 0
  const rccm = ent?.rccm || 'Non renseigné'
  const ifu = ent?.ifu || 'Non renseigné'
  const adresse = ent?.adresse_ligne1 || 'Non renseigné'
  const ville = ent?.ville || ''
  const pays = paysOhadaMap[ent?.pays || ''] || ent?.pays || ''
  const telephone = ent?.telephone || ''
  const email = ent?.email || ''
  const siteWeb = ent?.site_web || ''
  const dateDebut = formatDateFR(ent?.exercice_debut) || '01/01/' + new Date().getFullYear()
  const dateFin = formatDateFR(ent?.exercice_fin) || '31/12/' + new Date().getFullYear()
  const duree = calcDureeMois(ent?.exercice_debut, ent?.exercice_fin)
  const secteurActivite = ent?.secteur_activite || 'Non renseigné'
  const chiffreAffaires = ent?.chiffre_affaires_annuel || 0

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
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
          Page de Garde
        </Typography>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>
          Renseignements généraux de l'entreprise
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1, color: '#ffffff' }}>
          Exercice comptable du {dateDebut} au {dateFin}
        </Typography>
      </Paper>

      {ent && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
          Les informations sont automatiquement issues du paramétrage de l'entreprise.
          Modifiez-les dans <strong>Paramétrage &gt; Entreprise</strong>.
        </Alert>
      )}

      {/* Identification de l'entreprise */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Identification de l'entreprise
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">RAISON SOCIALE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {raisonSociale}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">FORME JURIDIQUE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formeJuridique}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">CAPITAL SOCIAL</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatMontant(capitalSocial)} FCFA
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">N° RCCM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {rccm}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">N° IFU</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ifu}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Adresse et coordonnées
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">SIÈGE SOCIAL</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adresse}
                  </Typography>
                  {ville && (
                    <Typography variant="body2" color="text.secondary">
                      {ville}{pays ? `, ${pays}` : ''}
                    </Typography>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">TÉLÉPHONE</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {telephone || '-'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {email || '-'}
                </Typography>

                {siteWeb && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">SITE WEB</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      {siteWeb}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exercice comptable et activité */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Exercice comptable
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">DATE DE DÉBUT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {dateDebut}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">DATE DE FIN</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {dateFin}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">DURÉE</Typography>
                <Chip
                  label={`${duree} mois`}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">DEVISE DE PRÉSENTATION</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Franc CFA (XOF)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Activité
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">SECTEUR D'ACTIVITÉ</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {secteurActivite}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">CHIFFRE D'AFFAIRES ANNUEL</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatMontant(chiffreAffaires)} FCFA
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PageGarde
