/**
 * Plan Comptable SYSCOHADA Révisé Complet - 9 Classes
 * Affichage hiérarchique avec drawer de détail (fonctionnement, opérations liées)
 */

import { useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useTheme,
} from '@mui/material'
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material'
import {
  PLAN_SYSCOHADA_REVISE,
  SYSCOHADA_REVISE_CLASSES,
  getSYSCOHADAAccountsByClass,
} from '../../data/SYSCOHADARevisePlan'
import type { CompteComptable } from '../../data/syscohada/types'
import type { FonctionnementCompte, ChapitreOperations } from '../../data/syscohada/types'
import { getFonctionnement } from '../../data/syscohada/fonctionnement'
import { findChapitresByCompte } from '../../data/syscohada/operations'

/** Drawer de détail pour un compte */
function AccountDetailDrawer({
  compte,
  open,
  onClose,
}: {
  compte: CompteComptable | null
  open: boolean
  onClose: () => void
}) {
  const [fonctionnement, setFonctionnement] = useState<FonctionnementCompte | null>(null)
  const [chapitres, setChapitres] = useState<ChapitreOperations[]>([])
  const [loading, setLoading] = useState(false)

  const loadDetails = useCallback(async (numero: string) => {
    setLoading(true)
    try {
      const [fonc, chaps] = await Promise.all([
        getFonctionnement(numero),
        findChapitresByCompte(numero),
      ])
      setFonctionnement(fonc ?? null)
      setChapitres(chaps)
    } catch {
      setFonctionnement(null)
      setChapitres([])
    }
    setLoading(false)
  }, [])

  // Load when compte changes
  useState(() => {
    if (compte && open) {
      loadDetails(compte.numero)
    }
  })

  // Also trigger on open/compte change
  if (compte && open && !loading && !fonctionnement && chapitres.length === 0) {
    loadDetails(compte.numero)
  }

  if (!compte) return null

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 520 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: '#171717', color: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, mb: 0.5 }}>
              {compte.numero}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {compte.libelle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip
            label={`${compte.nature} (${compte.sens})`}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
          <Chip
            label={compte.utilisation}
            size="small"
            color={compte.utilisation === 'OBLIGATOIRE' ? 'success' : 'default'}
            sx={{ color: '#fff', bgcolor: compte.utilisation === 'OBLIGATOIRE' ? '#16a34a' : 'rgba(255,255,255,0.15)' }}
          />
          <Chip
            label={`Classe ${compte.classe}`}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 1, color: '#737373' }}>
              Chargement du fonctionnement...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Fonctionnement */}
            {fonctionnement ? (
              <>
                {/* Définition */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#171717' }}>
                  Contenu / Définition
                </Typography>
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="body2">{fonctionnement.contenu}</Typography>
                </Paper>

                {/* Subdivisions */}
                {fonctionnement.subdivisions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Subdivisions
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {fonctionnement.subdivisions.map(sub => (
                        <ListItem key={sub.numero} sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}>
                                  {sub.numero}
                                </Box>
                                {sub.libelle}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Fonctionnement débit/crédit */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#dc2626', mb: 1 }}>
                        DEBIT
                      </Typography>
                      {fonctionnement.fonctionnement.debit.map((d, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {d.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#737373' }}>
                            par le crédit de : {d.contrePartie.join(', ')}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#16a34a', mb: 1 }}>
                        CREDIT
                      </Typography>
                      {fonctionnement.fonctionnement.credit.map((c, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {c.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#737373' }}>
                            par le débit de : {c.contrePartie.join(', ')}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>

                {/* Exclusions */}
                {fonctionnement.exclusions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Exclusions
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                      {fonctionnement.exclusions.map((exc, i) => (
                        <Box key={i} sx={{ mb: i < fonctionnement.exclusions.length - 1 ? 1 : 0 }}>
                          <Typography variant="body2">
                            {exc.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#737373' }}>
                            <ArrowIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                            Utiliser : {exc.compteCorrige} - {exc.libelleCompteCorrige}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </>
                )}

                {/* Éléments de contrôle */}
                {fonctionnement.elementsControle.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Points de contrôle
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {fonctionnement.elementsControle.map((el, i) => (
                        <ListItem key={i} sx={{ py: 0.25 }}>
                          <ListItemText primary={<Typography variant="body2">• {el}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Commentaires */}
                {fonctionnement.commentaires.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Commentaires
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                      {fonctionnement.commentaires.map((c, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                          {c}
                        </Typography>
                      ))}
                    </Paper>
                  </>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Pas de fonctionnement détaillé disponible pour ce compte.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Chapitres d'opérations liés */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              <BookIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
              Opérations spécifiques liées ({chapitres.length})
            </Typography>
            {chapitres.length > 0 ? (
              <List dense>
                {chapitres.map(chap => (
                  <ListItem key={chap.numero} sx={{ bgcolor: '#fafafa', borderRadius: 1, mb: 0.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Chapitre {chap.numero} - {chap.titre}
                        </Typography>
                      }
                      secondary={`${chap.sections.length} section(s)`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: '#737373', fontStyle: 'italic' }}>
                Aucun chapitre d'opérations lié à ce compte.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Drawer>
  )
}

const PlanSYSCOHADARevise = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('TOUS')
  const [expandedClass, setExpandedClass] = useState<number | null>(1)
  const [selectedCompte, setSelectedCompte] = useState<CompteComptable | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filtrage des comptes
  const filteredAccounts = PLAN_SYSCOHADA_REVISE.filter(compte => {
    const matchSearch = searchTerm === '' ||
                       compte.numero.includes(searchTerm) ||
                       compte.libelle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchSector = selectedSector === 'TOUS' ||
                       !compte.secteurs ||
                       compte.secteurs.includes(selectedSector)

    return matchSearch && matchSector
  })

  const handleRowClick = (compte: CompteComptable) => {
    setSelectedCompte(compte)
    setDrawerOpen(true)
  }

  const getClassColor = (_classe: number): string => '#f5f5f5'

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#171717' }}>
              Plan Comptable SYSCOHADA Révisé
            </Typography>
            <Typography variant="body1" sx={{ color: '#737373' }}>
              Référentiel officiel OHADA 2017 - 9 Classes complètes - Cliquez sur un compte pour voir son fonctionnement
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderColor: '#e5e5e5', color: '#171717' }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<ViewIcon />}
              sx={{ backgroundColor: '#171717', '&:hover': { backgroundColor: '#262626' } }}
            >
              Vue Arbre
            </Button>
          </Stack>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#171717' }}>
                {Object.keys(SYSCOHADA_REVISE_CLASSES).length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Classes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                {PLAN_SYSCOHADA_REVISE.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Comptes Total
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {PLAN_SYSCOHADA_REVISE.filter(c => c.utilisation === 'OBLIGATOIRE').length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Obligatoires
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#525252' }}>
                17
              </Typography>
              <Typography variant="caption" sx={{ color: '#737373' }}>
                Pays OHADA
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Recherche et filtres */}
      <Card sx={{ mb: 3, border: '1px solid #e5e5e5' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher un compte (numéro ou libellé)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#737373' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelectedSector(selectedSector === 'TOUS' ? 'COMMERCE' : 'TOUS')}
                sx={{ borderColor: '#e5e5e5', color: '#171717' }}
              >
                Secteur: {selectedSector}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="caption">
                  {filteredAccounts.length} comptes trouvés
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Plan comptable par classes */}
      <Card sx={{ border: '1px solid #e5e5e5' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#171717' }}>
            Plan Comptable SYSCOHADA Révisé - 9 Classes
          </Typography>

          {Object.entries(SYSCOHADA_REVISE_CLASSES).map(([classeNum, classeInfo]) => {
            const comptes = getSYSCOHADAAccountsByClass(parseInt(classeNum)).filter(compte => {
              const matchSearch = searchTerm === '' ||
                                 compte.numero.includes(searchTerm) ||
                                 compte.libelle.toLowerCase().includes(searchTerm.toLowerCase())
              return matchSearch
            })

            return (
              <Accordion
                key={classeNum}
                expanded={expandedClass === parseInt(classeNum)}
                onChange={() => setExpandedClass(expandedClass === parseInt(classeNum) ? null : parseInt(classeNum))}
                sx={{
                  mb: 1,
                  '&:before': { display: 'none' },
                  border: '1px solid #e5e5e5',
                  borderRadius: 2
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: getClassColor(parseInt(classeNum)),
                    borderRadius: 1,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <AccountIcon sx={{ color: '#171717' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#171717' }}>
                      Classe {classeNum} - {classeInfo.libelle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#737373' }}>
                      {classeInfo.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${comptes.length} comptes`}
                    size="small"
                    sx={{ backgroundColor: '#FFFFFF', color: '#171717' }}
                  />
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e5e5e5' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>N° Compte</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Libellé</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Nature</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Utilisation</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>Secteurs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comptes.map((compte, index) => (
                          <TableRow
                            key={compte.numero}
                            onClick={() => handleRowClick(compte)}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#f5f5f5',
                              '&:hover': { backgroundColor: '#e0f2fe', cursor: 'pointer' },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: '#171717'
                              }}>
                                {compte.numero}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{
                                color: '#171717',
                                pl: compte.sousClasse ? (compte.numero.length - 2) * 1.5 : 0,
                              }}>
                                {compte.libelle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${compte.nature} (${compte.sens})`}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: '#fff',
                                  bgcolor:
                                    compte.nature === 'ACTIF' ? theme.palette.info.main :
                                    compte.nature === 'PASSIF' ? theme.palette.secondary.main :
                                    compte.nature === 'CHARGE' ? theme.palette.error.main :
                                    compte.nature === 'PRODUIT' ? theme.palette.primary.main :
                                    theme.palette.warning.main,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={compte.utilisation}
                                size="small"
                                color={compte.utilisation === 'OBLIGATOIRE' ? 'success' : compte.utilisation === 'FACULTATIF' ? 'info' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell>
                              {compte.secteurs ? (
                                <Stack direction="row" spacing={0.5}>
                                  {compte.secteurs.map(secteur => (
                                    <Chip
                                      key={secteur}
                                      label={secteur}
                                      size="small"
                                      sx={{
                                        fontSize: '0.6rem',
                                        bgcolor: '#fafafa',
                                        color: '#171717'
                                      }}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#737373' }}>
                                  Tous secteurs
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </CardContent>
      </Card>

      {/* Drawer de détail */}
      <AccountDetailDrawer
        compte={selectedCompte}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  )
}

export default PlanSYSCOHADARevise
