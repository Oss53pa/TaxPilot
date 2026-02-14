import React from 'react'
import {
  Button,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material'
import {
  Edit as EditIcon,
  EditOff as EditOffIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'

interface EditableToolbarProps {
  isEditMode: boolean
  onToggleEdit: () => void
  hasChanges: boolean
  onSave: () => void
  onPrint?: () => void
  onExport?: () => void
}

const EditableToolbar: React.FC<EditableToolbarProps> = ({
  isEditMode,
  onToggleEdit,
  hasChanges,
  onSave,
  onPrint,
  onExport,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip title={isEditMode ? 'Passer en mode lecture' : 'Modifier les valeurs'}>
        <Button
          variant={isEditMode ? 'contained' : 'outlined'}
          size="small"
          startIcon={isEditMode ? <EditOffIcon /> : <EditIcon />}
          onClick={onToggleEdit}
          color={isEditMode ? 'warning' : 'primary'}
        >
          {isEditMode ? 'Lecture' : 'Modifier'}
        </Button>
      </Tooltip>

      {hasChanges && (
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={onSave}
          color="success"
        >
          Enregistrer
        </Button>
      )}

      <Tooltip title="Imprimer">
        <IconButton size="small" onClick={handlePrint}>
          <PrintIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Exporter">
        <IconButton size="small" onClick={onExport}>
          <ExportIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

export default EditableToolbar
