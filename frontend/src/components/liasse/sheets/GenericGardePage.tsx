/**
 * Composants generiques pour les pages de garde
 * (GardeDgiIns, GardeBic, GardeBnc, GardeBa, Garde301, Garde302, Garde3)
 * Auto-remplis depuis les parametres entreprise via withBackendData
 */

import React from 'react'
import { useRegimeImposition } from '@/config/regimeContext'
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
  Chip,
  useTheme,
} from '@mui/material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// 18 pays OHADA avec nom officiel
const PAYS_OHADA_NOMS: Record<string, string> = {
  BJ: 'REPUBLIQUE DU BENIN',
  BF: 'BURKINA FASO',
  CM: 'REPUBLIQUE DU CAMEROUN',
  CF: 'REPUBLIQUE CENTRAFRICAINE',
  KM: 'UNION DES COMORES',
  CG: 'REPUBLIQUE DU CONGO',
  CI: "REPUBLIQUE DE COTE D'IVOIRE",
  DJ: 'REPUBLIQUE DE DJIBOUTI',
  GA: 'REPUBLIQUE GABONAISE',
  GN: 'REPUBLIQUE DE GUINEE',
  GW: 'REPUBLIQUE DE GUINEE-BISSAU',
  GQ: 'REPUBLIQUE DE GUINEE EQUATORIALE',
  ML: 'REPUBLIQUE DU MALI',
  NE: 'REPUBLIQUE DU NIGER',
  CD: 'REPUBLIQUE DEMOCRATIQUE DU CONGO',
  SN: 'REPUBLIQUE DU SENEGAL',
  TD: 'REPUBLIQUE DU TCHAD',
  TG: 'REPUBLIQUE TOGOLAISE',
}

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
    sousTitre: 'Page de Garde \u2014 Comptes Consolides',
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

// Regime labels for display
const REGIME_DISPLAY: Record<string, string> = {
  REEL_NORMAL: 'Reel Normal',
  REEL_SIMPLIFIE: 'Reel Simplifie',
  FORFAITAIRE: 'Forfaitaire',
  MICRO: 'Micro-entreprise',
}

function formatDateFR(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatExercice(ent: any): string {
  if (!ent?.exercice_debut && !ent?.exercice_fin) return ''
  return `Du ${formatDateFR(ent.exercice_debut) || '...'} au ${formatDateFR(ent.exercice_fin) || '...'}`
}

// Resolves a field label to a value from entreprise data
function resolveField(label: string, ent: any, regimeOverride?: string): string {
  if (!ent) return ''

  // Common fields shared across most garde pages
  const normalizedLabel = label.toLowerCase()

  if (normalizedLabel.includes('raison sociale') || normalizedLabel.includes('denomination de la societe mere'))
    return ent.raison_sociale || ''

  if (normalizedLabel === 'sigle ou enseigne commerciale')
    return ent.sigle || ''

  if (normalizedLabel === 'forme juridique' || normalizedLabel === 'forme juridique du groupe')
    return ent.forme_juridique || ''

  if (normalizedLabel.includes('rccm'))
    return ent.rccm || ''

  if (normalizedLabel.includes('compte contribuable') || normalizedLabel.includes('ncc'))
    return ent.numero_contribuable || ''

  if (normalizedLabel.includes('centre des impots'))
    return ent.centre_impots || ''

  if (normalizedLabel.includes('code activite') || normalizedLabel.includes('ape'))
    return ent.code_ape || ''

  if (normalizedLabel.includes('adresse du siege') || normalizedLabel.includes('adresse du cabinet'))
    return [ent.adresse_ligne1 || ent.adresse, ent.ville].filter(Boolean).join(', ') || ''

  if (normalizedLabel === 'adresse')
    return [ent.adresse_ligne1 || ent.adresse, ent.ville].filter(Boolean).join(', ') || ''

  if (normalizedLabel.includes('telephone') || normalizedLabel.includes('fax') || normalizedLabel.includes('email')) {
    const parts = [ent.telephone, ent.email].filter(Boolean)
    return parts.join(' / ') || ''
  }

  if (normalizedLabel.includes('exercice fiscal'))
    return formatExercice(ent)

  if (normalizedLabel.includes('regime d\'imposition') || normalizedLabel.includes('regime d\'imposition'))
    return REGIME_DISPLAY[regimeOverride || ''] || REGIME_DISPLAY[ent.regime_imposition] || ent.regime_imposition || ''

  if (normalizedLabel.includes('date de creation'))
    return formatDateFR(ent.date_creation_entreprise) || ''

  if (normalizedLabel.includes('activite principale') || normalizedLabel.includes('profession exercee') || normalizedLabel.includes('nature de l\'exploitation'))
    return ent.secteur_activite || ent.branche_activite || ''

  if (normalizedLabel.includes('localisation de l\'exploitation'))
    return [ent.adresse_ligne1 || ent.adresse, ent.ville].filter(Boolean).join(', ') || ''

  if (normalizedLabel.includes('chiffre d\'affaires'))
    return ent.chiffre_affaires_annuel ? Number(ent.chiffre_affaires_annuel).toLocaleString('fr-FR') : ''

  if (normalizedLabel.includes('commissaire aux comptes du groupe'))
    return ent.cac_nom || ''

  if (normalizedLabel.includes('inscription a l\'ordre'))
    return ent.expert_numero_inscription || ''

  if (normalizedLabel.includes('nombre de filiales'))
    return ent.participations_filiales?.length?.toString() || ''

  return ''
}

const GenericGardePage: React.FC<{ configKey: string; entreprise?: any }> = ({ configKey, entreprise }) => {
  const theme = useTheme()
  const ctxRegime = useRegimeImposition()
  const config = GARDE_CONFIGS[configKey]

  if (!config) return null

  // Derive country name from entreprise
  const paysNom = entreprise?.pays
    ? (PAYS_OHADA_NOMS[entreprise.pays] || entreprise.pays)
    : ''
  const headerText = paysNom
    ? `${paysNom} \u2014 Direction Generale des Impots`
    : 'Direction Generale des Impots'

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${P.primary200}`, borderRadius: 2 }}>
        {/* En-tete officiel */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: '11px', color: P.primary400, mb: 0.5 }}>
            {headerText}
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
              {config.champs.map((champ, idx) => {
                const autoValue = resolveField(champ.label, entreprise, ctxRegime)
                return (
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
                      {autoValue ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                          <Typography sx={{ fontSize: '0.85rem', flex: 1 }}>{autoValue}</Typography>
                          <Chip label="Auto" size="small" color="info" variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Box>
                      ) : (
                        <TextField
                          size="small"
                          fullWidth
                          variant="standard"
                          placeholder="..."
                          InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem', px: 1 } }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pied de page */}
        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${P.primary200}`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: P.primary400 }}>
            Cadre reserve a l'administration \u2014 Date de reception : ____/____/________ \u2014 Cachet et visa
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

// Factory exports — forward props to enable withBackendData injection
export const GardeDgiIns = (props: any) => <GenericGardePage configKey="GardeDgiIns" {...props} />
export const GardeBic = (props: any) => <GenericGardePage configKey="GardeBic" {...props} />
export const GardeBnc = (props: any) => <GenericGardePage configKey="GardeBnc" {...props} />
export const GardeBa = (props: any) => <GenericGardePage configKey="GardeBa" {...props} />
export const Garde301 = (props: any) => <GenericGardePage configKey="Garde301" {...props} />
export const Garde302 = (props: any) => <GenericGardePage configKey="Garde302" {...props} />
export const Garde3 = (props: any) => <GenericGardePage configKey="Garde3" {...props} />

export default GenericGardePage
