/**
 * UpgradeBanner — Banner affiche en lieu et place d'une feature Cabinet verrouillee.
 *
 * Design Atlas Studio :
 *   - Fond #1a1a1a (dark)
 *   - Bordure amber #EF9F27
 *   - Icone cadenas
 *   - CTA "Voir les offres" → /settings/billing
 */
import React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import { Lock as LockIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import type { CabinetFeature } from '@/hooks/useTenantPlan'

const FEATURE_LABELS: Record<CabinetFeature, { title: string; desc: string }> = {
  multi_societes_illimite: {
    title: 'Gestion multi-societes',
    desc: "Gerez un portefeuille illimite de dossiers clients SYSCOHADA depuis une seule interface.",
  },
  tableau_de_bord_portefeuille: {
    title: 'Tableau de bord Portefeuille',
    desc: "Vue consolidee de tous vos dossiers clients : avancement, deadlines, alertes.",
  },
  export_groupe_multi_clients: {
    title: 'Export groupe multi-clients',
    desc: "Exportez les liasses de plusieurs dossiers en une seule operation (ZIP, Excel, PDF).",
  },
  branding_cabinet: {
    title: 'Branding cabinet',
    desc: "Personnalisez logo, couleurs et pied de page avec l'identite de votre cabinet.",
  },
  comparaison_inter_societes: {
    title: 'Comparaison inter-societes',
    desc: "Comparez les ratios et etats financiers de plusieurs clients cote a cote.",
  },
  rapport_synthetique_cabinet: {
    title: 'Rapport synthetique cabinet',
    desc: "Rapport consolide de l'activite de votre cabinet, exportable en PDF.",
  },
  gestion_equipe_cabinet: {
    title: 'Gestion d\'equipe illimitee',
    desc: "Invitez un nombre illimite de collaborateurs avec roles personnalises.",
  },
  support_dedie: {
    title: 'Support dedie',
    desc: "Support prioritaire avec account manager dedie et SLA 24h.",
  },
}

interface UpgradeBannerProps {
  feature: CabinetFeature
  requiredPlan?: string
  /** Mode compact : version sans description pour menus/boutons */
  compact?: boolean
  /** Texte personnalise du titre */
  title?: string
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  feature,
  requiredPlan = 'Cabinet',
  compact = false,
  title,
}) => {
  const navigate = useNavigate()
  const config = FEATURE_LABELS[feature]
  const displayTitle = title || config.title

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          backgroundColor: '#1a1a1a',
          border: '1px solid #EF9F27',
          color: '#fff',
        }}
      >
        <LockIcon sx={{ color: '#EF9F27', fontSize: 18 }} />
        <Typography variant="body2" sx={{ flex: 1, color: '#fff', fontWeight: 500 }}>
          {displayTitle}
        </Typography>
        <Chip
          label={requiredPlan}
          size="small"
          sx={{
            backgroundColor: '#EF9F27',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 20,
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: '#1a1a1a',
        border: '1.5px solid #EF9F27',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        boxShadow: '0 4px 20px rgba(239, 159, 39, 0.08)',
      }}
      data-feature-locked={feature}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: 'rgba(239, 159, 39, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 159, 39, 0.35)',
          }}
        >
          <LockIcon sx={{ color: '#EF9F27', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
            {displayTitle}
          </Typography>
          <Chip
            label={`Disponible en plan ${requiredPlan}`}
            size="small"
            sx={{
              mt: 0.5,
              backgroundColor: '#EF9F27',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
        {config.desc}
      </Typography>

      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/settings/billing')}
        sx={{
          backgroundColor: '#EF9F27',
          color: '#000',
          fontWeight: 700,
          textTransform: 'none',
          '&:hover': { backgroundColor: '#f5b548' },
        }}
      >
        Voir les offres
      </Button>
    </Box>
  )
}

export default UpgradeBanner
