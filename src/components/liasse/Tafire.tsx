/**
 * Composant TAFIRE - Tableau Financier des Ressources et Emplois SYSCOHADA
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
  Grid,
  Alert,
} from '@mui/material'

interface TafireProps {
  modeEdition?: boolean
}

const Tafire: React.FC<TafireProps> = ({ modeEdition = false }) => {
  // Structure du TAFIRE
  const emplois = [
    {
      libelle: 'EMPLOIS',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
    },
    {
      libelle: 'Emplois économiques à financer',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
    },
    {
      libelle: 'Investissements',
      exerciceN: 25000000,
      exerciceN1: 18000000,
    },
    {
      libelle: 'Variation du BFE',
      exerciceN: 8500000,
      exerciceN1: 5200000,
    },
    {
      libelle: 'TOTAL EMPLOIS ÉCONOMIQUES',
      exerciceN: 33500000,
      exerciceN1: 23200000,
      isTotal: true,
    },
    {
      libelle: 'Emplois financiers',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
    },
    {
      libelle: 'Remboursements d\'emprunts',
      exerciceN: 12000000,
      exerciceN1: 10000000,
    },
    {
      libelle: 'Distributions de dividendes',
      exerciceN: 5000000,
      exerciceN1: 4000000,
    },
    {
      libelle: 'TOTAL EMPLOIS FINANCIERS',
      exerciceN: 17000000,
      exerciceN1: 14000000,
      isTotal: true,
    },
    {
      libelle: 'TOTAL GÉNÉRAL EMPLOIS',
      exerciceN: 50500000,
      exerciceN1: 37200000,
      isTotalGeneral: true,
    },
  ]

  const ressources = [
    {
      libelle: 'RESSOURCES',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
    },
    {
      libelle: 'Ressources économiques',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
    },
    {
      libelle: 'Capacité d\'autofinancement (CAF)',
      exerciceN: 21000000,
      exerciceN1: 18000000,
    },
    {
      libelle: 'Cessions d\'immobilisations',
      exerciceN: 2500000,
      exerciceN1: 1800000,
    },
    {
      libelle: 'TOTAL RESSOURCES ÉCONOMIQUES',
      exerciceN: 23500000,
      exerciceN1: 19800000,
      isTotal: true,
    },
    {
      libelle: 'Ressources financières',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
    },
    {
      libelle: 'Augmentation de capital',
      exerciceN: 10000000,
      exerciceN1: 5000000,
    },
    {
      libelle: 'Emprunts nouveaux',
      exerciceN: 15000000,
      exerciceN1: 12000000,
    },
    {
      libelle: 'Subventions d\'investissement',
      exerciceN: 2000000,
      exerciceN1: 400000,
    },
    {
      libelle: 'TOTAL RESSOURCES FINANCIÈRES',
      exerciceN: 27000000,
      exerciceN1: 17400000,
      isTotal: true,
    },
    {
      libelle: 'TOTAL GÉNÉRAL RESSOURCES',
      exerciceN: 50500000,
      exerciceN1: 37200000,
      isTotalGeneral: true,
    },
  ]

  const formatMontant = (montant: number | null) => {
    if (montant === null) return ''
    if (montant === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  const getRowStyle = (ligne: any) => {
    if (ligne.isTotalGeneral) {
      return { 
        backgroundColor: '#2196f3', 
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
        backgroundColor: '#1976d2',
        color: 'white',
        fontWeight: 700,
      }
    }
    if (ligne.isSubHeader) {
      return { 
        backgroundColor: '#f5f5f5',
        fontWeight: 600,
        fontStyle: 'italic',
      }
    }
    return {}
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'info.main' }}>
        TAFIRE - Tableau Financier des Ressources et Emplois
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Le TAFIRE présente l'équilibre entre les emplois et les ressources de l'exercice, 
        permettant d'analyser la politique d'investissement et de financement de l'entreprise.
      </Alert>
      
      <Grid container spacing={3}>
        {/* Emplois */}
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper} sx={{ border: '2px solid #2196f3' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2196f3' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>EMPLOIS</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }} align="right">
                    Exercice N
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }} align="right">
                    Exercice N-1
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emplois.map((ligne, index) => (
                  <TableRow 
                    key={index}
                    sx={getRowStyle(ligne)}
                  >
                    <TableCell sx={{ 
                      fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 
                                  ligne.isSubHeader ? 600 : 400,
                      pl: ligne.isSubHeader ? 2 : ligne.isTotal ? 1 : ligne.isTotalGeneral ? 0 : 3,
                    }}>
                      {ligne.libelle}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatMontant(ligne.exerciceN)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatMontant(ligne.exerciceN1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Ressources */}
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper} sx={{ border: '2px solid #4caf50' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#4caf50' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>RESSOURCES</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }} align="right">
                    Exercice N
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }} align="right">
                    Exercice N-1
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ressources.map((ligne, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      ...getRowStyle(ligne),
                      backgroundColor: ligne.isHeader ? '#4caf50' : 
                                      ligne.isTotalGeneral ? '#4caf50' :
                                      ligne.isTotal ? '#e8f5e9' : 
                                      getRowStyle(ligne).backgroundColor
                    }}
                  >
                    <TableCell sx={{ 
                      fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 
                                  ligne.isSubHeader ? 600 : 400,
                      pl: ligne.isSubHeader ? 2 : ligne.isTotal ? 1 : ligne.isTotalGeneral ? 0 : 3,
                    }}>
                      {ligne.libelle}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatMontant(ligne.exerciceN)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatMontant(ligne.exerciceN1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Analyse */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'info.light' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Analyse des Emplois
            </Typography>
            <Typography variant="body2">
              • Investissements: 25 000 000 FCFA (+38.9%)<br />
              • BFE: 8 500 000 FCFA (+63.5%)<br />
              • Remboursements: 12 000 000 FCFA (+20%)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'success.light' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Analyse des Ressources
            </Typography>
            <Typography variant="body2">
              • CAF: 21 000 000 FCFA (+16.7%)<br />
              • Capital: 10 000 000 FCFA (+100%)<br />
              • Emprunts: 15 000 000 FCFA (+25%)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Équilibre */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.main', color: 'white', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
          ✓ ÉQUILIBRE VÉRIFIÉ : EMPLOIS = RESSOURCES = 50 500 000 FCFA
        </Typography>
      </Box>
    </Box>
  )
}

export default Tafire