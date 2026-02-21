/**
 * Composants generiques pour les pages de garde non encore implementees
 * (GardeDgiIns, GardeBic, GardeBnc, GardeBa, Garde301, Garde302, Garde3)
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
  TableRow,
  TextField,
  useTheme,
} from '@mui/material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

interface GardeConfig {
  titre: string
  sousTitre: string
  champs: { label: string; largeur?: string }[]
}

const GARDE_CONFIGS: Record<string, GardeConfig> = {
  GardeDgiIns: {
    titre: 'GARDE DGI-INS',
    sousTitre: 'Direction Generale des Impots / Institut National de la Statistique',
    champs: [
      { label: 'Raison sociale' },
      { label: 'Sigle ou enseigne commerciale' },
      { label: 'Forme juridique' },
      { label: 'N° RCCM' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'N° Centre des impots' },
      { label: 'Code activite (APE)' },
      { label: 'Adresse du siege social' },
      { label: 'Telephone / Fax / Email' },
      { label: 'Exercice fiscal (du ... au ...)' },
      { label: 'Regime d\'imposition' },
      { label: 'Date de creation de l\'entreprise' },
    ],
  },
  GardeBic: {
    titre: 'GARDE BIC',
    sousTitre: 'Benefices Industriels et Commerciaux',
    champs: [
      { label: 'Raison sociale' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'N° RCCM' },
      { label: 'Forme juridique' },
      { label: 'Activite principale exercee' },
      { label: 'Adresse du siege social' },
      { label: 'Exercice fiscal (du ... au ...)' },
      { label: 'Regime d\'imposition' },
      { label: 'Chiffre d\'affaires HT declare' },
      { label: 'Resultat fiscal' },
    ],
  },
  GardeBnc: {
    titre: 'GARDE BNC',
    sousTitre: 'Benefices Non Commerciaux',
    champs: [
      { label: 'Nom et prenoms / Raison sociale' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'Profession exercee' },
      { label: 'Adresse du cabinet / siege' },
      { label: 'N° d\'inscription a l\'Ordre' },
      { label: 'Exercice fiscal (du ... au ...)' },
      { label: 'Regime d\'imposition' },
      { label: 'Recettes encaissees' },
      { label: 'Depenses professionnelles' },
      { label: 'Benefice net' },
    ],
  },
  GardeBa: {
    titre: 'GARDE BA',
    sousTitre: 'Benefices Agricoles',
    champs: [
      { label: 'Raison sociale / Exploitant' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'Nature de l\'exploitation' },
      { label: 'Localisation de l\'exploitation' },
      { label: 'Superficie exploitee (ha)' },
      { label: 'Exercice fiscal (du ... au ...)' },
      { label: 'Regime d\'imposition' },
      { label: 'Chiffre d\'affaires agricole' },
      { label: 'Resultat d\'exploitation' },
    ],
  },
  Garde301: {
    titre: 'GARDE ETAT 301',
    sousTitre: 'Etat des Honoraires, Commissions, Courtages, Ristournes et Remises',
    champs: [
      { label: 'Raison sociale du declarant' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'Adresse' },
      { label: 'Exercice fiscal' },
      { label: 'Nombre de beneficiaires declares' },
      { label: 'Montant total des sommes versees' },
      { label: 'Montant total des retenues' },
      { label: 'Date d\'etablissement' },
      { label: 'Cachet et signature' },
    ],
  },
  Garde302: {
    titre: 'GARDE ETAT 302',
    sousTitre: 'Etat des Fournisseurs',
    champs: [
      { label: 'Raison sociale du declarant' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'Adresse' },
      { label: 'Exercice fiscal' },
      { label: 'Nombre de fournisseurs declares' },
      { label: 'Montant total des achats declares' },
      { label: 'Seuil de declaration' },
      { label: 'Date d\'etablissement' },
      { label: 'Cachet et signature' },
    ],
  },
  Garde3: {
    titre: 'GARDE CONSOLIDATION',
    sousTitre: 'Page de Garde — Comptes Consolides',
    champs: [
      { label: 'Denomination de la societe mere' },
      { label: 'N° RCCM' },
      { label: 'N° Compte contribuable (NCC)' },
      { label: 'Forme juridique du groupe' },
      { label: 'Adresse du siege social' },
      { label: 'Nombre de filiales consolidees' },
      { label: 'Methode de consolidation' },
      { label: 'Exercice fiscal (du ... au ...)' },
      { label: 'Date d\'arrete des comptes consolides' },
      { label: 'Commissaire aux comptes du groupe' },
    ],
  },
}

const GenericGardePage: React.FC<{ configKey: string }> = ({ configKey }) => {
  const theme = useTheme()
  const config = GARDE_CONFIGS[configKey]

  if (!config) return null

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${P.primary200}`, borderRadius: 2 }}>
        {/* En-tete officiel */}
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

        {/* Tableau des champs */}
        <TableContainer>
          <Table size="small">
            <TableBody>
              {config.champs.map((champ, idx) => (
                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] } }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      width: '40%',
                      border: `1px solid ${P.primary200}`,
                      color: P.primary700,
                    }}
                  >
                    {champ.label}
                  </TableCell>
                  <TableCell sx={{ border: `1px solid ${P.primary200}`, p: 0.5 }}>
                    <TextField
                      size="small"
                      fullWidth
                      variant="standard"
                      placeholder="..."
                      InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem', px: 1 } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pied de page */}
        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${P.primary200}`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: P.primary400 }}>
            Cadre reserve a l'administration — Date de reception : ____/____/________ — Cachet et visa
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

// Factory exports
export const GardeDgiIns = () => <GenericGardePage configKey="GardeDgiIns" />
export const GardeBic = () => <GenericGardePage configKey="GardeBic" />
export const GardeBnc = () => <GenericGardePage configKey="GardeBnc" />
export const GardeBa = () => <GenericGardePage configKey="GardeBa" />
export const Garde301 = () => <GenericGardePage configKey="Garde301" />
export const Garde302 = () => <GenericGardePage configKey="Garde302" />
export const Garde3 = () => <GenericGardePage configKey="Garde3" />

export default GenericGardePage
