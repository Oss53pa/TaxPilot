/**
 * Notes annexes principales - SYSCOHADA
 */

import React, { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  useTheme,
  alpha,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ExpandMore as ExpandIcon,
  Note as NoteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  AccountBalance as AccountIcon,
  Business as BusinessIcon,
  TrendingUp as TrendIcon,
  Assessment as ReportIcon,
  MonetizationOn as MoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notes-tabpanel-${index}`}
      aria-labelledby={`notes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

// Structure des notes annexes SYSCOHADA
const NOTES_STRUCTURE = [
  {
    category: 'Principes comptables',
    notes: [
      { num: 1, title: 'Référentiel comptable et présentation des comptes', mandatory: true },
      { num: 2, title: 'Principales méthodes comptables', mandatory: true },
      { num: 3, title: 'Changements de méthodes comptables', mandatory: false },
      { num: 4, title: 'Corrections d\'erreurs', mandatory: false },
    ]
  },
  {
    category: 'Bilan',
    notes: [
      { num: 5, title: 'Immobilisations incorporelles', mandatory: false },
      { num: 6, title: 'Immobilisations corporelles', mandatory: true },
      { num: 7, title: 'Immobilisations financières', mandatory: false },
      { num: 8, title: 'Stocks', mandatory: true },
      { num: 9, title: 'Créances', mandatory: true },
      { num: 10, title: 'Trésorerie actif', mandatory: true },
      { num: 11, title: 'Capital social', mandatory: true },
      { num: 12, title: 'Réserves et report à nouveau', mandatory: true },
      { num: 13, title: 'Provisions réglementées', mandatory: false },
      { num: 14, title: 'Emprunts et dettes financières', mandatory: true },
      { num: 15, title: 'Provisions pour risques et charges', mandatory: false },
      { num: 16, title: 'Dettes circulantes', mandatory: true },
    ]
  },
  {
    category: 'Compte de résultat',
    notes: [
      { num: 17, title: 'Chiffre d\'affaires', mandatory: true },
      { num: 18, title: 'Autres produits', mandatory: false },
      { num: 19, title: 'Charges de personnel', mandatory: true },
      { num: 20, title: 'Charges financières', mandatory: true },
      { num: 21, title: 'Impôts et taxes', mandatory: true },
      { num: 22, title: 'Dotations aux amortissements', mandatory: true },
      { num: 23, title: 'Dotations aux provisions', mandatory: false },
    ]
  },
  {
    category: 'Informations sectorielles',
    notes: [
      { num: 24, title: 'Informations sectorielles', mandatory: false },
      { num: 25, title: 'Parties liées', mandatory: false },
    ]
  },
  {
    category: 'Autres informations',
    notes: [
      { num: 26, title: 'Engagements hors bilan', mandatory: true },
      { num: 27, title: 'Événements postérieurs à la clôture', mandatory: false },
      { num: 28, title: 'Gestion des risques financiers', mandatory: false },
      { num: 29, title: 'Effectifs', mandatory: true },
      { num: 30, title: 'Rémunération des dirigeants', mandatory: false },
    ]
  }
]

const NotesAnnexesSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [notesContent, setNotesContent] = useState<{[key: number]: string}>({})
  const [expandedNote, setExpandedNote] = useState<number | false>(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadNotesData()
  }, [])

  const loadNotesData = () => {
    // Charger le contenu existant des notes
    const initialContent: {[key: number]: string} = {}
    
    // Notes obligatoires avec contenu par défaut
    initialContent[1] = "Les états financiers sont établis selon le référentiel comptable SYSCOHADA révisé et les principes comptables généralement admis dans l'espace OHADA."
    initialContent[2] = "Les principales méthodes comptables appliquées sont :\n- Coût historique pour l'évaluation des actifs\n- Méthode linéaire pour les amortissements\n- Valorisation des stocks au coût moyen pondéré"
    initialContent[6] = "Les immobilisations corporelles sont évaluées au coût d'acquisition ou de production, diminué des amortissements cumulés."
    initialContent[8] = "Les stocks sont évalués au coût moyen pondéré ou au prix de marché si celui-ci est inférieur."
    initialContent[9] = "Les créances sont évaluées à leur valeur nominale. Des provisions pour dépréciation sont constituées si nécessaire."
    
    setNotesContent(initialContent)
  }

  const handleNoteChange = (noteNum: number, content: string) => {
    setNotesContent(prev => ({
      ...prev,
      [noteNum]: content
    }))
    setHasChanges(true)
  }

  const handleAccordionChange = (noteNum: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedNote(isExpanded ? noteNum : false)
  }

  const handleSave = () => {
    console.log('Sauvegarde Notes annexes:', notesContent)
    setHasChanges(false)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getCompletionStats = () => {
    const totalNotes = NOTES_STRUCTURE.reduce((sum, cat) => sum + cat.notes.length, 0)
    const mandatoryNotes = NOTES_STRUCTURE.reduce((sum, cat) => 
      sum + cat.notes.filter(note => note.mandatory).length, 0
    )
    const completedNotes = Object.keys(notesContent).filter(key => 
      notesContent[parseInt(key)].trim().length > 0
    ).length
    const completedMandatory = NOTES_STRUCTURE.reduce((sum, cat) => 
      sum + cat.notes.filter(note => note.mandatory && notesContent[note.num]?.trim()).length, 0
    )

    return { totalNotes, mandatoryNotes, completedNotes, completedMandatory }
  }

  const stats = getCompletionStats()

  const renderNotesByCategory = (category: string) => {
    const categoryData = NOTES_STRUCTURE.find(cat => cat.category === category)
    if (!categoryData) return null

    return (
      <Box>
        {categoryData.notes.map((note) => (
          <Accordion
            key={note.num}
            expanded={expandedNote === note.num}
            onChange={handleAccordionChange(note.num)}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              backgroundColor: note.mandatory 
                ? alpha(theme.palette.warning.main, 0.05)
                : 'transparent',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Chip 
                  label={`Note ${note.num}`} 
                  color={note.mandatory ? "warning" : "default"}
                  size="small"
                  sx={{ minWidth: 70 }}
                />
                
                <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
                  {note.title}
                </Typography>
                
                {note.mandatory && (
                  <Chip 
                    label="Obligatoire" 
                    color="error" 
                    size="small" 
                    variant="outlined"
                  />
                )}
                
                {notesContent[note.num]?.trim() && (
                  <Chip 
                    label="Complétée" 
                    color="success" 
                    size="small"
                    icon={<ReportIcon />}
                  />
                )}
              </Stack>
            </AccordionSummary>
            
            <AccordionDetails>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={notesContent[note.num] || ''}
                onChange={(e) => handleNoteChange(note.num, e.target.value)}
                placeholder={`Détaillez les informations relatives à : ${note.title}...`}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
              
              {note.mandatory && !notesContent[note.num]?.trim() && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Cette note est obligatoire selon le référentiel SYSCOHADA.
                  </Typography>
                </Alert>
              )}
              
              {/* Exemples de contenu pour certaines notes */}
              {note.num === 6 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Exemple de contenu :</Typography>
                  <Typography variant="body2">
                    • Terrains : évalués au coût d'acquisition, non amortis<br/>
                    • Constructions : amortissement linéaire sur 20 ans<br/>
                    • Matériel et outillage : amortissement linéaire sur 5 ans<br/>
                    • Matériel de transport : amortissement linéaire sur 4 ans
                  </Typography>
                </Alert>
              )}
              
              {note.num === 8 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Exemple de contenu :</Typography>
                  <Typography variant="body2">
                    • Matières premières : coût moyen pondéré<br/>
                    • Produits finis : coût de production complet<br/>
                    • Marchandises : prix d'achat + frais accessoires
                  </Typography>
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

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
            <NoteIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTES ANNEXES
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

        {/* Statistiques de completion */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {stats.totalNotes}
                </Typography>
                <Typography variant="body2">Notes totales</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {stats.mandatoryNotes}
                </Typography>
                <Typography variant="body2">Obligatoires</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {stats.completedNotes}
                </Typography>
                <Typography variant="body2">Complétées</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {Math.round((stats.completedMandatory / stats.mandatoryNotes) * 100)}%
                </Typography>
                <Typography variant="body2">Conformité</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertes */}
        {stats.completedMandatory < stats.mandatoryNotes && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Attention : {stats.mandatoryNotes - stats.completedMandatory} note(s) obligatoire(s) non complétée(s)
            </Typography>
            <Typography variant="body2">
              Les notes obligatoires doivent être renseignées pour la conformité SYSCOHADA.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Navigation par catégorie */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {NOTES_STRUCTURE.map((category, index) => (
            <Tab 
              key={category.category}
              label={category.category}
              icon={
                <Chip 
                  label={category.notes.filter(n => notesContent[n.num]?.trim()).length}
                  size="small"
                  color={
                    category.notes.filter(n => n.mandatory && notesContent[n.num]?.trim()).length === 
                    category.notes.filter(n => n.mandatory).length ? "success" : "default"
                  }
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {NOTES_STRUCTURE.map((category, index) => (
        <TabPanel key={category.category} value={tabValue} index={index}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
            {category.category}
          </Typography>
          {renderNotesByCategory(category.category)}
        </TabPanel>
      ))}

      {/* Résumé final */}
      <Card sx={{ mt: 3, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="info" />
            Résumé de conformité SYSCOHADA
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Notes obligatoires complétées :
              </Typography>
              <List dense>
                {NOTES_STRUCTURE.map(category =>
                  category.notes
                    .filter(note => note.mandatory)
                    .map(note => (
                      <ListItem key={note.num} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`Note ${note.num} - ${note.title}`}
                          secondary={notesContent[note.num]?.trim() ? "✅ Complétée" : "❌ À compléter"}
                        />
                      </ListItem>
                    ))
                )}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Conseils :
              </Typography>
              <Typography variant="body2" component="div">
                • Renseignez toutes les notes obligatoires<br/>
                • Soyez précis dans les méthodes comptables<br/>
                • Quantifiez les montants significatifs<br/>
                • Expliquez tout changement de méthode<br/>
                • Mentionnez les événements post-clôture
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Paper>
  )
}

export default NotesAnnexesSYSCOHADA