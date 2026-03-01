import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const FicheR3: React.FC<PageProps> = ({ entreprise }) => {
  const dirigeants = entreprise.dirigeants?.length > 0
    ? entreprise.dirigeants
    : [{ qualite: '', nom: '', prenoms: '', adresse: '', date_nomination: '', duree_mandat: '' }]

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="FICHE R3" pageNumber="6" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
        FICHE R3 : FICHE D'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 3
      </Typography>

      {/* Dirigeants table */}
      <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
        DIRIGEANTS (1)
      </Typography>

      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '7pt', mb: 1,
        '& th, & td': { border: '0.5px solid #404040', px: '3px', py: '2px' },
        '& th': { bgcolor: '#f5f5f5', fontWeight: 700, textAlign: 'center', fontSize: '6.5pt' },
      }}>
        <thead>
          <tr>
            <th style={{ width: '20%' }}>Nom et Prenoms</th>
            <th style={{ width: '10%' }}>Nationalite</th>
            <th style={{ width: '10%' }}>Autres nationalites (a preciser) (2)</th>
            <th style={{ width: '10%' }}>Qualite</th>
            <th style={{ width: '12%' }}>N° d'identification fiscale</th>
            <th style={{ width: '38%' }}>Adresse (BP, ville, pays, adresse geographique et adresse email)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => {
            const d = dirigeants[i]
            return (
              <tr key={i} style={{ height: 18 }}>
                <td>{d ? `${d.nom} ${d.prenoms}`.trim() : ''}</td>
                <td></td>
                <td></td>
                <td>{d?.qualite || ''}</td>
                <td></td>
                <td>{d?.adresse || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </Box>

      <Box sx={{ fontSize: '6.5pt', color: '#737373', mb: 2, fontFamily: 'inherit' }}>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (1) Dirigeants = President Directeur General, Directeur General, Administrateur General, Gerant, Autres.
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (2) En cas de double nationalite
        </Typography>
      </Box>

      {/* Conseil d'administration */}
      <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
        MEMBRES DU CONSEIL D'ADMINISTRATION
      </Typography>

      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '7pt',
        '& th, & td': { border: '0.5px solid #404040', px: '3px', py: '2px' },
        '& th': { bgcolor: '#f5f5f5', fontWeight: 700, textAlign: 'center', fontSize: '6.5pt' },
      }}>
        <thead>
          <tr>
            <th style={{ width: '22%' }}>Nom et Prenoms</th>
            <th style={{ width: '20%' }}>Structure representee</th>
            <th style={{ width: '12%' }}>Qualite</th>
            <th style={{ width: '46%' }}>Adresse (BP, ville, pays, adresse geographique et adresse email)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }).map((_, i) => (
            <tr key={i} style={{ height: 18 }}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}

export default FicheR3
