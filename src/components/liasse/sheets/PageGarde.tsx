/**
 * Page de Garde - Renseignements généraux de l'entreprise
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Business,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  AccountBalance,
  Group,
  Assessment,
} from '@mui/icons-material'

const PageGarde: React.FC = () => {
  const theme = useTheme()

  const informationsEntreprise = {
    identification: {
      raisonSociale: 'ENTREPRISE EXEMPLE SA',
      sigle: 'EE-SA',
      formeJuridique: 'Société Anonyme',
      capitalSocial: 100000000,
      numeroRCCM: 'RB/COT/2020/B/1234',
      numeroIFU: '3202010123456',
      numeroEmployeur: '1234567890',
    },
    adresse: {
      siegeSocial: '123 Avenue de la République',
      quartier: 'Ganhi',
      ville: 'Cotonou',
      commune: 'Cotonou',
      departement: 'Littoral',
      pays: 'République du Bénin',
      boitePostale: '01 BP 1234',
      telephone: '+229 21 31 00 00',
      fax: '+229 21 31 00 01',
      email: 'contact@entreprise-exemple.bj',
      siteWeb: 'www.entreprise-exemple.bj',
    },
    exercice: {
      dateDebut: '01/01/2024',
      dateFin: '31/12/2024',
      duree: 12,
      devise: 'Franc CFA (XOF)',
    },
    activite: {
      secteurActivite: 'Commerce et Services',
      activitePrincipale: 'Commerce de gros et de détail',
      codeNACE: '4690',
      dateCreation: '15/03/2020',
      nombreEtablissements: 3,
    },
    personnel: {
      effectifTotal: 45,
      cadres: 8,
      employes: 15,
      ouvriers: 22,
      masseSalariale: 48500000,
    }
  }

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR') + ' FCFA'
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Page de Garde
        </Typography>
        <Typography variant="h6">
          Renseignements généraux de l'entreprise
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Exercice comptable du {informationsEntreprise.exercice.dateDebut} au {informationsEntreprise.exercice.dateFin}
        </Typography>
      </Paper>

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
                    {informationsEntreprise.identification.raisonSociale}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">SIGLE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.identification.sigle}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">FORME JURIDIQUE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.identification.formeJuridique}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">CAPITAL SOCIAL</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatMontant(informationsEntreprise.identification.capitalSocial)}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">N° RCCM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.identification.numeroRCCM}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">N° IFU</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.identification.numeroIFU}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">N° EMPLOYEUR</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {informationsEntreprise.identification.numeroEmployeur}
                  </Typography>
                </Box>
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
                    {informationsEntreprise.adresse.siegeSocial}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quartier {informationsEntreprise.adresse.quartier}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {informationsEntreprise.adresse.ville}, {informationsEntreprise.adresse.departement}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {informationsEntreprise.adresse.pays}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">BOÎTE POSTALE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {informationsEntreprise.adresse.boitePostale}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">TÉLÉPHONE</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.adresse.telephone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">FAX</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.adresse.fax}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {informationsEntreprise.adresse.email}
                </Typography>

                <Box>
                  <Typography variant="caption" color="text.secondary">SITE WEB</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                    {informationsEntreprise.adresse.siteWeb}
                  </Typography>
                </Box>
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
                    {informationsEntreprise.exercice.dateDebut}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">DATE DE FIN</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {informationsEntreprise.exercice.dateFin}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">DURÉE</Typography>
                <Chip 
                  label={`${informationsEntreprise.exercice.duree} mois`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">DEVISE DE PRÉSENTATION</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {informationsEntreprise.exercice.devise}
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
                  Activité et établissements
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">SECTEUR D'ACTIVITÉ</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {informationsEntreprise.activite.secteurActivite}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">ACTIVITÉ PRINCIPALE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {informationsEntreprise.activite.activitePrincipale}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">CODE NACE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.activite.codeNACE}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">DATE CRÉATION</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {informationsEntreprise.activite.dateCreation}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">ÉTABLISSEMENTS</Typography>
                  <Chip 
                    label={`${informationsEntreprise.activite.nombreEtablissements} établissements`} 
                    color="secondary" 
                    size="small" 
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Personnel */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Group sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Personnel et masse salariale
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Effectif</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Pourcentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cadres</TableCell>
                      <TableCell align="right">{informationsEntreprise.personnel.cadres}</TableCell>
                      <TableCell align="right">
                        {((informationsEntreprise.personnel.cadres / informationsEntreprise.personnel.effectifTotal) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Employés</TableCell>
                      <TableCell align="right">{informationsEntreprise.personnel.employes}</TableCell>
                      <TableCell align="right">
                        {((informationsEntreprise.personnel.employes / informationsEntreprise.personnel.effectifTotal) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ouvriers</TableCell>
                      <TableCell align="right">{informationsEntreprise.personnel.ouvriers}</TableCell>
                      <TableCell align="right">
                        {((informationsEntreprise.personnel.ouvriers / informationsEntreprise.personnel.effectifTotal) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{informationsEntreprise.personnel.effectifTotal}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="caption" color="text.secondary">MASSE SALARIALE ANNUELLE</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mt: 1 }}>
                  {formatMontant(informationsEntreprise.personnel.masseSalariale)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Soit {Math.round(informationsEntreprise.personnel.masseSalariale / informationsEntreprise.personnel.effectifTotal).toLocaleString()} FCFA/personne/an
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PageGarde