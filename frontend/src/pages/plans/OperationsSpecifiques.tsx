/**
 * Page des Opérations Spécifiques SYSCOHADA Révisé
 * Affiche les 41 chapitres avec recherche et navigation
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material'
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material'
import { CHAPITRES_SOMMAIRE, loadChapitre } from '../../data/syscohada/operations'
import type { ChapitreOperations } from '../../data/syscohada/types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

const OperationsSpecifiques = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapitre, setExpandedChapitre] = useState<number | null>(null)
  const [loadedChapitre, setLoadedChapitre] = useState<ChapitreOperations | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredChapitres = CHAPITRES_SOMMAIRE.filter(ch =>
    searchTerm === '' ||
    ch.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.numero.toString().includes(searchTerm)
  )

  useEffect(() => {
    if (expandedChapitre !== null) {
      setLoading(true)
      loadChapitre(expandedChapitre).then(data => {
        setLoadedChapitre(data ?? null)
        setLoading(false)
      })
    } else {
      setLoadedChapitre(null)
    }
  }, [expandedChapitre])

  return (
    <Box sx={{ p: 3, backgroundColor: P.primary50, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Opérations Spécifiques SYSCOHADA
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          41 chapitres couvrant toutes les opérations comptables - Référentiel OHADA 2017
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              41
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Chapitres</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {filteredChapitres.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Résultats</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
              9
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Classes couvertes</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recherche */}
      <Card sx={{ mb: 3, border: `1px solid ${P.primary200}` }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher une opération (ex: amortissement, TVA, cession, fusion...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: P.white } }}
          />
        </CardContent>
      </Card>

      {/* Liste des chapitres */}
      <Card sx={{ border: `1px solid ${P.primary200}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
            <BookIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
            Chapitres d'Opérations Spécifiques
          </Typography>

          {filteredChapitres.map(ch => (
            <Accordion
              key={ch.numero}
              expanded={expandedChapitre === ch.numero}
              onChange={() => setExpandedChapitre(expandedChapitre === ch.numero ? null : ch.numero)}
              sx={{
                mb: 1,
                '&:before': { display: 'none' },
                border: `1px solid ${P.primary200}`,
                borderRadius: 2,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 },
                }}
              >
                <Chip
                  label={`Ch. ${ch.numero}`}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: 'text.primary',
                    color: P.white,
                    minWidth: 60,
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {ch.titre}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 3 }}>
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : loadedChapitre ? (
                  <>
                    {/* Comptes liés */}
                    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, alignSelf: 'center' }}>
                        Comptes liés :
                      </Typography>
                      {loadedChapitre.comptesLies.map(cl => (
                        <Chip key={cl} label={cl} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} />
                      ))}
                    </Stack>

                    {/* Sections */}
                    {loadedChapitre.sections.map((section, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                          {section.titre}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {section.contenu}
                        </Typography>

                        {/* Écritures exemples */}
                        {section.ecritures && section.ecritures.length > 0 && (
                          <>
                            {section.ecritures.map(ecriture => (
                              <Paper key={ecriture.numero} sx={{ p: 2, mb: 1, bgcolor: 'background.paper', border: `1px solid ${P.primary200}` }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                                  Écriture {ecriture.numero} : {ecriture.description}
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Compte</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Libellé</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 0.5, textAlign: 'right' }}>Débit</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 0.5, textAlign: 'right' }}>Crédit</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {ecriture.lignes.map((ligne, li) => (
                                      <TableRow key={li}>
                                        <TableCell sx={{ py: 0.5, fontFamily: 'monospace' }}>
                                          {ligne.compte}
                                        </TableCell>
                                        <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                          {ligne.libelleCompte}
                                          {ligne.commentaire && (
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                              {ligne.commentaire}
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell sx={{ py: 0.5, textAlign: 'right', color: 'error.main', fontWeight: ligne.sens === 'D' ? 600 : 400 }}>
                                          {ligne.sens === 'D' && ligne.montant ? ligne.montant.toLocaleString('fr-FR') : ''}
                                        </TableCell>
                                        <TableCell sx={{ py: 0.5, textAlign: 'right', color: 'success.main', fontWeight: ligne.sens === 'C' ? 600 : 400 }}>
                                          {ligne.sens === 'C' && ligne.montant ? ligne.montant.toLocaleString('fr-FR') : ''}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Paper>
                            ))}
                          </>
                        )}
                      </Paper>
                    ))}
                  </>
                ) : (
                  <Alert severity="info">
                    Contenu du chapitre en cours de chargement...
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default OperationsSpecifiques
