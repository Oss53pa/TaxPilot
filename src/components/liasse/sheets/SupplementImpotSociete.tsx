/**
 * Supplément Impôt sur les Sociétés - Calcul détaillé de l'IS
 */

import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  Alert,
  Divider,
  Stack,
  LinearProgress,
} from '@mui/material'

const SupplementImpotSociete: React.FC = () => {
  const theme = useTheme()

  const calculIS = {
    resultatComptable: 28500000,
    reintegrations: [
      { nature: 'Amendes et pénalités fiscales', montant: 450000 },
      { nature: 'Charges sur voitures de tourisme', montant: 280000 },
      { nature: 'Dons non déductibles', montant: 150000 },
      { nature: 'Provision non déductible', montant: 320000 },
      { nature: 'Frais de réception excédentaires', montant: 180000 },
    ],
    deductions: [
      { nature: 'Dividendes reçus (filiales)', montant: 850000 },
      { nature: 'Plus-values sur cessions exonérées', montant: 0 },
      { nature: 'Reprises de provisions', montant: 220000 },
    ],
    acomptes: [
      { periode: '1er trimestre', montant: 2100000, dateVersement: '15/04/2024' },
      { periode: '2e trimestre', montant: 2100000, dateVersement: '15/07/2024' },
      { periode: '3e trimestre', montant: 2100000, dateVersement: '15/10/2024' },
      { periode: '4e trimestre', montant: 2100000, dateVersement: '15/01/2025' },
    ],
    credits: [
      { nature: 'Crédit d\'impôt recherche', montant: 0 },
      { nature: 'Crédit d\'impôt investissement', montant: 180000 },
      { nature: 'Autres crédits d\'impôt', montant: 0 },
    ]
  }

  const totalReintegrations = calculIS.reintegrations.reduce((sum, item) => sum + item.montant, 0)
  const totalDeductions = calculIS.deductions.reduce((sum, item) => sum + item.montant, 0)
  const totalAcomptes = calculIS.acomptes.reduce((sum, item) => sum + item.montant, 0)
  const totalCredits = calculIS.credits.reduce((sum, item) => sum + item.montant, 0)

  const resultatFiscal = calculIS.resultatComptable + totalReintegrations - totalDeductions
  const impotBrut = Math.round(resultatFiscal * 0.25) // Taux IS = 25%
  const impotNet = impotBrut - totalCredits
  const impotDu = Math.max(0, impotNet)
  const soldeAVerser = Math.max(0, impotDu - totalAcomptes)
  const tropPercu = Math.max(0, totalAcomptes - impotDu)

  const tauxEffectif = calculIS.resultatComptable > 0 ? (impotNet / calculIS.resultatComptable) * 100 : 0

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR') + ' FCFA'
  }

  const formatPourcentage = (value: number) => {
    return value.toFixed(2) + '%'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Supplément - Calcul de l'Impôt sur les Sociétés
      </Typography>

      {/* Calcul du résultat fiscal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
            Détermination du Résultat Fiscal
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.grey[100] }}>
                    Résultat comptable avant impôt
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {formatMontant(calculIS.resultatComptable)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'error.main', pl: 2 }}>
                    RÉINTÉGRATIONS :
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                
                {calculIS.reintegrations.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ pl: 4 }}>{item.nature}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 500 }}>
                      +{formatMontant(item.montant)}
                    </TableCell>
                  </TableRow>
                ))}
                
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.error.light, color: 'white', pl: 2 }}>
                    Total réintégrations
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: theme.palette.error.light, color: 'white' }}>
                    +{formatMontant(totalReintegrations)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main', pl: 2 }}>
                    DÉDUCTIONS :
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                
                {calculIS.deductions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ pl: 4 }}>{item.nature}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 500 }}>
                      -{formatMontant(item.montant)}
                    </TableCell>
                  </TableRow>
                ))}
                
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: theme.palette.success.light, color: 'white', pl: 2 }}>
                    Total déductions
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: theme.palette.success.light, color: 'white' }}>
                    -{formatMontant(totalDeductions)}
                  </TableCell>
                </TableRow>
                
                <TableRow sx={{ borderTop: '3px solid ' + theme.palette.primary.main }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.2rem', backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    RÉSULTAT FISCAL IMPOSABLE
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.2rem', backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    {formatMontant(resultatFiscal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Calcul de l'impôt */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Calcul de l'Impôt
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">RÉSULTAT FISCAL</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatMontant(resultatFiscal)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">TAUX D'IMPOSITION</Typography>
                  <Chip label="25%" color="primary" sx={{ fontWeight: 600 }} />
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary">IMPÔT BRUT</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatMontant(impotBrut)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">CRÉDITS D'IMPÔT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                    -{formatMontant(totalCredits)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary">IMPÔT NET DÛ</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatMontant(impotDu)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">TAUX EFFECTIF</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatPourcentage(tauxEffectif)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={tauxEffectif} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                Acomptes Versés
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculIS.acomptes.map((acompte, index) => (
                      <TableRow key={index}>
                        <TableCell>{acompte.periode}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatMontant(acompte.montant)}
                        </TableCell>
                        <TableCell>
                          <Chip label={acompte.dateVersement} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {formatMontant(totalAcomptes)}
                      </TableCell>
                      <TableCell>
                        <Chip label="Versé" color="success" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Solde à verser/trop perçu */}
      <Card sx={{ mb: 3, backgroundColor: soldeAVerser > 0 ? theme.palette.error.light : theme.palette.success.light }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            Solde de l'Impôt sur les Sociétés
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">IMPÔT DÛ</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatMontant(impotDu)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">ACOMPTES VERSÉS</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  -{formatMontant(totalAcomptes)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                {soldeAVerser > 0 ? (
                  <>
                    <Typography variant="caption" color="text.secondary">SOLDE À VERSER</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {formatMontant(soldeAVerser)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Échéance : 30 avril 2025
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary">TROP PERÇU</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatMontant(tropPercu)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      À imputer ou rembourser
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                Crédits d'Impôt
              </Typography>
              
              {calculIS.credits.map((credit, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">{credit.nature}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: credit.montant > 0 ? 'success.main' : 'text.secondary' }}>
                    {formatMontant(credit.montant)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Total crédits d'impôt : {formatMontant(totalCredits)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Régime :</strong> Régime réel d'imposition - Taux normal 25%
              </Typography>
            </Alert>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Conformité :</strong> Tous les acomptes provisionnels ont été versés dans les délais
              </Typography>
            </Alert>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Échéance :</strong> Solde à verser avant le 30 avril 2025
              </Typography>
            </Alert>
            <Alert severity="error">
              <Typography variant="body2">
                <strong>Pénalités :</strong> 10% de majoration en cas de retard de paiement
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SupplementImpotSociete