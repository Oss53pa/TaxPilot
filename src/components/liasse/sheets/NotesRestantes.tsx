/**
 * Composant générique pour les notes restantes et sous-notes
 * Gère les notes simples (4-39) et sous-notes (8A-8C, 15A-15B, 16A-16C, 27A-27B)
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material'
import { Construction } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

interface NoteRestanteProps {
  numeroNote: number | string
  titre: string
  description: string
  contenuPrevu: string[]
  priorite: 'haute' | 'moyenne' | 'basse'
  datePrevisionnelle?: string
}

const formatMontant = (montant: number) => montant === 0 ? '-' : montant.toLocaleString('fr-FR') + ' FCFA'

// ============================================================================
// SUB-NOTE TABLE COMPONENTS
// ============================================================================

/** Note 8A - Étalement charges immobilisées */
const Note8ATable: React.FC = () => {
  const theme = useTheme()
  const exercices = ['2018', '2019', '2020', '2021', '2022', '2023', '2024']
  const colonnes = ['Exercice', 'Frais d\'établissement', 'Charges à répartir', 'Primes obligations']

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 8A - Étalement des charges immobilisées</Typography>
      <TableActions tableName="Charges immobilisées" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600 }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {exercices.map((ex, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell sx={{ fontWeight: 500 }}>{ex}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 8B - Étalement provisions (charges) */
const Note8BTable: React.FC = () => {
  const theme = useTheme()
  const exercices = ['2018', '2019', '2020', '2021', '2022', '2023', '2024']

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 8B - Étalement des provisions pour charges</Typography>
      <TableActions tableName="Provisions charges" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Exercice</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercices.map((ex, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell sx={{ fontWeight: 500 }}>{ex}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 8C - Étalement provisions (risques) */
const Note8CTable: React.FC = () => {
  const theme = useTheme()
  const exercices = ['2018', '2019', '2020', '2021', '2022', '2023', '2024']

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 8C - Étalement des provisions pour risques</Typography>
      <TableActions tableName="Provisions risques" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Exercice</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercices.map((ex, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell sx={{ fontWeight: 500 }}>{ex}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 15A - Subventions et provisions réglementées */
const Note15ATable: React.FC = () => {
  const theme = useTheme()
  const colonnes = ['Libellés', 'Note', 'Année N', 'Année N-1', 'Variation', '%', 'Régime fiscal', 'Échéances']

  const subventions = [
    'État', 'Régions', 'Départements', 'Communes', 'Établissements publics',
    'Organisations internationales', 'Entreprises publiques', 'Autres'
  ]
  const provisions = [
    'Plus-values réinvesties', 'Amortissements dérogatoires', 'Provisions spéciales réévaluation',
    'Provisions réglementées relatives aux immobilisations', 'Provisions pour investissement',
    'Provisions pour hausse des prix', 'Autres provisions réglementées'
  ]

  const renderSection = (title: string, items: string[]) => (
    <>
      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
        <TableCell colSpan={8} sx={{ fontWeight: 700 }}>{title}</TableCell>
      </TableRow>
      {items.map((item, idx) => (
        <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
          <TableCell sx={{ pl: 3 }}>{item}</TableCell>
          <TableCell align="center">-</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">-</TableCell>
          <TableCell align="center">-</TableCell>
          <TableCell align="center">-</TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 15A - Subventions et provisions réglementées</Typography>
      <TableActions tableName="Subventions / Provisions réglementées" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i <= 1 ? 'left' : i >= 6 ? 'center' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderSection('SUBVENTIONS D\'INVESTISSEMENT', subventions)}
            {renderSection('PROVISIONS RÉGLEMENTÉES', provisions)}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL GÉNÉRAL</TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 15B - Autres fonds propres */
const Note15BTable: React.FC = () => {
  const theme = useTheme()
  const colonnes = ['Libellés', 'Note', 'Année N', 'Année N-1', 'Variation', '%', 'Échéances']
  const lignes = ['Titres participatifs', 'Avances conditionnées', 'TSDI', 'ORA', 'Autres fonds propres']

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 15B - Autres fonds propres</Typography>
      <TableActions tableName="Autres fonds propres" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i <= 1 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((item, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell>{item}</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">-</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 16A - Dettes financières */
const Note16ATable: React.FC = () => {
  const theme = useTheme()
  const colonnes = ['Libellés', 'Année N', 'Année N-1', 'Variation', '%', 'Dettes <=1an', '1-2 ans', '>2 ans']

  const emprunts = [
    'Emprunts obligataires', 'Emprunts et dettes auprès des EC', 'Emprunts et dettes financières diverses',
    'Fournisseurs d\'investissements', 'Intérêts courus', 'Dettes rattachées à des participations',
    'Dépôts et cautionnements reçus', 'Avances en comptes courants', 'Autres dettes financières', 'Concours bancaires courants'
  ]
  const locationAcq = [
    'Dettes de location-acquisition immobilière', 'Dettes de location-acquisition mobilière',
    'Dettes de location-vente', 'Redevances crédit-bail restant à payer', 'Autres'
  ]
  const provisionsRisques = [
    'Provisions pour litiges', 'Provisions pour garanties', 'Provisions pour pertes de change',
    'Provisions pour pensions et obligations', 'Provisions pour impôts', 'Provisions pour renouvellement des immobilisations',
    'Provisions pour gros entretien', 'Provisions pour charges à répartir', 'Provisions pour restructuration',
    'Autres provisions pour risques et charges', 'Provisions financières pour risques et charges', 'Provisions réglementées'
  ]

  const renderSection = (title: string, items: string[]) => (
    <>
      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
        <TableCell colSpan={8} sx={{ fontWeight: 700 }}>{title}</TableCell>
      </TableRow>
      {items.map((item, idx) => (
        <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
          <TableCell sx={{ pl: 3, fontSize: '0.8rem' }}>{item}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">-</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
          <TableCell align="right">{formatMontant(0)}</TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 16A - Dettes financières et ressources assimilées</Typography>
      <TableActions tableName="Dettes financières" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem', minWidth: i === 0 ? 200 : 80 }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderSection('EMPRUNTS ET DETTES FINANCIÈRES', emprunts)}
            {renderSection('DETTES DE LOCATION-ACQUISITION', locationAcq)}
            {renderSection('PROVISIONS POUR RISQUES ET CHARGES', provisionsRisques)}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL GÉNÉRAL</TableCell>
              {[...Array(7)].map((_, i) => (
                <TableCell key={i} align="right" sx={{ fontWeight: 700 }}>{i === 3 ? '-' : formatMontant(0)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 16B - Engagements retraite (hypothèses) */
const Note16BTable: React.FC = () => {
  const theme = useTheme()

  const hypotheses = [
    'Taux d\'actualisation', 'Taux d\'augmentation des salaires', 'Taux de rendement attendu des actifs',
    'Taux de rotation du personnel', 'Âge de départ à la retraite', 'Table de mortalité utilisée'
  ]
  const variations = [
    'Engagement d\'ouverture', 'Coût des services rendus', 'Charge d\'intérêts',
    'Cotisations des participants', 'Modifications de régime', 'Écarts actuariels', 'Engagement de clôture'
  ]
  const sensibilite = [
    'Impact d\'une variation de +0,5% du taux d\'actualisation',
    'Impact d\'une variation de -0,5% du taux d\'actualisation',
    'Impact d\'une variation de +0,5% du taux de progression des salaires'
  ]

  const renderSubTable = (title: string, items: string[], cols: string[]) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              {cols.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item}</TableCell>
                <TableCell align="right">-</TableCell>
                {cols.length > 2 && <TableCell align="right">-</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 16B - Engagements de retraite (hypothèses actuarielles)</Typography>
      {renderSubTable('Hypothèses actuarielles', hypotheses, ['Hypothèses', 'Année N', 'Année N-1'])}
      {renderSubTable('Variation de l\'engagement', variations, ['Éléments', 'Année N', 'Année N-1'])}
      {renderSubTable('Analyse de sensibilité', sensibilite, ['Scénario', 'Impact'])}
    </Box>
  )
}

/** Note 16B BIS - Engagements retraite (actif/passif) */
const Note16BBisTable: React.FC = () => {
  const theme = useTheme()

  const actifPassif = ['Engagement total', 'Juste valeur des actifs du régime', 'Actif/passif net comptabilisé']
  const valeursActifs = ['Actions', 'Obligations', 'Immobilier', 'Autres actifs']

  const renderSubTable = (title: string, items: string[], cols: string[]) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              {cols.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 16B BIS - Engagements de retraite (actif/passif)</Typography>
      {renderSubTable('Actif / Passif net', actifPassif, ['Éléments', 'Année N', 'Année N-1'])}
      {renderSubTable('Valeur actuelle des actifs', valeursActifs, ['Catégorie d\'actifs', 'Année N', 'Année N-1'])}
    </Box>
  )
}

/** Note 16C - Actifs et passifs éventuels */
const Note16CTable: React.FC = () => {
  const theme = useTheme()
  const emptyRows = Array.from({ length: 8 }, (_, i) => i)

  const renderSection = (title: string) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Montant estimé</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Observations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emptyRows.map((idx) => (
              <TableRow key={idx}>
                <TableCell>-</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 16C - Actifs et passifs éventuels</Typography>
      {renderSection('ACTIFS ÉVENTUELS')}
      {renderSection('PASSIFS ÉVENTUELS')}
    </Box>
  )
}

/** Note 27A - Charges de personnel */
const Note27ATable: React.FC = () => {
  const theme = useTheme()
  const colonnes = ['Libellés', 'Année N', 'Année N-1', 'Variation %']

  const lignes = [
    'Rémunérations nationales', 'Rémunérations non nationales', 'Indemnités de fin de contrat',
    'Charges sociales nationales', 'Charges sociales non nationales', 'Rémunérations de l\'exploitant',
    'Personnel extérieur', 'Autres charges de personnel'
  ]

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 27A - Charges de personnel</Typography>
      <TableActions tableName="Charges de personnel" onSave={() => {}} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {colonnes.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ color: 'white', fontWeight: 600 }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((item, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? theme.palette.grey[50] : 'inherit' }}>
                <TableCell>{item}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">{formatMontant(0)}</TableCell>
                <TableCell align="right">-</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/** Note 27B - Effectifs et masse salariale */
const Note27BTable: React.FC = () => {
  const theme = useTheme()

  const qualifications = ['Cadres', 'Agents de maîtrise', 'Employés', 'Ouvriers']
  const colsEffectifs = ['Qualification', 'Nationaux M', 'Nationaux F', 'Autres États M', 'Autres États F', 'Hors Région M', 'Hors Région F', 'Total', 'Masse salariale']

  const renderGrid = (title: string) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              {colsEffectifs.map((col, i) => (
                <TableCell key={i} align={i === 0 ? 'left' : 'right'} sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {qualifications.map((q, idx) => (
              <TableRow key={idx}>
                <TableCell>{q}</TableCell>
                {[...Array(8)].map((_, i) => (
                  <TableCell key={i} align="right">{i === 7 ? formatMontant(0) : '0'}</TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              {[...Array(8)].map((_, i) => (
                <TableCell key={i} align="right" sx={{ fontWeight: 700 }}>{i === 7 ? formatMontant(0) : '0'}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note 27B - Effectifs et masse salariale</Typography>
      {renderGrid('PERSONNEL PERMANENT')}
      {renderGrid('PERSONNEL EXTÉRIEUR')}
    </Box>
  )
}

// ============================================================================
// SUB-NOTE RENDERING MAP
// ============================================================================
const SUB_NOTE_COMPONENTS: { [key: string]: React.FC } = {
  '8a': Note8ATable,
  '8b': Note8BTable,
  '8c': Note8CTable,
  '15a': Note15ATable,
  '15b': Note15BTable,
  '16a': Note16ATable,
  '16b': Note16BTable,
  '16b_bis': Note16BBisTable,
  '16c': Note16CTable,
  '27a': Note27ATable,
  '27b': Note27BTable,
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const NotesRestantes: React.FC<NoteRestanteProps> = ({
  numeroNote,
  titre,
  description,
  contenuPrevu,
}) => {
  const theme = useTheme()
  const noteKey = String(numeroNote).toLowerCase()

  // If there's a specialized sub-note table component, render it
  const SubNoteComponent = SUB_NOTE_COMPONENTS[noteKey]
  if (SubNoteComponent) {
    return (
      <Box sx={{ p: 3 }}>
        <SubNoteComponent />
        <CommentairesSection
          titre={`Commentaires - Note ${String(numeroNote).toUpperCase()}`}
          noteId={`note${noteKey}`}
          commentairesInitiaux={[]}
        />
      </Box>
    )
  }

  // Default: generic note display
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note {numeroNote} - {titre}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }} icon={<Construction />}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Note en cours de développement
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contenu prévu
              </Typography>
              <ul>
                {contenuPrevu.map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CommentairesSection
        titre={`Commentaires et Observations - Note ${numeroNote}`}
        noteId={`note${numeroNote}`}
        commentairesInitiaux={[]}
      />
    </Box>
  )
}

// ============================================================================
// NOTES CONFIGS with correct Excel titles
// ============================================================================
export const NOTES_CONFIGS: { [key: string]: NoteRestanteProps } = {
  note4: {
    numeroNote: 4,
    titre: 'Immobilisations financières',
    description: 'Détail des titres de participation, créances rattachées, prêts et dépôts.',
    contenuPrevu: [
      'Titres de participation',
      'Créances rattachées à des participations',
      'Autres titres immobilisés',
      'Prêts accordés aux tiers',
      'Dépôts et cautionnements versés'
    ],
    priorite: 'haute',
  },
  note5: {
    numeroNote: 5,
    titre: 'Actif circulant et dettes circulantes HAO',
    description: 'Actif circulant hors activités ordinaires et dettes circulantes HAO.',
    contenuPrevu: ['Créances HAO', 'Dettes HAO', 'Stocks HAO'],
    priorite: 'moyenne',
  },
  note6: {
    numeroNote: 6,
    titre: 'Stocks et en-cours',
    description: 'Détail des stocks de marchandises, matières premières et en-cours.',
    contenuPrevu: ['Marchandises', 'Matières premières', 'Produits finis', 'En-cours de production'],
    priorite: 'haute',
  },
  note7: {
    numeroNote: 7,
    titre: 'Clients',
    description: 'Créances clients et comptes rattachés.',
    contenuPrevu: ['Clients', 'Clients douteux', 'Effets à recevoir', 'Provisions pour créances douteuses'],
    priorite: 'haute',
  },
  note9: {
    numeroNote: 9,
    titre: 'Titres de placement',
    description: 'Titres de placement et valeurs mobilières à court terme.',
    contenuPrevu: ['Actions', 'Obligations', 'Bons du Trésor', 'Autres titres de placement'],
    priorite: 'moyenne',
  },
  note10: {
    numeroNote: 10,
    titre: 'Valeurs à encaisser',
    description: 'Chèques et effets à encaisser.',
    contenuPrevu: ['Chèques à encaisser', 'Effets à l\'encaissement', 'Effets à l\'escompte'],
    priorite: 'moyenne',
  },
  note12: {
    numeroNote: 12,
    titre: 'Écarts de conversion et transferts de charges',
    description: 'Écarts de conversion actif/passif et transferts de charges.',
    contenuPrevu: ['Écarts de conversion - Actif', 'Écarts de conversion - Passif', 'Transferts de charges'],
    priorite: 'moyenne',
  },
  note13: {
    numeroNote: 13,
    titre: 'Capital',
    description: 'Capital social, apporteurs et associés.',
    contenuPrevu: ['Capital social', 'Actionnaires', 'Comptes courants d\'associés', 'Mouvements de capital'],
    priorite: 'haute',
  },
  note18: {
    numeroNote: 18,
    titre: 'Dettes fiscales et sociales',
    description: 'Dettes envers l\'État et les organismes sociaux.',
    contenuPrevu: ['TVA collectée', 'Impôt sur les bénéfices', 'Charges sociales', 'Autres impôts et taxes'],
    priorite: 'haute',
  },
  note20: {
    numeroNote: 20,
    titre: 'Banques, crédit d\'escompte et trésorerie',
    description: 'Soldes bancaires et trésorerie.',
    contenuPrevu: ['Banques comptes courants', 'CCP', 'Caisse', 'Crédits d\'escompte', 'Régies d\'avances'],
    priorite: 'haute',
  },
  note21: {
    numeroNote: 21,
    titre: 'Chiffre d\'affaires et autres produits',
    description: 'Détail du chiffre d\'affaires et autres produits d\'exploitation.',
    contenuPrevu: ['Ventes de marchandises', 'Production vendue', 'Prestations de services', 'Autres produits'],
    priorite: 'haute',
  },
  note22: {
    numeroNote: 22,
    titre: 'Achats',
    description: 'Achats de marchandises et matières premières.',
    contenuPrevu: ['Achats de marchandises', 'Achats de matières premières', 'Variation de stocks', 'Achats stockés'],
    priorite: 'haute',
  },
  note23: {
    numeroNote: 23,
    titre: 'Transports',
    description: 'Transports de biens et de personnel.',
    contenuPrevu: ['Transport sur achats', 'Transport sur ventes', 'Transport du personnel', 'Autres frais de transport'],
    priorite: 'moyenne',
  },
  note24: {
    numeroNote: 24,
    titre: 'Services extérieurs',
    description: 'Loyers, entretien, assurances et autres services extérieurs.',
    contenuPrevu: ['Loyers et charges locatives', 'Entretien et réparations', 'Primes d\'assurance', 'Études et recherches'],
    priorite: 'moyenne',
  },
  note25: {
    numeroNote: 25,
    titre: 'Impôts et taxes',
    description: 'Impôts, taxes et versements assimilés.',
    contenuPrevu: ['Impôts fonciers', 'Patente', 'Taxes sur salaires', 'Autres impôts et taxes'],
    priorite: 'haute',
  },
  note26: {
    numeroNote: 26,
    titre: 'Autres charges',
    description: 'Autres charges d\'exploitation.',
    contenuPrevu: ['Charges diverses', 'Pertes sur créances irrécouvrables', 'Charges exceptionnelles'],
    priorite: 'moyenne',
  },
  note28: {
    numeroNote: 28,
    titre: 'Dotations provisions et dépréciations',
    description: 'Dotations aux provisions et dépréciations d\'exploitation.',
    contenuPrevu: ['Dotations aux amortissements', 'Dotations aux provisions', 'Dotations aux dépréciations'],
    priorite: 'haute',
  },
  note29: {
    numeroNote: 29,
    titre: 'Charges et revenus financiers',
    description: 'Charges et produits financiers.',
    contenuPrevu: ['Intérêts des emprunts', 'Pertes de change', 'Intérêts reçus', 'Gains de change'],
    priorite: 'haute',
  },
  note30: {
    numeroNote: 30,
    titre: 'Autres charges et produits HAO',
    description: 'Charges et produits hors activités ordinaires.',
    contenuPrevu: ['Charges HAO', 'Produits HAO', 'Plus/moins-values de cession HAO'],
    priorite: 'moyenne',
  },
  note31: {
    numeroNote: 31,
    titre: 'Répartition du résultat',
    description: 'Répartition du résultat de l\'exercice.',
    contenuPrevu: ['Résultat net', 'Réserve légale', 'Dividendes', 'Report à nouveau'],
    priorite: 'haute',
  },
  note32: {
    numeroNote: 32,
    titre: 'Production de l\'exercice',
    description: 'Production immobilisée et stockée.',
    contenuPrevu: ['Production immobilisée', 'Production stockée', 'Variation de stocks de produits'],
    priorite: 'moyenne',
  },
  note33: {
    numeroNote: 33,
    titre: 'Achats destinés à la production',
    description: 'Achats de matières et fournitures destinés à la production.',
    contenuPrevu: ['Matières premières', 'Fournitures', 'Emballages', 'Variation de stocks'],
    priorite: 'moyenne',
  },
  note34: {
    numeroNote: 34,
    titre: 'Fiche synthèse indicateurs financiers',
    description: 'Synthèse des principaux indicateurs financiers.',
    contenuPrevu: ['Ratios de rentabilité', 'Ratios de liquidité', 'Ratios d\'endettement', 'Ratios d\'activité'],
    priorite: 'moyenne',
  },
  note35: {
    numeroNote: 35,
    titre: 'Informations sociales, environnementales',
    description: 'Informations sociales, environnementales et sociétales.',
    contenuPrevu: ['Effectifs', 'Formation', 'Égalité professionnelle', 'Impact environnemental'],
    priorite: 'basse',
  },
  note37: {
    numeroNote: 37,
    titre: 'Détermination impôts sur le résultat',
    description: 'Calcul et détermination des impôts sur le résultat.',
    contenuPrevu: ['Résultat comptable', 'Réintégrations', 'Déductions', 'Résultat fiscal', 'Impôt calculé'],
    priorite: 'haute',
  },
  note38: {
    numeroNote: 38,
    titre: 'Événements postérieurs à la clôture',
    description: 'Événements survenus après la date de clôture.',
    contenuPrevu: ['Événements significatifs', 'Impact sur les comptes', 'Mesures prises'],
    priorite: 'moyenne',
  },
  note39: {
    numeroNote: 39,
    titre: 'Changements de méthodes comptables',
    description: 'Changements de méthodes comptables et corrections d\'erreurs.',
    contenuPrevu: ['Nature du changement', 'Justification', 'Impact sur les comptes', 'Information comparative'],
    priorite: 'moyenne',
  },
  // Sub-notes configs
  note8a: {
    numeroNote: '8a',
    titre: 'Étalement charges immobilisées',
    description: 'Étalement des charges immobilisées par exercice.',
    contenuPrevu: ['Frais d\'établissement', 'Charges à répartir', 'Primes obligations'],
    priorite: 'moyenne',
  },
  note8b: {
    numeroNote: '8b',
    titre: 'Étalement provisions (charges)',
    description: 'Étalement des provisions pour charges par exercice.',
    contenuPrevu: ['Provisions par exercice', 'Total provisions charges'],
    priorite: 'moyenne',
  },
  note8c: {
    numeroNote: '8c',
    titre: 'Étalement provisions (risques)',
    description: 'Étalement des provisions pour risques par exercice.',
    contenuPrevu: ['Provisions par exercice', 'Total provisions risques'],
    priorite: 'moyenne',
  },
  note15a: {
    numeroNote: '15a',
    titre: 'Subventions et provisions réglementées',
    description: 'Subventions d\'investissement et provisions réglementées.',
    contenuPrevu: ['Subventions par source', 'Provisions réglementées par type'],
    priorite: 'haute',
  },
  note15b: {
    numeroNote: '15b',
    titre: 'Autres fonds propres',
    description: 'Titres participatifs, avances conditionnées, TSDI, ORA.',
    contenuPrevu: ['Titres participatifs', 'Avances conditionnées', 'TSDI', 'ORA'],
    priorite: 'moyenne',
  },
  note16a: {
    numeroNote: '16a',
    titre: 'Dettes financières',
    description: 'Emprunts, location-acquisition et provisions financières.',
    contenuPrevu: ['Emprunts', 'Location-acquisition', 'Provisions pour risques'],
    priorite: 'haute',
  },
  note16b: {
    numeroNote: '16b',
    titre: 'Engagements retraite (hypothèses)',
    description: 'Hypothèses actuarielles et variation de l\'engagement.',
    contenuPrevu: ['Hypothèses actuarielles', 'Variation engagement', 'Analyse sensibilité'],
    priorite: 'moyenne',
  },
  note16b_bis: {
    numeroNote: '16b_bis',
    titre: 'Engagements retraite (actif/passif)',
    description: 'Actif/passif net et valeur actuelle des actifs.',
    contenuPrevu: ['Actif/passif net', 'Valeur actuelle actifs'],
    priorite: 'moyenne',
  },
  note16c: {
    numeroNote: '16c',
    titre: 'Actifs et passifs éventuels',
    description: 'Actifs et passifs éventuels.',
    contenuPrevu: ['Actifs éventuels', 'Passifs éventuels'],
    priorite: 'moyenne',
  },
  note27a: {
    numeroNote: '27a',
    titre: 'Charges de personnel',
    description: 'Détail des rémunérations et charges sociales.',
    contenuPrevu: ['Rémunérations', 'Charges sociales', 'Personnel extérieur'],
    priorite: 'haute',
  },
  note27b: {
    numeroNote: '27b',
    titre: 'Effectifs et masse salariale',
    description: 'Effectifs par qualification et masse salariale.',
    contenuPrevu: ['Effectifs par catégorie', 'Répartition H/F', 'Masse salariale'],
    priorite: 'haute',
  },
}

// Factory function
export const createNoteComponent = (config: NoteRestanteProps) => {
  return () => <NotesRestantes {...config} />
}

// Individual note component exports
export const Note4SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note4)
export const Note7SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note7)
export const Note9SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note9)
export const Note10SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note10)

export default NotesRestantes