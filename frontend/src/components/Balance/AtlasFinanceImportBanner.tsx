/**
 * AtlasFinanceImportBanner — Shown on the balance import page when Atlas Finance
 * data is available for the current user. Lets them import without uploading a file.
 */
import React from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  CircularProgress,
} from '@mui/material'
import { CloudSync as CloudSyncIcon } from '@mui/icons-material'
import {
  useAtlasFinanceAvailable,
  useImportFromAtlasFinance,
} from '@/hooks/useAtlasFinanceBalance'
import { useDossierStore } from '@/store/dossierStore'
import { useSnackbar } from 'notistack'

const AtlasFinanceImportBanner: React.FC = () => {
  const { data, isLoading } = useAtlasFinanceAvailable()
  const importMutation = useImportFromAtlasFinance()
  const { activeDossierId, getActiveDossier } = useDossierStore()
  const { enqueueSnackbar } = useSnackbar()

  if (isLoading || !data?.available) return null

  const handleImport = async () => {
    if (!activeDossierId) {
      enqueueSnackbar('Selectionnez un dossier actif', { variant: 'warning' })
      return
    }
    const dossier = getActiveDossier()
    if (!dossier) return

    try {
      const result = await importMutation.mutateAsync({
        dossierId: activeDossierId,
        fiscalYear: dossier.exerciceN || new Date().getFullYear(),
        annee: 'N',
        entityId: data.entityId,
      })
      enqueueSnackbar(
        `Balance Atlas Finance importee: ${result.entriesCount} comptes`,
        { variant: 'success' }
      )
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "Erreur d'import",
        { variant: 'error' }
      )
    }
  }

  return (
    <Alert
      severity="info"
      icon={<CloudSyncIcon />}
      sx={{ mb: 3 }}
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          onClick={handleImport}
          disabled={importMutation.isPending}
          startIcon={
            importMutation.isPending ? <CircularProgress size={14} /> : null
          }
        >
          {importMutation.isPending ? 'Import...' : 'Importer maintenant'}
        </Button>
      }
    >
      <AlertTitle>Donnees Atlas Finance disponibles</AlertTitle>
      <Box>
        Votre comptabilite <strong>{data.entityName}</strong> est synchronisee
        dans Atlas Studio. Importez automatiquement votre balance (
        {data.entriesCount} comptes) sans uploader de fichier.
      </Box>
    </Alert>
  )
}

export default AtlasFinanceImportBanner
