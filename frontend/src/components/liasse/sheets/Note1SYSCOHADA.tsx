/**
 * Note 1 - Référentiel comptable et présentation des comptes
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Info as InfoIcon,
  Book as BookIcon,
  AccountBalance as LegalIcon,
  Gavel as RuleIcon,
} from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'

interface ReferentielData {
  referentielUtilise: string
  dateApplication: string
  changementsReferentiel: string
  impactChangements: string
  
  // Principes comptables appliqués
  principesAppliques: {
    prudence: boolean
    continuite: boolean
    specialisation: boolean
    coutHistorique: boolean
    permanence: boolean
    transparence: boolean
  }
  
  // Conventions comptables
  conventionsComptables: {
    monnaieCompte: string
    langueEtablissement: string
    periodeReferenceExercice: string
    methodesEvaluation: string[]
    reglesPresentationEtats: string
  }
  
  // Dérogations éventuelles
  derogations: {
    hasDerogation: boolean
    natureDerogation: string
    justificationDerogation: string
    impactDerogation: string
  }
  
  commentaires: string
}

const Note1SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<ReferentielData>({
    referentielUtilise: 'SYSCOHADA révisé',
    dateApplication: '2018-01-01',
    changementsReferentiel: '',
    impactChangements: '',
    
    principesAppliques: {
      prudence: true,
      continuite: true,
      specialisation: true,
      coutHistorique: true,
      permanence: true,
      transparence: true,
    },
    
    conventionsComptables: {
      monnaieCompte: 'XOF (Franc CFA)',
      langueEtablissement: 'Français',
      periodeReferenceExercice: '12 mois',
      methodesEvaluation: ['Coût historique', 'Amortissement linéaire', 'Coût moyen pondéré'],
      reglesPresentationEtats: 'Système normal OHADA'
    },
    
    derogations: {
      hasDerogation: false,
      natureDerogation: '',
      justificationDerogation: '',
      impactDerogation: ''
    },
    
    commentaires: ''
  })
  
  const [hasChanges, setHasChanges] = useState(false)

  const handleFieldChange = (field: keyof ReferentielData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleNestedFieldChange = (section: keyof ReferentielData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handlePrincipleToggle = (principle: keyof typeof data.principesAppliques) => {
    setData(prev => ({
      ...prev,
      principesAppliques: {
        ...prev.principesAppliques,
        [principle]: !prev.principesAppliques[principle]
      }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    console.log('Sauvegarde Note 1:', data)
    setHasChanges(false)
  }

  const REFERENTIELS_DISPONIBLES = [
    'SYSCOHADA révisé',
    'SYSCOHADA (version antérieure)',
    'Plan comptable national',
    'Normes IFRS',
    'Autre'
  ]

  const METHODES_EVALUATION = [
    'Coût historique',
    'Coût de remplacement',
    'Valeur de réalisation',
    'Valeur actualisée',
    'Juste valeur',
    'Coût amorti'
  ]

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <BookIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 1 - RÉFÉRENTIEL COMPTABLE ET PRÉSENTATION DES COMPTES
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer">
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Exporter">
              <IconButton size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
            
            {hasChanges && (
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                color="success"
              >
                Enregistrer
              </Button>
            )}
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette note présente le référentiel comptable utilisé et les principales conventions de présentation des états financiers.
          </Typography>
        </Alert>
      </Box>

      {/* Référentiel utilisé */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <LegalIcon sx={{ mr: 1 }} color="primary" />
            Référentiel comptable
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Référentiel utilisé</InputLabel>
                <Select
                  value={data.referentielUtilise}
                  onChange={(e) => handleFieldChange('referentielUtilise', e.target.value)}
                  label="Référentiel utilisé"
                >
                  {REFERENTIELS_DISPONIBLES.map((ref) => (
                    <MenuItem key={ref} value={ref}>
                      {ref}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date d'application"
                type="date"
                value={data.dateApplication}
                onChange={(e) => handleFieldChange('dateApplication', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Changements de référentiel (le cas échéant)"
                value={data.changementsReferentiel}
                onChange={(e) => handleFieldChange('changementsReferentiel', e.target.value)}
                placeholder="Décrivez les changements de référentiel survenus et leur impact..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Principes comptables */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <RuleIcon sx={{ mr: 1 }} color="primary" />
            Principes comptables appliqués
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries({
              prudence: 'Principe de prudence',
              continuite: 'Continuité d\'exploitation',
              specialisation: 'Spécialisation des exercices',
              coutHistorique: 'Coût historique',
              permanence: 'Permanence des méthodes',
              transparence: 'Transparence'
            }).map(([key, label]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: data.principesAppliques[key as keyof typeof data.principesAppliques]
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.grey[500], 0.1),
                    border: `2px solid ${
                      data.principesAppliques[key as keyof typeof data.principesAppliques]
                        ? theme.palette.success.main
                        : theme.palette.grey[300]
                    }`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                  onClick={() => handlePrincipleToggle(key as keyof typeof data.principesAppliques)}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={data.principesAppliques[key as keyof typeof data.principesAppliques] ? "Appliqué" : "Non appliqué"}
                      color={data.principesAppliques[key as keyof typeof data.principesAppliques] ? "success" : "default"}
                      size="small"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {label}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Conventions comptables */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="primary" />
            Conventions comptables
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monnaie de compte"
                value={data.conventionsComptables.monnaieCompte}
                onChange={(e) => handleNestedFieldChange('conventionsComptables', 'monnaieCompte', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Langue d'établissement"
                value={data.conventionsComptables.langueEtablissement}
                onChange={(e) => handleNestedFieldChange('conventionsComptables', 'langueEtablissement', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Période de référence"
                value={data.conventionsComptables.periodeReferenceExercice}
                onChange={(e) => handleNestedFieldChange('conventionsComptables', 'periodeReferenceExercice', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Règles de présentation"
                value={data.conventionsComptables.reglesPresentationEtats}
                onChange={(e) => handleNestedFieldChange('conventionsComptables', 'reglesPresentationEtats', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Méthodes d'évaluation utilisées :
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {METHODES_EVALUATION.map((methode) => (
                  <Chip
                    key={methode}
                    label={methode}
                    clickable
                    color={data.conventionsComptables.methodesEvaluation.includes(methode) ? "primary" : "default"}
                    onClick={() => {
                      const currentMethods = data.conventionsComptables.methodesEvaluation
                      const newMethods = currentMethods.includes(methode)
                        ? currentMethods.filter(m => m !== methode)
                        : [...currentMethods, methode]
                      handleNestedFieldChange('conventionsComptables', 'methodesEvaluation', newMethods)
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dérogations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="warning" />
            Dérogations éventuelles
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dérogations aux principes comptables</InputLabel>
                <Select
                  value={data.derogations.hasDerogation ? 'oui' : 'non'}
                  onChange={(e) => handleNestedFieldChange('derogations', 'hasDerogation', e.target.value === 'oui')}
                  label="Dérogations aux principes comptables"
                >
                  <MenuItem value="non">Aucune dérogation</MenuItem>
                  <MenuItem value="oui">Dérogations appliquées</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {data.derogations.hasDerogation && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Nature des dérogations"
                    value={data.derogations.natureDerogation}
                    onChange={(e) => handleNestedFieldChange('derogations', 'natureDerogation', e.target.value)}
                    placeholder="Décrivez la nature des dérogations appliquées..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Justification"
                    value={data.derogations.justificationDerogation}
                    onChange={(e) => handleNestedFieldChange('derogations', 'justificationDerogation', e.target.value)}
                    placeholder="Justifiez les raisons de ces dérogations..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Impact sur les états financiers"
                    value={data.derogations.impactDerogation}
                    onChange={(e) => handleNestedFieldChange('derogations', 'impactDerogation', e.target.value)}
                    placeholder="Décrivez l'impact chiffré de ces dérogations..."
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Section Commentaires et Observations */}
      <CommentairesSection 
        titre="Commentaires et Observations - Note 1"
        noteId="note1" 
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Expert-comptable',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: 'Les méthodes comptables appliquées sont conformes au référentiel SYSCOHADA révisé.\n\nPoints d\'attention :\n- Vérifier la cohérence des estimations d\'amortissement\n- S\'assurer de la documentation des changements de méthodes',
            type: 'note'
          }
        ]}
      />
    </Paper>
  )
}

export default Note1SYSCOHADA