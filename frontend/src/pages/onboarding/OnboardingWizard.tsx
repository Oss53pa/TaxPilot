/**
 * OnboardingWizard.tsx — Guided setup wizard after mode selection.
 * Entreprise mode: 4 steps | Cabinet mode: 5 steps.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Paper,
  MenuItem,
} from '@mui/material'
import { useModeStore } from '@/store/modeStore'
import { useDossierStore } from '@/store/dossierStore'

// ── Step labels ────────────────────────────────────────────────────────
const STEPS_ENTREPRISE = [
  'Paramétrage entreprise',
  'Import balance',
  'Contrôle',
  'Terminé',
]

const STEPS_CABINET = [
  'Paramétrage cabinet',
  'Premier dossier client',
  'Import balance',
  'Contrôle',
  'Terminé',
]

// ── Palette ────────────────────────────────────────────────────────────
const colors = {
  bg: '#fafafa',
  surface: '#ffffff',
  border: '#e5e5e5',
  textPrimary: '#171717',
  textSecondary: '#525252',
  textMuted: '#737373',
  accent: '#171717',
}

// ── Form data shape ────────────────────────────────────────────────────
interface EntrepriseData {
  denomination: string
  rccm: string
  ncc: string
  exercice_clos: string
  regime: 'normal' | 'simplifie' | 'forfaitaire'
}

interface CabinetData {
  nom_cabinet: string
  numero_oec: string
  responsable: string
}

interface DossierData {
  nom_client: string
  rccm: string
  ncc: string
  exercice_n: number
  regime: 'normal' | 'simplifie' | 'forfaitaire'
}

const REGIME_OPTIONS: { value: string; label: string }[] = [
  { value: 'normal', label: 'Régime normal' },
  { value: 'simplifie', label: 'Régime simplifié' },
  { value: 'forfaitaire', label: 'Régime forfaitaire' },
]

// ── Component ──────────────────────────────────────────────────────────
export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { userMode, setCabinetInfo, completeOnboarding } = useModeStore()
  const { addDossier, setActiveDossier } = useDossierStore()

  const isCabinet = userMode === 'cabinet'
  const steps = isCabinet ? STEPS_CABINET : STEPS_ENTREPRISE

  const [stepIndex, setStepIndex] = useState(0)

  // Entreprise form state
  const [entreprise, setEntreprise] = useState<EntrepriseData>({
    denomination: '',
    rccm: '',
    ncc: '',
    exercice_clos: '',
    regime: 'normal',
  })

  // Cabinet form state
  const [cabinet, setCabinet] = useState<CabinetData>({
    nom_cabinet: '',
    numero_oec: '',
    responsable: '',
  })

  // Dossier form state (cabinet mode step 2)
  const [dossier, setDossier] = useState<DossierData>({
    nom_client: '',
    rccm: '',
    ncc: '',
    exercice_n: new Date().getFullYear(),
    regime: 'normal',
  })

  // ── Handlers ───────────────────────────────────────────────────────
  const handleNext = () => {
    // Save data at specific steps
    if (!isCabinet && stepIndex === 0) {
      // Entreprise step 1 — save to localStorage
      localStorage.setItem(
        'fiscasync_entreprise_settings',
        JSON.stringify(entreprise)
      )
    }

    if (isCabinet && stepIndex === 0) {
      // Cabinet step 1 — save cabinet info to store
      setCabinetInfo({
        nomCabinet: cabinet.nom_cabinet,
        numeroOEC: cabinet.numero_oec,
        responsable: cabinet.responsable,
      })
    }

    if (isCabinet && stepIndex === 1) {
      // Cabinet step 2 — create first dossier
      const id = addDossier({
        nomClient: dossier.nom_client,
        rccm: dossier.rccm,
        ncc: dossier.ncc,
        exerciceN: dossier.exercice_n,
        exerciceN1: dossier.exercice_n - 1,
        regime: dossier.regime,
      })
      setActiveDossier(id)
    }

    setStepIndex((prev) => prev + 1)
  }

  const handleBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleFinish = () => {
    completeOnboarding()
    navigate('/dashboard')
  }

  const isLastStep = stepIndex === steps.length - 1

  // ── Helpers for field updates ──────────────────────────────────────
  const updateEntreprise = (field: keyof EntrepriseData, value: string) =>
    setEntreprise((prev) => ({ ...prev, [field]: value }))

  const updateCabinet = (field: keyof CabinetData, value: string) =>
    setCabinet((prev) => ({ ...prev, [field]: value }))

  const updateDossier = (field: keyof DossierData, value: string | number) =>
    setDossier((prev) => ({ ...prev, [field]: value }))

  // ── Shared text field props ────────────────────────────────────────
  const fieldSx = { mb: 2 }

  // ── Step content renderers ─────────────────────────────────────────
  function renderEntrepriseStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Paramétrage de votre entreprise
        </Typography>
        <TextField
          label="Dénomination sociale"
          fullWidth
          sx={fieldSx}
          value={entreprise.denomination}
          onChange={(e) => updateEntreprise('denomination', e.target.value)}
        />
        <TextField
          label="RCCM"
          fullWidth
          sx={fieldSx}
          value={entreprise.rccm}
          onChange={(e) => updateEntreprise('rccm', e.target.value)}
        />
        <TextField
          label="N° Contribuable (NCC)"
          fullWidth
          sx={fieldSx}
          value={entreprise.ncc}
          onChange={(e) => updateEntreprise('ncc', e.target.value)}
        />
        <TextField
          label="Date de clôture de l'exercice"
          fullWidth
          sx={fieldSx}
          placeholder="31/12/2025"
          value={entreprise.exercice_clos}
          onChange={(e) => updateEntreprise('exercice_clos', e.target.value)}
        />
        <TextField
          label="Régime fiscal"
          select
          fullWidth
          sx={fieldSx}
          value={entreprise.regime}
          onChange={(e) => updateEntreprise('regime', e.target.value)}
        >
          {REGIME_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </>
    )
  }

  function renderCabinetStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Paramétrage de votre cabinet
        </Typography>
        <TextField
          label="Nom du cabinet"
          fullWidth
          sx={fieldSx}
          value={cabinet.nom_cabinet}
          onChange={(e) => updateCabinet('nom_cabinet', e.target.value)}
        />
        <TextField
          label="Numéro OEC"
          fullWidth
          sx={fieldSx}
          value={cabinet.numero_oec}
          onChange={(e) => updateCabinet('numero_oec', e.target.value)}
        />
        <TextField
          label="Responsable"
          fullWidth
          sx={fieldSx}
          value={cabinet.responsable}
          onChange={(e) => updateCabinet('responsable', e.target.value)}
        />
      </>
    )
  }

  function renderDossierStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Premier dossier client
        </Typography>
        <TextField
          label="Nom du client"
          fullWidth
          sx={fieldSx}
          value={dossier.nom_client}
          onChange={(e) => updateDossier('nom_client', e.target.value)}
        />
        <TextField
          label="RCCM"
          fullWidth
          sx={fieldSx}
          value={dossier.rccm}
          onChange={(e) => updateDossier('rccm', e.target.value)}
        />
        <TextField
          label="N° Contribuable (NCC)"
          fullWidth
          sx={fieldSx}
          value={dossier.ncc}
          onChange={(e) => updateDossier('ncc', e.target.value)}
        />
        <TextField
          label="Exercice N"
          type="number"
          fullWidth
          sx={fieldSx}
          value={dossier.exercice_n}
          onChange={(e) => updateDossier('exercice_n', Number(e.target.value))}
        />
        <TextField
          label="Régime fiscal"
          select
          fullWidth
          sx={fieldSx}
          value={dossier.regime}
          onChange={(e) => updateDossier('regime', e.target.value)}
        >
          {REGIME_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </>
    )
  }

  function renderImportStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Import de la balance
        </Typography>
        <Typography sx={{ mb: 3, color: colors.textSecondary }}>
          Importez votre balance comptable pour générer automatiquement la
          liasse fiscale SYSCOHADA. Vous pouvez aussi le faire plus tard depuis
          le tableau de bord.
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: colors.border,
            color: colors.textPrimary,
            '&:hover': { borderColor: colors.textSecondary, bgcolor: colors.bg },
          }}
          onClick={() => navigate('/import-balance')}
        >
          Importer une balance
        </Button>
      </>
    )
  }

  function renderControleStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Contrôle et validation
        </Typography>
        <Typography sx={{ mb: 3, color: colors.textSecondary }}>
          Vérifiez la cohérence de vos données et validez votre liasse fiscale
          avant export. Vous pouvez aussi effectuer cette étape plus tard.
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: colors.border,
            color: colors.textPrimary,
            '&:hover': { borderColor: colors.textSecondary, bgcolor: colors.bg },
          }}
          onClick={() => navigate('/validation-liasse')}
        >
          Lancer le contrôle
        </Button>
      </>
    )
  }

  function renderTermineStep() {
    return (
      <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
          Configuration terminée
        </Typography>
        <Typography sx={{ mb: 3, color: colors.textSecondary }}>
          Votre espace est prêt. Vous pouvez maintenant accéder à votre tableau
          de bord pour commencer à travailler sur votre liasse fiscale
          SYSCOHADA.
        </Typography>
      </>
    )
  }

  // ── Resolve current step content ───────────────────────────────────
  function renderStepContent() {
    if (isCabinet) {
      switch (stepIndex) {
        case 0:
          return renderCabinetStep()
        case 1:
          return renderDossierStep()
        case 2:
          return renderImportStep()
        case 3:
          return renderControleStep()
        case 4:
          return renderTermineStep()
        default:
          return null
      }
    } else {
      switch (stepIndex) {
        case 0:
          return renderEntrepriseStep()
        case 1:
          return renderImportStep()
        case 2:
          return renderControleStep()
        case 3:
          return renderTermineStep()
        default:
          return null
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 640,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          p: 4,
          bgcolor: colors.surface,
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}
        >
          Configuration {isCabinet ? 'du cabinet' : "de l'entreprise"}
        </Typography>
        <Typography sx={{ mb: 3, color: colors.textMuted, fontSize: 14 }}>
          Étape {stepIndex + 1} sur {steps.length}
        </Typography>

        {/* Stepper */}
        <Stepper
          activeStep={stepIndex}
          alternativeLabel
          sx={{
            mb: 4,
            '& .MuiStepIcon-root.Mui-active': { color: colors.accent },
            '& .MuiStepIcon-root.Mui-completed': { color: colors.accent },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: 12,
                    color: colors.textMuted,
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: colors.textPrimary,
                    fontWeight: 600,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step content */}
        <Box sx={{ minHeight: 200, mb: 4 }}>{renderStepContent()}</Box>

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={stepIndex === 0}
            onClick={handleBack}
            sx={{ color: colors.textSecondary }}
          >
            Retour
          </Button>

          {isLastStep ? (
            <Button
              variant="contained"
              onClick={handleFinish}
              sx={{
                bgcolor: colors.accent,
                color: '#fff',
                '&:hover': { bgcolor: colors.textSecondary },
              }}
            >
              Accéder au tableau de bord
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                bgcolor: colors.accent,
                color: '#fff',
                '&:hover': { bgcolor: colors.textSecondary },
              }}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
