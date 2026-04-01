import React from 'react'
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { DarkMode, LightMode, SettingsBrightness } from '@mui/icons-material'
import { useThemeStore } from '@/store/themeStore'

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const icon = mode === 'dark' ? <DarkMode /> : mode === 'light' ? <LightMode /> : <SettingsBrightness />

  return (
    <>
      <Tooltip title="Thème">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          {icon}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setMode('light'); setAnchorEl(null) }} selected={mode === 'light'}>
          <ListItemIcon><LightMode fontSize="small" /></ListItemIcon>
          <ListItemText>Clair</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMode('dark'); setAnchorEl(null) }} selected={mode === 'dark'}>
          <ListItemIcon><DarkMode fontSize="small" /></ListItemIcon>
          <ListItemText>Sombre</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMode('system'); setAnchorEl(null) }} selected={mode === 'system'}>
          <ListItemIcon><SettingsBrightness fontSize="small" /></ListItemIcon>
          <ListItemText>Système</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default ThemeToggle
