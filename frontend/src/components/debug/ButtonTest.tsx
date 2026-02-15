import { logger } from '@/utils/logger'
/**
 * Composant de test pour diagnostiquer les problèmes de boutons et modales
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';

const ButtonTest: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    logger.debug('DEBUG:', info);
  };

  const handleOpenModal = () => {
    addDebugInfo('🔵 Bouton modal cliqué');
    setModalOpen(true);
    addDebugInfo('🔵 setModalOpen(true) appelé');
  };

  const handleCloseModal = () => {
    addDebugInfo('🔴 Fermeture modal');
    setModalOpen(false);
  };

  const handleSnackbar = () => {
    addDebugInfo('🟡 Bouton snackbar cliqué');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    addDebugInfo('🟡 Fermeture snackbar');
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🐛 Test Diagnostic Boutons et Modales
      </Typography>

      {/* Informations de debug */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6">Debug Info:</Typography>
        <Typography variant="caption">Modal Open: {modalOpen.toString()}</Typography><br/>
        <Typography variant="caption">Snackbar Open: {snackbarOpen.toString()}</Typography>
        <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
          {debugInfo.map((info, index) => (
            <Typography key={index} variant="caption" sx={{ display: 'block' }}>
              {info}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Boutons de test */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{ 
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          🔵 Ouvrir Modal
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleSnackbar}
          color="warning"
        >
          🟡 Notification
        </Button>
        
        <Button
          variant="text"
          onClick={() => addDebugInfo('🟢 Bouton simple cliqué')}
          color="success"
        >
          🟢 Test Simple
        </Button>
        
        <Button
          variant="contained"
          onClick={() => {
            addDebugInfo('🟣 Test console log');
            alert('Test alert natif');
          }}
          color="secondary"
        >
          🟣 Test Alert
        </Button>
      </Box>

      {/* Test Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            ✅ Modal Test Fonctionnelle !
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            🎉 Excellente nouvelle ! Cette modal s'affiche correctement.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Si vous voyez cette modal, cela signifie que :
          </Typography>
          <ul>
            <li>✅ Les événements onClick fonctionnent</li>
            <li>✅ useState fonctionne</li>
            <li>✅ Material-UI Dialog fonctionne</li>
            <li>✅ Le re-rendering React fonctionne</li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Debug: modalOpen = {modalOpen.toString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            ❌ Fermer
          </Button>
          <Button 
            onClick={() => {
              handleCloseModal();
              handleSnackbar();
            }}
            variant="contained"
            color="primary"
          >
            ✅ Fermer + Notification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          🎯 Notification test réussie ! Les snackbars fonctionnent.
        </Alert>
      </Snackbar>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 Instructions de test :
        </Typography>
        <ol>
          <li>Cliquer sur "🔵 Ouvrir Modal" → La modal doit s'afficher</li>
          <li>Cliquer sur "🟡 Notification" → Une notification doit apparaître en haut à droite</li>
          <li>Cliquer sur "🟢 Test Simple" → Le debug info doit se mettre à jour</li>
          <li>Cliquer sur "🟣 Test Alert" → Une alert navigateur doit s'afficher</li>
        </ol>
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
          Si rien ne se passe, vérifiez la console du navigateur (F12) pour les erreurs.
        </Typography>
      </Box>
    </Box>
  );
};

export default ButtonTest;