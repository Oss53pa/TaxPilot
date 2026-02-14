/**
 * Accès direct aux liasses pour contourner les problèmes React
 */

import React from 'react'
import { Box, Typography, Button, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const DirectLiasseAccess: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🏆 TaxPilot - Liasses Fiscales SYSCOHADA
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Workflow professionnel : Balance → Audit → Corrections → Liasse → Télédéclaration
      </Typography>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: '#e5e5e5',  // Encadré important
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(55, 59, 77, 0.15)'
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#171717', fontWeight: 600 }}>
          📋 Processus de production de liasse fiscale SYSCOHADA
        </Typography>
        <Typography variant="body2" sx={{ color: '#171717', lineHeight: 1.6 }}>
          <strong>1️⃣ Importer la balance</strong> → <strong>2️⃣ Audit automatique</strong> → <strong>3️⃣ Corrections IA</strong> → 
          <strong>4️⃣ Validation</strong> → <strong>5️⃣ Génération liasse</strong> → <strong>6️⃣ Notes annexes</strong> → 
          <strong>7️⃣ Validation hiérarchique</strong> → <strong>8️⃣ Télédéclaration</strong>
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              cursor: 'pointer',
              bgcolor: '#f5f5f5',  // Section/carte
              borderRadius: 2,
              border: '1px solid #e5e5e550',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(55, 59, 77, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/liasse-complete-final')}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#171717' }}>
              📋 Liasse Complète
            </Typography>
            <Typography variant="body2" sx={{ color: '#737373', mb: 2 }}>
              Interface complète de génération des liasses fiscales SYSCOHADA avec tous les tableaux.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mt: 1,
                bgcolor: '#171717',
                color: 'white',
                '&:hover': { bgcolor: '#262626' }
              }}
              onClick={(e) => {
                e.stopPropagation()
                navigate('/liasse-complete-final')
              }}
            >
              Accéder
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              cursor: 'pointer',
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #e5e5e550',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(55, 59, 77, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/production-liasse')}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#171717' }}>
              🏭 Production de Liasse
            </Typography>
            <Typography variant="body2" sx={{ color: '#737373', mb: 2 }}>
              Module avancé de production et génération automatique des états financiers.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mt: 1,
                bgcolor: '#171717',
                color: 'white',
                '&:hover': { bgcolor: '#262626' }
              }}
              onClick={(e) => {
                e.stopPropagation()
                navigate('/production-liasse')
              }}
            >
              Accéder
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              cursor: 'pointer',
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #e5e5e550',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(55, 59, 77, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/liasse')}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#171717' }}>
              ⚡ Liasse Moderne
            </Typography>
            <Typography variant="body2" sx={{ color: '#737373', mb: 2 }}>
              Interface moderne et optimisée pour la création de liasses OHADA.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mt: 1,
                bgcolor: '#171717',
                color: 'white',
                '&:hover': { bgcolor: '#262626' }
              }}
              onClick={(e) => {
                e.stopPropagation()
                navigate('/liasse')
              }}
            >
              Accéder
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          📊 Composants Disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 28 composants de liasse SYSCOHADA<br/>
          • 8 types de liasse supportés (SN/SA/SMT/CONSO/BANQUE/ASSURANCE)<br/>
          • PostgreSQL avec base Fiscasync_DB<br/>
          • Moteur de génération intelligent<br/>
          • Audit automatique avec 38 détecteurs
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🔄 Workflow Professionnel Recommandé
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon="📥"
              onClick={() => navigate('/import-balance')}
              sx={{ 
                py: 2,
                bgcolor: '#171717',
                color: 'white',
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: '#262626',
                  boxShadow: '0 4px 12px rgba(55, 59, 77, 0.3)'
                }
              }}
            >
              1. Import Balance
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon="🔍"
              onClick={() => navigate('/audit')}
              sx={{ 
                py: 2,
                bgcolor: '#171717',
                color: 'white',
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: '#262626',
                  boxShadow: '0 4px 12px rgba(55, 59, 77, 0.3)'
                }
              }}
            >
              2. Audit & Corrections
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon="🏭"
              onClick={() => navigate('/generation')}
              sx={{ 
                py: 2,
                bgcolor: '#171717',
                color: 'white',
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: '#262626',
                  boxShadow: '0 4px 12px rgba(55, 59, 77, 0.3)'
                }
              }}
            >
              3. Génération Auto
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon="📤"
              onClick={() => navigate('/teledeclaration')}
              sx={{ 
                py: 2,
                bgcolor: '#171717',
                color: 'white',
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: '#262626',
                  boxShadow: '0 4px 12px rgba(55, 59, 77, 0.3)'
                }
              }}
            >
              4. Télédéclaration
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/dashboard')}
          sx={{ 
            mr: 2,
            borderColor: '#737373',
            color: '#737373',
            borderRadius: 2,
            '&:hover': {
              borderColor: '#171717',
              color: '#171717',
              bgcolor: '#fafafa15'
            }
          }}
        >
          Retour Dashboard
        </Button>
        <Button 
          variant="outlined"
          onClick={() => navigate('/balance')}
          sx={{
            borderColor: '#737373',
            color: '#737373', 
            borderRadius: 2,
            '&:hover': {
              borderColor: '#171717',
              color: '#171717',
              bgcolor: '#fafafa15'
            }
          }}
        >
          Consulter Balance
        </Button>
      </Box>
    </Box>
  )
}

export default DirectLiasseAccess