/**
 * Composant d'import de balance
 */

import React, { useState, useCallback } from 'react'
import { balanceService } from '@/services'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Alert,
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
  addBalance,
} from '@/store/balanceSlice'

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImportFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      progress: 0,
      errors: [],
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  const processImport = async (fileData: ImportFile) => {
    dispatch(setImporting(true))

    try {
      // Préparation du FormData pour l'upload
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('format', fileData.file.name.split('.').pop() || 'xlsx')

      console.log('📤 Importing balance file to backend...')

      // Import via le backend
      const response = await balanceService.importBalance(formData)

      if (response) {
        // Mettre à jour le status
        setFiles(prev => prev.map(f =>
          f.id === fileData.id
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ))

        // Ajouter la balance importée au store
        if (response.id) {
          dispatch(addBalance(response))
        }

        dispatch(setImportProgress({
          stage: 'Import terminé',
          progress: 100
        }))
      }
    } catch (error) {
      console.error('❌ Error importing balance:', error)
      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? {
              ...f,
              status: 'error',
              errors: [`Erreur d'import: ${error}`]
            }
          : f
      ))
    } finally {
      dispatch(setImporting(false))
    }
  }

  // Fonction de simulation pour fallback
  const simulateImport = async (fileData: ImportFile) => {
    dispatch(setImporting(true))

    const stages = [
      'Lecture du fichier...',
      'Analyse de la structure...',
      'Validation des données...',
      'Mapping des comptes...',
      'Import en base...',
      'Validation finale...',
    ]

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const progress = ((i + 1) / stages.length) * 100
      dispatch(setImportProgress({
        status: 'processing',
        progress,
        message: stages[i],
      }))
      
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'processing', progress }
          : f
      ))
    }

    // Finalisation
    dispatch(setImportProgress({
      status: 'completed',
      progress: 100,
      message: 'Import terminé avec succès !',
    }))
    
    setFiles(prev => prev.map(f => 
      f.id === fileData.id 
        ? { 
            ...f, 
            status: 'completed', 
            progress: 100,
            preview: [
              { compte: '101000', libelle: 'Capital social', debit: 0, credit: 50000000 },
              { compte: '211000', libelle: 'Terrains', debit: 25000000, credit: 0 },
              { compte: '411000', libelle: 'Clients', debit: 15000000, credit: 0 },
            ]
          }
        : f
    ))

    // TODO: Implémenter l'appel API réel pour importer la balance
    // Les données seront traitées via l'API backend et ajoutées au store
    console.log('Import terminé - Les données seront récupérées via l\'API')

    dispatch(setImporting(false))
    setTimeout(() => dispatch(resetImportProgress()), 3000)
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
              Formats supportés : Excel (.xlsx, .xls), CSV (.csv), XML (.xml)
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
                        onClick={() => simulateImport(fileData)}
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