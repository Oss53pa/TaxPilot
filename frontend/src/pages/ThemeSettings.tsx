import { logger } from '@/utils/logger'
/**
 * Page de configuration des thèmes et palettes de couleurs
 * Fonctionne en mode localStorage (sans backend)
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
  Snackbar,
  TextField,
  Slider,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material'
import {
  Palette,
  DarkMode,
  LightMode,
  CheckCircle,
  Refresh,
  Add,
  Delete,
  Save,
  Edit,
  Close,
  ContentCopy,
  FormatColorFill,
} from '@mui/icons-material'
import type { ThemeConfiguration, PredefinedTheme } from '@/services/themeService'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// ── localStorage helpers ──
const THEMES_KEY = 'fiscasync_db_themes'
const ACTIVE_THEME_KEY = 'fiscasync_active_theme_id'

function loadThemesFromStorage(): ThemeConfiguration[] {
  try {
    const raw = localStorage.getItem(THEMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveThemesToStorage(themes: ThemeConfiguration[]) {
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

function getActiveThemeId(): number | null {
  const v = localStorage.getItem(ACTIVE_THEME_KEY)
  return v ? Number(v) : null
}

function setActiveThemeId(id: number) {
  localStorage.setItem(ACTIVE_THEME_KEY, String(id))
}

// ── Thèmes prédéfinis locaux ──
const LOCAL_PREDEFINED_THEMES: PredefinedTheme[] = [
  {
    type_theme: 'PROFESSIONNEL',
    nom_theme: 'Professionnel',
    couleur_primaire: '#171717',
    couleur_secondaire: '#525252',
    couleur_accent: '#3b82f6',
    couleur_fond: '#ffffff',
    couleur_surface: '#f5f5f5',
    couleur_texte_primaire: '#171717',
    couleur_texte_secondaire: '#737373',
    police_principale: 'Exo 2',
    police_secondaire: 'Inter',
    description: 'Palette monochrome sobre, idéale pour les cabinets comptables',
  },
  {
    type_theme: 'MODERNE',
    nom_theme: 'Bleu Moderne',
    couleur_primaire: '#1e40af',
    couleur_secondaire: '#3b82f6',
    couleur_accent: '#60a5fa',
    couleur_fond: '#ffffff',
    couleur_surface: '#eff6ff',
    couleur_texte_primaire: '#1e293b',
    couleur_texte_secondaire: '#64748b',
    police_principale: 'Inter',
    police_secondaire: 'Inter',
    description: 'Bleu professionnel moderne, confiance et sérénité',
  },
  {
    type_theme: 'NATURE',
    nom_theme: 'Vert Nature',
    couleur_primaire: '#166534',
    couleur_secondaire: '#22c55e',
    couleur_accent: '#86efac',
    couleur_fond: '#ffffff',
    couleur_surface: '#f0fdf4',
    couleur_texte_primaire: '#1a2e05',
    couleur_texte_secondaire: '#4d7c0f',
    police_principale: 'Inter',
    police_secondaire: 'Roboto',
    description: 'Tons verts apaisants, développement durable & RSE',
  },
  {
    type_theme: 'ROYAL',
    nom_theme: 'Violet Royal',
    couleur_primaire: '#581c87',
    couleur_secondaire: '#7c3aed',
    couleur_accent: '#c084fc',
    couleur_fond: '#ffffff',
    couleur_surface: '#faf5ff',
    couleur_texte_primaire: '#1e1b4b',
    couleur_texte_secondaire: '#6b21a8',
    police_principale: 'Poppins',
    police_secondaire: 'Inter',
    description: 'Violet élégant, convient aux marques premium',
  },
]

const AVAILABLE_FONTS = [
  'Exo 2', 'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans',
  'Lato', 'Source Sans Pro', 'Nunito', 'Raleway',
]

// Build a full ThemeConfiguration from a predefined template
let _nextId = Date.now()
function buildThemeFromPredefined(predefined: PredefinedTheme, customName?: string): ThemeConfiguration {
  return {
    id: _nextId++,
    entreprise: 1,
    nom_theme: customName || predefined.nom_theme,
    type_theme: predefined.type_theme,
    couleur_primaire: predefined.couleur_primaire,
    couleur_secondaire: predefined.couleur_secondaire,
    couleur_accent: predefined.couleur_accent,
    couleur_fond: predefined.couleur_fond || P.white,
    couleur_surface: predefined.couleur_surface || P.primary100,
    couleur_texte_primaire: predefined.couleur_texte_primaire || '#212121',
    couleur_texte_secondaire: predefined.couleur_texte_secondaire || P.primary500,
    couleur_texte_disabled: '#BDBDBD',
    mode_sombre_active: false,
    couleur_fond_sombre: '#121212',
    couleur_surface_sombre: '#1E1E1E',
    couleur_texte_sombre: P.white,
    police_principale: predefined.police_principale,
    police_secondaire: predefined.police_secondaire,
    taille_police_base: 14,
    border_radius: 8,
    espacement_base: 8,
    est_theme_actif: false,
    est_theme_par_defaut: false,
  }
}

// ── Color swatch with picker ──
const ColorSwatch: React.FC<{
  label: string
  value: string
  onChange: (color: string) => void
}> = ({ label, value, onChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Tooltip title="Cliquer pour changer">
      <Box
        component="label"
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          border: '2px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          backgroundColor: value,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 0 0 3px rgba(0,0,0,0.12)' },
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>
    </Tooltip>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
        {value.toUpperCase()}
      </Typography>
    </Box>
  </Box>
)

const ThemeSettings: React.FC = () => {
  const [themes, setThemes] = React.useState<ThemeConfiguration[]>([])
  const [selectedTheme, setSelectedTheme] = React.useState<number | null>(null)
  const [editingTheme, setEditingTheme] = React.useState<ThemeConfiguration | null>(null)
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)

  const selectedThemeObj = themes.find(t => t.id === selectedTheme) || null

  // Charger depuis localStorage au montage
  React.useEffect(() => {
    let stored = loadThemesFromStorage()

    if (stored.length === 0) {
      const defaultTheme = buildThemeFromPredefined(LOCAL_PREDEFINED_THEMES[0])
      defaultTheme.est_theme_actif = true
      defaultTheme.est_theme_par_defaut = true
      stored = [defaultTheme]
      saveThemesToStorage(stored)
      setActiveThemeId(defaultTheme.id!)
    }

    setThemes(stored)

    const activeId = getActiveThemeId()
    if (activeId) {
      setSelectedTheme(activeId)
      const active = stored.find(t => t.id === activeId)
      if (active) setIsDarkMode(active.mode_sombre_active)
    } else if (stored.length > 0) {
      setSelectedTheme(stored[0].id!)
    }
  }, [])

  const applyTheme = () => {
    if (!selectedTheme) return
    const updated = themes.map(t => ({
      ...t,
      est_theme_actif: t.id === selectedTheme,
      mode_sombre_active: t.id === selectedTheme ? isDarkMode : t.mode_sombre_active,
    }))
    setThemes(updated)
    saveThemesToStorage(updated)
    setActiveThemeId(selectedTheme)
    setSuccess('Thème appliqué avec succès !')
    logger.debug('Thème activé:', selectedTheme)
  }

  const resetToDefault = () => {
    const defaultTheme = themes.find(t => t.est_theme_par_defaut) || themes[0]
    if (defaultTheme) {
      setSelectedTheme(defaultTheme.id!)
      setIsDarkMode(false)
    }
  }

  const createThemeFromPredefined = (predefined: PredefinedTheme) => {
    const newTheme = buildThemeFromPredefined(predefined, `${predefined.nom_theme} - Personnalisé`)
    const updated = [...themes, newTheme]
    setThemes(updated)
    saveThemesToStorage(updated)
    setSelectedTheme(newTheme.id!)
    setEditingTheme({ ...newTheme })
    setSuccess('Thème créé ! Personnalisez les couleurs ci-dessous.')
  }

  const duplicateTheme = (theme: ThemeConfiguration) => {
    const dup: ThemeConfiguration = {
      ...theme,
      id: _nextId++,
      nom_theme: `${theme.nom_theme} (copie)`,
      est_theme_actif: false,
      est_theme_par_defaut: false,
    }
    const updated = [...themes, dup]
    setThemes(updated)
    saveThemesToStorage(updated)
    setSelectedTheme(dup.id!)
    setEditingTheme({ ...dup })
    setSuccess('Thème dupliqué !')
  }

  const deleteTheme = (id: number) => {
    const t = themes.find(th => th.id === id)
    if (t?.est_theme_par_defaut) return
    const updated = themes.filter(th => th.id !== id)
    setThemes(updated)
    saveThemesToStorage(updated)
    if (selectedTheme === id) {
      setSelectedTheme(updated[0]?.id ?? null)
    }
    if (editingTheme?.id === id) setEditingTheme(null)
    setSuccess('Thème supprimé.')
  }

  const startEditing = (theme: ThemeConfiguration) => {
    setEditingTheme({ ...theme })
    setSelectedTheme(theme.id!)
  }

  const saveEditing = () => {
    if (!editingTheme) return
    const updated = themes.map(t => t.id === editingTheme.id ? { ...editingTheme } : t)
    setThemes(updated)
    saveThemesToStorage(updated)
    setEditingTheme(null)
    setSuccess('Thème sauvegardé !')
  }

  const cancelEditing = () => setEditingTheme(null)

  const updateEditField = <K extends keyof ThemeConfiguration>(key: K, val: ThemeConfiguration[K]) => {
    if (!editingTheme) return
    setEditingTheme({ ...editingTheme, [key]: val })
  }

  // The theme to preview = editing draft or selected saved theme
  const previewTheme = editingTheme?.id === selectedTheme ? editingTheme : selectedThemeObj

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Palette sx={{ mr: 2, verticalAlign: 'middle' }} />
          Configuration des Thèmes
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<CheckCircle />} onClick={applyTheme} disabled={!selectedTheme}>
            Appliquer
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={resetToDefault}>
            Réinitialiser
          </Button>
        </Box>
      </Box>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" variant="filled">{success}</Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* ═══ Colonne gauche : liste des thèmes ═══ */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Mes Thèmes" />
            <Divider />
            <CardContent>
              {themes.length > 0 && (
                <RadioGroup
                  value={selectedTheme || ''}
                  onChange={(e) => setSelectedTheme(Number(e.target.value))}
                >
                  {themes.map((theme) => (
                    <Paper
                      key={theme.id}
                      variant={selectedTheme === theme.id ? 'elevation' : 'outlined'}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: selectedTheme === theme.id ? `2px solid ${theme.couleur_primaire}` : undefined,
                        '&:hover': { boxShadow: 2 },
                      }}
                      onClick={() => setSelectedTheme(theme.id!)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormControlLabel
                          value={theme.id}
                          control={<Radio size="small" />}
                          label={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {theme.nom_theme}
                                </Typography>
                                {theme.est_theme_actif && <Chip label="Actif" color="primary" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
                              </Box>
                              {/* Aperçu mini-palette */}
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                {[theme.couleur_primaire, theme.couleur_secondaire, theme.couleur_accent, theme.couleur_fond, theme.couleur_surface].map((c, i) => (
                                  <Box key={i} sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: c, border: '1px solid', borderColor: 'divider' }} />
                                ))}
                              </Box>
                            </Box>
                          }
                          sx={{ flex: 1, mr: 0, alignItems: 'flex-start' }}
                        />
                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditing(theme) }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Dupliquer">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); duplicateTheme(theme) }}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!theme.est_theme_par_defaut && (
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteTheme(theme.id!) }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </RadioGroup>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                <Add sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                Nouveau depuis un modèle
              </Typography>
              <Grid container spacing={1}>
                {LOCAL_PREDEFINED_THEMES.map((predefined) => (
                  <Grid item xs={6} key={predefined.type_theme}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: 2, backgroundColor: 'action.hover' },
                      }}
                      onClick={() => createThemeFromPredefined(predefined)}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {predefined.nom_theme}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {[predefined.couleur_primaire, predefined.couleur_secondaire, predefined.couleur_accent].map((c, i) => (
                          <Box key={i} sx={{ width: 14, height: 14, borderRadius: '3px', backgroundColor: c, border: '1px solid', borderColor: 'divider' }} />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ═══ Colonne centre : éditeur de palette ═══ */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={editingTheme ? `Palette : ${editingTheme.nom_theme}` : 'Palette de couleurs'}
              avatar={<FormatColorFill />}
              action={
                editingTheme ? (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Sauvegarder"><IconButton color="primary" onClick={saveEditing}><Save /></IconButton></Tooltip>
                    <Tooltip title="Annuler"><IconButton onClick={cancelEditing}><Close /></IconButton></Tooltip>
                  </Box>
                ) : selectedThemeObj ? (
                  <Tooltip title="Modifier"><IconButton onClick={() => startEditing(selectedThemeObj)}><Edit /></IconButton></Tooltip>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              {editingTheme ? (
                <Box>
                  {/* Nom du thème */}
                  <TextField
                    label="Nom du thème"
                    value={editingTheme.nom_theme}
                    onChange={(e) => updateEditField('nom_theme', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  {/* Couleurs principales */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Couleurs principales
                  </Typography>
                  <ColorSwatch label="Primaire" value={editingTheme.couleur_primaire} onChange={(v) => updateEditField('couleur_primaire', v)} />
                  <ColorSwatch label="Secondaire" value={editingTheme.couleur_secondaire} onChange={(v) => updateEditField('couleur_secondaire', v)} />
                  <ColorSwatch label="Accent" value={editingTheme.couleur_accent} onChange={(v) => updateEditField('couleur_accent', v)} />

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Arrière-plans
                  </Typography>
                  <ColorSwatch label="Fond" value={editingTheme.couleur_fond} onChange={(v) => updateEditField('couleur_fond', v)} />
                  <ColorSwatch label="Surface" value={editingTheme.couleur_surface} onChange={(v) => updateEditField('couleur_surface', v)} />

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Textes
                  </Typography>
                  <ColorSwatch label="Texte principal" value={editingTheme.couleur_texte_primaire} onChange={(v) => updateEditField('couleur_texte_primaire', v)} />
                  <ColorSwatch label="Texte secondaire" value={editingTheme.couleur_texte_secondaire} onChange={(v) => updateEditField('couleur_texte_secondaire', v)} />
                  <ColorSwatch label="Texte désactivé" value={editingTheme.couleur_texte_disabled} onChange={(v) => updateEditField('couleur_texte_disabled', v)} />

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Mode sombre
                  </Typography>
                  <ColorSwatch label="Fond sombre" value={editingTheme.couleur_fond_sombre} onChange={(v) => updateEditField('couleur_fond_sombre', v)} />
                  <ColorSwatch label="Surface sombre" value={editingTheme.couleur_surface_sombre} onChange={(v) => updateEditField('couleur_surface_sombre', v)} />
                  <ColorSwatch label="Texte sombre" value={editingTheme.couleur_texte_sombre} onChange={(v) => updateEditField('couleur_texte_sombre', v)} />

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                    Typographie & Espacement
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>Police principale</InputLabel>
                    <Select
                      value={editingTheme.police_principale}
                      label="Police principale"
                      onChange={(e) => updateEditField('police_principale', e.target.value)}
                    >
                      {AVAILABLE_FONTS.map(f => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>Police secondaire</InputLabel>
                    <Select
                      value={editingTheme.police_secondaire}
                      label="Police secondaire"
                      onChange={(e) => updateEditField('police_secondaire', e.target.value)}
                    >
                      {AVAILABLE_FONTS.map(f => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Taille police : {editingTheme.taille_police_base}px</Typography>
                    <Slider value={editingTheme.taille_police_base} min={10} max={20} step={1} onChange={(_, v) => updateEditField('taille_police_base', v as number)} size="small" />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Border radius : {editingTheme.border_radius}px</Typography>
                    <Slider value={editingTheme.border_radius} min={0} max={24} step={1} onChange={(_, v) => updateEditField('border_radius', v as number)} size="small" />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Espacement : {editingTheme.espacement_base}px</Typography>
                    <Slider value={editingTheme.espacement_base} min={4} max={16} step={1} onChange={(_, v) => updateEditField('espacement_base', v as number)} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="contained" startIcon={<Save />} fullWidth onClick={saveEditing}>
                      Sauvegarder
                    </Button>
                    <Button variant="outlined" startIcon={<Close />} fullWidth onClick={cancelEditing}>
                      Annuler
                    </Button>
                  </Box>
                </Box>
              ) : selectedThemeObj ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Cliquez sur le crayon pour personnaliser les couleurs de ce thème.
                  </Alert>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Couleurs principales</Typography>
                  {[
                    { label: 'Primaire', value: selectedThemeObj.couleur_primaire },
                    { label: 'Secondaire', value: selectedThemeObj.couleur_secondaire },
                    { label: 'Accent', value: selectedThemeObj.couleur_accent },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: value, border: '1px solid', borderColor: 'divider' }} />
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{value}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Arrière-plans</Typography>
                  {[
                    { label: 'Fond', value: selectedThemeObj.couleur_fond },
                    { label: 'Surface', value: selectedThemeObj.couleur_surface },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: value, border: '1px solid', borderColor: 'divider' }} />
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{value}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Textes</Typography>
                  {[
                    { label: 'Principal', value: selectedThemeObj.couleur_texte_primaire },
                    { label: 'Secondaire', value: selectedThemeObj.couleur_texte_secondaire },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: value, border: '1px solid', borderColor: 'divider' }} />
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{value}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Typographie</Typography>
                  <Typography variant="body2">Police : {selectedThemeObj.police_principale}</Typography>
                  <Typography variant="body2">Taille : {selectedThemeObj.taille_police_base}px</Typography>
                  <Typography variant="body2">Radius : {selectedThemeObj.border_radius}px</Typography>
                </Box>
              ) : (
                <Alert severity="info">Sélectionnez un thème pour voir sa palette.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ═══ Colonne droite : aperçu live ═══ */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Aperçu"
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isDarkMode ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                  <Switch size="small" checked={isDarkMode} onChange={(e) => setIsDarkMode(e.target.checked)} />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              {previewTheme ? (
                <Box>
                  {/* Aperçu UI simulé */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: isDarkMode ? previewTheme.couleur_fond_sombre : previewTheme.couleur_fond,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: `${previewTheme.border_radius}px`,
                    }}
                  >
                    {/* Barre de navigation simulée */}
                    <Box sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: `${previewTheme.border_radius}px`,
                      backgroundColor: previewTheme.couleur_primaire,
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontFamily: previewTheme.police_principale, fontWeight: 600 }}>
                        FiscaSync
                      </Typography>
                    </Box>

                    {/* Carte simulée */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: `${previewTheme.border_radius}px`,
                        backgroundColor: isDarkMode ? previewTheme.couleur_surface_sombre : previewTheme.couleur_surface,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: isDarkMode ? previewTheme.couleur_texte_sombre : previewTheme.couleur_texte_primaire,
                          fontFamily: previewTheme.police_principale,
                          fontWeight: 600,
                          fontSize: `${previewTheme.taille_police_base}px`,
                          mb: 0.5,
                        }}
                      >
                        Tableau de bord
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDarkMode ? previewTheme.couleur_texte_sombre : previewTheme.couleur_texte_secondaire,
                          fontFamily: previewTheme.police_secondaire,
                          fontSize: `${previewTheme.taille_police_base - 2}px`,
                        }}
                      >
                        Résumé de votre activité fiscale
                      </Typography>
                    </Paper>

                    {/* Boutons simulés */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: previewTheme.couleur_primaire,
                          color: '#fff',
                          borderRadius: `${previewTheme.border_radius}px`,
                          fontFamily: previewTheme.police_principale,
                          '&:hover': { backgroundColor: previewTheme.couleur_primaire, opacity: 0.9 },
                        }}
                      >
                        Principal
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: previewTheme.couleur_secondaire,
                          color: previewTheme.couleur_secondaire,
                          borderRadius: `${previewTheme.border_radius}px`,
                          fontFamily: previewTheme.police_principale,
                        }}
                      >
                        Secondaire
                      </Button>
                      <Chip
                        label="Accent"
                        size="small"
                        sx={{
                          backgroundColor: previewTheme.couleur_accent,
                          color: '#fff',
                          fontWeight: 500,
                          borderRadius: `${previewTheme.border_radius}px`,
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* Résumé palette complète */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Palette complète</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {[
                      { label: 'Pri', color: previewTheme.couleur_primaire },
                      { label: 'Sec', color: previewTheme.couleur_secondaire },
                      { label: 'Acc', color: previewTheme.couleur_accent },
                      { label: 'Fnd', color: previewTheme.couleur_fond },
                      { label: 'Srf', color: previewTheme.couleur_surface },
                      { label: 'Tx1', color: previewTheme.couleur_texte_primaire },
                      { label: 'Tx2', color: previewTheme.couleur_texte_secondaire },
                    ].map(({ label, color }) => (
                      <Tooltip key={label} title={`${label}: ${color}`}>
                        <Box sx={{
                          width: 32, height: 32,
                          borderRadius: '6px',
                          backgroundColor: color,
                          border: '2px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Typography sx={{ fontSize: '0.5rem', color: isLight(color) ? '#000' : '#fff', fontWeight: 700 }}>
                            {label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Police : {previewTheme.police_principale} / {previewTheme.police_secondaire}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">Sélectionnez un thème.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

/** Returns true if a hex color is "light" */
function isLight(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

export default ThemeSettings
