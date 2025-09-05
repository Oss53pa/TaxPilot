/**
 * Fiche R1 - Renseignements Généraux SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Button,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  alpha,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  InputAdornment,
} from '@mui/material'
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as BankIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'

interface FicheR1Data {
  // Identification
  raisonSociale: string
  sigle: string
  formeJuridique: string
  capitalSocial: number
  numeroRCCM: string
  numeroIFU: string
  numeroEmployeur: string
  
  // Adresse
  siegeSocial: string
  boitePostale: string
  ville: string
  pays: string
  telephone: string
  telecopie: string
  email: string
  siteWeb: string
  
  // Activité
  activitePrincipale: string
  codeNACEMA: string
  nombreEtablissements: number
  
  // Exercice
  dateOuverture: string
  dateCloture: string
  dureeExercice: number
  
  // Régime fiscal
  regimeFiscal: string
  centreImpots: string
  
  // Appartenance
  groupeEntreprises: boolean
  nomGroupe: string
  paysSiegeSocial: string
  
  // Effectifs
  effectifPermanent: number
  effectifTemporaire: number
  effectifTotal: number
  masseSalariale: number
  
  // Commissaire aux comptes
  cacNom: string
  cacAdresse: string
  cacNumeroInscription: string
  
  // Expert comptable
  expertNom: string
  expertAdresse: string
  expertNumeroInscription: string
  
  comment: string
}

const FicheR1SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<FicheR1Data>({
    raisonSociale: '',
    sigle: '',
    formeJuridique: 'SA',
    capitalSocial: 0,
    numeroRCCM: '',
    numeroIFU: '',
    numeroEmployeur: '',
    siegeSocial: '',
    boitePostale: '',
    ville: '',
    pays: 'Bénin',
    telephone: '',
    telecopie: '',
    email: '',
    siteWeb: '',
    activitePrincipale: '',
    codeNACEMA: '',
    nombreEtablissements: 1,
    dateOuverture: '2024-01-01',
    dateCloture: '2024-12-31',
    dureeExercice: 12,
    regimeFiscal: 'RSI',
    centreImpots: '',
    groupeEntreprises: false,
    nomGroupe: '',
    paysSiegeSocial: '',
    effectifPermanent: 0,
    effectifTemporaire: 0,
    effectifTotal: 0,
    masseSalariale: 0,
    cacNom: '',
    cacAdresse: '',
    cacNumeroInscription: '',
    expertNom: '',
    expertAdresse: '',
    expertNumeroInscription: '',
    comment: ''
  })

  const handleFieldChange = (field: keyof FicheR1Data, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Calculer automatiquement l'effectif total
      if (field === 'effectifPermanent' || field === 'effectifTemporaire') {
        newData.effectifTotal = (newData.effectifPermanent || 0) + (newData.effectifTemporaire || 0)
      }
      
      // Calculer la durée de l'exercice
      if (field === 'dateOuverture' || field === 'dateCloture') {
        const start = new Date(newData.dateOuverture)
        const end = new Date(newData.dateCloture)
        const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
        newData.dureeExercice = months
      }
      
      return newData
    })
  }

  const handleSave = () => {
    console.log('Sauvegarde Fiche R1:', data)
  }

  const formatNumber = (value: number) => {
    if (!value) return ''
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
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
              FICHE R1 - RENSEIGNEMENTS GÉNÉRAUX
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
            >
              Imprimer
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              color="success"
            >
              Enregistrer
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Section 1: Identification */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          1. IDENTIFICATION DE L'ENTREPRISE
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Raison sociale"
              value={data.raisonSociale}
              onChange={(e) => handleFieldChange('raisonSociale', e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Sigle"
              value={data.sigle}
              onChange={(e) => handleFieldChange('sigle', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Forme juridique</InputLabel>
              <Select
                value={data.formeJuridique}
                onChange={(e) => handleFieldChange('formeJuridique', e.target.value)}
                label="Forme juridique"
              >
                <MenuItem value="SA">SA - Société Anonyme</MenuItem>
                <MenuItem value="SARL">SARL - Société à Responsabilité Limitée</MenuItem>
                <MenuItem value="SAS">SAS - Société par Actions Simplifiée</MenuItem>
                <MenuItem value="SNC">SNC - Société en Nom Collectif</MenuItem>
                <MenuItem value="SCS">SCS - Société en Commandite Simple</MenuItem>
                <MenuItem value="GIE">GIE - Groupement d'Intérêt Économique</MenuItem>
                <MenuItem value="EI">EI - Entreprise Individuelle</MenuItem>
                <MenuItem value="COOP">Société Coopérative</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Capital social"
              value={data.capitalSocial}
              onChange={(e) => handleFieldChange('capitalSocial', parseFloat(e.target.value) || 0)}
              type="number"
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">XOF</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° RCCM"
              value={data.numeroRCCM}
              onChange={(e) => handleFieldChange('numeroRCCM', e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° IFU / NIF"
              value={data.numeroIFU}
              onChange={(e) => handleFieldChange('numeroIFU', e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° Employeur CNSS"
              value={data.numeroEmployeur}
              onChange={(e) => handleFieldChange('numeroEmployeur', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 2: Coordonnées */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          2. COORDONNÉES
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Siège social"
              value={data.siegeSocial}
              onChange={(e) => handleFieldChange('siegeSocial', e.target.value)}
              required
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Boîte postale"
              value={data.boitePostale}
              onChange={(e) => handleFieldChange('boitePostale', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Ville"
              value={data.ville}
              onChange={(e) => handleFieldChange('ville', e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Pays</InputLabel>
              <Select
                value={data.pays}
                onChange={(e) => handleFieldChange('pays', e.target.value)}
                label="Pays"
              >
                <MenuItem value="Bénin">Bénin</MenuItem>
                <MenuItem value="Burkina Faso">Burkina Faso</MenuItem>
                <MenuItem value="Cameroun">Cameroun</MenuItem>
                <MenuItem value="Côte d'Ivoire">Côte d'Ivoire</MenuItem>
                <MenuItem value="Gabon">Gabon</MenuItem>
                <MenuItem value="Guinée">Guinée</MenuItem>
                <MenuItem value="Mali">Mali</MenuItem>
                <MenuItem value="Niger">Niger</MenuItem>
                <MenuItem value="Sénégal">Sénégal</MenuItem>
                <MenuItem value="Togo">Togo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Téléphone"
              value={data.telephone}
              onChange={(e) => handleFieldChange('telephone', e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Télécopie"
              value={data.telecopie}
              onChange={(e) => handleFieldChange('telecopie', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Email"
              value={data.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              type="email"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Site web"
              value={data.siteWeb}
              onChange={(e) => handleFieldChange('siteWeb', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 3: Activité */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          3. ACTIVITÉ ET EXERCICE
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Activité principale"
              value={data.activitePrincipale}
              onChange={(e) => handleFieldChange('activitePrincipale', e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Code NACEMA"
              value={data.codeNACEMA}
              onChange={(e) => handleFieldChange('codeNACEMA', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date ouverture exercice"
              value={data.dateOuverture}
              onChange={(e) => handleFieldChange('dateOuverture', e.target.value)}
              type="date"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date clôture exercice"
              value={data.dateCloture}
              onChange={(e) => handleFieldChange('dateCloture', e.target.value)}
              type="date"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Durée exercice (mois)"
              value={data.dureeExercice}
              disabled
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">mois</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Nombre d'établissements"
              value={data.nombreEtablissements}
              onChange={(e) => handleFieldChange('nombreEtablissements', parseInt(e.target.value) || 0)}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 4: Régime fiscal */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          4. RÉGIME FISCAL
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Régime fiscal</InputLabel>
              <Select
                value={data.regimeFiscal}
                onChange={(e) => handleFieldChange('regimeFiscal', e.target.value)}
                label="Régime fiscal"
              >
                <MenuItem value="RSI">RSI - Régime Simplifié d'Imposition</MenuItem>
                <MenuItem value="RNI">RNI - Régime Normal d'Imposition</MenuItem>
                <MenuItem value="RME">RME - Régime des Micro-Entreprises</MenuItem>
                <MenuItem value="REI">REI - Régime de l'Entreprise Individuelle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Centre des impôts"
              value={data.centreImpots}
              onChange={(e) => handleFieldChange('centreImpots', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 5: Effectifs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          5. EFFECTIFS ET MASSE SALARIALE
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Effectif permanent"
              value={data.effectifPermanent}
              onChange={(e) => handleFieldChange('effectifPermanent', parseInt(e.target.value) || 0)}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Effectif temporaire"
              value={data.effectifTemporaire}
              onChange={(e) => handleFieldChange('effectifTemporaire', parseInt(e.target.value) || 0)}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Effectif total"
              value={data.effectifTotal}
              disabled
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  color: theme.palette.text.primary,
                  WebkitTextFillColor: theme.palette.text.primary,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Masse salariale"
              value={data.masseSalariale}
              onChange={(e) => handleFieldChange('masseSalariale', parseFloat(e.target.value) || 0)}
              type="number"
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">XOF</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Section 6: Appartenance à un groupe */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark, fontWeight: 600 }}>
          6. APPARTENANCE À UN GROUPE
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.groupeEntreprises}
                  onChange={(e) => handleFieldChange('groupeEntreprises', e.target.checked)}
                />
              }
              label="L'entreprise appartient à un groupe"
            />
          </Grid>
          
          {data.groupeEntreprises && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom du groupe"
                  value={data.nomGroupe}
                  onChange={(e) => handleFieldChange('nomGroupe', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pays du siège social du groupe"
                  value={data.paysSiegeSocial}
                  onChange={(e) => handleFieldChange('paysSiegeSocial', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

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
          value={data.comment}
          onChange={(e) => handleFieldChange('comment', e.target.value)}
          placeholder="Saisissez vos commentaires et observations..."
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

export default FicheR1SYSCOHADA