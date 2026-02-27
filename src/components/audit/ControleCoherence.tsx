/**
 * Composant de contrôle de cohérence entre états de synthèse et notes annexes
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  Warning,
  Error,
  PlayArrow,
  GetApp,
  Visibility,
  ExpandMore,
  AccountBalance,
  TrendingUp,
  Assessment,
  Speed,
  InfoOutlined,
} from '@mui/icons-material'
import { coherenceService, type ControleCoherence, type ResultatValidation } from '@/services/coherenceService'
import { liasseDataService, SYSCOHADA_MAPPING } from '@/services/liasseDataService'

const ControleCoherenceComponent: React.FC = () => {
  const [resultats, setResultats] = useState<ResultatValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailDialog, setDetailDialog] = useState<ControleCoherence | null>(null)
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const lancerControles = async () => {
    setLoading(true)
    try {
      // Calculer les données réelles depuis la balance chargée
      const svc = liasseDataService
      const bilanActifRows = svc.isLoaded() ? svc.generateBilanActif() : []
      const bilanPassifRows = svc.isLoaded() ? svc.generateBilanPassif() : []
      const crData = svc.isLoaded() ? svc.generateCompteResultat() : { charges: [], produits: [] }

      // Helper: sum net by refs
      const sumActifNet = (refs: string[]) => bilanActifRows.filter((r: any) => refs.includes(r.ref)).reduce((s: number, r: any) => s + r.net, 0)
      const sumPassif = (refs: string[]) => bilanPassifRows.filter((r: any) => refs.includes(r.ref)).reduce((s: number, r: any) => s + r.montant, 0)
      const sumCharges = (refs: string[]) => crData.charges.filter((r: any) => refs.includes(r.ref)).reduce((s: number, r: any) => s + r.montant, 0)
      const sumProduits = (refs: string[]) => crData.produits.filter((r: any) => refs.includes(r.ref)).reduce((s: number, r: any) => s + r.montant, 0)

      // Immobilisations corporelles = refs AJ+AK+AL+AM+AN (net)
      const immoCorporellesBilan = sumActifNet(['AJ', 'AK', 'AL', 'AM', 'AN'])
      // Immobilisations incorporelles = refs AD+AE+AF+AG (net)
      const immoIncorporellesBilan = sumActifNet(['AD', 'AE', 'AF', 'AG'])
      // Stocks = refs BC+BD+BE+BF+BG (net)
      const stocksBilan = sumActifNet(['BC', 'BD', 'BE', 'BF', 'BG'])
      // Total actif / passif
      const totalActif = bilanActifRows.reduce((s: number, r: any) => s + r.net, 0)
      const totalPassif = bilanPassifRows.reduce((s: number, r: any) => s + r.montant, 0)
      // Dettes financières = DA+DB+DC+DD+DE+DF
      const dettesFinancieres = sumPassif(['DA', 'DB', 'DC', 'DD', 'DE', 'DF'])
      // Provisions = CJ
      const provisions = sumPassif(['CJ'])
      // CA from produits
      const chiffreAffaires = sumProduits(['TA', 'TB', 'TC'])
      // Dotations amortissements (RL in charges)
      const dotationsAmort = sumCharges(['RL'])
      // Dotations provisions (RM in charges)
      const dotationsProv = sumCharges(['RM'])

      // Note 6 data for cross-check
      const note6 = svc.isLoaded() ? svc.generateNote6() : []
      const note6NetCorp = note6.reduce((s: number, l: any) => s + l.valeurNette, 0)
      // Note 3A for incorporelles
      const note3A = svc.isLoaded() ? svc.generateNote3A() : { incorporelles: [], corporelles: [], financieres: [], avances: [] }
      const note3ANetIncorp = note3A.incorporelles.reduce((s: number, l: any) => s + (l.brutCloture || 0), 0)
      // Note 8 for stocks
      const note8 = svc.isLoaded() ? svc.generateNote8() : []
      const note8Total = note8.reduce((s: number, l: any) => s + l.valeurNette, 0)
      // Note 14 for dettes
      const note14 = svc.isLoaded() ? svc.generateNote14() : []
      const note14Total = note14.reduce((s: number, l: any) => s + l.solde, 0)
      // Note 17 for CA
      const note17 = svc.isLoaded() ? svc.generateNote17() : []
      const note17Total = note17.reduce((s: number, l: any) => s + l.montantN, 0)

      const donneesReelles = {
        bilanActif: {
          immobilisationsCorporelles: immoCorporellesBilan,
          immobilisationsIncorporelles: immoIncorporellesBilan,
          stocks: stocksBilan,
          creancesClients: sumActifNet(['BJ']),
          totalActif,
        },
        bilanPassif: {
          dettesFinancieres,
          provisions,
          totalPassif,
        },
        compteResultat: {
          chiffreAffaires,
          dotationsAmortissements: dotationsAmort,
          dotationsProvisions: dotationsProv,
        },
        tft: {
          fluxExploitation: { total: 0, dotationsAmortissements: dotationsAmort },
          fluxInvestissement: { total: 0, acquisitionsImmobilisations: 0, cessionImmobilisations: 0, subventionsRecues: 0 },
          fluxFinancement: { total: 0 },
          variationTresorerie: 0,
        },
        notesAnnexes: {
          tableauImmobilisations: {
            totalNetCorporelles: note6NetCorp,
            totalNetIncorporelles: note3ANetIncorp,
            mouvements: { augmentations: 0, diminutions: 0 },
            amortissements: { dotationsExercice: dotationsAmort },
            subventions: { recuesExercice: 0 },
          },
          tableauProvisions: {
            totalProvisions: provisions,
            dotationsExercice: dotationsProv,
          },
          dettesSurEtablissementCredit: {
            totalDettes: note14Total,
          },
          chiffreAffaires: {
            totalCA: note17Total,
          },
          mouvementStocks: {
            valeurFinale: note8Total,
          },
        },
      }

      const resultats = await coherenceService.lancerControlesCoherence(donneesReelles)
      setResultats(resultats)
    } catch (error) {
      console.error('Erreur lors des contrôles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'CONFORME': return 'success'
      case 'ECART': return 'warning' 
      case 'ERREUR': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'CONFORME': return <CheckCircle color="success" />
      case 'ECART': return <Warning color="warning" />
      case 'ERREUR': return <Error color="error" />
      default: return <InfoOutlined />
    }
  }

  const exporterRapport = async () => {
    if (!resultats) return
    
    const rapport = await coherenceService.exporterRapportCoherence(resultats)
    const blob = new Blob([rapport], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-coherence-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Contrôle de Cohérence SYSCOHADA
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Vérification automatisée de la cohérence entre les états de synthèse et les notes annexes
      </Typography>

      {/* Actions principales */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={lancerControles}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
            >
              {loading ? 'Contrôles en cours...' : 'Lancer les contrôles'}
            </Button>
          </Grid>
          
          {resultats && (
            <Grid item>
              <Button
                variant="outlined"
                onClick={exporterRapport}
                startIcon={<GetApp />}
              >
                Exporter le rapport
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Résultats */}
      {resultats && (
        <>
          {/* Score global */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: resultats.scoreCoherence >= 80 ? 'success.main' : resultats.scoreCoherence >= 60 ? 'warning.main' : 'error.main' }}>
                    {resultats.scoreCoherence}%
                  </Typography>
                  <Typography variant="h6">Score de Cohérence</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" fontWeight="bold">
                          {resultats.controlesConformes}
                        </Typography>
                        <Typography>Conformes</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" fontWeight="bold">
                          {resultats.controlesEcart}
                        </Typography>
                        <Typography>Écarts</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" fontWeight="bold">
                          {resultats.controlesErreur}
                        </Typography>
                        <Typography>Erreurs</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Détail des contrôles par catégorie */}
          <Paper sx={{ mb: 3 }}>
            {/* Contrôles Bilan vs Notes */}
            <Accordion expanded={expanded === 'bilan'} onChange={handleAccordionChange('bilan')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalance color="primary" />
                  <Typography variant="h6">Cohérence Bilan vs Notes Annexes</Typography>
                  <Chip 
                    label={`${resultats.controles.filter(c => c.type === 'BILAN_NOTES').length} contrôles`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Statut</TableCell>
                        <TableCell>Contrôle</TableCell>
                        <TableCell align="right">Valeur État</TableCell>
                        <TableCell align="right">Valeur Note</TableCell>
                        <TableCell align="right">Écart</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultats.controles
                        .filter(c => c.type === 'BILAN_NOTES')
                        .map((controle) => (
                        <TableRow key={controle.id}>
                          <TableCell>
                            <Chip 
                              icon={getStatusIcon(controle.statut)}
                              label={controle.statut}
                              color={getStatusColor(controle.statut) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{controle.description}</TableCell>
                          <TableCell align="right">
                            {controle.valeurEtat ? coherenceService['formatMontant'](controle.valeurEtat) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.valeurNote ? coherenceService['formatMontant'](controle.valeurNote) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.ecart ? coherenceService['formatMontant'](controle.ecart) : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => setDetailDialog(controle)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            {/* Contrôles TFT vs Immobilisations */}
            <Accordion expanded={expanded === 'tft'} onChange={handleAccordionChange('tft')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp color="secondary" />
                  <Typography variant="h6">Cohérence TFT vs Tableau Immobilisations</Typography>
                  <Chip 
                    label={`${resultats.controles.filter(c => c.type === 'TFT_IMMOBILISATIONS').length} contrôles`}
                    size="small"
                    color="secondary"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Statut</TableCell>
                        <TableCell>Contrôle</TableCell>
                        <TableCell align="right">Valeur TFT</TableCell>
                        <TableCell align="right">Valeur Tableau</TableCell>
                        <TableCell align="right">Écart</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultats.controles
                        .filter(c => c.type === 'TFT_IMMOBILISATIONS')
                        .map((controle) => (
                        <TableRow key={controle.id}>
                          <TableCell>
                            <Chip 
                              icon={getStatusIcon(controle.statut)}
                              label={controle.statut}
                              color={getStatusColor(controle.statut) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{controle.description}</TableCell>
                          <TableCell align="right">
                            {controle.valeurEtat ? coherenceService['formatMontant'](controle.valeurEtat) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.valeurNote ? coherenceService['formatMontant'](controle.valeurNote) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.ecart ? coherenceService['formatMontant'](controle.ecart) : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => setDetailDialog(controle)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            {/* Contrôles Compte de Résultat vs Notes */}
            <Accordion expanded={expanded === 'resultat'} onChange={handleAccordionChange('resultat')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Assessment color="info" />
                  <Typography variant="h6">Cohérence Compte de Résultat vs Notes</Typography>
                  <Chip 
                    label={`${resultats.controles.filter(c => c.type === 'RESULTAT_NOTES').length} contrôles`}
                    size="small"
                    color="info"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Statut</TableCell>
                        <TableCell>Contrôle</TableCell>
                        <TableCell align="right">Valeur Résultat</TableCell>
                        <TableCell align="right">Valeur Note</TableCell>
                        <TableCell align="right">Écart</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultats.controles
                        .filter(c => c.type === 'RESULTAT_NOTES')
                        .map((controle) => (
                        <TableRow key={controle.id}>
                          <TableCell>
                            <Chip 
                              icon={getStatusIcon(controle.statut)}
                              label={controle.statut}
                              color={getStatusColor(controle.statut) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{controle.description}</TableCell>
                          <TableCell align="right">
                            {controle.valeurEtat ? coherenceService['formatMontant'](controle.valeurEtat) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.valeurNote ? coherenceService['formatMontant'](controle.valeurNote) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {controle.ecart ? coherenceService['formatMontant'](controle.ecart) : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => setDetailDialog(controle)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Paper>

          {/* Alertes et recommandations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Alertes et Recommandations
            </Typography>
            
            {resultats.controlesErreur > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>{resultats.controlesErreur} erreur(s) critique(s)</strong> détectée(s). 
                Ces incohérences doivent être corrigées avant finalisation de la liasse.
              </Alert>
            )}
            
            {resultats.controlesEcart > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{resultats.controlesEcart} écart(s)</strong> détecté(s). 
                Vérifiez les montants dans les notes annexes.
              </Alert>
            )}
            
            {resultats.scoreCoherence === 100 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Parfait !</strong> Toutes les vérifications de cohérence sont conformes.
                La liasse peut être finalisée en toute confiance.
              </Alert>
            )}

            {/* Liste des recommandations */}
            {resultats.controles.some(c => c.recommandation) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Recommandations spécifiques :
                </Typography>
                <List>
                  {resultats.controles
                    .filter(c => c.recommandation)
                    .map((controle, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getStatusIcon(controle.statut)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={controle.description}
                        secondary={controle.recommandation}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Dialog de détail */}
      <Dialog 
        open={!!detailDialog} 
        onClose={() => setDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {detailDialog && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusIcon(detailDialog.statut)}
              {detailDialog.description}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valeur dans l'état
                  </Typography>
                  <Typography variant="h6">
                    {coherenceService['formatMontant'](detailDialog.valeurEtat)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valeur dans la note
                  </Typography>
                  <Typography variant="h6">
                    {coherenceService['formatMontant'](detailDialog.valeurNote)}
                  </Typography>
                </Grid>
                {detailDialog.ecart && detailDialog.ecart > 0 && (
                  <Grid item xs={12}>
                    <Alert severity={detailDialog.statut === 'ERREUR' ? 'error' : 'warning'}>
                      <strong>Écart détecté :</strong> {coherenceService['formatMontant'](detailDialog.ecart)}
                      <br />
                      <strong>Seuil de tolérance :</strong> {coherenceService['formatMontant'](detailDialog.seuil)}
                    </Alert>
                  </Grid>
                )}
                {detailDialog.recommandation && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Recommandation :
                      </Typography>
                      <Typography variant="body2">
                        {detailDialog.recommandation}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialog(null)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Instructions si pas de résultats */}
      {!resultats && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Speed sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Contrôles de cohérence SYSCOHADA
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Lancez les contrôles pour vérifier la cohérence entre vos états de synthèse et notes annexes
          </Typography>
          <Button 
            variant="contained"
            onClick={lancerControles}
            startIcon={<PlayArrow />}
          >
            Démarrer l'analyse
          </Button>
        </Paper>
      )}
    </Box>
  )
}

export default ControleCoherenceComponent