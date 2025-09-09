/**
 * Composant DSF - Déclaration Statistique et Fiscale SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Assessment,
  Business,
  Calculate,
  MonetizationOn,
  BarChart,
  PieChart,
  Save,
  Print,
} from '@mui/icons-material'

interface DSFProps {
  modeEdition?: boolean
}

const DSF: React.FC<DSFProps> = ({ modeEdition = false }) => {
  // Données de l'entreprise
  const [entrepriseData, setEntrepriseData] = useState({
    raisonSociale: 'FISCASYNC SARL',
    numeroContribuable: '1234567890',
    rccm: 'CI-ABJ-2024-B-12345',
    adresse: 'Abidjan, Plateau',
    secteurActivite: 'Services informatiques',
    formeJuridique: 'SARL',
    capitalSocial: 10000000,
  })

  // Données financières pour la DSF
  const [donneesFinancieres, setDonneesFinancieres] = useState({
    chiffreAffaires: 210800000,
    exportations: 25000000,
    importations: 45000000,
    investissements: 28500000,
    stocksFinal: 91500000,
    effectifMoyen: 85,
    masseSalariale: 121000000,
    beneficeImposable: 35000000,
    impotSociete: 10500000,
    tvaCollectee: 42160000,
    tvaDeductible: 18500000,
  })

  // Répartition du chiffre d'affaires par activité
  const [repartitionCA] = useState([
    { activite: 'Vente de marchandises', montant: 125600000, taux: 15.0 },
    { activite: 'Prestations de services', montant: 65400000, taux: 18.0 },
    { activite: 'Production industrielle', montant: 19800000, taux: 18.0 },
  ])

  // Calculs automatiques
  const tvaNetteAVerser = donneesFinancieres.tvaCollectee - donneesFinancieres.tvaDeductible
  const tauxImposition = (donneesFinancieres.impotSociete / donneesFinancieres.beneficeImposable) * 100
  const productiviteMoyenne = donneesFinancieres.chiffreAffaires / donneesFinancieres.effectifMoyen

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const updateEntrepriseData = (field: string, value: string | number) => {
    if (!modeEdition) return
    setEntrepriseData(prev => ({ ...prev, [field]: value }))
  }

  const updateDonneesFinancieres = (field: string, value: number) => {
    if (!modeEdition) return
    setDonneesFinancieres(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Assessment sx={{ mr: 2, color: 'error.main', fontSize: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
            DSF - Déclaration Statistique et Fiscale
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Exercice 2024 - SYSCOHADA
          </Typography>
        </Box>
        {modeEdition && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<Save />} size="small">
              Sauvegarder
            </Button>
            <Button variant="outlined" startIcon={<Print />} size="small">
              Imprimer
            </Button>
          </Box>
        )}
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        La DSF doit être déposée avant le 30 avril de l'année suivant l'exercice concerné.
      </Alert>

      <Grid container spacing={3}>
        {/* Section 1: Identification de l'entreprise */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              avatar={<Business color="primary" />}
              title="Identification de l'entreprise"
              sx={{ backgroundColor: 'primary.light', color: 'white' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Raison sociale"
                    value={entrepriseData.raisonSociale}
                    onChange={(e) => updateEntrepriseData('raisonSociale', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="N° Contribuable"
                    value={entrepriseData.numeroContribuable}
                    onChange={(e) => updateEntrepriseData('numeroContribuable', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="RCCM"
                    value={entrepriseData.rccm}
                    onChange={(e) => updateEntrepriseData('rccm', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Adresse"
                    value={entrepriseData.adresse}
                    onChange={(e) => updateEntrepriseData('adresse', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={!modeEdition}>
                    <InputLabel>Forme juridique</InputLabel>
                    <Select
                      value={entrepriseData.formeJuridique}
                      label="Forme juridique"
                      onChange={(e) => updateEntrepriseData('formeJuridique', e.target.value)}
                    >
                      <MenuItem value="SARL">SARL</MenuItem>
                      <MenuItem value="SA">SA</MenuItem>
                      <MenuItem value="SAS">SAS</MenuItem>
                      <MenuItem value="EI">Entreprise Individuelle</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Secteur d'activité"
                    value={entrepriseData.secteurActivite}
                    onChange={(e) => updateEntrepriseData('secteurActivite', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Capital social (FCFA)"
                    type="number"
                    value={entrepriseData.capitalSocial}
                    onChange={(e) => updateEntrepriseData('capitalSocial', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 2: Indicateurs économiques */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              avatar={<MonetizationOn color="success" />}
              title="Données financières principales"
              sx={{ backgroundColor: 'success.light', color: 'white' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Chiffre d'affaires"
                    type="number"
                    value={donneesFinancieres.chiffreAffaires}
                    onChange={(e) => updateDonneesFinancieres('chiffreAffaires', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'FCFA' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Exportations"
                    type="number"
                    value={donneesFinancieres.exportations}
                    onChange={(e) => updateDonneesFinancieres('exportations', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'FCFA' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Importations"
                    type="number"
                    value={donneesFinancieres.importations}
                    onChange={(e) => updateDonneesFinancieres('importations', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'FCFA' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Investissements"
                    type="number"
                    value={donneesFinancieres.investissements}
                    onChange={(e) => updateDonneesFinancieres('investissements', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'FCFA' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Effectif moyen"
                    type="number"
                    value={donneesFinancieres.effectifMoyen}
                    onChange={(e) => updateDonneesFinancieres('effectifMoyen', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'personnes' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Masse salariale"
                    type="number"
                    value={donneesFinancieres.masseSalariale}
                    onChange={(e) => updateDonneesFinancieres('masseSalariale', Number(e.target.value))}
                    fullWidth
                    size="small"
                    disabled={!modeEdition}
                    InputProps={{ endAdornment: 'FCFA' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 3: Indicateurs de performance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              avatar={<BarChart color="info" />}
              title="Indicateurs de performance"
              sx={{ backgroundColor: 'info.light', color: 'white' }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Productivité moyenne</Typography>
                <Typography variant="h6" color="info.main">
                  {formatNumber(Math.round(productiviteMoyenne))} FCFA/personne
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Taux d'exportation</Typography>
                <Typography variant="h6" color="success.main">
                  {((donneesFinancieres.exportations / donneesFinancieres.chiffreAffaires) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Taux d'imposition</Typography>
                <Typography variant="h6" color="error.main">
                  {tauxImposition.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 4: Fiscalité */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              avatar={<Calculate color="warning" />}
              title="Données fiscales"
              sx={{ backgroundColor: 'warning.light', color: 'white' }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'warning.light' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Impôt sur les Sociétés</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Bénéfice imposable</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={donneesFinancieres.beneficeImposable}
                                onChange={(e) => updateDonneesFinancieres('beneficeImposable', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(donneesFinancieres.beneficeImposable)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Impôt calculé</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={donneesFinancieres.impotSociete}
                                onChange={(e) => updateDonneesFinancieres('impotSociete', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(donneesFinancieres.impotSociete)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Taux effectif</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            <Chip label={`${tauxImposition.toFixed(1)}%`} color="warning" size="small" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'info.light' }}>
                          <TableCell sx={{ fontWeight: 600 }}>TVA</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>TVA collectée</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={donneesFinancieres.tvaCollectee}
                                onChange={(e) => updateDonneesFinancieres('tvaCollectee', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(donneesFinancieres.tvaCollectee)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>TVA déductible</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={donneesFinancieres.tvaDeductible}
                                onChange={(e) => updateDonneesFinancieres('tvaDeductible', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(donneesFinancieres.tvaDeductible)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>TVA nette à verser</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            <Chip 
                              label={formatNumber(tvaNetteAVerser)} 
                              color={tvaNetteAVerser > 0 ? 'error' : 'success'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 5: Répartition du CA */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              avatar={<PieChart color="secondary" />}
              title="Répartition du chiffre d'affaires par activité"
              sx={{ backgroundColor: 'secondary.light', color: 'white' }}
            />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'secondary.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature de l'activité</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Chiffre d'affaires (FCFA)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Taux de TVA (%)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>TVA collectée (FCFA)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>% du CA total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {repartitionCA.map((row, index) => {
                      const tvaCalculee = (row.montant * row.taux) / 100
                      const pourcentageCA = (row.montant / donneesFinancieres.chiffreAffaires) * 100
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{row.activite}</TableCell>
                          <TableCell align="right">{formatNumber(row.montant)}</TableCell>
                          <TableCell align="right">
                            <Chip label={`${row.taux}%`} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{formatNumber(tvaCalculee)}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${pourcentageCA.toFixed(1)}%`} 
                              color={pourcentageCA > 50 ? 'primary' : 'default'}
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(repartitionCA.reduce((sum, item) => sum + item.montant, 0))}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(repartitionCA.reduce((sum, item) => sum + (item.montant * item.taux / 100), 0))}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label="100%" color="primary" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DSF