/**
 * Note 15 SYSCOHADA - Plus ou Moins-Values sur Cessions
 * Avec système de commentaires intégré
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip
} from '@mui/material'
import {
  Add,
} from '@mui/icons-material'
import { useBalanceData } from '@/hooks/useBalanceData'

const Note15SYSCOHADA: React.FC = () => {
  const bal = useBalanceData()
  const [typeCommentaire, setTypeCommentaire] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [commentaires, setCommentaires] = useState<Array<{
    id: string; type: string; contenu: string; date: Date
  }>>([])

  const typesCommentaires = [
    'Justification cession',
    'Méthode évaluation',
    'Impact fiscal',
    'Politique cession',
    'Autre observation'
  ]

  // Cessions calculées depuis la balance (comptes SYSCOHADA)
  const prixCession = bal.c(['82'])
  const vncCession = bal.d(['81'])
  const plusMoinsValue = prixCession - vncCession
  const cessions = (prixCession > 0 || vncCession > 0) ? [
    {
      nature: 'Cessions d\'immobilisations de l\'exercice',
      date_acquisition: '',
      date_cession: '',
      valeur_origine: 0,
      amortissements: 0,
      vnc: vncCession,
      prix_cession: prixCession,
      plus_moins_value: plusMoinsValue,
      regime_fiscal: plusMoinsValue >= 0 ? 'Imposable' : 'Moins-value'
    }
  ] : []

  const ajouterCommentaire = () => {
    if (typeCommentaire && commentaire.trim()) {
      setCommentaires([...commentaires, {
        id: Date.now().toString(),
        type: typeCommentaire,
        contenu: commentaire,
        date: new Date()
      }])
      setCommentaire('')
      setTypeCommentaire('')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        💰 Note 15 - Plus ou Moins-Values sur Cessions
      </Typography>

      {/* Tableau des cessions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📋 Détail des Cessions d'Immobilisations
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Nature Bien</TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: 'white' }}>Date Cession</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>Valeur Origine</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>VNC</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>Prix Cession</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>+/- Value</TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: 'white' }}>Régime Fiscal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cessions.map((cession, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cession.nature}
                      </Typography>
                      {cession.date_acquisition && (
                        <Typography variant="caption" color="text.secondary">
                          Acquis le {new Date(cession.date_acquisition).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {cession.date_cession ? new Date(cession.date_cession).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {new Intl.NumberFormat('fr-FR').format(cession.valeur_origine)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {new Intl.NumberFormat('fr-FR').format(cession.vnc)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {new Intl.NumberFormat('fr-FR').format(cession.prix_cession)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: cession.plus_moins_value > 0 ? 'success.main' : 'error.main',
                          fontWeight: 700
                        }}
                      >
                        {cession.plus_moins_value > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(cession.plus_moins_value)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={cession.regime_fiscal}
                        color={cession.regime_fiscal.includes('Exonéré') ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Section commentaires */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            💬 Commentaires et Justifications
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type de commentaire</InputLabel>
                <Select
                  value={typeCommentaire}
                  onChange={(e) => setTypeCommentaire(e.target.value)}
                >
                  {typesCommentaires.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={ajouterCommentaire}
                disabled={!typeCommentaire || !commentaire.trim()}
              >
                Ajouter
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Commentaires sauvegardés
              </Typography>
              {commentaires.map((comm) => (
                <Paper key={comm.id} sx={{ p: 2, mb: 1 }}>
                  <Chip label={comm.type} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">{comm.contenu}</Typography>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Note15SYSCOHADA