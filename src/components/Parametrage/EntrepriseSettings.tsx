/**
 * Composant de paramétrage de l'entreprise
 */

import React, { useState, useEffect } from 'react'
import { entrepriseService } from '@/services'
import { useBackendData } from '@/hooks/useBackendData'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Avatar,
  IconButton,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import {
  Save,
  Upload,
  Business,
  LocationOn,
  Person,
  AccountBalance,
  ColorLens,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { EntrepriseFormData } from '@/types'

// Schéma de validation pour l'entreprise
const entrepriseSchema = yup.object({
  raison_sociale: yup.string().required('Raison sociale requise'),
  forme_juridique: yup.string().required('Forme juridique requise'),
  numero_contribuable: yup.string().required('Numéro contribuable requis'),
  email: yup.string().email('Email invalide').required('Email requis'),
  adresse_ligne1: yup.string().required('Adresse requise'),
  ville: yup.string().required('Ville requise'),
  pays: yup.string().required('Pays requis'),
  nom_dirigeant: yup.string().required('Nom du dirigeant requis'),
  fonction_dirigeant: yup.string().required('Fonction du dirigeant requise'),
  regime_imposition: yup.string().required('Régime d\'imposition requis'),
  secteur_activite: yup.string().required('Secteur d\'activité requis'),
  chiffre_affaires_annuel: yup.number().min(0, 'CA doit être positif').required('CA requis'),
  devise_principale: yup.string().required('Devise requise'),
})

const formes_juridiques = [
  { value: 'SARL', label: 'Société à Responsabilité Limitée' },
  { value: 'SA', label: 'Société Anonyme' },
  { value: 'SAS', label: 'Société par Actions Simplifiée' },
  { value: 'EI', label: 'Entreprise Individuelle' },
  { value: 'GIE', label: 'Groupement d\'Intérêt Économique' },
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'COOPERATIVES', label: 'Coopératives' },
]

const regimes_imposition = [
  { value: 'REEL_NORMAL', label: 'Régime Réel Normal' },
  { value: 'REEL_SIMPLIFIE', label: 'Régime Réel Simplifié' },
  { value: 'FORFAITAIRE', label: 'Régime Forfaitaire' },
  { value: 'MICRO', label: 'Régime Micro-entreprise' },
]

const secteurs_activite = [
  { value: 'COMMERCE', label: 'Commerce' },
  { value: 'INDUSTRIE', label: 'Industrie' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'BANQUE', label: 'Banque' },
  { value: 'ASSURANCE', label: 'Assurance' },
  { value: 'MICROFINANCE', label: 'Microfinance' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'BTP', label: 'Bâtiment et Travaux Publics' },
]

const pays_ohada = [
  { value: 'BJ', label: 'Bénin' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'CF', label: 'République Centrafricaine' },
  { value: 'KM', label: 'Comores' },
  { value: 'CG', label: 'Congo' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GN', label: 'Guinée' },
  { value: 'GW', label: 'Guinée-Bissau' },
  { value: 'GQ', label: 'Guinée Équatoriale' },
  { value: 'ML', label: 'Mali' },
  { value: 'NE', label: 'Niger' },
  { value: 'CD', label: 'République Démocratique du Congo' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'TD', label: 'Tchad' },
  { value: 'TG', label: 'Togo' },
]

const EntrepriseSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [entrepriseId, setEntrepriseId] = useState<string | null>(null)

  // Récupérer les données de l'entreprise depuis le backend
  const { data: entreprises, loading: loadingEntreprises } = useBackendData({
    service: 'entrepriseService',
    method: 'getEntreprises',
    params: { page_size: 10 },
    defaultData: []
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EntrepriseFormData>({
    resolver: yupResolver(entrepriseSchema),
    defaultValues: {
      raison_sociale: '',
      forme_juridique: 'SARL',
      numero_contribuable: '',
      email: '',
      adresse_ligne1: '',
      ville: '',
      pays: 'SN',
      nom_dirigeant: '',
      fonction_dirigeant: '',
      regime_imposition: 'REEL_NORMAL',
      secteur_activite: 'SERVICES',
      chiffre_affaires_annuel: 0,
      devise_principale: 'XOF',
    },
  })

  // Charger les données de l'entreprise quand elles sont disponibles
  useEffect(() => {
    if (entreprises && entreprises.length > 0) {
      const entreprise = entreprises[0]
      setEntrepriseId(entreprise.id)

      console.log('📤 Loading entreprise data from backend:', entreprise)

      // Remplir le formulaire avec les données du backend
      reset({
        raison_sociale: entreprise.raison_sociale || '',
        forme_juridique: entreprise.forme_juridique || 'SARL',
        numero_contribuable: entreprise.numero_contribuable || '',
        email: entreprise.email || '',
        adresse_ligne1: entreprise.adresse_ligne1 || entreprise.adresse || '',
        ville: entreprise.ville || '',
        pays: entreprise.pays || 'SN',
        nom_dirigeant: entreprise.nom_dirigeant || '',
        fonction_dirigeant: entreprise.fonction_dirigeant || '',
        regime_imposition: entreprise.regime_imposition || 'REEL_NORMAL',
        secteur_activite: entreprise.secteur_activite || 'SERVICES',
        chiffre_affaires_annuel: entreprise.chiffre_affaires_annuel || 0,
        devise_principale: entreprise.devise_principale || 'XOF',
        rccm: entreprise.rccm,
        ifu: entreprise.ifu,
      })
    }
  }, [entreprises, reset])

  const chiffre_affaires = watch('chiffre_affaires_annuel')
  const secteur = watch('secteur_activite')

  // Déterminer le type de liasse recommandé
  const getTypeLiasseRecommande = () => {
    if (secteur === 'BANQUE') return 'BANQUE'
    if (secteur === 'ASSURANCE') return 'ASSURANCE'
    if (secteur === 'MICROFINANCE') return 'MICROFINANCE'
    if (chiffre_affaires > 100_000_000) return 'SN'
    if (chiffre_affaires < 30_000_000) return 'SMT'
    return 'SA'
  }

  const getTypeLiasseLabel = (type: string) => {
    const labels = {
      'SN': 'Système Normal',
      'SA': 'Système Allégé',
      'SMT': 'Système Minimal de Trésorerie',
      'BANQUE': 'États Bancaires',
      'ASSURANCE': 'États Assurances',
      'MICROFINANCE': 'États Microfinance',
    }
    return labels[type as keyof typeof labels] || type
  }

  const onSubmit = async (data: EntrepriseFormData) => {
    try {
      setIsLoading(true)
      console.log('📤 Saving entreprise data to backend...')

      if (entrepriseId) {
        // Mise à jour de l'entreprise existante
        await entrepriseService.updateEntreprise(entrepriseId, data)
        console.log('✅ Entreprise updated successfully')
      } else {
        // Création d'une nouvelle entreprise
        const newEntreprise = await entrepriseService.createEntreprise(data)
        setEntrepriseId(newEntreprise.id)
        console.log('✅ Entreprise created successfully')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('❌ Error saving entreprise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {loadingEntreprises && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loadingEntreprises && success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Paramètres de l'entreprise sauvegardés avec succès !
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Informations de base */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Informations de Base"
                avatar={<Business color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Controller
                      name="raison_sociale"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Raison Sociale"
                          error={!!errors.raison_sociale}
                          helperText={errors.raison_sociale?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="forme_juridique"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.forme_juridique}>
                          <InputLabel>Forme Juridique</InputLabel>
                          <Select {...field} label="Forme Juridique">
                            {formes_juridiques.map(forme => (
                              <MenuItem key={forme.value} value={forme.value}>
                                {forme.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="numero_contribuable"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Numéro Contribuable"
                          error={!!errors.numero_contribuable}
                          helperText={errors.numero_contribuable?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="rccm"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="RCCM"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="ifu"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="IFU"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommandation type de liasse */}
          <Grid item xs={12}>
            <Alert 
              severity="info" 
              icon={<AccountBalance />}
              action={
                <Chip
                  label={getTypeLiasseLabel(getTypeLiasseRecommande())}
                  color="primary"
                />
              }
            >
              <strong>Type de liasse recommandé :</strong> Basé sur votre CA de{' '}
              {chiffre_affaires?.toLocaleString()} FCFA et votre secteur {secteur}, 
              nous recommandons le type <strong>{getTypeLiasseLabel(getTypeLiasseRecommande())}</strong>
            </Alert>
          </Grid>

          {/* Paramètres fiscaux */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Paramètres Fiscaux"
                avatar={<AccountBalance color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="regime_imposition"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.regime_imposition}>
                          <InputLabel>Régime d'Imposition</InputLabel>
                          <Select {...field} label="Régime d'Imposition">
                            {regimes_imposition.map(regime => (
                              <MenuItem key={regime.value} value={regime.value}>
                                {regime.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="secteur_activite"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.secteur_activite}>
                          <InputLabel>Secteur d'Activité</InputLabel>
                          <Select {...field} label="Secteur d'Activité">
                            {secteurs_activite.map(secteur => (
                              <MenuItem key={secteur.value} value={secteur.value}>
                                {secteur.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="chiffre_affaires_annuel"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Chiffre d'Affaires Annuel (FCFA)"
                          type="number"
                          error={!!errors.chiffre_affaires_annuel}
                          helperText={errors.chiffre_affaires_annuel?.message}
                          InputProps={{
                            endAdornment: 'FCFA',
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="devise_principale"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Devise Principale</InputLabel>
                          <Select {...field} label="Devise Principale">
                            <MenuItem value="XOF">XOF - Franc CFA UEMOA</MenuItem>
                            <MenuItem value="XAF">XAF - Franc CFA CEMAC</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                            <MenuItem value="USD">USD - Dollar US</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Adresse */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Adresse"
                avatar={<LocationOn color="primary" />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="adresse_ligne1"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Adresse"
                          error={!!errors.adresse_ligne1}
                          helperText={errors.adresse_ligne1?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="adresse_ligne2"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Complément d'adresse"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Controller
                      name="ville"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Ville"
                          error={!!errors.ville}
                          helperText={errors.ville?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Controller
                      name="code_postal"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Code Postal"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="pays"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.pays}>
                          <InputLabel>Pays</InputLabel>
                          <Select {...field} label="Pays">
                            {pays_ohada.map(pays => (
                              <MenuItem key={pays.value} value={pays.value}>
                                {pays.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Contact"
                avatar={<Person color="primary" />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="telephone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Téléphone"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="site_web"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Site Web"
                          type="url"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="nom_dirigeant"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Nom du Dirigeant"
                          error={!!errors.nom_dirigeant}
                          helperText={errors.nom_dirigeant?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="fonction_dirigeant"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Fonction"
                          error={!!errors.fonction_dirigeant}
                          helperText={errors.fonction_dirigeant?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isDirty || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default EntrepriseSettings