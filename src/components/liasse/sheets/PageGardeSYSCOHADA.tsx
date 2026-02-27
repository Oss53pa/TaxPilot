/**
 * Page de Garde - Liasse Fiscale SYSCOHADA
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
  Divider,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  AssignmentTurnedIn as ValidIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Error as ErrorIcon,
  Description as DocIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
} from '@mui/icons-material'
import { useLiasseData } from '../DataProvider'
import { entrepriseService } from '../../../services/entrepriseService'

interface PageGardeData {
  // Informations générales
  exerciceComptable: string
  dateDebut: string
  dateFin: string
  dureeExercice: number
  
  // Entreprise
  raisonSociale: string
  formeJuridique: string
  numeroRCCM: string
  numeroIFU: string
  adresseSiege: string
  ville: string
  pays: string
  telephone: string
  email: string
  
  // Informations fiscales
  regimeFiscal: string
  centreImpots: string
  numeroComptable: string
  dateDepot: string
  
  // Système comptable
  systemeComptable: string
  monnaie: string
  methodeEvaluation: string
  
  // Documents joints
  documentsJoints: {
    bilan: boolean
    compteResultat: boolean
    tft: boolean
    notes: boolean
    rapportCAC: boolean
    rapportGestion: boolean
    pv: boolean
  }
  
  // Déclarant
  nomDeclarant: string
  qualiteDeclarant: string
  telephoneDeclarant: string
  emailDeclarant: string
  
  // Expert comptable
  cabinetExpert: string
  numeroOECCA: string
  adresseExpert: string
  telephoneExpert: string
}

const PageGardeSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const liasseData = useLiasseData()
  const [data, setData] = useState<PageGardeData>({
    exerciceComptable: new Date().getFullYear().toString(),
    dateDebut: `${new Date().getFullYear()}-01-01`,
    dateFin: `${new Date().getFullYear()}-12-31`,
    dureeExercice: 12,
    raisonSociale: '',
    formeJuridique: 'SA',
    numeroRCCM: '',
    numeroIFU: '',
    adresseSiege: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    regimeFiscal: 'RNI',
    centreImpots: '',
    numeroComptable: '',
    dateDepot: new Date().toISOString().split('T')[0],
    systemeComptable: 'SYSCOHADA',
    monnaie: 'XOF',
    methodeEvaluation: 'Coût historique',
    documentsJoints: {
      bilan: true,
      compteResultat: true,
      tft: true,
      notes: true,
      rapportCAC: false,
      rapportGestion: false,
      pv: false
    },
    nomDeclarant: '',
    qualiteDeclarant: 'Directeur Général',
    telephoneDeclarant: '',
    emailDeclarant: '',
    cabinetExpert: '',
    numeroOECCA: '',
    adresseExpert: '',
    telephoneExpert: ''
  })

  // Charger les données entreprise depuis la config
  useEffect(() => {
    const ent = liasseData?.entreprise
    if (ent) {
      setData(prev => ({
        ...prev,
        raisonSociale: ent.raison_sociale || prev.raisonSociale,
        formeJuridique: ent.forme_juridique || prev.formeJuridique,
        numeroRCCM: ent.rccm || prev.numeroRCCM,
        numeroIFU: ent.numero_contribuable || ent.ifu || prev.numeroIFU,
        adresseSiege: ent.adresse_ligne1 || prev.adresseSiege,
        ville: ent.ville || prev.ville,
        pays: ent.pays_detail?.nom || ent.pays || prev.pays,
        telephone: ent.telephone || prev.telephone,
        email: ent.email || prev.email,
        regimeFiscal: ent.regime_imposition || prev.regimeFiscal,
        centreImpots: ent.centre_impots || prev.centreImpots,
        monnaie: ent.devise_principale || prev.monnaie,
        nomDeclarant: ent.nom_dirigeant || prev.nomDeclarant,
        qualiteDeclarant: ent.fonction_dirigeant || prev.qualiteDeclarant,
        emailDeclarant: ent.email_dirigeant || prev.emailDeclarant,
      }))
    }
  }, [liasseData?.entreprise])

  const handleFieldChange = (field: keyof PageGardeData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Calculer la durée de l'exercice
      if (field === 'dateDebut' || field === 'dateFin') {
        const start = new Date(newData.dateDebut)
        const end = new Date(newData.dateFin)
        const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
        newData.dureeExercice = months
      }
      
      return newData
    })
  }

  const handleDocumentToggle = (doc: keyof typeof data.documentsJoints) => {
    setData(prev => ({
      ...prev,
      documentsJoints: {
        ...prev.documentsJoints,
        [doc]: !prev.documentsJoints[doc]
      }
    }))
  }

  const handleSave = () => {
    console.log('Sauvegarde Page de Garde:', data)
  }

  const handlePrint = () => {
    window.print()
  }

  // Validation
  const isValid = data.raisonSociale && data.numeroRCCM && data.numeroIFU && data.nomDeclarant

  return (
    <Box>
      {/* En-tête officiel */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          mb: 3,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center',
          borderRadius: 2,
          '@media print': {
            backgroundColor: 'transparent',
            color: 'black',
            border: '2px solid black'
          }
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          ÉTATS FINANCIERS ANNUELS
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          SYSTÈME COMPTABLE OHADA
        </Typography>
        <Typography variant="h5">
          EXERCICE CLOS LE {new Date(data.dateFin).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }).toUpperCase()}
        </Typography>
      </Paper>

      {/* Informations de l'entreprise */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            IDENTIFICATION DE L'ENTREPRISE
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Raison sociale"
              value={data.raisonSociale}
              onChange={(e) => handleFieldChange('raisonSociale', e.target.value)}
              required
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
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
                <MenuItem value="GIE">GIE - Groupement d'Intérêt Économique</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° RCCM"
              value={data.numeroRCCM}
              onChange={(e) => handleFieldChange('numeroRCCM', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° IFU"
              value={data.numeroIFU}
              onChange={(e) => handleFieldChange('numeroIFU', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° Comptable"
              value={data.numeroComptable}
              onChange={(e) => handleFieldChange('numeroComptable', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse du siège social"
              value={data.adresseSiege}
              onChange={(e) => handleFieldChange('adresseSiege', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Ville"
              value={data.ville}
              onChange={(e) => handleFieldChange('ville', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
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
                <MenuItem value="Mali">Mali</MenuItem>
                <MenuItem value="Niger">Niger</MenuItem>
                <MenuItem value="Sénégal">Sénégal</MenuItem>
                <MenuItem value="Togo">Togo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Téléphone"
              value={data.telephone}
              onChange={(e) => handleFieldChange('telephone', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Informations sur l'exercice */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <CalendarIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            EXERCICE COMPTABLE
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Exercice"
              value={data.exerciceComptable}
              onChange={(e) => handleFieldChange('exerciceComptable', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date début"
              type="date"
              value={data.dateDebut}
              onChange={(e) => handleFieldChange('dateDebut', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date fin"
              type="date"
              value={data.dateFin}
              onChange={(e) => handleFieldChange('dateFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Durée (mois)"
              value={data.dureeExercice}
              disabled
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  color: theme.palette.text.primary,
                  WebkitTextFillColor: theme.palette.text.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Régime fiscal</InputLabel>
              <Select
                value={data.regimeFiscal}
                onChange={(e) => handleFieldChange('regimeFiscal', e.target.value)}
                label="Régime fiscal"
              >
                <MenuItem value="RNI">Régime Normal d'Imposition</MenuItem>
                <MenuItem value="RSI">Régime Simplifié d'Imposition</MenuItem>
                <MenuItem value="RME">Régime des Micro-Entreprises</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Centre des impôts"
              value={data.centreImpots}
              onChange={(e) => handleFieldChange('centreImpots', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date de dépôt"
              type="date"
              value={data.dateDepot}
              onChange={(e) => handleFieldChange('dateDepot', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Documents joints */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <DocIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                DOCUMENTS JOINTS
              </Typography>
            </Stack>

            <List>
              {Object.entries({
                bilan: 'Bilan',
                compteResultat: 'Compte de résultat',
                tft: 'Tableau de flux de trésorerie',
                notes: 'Notes annexes',
                rapportCAC: 'Rapport du Commissaire aux Comptes',
                rapportGestion: 'Rapport de gestion',
                pv: 'PV d\'Assemblée Générale'
              }).map(([key, label]) => (
                <ListItem 
                  key={key}
                  button
                  onClick={() => handleDocumentToggle(key as keyof typeof data.documentsJoints)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: data.documentsJoints[key as keyof typeof data.documentsJoints] 
                      ? alpha(theme.palette.success.main, 0.1) 
                      : 'transparent'
                  }}
                >
                  <ListItemIcon>
                    {data.documentsJoints[key as keyof typeof data.documentsJoints] ? (
                      <CheckIcon color="success" />
                    ) : (
                      <UncheckedIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Déclarant */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <GroupIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                DÉCLARANT
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom et prénoms"
                  value={data.nomDeclarant}
                  onChange={(e) => handleFieldChange('nomDeclarant', e.target.value)}
                  required
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Qualité</InputLabel>
                  <Select
                    value={data.qualiteDeclarant}
                    onChange={(e) => handleFieldChange('qualiteDeclarant', e.target.value)}
                    label="Qualité"
                  >
                    <MenuItem value="Directeur Général">Directeur Général</MenuItem>
                    <MenuItem value="Gérant">Gérant</MenuItem>
                    <MenuItem value="Président">Président</MenuItem>
                    <MenuItem value="Administrateur">Administrateur</MenuItem>
                    <MenuItem value="Expert Comptable">Expert Comptable</MenuItem>
                    <MenuItem value="Comptable">Comptable</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={data.telephoneDeclarant}
                  onChange={(e) => handleFieldChange('telephoneDeclarant', e.target.value)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={data.emailDeclarant}
                  onChange={(e) => handleFieldChange('emailDeclarant', e.target.value)}
                  type="email"
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Signature */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Signature et cachet
              </Typography>
              <Box sx={{ 
                height: 80, 
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 1,
                mt: 1
              }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Validation et actions */}
      <Paper elevation={0} sx={{ p: 3, mt: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            {isValid ? (
              <Alert severity="success" icon={<ValidIcon />}>
                Page de garde complète et prête pour l'impression
              </Alert>
            ) : (
              <Alert severity="warning" icon={<ErrorIcon />}>
                Veuillez remplir tous les champs obligatoires
              </Alert>
            )}
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimer
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
            >
              Exporter PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              color="success"
            >
              Enregistrer
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default PageGardeSYSCOHADA