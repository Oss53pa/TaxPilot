import { logger } from '@/utils/logger'
/**
 * Composant de configuration des paramètres régionaux
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import {
  Public as PublicIcon,
  Language as LanguageIcon,
  AttachMoney as CurrencyIcon,
  Schedule as TimezoneIcon,
  DateRange as DateIcon,
  Pin as NumberIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

interface RegionalConfig {
  country: string
  currency: string
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
}

const RegionalSettings: React.FC = () => {
  const [config, setConfig] = useState<RegionalConfig>({
    country: 'CI', // Côte d'Ivoire par défaut pour TaxPilot
    currency: 'XOF', // Franc CFA
    language: 'fr',
    timezone: 'Africa/Abidjan',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-CI'
  })

  const [saved, setSaved] = useState(false)

  // Données de référence
  const countries = [
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Abidjan' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Dakar' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Ouagadougou' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Bamako' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Lome' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Porto-Novo' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Niamey' },
    { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', defaultCurrency: 'XOF', defaultTimezone: 'Africa/Bissau' },
    { code: 'FR', name: 'France', flag: '🇫🇷', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Paris' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', defaultCurrency: 'CAD', defaultTimezone: 'America/Montreal' },
  ]

  const currencies = [
    { code: 'XOF', name: 'Franc CFA (FCFA)', symbol: 'FCFA', region: 'UEMOA' },
    { code: 'EUR', name: 'Euro', symbol: '€', region: 'Europe' },
    { code: 'USD', name: 'Dollar américain', symbol: '$', region: 'International' },
    { code: 'CAD', name: 'Dollar canadien', symbol: 'CAD', region: 'Canada' },
    { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', region: 'Suisse' },
  ]

  const languages = [
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'en', name: 'Anglais', nativeName: 'English' },
    { code: 'es', name: 'Espagnol', nativeName: 'Español' },
    { code: 'pt', name: 'Portugais', nativeName: 'Português' },
  ]

  const timezones = [
    { code: 'Africa/Abidjan', name: 'Abidjan (UTC+0)', region: 'Côte d\'Ivoire' },
    { code: 'Africa/Dakar', name: 'Dakar (UTC+0)', region: 'Sénégal' },
    { code: 'Africa/Ouagadougou', name: 'Ouagadougou (UTC+0)', region: 'Burkina Faso' },
    { code: 'Africa/Bamako', name: 'Bamako (UTC+0)', region: 'Mali' },
    { code: 'Europe/Paris', name: 'Paris (UTC+1)', region: 'France' },
    { code: 'America/Montreal', name: 'Montréal (UTC-5)', region: 'Canada' },
    { code: 'UTC', name: 'UTC (UTC+0)', region: 'Universel' },
  ]

  const dateFormats = [
    { code: 'DD/MM/YYYY', name: 'JJ/MM/AAAA', example: '25/12/2024', region: 'France, Afrique francophone' },
    { code: 'MM/DD/YYYY', name: 'MM/JJ/AAAA', example: '12/25/2024', region: 'États-Unis' },
    { code: 'YYYY-MM-DD', name: 'AAAA-MM-JJ', example: '2024-12-25', region: 'ISO 8601' },
    { code: 'DD.MM.YYYY', name: 'JJ.MM.AAAA', example: '25.12.2024', region: 'Allemagne, Suisse' },
  ]

  const numberFormats = [
    { code: 'fr-CI', name: '1 234,56', example: '1 234 567,89 FCFA', region: 'France, Afrique francophone' },
    { code: 'en-US', name: '1,234.56', example: '1,234,567.89 USD', region: 'États-Unis' },
    { code: 'de-DE', name: '1.234,56', example: '1.234.567,89 EUR', region: 'Allemagne' },
    { code: 'en-GB', name: '1,234.56', example: '1,234,567.89 GBP', region: 'Royaume-Uni' },
  ]

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setConfig(prev => ({
        ...prev,
        country: countryCode,
        currency: country.defaultCurrency,
        timezone: country.defaultTimezone,
      }))
    }
  }

  const handleSave = () => {
    // Logique de sauvegarde
    logger.debug('Saving regional settings:', config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setConfig({
      country: 'CI',
      currency: 'XOF',
      language: 'fr',
      timezone: 'Africa/Abidjan',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'fr-CI'
    })
  }

  const selectedCountry = countries.find(c => c.code === config.country)
  const selectedCurrency = currencies.find(c => c.code === config.currency)
  const selectedLanguage = languages.find(l => l.code === config.language)
  const selectedTimezone = timezones.find(t => t.code === config.timezone)
  const selectedDateFormat = dateFormats.find(d => d.code === config.dateFormat)
  const selectedNumberFormat = numberFormats.find(n => n.code === config.numberFormat)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Paramètres régionaux
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Paramètres régionaux sauvegardés avec succès !
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Pays/Région */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PublicIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Pays/Région
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Sélectionner le pays</InputLabel>
                <Select
                  value={config.country}
                  label="Sélectionner le pays"
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{country.flag}</span>
                        {country.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCountry && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Actuellement sélectionné : {selectedCountry.flag} {selectedCountry.name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Devise */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Devise
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Devise par défaut</InputLabel>
                <Select
                  value={config.currency}
                  label="Devise par défaut"
                  onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      <Box>
                        <Typography>{currency.name} ({currency.symbol})</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currency.region}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCurrency && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${selectedCurrency.symbol} - ${selectedCurrency.region}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Langue */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LanguageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Langue
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Langue de l'interface</InputLabel>
                <Select
                  value={config.language}
                  label="Langue de l'interface"
                  onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                >
                  {languages.map((language) => (
                    <MenuItem key={language.code} value={language.code}>
                      <Box>
                        <Typography>{language.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {language.nativeName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedLanguage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Interface en {selectedLanguage.nativeName}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Fuseau horaire */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimezoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Fuseau horaire
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Fuseau horaire</InputLabel>
                <Select
                  value={config.timezone}
                  label="Fuseau horaire"
                  onChange={(e) => setConfig(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  {timezones.map((timezone) => (
                    <MenuItem key={timezone.code} value={timezone.code}>
                      <Box>
                        <Typography>{timezone.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {timezone.region}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedTimezone && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Heure actuelle : {new Date().toLocaleTimeString('fr-FR', { timeZone: config.timezone })}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Format de date */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Format de date
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Format d'affichage des dates</InputLabel>
                <Select
                  value={config.dateFormat}
                  label="Format d'affichage des dates"
                  onChange={(e) => setConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  {dateFormats.map((format) => (
                    <MenuItem key={format.code} value={format.code}>
                      <Box>
                        <Typography>{format.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Exemple : {format.example} • {format.region}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDateFormat && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Exemple : ${selectedDateFormat.example}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Format des nombres */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NumberIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Format des nombres
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Format d'affichage des nombres</InputLabel>
                <Select
                  value={config.numberFormat}
                  label="Format d'affichage des nombres"
                  onChange={(e) => setConfig(prev => ({ ...prev, numberFormat: e.target.value }))}
                >
                  {numberFormats.map((format) => (
                    <MenuItem key={format.code} value={format.code}>
                      <Box>
                        <Typography>{format.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Exemple : {format.example} • {format.region}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedNumberFormat && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Exemple : ${selectedNumberFormat.example}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aperçu des paramètres */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Aperçu de la configuration régionale
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Pays :</strong> {selectedCountry?.flag} {selectedCountry?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Devise :</strong> {selectedCurrency?.name} ({selectedCurrency?.symbol})
              </Typography>
              <Typography variant="body2">
                <strong>Langue :</strong> {selectedLanguage?.nativeName}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Fuseau horaire :</strong> {selectedTimezone?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Format de date :</strong> {selectedDateFormat?.example}
              </Typography>
              <Typography variant="body2">
                <strong>Format des nombres :</strong> {selectedNumberFormat?.name}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
        >
          Réinitialiser
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Sauvegarder
        </Button>
      </Box>
    </Box>
  )
}

export default RegionalSettings