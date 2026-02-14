/**
 * Viewer détaillé de liasse SYSCOHADA - Interface Excel-like
 */

import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Tooltip,
  AppBar,
  Toolbar,
} from '@mui/material'
import {
  Assignment,
  GetApp,
  Print,
  Edit,
  Save,
  CheckCircle,
  Notes,
} from '@mui/icons-material'

const LiasseViewer = () => {
  const [tabValue, setTabValue] = useState(0)
  const [modeEdition, setModeEdition] = useState(false)

  // Structure complète d'une liasse SYSCOHADA Système Normal
  const ongletLiasse = [
    { label: 'Bilan - Actif', code: 'BILAN_ACTIF', couleur: 'primary' },
    { label: 'Bilan - Passif', code: 'BILAN_PASSIF', couleur: 'primary' },
    { label: 'Compte de Résultat', code: 'COMPTE_RESULTAT', couleur: 'secondary' },
    { label: 'TAFIRE', code: 'TAFIRE', couleur: 'success' },
    { label: 'Variation Capitaux', code: 'VARIATION_CAPITAUX', couleur: 'info' },
    { label: 'Notes Annexes', code: 'NOTES_ANNEXES', couleur: 'warning' },
  ]

  // Données du Bilan - Actif (exemple structure SYSCOHADA)
  const bilanActif = [
    // ACTIF IMMOBILISÉ
    { 
      ref: 'AA', 
      libelle: 'ACTIF IMMOBILISÉ',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      note: '1'
    },
    {
      ref: 'AB',
      libelle: 'Charges immobilisées',
      exerciceN: 0,
      exerciceN1: 0,
      isSubHeader: true,
      note: '2.1'
    },
    {
      ref: 'AC', 
      libelle: 'Frais de développement',
      exerciceN: 0,
      exerciceN1: 0,
      comptes: ['201'],
      note: '2.1.1'
    },
    {
      ref: 'AD',
      libelle: 'Brevets, licences, logiciels',
      exerciceN: 2500000,
      exerciceN1: 1800000,
      comptes: ['203', '204'],
      note: '2.1.2'
    },
    {
      ref: 'AE',
      libelle: 'Fonds commercial',
      exerciceN: 0,
      exerciceN1: 0,
      comptes: ['206'],
      note: '2.1.3'
    },
    {
      ref: 'AF',
      libelle: 'Autres immobilisations incorporelles',
      exerciceN: 350000,
      exerciceN1: 280000,
      comptes: ['208'],
      note: '2.1.4'
    },
    // IMMOBILISATIONS CORPORELLES
    {
      ref: 'AG',
      libelle: 'Immobilisations corporelles',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      note: '2.2'
    },
    {
      ref: 'AH',
      libelle: 'Terrains',
      exerciceN: 45000000,
      exerciceN1: 45000000,
      comptes: ['221', '222'],
      note: '2.2.1'
    },
    {
      ref: 'AI',
      libelle: 'Bâtiments, installations techniques',
      exerciceN: 125000000,
      exerciceN1: 135000000,
      comptes: ['231', '232', '233'],
      note: '2.2.2'
    },
    {
      ref: 'AJ',
      libelle: 'Matériel, mobilier et actifs biologiques',
      exerciceN: 18500000,
      exerciceN1: 22000000,
      comptes: ['241', '244', '245'],
      note: '2.2.3'
    },
    // ACTIF CIRCULANT
    {
      ref: 'BA',
      libelle: 'ACTIF CIRCULANT',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      note: '3'
    },
    {
      ref: 'BB',
      libelle: 'Stocks et en-cours',
      exerciceN: 15600000,
      exerciceN1: 12300000,
      comptes: ['31', '32', '33', '34', '35'],
      note: '3.1'
    },
    {
      ref: 'BC',
      libelle: 'Clients',
      exerciceN: 25800000,
      exerciceN1: 19500000,
      comptes: ['411', '416', '418'],
      note: '3.2'
    },
    {
      ref: 'BD',
      libelle: 'Autres créances',
      exerciceN: 8200000,
      exerciceN1: 6800000,
      comptes: ['421', '425', '427', '444', '445'],
      note: '3.3'
    },
    {
      ref: 'BE',
      libelle: 'Trésorerie-Actif',
      exerciceN: 12500000,
      exerciceN1: 8900000,
      comptes: ['51', '52', '53', '58'],
      note: '3.4'
    },
  ]

  const formatMontant = (montant: number | null) => {
    if (montant === null || montant === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  const calculerVariation = (n: number, n1: number) => {
    if (n1 === 0) return n > 0 ? 100 : 0
    return ((n - n1) / n1) * 100
  }

  const renderTableauBilan = () => (
    <TableContainer component={Paper} sx={{ border: '1px solid #e5e5e5' }}>
      <Table size="small" sx={{ '& .MuiTableCell-root': { border: '1px solid #e5e5e5', fontSize: '0.875rem' } }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 700, width: '60px' }}>Réf</TableCell>
            <TableCell sx={{ fontWeight: 700, minWidth: '300px' }}>ACTIF</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '20px' }}>Note</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, width: '120px' }}>
              Exercice N<br />
              <Typography variant="caption">(2024)</Typography>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, width: '120px' }}>
              Exercice N-1<br />
              <Typography variant="caption">(2023)</Typography>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, width: '80px' }}>
              Var %
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, width: '60px' }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bilanActif.map((ligne, index) => (
            <TableRow 
              key={index}
              sx={{
                backgroundColor: ligne.isHeader ? '#eff6ff' :
                                ligne.isSubHeader ? '#f5f3ff' : 'white',
                '&:hover': { backgroundColor: '#fafafa' }
              }}
            >
              <TableCell sx={{ fontWeight: ligne.isHeader || ligne.isSubHeader ? 700 : 400 }}>
                {ligne.ref}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: ligne.isHeader ? 700 : ligne.isSubHeader ? 600 : 400,
                pl: ligne.isHeader ? 1 : ligne.isSubHeader ? 2 : 3
              }}>
                {ligne.libelle}
                {ligne.comptes && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Comptes: {ligne.comptes.join(', ')}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {ligne.note && (
                  <Tooltip title={`Note annexe ${ligne.note}`}>
                    <Chip 
                      label={ligne.note} 
                      size="small" 
                      color="info" 
                      sx={{ fontSize: '0.75rem', height: '20px' }}
                    />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {modeEdition && ligne.exerciceN !== null ? (
                  <TextField
                    size="small"
                    type="number"
                    defaultValue={ligne.exerciceN}
                    sx={{ width: '100px' }}
                    inputProps={{ style: { textAlign: 'right', fontSize: '0.875rem' } }}
                  />
                ) : (
                  formatMontant(ligne.exerciceN)
                )}
              </TableCell>
              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {formatMontant(ligne.exerciceN1)}
              </TableCell>
              <TableCell align="right">
                {ligne.exerciceN !== null && ligne.exerciceN1 !== null && ligne.exerciceN1 !== 0 ? (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: calculerVariation(ligne.exerciceN, ligne.exerciceN1) >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  >
                    {calculerVariation(ligne.exerciceN, ligne.exerciceN1).toFixed(1)}%
                  </Typography>
                ) : '-'}
              </TableCell>
              <TableCell align="center">
                {ligne.note && (
                  <Tooltip title={`Voir note ${ligne.note}`}>
                    <IconButton size="small" color="primary">
                      <Notes sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header de la liasse */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Assignment sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Liasse Fiscale SYSCOHADA - Système Normal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SARL DEMO TAXPILOT - Exercice 2024 - N° Contribuable: M051234567890
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              icon={<CheckCircle />} 
              label="95% Complète" 
              color="success" 
              size="small" 
            />
            <Button
              variant={modeEdition ? "contained" : "outlined"}
              size="small"
              startIcon={modeEdition ? <Save /> : <Edit />}
              onClick={() => setModeEdition(!modeEdition)}
            >
              {modeEdition ? 'Sauvegarder' : 'Éditer'}
            </Button>
            <Button variant="outlined" size="small" startIcon={<Print />}>
              Imprimer
            </Button>
            <Button variant="outlined" size="small" startIcon={<GetApp />}>
              Export Excel
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation des onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {ongletLiasse.map((onglet, index) => (
            <Tab 
              key={index}
              label={onglet.label} 
              sx={{ 
                minWidth: 120,
                fontWeight: 600,
                '&.Mui-selected': { 
                  color: `${onglet.couleur}.main` 
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenu principal - Vue Excel-like */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, backgroundColor: '#fafafa' }}>
        {/* Onglet Bilan Actif */}
        {tabValue === 0 && (
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  BILAN - ACTIF (en FCFA)
                </Typography>
                <Typography variant="caption">
                  Système Normal SYSCOHADA Révisé - Article 73 et suivants
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Instructions de remplissage :</Typography>
                  Les montants doivent être exprimés en FCFA sans décimales. 
                  Les références correspondent au plan SYSCOHADA révisé.
                </Alert>
                
                {renderTableauBilan()}
                
                {/* Totaux */}
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0fdf4', border: '2px solid #22c55e' }}>
                  <Grid container>
                    <Grid item xs={8}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        TOTAL ACTIF (AZ)
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h6" align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        253,550,000
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h6" align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        245,780,000
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Onglet Compte de Résultat */}
        {tabValue === 2 && (
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, backgroundColor: 'secondary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  COMPTE DE RÉSULTAT (en FCFA)
                </Typography>
                <Typography variant="caption">
                  Système Normal SYSCOHADA Révisé - Article 25 et suivants
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  {/* Charges */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                      CHARGES
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#fef2f2' }}>
                            <TableCell>Réf</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell align="right">Montant</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>TA</TableCell>
                            <TableCell>Achats de marchandises</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              65,200,000
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>TB</TableCell>
                            <TableCell>Variation de stocks</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              -1,200,000
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>TC</TableCell>
                            <TableCell>Autres charges externes</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              18,500,000
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Produits */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                      PRODUITS
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f0fdf4' }}>
                            <TableCell>Réf</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell align="right">Montant</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>RA</TableCell>
                            <TableCell>Ventes de marchandises</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              125,600,000
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>RB</TableCell>
                            <TableCell>Production vendue</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              28,900,000
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>RC</TableCell>
                            <TableCell>Autres produits</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              3,200,000
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>

                {/* Résultat */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#fffbeb', border: '2px solid #f59e0b' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                    RÉSULTAT NET DE L'EXERCICE (RZ): 8,750,000
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bénéfice distribuable selon Article 391 SYSCOHADA
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Onglet Notes Annexes */}
        {tabValue === 5 && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: 'warning.main', fontWeight: 700 }}>
                NOTES ANNEXES AUX ÉTATS FINANCIERS
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Note 1 - Principes comptables
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Les états financiers sont établis conformément aux dispositions du 
                        Système Comptable OHADA révisé en vigueur au 1er janvier 2018.
                      </Typography>
                      <Typography variant="body2">
                        La méthode d'évaluation retenue pour les stocks est celle du coût moyen pondéré (CMP).
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Note 2 - Immobilisations incorporelles
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>2.1 - Logiciels :</strong> Amortis linéairement sur 3 ans
                      </Typography>
                      <Typography variant="body2">
                        <strong>2.2 - Licences :</strong> Amortis sur la durée du contrat (5 ans)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Note 3 - Immobilisations corporelles
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>3.1 - Terrains :</strong> Évalués au coût d'acquisition
                      </Typography>
                      <Typography variant="body2">
                        <strong>3.2 - Bâtiments :</strong> Amortis linéairement sur 20 ans
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Note 4 - Stocks et en-cours
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Les stocks sont évalués selon la méthode du coût moyen pondéré.
                      </Typography>
                      <Typography variant="body2">
                        Provision pour dépréciation constituée à hauteur de 5% sur les stocks anciens.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Message pour les autres onglets */}
        {![0, 2, 5].includes(tabValue) && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {ongletLiasse[tabValue]?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contenu détaillé en cours d'implémentation...
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} startIcon={<Edit />}>
                Développer cet état
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default LiasseViewer