/**
 * Module « Finalisation » à onglets :
 *   Télédéclaration · Reporting · Archives
 */
import React from 'react'
import {
  Analytics as TeledecIcon,
  BarChart as ReportingIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material'
import TabbedModule from '@/components/shared/TabbedModule'
import ModernTeledeclaration from '@/pages/teledeclaration/ModernTeledeclaration'
import ModernReporting from '@/pages/reporting/ModernReporting'
import ArchivesPage from '@/pages/archives/ArchivesPage'

const Finalisation: React.FC = () => (
  <TabbedModule
    basePath="/finalisation"
    tabs={[
      { key: 'teledeclaration', label: 'Télédéclaration', icon: <TeledecIcon sx={{ fontSize: 18 }} />, element: <ModernTeledeclaration /> },
      { key: 'reporting', label: 'Reporting', icon: <ReportingIcon sx={{ fontSize: 18 }} />, element: <ModernReporting /> },
      { key: 'archives', label: 'Archives', icon: <ArchiveIcon sx={{ fontSize: 18 }} />, element: <ArchivesPage /> },
    ]}
  />
)

export default Finalisation
