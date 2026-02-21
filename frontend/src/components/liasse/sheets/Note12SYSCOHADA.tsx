/**
 * Note 12 SYSCOHADA - Autres Produits et Charges Exceptionnels
 * Avec système de commentaires amélioré
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
  Chip,
  Stack,
  Alert
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Comment,
  Save,
  Add
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useBalanceData } from '@/hooks/useBalanceData'

const Note12SYSCOHADA: React.FC = () => {
  // Types de commentaires prédéfinis
  const [typeCommentaire, setTypeCommentaire] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [commentairesSauvegardes, setCommentairesSauvegardes] = useState<Array<{
    id: string
    type: string
    contenu: string
    date: Date
  }>>([])

  const typesCommentaires = [
    'Explication produit exceptionnel',
    'Justification charge exceptionnelle',
    'Méthode d\'évaluation',
    'Événement post-clôture',
    'Changement de méthode',
    'Impact fiscal',
    'Autre observation'
  ]

  // Données exemple pour le tableau
  const produitsExceptionnels = [
    { libelle: 'Plus-value cession immobilisation', montant: 2500000, origine: 'Cession terrain', impacte_fiscal: true },
    { libelle: 'Subvention équipement reçue', montant: 1200000, origine: 'État Cameroun', impacte_fiscal: false }
  ]

  const chargesExceptionnelles = [
    { libelle: 'VNC cession immobilisation', montant: 1800000, origine: 'Cession terrain', impacte_fiscal: true },
    { libelle: 'Provision restructuration', montant: 800000, origine: 'Plan social', impacte_fiscal: false }
  ]

  const ajouterCommentaire = () => {
    if (typeCommentaire && commentaire.trim()) {
      const nouveauCommentaire = {
        id: Date.now().toString(),
        type: typeCommentaire,
        contenu: commentaire,
        date: new Date()
      }
      setCommentairesSauvegardes([...commentairesSauvegardes, nouveauCommentaire])
      setCommentaire('')
      setTypeCommentaire('')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📈 Note 12 - Produits et Charges Exceptionnels
      </Typography>

      <Grid container spacing={3}>
        {/* Produits exceptionnels */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                Produits Exceptionnels
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'success.light' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'white' }}>Libellé</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>Montant (FCFA)</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: 'white' }}>Impact Fiscal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {produitsExceptionnels.map((produit, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {produit.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {produit.origine}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {new Intl.NumberFormat('fr-FR').format(produit.montant)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={produit.impacte_fiscal ? 'Imposable' : 'Exonéré'}
                            color={produit.impacte_fiscal ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'success.light' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }}>TOTAL PRODUITS</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>
                        {new Intl.NumberFormat('fr-FR').format(
                          produitsExceptionnels.reduce((sum, p) => sum + p.montant, 0)
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Charges exceptionnelles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown color="error" />
                Charges Exceptionnelles
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'error.light' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'white' }}>Libellé</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>Montant (FCFA)</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: 'white' }}>Impact Fiscal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chargesExceptionnelles.map((charge, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {charge.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {charge.origine}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {new Intl.NumberFormat('fr-FR').format(charge.montant)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={charge.impacte_fiscal ? 'Déductible' : 'Non déductible'}
                            color={charge.impacte_fiscal ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'error.light' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }}>TOTAL CHARGES</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>
                        {new Intl.NumberFormat('fr-FR').format(
                          chargesExceptionnelles.reduce((sum, c) => sum + c.montant, 0)
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Section commentaires améliorée */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Comment color="primary" />
                💬 Commentaires et Explications
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Type de commentaire</InputLabel>
                    <Select
                      value={typeCommentaire}
                      onChange={(e) => setTypeCommentaire(e.target.value)}
                      label="Type de commentaire"
                    >
                      {typesCommentaires.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Commentaire détaillé"
                    placeholder="Expliquez la nature, l'origine et l'impact de cet élément exceptionnel..."
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={ajouterCommentaire}
                    disabled={!typeCommentaire || !commentaire.trim()}
                    fullWidth
                  >
                    Ajouter Commentaire
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    📝 Commentaires sauvegardés
                  </Typography>
                  
                  {commentairesSauvegardes.length === 0 ? (
                    <Alert severity="info">
                      Aucun commentaire ajouté pour cette note
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {commentairesSauvegardes.map((comm) => (
                        <Paper key={comm.id} sx={{ p: 2, border: `1px solid ${P.primary200}` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Chip label={comm.type} size="small" color="primary" />
                            <Typography variant="caption" color="text.secondary">
                              {comm.date.toLocaleDateString('fr-FR')}
                            </Typography>
                          </Stack>
                          <Typography variant="body2">
                            {comm.contenu}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<Save />}>
          Sauvegarder Note
        </Button>
        <Button variant="outlined">
          Valider et Passer à la Suite
        </Button>
      </Stack>
    </Box>
  )
}

export default Note12SYSCOHADA