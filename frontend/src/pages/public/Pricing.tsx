import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Paper,
  useTheme,
  alpha,
} from '@mui/material'
import {
  CheckCircle,
  AccountBalance,
  ArrowForward,
  Star,
  Close,
} from '@mui/icons-material'

interface PricingPlan {
  name: string
  price: number
  priceAnnual: number
  liasses: string
  features: string[]
  notIncluded?: string[]
  recommended?: boolean
  cta: string
  color: string
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 0,
    priceAnnual: 0,
    liasses: '2 liasses/an',
    features: [
      '2 liasses fiscales gratuites',
      'Système Minimal de Trésorerie (SMT)',
      'Import balance Excel/CSV',
      'Export PDF basique',
      'Contrôles de cohérence de base',
      'Support par email',
      'Données conservées 1 an',
    ],
    notIncluded: [
      'Système Normal (SN)',
      'Système Allégé (SA)',
      'Contrôles avancés',
      'API',
    ],
    cta: 'Commencer Gratuitement',
    color: 'grey',
  },
  {
    name: 'Business',
    price: 49000,
    priceAnnual: 490000,
    liasses: 'Jusqu\'à 12 liasses/an',
    features: [
      'Jusqu\'à 12 liasses fiscales par an',
      'Tous types de liasses (SMT, SA, SN)',
      'SYSCOHADA 2017 & 2024',
      'Import automatique (Excel, CSV, FEC)',
      'Export PDF/Excel/XML avancé',
      'Contrôles de cohérence avancés',
      'Machine à états (workflow)',
      'Multi-utilisateurs (5 max)',
      'Audit trail complet',
      'Support prioritaire par email',
      'Données conservées 3 ans',
    ],
    recommended: true,
    cta: 'Essayer 30 jours',
    color: 'primary',
  },
  {
    name: 'Enterprise',
    price: 149000,
    priceAnnual: 1490000,
    liasses: 'Liasses illimitées',
    features: [
      'Liasses fiscales illimitées',
      'Tous types de liasses (SMT, SA, SN)',
      'Multi-entités / Consolidation',
      'SYSCOHADA 2017 & 2024',
      'Import automatique tous formats',
      'API REST complète',
      'Webhooks personnalisés',
      'Multi-utilisateurs illimités',
      'Rôles et permissions avancés',
      'Audit trail + logs immuables',
      'Verrouillage cryptographique',
      'Intégrations ERP (SAP, Sage, etc.)',
      'Support téléphone prioritaire',
      'Account manager dédié',
      'Données conservées 10 ans',
      'SLA 99.9% garanti',
    ],
    cta: 'Contactez-nous',
    color: 'secondary',
  },
]

const Pricing: React.FC = () => {
  const theme = useTheme()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')

  const handleBillingChange = (_: React.MouseEvent<HTMLElement>, newPeriod: 'monthly' | 'annual' | null) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              FiscaSync
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={RouterLink} to="/">
              Accueil
            </Button>
            <Button color="inherit" component={RouterLink} to="/login">
              Connexion
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to="/signup"
              endIcon={<ArrowForward />}
            >
              Essayer Gratuitement
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          pt: 8,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom>
              Tarifs Simples et Transparents
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Choisissez le plan adapté à votre volume de liasses annuel
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
              <ToggleButtonGroup
                value={billingPeriod}
                exclusive
                onChange={handleBillingChange}
                aria-label="billing period"
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                  }
                }}
              >
                <ToggleButton value="monthly" aria-label="monthly">
                  Mensuel
                </ToggleButton>
                <ToggleButton value="annual" aria-label="annual">
                  Annuel
                </ToggleButton>
              </ToggleButtonGroup>
              {billingPeriod === 'annual' && (
                <Chip
                  label="Économisez 17%"
                  color="success"
                  size="small"
                  icon={<Star />}
                />
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ...(plan.recommended && {
                    border: 2,
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                    zIndex: 1,
                  }),
                  '&:hover': {
                    transform: plan.recommended ? 'scale(1.06)' : 'scale(1.02)',
                    boxShadow: 8,
                  }
                }}
              >
                {plan.recommended && (
                  <Chip
                    label="Recommandé"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600,
                    }}
                    icon={<Star />}
                  />
                )}

                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={plan.color === 'grey' ? 'text.secondary' : `${plan.color}.main`}
                    gutterBottom
                  >
                    {plan.name}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    {plan.price === 0 ? (
                      <Typography variant="h3" fontWeight={800}>
                        Gratuit
                      </Typography>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="h3" fontWeight={800}>
                            {billingPeriod === 'monthly'
                              ? plan.price.toLocaleString('fr-FR')
                              : Math.round(plan.priceAnnual / 12).toLocaleString('fr-FR')}
                          </Typography>
                          <Typography variant="h6" color="text.secondary">
                            FCFA/mois
                          </Typography>
                        </Box>
                        {billingPeriod === 'annual' && (
                          <Typography variant="body2" color="text.secondary">
                            {plan.priceAnnual.toLocaleString('fr-FR')} FCFA facturés annuellement
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: alpha(
                        plan.color === 'grey'
                          ? theme.palette.grey[500]
                          : (theme.palette[plan.color as 'primary' | 'secondary'] as { main: string }).main,
                        0.05
                      ),
                      borderColor: alpha(
                        plan.color === 'grey'
                          ? theme.palette.grey[500]
                          : (theme.palette[plan.color as 'primary' | 'secondary'] as { main: string }).main,
                        0.2
                      ),
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} textAlign="center">
                      {plan.liasses}
                    </Typography>
                  </Paper>

                  <Button
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    component={RouterLink}
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    endIcon={<ArrowForward />}
                    sx={{ mb: 3 }}
                  >
                    {plan.cta}
                  </Button>

                  <Divider sx={{ mb: 2 }} />

                  <List dense sx={{ flexGrow: 1 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: feature.includes('illimité') ? 600 : 400,
                          }}
                        />
                      </ListItem>
                    ))}
                    {plan.notIncluded?.map((feature, index) => (
                      <ListItem key={`not-${index}`} sx={{ px: 0, opacity: 0.4 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Close fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Info */}
        <Paper sx={{ p: 4, mt: 6, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <Typography variant="h5" fontWeight={600} gutterBottom textAlign="center">
            Questions Fréquentes
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Qu'est-ce qu'une liasse fiscale ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Une liasse fiscale est l'ensemble des états financiers (Bilan, Compte de Résultat, TAFIRE, etc.)
                que vous devez produire annuellement selon le référentiel SYSCOHADA.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Puis-je changer de plan ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Oui, vous pouvez upgrader ou downgrader à tout moment.
                La différence est calculée au prorata pour la période restante.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Y a-t-il une période d'essai ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Oui ! Vous commencez avec 2 liasses gratuites sur le plan Starter.
                Le plan Business offre 30 jours d'essai sans engagement.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Quels sont les moyens de paiement acceptés ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money
                (Orange Money, MTN Money, Moov Money) et virement bancaire.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Besoin d'un plan personnalisé ?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Pour les grandes entreprises ou besoins spécifiques, contactez notre équipe commerciale
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/contact"
            sx={{ px: 5, py: 2 }}
          >
            Contactez-nous
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6, color: 'white' }}>
              © 2025 FiscaSync. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Pricing
