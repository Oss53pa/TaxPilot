/**
 * Composants generiques pour les pages de supplements non encore implementees
 * (Suppl4-7, CompTva2, Note36Nomenclature)
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

interface SupplementConfig {
  titre: string
  sousTitre: string
  colonnes: string[]
  lignes: { ref: string; libelle: string }[]
}

const SUPPLEMENT_CONFIGS: Record<string, SupplementConfig> = {
  Suppl4: {
    titre: 'SUPPLEMENT 4',
    sousTitre: 'Etat des Amortissements Derogatoires',
    colonnes: ['Ref', 'Libelle', 'Dotations N', 'Reprises N', 'Cumul N', 'Cumul N-1'],
    lignes: [
      { ref: 'S4-01', libelle: 'Immobilisations incorporelles' },
      { ref: 'S4-02', libelle: 'Terrains' },
      { ref: 'S4-03', libelle: 'Constructions' },
      { ref: 'S4-04', libelle: 'Installations techniques' },
      { ref: 'S4-05', libelle: 'Materiel de transport' },
      { ref: 'S4-06', libelle: 'Materiel de bureau et informatique' },
      { ref: 'S4-07', libelle: 'Mobilier' },
      { ref: 'S4-08', libelle: 'Autres immobilisations corporelles' },
      { ref: 'S4-T', libelle: 'TOTAL' },
    ],
  },
  Suppl5: {
    titre: 'SUPPLEMENT 5',
    sousTitre: 'Etat des Plus-values et Moins-values de Cessions',
    colonnes: ['Ref', 'Designation du bien cede', 'Date cession', 'Prix cession', 'VNC', 'Plus-value', 'Moins-value'],
    lignes: [
      { ref: 'S5-01', libelle: 'Terrains' },
      { ref: 'S5-02', libelle: 'Constructions' },
      { ref: 'S5-03', libelle: 'Materiel et outillage' },
      { ref: 'S5-04', libelle: 'Materiel de transport' },
      { ref: 'S5-05', libelle: 'Mobilier et materiel de bureau' },
      { ref: 'S5-06', libelle: 'Titres de participation' },
      { ref: 'S5-07', libelle: 'Autres immobilisations' },
      { ref: 'S5-T', libelle: 'TOTAL' },
    ],
  },
  Suppl6: {
    titre: 'SUPPLEMENT 6',
    sousTitre: 'Etat des Provisions Reglementees',
    colonnes: ['Ref', 'Nature de la provision', 'Solde debut N', 'Dotations N', 'Reprises N', 'Solde fin N'],
    lignes: [
      { ref: 'S6-01', libelle: 'Provisions pour investissement' },
      { ref: 'S6-02', libelle: 'Provisions pour hausse des prix' },
      { ref: 'S6-03', libelle: 'Provisions speciales de reevaluation' },
      { ref: 'S6-04', libelle: 'Amortissements derogatoires' },
      { ref: 'S6-05', libelle: 'Provisions pour implantation a l\'etranger' },
      { ref: 'S6-06', libelle: 'Autres provisions reglementees' },
      { ref: 'S6-T', libelle: 'TOTAL' },
    ],
  },
  Suppl7: {
    titre: 'SUPPLEMENT 7',
    sousTitre: 'Etat des Deficits Reportables',
    colonnes: ['Ref', 'Exercice d\'origine', 'Montant initial', 'Impute en N', 'Reste a reporter', 'Delai restant'],
    lignes: [
      { ref: 'S7-01', libelle: 'Deficit N-5' },
      { ref: 'S7-02', libelle: 'Deficit N-4' },
      { ref: 'S7-03', libelle: 'Deficit N-3' },
      { ref: 'S7-04', libelle: 'Deficit N-2' },
      { ref: 'S7-05', libelle: 'Deficit N-1' },
      { ref: 'S7-06', libelle: 'Deficit N' },
      { ref: 'S7-T', libelle: 'TOTAL DEFICITS REPORTABLES' },
    ],
  },
  CompTva2: {
    titre: 'COMPLEMENT TVA (2)',
    sousTitre: 'Etat Detaille de la TVA Collectee et Deductible — Suite',
    colonnes: ['Ref', 'Libelle', 'Base HT', 'Taux', 'TVA N', 'TVA N-1'],
    lignes: [
      { ref: 'TV2-01', libelle: 'TVA collectee sur ventes de biens au taux normal' },
      { ref: 'TV2-02', libelle: 'TVA collectee sur prestations de services' },
      { ref: 'TV2-03', libelle: 'TVA collectee sur operations exonerees' },
      { ref: 'TV2-04', libelle: 'TVA sur livraisons a soi-meme' },
      { ref: 'TV2-05', libelle: 'TVA deductible sur immobilisations' },
      { ref: 'TV2-06', libelle: 'TVA deductible sur achats de biens et services' },
      { ref: 'TV2-07', libelle: 'Credit de TVA reportable' },
      { ref: 'TV2-08', libelle: 'TVA nette due / Credit de TVA' },
      { ref: 'TV2-T', libelle: 'TOTAL' },
    ],
  },
}

const GenericSupplementPage: React.FC<{ configKey: string }> = ({ configKey }) => {
  const theme = useTheme()
  const config = SUPPLEMENT_CONFIGS[configKey]

  if (!config) return null

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${P.primary200}`, borderRadius: 2 }}>
        {/* En-tete */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: '11px', color: P.primary400, mb: 0.5 }}>
            REPUBLIQUE DE COTE D'IVOIRE — Direction Generale des Impots
          </Typography>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: theme.palette.primary.main }}>
            {config.titre}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: P.primary500, mt: 0.5 }}>
            {config.sousTitre}
          </Typography>
        </Box>

        {/* Tableau DGI */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                {config.colonnes.map((col, i) => (
                  <TableCell
                    key={i}
                    align={i > 1 ? 'right' : 'left'}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {config.lignes.map((ligne, idx) => {
                const isTotal = ligne.libelle.includes('TOTAL')
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor: isTotal
                        ? theme.palette.grey[100]
                        : idx % 2 === 0
                        ? 'white'
                        : theme.palette.grey[50],
                      borderTop: isTotal ? `2px solid ${theme.palette.primary.main}` : undefined,
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: isTotal ? 700 : 400,
                        fontSize: '0.8rem',
                        border: `1px solid ${P.primary200}`,
                        color: P.primary500,
                        width: 60,
                      }}
                    >
                      {ligne.ref}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: isTotal ? 700 : 400,
                        fontSize: '0.85rem',
                        border: `1px solid ${P.primary200}`,
                      }}
                    >
                      {ligne.libelle}
                    </TableCell>
                    {config.colonnes.slice(2).map((_, colIdx) => (
                      <TableCell
                        key={colIdx}
                        align="right"
                        sx={{
                          fontWeight: isTotal ? 700 : 400,
                          fontSize: '0.85rem',
                          border: `1px solid ${P.primary200}`,
                          color: isTotal ? theme.palette.primary.main : 'inherit',
                          minWidth: 80,
                        }}
                      >
                        {/* Empty cell — ready for data entry */}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

// Factory exports
export const Suppl4 = () => <GenericSupplementPage configKey="Suppl4" />
export const Suppl5 = () => <GenericSupplementPage configKey="Suppl5" />
export const Suppl6 = () => <GenericSupplementPage configKey="Suppl6" />
export const Suppl7 = () => <GenericSupplementPage configKey="Suppl7" />
export const CompTva2 = () => <GenericSupplementPage configKey="CompTva2" />

export default GenericSupplementPage
