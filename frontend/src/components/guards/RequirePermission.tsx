import React from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { Lock as LockIcon } from '@mui/icons-material'
import { usePermission, type Permission } from '@/hooks/usePermission'

interface RequirePermissionProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
  silent?: boolean // If true, renders nothing instead of error message
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback,
  silent = false,
}) => {
  const hasPermission = usePermission(permission)

  if (!hasPermission) {
    if (silent) return null
    if (fallback) return <>{fallback}</>
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Accès restreint
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
          Vous n'avez pas la permission requise pour cette action.
          Contactez l'administrateur de votre organisation.
        </Alert>
      </Box>
    )
  }

  return <>{children}</>
}

export default RequirePermission
