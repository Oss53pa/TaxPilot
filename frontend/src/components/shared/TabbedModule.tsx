/**
 * TabbedModule — coquille générique pour un MODULE à onglets.
 *
 * Regroupe plusieurs pages métier sous une seule entrée sidebar, avec onglets.
 * L'onglet actif est piloté par l'URL (`${basePath}/${tab.key}`) → liens
 * profonds, sélection sidebar et navigation arrière/avant fonctionnent.
 * Seul l'onglet actif est monté (les autres `element` ne sont pas rendus).
 */
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Tabs, Tab, Paper } from '@mui/material'

export interface ModuleTab {
  key: string
  label: string
  icon: React.ReactElement
  element: React.ReactNode
}

interface TabbedModuleProps {
  basePath: string
  tabs: ModuleTab[]
}

const TabbedModule: React.FC<TabbedModuleProps> = ({ basePath, tabs }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const rest = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length).replace(/^\/+/, '')
    : ''
  const seg = rest.split('/')[0] || tabs[0]?.key
  const current = Math.max(0, tabs.findIndex((t) => t.key === seg))

  // Colonne flex BORNÉE en hauteur : la barre d'onglets reste fixe en haut
  // (flexShrink:0), et le contenu de l'onglet occupe le reste (flexGrow:1) avec
  // son propre défilement. Ainsi :
  //  - un onglet « atelier » à hauteur bornée (ex. Liasse Fiscale, dont la racine
  //    est height:100% + overflow:hidden) reçoit enfin une hauteur définie → ses
  //    sous-panneaux (sidebars fixes, centre scrollable) fonctionnent ;
  //  - un onglet « page normale » plus haute que la zone défile dans cette zone
  //    (overflow:auto), exactement comme une page classique — zéro régression.
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Paper
        elevation={0}
        sx={{
          flexShrink: 0,
          mb: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={current}
          onChange={(_, v) => navigate(`${basePath}/${tabs[v].key}`)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 1, minHeight: 50 }}
        >
          {tabs.map((t) => (
            <Tab
              key={t.key}
              icon={t.icon}
              iconPosition="start"
              label={t.label}
              sx={{ minHeight: 50, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
        {tabs[current]?.element}
      </Box>
    </Box>
  )
}

export default TabbedModule
