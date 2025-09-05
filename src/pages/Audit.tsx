/**
 * Page du module d'audit intelligent
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
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Security,
  BugReport,
  AutoFixHigh,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  PlayArrow,
  Refresh,
  GetApp,
} from '@mui/icons-material'

const Audit: React.FC = () => {
  const [auditEnCours, setAuditEnCours] = useState(false)
  const [progressionAudit, setProgressionAudit] = useState(0)

  // Données fictives pour la démo
  const statsAudit = {
    scoreGlobal: 87,
    anomaliesCritiques: 2,
    anomaliesErreurs: 5,
    anomaliesAvertissements: 12,
    correctifsProposés: 8,
  }

  const dernieresAnomalies = [
    {
      id: '1',
      titre: 'Déséquilibre compte 411000',
      type: 'DESEQUILIBRE',
      severite: 'CRITIQUE',
      montantImpact: 15000,
      scoreConfiance: 95,
    },
    {
      id: '2', 
      titre: 'Variation anormale CA (+150%)',
      type: 'VARIATION_ANORMALE',
      severite: 'ERREUR',
      montantImpact: 450000,
      scoreConfiance: 88,
    },
    {
      id: '3',
      titre: 'Compte 445710 non mouvementé',
      type: 'COMPLETUDE',
      severite: 'AVERTISSEMENT', 
      montantImpact: 0,
      scoreConfiance: 76,
    },
  ]

  const getSeveriteColor = (severite: string) => {
    switch (severite) {
      case 'CRITIQUE': return 'error'
      case 'ERREUR': return 'warning'
      case 'AVERTISSEMENT': return 'info'
      default: return 'default'
    }
  }

  const getSeveriteIcon = (severite: string) => {
    switch (severite) {
      case 'CRITIQUE': return <Error color="error" />
      case 'ERREUR': return <Warning color="warning" />
      case 'AVERTISSEMENT': return <Info color="info" />
      default: return <CheckCircle color="success" />
    }
  }

  const lancerAudit = () => {
    setAuditEnCours(true)
    setProgressionAudit(0)
    
    // Simulation de progression
    const interval = setInterval(() => {
      setProgressionAudit(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setAuditEnCours(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
          Audit Intelligent
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={lancerAudit}
            disabled={auditEnCours}
          >
            {auditEnCours ? 'Audit en cours...' : 'Lancer Audit'}
          </Button>
          <Button variant="outlined" startIcon={<GetApp />}>
            Exporter Rapport
          </Button>
        </Box>
      </Box>

      {/* Progression de l'audit */}
      {auditEnCours && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Audit en cours... {progressionAudit}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressionAudit} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Score global */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <Typography variant="h5" color="white">
                  {statsAudit.scoreGlobal}
                </Typography>
              </Avatar>
              <Typography variant="h6">Score Global</Typography>
              <Typography variant="body2" color="text.secondary">
                Fiabilité de la balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Anomalies critiques */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Critiques</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {statsAudit.anomaliesCritiques}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                À corriger immédiatement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Erreurs */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Erreurs</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {statsAudit.anomaliesErreurs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                À traiter en priorité
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Correctifs automatiques */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AutoFixHigh color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Correctifs</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {statsAudit.correctifsProposés}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Corrections proposées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des anomalies */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Anomalies Détectées"
              action={
                <IconButton>
                  <Refresh />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sévérité</TableCell>
                      <TableCell>Anomalie</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Impact (FCFA)</TableCell>
                      <TableCell align="right">Confiance</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dernieresAnomalies.map((anomalie) => (
                      <TableRow key={anomalie.id}>
                        <TableCell>
                          <Chip
                            icon={getSeveriteIcon(anomalie.severite)}
                            label={anomalie.severite}
                            color={getSeveriteColor(anomalie.severite) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {anomalie.titre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={anomalie.type}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {anomalie.montantImpact.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <LinearProgress
                              variant="determinate"
                              value={anomalie.scoreConfiance}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="caption">
                              {anomalie.scoreConfiance}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Corriger automatiquement">
                            <IconButton size="small" color="primary">
                              <AutoFixHigh />
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

export default Audit