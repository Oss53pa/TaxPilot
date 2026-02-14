/**
 * Table Actions - Composant de boutons d'actions pour les tableaux
 */

import React from 'react'
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileUpload as ImportIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material'

interface TableActionsProps {
  tableName: string
  onSave?: () => void
  onPrint?: () => void
  onExport?: () => void
  onImport?: () => void
  onRefresh?: () => void
  onAdd?: () => void
  onCalculate?: () => void
  showAdd?: boolean
  showCalculate?: boolean
  isLoading?: boolean
}

const TableActions: React.FC<TableActionsProps> = ({
  tableName,
  onSave,
  onPrint,
  onExport,
  onImport,
  onRefresh,
  onAdd,
  onCalculate,
  showAdd = true,
  showCalculate = false,
  isLoading = false
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
      console.log(`Tableau "${tableName}" sauvegardé`)
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
    console.log(`Impression du tableau "${tableName}"`)
  }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Export par défaut
      const exportData = {
        tableName,
        dateExport: new Date().toISOString(),
        data: `Données du tableau ${tableName}`
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `${tableName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
    console.log(`Export du tableau "${tableName}"`)
  }

  const handleImport = () => {
    if (onImport) {
      onImport()
    } else {
      // Simulation d'import
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.csv,.xlsx'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          console.log(`Fichier sélectionné : ${file.name}`)
          alert(`Import de ${file.name} en cours...`)
        }
      }
      input.click()
    }
    console.log(`Import dans le tableau "${tableName}"`)
    handleClose()
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      window.location.reload()
    }
    console.log(`Actualisation du tableau "${tableName}"`)
    handleClose()
  }

  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      alert(`Ajout d'une nouvelle ligne dans le tableau "${tableName}"`)
    }
    console.log(`Ajout dans le tableau "${tableName}"`)
  }

  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate()
    } else {
      alert(`Recalcul des totaux pour le tableau "${tableName}"`)
    }
    console.log(`Calculs du tableau "${tableName}"`)
    handleClose()
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isLoading}
        >
          Sauvegarder
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ExportIcon />}
          onClick={handleExport}
          disabled={isLoading}
        >
          Exporter
        </Button>

        {showAdd && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={isLoading}
            color="success"
          >
            Ajouter
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Imprimer">
          <IconButton size="small" onClick={handlePrint} disabled={isLoading}>
            <PrintIcon />
          </IconButton>
        </Tooltip>

        {showCalculate && (
          <Tooltip title="Recalculer">
            <IconButton size="small" onClick={handleCalculate} disabled={isLoading} color="primary">
              <CalculateIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Plus d'actions">
          <IconButton size="small" onClick={handleClick} disabled={isLoading}>
            <MoreIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleImport}>
            <ListItemIcon>
              <ImportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Importer des données</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleRefresh}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Actualiser</ListItemText>
          </MenuItem>

          <Divider />
          
          <MenuItem onClick={handleClose} disabled>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier structure</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleClose} disabled>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Vider le tableau</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}

export default TableActions