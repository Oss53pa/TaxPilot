/**
 * Note 2 - Immobilisations Incorporelles SYSCOHADA
 * Comptes SYSCOHADA classe 21x (brut) / 281x (amortissements)
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
} from '@mui/material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'
import { useBalanceData } from '@/hooks/useBalanceData'

const Note2SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const bal = useBalanceData()

  // Données calculées depuis la balance importée
  // Comptes SYSCOHADA : brut = solde débiteur classe 21x, amort = solde créditeur classe 281x
  const immoRow = (rubrique: string, brutPrefixes: string[], amortPrefixes: string[], taux: string, duree: string) => {
    const brut = bal.d(brutPrefixes)
    const amort = bal.c(amortPrefixes)
    return {
      rubrique,
      valeurBruteDebut: brut, // Brut N (ouverture = clôture car pas de journal)
      acquisitions: 0, // Nécessite données de journal (non disponibles depuis la balance)
      cessions: 0,
      virements: 0,
      valeurBruteFin: brut,
      amortissements: amort,
      valeurNette: brut - amort,
      taux,
      duree,
    }
  }

  const donneesImmobilisations = [
    immoRow('Frais de developpement et de prospection', ['211', '212'], ['2811', '2812'], '-', '-'),
    immoRow('Brevets, licences, logiciels et droits similaires', ['213', '214'], ['2813', '2814'], '20%', '5 ans'),
    immoRow('Fonds commercial et droit au bail', ['215', '216'], ['2815', '2816'], '-', '-'),
    immoRow('Autres immobilisations incorporelles', ['217', '218', '219'], ['2817', '2818', '2819'], '20%', '5 ans'),
  ]

  const total = {
    valeurBruteDebut: donneesImmobilisations.reduce((sum, item) => sum + item.valeurBruteDebut, 0),
    acquisitions: donneesImmobilisations.reduce((sum, item) => sum + item.acquisitions, 0),
    cessions: donneesImmobilisations.reduce((sum, item) => sum + item.cessions, 0),
    virements: donneesImmobilisations.reduce((sum, item) => sum + item.virements, 0),
    valeurBruteFin: donneesImmobilisations.reduce((sum, item) => sum + item.valeurBruteFin, 0),
    amortissements: donneesImmobilisations.reduce((sum, item) => sum + item.amortissements, 0),
    valeurNette: donneesImmobilisations.reduce((sum, item) => sum + item.valeurNette, 0),
  }

  const formatMontant = (montant: number) => {
    if (montant === 0) return '-'
    return montant.toLocaleString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 2 - Immobilisations Incorporelles (en FCFA)
      </Typography>

      {/* Actions du tableau */}
      <TableActions
        tableName="Immobilisations Incorporelles"
        showCalculate={true}
        onSave={() => alert('Immobilisations incorporelles sauvegardees')}
        onAdd={() => alert('Nouvelle ligne ajoutee dans les immobilisations incorporelles')}
        onCalculate={() => alert('Recalcul des amortissements effectue')}
      />

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 250 }}>
                Rubriques
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Valeur brute debut
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Acquisitions
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Cessions/Rebuts
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Virements
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Valeur brute fin
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Amortissements
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>
                Valeur nette
              </TableCell>
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
                <TableCell align="right">{formatMontant(ligne.virements)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(ligne.valeurBruteFin)}</TableCell>
                <TableCell align="right" sx={{ color: 'warning.main' }}>{formatMontant(ligne.amortissements)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatMontant(ligne.valeurNette)}
                </TableCell>
              </TableRow>
            ))}
            {/* Ligne de total */}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.valeurBruteDebut)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(total.acquisitions)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.cessions)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.virements)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.valeurBruteFin)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatMontant(total.amortissements)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                {formatMontant(total.valeurNette)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informations complementaires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Methodes d'amortissement
              </Typography>
              {donneesImmobilisations.filter(l => l.taux !== '-').map((l, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Chip label={l.rubrique} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Typography variant="body2">Taux : {l.taux} - Duree : {l.duree}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Synthese
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Total brut : {formatMontant(total.valeurBruteFin)} FCFA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Total amortissements : {formatMontant(total.amortissements)} FCFA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Valeur nette : {formatMontant(total.valeurNette)} FCFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Commentaires et Observations */}
      <CommentairesSection
        titre="Commentaires et Observations - Note 2"
        noteId="note2"
        commentairesInitiaux={[]}
      />
    </Box>
  )
}

export default Note2SYSCOHADA
