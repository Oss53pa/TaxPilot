/**
 * Note 3 - Immobilisations Corporelles SYSCOHADA
 */

import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  LinearProgress,
} from '@mui/material'
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note3SYSCOHADA: React.FC = () => {
  const theme = useTheme()

  const donneesImmobilisations = [
    {
      rubrique: 'Terrains',
      valeurBruteDebut: 45000000,
      acquisitions: 0,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 45000000,
      amortissements: 0,
      valeurNette: 45000000,
      tauxAmort: '0%',
      dureeVie: 'Illimitée',
    },
    {
      rubrique: 'Bâtiments',
      valeurBruteDebut: 180000000,
      acquisitions: 0,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 180000000,
      amortissements: 55000000,
      valeurNette: 125000000,
      tauxAmort: '4%',
      dureeVie: '25 ans',
    },
    {
      rubrique: 'Installations techniques et outillages',
      valeurBruteDebut: 25000000,
      acquisitions: 2000000,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 27000000,
      amortissements: 14500000,
      valeurNette: 12500000,
      tauxAmort: '10%',
      dureeVie: '10 ans',
    },
    {
      rubrique: 'Matériel de transport',
      valeurBruteDebut: 18000000,
      acquisitions: 0,
      cessions: 1500000,
      reevaluations: 0,
      valeurBruteFin: 16500000,
      amortissements: 7600000,
      valeurNette: 8900000,
      tauxAmort: '25%',
      dureeVie: '4 ans',
    },
    {
      rubrique: 'Mobilier, matériel de bureau et informatique',
      valeurBruteDebut: 8500000,
      acquisitions: 1200000,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 9700000,
      amortissements: 4200000,
      valeurNette: 5500000,
      tauxAmort: '20%',
      dureeVie: '5 ans',
    },
    {
      rubrique: 'Agencements et installations',
      valeurBruteDebut: 15000000,
      acquisitions: 0,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 15000000,
      amortissements: 8000000,
      valeurNette: 7000000,
      tauxAmort: '10%',
      dureeVie: '10 ans',
    },
    {
      rubrique: 'Autres immobilisations corporelles',
      valeurBruteDebut: 2500000,
      acquisitions: 500000,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: 3000000,
      amortissements: 1500000,
      valeurNette: 1500000,
      tauxAmort: '20%',
      dureeVie: '5 ans',
    },
  ]

  const total = {
    valeurBruteDebut: donneesImmobilisations.reduce((sum, item) => sum + item.valeurBruteDebut, 0),
    acquisitions: donneesImmobilisations.reduce((sum, item) => sum + item.acquisitions, 0),
    cessions: donneesImmobilisations.reduce((sum, item) => sum + item.cessions, 0),
    reevaluations: donneesImmobilisations.reduce((sum, item) => sum + item.reevaluations, 0),
    valeurBruteFin: donneesImmobilisations.reduce((sum, item) => sum + item.valeurBruteFin, 0),
    amortissements: donneesImmobilisations.reduce((sum, item) => sum + item.amortissements, 0),
    valeurNette: donneesImmobilisations.reduce((sum, item) => sum + item.valeurNette, 0),
  }

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR') + ' FCFA'
  }

  const getTauxAmortissement = (amortissement: number, valeurBrute: number) => {
    if (valeurBrute === 0) return 0
    return (amortissement / valeurBrute) * 100
  }

  const getVariationIcon = (acquisitions: number, cessions: number) => {
    if (acquisitions > cessions) return <TrendingUp color="success" fontSize="small" />
    if (cessions > acquisitions) return <TrendingDown color="error" fontSize="small" />
    return <Remove color="disabled" fontSize="small" />
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 3 - Immobilisations Corporelles
      </Typography>

      {/* Actions du tableau */}
      <TableActions 
        tableName="Immobilisations Corporelles"
        showCalculate={true}
        onSave={() => alert('Immobilisations corporelles sauvegardées')}
        onAdd={() => alert('Nouvelle immobilisation corporelle ajoutée')}
        onCalculate={() => alert('Recalcul des amortissements et plus-values effectué')}
      />

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200 }}>Rubriques</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 110 }}>Valeur brute début</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 100 }}>Acquisitions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 80 }}>Cessions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 100 }}>Réévaluations</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 110 }}>Valeur brute fin</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 110 }}>Amortissements</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 100 }}>Valeur nette</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600, minWidth: 60 }}>Var.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesImmobilisations.map((ligne, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{ligne.rubrique}</TableCell>
                <TableCell align="right">{formatMontant(ligne.valeurBruteDebut)}</TableCell>
                <TableCell align="right" sx={{ color: ligne.acquisitions > 0 ? 'success.main' : 'inherit' }}>
                  {formatMontant(ligne.acquisitions)}
                </TableCell>
                <TableCell align="right" sx={{ color: ligne.cessions > 0 ? 'error.main' : 'inherit' }}>
                  {formatMontant(ligne.cessions)}
                </TableCell>
                <TableCell align="right">{formatMontant(ligne.reevaluations)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(ligne.valeurBruteFin)}</TableCell>
                <TableCell align="right" sx={{ color: 'warning.main' }}>{formatMontant(ligne.amortissements)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatMontant(ligne.valeurNette)}
                </TableCell>
                <TableCell align="center">
                  {getVariationIcon(ligne.acquisitions, ligne.cessions)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.valeurBruteDebut)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(total.acquisitions)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatMontant(total.cessions)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.reevaluations)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.valeurBruteFin)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatMontant(total.amortissements)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                {formatMontant(total.valeurNette)}
              </TableCell>
              <TableCell align="center">
                {getVariationIcon(total.acquisitions, total.cessions)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informations complémentaires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Durées d'amortissement appliquées
              </Typography>
              {donneesImmobilisations.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.rubrique}
                    </Typography>
                    <Chip 
                      label={item.dureeVie} 
                      size="small" 
                      color={item.tauxAmort === '0%' ? 'default' : 'primary'} 
                    />
                  </Box>
                  {item.valeurBruteFin > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={getTauxAmortissement(item.amortissements, item.valeurBruteFin)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Mouvements de l'exercice
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Principales acquisitions :
                </Typography>
                <Typography variant="body2">• Équipement industriel : 2 000 000 FCFA</Typography>
                <Typography variant="body2">• Matériel informatique : 1 200 000 FCFA</Typography>
                <Typography variant="body2">• Autres équipements : 500 000 FCFA</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Cessions de l'exercice :
                </Typography>
                <Typography variant="body2">• Véhicule utilitaire :</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  - Valeur brute : 1 500 000 FCFA
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  - Amortissements : 1 200 000 FCFA
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  - Prix de cession : 400 000 FCFA
                </Typography>
                <Typography variant="body2" sx={{ pl: 2, color: 'success.main' }}>
                  - Plus-value : 100 000 FCFA
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Commentaires et Observations */}
      <CommentairesSection 
        titre="Commentaires et Observations - Note 3"
        noteId="note3" 
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Expert-comptable',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: 'Les immobilisations corporelles sont correctement valorisées et amorties.\n\nPoints d\'attention :\n- Les durées d\'amortissement appliquées sont conformes aux usages sectoriels\n- La cession du véhicule utilitaire génère une plus-value de 100 000 FCFA\n- Aucune dépréciation supplémentaire à constater',
            type: 'note'
          }
        ]}
      />
    </Box>
  )
}

export default Note3SYSCOHADA