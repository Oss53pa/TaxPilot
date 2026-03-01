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

const Garde: React.FC<PageProps> = ({ entreprise }) => {
  const regime = useLiasseRegime()
  const systemeLabel = REGIME_SYSTEME[regime] || REGIME_SYSTEME.REEL_NORMAL
  const formatDate = (iso: string) => {
    if (!iso) return '____/____/________'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return iso }
  }

  const documents = [
    { label: 'Fiche d\'identification et renseignements divers', checked: true },
    { label: 'Bilan', checked: true },
    { label: 'Compte de resultat', checked: true },
    { label: 'Tableau des flux de tresorerie', checked: true },
    { label: 'Notes annexes', checked: true },
    { label: 'Etats supplementaires DGI', checked: true },
  ]

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

      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit' }}>CENTRE DE DEPOT DE</Typography>
        <Typography sx={{ fontSize: '10pt', fontWeight: 700, fontFamily: 'inherit' }}>
          {entreprise.centre_depot || '________________________'}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Typography sx={{ fontSize: '12pt', fontWeight: 700, fontFamily: 'inherit' }}>
          ETATS FINANCIERS NORMALISES
        </Typography>
        <Typography sx={{ fontSize: '10pt', fontFamily: 'inherit' }}>
          SYSTEME COMPTABLE OHADA (SYSCOHADA)
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '9pt', fontFamily: 'inherit' }}>EXERCICE CLOS LE</Typography>
        <Typography sx={{ fontSize: '10pt', fontWeight: 700, fontFamily: 'inherit' }}>
          {formatDate(entreprise.exercice_clos)}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
        DESIGNATION DE L'ENTITE
      </Typography>

      <Field label="DENOMINATION SOCIALE :" value={entreprise.denomination} />
      <Typography sx={{ fontSize: '7pt', color: '#737373', ml: 2, mb: 0.5, fontFamily: 'inherit' }}>
        (ou nom et prenoms de l'exploitant)
      </Typography>
      <Field label="SIGLE USUEL :" value={entreprise.sigle} />
      <Field label="ADRESSE COMPLETE :" value={entreprise.adresse} />
      <Field label="N° COMPTE CONTRIBUABLE (NCC) :" value={entreprise.ncc} />
      <Field label="N° DE TELEDECLARANT (NTD):" value={entreprise.ntd} />
      <Field label="" value={systemeLabel} />

      {/* Documents checklist */}
      <Box sx={{ display: 'flex', mt: 3, gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
            Documents deposes
          </Typography>
          {documents.map(d => (
            <Box key={d.label} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '8pt', flex: 1, fontFamily: 'inherit' }}>{d.label}</Typography>
              <Box sx={{
                width: 14, height: 14, border: '1px solid #404040',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8pt', fontWeight: 700, fontFamily: 'inherit',
              }}>
                {d.checked ? 'X' : ''}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
            Reserve a la Direction Generale des Impots
          </Typography>
          <Field label="Date de depot" value="" small />
          <Box sx={{ mt: 4 }}>
            <Field label="Nom de l'agent de la DGI ayant receptionne le depot" value="" small />
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontSize: '7pt', fontFamily: 'inherit' }}>
              Signature de l'agent et cachet du service
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Field label="Nombre de pages deposees par exemplaire :" value="" />
        <Field label="Nombre d'exemplaires deposes :" value="" />
      </Box>
    </Box>
  )
}

const Field: React.FC<{ label: string; value: string; small?: boolean }> = ({ label, value, small }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
    <Typography sx={{ fontSize: small ? '7pt' : '8pt', fontFamily: 'inherit' }}>{label}</Typography>
    <Typography sx={{ fontSize: small ? '7pt' : '8pt', fontWeight: 700, fontFamily: 'inherit' }}>
      {value || (label ? '________________________' : '')}
    </Typography>
  </Box>
)

export default Garde
