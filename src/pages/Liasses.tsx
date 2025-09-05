/**
 * Page de gestion des liasses fiscales avec accès détaillé
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material'
import {
  Assignment,
  Add,
  Visibility,
  GetApp,
  Edit,
  Send,
  CheckCircle,
  Warning,
  Schedule,
  Description,
  Calculate,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Liasses: React.FC = () => {
  const navigate = useNavigate()
  const [openPreview, setOpenPreview] = useState(false)
  const [selectedLiasse, setSelectedLiasse] = useState<any>(null)

  // Liasses existantes (comme votre fichier Excel)
  const liassesExistantes = [
    {
      id: '1',
      nom: 'Liasse_systeme_normal_2024_V9_AJM_23052025',
      entreprise: 'SARL DEMO FISCASYNC',
      exercice: '2024',
      typeLiasse: 'Système Normal (SN)',
      statut: 'VALIDEE',
      dateGeneration: '2024-05-23',
      completude: 95,
      scoreControle: 88,
      nbEtats: 6,
      etatsCompletes: 5,
      notes: {
        nb_notes_total: 24,
        nb_notes_completees: 18,
        notes_manquantes: ['Note 15 - Engagements', 'Note 22 - Événements postérieurs']
      },
      fichiers: {
        excel: 'Liasse_systeme_normal_2024_V9.xlsx',
        pdf: 'Liasse_2024_finale.pdf',
        xml: 'Export_EDI_2024.xml'
      }
    },
    {
      id: '2',
      nom: 'Liasse_systeme_normal_2023_FINALE',
      entreprise: 'SARL DEMO FISCASYNC',
      exercice: '2023',
      typeLiasse: 'Système Normal (SN)',
      statut: 'DECLAREE',
      dateGeneration: '2023-04-28',
      completude: 100,
      scoreControle: 92,
      nbEtats: 6,
      etatsCompletes: 6,
      notes: {
        nb_notes_total: 24,
        nb_notes_completees: 24,
        notes_manquantes: []
      },
      fichiers: {
        excel: 'Liasse_systeme_normal_2023.xlsx',
        pdf: 'Liasse_2023_declaree.pdf',
        accuse: 'Accuse_reception_2023.pdf'
      }
    },
    {
      id: '3',
      nom: 'Liasse_systeme_normal_2022_ARCHIVE',
      entreprise: 'SARL DEMO FISCASYNC', 
      exercice: '2022',
      typeLiasse: 'Système Normal (SN)',
      statut: 'ARCHIVEE',
      dateGeneration: '2022-04-15',
      completude: 100,
      scoreControle: 89,
      nbEtats: 6,
      etatsCompletes: 6,
      notes: {
        nb_notes_total: 24,
        nb_notes_completees: 24,
        notes_manquantes: []
      },
      fichiers: {
        excel: 'Liasse_systeme_normal_2022.xlsx',
        pdf: 'Liasse_2022_archive.pdf'
      }
    },
  ]

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDEE': return 'success'
      case 'DECLAREE': return 'info'
      case 'ARCHIVEE': return 'default'
      case 'BROUILLON': return 'warning'
      default: return 'default'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'VALIDEE': return <CheckCircle color="success" />
      case 'DECLAREE': return <Send color="info" />
      case 'ARCHIVEE': return <Description color="action" />
      case 'BROUILLON': return <Edit color="warning" />
      default: return <Schedule />
    }
  }

  const ouvrirLiasseDetaillee = (liasse: any) => {
    navigate(`/liasse/${liasse.id}`)
  }

  const previsualiserLiasse = (liasse: any) => {
    setSelectedLiasse(liasse)
    setOpenPreview(true)
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Liasses Fiscales SYSCOHADA
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/generation')}
          >
            Nouvelle Liasse
          </Button>
          <Button variant="outlined" startIcon={<GetApp />}>
            Export Global
          </Button>
        </Box>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Typography variant="h6" color="white">
                  {liassesExistantes.length}
                </Typography>
              </Avatar>
              <Typography variant="h6">Liasses Totales</Typography>
              <Typography variant="body2" color="text.secondary">
                Toutes périodes confondues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h6">Déclarées</Typography>
              <Typography variant="body2" color="text.secondary">
                {liassesExistantes.filter(l => l.statut === 'DECLAREE').length} liasses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Warning />
              </Avatar>
              <Typography variant="h6">En Cours</Typography>
              <Typography variant="body2" color="text.secondary">
                {liassesExistantes.filter(l => l.statut === 'VALIDEE').length} liasse(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Typography variant="h6" color="white">
                  92%
                </Typography>
              </Avatar>
              <Typography variant="h6">Conformité</Typography>
              <Typography variant="body2" color="text.secondary">
                Score moyen SYSCOHADA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau détaillé des liasses */}
      <Card>
        <CardHeader title="Historique des Liasses Fiscales" />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Liasse</TableCell>
                  <TableCell>Type SYSCOHADA</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Complétude</TableCell>
                  <TableCell align="center">États</TableCell>
                  <TableCell align="center">Notes Annexes</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liassesExistantes.map((liasse) => (
                  <TableRow 
                    key={liasse.id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                    onClick={() => ouvrirLiasseDetaillee(liasse)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {liasse.nom}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {liasse.entreprise} - {liasse.exercice}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Généré le {liasse.dateGeneration}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={liasse.typeLiasse}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatutIcon(liasse.statut)}
                        label={liasse.statut}
                        color={getStatutColor(liasse.statut) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ minWidth: 120 }}>
                        <LinearProgress
                          variant="determinate"
                          value={liasse.completude}
                          color={liasse.completude >= 95 ? 'success' : 'warning'}
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="caption">
                          {liasse.completude}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {liasse.etatsCompletes}/{liasse.nbEtats}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        états complétés
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: liasse.notes.notes_manquantes.length === 0 ? 'success.main' : 'warning.main',
                          fontWeight: 600
                        }}>
                          {liasse.notes.nb_notes_completees}/{liasse.notes.nb_notes_total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          notes rédigées
                        </Typography>
                        {liasse.notes.notes_manquantes.length > 0 && (
                          <Tooltip title={`Manquantes: ${liasse.notes.notes_manquantes.join(', ')}`}>
                            <IconButton size="small" color="warning">
                              <Warning sx={{ fontSize: '16px' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: liasse.scoreControle >= 90 ? 'success.main' : 
                                 liasse.scoreControle >= 80 ? 'warning.main' : 'error.main',
                          fontWeight: 700
                        }}
                      >
                        {liasse.scoreControle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /100
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Voir détails complets">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              ouvrirLiasseDetaillee(liasse)
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger Excel">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GetApp />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Prévisualiser">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              previsualiserLiasse(liasse)
                            }}
                          >
                            <Description />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog de prévisualisation */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Prévisualisation - {selectedLiasse?.nom}
        </DialogTitle>
        <DialogContent>
          {selectedLiasse && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Générales
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Entreprise:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedLiasse.entreprise}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Exercice:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedLiasse.exercice}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Type SYSCOHADA:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedLiasse.typeLiasse}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Complétude:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedLiasse.completude}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Notes Annexes
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedLiasse.notes.nb_notes_completees / selectedLiasse.notes.nb_notes_total) * 100}
                        color={selectedLiasse.notes.notes_manquantes.length === 0 ? 'success' : 'warning'}
                      />
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        {selectedLiasse.notes.nb_notes_completees}/{selectedLiasse.notes.nb_notes_total} notes rédigées
                      </Typography>
                    </Box>
                    
                    {selectedLiasse.notes.notes_manquantes.length > 0 && (
                      <Alert severity="warning" size="small">
                        <Typography variant="caption">
                          <strong>Notes manquantes:</strong><br />
                          {selectedLiasse.notes.notes_manquantes.join(', ')}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Fichiers Disponibles
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(selectedLiasse?.fichiers || {}).map(([type, nom]) => (
                        <Chip
                          key={type}
                          label={`${type.toUpperCase()}: ${nom}`}
                          color="primary"
                          variant="outlined"
                          clickable
                          icon={<GetApp />}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Fermer</Button>
          <Button 
            variant="contained" 
            startIcon={<Visibility />}
            onClick={() => {
              setOpenPreview(false)
              ouvrirLiasseDetaillee(selectedLiasse)
            }}
          >
            Voir Détails Complets
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Liasses