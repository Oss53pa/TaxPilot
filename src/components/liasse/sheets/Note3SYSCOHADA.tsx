/**
 * Note 3 - Immobilisations SYSCOHADA
 * 6 sous-onglets: 3A (Brutes), 3B (Location-acquisition), 3C (Amortissements),
 * 3C BIS (Dépréciations), 3D (Plus/Moins-values), 3E (Réévaluations)
 *
 * Connecté aux données de la balance (comptes 2x, 28x, 29x)
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Alert,
  useTheme,
} from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'
import { liasseDataService } from '../../../services/liasseDataService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`note3-tabpanel-${index}`}
      aria-labelledby={`note3-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

interface Note3Props {
  initialTab?: number
}

const formatMontant = (montant: number) => {
  if (!montant || montant === 0) return '-'
  return montant.toLocaleString('fr-FR') + ' FCFA'
}

// ============================================================================
// TAB 3A - IMMOBILISATIONS BRUTES
// ============================================================================
const Tab3A: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<{ incorporelles: any[]; corporelles: any[]; financieres: any[]; avances: any[] }>({
    incorporelles: [], corporelles: [], financieres: [], avances: []
  })
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (liasseDataService.isLoaded()) {
      const d = liasseDataService.generateNote3A()
      setData(d)
      setHasData(d.incorporelles.length > 0 || d.corporelles.length > 0 || d.financieres.length > 0 || d.avances.length > 0)
    }
  }, [])

  const colonnes = [
    'Rubriques',
    'Montant brut ouverture (A)',
    'Acquisitions / Apports (B1)',
    'Virements poste-à-poste (B2)',
    'Réévaluation (B3)',
    'Cessions / Hors service (C1)',
    'Virements sortie (C2)',
    'Montant brut clôture (D=A+B-C)'
  ]

  const toValues = (line: any) => [
    line.brutOuverture, line.acquisitions, line.virements, line.reevaluation,
    line.cessions, line.virementsSortie, line.brutCloture
  ]

  const sumLines = (lines: any[]) => {
    const sums = [0, 0, 0, 0, 0, 0, 0]
    lines.forEach(l => {
      const v = toValues(l)
      v.forEach((val, i) => { sums[i] += val })
    })
    return sums
  }

  const renderGroup = (label: string, lines: any[]) => {
    if (lines.length === 0) return null
    const subtotal = sumLines(lines)
    return (
      <>
        {lines.map((ligne, idx) => (
          <TableRow key={`${label}-${idx}`} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
            <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{ligne.rubrique}</TableCell>
            {toValues(ligne).map((val, vi) => (
              <TableCell key={vi} align="right" sx={{ fontWeight: 400, fontSize: '0.8rem' }}>
                {formatMontant(val)}
              </TableCell>
            ))}
          </TableRow>
        ))}
        <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Sous-total {label}</TableCell>
          {subtotal.map((val, vi) => (
            <TableCell key={vi} align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
              {formatMontant(val)}
            </TableCell>
          ))}
        </TableRow>
      </>
    )
  }

  const allLines = [...data.incorporelles, ...data.corporelles, ...data.financieres, ...data.avances]
  const grandTotal = sumLines(allLines)

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3A - Tableau des mouvements des immobilisations brutes
      </Typography>
      {!hasData && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
          Aucune immobilisation trouvée dans la balance. Importez une balance contenant des comptes de classe 2 pour alimenter cette note.
        </Alert>
      )}
      <TableActions tableName="Immobilisations Brutes" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 200 : 110 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderGroup('incorporelles', data.incorporelles)}
            {renderGroup('corporelles', data.corporelles)}
            {renderGroup('financières', data.financieres)}
            {renderGroup('avances', data.avances)}
            {hasData && (
              <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>TOTAL GÉNÉRAL</TableCell>
                {grandTotal.map((val, vi) => (
                  <TableCell key={vi} align="right" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {formatMontant(val)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// TAB 3B - BIENS EN LOCATION-ACQUISITION
// ============================================================================
const Tab3B: React.FC = () => {
  const theme = useTheme()

  // Note 3B: location-acquisition data comes from accounts 167 (credit-bail)
  // and off-balance-sheet info - mostly manual entry
  const colonnes = [
    'Rubriques',
    'Nature contrat (I/M/A)',
    'Montant brut ouverture (A)',
    'Acquisitions (B1)',
    'Virements (B2)',
    'Réévaluation (B3)',
    'Sorties (C1)',
    'Virements sortie (C2)',
    'Montant brut clôture (D=A+B-C)'
  ]

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3B - Biens en location-acquisition / crédit-bail
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Les biens en location-acquisition/crédit-bail sont renseignés manuellement. Les données hors bilan ne figurent pas dans la balance comptable.
      </Alert>
      <TableActions tableName="Location-acquisition" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i <= 1 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 200 : i === 1 ? 100 : 100 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                Aucun bien en location-acquisition renseigné. Utilisez le bouton «Ajouter» pour saisir les données.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// TAB 3C - AMORTISSEMENTS
// ============================================================================
const Tab3C: React.FC = () => {
  const theme = useTheme()
  const [lignes, setLignes] = useState<any[]>([])
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (liasseDataService.isLoaded()) {
      const data = liasseDataService.generateNote3C()
      setLignes(data)
      setHasData(data.length > 0)
    }
  }, [])

  const colonnes = [
    'Rubriques',
    'Amort. cumulés ouverture (A)',
    'Dotations (B)',
    'Amort. sortis actif (C1)',
    'Reprises (C2)',
    'Virements (D)',
    'Amort. cumulés clôture (E=A+B-C-D)'
  ]

  const totalValues = () => {
    const sums = [0, 0, 0, 0, 0, 0]
    lignes.forEach(l => {
      sums[0] += l.cumulOuverture
      sums[1] += l.dotations
      sums[2] += l.reprises
      sums[3] += 0 // reprises C2
      sums[4] += l.virements
      sums[5] += l.cumulCloture
    })
    return sums
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3C - Tableau des amortissements
      </Typography>
      {!hasData && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
          Aucun amortissement trouvé dans la balance. Importez une balance contenant des comptes 28x.
        </Alert>
      )}
      <TableActions tableName="Amortissements" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 200 : 120 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((ligne, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell sx={{ fontWeight: 500 }}>{ligne.rubrique}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.cumulOuverture)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.dotations)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.reprises)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>-</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.virements)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.cumulCloture)}</TableCell>
              </TableRow>
            ))}
            {hasData && (
              <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
                <TableCell sx={{ fontWeight: 700 }}>TOTAL GÉNÉRAL</TableCell>
                {totalValues().map((val, vi) => (
                  <TableCell key={vi} align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {formatMontant(val)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// TAB 3C BIS - DÉPRÉCIATIONS
// ============================================================================
const Tab3CBis: React.FC = () => {
  const theme = useTheme()
  const [lignes, setLignes] = useState<any[]>([])
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (liasseDataService.isLoaded()) {
      const data = liasseDataService.generateNote3CBis()
      setLignes(data)
      setHasData(data.length > 0)
    }
  }, [])

  const colonnes = [
    'Rubriques',
    'Dépréc. ouverture (A)',
    'Dotations (B)',
    'Reprises (C)',
    'Dépréc. clôture (D=A+B-C)'
  ]

  const totalValues = () => {
    const sums = [0, 0, 0, 0]
    lignes.forEach(l => {
      sums[0] += l.ouverture
      sums[1] += l.dotations
      sums[2] += l.reprises
      sums[3] += l.cloture
    })
    return sums
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3C BIS - Tableau des dépréciations
      </Typography>
      {!hasData && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
          Aucune dépréciation trouvée dans la balance. Importez une balance contenant des comptes 29x.
        </Alert>
      )}
      <TableActions tableName="Dépréciations" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 220 : 130 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((ligne, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell sx={{ fontWeight: 500 }}>{ligne.rubrique}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.ouverture)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.dotations)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.reprises)}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatMontant(ligne.cloture)}</TableCell>
              </TableRow>
            ))}
            {hasData && (
              <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                {totalValues().map((val, vi) => (
                  <TableCell key={vi} align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {formatMontant(val)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// TAB 3D - PLUS/MOINS-VALUES DE CESSIONS
// ============================================================================
const Tab3D: React.FC = () => {
  const theme = useTheme()

  const colonnes = [
    'Rubriques',
    'Montant brut (A)',
    'Amort. pratiqués (B)',
    'VCN (C=A-B)',
    'Prix cession (D)',
    'Plus/Moins-value (E=D-C)'
  ]

  // Plus/moins-values are manual - derived from actual cession operations
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3D - Plus ou moins-values de cessions d'immobilisations
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Les plus/moins-values de cession sont renseignées manuellement à partir des opérations de cession enregistrées durant l'exercice.
      </Alert>
      <TableActions tableName="Plus/Moins-values" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 220 : 120 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                Aucune cession d'immobilisation enregistrée. Utilisez le bouton «Ajouter» pour saisir les données.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// TAB 3E - RÉÉVALUATIONS
// ============================================================================
const Tab3E: React.FC = () => {
  const theme = useTheme()

  const colonnes = [
    'Éléments réévalués',
    'Coûts historiques',
    'Montants réévalués',
    'Écarts réévaluation',
    'Amort. supplémentaires'
  ]

  // Réévaluations are manual
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Note 3E - Tableau des réévaluations
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Les réévaluations sont renseignées manuellement. Aucune réévaluation enregistrée pour cet exercice.
      </Alert>
      <TableActions tableName="Réévaluations" showCalculate onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', minWidth: i === 0 ? 220 : 130 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                Aucune réévaluation enregistrée. Utilisez le bouton «Ajouter» pour saisir les données.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ============================================================================
// COMPOSANT PRINCIPAL NOTE 3
// ============================================================================
const Note3SYSCOHADA: React.FC<Note3Props> = ({ initialTab = 0 }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(initialTab)

  const tabLabels = [
    '3A - Immob. Brutes',
    '3B - Location-acquisition',
    '3C - Amortissements',
    '3C BIS - Dépréciations',
    '3D - Plus/Moins-values',
    '3E - Réévaluations'
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 3 - Immobilisations
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { minWidth: 100, fontSize: '0.8rem', fontWeight: 600 },
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          {tabLabels.map((label, i) => (
            <Tab key={i} label={label} id={`note3-tab-${i}`} aria-controls={`note3-tabpanel-${i}`} />
          ))}
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}><Tab3A /></TabPanel>
      <TabPanel value={tabValue} index={1}><Tab3B /></TabPanel>
      <TabPanel value={tabValue} index={2}><Tab3C /></TabPanel>
      <TabPanel value={tabValue} index={3}><Tab3CBis /></TabPanel>
      <TabPanel value={tabValue} index={4}><Tab3D /></TabPanel>
      <TabPanel value={tabValue} index={5}><Tab3E /></TabPanel>

      <CommentairesSection
        titre={`Commentaires et Observations - Note 3 (${tabLabels[tabValue]})`}
        noteId={`note3_${['a', 'b', 'c', 'cbis', 'd', 'e'][tabValue]}`}
        commentairesInitiaux={[]}
      />
    </Box>
  )
}

export default Note3SYSCOHADA
