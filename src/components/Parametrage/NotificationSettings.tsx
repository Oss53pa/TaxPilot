/**
 * Composant de paramètres de notifications
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
  ListItemSecondaryAction,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
} from '@mui/material'
import {
  Notifications,
  Email,
  Sms,
  Computer,
  ExpandMore,
  VolumeUp,
  Schedule,
  Warning,
  Info,
  Error,
  CheckCircle,
  Settings as SettingsIcon,
  Delete,
  Add,
} from '@mui/icons-material'

interface NotificationRule {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  condition: string
  enabled: boolean
  recipients: string[]
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    soundEnabled: true,
    volume: 70,
    quietHours: { start: '22:00', end: '08:00' },
    frequency: 'immediate', // immediate, hourly, daily
  })

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Erreurs critiques',
      type: 'email',
      condition: 'Erreur dans la génération de liasse',
      enabled: true,
      recipients: ['admin@fiscasync.com']
    },
    {
      id: '2', 
      name: 'Fin de traitement',
      type: 'push',
      condition: 'Liasse générée avec succès',
      enabled: true,
      recipients: []
    }
  ])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleRuleToggle = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const addNewRule = () => {
    const newRule: NotificationRule = {
      id: Date.now().toString(),
      name: 'Nouvelle règle',
      type: 'email',
      condition: 'Condition personnalisée',
      enabled: true,
      recipients: []
    }
    setRules(prev => [...prev, newRule])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Email />
      case 'sms': return <Sms />
      case 'push': return <Computer />
      default: return <Notifications />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'primary' as const
      case 'sms': return 'secondary' as const
      case 'push': return 'info' as const
      default: return 'default' as const
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Paramètres de Notifications
      </Typography>

      <Grid container spacing={3}>
        {/* Paramètres généraux */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Paramètres généraux"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailEnabled}
                    onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                  />
                }
                label="Notifications par email"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsEnabled}
                    onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
                  />
                }
                label="Notifications par SMS"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushEnabled}
                    onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
                  />
                }
                label="Notifications push"
              />

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Fréquence des notifications</InputLabel>
                <Select
                  value={settings.frequency}
                  onChange={(e) => handleSettingChange('frequency', e.target.value)}
                >
                  <MenuItem value="immediate">Immédiate</MenuItem>
                  <MenuItem value="hourly">Toutes les heures</MenuItem>
                  <MenuItem value="daily">Quotidienne</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Paramètres audio */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Paramètres audio"
              avatar={<VolumeUp color="primary" />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  />
                }
                label="Sons de notification"
              />
              
              {settings.soundEnabled && (
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>Volume: {settings.volume}%</Typography>
                  <Slider
                    value={settings.volume}
                    onChange={(e, value) => handleSettingChange('volume', value)}
                    min={0}
                    max={100}
                    step={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Heures silencieuses
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Début"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleSettingChange('quietHours', { 
                      ...settings.quietHours, 
                      start: e.target.value 
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Fin"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleSettingChange('quietHours', { 
                      ...settings.quietHours, 
                      end: e.target.value 
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Règles de notification */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Règles de notification"
              avatar={<Warning color="warning" />}
              action={
                <Button
                  startIcon={<Add />}
                  onClick={addNewRule}
                  variant="outlined"
                  size="small"
                >
                  Ajouter une règle
                </Button>
              }
            />
            <CardContent>
              <List>
                {rules.map((rule) => (
                  <ListItem key={rule.id} divider>
                    <ListItemIcon>
                      {getTypeIcon(rule.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={rule.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={rule.type.toUpperCase()} 
                            size="small" 
                            color={getTypeColor(rule.type)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {rule.condition}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={rule.enabled}
                          onChange={() => handleRuleToggle(rule.id)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRule(rule.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Types de notifications */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Types de notifications disponibles"
              avatar={<Info color="info" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                {[
                  { icon: <Error color="error" />, title: 'Erreurs critiques', desc: 'Problèmes nécessitant une intervention immédiate' },
                  { icon: <Warning color="warning" />, title: 'Avertissements', desc: 'Situations nécessitant une attention particulière' },
                  { icon: <CheckCircle color="success" />, title: 'Succès', desc: 'Opérations terminées avec succès' },
                  { icon: <Info color="info" />, title: 'Informations', desc: 'Mises à jour générales du système' },
                  { icon: <Schedule color="primary" />, title: 'Échéances', desc: 'Rappels de dates importantes' },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      {item.icon}
                      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Notifications />}
        >
          Sauvegarder les paramètres
        </Button>
        <Button variant="outlined">
          Tester les notifications
        </Button>
        <Button variant="outlined">
          Réinitialiser
        </Button>
      </Box>

      {/* Alertes d'information */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Conseil :</strong> Configurez des règles spécifiques pour recevoir uniquement les notifications importantes.
        </Alert>
        
        <Alert severity="warning">
          <strong>Attention :</strong> Les notifications SMS peuvent engendrer des frais selon votre opérateur.
        </Alert>
      </Box>
    </Box>
  )
}

export default NotificationSettings