/**
 * Composant Notes Annexes - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material'

interface NotesAnnexesProps {
  modeEdition?: boolean
}

const NotesAnnexes: React.FC<NotesAnnexesProps> = ({ modeEdition = false }) => {
  const notes = [
    {
      numero: '1',
      titre: 'Principes et méthodes comptables',
      contenu: 'Les états financiers sont établis conformément au référentiel SYSCOHADA révisé.',
      statut: 'complete',
    },
    {
      numero: '2',
      titre: 'Immobilisations incorporelles',
      contenu: 'Les immobilisations incorporelles comprennent les logiciels et licences.',
      statut: 'complete',
    },
    {
      numero: '3',
      titre: 'Immobilisations corporelles',
      contenu: 'Les immobilisations corporelles sont évaluées au coût d\'acquisition.',
      statut: 'complete',
    },
    {
      numero: '4',
      titre: 'Immobilisations financières',
      contenu: 'Les titres de participation sont comptabilisés au coût d\'acquisition.',
      statut: 'partial',
    },
    {
      numero: '5',
      titre: 'Stocks et en-cours',
      contenu: 'Les stocks sont évalués selon la méthode du coût moyen pondéré.',
      statut: 'complete',
    },
    {
      numero: '6',
      titre: 'Créances clients',
      contenu: 'Les créances sont inscrites à leur valeur nominale.',
      statut: 'partial',
    },
  ]

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'warning.main' }}>
        Notes Annexes aux États Financiers
      </Typography>
      
      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} md={6} key={note.numero}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Note {note.numero}
                  </Typography>
                  <Chip 
                    label={note.statut === 'complete' ? 'Complète' : 'Partielle'}
                    color={note.statut === 'complete' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  {note.titre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {note.contenu}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default NotesAnnexes