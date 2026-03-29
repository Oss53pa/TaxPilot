import React, { useState } from 'react'
import {
  Box, Typography, Paper, TextField, Button, Alert, Stack, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  Send as SendIcon,
  Email as EmailIcon,
  MenuBook as DocsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'

const SupportPage: React.FC = () => {
  const [form, setForm] = useState({ sujet: '', categorie: 'technique', message: '', priorite: 'normale', dossier: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    const mailto = `mailto:support@liasspilot.com?subject=${encodeURIComponent(
      `[${form.categorie.toUpperCase()}] ${form.sujet}`
    )}&body=${encodeURIComponent(
      `Dossier : ${form.dossier || 'Non précisé'}\nPriorité : ${form.priorite}\n\n${form.message}`
    )}`
    window.open(mailto)
    setSent(true)
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4, px: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Support LiassPilot</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Notre équipe répond sous 24h (jours ouvrés). Pour les urgences fiscales, indiquez la priorité "Haute".
      </Typography>

      {sent ? (
        <Paper sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'success.light' }}>
          <CheckIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.dark' }}>Message envoyé</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Nous vous répondrons sous 24h ouvrées.</Typography>
          <Button onClick={() => setSent(false)} sx={{ mt: 3 }}>Envoyer un autre message</Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Catégorie</InputLabel>
              <Select value={form.categorie} label="Catégorie"
                onChange={e => setForm({ ...form, categorie: e.target.value })}>
                <MenuItem value="technique">Problème technique</MenuItem>
                <MenuItem value="fiscal">Question fiscale / SYSCOHADA</MenuItem>
                <MenuItem value="facturation">Facturation / Abonnement</MenuItem>
                <MenuItem value="formation">Demande de formation</MenuItem>
                <MenuItem value="autre">Autre</MenuItem>
              </Select>
            </FormControl>

            <TextField size="small" label="Dossier concerné (optionnel)" value={form.dossier}
              onChange={e => setForm({ ...form, dossier: e.target.value })}
              placeholder="Nom de la société / exercice" fullWidth />

            <TextField size="small" label="Sujet" value={form.sujet} required
              onChange={e => setForm({ ...form, sujet: e.target.value })}
              placeholder="Décrivez brièvement votre problème" fullWidth />

            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Priorité</Typography>
              <ToggleButtonGroup value={form.priorite} exclusive size="small"
                onChange={(_, v) => v && setForm({ ...form, priorite: v })}>
                <ToggleButton value="normale" sx={{ textTransform: 'none' }}>Normale</ToggleButton>
                <ToggleButton value="haute" sx={{ textTransform: 'none', color: 'warning.main' }}>Haute</ToggleButton>
                <ToggleButton value="urgente" sx={{ textTransform: 'none', color: 'error.main' }}>Urgente</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField label="Message" value={form.message} required multiline minRows={5} maxRows={10}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Décrivez votre problème en détail..." fullWidth />

            <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmit}
              disabled={!form.sujet || !form.message} fullWidth size="large">
              Envoyer la demande
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Card sx={{ flex: 1 }} elevation={0}>
          <CardContent sx={{ textAlign: 'center' }}>
            <EmailIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Email support</Typography>
            <Typography variant="body2" color="primary" component="a" href="mailto:support@liasspilot.com"
              sx={{ textDecoration: 'none' }}>
              support@liasspilot.com
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }} elevation={0}>
          <CardContent sx={{ textAlign: 'center' }}>
            <DocsIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Documentation</Typography>
            <Typography variant="body2" color="primary">Consulter l'aide en ligne</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

export default SupportPage
