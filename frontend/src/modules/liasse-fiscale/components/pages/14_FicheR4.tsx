import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'
import { getRegime } from '../../types'

// Mapping note number → page ID (used in regime obligatoires)
const NOTE_TO_PAGE_ID: Record<string, string> = {
  '1': 'note-01', '2': 'note-02',
  '3A': 'note-3a', '3B': 'note-3b', '3C': 'note-3c',
  '3C BIS': 'note-3c-bis', '3D': 'note-3d', '3E': 'note-3e',
  '4': 'note-04', '5': 'note-05', '6': 'note-06', '7': 'note-07',
  '8': 'note-08', '8A': 'note-8a', '8B': 'note-8b', '8C': 'note-8c',
  '9': 'note-09', '10': 'note-10', '11': 'note-11', '12': 'note-12',
  '13': 'note-13', '14': 'note-14', '15A': 'note-15a', '15B': 'note-15b',
  '16A': 'note-16a', '16B': 'note-16b', '16B BIS': 'note-16b-bis', '16C': 'note-16c',
  '17': 'note-17', '18': 'note-18', '19': 'note-19', '20': 'note-20',
  '21': 'note-21', '22': 'note-22', '23': 'note-23', '24': 'note-24',
  '25': 'note-25', '26': 'note-26', '27A': 'note-27a', '27B': 'note-27b',
  '28': 'note-28', '29': 'note-29', '30': 'note-30', '31': 'note-31',
  '32': 'note-32', '33': 'note-33', '34': 'note-34', '35': 'note-35',
  '37': 'note-37', '38': 'note-38', '39': 'note-39',
}

const NOTES_LIST = [
  { num: '1', titre: 'Dettes garanties par des suretes reelles' },
  { num: '2', titre: 'Benefice par action' },
  { num: '3A', titre: 'Immobilisations - Mouvements' },
  { num: '3B', titre: 'Immobilisations - Plus ou moins values' },
  { num: '3C', titre: 'Amortissements' },
  { num: '3C BIS', titre: 'Depreciations et provisions pour risques' },
  { num: '3D', titre: 'Immobilisations financieres' },
  { num: '3E', titre: 'Informations complementaires immobilisations' },
  { num: '4', titre: 'Actif circulant HAO' },
  { num: '5', titre: 'Stocks et en-cours' },
  { num: '6', titre: 'Clients' },
  { num: '7', titre: 'Autres creances' },
  { num: '8', titre: 'Tresorerie - Actif et Passif' },
  { num: '8A', titre: 'Ecarts de conversion Actif' },
  { num: '8B', titre: 'Ecarts de conversion Passif' },
  { num: '8C', titre: 'Charges constatees d\'avance' },
  { num: '9', titre: 'Evolution des capitaux propres' },
  { num: '10', titre: 'Capital social' },
  { num: '11', titre: 'Primes et reserves' },
  { num: '12', titre: 'Subventions' },
  { num: '13', titre: 'Provisions reglementees et fonds assimiles' },
  { num: '14', titre: 'Dettes financieres et ressources assimilees' },
  { num: '15A', titre: 'Passif circulant HAO' },
  { num: '15B', titre: 'Fournisseurs d\'exploitation' },
  { num: '16A', titre: 'Dettes fiscales et sociales' },
  { num: '16B', titre: 'Autres dettes et provisions pour risques' },
  { num: '16B BIS', titre: 'Echeancier des dettes a la cloture' },
  { num: '16C', titre: 'Engagements hors bilan' },
  { num: '17', titre: 'Chiffre d\'affaires et autres produits' },
  { num: '18', titre: 'Autres achats' },
  { num: '19', titre: 'Transports' },
  { num: '20', titre: 'Services exterieurs' },
  { num: '21', titre: 'Impots et taxes' },
  { num: '22', titre: 'Autres charges' },
  { num: '23', titre: 'Charges de personnel' },
  { num: '24', titre: 'Dotations HAO' },
  { num: '25', titre: 'Produits HAO' },
  { num: '26', titre: 'Impots sur le resultat' },
  { num: '27A', titre: 'Personnel' },
  { num: '27B', titre: 'Effectifs, masse salariale et personnel ext.' },
  { num: '28', titre: 'Engagements de retraite' },
  { num: '29', titre: 'Operations effectuees en commun' },
  { num: '30', titre: 'Operations effectuees pour compte de tiers' },
  { num: '31', titre: 'Operations en devises' },
  { num: '32', titre: 'Evenements posterieurs a la cloture' },
  { num: '33', titre: 'Liste des points annexes' },
  { num: '34', titre: 'Tableau de determination du resultat fiscal' },
  { num: '35', titre: 'Informations complementaires' },
  { num: '37', titre: 'Tableau de passage aux soldes SIG' },
  { num: '38', titre: 'Detail compte de resultat' },
  { num: '39', titre: 'Autres informations' },
]

const FicheR4: React.FC<PageProps> = ({ entreprise, regime }) => {
  const regimeDef = getRegime(regime || 'REEL_NORMAL')

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="FICHE R4" pageNumber="12" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1, fontFamily: 'inherit' }}>
        FICHE R4 : FICHE RECAPITULATIVE DES NOTES ANNEXES
      </Typography>

      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '7pt',
        '& th, & td': { border: '0.5px solid #404040', px: '4px', py: '2px' },
        '& th': { bgcolor: '#f5f5f5', fontWeight: 700, textAlign: 'center' },
      }}>
        <thead>
          <tr>
            <th style={{ width: '8%' }}>N° Note</th>
            <th style={{ width: '50%' }}>Intitule</th>
            <th style={{ width: '10%' }}>A<br />(Applicable)</th>
            <th style={{ width: '10%' }}>NA<br />(Non Applicable)</th>
            <th style={{ width: '22%' }}>Observations</th>
          </tr>
        </thead>
        <tbody>
          {NOTES_LIST.map(note => {
            const pageId = NOTE_TO_PAGE_ID[note.num]
            const isObligatoire = pageId ? regimeDef.obligatoires.has(pageId) : false
            return (
              <tr key={note.num} style={{ height: 16 }}>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{note.num}</td>
                <td>{note.titre}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '8pt' }}>
                  {isObligatoire ? 'X' : ''}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '8pt' }}>
                  {isObligatoire ? '' : 'X'}
                </td>
                <td style={{ fontSize: '6.5pt', color: '#737373' }}>
                  {isObligatoire ? 'Obligatoire' : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </Box>
    </Box>
  )
}

export default FicheR4
