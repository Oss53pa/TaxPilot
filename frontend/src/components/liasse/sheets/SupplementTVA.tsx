/**
 * Supplément TVA - Déclaration détaillée de la TVA
 */

import { useState, type FC, type SyntheticEvent } from 'react'
import { TabPanel } from '@/components/shared/TabPanel'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  Tab,
  Tabs,
  Alert,
  Divider,
  Stack,
} from '@mui/material'

const SupplementTVA: FC = () => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const operationsTVA = {
    collectee: [
      { description: 'Ventes de marchandises (taux 18%)', baseHT: 125000000, taux: 18, montantTVA: 22500000 },
      { description: 'Prestations de services (taux 18%)', baseHT: 15000000, taux: 18, montantTVA: 2700000 },
      { description: 'Locations (taux 18%)', baseHT: 8000000, taux: 18, montantTVA: 1440000 },
      { description: 'Exportations (taux 0%)', baseHT: 12000000, taux: 0, montantTVA: 0 },
    ],
    deductible: [
      { description: 'Achats de marchandises', baseHT: 65200000, taux: 18, montantTVA: 11736000 },
      { description: 'Achats matières premières', baseHT: 28000000, taux: 18, montantTVA: 5040000 },
      { description: 'Services extérieurs', baseHT: 19200000, taux: 18, montantTVA: 3456000 },
      { description: 'Immobilisations', baseHT: 5000000, taux: 18, montantTVA: 900000 },
      { description: 'Autres charges', baseHT: 8000000, taux: 18, montantTVA: 1440000 },
    ]
  }

  const totalTVACollectee = operationsTVA.collectee.reduce((sum, op) => sum + op.montantTVA, 0)
  const totalTVADeductible = operationsTVA.deductible.reduce((sum, op) => sum + op.montantTVA, 0)
  const tvaAVerser = Math.max(0, totalTVACollectee - totalTVADeductible)
  const creditTVA = Math.max(0, totalTVADeductible - totalTVACollectee)

  const declarationsMensuelles = [
    { mois: 'Janvier', collectee: 2100000, deductible: 1850000, aVerser: 250000, verse: 250000 },
    { mois: 'Février', collectee: 2200000, deductible: 1900000, aVerser: 300000, verse: 300000 },
    { mois: 'Mars', collectee: 2300000, deductible: 2100000, aVerser: 200000, verse: 200000 },
    { mois: 'Avril', collectee: 2150000, deductible: 1950000, aVerser: 200000, verse: 200000 },
    { mois: 'Mai', collectee: 2400000, deductible: 2200000, aVerser: 200000, verse: 200000 },
    { mois: 'Juin', collectee: 2250000, deductible: 2000000, aVerser: 250000, verse: 250000 },
    { mois: 'Juillet', collectee: 2300000, deductible: 2100000, aVerser: 200000, verse: 200000 },
    { mois: 'Août', collectee: 2350000, deductible: 2150000, aVerser: 200000, verse: 200000 },
    { mois: 'Septembre', collectee: 2200000, deductible: 2000000, aVerser: 200000, verse: 200000 },
    { mois: 'Octobre', collectee: 2400000, deductible: 2200000, aVerser: 200000, verse: 200000 },
    { mois: 'Novembre', collectee: 2300000, deductible: 2100000, aVerser: 200000, verse: 200000 },
    { mois: 'Décembre', collectee: 2186000, deductible: 2082000, aVerser: 104000, verse: 104000 },
  ]

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Supplément - Déclaration TVA Détaillée (en FCFA)
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="TVA Collectée" />
          <Tab label="TVA Déductible" />
          <Tab label="Suivi Mensuel" />
          <Tab label="Récapitulatif" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              TVA Collectée sur les Ventes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Opérations</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Base HT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TVA Collectée</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operationsTVA.collectee.map((operation, index) => (
                    <TableRow key={index}>
                      <TableCell>{operation.description}</TableCell>
                      <TableCell align="right">{formatMontant(operation.baseHT)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${operation.taux}%`} 
                          size="small"
                          color={operation.taux > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatMontant(operation.montantTVA)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700 }}>TOTAL TVA COLLECTÉE</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(operationsTVA.collectee.reduce((sum, op) => sum + op.baseHT, 0))}
                    </TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatMontant(totalTVACollectee)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              TVA Déductible sur les Achats
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Opérations</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Base HT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TVA Déductible</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operationsTVA.deductible.map((operation, index) => (
                    <TableRow key={index}>
                      <TableCell>{operation.description}</TableCell>
                      <TableCell align="right">{formatMontant(operation.baseHT)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${operation.taux}%`} 
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatMontant(operation.montantTVA)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700 }}>TOTAL TVA DÉDUCTIBLE</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(operationsTVA.deductible.reduce((sum, op) => sum + op.baseHT, 0))}
                    </TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatMontant(totalTVADeductible)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Suivi des Déclarations Mensuelles
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Mois</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TVA Collectée</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TVA Déductible</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>À Verser</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Versé</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {declarationsMensuelles.map((decl, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500 }}>{decl.mois}</TableCell>
                      <TableCell align="right">{formatMontant(decl.collectee)}</TableCell>
                      <TableCell align="right">{formatMontant(decl.deductible)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatMontant(decl.aVerser)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {formatMontant(decl.verse)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label="Payé" 
                          size="small" 
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700 }}>TOTAL ANNÉE</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(declarationsMensuelles.reduce((sum, d) => sum + d.collectee, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(declarationsMensuelles.reduce((sum, d) => sum + d.deductible, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(declarationsMensuelles.reduce((sum, d) => sum + d.aVerser, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatMontant(declarationsMensuelles.reduce((sum, d) => sum + d.verse, 0))}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label="Conforme" color="success" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Récapitulatif Annuel TVA
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                      TVA Collectée
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatMontant(totalTVACollectee)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sur un chiffre d'affaires HT de {formatMontant(160000000)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      TVA Déductible
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatMontant(totalTVADeductible)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sur des achats HT de {formatMontant(125400000)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Card sx={{ backgroundColor: tvaAVerser > 0 ? theme.palette.error.light : theme.palette.success.light }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  Solde TVA de l'Exercice
                </Typography>
                {tvaAVerser > 0 ? (
                  <>
                    <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: 'error.main' }}>
                      {formatMontant(tvaAVerser)}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                      TVA à verser au Trésor Public
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: 'success.main' }}>
                      {formatMontant(creditTVA)}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                      Crédit de TVA à reporter
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            <Stack spacing={2} sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Régime :</strong> Régime du réel - Déclarations mensuelles obligatoires
                </Typography>
              </Alert>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Conformité :</strong> Toutes les déclarations mensuelles ont été déposées dans les délais
                </Typography>
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Rappel :</strong> Délai de déclaration : 20 de chaque mois pour le mois précédent
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default SupplementTVA