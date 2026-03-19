/**
 * ModeSelection.tsx — P1-1: First-launch mode selection
 * Displayed when userMode is null (first time user).
 */
import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import { Business as BusinessIcon, AccountBalance as CabinetIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useModeStore, type UserMode } from '@/store/modeStore'

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
      bgcolor: '#fafafa',
      p: 3,
    }}>
      {/* Logo / Title */}
      <Typography sx={{ fontFamily: '"Grand Hotel", cursive', fontSize: 42, color: '#171717', mb: 1 }}>
        Liass'Pilot
      </Typography>
      <Typography sx={{ fontSize: 16, color: '#737373', mb: 5, textAlign: 'center', maxWidth: 500 }}>
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
            border: '2px solid #e5e5e5',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: '#171717', transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}
          onClick={() => handleSelect('entreprise')}
        >
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
            <BusinessIcon sx={{ fontSize: 36, color: '#525252' }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#171717', mb: 1 }}>
            Entreprise
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#737373', mb: 3, lineHeight: 1.6 }}>
            Je gère la liasse fiscale de ma propre entreprise. Un seul dossier, une interface simplifiée.
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3, width: '100%' }}>
            {['1 dossier entreprise', 'Import balance N et N-1', 'Export Excel + modèle DGI', 'Audit de cohérence'].map(item => (
              <Typography component="li" key={item} sx={{ fontSize: 12, color: '#525252', mb: 0.5 }}>{item}</Typography>
            ))}
          </Box>
          <Button fullWidth variant="outlined" sx={{ borderColor: '#171717', color: '#171717', fontWeight: 600, '&:hover': { bgcolor: '#171717', color: '#fff' } }}>
            Choisir Entreprise
          </Button>
        </Paper>

        {/* Mode Cabinet */}
        <Paper
          elevation={0}
          sx={{
            width: 340, p: 4, borderRadius: 3,
            border: '2px solid #171717',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}
          onClick={() => handleSelect('cabinet')}
        >
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
            <CabinetIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#171717', mb: 1 }}>
            Cabinet Comptable
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#737373', mb: 3, lineHeight: 1.6 }}>
            Je suis expert-comptable. Je gère les dossiers de plusieurs clients avec un portefeuille multi-dossiers.
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3, width: '100%' }}>
            {['Multi-dossiers clients', 'Portefeuille & suivi statuts', 'Export Excel + modèle DGI', 'Audit + piste d\'audit'].map(item => (
              <Typography component="li" key={item} sx={{ fontSize: 12, color: '#525252', mb: 0.5 }}>{item}</Typography>
            ))}
          </Box>
          <Button fullWidth variant="contained" sx={{ bgcolor: '#171717', fontWeight: 600, '&:hover': { bgcolor: '#333' } }}>
            Choisir Cabinet
          </Button>
        </Paper>
      </Box>
    </Box>
  )
}

export default ModeSelection
