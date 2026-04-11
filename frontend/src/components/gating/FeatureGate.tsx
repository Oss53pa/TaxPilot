/**
 * FeatureGate — Wrapper qui rend ses enfants si la feature est incluse
 * dans le plan actif, sinon rend le fallback (ou rien).
 *
 * Usage :
 *   <FeatureGate feature="multi_societes_illimite" fallback={<UpgradeBanner feature="multi_societes_illimite" />}>
 *     <CompanySwitcher />
 *   </FeatureGate>
 *
 * Modes :
 *   - Sans fallback : masque completement les enfants si verrouille
 *   - Avec fallback : remplace les enfants par le fallback
 *   - mode="hide" : meme chose que sans fallback
 *   - mode="disabled" : rend les enfants mais desactives (via overlay gris)
 */
import React from 'react'
import { Box } from '@mui/material'
import { useTenantPlan, type CabinetFeature } from '@/hooks/useTenantPlan'

interface FeatureGateProps {
  feature: CabinetFeature
  children: React.ReactNode
  fallback?: React.ReactNode
  /** 'hide' (defaut) : masque les enfants ; 'disabled' : les rend desactives */
  mode?: 'hide' | 'disabled'
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
  mode = 'hide',
}) => {
  const { hasFeature, isLoading } = useTenantPlan()

  // Pendant le chargement du plan, masquer par defaut
  if (isLoading) {
    return null
  }

  if (hasFeature(feature)) {
    return <>{children}</>
  }

  // Feature verrouillee
  if (mode === 'disabled') {
    return (
      <Box
        sx={{
          position: 'relative',
          opacity: 0.4,
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'grayscale(100%)',
        }}
        aria-disabled="true"
        data-feature-locked={feature}
      >
        {children}
      </Box>
    )
  }

  // mode = 'hide' : afficher le fallback ou rien
  return <>{fallback}</>
}

export default FeatureGate
