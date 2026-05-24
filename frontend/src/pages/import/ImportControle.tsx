/**
 * Module « Import & Contrôle » à onglets :
 *   Import Balance · Journal des Imports · Consultation Balance · Audit & Corrections
 */
import React from 'react'
import {
  CloudUpload as ImportIcon,
  History as HistoryIcon,
  AccountBalance as BalanceIcon,
  Security as AuditIcon,
} from '@mui/icons-material'
import TabbedModule from '@/components/shared/TabbedModule'
import ModernImportBalance from './ModernImportBalance'
import ImportHistoryPage from './ImportHistoryPage'
import ModernBalance from '../balance/ModernBalance'
import ModernAudit from '../audit/ModernAudit'

const ImportControle: React.FC = () => (
  <TabbedModule
    basePath="/import-controle"
    tabs={[
      { key: 'import', label: 'Import Balance', icon: <ImportIcon sx={{ fontSize: 18 }} />, element: <ModernImportBalance /> },
      { key: 'journal', label: 'Journal des Imports', icon: <HistoryIcon sx={{ fontSize: 18 }} />, element: <ImportHistoryPage /> },
      { key: 'consultation', label: 'Consultation Balance', icon: <BalanceIcon sx={{ fontSize: 18 }} />, element: <ModernBalance /> },
      { key: 'audit', label: 'Audit & Corrections', icon: <AuditIcon sx={{ fontSize: 18 }} />, element: <ModernAudit /> },
    ]}
  />
)

export default ImportControle
