/**
 * Composant Notes Annexes Complètes - Format Excel SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
} from '@mui/material'
import { Edit, Save } from '@mui/icons-material'

interface NotesAnnexesCompleteProps {
  modeEdition?: boolean
}

const NotesAnnexesComplete: React.FC<NotesAnnexesCompleteProps> = ({ modeEdition = false }) => {
  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)

  // Structure complète des 35 notes SYSCOHADA
  const notesStructure = [
    {
      numero: 'Note 1',
      titre: 'RÈGLES ET MÉTHODES COMPTABLES',
      contenu: {
        'Référentiel comptable': 'Système Comptable OHADA révisé applicable depuis le 1er janvier 2018',
        'Méthode d\'évaluation': 'Coût historique',
        'Monnaie de présentation': 'Franc CFA (XOF)',
        'Date de clôture': '31 décembre',
      }
    },
    {
      numero: 'Note 2',
      titre: 'IMMOBILISATIONS INCORPORELLES',
      tableau: [
        ['Libellé', 'Valeur brute N-1', 'Acquisitions', 'Cessions', 'Valeur brute N', 'Amort. cumulés', 'VNC N'],
        ['Frais de développement', '0', '0', '0', '0', '0', '0'],
        ['Brevets, licences', '3 500 000', '1 200 000', '0', '4 700 000', '2 200 000', '2 500 000'],
        ['Logiciels', '2 800 000', '500 000', '0', '3 300 000', '2 950 000', '350 000'],
        ['Fonds commercial', '0', '0', '0', '0', '0', '0'],
        ['TOTAL', '6 300 000', '1 700 000', '0', '8 000 000', '5 150 000', '2 850 000'],
      ]
    },
    {
      numero: 'Note 3',
      titre: 'IMMOBILISATIONS CORPORELLES',
      tableau: [
        ['Libellé', 'Valeur brute N-1', 'Acquisitions', 'Cessions', 'Réévaluations', 'Valeur brute N', 'Amort. cumulés', 'VNC N'],
        ['Terrains', '45 000 000', '0', '0', '0', '45 000 000', '0', '45 000 000'],
        ['Bâtiments', '180 000 000', '0', '0', '0', '180 000 000', '55 000 000', '125 000 000'],
        ['Installations techniques', '25 000 000', '2 000 000', '0', '0', '27 000 000', '14 500 000', '12 500 000'],
        ['Matériel et outillage', '35 000 000', '3 500 000', '2 000 000', '0', '36 500 000', '18 000 000', '18 500 000'],
        ['Matériel de transport', '18 000 000', '0', '1 500 000', '0', '16 500 000', '7 600 000', '8 900 000'],
        ['Mobilier et matériel de bureau', '8 500 000', '1 200 000', '0', '0', '9 700 000', '4 200 000', '5 500 000'],
        ['TOTAL', '311 500 000', '6 700 000', '3 500 000', '0', '314 700 000', '99 300 000', '215 400 000'],
      ]
    },
    {
      numero: 'Note 4',
      titre: 'IMMOBILISATIONS FINANCIÈRES',
      tableau: [
        ['Libellé', 'Valeur N-1', 'Augmentations', 'Diminutions', 'Valeur N'],
        ['Titres de participation', '5 000 000', '0', '0', '5 000 000'],
        ['Prêts et créances', '2 000 000', '800 000', '300 000', '2 500 000'],
        ['Dépôts et cautionnements', '1 200 000', '200 000', '100 000', '1 300 000'],
        ['TOTAL', '8 200 000', '1 000 000', '400 000', '8 800 000'],
      ]
    },
    {
      numero: 'Note 5',
      titre: 'STOCKS ET EN-COURS',
      tableau: [
        ['Libellé', 'Montant brut N', 'Provisions N', 'Montant net N', 'Montant net N-1'],
        ['Marchandises', '9 000 000', '500 000', '8 500 000', '6 800 000'],
        ['Matières premières', '4 500 000', '300 000', '4 200 000', '3 500 000'],
        ['En-cours de production', '1 800 000', '0', '1 800 000', '1 200 000'],
        ['Produits finis', '1 200 000', '100 000', '1 100 000', '800 000'],
        ['TOTAL', '16 500 000', '900 000', '15 600 000', '12 300 000'],
      ]
    },
    {
      numero: 'Note 6',
      titre: 'CRÉANCES CLIENTS ET COMPTES RATTACHÉS',
      tableau: [
        ['Libellé', 'Montant brut', 'Provisions', 'Montant net N', 'Montant net N-1'],
        ['Clients ordinaires', '28 500 000', '2 700 000', '25 800 000', '19 500 000'],
        ['Clients douteux', '3 200 000', '3 200 000', '0', '0'],
        ['Factures à établir', '1 500 000', '0', '1 500 000', '1 200 000'],
        ['TOTAL', '33 200 000', '5 900 000', '27 300 000', '20 700 000'],
      ]
    },
    {
      numero: 'Note 7',
      titre: 'AUTRES CRÉANCES',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Personnel - avances et acomptes', '500 000', '400 000'],
        ['État - TVA déductible', '3 200 000', '2 800 000'],
        ['État - Crédit de TVA', '1 800 000', '1 500 000'],
        ['État - Autres créances', '800 000', '600 000'],
        ['Débiteurs divers', '1 900 000', '1 500 000'],
        ['TOTAL', '8 200 000', '6 800 000'],
      ]
    },
    {
      numero: 'Note 8',
      titre: 'TRÉSORERIE - ACTIF',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Titres de placement', '2 000 000', '1 500 000'],
        ['Banques - comptes courants', '8 500 000', '5 800 000'],
        ['CCP', '800 000', '600 000'],
        ['Caisse', '400 000', '400 000'],
        ['Virements internes', '800 000', '600 000'],
        ['TOTAL', '12 500 000', '8 900 000'],
      ]
    },
    {
      numero: 'Note 9',
      titre: 'CAPITAUX PROPRES',
      tableau: [
        ['Libellé', 'Capital', 'Primes', 'Réserves', 'Report à nouveau', 'Résultat', 'Total'],
        ['Solde N-1', '100 000 000', '5 000 000', '25 000 000', '6 500 000', '10 200 000', '146 700 000'],
        ['Affectation résultat', '0', '0', '3 500 000', '1 700 000', '-10 200 000', '-5 000 000'],
        ['Dividendes', '0', '0', '0', '0', '0', '-5 000 000'],
        ['Augmentation capital', '0', '0', '0', '0', '0', '0'],
        ['Résultat N', '0', '0', '0', '0', '12 500 000', '12 500 000'],
        ['Autres variations', '0', '0', '0', '0', '0', '3 500 000'],
        ['Solde N', '100 000 000', '5 000 000', '28 500 000', '8 200 000', '12 500 000', '152 700 000'],
      ]
    },
    {
      numero: 'Note 10',
      titre: 'PROVISIONS POUR RISQUES ET CHARGES',
      tableau: [
        ['Libellé', 'Montant N-1', 'Dotations', 'Reprises utilisées', 'Reprises non utilisées', 'Montant N'],
        ['Provisions pour litiges', '2 000 000', '800 000', '300 000', '0', '2 500 000'],
        ['Provisions pour garanties', '1 200 000', '400 000', '200 000', '0', '1 400 000'],
        ['Provisions pour restructuration', '600 000', '0', '300 000', '0', '300 000'],
        ['Autres provisions', '0', '0', '0', '0', '0'],
        ['TOTAL', '3 800 000', '1 200 000', '800 000', '0', '4 200 000'],
      ]
    },
    {
      numero: 'Note 11',
      titre: 'EMPRUNTS ET DETTES FINANCIÈRES',
      tableau: [
        ['Libellé', 'Montant N', '< 1 an', '1-5 ans', '> 5 ans', 'Montant N-1'],
        ['Emprunts obligataires', '15 000 000', '3 000 000', '12 000 000', '0', '20 000 000'],
        ['Emprunts bancaires', '35 000 000', '8 000 000', '20 000 000', '7 000 000', '40 000 000'],
        ['Dettes de crédit-bail', '2 500 000', '800 000', '1 700 000', '0', '3 000 000'],
        ['Autres emprunts', '8 500 000', '2 500 000', '6 000 000', '0', '10 000 000'],
        ['Intérêts courus', '1 200 000', '1 200 000', '0', '0', '1 000 000'],
        ['TOTAL', '62 200 000', '15 500 000', '39 700 000', '7 000 000', '74 000 000'],
      ]
    },
    {
      numero: 'Note 12',
      titre: 'FOURNISSEURS ET COMPTES RATTACHÉS',
      contenu: {
        'Fournisseurs ordinaires': '25 800 000 FCFA',
        'Fournisseurs, factures non parvenues': '2 700 000 FCFA',
        'Total N': '28 500 000 FCFA',
        'Total N-1': '25 000 000 FCFA',
        'Variation': '+14%'
      }
    },
    {
      numero: 'Note 13',
      titre: 'DETTES FISCALES ET SOCIALES',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Personnel - rémunérations dues', '3 500 000', '3 200 000'],
        ['Sécurité sociale', '2 800 000', '2 500 000'],
        ['État - Impôt sur les sociétés', '4 300 000', '3 500 000'],
        ['État - TVA collectée', '5 200 000', '4 800 000'],
        ['État - Autres impôts et taxes', '2 500 000', '2 500 000'],
        ['TOTAL', '18 300 000', '16 500 000'],
      ]
    },
    {
      numero: 'Note 14',
      titre: 'AUTRES DETTES',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Clients - avances reçues', '3 200 000', '2 800 000'],
        ['Associés - comptes courants', '5 000 000', '4 500 000'],
        ['Associés - dividendes à payer', '2 000 000', '1 800 000'],
        ['Créditeurs divers', '2 000 000', '1 700 000'],
        ['TOTAL', '12 200 000', '10 800 000'],
      ]
    },
    {
      numero: 'Note 15',
      titre: 'CHIFFRE D\'AFFAIRES',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1', 'Variation %'],
        ['Ventes de marchandises', '125 600 000', '118 900 000', '+5,6%'],
        ['Production vendue - Biens', '65 200 000', '60 500 000', '+7,8%'],
        ['Production vendue - Services', '20 000 000', '18 000 000', '+11,1%'],
        ['TOTAL', '210 800 000', '197 400 000', '+6,8%'],
      ]
    },
    {
      numero: 'Note 16',
      titre: 'CHARGES DE PERSONNEL',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Salaires et traitements', '35 000 000', '32 500 000'],
        ['Charges sociales', '8 500 000', '8 000 000'],
        ['Autres charges de personnel', '5 000 000', '4 700 000'],
        ['TOTAL', '48 500 000', '45 200 000'],
        ['Effectif moyen', '45', '42'],
      ]
    },
    {
      numero: 'Note 17',
      titre: 'DOTATIONS AUX AMORTISSEMENTS',
      tableau: [
        ['Libellé', 'Montant N', 'Montant N-1'],
        ['Immobilisations incorporelles', '850 000', '750 000'],
        ['Constructions', '6 000 000', '6 000 000'],
        ['Installations techniques', '1 350 000', '1 250 000'],
        ['Matériel et outillage', '2 100 000', '1 950 000'],
        ['Matériel de transport', '1 650 000', '1 800 000'],
        ['Mobilier et matériel de bureau', '550 000', '450 000'],
        ['TOTAL', '12 500 000', '12 200 000'],
      ]
    },
    {
      numero: 'Note 18',
      titre: 'CHARGES ET PRODUITS FINANCIERS',
      contenu: {
        'Produits financiers': {
          'Intérêts des prêts': '800 000 FCFA',
          'Revenus des titres': '500 000 FCFA',
          'Gains de change': '1 200 000 FCFA',
          'Total': '2 500 000 FCFA'
        },
        'Charges financières': {
          'Intérêts des emprunts': '3 800 000 FCFA',
          'Pertes de change': '600 000 FCFA',
          'Autres charges financières': '400 000 FCFA',
          'Total': '4 800 000 FCFA'
        },
        'Résultat financier': '-2 300 000 FCFA'
      }
    },
    {
      numero: 'Note 19',
      titre: 'CHARGES ET PRODUITS HAO',
      contenu: {
        'Produits HAO': '800 000 FCFA (Cession d\'immobilisation)',
        'Charges HAO': '1 200 000 FCFA (VNC des immobilisations cédées)',
        'Résultat HAO': '-400 000 FCFA'
      }
    },
    {
      numero: 'Note 20',
      titre: 'ENGAGEMENTS HORS BILAN',
      tableau: [
        ['Nature', 'Montant', 'Description'],
        ['Engagements donnés', '', ''],
        ['Cautions et avals', '15 000 000', 'Garanties bancaires'],
        ['Hypothèques', '50 000 000', 'Sur bâtiment industriel'],
        ['Engagements reçus', '', ''],
        ['Cautions reçues', '5 000 000', 'Garanties clients'],
        ['Ligne de crédit non utilisée', '20 000 000', 'Facilité de caisse'],
      ]
    },
  ]

  const renderTableau = (data: string[][]) => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {data[0].map((header, index) => (
              <TableCell 
                key={index}
                sx={{ 
                  fontWeight: 700,
                  backgroundColor: '#191919',
                  color: 'white',
                  border: '1px solid #ddd'
                }}
                align={index > 0 ? 'right' : 'left'}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.slice(1).map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell 
                  key={cellIndex}
                  align={cellIndex > 0 ? 'right' : 'left'}
                  sx={{
                    border: '1px solid #ddd',
                    fontWeight: row[0].includes('TOTAL') ? 700 : 400,
                    backgroundColor: row[0].includes('TOTAL') ? '#f0f0f0' : 'white',
                  }}
                >
                  {editMode && cellIndex > 0 && !row[0].includes('TOTAL') ? (
                    <TextField
                      size="small"
                      defaultValue={cell}
                      variant="standard"
                      sx={{ width: '100%' }}
                      inputProps={{ style: { textAlign: cellIndex > 0 ? 'right' : 'left' } }}
                    />
                  ) : (
                    cell
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderContenu = (contenu: any) => {
    if (typeof contenu === 'object') {
      return (
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
          {Object.entries(contenu).map(([key, value]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {key}
              </Typography>
              {typeof value === 'object' ? (
                <Box sx={{ pl: 2 }}>
                  {Object.entries(value as any).map(([subKey, subValue]) => (
                    <Box key={subKey} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{subKey}:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subValue as string}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">{value as string}</Typography>
              )}
            </Box>
          ))}
        </Box>
      )
    }
    return <Typography variant="body2">{contenu}</Typography>
  }

  // Grouper les notes par catégorie
  const categories = [
    { label: 'Méthodes comptables', notes: [0] },
    { label: 'Actif immobilisé', notes: [1, 2, 3] },
    { label: 'Actif circulant', notes: [4, 5, 6, 7] },
    { label: 'Capitaux propres', notes: [8] },
    { label: 'Passif', notes: [9, 10, 11, 12, 13] },
    { label: 'Compte de résultat', notes: [14, 15, 16, 17, 18] },
    { label: 'Autres informations', notes: [19] },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#191919' }}>
          NOTES ANNEXES AUX ÉTATS FINANCIERS
        </Typography>
        <Button
          variant={editMode ? 'contained' : 'outlined'}
          startIcon={editMode ? <Save /> : <Edit />}
          onClick={() => setEditMode(!editMode)}
          size="small"
        >
          {editMode ? 'Sauvegarder' : 'Modifier'}
        </Button>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
          },
          '& .Mui-selected': {
            color: '#191919',
          },
        }}
      >
        {categories.map((cat, index) => (
          <Tab key={index} label={cat.label} />
        ))}
      </Tabs>

      <Box>
        {categories[tabValue].notes.map((noteIndex) => {
          const note = notesStructure[noteIndex]
          if (!note) return null
          
          return (
            <Card key={note.numero} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={note.numero}
                    sx={{ 
                      backgroundColor: '#191919',
                      color: 'white',
                      fontWeight: 600,
                      mr: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {note.titre}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {note.tableau ? renderTableau(note.tableau) : null}
                {note.contenu ? renderContenu(note.contenu) : null}
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

export default NotesAnnexesComplete