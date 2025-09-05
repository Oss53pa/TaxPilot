/**
 * Page du module de télédéclaration fiscale
 */

import React, { useState } from 'react'
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

const Teledeclaration: React.FC = () => {
  const [etapeActive, setEtapeActive] = useState(0)
  const [transmissionEnCours, setTransmissionEnCours] = useState(false)

  const etapesTransmission = [
    'Validation des données',
    'Préparation des fichiers', 
    'Transmission électronique',
    'Accusé de réception',
    'Confirmation administration',
  ]

  const declarationsEnCours = [
    {
      id: '1',
      type: 'Impôt sur les Sociétés',
      periode: '2024',
      echeance: '2025-04-30',
      statut: 'PRETE',
      montantImpot: 2500000,
      joursRestants: 45,
    },
    {
      id: '2', 
      type: 'TVA Trimestrielle',
      periode: 'T1 2025',
      echeance: '2025-04-20',
      statut: 'BROUILLON',
      montantImpot: 450000,
      joursRestants: 35,
    },
    {
      id: '3',
      type: 'Patente',
      periode: '2024',
      echeance: '2025-03-31',
      statut: 'TRANSMISE',
      montantImpot: 125000,
      joursRestants: 15,
    },
  ]

  const historiqueTransmissions = [
    {
      id: '1',
      declaration: 'IS 2023',
      dateTransmission: '2024-04-15',
      statut: 'ACCEPTEE',
      numeroAccuse: 'ACC-2024-001234',
    },
    {
      id: '2',
      declaration: 'TVA T4 2023', 
      dateTransmission: '2024-01-20',
      statut: 'ACCEPTEE',
      numeroAccuse: 'ACC-2024-000567',
    },
    {
      id: '3',
      declaration: 'Patente 2023',
      dateTransmission: '2024-03-28',
      statut: 'REJETEE',
      numeroAccuse: 'REJ-2024-000123',
    },
  ]

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

  const lancerTransmission = () => {
    setTransmissionEnCours(true)
    setEtapeActive(0)
    
    // Simulation de transmission
    const interval = setInterval(() => {
      setEtapeActive(prev => {
        if (prev >= etapesTransmission.length - 1) {
          clearInterval(interval)
          setTransmissionEnCours(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
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