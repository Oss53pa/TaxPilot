/**
 * Composant de réinitialisation des données
 */

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  TextField,
  Divider,
  Chip,
} from '@mui/material'
import {
  RestartAlt as ResetIcon,
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  AccountBalance as BalanceIcon,
  Business as EntrepriseIcon,
  Description as LiasseIcon,
  Palette as ThemeIcon,
  Shield as SecurityIcon,
} from '@mui/icons-material'

// ── Data categories that can be reset ──

interface ResetCategory {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  prefixes: string[]
  color: 'warning' | 'error' | 'info'
}

const RESET_CATEGORIES: ResetCategory[] = [
  {
    id: 'balances',
    label: 'Balances comptables',
    description: 'Balances N et N-1, historique des imports',
    icon: <BalanceIcon />,
    prefixes: ['fiscasync_balance_'],
    color: 'warning',
  },
  {
    id: 'entreprise',
    label: 'Données entreprise',
    description: 'Informations société, paramètres entreprise',
    icon: <EntrepriseIcon />,
    prefixes: ['fiscasync_entreprise_', 'fiscasync_db_entreprise'],
    color: 'warning',
  },
  {
    id: 'liasse',
    label: 'Données liasse fiscale',
    description: 'Commentaires des notes, saisies manuelles TFT',
    icon: <LiasseIcon />,
    prefixes: ['fiscasync_liasse_', 'tft_manual_entries'],
    color: 'warning',
  },
  {
    id: 'collections',
    label: 'Collections (base locale)',
    description: 'Toutes les collections fiscasync_db_*',
    icon: <StorageIcon />,
    prefixes: ['fiscasync_db_'],
    color: 'error',
  },
  {
    id: 'theme',
    label: 'Thème et personnalisation',
    description: 'Thème actif, branding, page de garde',
    icon: <ThemeIcon />,
    prefixes: ['fiscasync_active_theme', 'fiscasync_db_themes', 'fiscasync_branding'],
    color: 'info',
  },
  {
    id: 'audit',
    label: 'Audit, collaboration et sécurité',
    description: 'Logs d\'audit, données collaboration, veille',
    icon: <SecurityIcon />,
    prefixes: ['fiscasync_audit_', 'fiscasync_collab_', 'fiscasync_security_', 'fiscasync_veille_'],
    color: 'info',
  },
]

function countKeys(prefixes: string[]): number {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && prefixes.some(p => key.startsWith(p) || key === p)) {
      count++
    }
  }
  return count
}

function estimateSize(prefixes: string[]): string {
  let bytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && prefixes.some(p => key.startsWith(p) || key === p)) {
      const val = localStorage.getItem(key)
      if (val) bytes += key.length + val.length
    }
  }
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function clearByPrefixes(prefixes: string[]): number {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && prefixes.some(p => key.startsWith(p) || key === p)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
  return keysToRemove.length
}

const ResetSettings: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [fullResetDialog, setFullResetDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Compute storage info
  const storageInfo = useMemo(() => {
    let totalBytes = 0
    let totalKeys = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const val = localStorage.getItem(key)
        totalKeys++
        if (val) totalBytes += key.length + val.length
      }
    }
    return {
      totalKeys,
      totalSize: totalBytes < 1024 * 1024
        ? `${(totalBytes / 1024).toFixed(1)} Ko`
        : `${(totalBytes / (1024 * 1024)).toFixed(1)} Mo`,
    }
  }, [result]) // recalculate after reset

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectiveReset = () => {
    if (selectedCategories.size === 0) return
    setConfirmDialogOpen(true)
    setConfirmText('')
  }

  const executeSelectiveReset = () => {
    let totalRemoved = 0
    for (const cat of RESET_CATEGORIES) {
      if (selectedCategories.has(cat.id)) {
        totalRemoved += clearByPrefixes(cat.prefixes)
      }
    }
    setSelectedCategories(new Set())
    setConfirmDialogOpen(false)
    setResult({ type: 'success', message: `${totalRemoved} clé(s) supprimée(s). Les données sélectionnées ont été réinitialisées.` })
  }

  const executeFullReset = () => {
    // Clear everything except auth token (user stays logged in)
    const keysToKeep = ['fiscasync_access_token', 'fiscasync_refresh_token', 'fiscasync_user', 'fiscasync-auth']
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('fiscasync') && !keysToKeep.includes(key)) {
        keysToRemove.push(key)
      }
    }
    // Also remove non-prefixed app keys
    const extraKeys = ['tft_manual_entries']
    extraKeys.forEach(k => { if (localStorage.getItem(k) !== null) keysToRemove.push(k) })

    keysToRemove.forEach(k => localStorage.removeItem(k))
    // Remove seed purge flag so data gets re-seeded on next load
    localStorage.removeItem('fiscasync_seed_purged_v3')

    setFullResetDialog(false)
    setConfirmText('')
    setResult({ type: 'success', message: `Réinitialisation complète : ${keysToRemove.length} clé(s) supprimée(s). Rechargez la page pour réinitialiser les données de démonstration.` })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Réinitialisation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Réinitialisez tout ou partie des données de l'application
      </Typography>

      {/* Storage overview */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StorageIcon color="primary" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Stockage local
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {storageInfo.totalKeys} clés — {storageInfo.totalSize}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Alert severity={result.type} sx={{ mb: 3 }} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      {/* Selective reset */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Réinitialisation sélective
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez les catégories de données à supprimer
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {RESET_CATEGORIES.map(cat => {
          const keyCount = countKeys(cat.prefixes)
          const size = estimateSize(cat.prefixes)
          return (
            <Card
              key={cat.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: selectedCategories.has(cat.id) ? `${cat.color}.main` : 'divider',
                bgcolor: selectedCategories.has(cat.id) ? `${cat.color}.50` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { borderColor: `${cat.color}.main`, bgcolor: `${cat.color}.50` },
              }}
              onClick={() => toggleCategory(cat.id)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={selectedCategories.has(cat.id)}
                  color={cat.color}
                  sx={{ p: 0 }}
                />
                <Box sx={{ color: `${cat.color}.main`, display: 'flex' }}>{cat.icon}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {cat.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${keyCount} clé(s)`} size="small" variant="outlined" />
                  <Chip label={size} size="small" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>

      <Button
        variant="contained"
        color="warning"
        startIcon={<ResetIcon />}
        disabled={selectedCategories.size === 0}
        onClick={handleSelectiveReset}
        sx={{ mb: 4 }}
      >
        Réinitialiser la sélection ({selectedCategories.size})
      </Button>

      <Divider sx={{ mb: 4 }} />

      {/* Full reset */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
        Réinitialisation complète
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Supprime toutes les données de l'application (balances, entreprise, liasse, collections, thème, audit).
        La session utilisateur est conservée. Les données de démonstration seront rechargées au prochain démarrage.
      </Typography>

      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => { setFullResetDialog(true); setConfirmText('') }}
      >
        Réinitialisation complète
      </Button>

      {/* Selective reset confirmation */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirmer la réinitialisation
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Les données suivantes seront définitivement supprimées :
          </Alert>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {RESET_CATEGORIES.filter(c => selectedCategories.has(c.id)).map(c => (
              <Typography key={c.id} variant="body2">
                — {c.label} ({countKeys(c.prefixes)} clé(s))
              </Typography>
            ))}
          </Stack>
          <TextField
            fullWidth
            label="Tapez REINITIALISER pour confirmer"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={confirmText !== 'REINITIALISER'}
            onClick={executeSelectiveReset}
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full reset confirmation */}
      <Dialog open={fullResetDialog} onClose={() => setFullResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <DeleteIcon color="error" />
          Réinitialisation complète
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Cette action supprimera TOUTES les données de l'application. Seule votre session sera conservée.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Données supprimées : balances, entreprise, liasse, collections, thème, audit, collaboration, sécurité, veille.
          </Typography>
          <TextField
            fullWidth
            label="Tapez SUPPRIMER TOUT pour confirmer"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullResetDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmText !== 'SUPPRIMER TOUT'}
            onClick={executeFullReset}
          >
            Tout supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ResetSettings
