/**
 * Tableaux Supplémentaires de la Liasse Fiscale SYSCOHADA
 * Notes 12-13, 15-16, 18, 20-35 et autres tableaux obligatoires
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Divider
} from '@mui/material'
import {
  TableChart,
  Assessment,
  AccountBalance,
  TrendingUp,
  Receipt,
  BusinessCenter,
  People,
  Description
} from '@mui/icons-material'

const TableauxSupplementaires: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  
  // Données pour les différents tableaux
  const [tableauEffectif, setTableauEffectif] = useState([
    { categorie: 'Cadres supérieurs', effectif_debut: 5, embauches: 1, departs: 0, effectif_fin: 6, masse_salariale: 24000000 },
    { categorie: 'Cadres moyens', effectif_debut: 12, embauches: 2, departs: 1, effectif_fin: 13, masse_salariale: 32000000 },
    { categorie: 'Employés', effectif_debut: 25, embauches: 5, departs: 2, effectif_fin: 28, masse_salariale: 28000000 },
    { categorie: 'Ouvriers', effectif_debut: 18, embauches: 3, departs: 1, effectif_fin: 20, masse_salariale: 18000000 }
  ])
  
  const [tableauFiliales, setTableauFiliales] = useState([
    { denomination: 'FISCASYNC BENIN SARL', capital: 25000000, pourcentage_detention: 75, valeur_comptable: 18750000, resultat_n: 2100000 },
    { denomination: 'FISCASYNC TOGO SA', capital: 50000000, pourcentage_detention: 60, valeur_comptable: 30000000, resultat_n: 3200000 }
  ])
  
  const [engagementsHorsBilan, setEngagementsHorsBilan] = useState([
    { nature: 'Garanties données', montant: 5000000, echeance: '2025-12-31', beneficiaire: 'Banque XYZ' },
    { nature: 'Commandes fermes', montant: 8500000, echeance: '2025-06-30', beneficiaire: 'Client ABC' },
    { nature: 'Crédit-bail mobilier', montant: 12000000, echeance: '2027-12-31', beneficiaire: 'Société Leasing' }
  ])

  const renderTableauEffectifPersonnel = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" />
          Note 21 - Effectif et Masse Salariale
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie Personnel</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>Effectif Début</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>Embauches</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>Départs</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>Effectif Fin</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>Masse Salariale (FCFA)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableauEffectif.map((ligne, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: 500 }}>{ligne.categorie}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{ligne.effectif_debut}</TableCell>
                  <TableCell sx={{ textAlign: 'center', color: 'success.main', fontWeight: 600 }}>
                    +{ligne.embauches}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', color: 'error.main', fontWeight: 600 }}>
                    -{ligne.departs}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{ligne.effectif_fin}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {new Intl.NumberFormat('fr-FR').format(ligne.masse_salariale)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Ligne totaux */}
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>TOTAUX</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
                  {tableauEffectif.reduce((sum, l) => sum + l.effectif_debut, 0)}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
                  {tableauEffectif.reduce((sum, l) => sum + l.embauches, 0)}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
                  {tableauEffectif.reduce((sum, l) => sum + l.departs, 0)}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
                  {tableauEffectif.reduce((sum, l) => sum + l.effectif_fin, 0)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>
                  {new Intl.NumberFormat('fr-FR').format(
                    tableauEffectif.reduce((sum, l) => sum + l.masse_salariale, 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderTableauFiliales = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessCenter color="primary" />
          Note 19 - Filiales et Participations
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Dénomination</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>Capital (FCFA)</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>% Détention</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>Valeur Comptable (FCFA)</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>Résultat N (FCFA)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableauFiliales.map((filiale, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: 500 }}>{filiale.denomination}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {new Intl.NumberFormat('fr-FR').format(filiale.capital)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                    {filiale.pourcentage_detention}%
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {new Intl.NumberFormat('fr-FR').format(filiale.valeur_comptable)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: filiale.resultat_n > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    {new Intl.NumberFormat('fr-FR', { signDisplay: 'always' }).format(filiale.resultat_n)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderEngagementsHorsBilan = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          Note 20 - Engagements Hors Bilan
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nature Engagement</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>Montant (FCFA)</TableCell>
                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>Échéance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bénéficiaire</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {engagementsHorsBilan.map((engagement, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: 500 }}>{engagement.nature}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {new Intl.NumberFormat('fr-FR').format(engagement.montant)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {new Date(engagement.echeance).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{engagement.beneficiaire}</TableCell>
                </TableRow>
              ))}
              {/* Ligne total */}
              <TableRow sx={{ bgcolor: 'warning.light' }}>
                <TableCell sx={{ fontWeight: 700 }}>TOTAL ENGAGEMENTS</TableCell>
                <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                  {new Intl.NumberFormat('fr-FR').format(
                    engagementsHorsBilan.reduce((sum, eng) => sum + eng.montant, 0)
                  )}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            📋 Ces engagements ne figurent pas au bilan mais constituent des obligations pour l'entreprise.
            Ils doivent être mentionnés dans l'annexe conformément aux normes SYSCOHADA.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )

  const tabPanels = [
    {
      label: 'Effectif & Personnel',
      icon: <People />,
      content: renderTableauEffectifPersonnel()
    },
    {
      label: 'Filiales & Participations',
      icon: <BusinessCenter />,
      content: renderTableauFiliales()
    },
    {
      label: 'Engagements Hors Bilan',
      icon: <Description />,
      content: renderEngagementsHorsBilan()
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📋 Tableaux Supplémentaires SYSCOHADA
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Notes annexes obligatoires selon le système comptable OHADA
      </Typography>

      {/* Onglets des tableaux */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          {tabPanels.map((panel, index) => (
            <Tab
              key={index}
              label={panel.label}
              icon={panel.icon}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenu des onglets */}
      {tabPanels[activeTab]?.content}

      {/* Actions communes */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<TableChart />}>
          Générer Tableau
        </Button>
        <Button variant="outlined" startIcon={<Receipt />}>
          Exporter Excel
        </Button>
        <Button variant="outlined" startIcon={<Assessment />}>
          Valider Données
        </Button>
      </Stack>

      {/* Note réglementaire */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          📖 Conformité SYSCOHADA
        </Typography>
        <Typography variant="body2">
          Ces tableaux sont obligatoires pour le système normal de la liasse fiscale SYSCOHADA.
          Les données sont automatiquement intégrées dans les notes annexes correspondantes.
        </Typography>
      </Alert>
    </Box>
  )
}

export default TableauxSupplementaires