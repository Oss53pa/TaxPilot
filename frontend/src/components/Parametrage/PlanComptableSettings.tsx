/**
 * Composant de paramétrage des plans comptables
 */

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // TextField,
  Grid,
} from '@mui/material'
import {
  AccountBalance,
  Add,
  Download,
  Upload,
  Visibility,
  CheckCircle,
} from '@mui/icons-material'

interface PlanComptable {
  id: string
  nom: string
  type: string
  version: string
  dateApplication: string
  nbComptes: number
  statut: 'ACTIF' | 'INACTIF' | 'BROUILLON'
  estOfficiel: boolean
}

// Données factices pour la démo
const mockPlans: PlanComptable[] = [
  {
    id: '1',
    nom: 'SYSCOHADA Révisé - Général',
    type: 'SYSCOHADA_GENERAL',
    version: '2017',
    dateApplication: '2018-01-01',
    nbComptes: 847,
    statut: 'ACTIF',
    estOfficiel: true,
  },
  {
    id: '2',
    nom: 'SYSCOHADA - Banques',
    type: 'SYSCOHADA_BANQUE',
    version: '2017',
    dateApplication: '2018-01-01',
    nbComptes: 1205,
    statut: 'INACTIF',
    estOfficiel: true,
  },
  {
    id: '3',
    nom: 'Plan Personnalisé DEMO',
    type: 'PERSONNALISE',
    version: '1.0',
    dateApplication: '2024-01-01',
    nbComptes: 650,
    statut: 'BROUILLON',
    estOfficiel: false,
  },
]

const typesPlans = [
  { value: 'SYSCOHADA_GENERAL', label: 'SYSCOHADA Général' },
  { value: 'SYSCOHADA_BANQUE', label: 'SYSCOHADA Bancaire' },
  { value: 'SYSCOHADA_ASSURANCE', label: 'SYSCOHADA Assurance' },
  { value: 'SYSCOHADA_MICROFINANCE', label: 'SYSCOHADA Microfinance' },
  { value: 'IFRS_SME', label: 'IFRS pour PME' },
  { value: 'IFRS_FULL', label: 'IFRS Complet' },
  { value: 'PERSONNALISE', label: 'Plan Personnalisé' },
]

const PlanComptableSettings: React.FC = () => {
  const [plans] = useState<PlanComptable[]>(mockPlans)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanComptable | null>(null)

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ACTIF':
        return 'success'
      case 'INACTIF':
        return 'default'
      case 'BROUILLON':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    return typesPlans.find(t => t.value === type)?.label || type
  }

  const handleViewPlan = (plan: PlanComptable) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const planActif = plans.find(p => p.statut === 'ACTIF')

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Plans Comptables
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestion des plans comptables et référentiels
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            size="small"
          >
            Importer Plan
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            onClick={() => setDialogOpen(true)}
          >
            Nouveau Plan
          </Button>
        </Box>
      </Box>

      {/* Plan comptable actif */}
      {planActif && (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => handleViewPlan(planActif)}
            >
              Voir Détails
            </Button>
          }
        >
          <strong>Plan actif :</strong> {planActif.nom} - {planActif.nbComptes} comptes configurés
        </Alert>
      )}

      {/* Sélection du plan comptable */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Configuration Active"
          avatar={<AccountBalance color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Plan Comptable Principal</InputLabel>
                <Select
                  value={planActif?.id || ''}
                  label="Plan Comptable Principal"
                >
                  {plans.filter(p => p.statut !== 'BROUILLON').map(plan => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.nom} v{plan.version}
                      {plan.estOfficiel && (
                        <Chip label="Officiel" size="small" color="primary" sx={{ ml: 1 }} />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={planActif ? `${planActif.nbComptes} comptes` : 'Aucun plan'}
                  color="info"
                  variant="outlined"
                />
                <Chip
                  label={planActif ? getTypeLabel(planActif.type) : 'Non défini'}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des plans disponibles */}
      <Card>
        <CardHeader
          title="Plans Comptables Disponibles"
          subheader="Gérez vos plans comptables et leurs versions"
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan Comptable</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Comptes</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plan.nom}
                          {plan.estOfficiel && (
                            <Chip 
                              label="Officiel" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Application : {new Date(plan.dateApplication).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {getTypeLabel(plan.type)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        v{plan.version}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {plan.nbComptes.toLocaleString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={plan.statut}
                        color={getStatutColor(plan.statut) as any}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewPlan(plan)}
                        >
                          Voir
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          variant="outlined"
                        >
                          Export
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog de détail/création */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan ? `Détails - ${selectedPlan.nom}` : 'Nouveau Plan Comptable'}
        </DialogTitle>
        <DialogContent>
          {selectedPlan ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Fonctionnalité de consultation détaillée en cours de développement
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{getTypeLabel(selectedPlan.type)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Version</Typography>
                  <Typography variant="body1">v{selectedPlan.version}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Nombre de comptes</Typography>
                  <Typography variant="body1">{selectedPlan.nbComptes.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Statut</Typography>
                  <Chip
                    label={selectedPlan.statut}
                    color={getStatutColor(selectedPlan.statut) as any}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              Fonctionnalité de création de plan comptable en cours de développement
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Fermer
          </Button>
          {selectedPlan && (
            <Button variant="contained">
              Activer ce Plan
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PlanComptableSettings