import { logger } from '@/utils/logger'
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
  Chip,
  Stack,
} from '@mui/material'
import {
  AccountTree,
  Business,
  AttachMoney,
  Inventory,
  AccountBalance,
} from '@mui/icons-material'
import EditableToolbar from './shared/EditableToolbar'
import { TabPanel } from '@/components/shared/TabPanel'
import { useBalanceData } from '@/hooks/useBalanceData'

interface EtatAnnexeProps {
  modeEdition?: boolean
}

const EtatAnnexe: React.FC<EtatAnnexeProps> = () => {
  const [tabValue, setTabValue] = useState(0)
  const [modeEdition, setModeEdition] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const bal = useBalanceData()

  // Données des immobilisations (computed from balance)
  const terrainsBrut = bal.d(['22'])
  const batimentsBrut = bal.d(['23'])
  const materielBrut = bal.d(['24'])
  const vehiculesBrut = bal.d(['245'])
  const mobilierBrut = bal.d(['244'])
  const amortTerrains = bal.c(['282'])
  const amortBatiments = bal.c(['283'])
  const amortMateriel = bal.c(['284'])
  const amortVehicules = bal.c(['2845'])
  const amortMobilier = bal.c(['2844'])

  const [immobilisationsData, setImmobilisationsData] = useState([
    {
      nature: 'Terrains',
      valeurBrute: terrainsBrut,
      amortissements: amortTerrains,
      valeurNette: terrainsBrut - amortTerrains,
      acquisitions: 0,
      cessions: 0,
    },
    {
      nature: 'Bâtiments',
      valeurBrute: batimentsBrut,
      amortissements: amortBatiments,
      valeurNette: batimentsBrut - amortBatiments,
      acquisitions: 0,
      cessions: 0,
    },
    {
      nature: 'Matériel et outillage',
      valeurBrute: materielBrut,
      amortissements: amortMateriel,
      valeurNette: materielBrut - amortMateriel,
      acquisitions: 0,
      cessions: 0,
    },
    {
      nature: 'Matériel de transport',
      valeurBrute: vehiculesBrut,
      amortissements: amortVehicules,
      valeurNette: vehiculesBrut - amortVehicules,
      acquisitions: 0,
      cessions: 0,
    },
    {
      nature: 'Mobilier et matériel de bureau',
      valeurBrute: mobilierBrut,
      amortissements: amortMobilier,
      valeurNette: mobilierBrut - amortMobilier,
      acquisitions: 0,
      cessions: 0,
    },
  ])

  // Données des stocks (computed from balance)
  const [stocksData, setStocksData] = useState([
    {
      nature: 'Marchandises',
      stockInitial: 0,
      stockFinal: bal.d(['31']),
      provisions: 0,
      rotation: 0,
    },
    {
      nature: 'Matières premières',
      stockInitial: 0,
      stockFinal: bal.d(['32', '33']),
      provisions: 0,
      rotation: 0,
    },
    {
      nature: 'Produits finis',
      stockInitial: 0,
      stockFinal: bal.d(['36', '37', '38']),
      provisions: 0,
      rotation: 0,
    },
    {
      nature: 'En-cours de production',
      stockInitial: 0,
      stockFinal: bal.d(['34', '35']),
      provisions: 0,
      rotation: 0,
    },
  ])

  // Données des créances (computed from balance)
  const clientsBrut = bal.d(['411', '412', '413', '414', '415', '416', '418'])
  const provisionsClients = bal.c(['491'])
  const autresCreances = bal.d(['42', '43', '44', '45', '46', '47'])

  const [creancesData, setCreancesData] = useState([
    {
      nature: 'Clients et comptes rattachés',
      montantBrut: clientsBrut,
      provisions: provisionsClients,
      montantNet: clientsBrut - provisionsClients,
      echeance: '< 1 an',
    },
    {
      nature: 'Autres créances',
      montantBrut: autresCreances,
      provisions: 0,
      montantNet: autresCreances,
      echeance: '< 6 mois',
    },
    {
      nature: 'Comptes de régularisation',
      montantBrut: 0,
      provisions: 0,
      montantNet: 0,
      echeance: '< 3 mois',
    },
  ])

  // Données des dettes (computed from balance)
  const emprunts = bal.c(['16', '17'])
  const fournisseurs = bal.c(['40'])
  const dettesFiscalesSociales = bal.c(['43', '44'])

  const [dettesData, setDettesData] = useState([
    {
      nature: 'Emprunts et dettes financières',
      montant: emprunts,
      echeance1an: 0,
      echeance1a5ans: 0,
      echeanceplus5ans: 0,
      taux: '-',
    },
    {
      nature: 'Fournisseurs et comptes rattachés',
      montant: fournisseurs,
      echeance1an: fournisseurs,
      echeance1a5ans: 0,
      echeanceplus5ans: 0,
      taux: '-',
    },
    {
      nature: 'Dettes fiscales et sociales',
      montant: dettesFiscalesSociales,
      echeance1an: dettesFiscalesSociales,
      echeance1a5ans: 0,
      echeanceplus5ans: 0,
      taux: '-',
    },
  ])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const updateImmobilisation = (index: number, field: string, value: number) => {
    setImmobilisationsData(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      if (field === 'valeurBrute' || field === 'amortissements') {
        copy[index].valeurNette = copy[index].valeurBrute - copy[index].amortissements
      }
      return copy
    })
    setHasChanges(true)
  }

  const updateStock = (index: number, field: string, value: number) => {
    setStocksData(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
    setHasChanges(true)
  }

  const updateCreance = (index: number, field: string, value: number) => {
    setCreancesData(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      if (field === 'montantBrut' || field === 'provisions') {
        copy[index].montantNet = copy[index].montantBrut - copy[index].provisions
      }
      return copy
    })
    setHasChanges(true)
  }

  const updateDette = (index: number, field: string, value: number) => {
    setDettesData(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
    setHasChanges(true)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <AccountTree sx={{ mr: 2, color: 'secondary.main', fontSize: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
            État Annexé
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Détails des postes du bilan - SYSCOHADA
          </Typography>
        </Box>
        <EditableToolbar
          isEditMode={modeEdition}
          onToggleEdit={() => setModeEdition(!modeEdition)}
          hasChanges={hasChanges}
          onSave={() => { logger.debug('Sauvegarde état annexé'); setHasChanges(false) }}
        />
      </Stack>
      
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
                              onChange={(e) => updateImmobilisation(index, 'valeurBrute', Number(e.target.value))}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            formatNumber(row.valeurBrute)
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.amortissements}
                              onChange={(e) => updateImmobilisation(index, 'amortissements', Number(e.target.value))}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            formatNumber(row.amortissements)
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatNumber(row.valeurNette)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.acquisitions}
                              onChange={(e) => updateImmobilisation(index, 'acquisitions', Number(e.target.value))}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            row.acquisitions > 0 ? formatNumber(row.acquisitions) : '-'
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.cessions}
                              onChange={(e) => updateImmobilisation(index, 'cessions', Number(e.target.value))}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            row.cessions > 0 ? formatNumber(row.cessions) : '-'
                          )}
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
                          {modeEdition ? (
                            <TextField type="number" value={row.stockInitial} onChange={(e) => updateStock(index, 'stockInitial', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : formatNumber(row.stockInitial)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {modeEdition ? (
                            <TextField type="number" value={row.stockFinal} onChange={(e) => updateStock(index, 'stockFinal', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : formatNumber(row.stockFinal)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {modeEdition ? (
                            <TextField type="number" value={row.provisions} onChange={(e) => updateStock(index, 'provisions', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : formatNumber(row.provisions)}
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
                          {modeEdition ? (
                            <TextField type="number" value={row.montantBrut} onChange={(e) => updateCreance(index, 'montantBrut', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : formatNumber(row.montantBrut)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {modeEdition ? (
                            <TextField type="number" value={row.provisions} onChange={(e) => updateCreance(index, 'provisions', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : (row.provisions > 0 ? formatNumber(row.provisions) : '-')}
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
                          {modeEdition ? (
                            <TextField type="number" value={row.montant} onChange={(e) => updateDette(index, 'montant', Number(e.target.value))} size="small" sx={{ width: 120 }} />
                          ) : formatNumber(row.montant)}
                        </TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField type="number" value={row.echeance1an} onChange={(e) => updateDette(index, 'echeance1an', Number(e.target.value))} size="small" sx={{ width: 100 }} />
                          ) : (row.echeance1an > 0 ? formatNumber(row.echeance1an) : '-')}
                        </TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField type="number" value={row.echeance1a5ans} onChange={(e) => updateDette(index, 'echeance1a5ans', Number(e.target.value))} size="small" sx={{ width: 100 }} />
                          ) : (row.echeance1a5ans > 0 ? formatNumber(row.echeance1a5ans) : '-')}
                        </TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField type="number" value={row.echeanceplus5ans} onChange={(e) => updateDette(index, 'echeanceplus5ans', Number(e.target.value))} size="small" sx={{ width: 100 }} />
                          ) : (row.echeanceplus5ans > 0 ? formatNumber(row.echeanceplus5ans) : '-')}
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