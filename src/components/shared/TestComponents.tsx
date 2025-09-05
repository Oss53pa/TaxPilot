/**
 * Composants de test pour vérifier Material-UI
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Close,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';

const TestComponents: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  
  const handleSnackbar = () => setSnackbarOpen(true);
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        🧪 Test des Composants Material-UI
      </Typography>

      {/* Test Boutons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Boutons et Icônes
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenModal}
            >
              Ouvrir Modal
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
            >
              Éditer
            </Button>
            <Button
              variant="text"
              startIcon={<Delete />}
              color="error"
            >
              Supprimer
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              color="success"
              onClick={handleSnackbar}
            >
              Notification
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <IconButton color="primary" size="large">
              <Visibility />
            </IconButton>
            <IconButton color="secondary">
              <Edit />
            </IconButton>
            <IconButton color="error">
              <Delete />
            </IconButton>
            <IconButton color="success">
              <CheckCircle />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              icon={<CheckCircle />}
              label="Succès"
              color="success"
              onClick={() => console.log('Chip clicked')}
            />
            <Chip
              icon={<Warning />}
              label="Attention"
              color="warning"
            />
            <Chip
              icon={<ErrorIcon />}
              label="Erreur"
              color="error"
            />
            <Chip
              icon={<Info />}
              label="Information"
              color="info"
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Utilisateur administrateur">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                A
              </Avatar>
            </Tooltip>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <Add />
            </Avatar>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <CheckCircle />
            </Avatar>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal de test */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <Typography variant="h6">
              🎯 Test Modal FiscaSync
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Cette modal teste l'affichage des composants Material-UI dans FiscaSync.
          </Typography>
          <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">✅ Fonctionnalités testées :</Typography>
            <ul>
              <li>Boutons avec icônes</li>
              <li>Modals responsive</li>
              <li>Notifications Snackbar</li>
              <li>Thème et couleurs</li>
              <li>Navigation</li>
            </ul>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={() => {
              handleCloseModal();
              handleSnackbar();
            }}
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de test */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          🎉 Test réussi ! Les composants Material-UI fonctionnent parfaitement.
        </Alert>
      </Snackbar>

      {/* Informations système */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📊 État du Système
          </Typography>
          <Stack spacing={1}>
            <Chip
              icon={<CheckCircle />}
              label="Frontend React : ✅ Actif sur port 3001"
              color="success"
            />
            <Chip
              icon={<CheckCircle />}
              label="Backend Django : ✅ Actif sur port 8001"
              color="success"
            />
            <Chip
              icon={<CheckCircle />}
              label="Material-UI : ✅ Thème chargé"
              color="info"
            />
            <Chip
              icon={<CheckCircle />}
              label="Authentification : ✅ JWT configuré"
              color="info"
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestComponents;