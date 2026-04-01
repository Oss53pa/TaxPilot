import React from 'react'
import { IconButton, Tooltip, Menu, MenuItem, ListItemText } from '@mui/material'
import { Language as LanguageIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
]

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  return (
    <>
      <Tooltip title="Langue / Language">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {languages.map(lang => (
          <MenuItem
            key={lang.code}
            selected={i18n.language === lang.code}
            onClick={() => { i18n.changeLanguage(lang.code); setAnchorEl(null) }}
          >
            <ListItemText>{lang.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSelector
