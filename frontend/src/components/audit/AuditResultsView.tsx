/**
 * Vue detaillee des resultats d'audit
 * Filtrage, groupement par niveau, details expandables
 */

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import type { ResultatControle, Severite, NiveauControle } from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'

interface AuditResultsViewProps {
  resultats: ResultatControle[]
}

const SEVERITE_MUI_COLOR: Record<Severite, 'error' | 'warning' | 'info' | 'success'> = {
  BLOQUANT: 'error',
  MAJEUR: 'warning',
  MINEUR: 'warning',
  INFO: 'info',
  OK: 'success',
}

const severiteIcon = (sev: Severite, size: 'small' | 'medium' = 'small') => {
  const color = SEVERITE_MUI_COLOR[sev]
  switch (sev) {
    case 'BLOQUANT': return <ErrorIcon fontSize={size} color={color} />
    case 'MAJEUR': return <WarningIcon fontSize={size} color={color} />
    case 'MINEUR': return <WarningIcon fontSize={size} color={color} />
    case 'INFO': return <InfoIcon fontSize={size} color={color} />
    case 'OK': return <CheckIcon fontSize={size} color={color} />
  }
}

const AuditResultsView: React.FC<AuditResultsViewProps> = ({ resultats }) => {
  const [searchText, setSearchText] = useState('')
  const [severiteFilter, setSeveriteFilter] = useState<Severite | ''>('')
  const [niveauFilter, setNiveauFilter] = useState<NiveauControle | -1>(-1)
  const [expandedRef, setExpandedRef] = useState<string | null>(null)

  // Filtrer les resultats
  const filtered = useMemo(() => {
    return resultats.filter((r) => {
      if (severiteFilter && r.severite !== severiteFilter) return false
      if (niveauFilter >= 0 && r.niveau !== niveauFilter) return false
      if (searchText) {
        const search = searchText.toLowerCase()
        return (
          r.ref.toLowerCase().includes(search) ||
          r.nom.toLowerCase().includes(search) ||
          r.message.toLowerCase().includes(search) ||
          r.details?.comptes?.some((c) => c.toLowerCase().includes(search))
        )
      }
      return true
    })
  }, [resultats, severiteFilter, niveauFilter, searchText])

  // Grouper par niveau
  const groupedByNiveau = useMemo(() => {
    const groups: Record<number, ResultatControle[]> = {}
    for (const r of filtered) {
      if (!groups[r.niveau]) groups[r.niveau] = []
      groups[r.niveau].push(r)
    }
    return Object.entries(groups)
      .map(([n, items]) => ({ niveau: parseInt(n) as NiveauControle, items }))
      .sort((a, b) => a.niveau - b.niveau)
  }, [filtered])

  const copyEcriture = (r: ResultatControle) => {
    if (!r.ecrituresCorrectives?.length) return
    const text = r.ecrituresCorrectives
      .map((e) =>
        e.lignes.map((l) => `${l.sens} ${l.compte} ${l.libelle} ${l.montant.toLocaleString('fr-FR')}`).join('\n')
      )
      .join('\n---\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <Box>
      {/* Barre de filtres */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <Stack direction="row" spacing={0.5}>
          {(['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK'] as Severite[]).map((sev) => {
            const count = resultats.filter((r) => r.severite === sev).length
            const isActive = severiteFilter === sev
            return (
              <Chip
                key={sev}
                label={`${sev} (${count})`}
                size="small"
                color={SEVERITE_MUI_COLOR[sev]}
                variant={isActive ? 'filled' : 'outlined'}
                onClick={() => setSeveriteFilter(isActive ? '' : sev)}
                sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
              />
            )
          })}
        </Stack>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Niveau</InputLabel>
          <Select
            value={niveauFilter}
            label="Niveau"
            onChange={(e) => setNiveauFilter(e.target.value as any)}
          >
            <MenuItem value={-1}>Tous</MenuItem>
            {([0, 1, 2, 3, 4, 5, 6, 7, 8] as NiveauControle[]).map((n) => (
              <MenuItem key={n} value={n}>
                {n} - {NIVEAUX_NOMS[n]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.secondary">
          {filtered.length} / {resultats.length} controles
        </Typography>
      </Stack>

      {/* Resultats groupes par niveau */}
      {groupedByNiveau.map(({ niveau, items }) => (
        <Accordion key={niveau} defaultExpanded={items.some((r) => r.statut === 'ANOMALIE')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Niveau {niveau} - {NIVEAUX_NOMS[niveau]}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto', mr: 2 }}>
                {(['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK'] as Severite[]).map((sev) => {
                  const c = items.filter((r) => r.severite === sev).length
                  if (c === 0) return null
                  return (
                    <Chip
                      key={sev}
                      label={c}
                      size="small"
                      color={SEVERITE_MUI_COLOR[sev]}
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                    />
                  )
                })}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {items.map((r) => (
              <Box key={r.ref}>
                <Box
                  onClick={() => setExpandedRef(expandedRef === r.ref ? null : r.ref)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {severiteIcon(r.severite)}
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, minWidth: 60, color: 'text.secondary' }}>
                      {r.ref}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {r.message}
                    </Typography>
                    <Chip
                      label={r.severite}
                      size="small"
                      color={SEVERITE_MUI_COLOR[r.severite]}
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 22, fontSize: '0.65rem' }}
                    />
                  </Box>
                  {r.statut === 'ANOMALIE' && r.suggestion && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1, ml: 4, pl: '60px' }}>
                      <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500, fontSize: '0.8rem' }}>
                        Correction : {r.suggestion}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Panel de details */}
                <Collapse in={expandedRef === r.ref}>
                  <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {r.nom}
                    </Typography>

                    {r.details?.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {r.details.description}
                      </Typography>
                    )}

                    {r.details?.comptes && r.details.comptes.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={600}>Comptes concernes:</Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {r.details.comptes.map((c, i) => (
                            <Chip key={i} label={c} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {r.details?.montants && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={600}>Montants:</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                          {Object.entries(r.details.montants).map(([k, v]) => (
                            <Typography key={k} variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {k}: {typeof v === 'number' ? v.toLocaleString('fr-FR') : v}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {r.suggestion && (
                      <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                        <Typography variant="body2">{r.suggestion}</Typography>
                      </Alert>
                    )}

                    {r.ecrituresCorrectives && r.ecrituresCorrectives.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" fontWeight={600}>Ecritures correctives suggerees:</Typography>
                          <Tooltip title="Copier l'ecriture">
                            <IconButton size="small" onClick={() => copyEcriture(r)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {r.ecrituresCorrectives.map((ecr, ei) => (
                          <TableContainer key={ei} component={Paper} elevation={0} sx={{ mb: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600, width: 40 }}>Sens</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>Debit</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>Credit</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ecr.lignes.map((l, li) => (
                                  <TableRow key={li}>
                                    <TableCell>{l.sens}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{l.compte}</TableCell>
                                    <TableCell>{l.libelle}</TableCell>
                                    <TableCell align="right">{l.sens === 'D' ? l.montant.toLocaleString('fr-FR') : '-'}</TableCell>
                                    <TableCell align="right">{l.sens === 'C' ? l.montant.toLocaleString('fr-FR') : '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {ecr.commentaire && (
                              <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                {ecr.commentaire}
                              </Typography>
                            )}
                          </TableContainer>
                        ))}
                      </Box>
                    )}

                    {r.referenceReglementaire && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Ref: {r.referenceReglementaire}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {filtered.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucun resultat ne correspond aux filtres selectionnes.
        </Alert>
      )}
    </Box>
  )
}

export default AuditResultsView
