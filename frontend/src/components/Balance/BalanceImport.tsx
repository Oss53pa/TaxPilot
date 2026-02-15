/**
 * Composant d'import de balance
 */

import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  Delete,
  Visibility,
  GetApp,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { useAppSelector, useAppDispatch } from '@/store'
import {
  setImporting,
  setImportProgress,
  resetImportProgress,
} from '@/store/balanceSlice'
import { importBalanceFile } from '@/services/balanceParserService'
import { saveImportedBalance, saveImportRecord } from '@/services/balanceStorageService'
import { liasseDataService } from '@/services/liasseDataService'

interface ImportFile {
  file: File
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  errors: string[]
  preview?: any[]
}

const BalanceImport: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isImporting, importProgress } = useAppSelector(state => state.balance)

  const [files, setFiles] = useState<ImportFile[]>([])
  const [previewDialog, setPreviewDialog] = useState(false)
  const [selectedFilePreview, setSelectedFilePreview] = useState<ImportFile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImportFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      progress: 0,
      errors: [],
    }))

    setFiles(prev => [...prev, ...newFiles])
    setErrorMessage(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  // Import réel côté client avec xlsx
  const importFile = async (fileData: ImportFile) => {
    dispatch(setImporting(true))
    setErrorMessage(null)

    const updateProgress = (progress: number, message: string) => {
      dispatch(setImportProgress({ status: 'processing', progress, message }))
      setFiles(prev => prev.map(f =>
        f.id === fileData.id ? { ...f, status: 'processing', progress } : f
      ))
    }

    try {
      updateProgress(10, 'Lecture du fichier...')

      const result = await importBalanceFile(fileData.file)

      updateProgress(60, 'Analyse des données...')

      const entries = result.entries

      updateProgress(80, 'Sauvegarde...')

      // Save to localStorage
      saveImportedBalance(entries, fileData.file.name)

      const totalDebit = entries.reduce((s, e) => s + e.solde_debit, 0)
      const totalCredit = entries.reduce((s, e) => s + e.solde_credit, 0)
      saveImportRecord(
        fileData.file.name,
        entries.length,
        totalDebit,
        totalCredit,
        result.errors.length,
        result.warnings.length,
      )

      // Load into liasseDataService
      liasseDataService.loadBalance(entries)

      updateProgress(100, 'Import terminé avec succès !')

      // Build preview from real data
      const preview = entries.slice(0, 10).map(e => ({
        compte: e.compte,
        libelle: e.intitule,
        debit: e.solde_debit,
        credit: e.solde_credit,
      }))

      dispatch(setImportProgress({
        status: 'completed',
        progress: 100,
        message: `Import terminé : ${entries.length} comptes importés.`,
      }))

      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'completed', progress: 100, preview }
          : f
      ))

      if (result.warnings.length > 0) {
        setErrorMessage(result.warnings.join(' | '))
      }
    } catch (error: any) {
      console.error('Erreur import:', error)
      const message = error?.message || 'Erreur inconnue lors de l\'import.'
      setErrorMessage(message)

      dispatch(setImportProgress({
        status: 'error',
        progress: 0,
        message,
      }))

      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'error', progress: 0, errors: [message] }
          : f
      ))
    } finally {
      dispatch(setImporting(false))
      setTimeout(() => dispatch(resetImportProgress()), 5000)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const showPreview = (file: ImportFile) => {
    setSelectedFilePreview(file)
    setPreviewDialog(true)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <Description color={ext === 'xlsx' || ext === 'xls' ? 'success' : 'primary'} />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Zone de dépôt */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Import de Balance Comptable"
          subheader="Glissez-déposez vos fichiers Excel, CSV ou XML"
          avatar={<CloudUpload color="primary" />}
        />
        <CardContent>
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              border: 2,
              borderStyle: 'dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload 
              sx={{ 
                fontSize: 48, 
                color: isDragActive ? 'primary.main' : 'text.secondary',
                mb: 2,
              }} 
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {isDragActive
                ? 'Déposez vos fichiers ici'
                : 'Glissez-déposez vos fichiers ou cliquez pour sélectionner'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Formats supportés : Excel (.xlsx, .xls), CSV (.csv)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taille maximale : 50 MB par fichier
            </Typography>
          </Paper>

          {/* Formats supportés */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="Excel (.xlsx)" size="small" variant="outlined" />
            <Chip label="CSV (.csv)" size="small" variant="outlined" />
            <Chip label="XML (.xml)" size="small" variant="outlined" />
            <Chip label="API Direct" size="small" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <Card>
          <CardHeader title="Fichiers à Traiter" />
          <CardContent sx={{ p: 0 }}>
            <List>
              {files.map((fileData, index) => (
                <ListItem
                  key={fileData.id}
                  sx={{
                    borderBottom: index < files.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemIcon>
                    {fileData.status === 'completed' ? (
                      <CheckCircle color="success" />
                    ) : fileData.status === 'error' ? (
                      <Error color="error" />
                    ) : fileData.status === 'processing' ? (
                      <CloudUpload color="primary" />
                    ) : (
                      getFileIcon(fileData.file.name)
                    )}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {fileData.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({(fileData.file.size / 1024 / 1024).toFixed(1)} MB)
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {fileData.status === 'processing' && (
                          <LinearProgress
                            variant="determinate"
                            value={fileData.progress}
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {fileData.status === 'pending' && 'En attente de traitement'}
                          {fileData.status === 'processing' && `${Math.round(fileData.progress)}% - ${importProgress.message}`}
                          {fileData.status === 'completed' && 'Import terminé avec succès'}
                          {fileData.status === 'error' && 'Erreur lors de l\'import'}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {fileData.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => importFile(fileData)}
                        disabled={isImporting}
                      >
                        Lancer Import
                      </Button>
                    )}
                    
                    {fileData.status === 'completed' && fileData.preview && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => showPreview(fileData)}
                      >
                        Aperçu
                      </Button>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => removeFile(fileData.id)}
                      disabled={fileData.status === 'processing'}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Erreur visible */}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrorMessage(null)}>
          <AlertTitle>Erreur</AlertTitle>
          {errorMessage}
        </Alert>
      )}

      {/* Aide et instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Instructions d'import :
        </Typography>
        <Typography variant="body2" component="div">
          • Assurez-vous que votre fichier contient les colonnes : Compte, Libellé, Débit, Crédit<br/>
          • Vérifiez l'équilibre débit/crédit avant l'import<br/>
          • Les comptes doivent correspondre à votre plan comptable configuré<br/>
          • Format de montant accepté : 1 234 567,89 ou 1234567.89
        </Typography>
      </Alert>

      {/* Dialog d'aperçu */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Aperçu - {selectedFilePreview?.file.name}
        </DialogTitle>
        <DialogContent>
          {selectedFilePreview?.preview && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Compte</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell align="right">Débit</TableCell>
                    <TableCell align="right">Crédit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedFilePreview.preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.compte}</TableCell>
                      <TableCell>{row.libelle}</TableCell>
                      <TableCell align="right">
                        {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<GetApp />}>
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BalanceImport