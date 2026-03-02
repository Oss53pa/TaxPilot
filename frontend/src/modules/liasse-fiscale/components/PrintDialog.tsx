import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, RadioGroup, FormControlLabel, Radio, Typography, Box,
} from '@mui/material'
import { Print as PrintIcon } from '@mui/icons-material'

export type PrintMode = 'current' | 'all'

interface PrintDialogProps {
  open: boolean
  onClose: () => void
  onPrint: (mode: PrintMode) => void
  currentPageName: string
  totalPages: number
}

const PrintDialog: React.FC<PrintDialogProps> = ({
  open, onClose, onPrint, currentPageName, totalPages,
}) => {
  const [mode, setMode] = React.useState<PrintMode>('current')

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <PrintIcon fontSize="small" />
        Imprimer la liasse
      </DialogTitle>
      <DialogContent>
        <RadioGroup value={mode} onChange={(_, v) => setMode(v as PrintMode)}>
          <FormControlLabel
            value="current"
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>Page actuelle</Typography>
                <Typography variant="caption" color="text.secondary">{currentPageName}</Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="all"
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>Toute la liasse</Typography>
                <Typography variant="caption" color="text.secondary">{totalPages} pages</Typography>
              </Box>
            }
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">Annuler</Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => { onPrint(mode); onClose() }}
          size="small"
        >
          Imprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
