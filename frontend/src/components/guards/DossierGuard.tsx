/**
 * DossierGuard — En mode Cabinet, redirige vers /dossiers si aucun dossier n'est actif.
 * En mode Entreprise, laisse passer directement.
 */
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useModeStore } from '@/store/modeStore'
import { useDossierStore } from '@/store/dossierStore'

const DossierGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userMode = useModeStore(s => s.userMode)
  const activeDossierId = useDossierStore(s => s.activeDossierId)

  if (userMode === 'cabinet' && !activeDossierId) {
    return <Navigate to="/dossiers" replace />
  }

  return <>{children}</>
}

export default DossierGuard
