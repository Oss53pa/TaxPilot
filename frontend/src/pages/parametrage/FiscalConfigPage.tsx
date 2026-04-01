import React, { useState } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Alert, AlertTitle, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  InputAdornment, Divider,
} from '@mui/material'
import {
  Edit as EditIcon, CheckCircle, Warning as WarningIcon,
  Save as SaveIcon, Close as CloseIcon, Flag as FlagIcon,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useFiscalConfigs, useUpdateFiscalConfig } from '@/hooks/useFiscalConfig'
import type { FiscalConfig } from '@/services/fiscalConfigService'
import RequirePermission from '@/components/guards/RequirePermission'

// Countries verified by fiscal expert
const VERIFIED_COUNTRIES = ['CI', 'SN', 'BF', 'BJ', 'TG', 'CM', 'GA', 'CD']

const formatPercent = (rate: number | null | undefined) => {
  if (rate === null || rate === undefined) return '\u2014'
  return `${(rate * 100).toFixed(2)}%`
}

const formatAmount = (amount: number | null | undefined, currency: string) => {
  if (amount === null || amount === undefined) return '\u2014'
  return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + currency
}

interface EditDialogProps {
  open: boolean
  config: FiscalConfig | null
  onClose: () => void
  onSave: (id: string, updates: Partial<FiscalConfig>) => void
  isSaving: boolean
}

const EditDialog: React.FC<EditDialogProps> = ({ open, config, onClose, onSave, isSaving }) => {
  const [form, setForm] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (config) {
      setForm({
        isRate: String((config.isRate * 100)),
        isReducedRate: config.isReducedRate ? String((config.isReducedRate * 100)) : '',
        isReducedThreshold: config.isReducedThreshold ? String(config.isReducedThreshold) : '',
        imfRate: String((config.imfRate * 100)),
        imfMinimum: String(config.imfMinimum),
        imfMaximum: config.imfMaximum ? String(config.imfMaximum) : '',
        giftThresholdRate: config.giftThresholdRate ? String((config.giftThresholdRate * 1000)) : '',
        donationThresholdRate: config.donationThresholdRate ? String((config.donationThresholdRate * 1000)) : '',
        entertainmentThresholdRate: config.entertainmentThresholdRate ? String((config.entertainmentThresholdRate * 100)) : '',
        lossCarryforwardYears: String(config.lossCarryforwardYears),
        vatStandardRate: config.vatStandardRate ? String((config.vatStandardRate * 100)) : '',
        vatReducedRate: config.vatReducedRate ? String((config.vatReducedRate * 100)) : '',
        notes: config.notes || '',
      })
    }
  }, [config])

  if (!config) return null

  const handleSave = () => {
    const updates: Partial<FiscalConfig> = {
      isRate: parseFloat(form.isRate) / 100,
      isReducedRate: form.isReducedRate ? parseFloat(form.isReducedRate) / 100 : null,
      isReducedThreshold: form.isReducedThreshold ? parseFloat(form.isReducedThreshold) : null,
      imfRate: parseFloat(form.imfRate) / 100,
      imfMinimum: parseFloat(form.imfMinimum),
      imfMaximum: form.imfMaximum ? parseFloat(form.imfMaximum) : null,
      giftThresholdRate: form.giftThresholdRate ? parseFloat(form.giftThresholdRate) / 1000 : null,
      donationThresholdRate: form.donationThresholdRate ? parseFloat(form.donationThresholdRate) / 1000 : null,
      entertainmentThresholdRate: form.entertainmentThresholdRate ? parseFloat(form.entertainmentThresholdRate) / 100 : null,
      lossCarryforwardYears: parseInt(form.lossCarryforwardYears),
      vatStandardRate: form.vatStandardRate ? parseFloat(form.vatStandardRate) / 100 : null,
      vatReducedRate: form.vatReducedRate ? parseFloat(form.vatReducedRate) / 100 : null,
      notes: form.notes || null,
    }
    onSave(config.id, updates)
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon />
          Parametrage fiscal — {config.countryName} ({config.countryCode})
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* IS */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Impot sur les Societes (IS)</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Taux IS standard" value={form.isRate}
              onChange={e => update('isRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Taux IS reduit (PME)" value={form.isReducedRate}
              onChange={e => update('isReducedRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              helperText="Laisser vide si non applicable" />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Seuil CA PME" value={form.isReducedThreshold}
              onChange={e => update('isReducedThreshold', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">{config.currency}</InputAdornment> }} />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* IMF */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Impot Minimum Forfaitaire (IMF)</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Taux IMF" value={form.imfRate}
              onChange={e => update('imfRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="IMF minimum" value={form.imfMinimum}
              onChange={e => update('imfMinimum', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">{config.currency}</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="IMF maximum" value={form.imfMaximum}
              onChange={e => update('imfMaximum', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">{config.currency}</InputAdornment> }}
              helperText="Laisser vide si pas de plafond" />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Seuils deductibilite */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Seuils de deductibilite</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Cadeaux (max)" value={form.giftThresholdRate}
              onChange={e => update('giftThresholdRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">pour mille du CA</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Dons (max)" value={form.donationThresholdRate}
              onChange={e => update('donationThresholdRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">pour mille du CA</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Frais reception (max)" value={form.entertainmentThresholdRate}
              onChange={e => update('entertainmentThresholdRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">% du CA</InputAdornment> }} />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Autres */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Autres parametres</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Report deficitaire" value={form.lossCarryforwardYears}
              onChange={e => update('lossCarryforwardYears', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">ans</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="TVA standard" value={form.vatStandardRate}
              onChange={e => update('vatStandardRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="TVA reduite" value={form.vatReducedRate}
              onChange={e => update('vatReducedRate', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Notes / Sources" value={form.notes}
              onChange={e => update('notes', e.target.value)}
              multiline rows={2}
              helperText="Ex: LFI 2024, Art. 33 CGI" />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving} startIcon={<SaveIcon />}>
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const FiscalConfigPage: React.FC = () => {
  const { data: configs, isLoading, error } = useFiscalConfigs()
  const updateMutation = useUpdateFiscalConfig()
  const { enqueueSnackbar } = useSnackbar()
  const [editConfig, setEditConfig] = useState<FiscalConfig | null>(null)

  const handleSave = async (id: string, updates: Partial<FiscalConfig>) => {
    try {
      await updateMutation.mutateAsync({ id, updates })
      enqueueSnackbar('Configuration fiscale mise a jour', { variant: 'success' })
      setEditConfig(null)
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur', { variant: 'error' })
    }
  }

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">Erreur de chargement: {error instanceof Error ? error.message : 'Inconnue'}</Alert>

  return (
    <RequirePermission permission="manage:subscription">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Configuration fiscale par pays
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Parametrez les taux d'imposition, seuils de deductibilite et regles fiscales pour chaque pays OHADA.
          Les modifications prennent effet immediatement pour toutes les nouvelles generations de liasses.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Verification des taux</AlertTitle>
          Les pays marques d'un badge vert ont ete verifies avec les CGI/LFI en vigueur.
          Les pays en orange doivent etre confirmes par un expert-comptable local avant utilisation.
        </Alert>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Pays</strong></TableCell>
                <TableCell><strong>Devise</strong></TableCell>
                <TableCell align="right"><strong>IS</strong></TableCell>
                <TableCell align="right"><strong>IS PME</strong></TableCell>
                <TableCell align="right"><strong>IMF</strong></TableCell>
                <TableCell align="right"><strong>IMF min</strong></TableCell>
                <TableCell align="right"><strong>TVA</strong></TableCell>
                <TableCell align="center"><strong>Report</strong></TableCell>
                <TableCell align="center"><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(configs || []).map((config) => {
                const isVerified = VERIFIED_COUNTRIES.includes(config.countryCode)
                return (
                  <TableRow key={config.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{config.countryCode}</Typography>
                      <Typography variant="caption" color="text.secondary">{config.countryName}</Typography>
                    </TableCell>
                    <TableCell>{config.currency}</TableCell>
                    <TableCell align="right">{formatPercent(config.isRate)}</TableCell>
                    <TableCell align="right">
                      {config.isReducedRate
                        ? <Tooltip title={`CA < ${formatAmount(config.isReducedThreshold, config.currency)}`}>
                            <span>{formatPercent(config.isReducedRate)}</span>
                          </Tooltip>
                        : '\u2014'}
                    </TableCell>
                    <TableCell align="right">{formatPercent(config.imfRate)}</TableCell>
                    <TableCell align="right">{formatAmount(config.imfMinimum, config.currency)}</TableCell>
                    <TableCell align="right">{formatPercent(config.vatStandardRate)}</TableCell>
                    <TableCell align="center">{config.lossCarryforwardYears} ans</TableCell>
                    <TableCell align="center">
                      {isVerified
                        ? <Chip icon={<CheckCircle />} label="Verifie" size="small" color="success" variant="outlined" />
                        : <Chip icon={<WarningIcon />} label="A confirmer" size="small" color="warning" variant="outlined" />}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => setEditConfig(config)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <EditDialog
          open={!!editConfig}
          config={editConfig}
          onClose={() => setEditConfig(null)}
          onSave={handleSave}
          isSaving={updateMutation.isPending}
        />
      </Box>
    </RequirePermission>
  )
}

export default FiscalConfigPage
