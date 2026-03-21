/**
 * BrandingPage — Customisation de la page de garde
 * Onglet dans Parametrage pour configurer pays, logo, couleurs, police, pied de page
 */

import React, { useState } from 'react'
import {
  Box, Typography, TextField, Select, MenuItem, Button, Slider,
  Switch, Card, CardContent, Grid, Divider, FormControl, InputLabel,
  FormControlLabel, Stack, Alert,
} from '@mui/material'
import { Visibility as PreviewIcon } from '@mui/icons-material'
import { useEntrepriseConfig } from '@/hooks/useEntrepriseConfig'
import { PAYS_VISUAL_CONFIGS } from '@/config/paysTheme'
import { DrapeauPays } from '@/components/ui/DrapeauPays'
import type { Entreprise } from '@/services/entrepriseService'

const COUNTRY_OPTIONS = Object.values(PAYS_VISUAL_CONFIGS).map(c => ({
  code: c.codePaysIso,
  label: c.nomPays,
}))

const FONT_OPTIONS = ['Arial', 'Times New Roman', 'Calibri', 'Georgia', 'Helvetica']

const BrandingPage: React.FC = () => {
  const { entreprise, updateEntreprise } = useEntrepriseConfig()
  const [showPreview, setShowPreview] = useState(false)

  const codePays = entreprise.code_pays_iso || 'CI'
  const paysDefault = PAYS_VISUAL_CONFIGS[codePays]?.theme

  const update = (field: keyof Entreprise, value: any) => {
    updateEntreprise({ [field]: value } as any)
  }

  const updateSurcharge = (key: string, value: string) => {
    const current = (entreprise.branding_surcharge_theme || {}) as Record<string, any>
    update('branding_surcharge_theme' as any, { ...current, [key]: value || undefined })
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        Personnalisation de la page de garde
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configurez l'apparence de la page de garde de votre liasse fiscale.
        Les modifications sont appliquees automatiquement.
      </Typography>

      {/* ── SECTION PAYS ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Pays et administration fiscale
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Pays</InputLabel>
                <Select
                  value={codePays}
                  label="Pays"
                  onChange={e => update('code_pays_iso' as any, e.target.value)}
                >
                  {COUNTRY_OPTIONS.map(c => (
                    <MenuItem key={c.code} value={c.code}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DrapeauPays codePays={c.code} width={24} height={16} />
                        <span>{c.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DrapeauPays codePays={codePays} width={60} height={40} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {PAYS_VISUAL_CONFIGS[codePays]?.nomAdminFiscale || 'Administration fiscale'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {PAYS_VISUAL_CONFIGS[codePays]?.refFormulaire || 'Liasse SYSCOHADA'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Le theme couleurs et le drapeau s'ajustent automatiquement selon le pays.
            Vous pouvez les surcharger ci-dessous.
          </Alert>
        </CardContent>
      </Card>

      {/* ── SECTION LOGO ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Logo de l'entreprise
          </Typography>
          {/* TODO: Replace with Supabase Storage upload when available */}
          <TextField
            label="URL du logo"
            fullWidth
            size="small"
            placeholder="https://..."
            value={entreprise.branding_logo_url || ''}
            onChange={e => update('branding_logo_url' as any, e.target.value)}
            helperText="Collez l'URL de votre logo (PNG, SVG). Upload Supabase a venir."
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Largeur (px)"
                type="number"
                size="small"
                fullWidth
                value={entreprise.branding_logo_width || 120}
                onChange={e => update('branding_logo_width' as any, Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hauteur (px)"
                type="number"
                size="small"
                fullWidth
                value={entreprise.branding_logo_height || 60}
                onChange={e => update('branding_logo_height' as any, Number(e.target.value))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── SECTION IMAGE DE FOND ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Image de fond (optionnelle)
          </Typography>
          <TextField
            label="URL de l'image de fond"
            fullWidth
            size="small"
            placeholder="https://..."
            value={entreprise.branding_image_fond_url || ''}
            onChange={e => update('branding_image_fond_url' as any, e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Opacite : {entreprise.branding_image_fond_opacite ?? 10}%
            </Typography>
            <Slider
              value={entreprise.branding_image_fond_opacite ?? 10}
              onChange={(_, v) => update('branding_image_fond_opacite' as any, v as number)}
              min={0}
              max={30}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>
        </CardContent>
      </Card>

      {/* ── SECTION COULEURS ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Couleurs personnalisees
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Laissez vide pour utiliser les couleurs officielles du pays selectionne.
          </Typography>
          <Grid container spacing={2}>
            {[
              { key: 'couleurPrimaire', label: 'Bandeau principal', fallback: paysDefault?.couleurPrimaire },
              { key: 'couleurSecondaire', label: 'Accent', fallback: paysDefault?.couleurSecondaire },
              { key: 'couleurTitre', label: 'Titres de section', fallback: paysDefault?.couleurTitre },
              { key: 'couleurBordure', label: 'Bordures', fallback: paysDefault?.couleurBordure },
            ].map(c => (
              <Grid item xs={6} sm={3} key={c.key}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>{c.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={(entreprise.branding_surcharge_theme as any)?.[c.key] || c.fallback || '#333333'}
                    onChange={e => updateSurcharge(c.key, e.target.value)}
                    style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {c.fallback}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── SECTION TYPOGRAPHIE ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Typographie
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Police des titres</InputLabel>
            <Select
              value={(entreprise.branding_surcharge_theme as any)?.fonteTitre || 'Arial'}
              label="Police des titres"
              onChange={e => updateSurcharge('fonteTitre', e.target.value)}
            >
              {FONT_OPTIONS.map(f => (
                <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* ── SECTION PIED DE PAGE ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Pied de page
          </Typography>
          <TextField
            label="Texte personnalise"
            fullWidth
            size="small"
            placeholder="Ex: Document confidentiel — Ne pas diffuser"
            value={entreprise.branding_pied_page_texte || ''}
            onChange={e => update('branding_pied_page_texte' as any, e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={entreprise.branding_pied_page_logo !== false}
                onChange={e => update('branding_pied_page_logo' as any, e.target.checked)}
              />
            }
            label="Afficher 'Genere par Liass'Pilot'"
          />
        </CardContent>
      </Card>

      {/* ── APERÇU ── */}
      <Button
        variant="contained"
        startIcon={<PreviewIcon />}
        onClick={() => setShowPreview(!showPreview)}
        sx={{
          bgcolor: 'text.primary', color: '#fff', textTransform: 'none', fontWeight: 600,
          '&:hover': { bgcolor: 'grey.800' },
        }}
      >
        {showPreview ? "Masquer l'apercu" : "Apercu de la page de garde"}
      </Button>

      {showPreview && (
        <Box sx={{ mt: 3, border: '1px solid #e5e5e5', borderRadius: 2, overflow: 'hidden' }}>
          <React.Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Chargement...</Box>}>
            <PageDeGardePreview entreprise={entreprise} />
          </React.Suspense>
        </Box>
      )}
    </Box>
  )
}

/** Lazy-loaded preview to avoid circular deps */
const PageDeGardeCustomisable = React.lazy(() => import('@/components/liasse/sheets/PageDeGardeCustomisable'))

const PageDeGardePreview: React.FC<{ entreprise: Partial<Entreprise> }> = ({ entreprise }) => (
  <PageDeGardeCustomisable entreprise={entreprise} />
)

export default BrandingPage
