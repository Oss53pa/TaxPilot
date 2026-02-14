/**
 * Composant de paramétrage de l'entreprise
 * Formulaire organisé en onglets (Tabs)
 * Inclut les données pour les fiches R1, R2, R3 de la liasse fiscale
 */

import React, { useState, useEffect } from 'react'
import { entrepriseService } from '@/services'
import { useBackendData } from '@/hooks/useBackendData'
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  InputAdornment,
} from '@mui/material'
import {
  Save,
  Business,
  LocationOn,
  Person,
  AccountBalance,
  CalendarToday,
  Group,
  ShowChart,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { EntrepriseFormData, DirigeantEntry, CommissaireEntry, ParticipationEntry } from '@/types'

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

const QUALITES_DIRIGEANT = [
  'Président Conseil d\'Administration',
  'Directeur Général',
  'Directeur Général Délégué',
  'Administrateur',
  'Gérant',
  'Associé-Gérant',
  'Président du Directoire',
  'Autre'
]

const MODES_ACQUISITION = [
  'Apport en nature',
  'Apport en numéraire',
  'Achat',
  'Fusion-acquisition',
  'Augmentation de capital',
  'Autre'
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

// Helpers pour créer des entrées vides
function emptyDirigeant(): DirigeantEntry {
  return {
    id: Date.now().toString(),
    qualite: '', nom: '', prenoms: '', adresse: '', telephone: '', email: '',
    date_nomination: '', duree_mandat: '', remunerations: 0, avantages_nature: '', observations: ''
  }
}

function emptyCommissaire(): CommissaireEntry {
  return {
    id: Date.now().toString(),
    nom: '', prenoms: '', cabinet: '', adresse: '', telephone: '', email: '',
    numero_ordre: '', date_nomination: '', duree_mandat: '', honoraires: 0, autres_prestations: 0, observations: ''
  }
}

function emptyParticipation(): ParticipationEntry {
  return {
    id: Date.now().toString(),
    raison_sociale: '', forme_juridique: '', secteur_activite: '', adresse: '',
    telephone: '', email: '', numero_rccm: '', capital: 0, pourcentage_participation: 0,
    nombre_titres: 0, valeur_nominale: 0, valeur_comptable: 0, valeur_marche: 0,
    dividendes_recus: 0, date_acquisition: '', mode_acquisition: '', observations: ''
  }
}

const EntrepriseSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [entrepriseId, setEntrepriseId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  // State for array data (R2/R3)
  const [dirigeants, setDirigeants] = useState<DirigeantEntry[]>([emptyDirigeant()])
  const [commissaires, setCommissaires] = useState<CommissaireEntry[]>([emptyCommissaire()])
  const [participations, setParticipations] = useState<ParticipationEntry[]>([emptyParticipation()])

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
    resolver: yupResolver(entrepriseSchema) as any,
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
      capital_social: 0,
      numero_comptable: '',
      centre_impots: '',
      exercice_debut: `${new Date().getFullYear()}-01-01`,
      exercice_fin: `${new Date().getFullYear()}-12-31`,
      date_depot: '',
      email_dirigeant: '',
      telephone_dirigeant: '',
      nombre_etablissements: 1,
      effectif_permanent: 0,
      effectif_temporaire: 0,
      masse_salariale: 0,
      nom_groupe: '',
      pays_siege_groupe: '',
      cac_nom: '',
      cac_adresse: '',
      cac_numero_inscription: '',
      expert_nom: '',
      expert_adresse: '',
      expert_numero_inscription: '',
    } as any,
  })

  // Charger les données de l'entreprise quand elles sont disponibles
  useEffect(() => {
    if (entreprises && entreprises.length > 0) {
      const entreprise = entreprises[0]
      setEntrepriseId(entreprise.id)

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
        capital_social: entreprise.capital_social || 0,
        numero_comptable: entreprise.numero_comptable || '',
        centre_impots: entreprise.centre_impots || '',
        exercice_debut: entreprise.exercice_debut || `${new Date().getFullYear()}-01-01`,
        exercice_fin: entreprise.exercice_fin || `${new Date().getFullYear()}-12-31`,
        date_depot: entreprise.date_depot || '',
        email_dirigeant: entreprise.email_dirigeant || '',
        telephone_dirigeant: entreprise.telephone_dirigeant || '',
        nombre_etablissements: entreprise.nombre_etablissements || 1,
        effectif_permanent: entreprise.effectif_permanent || 0,
        effectif_temporaire: entreprise.effectif_temporaire || 0,
        masse_salariale: entreprise.masse_salariale || 0,
        nom_groupe: entreprise.nom_groupe || '',
        pays_siege_groupe: entreprise.pays_siege_groupe || '',
        cac_nom: entreprise.cac_nom || '',
        cac_adresse: entreprise.cac_adresse || '',
        cac_numero_inscription: entreprise.cac_numero_inscription || '',
        expert_nom: entreprise.expert_nom || '',
        expert_adresse: entreprise.expert_adresse || '',
        expert_numero_inscription: entreprise.expert_numero_inscription || '',
      })

      // Load array data
      if (entreprise.dirigeants?.length) setDirigeants(entreprise.dirigeants)
      if (entreprise.commissaires_comptes?.length) setCommissaires(entreprise.commissaires_comptes)
      if (entreprise.participations_filiales?.length) setParticipations(entreprise.participations_filiales)
    }
  }, [entreprises, reset])

  const chiffre_affaires = watch('chiffre_affaires_annuel')
  const secteur = watch('secteur_activite')

  const getTypeLiasseRecommande = () => {
    if (secteur === 'BANQUE') return 'BANQUE'
    if (secteur === 'ASSURANCE') return 'ASSURANCE'
    if (secteur === 'MICROFINANCE') return 'MICROFINANCE'
    if (secteur === 'EBNL' || secteur === 'ASBL' || secteur === 'ASSOCIATION') return 'EBNL'
    if (chiffre_affaires >= 60_000_000) return 'SN'
    return 'SMT'
  }

  const getTypeLiasseLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SN': 'Système Normal (CA >= 60M FCFA)',
      'SMT': 'Système Minimal de Trésorerie (CA < 60M FCFA)',
      'BANQUE': 'États Bancaires (PCEC/PCB)',
      'ASSURANCE': 'États Assurances (CIMA)',
      'MICROFINANCE': 'États Microfinance (SFD)',
      'EBNL': 'États EBNL/ASBL (SYCEBNL)',
      'CONSO': 'Consolidation',
    }
    return labels[type] || type
  }

  const onSubmit = async (data: EntrepriseFormData) => {
    try {
      setIsLoading(true)
      const payload = {
        ...data,
        dirigeants,
        commissaires_comptes: commissaires,
        participations_filiales: participations,
      }

      if (entrepriseId) {
        await entrepriseService.updateEntreprise(entrepriseId, payload as any)
      } else {
        const newEntreprise = await entrepriseService.createEntreprise(payload as any)
        setEntrepriseId(newEntreprise.id)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Error saving entreprise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Tab error counts
  const tabErrors = {
    0: ['raison_sociale', 'forme_juridique', 'numero_contribuable'].filter(f => !!(errors as any)[f]).length,
    1: ['regime_imposition', 'secteur_activite', 'chiffre_affaires_annuel', 'devise_principale'].filter(f => !!(errors as any)[f]).length,
    2: ['adresse_ligne1', 'ville', 'pays'].filter(f => !!(errors as any)[f]).length,
    3: ['email', 'nom_dirigeant', 'fonction_dirigeant'].filter(f => !!(errors as any)[f]).length,
    4: 0, 5: 0, 6: 0,
  }

  const tabLabel = (label: string, icon: React.ReactElement, tabIndex: number) => {
    const count = tabErrors[tabIndex as keyof typeof tabErrors] || 0
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <span>{label}</span>
        {count > 0 && (
          <Chip size="small" label={count} color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
        )}
      </Box>
    )
  }

  // --- Dirigeant handlers ---
  const handleDirigeantChange = (id: string, field: keyof DirigeantEntry, value: any) => {
    setDirigeants(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  const addDirigeant = () => setDirigeants(prev => [...prev, emptyDirigeant()])
  const removeDirigeant = (id: string) => {
    if (dirigeants.length > 1) setDirigeants(prev => prev.filter(d => d.id !== id))
  }

  // --- Commissaire handlers ---
  const handleCommissaireChange = (id: string, field: keyof CommissaireEntry, value: any) => {
    setCommissaires(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }
  const addCommissaire = () => setCommissaires(prev => [...prev, emptyCommissaire()])
  const removeCommissaire = (id: string) => {
    if (commissaires.length > 1) setCommissaires(prev => prev.filter(c => c.id !== id))
  }

  // --- Participation handlers ---
  const handleParticipationChange = (id: string, field: keyof ParticipationEntry, value: any) => {
    setParticipations(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  const addParticipation = () => setParticipations(prev => [...prev, emptyParticipation()])
  const removeParticipation = (id: string) => {
    if (participations.length > 1) setParticipations(prev => prev.filter(p => p.id !== id))
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
          Paramètres sauvegardés ! Les fiches de la liasse fiscale (Couverture, Page de Garde, R1, R2, R3) seront automatiquement mises à jour.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label={tabLabel('Identification', <Business fontSize="small" />, 0)} />
            <Tab label={tabLabel('Fiscalité & Exercice', <AccountBalance fontSize="small" />, 1)} />
            <Tab label={tabLabel('Adresse', <LocationOn fontSize="small" />, 2)} />
            <Tab label={tabLabel('Contact & Dirigeant', <Person fontSize="small" />, 3)} />
            <Tab label={tabLabel('Effectifs & Groupe', <Group fontSize="small" />, 4)} />
            <Tab label={tabLabel('Dirigeants & CAC', <Person fontSize="small" />, 5)} />
            <Tab label={tabLabel('Participations', <ShowChart fontSize="small" />, 6)} />
          </Tabs>

          <CardContent>
            {/* ─── Tab 0 : Identification ─── */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Controller name="raison_sociale" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Raison Sociale" error={!!errors.raison_sociale} helperText={errors.raison_sociale?.message} />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="forme_juridique" control={control} render={({ field }) => (
                    <FormControl fullWidth error={!!errors.forme_juridique}>
                      <InputLabel>Forme Juridique</InputLabel>
                      <Select {...field} label="Forme Juridique">
                        {formes_juridiques.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="numero_contribuable" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Numéro Contribuable" error={!!errors.numero_contribuable} helperText={errors.numero_contribuable?.message} />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="rccm" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="RCCM" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="ifu" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="IFU" />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="capital_social" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Capital Social (FCFA)" type="number" InputProps={{ endAdornment: 'FCFA' }} />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="numero_comptable" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="N° Comptable" />
                  )} />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ─── Tab 1 : Fiscalité & Exercice ─── */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<AccountBalance />}
                    action={<Chip label={getTypeLiasseLabel(getTypeLiasseRecommande())} color="primary" />}>
                    <strong>Type de liasse recommandé :</strong> Basé sur votre CA de{' '}
                    {chiffre_affaires?.toLocaleString()} et votre secteur {secteur},
                    nous recommandons le type <strong>{getTypeLiasseLabel(getTypeLiasseRecommande())}</strong>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="regime_imposition" control={control} render={({ field }) => (
                    <FormControl fullWidth error={!!errors.regime_imposition}>
                      <InputLabel>Régime d'Imposition</InputLabel>
                      <Select {...field} label="Régime d'Imposition">
                        {regimes_imposition.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="secteur_activite" control={control} render={({ field }) => (
                    <FormControl fullWidth error={!!errors.secteur_activite}>
                      <InputLabel>Secteur d'Activité</InputLabel>
                      <Select {...field} label="Secteur d'Activité">
                        {secteurs_activite.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="chiffre_affaires_annuel" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Chiffre d'Affaires Annuel (FCFA)" type="number"
                      error={!!errors.chiffre_affaires_annuel} helperText={errors.chiffre_affaires_annuel?.message}
                      InputProps={{ endAdornment: 'FCFA' }} />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="devise_principale" control={control} render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Devise Principale</InputLabel>
                      <Select {...field} label="Devise Principale">
                        <MenuItem value="XOF">XOF - Franc CFA UEMOA</MenuItem>
                        <MenuItem value="XAF">XAF - Franc CFA CEMAC</MenuItem>
                        <MenuItem value="EUR">EUR - Euro</MenuItem>
                        <MenuItem value="USD">USD - Dollar US</MenuItem>
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="centre_impots" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Centre des Impôts" />
                  )} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 0.5 }}>
                    <CalendarToday fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Exercice Comptable</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="exercice_debut" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Date de début" type="date" InputLabelProps={{ shrink: true }} />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="exercice_fin" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Date de fin" type="date" InputLabelProps={{ shrink: true }} />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Durée (mois)" value={(() => {
                    const debut = watch('exercice_debut'); const fin = watch('exercice_fin')
                    if (debut && fin) {
                      const d = new Date(debut); const f = new Date(fin)
                      const m = (f.getFullYear() - d.getFullYear()) * 12 + (f.getMonth() - d.getMonth()) + (f.getDate() >= d.getDate() ? 1 : 0)
                      return m > 0 ? m : ''
                    }
                    return ''
                  })()} InputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="date_depot" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Date de dépôt" type="date" InputLabelProps={{ shrink: true }} />
                  )} />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ─── Tab 2 : Adresse ─── */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller name="adresse_ligne1" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Adresse" error={!!errors.adresse_ligne1} helperText={errors.adresse_ligne1?.message} />
                  )} />
                </Grid>
                <Grid item xs={12}>
                  <Controller name="adresse_ligne2" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Complément d'adresse" />
                  )} />
                </Grid>
                <Grid item xs={8}>
                  <Controller name="ville" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Ville" error={!!errors.ville} helperText={errors.ville?.message} />
                  )} />
                </Grid>
                <Grid item xs={4}>
                  <Controller name="code_postal" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Code Postal" />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="pays" control={control} render={({ field }) => (
                    <FormControl fullWidth error={!!errors.pays}>
                      <InputLabel>Pays</InputLabel>
                      <Select {...field} label="Pays">
                        {pays_ohada.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ─── Tab 3 : Contact & Dirigeant ─── */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}><Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Contact de l'entreprise</Typography></Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="email" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="telephone" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Téléphone" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="site_web" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Site Web" type="url" />
                  )} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 0.5 }}>
                    <Person fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dirigeant / Déclarant</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="nom_dirigeant" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nom du Dirigeant" error={!!errors.nom_dirigeant} helperText={errors.nom_dirigeant?.message} />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="fonction_dirigeant" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Fonction" error={!!errors.fonction_dirigeant} helperText={errors.fonction_dirigeant?.message} />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="email_dirigeant" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Email du Déclarant" type="email" />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="telephone_dirigeant" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Téléphone du Déclarant" />
                  )} />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ─── Tab 4 : Effectifs & Groupe (R1 sections 5-6) ─── */}
            <TabPanel value={activeTab} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Effectifs et Masse Salariale</Typography></Grid>
                <Grid item xs={12} md={3}>
                  <Controller name="nombre_etablissements" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nombre d'établissements" type="number" />
                  )} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller name="effectif_permanent" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Effectif permanent" type="number" />
                  )} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller name="effectif_temporaire" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Effectif temporaire" type="number" />
                  )} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Effectif total" value={(watch('effectif_permanent') || 0) + (watch('effectif_temporaire') || 0)}
                    InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="masse_salariale" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Masse salariale annuelle" type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">FCFA</InputAdornment> }} />
                  )} />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Appartenance à un Groupe</Typography></Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="nom_groupe" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nom du groupe (si applicable)" />
                  )} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller name="pays_siege_groupe" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Pays du siège social du groupe" />
                  )} />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Commissaire aux Comptes (CAC)</Typography></Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="cac_nom" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nom du CAC" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="cac_adresse" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Adresse du CAC" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="cac_numero_inscription" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="N° Inscription CAC" />
                  )} />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Expert Comptable</Typography></Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="expert_nom" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nom / Cabinet" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="expert_adresse" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Adresse" />
                  )} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="expert_numero_inscription" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="N° OECCA" />
                  )} />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ─── Tab 5 : Dirigeants & CAC (R2) ─── */}
            <TabPanel value={activeTab} index={5}>
              {/* Dirigeants */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dirigeants Sociaux (Fiche R2)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addDirigeant}>Ajouter</Button>
              </Stack>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Qualité</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prénoms</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Rémunérations</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dirigeants.map(d => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select value={d.qualite} onChange={e => handleDirigeantChange(d.id, 'qualite', e.target.value)}>
                              {QUALITES_DIRIGEANT.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={d.nom} onChange={e => handleDirigeantChange(d.id, 'nom', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={d.prenoms} onChange={e => handleDirigeantChange(d.id, 'prenoms', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={d.adresse} onChange={e => handleDirigeantChange(d.id, 'adresse', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={d.telephone} onChange={e => handleDirigeantChange(d.id, 'telephone', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={d.remunerations}
                            onChange={e => handleDirigeantChange(d.id, 'remunerations', parseFloat(e.target.value) || 0)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeDirigeant(d.id)} disabled={dirigeants.length <= 1}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Commissaires aux comptes */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Commissaires aux Comptes</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addCommissaire}>Ajouter</Button>
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prénoms</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cabinet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>N° Ordre</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Honoraires</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissaires.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <TextField size="small" value={c.nom} onChange={e => handleCommissaireChange(c.id, 'nom', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={c.prenoms} onChange={e => handleCommissaireChange(c.id, 'prenoms', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={c.cabinet} onChange={e => handleCommissaireChange(c.id, 'cabinet', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={c.numero_ordre} onChange={e => handleCommissaireChange(c.id, 'numero_ordre', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={c.honoraires}
                            onChange={e => handleCommissaireChange(c.id, 'honoraires', parseFloat(e.target.value) || 0)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeCommissaire(c.id)} disabled={commissaires.length <= 1}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* ─── Tab 6 : Participations (R3) ─── */}
            <TabPanel value={activeTab} index={6}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Participations et Filiales (Fiche R3)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addParticipation}>Ajouter</Button>
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Raison sociale</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Forme jur.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>N° RCCM</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Capital</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>% Particip.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Val. comptable</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Dividendes</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participations.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <TextField size="small" value={p.raison_sociale}
                            onChange={e => handleParticipationChange(p.id, 'raison_sociale', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select value={p.forme_juridique} onChange={e => handleParticipationChange(p.id, 'forme_juridique', e.target.value)}>
                              {formes_juridiques.map(f => <MenuItem key={f.value} value={f.value}>{f.value}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={p.numero_rccm}
                            onChange={e => handleParticipationChange(p.id, 'numero_rccm', e.target.value)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={p.capital}
                            onChange={e => handleParticipationChange(p.id, 'capital', parseFloat(e.target.value) || 0)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={p.pourcentage_participation}
                            onChange={e => handleParticipationChange(p.id, 'pourcentage_participation', parseFloat(e.target.value) || 0)}
                            fullWidth InputProps={{ endAdornment: '%' }} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={p.valeur_comptable}
                            onChange={e => handleParticipationChange(p.id, 'valeur_comptable', parseFloat(e.target.value) || 0)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={p.dividendes_recus}
                            onChange={e => handleParticipationChange(p.id, 'dividendes_recus', parseFloat(e.target.value) || 0)} fullWidth />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeParticipation(p.id)} disabled={participations.length <= 1}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Actions — toujours visible */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" disabled={isLoading}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default EntrepriseSettings
