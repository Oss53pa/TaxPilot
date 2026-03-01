import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const Note36Codes: React.FC<PageProps> = ({ entreprise }) => {
  const formeJuridique = [
    { label: 'Societe Anonyme (SA) a participation publique', code: '00' },
    { label: 'Societe Anonyme (SA)', code: '01' },
    { label: 'Societe par Actions Simplifiee (SAS)', code: '02' },
    { label: 'Societe a Responsabilite Limitee (SARL)', code: '03' },
    { label: 'Societe en Commandite Simple (SCS)', code: '04' },
    { label: 'Societe en Nom Collectif (SNC)', code: '05' },
    { label: 'Societe en Participation (SP)', code: '06' },
    { label: 'Groupement d\'Interet Economique (GIE)', code: '07' },
    { label: 'Association', code: '08' },
    { label: 'Autre forme juridique (a preciser)', code: '09' },
  ]

  const regimeFiscal = [
    { label: 'Reel normal', code: '1' },
    { label: 'Reel simplifie', code: '2' },
    { label: 'Synthetique', code: '3' },
    { label: 'Forfait', code: '4' },
  ]

  const codePays = [
    { label: 'Pays UEMOA (2)', code: '' },
    { label: 'Pays CEMAC (3)', code: '' },
    { label: 'Autres pays OHADA (4)', code: '' },
    { label: 'Afrique du Sud', code: '20' },
    { label: 'Autres pays africains', code: '21' },
    { label: 'Suisse', code: '22' },
    { label: 'France', code: '23' },
    { label: 'Autres pays de l\'Union Europeenne', code: '39' },
    { label: 'U.S.A.', code: '40' },
    { label: 'Canada', code: '41' },
    { label: 'Bresil', code: '43' },
    { label: 'Autres pays americains', code: '49' },
    { label: 'Chine', code: '50' },
    { label: 'Inde', code: '52' },
    { label: 'Liban', code: '53' },
    { label: 'Autres pays asiatiques', code: '59' },
    { label: 'Russie', code: '60' },
    { label: 'Autres pays', code: '99' },
  ]

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="NOTE 36" pageNumber="2" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
        NOTE 36 : TABLE DES CODES
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Left: Forme juridique + Regime */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '7.5pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
            1- Code forme juridique (1)
          </Typography>
          <CodeTable items={formeJuridique} />

          <Typography sx={{ fontSize: '7.5pt', fontWeight: 700, mt: 1.5, mb: 0.5, fontFamily: 'inherit' }}>
            2 - Code regime fiscal
          </Typography>
          <CodeTable items={regimeFiscal} />
        </Box>

        {/* Right: Code pays */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '7.5pt', fontWeight: 700, mb: 0.5, fontFamily: 'inherit' }}>
            3- Code pays du siege social
          </Typography>
          <CodeTable items={codePays} />
        </Box>
      </Box>

      <Box sx={{ mt: 2, fontSize: '6.5pt', color: '#737373', fontFamily: 'inherit' }}>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (1) Remplacer le premier 0 par 1 si l'entreprise beneficie d'un agrement prioritaire
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (2) Benin = 01 ; Burkina = 02 ; Cote d'Ivoire = 03 ; Guinee Bissau = 04 ; Mali = 05 ; Niger = 06 ; Senegal = 07 ; Togo = 08
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (3) Cameroun = 09 ; Centrafrique = 10 ; Congo = 11 ; Gabon = 12 ; Guinee Equatoriale = 13 ; Tchad = 14
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (4) Comores = 15 ; Guinee Conakry = 16
        </Typography>
      </Box>
    </Box>
  )
}

const CodeTable: React.FC<{ items: { label: string; code: string }[] }> = ({ items }) => (
  <Box component="table" sx={{
    width: '100%', borderCollapse: 'collapse', fontSize: '7pt',
    '& td': { border: '0.5px solid #d4d4d4', px: '3px', py: '1px' },
  }}>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.label}</td>
          <td style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{item.code}</td>
        </tr>
      ))}
    </tbody>
  </Box>
)

export default Note36Codes
