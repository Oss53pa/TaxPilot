/**
 * Page du moteur de templates d'export
 */

import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  Description,
  Add,
  Edit,
  GetApp,
  Visibility,
  StarBorder,
  CloudUpload,
  Palette,
  TableChart,
  BarChart,
} from '@mui/icons-material'

const Templates = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  // Templates de démo
  const templatesDisponibles = [
    {
      id: '1',
      nom: 'Bilan SYSCOHADA Standard',
      type: 'EXCEL',
      categorie: 'LIASSE_OFFICIELLE',
      description: 'Template officiel pour le bilan SYSCOHADA révisé',
      estOfficiel: true,
      nbUtilisations: 1250,
      noteMoyenne: 4.8,
      derniereModif: '2024-03-15',
    },
    {
      id: '2',
      nom: 'Rapport de Gestion Personnalisé',
      type: 'WORD',
      categorie: 'RAPPORT_GESTION',
      description: 'Template moderne pour rapport de gestion avec graphiques',
      estOfficiel: false,
      nbUtilisations: 89,
      noteMoyenne: 4.2,
      derniereModif: '2024-02-28',
    },
    {
      id: '3',
      nom: 'Export Balance XML',
      type: 'XML',
      categorie: 'EXPORT_COMPTABLE',
      description: 'Format XML standard pour export vers autres logiciels',
      estOfficiel: true,
      nbUtilisations: 456,
      noteMoyenne: 4.5,
      derniereModif: '2024-01-10',
    },
    {
      id: '4',
      nom: 'Déclaration IS Modèle',
      type: 'PDF',
      categorie: 'DECLARATION_FISCALE',
      description: 'Template pour déclaration d\'impôt sur les sociétés',
      estOfficiel: true,
      nbUtilisations: 2341,
      noteMoyenne: 4.9,
      derniereModif: '2024-03-01',
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EXCEL': return <TableChart color="success" />
      case 'WORD': return <Description color="primary" />
      case 'PDF': return <Description color="error" />
      case 'XML': return <BarChart color="warning" />
      default: return <Description />
    }
  }

  const getCategorieColor = (categorie: string) => {
    switch (categorie) {
      case 'LIASSE_OFFICIELLE': return 'primary'
      case 'RAPPORT_GESTION': return 'secondary'
      case 'EXPORT_COMPTABLE': return 'success'
      case 'DECLARATION_FISCALE': return 'error'
      default: return 'default'
    }
  }

  const ouvrirEditeur = (template: any) => {
    setSelectedTemplate(template)
    setOpenDialog(true)
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Description sx={{ mr: 2, verticalAlign: 'middle' }} />
          Templates d'Export
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Nouveau Template
          </Button>
          <Button variant="outlined" startIcon={<CloudUpload />}>
            Importer
          </Button>
        </Box>
      </Box>

      {/* Filtres et statistiques */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de template</InputLabel>
                <Select label="Type de template" defaultValue="">
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="EXCEL">Excel</MenuItem>
                  <MenuItem value="WORD">Word</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="XML">XML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select label="Catégorie" defaultValue="">
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="LIASSE_OFFICIELLE">Liasse officielle</MenuItem>
                  <MenuItem value="RAPPORT_GESTION">Rapport de gestion</MenuItem>
                  <MenuItem value="EXPORT_COMPTABLE">Export comptable</MenuItem>
                  <MenuItem value="DECLARATION_FISCALE">Déclaration fiscale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {templatesDisponibles.length}
                  </Typography>
                  <Typography variant="caption">Templates</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {templatesDisponibles.filter(t => t.estOfficiel).length}
                  </Typography>
                  <Typography variant="caption">Officiels</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grille des templates */}
      <Grid container spacing={3}>
        {templatesDisponibles.map((template) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
            <Card
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    {getTypeIcon(template.type)}
                  </Avatar>
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {template.nom}
                    </Typography>
                    {template.estOfficiel && (
                      <Chip label="Officiel" color="primary" size="small" />
                    )}
                  </Box>
                }
                subheader={template.type}
                action={
                  <IconButton size="small">
                    <StarBorder />
                  </IconButton>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                <Chip
                  label={template.categorie.replace('_', ' ')}
                  color={getCategorieColor(template.categorie) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    {template.nbUtilisations} utilisations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Note: {template.noteMoyenne}/5
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  startIcon={<Palette />}
                  onClick={() => ouvrirEditeur(template)}
                >
                  Éditer
                </Button>
                <Box>
                  <Tooltip title="Prévisualiser">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Télécharger">
                    <IconButton size="small">
                      <GetApp />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'édition */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Éditer Template' : 'Nouveau Template'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            L'éditeur visuel drag & drop sera disponible dans la version suivante.
            Configuration JSON temporaire.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du template"
                defaultValue={selectedTemplate?.nom || ''}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select defaultValue={selectedTemplate?.type || ''}>
                  <MenuItem value="EXCEL">Excel</MenuItem>
                  <MenuItem value="WORD">Word</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="XML">XML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                defaultValue={selectedTemplate?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained">
            {selectedTemplate ? 'Sauvegarder' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Templates