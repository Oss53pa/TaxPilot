/**
 * Composant de paramétrage des taux fiscaux CI
 * Permet de modifier les taux par défaut du CGI et de les persister en localStorage
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Stack,
  Chip,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  RestartAlt as ResetIcon,
  // Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { TAUX_FISCAUX_CI } from '@/config/taux-fiscaux-ci'
import { useTauxFiscauxStore } from '@/store/tauxFiscauxStore'

// Définition des sections et de leurs champs éditables
interface TauxField {
  path: string       // chemin complet ex: "IS.taux_normal"
  label: string
  reference: string  // référence légale CGI
  isPercent: boolean  // true → afficher en % (×100)
  isCurrency: boolean // true → afficher en FCFA
}

interface Section {
  key: string
  title: string
  description: string
  fields: TauxField[]
}

const SECTIONS: Section[] = [
  {
    key: 'IS',
    title: 'Impot sur les Benefices (BIC/IS)',
    description: 'Taux d\'imposition sur les benefices des societes',
    fields: [
      { path: 'IS.taux_normal', label: 'Taux normal IS', reference: 'CGI Art. 33', isPercent: true, isCurrency: false },
      { path: 'IS.taux_pme', label: 'Taux PME eligibles', reference: 'CGI Art. 33 bis', isPercent: true, isCurrency: false },
    ],
  },
  {
    key: 'IMF',
    title: 'Impot Minimum Forfaitaire (IMF)',
    description: 'Minimum d\'imposition base sur le chiffre d\'affaires',
    fields: [
      { path: 'IMF.taux', label: 'Taux IMF (% du CA)', reference: 'CGI Art. 35', isPercent: true, isCurrency: false },
      { path: 'IMF.minimum', label: 'Minimum IMF', reference: 'CGI Art. 35', isPercent: false, isCurrency: true },
      { path: 'IMF.maximum', label: 'Plafond IMF', reference: 'CGI Art. 35', isPercent: false, isCurrency: true },
    ],
  },
  {
    key: 'TVA',
    title: 'Taxe sur la Valeur Ajoutee (TVA)',
    description: 'Taux de TVA applicables',
    fields: [
      { path: 'TVA.taux_normal', label: 'Taux normal TVA', reference: 'CGI Art. 356', isPercent: true, isCurrency: false },
      { path: 'TVA.taux_reduit', label: 'Taux reduit TVA', reference: 'CGI Art. 356', isPercent: true, isCurrency: false },
      { path: 'TVA.taux_tha', label: 'Taxe habitation (THA)', reference: 'CGI', isPercent: true, isCurrency: false },
    ],
  },
  {
    key: 'RETENUES',
    title: 'Retenues a la Source',
    description: 'Taux de retenues appliques aux differentes categories de revenus',
    fields: [
      { path: 'RETENUES.airsi', label: 'AIRSI (prestataires)', reference: 'CGI Art. 64', isPercent: true, isCurrency: false },
      { path: 'RETENUES.irc_resident', label: 'IRC resident (loyers)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'RETENUES.irc_non_resident', label: 'IRC non-resident', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'RETENUES.ircm', label: 'IRCM (dividendes/interets)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'RETENUES.honoraires', label: 'Retenue honoraires', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'RETENUES.bic_non_resident', label: 'BIC non-resident', reference: 'CGI', isPercent: true, isCurrency: false },
    ],
  },
  {
    key: 'SALAIRES',
    title: 'Impots sur Salaires',
    description: 'Taux applicables aux charges salariales (hors tranches baremes)',
    fields: [
      { path: 'SALAIRES.is_salaire', label: 'Impot sur salaires (employeur)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'SALAIRES.fpc', label: 'Formation professionnelle', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'SALAIRES.taxe_apprentissage', label: 'Taxe d\'apprentissage', reference: 'CGI', isPercent: true, isCurrency: false },
    ],
  },
  {
    key: 'CNPS',
    title: 'CNPS (Securite Sociale)',
    description: 'Cotisations sociales employeur et salarie',
    fields: [
      { path: 'CNPS.retraite_employeur', label: 'Retraite employeur', reference: 'Code CNPS', isPercent: true, isCurrency: false },
      { path: 'CNPS.retraite_salarie', label: 'Retraite salarie', reference: 'Code CNPS', isPercent: true, isCurrency: false },
      { path: 'CNPS.prestations_familiales', label: 'Prestations familiales', reference: 'Code CNPS', isPercent: true, isCurrency: false },
      { path: 'CNPS.accident_travail', label: 'Accident du travail', reference: 'Code CNPS', isPercent: true, isCurrency: false },
      { path: 'CNPS.plafond_retraite', label: 'Plafond retraite mensuel', reference: 'Code CNPS', isPercent: false, isCurrency: true },
      { path: 'CNPS.plafond_pf', label: 'Plafond PF mensuel', reference: 'Code CNPS', isPercent: false, isCurrency: true },
    ],
  },
  {
    key: 'LOCAUX',
    title: 'Impots Locaux',
    description: 'Contributions foncieres et taxe d\'habitation',
    fields: [
      { path: 'LOCAUX.contribution_fonciere.taux_bati', label: 'Contribution fonciere (bati)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'LOCAUX.contribution_fonciere.taux_non_bati', label: 'Contribution fonciere (non bati)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'LOCAUX.taxe_habitation', label: 'Taxe d\'habitation', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'LOCAUX.patente.taux_proportionnel', label: 'Patente (taux proportionnel)', reference: 'CGI', isPercent: true, isCurrency: false },
    ],
  },
  {
    key: 'DEDUCTIBILITE',
    title: 'Charges Non Deductibles',
    description: 'Plafonds de deductibilite des charges',
    fields: [
      { path: 'DEDUCTIBILITE.plafond_cadeaux', label: 'Plafond cadeaux (du CA)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'DEDUCTIBILITE.plafond_dons', label: 'Plafond dons (du CA)', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'DEDUCTIBILITE.plafond_interets_cc', label: 'Taux max interets CC', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'DEDUCTIBILITE.amort_vehicule_plafond', label: 'Plafond amort. vehicule', reference: 'CGI', isPercent: false, isCurrency: true },
      { path: 'DEDUCTIBILITE.plafond_missions', label: 'Plafond mission/jour', reference: 'CGI', isPercent: false, isCurrency: true },
    ],
  },
  {
    key: 'ACOMPTES',
    title: 'Acomptes IS',
    description: 'Parametres des acomptes trimestriels',
    fields: [
      { path: 'ACOMPTES.taux_acompte', label: 'Taux par acompte', reference: 'CGI', isPercent: true, isCurrency: false },
      { path: 'ACOMPTES.nombre', label: 'Nombre d\'acomptes', reference: 'CGI', isPercent: false, isCurrency: false },
    ],
  },
]

/** Resolve a dotted path from the TAUX_FISCAUX_CI defaults */
function getDefault(path: string): number {
  const parts = path.split('.')
  let target: any = TAUX_FISCAUX_CI
  for (const p of parts) {
    if (target == null) return 0
    target = target[p]
  }
  return typeof target === 'number' ? target : 0
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const TauxFiscauxSettings: React.FC = () => {
  const { overrides, setTaux, resetToDefaults, resetSection } = useTauxFiscauxStore()
  const [expanded, setExpanded] = useState<string | false>('IS')
  const [saved, setSaved] = useState(false)

  const modifiedCount = Object.keys(overrides).length

  const handleAccordion = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const getCurrentValue = (path: string): number => {
    return path in overrides ? overrides[path] : getDefault(path)
  }

  const isModified = (path: string): boolean => {
    return path in overrides && overrides[path] !== getDefault(path)
  }

  const sectionHasModifications = (sectionKey: string): boolean => {
    return Object.keys(overrides).some(
      (k) => k.startsWith(`${sectionKey}.`) && overrides[k] !== getDefault(k)
    )
  }

  const handleChange = (path: string, displayValue: number, isPercent: boolean) => {
    const storeValue = isPercent ? displayValue / 100 : displayValue
    setTaux(path, storeValue)
  }

  const handleResetAll = () => {
    resetToDefaults()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Box sx={{ px: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Taux Fiscaux - Cote d'Ivoire (CGI)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modifiez les taux fiscaux pour les adapter a votre regime ou aux evolutions legislatives.
          Les valeurs par defaut correspondent au Code General des Impots en vigueur.
        </Typography>
      </Box>

      {modifiedCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          {modifiedCount} taux modifie{modifiedCount > 1 ? 's' : ''} par rapport aux defauts CGI.
          Les calculs fiscaux utiliseront vos valeurs personnalisees.
        </Alert>
      )}

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tous les taux ont ete reinitialises aux valeurs par defaut du CGI.
        </Alert>
      )}

      {SECTIONS.map((section) => (
        <Accordion
          key={section.key}
          expanded={expanded === section.key}
          onChange={handleAccordion(section.key)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>
                {section.title}
              </Typography>
              {sectionHasModifications(section.key) && (
                <Chip label="Modifie" size="small" color="warning" variant="outlined" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {section.description}
            </Typography>

            <Grid container spacing={2}>
              {section.fields.map((field) => {
                const rawValue = getCurrentValue(field.path)
                const displayValue = field.isPercent ? rawValue * 100 : rawValue
                const defaultRaw = getDefault(field.path)
                const defaultDisplay = field.isPercent ? defaultRaw * 100 : defaultRaw
                const modified = isModified(field.path)

                return (
                  <Grid item xs={12} sm={6} md={4} key={field.path}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type="number"
                      value={displayValue}
                      onChange={(e) =>
                        handleChange(field.path, Number(e.target.value), field.isPercent)
                      }
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.isPercent ? '%' : field.isCurrency ? 'FCFA' : ''}
                          </InputAdornment>
                        ),
                      }}
                      helperText={
                        modified
                          ? `Defaut CGI : ${field.isPercent ? defaultDisplay + '%' : field.isCurrency ? formatCurrency(defaultDisplay) : defaultDisplay} (${field.reference})`
                          : field.reference
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': modified
                          ? { borderColor: 'warning.main', '& fieldset': { borderColor: 'warning.main' } }
                          : {},
                      }}
                      color={modified ? 'warning' : undefined}
                      focused={modified}
                    />
                  </Grid>
                )
              })}
            </Grid>

            {sectionHasModifications(section.key) && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<ResetIcon />}
                  onClick={() => resetSection(section.key)}
                >
                  Reinitialiser cette section
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Les modifications sont sauvegardees automatiquement et persistent entre les sessions.
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<ResetIcon />}
              onClick={handleResetAll}
              disabled={modifiedCount === 0}
            >
              Reinitialiser tous les taux
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TauxFiscauxSettings
