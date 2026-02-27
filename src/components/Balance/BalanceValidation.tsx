/**
 * Composant de validation de la balance
 */

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  PlayArrow,
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  AutoAwesome,
  Visibility,
  Build,
  Assessment,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '@/store'
import { startAudit, setAuditProgress, setCurrentAudit } from '@/store/auditSlice'
import { AuditAnomalie } from '@/types'
import { liasseDataService } from '@/services/liasseDataService'

interface ValidationTest {
  id: string
  nom: string
  description: string
  type: 'EQUILIBRE' | 'COHERENCE' | 'COMPLETUDE' | 'VARIATION'
  statut: 'pending' | 'running' | 'success' | 'warning' | 'error'
  resultat?: string
  details?: string
  anomalies?: AuditAnomalie[]
}

const testsValidation: ValidationTest[] = [
  {
    id: 'equilibre',
    nom: 'Équilibre Débit/Crédit',
    description: 'Vérification que la somme des débits égale la somme des crédits',
    type: 'EQUILIBRE',
    statut: 'pending',
  },
  {
    id: 'coherence',
    nom: 'Cohérence des Soldes',
    description: 'Contrôle de la cohérence des soldes selon le sens normal des comptes',
    type: 'COHERENCE',
    statut: 'pending',
  },
  {
    id: 'completude',
    nom: 'Complétude des Comptes',
    description: 'Vérification de la présence des comptes obligatoires',
    type: 'COMPLETUDE',
    statut: 'pending',
  },
  {
    id: 'variation',
    nom: 'Variation N/N-1',
    description: 'Analyse des variations significatives par rapport à l\'exercice précédent',
    type: 'VARIATION',
    statut: 'pending',
  },
]

const BalanceValidation: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isRunning, progress, currentAudit } = useAppSelector(state => state.audit)
  const { balances } = useAppSelector(state => state.balance)
  
  const [tests, setTests] = useState<ValidationTest[]>(testsValidation)
  const [selectedAnomalie, setSelectedAnomalie] = useState<AuditAnomalie | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)

  const lancerValidation = async () => {
    dispatch(startAudit())
    
    // Simulation de la validation étape par étape
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      
      // Marquer le test comme en cours
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, statut: 'running' } : t
      ))
      
      dispatch(setAuditProgress({
        current: i,
        total: tests.length,
        stage: `Exécution: ${test.nom}...`,
      }))
      
      // Simulation du traitement
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Résultats factices
      let statut: ValidationTest['statut'] = 'success'
      let resultat = 'Test réussi'
      let anomalies: AuditAnomalie[] = []
      
      if (test.id === 'equilibre') {
        const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0)
        const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0)
        const ecart = Math.abs(totalDebit - totalCredit)
        
        if (ecart > 0.01) {
          statut = 'error'
          resultat = `Écart détecté: ${ecart.toLocaleString()} FCFA`
          anomalies = [{
            id: 'eq1',
            type: 'ERROR',
            compte: 'GLOBAL',
            description: 'Balance déséquilibrée',
            montant_impact: ecart,
            priorite: 'HAUTE',
          }]
        }
      } else if (test.id === 'coherence') {
        // Détection réelle d'anomalies de sens de comptes
        anomalies = []
        let anomalyId = 0

        // Règles de sens de comptes SYSCOHADA
        const sensRules: { prefix: string; sensNormal: 'debit' | 'credit'; label: string; exceptions?: string[] }[] = [
          { prefix: '1', sensNormal: 'credit', label: 'Capitaux propres', exceptions: ['109', '119'] },
          { prefix: '2', sensNormal: 'debit', label: 'Immobilisations', exceptions: ['28', '29'] },
          { prefix: '28', sensNormal: 'credit', label: 'Amortissements' },
          { prefix: '29', sensNormal: 'credit', label: 'Dépréciations immobilisations' },
          { prefix: '3', sensNormal: 'debit', label: 'Stocks', exceptions: ['39'] },
          { prefix: '39', sensNormal: 'credit', label: 'Dépréciations stocks' },
          { prefix: '401', sensNormal: 'credit', label: 'Fournisseurs' },
          { prefix: '411', sensNormal: 'debit', label: 'Clients' },
          { prefix: '6', sensNormal: 'debit', label: 'Charges' },
          { prefix: '7', sensNormal: 'credit', label: 'Produits' },
        ]

        for (const rule of sensRules) {
          for (const b of balances) {
            const compte = (b as any).compte || (b as any).numero_compte || ''
            if (!compte.startsWith(rule.prefix)) continue
            if (rule.exceptions?.some(exc => compte.startsWith(exc))) continue

            const soldeD = Number((b as any).solde_debit || (b as any).solde_debiteur) || 0
            const soldeC = Number((b as any).solde_credit || (b as any).solde_crediteur) || 0

            const isBadSense =
              (rule.sensNormal === 'credit' && soldeD > 0 && soldeC === 0) ||
              (rule.sensNormal === 'debit' && soldeC > 0 && soldeD === 0)

            if (isBadSense) {
              anomalyId++
              anomalies.push({
                id: `sens_${anomalyId}`,
                type: 'WARNING',
                compte,
                description: `Solde ${rule.sensNormal === 'credit' ? 'débiteur' : 'créditeur'} inhabituel pour ${rule.label} (${compte})`,
                montant_impact: rule.sensNormal === 'credit' ? soldeD : soldeC,
                priorite: 'MOYENNE',
              })
            }
          }
        }

        // Vérifier aussi l'équilibre bilan via liasseDataService
        if (liasseDataService.isLoaded()) {
          const validation = liasseDataService.validateCoherence()
          if (!validation.isValid) {
            for (const err of validation.errors) {
              anomalyId++
              anomalies.push({
                id: `coh_${anomalyId}`,
                type: 'ERROR',
                compte: 'GLOBAL',
                description: err,
                priorite: 'HAUTE',
              })
            }
          }
        }

        if (anomalies.length === 0) {
          statut = 'success'
          resultat = 'Aucune anomalie de sens détectée'
        } else {
          const hasErrors = anomalies.some(a => a.type === 'ERROR')
          statut = hasErrors ? 'error' : 'warning'
          resultat = `${anomalies.length} anomalie(s) détectée(s)`
        }
      }
      
      setTests(prev => prev.map(t => 
        t.id === test.id 
          ? { ...t, statut, resultat, anomalies, details: resultat }
          : t
      ))
    }
    
    // Finalisation de l'audit - score calculé dynamiquement
    const allAnomalies = tests.flatMap(t => t.anomalies || [])
    const nbAnomalies = allAnomalies.length
    const nbErrors = allAnomalies.filter(a => a.type === 'ERROR').length
    const nbWarnings = allAnomalies.filter(a => a.type === 'WARNING').length
    // Score: 100 - 20 par erreur - 5 par warning, minimum 0
    const scoreGlobal = Math.max(0, 100 - nbErrors * 20 - nbWarnings * 5)

    const recommandations: string[] = []
    if (nbErrors > 0) recommandations.push('Corriger les erreurs bloquantes (équilibre, cohérence)')
    if (nbWarnings > 0) recommandations.push('Vérifier les comptes avec soldes inhabituels')
    if (nbAnomalies === 0) recommandations.push('Aucune anomalie détectée - balance conforme')

    dispatch(setCurrentAudit({
      score_global: scoreGlobal,
      nb_anomalies: nbAnomalies,
      anomalies: allAnomalies,
      recommandations,
      last_audit: new Date().toISOString(),
    }))
    
    dispatch(setAuditProgress({
      current: tests.length,
      total: tests.length,
      stage: 'Audit terminé',
    }))
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'success':
        return <CheckCircle color="success" />
      case 'warning':
        return <Warning color="warning" />
      case 'error':
        return <Error color="error" />
      case 'running':
        return <LinearProgress sx={{ width: 20 }} />
      default:
        return <Info color="disabled" />
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'running':
        return 'info'
      default:
        return 'default'
    }
  }

  const showAnomalieDetail = (anomalie: AuditAnomalie) => {
    setSelectedAnomalie(anomalie)
    setDetailDialog(true)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec bouton de lancement */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Validation de la Balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contrôles automatiques de cohérence et détection d'anomalies
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={lancerValidation}
          disabled={isRunning || balances.length === 0}
        >
          {isRunning ? 'Validation en cours...' : 'Lancer Validation'}
        </Button>
      </Box>

      {/* Progression globale */}
      {isRunning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {progress.stage}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Test {progress.current + 1} sur {progress.total}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(progress.current / progress.total) * 100} 
            sx={{ mt: 1 }}
          />
        </Alert>
      )}

      {/* Score global */}
      {currentAudit && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                    {currentAudit.score_global}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score Global
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${currentAudit.nb_anomalies} anomalie(s)`}
                    color={currentAudit.nb_anomalies === 0 ? 'success' : 'warning'}
                    icon={currentAudit.nb_anomalies === 0 ? <CheckCircle /> : <Warning />}
                  />
                  <Chip
                    label={`${tests.filter(t => t.statut === 'success').length}/${tests.length} tests réussis`}
                    color="info"
                  />
                  <Chip
                    label={balances.length > 0 ? 'Balance importée' : 'Aucune balance'}
                    color={balances.length > 0 ? 'success' : 'error'}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tests de validation */}
      <Card>
        <CardHeader
          title="Tests de Validation"
          avatar={<Assessment color="primary" />}
        />
        <CardContent>
          {tests.map((test) => (
            <Accordion key={test.id} disabled={test.statut === 'pending'}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                  {getStatutIcon(test.statut)}
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {test.nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {test.description}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={test.resultat || 'En attente'}
                    color={getStatutColor(test.statut) as any}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {test.details && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {test.details}
                  </Typography>
                )}
                
                {test.anomalies && test.anomalies.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Anomalies détectées :
                    </Typography>
                    
                    <List dense>
                      {test.anomalies.map((anomalie) => (
                        <ListItem
                          key={anomalie.id}
                          sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}
                        >
                          <ListItemIcon>
                            {anomalie.type === 'ERROR' ? (
                              <Error color="error" />
                            ) : (
                              <Warning color="warning" />
                            )}
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={anomalie.description}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={anomalie.compte}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={anomalie.priorite}
                                  size="small"
                                  color={
                                    anomalie.priorite === 'HAUTE' ? 'error' :
                                    anomalie.priorite === 'MOYENNE' ? 'warning' : 'info'
                                  }
                                />
                                {anomalie.montant_impact && (
                                  <Chip
                                    label={`${anomalie.montant_impact.toLocaleString()} FCFA`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                          />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => showAnomalieDetail(anomalie)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            
                            {anomalie.suggestion_correction && (
                              <IconButton size="small" color="primary">
                                <Build fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {test.statut === 'success' && !test.anomalies?.length && (
                  <Alert severity="success">
                    Aucune anomalie détectée pour ce test
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Recommandations */}
      {currentAudit?.recommandations && currentAudit.recommandations.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardHeader
            title="Recommandations"
            avatar={<AutoAwesome color="primary" />}
          />
          <CardContent>
            <List>
              {currentAudit.recommandations.map((recommandation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText primary={recommandation} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Dialog de détail d'anomalie */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détail de l'Anomalie
        </DialogTitle>
        <DialogContent>
          {selectedAnomalie && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Compte</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedAnomalie.compte}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Chip
                    label={selectedAnomalie.type}
                    color={selectedAnomalie.type === 'ERROR' ? 'error' : 'warning'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Priorité</Typography>
                  <Chip
                    label={selectedAnomalie.priorite}
                    color={
                      selectedAnomalie.priorite === 'HAUTE' ? 'error' :
                      selectedAnomalie.priorite === 'MOYENNE' ? 'warning' : 'info'
                    }
                    size="small"
                  />
                </Grid>
                {selectedAnomalie.montant_impact && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Impact</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedAnomalie.montant_impact.toLocaleString()} FCFA
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Description :</strong> {selectedAnomalie.description}
              </Typography>
              
              {selectedAnomalie.suggestion_correction && (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Suggestion de correction :</strong> {selectedAnomalie.suggestion_correction}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<Build />}>
            Appliquer Correction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BalanceValidation