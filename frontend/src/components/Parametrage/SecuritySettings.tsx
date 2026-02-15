import { logger } from '@/utils/logger'
/**
 * Composant de paramètres de sécurité
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material'
import {
  Security,
  VpnKey,
  Schedule,
  Fingerprint,
  Shield,
  Warning,
  CheckCircle,
  History,
  Lock,
  Person,
} from '@mui/icons-material'

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: true,
    sessionTimeout: 30,
    loginAttempts: 3,
    ipRestriction: false,
    auditLog: true,
    dataEncryption: true,
    backupFrequency: 'daily',
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // Logique de sauvegarde
    logger.debug('Saving security settings:', settings)
  }

  const securityScore = 85 // Calcul du score de sécurité

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Paramètres de Sécurité
      </Typography>

      {/* Score de sécurité */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: securityScore >= 80 ? 'success.light' : 'warning.light', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Shield fontSize="large" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {securityScore}%
            </Typography>
            <Typography>Score de Sécurité</Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Authentification */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Authentification"
              avatar={<VpnKey color="primary" />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                  />
                }
                label="Authentification à deux facteurs"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordExpiry}
                    onChange={(e) => handleSettingChange('passwordExpiry', e.target.checked)}
                  />
                }
                label="Expiration des mots de passe"
              />

              <TextField
                fullWidth
                label="Tentatives de connexion max"
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                sx={{ mt: 2 }}
                inputProps={{ min: 1, max: 10 }}
              />

              <Button
                variant="outlined"
                onClick={() => setDialogOpen(true)}
                sx={{ mt: 2 }}
                startIcon={<Lock />}
              >
                Politique des mots de passe
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Gestion des sessions"
              avatar={<Schedule color="primary" />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="Timeout de session (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 480 }}
                helperText="Durée avant déconnexion automatique"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ipRestriction}
                    onChange={(e) => handleSettingChange('ipRestriction', e.target.checked)}
                  />
                }
                label="Restriction par adresses IP"
                sx={{ mt: 2 }}
              />

              {settings.ipRestriction && (
                <TextField
                  fullWidth
                  label="Adresses IP autorisées"
                  placeholder="192.168.1.0/24, 10.0.0.1"
                  multiline
                  rows={3}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Audit et surveillance */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Audit et Surveillance"
              avatar={<History color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.auditLog}
                        onChange={(e) => handleSettingChange('auditLog', e.target.checked)}
                      />
                    }
                    label="Journaux d'audit"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataEncryption}
                        onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
                      />
                    }
                    label="Chiffrement des données"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Fréquence de sauvegarde"
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertes de sécurité récentes */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Alertes de Sécurité Récentes"
              avatar={<Warning color="warning" />}
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dernière sauvegarde réussie"
                    secondary="Il y a 2 heures"
                  />
                  <Chip label="OK" color="success" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Person color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Nouvelle connexion détectée"
                    secondary="admin@taxpilot.com - IP: 192.168.1.100"
                  />
                  <Chip label="Normal" color="info" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Fingerprint color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Certificat SSL expire bientôt"
                    secondary="Expiration dans 30 jours"
                  />
                  <Chip label="À surveiller" color="warning" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          startIcon={<Security />}
        >
          Sauvegarder les paramètres
        </Button>
        <Button variant="outlined">
          Réinitialiser
        </Button>
      </Box>

      {/* Dialog pour politique de mots de passe */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Politique des mots de passe</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Longueur minimale"
                type="number"
                value={passwordPolicy.minLength}
                onChange={(e) => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
                inputProps={{ min: 4, max: 32 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={passwordPolicy.requireUppercase}
                    onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                  />
                }
                label="Exiger des majuscules"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={passwordPolicy.requireNumbers}
                    onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                  />
                }
                label="Exiger des chiffres"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={passwordPolicy.requireSpecialChars}
                    onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                  />
                }
                label="Exiger des caractères spéciaux"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alertes importantes */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Recommandation :</strong> Activez l'authentification à deux facteurs pour une sécurité optimale.
        </Alert>
        
        <Alert severity="warning">
          <strong>Attention :</strong> Les modifications de sécurité peuvent affecter l'accès des utilisateurs existants.
        </Alert>
      </Box>
    </Box>
  )
}

export default SecuritySettings