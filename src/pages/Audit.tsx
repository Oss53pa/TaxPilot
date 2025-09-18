/**
 * Page du module d'audit intelligent
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
import { auditService } from '@/services/auditService'
import { entrepriseService } from '@/services/entrepriseService'

const Audit: React.FC = () => {
  const [auditEnCours, setAuditEnCours] = useState(false)
  const [progressionAudit, setProgressionAudit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [auditSessions, setAuditSessions] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)

  useEffect(() => {
    loadAuditData()
  }, [])

  const loadAuditData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading audit data from backend...')

      const [sessionsResponse, statsResponse, entreprisesResponse] = await Promise.all([
        auditService.getAuditSessions({ page_size: 10 }),
        auditService.getAuditStats(),
        entrepriseService.getEntreprises({ page_size: 100 })
      ])

      setAuditSessions(sessionsResponse.results || [])
      setStats(statsResponse)
      setEntreprises(entreprisesResponse.results || [])

      // Si on a une session, charger ses anomalies
      if (sessionsResponse.results?.[0]) {
        const anomaliesResponse = await auditService.getAuditAnomalies(sessionsResponse.results[0].id)
        setAnomalies(anomaliesResponse.results || [])
        setSelectedSession(sessionsResponse.results[0])
      }

      console.log('✅ Audit data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading audit data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Stats calculées depuis les données backend
  const statsAudit = {
    scoreGlobal: selectedSession?.resultats?.score_global || 0,
    anomaliesCritiques: anomalies.filter(a => a.type === 'ERREUR').length,
    anomaliesErreurs: selectedSession?.resultats?.nb_erreurs || 0,
    anomaliesAvertissements: selectedSession?.resultats?.nb_warnings || 0,
    correctifsProposés: anomalies.filter(a => a.suggestion).length,
  }

  // Anomalies depuis le backend
  const dernieresAnomalies = anomalies.slice(0, 10).map(anomalie => ({
    id: anomalie.id,
    titre: anomalie.titre,
    type: anomalie.categorie,
    severite: mapTypeToSeverite(anomalie.type),
    montantImpact: anomalie.impact_fiscal || 0,
    scoreConfiance: Math.round(Math.random() * 20 + 80), // Score simulé pour l'instant
    description: anomalie.description,
    suggestion: anomalie.suggestion
  }))

  function mapTypeToSeverite(type: string) {
    switch (type) {
      case 'ERREUR': return 'CRITIQUE'
      case 'WARNING': return 'ERREUR'
      case 'INFO': return 'AVERTISSEMENT'
      default: return 'AVERTISSEMENT'
    }
  }

  const lancerAudit = async () => {
    if (!entreprises[0]) {
      console.error('Aucune entreprise disponible pour l\'audit')
      return
    }

    setAuditEnCours(true)
    setProgressionAudit(0)

    try {
      console.log('🚀 Starting new audit session...')

      // Créer une nouvelle session d'audit
      const newSession = await auditService.startAudit({
        entreprise_id: entreprises[0].id,
        exercice_id: '1', // ID d'exercice par défaut
        liasse_id: '1', // ID de liasse par défaut
        type_audit: 'COMPLET',
        niveau: 'STANDARD'
      })

      setSelectedSession(newSession)

      // Simuler la progression
      const interval = setInterval(() => {
        setProgressionAudit(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setAuditEnCours(false)
            loadAuditData() // Recharger les données
            return 100
          }
          return prev + 10
        })
      }, 500)
    } catch (error) {
      console.error('❌ Error starting audit:', error)
      setAuditEnCours(false)
    }
  }

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