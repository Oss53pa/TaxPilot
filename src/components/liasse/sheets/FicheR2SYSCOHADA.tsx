/**
 * Fiche R2 - Dirigeants et Commissaires aux comptes SYSCOHADA
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Alert,
} from '@mui/material'
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Business as BusinessIcon,
  AccountBox as PersonIcon,
  Gavel as AuditIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'

interface Dirigeant {
  id: string
  qualite: string
  nom: string
  prenoms: string
  adresse: string
  telephone: string
  email: string
  dateNomination: string
  dureeMandat: string
  remunerations: number
  avantagesNature: string
  observations: string
}

interface CommissaireCompte {
  id: string
  nom: string
  prenoms: string
  cabinet: string
  adresse: string
  telephone: string
  email: string
  numeroOrdre: string
  dateNomination: string
  dureeMandat: string
  honoraires: number
  autresPrestations: number
  observations: string
}

const QUALITES_DIRIGEANT = [
  'Président Conseil d\'Administration',
  'Directeur Général',
  'Directeur Général Délégué',
  'Administrateur',
  'Gérant',
  'Associé-Gérant',
  'Président du Directoire',
  'Membre du Directoire',
  'Président du Conseil de Surveillance',
  'Membre du Conseil de Surveillance',
  'Autre'
]

const FicheR2SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [dirigeants, setDirigeants] = useState<Dirigeant[]>([])
  const [commissaires, setCommissaires] = useState<CommissaireCompte[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Charger les données existantes
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    // Données par défaut ou depuis API
    setDirigeants([
      {
        id: '1',
        qualite: '',
        nom: '',
        prenoms: '',
        adresse: '',
        telephone: '',
        email: '',
        dateNomination: '',
        dureeMandat: '',
        remunerations: 0,
        avantagesNature: '',
        observations: ''
      }
    ])
    
    setCommissaires([
      {
        id: '1',
        nom: '',
        prenoms: '',
        cabinet: '',
        adresse: '',
        telephone: '',
        email: '',
        numeroOrdre: '',
        dateNomination: '',
        dureeMandat: '',
        honoraires: 0,
        autresPrestations: 0,
        observations: ''
      }
    ])
  }

  const handleDirigeantChange = (id: string, field: keyof Dirigeant, value: string | number) => {
    setDirigeants(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ))
    setHasChanges(true)
  }

  const handleCommissaireChange = (id: string, field: keyof CommissaireCompte, value: string | number) => {
    setCommissaires(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
    setHasChanges(true)
  }

  const addDirigeant = () => {
    const newDirigeant: Dirigeant = {
      id: Date.now().toString(),
      qualite: '',
      nom: '',
      prenoms: '',
      adresse: '',
      telephone: '',
      email: '',
      dateNomination: '',
      dureeMandat: '',
      remunerations: 0,
      avantagesNature: '',
      observations: ''
    }
    setDirigeants(prev => [...prev, newDirigeant])
    setHasChanges(true)
  }

  const addCommissaire = () => {
    const newCommissaire: CommissaireCompte = {
      id: Date.now().toString(),
      nom: '',
      prenoms: '',
      cabinet: '',
      adresse: '',
      telephone: '',
      email: '',
      numeroOrdre: '',
      dateNomination: '',
      dureeMandat: '',
      honoraires: 0,
      autresPrestations: 0,
      observations: ''
    }
    setCommissaires(prev => [...prev, newCommissaire])
    setHasChanges(true)
  }

  const removeDirigeant = (id: string) => {
    if (dirigeants.length > 1) {
      setDirigeants(prev => prev.filter(d => d.id !== id))
      setHasChanges(true)
    }
  }

  const removeCommissaire = (id: string) => {
    if (commissaires.length > 1) {
      setCommissaires(prev => prev.filter(c => c.id !== id))
      setHasChanges(true)
    }
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSave = () => {
    console.log('Sauvegarde Fiche R2:', { dirigeants, commissaires, comment })
    setHasChanges(false)
  }

  // Calculs totaux
  const totalRemunerationsDirigeants = dirigeants.reduce((sum, d) => sum + (d.remunerations || 0), 0)
  const totalHonorairesCommissaires = commissaires.reduce((sum, c) => sum + (c.honoraires || 0) + (c.autresPrestations || 0), 0)

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
            <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R2 - DIRIGEANTS ET COMMISSAIRES AUX COMPTES
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

        {/* Indicateurs */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<PersonIcon />}
            label={`${dirigeants.length} Dirigeant(s)`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<AuditIcon />}
            label={`${commissaires.length} Commissaire(s)`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={`Rémunérations: ${formatNumber(totalRemunerationsDirigeants)} XOF`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`Honoraires: ${formatNumber(totalHonorairesCommissaires)} XOF`}
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Section Dirigeants */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              DIRIGEANTS SOCIAUX
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={addDirigeant}
            >
              Ajouter un dirigeant
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Qualité</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nom et Prénoms</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mandat</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rémunérations</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dirigeants.map((dirigeant) => (
                  <TableRow key={dirigeant.id}>
                    <TableCell sx={{ width: 200 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={dirigeant.qualite}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'qualite', e.target.value)}
                        >
                          {QUALITES_DIRIGEANT.map((qualite) => (
                            <MenuItem key={qualite} value={qualite}>
                              {qualite}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell sx={{ width: 250 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Nom"
                          value={dirigeant.nom}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'nom', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Prénoms"
                          value={dirigeant.prenoms}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'prenoms', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 200 }}>
                      <TextField
                        size="small"
                        multiline
                        rows={2}
                        value={dirigeant.adresse}
                        onChange={(e) => handleDirigeantChange(dirigeant.id, 'adresse', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    
                    <TableCell sx={{ width: 200 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Téléphone"
                          value={dirigeant.telephone}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'telephone', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Email"
                          value={dirigeant.email}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'email', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 150 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Date nomination"
                          type="date"
                          value={dirigeant.dateNomination}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'dateNomination', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          label="Durée (années)"
                          value={dirigeant.dureeMandat}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'dureeMandat', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 150 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Rémunérations"
                          type="number"
                          value={dirigeant.remunerations}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'remunerations', parseFloat(e.target.value) || 0)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Avantages nature"
                          value={dirigeant.avantagesNature}
                          onChange={(e) => handleDirigeantChange(dirigeant.id, 'avantagesNature', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 80 }}>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeDirigeant(dirigeant.id)}
                          disabled={dirigeants.length <= 1}
                        >
                          <DeleteIcon />
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

      {/* Section Commissaires aux comptes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
              <AuditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              COMMISSAIRES AUX COMPTES
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={addCommissaire}
            >
              Ajouter un commissaire
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nom et Prénoms</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cabinet</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>N° Ordre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mandat</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Honoraires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissaires.map((commissaire) => (
                  <TableRow key={commissaire.id}>
                    <TableCell sx={{ width: 200 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Nom"
                          value={commissaire.nom}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'nom', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Prénoms"
                          value={commissaire.prenoms}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'prenoms', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 200 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Cabinet"
                          value={commissaire.cabinet}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'cabinet', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          multiline
                          rows={2}
                          label="Adresse"
                          value={commissaire.adresse}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'adresse', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 180 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Téléphone"
                          value={commissaire.telephone}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'telephone', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Email"
                          value={commissaire.email}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'email', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 120 }}>
                      <TextField
                        size="small"
                        label="N° Ordre"
                        value={commissaire.numeroOrdre}
                        onChange={(e) => handleCommissaireChange(commissaire.id, 'numeroOrdre', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    
                    <TableCell sx={{ width: 150 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Date nomination"
                          type="date"
                          value={commissaire.dateNomination}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'dateNomination', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          label="Durée (années)"
                          value={commissaire.dureeMandat}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'dureeMandat', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 150 }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          label="Honoraires audit"
                          type="number"
                          value={commissaire.honoraires}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'honoraires', parseFloat(e.target.value) || 0)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="Autres prestations"
                          type="number"
                          value={commissaire.autresPrestations}
                          onChange={(e) => handleCommissaireChange(commissaire.id, 'autresPrestations', parseFloat(e.target.value) || 0)}
                          fullWidth
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ width: 80 }}>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCommissaire(commissaire.id)}
                          disabled={commissaires.length <= 1}
                        >
                          <DeleteIcon />
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

      {/* Résumé financier */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          RÉSUMÉ FINANCIER
        </Typography>
        <Typography variant="body2">
          • Total rémunérations dirigeants : <strong>{formatNumber(totalRemunerationsDirigeants)} XOF</strong>
        </Typography>
        <Typography variant="body2">
          • Total honoraires commissaires : <strong>{formatNumber(totalHonorairesCommissaires)} XOF</strong>
        </Typography>
        <Typography variant="body2">
          • Coût total gouvernance : <strong>{formatNumber(totalRemunerationsDirigeants + totalHonorairesCommissaires)} XOF</strong>
        </Typography>
      </Alert>

      {/* Zone de commentaires */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <CommentIcon color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Commentaires et observations
          </Typography>
        </Stack>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Commentaires sur la composition des organes de direction et de contrôle, évolution des mandats, conflits d'intérêts éventuels..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default FicheR2SYSCOHADA