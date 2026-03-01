import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const NOMENCLATURE_CIAP = [
  { code: 'A0101', label: 'AGRICULTURE VIVRIERE' },
  { code: 'A0102', label: 'AGRICULTURE DESTINEE A L\'INDUSTRIE OU A L\'EXPORTATION' },
  { code: 'A0103', label: 'ELEVAGE ET CHASSE' },
  { code: 'A0104', label: 'ACTIVITES ANNEXES A L\'AGRICULTURE, L\'ELEVAGE ET LA CHASSE' },
  { code: 'A0201', label: 'SYLVICULTURE ET EXPLOITATION FORESTIERE' },
  { code: 'A0301', label: 'PECHE' },
  { code: 'A0302', label: 'AQUACULTURE, PISCICULTURE' },
  { code: 'B0500', label: 'EXTRACTION DE CHARBON ET DE LIGNITE' },
  { code: 'B0600', label: 'EXTRACTION D\'HYDROCARBURES' },
  { code: 'B07', label: 'EXTRACTION DE MINERAIS METALLIQUES' },
  { code: 'B0801', label: 'EXTRACTION DE PIERRES, DE SABLES ET D\'ARGILES' },
  { code: 'C1001', label: 'ABATTAGE, TRANSFORMATION ET CONSERVATION DE LA VIANDE' },
  { code: 'C1002', label: 'TRANSFORMATION ET CONSERVATION DE POISSONS' },
  { code: 'C1003', label: 'TRANSFORMATION ET CONSERVATION DE FRUITS ET LEGUMES' },
  { code: 'C1004', label: 'FABRICATION DE CORPS GRAS' },
  { code: 'C1005', label: 'TRAVAIL DES GRAINS' },
  { code: 'C1006', label: 'FABRICATION DE PRODUITS ALIMENTAIRES A BASE DE CEREALES' },
  { code: 'C1007', label: 'TRANSFORMATION DU CACAO ET DU CAFE' },
  { code: 'C1008', label: 'FABRICATION D\'AUTRES PRODUITS ALIMENTAIRES' },
  { code: 'C1101', label: 'FABRICATION DE BOISSONS ALCOOLISEES' },
  { code: 'C1102', label: 'FABRICATION DE BOISSONS NON ALCOOLISEES ET D\'EAUX MINERALES' },
  { code: 'D3501', label: 'PRODUCTION, TRANSPORT ET DISTRIBUTION D\'ELECTRICITE' },
  { code: 'D3502', label: 'PRODUCTION ET DISTRIBUTION DE GAZ' },
  { code: 'E3600', label: 'CAPTAGE, TRAITEMENT ET DISTRIBUTION D\'EAU' },
  { code: 'F4100', label: 'CONSTRUCTION DE BATIMENTS' },
  { code: 'F4200', label: 'GENIE CIVIL' },
  { code: 'F4300', label: 'ACTIVITES SPECIALISEES DE CONSTRUCTION' },
  { code: 'G4501', label: 'COMMERCE DE VEHICULES AUTOMOBILES' },
  { code: 'G4601', label: 'ACTIVITES DES INTERMEDIAIRES DU COMMERCE DE GROS' },
  { code: 'G4602', label: 'COMMERCE DE GROS DE PRODUITS AGRICOLES' },
  { code: 'G4701', label: 'COMMERCE DE DETAIL EN MAGASIN NON SPECIALISE' },
  { code: 'G4702', label: 'COMMERCE DE DETAIL EN MAGASIN SPECIALISE' },
  { code: 'G4703', label: 'COMMERCE DE DETAIL HORS MAGASIN' },
  { code: 'H4901', label: 'TRANSPORTS FERROVIAIRES' },
  { code: 'H4902', label: 'TRANSPORTS ROUTIERS' },
  { code: 'H50', label: 'TRANSPORT PAR EAU' },
  { code: 'H51', label: 'TRANSPORTS AERIENS' },
  { code: 'H5201', label: 'ENTREPOSAGE' },
  { code: 'I5500', label: 'HEBERGEMENT' },
  { code: 'I5601', label: 'RESTAURATION' },
  { code: 'J5801', label: 'EDITION DE LIVRES ET PERIODIQUES' },
  { code: 'J6100', label: 'TELECOMMUNICATIONS' },
  { code: 'J6200', label: 'ACTIVITES INFORMATIQUES' },
  { code: 'K6401', label: 'INTERMEDIATION MONETAIRE' },
  { code: 'K6500', label: 'ASSURANCE' },
  { code: 'L6801', label: 'LOCATION IMMOBILIERE ET ACTIVITES SUR BIENS PROPRES' },
  { code: 'L6802', label: 'ACTIVITES DES AGENCES IMMOBILIERES' },
  { code: 'M6901', label: 'ACTIVITES JURIDIQUES' },
  { code: 'M6902', label: 'ACTIVITES COMPTABLES' },
  { code: 'M7000', label: 'ACTIVITES DES SIEGES SOCIAUX; CONSEIL EN GESTION' },
  { code: 'M7100', label: 'ACTIVITES D\'ARCHITECTURE, D\'INGENIERIE' },
  { code: 'M7300', label: 'PUBLICITE ET ETUDES DE MARCHES' },
  { code: 'N7701', label: 'LOCATION DE VEHICULES' },
  { code: 'N7810', label: 'ACTIVITES DES AGENCES DE TRAVAIL TEMPORAIRE' },
  { code: 'N7900', label: 'AGENCES DE VOYAGE ET ACTIVITES CONNEXES' },
  { code: 'N8000', label: 'SECURITE PRIVEE' },
  { code: 'O8400', label: 'ADMINISTRATION PUBLIQUE' },
  { code: 'P8500', label: 'ENSEIGNEMENT' },
  { code: 'Q8600', label: 'ACTIVITES POUR LA SANTE HUMAINE' },
  { code: 'R9000', label: 'ACTIVITES CREATIVES, ARTISTIQUES ET DE SPECTACLE' },
  { code: 'S9400', label: 'ACTIVITES DES ORGANISATIONS ASSOCIATIVES' },
  { code: 'S9500', label: 'REPARATION D\'ORDINATEURS ET DE BIENS PERSONNELS' },
  { code: 'S9600', label: 'AUTRES ACTIVITES DE SERVICES PERSONNELS' },
]

const Note36Nomenclature: React.FC<PageProps> = ({ entreprise }) => {
  const half = Math.ceil(NOMENCLATURE_CIAP.length / 2)
  const leftCol = NOMENCLATURE_CIAP.slice(0, half)
  const rightCol = NOMENCLATURE_CIAP.slice(half)

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="NOTE 36 (suite)" pageNumber="3" />

      <Typography sx={{ fontSize: '8pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
        NOTE 36 SUITE : CLASSIFICATION IVOIRIENNE DES ACTIVITES ET DES PRODUITS (CIAP)
      </Typography>
      <Typography sx={{ fontSize: '7pt', mb: 0.5, fontFamily: 'inherit' }}>
        CODES ACTIVITES ECONOMIQUES
      </Typography>
      <Typography sx={{ fontSize: '6.5pt', color: '#737373', mb: 1, fontFamily: 'inherit' }}>
        Selectionner la ou les codes activites selon le decoupage de votre chiffre d'affaires pour le renseignement de la fiche R2
      </Typography>

      <Typography sx={{ fontSize: '7.5pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
        NOMENCLATURE CIAP
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <NomenclatureColumn items={leftCol} />
        <NomenclatureColumn items={rightCol} />
      </Box>
    </Box>
  )
}

const NomenclatureColumn: React.FC<{ items: typeof NOMENCLATURE_CIAP }> = ({ items }) => (
  <Box component="table" sx={{
    flex: 1, borderCollapse: 'collapse', fontSize: '6pt',
    '& td': { border: '0.5px solid #d4d4d4', px: '2px', py: '1px' },
  }}>
    <thead>
      <tr>
        <td style={{ fontWeight: 700, width: 50, textAlign: 'center', backgroundColor: '#f5f5f5', fontSize: '6pt' }}>Code Activite</td>
        <td style={{ fontWeight: 700, backgroundColor: '#f5f5f5', fontSize: '6pt' }}>Activites</td>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.code}</td>
          <td>{item.label}</td>
        </tr>
      ))}
    </tbody>
  </Box>
)

export default Note36Nomenclature
