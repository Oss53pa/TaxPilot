import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { SignupData as ApiSignupData } from '@/services/apiClient'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  AccountBalance,
  Business,
  Person,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material'

const steps = ['Entreprise', 'Utilisateur', 'Confirmation']

const secteurs = [
  'Agriculture et Élevage',
  'Industrie Manufacturière',
  'BTP - Construction',
  'Commerce et Distribution',
  'Services aux Entreprises',
  'Transport et Logistique',
  'Hôtellerie et Restauration',
  'Banque et Assurance',
  'Télécommunications',
  'Santé',
  'Éducation',
  'Autre',
]

const pays = [
  { code: 'BJ', name: 'Bénin' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'GW', name: 'Guinée-Bissau' },
  { code: 'ML', name: 'Mali' },
  { code: 'NE', name: 'Niger' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'TG', name: 'Togo' },
]

interface SignupData {
  // Étape 1: Entreprise
  nom_entreprise: string
  forme_juridique: string
  rccm: string
  ifu: string
  pays: string
  ville: string
  secteur: string
  ca_annuel: string

  // Étape 2: Utilisateur
  prenom: string
  nom: string
  fonction: string
  email: string
  telephone: string
  password: string
  password_confirm: string

  // Étape 3: Confirmation
  cgu_accepted: boolean
  newsletter: boolean
}

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useAuthStore()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<SignupData>({
    nom_entreprise: '',
    forme_juridique: '',
    rccm: '',
    ifu: '',
    pays: 'CI',
    ville: '',
    secteur: '',
    ca_annuel: '',
    prenom: '',
    nom: '',
    fonction: '',
    email: '',
    telephone: '',
    password: '',
    password_confirm: '',
    cgu_accepted: false,
    newsletter: true,
  })

  const handleChange = (field: keyof SignupData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    })
    setError('')
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.nom_entreprise) {
          setError('Le nom de l\'entreprise est requis')
          return false
        }
        if (!formData.forme_juridique) {
          setError('La forme juridique est requise')
          return false
        }
        if (!formData.secteur) {
          setError('Le secteur d\'activité est requis')
          return false
        }
        return true

      case 1:
        if (!formData.prenom || !formData.nom) {
          setError('Le prénom et le nom sont requis')
          return false
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Email invalide')
          return false
        }
        if (!formData.password || formData.password.length < 8) {
          setError('Le mot de passe doit contenir au moins 8 caractères')
          return false
        }
        if (formData.password !== formData.password_confirm) {
          setError('Les mots de passe ne correspondent pas')
          return false
        }
        return true

      case 2:
        if (!formData.cgu_accepted) {
          setError('Vous devez accepter les CGU pour continuer')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return

    setLoading(true)
    setError('')

    try {
      // Mapper les données du formulaire vers le format API
      const apiData: ApiSignupData = {
        // Informations entreprise
        name: formData.nom_entreprise,
        legal_form: formData.forme_juridique,
        rccm: formData.rccm,
        ifu: formData.ifu,
        country: formData.pays,
        city: formData.ville,
        address: '',
        sector: formData.secteur,
        annual_revenue_range: formData.ca_annuel,
        billing_email: formData.email,

        // Informations utilisateur propriétaire
        user_first_name: formData.prenom,
        user_last_name: formData.nom,
        user_email: formData.email,
        user_password: formData.password,
        user_fonction: formData.fonction,
        user_telephone: formData.telephone,
      }

      // Appeler l'API d'inscription via le store
      const response = await signup(apiData)

      console.log('✅ Inscription réussie:', response)

      // Redirection vers dashboard avec message de succès
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Erreur inscription:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600}>
              Informations sur votre entreprise
            </Typography>

            <TextField
              label="Nom de l'entreprise"
              value={formData.nom_entreprise}
              onChange={handleChange('nom_entreprise')}
              required
              fullWidth
              placeholder="SARL Exemple CI"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Forme juridique"
                  value={formData.forme_juridique}
                  onChange={handleChange('forme_juridique')}
                  select
                  required
                  fullWidth
                >
                  <MenuItem value="SARL">SARL</MenuItem>
                  <MenuItem value="SA">SA</MenuItem>
                  <MenuItem value="SAS">SAS</MenuItem>
                  <MenuItem value="EURL">EURL</MenuItem>
                  <MenuItem value="SNC">SNC</MenuItem>
                  <MenuItem value="GIE">GIE</MenuItem>
                  <MenuItem value="EI">Entreprise Individuelle</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Secteur d'activité"
                  value={formData.secteur}
                  onChange={handleChange('secteur')}
                  select
                  required
                  fullWidth
                >
                  {secteurs.map((secteur) => (
                    <MenuItem key={secteur} value={secteur}>
                      {secteur}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="RCCM"
                  value={formData.rccm}
                  onChange={handleChange('rccm')}
                  fullWidth
                  placeholder="CI-ABJ-2024-B-12345"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="IFU / NIF"
                  value={formData.ifu}
                  onChange={handleChange('ifu')}
                  fullWidth
                  placeholder="1234567890"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Pays"
                  value={formData.pays}
                  onChange={handleChange('pays')}
                  select
                  required
                  fullWidth
                >
                  {pays.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ville"
                  value={formData.ville}
                  onChange={handleChange('ville')}
                  fullWidth
                  placeholder="Abidjan"
                />
              </Grid>
            </Grid>

            <TextField
              label="Chiffre d'affaires annuel approximatif (FCFA)"
              value={formData.ca_annuel}
              onChange={handleChange('ca_annuel')}
              select
              fullWidth
              helperText="Pour vous proposer le plan le plus adapté"
            >
              <MenuItem value="0-30M">Moins de 30 millions</MenuItem>
              <MenuItem value="30M-100M">30 - 100 millions</MenuItem>
              <MenuItem value="100M-500M">100 - 500 millions</MenuItem>
              <MenuItem value="500M+">Plus de 500 millions</MenuItem>
            </TextField>
          </Stack>
        )

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600}>
              Créez votre compte administrateur
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Prénom"
                  value={formData.prenom}
                  onChange={handleChange('prenom')}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nom"
                  value={formData.nom}
                  onChange={handleChange('nom')}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Fonction"
              value={formData.fonction}
              onChange={handleChange('fonction')}
              fullWidth
              placeholder="Directeur Général, DAF, Comptable..."
            />

            <TextField
              label="Email professionnel"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
              placeholder="email@entreprise.com"
            />

            <TextField
              label="Téléphone"
              value={formData.telephone}
              onChange={handleChange('telephone')}
              fullWidth
              placeholder="+225 07 00 00 00 00"
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              required
              fullWidth
              helperText="Minimum 8 caractères"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password_confirm}
              onChange={handleChange('password_confirm')}
              required
              fullWidth
            />
          </Stack>
        )

      case 2:
        return (
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Vérifiez vos informations
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Entreprise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.nom_entreprise} • {formData.forme_juridique}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.secteur}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pays.find(p => p.code === formData.pays)?.name}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Administrateur
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.prenom} {formData.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
              {formData.fonction && (
                <Typography variant="body2" color="text.secondary">
                  {formData.fonction}
                </Typography>
              )}
            </Paper>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.cgu_accepted}
                  onChange={handleChange('cgu_accepted')}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  J'accepte les{' '}
                  <Button component={RouterLink} to="/cgu" target="_blank" size="small">
                    Conditions Générales d'Utilisation
                  </Button>
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.newsletter}
                  onChange={handleChange('newsletter')}
                />
              }
              label={
                <Typography variant="body2">
                  Je souhaite recevoir les actualités et conseils par email
                </Typography>
              }
            />

            <Alert severity="info">
              🎉 Vous commencez avec <strong>2 liasses gratuites</strong> pour tester FiscaSync !
            </Alert>
          </Stack>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              FiscaSync
            </Typography>
          </Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
          >
            Déjà inscrit ? Connexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Form */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Retour
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.cgu_accepted}
                endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          En créant un compte, vous acceptez nos{' '}
          <Button component={RouterLink} to="/cgu" size="small">
            CGU
          </Button>
          {' '}et notre{' '}
          <Button component={RouterLink} to="/privacy" size="small">
            Politique de Confidentialité
          </Button>
        </Typography>
      </Container>
    </Box>
  )
}

export default Signup
