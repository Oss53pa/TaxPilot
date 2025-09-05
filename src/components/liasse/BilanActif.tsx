/**
 * Composant Bilan Actif - SYSCOHADA
 */

import React, { memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  Tooltip,
} from '@mui/material'
import { Notes, Info } from '@mui/icons-material'

interface BilanActifProps {
  modeEdition?: boolean
}

const BilanActif: React.FC<BilanActifProps> = ({ modeEdition = false }) => {
  // Structure complète du Bilan Actif SYSCOHADA
  const lignesActif = [
    // ACTIF IMMOBILISÉ
    { 
      ref: 'AA', 
      libelle: 'ACTIF IMMOBILISÉ',
      note: '1',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'AB',
      libelle: 'Charges immobilisées',
      note: '2',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      ref: 'AC', 
      libelle: 'Frais de développement et de prospection',
      note: '2.1',
      exerciceN: 0,
      exerciceN1: 0,
      comptes: ['201', '202'],
      level: 2,
    },
    {
      ref: 'AD',
      libelle: 'Brevets, licences, logiciels et droits similaires',
      note: '2.2',
      exerciceN: 2500000,
      exerciceN1: 1800000,
      comptes: ['203', '204', '205'],
      level: 2,
    },
    {
      ref: 'AE',
      libelle: 'Fonds commercial et droit au bail',
      note: '2.3',
      exerciceN: 0,
      exerciceN1: 0,
      comptes: ['206', '207'],
      level: 2,
    },
    {
      ref: 'AF',
      libelle: 'Autres immobilisations incorporelles',
      note: '2.4',
      exerciceN: 350000,
      exerciceN1: 280000,
      comptes: ['208'],
      level: 2,
    },
    {
      ref: 'AG',
      libelle: 'Immobilisations corporelles',
      note: '3',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      ref: 'AH',
      libelle: 'Terrains',
      note: '3.1',
      exerciceN: 45000000,
      exerciceN1: 45000000,
      comptes: ['221', '222', '223', '224', '228'],
      level: 2,
    },
    {
      ref: 'AI',
      libelle: 'Bâtiments',
      note: '3.2',
      exerciceN: 125000000,
      exerciceN1: 135000000,
      comptes: ['231', '232', '233', '234', '235', '237', '238'],
      level: 2,
    },
    {
      ref: 'AJ',
      libelle: 'Installations et agencements',
      note: '3.3',
      exerciceN: 12500000,
      exerciceN1: 15000000,
      comptes: ['234', '235', '237', '238'],
      level: 2,
    },
    {
      ref: 'AK',
      libelle: 'Matériel',
      note: '3.4',
      exerciceN: 18500000,
      exerciceN1: 22000000,
      comptes: ['241', '242', '243', '244', '245', '246'],
      level: 2,
    },
    {
      ref: 'AL',
      libelle: 'Matériel de transport',
      note: '3.5',
      exerciceN: 8900000,
      exerciceN1: 10500000,
      comptes: ['245'],
      level: 2,
    },
    {
      ref: 'AM',
      libelle: 'Avances et acomptes versés sur immobilisations',
      note: '4',
      exerciceN: 1200000,
      exerciceN1: 850000,
      comptes: ['251', '252'],
      level: 1,
    },
    {
      ref: 'AN',
      libelle: 'Immobilisations financières',
      note: '5',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      ref: 'AO',
      libelle: 'Titres de participation',
      note: '5.1',
      exerciceN: 5000000,
      exerciceN1: 5000000,
      comptes: ['261', '262', '263', '264', '265'],
      level: 2,
    },
    {
      ref: 'AP',
      libelle: 'Autres immobilisations financières',
      note: '5.2',
      exerciceN: 2500000,
      exerciceN1: 2000000,
      comptes: ['271', '272', '273', '274', '275', '276', '277'],
      level: 2,
    },
    {
      ref: 'AZ',
      libelle: 'TOTAL ACTIF IMMOBILISÉ (I)',
      note: '',
      exerciceN: 221450000,
      exerciceN1: 237430000,
      isTotal: true,
      level: 0,
    },
    
    // ACTIF CIRCULANT
    {
      ref: 'BA',
      libelle: 'ACTIF CIRCULANT',
      note: '6',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'BB',
      libelle: 'Actif circulant HAO',
      note: '7',
      exerciceN: 500000,
      exerciceN1: 300000,
      comptes: ['481', '482', '483', '484', '485'],
      level: 1,
    },
    {
      ref: 'BC',
      libelle: 'Stocks',
      note: '8',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      ref: 'BD',
      libelle: 'Marchandises',
      note: '8.1',
      exerciceN: 8500000,
      exerciceN1: 6800000,
      comptes: ['31'],
      level: 2,
    },
    {
      ref: 'BE',
      libelle: 'Matières premières et fournitures liées',
      note: '8.2',
      exerciceN: 4200000,
      exerciceN1: 3500000,
      comptes: ['32', '33'],
      level: 2,
    },
    {
      ref: 'BF',
      libelle: 'En-cours',
      note: '8.3',
      exerciceN: 1800000,
      exerciceN1: 1200000,
      comptes: ['34', '35'],
      level: 2,
    },
    {
      ref: 'BG',
      libelle: 'Produits fabriqués',
      note: '8.4',
      exerciceN: 1100000,
      exerciceN1: 800000,
      comptes: ['36', '37', '38'],
      level: 2,
    },
    {
      ref: 'BH',
      libelle: 'Créances et emplois assimilés',
      note: '9',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      ref: 'BI',
      libelle: 'Fournisseurs, avances versées',
      note: '9.1',
      exerciceN: 1200000,
      exerciceN1: 950000,
      comptes: ['409'],
      level: 2,
    },
    {
      ref: 'BJ',
      libelle: 'Clients',
      note: '9.2',
      exerciceN: 25800000,
      exerciceN1: 19500000,
      comptes: ['411', '412', '413', '414', '415', '416', '418'],
      level: 2,
    },
    {
      ref: 'BK',
      libelle: 'Autres créances',
      note: '9.3',
      exerciceN: 8200000,
      exerciceN1: 6800000,
      comptes: ['421', '422', '423', '424', '425', '426', '427', '428'],
      level: 2,
    },
    {
      ref: 'BZ',
      libelle: 'TOTAL ACTIF CIRCULANT (II)',
      note: '',
      exerciceN: 51300000,
      exerciceN1: 40050000,
      isTotal: true,
      level: 0,
    },
    
    // TRÉSORERIE
    {
      ref: 'CA',
      libelle: 'TRÉSORERIE - ACTIF',
      note: '10',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'CB',
      libelle: 'Titres de placement',
      note: '10.1',
      exerciceN: 2000000,
      exerciceN1: 1500000,
      comptes: ['50'],
      level: 1,
    },
    {
      ref: 'CC',
      libelle: 'Valeurs à encaisser',
      note: '10.2',
      exerciceN: 800000,
      exerciceN1: 600000,
      comptes: ['51'],
      level: 1,
    },
    {
      ref: 'CD',
      libelle: 'Banques, chèques postaux, caisse',
      note: '10.3',
      exerciceN: 9700000,
      exerciceN1: 6800000,
      comptes: ['52', '53', '54', '57'],
      level: 1,
    },
    {
      ref: 'CZ',
      libelle: 'TOTAL TRÉSORERIE - ACTIF (III)',
      note: '',
      exerciceN: 12500000,
      exerciceN1: 8900000,
      isTotal: true,
      level: 0,
    },
    
    // TOTAL GÉNÉRAL
    {
      ref: 'DZ',
      libelle: 'TOTAL GÉNÉRAL ACTIF (I+II+III)',
      note: '',
      exerciceN: 285250000,
      exerciceN1: 286380000,
      isTotalGeneral: true,
      level: 0,
    },
  ]

  const formatMontant = (montant: number | null) => {
    if (montant === null) return ''
    if (montant === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  const calculerVariation = (n: number | null, n1: number | null) => {
    if (n === null || n1 === null || n1 === 0) return null
    return ((n - n1) / n1) * 100
  }

  const getRowStyle = (ligne: any) => {
    if (ligne.isTotalGeneral) {
      return { 
        backgroundColor: '#1976d2', 
        color: 'white',
        fontWeight: 700,
      }
    }
    if (ligne.isTotal) {
      return { 
        backgroundColor: '#e3f2fd',
        fontWeight: 700,
      }
    }
    if (ligne.isHeader) {
      return { 
        backgroundColor: '#f5f5f5',
        fontWeight: 700,
      }
    }
    if (ligne.isSubHeader) {
      return { 
        backgroundColor: '#fafafa',
        fontWeight: 600,
      }
    }
    return {}
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
        BILAN - ACTIF
      </Typography>
      
      <TableContainer component={Paper} sx={{ border: '2px solid #1976d2' }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }}>Réf</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: '350px' }}>ACTIF</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }} align="center">Note</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2024
                </Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N-1<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2023
                </Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '80px' }} align="center">
                Variation %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignesActif.map((ligne, index) => {
              const variation = calculerVariation(ligne.exerciceN, ligne.exerciceN1)
              
              return (
                <TableRow 
                  key={index}
                  sx={{
                    ...getRowStyle(ligne),
                    '&:hover': { backgroundColor: ligne.isHeader || ligne.isTotal || ligne.isTotalGeneral ? undefined : '#f9f9f9' }
                  }}
                >
                  <TableCell sx={{ fontWeight: ligne.isHeader || ligne.isTotal ? 700 : 400 }}>
                    {ligne.ref}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: ligne.isHeader || ligne.isTotal || ligne.isTotalGeneral ? 700 : ligne.isSubHeader ? 600 : 400,
                    pl: ligne.level * 3,
                  }}>
                    {ligne.libelle}
                    {ligne.comptes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Comptes: {ligne.comptes.join(', ')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {ligne.note && (
                      <Tooltip title={`Voir note ${ligne.note}`}>
                        <Chip 
                          label={ligne.note} 
                          size="small" 
                          color="info"
                          sx={{ fontSize: '0.7rem', height: '18px' }}
                          clickable
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {modeEdition && ligne.exerciceN !== null && !ligne.isTotal && !ligne.isTotalGeneral ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={ligne.exerciceN}
                        sx={{ width: '120px' }}
                        variant="standard"
                        inputProps={{ 
                          style: { 
                            textAlign: 'right', 
                            fontSize: '0.875rem',
                            fontFamily: 'monospace'
                          } 
                        }}
                      />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 500,
                          color: ligne.isTotalGeneral ? 'inherit' : 'text.primary'
                        }}
                      >
                        {formatMontant(ligne.exerciceN)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 500,
                        color: ligne.isTotalGeneral ? 'inherit' : 'text.primary'
                      }}
                    >
                      {formatMontant(ligne.exerciceN1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {variation !== null && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: variation >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Légende */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Légende:</strong> Les montants sont exprimés en FCFA. 
          Les références correspondent au plan comptable SYSCOHADA révisé.
          Les variations sont calculées par rapport à l'exercice précédent.
        </Typography>
      </Box>
    </Box>
  )
}

export default memo(BilanActif)