import React, { useState, useMemo, useCallback } from 'react'
import {
  Box, Typography, Paper, Button, Chip, Card, CardContent, Grid, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  School as SchoolIcon,
  PlayCircle as VideoIcon,
  Description as GuideIcon,
  Edit as ExerciseIcon,
  CheckCircle as DoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { MODULES_FORMATION, type ModuleFormation } from '@/data/formations'

const STORAGE_KEY = 'fiscasync_formations_terminees'

function loadTermines(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

const typeConfig = {
  video: { icon: <VideoIcon sx={{ fontSize: 16 }} />, label: 'Vidéo', color: '#1976d2' as const },
  guide: { icon: <GuideIcon sx={{ fontSize: 16 }} />, label: 'Guide', color: '#7b1fa2' as const },
  exercice: { icon: <ExerciseIcon sx={{ fontSize: 16 }} />, label: 'Exercice', color: '#e65100' as const },
}

const niveauConfig = {
  debutant: { label: 'Débutant', color: 'success' as const },
  intermediaire: { label: 'Intermédiaire', color: 'warning' as const },
  avance: { label: 'Avancé', color: 'error' as const },
}

const FormationPage: React.FC = () => {
  const [filtre, setFiltre] = useState<string>('tous')
  const [moduleActif, setModuleActif] = useState<ModuleFormation | null>(null)
  const [termines, setTermines] = useState<string[]>(loadTermines)

  const modulesFiltres = useMemo(() =>
    filtre === 'tous' ? MODULES_FORMATION : MODULES_FORMATION.filter(m => m.niveau === filtre),
    [filtre]
  )

  const progression = Math.round((termines.length / MODULES_FORMATION.length) * 100)

  const marquerTermine = useCallback((id: string) => {
    const updated = [...new Set([...termines, id])]
    setTermines(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [termines])

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 4, px: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.75 }}>
          <Box sx={{ width: 4, borderRadius: 2, flexShrink: 0, background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 55%, #115e59 100%)' }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Centre de Formation</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {MODULES_FORMATION.length} modules — Maîtrisez LiassPilot et SYSCOHADA
            </Typography>
          </Box>
        </Box>
        <Paper sx={{ p: 2, minWidth: 200, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            {termines.length}/{MODULES_FORMATION.length} modules complétés
          </Typography>
          <LinearProgress variant="determinate" value={progression}
            sx={{ mt: 1, height: 8, borderRadius: 4 }} color={progression === 100 ? 'success' : 'primary'} />
          <Typography variant="caption" color={progression === 100 ? 'success.main' : 'primary.main'}
            sx={{ fontWeight: 600 }}>{progression}%</Typography>
        </Paper>
      </Box>

      {/* Filtres */}
      <ToggleButtonGroup value={filtre} exclusive size="small" sx={{ mb: 3 }}
        onChange={(_, v) => v && setFiltre(v)}>
        <ToggleButton value="tous" sx={{ textTransform: 'none' }}>Tous</ToggleButton>
        <ToggleButton value="debutant" sx={{ textTransform: 'none' }}>Débutant</ToggleButton>
        <ToggleButton value="intermediaire" sx={{ textTransform: 'none' }}>Intermédiaire</ToggleButton>
        <ToggleButton value="avance" sx={{ textTransform: 'none' }}>Avancé</ToggleButton>
      </ToggleButtonGroup>

      {/* Grille modules */}
      <Grid container spacing={2}>
        {modulesFiltres.map(m => {
          const done = termines.includes(m.id)
          const tc = typeConfig[m.type]
          const nc = niveauConfig[m.niveau]
          return (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <Card
                elevation={0}
                onClick={() => setModuleActif(m)}
                sx={{
                  border: '1px solid',
                  borderColor: done ? 'success.light' : 'divider',
                  bgcolor: done ? 'success.50' : 'background.paper',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>{m.id}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{m.duree}</Typography>
                      {done && <DoneIcon color="success" sx={{ fontSize: 16 }} />}
                    </Stack>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{m.titre}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                    {m.description}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    {m.tags.slice(0, 3).map(t => (
                      <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip icon={tc.icon} label={tc.label} size="small"
                      sx={{ bgcolor: `${tc.color}15`, color: tc.color, fontSize: '0.65rem', height: 22 }} />
                    <Chip label={nc.label} size="small" color={nc.color} variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 22 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Modal module */}
      <Dialog open={!!moduleActif} onClose={() => setModuleActif(null)} maxWidth="sm" fullWidth>
        {moduleActif && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{moduleActif.titre}</Typography>
              <Button size="small" onClick={() => setModuleActif(null)} sx={{ minWidth: 0 }}>
                <CloseIcon fontSize="small" />
              </Button>
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{moduleActif.description}</Typography>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', mb: 2 }}>
                {typeConfig[moduleActif.type].icon}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {moduleActif.type === 'video' ? 'Vidéo bientôt disponible' : 'Guide PDF disponible dans votre espace'}
                </Typography>
              </Paper>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {moduleActif.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">Durée : {moduleActif.duree}</Typography>
              {!termines.includes(moduleActif.id) ? (
                <Button variant="contained" color="success"
                  onClick={() => { marquerTermine(moduleActif.id); setModuleActif(null) }}>
                  Marquer comme terminé
                </Button>
              ) : (
                <Chip icon={<DoneIcon />} label="Complété" color="success" />
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default FormationPage
