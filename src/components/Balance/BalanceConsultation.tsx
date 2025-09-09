/**
 * Composant de consultation de la balance
 */

import React, { useState, useMemo, useCallback, memo } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
} from '@mui/material'
import {
  Search,
  FilterList,
  GetApp,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Close,
  Save,
  Cancel,
} from '@mui/icons-material'
import { useAppSelector } from '@/store'
import { Balance } from '@/types'

// Données factices pour la démonstration
const mockBalanceData: Balance[] = [
  {
    id: '1',
    exercice: '2024',
    compte: '101000',
    debit: 0,
    credit: 50000000,
    solde: -50000000,
    libelle_compte: 'Capital social',
    created_at: '2024-08-31T08:00:00Z',
    updated_at: '2024-08-31T08:00:00Z',
    is_active: true,
  },
  {
    id: '2',
    exercice: '2024',
    compte: '164000',
    debit: 15000000,
    credit: 0,
    solde: 15000000,
    libelle_compte: 'Emprunts auprès des établissements de crédit',
    created_at: '2024-08-31T08:00:00Z',
    updated_at: '2024-08-31T08:00:00Z',
    is_active: true,
  },
  {
    id: '3',
    exercice: '2024',
    compte: '211000',
    debit: 25000000,
    credit: 0,
    solde: 25000000,
    libelle_compte: 'Terrains',
    created_at: '2024-08-31T08:00:00Z',
    updated_at: '2024-08-31T08:00:00Z',
    is_active: true,
  },
  {
    id: '4',
    exercice: '2024',
    compte: '411000',
    debit: 8500000,
    credit: 0,
    solde: 8500000,
    libelle_compte: 'Clients',
    created_at: '2024-08-31T08:00:00Z',
    updated_at: '2024-08-31T08:00:00Z',
    is_active: true,
  },
  {
    id: '5',
    exercice: '2024',
    compte: '521000',
    debit: 1500000,
    credit: 0,
    solde: 1500000,
    libelle_compte: 'Banques, établissements financiers et assimilés',
    created_at: '2024-08-31T08:00:00Z',
    updated_at: '2024-08-31T08:00:00Z',
    is_active: true,
  },
]

const BalanceConsultation: React.FC = () => {
  const { balances: storeBalances } = useAppSelector(state => state.balance)
  
  // Utiliser les données du store si disponibles, sinon les données factices
  const balanceData = storeBalances.length > 0 ? storeBalances : mockBalanceData
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterType, setFilterType] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null)
  const [editedBalance, setEditedBalance] = useState<Balance | null>(null)

  // Filtrage et recherche
  const filteredBalances = useMemo(() => {
    return balanceData.filter(balance => {
      const matchSearch = searchTerm === '' || 
        balance.compte.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.libelle_compte.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchClasse = filterClasse === '' || 
        balance.compte.startsWith(filterClasse)
      
      const matchType = filterType === '' ||
        (filterType === 'debiteur' && balance.solde > 0) ||
        (filterType === 'crediteur' && balance.solde < 0) ||
        (filterType === 'equilibre' && balance.solde === 0)
      
      return matchSearch && matchClasse && matchType
    })
  }, [balanceData, searchTerm, filterClasse, filterType])

  // Pagination
  const paginatedBalances = filteredBalances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Calculs de totaux
  const totals = useMemo(() => {
    return filteredBalances.reduce(
      (acc, balance) => ({
        debit: acc.debit + balance.debit,
        credit: acc.credit + balance.credit,
        soldeDebiteur: acc.soldeDebiteur + (balance.solde > 0 ? balance.solde : 0),
        soldeCrediteur: acc.soldeCrediteur + (balance.solde < 0 ? Math.abs(balance.solde) : 0),
      }),
      { debit: 0, credit: 0, soldeDebiteur: 0, soldeCrediteur: 0 }
    )
  }, [filteredBalances])

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(montant))
  }

  const getSoldeColor = useCallback((solde: number) => {
    if (solde > 0) return 'success.main'
    if (solde < 0) return 'error.main'
    return 'text.secondary'
  }, [])

  // Handlers pour les modales
  const handleViewDetails = useCallback((balance: Balance) => {
    setSelectedBalance(balance)
    setDetailModalOpen(true)
  }, [])

  const handleEdit = useCallback((balance: Balance) => {
    setSelectedBalance(balance)
    setEditedBalance({ ...balance })
    setEditModalOpen(true)
  }, [])

  const handleSaveEdit = useCallback(() => {
    // Ici vous pouvez ajouter la logique pour sauvegarder les modifications
    console.log('Sauvegarde des modifications:', editedBalance)
    // TODO: Appeler l'API pour sauvegarder les modifications
    setEditModalOpen(false)
    setEditedBalance(null)
  }, [editedBalance])

  const handleCancelEdit = useCallback(() => {
    setEditModalOpen(false)
    setEditedBalance(null)
  }, [])

  const handleExport = useCallback(() => {
    // Logique pour exporter la balance
    console.log('Export de la balance...')
    // TODO: Implémenter l'export réel
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      {/* Statistiques de la balance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {filteredBalances.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Comptes
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="info.main">
              {formatMontant(totals.debit)} FCFA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Débit
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {formatMontant(totals.credit)} FCFA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Crédit
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              color={Math.abs(totals.debit - totals.credit) < 0.01 ? 'success.main' : 'error.main'}
            >
              {formatMontant(Math.abs(totals.debit - totals.credit))} FCFA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Écart
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alertes */}
      {Math.abs(totals.debit - totals.credit) > 0.01 ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Balance déséquilibrée ! Écart de {formatMontant(Math.abs(totals.debit - totals.credit))} FCFA
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          Balance équilibrée ✓
        </Alert>
      )}

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Recherche et Filtres"
          avatar={<FilterList color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                placeholder="Numéro de compte ou libellé..."
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Classe de Compte</InputLabel>
                <Select
                  value={filterClasse}
                  onChange={(e) => setFilterClasse(e.target.value)}
                  label="Classe de Compte"
                >
                  <MenuItem value="">Toutes les classes</MenuItem>
                  <MenuItem value="1">Classe 1 - Capitaux</MenuItem>
                  <MenuItem value="2">Classe 2 - Immobilisations</MenuItem>
                  <MenuItem value="3">Classe 3 - Stocks</MenuItem>
                  <MenuItem value="4">Classe 4 - Tiers</MenuItem>
                  <MenuItem value="5">Classe 5 - Trésorerie</MenuItem>
                  <MenuItem value="6">Classe 6 - Charges</MenuItem>
                  <MenuItem value="7">Classe 7 - Produits</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de Solde</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type de Solde"
                >
                  <MenuItem value="">Tous les soldes</MenuItem>
                  <MenuItem value="debiteur">Soldes débiteurs</MenuItem>
                  <MenuItem value="crediteur">Soldes créditeurs</MenuItem>
                  <MenuItem value="equilibre">Soldes nuls</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GetApp />}
                sx={{ height: '56px' }}
                onClick={handleExport}
              >
                Exporter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table de la balance */}
      <Card>
        <CardHeader
          title="Balance Comptable"
          subheader={`${filteredBalances.length} compte(s) affiché(s)`}
          avatar={<AccountBalance color="primary" />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${filteredBalances.length} lignes`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                label={Math.abs(totals.debit - totals.credit) < 0.01 ? 'Équilibrée' : 'Déséquilibrée'}
                color={Math.abs(totals.debit - totals.credit) < 0.01 ? 'success' : 'error'}
                size="small"
              />
            </Box>
          }
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Compte</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell align="right">Débit</TableCell>
                  <TableCell align="right">Crédit</TableCell>
                  <TableCell align="right">Solde</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBalances.map((balance) => (
                  <TableRow key={balance.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {balance.compte}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {balance.libelle_compte}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          color: balance.debit > 0 ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {balance.debit > 0 ? formatMontant(balance.debit) : '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          color: balance.credit > 0 ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {balance.credit > 0 ? formatMontant(balance.credit) : '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {balance.solde !== 0 && (
                          balance.solde > 0 ? (
                            <TrendingUp color="success" fontSize="small" />
                          ) : (
                            <TrendingDown color="error" fontSize="small" />
                          )
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            color: getSoldeColor(balance.solde),
                            fontWeight: balance.solde !== 0 ? 600 : 400,
                          }}
                        >
                          {balance.solde !== 0 ? formatMontant(balance.solde) : '0'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Voir détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(balance)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small"
                            onClick={() => handleEdit(balance)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Ligne de totaux */}
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      TOTAUX
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatMontant(totals.debit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatMontant(totals.credit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        fontFamily: 'monospace',
                        color: Math.abs(totals.debit - totals.credit) < 0.01 ? 'success.main' : 'error.main',
                      }}
                    >
                      {formatMontant(Math.abs(totals.debit - totals.credit))}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredBalances.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[25, 50, 100, 500]}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
            labelRowsPerPage="Lignes par page"
          />
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Détails du Compte</Typography>
          <IconButton onClick={() => setDetailModalOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBalance && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Numéro de compte</Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  {selectedBalance.compte}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Libellé</Typography>
                <Typography variant="body1">{selectedBalance.libelle_compte}</Typography>
              </Box>
              
              <Divider />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">Débit</Typography>
                  <Typography variant="h6" color="info.main">
                    {formatMontant(selectedBalance.debit)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">Crédit</Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatMontant(selectedBalance.credit)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">Solde</Typography>
                  <Typography variant="h6" sx={{ color: getSoldeColor(selectedBalance.solde) }}>
                    {formatMontant(selectedBalance.solde)} FCFA
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Exercice</Typography>
                <Typography variant="body1">{selectedBalance.exercice}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Dernière modification</Typography>
                <Typography variant="body2">
                  {new Date(selectedBalance.updated_at).toLocaleString('fr-FR')}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog
        open={editModalOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Modifier le Compte</Typography>
          <IconButton onClick={handleCancelEdit} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editedBalance && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Numéro de compte"
                value={editedBalance.compte}
                onChange={(e) => setEditedBalance({ ...editedBalance, compte: e.target.value })}
                fullWidth
                disabled
              />
              
              <TextField
                label="Libellé du compte"
                value={editedBalance.libelle_compte}
                onChange={(e) => setEditedBalance({ ...editedBalance, libelle_compte: e.target.value })}
                fullWidth
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Débit"
                    type="number"
                    value={editedBalance.debit}
                    onChange={(e) => setEditedBalance({ 
                      ...editedBalance, 
                      debit: parseFloat(e.target.value) || 0,
                      solde: parseFloat(e.target.value) - editedBalance.credit 
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Crédit"
                    type="number"
                    value={editedBalance.credit}
                    onChange={(e) => setEditedBalance({ 
                      ...editedBalance, 
                      credit: parseFloat(e.target.value) || 0,
                      solde: editedBalance.debit - parseFloat(e.target.value)
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Solde calculé</Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: getSoldeColor(editedBalance.solde),
                    fontFamily: 'monospace' 
                  }}
                >
                  {formatMontant(editedBalance.solde)} FCFA
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelEdit}
            startIcon={<Cancel />}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<Save />}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default memo(BalanceConsultation)