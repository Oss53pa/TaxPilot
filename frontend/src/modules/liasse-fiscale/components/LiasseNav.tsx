import React, { useState, useMemo } from 'react'
import { Box, List, ListItemButton, ListItemText, Collapse, Typography, Select, MenuItem, Chip, IconButton } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { ExpandLess, ExpandMore, Description as DescriptionIcon, ChevronLeft } from '@mui/icons-material'
import { PAGES } from '../config'
import { SECTION_LABELS, REGIMES, getRegime, type SectionKey, type RegimeImposition } from '../types'

interface LiasseNavProps {
  currentPageId: string
  onPageSelect: (id: string) => void
  regime: RegimeImposition
  onRegimeChange: (regime: RegimeImposition) => void
  onCollapse?: () => void
}

const SECTION_ORDER: SectionKey[] = ['couverture', 'fiches', 'etats', 'notes', 'supplements', 'gardes', 'commentaire']

const LiasseNav: React.FC<LiasseNavProps> = ({ currentPageId, onPageSelect, regime, onRegimeChange, onCollapse }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const current = PAGES.find(p => p.id === currentPageId)
    const initial: Record<string, boolean> = {}
    SECTION_ORDER.forEach(s => { initial[s] = current?.section === s })
    if (!current) initial['couverture'] = true
    return initial
  })

  const regimeDef = useMemo(() => getRegime(regime), [regime])

  const obligatoireCount = regimeDef.obligatoires.size
  const facultatifCount = PAGES.length - obligatoireCount

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleRegimeChange = (e: SelectChangeEvent) => {
    onRegimeChange(e.target.value as RegimeImposition)
  }

  return (
    <Box sx={{
      width: 280,
      minWidth: 280,
      height: '100%',
      borderRight: '1px solid #e5e5e5',
      borderRadius: 2,
      bgcolor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Structure Liasse header — fixed */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e5e5e5', bgcolor: '#171717', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: 18, color: '#a3a3a3' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', letterSpacing: 0.5, flexGrow: 1 }}>
            Structure Liasse
          </Typography>
          {onCollapse && (
            <IconButton size="small" onClick={onCollapse} sx={{ color: '#a3a3a3', '&:hover': { color: '#fff' }, p: 0.25 }}>
              <ChevronLeft sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        <Typography sx={{ fontSize: '0.65rem', color: '#a3a3a3', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Régime d'imposition
        </Typography>
        <Select
          value={regime}
          onChange={handleRegimeChange}
          size="small"
          fullWidth
          sx={{
            bgcolor: '#262626',
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 600,
            mb: 1.5,
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#404040' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#525252' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#737373' },
            '.MuiSelect-icon': { color: '#a3a3a3' },
            '.MuiSelect-select': { py: 0.75 },
          }}
        >
          {REGIMES.map(r => (
            <MenuItem key={r.code} value={r.code} sx={{ fontSize: '0.8rem' }}>
              {r.label}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${obligatoireCount} obligatoires`}
            size="small"
            sx={{
              bgcolor: '#166534',
              color: '#bbf7d0',
              fontSize: '0.68rem',
              fontWeight: 600,
              height: 22,
            }}
          />
          <Chip
            label={`${facultatifCount} facultatifs`}
            size="small"
            sx={{
              bgcolor: '#1e3a5f',
              color: '#93c5fd',
              fontSize: '0.68rem',
              fontWeight: 600,
              height: 22,
            }}
          />
        </Box>
      </Box>

      {/* Navigation label — fixed */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e5e5e5', flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#525252', textTransform: 'uppercase', letterSpacing: 1 }}>
          Navigation
        </Typography>
        <Typography variant="caption" sx={{ color: '#a3a3a3' }}>
          {PAGES.length} pages
        </Typography>
      </Box>

      {/* Scrollable page list */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#d4d4d4', borderRadius: 3 },
      }}>
      <List dense disablePadding>
        {SECTION_ORDER.map(section => {
          const sectionPages = PAGES.filter(p => p.section === section)
          if (sectionPages.length === 0) return null

          return (
            <React.Fragment key={section}>
              <ListItemButton
                onClick={() => toggleSection(section)}
                sx={{
                  py: 0.75,
                  px: 2,
                  bgcolor: '#f5f5f5',
                  borderBottom: '1px solid #e5e5e5',
                  '&:hover': { bgcolor: '#e5e5e5' },
                }}
              >
                <ListItemText
                  primary={SECTION_LABELS[section]}
                  primaryTypographyProps={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#404040',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#a3a3a3', mr: 0.5 }}>
                  {sectionPages.length}
                </Typography>
                {openSections[section] ? <ExpandLess sx={{ fontSize: 16, color: '#a3a3a3' }} /> : <ExpandMore sx={{ fontSize: 16, color: '#a3a3a3' }} />}
              </ListItemButton>

              <Collapse in={openSections[section]} timeout="auto" unmountOnExit>
                <List dense disablePadding>
                  {sectionPages.map(page => {
                    const isActive = page.id === currentPageId
                    return (
                      <ListItemButton
                        key={page.id}
                        selected={isActive}
                        onClick={() => onPageSelect(page.id)}
                        sx={{
                          py: 0.5,
                          pl: 3,
                          pr: 1,
                          minHeight: 32,
                          borderLeft: isActive ? '3px solid #171717' : '3px solid transparent',
                          bgcolor: isActive ? '#e5e5e5' : 'transparent',
                          '&:hover': { bgcolor: '#e5e5e5' },
                          '&.Mui-selected': {
                            bgcolor: '#e5e5e5',
                            '&:hover': { bgcolor: '#d4d4d4' },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            color: '#a3a3a3',
                            minWidth: 22,
                            mr: 1,
                            fontWeight: 600,
                          }}
                        >
                          {page.numero}
                        </Typography>
                        <ListItemText
                          primary={page.ongletExcel}
                          primaryTypographyProps={{
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#171717' : '#525252',
                            noWrap: true,
                          }}
                        />
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: regimeDef.obligatoires.has(page.id) ? '#22c55e' : '#3b82f6',
                          flexShrink: 0,
                          ml: 0.5,
                          opacity: 0.7,
                        }} />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          )
        })}
      </List>
      </Box>
    </Box>
  )
}

export default LiasseNav
