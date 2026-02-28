/**
 * Note 3A - Immobilisations brutes SYSCOHADA
 * (anciennement Note 3 - renommée pour alignement Excel)
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
import { useEditableTable } from '@/hooks/useEditableTable'
import { useBalanceData } from '@/hooks/useBalanceData'

const Note3ASYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const { isEditMode, toggleEditMode, handleCellChange, getCellValue, hasChanges, handleSave } = useEditableTable()

  // Données calculées depuis la balance importée via useBalanceData
  const bal = useBalanceData()

  const immoRow = (rubrique: string, brutPrefixes: string[], amortPrefixes: string[], taux: string, duree: string) => {
    const brut = bal.d(brutPrefixes)
    const amort = bal.c(amortPrefixes)
    return {
      rubrique,
      valeurBruteDebut: brut,
      acquisitions: 0,
      cessions: 0,
      reevaluations: 0,
      valeurBruteFin: brut,
      amortissements: amort,
      valeurNette: brut - amort,
      tauxAmort: taux,
      dureeVie: duree,
    }
  }

  const donneesImmobilisations = [
    immoRow('Terrains (22)', ['22'], ['282'], '0%', 'Illimitee'),
    immoRow('Batiments (23)', ['23'], ['283'], '4%', '25 ans'),
    immoRow('Installations techniques (24)', ['24'], ['284'], '10%', '10 ans'),
    immoRow('Materiel de transport (245)', ['245'], ['2845'], '25%', '4 ans'),
    immoRow('Mobilier et informatique (244)', ['244'], ['2844'], '20%', '5 ans'),
    immoRow('Agencements et installations (218)', ['218'], ['2818'], '10%', '10 ans'),
    immoRow('Autres immobilisations (25)', ['25'], ['285'], '20%', '5 ans'),
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
          Note 3A - Immobilisations brutes (en FCFA)
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
              <Typography variant="body2" color="text.secondary">
                Les acquisitions et cessions de l'exercice sont détaillées dans le tableau ci-dessus.
                Les plus et moins-values de cession sont présentées dans la Note 3D.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Commentaires et Observations */}
      <CommentairesSection
        titre="Commentaires et Observations - Note 3A"
        noteId="note3a"
        commentairesInitiaux={[]}
      />
    </Box>
  )
}

export default Note3ASYSCOHADA