/**
 * MigrationBanner — Shown when localStorage data is detected and Supabase is enabled
 * Prompts user to migrate their data to the cloud.
 */

import React, { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { CloudUpload, Close } from '@mui/icons-material'

interface MigrationBannerProps {
  onDismiss: () => void
  onMigrate: () => Promise<void>
}

const MigrationBanner: React.FC<MigrationBannerProps> = ({ onDismiss, onMigrate }) => {
  const [migrating, setMigrating] = useState(false)
  const [done, setDone] = useState(false)

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      await onMigrate()
      setDone(true)
      setTimeout(onDismiss, 3000)
    } catch {
      setMigrating(false)
    }
  }

  if (done) {
    return (
      <Alert severity="success" sx={{ m: 2, borderRadius: 2 }}>
        <AlertTitle>Migration terminee</AlertTitle>
        Vos donnees ont ete migrees vers le cloud avec succes.
      </Alert>
    )
  }

  return (
    <Alert
      severity="info"
      sx={{ m: 2, borderRadius: 2 }}
      action={
        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            size="small"
            onClick={onDismiss}
            startIcon={<Close />}
            disabled={migrating}
          >
            Plus tard
          </Button>
          <Button
            color="primary"
            size="small"
            variant="contained"
            onClick={handleMigrate}
            startIcon={<CloudUpload />}
            disabled={migrating}
          >
            {migrating ? 'Migration...' : 'Migrer'}
          </Button>
        </Stack>
      }
    >
      <AlertTitle>Donnees locales detectees</AlertTitle>
      <Typography variant="body2">
        Des donnees existent dans le stockage local de votre navigateur.
        Souhaitez-vous les migrer vers le cloud pour un acces multi-appareil securise ?
      </Typography>
      {migrating && <LinearProgress sx={{ mt: 1 }} />}
    </Alert>
  )
}

export default MigrationBanner
