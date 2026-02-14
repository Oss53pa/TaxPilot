/**
 * Composant TAFIRE - Tableau Financier des Ressources et Emplois SYSCOHADA
 */

import { useState, useEffect, type FC, type ReactElement } from 'react'
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
  TextField,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import {
  TableChart,
  TrendingUp,
  TrendingDown,
  SwapVert,
} from '@mui/icons-material'

interface TafireProps {
  modeEdition?: boolean
}

interface TafireItem {
  code: string
  libelle: string
  exerciceN: number | null
  exerciceN1: number | null
  isHeader?: boolean
  isSubHeader?: boolean
  isTotal?: boolean
  isTotalGeneral?: boolean
  level?: number
}

const Tafire: FC<TafireProps> = ({ modeEdition = false }) => {
  // Structure complète du TAFIRE
  const [emploisData, setEmploisData] = useState<TafireItem[]>([
    // EN-TÊTE EMPLOIS
    {
      code: 'EMP',
      libelle: 'EMPLOIS',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    
    // EMPLOIS ÉCONOMIQUES
    {
      code: 'EMP_ECO',
      libelle: 'I - EMPLOIS ÉCONOMIQUES',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      code: 'E01',
      libelle: 'Acquisitions d\'immobilisations corporelles',
      exerciceN: 15000000,
      exerciceN1: 12000000,
      level: 2,
    },
    {
      code: 'E02',
      libelle: 'Acquisitions d\'immobilisations incorporelles',
      exerciceN: 2500000,
      exerciceN1: 1800000,
      level: 2,
    },
    {
      code: 'E03',
      libelle: 'Acquisitions d\'immobilisations financières',
      exerciceN: 5000000,
      exerciceN1: 3200000,
      level: 2,
    },
    {
      code: 'E04',
      libelle: 'Variation du Besoin de Financement d\'Exploitation (+)',
      exerciceN: 8500000,
      exerciceN1: 5200000,
      level: 2,
    },
    {
      code: 'E05',
      libelle: 'Variation du Besoin Hors Activité Ordinaire (+)',
      exerciceN: 2500000,
      exerciceN1: 1800000,
      level: 2,
    },
    {
      code: 'E_TOT_ECO',
      libelle: 'TOTAL I - EMPLOIS ÉCONOMIQUES',
      exerciceN: 33500000,
      exerciceN1: 24000000,
      isTotal: true,
      level: 1,
    },
    
    // EMPLOIS FINANCIERS
    {
      code: 'EMP_FIN',
      libelle: 'II - EMPLOIS FINANCIERS',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      code: 'E06',
      libelle: 'Charges financières',
      exerciceN: 3500000,
      exerciceN1: 2800000,
      level: 2,
    },
    {
      code: 'E07',
      libelle: 'Remboursements d\'emprunts et dettes financières',
      exerciceN: 12000000,
      exerciceN1: 10000000,
      level: 2,
    },
    {
      code: 'E08',
      libelle: 'Distributions mise en paiement',
      exerciceN: 5000000,
      exerciceN1: 4000000,
      level: 2,
    },
    {
      code: 'E_TOT_FIN',
      libelle: 'TOTAL II - EMPLOIS FINANCIERS',
      exerciceN: 20500000,
      exerciceN1: 16800000,
      isTotal: true,
      level: 1,
    },
    
    // TOTAL GÉNÉRAL EMPLOIS
    {
      code: 'E_TOT_GEN',
      libelle: 'TOTAL GÉNÉRAL EMPLOIS',
      exerciceN: 54000000,
      exerciceN1: 40800000,
      isTotalGeneral: true,
      level: 0,
    },
  ])

  const [ressourcesData, setRessourcesData] = useState<TafireItem[]>([
    // EN-TÊTE RESSOURCES
    {
      code: 'RES',
      libelle: 'RESSOURCES',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0,
    },
    
    // RESSOURCES INTERNES
    {
      code: 'RES_INT',
      libelle: 'I - RESSOURCES INTERNES',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      code: 'R01',
      libelle: 'Capacité d\'Autofinancement Globale (CAFG)',
      exerciceN: 28000000,
      exerciceN1: 24500000,
      level: 2,
    },
    {
      code: 'R02',
      libelle: 'Cessions et réductions d\'immobilisations',
      exerciceN: 3500000,
      exerciceN1: 2800000,
      level: 2,
    },
    {
      code: 'R03',
      libelle: 'Cessions d\'immobilisations financières',
      exerciceN: 1200000,
      exerciceN1: 800000,
      level: 2,
    },
    {
      code: 'R_TOT_INT',
      libelle: 'TOTAL I - RESSOURCES INTERNES',
      exerciceN: 32700000,
      exerciceN1: 28100000,
      isTotal: true,
      level: 1,
    },
    
    // RESSOURCES EXTERNES
    {
      code: 'RES_EXT',
      libelle: 'II - RESSOURCES EXTERNES',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1,
    },
    {
      code: 'R04',
      libelle: 'Augmentations de capital par apports nouveaux',
      exerciceN: 10000000,
      exerciceN1: 5000000,
      level: 2,
    },
    {
      code: 'R05',
      libelle: 'Subventions d\'investissement reçues',
      exerciceN: 2500000,
      exerciceN1: 1200000,
      level: 2,
    },
    {
      code: 'R06',
      libelle: 'Emprunts nouveaux',
      exerciceN: 8000000,
      exerciceN1: 6000000,
      level: 2,
    },
    {
      code: 'R07',
      libelle: 'Autres dettes financières',
      exerciceN: 800000,
      exerciceN1: 500000,
      level: 2,
    },
    {
      code: 'R_TOT_EXT',
      libelle: 'TOTAL II - RESSOURCES EXTERNES',
      exerciceN: 21300000,
      exerciceN1: 12700000,
      isTotal: true,
      level: 1,
    },
    
    // TOTAL GÉNÉRAL RESSOURCES
    {
      code: 'R_TOT_GEN',
      libelle: 'TOTAL GÉNÉRAL RESSOURCES',
      exerciceN: 54000000,
      exerciceN1: 40800000,
      isTotalGeneral: true,
      level: 0,
    },
  ])

  const updateEmplois = (code: string, field: 'exerciceN' | 'exerciceN1', value: number) => {
    if (!modeEdition) return
    
    setEmploisData(prev => prev.map(item => {
      if (item.code === code) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const updateRessources = (code: string, field: 'exerciceN' | 'exerciceN1', value: number) => {
    if (!modeEdition) return
    
    setRessourcesData(prev => prev.map(item => {
      if (item.code === code) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Calcul automatique des totaux
  useEffect(() => {
    // Recalcul des totaux emplois
    setEmploisData(prev => prev.map(item => {
      if (item.code === 'E_TOT_ECO') {
        const sousTotal = prev.filter(p => 
          ['E01', 'E02', 'E03', 'E04', 'E05'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN || 0), 0)
        const sousTotalN1 = prev.filter(p => 
          ['E01', 'E02', 'E03', 'E04', 'E05'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN1 || 0), 0)
        return { ...item, exerciceN: sousTotal, exerciceN1: sousTotalN1 }
      }
      if (item.code === 'E_TOT_FIN') {
        const sousTotal = prev.filter(p => 
          ['E06', 'E07', 'E08'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN || 0), 0)
        const sousTotalN1 = prev.filter(p => 
          ['E06', 'E07', 'E08'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN1 || 0), 0)
        return { ...item, exerciceN: sousTotal, exerciceN1: sousTotalN1 }
      }
      if (item.code === 'E_TOT_GEN') {
        const ecoTotal = prev.find(p => p.code === 'E_TOT_ECO')
        const finTotal = prev.find(p => p.code === 'E_TOT_FIN')
        return {
          ...item,
          exerciceN: (ecoTotal?.exerciceN || 0) + (finTotal?.exerciceN || 0),
          exerciceN1: (ecoTotal?.exerciceN1 || 0) + (finTotal?.exerciceN1 || 0)
        }
      }
      return item
    }))

    // Recalcul des totaux ressources
    setRessourcesData(prev => prev.map(item => {
      if (item.code === 'R_TOT_INT') {
        const sousTotal = prev.filter(p => 
          ['R01', 'R02', 'R03'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN || 0), 0)
        const sousTotalN1 = prev.filter(p => 
          ['R01', 'R02', 'R03'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN1 || 0), 0)
        return { ...item, exerciceN: sousTotal, exerciceN1: sousTotalN1 }
      }
      if (item.code === 'R_TOT_EXT') {
        const sousTotal = prev.filter(p => 
          ['R04', 'R05', 'R06', 'R07'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN || 0), 0)
        const sousTotalN1 = prev.filter(p => 
          ['R04', 'R05', 'R06', 'R07'].includes(p.code)
        ).reduce((sum, p) => sum + (p.exerciceN1 || 0), 0)
        return { ...item, exerciceN: sousTotal, exerciceN1: sousTotalN1 }
      }
      if (item.code === 'R_TOT_GEN') {
        const intTotal = prev.find(p => p.code === 'R_TOT_INT')
        const extTotal = prev.find(p => p.code === 'R_TOT_EXT')
        return {
          ...item,
          exerciceN: (intTotal?.exerciceN || 0) + (extTotal?.exerciceN || 0),
          exerciceN1: (intTotal?.exerciceN1 || 0) + (extTotal?.exerciceN1 || 0)
        }
      }
      return item
    }))
  }, [emploisData, ressourcesData])

  const formatNumber = (value: number | null) => {
    if (value === null) return ''
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const getRowStyle = (item: TafireItem) => {
    if (item.isTotalGeneral) {
      return {
        backgroundColor: 'primary.main',
        '& .MuiTableCell-root': { color: 'white', fontWeight: 700, fontSize: '1.1rem' }
      }
    }
    if (item.isTotal) {
      return {
        backgroundColor: 'secondary.light',
        '& .MuiTableCell-root': { fontWeight: 600 }
      }
    }
    if (item.isSubHeader) {
      return {
        backgroundColor: 'grey.200',
        '& .MuiTableCell-root': { fontWeight: 600, fontStyle: 'italic' }
      }
    }
    if (item.isHeader) {
      return {
        backgroundColor: 'info.main',
        '& .MuiTableCell-root': { color: 'white', fontWeight: 700, fontSize: '1.2rem' }
      }
    }
    return {}
  }

  const totalEmplois = emploisData.find(item => item.code === 'E_TOT_GEN')
  const totalRessources = ressourcesData.find(item => item.code === 'R_TOT_GEN')
  const equilibre = (totalRessources?.exerciceN || 0) - (totalEmplois?.exerciceN || 0)

  const renderTableau = (data: TafireItem[], titre: string, updateFunction: any, icon: ReactElement) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {titre}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Postes</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, minWidth: 120 }}>Exercice N</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, minWidth: 120 }}>Exercice N-1</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} sx={getRowStyle(item)}>
                  <TableCell sx={{ paddingLeft: `${(item.level || 0) * 20 + 16}px` }}>
                    {item.libelle}
                  </TableCell>
                  <TableCell align="right">
                    {item.exerciceN !== null ? (
                      modeEdition && !item.isHeader && !item.isSubHeader && !item.isTotal && !item.isTotalGeneral ? (
                        <TextField
                          type="number"
                          value={item.exerciceN || 0}
                          onChange={(e) => updateFunction(item.code, 'exerciceN', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        formatNumber(item.exerciceN)
                      )
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {item.exerciceN1 !== null ? (
                      modeEdition && !item.isHeader && !item.isSubHeader && !item.isTotal && !item.isTotalGeneral ? (
                        <TextField
                          type="number"
                          value={item.exerciceN1 || 0}
                          onChange={(e) => updateFunction(item.code, 'exerciceN1', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        formatNumber(item.exerciceN1)
                      )
                    ) : (
                      ''
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TableChart sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            TAFIRE - Tableau Financier des Ressources et Emplois (en FCFA)
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            SYSCOHADA - Vision financière des flux
          </Typography>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Le TAFIRE explique les variations du patrimoine de l'entreprise au cours de l'exercice 
        en mettant en évidence l'équilibre emplois-ressources.
      </Alert>

      {/* Indicateurs d'équilibre */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TrendingDown sx={{ color: 'error.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Total Emplois</Typography>
              <Typography variant="h6" color="error.main">
                {formatNumber(totalEmplois?.exerciceN || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUp sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Total Ressources</Typography>
              <Typography variant="h6" color="success.main">
                {formatNumber(totalRessources?.exerciceN || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <SwapVert sx={{ color: equilibre === 0 ? 'success.main' : 'warning.main', fontSize: 32, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Équilibre</Typography>
              <Typography variant="h6" color={equilibre === 0 ? 'success.main' : 'warning.main'}>
                {equilibre === 0 ? 'Équilibré' : `${formatNumber(Math.abs(equilibre))}`}
              </Typography>
              {equilibre !== 0 && (
                <Chip 
                  label={equilibre > 0 ? 'Excédent ressources' : 'Excédent emplois'} 
                  color={equilibre > 0 ? 'success' : 'error'} 
                  size="small" 
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Colonne Emplois */}
        <Grid item xs={12} lg={6}>
          {renderTableau(
            emploisData, 
            'EMPLOIS', 
            updateEmplois, 
            <TrendingDown color="error" />
          )}
        </Grid>
        
        {/* Colonne Ressources */}
        <Grid item xs={12} lg={6}>
          {renderTableau(
            ressourcesData, 
            'RESSOURCES', 
            updateRessources, 
            <TrendingUp color="success" />
          )}
        </Grid>
      </Grid>

      {/* Note d'équilibre */}
      {equilibre !== 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Attention : Le tableau n'est pas équilibré. Vérifiez les montants saisis.
          {equilibre > 0 
            ? ` Excédent de ressources : ${formatNumber(equilibre)}`
            : ` Excédent d'emplois : ${formatNumber(-equilibre)}`
          }
        </Alert>
      )}

      {/* Notes explicatives */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Notes explicatives
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                EMPLOIS (Utilisations de fonds)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Investissements et acquisitions d'actifs<br/>
                - Remboursements d'emprunts<br/>
                - Distributions aux actionnaires<br/>
                - Augmentation du besoin de financement
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                RESSOURCES (Origines de fonds)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Capacité d'autofinancement<br/>
                - Cessions d'actifs<br/>
                - Nouveaux emprunts et financements<br/>
                - Augmentations de capital
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Tafire