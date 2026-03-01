/**
 * Selecteur d'exercice fiscal pour la sidebar
 * Affiche l'exercice actif avec chip statut, et permet de switcher
 */

import React, { useState } from 'react'
import {
  Box,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Add as AddIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useExercice } from '../../hooks/useExercice'
import type { StatutExercice } from '../../services/exerciceStorageService'
import CreateExerciceModal from './CreateExerciceModal'

const statutColors: Record<StatutExercice, string> = {
  en_cours: P.info,
  cloture: P.warning,
  valide: P.success,
  depose: '#8b5cf6',
}

const statutLabels: Record<StatutExercice, string> = {
  en_cours: 'En cours',
  cloture: 'Cloture',
  valide: 'Valide',
  depose: 'Depose',
}

interface Props {
  collapsed?: boolean
}

const ExerciceSelector: React.FC<Props> = ({ collapsed = false }) => {
  const { activeExercice, exercices, setActiveExercice } = useExercice()
  const [createOpen, setCreateOpen] = useState(false)

  if (collapsed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
        <Tooltip title={activeExercice ? `Exercice ${activeExercice.annee}` : 'Aucun exercice'} placement="right">
          <Box
            sx={{
              bgcolor: P.primary800,
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <CalendarIcon sx={{ fontSize: 14, color: P.primary400 }} />
            <Typography sx={{ color: P.white, fontSize: '0.7rem', fontWeight: 600 }}>
              {activeExercice?.annee || '---'}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Select
          size="small"
          value={activeExercice?.annee || ''}
          onChange={e => setActiveExercice(e.target.value)}
          displayEmpty
          sx={{
            flex: 1,
            bgcolor: P.primary800,
            color: P.white,
            borderRadius: 2,
            fontSize: '0.8rem',
            '& .MuiSelect-select': { py: 0.75, px: 1.5 },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: P.primary700 },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: P.primary500 },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: P.primary400 },
            '& .MuiSvgIcon-root': { color: P.primary400 },
          }}
          renderValue={(value) => {
            if (!value) return <span style={{ color: P.primary500 }}>Aucun exercice</span>
            const ex = exercices.find(e => e.annee === value)
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: P.primary400 }} />
                <span>{value}</span>
                {ex && (
                  <Chip
                    label={statutLabels[ex.statut]}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      bgcolor: statutColors[ex.statut] + '22',
                      color: statutColors[ex.statut],
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            )
          }}
          MenuProps={{
            PaperProps: {
              sx: { bgcolor: P.primary900, color: P.white, border: `1px solid ${P.primary700}` },
            },
          }}
        >
          {exercices.map(ex => (
            <MenuItem
              key={ex.annee}
              value={ex.annee}
              sx={{
                fontSize: '0.8rem',
                color: P.white,
                '&:hover': { bgcolor: P.primary800 },
                '&.Mui-selected': { bgcolor: P.primary700 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span>{ex.annee}</span>
                <Chip
                  label={statutLabels[ex.statut]}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    bgcolor: statutColors[ex.statut] + '22',
                    color: statutColors[ex.statut],
                    borderRadius: 1,
                    ml: 'auto',
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
        <Tooltip title="Nouvel exercice" placement="right">
          <IconButton
            size="small"
            onClick={() => setCreateOpen(true)}
            sx={{
              color: P.primary400,
              '&:hover': { color: P.white, bgcolor: P.primary800 },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <CreateExerciceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export default ExerciceSelector
