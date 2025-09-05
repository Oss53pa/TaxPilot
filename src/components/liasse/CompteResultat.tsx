/**
 * Composant Compte de Résultat - SYSCOHADA
 */

import React from 'react'
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
  Grid,
  Chip,
  Tooltip,
} from '@mui/material'

interface CompteResultatProps {
  modeEdition?: boolean
}

const CompteResultat: React.FC<CompteResultatProps> = ({ modeEdition = false }) => {
  // Structure du Compte de Résultat SYSCOHADA
  const lignesCompteResultat = [
    // PRODUITS
    {
      ref: 'RA',
      libelle: 'ACTIVITÉ D\'EXPLOITATION',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'RB',
      libelle: 'Ventes de marchandises',
      exerciceN: 125600000,
      exerciceN1: 118900000,
      comptes: ['701', '702', '703', '704', '705', '706', '707'],
      level: 1,
    },
    {
      ref: 'RC',
      libelle: 'Production vendue',
      exerciceN: 85200000,
      exerciceN1: 78500000,
      comptes: ['704', '705', '706'],
      level: 1,
    },
    {
      ref: 'RD',
      libelle: 'Production stockée (ou déstockage)',
      exerciceN: 1200000,
      exerciceN1: -800000,
      comptes: ['73'],
      level: 1,
    },
    {
      ref: 'RE',
      libelle: 'Production immobilisée',
      exerciceN: 500000,
      exerciceN1: 300000,
      comptes: ['72'],
      level: 1,
    },
    {
      ref: 'RF',
      libelle: 'Subventions d\'exploitation',
      exerciceN: 2000000,
      exerciceN1: 1500000,
      comptes: ['71'],
      level: 1,
    },
    {
      ref: 'RG',
      libelle: 'Autres produits',
      exerciceN: 3200000,
      exerciceN1: 2800000,
      comptes: ['75', '758'],
      level: 1,
    },
    {
      ref: 'RH',
      libelle: 'CHIFFRE D\'AFFAIRES (RB+RC)',
      exerciceN: 210800000,
      exerciceN1: 197400000,
      isSubTotal: true,
      level: 0,
    },
    
    // CHARGES D'EXPLOITATION
    {
      ref: 'TA',
      libelle: 'Achats de marchandises',
      exerciceN: -65200000,
      exerciceN1: -61500000,
      comptes: ['601', '602', '603', '604', '605', '608'],
      level: 1,
    },
    {
      ref: 'TB',
      libelle: 'Variation de stocks de marchandises',
      exerciceN: 1200000,
      exerciceN1: -500000,
      comptes: ['6031'],
      level: 1,
    },
    {
      ref: 'TC',
      libelle: 'Achats de matières premières',
      exerciceN: -42300000,
      exerciceN1: -39800000,
      comptes: ['601', '602'],
      level: 1,
    },
    {
      ref: 'TD',
      libelle: 'Variation de stocks de matières premières',
      exerciceN: -800000,
      exerciceN1: 600000,
      comptes: ['6032'],
      level: 1,
    },
    {
      ref: 'TE',
      libelle: 'Autres achats',
      exerciceN: -8500000,
      exerciceN1: -7900000,
      comptes: ['604', '605', '608'],
      level: 1,
    },
    {
      ref: 'TF',
      libelle: 'Transports',
      exerciceN: -4200000,
      exerciceN1: -3800000,
      comptes: ['61'],
      level: 1,
    },
    {
      ref: 'TG',
      libelle: 'Services extérieurs',
      exerciceN: -12500000,
      exerciceN1: -11200000,
      comptes: ['62', '63'],
      level: 1,
    },
    {
      ref: 'TH',
      libelle: 'Impôts et taxes',
      exerciceN: -3800000,
      exerciceN1: -3500000,
      comptes: ['64'],
      level: 1,
    },
    {
      ref: 'TI',
      libelle: 'Charges de personnel',
      exerciceN: -48500000,
      exerciceN1: -45200000,
      comptes: ['66'],
      level: 1,
    },
    {
      ref: 'TJ',
      libelle: 'VALEUR AJOUTÉE',
      exerciceN: 33000000,
      exerciceN1: 29100000,
      isSubTotal: true,
      level: 0,
    },
    {
      ref: 'TK',
      libelle: 'EXCÉDENT BRUT D\'EXPLOITATION',
      exerciceN: 28700000,
      exerciceN1: 25600000,
      isSubTotal: true,
      level: 0,
    },
    
    // DOTATIONS ET REPRISES
    {
      ref: 'TL',
      libelle: 'Dotations aux amortissements et provisions',
      exerciceN: -8500000,
      exerciceN1: -7800000,
      comptes: ['681', '691'],
      level: 1,
    },
    {
      ref: 'TM',
      libelle: 'Reprises de provisions',
      exerciceN: 1200000,
      exerciceN1: 900000,
      comptes: ['791', '798'],
      level: 1,
    },
    {
      ref: 'TN',
      libelle: 'RÉSULTAT D\'EXPLOITATION',
      exerciceN: 21400000,
      exerciceN1: 18700000,
      isSubTotal: true,
      isImportant: true,
      level: 0,
    },
    
    // RÉSULTAT FINANCIER
    {
      ref: 'UA',
      libelle: 'ACTIVITÉ FINANCIÈRE',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'UB',
      libelle: 'Produits financiers',
      exerciceN: 2500000,
      exerciceN1: 2100000,
      comptes: ['77'],
      level: 1,
    },
    {
      ref: 'UC',
      libelle: 'Charges financières',
      exerciceN: -4800000,
      exerciceN1: -5200000,
      comptes: ['67'],
      level: 1,
    },
    {
      ref: 'UD',
      libelle: 'RÉSULTAT FINANCIER',
      exerciceN: -2300000,
      exerciceN1: -3100000,
      isSubTotal: true,
      level: 0,
    },
    {
      ref: 'UE',
      libelle: 'RÉSULTAT COURANT AVANT IMPÔTS',
      exerciceN: 19100000,
      exerciceN1: 15600000,
      isSubTotal: true,
      isImportant: true,
      level: 0,
    },
    
    // HAO
    {
      ref: 'VA',
      libelle: 'HORS ACTIVITÉS ORDINAIRES (HAO)',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    {
      ref: 'VB',
      libelle: 'Produits HAO',
      exerciceN: 800000,
      exerciceN1: 500000,
      comptes: ['82', '84', '86', '88'],
      level: 1,
    },
    {
      ref: 'VC',
      libelle: 'Charges HAO',
      exerciceN: -1200000,
      exerciceN1: -900000,
      comptes: ['81', '83', '85'],
      level: 1,
    },
    {
      ref: 'VD',
      libelle: 'RÉSULTAT HAO',
      exerciceN: -400000,
      exerciceN1: -400000,
      isSubTotal: true,
      level: 0,
    },
    
    // IMPÔTS
    {
      ref: 'WA',
      libelle: 'Participation des travailleurs',
      exerciceN: -1900000,
      exerciceN1: -1500000,
      comptes: ['87'],
      level: 1,
    },
    {
      ref: 'WB',
      libelle: 'Impôts sur le résultat',
      exerciceN: -4300000,
      exerciceN1: -3500000,
      comptes: ['89'],
      level: 1,
    },
    
    // RÉSULTAT NET
    {
      ref: 'XZ',
      libelle: 'RÉSULTAT NET DE L\'EXERCICE',
      exerciceN: 12500000,
      exerciceN1: 10200000,
      isTotalGeneral: true,
      level: 0,
    },
  ]

  const formatMontant = (montant: number | null) => {
    if (montant === null) return ''
    if (montant === 0) return '-'
    
    const isNegative = montant < 0
    const absValue = Math.abs(montant)
    const formatted = new Intl.NumberFormat('fr-FR').format(absValue)
    
    return isNegative ? `(${formatted})` : formatted
  }

  const getRowStyle = (ligne: any) => {
    if (ligne.isTotalGeneral) {
      return { 
        backgroundColor: '#4caf50', 
        color: 'white',
        fontWeight: 700,
      }
    }
    if (ligne.isImportant) {
      return { 
        backgroundColor: '#fff8e1',
        fontWeight: 700,
        borderTop: '2px solid #ff9800',
        borderBottom: '2px solid #ff9800',
      }
    }
    if (ligne.isSubTotal) {
      return { 
        backgroundColor: '#f5f5f5',
        fontWeight: 700,
      }
    }
    if (ligne.isHeader) {
      return { 
        backgroundColor: '#e8eaf6',
        fontWeight: 700,
      }
    }
    return {}
  }

  const getTextColor = (montant: number | null) => {
    if (montant === null) return 'inherit'
    return montant < 0 ? 'error.main' : 'success.dark'
  }

  // Calcul des ratios
  const calculateRatios = () => {
    const ca = 210800000
    const va = 33000000
    const ebe = 28700000
    const re = 21400000
    const rn = 12500000
    
    return {
      tauxVA: (va / ca * 100).toFixed(1),
      tauxEBE: (ebe / ca * 100).toFixed(1),
      tauxRE: (re / ca * 100).toFixed(1),
      tauxRN: (rn / ca * 100).toFixed(1),
    }
  }

  const ratios = calculateRatios()

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'secondary.main' }}>
        COMPTE DE RÉSULTAT
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tableau principal */}
        <Grid item xs={12} lg={9}>
          <TableContainer component={Paper} sx={{ border: '2px solid #9c27b0' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }}>Réf</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Libellé</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                    Exercice N<br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      2024
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                    Exercice N-1<br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      2023
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lignesCompteResultat.map((ligne, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      ...getRowStyle(ligne),
                      '&:hover': { 
                        backgroundColor: ligne.isHeader || ligne.isSubTotal || ligne.isTotalGeneral 
                          ? undefined 
                          : 'action.hover' 
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 400 }}>
                      {ligne.ref}
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: ligne.isHeader || ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 400,
                      pl: ligne.level * 3,
                    }}>
                      {ligne.libelle}
                      {ligne.comptes && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Comptes: {ligne.comptes.join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {modeEdition && ligne.exerciceN !== null && !ligne.isSubTotal && !ligne.isTotalGeneral ? (
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
                            fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 500,
                            color: ligne.isTotalGeneral ? 'inherit' : getTextColor(ligne.exerciceN)
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
                          fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 500,
                          color: ligne.isTotalGeneral ? 'inherit' : getTextColor(ligne.exerciceN1)
                        }}
                      >
                        {formatMontant(ligne.exerciceN1)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Panneau des ratios */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ p: 2, border: '2px solid #9c27b0' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'secondary.main' }}>
              Ratios d'exploitation
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de valeur ajoutée
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {ratios.tauxVA}%
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux d'EBE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {ratios.tauxEBE}%
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de résultat d'exploitation
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {ratios.tauxRE}%
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de résultat net
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {ratios.tauxRN}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Analyse:</strong> L'entreprise présente une rentabilité satisfaisante 
                avec une amélioration notable du résultat net (+22.5%) par rapport à l'exercice précédent.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Légende */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Légende:</strong> Les montants sont exprimés en FCFA. 
          Les charges sont présentées entre parenthèses.
          Les soldes intermédiaires de gestion sont mis en évidence.
        </Typography>
      </Box>
    </Box>
  )
}

export default CompteResultat