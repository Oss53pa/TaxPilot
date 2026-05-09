/**
 * ModeSelection.tsx — Fallback page (Nordic Slate)
 *
 * NOTE IMPORTANTE: depuis App.tsx, le userMode est dérivé en priorité de
 * `auth.user.userType` (champ Supabase profiles.user_type, posé à l'achat
 * via Atlas Studio). Cette page n'est donc affichée qu'en fallback pour
 * les comptes legacy qui n'auraient pas encore de user_type côté Supabase.
 * Le flux nominal n'est: pas de sélection manuelle après login.
 */
import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import { Business as BusinessIcon, AccountBalance as CabinetIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useModeStore, type UserMode } from '@/store/modeStore'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

const FONT_BRAND = '"Grand Hotel", cursive'
const FONT_BODY = '"Dosis", "Inter", "Exo 2", sans-serif'

const ModeSelection: React.FC = () => {
  const navigate = useNavigate()
  const setUserMode = useModeStore(s => s.setUserMode)

  const handleSelect = (mode: UserMode) => {
    setUserMode(mode)
    navigate('/onboarding')
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: P.primary50,
      fontFamily: FONT_BODY,
      p: 3,
    }}>
      {/* Logo / Brand */}
      <Typography sx={{ fontFamily: FONT_BRAND, fontSize: 48, color: P.primary900, mb: 1, lineHeight: 1 }}>
        Liass'Pilot
      </Typography>
      <Typography sx={{
        fontFamily: FONT_BODY, fontSize: '0.95rem', color: P.primary500,
        mb: 5, textAlign: 'center', maxWidth: 540, lineHeight: 1.7,
      }}>
        Solution de génération de liasse fiscale SYSCOHADA révisé.
        Choisissez votre profil pour personnaliser votre expérience.
      </Typography>

      {/* Two cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Mode Entreprise */}
        <Paper
          elevation={0}
          sx={{
            width: 340, p: 4, borderRadius: 3,
            border: `1px solid ${P.primary200}`,
            bgcolor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: P.teal,
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(15,118,110,0.12)',
            },
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}
          onClick={() => handleSelect('entreprise')}
        >
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            bgcolor: P.tealBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
          }}>
            <BusinessIcon sx={{ fontSize: 36, color: P.teal }} />
          </Box>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: 20, fontWeight: 700, color: P.primary900, mb: 1 }}>
            Entreprise
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: 13, color: P.primary500, mb: 3, lineHeight: 1.7 }}>
            Je gère la liasse fiscale de ma propre entreprise. Un seul dossier, une interface simplifiée.
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3, width: '100%' }}>
            {['1 dossier entreprise', 'Import balance N et N-1', 'Export Excel + modèle DGI', 'Audit de cohérence'].map(item => (
              <Typography component="li" key={item} sx={{ fontFamily: FONT_BODY, fontSize: 12.5, color: P.primary600, mb: 0.5 }}>{item}</Typography>
            ))}
          </Box>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: P.primary300,
              color: P.primary900,
              fontFamily: FONT_BODY,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.1,
              '&:hover': { bgcolor: P.teal, borderColor: P.teal, color: '#ffffff' },
            }}
          >
            Choisir Entreprise
          </Button>
        </Paper>

        {/* Mode Cabinet */}
        <Paper
          elevation={0}
          sx={{
            width: 340, p: 4, borderRadius: 3,
            border: `2px solid ${P.teal}`,
            bgcolor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(15,118,110,0.08)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(15,118,110,0.18)',
            },
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}
          onClick={() => handleSelect('cabinet')}
        >
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            bgcolor: P.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
          }}>
            <CabinetIcon sx={{ fontSize: 36, color: '#ffffff' }} />
          </Box>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: 20, fontWeight: 700, color: P.primary900, mb: 1 }}>
            Cabinet Comptable
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: 13, color: P.primary500, mb: 3, lineHeight: 1.7 }}>
            Je suis expert-comptable. Je gère les dossiers de plusieurs clients avec un portefeuille multi-dossiers.
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3, width: '100%' }}>
            {['Multi-dossiers clients', 'Portefeuille & suivi statuts', 'Export Excel + modèle DGI', 'Audit + piste d\'audit'].map(item => (
              <Typography component="li" key={item} sx={{ fontFamily: FONT_BODY, fontSize: 12.5, color: P.primary600, mb: 0.5 }}>{item}</Typography>
            ))}
          </Box>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: P.teal,
              fontFamily: FONT_BODY,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.1,
              boxShadow: '0 1px 2px rgba(15,118,110,0.15)',
              '&:hover': { bgcolor: P.tealDark, boxShadow: '0 4px 12px rgba(15,118,110,0.25)' },
            }}
          >
            Choisir Cabinet
          </Button>
        </Paper>
      </Box>
    </Box>
  )
}

export default ModeSelection
