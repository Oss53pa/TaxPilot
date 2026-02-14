/**
 * Page de Recevabilité - Critères de recevabilité de la déclaration
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Gavel,
  AccountBalance,
  Assignment,
  Security,
  Schedule,
  Person,
  Business,
} from '@mui/icons-material'

const Recevabilite: React.FC = () => {
  const theme = useTheme()
  const [criteresRespected, setCriteresRespected] = useState({
    delaiDepot: true,
    documentsComplets: true,
    signaturesPresentes: true,
    informationsCorrectes: true,
    paiementsDroits: true,
    annexesJointes: false,
    cacCertification: true,
    coherenceComptable: true,
  })

  const [typeDeclaration, setTypeDeclaration] = useState('normale')
  const [regimeFiscal, setRegimeFiscal] = useState('rsi')

  const criteresRecevabilite = [
    {
      id: 'delaiDepot',
      libelle: 'Respect des délais de dépôt',
      description: 'Déclaration déposée dans les délais réglementaires (avant le 30 avril)',
      obligatoire: true,
      icon: <Schedule />,
      details: 'Délai légal : 30 avril pour les entreprises clôturant au 31 décembre'
    },
    {
      id: 'documentsComplets',
      libelle: 'Complétude des documents',
      description: 'Tous les états et documents requis sont présents',
      obligatoire: true,
      icon: <Assignment />,
      details: 'États financiers, notes annexes, fiches de renseignements'
    },
    {
      id: 'signaturesPresentes',
      libelle: 'Signatures requises',
      description: 'Signatures du dirigeant et du commissaire aux comptes',
      obligatoire: true,
      icon: <Person />,
      details: 'Dirigeant et CAC doivent signer tous les documents'
    },
    {
      id: 'informationsCorrectes',
      libelle: 'Cohérence des informations',
      description: 'Informations cohérentes entre tous les documents',
      obligatoire: true,
      icon: <CheckCircle />,
      details: 'Vérification croisée des montants et informations'
    },
    {
      id: 'paiementsDroits',
      libelle: 'Paiement des droits',
      description: 'Droits d\'enregistrement et taxes acquittés',
      obligatoire: true,
      icon: <AccountBalance />,
      details: 'Preuve de paiement des droits d\'enregistrement'
    },
    {
      id: 'annexesJointes',
      libelle: 'Annexes spécialisées',
      description: 'Documents annexes spécifiques à l\'activité (si requis)',
      obligatoire: false,
      icon: <Business />,
      details: 'Selon le secteur d\'activité de l\'entreprise'
    },
    {
      id: 'cacCertification',
      libelle: 'Certification CAC',
      description: 'Rapport du commissaire aux comptes (si applicable)',
      obligatoire: true,
      icon: <Security />,
      details: 'Obligation pour les SA et entreprises dépassant les seuils'
    },
    {
      id: 'coherenceComptable',
      libelle: 'Équilibre comptable',
      description: 'Équilibre bilan et cohérence des états financiers',
      obligatoire: true,
      icon: <Gavel />,
      details: 'Total actif = Total passif, cohérence compte de résultat'
    },
  ]

  const handleCritereChange = (critere: string, value: boolean) => {
    setCriteresRespected(prev => ({ ...prev, [critere]: value }))
  }

  const criteresRespectesCount = Object.values(criteresRespected).filter(Boolean).length
  const criteresObligatoires = criteresRecevabilite.filter(c => c.obligatoire).length
  const criteresObligatoiresRespected = criteresRecevabilite.filter(c => 
    c.obligatoire && criteresRespected[c.id as keyof typeof criteresRespected]
  ).length

  const tauxConformite = (criteresRespectesCount / criteresRecevabilite.length) * 100
  const recevable = criteresObligatoiresRespected === criteresObligatoires

  const getStatutColor = () => {
    if (recevable && tauxConformite >= 90) return 'success'
    if (recevable && tauxConformite >= 70) return 'warning'
    return 'error'
  }

  const getStatutLibelle = () => {
    if (recevable && tauxConformite >= 90) return 'RECEVABLE - CONFORME'
    if (recevable && tauxConformite >= 70) return 'RECEVABLE - AMÉLIORATIONS RECOMMANDÉES'
    return 'NON RECEVABLE - CORRECTIONS REQUISES'
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Recevabilité de la Déclaration
        </Typography>
        <Typography variant="body1">
          Vérification des critères de recevabilité selon la réglementation SYSCOHADA
        </Typography>
      </Paper>

      {/* Statut global */}
      <Alert 
        severity={getStatutColor()}
        sx={{ mb: 3 }}
        icon={recevable ? <CheckCircle /> : <Error />}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {getStatutLibelle()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Conformité : {tauxConformite.toFixed(1)}% - 
          Critères obligatoires : {criteresObligatoiresRespected}/{criteresObligatoires}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={tauxConformite} 
          color={getStatutColor()}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Alert>

      {/* Type de déclaration et régime */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                  Type de déclaration
                </FormLabel>
                <RadioGroup
                  value={typeDeclaration}
                  onChange={(e) => setTypeDeclaration(e.target.value)}
                >
                  <FormControlLabel value="normale" control={<Radio />} label="Déclaration normale" />
                  <FormControlLabel value="rectificative" control={<Radio />} label="Déclaration rectificative" />
                  <FormControlLabel value="tardive" control={<Radio />} label="Déclaration tardive" />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                  Régime fiscal applicable
                </FormLabel>
                <RadioGroup
                  value={regimeFiscal}
                  onChange={(e) => setRegimeFiscal(e.target.value)}
                >
                  <FormControlLabel value="rsi" control={<Radio />} label="Régime Système Intégré (RSI)" />
                  <FormControlLabel value="rni" control={<Radio />} label="Régime Normal d'Imposition (RNI)" />
                  <FormControlLabel value="rsi-simplifie" control={<Radio />} label="RSI Simplifié" />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critères de recevabilité */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Critères de recevabilité
      </Typography>

      <Grid container spacing={3}>
        {criteresRecevabilite.map((critere) => (
          <Grid item xs={12} md={6} lg={4} key={critere.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: criteresRespected[critere.id as keyof typeof criteresRespected] 
                  ? `2px solid ${theme.palette.success.main}` 
                  : critere.obligatoire 
                    ? `2px solid ${theme.palette.error.main}`
                    : `1px solid ${theme.palette.grey[300]}`,
                backgroundColor: criteresRespected[critere.id as keyof typeof criteresRespected] 
                  ? alpha(theme.palette.success.main, 0.05)
                  : 'white'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: criteresRespected[critere.id as keyof typeof criteresRespected] 
                      ? theme.palette.success.main 
                      : critere.obligatoire 
                        ? theme.palette.error.main 
                        : theme.palette.grey[400],
                    color: 'white',
                    mr: 2
                  }}>
                    {critere.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {critere.libelle}
                    </Typography>
                    {critere.obligatoire && (
                      <Chip label="Obligatoire" color="error" size="small" />
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {critere.description}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {critere.details}
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={criteresRespected[critere.id as keyof typeof criteresRespected]}
                      onChange={(e) => handleCritereChange(critere.id, e.target.checked)}
                      color="success"
                    />
                  }
                  label="Critère respecté"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions requises */}
      {!recevable && (
        <Card sx={{ mt: 3, border: `2px solid ${theme.palette.error.main}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                Actions correctives requises
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {criteresRecevabilite.filter(c => 
                c.obligatoire && !criteresRespected[c.id as keyof typeof criteresRespected]
              ).map(critere => (
                <ListItem key={critere.id}>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={critere.libelle}
                    secondary={critere.details}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Informations complémentaires */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Informations importantes
          </Typography>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Délai de dépôt :</strong> Les déclarations doivent être déposées au plus tard le 30 avril de l'année suivant l'exercice clos.
              </Typography>
            </Alert>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Pénalités :</strong> Les déclarations tardives ou incomplètes sont passibles d'amendes fiscales selon le Code général des Impôts.
              </Typography>
            </Alert>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Aide :</strong> En cas de difficulté, contactez votre centre des impôts ou votre expert-comptable pour assistance.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Recevabilite