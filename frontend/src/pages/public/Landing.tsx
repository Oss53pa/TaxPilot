import React from 'react'
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
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from '@mui/material'
import {
  CheckCircle,
  TrendingUp,
  Speed,
  Security,
  CloudUpload,
  Description,
  Assessment,
  Verified,
  Business,
  AccountBalance,
  Calculate,
  ArrowForward,
} from '@mui/icons-material'

const Landing: React.FC = () => {
  const theme = useTheme()

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
            <Button color="inherit" component={RouterLink} to="/pricing">
              Tarifs
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

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          pt: 10,
          pb: 12,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Conforme SYSCOHADA Révisé 2024"
                color="primary"
                sx={{ mb: 3 }}
                icon={<Verified />}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Générez vos liasses fiscales en quelques clics
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Solution SaaS pour les entreprises de la zone OHADA.
                Automatisez la production de vos états financiers SYSCOHADA.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/signup"
                  endIcon={<ArrowForward />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Commencer Gratuitement
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/demo"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Voir une Démo
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                ✨ 2 liasses gratuites • Sans carte bancaire • Activation immédiate
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Description sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        États Financiers Complets
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Bilan, Compte de Résultat, TAFIRE, Notes Annexes
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CloudUpload sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Import Balance
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Excel, CSV, FEC - Compatible tous logiciels
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Calculate sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Calculs Automatiques
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Respect strict des normes SYSCOHADA
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Assessment sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Contrôles de Cohérence
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Détection automatique des anomalies
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Tout ce dont vous avez besoin
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Une solution complète pour vos déclarations fiscales
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Rapide et Simple
                </Typography>
                <Typography color="text.secondary">
                  Importez votre balance comptable et générez vos états financiers en moins de 5 minutes.
                  Interface intuitive, aucune formation nécessaire.
                </Typography>
                <List dense sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Import automatique" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Calculs en temps réel" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Export PDF/Excel" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Verified sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  100% Conforme
                </Typography>
                <Typography color="text.secondary">
                  Respect strict du référentiel SYSCOHADA Révisé. Millésimes 2017 et 2024 intégrés.
                  Mise à jour automatique des normes.
                </Typography>
                <List dense sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="SYSCOHADA 2017/2024" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Contrôles automatiques" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Audit trail complet" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Security sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Sécurisé et Fiable
                </Typography>
                <Typography color="text.secondary">
                  Vos données sont chiffrées et hébergées dans la zone OHADA.
                  Sauvegardes automatiques, accès multi-utilisateurs sécurisé.
                </Typography>
                <List dense sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Chiffrement SSL/TLS" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Sauvegardes quotidiennes" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Accès par rôles" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Use Cases Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Pour toutes les entreprises
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Quelle que soit votre taille ou votre secteur
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  PME
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Système Minimal de Trésorerie ou Système Allégé.
                  Solution économique adaptée aux petites structures.
                </Typography>
                <Chip label="Starter" color="primary" variant="outlined" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <TrendingUp sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  ETI
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Système Normal complet avec tous les états financiers.
                  Contrôles avancés et reporting détaillé.
                </Typography>
                <Chip label="Business" color="success" variant="outlined" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <AccountBalance sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Grandes Entreprises
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Multi-entités, consolidation, API dédiée.
                  Support prioritaire et accompagnement personnalisé.
                </Typography>
                <Chip label="Enterprise" color="secondary" variant="outlined" />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Prêt à simplifier vos déclarations fiscales ?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Commencez gratuitement avec 2 liasses offertes.
          Aucune carte bancaire requise.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/signup"
            endIcon={<ArrowForward />}
            sx={{ px: 5, py: 2, fontSize: '1.1rem' }}
          >
            Créer mon compte gratuitement
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/pricing"
            sx={{ px: 5, py: 2, fontSize: '1.1rem' }}
          >
            Voir les tarifs
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          Rejoignez des centaines d'entreprises qui nous font confiance
        </Typography>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountBalance sx={{ fontSize: 32, color: 'white' }} />
                <Typography variant="h6" fontWeight={700} color="white">
                  FiscaSync
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                Solution SaaS de génération de liasses fiscales SYSCOHADA
                pour les entreprises de la zone OHADA.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="white">
                Produit
              </Typography>
              <Stack spacing={1}>
                <Button color="inherit" component={RouterLink} to="/pricing" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Tarifs
                </Button>
                <Button color="inherit" component={RouterLink} to="/features" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Fonctionnalités
                </Button>
                <Button color="inherit" component={RouterLink} to="/demo" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Démo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="white">
                Support
              </Typography>
              <Stack spacing={1}>
                <Button color="inherit" component={RouterLink} to="/docs" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Documentation
                </Button>
                <Button color="inherit" component={RouterLink} to="/contact" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Contact
                </Button>
                <Button color="inherit" component={RouterLink} to="/legal" sx={{ justifyContent: 'flex-start', color: 'white' }}>
                  Mentions légales
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'grey.800', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6, color: 'white' }}>
              © 2025 FiscaSync. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing
