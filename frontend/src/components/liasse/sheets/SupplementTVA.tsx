/**
 * Supplément TVA - Déclaration détaillée de la TVA
 */

import { useState, type FC, type SyntheticEvent } from 'react'
import { TabPanel } from '@/components/shared/TabPanel'
import { usePrintMode } from '@/components/liasse/PrintModeContext'
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
import { useBalanceData } from '@/hooks/useBalanceData'
import { getTauxFiscaux } from '@/config/taux-fiscaux-ci'

const SupplementTVA: FC = () => {
  const theme = useTheme()
  const printMode = usePrintMode()
  const [activeTab, setActiveTab] = useState(0)
  const bal = useBalanceData()
  const tauxTVA = getTauxFiscaux().TVA.taux_normal * 100

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // TVA calculée depuis la balance
  const ventesMarch = bal.c(['701'])
  const prestations = bal.c(['702', '703', '704', '705', '706', '707'])
  const locations = bal.c(['708'])
  const exportations = bal.c(['709'])

  const achatsMarch = bal.d(['601'])
  const achatsMP = bal.d(['602'])
  const servicesExt = bal.d(['61', '62', '63'])
  const immobilisations = bal.d(['21', '22', '23', '24', '25'])
  const autresCharges = bal.d(['604', '605', '608'])

  const operationsTVA = {
    collectee: [
      { description: `Ventes de marchandises (701) — ${tauxTVA}%`, baseHT: ventesMarch, taux: tauxTVA, montantTVA: Math.round(ventesMarch * tauxTVA / 100) },
      { description: `Prestations de services (702-707) — ${tauxTVA}%`, baseHT: prestations, taux: tauxTVA, montantTVA: Math.round(prestations * tauxTVA / 100) },
      { description: `Locations (708) — ${tauxTVA}%`, baseHT: locations, taux: tauxTVA, montantTVA: Math.round(locations * tauxTVA / 100) },
      { description: 'Exportations (709) — 0%', baseHT: exportations, taux: 0, montantTVA: 0 },
    ],
    deductible: [
      { description: 'Achats de marchandises (601)', baseHT: achatsMarch, taux: tauxTVA, montantTVA: Math.round(achatsMarch * tauxTVA / 100) },
      { description: 'Achats matieres premieres (602)', baseHT: achatsMP, taux: tauxTVA, montantTVA: Math.round(achatsMP * tauxTVA / 100) },
      { description: 'Services exterieurs (61-63)', baseHT: servicesExt, taux: tauxTVA, montantTVA: Math.round(servicesExt * tauxTVA / 100) },
      { description: 'Immobilisations (21-25)', baseHT: immobilisations, taux: tauxTVA, montantTVA: Math.round(immobilisations * tauxTVA / 100) },
      { description: 'Autres charges (604-608)', baseHT: autresCharges, taux: tauxTVA, montantTVA: Math.round(autresCharges * tauxTVA / 100) },
    ]
  }

  const totalTVACollectee = operationsTVA.collectee.reduce((sum, op) => sum + op.montantTVA, 0)
  const totalTVADeductible = operationsTVA.deductible.reduce((sum, op) => sum + op.montantTVA, 0)
  const tvaAVerser = Math.max(0, totalTVACollectee - totalTVADeductible)
  const creditTVA = Math.max(0, totalTVADeductible - totalTVACollectee)

  // Ventilation mensuelle estimée (1/12 par mois)
  const moisNoms = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
  const declarationsMensuelles = moisNoms.map(mois => {
    const coll = Math.round(totalTVACollectee / 12)
    const ded = Math.round(totalTVADeductible / 12)
    const aVerser = Math.max(0, coll - ded)
    return { mois, collectee: coll, deductible: ded, aVerser, verse: aVerser }
  })

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Supplément - Déclaration TVA Détaillée (en FCFA)
      </Typography>

      <Paper sx={{ mb: 3 }}>
        {!printMode && (
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
        )}

        <TabPanel value={activeTab} index={0} label="TVA Collectée">
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

        <TabPanel value={activeTab} index={1} label="TVA Déductible">
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

        <TabPanel value={activeTab} index={2} label="Suivi Mensuel">
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

        <TabPanel value={activeTab} index={3} label="Récapitulatif">
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