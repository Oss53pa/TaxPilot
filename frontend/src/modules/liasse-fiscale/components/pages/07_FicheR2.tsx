import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const FicheR2: React.FC<PageProps> = ({ entreprise }) => {
  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="FICHE R2" pageNumber="5" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
        FICHE R2 : FICHE D'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 2
      </Typography>

      {/* Codes section */}
      <Box sx={{ display: 'flex', gap: 4, mb: 2, fontSize: '7.5pt' }}>
        <Box sx={{ flex: 1 }}>
          <RefField ref_="ZX" label="Forme juridique (1) :" value={entreprise.code_forme_juridique} />
          <RefField ref_="ZY" label="Regime fiscal (1) :" value={entreprise.code_regime} />
          <RefField ref_="ZZ1" label="Pays du siege social (1) :" value={entreprise.code_pays} />
          <RefField ref_="ZZ2" label="Nombre d'etablissements dans le pays :" value={String(entreprise.nombre_etablissements || 0).padStart(2, '0')} />
          <RefField ref_="ZZ3" label="Nombre d'etablissements hors du pays :" value="00" />
          <RefField ref_="ZZ4" label="Premiere annee d'exercice dans le pays :" value="" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
            Controle de l'Entite (cocher la case)
          </Typography>
          <RefField ref_="ZZ5" label="Entite sous controle public" value="" />
          <RefField ref_="ZZ6" label="Entite sous controle prive national" value="" />
          <RefField ref_="ZZ7" label="Entite sous controle prive etranger" value="" />
        </Box>
      </Box>

      {/* Activity table */}
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
        ACTIVITE DE L'ENTITE
      </Typography>

      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '7pt', mb: 2,
        '& th, & td': { border: '0.5px solid #404040', px: '4px', py: '2px' },
        '& th': { bgcolor: '#f5f5f5', fontWeight: 700, textAlign: 'center', fontSize: '6.5pt' },
      }}>
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Designation de l'activite (2)</th>
            <th style={{ width: '15%' }}>Code nomenclature d'activite (1)</th>
            <th style={{ width: '30%' }}>Chiffre d'affaires HT (CA HT) ou Valeur ajoutee (VA) (3) (4)</th>
            <th style={{ width: '20%' }}>% activite dans le CA HT ou la VA</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} style={{ height: 24 }}>
              <td></td>
              <td style={{ textAlign: 'center' }}></td>
              <td style={{ textAlign: 'right' }}></td>
              <td style={{ textAlign: 'right' }}></td>
            </tr>
          ))}
          <tr style={{ height: 20 }}>
            <td colSpan={2} style={{ fontStyle: 'italic', color: '#737373' }}>Divers (4)</td>
            <td style={{ textAlign: 'right' }}></td>
            <td style={{ textAlign: 'right' }}></td>
          </tr>
          <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
            <td colSpan={2} style={{ textAlign: 'right', paddingRight: 8 }}>TOTAL</td>
            <td style={{ textAlign: 'right' }}></td>
            <td style={{ textAlign: 'right' }}></td>
          </tr>
        </tbody>
      </Box>

      <Box sx={{ fontSize: '6.5pt', color: '#737373', fontFamily: 'inherit' }}>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (1) Note 36 Suite (Nomenclature)
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (2) Lister de maniere precise les activites dans l'ordre decroissant du C.A.HT ou de la valeur ajoutee (V.A).
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (3) Rayer la mention inutile - En Cote d'Ivoire, pour les besoins de l'INS, on preferera le chiffre d'affaires.
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (4) Indiquer dans la note annexe n°21 "Chiffre d'affaires et autres produits", la liste detaillee des activites classees dans la rubrique "Divers"
        </Typography>
      </Box>
    </Box>
  )
}

const RefField: React.FC<{ ref_: string; label: string; value: string }> = ({ ref_, label, value }) => (
  <Box sx={{ display: 'flex', mb: 0.5, fontFamily: 'inherit' }}>
    <Box sx={{ width: 30, fontWeight: 700, color: '#525252', fontSize: '7pt' }}>{ref_}</Box>
    <Typography sx={{ fontSize: '7.5pt', flex: 1, fontFamily: 'inherit' }}>{label}</Typography>
    <Box sx={{
      minWidth: 40,
      textAlign: 'center',
      fontWeight: 700,
      border: '0.5px solid #d4d4d4',
      px: 0.5,
      fontSize: '7.5pt',
      fontFamily: 'inherit',
    }}>
      {value}
    </Box>
  </Box>
)

export default FicheR2
