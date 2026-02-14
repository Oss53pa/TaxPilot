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
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  LinearProgress,
} from '@mui/material'
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'
import EditableToolbar from '../shared/EditableToolbar'
import { useEditableTable } from '../../../hooks/useEditableTable'

const Note3SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const { isEditMode, toggleEditMode, handleCellChange, getCellValue, hasChanges, handleSave } = useEditableTable()

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

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Note 3 - Immobilisations Corporelles (en FCFA)
        </Typography>
        <EditableToolbar
          isEditMode={isEditMode}
          onToggleEdit={toggleEditMode}
          hasChanges={hasChanges}
          onSave={handleSave}
        />
      </Stack>

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
            {donneesImmobilisations.map((ligne, index) => {
              const getVal = (field: string, defaultVal: number) =>
                Number(getCellValue(`immo_${index}`, field, defaultVal))
              const valBruteDebut = getVal('valeurBruteDebut', ligne.valeurBruteDebut)
              const acquisitions = getVal('acquisitions', ligne.acquisitions)
              const cessions = getVal('cessions', ligne.cessions)
              const reevaluations = getVal('reevaluations', ligne.reevaluations)
              const valBruteFin = valBruteDebut + acquisitions - cessions + reevaluations
              const amortissements = getVal('amortissements', ligne.amortissements)
              const valNette = valBruteFin - amortissements

              const renderEditableCell = (field: string, value: number) =>
                isEditMode ? (
                  <TextField
                    size="small"
                    type="number"
                    value={getCellValue(`immo_${index}`, field, value)}
                    onChange={(e) => handleCellChange(`immo_${index}`, field, Number(e.target.value) || 0)}
                    sx={{ width: 110 }}
                    InputProps={{ sx: { fontSize: '0.85rem' } }}
                  />
                ) : (
                  formatMontant(value)
                )

              return (
                <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{ligne.rubrique}</TableCell>
                  <TableCell align="right">{renderEditableCell('valeurBruteDebut', valBruteDebut)}</TableCell>
                  <TableCell align="right" sx={{ color: acquisitions > 0 ? 'success.main' : 'inherit' }}>
                    {renderEditableCell('acquisitions', acquisitions)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: cessions > 0 ? 'error.main' : 'inherit' }}>
                    {renderEditableCell('cessions', cessions)}
                  </TableCell>
                  <TableCell align="right">{renderEditableCell('reevaluations', reevaluations)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(valBruteFin)}</TableCell>
                  <TableCell align="right" sx={{ color: 'warning.main' }}>{renderEditableCell('amortissements', amortissements)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatMontant(valNette)}
                  </TableCell>
                  <TableCell align="center">
                    {getVariationIcon(acquisitions, cessions)}
                  </TableCell>
                </TableRow>
              )
            })}
            {(() => {
              const computedTotal = donneesImmobilisations.reduce((acc, ligne, index) => {
                const getVal = (field: string, defaultVal: number) =>
                  Number(getCellValue(`immo_${index}`, field, defaultVal))
                const vbd = getVal('valeurBruteDebut', ligne.valeurBruteDebut)
                const acq = getVal('acquisitions', ligne.acquisitions)
                const ces = getVal('cessions', ligne.cessions)
                const reev = getVal('reevaluations', ligne.reevaluations)
                const amort = getVal('amortissements', ligne.amortissements)
                const vbf = vbd + acq - ces + reev
                return {
                  valeurBruteDebut: acc.valeurBruteDebut + vbd,
                  acquisitions: acc.acquisitions + acq,
                  cessions: acc.cessions + ces,
                  reevaluations: acc.reevaluations + reev,
                  valeurBruteFin: acc.valeurBruteFin + vbf,
                  amortissements: acc.amortissements + amort,
                  valeurNette: acc.valeurNette + (vbf - amort),
                }
              }, { valeurBruteDebut: 0, acquisitions: 0, cessions: 0, reevaluations: 0, valeurBruteFin: 0, amortissements: 0, valeurNette: 0 })
              return (
                <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(computedTotal.valeurBruteDebut)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(computedTotal.acquisitions)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatMontant(computedTotal.cessions)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(computedTotal.reevaluations)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(computedTotal.valeurBruteFin)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatMontant(computedTotal.amortissements)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                    {formatMontant(computedTotal.valeurNette)}
                  </TableCell>
                  <TableCell align="center">
                    {getVariationIcon(computedTotal.acquisitions, computedTotal.cessions)}
                  </TableCell>
                </TableRow>
              )
            })()}
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