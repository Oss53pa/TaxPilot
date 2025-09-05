/**
 * Fiche de Renseignements - Informations détaillées pour l'administration fiscale
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Stack,
  Alert,
} from '@mui/material'
import {
  Business,
  Person,
  AccountBalance,
  TrendingUp,
  Group,
  Assessment,
  Security,
  LocationOn,
} from '@mui/icons-material'

const FicheRenseignements: React.FC = () => {
  const theme = useTheme()

  const renseignementsGeneraux = {
    identification: {
      raisonSociale: 'ENTREPRISE EXEMPLE SA',
      numeroRCCM: 'RB/COT/2020/B/1234',
      numeroIFU: '3202010123456',
      numeroEmployeur: '1234567890',
      adresse: '123 Avenue de la République, Ganhi, Cotonou',
      telephone: '+229 21 31 00 00',
      email: 'contact@entreprise-exemple.bj'
    },
    dirigeants: [
      { nom: 'HOUNSOU Jean-Baptiste', fonction: 'Président Directeur Général', nationalite: 'Béninoise', participation: '45%' },
      { nom: 'AGBODJAN Marie-Claire', fonction: 'Directeur Général Adjoint', nationalite: 'Béninoise', participation: '25%' },
      { nom: 'DAKPOGAN Pierre', fonction: 'Directeur Technique', nationalite: 'Béninoise', participation: '15%' }
    ],
    actionnariat: [
      { categorie: 'Personnes physiques résidentes', pourcentage: 85, montant: 85000000 },
      { categorie: 'Personnes morales résidentes', pourcentage: 15, montant: 15000000 },
      { categorie: 'Non-résidents', pourcentage: 0, montant: 0 }
    ]
  }

  const informationsEconomiques = {
    chiffreAffaires: {
      local: 198800000,
      export: 12000000,
      total: 210800000
    },
    investissements: [
      { nature: 'Terrains et constructions', montant: 2500000 },
      { nature: 'Matériel et outillage', montant: 1800000 },
      { nature: 'Matériel de transport', montant: 900000 },
      { nature: 'Matériel informatique', montant: 400000 }
    ],
    personnel: {
      cadres: { nationaux: 8, expatries: 0 },
      employes: { nationaux: 15, expatries: 0 },
      ouvriers: { nationaux: 22, expatries: 0 }
    },
    activites: [
      { secteur: 'Commerce de gros', pourcentage: 60, ca: 126480000 },
      { secteur: 'Commerce de détail', pourcentage: 30, ca: 63240000 },
      { secteur: 'Prestations de services', pourcentage: 10, ca: 21080000 }
    ]
  }

  const situationFiscale = {
    regimes: [
      { impot: 'IS - Impôt sur les Sociétés', regime: 'Régime réel', taux: '25%' },
      { impot: 'TVA - Taxe sur la Valeur Ajoutée', regime: 'Régime réel mensuel', taux: '18%' },
      { impot: 'TAP - Taxe sur les Activités de Production', regime: 'Libératoire', taux: '0,5%' },
      { impot: 'IRVM - Impôt sur les Revenus de Valeurs Mobilières', regime: 'Retenue à la source', taux: '10%' }
    ],
    avantagesFiscaux: [
      { nature: 'Crédit d\'impôt investissement', montant: 180000, validite: '2024-2026' },
      { nature: 'Exonération TVA équipements', montant: 0, validite: 'N/A' }
    ]
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
          Exercice clos le 31 décembre 2024
        </Typography>
      </Paper>

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
                    {renseignementsGeneraux.identification.raisonSociale}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">N° RCCM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {renseignementsGeneraux.identification.numeroRCCM}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">N° IFU</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {renseignementsGeneraux.identification.numeroIFU}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">N° EMPLOYEUR</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {renseignementsGeneraux.identification.numeroEmployeur}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">ADRESSE COMPLÈTE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {renseignementsGeneraux.identification.adresse}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">TÉLÉPHONE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {renseignementsGeneraux.identification.telephone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {renseignementsGeneraux.identification.email}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                    Chiffre d'Affaires Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatMontant(informationsEconomiques.chiffreAffaires.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Local : {formatMontant(informationsEconomiques.chiffreAffaires.local)}<br/>
                    • Export : {formatMontant(informationsEconomiques.chiffreAffaires.export)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dirigeants et actionnariat */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Dirigeants Sociaux
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nom et Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fonction</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Nationalité</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Participation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renseignementsGeneraux.dirigeants.map((dirigeant, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 500 }}>{dirigeant.nom}</TableCell>
                        <TableCell>{dirigeant.fonction}</TableCell>
                        <TableCell align="center">
                          <Chip label={dirigeant.nationalite} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {dirigeant.participation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Structure de l'Actionnariat
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {renseignementsGeneraux.actionnariat.map((actionnaire, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {actionnaire.categorie}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {actionnaire.pourcentage}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatMontant(actionnaire.montant)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activités et personnel */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Répartition du Chiffre d'Affaires par Secteur
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {informationsEconomiques.activites.map((activite, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activite.secteur}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activite.pourcentage}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatMontant(activite.ca)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Group sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Effectifs par Catégorie
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Nationaux</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Expatriés</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cadres</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.cadres.nationaux}</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.cadres.expatries}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {informationsEconomiques.personnel.cadres.nationaux + informationsEconomiques.personnel.cadres.expatries}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Employés</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.employes.nationaux}</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.employes.expatries}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {informationsEconomiques.personnel.employes.nationaux + informationsEconomiques.personnel.employes.expatries}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ouvriers</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.ouvriers.nationaux}</TableCell>
                      <TableCell align="center">{informationsEconomiques.personnel.ouvriers.expatries}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {informationsEconomiques.personnel.ouvriers.nationaux + informationsEconomiques.personnel.ouvriers.expatries}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>45</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>0</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>45</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Régimes d'Imposition
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Impôt</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Régime</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {situationFiscale.regimes.map((regime, index) => (
                      <TableRow key={index}>
                        <TableCell>{regime.impot}</TableCell>
                        <TableCell>{regime.regime}</TableCell>
                        <TableCell align="center">
                          <Chip label={regime.taux} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Avantages Fiscaux
              </Typography>
              {situationFiscale.avantagesFiscaux.map((avantage, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {avantage.nature}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {avantage.montant > 0 ? formatMontant(avantage.montant) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Validité : {avantage.validite}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Investissements */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Security sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Investissements de l'Exercice
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nature de l'Investissement</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>% du Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {informationsEconomiques.investissements.map((invest, index) => {
                  const total = informationsEconomiques.investissements.reduce((sum, inv) => sum + inv.montant, 0)
                  const pourcentage = (invest.montant / total) * 100
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{invest.nature}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatMontant(invest.montant)}
                      </TableCell>
                      <TableCell align="right">
                        {pourcentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL INVESTISSEMENTS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatMontant(informationsEconomiques.investissements.reduce((sum, inv) => sum + inv.montant, 0))}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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