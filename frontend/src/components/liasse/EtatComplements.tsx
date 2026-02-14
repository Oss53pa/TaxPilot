/**
 * Composant État Complémentaire - SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material'
import { ExpandMore, Info, Assessment, Description } from '@mui/icons-material'

interface EtatComplementsProps {
  modeEdition?: boolean
}

const EtatComplements: React.FC<EtatComplementsProps> = ({ modeEdition = false }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['section1'])

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Données pour les tableaux complémentaires
  const [effectifData] = useState([
    { category: 'Cadres supérieurs', nombre: 5, salaireBrut: 15000000 },
    { category: 'Cadres moyens', nombre: 12, salaireBrut: 24000000 },
    { category: 'Employés', nombre: 45, salaireBrut: 54000000 },
    { category: 'Ouvriers', nombre: 28, salaireBrut: 28000000 },
  ])

  const [engagementsData] = useState([
    { type: 'Crédits-bails mobiliers', montant: 8500000, echeance: '2-5 ans' },
    { type: 'Crédits-bails immobiliers', montant: 25000000, echeance: '+5 ans' },
    { type: 'Cautions et avals donnés', montant: 5000000, echeance: '1-2 ans' },
    { type: 'Autres engagements', montant: 2500000, echeance: '<1 an' },
  ])

  const [repartitionCAData] = useState([
    { activite: 'Vente de marchandises', montant: 125600000, pourcentage: 59.6 },
    { activite: 'Prestations de services', montant: 65400000, pourcentage: 31.0 },
    { activite: 'Production vendue', montant: 19800000, pourcentage: 9.4 },
  ])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const totalEffectif = effectifData.reduce((sum, item) => sum + item.nombre, 0)
  const totalSalaires = effectifData.reduce((sum, item) => sum + item.salaireBrut, 0)
  const totalEngagements = engagementsData.reduce((sum, item) => sum + item.montant, 0)
  const totalCA = repartitionCAData.reduce((sum, item) => sum + item.montant, 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Description sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            État Complémentaire
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Informations additionnelles - SYSCOHADA
          </Typography>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        L'état complémentaire fournit des informations détaillées sur certains postes des états financiers.
      </Alert>

      {/* Section 1: Informations sur les effectifs et personnel */}
      <Accordion 
        expanded={expandedSections.includes('section1')}
        onChange={() => handleSectionToggle('section1')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Assessment sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Effectifs et personnel</Typography>
            <Chip label={`${totalEffectif} personnes`} color="info" size="small" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'info.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Nombre</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Salaires bruts (FCFA)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {effectifData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.nombre}
                              size="small"
                              sx={{ width: 80 }}
                            />
                          ) : (
                            row.nombre
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.salaireBrut}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            formatNumber(row.salaireBrut)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100', fontWeight: 600 }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{totalEffectif}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatNumber(totalSalaires)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main" gutterBottom>
                    Résumé
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Effectif total:</Typography>
                    <Typography variant="body2" fontWeight={600}>{totalEffectif}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Masse salariale:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatNumber(totalSalaires)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Salaire moyen:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(Math.round(totalSalaires / totalEffectif))} F
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 2: Engagements hors bilan */}
      <Accordion 
        expanded={expandedSections.includes('section2')}
        onChange={() => handleSectionToggle('section2')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Info sx={{ mr: 2, color: 'warning.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Engagements hors bilan</Typography>
            <Chip label={`${formatNumber(totalEngagements)}`} color="warning" size="small" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'warning.light' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type d'engagement</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Échéance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {engagementsData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.type}</TableCell>
                    <TableCell align="right">
                      {modeEdition ? (
                        <TextField
                          type="number"
                          value={row.montant}
                          size="small"
                          sx={{ width: 120 }}
                        />
                      ) : (
                        formatNumber(row.montant)
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={row.echeance} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>TOTAL ENGAGEMENTS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatNumber(totalEngagements)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Section 3: Répartition du chiffre d'affaires */}
      <Accordion 
        expanded={expandedSections.includes('section3')}
        onChange={() => handleSectionToggle('section3')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Assessment sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Répartition du chiffre d'affaires</Typography>
            <Chip label={`${formatNumber(totalCA)}`} color="success" size="small" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'success.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nature de l'activité</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant (FCFA)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {repartitionCAData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.activite}</TableCell>
                        <TableCell align="right">
                          {modeEdition ? (
                            <TextField
                              type="number"
                              value={row.montant}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          ) : (
                            formatNumber(row.montant)
                          )}
                        </TableCell>
                        <TableCell align="right">{row.pourcentage}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>TOTAL CHIFFRE D'AFFAIRES</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(totalCA)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Analyse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    La répartition montre une activité diversifiée avec une prédominance 
                    de la vente de marchandises.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Activité principale: Vente de marchandises (59.6%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 4: Informations diverses */}
      <Accordion 
        expanded={expandedSections.includes('section4')}
        onChange={() => handleSectionToggle('section4')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Info sx={{ mr: 2, color: 'secondary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Informations diverses</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Informations légales</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">RCCM:</Typography>
                    <Typography variant="body1">CI-ABJ-2024-B-12345</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">N° Contribuable:</Typography>
                    <Typography variant="body1">1234567890</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Forme juridique:</Typography>
                    <Typography variant="body1">Société Anonyme</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Informations complémentaires</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Durée de l'exercice:</Typography>
                    <Typography variant="body1">12 mois</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Monnaie de tenue:</Typography>
                    <Typography variant="body1">FCFA</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Commissaire aux comptes:</Typography>
                    <Typography variant="body1">Cabinet AUDIT & CONSEIL</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default EtatComplements