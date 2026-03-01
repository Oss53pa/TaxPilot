/**
 * ExportCenter — Multi-format export, batch export, dynamic mapping, mail merge
 */

import React, { useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  alpha,
  useTheme,
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Article as WordIcon,
  Code as HtmlIcon,
  DataObject as XmlIcon,
  Slideshow as PptxIcon,
  GetApp as DownloadIcon,
  PlayArrow as RunIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AutoFixHigh as AutoMapIcon,
  Refresh as ResetIcon,
  FolderZip as ZipIcon,
  Business as CompanyIcon,
  DateRange as YearIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { exporterLiasse } from '@/modules/liasse-fiscale/services/liasse-export-excel'
import {
  type ExportFormatId,
  type ExportProfile,
  type ExportHistoryRecord,
  type FieldMapping,
  type MappingStatus,
  type BatchExportItem,
  type PdfOptions,
  EXPORT_FORMATS,
  loadFromStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS,
} from './exportTypes'

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  pdf: <PdfIcon />,
  excel: <ExcelIcon />,
  word: <WordIcon />,
  html: <HtmlIcon />,
  xml: <XmlIcon />,
  json: <XmlIcon />,
  pptx: <PptxIcon />,
}

// Template fields — derived from liasse fiscale structure
const TEMPLATE_FIELDS = [
  { id: 'raison_sociale', label: 'Raison sociale' },
  { id: 'numero_contribuable', label: 'Numero contribuable' },
  { id: 'exercice', label: 'Exercice fiscal' },
  { id: 'regime', label: 'Regime d\'imposition' },
  { id: 'forme_juridique', label: 'Forme juridique' },
  { id: 'secteur_activite', label: 'Secteur d\'activite' },
  { id: 'adresse', label: 'Adresse' },
  { id: 'capital_social', label: 'Capital social' },
  { id: 'total_actif_brut', label: 'Total Actif Brut' },
  { id: 'total_actif_net', label: 'Total Actif Net' },
  { id: 'total_passif', label: 'Total Passif' },
  { id: 'chiffre_affaires', label: 'Chiffre d\'affaires' },
  { id: 'resultat_net', label: 'Resultat net' },
  { id: 'resultat_exploitation', label: 'Resultat d\'exploitation' },
  { id: 'capitaux_propres', label: 'Capitaux propres' },
  { id: 'dettes_financieres', label: 'Dettes financieres' },
  { id: 'tresorerie_nette', label: 'Tresorerie nette' },
  { id: 'valeur_ajoutee', label: 'Valeur ajoutee' },
  { id: 'ebe', label: 'Excedent brut d\'exploitation' },
]

// Data source fields — mapped from real localStorage entreprise + liasse data
const DATA_FIELDS = [
  { id: 'entreprise.raison_sociale', label: 'Entreprise > Raison sociale' },
  { id: 'entreprise.numero_contribuable', label: 'Entreprise > N. contribuable' },
  { id: 'entreprise.exercice_debut', label: 'Entreprise > Exercice debut' },
  { id: 'entreprise.regime_imposition', label: 'Entreprise > Regime' },
  { id: 'entreprise.forme_juridique', label: 'Entreprise > Forme juridique' },
  { id: 'entreprise.secteur_activite', label: 'Entreprise > Secteur activite' },
  { id: 'entreprise.adresse_ligne1', label: 'Entreprise > Adresse' },
  { id: 'entreprise.capital_social', label: 'Entreprise > Capital social' },
  { id: 'bilan.total_actif_brut', label: 'Bilan > Total actif brut' },
  { id: 'bilan.total_actif_net', label: 'Bilan > Total actif net' },
  { id: 'bilan.total_passif', label: 'Bilan > Total passif' },
  { id: 'resultat.chiffre_affaires', label: 'Compte de resultat > CA' },
  { id: 'resultat.resultat_net', label: 'Compte de resultat > Resultat net' },
  { id: 'resultat.resultat_exploitation', label: 'SIG > Resultat exploitation' },
  { id: 'bilan.capitaux_propres', label: 'Bilan passif > Capitaux propres' },
  { id: 'bilan.dettes_financieres', label: 'Bilan passif > Dettes financieres' },
  { id: 'tft.tresorerie_nette', label: 'TFT > Tresorerie nette' },
  { id: 'sig.valeur_ajoutee', label: 'SIG > Valeur ajoutee' },
  { id: 'sig.ebe', label: 'SIG > EBE' },
]

const REGIME_LABELS: Record<string, string> = {
  REEL_NORMAL: 'Systeme Normal',
  reel_normal: 'Systeme Normal',
  REEL_SIMPLIFIE: 'Systeme Minimal',
  reel_simplifie: 'Systeme Minimal',
  FORFAITAIRE: 'Forfaitaire',
  forfaitaire: 'Forfaitaire',
  MICRO: 'Micro-Entreprise',
  micro: 'Micro-Entreprise',
}

/** Load real entreprises from localStorage */
function loadEntreprises(): BatchExportItem[] {
  try {
    const raw = localStorage.getItem('fiscasync_db_entreprises')
    const list: any[] = raw ? JSON.parse(raw) : []
    return list.map(ent => ({
      id: ent.id || generateId(),
      company: ent.raison_sociale || 'Sans nom',
      fiscalYear: ent.exercice_debut?.slice(0, 4) || new Date().getFullYear().toString(),
      regime: ent.regime_imposition || 'reel_normal',
      country: ent.pays || 'CI',
      status: 'pending' as const,
      progress: 0,
    }))
  } catch {
    return []
  }
}

interface Props {
  profiles: ExportProfile[]
}

type SubTab = 'format' | 'mapping' | 'batch' | 'merge'

const ExportCenter: React.FC<Props> = ({ profiles }) => {
  const theme = useTheme()
  const [subTab, setSubTab] = useState<SubTab>('format')

  // Format selection
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatId>('pdf')
  const [selectedProfile, setSelectedProfile] = useState('')
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>({
    orientation: 'portrait',
    paperSize: 'A4',
    coverPage: true,
    watermark: '',
    passwordProtection: false,
    password: '',
  })

  // Mapping
  const [mappings, setMappings] = useState<FieldMapping[]>(() =>
    TEMPLATE_FIELDS.map((tf, i) => ({
      id: generateId(),
      templateField: tf.id,
      templateFieldLabel: tf.label,
      dataField: DATA_FIELDS[i]?.id || '',
      dataFieldLabel: DATA_FIELDS[i]?.label || '',
      status: (DATA_FIELDS[i] ? 'mapped' : 'unmapped') as MappingStatus,
      autoMapped: !!DATA_FIELDS[i],
    }))
  )

  // Batch — loaded from real entreprises in localStorage
  const [batchItems, setBatchItems] = useState<BatchExportItem[]>(() => loadEntreprises())
  const [batchFormats, setBatchFormats] = useState<Set<ExportFormatId>>(new Set(['pdf']))
  const [batchRunning, setBatchRunning] = useState(false)

  // Merge
  const [mergeMode, setMergeMode] = useState<'individual' | 'combined'>('individual')
  const [mergeItems, setMergeItems] = useState<string[]>(['1', '2'])

  const handleAutoMap = useCallback(() => {
    setMappings(prev => prev.map((m, i) => ({
      ...m,
      dataField: DATA_FIELDS[i]?.id || '',
      dataFieldLabel: DATA_FIELDS[i]?.label || '',
      status: DATA_FIELDS[i] ? 'mapped' as MappingStatus : 'unmapped' as MappingStatus,
      autoMapped: !!DATA_FIELDS[i],
    })))
  }, [])

  const handleResetMapping = useCallback(() => {
    setMappings(prev => prev.map(m => ({
      ...m,
      dataField: '',
      dataFieldLabel: '',
      status: 'unmapped' as MappingStatus,
      autoMapped: false,
    })))
  }, [])

  const handleUpdateMapping = useCallback((mappingId: string, dataFieldId: string) => {
    const df = DATA_FIELDS.find(f => f.id === dataFieldId)
    setMappings(prev => prev.map(m => m.id === mappingId ? {
      ...m,
      dataField: dataFieldId,
      dataFieldLabel: df?.label || '',
      status: dataFieldId ? 'mapped' as MappingStatus : 'unmapped' as MappingStatus,
      autoMapped: false,
    } : m))
  }, [])

  const handleRunBatch = useCallback(() => {
    setBatchRunning(true)
    setBatchItems(prev => prev.map(item => ({ ...item, status: 'processing' as const, progress: 0 })))

    // Simulate batch processing
    let completed = 0
    const total = batchItems.length
    const interval = setInterval(() => {
      setBatchItems(prev => {
        const next = [...prev]
        for (let i = 0; i < next.length; i++) {
          if (next[i].status === 'processing') {
            next[i] = { ...next[i], progress: Math.min(100, next[i].progress + Math.random() * 30) }
            if (next[i].progress >= 100) {
              next[i] = { ...next[i], status: 'completed', progress: 100 }
              completed++
            }
          }
        }
        if (completed >= total) {
          clearInterval(interval)
          setBatchRunning(false)
        }
        return next
      })
    }, 500)
  }, [batchItems.length])

  const handleExport = useCallback(() => {
    // Read real entreprise data for the export record
    let company = 'Mon entreprise'
    let regime = 'reel_normal'
    let regimeLabel = 'Systeme Normal'
    let country = 'CI'
    let countryLabel = "Cote d'Ivoire"
    let fiscalYear = new Date().getFullYear().toString()
    try {
      const raw = localStorage.getItem('fiscasync_db_entreprises')
      const ents: any[] = raw ? JSON.parse(raw) : []
      if (ents.length > 0) {
        const ent = ents[0]
        company = ent.raison_sociale || company
        regime = ent.regime_imposition || regime
        regimeLabel = REGIME_LABELS[regime] || regime
        country = ent.pays || country
        countryLabel = ent.pays_detail?.nom || countryLabel
        fiscalYear = ent.exercice_debut?.slice(0, 4) || fiscalYear
      }
    } catch { /* ignore */ }

    const ext = selectedFormat === 'excel' ? 'xlsx' : selectedFormat === 'word' ? 'docx' : selectedFormat === 'pptx' ? 'pptx' : selectedFormat
    const record: ExportHistoryRecord = {
      id: generateId(),
      date: new Date().toISOString(),
      regime,
      regimeLabel,
      format: selectedFormat,
      company,
      fiscalYear,
      country,
      countryLabel,
      profileName: profiles.find(p => p.id === selectedProfile)?.name || 'Defaut',
      status: 'completed',
      fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      fileName: `Liasse_${regime}_${fiscalYear}.${ext}`,
    }
    const history = loadFromStorage<ExportHistoryRecord[]>(STORAGE_KEYS.EXPORT_HISTORY, [])
    history.unshift(record)
    saveToStorage(STORAGE_KEYS.EXPORT_HISTORY, history)
  }, [selectedFormat, selectedProfile, profiles])

  const mappedCount = mappings.filter(m => m.status === 'mapped').length
  const partialCount = mappings.filter(m => m.status === 'partial').length
  const unmappedCount = mappings.filter(m => m.status === 'unmapped').length

  const StatusIcon: React.FC<{ status: MappingStatus }> = ({ status }) => {
    switch (status) {
      case 'mapped': return <CheckIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
      case 'partial': return <WarningIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
      case 'unmapped': return <ErrorIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
    }
  }

  return (
    <Box>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="format" label="Format d'export" />
        <Tab value="mapping" label="Mapping dynamique" />
        <Tab value="batch" label="Export en lot" />
        <Tab value="merge" label="Generation en masse" />
      </Tabs>

      {/* ─── FORMAT SELECTION ─── */}
      {subTab === 'format' && (
        <Box>
          {/* Quick export: Liasse Officielle */}
          <Card elevation={0} sx={{ border: '2px solid #16a34a', bgcolor: '#f0fdf4', mb: 3, p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534' }}>
                  Export Liasse Officielle (84 pages)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fichier Excel SYSCOHADA complet avec toutes les pages
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<ExcelIcon />}
                onClick={() => {
                  try {
                    // Load balance and entreprise from localStorage
                    const balRaw = localStorage.getItem('fiscasync_balance_latest')
                    const bal = balRaw ? JSON.parse(balRaw) : null
                    if (!bal?.entries?.length) {
                      alert('Aucune balance importee. Importez une balance avant d\'exporter.')
                      return
                    }
                    const entries = bal.entries.map((e: any) => ({
                      compte: String(e.compte || ''),
                      libelle: String(e.intitule || e.libelle || ''),
                      debit: Number(e.debit) || 0,
                      credit: Number(e.credit) || 0,
                      solde_debit: Number(e.solde_debit) || 0,
                      solde_credit: Number(e.solde_credit) || 0,
                    }))
                    const entRaw = localStorage.getItem('fiscasync_entreprise_settings') || localStorage.getItem('fiscasync_db_entreprise_settings')
                    const entParsed = entRaw ? JSON.parse(entRaw) : {}
                    const ent = Array.isArray(entParsed) ? entParsed[0] || {} : entParsed
                    const entreprise = {
                      denomination: ent.raison_sociale || ent.denomination || '',
                      sigle: ent.sigle || '',
                      adresse: [ent.adresse_ligne1, ent.ville].filter(Boolean).join(' - '),
                      ncc: ent.numero_contribuable || '',
                      ntd: ent.numero_teledeclarant || '',
                      exercice_clos: ent.exercice_fin || ent.date_arrete_comptes || '',
                      exercice_precedent_fin: ent.exercice_precedent_fin || '',
                      duree_mois: ent.duree_exercice_precedent || 12,
                      regime: ent.regime_imposition || '',
                      forme_juridique: ent.forme_juridique || '',
                      code_forme_juridique: '', code_regime: '', code_pays: '',
                      centre_depot: '', ville: '', boite_postale: '',
                      capital_social: ent.capital_social || 0,
                      nom_dirigeant: '', fonction_dirigeant: '', greffe: '',
                      numero_repertoire_entites: '', numero_caisse_sociale: '',
                      numero_code_importateur: '', code_ville: '',
                      pourcentage_capacite_production: 0, branche_activite: '',
                      code_secteur: '', nombre_etablissements: 0,
                      effectif_permanent: 0, effectif_temporaire: 0,
                      effectif_debut: 0, effectif_fin: 0, masse_salariale: 0,
                      nom_groupe: '', pays_siege_groupe: '',
                      cac_nom: '', cac_adresse: '', cac_numero_inscription: '',
                      expert_nom: '', expert_adresse: '', expert_numero_inscription: '',
                      personne_contact: '', etats_financiers_approuves: false,
                      date_signature_etats: '', domiciliations_bancaires: [],
                      dirigeants: [], commissaires_comptes: [], participations_filiales: [],
                    }
                    const annee = parseInt((entreprise.exercice_clos || '').slice(-4)) || new Date().getFullYear()
                    exporterLiasse(entries, [], entreprise, {
                      annee,
                      dateDebut: `01/01/${annee}`,
                      dateFin: entreprise.exercice_clos || `31/12/${annee}`,
                      dureeMois: entreprise.duree_mois || 12,
                    })

                    // Update workflow state
                    try {
                      const wsRaw = localStorage.getItem('fiscasync_workflow_state')
                      const ws = wsRaw ? JSON.parse(wsRaw) : {}
                      ws.lastExportDate = new Date().toISOString()
                      ws.lastExportFormat = 'excel'
                      localStorage.setItem('fiscasync_workflow_state', JSON.stringify(ws))
                    } catch { /* ignore */ }
                  } catch (err: any) {
                    alert(`Erreur export: ${err?.message || err}`)
                  }
                }}
                sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
              >
                Exporter Excel 84 pages
              </Button>
            </Stack>
          </Card>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Selectionnez le format de sortie
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {EXPORT_FORMATS.map(fmt => (
              <Grid item xs={6} sm={4} md={3} key={fmt.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: `2px solid ${selectedFormat === fmt.id ? fmt.color : alpha(theme.palette.divider, 0.15)}`,
                    backgroundColor: selectedFormat === fmt.id ? alpha(fmt.color, 0.04) : 'transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { borderColor: fmt.color },
                  }}
                >
                  <CardActionArea onClick={() => setSelectedFormat(fmt.id)} sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: fmt.color, mb: 1 }}>
                      {FORMAT_ICONS[fmt.id] || <XmlIcon />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{fmt.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                      {fmt.description}
                    </Typography>
                    <Chip label={fmt.extensions[0]} size="small" variant="outlined" sx={{ mt: 1, height: 20, fontSize: '0.65rem' }} />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* PDF-specific options */}
          {selectedFormat === 'pdf' && (
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Options PDF</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Orientation</InputLabel>
                      <Select value={pdfOptions.orientation} label="Orientation"
                        onChange={(e) => setPdfOptions(prev => ({ ...prev, orientation: e.target.value as PdfOptions['orientation'] }))}>
                        <MenuItem value="portrait">Portrait</MenuItem>
                        <MenuItem value="landscape">Paysage</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Taille papier</InputLabel>
                      <Select value={pdfOptions.paperSize} label="Taille papier"
                        onChange={(e) => setPdfOptions(prev => ({ ...prev, paperSize: e.target.value as PdfOptions['paperSize'] }))}>
                        <MenuItem value="A4">A4</MenuItem>
                        <MenuItem value="A3">A3</MenuItem>
                        <MenuItem value="Letter">Letter</MenuItem>
                        <MenuItem value="Legal">Legal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={<Switch checked={pdfOptions.coverPage} onChange={(e) => setPdfOptions(prev => ({ ...prev, coverPage: e.target.checked }))} />}
                      label="Page de couverture"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={<Switch checked={pdfOptions.passwordProtection} onChange={(e) => setPdfOptions(prev => ({ ...prev, passwordProtection: e.target.checked }))} />}
                      label="Mot de passe"
                    />
                  </Grid>
                  {pdfOptions.passwordProtection && (
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" type="password" label="Mot de passe PDF"
                        value={pdfOptions.password} onChange={(e) => setPdfOptions(prev => ({ ...prev, password: e.target.value }))} />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Filigrane (watermark)"
                      value={pdfOptions.watermark} onChange={(e) => setPdfOptions(prev => ({ ...prev, watermark: e.target.value }))}
                      placeholder="Ex: CONFIDENTIEL, BROUILLON..." />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Excel options */}
          {selectedFormat === 'excel' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Export Excel avec formules</AlertTitle>
              Les formules de calcul seront preservees dans le fichier .xlsx.
              Les en-tetes seront figes et les montants formates en XOF.
            </Alert>
          )}

          {/* Profile selection + export button */}
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Profil d'export</InputLabel>
              <Select value={selectedProfile} label="Profil d'export" onChange={(e) => setSelectedProfile(e.target.value)}>
                <MenuItem value="">Defaut (aucun profil)</MenuItem>
                {profiles.filter(p => p.status === 'active').map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
              Exporter en {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.label}
            </Button>
          </Stack>
        </Box>
      )}

      {/* ─── MAPPING DYNAMIQUE ─── */}
      {subTab === 'mapping' && (
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<AutoMapIcon />} onClick={handleAutoMap}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
              Auto-mapper tout
            </Button>
            <Button variant="outlined" size="small" startIcon={<ResetIcon />} onClick={handleResetMapping}>
              Reinitialiser
            </Button>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1}>
              <Chip icon={<CheckIcon />} label={`${mappedCount} mappes`} size="small" color="success" variant="outlined" />
              <Chip icon={<WarningIcon />} label={`${partialCount} partiels`} size="small" color="warning" variant="outlined" />
              <Chip icon={<ErrorIcon />} label={`${unmappedCount} non mappes`} size="small" color="error" variant="outlined" />
            </Stack>
          </Stack>

          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', px: 3, py: 1.5, backgroundColor: P.primary50, borderBottom: `1px solid ${P.primary200}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, width: 40, textTransform: 'uppercase' }}>Etat</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, flex: 1, textTransform: 'uppercase' }}>Champ template</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, flex: 1, textTransform: 'uppercase' }}>Champ source</Typography>
              </Box>
              {/* Rows */}
              {mappings.map((m, i) => (
                <Box key={m.id} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1,
                  borderBottom: i < mappings.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.06)}` : 'none',
                  '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.03) },
                }}>
                  <Box sx={{ width: 40 }}>
                    <StatusIcon status={m.status} />
                  </Box>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                    {m.templateFieldLabel}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={m.dataField}
                        displayEmpty
                        onChange={(e) => handleUpdateMapping(m.id, e.target.value)}
                        sx={{ fontSize: '0.85rem' }}
                      >
                        <MenuItem value="">
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Non mappe</Typography>
                        </MenuItem>
                        {DATA_FIELDS.map(df => (
                          <MenuItem key={df.id} value={df.id}>{df.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ─── BATCH EXPORT ─── */}
      {subTab === 'batch' && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Export en lot</AlertTitle>
            Selectionnez les liasses et formats a exporter. Le resultat sera disponible en archive ZIP.
          </Alert>

          {/* Format selection for batch */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Formats de sortie</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {EXPORT_FORMATS.slice(0, 4).map(fmt => (
              <Chip
                key={fmt.id}
                label={fmt.label}
                icon={FORMAT_ICONS[fmt.id] as React.ReactElement || undefined}
                variant={batchFormats.has(fmt.id) ? 'filled' : 'outlined'}
                color={batchFormats.has(fmt.id) ? 'primary' : 'default'}
                onClick={() => {
                  const next = new Set(batchFormats)
                  if (next.has(fmt.id)) next.delete(fmt.id)
                  else next.add(fmt.id)
                  setBatchFormats(next)
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>

          {/* Batch items */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', px: 3, py: 1.5, backgroundColor: P.primary50, borderBottom: `1px solid ${P.primary200}` }}>
                <Box sx={{ width: 40 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, flex: 1, textTransform: 'uppercase' }}>Entreprise</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, width: 100, textTransform: 'uppercase' }}>Exercice</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, width: 140, textTransform: 'uppercase' }}>Regime</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, width: 120, textTransform: 'uppercase' }}>Statut</Typography>
              </Box>
              {batchItems.map((item) => (
                <Box key={item.id} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                }}>
                  <Box sx={{ width: 40 }}>
                    <Checkbox size="small" defaultChecked />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompanyIcon fontSize="small" color="action" />
                    <Typography variant="body2">{item.company}</Typography>
                  </Box>
                  <Box sx={{ width: 100, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <YearIcon fontSize="small" color="action" />
                    <Typography variant="body2">{item.fiscalYear}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ width: 140 }}>
                    {REGIME_LABELS[item.regime] || item.regime}
                  </Typography>
                  <Box sx={{ width: 120 }}>
                    {item.status === 'pending' && <Chip label="En attente" size="small" variant="outlined" />}
                    {item.status === 'processing' && (
                      <Box>
                        <LinearProgress variant="determinate" value={item.progress} sx={{ height: 6, borderRadius: 3, mb: 0.5 }} />
                        <Typography variant="caption">{Math.round(item.progress)}%</Typography>
                      </Box>
                    )}
                    {item.status === 'completed' && <Chip label="Termine" size="small" color="success" icon={<CheckIcon />} />}
                    {item.status === 'error' && <Chip label="Erreur" size="small" color="error" icon={<ErrorIcon />} />}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<RunIcon />} onClick={handleRunBatch} disabled={batchRunning || batchFormats.size === 0}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
              {batchRunning ? 'Export en cours...' : 'Lancer l\'export en lot'}
            </Button>
            {batchItems.every(i => i.status === 'completed') && (
              <Button variant="outlined" startIcon={<ZipIcon />}>
                Telecharger tout (ZIP)
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* ─── MAIL MERGE / GENERATION EN MASSE ─── */}
      {subTab === 'merge' && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Generation en masse</AlertTitle>
            Selectionnez un profil d'export et plusieurs sources de donnees pour generer des documents.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Configuration</Typography>

                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Profil d'export</InputLabel>
                      <Select value={selectedProfile} label="Profil d'export" onChange={(e) => setSelectedProfile(e.target.value)}>
                        <MenuItem value="">Defaut</MenuItem>
                        {profiles.filter(p => p.status === 'active').map(p => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Format de sortie</InputLabel>
                      <Select value={selectedFormat} label="Format de sortie" onChange={(e) => setSelectedFormat(e.target.value as ExportFormatId)}>
                        {EXPORT_FORMATS.map(f => (
                          <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Divider />

                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: P.primary500 }}>
                      Mode de generation
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Card
                        elevation={0}
                        sx={{
                          flex: 1,
                          border: `2px solid ${mergeMode === 'individual' ? P.primary900 : P.primary200}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => setMergeMode('individual')}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Fichiers individuels</Typography>
                          <Typography variant="caption" color="text.secondary">Un document par source</Typography>
                        </CardContent>
                      </Card>
                      <Card
                        elevation={0}
                        sx={{
                          flex: 1,
                          border: `2px solid ${mergeMode === 'combined' ? P.primary900 : P.primary200}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => setMergeMode('combined')}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Document fusionne</Typography>
                          <Typography variant="caption" color="text.secondary">Tout dans un seul fichier</Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Sources de donnees</Typography>
                  <Stack spacing={1}>
                    {batchItems.map(item => (
                      <Box key={item.id} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        border: `1px solid ${mergeItems.includes(item.id) ? P.primary900 : P.primary200}`,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: mergeItems.includes(item.id) ? alpha(P.primary900, 0.04) : 'transparent',
                      }}
                        onClick={() => {
                          setMergeItems(prev =>
                            prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                          )
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.company}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.fiscalYear} — {REGIME_LABELS[item.regime] || item.regime}
                          </Typography>
                        </Box>
                        <Checkbox checked={mergeItems.includes(item.id)} size="small" />
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {mergeItems.length} source{mergeItems.length > 1 ? 's' : ''} selectionnee{mergeItems.length > 1 ? 's' : ''}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" size="small" startIcon={<RunIcon />} disabled={mergeItems.length === 0}
                      sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
                      Generer
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default ExportCenter
