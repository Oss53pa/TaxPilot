import React, { createContext, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import type { EntrepriseData, RegimeImposition } from '../types'

/** Context used by the module to propagate the selected regime to all pages */
export const LiasseRegimeContext = createContext<RegimeImposition>('REEL_NORMAL')
export const useLiasseRegime = () => useContext(LiasseRegimeContext)

const REGIME_SYSTEME: Record<string, string> = {
  REEL_NORMAL: 'SYSTEME NORMAL',
  REEL_SIMPLIFIE: 'SYSTEME ALLEGE',
  FORFAITAIRE: 'REGIME FORFAITAIRE',
  MICRO_ENTREPRISE: 'REGIME MICRO-ENTREPRISE',
  SMT: 'SYSTEME MINIMAL DE TRESORERIE',
}

interface LiasseHeaderProps {
  entreprise: EntrepriseData
  noteLabel?: string
  systeme?: string
  regime?: RegimeImposition
  pageNumber?: string
}

const LiasseHeader: React.FC<LiasseHeaderProps> = ({
  entreprise,
  noteLabel,
  systeme,
  regime,
  pageNumber,
}) => {
  const ctxRegime = useLiasseRegime()
  const effectiveRegime = regime || ctxRegime
  const systemeLabel = systeme || REGIME_SYSTEME[effectiveRegime] || REGIME_SYSTEME.REEL_NORMAL
  const formatDate = (iso: string) => {
    if (!iso) return '____/____/________'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return iso
    }
  }

  return (
    <Box sx={{ mb: 2, pb: 1.5, borderBottom: '2px solid #000' }}>
      {/* Page number */}
      {pageNumber && (
        <Typography sx={{ textAlign: 'center', fontSize: 10, mb: 0.5 }}>
          - {pageNumber} -
        </Typography>
      )}

      {/* Note label */}
      {noteLabel && (
        <Typography sx={{ textAlign: 'center', fontWeight: 700, fontSize: 14, mb: 0.25 }}>
          {noteLabel}
        </Typography>
      )}

      {/* Systeme */}
      <Typography sx={{ textAlign: 'center', fontWeight: 700, fontSize: 12, mb: 1, color: 'text.secondary' }}>
        {systemeLabel}
      </Typography>

      {/* Entity identification — table layout like DgiNoteHeader */}
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 11,
          '& td': { padding: '2px 4px', verticalAlign: 'top', border: 'none' },
          '& .label': { color: 'text.secondary', whiteSpace: 'nowrap' },
          '& .value': { fontWeight: 700 },
        }}
      >
        <tbody>
          <tr>
            <td className="label">Denomination sociale de l'entite :</td>
            <td className="value" colSpan={5}>{entreprise.denomination || ''}</td>
          </tr>
          <tr>
            <td className="label">Adresse :</td>
            <td className="value" colSpan={3}>{entreprise.adresse || ''}</td>
            <td className="label" style={{ textAlign: 'right' }}>Sigle usuel :</td>
            <td className="value">{entreprise.sigle || ''}</td>
          </tr>
          <tr>
            <td className="label">N° de compte contribuable (NCC) :</td>
            <td className="value">{entreprise.ncc || ''}</td>
            <td className="label" style={{ textAlign: 'right' }}>Exercice clos le :</td>
            <td className="value">{formatDate(entreprise.exercice_clos)}</td>
            <td className="label" style={{ textAlign: 'right' }}>Duree (en mois) :</td>
            <td className="value">{entreprise.duree_mois || 12}</td>
          </tr>
          <tr>
            <td className="label">N° de teledeclarant (NTD) :</td>
            <td className="value" colSpan={5}>{entreprise.ntd || ''}</td>
          </tr>
        </tbody>
      </Box>
    </Box>
  )
}

export default LiasseHeader
