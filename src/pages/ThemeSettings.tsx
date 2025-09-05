/**
 * Page de configuration des thèmes et palettes de couleurs
 */

import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Avatar,
  Divider,
  Chip,
  Paper,
  Alert,
} from '@mui/material'
import {
  Palette,
  DarkMode,
  LightMode,
  CheckCircle,
  Refresh,
} from '@mui/icons-material'
import { colorPalettes, defaultPaletteId } from '@/utils/colorPalettes'

const ThemeSettings: React.FC = () => {
  const [selectedPalette, setSelectedPalette] = React.useState(defaultPaletteId)
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const applyTheme = () => {
    // TODO: Connecter au store de thème
    console.log('Appliquer thème:', selectedPalette, isDarkMode)
  }

  const resetToDefault = () => {
    setSelectedPalette(defaultPaletteId)
    setIsDarkMode(false)
  }

  const previewPalette = (colors: any) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: colors.primary,
          border: '2px solid white',
          boxShadow: 1,
        }}
        title="Primaire"
      />
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: colors.secondary,
          border: '2px solid white',
          boxShadow: 1,
        }}
        title="Secondaire"
      />
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: colors.success,
          border: '2px solid white',
          boxShadow: 1,
        }}
        title="Succès"
      />
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: colors.warning,
          border: '2px solid white',
          boxShadow: 1,
        }}
        title="Attention"
      />
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: colors.text.primary,
          border: '2px solid white',
          boxShadow: 1,
        }}
        title="Texte"
      />
    </Box>
  )

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Palette sx={{ mr: 2, verticalAlign: 'middle' }} />
          Configuration des Thèmes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={applyTheme}
          >
            Appliquer
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={resetToDefault}>
            Réinitialiser
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sélecteur de palette */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Palettes de Couleurs" />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                Choisissez une palette de couleurs qui reflète l'identité de votre entreprise.
                La palette <strong>Minimaliste Premium</strong> est recommandée par défaut.
              </Alert>

              <RadioGroup
                value={selectedPalette}
                onChange={(e) => setSelectedPalette(e.target.value)}
              >
                <Grid container spacing={2}>
                  {colorPalettes.map((palette) => (
                    <Grid item xs={12} key={palette.id}>
                      <Paper
                        variant={selectedPalette === palette.id ? 'elevation' : 'outlined'}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: selectedPalette === palette.id ? `2px solid ${palette.colors.primary}` : undefined,
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => setSelectedPalette(palette.id)}
                      >
                        <FormControlLabel
                          value={palette.id}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {palette.name}
                                </Typography>
                                {palette.id === defaultPaletteId && (
                                  <Chip label="Par défaut" color="primary" size="small" />
                                )}
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {palette.description}
                              </Typography>
                              
                              {previewPalette(palette.colors)}
                              
                              {/* Exemples de couleurs avec noms */}
                              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label="Primaire"
                                  size="small"
                                  sx={{
                                    backgroundColor: palette.colors.primary,
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  label="Secondaire"
                                  size="small"
                                  sx={{
                                    backgroundColor: palette.colors.secondary,
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  label="Succès"
                                  size="small"
                                  sx={{
                                    backgroundColor: palette.colors.success,
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  label="Texte"
                                  size="small"
                                  sx={{
                                    backgroundColor: palette.colors.text.primary,
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', alignItems: 'flex-start' }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Options du thème */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Options d'Affichage" />
            <Divider />
            <CardContent>
              {/* Mode sombre */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isDarkMode ? <DarkMode /> : <LightMode />}
                  <Typography variant="subtitle1">
                    Mode sombre
                  </Typography>
                </Box>
                <Switch
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                />
              </Box>

              {/* Aperçu du thème sélectionné */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Aperçu
              </Typography>
              
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: colorPalettes.find(p => p.id === selectedPalette)?.colors.background.default,
                  border: `1px solid ${colorPalettes.find(p => p.id === selectedPalette)?.colors.text.secondary}`,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: colorPalettes.find(p => p.id === selectedPalette)?.colors.text.primary,
                    mb: 1,
                    fontWeight: 600
                  }}
                >
                  FiscaSync Dashboard
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colorPalettes.find(p => p.id === selectedPalette)?.colors.text.secondary,
                    mb: 2
                  }}
                >
                  Aperçu avec la palette sélectionnée
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: colorPalettes.find(p => p.id === selectedPalette)?.colors.primary,
                      '&:hover': {
                        backgroundColor: colorPalettes.find(p => p.id === selectedPalette)?.colors.primary,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Bouton Principal
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: colorPalettes.find(p => p.id === selectedPalette)?.colors.secondary,
                      color: colorPalettes.find(p => p.id === selectedPalette)?.colors.secondary,
                    }}
                  >
                    Secondaire
                  </Button>
                </Box>
              </Paper>

              {/* Info sur la palette actuelle */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Palette Actuelle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {colorPalettes.find(p => p.id === selectedPalette)?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {colorPalettes.find(p => p.id === selectedPalette)?.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ThemeSettings