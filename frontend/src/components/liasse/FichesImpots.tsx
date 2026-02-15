import { logger } from '@/utils/logger'
/**
 * Composant Fiches Impôts - SYSCOHADA
 */

import React, { useState } from 'react'
import { arrondiFCFA, getTauxFiscaux } from '@/config/taux-fiscaux-ci'
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
  CardHeader,
  Grid,
  Divider,
  Chip,
  Stack,
} from '@mui/material'
import {
  Calculate,
  AccountBalance,
  Receipt,
  Business,
  MonetizationOn,
} from '@mui/icons-material'
import EditableToolbar from './shared/EditableToolbar'
import { TabPanel } from '@/components/shared/TabPanel'

interface FichesImpotsProps {
  modeEdition?: boolean
}

const FichesImpots: React.FC<FichesImpotsProps> = () => {
  const [tabValue, setTabValue] = useState(0)
  const [modeEdition, setModeEdition] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Données pour l'Impôt sur les Sociétés
  const [impotSocieteData, setImpotSocieteData] = useState({
    resultatComptable: 42000000,
    reintegrationsDefinitives: 8500000,
    reintegrationsTemporaires: 3200000,
    deductionsDefinitives: 2100000,
    deductionsTemporaires: 1800000,
    deficitAnterieur: 0,
    beneficeImposable: 49800000,
    tauxIS: 25, // Taux IS Côte d'Ivoire — CGI Art. 33
    impotCalcule: 12450000,
    creditImpot: 0,
    impotDu: 12450000,
  })

  // Données pour la TVA
  const [tvaData, setTvaData] = useState({
    ventesImposables18: 125600000,
    ventesImposables15: 65400000,
    ventesExonerees: 19800000,
    tvaCollectee18: 22608000,
    tvaCollectee15: 9810000,
    achatsImposables: 95000000,
    immobilisationsImposables: 15000000,
    tvaDeductible: 19800000,
    tvaNetteAVerser: 12618000,
  })

  // Données pour les autres impôts
  const [autresImpotsData, setAutresImpotsData] = useState({
    patente: 0, // À calculer depuis le CA via calculerPatente()
    centimes: 125000,
    cnps: 7260000,
    fdfp: 1210000,
    versementTransport: 420000,
    taxeApprentissage: 210000,
  })

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const updateImpotSociete = (field: string, value: number) => {
    setImpotSocieteData(prev => {
      const newData = { ...prev, [field]: value }
      if (['resultatComptable', 'reintegrationsDefinitives', 'reintegrationsTemporaires', 'deductionsDefinitives', 'deductionsTemporaires', 'deficitAnterieur'].includes(field)) {
        newData.beneficeImposable = Math.max(0,
          newData.resultatComptable +
          newData.reintegrationsDefinitives +
          newData.reintegrationsTemporaires -
          newData.deductionsDefinitives -
          newData.deductionsTemporaires -
          newData.deficitAnterieur
        )
        newData.impotCalcule = arrondiFCFA(newData.beneficeImposable * (newData.tauxIS / 100))
        newData.impotDu = Math.max(0, newData.impotCalcule - newData.creditImpot)
      }
      return newData
    })
    setHasChanges(true)
  }

  const updateTVA = (field: string, value: number) => {
    setTvaData(prev => {
      const newData = { ...prev, [field]: value }
      const tauxTVA = getTauxFiscaux().TVA.taux_normal
      newData.tvaCollectee18 = arrondiFCFA(newData.ventesImposables18 * tauxTVA)
      newData.tvaCollectee15 = arrondiFCFA(newData.ventesImposables15 * 0.15)
      newData.tvaDeductible = arrondiFCFA((newData.achatsImposables + newData.immobilisationsImposables) * tauxTVA)
      newData.tvaNetteAVerser = Math.max(0,
        newData.tvaCollectee18 + newData.tvaCollectee15 - newData.tvaDeductible
      )
      return newData
    })
    setHasChanges(true)
  }

  const updateAutresImpots = (field: string, value: number) => {
    setAutresImpotsData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const totalAutresImpots = Object.values(autresImpotsData).reduce((sum, val) => sum + val, 0)
  const totalImpots = impotSocieteData.impotDu + tvaData.tvaNetteAVerser + totalAutresImpots

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Calculate sx={{ mr: 2, color: 'warning.main', fontSize: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
            Fiches de Détermination des Impôts
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Calculs fiscaux - Exercice 2024
          </Typography>
        </Box>
        <EditableToolbar
          isEditMode={modeEdition}
          onToggleEdit={() => setModeEdition(!modeEdition)}
          hasChanges={hasChanges}
          onSave={() => { logger.debug('Sauvegarde fiches impôts'); setHasChanges(false) }}
        />
      </Stack>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Ces fiches permettent le calcul détaillé de tous les impôts et taxes dus par l'entreprise.
      </Alert>

      {/* Résumé des impôts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AccountBalance sx={{ color: 'error.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Impôt sur les Sociétés</Typography>
              <Typography variant="h6" color="error.main">
                {formatNumber(impotSocieteData.impotDu)} F
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Receipt sx={{ color: 'info.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">TVA nette à verser</Typography>
              <Typography variant="h6" color="info.main">
                {formatNumber(tvaData.tvaNetteAVerser)} F
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Business sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Autres impôts</Typography>
              <Typography variant="h6" color="warning.main">
                {formatNumber(totalAutresImpots)} F
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <MonetizationOn sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Total Impôts</Typography>
              <Typography variant="h6" color="success.main">
                {formatNumber(totalImpots)} F
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="fiches impôts tabs">
            <Tab 
              icon={<AccountBalance />} 
              label="Impôt sur les Sociétés" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<Receipt />} 
              label="TVA" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<Business />} 
              label="Autres Impôts" 
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
          </Tabs>
        </Box>

        {/* Onglet Impôt sur les Sociétés */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader 
              avatar={<AccountBalance color="error" />}
              title="Fiche de calcul de l'Impôt sur les Sociétés"
              sx={{ backgroundColor: 'error.light', color: 'white' }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>CALCUL DU BENEFICE IMPOSABLE</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                      <TableCell sx={{ width: 200 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Résultat comptable de l'exercice</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.resultatComptable}
                            onChange={(e) => updateImpotSociete('resultatComptable', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.resultatComptable)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="Base" color="default" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Réintégrations définitives</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.reintegrationsDefinitives}
                            onChange={(e) => updateImpotSociete('reintegrationsDefinitives', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.reintegrationsDefinitives)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="+" color="error" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Réintégrations temporaires</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.reintegrationsTemporaires}
                            onChange={(e) => updateImpotSociete('reintegrationsTemporaires', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.reintegrationsTemporaires)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="+" color="error" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Déductions définitives</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.deductionsDefinitives}
                            onChange={(e) => updateImpotSociete('deductionsDefinitives', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.deductionsDefinitives)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="-" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Déductions temporaires</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.deductionsTemporaires}
                            onChange={(e) => updateImpotSociete('deductionsTemporaires', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.deductionsTemporaires)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="-" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Déficit antérieur imputable</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={impotSocieteData.deficitAnterieur}
                            onChange={(e) => updateImpotSociete('deficitAnterieur', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(impotSocieteData.deficitAnterieur)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label="-" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Bénéfice imposable</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatNumber(impotSocieteData.beneficeImposable)}
                      </TableCell>
                      <TableCell>
                        <Chip label="Résultat" color="primary" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Divider sx={{ my: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>CALCUL DE L'IMPOT</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                      <TableCell sx={{ width: 200 }}>Détail</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Taux d'imposition</TableCell>
                      <TableCell align="right">
                        <Chip label={`${impotSocieteData.tauxIS}%`} color="error" />
                      </TableCell>
                      <TableCell>Taux normal</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Impôt calculé</TableCell>
                      <TableCell align="right">
                        {formatNumber(impotSocieteData.impotCalcule)}
                      </TableCell>
                      <TableCell>
                        {formatNumber(impotSocieteData.beneficeImposable)} x {impotSocieteData.tauxIS}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Crédit d'impôt</TableCell>
                      <TableCell align="right">
                        {formatNumber(impotSocieteData.creditImpot)}
                      </TableCell>
                      <TableCell>Acomptes versés</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'error.light' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }}>IMPÔT DÛ</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                        {formatNumber(impotSocieteData.impotDu)}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        <Chip label="À verser" color="error" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Onglet TVA */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              avatar={<Receipt color="info" />}
              title="Fiche de calcul de la TVA"
              sx={{ backgroundColor: 'info.light', color: 'white' }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    TVA Collectée
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'success.light' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Base imposable</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Taux</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>TVA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={tvaData.ventesImposables18}
                                onChange={(e) => updateTVA('ventesImposables18', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(tvaData.ventesImposables18)
                            )}
                          </TableCell>
                          <TableCell align="right">18%</TableCell>
                          <TableCell align="right">{formatNumber(tvaData.tvaCollectee18)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={tvaData.ventesImposables15}
                                onChange={(e) => updateTVA('ventesImposables15', Number(e.target.value))}
                                size="small"
                                sx={{ width: 120 }}
                              />
                            ) : (
                              formatNumber(tvaData.ventesImposables15)
                            )}
                          </TableCell>
                          <TableCell align="right">15%</TableCell>
                          <TableCell align="right">{formatNumber(tvaData.tvaCollectee15)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Ventes exonérées</TableCell>
                          <TableCell align="right">0%</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>TOTAL COLLECTEE</TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatNumber(tvaData.tvaCollectee18 + tvaData.tvaCollectee15)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    TVA Déductible
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'error.light' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Base</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>TVA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Achats de biens</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={tvaData.achatsImposables}
                                onChange={(e) => updateTVA('achatsImposables', Number(e.target.value))}
                                size="small"
                                sx={{ width: 100 }}
                              />
                            ) : (
                              formatNumber(tvaData.achatsImposables)
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(arrondiFCFA(tvaData.achatsImposables * getTauxFiscaux().TVA.taux_normal))}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Immobilisations</TableCell>
                          <TableCell align="right">
                            {modeEdition ? (
                              <TextField
                                type="number"
                                value={tvaData.immobilisationsImposables}
                                onChange={(e) => updateTVA('immobilisationsImposables', Number(e.target.value))}
                                size="small"
                                sx={{ width: 100 }}
                              />
                            ) : (
                              formatNumber(tvaData.immobilisationsImposables)
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(arrondiFCFA(tvaData.immobilisationsImposables * getTauxFiscaux().TVA.taux_normal))}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600 }}>TOTAL DEDUCTIBLE</TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatNumber(tvaData.tvaDeductible)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: 'info.light' }}>
                          <TableCell sx={{ fontWeight: 600, color: 'white' }}>TVA NETTE À VERSER</TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'white' }}>
                            {formatNumber(tvaData.tvaNetteAVerser)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Onglet Autres Impôts */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              avatar={<Business color="warning" />}
              title="Autres impôts et taxes"
              sx={{ backgroundColor: 'warning.light', color: 'white' }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Observations</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Patente</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.patente}
                            onChange={(e) => updateAutresImpots('patente', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.patente)
                        )}
                      </TableCell>
                      <TableCell>Impôt forfaitaire annuel</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Centimes additionnels</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.centimes}
                            onChange={(e) => updateAutresImpots('centimes', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.centimes)
                        )}
                      </TableCell>
                      <TableCell>5% de la patente</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CNPS (part patronale)</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.cnps}
                            onChange={(e) => updateAutresImpots('cnps', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.cnps)
                        )}
                      </TableCell>
                      <TableCell>Cotisations sociales</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>FDFP</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.fdfp}
                            onChange={(e) => updateAutresImpots('fdfp', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.fdfp)
                        )}
                      </TableCell>
                      <TableCell>Formation professionnelle continue</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Versement transport</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.versementTransport}
                            onChange={(e) => updateAutresImpots('versementTransport', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.versementTransport)
                        )}
                      </TableCell>
                      <TableCell>Transport public</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Taxe d'apprentissage</TableCell>
                      <TableCell align="right">
                        {modeEdition ? (
                          <TextField
                            type="number"
                            value={autresImpotsData.taxeApprentissage}
                            onChange={(e) => updateAutresImpots('taxeApprentissage', Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                          />
                        ) : (
                          formatNumber(autresImpotsData.taxeApprentissage)
                        )}
                      </TableCell>
                      <TableCell>Formation professionnelle</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }}>TOTAL AUTRES IMPÔTS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                        {formatNumber(totalAutresImpots)}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        <Chip label="Total" color="warning" variant="outlined" />
                      </TableCell>
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

export default FichesImpots