import React from 'react'
import { Box, Typography } from '@mui/material'
import type { PageProps } from '../../types'
import { useLiasseRegime } from '../LiasseHeader'

const REGIME_SYSTEME: Record<string, string> = {
  REEL_NORMAL: 'SYSTEME NORMAL',
  REEL_SIMPLIFIE: 'SYSTEME ALLEGE',
  FORFAITAIRE: 'REGIME FORFAITAIRE',
  MICRO_ENTREPRISE: 'REGIME MICRO-ENTREPRISE',
  SMT: 'SYSTEME MINIMAL DE TRESORERIE',
}

const Couverture: React.FC<PageProps> = ({ entreprise }) => {
  const regime = useLiasseRegime()
  const systemeLabel = REGIME_SYSTEME[regime] || REGIME_SYSTEME.REEL_NORMAL
  const formatDate = (iso: string) => {
    if (!iso) return '____/____/________'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return iso }
  }

  return (
    <Box sx={{ textAlign: 'center', pt: 8, fontFamily: '"Courier New", Courier, monospace' }}>
      <Typography sx={{ fontSize: '10pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
        MINISTERE EN CHARGE DES FINANCES
      </Typography>
      <Typography sx={{ fontSize: '10pt', fontWeight: 700, mb: 4, fontFamily: 'inherit' }}>
        DIRECTION GENERALE DES IMPOTS
      </Typography>

      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit' }}>
          CENTRE DE DEPOT DE :
        </Typography>
        <Typography sx={{ fontSize: '10pt', fontWeight: 700, mt: 0.5, fontFamily: 'inherit' }}>
          {entreprise.centre_depot || '________________________'}
        </Typography>
      </Box>

      <Box sx={{ my: 8 }}>
        <Typography sx={{ fontSize: '16pt', fontWeight: 700, fontFamily: 'inherit', letterSpacing: 2 }}>
          LIASSE {systemeLabel}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '10pt', fontFamily: 'inherit' }}>
          EXERCICE CLOS LE
        </Typography>
        <Typography sx={{ fontSize: '12pt', fontWeight: 700, mt: 0.5, fontFamily: 'inherit' }}>
          {formatDate(entreprise.exercice_clos)}
        </Typography>
      </Box>

      <Box sx={{ mt: 8, textAlign: 'left', px: 6 }}>
        <Field label="DENOMINATION SOCIALE :" value={entreprise.denomination} />
        <Typography sx={{ fontSize: '7pt', color: '#737373', ml: 2, mb: 1, fontFamily: 'inherit' }}>
          (ou nom et prenoms de l'exploitant)
        </Typography>
        <Field label="SIGLE USUEL :" value={entreprise.sigle} />
        <Field label="ADRESSE COMPLETE :" value={entreprise.adresse} />
        <Field label="N° COMPTE CONTRIBUABLE (NCC) :" value={entreprise.ncc} />
        <Field label="N° DE TELEDECLARANT (NTD):" value={entreprise.ntd} />
      </Box>
    </Box>
  )
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
    <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit', minWidth: 240 }}>{label}</Typography>
    <Typography sx={{ fontSize: '9pt', fontWeight: 700, fontFamily: 'inherit' }}>
      {value || '________________________'}
    </Typography>
  </Box>
)

export default Couverture
