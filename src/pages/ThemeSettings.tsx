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
  Divider,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material'
import {
  Palette,
  DarkMode,
  LightMode,
  CheckCircle,
  Refresh,
  Add,
} from '@mui/icons-material'
import { themeService, ThemeConfiguration, PredefinedTheme } from '@/services/themeService'
import { entrepriseService } from '@/services'

const ThemeSettings: React.FC = () => {
  const [themes, setThemes] = React.useState<ThemeConfiguration[]>([])
  const [predefinedThemes, setPredefinedThemes] = React.useState<PredefinedTheme[]>([])
  const [activeTheme, setActiveTheme] = React.useState<ThemeConfiguration | null>(null)
  const [selectedTheme, setSelectedTheme] = React.useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [entrepriseId, setEntrepriseId] = React.useState<number | null>(null)

  // Charger les données initiales
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Récupérer l'entreprise
        const entreprisesRes = await entrepriseService.getEntreprises({ page_size: 1 })
        const entreprise = entreprisesRes.results?.[0]

        if (!entreprise) {
          setError('Aucune entreprise trouvée')
          return
        }

        setEntrepriseId(entreprise.id!)

        // Charger les thèmes et thèmes prédéfinis en parallèle
        const [themesResult, predefinedResult, activeResult] = await Promise.all([
          themeService.getThemes(entreprise.id!),
          themeService.getPredefinedThemes(),
          themeService.getActiveTheme(entreprise.id!)
        ])

        setThemes(themesResult)
        setPredefinedThemes(predefinedResult)
        setActiveTheme(activeResult)

        if (activeResult) {
          setSelectedTheme(activeResult.id!)
          setIsDarkMode(activeResult.mode_sombre_active)
        }

      } catch (err: any) {
        console.error('Erreur lors du chargement des thèmes:', err)
        setError('Erreur lors du chargement des thèmes: ' + (err.message || 'Erreur inconnue'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const applyTheme = async () => {
    if (!selectedTheme || !entrepriseId) return

    try {
      setSaving(true)
      setError(null)

      // Activer le thème sélectionné
      await themeService.activateTheme(selectedTheme)

      // Mettre à jour le mode sombre si nécessaire
      const updatedTheme = await themeService.updateTheme(selectedTheme, {
        mode_sombre_active: isDarkMode
      })

      setActiveTheme(updatedTheme)
      setSuccess('Thème appliqué avec succès!')

    } catch (err: any) {
      console.error('Erreur lors de l\'application du thème:', err)
      setError('Erreur lors de l\'application du thème: ' + (err.message || 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    if (predefinedThemes.length > 0) {
      const defaultTheme = themes.find(t => t.est_theme_par_defaut) || themes[0]
      if (defaultTheme) {
        setSelectedTheme(defaultTheme.id!)
        setIsDarkMode(false)
      }
    }
  }

  const createThemeFromPredefined = async (predefinedTheme: PredefinedTheme) => {
    if (!entrepriseId) return

    try {
      setSaving(true)
      setError(null)

      const newTheme = await themeService.createFromPredefined(
        entrepriseId,
        predefinedTheme,
        `${predefinedTheme.nom_theme} - Personnalisé`
      )

      setThemes(prev => [...prev, newTheme])
      setSelectedTheme(newTheme.id!)
      setSuccess('Thème créé avec succès!')

    } catch (err: any) {
      console.error('Erreur lors de la création du thème:', err)
      setError('Erreur lors de la création du thème: ' + (err.message || 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des thèmes...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Box>
    )
  }

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
            startIcon={saving ? <CircularProgress size={20} /> : <CheckCircle />}
            onClick={applyTheme}
            disabled={saving || !selectedTheme}
          >
            {saving ? 'Application...' : 'Appliquer'}
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={resetToDefault}>
            Réinitialiser
          </Button>
        </Box>
      </Box>

      {/* Messages de succès et d'erreur */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Sélecteur de thème */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Configuration des Thèmes" />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                Choisissez un thème qui reflète l'identité de votre entreprise.
                Vous pouvez créer de nouveaux thèmes à partir des modèles prédéfinis.
              </Alert>

              {/* Section des thèmes existants */}
              {themes.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Thèmes de votre entreprise
                  </Typography>
                  <RadioGroup
                    value={selectedTheme || ''}
                    onChange={(e) => setSelectedTheme(Number(e.target.value))}
                  >
                    <Grid container spacing={2}>
                      {themes.map((theme) => (
                        <Grid item xs={12} key={theme.id}>
                          <Paper
                            variant={selectedTheme === theme.id ? 'elevation' : 'outlined'}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: selectedTheme === theme.id ? `2px solid ${theme.couleur_primaire}` : undefined,
                              '&:hover': {
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => setSelectedTheme(theme.id!)}
                          >
                            <FormControlLabel
                              value={theme.id}
                              control={<Radio />}
                              label={
                                <Box sx={{ ml: 1, width: '100%' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {theme.nom_theme}
                                    </Typography>
                                    {theme.est_theme_actif && (
                                      <Chip label="Actif" color="primary" size="small" />
                                    )}
                                    {theme.est_theme_par_defaut && (
                                      <Chip label="Par défaut" color="secondary" size="small" />
                                    )}
                                  </Box>

                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Type: {theme.type_theme}
                                  </Typography>

                                  {/* Aperçu des couleurs du thème */}
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip
                                      label="Primaire"
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.couleur_primaire,
                                        color: 'white',
                                        fontWeight: 500,
                                      }}
                                    />
                                    <Chip
                                      label="Secondaire"
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.couleur_secondaire,
                                        color: 'white',
                                        fontWeight: 500,
                                      }}
                                    />
                                    <Chip
                                      label="Accent"
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.couleur_accent,
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
                </Box>
              )}

              {/* Section des thèmes prédéfinis */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Créer un nouveau thème
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sélectionnez un modèle prédéfini pour créer un nouveau thème personnalisé
                </Typography>
                <Grid container spacing={2}>
                  {predefinedThemes.map((predefined) => (
                    <Grid item xs={12} sm={6} key={predefined.type_theme}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={() => createThemeFromPredefined(predefined)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {predefined.nom_theme}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            disabled={saving}
                          >
                            Créer
                          </Button>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {predefined.description}
                        </Typography>

                        {/* Aperçu des couleurs du thème prédéfini */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label="Primaire"
                            size="small"
                            sx={{
                              backgroundColor: predefined.couleur_primaire,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label="Secondaire"
                            size="small"
                            sx={{
                              backgroundColor: predefined.couleur_secondaire,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label="Accent"
                            size="small"
                            sx={{
                              backgroundColor: predefined.couleur_accent,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
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
              {selectedTheme && (() => {
                const theme = themes.find(t => t.id === selectedTheme)
                if (!theme) return null

                return (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Aperçu
                    </Typography>

                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: isDarkMode ? theme.couleur_fond_sombre : theme.couleur_fond,
                        border: `1px solid ${isDarkMode ? theme.couleur_texte_sombre : theme.couleur_texte_secondaire}`,
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: isDarkMode ? theme.couleur_texte_sombre : theme.couleur_texte_primaire,
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        FiscaSync Dashboard
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDarkMode ? theme.couleur_texte_sombre : theme.couleur_texte_secondaire,
                          mb: 2
                        }}
                      >
                        Aperçu avec le thème sélectionné
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: theme.couleur_primaire,
                            '&:hover': {
                              backgroundColor: theme.couleur_primaire,
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
                            borderColor: theme.couleur_secondaire,
                            color: theme.couleur_secondaire,
                          }}
                        >
                          Secondaire
                        </Button>
                      </Box>
                    </Paper>

                    {/* Info sur le thème actuel */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Thème Sélectionné
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {theme.nom_theme}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {theme.type_theme}
                      </Typography>
                    </Box>
                  </Box>
                )
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ThemeSettings