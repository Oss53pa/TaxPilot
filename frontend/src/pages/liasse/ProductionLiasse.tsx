/**
 * Module « Production Liasse » à onglets :
 *   Liasse Fiscale · Contrôle de Liasse · Génération Auto · Templates Export
 */
import React from 'react'
import {
  Assignment as LiasseIcon,
  Security as ControlIcon,
  Description as GenIcon,
  CloudUpload as TemplateIcon,
} from '@mui/icons-material'
import TabbedModule from '@/components/shared/TabbedModule'
import LiasseFiscale from '@/pages/liasse/LiasseFiscale'
import LiasseControlInterface from '@/pages/validation/LiasseControlInterface'
import ModernGeneration from '@/pages/generation/ModernGeneration'
import ModernTemplates from '@/pages/templates/ModernTemplates'

const ProductionLiasse: React.FC = () => (
  <TabbedModule
    basePath="/production-liasse"
    tabs={[
      { key: 'liasse', label: 'Liasse Fiscale', icon: <LiasseIcon sx={{ fontSize: 18 }} />, element: <LiasseFiscale /> },
      { key: 'controle', label: 'Contrôle de Liasse', icon: <ControlIcon sx={{ fontSize: 18 }} />, element: <LiasseControlInterface /> },
      { key: 'generation', label: 'Génération Auto', icon: <GenIcon sx={{ fontSize: 18 }} />, element: <ModernGeneration /> },
      { key: 'templates', label: 'Templates Export', icon: <TemplateIcon sx={{ fontSize: 18 }} />, element: <ModernTemplates /> },
    ]}
  />
)

export default ProductionLiasse
