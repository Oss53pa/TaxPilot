/**
 * Note 2 - Immobilisations Incorporelles SYSCOHADA
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

const Note2SYSCOHADA: React.FC = () => {
  const theme = useTheme()

  const donneesImmobilisations = [
    {
      rubrique: 'Frais de développement et de prospection',
      valeurBruteDebut: 0,
      acquisitions: 0,
      cessions: 0,
      virements: 0,
      valeurBruteFin: 0,
      amortissements: 0,
      valeurNette: 0,
      taux: '-',
      duree: '-',
    },
    {
      rubrique: 'Brevets, licences, logiciels et droits similaires',
      valeurBruteDebut: 3500000,
      acquisitions: 1200000,
      cessions: 0,
      virements: 0,
      valeurBruteFin: 4700000,
      amortissements: 2200000,
      valeurNette: 2500000,
      taux: '20%',
      duree: '5 ans',
    },
    {
      rubrique: 'Fonds commercial et droit au bail',
      valeurBruteDebut: 0,
      acquisitions: 0,
      cessions: 0,
      virements: 0,
      valeurBruteFin: 0,
      amortissements: 0,
      valeurNette: 0,
      taux: '-',
      duree: '-',
    },
    {
      rubrique: 'Autres immobilisations incorporelles',
      valeurBruteDebut: 800000,
      acquisitions: 0,
      cessions: 0,
      virements: 0,
      valeurBruteFin: 800000,
      amortissements: 450000,
      valeurNette: 350000,
      taux: '20%',
      duree: '5 ans',
    },
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
    return montant.toLocaleString('fr-FR') + ' FCFA'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 2 - Immobilisations Incorporelles
      </Typography>

      {/* Actions du tableau */}
      <TableActions 
        tableName="Immobilisations Incorporelles"
        showCalculate={true}
        onSave={() => alert('Immobilisations incorporelles sauvegardées')}
        onAdd={() => alert('Nouvelle ligne ajoutée dans les immobilisations incorporelles')}
        onCalculate={() => alert('Recalcul des amortissements effectué')}
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
                Valeur brute début
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

      {/* Informations complémentaires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Méthodes d'amortissement
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Brevets et licences" size="small" sx={{ mr: 1, mb: 1 }} />
                <Typography variant="body2">Amortis sur 5 ans selon le mode linéaire</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Chip label="Logiciels" size="small" sx={{ mr: 1, mb: 1 }} />
                <Typography variant="body2">Amortis sur 3 ans selon le mode linéaire</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Chip label="Autres immobilisations" size="small" sx={{ mr: 1, mb: 1 }} />
                <Typography variant="body2">Amortis selon leur durée d'utilité</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Principales acquisitions de l'exercice
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  • Logiciel comptable intégré : 800 000 FCFA
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  • Licence Microsoft Office : 400 000 FCFA
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  • Total acquisitions : {formatMontant(total.acquisitions)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Toutes les acquisitions d'immobilisations incorporelles de l'exercice correspondent à des éléments identifiables et contrôlés par l'entreprise.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Commentaires et Observations */}
      <CommentairesSection 
        titre="Commentaires et Observations - Note 2"
        noteId="note2" 
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Expert-comptable',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: 'Les immobilisations incorporelles sont correctement évaluées et amorties selon les durées d\'utilité estimées.\n\nObservations :\n- Le logiciel comptable est amorti sur 3 ans\n- Les licences logicielles sont amorties sur 2 ans\n- Aucun indice de perte de valeur identifié',
            type: 'observation'
          }
        ]}
      />
    </Box>
  )
}

export default Note2SYSCOHADA