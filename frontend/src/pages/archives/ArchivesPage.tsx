/**
 * Page Archives - Vue d'ensemble des exercices fiscaux
 * Timeline, detail, actions, rapport de comparaison
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  CalendarMonth,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CompareArrows,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Assessment,
} from '@mui/icons-material'
import { useExercice } from '../../hooks/useExercice'
import { getAllExercices, updateExercice, deleteExercice, type ExerciceRecord, type StatutExercice } from '../../services/exerciceStorageService'
import { getBalancesForExercice } from '../../services/balanceStorageService'
import { runComparison, getComparisonReport, canCompare, type ComparisonReport } from '../../services/comparisonService'
import type { ResultatControle } from '@/types/audit.types'

const statutColors: Record<StatutExercice, string> = {
  en_cours: '#3b82f6',
  cloture: '#f59e0b',
  valide: '#22c55e',
  depose: '#8b5cf6',
}

const statutLabels: Record<StatutExercice, string> = {
  en_cours: 'En cours',
  cloture: 'Cloture',
  valide: 'Valide',
  depose: 'Depose',
}

const severiteIcon: Record<string, React.ReactNode> = {
  BLOQUANT: <ErrorIcon sx={{ color: '#ef4444', fontSize: 18 }} />,
  MAJEUR: <WarningIcon sx={{ color: '#f59e0b', fontSize: 18 }} />,
  MINEUR: <InfoIcon sx={{ color: '#3b82f6', fontSize: 18 }} />,
  INFO: <InfoIcon sx={{ color: '#6b7280', fontSize: 18 }} />,
  OK: <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />,
}

const severiteColor: Record<string, string> = {
  BLOQUANT: '#ef4444',
  MAJEUR: '#f59e0b',
  MINEUR: '#3b82f6',
  INFO: '#6b7280',
  OK: '#22c55e',
}

const ArchivesPage: React.FC = () => {
  const { activeExercice, setActiveExercice } = useExercice()
  const [exercices, setExercices] = useState<ExerciceRecord[]>([])
  const [selectedExercice, setSelectedExercice] = useState<ExerciceRecord | null>(null)
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const loadData = useCallback(() => {
    const all = getAllExercices()
    setExercices(all)
    if (activeExercice) {
      const current = all.find(e => e.annee === activeExercice.annee)
      setSelectedExercice(current || null)
      const report = getComparisonReport(activeExercice.annee)
      setComparisonReport(report)
    }
  }, [activeExercice])

  useEffect(() => { loadData() }, [loadData])

  const handleRunComparison = (annee: string) => {
    const report = runComparison(annee)
    if (report) {
      setComparisonReport(report)
    }
  }

  const handleCloturer = (annee: string) => {
    updateExercice(annee, { statut: 'cloture' })
    loadData()
  }

  const handleValider = (annee: string) => {
    updateExercice(annee, { statut: 'valide' })
    loadData()
  }

  const handleDelete = (annee: string) => {
    deleteExercice(annee)
    setConfirmDelete(null)
    loadData()
  }

  const handleSelectExercice = (annee: string) => {
    setActiveExercice(annee)
    const report = getComparisonReport(annee)
    setComparisonReport(report)
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Archives des exercices
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Historique des exercices fiscaux, comparaison N/N-1, et gestion des archives.
      </Typography>

      {/* Section 1: Grille des exercices */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {exercices.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              Aucun exercice enregistre. Importez une balance pour creer automatiquement un exercice.
            </Alert>
          </Grid>
        ) : (
          exercices.map(ex => {
            const isActive = activeExercice?.annee === ex.annee
            const balances = getBalancesForExercice(ex.annee)

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ex.annee}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: isActive ? '2px solid #171717' : '1px solid #e5e5e5',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleSelectExercice(ex.annee)}
                >
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth sx={{ fontSize: 20, color: '#525252' }} />
                        <Typography variant="h6" fontWeight={700}>{ex.annee}</Typography>
                      </Box>
                      <Chip
                        label={statutLabels[ex.statut]}
                        size="small"
                        sx={{
                          bgcolor: statutColors[ex.statut] + '22',
                          color: statutColors[ex.statut],
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {balances.length > 0 && (
                        <Chip label={`${balances[0].accountCount} comptes`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      )}
                      {ex.hasAudit && (
                        <Chip label="Audite" size="small" sx={{ bgcolor: '#22c55e22', color: '#22c55e', fontSize: '0.65rem' }} />
                      )}
                      {isActive && (
                        <Chip label="Actif" size="small" sx={{ bgcolor: '#17171722', color: '#171717', fontSize: '0.65rem', fontWeight: 600 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {ex.dateDebut} — {ex.dateFin}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Section 2: Detail exercice selectionne */}
      {selectedExercice && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Detail: Exercice {selectedExercice.annee}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Statut</Typography>
                <Box>
                  <Chip
                    label={statutLabels[selectedExercice.statut]}
                    sx={{ bgcolor: statutColors[selectedExercice.statut] + '22', color: statutColors[selectedExercice.statut], fontWeight: 600 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Periode</Typography>
                <Typography variant="body2">{selectedExercice.dateDebut} — {selectedExercice.dateFin}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedExercice.duree_mois} mois</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Balance</Typography>
                <Typography variant="body2">
                  {(() => {
                    const bals = getBalancesForExercice(selectedExercice.annee)
                    return bals.length > 0
                      ? `${bals[0].accountCount} comptes (v${bals[0].version})`
                      : 'Non importee'
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Date de creation</Typography>
                <Typography variant="body2">{new Date(selectedExercice.dateCreation).toLocaleDateString('fr-FR')}</Typography>
              </Grid>
            </Grid>

            {/* Actions */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedExercice.statut === 'en_cours' && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArchiveIcon />}
                  onClick={() => handleCloturer(selectedExercice.annee)}
                >
                  Cloturer
                </Button>
              )}
              {selectedExercice.statut === 'cloture' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleValider(selectedExercice.annee)}
                >
                  Valider
                </Button>
              )}
              {canCompare(selectedExercice.annee) && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CompareArrows />}
                  onClick={() => handleRunComparison(selectedExercice.annee)}
                >
                  Lancer comparaison N/N-1
                </Button>
              )}
              <Tooltip title="Supprimer l'exercice">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(selectedExercice.annee) }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Rapport de comparaison */}
      {comparisonReport && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Assessment sx={{ color: '#525252' }} />
              <Typography variant="h6" fontWeight={600}>
                Rapport de comparaison {comparisonReport.exerciceN} vs {comparisonReport.exerciceN1}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {new Date(comparisonReport.dateGeneration).toLocaleString('fr-FR')}
              </Typography>
            </Box>

            {/* Synthese */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={`${comparisonReport.synthese.ok} OK`} sx={{ bgcolor: '#22c55e22', color: '#22c55e', fontWeight: 600 }} />
              {comparisonReport.synthese.bloquants > 0 && (
                <Chip label={`${comparisonReport.synthese.bloquants} bloquant(s)`} sx={{ bgcolor: '#ef444422', color: '#ef4444', fontWeight: 600 }} />
              )}
              {comparisonReport.synthese.majeurs > 0 && (
                <Chip label={`${comparisonReport.synthese.majeurs} majeur(s)`} sx={{ bgcolor: '#f59e0b22', color: '#f59e0b', fontWeight: 600 }} />
              )}
              {comparisonReport.synthese.mineurs > 0 && (
                <Chip label={`${comparisonReport.synthese.mineurs} mineur(s)`} sx={{ bgcolor: '#3b82f622', color: '#3b82f6', fontWeight: 600 }} />
              )}
              {comparisonReport.synthese.info > 0 && (
                <Chip label={`${comparisonReport.synthese.info} info`} sx={{ bgcolor: '#6b728022', color: '#6b7280', fontWeight: 600 }} />
              )}
            </Box>

            {/* Tableau des 8 controles */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 40 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ref</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Controle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonReport.resultats.map((r: ResultatControle) => (
                    <TableRow key={r.ref} hover>
                      <TableCell>{severiteIcon[r.severite]}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{r.ref}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{r.nom}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.statut === 'OK' ? 'OK' : r.severite}
                          size="small"
                          sx={{
                            bgcolor: severiteColor[r.severite] + '22',
                            color: severiteColor[r.severite],
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{r.message}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog confirmation suppression */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Supprimer l'exercice {confirmDelete} ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Cette action supprime uniquement l'enregistrement de l'exercice. Les balances et audits restent dans le stockage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ArchivesPage
