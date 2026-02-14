/**
 * Page de Recevabilité - Critères de validation de la déclaration
 */

import { useState, type FC } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  Checkbox,
  Alert,
  Chip,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  Assignment as CriteriaIcon,
  VerifiedUser as ValidIcon,
} from '@mui/icons-material'

interface CritereRecevabilite {
  id: string
  categorie: string
  libelle: string
  obligatoire: boolean
  verifie: boolean
  statut: 'valide' | 'invalide' | 'en_attente'
  commentaire?: string
}

const RecevabiliteSYSCOHADA: FC = () => {
  const theme = useTheme()
  
  const [criteres, setCriteres] = useState<CritereRecevabilite[]>([
    {
      id: '1',
      categorie: 'Identification',
      libelle: 'Numéro d\'Identification Unique (NIU) valide',
      obligatoire: true,
      verifie: true,
      statut: 'valide',
    },
    {
      id: '2',
      categorie: 'Identification',
      libelle: 'Raison sociale correctement renseignée',
      obligatoire: true,
      verifie: true,
      statut: 'valide',
    },
    {
      id: '3',
      categorie: 'Identification',
      libelle: 'Adresse complète du siège social',
      obligatoire: true,
      verifie: true,
      statut: 'valide',
    },
    {
      id: '4',
      categorie: 'États financiers',
      libelle: 'Bilan équilibré (Actif = Passif)',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '5',
      categorie: 'États financiers',
      libelle: 'Compte de résultat complet',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '6',
      categorie: 'États financiers',
      libelle: 'Cohérence entre bilan et compte de résultat',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '7',
      categorie: 'Documents obligatoires',
      libelle: 'Tableau de flux de trésorerie',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '8',
      categorie: 'Documents obligatoires',
      libelle: 'Notes annexes complètes',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '9',
      categorie: 'Documents obligatoires',
      libelle: 'État supplémentaire statistique',
      obligatoire: false,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '10',
      categorie: 'Validation',
      libelle: 'Signature du dirigeant',
      obligatoire: true,
      verifie: false,
      statut: 'en_attente',
    },
    {
      id: '11',
      categorie: 'Validation',
      libelle: 'Certification du commissaire aux comptes',
      obligatoire: false,
      verifie: false,
      statut: 'en_attente',
      commentaire: 'Obligatoire selon le chiffre d\'affaires',
    },
    {
      id: '12',
      categorie: 'Délais',
      libelle: 'Déclaration dans les délais légaux',
      obligatoire: true,
      verifie: true,
      statut: 'valide',
    },
  ])

  const handleCheckCritere = (id: string) => {
    setCriteres(prev => prev.map(c => {
      if (c.id === id) {
        const verifie = !c.verifie
        return {
          ...c,
          verifie,
          statut: verifie ? 'valide' : 'en_attente'
        }
      }
      return c
    }))
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'valide':
        return <CheckIcon sx={{ color: theme.palette.success.main }} />
      case 'invalide':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />
      default:
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />
    }
  }

  const categories = [...new Set(criteres.map(c => c.categorie))]
  const criteresObligatoires = criteres.filter(c => c.obligatoire)
  const criteresValides = criteresObligatoires.filter(c => c.statut === 'valide')
  const tauxConformite = (criteresValides.length / criteresObligatoires.length) * 100

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <ValidIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Critères de Recevabilité
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Vérification de la conformité de la déclaration fiscale
            </Typography>
          </Box>
          <Chip 
            label={tauxConformite === 100 ? 'Conforme' : 'Non conforme'}
            color={tauxConformite === 100 ? 'success' : 'warning'}
            size="medium"
          />
        </Stack>
      </Paper>

      {/* Barre de progression */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1">
                Taux de conformité
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {tauxConformite.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={tauxConformite}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: tauxConformite === 100 
                    ? theme.palette.success.main 
                    : theme.palette.warning.main
                }
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckIcon fontSize="small" color="success" />
                  <Typography variant="caption">
                    {criteresValides.length} critères validés
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningIcon fontSize="small" color="warning" />
                  <Typography variant="caption">
                    {criteresObligatoires.length - criteresValides.length} en attente
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CriteriaIcon fontSize="small" color="action" />
                  <Typography variant="caption">
                    {criteresObligatoires.length} obligatoires
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Critères par catégorie */}
      <Grid container spacing={3}>
        {categories.map(categorie => {
          const criteresCategorie = criteres.filter(c => c.categorie === categorie)
          const valides = criteresCategorie.filter(c => c.statut === 'valide').length
          
          return (
            <Grid item xs={12} key={categorie}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {categorie}
                    </Typography>
                    <Chip 
                      label={`${valides}/${criteresCategorie.length}`}
                      size="small"
                      color={valides === criteresCategorie.length ? 'success' : 'default'}
                    />
                  </Stack>
                  
                  <Divider />
                  
                  <List dense>
                    {criteresCategorie.map(critere => (
                      <ListItem key={critere.id}>
                        <ListItemIcon>
                          <Checkbox
                            checked={critere.verifie}
                            onChange={() => handleCheckCritere(critere.id)}
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">
                                {critere.libelle}
                              </Typography>
                              {critere.obligatoire && (
                                <Chip label="Obligatoire" size="small" color="error" />
                              )}
                            </Stack>
                          }
                          secondary={critere.commentaire}
                        />
                        <ListItemIcon>
                          {getStatutIcon(critere.statut)}
                        </ListItemIcon>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Message d'alerte si non conforme */}
      {tauxConformite < 100 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Déclaration incomplète
          </Typography>
          <Typography variant="body2">
            Veuillez compléter tous les critères obligatoires avant de soumettre votre déclaration.
            {criteresObligatoires.length - criteresValides.length} critère(s) obligatoire(s) restant(s).
          </Typography>
        </Alert>
      )}

      {/* Message de succès si conforme */}
      {tauxConformite === 100 && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Déclaration conforme
          </Typography>
          <Typography variant="body2">
            Tous les critères obligatoires sont satisfaits. Votre déclaration est prête à être soumise.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}

export default RecevabiliteSYSCOHADA