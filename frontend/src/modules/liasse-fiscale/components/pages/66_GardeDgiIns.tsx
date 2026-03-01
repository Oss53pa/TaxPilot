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

const GardeDgiIns: React.FC<PageProps> = ({ entreprise }) => {
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
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, fontFamily: 'inherit' }}>
        REPUBLIQUE DE COTE D'IVOIRE
      </Typography>
      <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit' }}>
        MINISTERE EN CHARGE DES FINANCES
      </Typography>
      <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit', mb: 2 }}>
        DIRECTION GENERALE DES IMPOTS
      </Typography>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography sx={{ fontSize: '14pt', fontWeight: 700, fontFamily: 'inherit', mb: 1 }}>
          ETATS SUPPLEMENTAIRES
        </Typography>
        <Typography sx={{ fontSize: '11pt', fontWeight: 700, fontFamily: 'inherit', mb: 1 }}>
          DIRECTION GENERALE DES IMPOTS
        </Typography>
        <Typography sx={{ fontSize: '11pt', fontWeight: 700, fontFamily: 'inherit' }}>
          ET INSTITUT NATIONAL DE LA STATISTIQUE
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Typography sx={{ fontSize: '10pt', fontFamily: 'inherit' }}>
          {systemeLabel}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit' }}>EXERCICE CLOS LE</Typography>
        <Typography sx={{ fontSize: '10pt', fontWeight: 700, fontFamily: 'inherit' }}>
          {formatDate(entreprise.exercice_clos)}
        </Typography>
      </Box>

      <Box sx={{ mt: 4, pl: 2 }}>
        <Field label="DENOMINATION SOCIALE :" value={entreprise.denomination} />
        <Field label="ADRESSE :" value={entreprise.adresse} />
        <Field label="N° COMPTE CONTRIBUABLE (NCC) :" value={entreprise.ncc} />
        <Field label="N° DE TELEDECLARANT (NTD) :" value={entreprise.ntd} />
      </Box>
    </Box>
  )
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
    <Typography sx={{ fontSize: '8pt', fontFamily: 'inherit' }}>{label}</Typography>
    <Typography sx={{ fontSize: '8pt', fontWeight: 700, fontFamily: 'inherit' }}>
      {value || '________________________'}
    </Typography>
  </Box>
)

export default GardeDgiIns
