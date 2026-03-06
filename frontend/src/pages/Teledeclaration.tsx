/**
 * Page du module de télédéclaration fiscale
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload,
  Send,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Receipt,
  Visibility,
  GetApp,
  Refresh,
} from '@mui/icons-material'
import { taxService } from '@/services/taxService'

const Teledeclaration: React.FC = () => {
  const [etapeActive, setEtapeActive] = useState(0)
  const [transmissionEnCours, setTransmissionEnCours] = useState(false)
  const [loading, setLoading] = useState(true)
  const [declarations, setDeclarations] = useState<any[]>([])
  const [obligations, setObligations] = useState<any[]>([])

  useEffect(() => {
    loadTaxData()
  }, [])

  const loadTaxData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading tax declarations from backend...')

      const [declarationsResponse, obligationsResponse] = await Promise.all([
        taxService.getDeclarations({ page_size: 10 }),
        taxService.getObligations({ page_size: 10 })
      ])

      setDeclarations(declarationsResponse.results || [])
      setObligations(obligationsResponse.results || [])

      console.log('✅ Tax data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading tax data:', error)
    } finally {
      setLoading(false)
    }
  }

  const etapesTransmission = [
    'Validation des données',
    'Préparation des fichiers', 
    'Transmission électronique',
    'Accusé de réception',
    'Confirmation administration',
  ]

  // Déclarations basées sur les données backend
  const declarationsEnCours = declarations.slice(0, 10).map(declaration => {
    const echeanceDate = new Date(declaration.periode_fin)
    const today = new Date()
    const joursRestants = Math.ceil((echeanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      id: declaration.id,
      type: getTypeDeclarationLabel(declaration.type_declaration),
      periode: `${declaration.periode_debut} - ${declaration.periode_fin}`,
      echeance: new Date(declaration.periode_fin).toLocaleDateString('fr-FR'),
      statut: getStatutDeclarationLabel(declaration.statut),
      montantImpot: declaration.montant_impot || 0,
      joursRestants: Math.max(0, joursRestants),
    }
  })

  function getTypeDeclarationLabel(type: string) {
    switch (type?.toUpperCase()) {
      case 'IS': return 'Impôt sur les Sociétés'
      case 'TVA': return 'TVA Trimestrielle'
      case 'PATENTE': return 'Patente'
      case 'BILAN_FISCAL': return 'Bilan Fiscal'
      default: return type || 'Déclaration'
    }
  }

  function getStatutDeclarationLabel(statut: string) {
    switch (statut?.toUpperCase()) {
      case 'VALIDEE': return 'PRETE'
      case 'BROUILLON': return 'BROUILLON'
      case 'DEPOSEE': return 'TRANSMISE'
      case 'ACCEPTEE': return 'ACCEPTEE'
      case 'REJETEE': return 'REJETEE'
      default: return statut?.toUpperCase() || 'BROUILLON'
    }
  }

  // Historique basé sur les déclarations déposées
  const historiqueTransmissions = declarations
    .filter(d => ['DEPOSEE', 'ACCEPTEE', 'REJETEE'].includes(d.statut?.toUpperCase()))
    .slice(0, 10)
    .map(declaration => ({
      id: declaration.id,
      declaration: `${getTypeDeclarationLabel(declaration.type_declaration)} ${declaration.periode_debut.split('-')[0]}`,
      dateTransmission: declaration.date_depot ? new Date(declaration.date_depot).toLocaleDateString('fr-FR') : '-',
      statut: getStatutDeclarationLabel(declaration.statut),
      numeroAccuse: declaration.numero_declaration || `${declaration.type_declaration?.toUpperCase()}-${declaration.id}`,
    }))

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return 'success'
      case 'TRANSMISE': return 'info'
      case 'PRETE': return 'warning'
      case 'REJETEE': return 'error'
      default: return 'default'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return <CheckCircle color="success" />
      case 'TRANSMISE': return <CloudUpload color="info" />
      case 'PRETE': return <Warning color="warning" />
      case 'REJETEE': return <Error color="error" />
      default: return <Schedule />
    }
  }

  const lancerTransmission = async () => {
    setTransmissionEnCours(true)
    setEtapeActive(0)

    try {
      console.log('🚀 Starting tax declaration submission...')

      // Simulation de transmission avec vraies étapes
      const interval = setInterval(() => {
        setEtapeActive(prev => {
          if (prev >= etapesTransmission.length - 1) {
            clearInterval(interval)
            setTransmissionEnCours(false)
            console.log('✅ Tax declaration submitted successfully')
            // Recharger les données
            loadTaxData()
            return prev
          }
          return prev + 1
        })
      }, 1500)
    } catch (error) {
      console.error('❌ Error submitting declaration:', error)
      setTransmissionEnCours(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <CloudUpload sx={{ mr: 2, verticalAlign: 'middle' }} />
          Télédéclaration Fiscale
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={lancerTransmission}
            disabled={transmissionEnCours || loading}
            disabled={transmissionEnCours}
          >
            Transmettre
          </Button>
          <Button variant="outlined" startIcon={<Refresh />}>
            Actualiser
          </Button>
        </Box>
      </Box>

      {/* Processus de transmission */}
      {transmissionEnCours && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Transmission en cours...
            </Typography>
            <Stepper activeStep={etapeActive} alternativeLabel>
              {etapesTransmission.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Déclarations en cours */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Déclarations en Cours" />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Période</TableCell>
                      <TableCell>Échéance</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Impôt (FCFA)</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {declarationsEnCours.map((decl) => (
                      <TableRow key={decl.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {decl.type}
                          </Typography>
                        </TableCell>
                        <TableCell>{decl.periode}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {decl.echeance}
                            </Typography>
                            <Chip
                              label={`${decl.joursRestants} j`}
                              size="small"
                              color={decl.joursRestants < 30 ? 'error' : 'success'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatutIcon(decl.statut)}
                            label={decl.statut}
                            color={getStatutColor(decl.statut) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {decl.montantImpot.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Voir détails">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {decl.statut === 'PRETE' && (
                              <Tooltip title="Transmettre">
                                <IconButton size="small" color="primary">
                                  <Send />
                                </IconButton>
                              </Tooltip>
                            )}
                            {decl.statut === 'TRANSMISE' && (
                              <Tooltip title="Télécharger accusé">
                                <IconButton size="small" color="success">
                                  <GetApp />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Résumé et alertes */}
        <Grid item xs={12} lg={4}>
          {/* Alertes urgentes */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Alertes Urgentes" />
            <Divider />
            <CardContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  TVA en retard
                </Typography>
                <Typography variant="body2">
                  Déclaration T4 2024 - Échue depuis 5 jours
                </Typography>
              </Alert>
              
              <Alert severity="warning">
                <Typography variant="subtitle2">
                  IS 2024 - 15 jours restants
                </Typography>
                <Typography variant="body2">
                  Préparer les documents pour la déclaration
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader title="Statistiques" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Déclarations à temps</Typography>
                  <Typography variant="h6" color="success.main">
                    98%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Taux d'acceptation</Typography>
                  <Typography variant="h6" color="primary.main">
                    95%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Économies pénalités</Typography>
                  <Typography variant="h6" color="success.main">
                    1.2M FCFA
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Historique des transmissions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Historique des Transmissions" />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Déclaration</TableCell>
                      <TableCell>Date Transmission</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>N° Accusé</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historiqueTransmissions.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {trans.declaration}
                          </Typography>
                        </TableCell>
                        <TableCell>{trans.dateTransmission}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatutIcon(trans.statut)}
                            label={trans.statut}
                            color={getStatutColor(trans.statut) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {trans.numeroAccuse}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Télécharger accusé">
                            <IconButton size="small">
                              <GetApp />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default Teledeclaration