/**
 * Page du module de génération de liasses SYSCOHADA
 */

import { useState } from 'react'
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
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material'
import {
  Assignment,
  PlayArrow,
  GetApp,
  Visibility,
  Settings,
} from '@mui/icons-material'

const Generation = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [typeListeSelectionnée, setTypeLiasseSelectionnee] = useState('')
  const [generationEnCours, setGenerationEnCours] = useState(false)

  const typesLiasse = [
    { code: 'SN', label: 'Système Normal (SN)', description: 'Entreprises > 100M FCFA' },
    { code: 'SA', label: 'Système Allégé (SA)', description: 'PME 30-100M FCFA' },
    { code: 'SMT', label: 'Système Minimal (SMT)', description: 'TPE < 30M FCFA' },
    { code: 'BANQUE', label: 'États Bancaires', description: 'Secteur bancaire' },
  ]

  const etatsFinanciers = [
    { nom: 'Bilan - Actif', complete: 95, obligatoire: true },
    { nom: 'Bilan - Passif', complete: 95, obligatoire: true },
    { nom: 'Compte de Résultat', complete: 88, obligatoire: true },
    { nom: 'TAFIRE', complete: 72, obligatoire: true },
    { nom: 'Notes Annexes', complete: 45, obligatoire: false },
    { nom: 'Variation Capitaux', complete: 89, obligatoire: false },
  ]

  const etapesGeneration = [
    'Sélection du type de liasse',
    'Validation des données',
    'Calculs automatiques',
    'Génération des états',
    'Contrôles de cohérence',
  ]

  const lancerGeneration = () => {
    setGenerationEnCours(true)
    // Simulation de génération
    setTimeout(() => {
      setGenerationEnCours(false)
      setActiveStep(etapesGeneration.length)
    }, 3000)
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Génération de Liasses SYSCOHADA
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={lancerGeneration}
            disabled={!typeListeSelectionnée || generationEnCours}
          >
            Générer Liasse
          </Button>
          <Button variant="outlined" startIcon={<Settings />}>
            Configuration
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Processus de génération */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Assistant de Génération" />
            <Divider />
            <CardContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {etapesGeneration.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {index === 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Type de liasse</InputLabel>
                          <Select
                            value={typeListeSelectionnée}
                            onChange={(e) => setTypeLiasseSelectionnee(e.target.value)}
                            label="Type de liasse"
                          >
                            {typesLiasse.map((type) => (
                              <MenuItem key={type.code} value={type.code}>
                                <Box>
                                  <Typography variant="subtitle1">{type.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {type.description}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      
                      {generationEnCours && index === activeStep && (
                        <LinearProgress sx={{ mb: 2 }} />
                      )}
                      
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(index + 1)}
                        sx={{ mr: 1 }}
                        disabled={index === 0 && !typeListeSelectionnée}
                      >
                        Continuer
                      </Button>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === etapesGeneration.length && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="h6">Liasse générée avec succès !</Typography>
                  La liasse fiscale SYSCOHADA a été générée et validée.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* États financiers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="États Financiers" />
            <Divider />
            <CardContent>
              <List>
                {etatsFinanciers.map((etat, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar
                        sx={{ 
                          bgcolor: etat.complete >= 90 ? 'success.main' : 'warning.main',
                          width: 32,
                          height: 32 
                        }}
                      >
                        <Typography variant="caption" color="white">
                          {etat.complete}%
                        </Typography>
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={etat.nom}
                      secondary={
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={etat.complete}
                            sx={{ mb: 0.5 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">
                              Complétude: {etat.complete}%
                            </Typography>
                            <Chip
                              label={etat.obligatoire ? 'Obligatoire' : 'Optionnel'}
                              size="small"
                              color={etat.obligatoire ? 'primary' : 'default'}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Dernières liasses générées */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Dernières Liasses Générées" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Card variant="outlined" sx={{ minWidth: 280 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Liasse 2024</Typography>
                      <Chip label="VALIDÉE" color="success" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Type: Système Normal (SN)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Générée: 15/03/2024
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<Visibility />}>
                        Voir
                      </Button>
                      <Button size="small" startIcon={<GetApp />}>
                        Télécharger
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ minWidth: 280 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Liasse 2023</Typography>
                      <Chip label="DÉCLARÉE" color="info" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Type: Système Normal (SN)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Déclarée: 28/04/2023
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<Visibility />}>
                        Voir
                      </Button>
                      <Button size="small" startIcon={<GetApp />}>
                        Télécharger
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Generation