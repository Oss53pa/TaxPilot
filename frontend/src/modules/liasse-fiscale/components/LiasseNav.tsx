import React, { useState, useMemo } from 'react'
import { Box, List, ListItemButton, ListItemText, Collapse, Typography, Select, MenuItem, Chip, IconButton } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { ExpandLess, ExpandMore, Description as DescriptionIcon, ChevronLeft } from '@mui/icons-material'
import { getPagesForRegime } from '@/config/liasse-pages-config'
import { PAGES } from '../config'
import { SECTION_LABELS, REGIMES, getRegime, toConfigRegime, type SectionKey, type RegimeImposition } from '../types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

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

  // Filter pages by regime using the master config
  const filteredPages = useMemo(() => {
    const configRegime = toConfigRegime(regime)
    const allowedIds = new Set(getPagesForRegime(configRegime).map(p => p.moduleId))
    return PAGES.filter(p => allowedIds.has(p.id))
  }, [regime])

  const obligatoireCount = useMemo(() => {
    return filteredPages.filter(p => regimeDef.obligatoires.has(p.id)).length
  }, [filteredPages, regimeDef])
  const facultatifCount = filteredPages.length - obligatoireCount

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
      borderRight: `1px solid ${P.primary200}`,
      borderRadius: 2,
      bgcolor: P.primary50,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Structure Liasse header — Nordic Slate charcoal */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${P.primary800}`, bgcolor: P.primary900, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: 18, color: P.tealLight }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: P.white, letterSpacing: 0.3, flexGrow: 1 }}>
            Structure Liasse
          </Typography>
          {onCollapse && (
            <IconButton size="small" onClick={onCollapse} sx={{ color: P.primary400, '&:hover': { color: P.tealLight }, p: 0.25 }}>
              <ChevronLeft sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        <Typography sx={{
          fontSize: '0.65rem', color: P.primary400, mb: 0.5,
          textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
        }}>
          Régime d{'’'}imposition
        </Typography>
        <Select
          value={regime}
          onChange={handleRegimeChange}
          size="small"
          fullWidth
          sx={{
            bgcolor: P.primary800,
            color: P.white,
            fontSize: '0.78rem',
            fontWeight: 600,
            mb: 1.5,
            '.MuiOutlinedInput-notchedOutline': { borderColor: P.primary700 },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: P.primary500 },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: P.teal },
            '.MuiSelect-icon': { color: P.primary400 },
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
              bgcolor: 'rgba(15, 118, 110, 0.18)',
              color: P.tealLight,
              border: `1px solid ${P.tealBorder}33`,
              fontSize: '0.68rem',
              fontWeight: 600,
              height: 22,
            }}
          />
          <Chip
            label={`${facultatifCount} facultatifs`}
            size="small"
            sx={{
              bgcolor: P.primary800,
              color: P.primary300,
              border: `1px solid ${P.primary700}`,
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
          {filteredPages.length} pages
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
          const sectionPages = filteredPages.filter(p => p.section === section)
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
                          // Page active = accent teal Nordic Slate
                          borderLeft: isActive ? '3px solid #0f766e' : '3px solid transparent',
                          bgcolor: isActive ? 'rgba(15, 118, 110, 0.10)' : 'transparent',
                          transition: 'background-color 180ms cubic-bezier(0.4, 0, 0.2, 1), border-left-color 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { bgcolor: isActive ? 'rgba(15, 118, 110, 0.16)' : 'rgba(15, 118, 110, 0.06)' },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(15, 118, 110, 0.10)',
                            '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.16)' },
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
