/**
 * Section Commentaires - Composant réutilisable pour les notes annexes
 */

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  alpha,
  Divider,
  Stack,
  Chip,
} from '@mui/material'
import {
  Comment as CommentIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'

interface Commentaire {
  id: string
  auteur: string
  date: string
  contenu: string
  type: 'note' | 'observation' | 'correction'
}

interface CommentairesSectionProps {
  titre?: string
  noteId: string
  commentairesInitiaux?: Commentaire[]
  readOnly?: boolean
}

const CommentairesSection: React.FC<CommentairesSectionProps> = ({
  titre = "Commentaires et Observations",
  noteId,
  commentairesInitiaux = [],
  readOnly = false
}) => {
  const theme = useTheme()
  const [commentaires, setCommentaires] = useState<Commentaire[]>(commentairesInitiaux)
  const [nouveauCommentaire, setNouveauCommentaire] = useState('')
  const [modeEdition, setModeEdition] = useState(false)
  const [typeCommentaire, setTypeCommentaire] = useState<'note' | 'observation' | 'correction'>('note')

  const ajouterCommentaire = () => {
    if (!nouveauCommentaire.trim()) return

    const commentaire: Commentaire = {
      id: Date.now().toString(),
      auteur: 'Expert-comptable', // En réalité, à récupérer du contexte utilisateur
      date: new Date().toLocaleDateString('fr-FR'),
      contenu: nouveauCommentaire,
      type: typeCommentaire
    }

    setCommentaires([...commentaires, commentaire])
    setNouveauCommentaire('')
    setModeEdition(false)
  }

  const supprimerCommentaire = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      setCommentaires(commentaires.filter(c => c.id !== id))
      console.log(`Commentaire ${id} supprimé`)
    }
  }

  const exporterCommentaires = () => {
    const exportData = {
      noteId,
      dateExport: new Date().toISOString(),
      nombreCommentaires: commentaires.length,
      commentaires: commentaires
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `commentaires_${noteId}_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    console.log('Export des commentaires réussi')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'primary'
      case 'observation': return 'warning'
      case 'correction': return 'error'
      default: return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note': return 'Note'
      case 'observation': return 'Observation'
      case 'correction': return 'Correction'
      default: return 'Commentaire'
    }
  }

  return (
    <Card 
      sx={{ 
        mt: 3, 
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8)
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {titre}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {commentaires.length > 0 && (
              <Button
                variant="text"
                size="small"
                startIcon={<ExportIcon />}
                onClick={exporterCommentaires}
              >
                Exporter
              </Button>
            )}
            {!readOnly && (
              <Button
                variant="outlined"
                size="small"
                startIcon={modeEdition ? <SaveIcon /> : <AddIcon />}
                onClick={() => modeEdition ? ajouterCommentaire() : setModeEdition(true)}
                disabled={modeEdition && !nouveauCommentaire.trim()}
              >
                {modeEdition ? 'Sauvegarder' : 'Ajouter'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Zone de saisie nouveau commentaire */}
        {modeEdition && !readOnly && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip
                  label="Note"
                  variant={typeCommentaire === 'note' ? 'filled' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => setTypeCommentaire('note')}
                  clickable
                />
                <Chip
                  label="Observation"
                  variant={typeCommentaire === 'observation' ? 'filled' : 'outlined'}
                  color="warning"
                  size="small"
                  onClick={() => setTypeCommentaire('observation')}
                  clickable
                />
                <Chip
                  label="Correction"
                  variant={typeCommentaire === 'correction' ? 'filled' : 'outlined'}
                  color="error"
                  size="small"
                  onClick={() => setTypeCommentaire('correction')}
                  clickable
                />
              </Box>
              
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder={`Saisir ${getTypeLabel(typeCommentaire).toLowerCase()}...`}
                value={nouveauCommentaire}
                onChange={(e) => setNouveauCommentaire(e.target.value)}
                variant="outlined"
                size="small"
              />
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setModeEdition(false)
                    setNouveauCommentaire('')
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={ajouterCommentaire}
                  disabled={!nouveauCommentaire.trim()}
                >
                  Ajouter {getTypeLabel(typeCommentaire)}
                </Button>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Liste des commentaires existants */}
        {commentaires.length > 0 ? (
          <Stack spacing={2}>
            {commentaires.map((commentaire, index) => (
              <Box key={commentaire.id}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={getTypeLabel(commentaire.type)}
                      color={getTypeColor(commentaire.type) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {commentaire.auteur} • {commentaire.date}
                    </Typography>
                    {!readOnly && (
                      <IconButton
                        size="small"
                        onClick={() => supprimerCommentaire(commentaire.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {commentaire.contenu}
                  </Typography>
                </Box>
                {index < commentaires.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Stack>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 3, 
              color: 'text.secondary',
              backgroundColor: alpha(theme.palette.background.default, 0.3),
              borderRadius: 1,
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <CommentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              {readOnly 
                ? "Aucun commentaire pour cette note" 
                : "Aucun commentaire. Cliquez sur 'Ajouter' pour en créer un."
              }
            </Typography>
          </Box>
        )}

        {/* Informations sur les commentaires */}
        {commentaires.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              {commentaires.length} commentaire{commentaires.length > 1 ? 's' : ''} • 
              Dernière modification : {commentaires.length > 0 ? commentaires[commentaires.length - 1].date : 'N/A'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CommentairesSection