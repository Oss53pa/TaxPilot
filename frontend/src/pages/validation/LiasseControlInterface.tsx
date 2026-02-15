/**
 * Interface de Contrôle de Liasse Fiscale
 * Validation avancée avant soumission hiérarchique et télédéclaration
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  // Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as LiasseIcon,
  Speed as ScoreIcon,
  Visibility as PreviewIcon,
  Send as SubmitIcon,
  Comment as CommentIcon,
  // History as HistoryIcon,
} from '@mui/icons-material'

interface ValidationResult {
  id: number
  liasse_id: string
  score_validation: number
  nb_erreurs_critiques: number
  nb_avertissements: number
  nb_controles_reussis: number
  prete_validation: boolean
  prete_teledeclaration: boolean
  date_validation: string
}

interface PreComment {
  section: string
  titre: string
  commentaire: string
  type: 'POSITIF' | 'ATTENTION' | 'INFORMATIF' | 'TECHNIQUE'
  auto_genere: boolean
}

const LiasseControlInterface: React.FC = () => {
  const [liasses, setLiasses] = useState<ValidationResult[]>([])
  const [selectedLiasse, setSelectedLiasse] = useState<ValidationResult | null>(null)
  const [validationDialog, setValidationDialog] = useState(false)
  const [preComments, setPreComments] = useState<PreComment[]>([])

  useEffect(() => {
    // Données de démonstration
    setLiasses([
      {
        id: 1,
        liasse_id: 'LI-2024-001',
        score_validation: 98,
        nb_erreurs_critiques: 0,
        nb_avertissements: 1,
        nb_controles_reussis: 8,
        prete_validation: true,
        prete_teledeclaration: true,
        date_validation: '2024-01-15'
      },
      {
        id: 2,
        liasse_id: 'LI-2024-002',
        score_validation: 85,
        nb_erreurs_critiques: 1,
        nb_avertissements: 3,
        nb_controles_reussis: 6,
        prete_validation: true,
        prete_teledeclaration: false,
        date_validation: '2024-01-14'
      },
      {
        id: 3,
        liasse_id: 'LI-2024-003',
        score_validation: 72,
        nb_erreurs_critiques: 2,
        nb_avertissements: 5,
        nb_controles_reussis: 4,
        prete_validation: false,
        prete_teledeclaration: false,
        date_validation: '2024-01-13'
      }
    ])

    setPreComments([
      {
        section: 'QUALITE_DONNEES',
        titre: 'Qualité des données',
        commentaire: 'La balance de l\'exercice 2024 présente une qualité excellente avec 8 contrôles réussis. Aucune anomalie critique détectée.',
        type: 'POSITIF',
        auto_genere: true
      },
      {
        section: 'TYPE_LIASSE',
        titre: 'Type de liasse déterminé',
        commentaire: 'La liasse a été générée selon le Système Normal conformément aux critères SYSCOHADA. La détermination automatique s\'est basée sur le chiffre d\'affaires.',
        type: 'INFORMATIF',
        auto_genere: true
      }
    ])
  }, [])

  const handleValidateLiasse = (liasse: ValidationResult) => {
    setSelectedLiasse(liasse)
    setValidationDialog(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return '#22c55e' // Vert
    if (score >= 85) return '#f59e0b' // Orange
    return '#ef4444' // Rouge
  }

  const getStatutChip = (liasse: ValidationResult) => {
    if (liasse.prete_teledeclaration) {
      return <Chip label="Prêt Télédéclaration" color="success" size="small" />
    } else if (liasse.prete_validation) {
      return <Chip label="Prêt Validation" color="warning" size="small" />
    } else {
      return <Chip label="Corrections Requises" color="error" size="small" />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#171717' }}>
        🔍 Contrôle de Liasse Fiscale
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ color: '#737373' }}>
        Validation avancée avant soumission hiérarchique et télédéclaration
      </Typography>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: '#e5e5e5',
          borderRadius: 2
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#171717', fontWeight: 600 }}>
          🎯 Processus de Validation de Liasse
        </Typography>
        <Typography variant="body2" sx={{ color: '#171717' }}>
          <strong>1.</strong> Vérification affectation balance → tableaux • 
          <strong>2.</strong> Contrôle exactitude calculs • 
          <strong>3.</strong> Validation cohérence inter-états • 
          <strong>4.</strong> Génération pré-commentaires • 
          <strong>5.</strong> Autorisation validation/télédéclaration
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel gauche - Liste des liasses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ bgcolor: '#f5f5f5', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#171717' }}>
              Liasses en Validation
            </Typography>

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#e5e5e5' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Liasse</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Contrôles</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {liasses.map((liasse, index) => (
                    <TableRow 
                      key={liasse.id}
                      sx={{ 
                        bgcolor: index % 2 === 0 ? '#fafafa' : '#f5f5f5',
                        '&:hover': { bgcolor: '#e5e5e530' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LiasseIcon sx={{ color: '#171717', mr: 1 }} />
                          <Typography variant="body2" sx={{ color: '#171717', fontWeight: 500 }}>
                            {liasse.liasse_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScoreIcon sx={{ color: getScoreColor(liasse.score_validation), mr: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: getScoreColor(liasse.score_validation),
                              fontWeight: 600 
                            }}
                          >
                            {liasse.score_validation}/100
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#22c55e' }}>
                            ✓ {liasse.nb_controles_reussis} réussis
                          </Typography>
                          {liasse.nb_avertissements > 0 && (
                            <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block' }}>
                              ⚠ {liasse.nb_avertissements} avertissements
                            </Typography>
                          )}
                          {liasse.nb_erreurs_critiques > 0 && (
                            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block' }}>
                              ✗ {liasse.nb_erreurs_critiques} erreurs critiques
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatutChip(liasse)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => handleValidateLiasse(liasse)}
                          sx={{ 
                            color: '#171717',
                            '&:hover': { bgcolor: '#e5e5e530' }
                          }}
                        >
                          Valider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Panel droite - Statistiques */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#f5f5f5', textAlign: 'center' }}>
                <CardContent>
                  <ValidIcon sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#171717' }}>
                    97%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#737373' }}>
                    Taux de Validation Moyen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#f5f5f5', textAlign: 'center' }}>
                <CardContent>
                  <WarningIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#171717' }}>
                    {liasses.filter(l => l.prete_teledeclaration).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#737373' }}>
                    Prêtes Télédéclaration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#f5f5f5', textAlign: 'center' }}>
                <CardContent>
                  <ErrorIcon sx={{ fontSize: 40, color: '#ef4444', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#171717' }}>
                    {liasses.filter(l => !l.prete_validation).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#737373' }}>
                    Corrections Requises
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialog de validation détaillée */}
      <Dialog 
        open={validationDialog} 
        onClose={() => setValidationDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#171717', color: 'white' }}>
          Validation Liasse {selectedLiasse?.liasse_id}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#fafafa', mt: 2 }}>
          {selectedLiasse && (
            <Grid container spacing={3}>
              {/* Score global */}
              <Grid item xs={12}>
                <Card sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#171717', mb: 2 }}>
                    Score de Validation Global
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedLiasse.score_validation} 
                      sx={{ 
                        flexGrow: 1, 
                        mr: 2,
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getScoreColor(selectedLiasse.score_validation)
                        }
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: getScoreColor(selectedLiasse.score_validation),
                        fontWeight: 600 
                      }}
                    >
                      {selectedLiasse.score_validation}/100
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#22c55e' }}>
                          {selectedLiasse.nb_controles_reussis}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#737373' }}>
                          Contrôles Réussis
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#f59e0b' }}>
                          {selectedLiasse.nb_avertissements}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#737373' }}>
                          Avertissements
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#ef4444' }}>
                          {selectedLiasse.nb_erreurs_critiques}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#737373' }}>
                          Erreurs Critiques
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Pré-commentaires générés */}
              <Grid item xs={12}>
                <Card sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#171717', mb: 2 }}>
                    📝 Pré-commentaires Générés par IA
                  </Typography>
                  
                  <List>
                    {preComments.map((comment, index) => (
                      <ListItem key={index} sx={{ bgcolor: '#fafafa', mb: 1, borderRadius: 1 }}>
                        <ListItemIcon>
                          <CommentIcon sx={{ color: '#171717' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={comment.titre}
                          secondary={comment.commentaire}
                          primaryTypographyProps={{ 
                            fontWeight: 500,
                            color: '#171717' 
                          }}
                          secondaryTypographyProps={{ 
                            color: '#737373',
                            fontSize: '0.875rem' 
                          }}
                        />
                        <Chip 
                          label={comment.type}
                          size="small"
                          sx={{ 
                            bgcolor: comment.type === 'POSITIF' ? '#f5f5f5' : '#e5e5e5',
                            color: comment.type === 'POSITIF' ? '#22c55e' : '#171717'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />
                  
                  <TextField
                    fullWidth
                    label="Commentaires additionnels"
                    multiline
                    rows={3}
                    placeholder="Ajoutez vos commentaires complémentaires..."
                    sx={{ mb: 2 }}
                  />
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#fafafa', p: 2 }}>
          <Button 
            onClick={() => setValidationDialog(false)}
            sx={{ color: '#737373' }}
          >
            Fermer
          </Button>
          
          {selectedLiasse?.prete_validation && (
            <Button 
              variant="contained"
              startIcon={<SubmitIcon />}
              sx={{ 
                bgcolor: '#171717',
                '&:hover': { bgcolor: '#262626' },
                mr: 1
              }}
            >
              Soumettre Validation
            </Button>
          )}
          
          {selectedLiasse?.prete_teledeclaration && (
            <Button 
              variant="contained"
              startIcon={<SubmitIcon />}
              sx={{ 
                bgcolor: '#22c55e',
                '&:hover': { bgcolor: '#16a34a' }
              }}
            >
              Télédéclarer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LiasseControlInterface