/**
 * Dialogue de recherche globale SYSCOHADA
 * Recherche unifiée dans le plan comptable, fonctionnement et opérations
 */

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material'
import {
  Search as SearchIcon,
  Close as CloseIcon,
  AccountBalance as AccountIcon,
  Settings as FuncIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material'
import { syscohadaReferenceService, type SearchResult } from '../../services/syscohadaReferenceService'

interface SYSCOHADASearchDialogProps {
  open: boolean
  onClose: () => void
  onSelectAccount?: (numero: string) => void
}

export default function SYSCOHADASearchDialog({ open, onClose, onSelectAccount }: SYSCOHADASearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await syscohadaReferenceService.search(q, { limit: 30 })
      setResults(res)
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'compte': return <AccountIcon sx={{ color: '#171717' }} />
      case 'fonctionnement': return <FuncIcon sx={{ color: '#f59e0b' }} />
      case 'operation': return <BookIcon sx={{ color: '#22c55e' }} />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'compte': return 'Compte'
      case 'fonctionnement': return 'Fonctionnement'
      case 'operation': return 'Opération'
    }
  }

  const getTypeColor = (type: SearchResult['type']): 'default' | 'warning' | 'success' => {
    switch (type) {
      case 'compte': return 'default'
      case 'fonctionnement': return 'warning'
      case 'operation': return 'success'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recherche SYSCOHADA
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          placeholder="Rechercher un compte, une règle de fonctionnement ou une opération..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#737373' }} />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { backgroundColor: '#fafafa' } }}
        />

        {/* Résultats */}
        {results.length > 0 ? (
          <List dense>
            {results.map((r, i) => (
              <ListItem
                key={i}
                onClick={() => {
                  if (r.compte && onSelectAccount) {
                    onSelectAccount(r.compte.numero)
                    onClose()
                  }
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: '#fafafa',
                  '&:hover': { bgcolor: '#e0f2fe', cursor: 'pointer' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getIcon(r.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={getTypeLabel(r.type)}
                        size="small"
                        color={getTypeColor(r.type)}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {r.highlight}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    r.compte ? `${r.compte.nature} | ${r.compte.sens} | ${r.compte.utilisation}` :
                    r.chapitre ? `${r.chapitre.sections.length} section(s)` : undefined
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : query.length >= 2 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#737373' }}>
              Aucun résultat pour "{query}"
            </Typography>
          </Box>
        ) : query.length < 2 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#737373' }}>
              Tapez au moins 2 caractères pour rechercher dans le référentiel SYSCOHADA
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Chip label="Comptes" size="small" icon={<AccountIcon />} />
              <Chip label="Fonctionnement" size="small" icon={<FuncIcon />} />
              <Chip label="Opérations" size="small" icon={<BookIcon />} />
            </Stack>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
