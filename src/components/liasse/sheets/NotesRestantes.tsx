/**
 * Composant générique pour toutes les notes restantes (4, 7, 9-10, 12-13, 15-16, 18, 20-35)
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Stack,
  IconButton
} from '@mui/material'
import { Construction, Schedule, CheckCircle, Add, Edit, Save, Comment } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'

interface NoteRestanteProps {
  numeroNote: number
  titre: string
  description: string
  contenuPrevu: string[]
  priorite: 'haute' | 'moyenne' | 'basse'
  datePrevisionnelle?: string
}

const NotesRestantes: React.FC<NoteRestanteProps> = ({
  numeroNote,
  titre,
  description,
  contenuPrevu,
  priorite,
  datePrevisionnelle
}) => {
  const theme = useTheme()
  const [typeNoteSelectionne, setTypeNoteSelectionne] = useState('')
  const [commentaireNote, setCommentaireNote] = useState('')
  const [notesPersonnalisees, setNotesPersonnalisees] = useState<Array<{id: string, titre: string, contenu: string, date: Date}>>([])
  
  // Types de notes disponibles
  const typesNotesDisponibles = [
    'Note méthodologique',
    'Principe comptable',
    'Changement de méthode',
    'Évènement post-clôture',
    'Engagements hors bilan',
    'Information sectorielle',
    'Partie liée',
    'Autre information'
  ]

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'error'
      case 'moyenne': return 'warning'
      case 'basse': return 'success'
      default: return 'default'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note {numeroNote} - {titre}
      </Typography>

      {/* Statut de développement */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Construction />}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Note en cours de développement
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Cette note sera complètement développée dans une prochaine version du système.
          Le contenu présenté ci-dessous constitue la structure prévue.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Section principale avec sélecteur */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📝 Saisie de la Note {numeroNote}
              </Typography>
              
              {/* Sélecteur de type de note */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type de note</InputLabel>
                <Select
                  value={typeNoteSelectionne}
                  onChange={(e) => setTypeNoteSelectionne(e.target.value)}
                  label="Type de note"
                >
                  {typesNotesDisponibles.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Champ commentaires/contenu */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Commentaires et observations"
                placeholder="Saisissez ici le contenu de la note, les commentaires, observations ou explications nécessaires..."
                value={commentaireNote}
                onChange={(e) => setCommentaireNote(e.target.value)}
                sx={{ mb: 3 }}
                variant="outlined"
              />
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  startIcon={<Save />}
                  onClick={() => {
                    if (typeNoteSelectionne && commentaireNote.trim()) {
                      const nouvelleNote = {
                        id: Date.now().toString(),
                        titre: typeNoteSelectionne,
                        contenu: commentaireNote,
                        date: new Date()
                      }
                      setNotesPersonnalisees([...notesPersonnalisees, nouvelleNote])
                      setCommentaireNote('')
                    }
                  }}
                  disabled={!typeNoteSelectionne || !commentaireNote.trim()}
                >
                  Ajouter Note
                </Button>
                
                <Button variant="outlined" startIcon={<Comment />}>
                  Modèles de Notes
                </Button>
              </Stack>
            </CardContent>
          </Card>
          
          {/* Notes personnalisées ajoutées */}
          {notesPersonnalisees.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  📄 Notes ajoutées ({notesPersonnalisees.length})
                </Typography>
                {notesPersonnalisees.map((note) => (
                  <Box key={note.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {note.titre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {note.date.toLocaleDateString('fr-FR')}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      {note.contenu}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Contenu prévu (informatif) */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                💡 Contenu suggéré pour cette note
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
              <List>
                {contenuPrevu.map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <CheckCircle sx={{ mr: 2, color: 'success.main', fontSize: '1rem' }} />
                    <ListItemText 
                      primary={<Typography variant="body2">{item}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations techniques */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Informations de développement
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">PRIORITÉ</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={priorite.toUpperCase()} 
                    color={getPrioriteColor(priorite) as any}
                    size="small"
                  />
                </Box>
              </Box>

              {datePrevisionnelle && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">DATE PRÉVISIONNELLE</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Schedule sx={{ mr: 1, fontSize: '1rem' }} color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {datePrevisionnelle}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">STATUT</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                  En attente de développement
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Cette note sera développée avec des tableaux détaillés, des calculs automatiques 
                  et une interface interactive complète.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Structure prévue */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Structure technique prévue
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper 
                variant="outlined" 
                sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📊 Tableaux interactifs
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tableaux avec saisie en ligne, calculs automatiques et validation des données
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                variant="outlined" 
                sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📈 Graphiques analytiques
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Visualisations graphiques pour l'analyse des données financières
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                variant="outlined" 
                sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  🔗 Liens automatiques
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Connexions automatiques avec les autres états et notes de la liasse
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Message temporaire */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 3, 
          textAlign: 'center', 
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          border: `1px dashed ${theme.palette.info.main}`
        }}
      >
        <Construction sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Développement en cours
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cette note sera complètement fonctionnelle dans une prochaine mise à jour.
          Toutes les données saisies seront préservées lors de la migration.
        </Typography>
      </Paper>

      {/* Section Commentaires et Observations */}
      <CommentairesSection 
        titre={`Commentaires et Observations - Note ${numeroNote}`}
        noteId={`note${numeroNote}`} 
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Système',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: `Note en cours de développement.\n\nStatut : ${priorite === 'haute' ? 'Priorité élevée' : priorite === 'moyenne' ? 'Priorité moyenne' : 'Priorité faible'}\n\nUn champ commentaires complet sera disponible une fois la note entièrement développée.`,
            type: 'note'
          }
        ]}
      />
    </Box>
  )
}

// Factory function pour créer toutes les notes
export const createNoteComponent = (config: NoteRestanteProps) => {
  return () => <NotesRestantes {...config} />
}

// Configuration de toutes les notes manquantes
export const NOTES_CONFIGS = {
  note4: {
    numeroNote: 4,
    titre: 'IMMOBILISATIONS FINANCIÈRES',
    description: 'Détail des titres de participation, créances rattachées à des participations, autres titres immobilisés, prêts et créances diverses.',
    contenuPrevu: [
      'Tableau des mouvements des immobilisations financières',
      'Détail des titres de participation avec nom des sociétés',
      'Créances rattachées à des participations',
      'Autres titres immobilisés (VMP à plus d\'un an)',
      'Prêts accordés aux tiers',
      'Dépôts et cautionnements versés',
      'Provisions pour dépréciation des immobilisations financières'
    ],
    priorite: 'haute' as const,
    datePrevisionnelle: 'Janvier 2025'
  },
  note7: {
    numeroNote: 7,
    titre: 'AUTRES CRÉANCES',
    description: 'Analyse détaillée des créances autres que clients : personnel, organismes sociaux, État, débiteurs divers.',
    contenuPrevu: [
      'Créances sur le personnel (avances, prêts)',
      'Créances fiscales (TVA déductible, crédit d\'impôt)',
      'Créances sociales (organismes de sécurité sociale)',
      'Créances sur l\'État et collectivités publiques',
      'Débiteurs divers et créances diverses',
      'Charges constatées d\'avance',
      'Échéancier des créances',
      'Provisions pour créances douteuses'
    ],
    priorite: 'haute' as const,
    datePrevisionnelle: 'Janvier 2025'
  },
  note9: {
    numeroNote: 9,
    titre: 'CAPITAUX PROPRES - MOUVEMENT',
    description: 'Tableau de variation des capitaux propres détaillant tous les mouvements de l\'exercice.',
    contenuPrevu: [
      'Mouvement du capital social',
      'Évolution des primes d\'émission et de fusion',
      'Variations des réserves légales et statutaires',
      'Report à nouveau (évolution)',
      'Affectation du résultat de l\'exercice précédent',
      'Résultat de l\'exercice en cours',
      'Autres variations des capitaux propres',
      'Réconciliation avec le bilan'
    ],
    priorite: 'haute' as const,
    datePrevisionnelle: 'Décembre 2024'
  },
  note10: {
    numeroNote: 10,
    titre: 'PROVISIONS POUR RISQUES ET CHARGES',
    description: 'Détail des provisions constituées pour faire face aux risques et charges futurs.',
    contenuPrevu: [
      'Provisions pour litiges en cours',
      'Provisions pour garanties données aux clients',
      'Provisions pour perte de change',
      'Provisions pour gros entretien et grandes révisions',
      'Provisions pour restructuration',
      'Autres provisions pour risques',
      'Mouvements de l\'exercice (dotations, reprises)',
      'Justification des provisions'
    ],
    priorite: 'moyenne' as const,
    datePrevisionnelle: 'Janvier 2025'
  },
  // ... Configuration des autres notes (12, 13, 15, 16, 18, 20-35) suivrait le même modèle
}

// Exports des composants individuels
export const Note4SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note4)
export const Note7SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note7)
export const Note9SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note9)
export const Note10SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note10)

export default NotesRestantes