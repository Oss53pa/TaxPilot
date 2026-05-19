/**
 * InstallAppButton.tsx — Bouton d'installation PWA.
 *
 * Capture l'événement `beforeinstallprompt` (Chrome/Edge/Brave) puis
 * propose un bouton dédié qui déclenche l'install dialog natif. Cela
 * complète :
 *   - L'add-to-homescreen iOS Safari (via meta apple-mobile-web-app-capable)
 *   - L'install via menu navigateur "Installer Liass'Pilot…"
 *   - Le shortcut "Épingler à la barre des tâches" (Windows/macOS)
 *
 * Le bouton n'apparaît que :
 *   - L'app n'est pas déjà en mode standalone (déjà installée)
 *   - Le navigateur a émis beforeinstallprompt (= app éligible installable)
 *
 * Sur iOS Safari (qui n'émet pas beforeinstallprompt) une alternative
 * "Comment installer" est proposée avec mini-tutoriel "Partager > Sur l'écran d'accueil".
 */

import React, { useEffect, useState } from 'react'
import { Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material'
import { GetApp as InstallIcon, IosShare as IosShareIcon } from '@mui/icons-material'
import { logger } from '@/utils/logger'

/**
 * Forme du prompt d'installation PWA exposé par Chrome/Edge via
 * l'événement beforeinstallprompt. Non typé dans les `lib.dom.d.ts`.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // Modern : matchMedia
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari legacy
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

interface InstallAppButtonProps {
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'outlined',
  size = 'small',
  showLabel = true,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [iosHelpOpen, setIosHelpOpen] = useState(false)

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher le mini-infobar Chrome par défaut
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Cas iOS Safari : afficher tuto manuel
      if (isIOS()) {
        setIosHelpOpen(true)
      }
      return
    }
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferredPrompt(null)
    } catch (err) {
      logger.error('[PWA] Install prompt failed:', err)
    }
  }

  // Si déjà installé, ne rien afficher
  if (installed) return null

  // Si pas de prompt Chrome/Edge mais iOS, afficher quand même un bouton "Comment installer"
  const ios = isIOS()
  if (!deferredPrompt && !ios) return null

  const label = ios ? 'Installer sur iOS' : 'Installer l\'app'

  return (
    <>
      <Tooltip title="Ajoutez Liass'Pilot à vos favoris / barre des tâches pour un accès rapide">
        <Button
          variant={variant}
          size={size}
          startIcon={ios ? <IosShareIcon /> : <InstallIcon />}
          onClick={handleInstallClick}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {showLabel ? label : ''}
        </Button>
      </Tooltip>

      <Dialog open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Installer Liass'Pilot sur iOS</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Pour épingler Liass'Pilot à votre écran d'accueil :
          </Typography>
          <Box component="ol" sx={{ pl: 2.5, mt: 1.5 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Touchez le bouton <strong>Partager</strong> <IosShareIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} /> en bas de l'écran
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Faites défiler et choisissez <strong>Sur l'écran d'accueil</strong>
            </Typography>
            <Typography component="li" variant="body2">
              Validez avec <strong>Ajouter</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIosHelpOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InstallAppButton
