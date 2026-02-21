/**
 * CountryCustomization — Personnalisation des templates par pays
 * Reads country from app config, shows liasse templates by regime,
 * allows customizing header/footer/fonts/margins/pages, saves as export profile.
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material'
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
  CheckCircle as CheckIcon,
  RemoveCircleOutline as ExcludeIcon,
  AddCircleOutline as IncludeIcon,
  NoteAdd as NoteIcon,
  Palette as PaletteIcon,
  FormatSize as FontIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import {
  SECTION_LABELS,
  getPagesForRegime,
  getPagesBySection,
  type Regime,
  type SectionId,
} from '@/config/liasse-pages-config'
import {
  type ExportProfile,
  getCountryFromConfig,
  createDefaultProfile,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from './exportTypes'

const REGIME_OPTIONS: { key: Regime; label: string }[] = [
  { key: 'reel_normal', label: 'Systeme Normal (SN)' },
  { key: 'reel_simplifie', label: 'Systeme Minimal de Tresorerie (SMT)' },
  { key: 'forfaitaire', label: 'Systeme Allege (Forfaitaire)' },
  { key: 'micro', label: 'Micro-Entreprise' },
]

const FONT_OPTIONS = ['Exo 2', 'Roboto', 'Inter', 'Open Sans', 'Lato', 'Noto Sans', 'Arial', 'Times New Roman']

interface Props {
  onSaveProfile?: (profile: ExportProfile) => void
}

const CountryCustomization: React.FC<Props> = ({ onSaveProfile }) => {
  const theme = useTheme()
  const country = useMemo(() => getCountryFromConfig(), [])

  const [selectedRegime, setSelectedRegime] = useState<Regime>('reel_normal')
  const [profile, setProfile] = useState<ExportProfile>(() => createDefaultProfile(country.code))
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    footer: false,
    style: false,
    pages: false,
  })
  const [saved, setSaved] = useState(false)
  const [pageNoteEditing, setPageNoteEditing] = useState<string | null>(null)

  const pages = useMemo(() => getPagesForRegime(selectedRegime), [selectedRegime])
  const sections = useMemo(() => getPagesBySection(selectedRegime), [selectedRegime])

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateProfile = useCallback((partial: Partial<ExportProfile>) => {
    setProfile(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }))
    setSaved(false)
  }, [])

  const toggleExcludedPage = useCallback((pageId: string) => {
    setProfile(prev => {
      const excluded = new Set(prev.excludedPages)
      if (excluded.has(pageId)) excluded.delete(pageId)
      else excluded.add(pageId)
      return { ...prev, excludedPages: Array.from(excluded), updatedAt: new Date().toISOString() }
    })
    setSaved(false)
  }, [])

  const toggleExcludedSection = useCallback((sectionId: SectionId) => {
    setProfile(prev => {
      const excluded = new Set(prev.excludedSections)
      if (excluded.has(sectionId)) excluded.delete(sectionId)
      else excluded.add(sectionId)
      return { ...prev, excludedSections: Array.from(excluded), updatedAt: new Date().toISOString() }
    })
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    if (!profile.name.trim()) return
    const profiles = loadFromStorage<ExportProfile[]>(STORAGE_KEYS.EXPORT_PROFILES, [])
    const idx = profiles.findIndex(p => p.id === profile.id)
    const updated = {
      ...profile,
      regime: selectedRegime,
      country: country.code,
      version: profile.version + (idx >= 0 ? 1 : 0),
      updatedAt: new Date().toISOString(),
    }
    if (idx >= 0) {
      profiles[idx] = updated
    } else {
      profiles.push(updated)
    }
    saveToStorage(STORAGE_KEYS.EXPORT_PROFILES, profiles)
    setProfile(updated)
    setSaved(true)
    onSaveProfile?.(updated)
    setTimeout(() => setSaved(false), 3000)
  }, [profile, selectedRegime, country.code, onSaveProfile])

  const handleReset = useCallback(() => {
    setProfile(createDefaultProfile(country.code))
    setSaved(false)
  }, [country.code])

  const SectionHeader: React.FC<{ id: string; title: string; icon: React.ReactNode }> = ({ id, title, icon }) => (
    <Box
      onClick={() => toggleSection(id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        py: 1.5,
        px: 2,
        borderRadius: 1,
        '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.06) },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Stack>
      {expandedSections[id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
    </Box>
  )

  return (
    <Box>
      {/* Country info banner */}
      <Alert severity="info" sx={{ mb: 3 }} icon={false}>
        <AlertTitle sx={{ fontWeight: 600 }}>
          {country.flag} {country.name} — Norme SYSCOHADA
        </AlertTitle>
        Personnalisez les templates de la liasse fiscale pour votre pays.
        Les modifications sont sauvegardees comme profil d'export reutilisable.
      </Alert>

      <Grid container spacing={3}>
        {/* Left: Regime + Profile name */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom du profil d'export"
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    placeholder="Ex: Liasse SN - Presentation standard"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Regime fiscal</InputLabel>
                    <Select
                      value={selectedRegime}
                      label="Regime fiscal"
                      onChange={(e) => setSelectedRegime(e.target.value as Regime)}
                    >
                      {REGIME_OPTIONS.map(r => (
                        <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={profile.description}
                    onChange={(e) => updateProfile({ description: e.target.value })}
                    placeholder="Description optionnelle du profil"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>

              {/* Header customization */}
              <SectionHeader id="header" title="En-tete du document" icon={<ImageIcon fontSize="small" color="action" />} />
              <Collapse in={expandedSections.header}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="En-tete administration (ex: Direction Generale des Impots)"
                        value={profile.headerAdminHeader}
                        onChange={(e) => updateProfile({ headerAdminHeader: e.target.value })}
                        size="small"
                        placeholder="Laisser vide pour utiliser la valeur par defaut du pays"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.headerCompanyName}
                            onChange={(e) => updateProfile({ headerCompanyName: e.target.checked })}
                          />
                        }
                        label="Afficher la raison sociale"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.headerFiscalYear}
                            onChange={(e) => updateProfile({ headerFiscalYear: e.target.checked })}
                          />
                        }
                        label="Afficher l'exercice fiscal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" size="small" startIcon={<ImageIcon />} component="label">
                        Charger un logo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => updateProfile({ headerLogo: reader.result as string })
                            reader.readAsDataURL(file)
                          }}
                        />
                      </Button>
                      {profile.headerLogo && (
                        <Chip label="Logo charge" size="small" color="success" onDelete={() => updateProfile({ headerLogo: '' })} sx={{ ml: 1 }} />
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              <Divider sx={{ my: 1 }} />

              {/* Footer customization */}
              <SectionHeader id="footer" title="Pied de page" icon={<FontIcon fontSize="small" color="action" />} />
              <Collapse in={expandedSections.footer}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Format de pagination</InputLabel>
                        <Select
                          value={profile.footerPageFormat}
                          label="Format de pagination"
                          onChange={(e) => updateProfile({ footerPageFormat: e.target.value as ExportProfile['footerPageFormat'] })}
                        >
                          <MenuItem value="Page X/Y">Page X / Y</MenuItem>
                          <MenuItem value="Page X">Page X</MenuItem>
                          <MenuItem value="X/Y">X / Y</MenuItem>
                          <MenuItem value="none">Aucune pagination</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.footerSignatureBlock}
                            onChange={(e) => updateProfile({ footerSignatureBlock: e.target.checked })}
                          />
                        }
                        label="Bloc de signatures"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mentions legales"
                        value={profile.footerLegalMentions}
                        onChange={(e) => updateProfile({ footerLegalMentions: e.target.value })}
                        size="small"
                        placeholder="Ex: Conforme aux normes SYSCOHADA revisees"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              <Divider sx={{ my: 1 }} />

              {/* Style */}
              <SectionHeader id="style" title="Police, couleurs et marges" icon={<PaletteIcon fontSize="small" color="action" />} />
              <Collapse in={expandedSections.style}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Police de caracteres</InputLabel>
                        <Select
                          value={profile.fontFamily}
                          label="Police de caracteres"
                          onChange={(e) => updateProfile({ fontFamily: e.target.value })}
                        >
                          {FONT_OPTIONS.map(f => (
                            <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Couleur principale</Typography>
                        <input
                          type="color"
                          value={profile.primaryColor}
                          onChange={(e) => updateProfile({ primaryColor: e.target.value })}
                          style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }}
                        />
                        <Typography variant="caption" color="text.secondary">{profile.primaryColor}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Marge haut (mm)</Typography>
                      <Slider value={profile.marginTop} min={5} max={50} onChange={(_, v) => updateProfile({ marginTop: v as number })} valueLabelDisplay="auto" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Marge bas (mm)</Typography>
                      <Slider value={profile.marginBottom} min={5} max={50} onChange={(_, v) => updateProfile({ marginBottom: v as number })} valueLabelDisplay="auto" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Marge gauche (mm)</Typography>
                      <Slider value={profile.marginLeft} min={5} max={50} onChange={(_, v) => updateProfile({ marginLeft: v as number })} valueLabelDisplay="auto" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Marge droite (mm)</Typography>
                      <Slider value={profile.marginRight} min={5} max={50} onChange={(_, v) => updateProfile({ marginRight: v as number })} valueLabelDisplay="auto" size="small" />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              <Divider sx={{ my: 1 }} />

              {/* Pages management */}
              <SectionHeader id="pages" title={`Pages de la liasse (${pages.length} pages)`} icon={<DragIcon fontSize="small" color="action" />} />
              <Collapse in={expandedSections.pages}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {(Object.entries(sections) as [SectionId, typeof pages][]).map(([sectionKey, sectionPages]) => {
                    if (sectionPages.length === 0) return null
                    const isSectionExcluded = profile.excludedSections.includes(sectionKey)
                    return (
                      <Box key={sectionKey} sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: P.primary500 }}>
                            {SECTION_LABELS[sectionKey]} ({sectionPages.length})
                          </Typography>
                          <Tooltip title={isSectionExcluded ? 'Inclure cette section' : 'Exclure cette section'}>
                            <IconButton size="small" onClick={() => toggleExcludedSection(sectionKey)}>
                              {isSectionExcluded ? <IncludeIcon fontSize="small" color="success" /> : <ExcludeIcon fontSize="small" color="error" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, opacity: isSectionExcluded ? 0.4 : 1 }}>
                          {sectionPages.map(page => {
                            const isExcluded = profile.excludedPages.includes(page.id) || isSectionExcluded
                            const hasNote = !!profile.pageNotes[page.id]
                            return (
                              <Tooltip key={page.id} title={isExcluded ? 'Cliquer pour inclure' : 'Cliquer pour exclure'}>
                                <Chip
                                  label={page.label}
                                  size="small"
                                  variant={isExcluded ? 'outlined' : 'filled'}
                                  color={isExcluded ? 'default' : 'primary'}
                                  onClick={() => !isSectionExcluded && toggleExcludedPage(page.id)}
                                  onDoubleClick={() => setPageNoteEditing(page.id)}
                                  icon={hasNote ? <NoteIcon sx={{ fontSize: 14 }} /> : undefined}
                                  sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    textDecoration: isExcluded ? 'line-through' : 'none',
                                  }}
                                />
                              </Tooltip>
                            )
                          })}
                        </Box>
                        {/* Inline note editor */}
                        {sectionPages.some(p => p.id === pageNoteEditing) && (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label={`Note pour: ${sectionPages.find(p => p.id === pageNoteEditing)?.label}`}
                              value={profile.pageNotes[pageNoteEditing!] || ''}
                              onChange={(e) => {
                                const notes = { ...profile.pageNotes }
                                if (e.target.value) notes[pageNoteEditing!] = e.target.value
                                else delete notes[pageNoteEditing!]
                                updateProfile({ pageNotes: notes })
                              }}
                              onBlur={() => setPageNoteEditing(null)}
                              autoFocus
                              placeholder="Ajouter une note personnalisee pour cette page..."
                              multiline
                              rows={2}
                            />
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              </Collapse>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!profile.name.trim()}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}
            >
              Sauvegarder le profil
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
              Reinitialiser aux valeurs par defaut
            </Button>
            {saved && (
              <Chip icon={<CheckIcon />} label="Profil sauvegarde !" color="success" />
            )}
          </Stack>
        </Grid>

        {/* Right: Live preview summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, position: 'sticky', top: 16 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Apercu du profil
              </Typography>

              {/* Mini preview */}
              <Box sx={{
                border: `2px solid ${profile.primaryColor}`,
                borderRadius: 1,
                p: 2,
                mb: 2,
                fontFamily: profile.fontFamily,
                minHeight: 200,
                backgroundColor: '#fff',
              }}>
                {/* Header preview */}
                <Box sx={{ borderBottom: `1px solid ${profile.primaryColor}`, pb: 1, mb: 1 }}>
                  {profile.headerAdminHeader && (
                    <Typography sx={{ fontSize: 8, textAlign: 'center', color: P.primary500, fontFamily: profile.fontFamily }}>
                      {profile.headerAdminHeader}
                    </Typography>
                  )}
                  {profile.headerLogo && (
                    <Box sx={{ textAlign: 'center', mb: 0.5 }}>
                      <img src={profile.headerLogo} alt="" style={{ maxHeight: 20 }} />
                    </Box>
                  )}
                  {profile.headerCompanyName && (
                    <Typography sx={{ fontSize: 10, fontWeight: 700, textAlign: 'center', fontFamily: profile.fontFamily }}>
                      RAISON SOCIALE
                    </Typography>
                  )}
                  {profile.headerFiscalYear && (
                    <Typography sx={{ fontSize: 8, textAlign: 'center', color: P.primary500, fontFamily: profile.fontFamily }}>
                      Exercice {new Date().getFullYear()}
                    </Typography>
                  )}
                </Box>

                {/* Body preview */}
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 8, fontWeight: 600, color: profile.primaryColor, fontFamily: profile.fontFamily }}>
                    BILAN ACTIF
                  </Typography>
                  {[1, 2, 3].map(i => (
                    <Box key={i} sx={{ height: 6, backgroundColor: alpha(P.primary200, 0.5), borderRadius: 0.5, mb: 0.3 }} />
                  ))}
                </Box>

                {/* Footer preview */}
                <Box sx={{ borderTop: `1px solid ${profile.primaryColor}`, pt: 0.5, mt: 'auto' }}>
                  {profile.footerPageFormat !== 'none' && (
                    <Typography sx={{ fontSize: 7, textAlign: 'center', color: P.primary400, fontFamily: profile.fontFamily }}>
                      {profile.footerPageFormat.replace('X', '1').replace('Y', String(pages.length))}
                    </Typography>
                  )}
                  {profile.footerLegalMentions && (
                    <Typography sx={{ fontSize: 6, textAlign: 'center', color: P.primary400, fontFamily: profile.fontFamily }}>
                      {profile.footerLegalMentions.slice(0, 60)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Summary stats */}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Pays</Typography>
                  <Typography variant="caption" fontWeight={600}>{country.flag} {country.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Regime</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {REGIME_OPTIONS.find(r => r.key === selectedRegime)?.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Pages incluses</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {pages.length - profile.excludedPages.filter(id => pages.some(p => p.id === id)).length} / {pages.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Sections exclues</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {profile.excludedSections.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Notes ajoutees</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {Object.keys(profile.pageNotes).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Police</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ fontFamily: profile.fontFamily }}>
                    {profile.fontFamily}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CountryCustomization
