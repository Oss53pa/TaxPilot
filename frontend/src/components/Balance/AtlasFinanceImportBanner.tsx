/**
 * AtlasFinanceImportBanner — Shown on the balance import page when Atlas Finance
 * data is available for the current user. Lets them import a true closing balance
 * (balance de cloture) from a specific societe + fiscal year, without uploading.
 *
 * Reads only validated/posted journal entries within the fiscal year date range,
 * excludes reversed entries, and warns if the fiscal year is not yet closed.
 */
import React, { useState, useEffect } from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import {
  CloudSync as CloudSyncIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material'
import {
  useAtlasFinanceAvailable,
  useImportFromAtlasFinance,
} from '@/hooks/useAtlasFinanceBalance'
import { useDossierStore } from '@/store/dossierStore'
import { useSnackbar } from 'notistack'

const AtlasFinanceImportBanner: React.FC = () => {
  const { data, isLoading } = useAtlasFinanceAvailable()
  const importMutation = useImportFromAtlasFinance()
  const { activeDossierId } = useDossierStore()
  const { enqueueSnackbar } = useSnackbar()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [societeId, setSocieteId] = useState('')
  const [fiscalYearId, setFiscalYearId] = useState('')
  const [annee, setAnnee] = useState<'N' | 'N-1'>('N')

  // Set defaults when data loads
  useEffect(() => {
    if (data?.available && data.defaultSocieteId && !societeId) {
      setSocieteId(data.defaultSocieteId)
      setFiscalYearId(data.defaultFiscalYearId || '')
    }
  }, [data, societeId])

  if (isLoading || !data?.available || !data.societes) return null

  const selectedSociete = data.societes.find((s) => s.id === societeId)
  const selectedFY = selectedSociete?.fiscalYears.find((fy) => fy.id === fiscalYearId)

  const handleSocieteChange = (newId: string) => {
    setSocieteId(newId)
    const newSoc = data.societes?.find((s) => s.id === newId)
    if (newSoc && newSoc.fiscalYears.length > 0) {
      // Default to most recent closed year, or active year
      const closed = newSoc.fiscalYears.find((fy) => fy.isClosed)
      const active = newSoc.fiscalYears.find((fy) => fy.isActive)
      setFiscalYearId((closed || active || newSoc.fiscalYears[0])!.id)
    }
  }

  const handleConfirmImport = async () => {
    if (!activeDossierId) {
      enqueueSnackbar('Selectionnez un dossier actif', { variant: 'warning' })
      return
    }
    if (!societeId || !fiscalYearId) {
      enqueueSnackbar('Selectionnez une societe et un exercice', { variant: 'warning' })
      return
    }

    try {
      const result = await importMutation.mutateAsync({
        dossierId: activeDossierId,
        societeId,
        fiscalYearId,
        annee,
      })

      const equilibreLabel = result.isBalanced
        ? 'equilibree'
        : `desequilibree (ecart: ${(result.totalDebit - result.totalCredit).toLocaleString('fr-FR')} FCFA)`

      const closureLabel = result.fiscalYearClosed
        ? '(exercice cloture)'
        : '(exercice ouvert - balance provisoire)'

      enqueueSnackbar(
        `Balance ${result.fiscalYearCode} importee: ${result.entriesCount} comptes, ${equilibreLabel} ${closureLabel}`,
        { variant: result.isBalanced ? 'success' : 'warning', autoHideDuration: 6000 }
      )
      setDialogOpen(false)
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "Erreur d'import",
        { variant: 'error', autoHideDuration: 6000 }
      )
    }
  }

  return (
    <>
      <Alert
        severity="info"
        icon={<CloudSyncIcon />}
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => setDialogOpen(true)}
          >
            Importer depuis Atlas Finance
          </Button>
        }
      >
        <AlertTitle>Donnees Atlas Finance disponibles</AlertTitle>
        <Box>
          Votre comptabilite est synchronisee dans Atlas Studio.
          Importez automatiquement votre balance de cloture sans uploader de fichier.
        </Box>
      </Alert>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Importer depuis Atlas Finance</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Selectionnez la societe, l'exercice fiscal et l'annee de destination.
              Seules les ecritures <strong>validees</strong> et <strong>non contre-passees</strong> seront importees.
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Societe</InputLabel>
              <Select
                value={societeId}
                label="Societe"
                onChange={(e) => handleSocieteChange(e.target.value)}
              >
                {data.societes.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nom} ({s.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!selectedSociete}>
              <InputLabel>Exercice fiscal</InputLabel>
              <Select
                value={fiscalYearId}
                label="Exercice fiscal"
                onChange={(e) => setFiscalYearId(e.target.value)}
              >
                {selectedSociete?.fiscalYears.map((fy) => (
                  <MenuItem key={fy.id} value={fy.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <span>{fy.name || fy.code}</span>
                      <span style={{ color: '#999', fontSize: '0.85em' }}>
                        ({fy.startDate} - {fy.endDate})
                      </span>
                      <Box sx={{ flex: 1 }} />
                      {fy.isClosed ? (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 12 }} />}
                          label="Cloture"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<LockOpenIcon sx={{ fontSize: 12 }} />}
                          label="Ouvert"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Importer comme</InputLabel>
              <Select
                value={annee}
                label="Importer comme"
                onChange={(e) => setAnnee(e.target.value as 'N' | 'N-1')}
              >
                <MenuItem value="N">Exercice courant (N)</MenuItem>
                <MenuItem value="N-1">Exercice precedent (N-1) - pour comparatifs</MenuItem>
              </Select>
            </FormControl>

            {selectedFY && !selectedFY.isClosed && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <strong>Exercice non cloture.</strong> La balance importee est provisoire.
                Pour une balance de cloture definitive, cloturez d'abord l'exercice
                dans Atlas Finance.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleConfirmImport}
            disabled={importMutation.isPending || !societeId || !fiscalYearId}
            startIcon={importMutation.isPending ? <CircularProgress size={14} /> : null}
          >
            {importMutation.isPending ? 'Import en cours...' : 'Importer la balance'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AtlasFinanceImportBanner
