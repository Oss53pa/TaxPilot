/**
 * Plan Comptable SYSCOHADA Révisé Complet - 9 Classes
 * Affichage hiérarchique du plan comptable officiel OHADA 2017
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
} from '@mui/material'
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'
import { 
  PLAN_SYSCOHADA_REVISE, 
  SYSCOHADA_REVISE_CLASSES, 
  CompteComptable, 
  getSYSCOHADAAccountsByClass,
  getSYSCOHADAAccountsBySector 
} from '../../data/SYSCOHADARevisePlan'

const PlanSYSCOHADARevise: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('TOUS')
  const [expandedClass, setExpandedClass] = useState<number | null>(1)

  // Filtrage des comptes
  const filteredAccounts = PLAN_SYSCOHADA_REVISE.filter(compte => {
    const matchSearch = searchTerm === '' || 
                       compte.numero.includes(searchTerm) || 
                       compte.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchSector = selectedSector === 'TOUS' || 
                       !compte.secteurs || 
                       compte.secteurs.includes(selectedSector)
    
    return matchSearch && matchSector
  })

  const getClassColor = (classe: number): string => {
    const colors = {
      1: '#E3F2FD', // Bleu - Ressources durables
      2: '#E8F5E8', // Vert - Actif immobilisé
      3: '#FFF3E0', // Orange - Stocks
      4: '#F3E5F5', // Violet - Tiers
      5: '#E0F2F1', // Teal - Trésorerie
      6: '#FFEBEE', // Rouge - Charges
      7: '#E8F5E8', // Vert - Produits
      8: '#FFF8E1', // Jaune - HAO
      9: '#FAFAFA'  // Gris - Spéciaux
    }
    return colors[classe as keyof typeof colors] || '#FAFAFA'
  }

  const getClassIcon = (classe: number): React.ReactElement => {
    return <AccountIcon sx={{ color: '#171717' }} />
  }

  const getNatureChip = (nature: string, sens: string) => {
    const getColor = () => {
      if (nature === 'ACTIF') return 'primary'
      if (nature === 'PASSIF') return 'secondary' 
      if (nature === 'CHARGE') return 'error'
      if (nature === 'PRODUIT') return 'success'
      return 'default'
    }
    
    return (
      <Chip 
        label={`${nature} (${sens})`}
        size="small"
        color={getColor()}
        sx={{ fontSize: '0.7rem' }}
      />
    )
  }

  const getUtilisationChip = (utilisation: string) => {
    return (
      <Chip 
        label={utilisation}
        size="small"
        color={utilisation === 'OBLIGATOIRE' ? 'success' : utilisation === 'FACULTATIF' ? 'info' : 'default'}
        sx={{ fontSize: '0.7rem' }}
      />
    )
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#171717' }}>
              Plan Comptable SYSCOHADA Révisé
            </Typography>
            <Typography variant="body1" sx={{ color: '#737373' }}>
              Référentiel officiel OHADA 2017 - 9 Classes complètes
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderColor: '#e5e5e5', color: '#171717' }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<ViewIcon />}
              sx={{ backgroundColor: '#171717', '&:hover': { backgroundColor: '#262626' } }}
            >
              Vue Arbre
            </Button>
          </Stack>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#171717' }}>
                {Object.keys(SYSCOHADA_REVISE_CLASSES).length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Classes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E8' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#388E3C' }}>
                {PLAN_SYSCOHADA_REVISE.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Comptes Total
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#F57C00' }}>
                {PLAN_SYSCOHADA_REVISE.filter(c => c.utilisation === 'OBLIGATOIRE').length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Obligatoires
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F3E5F5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B1FA2' }}>
                17
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Pays OHADA
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Recherche et filtres */}
      <Card sx={{ mb: 3, border: '1px solid #e5e5e5' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher un compte (numéro ou libellé)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#737373' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelectedSector(selectedSector === 'TOUS' ? 'COMMERCE' : 'TOUS')}
                sx={{ borderColor: '#e5e5e5', color: '#171717' }}
              >
                Secteur: {selectedSector}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="caption">
                  {filteredAccounts.length} comptes trouvés
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Plan comptable par classes */}
      <Card sx={{ border: '1px solid #e5e5e5' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#171717' }}>
            📊 Plan Comptable SYSCOHADA Révisé - 9 Classes
          </Typography>

          {Object.entries(SYSCOHADA_REVISE_CLASSES).map(([classeNum, classeInfo]) => {
            const comptes = getSYSCOHADAAccountsByClass(parseInt(classeNum)).filter(compte => {
              const matchSearch = searchTerm === '' || 
                                 compte.numero.includes(searchTerm) || 
                                 compte.libelle.toLowerCase().includes(searchTerm.toLowerCase())
              return matchSearch
            })

            return (
              <Accordion
                key={classeNum}
                expanded={expandedClass === parseInt(classeNum)}
                onChange={() => setExpandedClass(expandedClass === parseInt(classeNum) ? null : parseInt(classeNum))}
                sx={{ 
                  mb: 1,
                  '&:before': { display: 'none' },
                  border: '1px solid #e5e5e5',
                  borderRadius: 2
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: getClassColor(parseInt(classeNum)),
                    borderRadius: 1,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  {getClassIcon(parseInt(classeNum))}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#171717' }}>
                      Classe {classeNum} - {classeInfo.libelle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#737373' }}>
                      {classeInfo.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${comptes.length} comptes`}
                    size="small"
                    sx={{ backgroundColor: '#FFFFFF', color: '#171717' }}
                  />
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e5e5e5' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>N° Compte</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Libellé</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Nature</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Utilisation</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Secteurs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comptes.map((compte, index) => (
                          <TableRow 
                            key={compte.numero}
                            sx={{ 
                              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#ffffff',
                              '&:hover': { backgroundColor: '#e5e5e5' }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 600, 
                                color: '#171717'
                              }}>
                                {compte.numero}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#171717' }}>
                                {compte.libelle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${compte.nature} (${compte.sens})`}
                                size="small"
                                color={
                                  compte.nature === 'ACTIF' ? 'primary' :
                                  compte.nature === 'PASSIF' ? 'secondary' : 
                                  compte.nature === 'CHARGE' ? 'error' :
                                  compte.nature === 'PRODUIT' ? 'success' : 'default'
                                }
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={compte.utilisation}
                                size="small"
                                color={compte.utilisation === 'OBLIGATOIRE' ? 'success' : compte.utilisation === 'FACULTATIF' ? 'info' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell>
                              {compte.secteurs ? (
                                <Stack direction="row" spacing={0.5}>
                                  {compte.secteurs.map(secteur => (
                                    <Chip 
                                      key={secteur}
                                      label={secteur}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.6rem',
                                        bgcolor: '#fafafa',
                                        color: '#171717'
                                      }}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#737373' }}>
                                  Tous secteurs
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PlanSYSCOHADARevise