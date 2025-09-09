/**
 * Composant État Annexé - SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
} from '@mui/material'
import {
  AccountTree,
  Business,
  AttachMoney,
  Inventory,
  PeopleAlt,
  AccountBalance,
} from '@mui/icons-material'

interface EtatAnnexeProps {
  modeEdition?: boolean
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const EtatAnnexe: React.FC<EtatAnnexeProps> = ({ modeEdition = false }) => {
  const [tabValue, setTabValue] = useState(0)

  // Données des immobilisations
  const [immobilisationsData] = useState([
    {
      nature: 'Terrains',
      valeurBrute: 45000000,
      amortissements: 0,
      valeurNette: 45000000,
      acquisitions: 0,
      cessions: 0,
    },
    {
      nature: 'Bâtiments',
      valeurBrute: 125000000,
      amortissements: 25000000,
      valeurNette: 100000000,
      acquisitions: 15000000,
      cessions: 0,
    },
    {
      nature: 'Matériel et outillage',
      valeurBrute: 65000000,
      amortissements: 32000000,
      valeurNette: 33000000,
      acquisitions: 8500000,
      cessions: 2000000,
    },
    {
      nature: 'Matériel de transport',
      valeurBrute: 28000000,
      amortissements: 15000000,
      valeurNette: 13000000,
      acquisitions: 5000000,
      cessions: 3500000,
    },
    {
      nature: 'Mobilier et matériel de bureau',
      valeurBrute: 12000000,
      amortissements: 7500000,
      valeurNette: 4500000,
      acquisitions: 1200000,
      cessions: 0,
    },
  ])

  // Données des stocks
  const [stocksData] = useState([
    {
      nature: 'Marchandises',
      stockInitial: 25000000,
      stockFinal: 28500000,
      provisions: 1200000,
      rotation: 8.5,
    },
    {
      nature: 'Matières premières',
      stockInitial: 15000000,
      stockFinal: 18200000,
      provisions: 800000,
      rotation: 12.3,
    },
    {
      nature: 'Produits finis',
      stockInitial: 32000000,
      stockFinal: 35600000,
      provisions: 1500000,
      rotation: 6.8,
    },
    {
      nature: 'En-cours de production',
      stockInitial: 8500000,
      stockFinal: 9200000,
      provisions: 400000,
      rotation: 15.2,
    },
  ])

  // Données des créances
  const [creancesData] = useState([
    {
      nature: 'Clients et comptes rattachés',
      montantBrut: 45000000,
      provisions: 2250000,
      montantNet: 42750000,
      echeance: '< 1 an',
    },
    {
      nature: 'Autres créances',
      montantBrut: 8500000,
      provisions: 150000,
      montantNet: 8350000,
      echeance: '< 6 mois',
    },
    {
      nature: 'Comptes de régularisation',
      montantBrut: 3200000,
      provisions: 0,
      montantNet: 3200000,
      echeance: '< 3 mois',
    },
  ])

  // Données des dettes
  const [dettesData] = useState([
    {
      nature: 'Emprunts et dettes financières',
      montant: 85000000,
      echeance1an: 12000000,
      echeance1a5ans: 45000000,
      echeanceplus5ans: 28000000,
      taux: '6.5%',
    },
    {
      nature: 'Fournisseurs et comptes rattachés',
      montant: 28500000,
      echeance1an: 28500000,
      echeance1a5ans: 0,
      echeanceplus5ans: 0,
      taux: '-',
    },
    {
      nature: 'Dettes fiscales et sociales',
      montant: 15200000,
      echeance1an: 15200000,
      echeance1a5ans: 0,
      echeanceplus5ans: 0,
      taux: '-',
    },
  ])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountTree sx={{ mr: 2, color: 'secondary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
            État Annexé
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Détails des postes du bilan - SYSCOHADA
          </Typography>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        L'état annexé présente le détail et les mouvements des principaux postes du bilan.
      </Alert>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="état annexé tabs">
            <Tab 
              icon={<Business />} 
              label="Immobilisations" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<Inventory />} 
              label="Stocks" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<AttachMoney />} 
              label="Créances" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<AccountBalance />} 
              label="Dettes" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
          </Tabs>
        </Box>

        {/* Onglet Immobilisations */}
        <TabPanel value={tabValue} index={0}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Mouvements des immobilisations corporelles
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur brute</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amortissements</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Acquisitions</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Cessions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {immobilisationsData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={row.nature} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.valeurBrute}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            formatNumber(row.valeurBrute)
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {formatNumber(row.amortissements)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatNumber(row.valeurNette)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {row.acquisitions > 0 ? formatNumber(row.acquisitions) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {row.cessions > 0 ? formatNumber(row.cessions) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(immobilisationsData.reduce((sum, item) => sum + item.valeurBrute, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatNumber(immobilisationsData.reduce((sum, item) => sum + item.amortissements, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(immobilisationsData.reduce((sum, item) => sum + item.valeurNette, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatNumber(immobilisationsData.reduce((sum, item) => sum + item.acquisitions, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        {formatNumber(immobilisationsData.reduce((sum, item) => sum + item.cessions, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Onglet Stocks */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Analyse des stocks
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'info.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Stock initial</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Stock final</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Provisions</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Rotation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocksData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={row.nature} size="small" variant="outlined" color="info" />
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(row.stockInitial)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatNumber(row.stockFinal)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {formatNumber(row.provisions)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${row.rotation}`} 
                            size="small" 
                            color={row.rotation > 10 ? 'success' : row.rotation > 5 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Onglet Créances */}
        <TabPanel value={tabValue} index={2}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Détail des créances
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'success.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant brut</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Provisions</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant net</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Échéance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {creancesData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={row.nature} size="small" variant="outlined" color="success" />
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(row.montantBrut)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {row.provisions > 0 ? formatNumber(row.provisions) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatNumber(row.montantNet)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.echeance} size="small" color="default" />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(creancesData.reduce((sum, item) => sum + item.montantBrut, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatNumber(creancesData.reduce((sum, item) => sum + item.provisions, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(creancesData.reduce((sum, item) => sum + item.montantNet, 0))}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Onglet Dettes */}
        <TabPanel value={tabValue} index={3}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Échéancier des dettes
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{'< 1 an'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>1 à 5 ans</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{'> 5 ans'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dettesData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={row.nature} size="small" variant="outlined" color="warning" />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatNumber(row.montant)}
                        </TableCell>
                        <TableCell align="right">
                          {row.echeance1an > 0 ? formatNumber(row.echeance1an) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {row.echeance1a5ans > 0 ? formatNumber(row.echeance1a5ans) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {row.echeanceplus5ans > 0 ? formatNumber(row.echeanceplus5ans) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.taux} size="small" color="default" />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(dettesData.reduce((sum, item) => sum + item.montant, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(dettesData.reduce((sum, item) => sum + item.echeance1an, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(dettesData.reduce((sum, item) => sum + item.echeance1a5ans, 0))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(dettesData.reduce((sum, item) => sum + item.echeanceplus5ans, 0))}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default EtatAnnexe