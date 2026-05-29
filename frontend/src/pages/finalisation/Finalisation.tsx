/**
 * Module « Finalisation » à onglets :
 *   Statut & Verrouillage · Télédéclaration · Reporting · Archives
 */
import React from 'react'
import {
  Analytics as TeledecIcon,
  BarChart as ReportingIcon,
  Archive as ArchiveIcon,
  VerifiedUser as StatutIcon,
} from '@mui/icons-material'
import TabbedModule from '@/components/shared/TabbedModule'
import ModernTeledeclaration from '@/pages/teledeclaration/ModernTeledeclaration'
import ModernReporting from '@/pages/reporting/ModernReporting'
import ArchivesPage from '@/pages/archives/ArchivesPage'
import LiasseWorkflowPanel from '@/components/liasse/LiasseWorkflowPanel'

const Finalisation: React.FC = () => (
  <TabbedModule
    basePath="/finalisation"
    tabs={[
      { key: 'statut', label: 'Statut & Verrouillage', icon: <StatutIcon sx={{ fontSize: 18 }} />, element: <LiasseWorkflowPanel /> },
      { key: 'teledeclaration', label: 'Télédéclaration', icon: <TeledecIcon sx={{ fontSize: 18 }} />, element: <ModernTeledeclaration /> },
      { key: 'reporting', label: 'Reporting', icon: <ReportingIcon sx={{ fontSize: 18 }} />, element: <ModernReporting /> },
      { key: 'archives', label: 'Archives', icon: <ArchiveIcon sx={{ fontSize: 18 }} />, element: <ArchivesPage /> },
    ]}
  />
)

export default Finalisation
