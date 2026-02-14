/**
 * Wrapper pour récupérer l'organization slug depuis l'URL ou le store
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CircularProgress, Box, Alert } from '@mui/material'
import organizationService from '../../services/organizationService'

interface OrganizationWrapperProps {
  children: (organizationSlug: string) => React.ReactNode
}

const OrganizationWrapper: React.FC<OrganizationWrapperProps> = ({ children }) => {
  const { slug } = useParams<{ slug?: string }>()
  const [organizationSlug, setOrganizationSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrganization()
  }, [slug])

  const loadOrganization = async () => {
    try {
      setLoading(true)
      setError(null)

      // Si on a un slug dans l'URL, l'utiliser directement
      if (slug) {
        setOrganizationSlug(slug)
      } else {
        // Sinon, récupérer l'organisation courante de l'utilisateur
        const currentOrg = await organizationService.getCurrent()
        if (currentOrg) {
          setOrganizationSlug(currentOrg.slug)
        } else {
          setError('Aucune organisation trouvée')
        }
      }
    } catch (err: any) {
      console.error('Error loading organization:', err)
      setError(err.message || 'Erreur lors du chargement de l\'organisation')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !organizationSlug) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Organisation introuvable'}
        </Alert>
      </Box>
    )
  }

  return <>{children(organizationSlug)}</>
}

export default OrganizationWrapper
