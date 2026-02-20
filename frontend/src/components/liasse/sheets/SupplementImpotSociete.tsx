/**
 * Supplément Impôt sur les Sociétés - Calcul détaillé de l'IS
 */

import React, { useMemo } from 'react'
import { calculerPassageFiscal, type TableauPassageResult } from '@/services/passageFiscalService'
import { getLatestBalance } from '@/services/balanceStorageService'
import { MOCK_BALANCE } from '@/data/mockBalance'
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

  // Charger la balance importée (ou MOCK en fallback)
  const passage = useMemo<TableauPassageResult>(() => {
    const stored = getLatestBalance()
    const entries = stored?.entries?.length ? stored.entries : MOCK_BALANCE
    return calculerPassageFiscal(entries)
  }, [])

  const usingImported = !!getLatestBalance()?.entries?.length

  // Mapper vers la structure d'affichage
  const calculIS = {
    resultatComptable: passage.resultat_comptable,
    reintegrations: passage.reintegrations.map(r => ({
      nature: `${r.libelle} (${r.base_legale})`,
      montant: r.montant,
    })),
    deductions: passage.deductions.map(d => ({
      nature: `${d.libelle} (${d.base_legale})`,
      montant: d.montant,
    })),
    acomptes: [] as { periode: string; montant: number; dateVersement: string }[],
    credits: [] as { nature: string; montant: number }[],
  }

  const totalReintegrations = passage.total_reintegrations
  const totalDeductions = passage.total_deductions
  const totalAcomptes = calculIS.acomptes.reduce((sum, item) => sum + item.montant, 0)
  const totalCredits = calculIS.credits.reduce((sum, item) => sum + item.montant, 0)

  const resultatFiscal = passage.resultat_fiscal
  const impotBrut = passage.is_brut
  const impotNet = impotBrut - totalCredits
  const impotDu = passage.is_du
  const soldeAVerser = Math.max(0, impotDu - totalAcomptes)
  const tropPercu = Math.max(0, totalAcomptes - impotDu)

  const tauxEffectif = calculIS.resultatComptable > 0 ? (impotNet / calculIS.resultatComptable) * 100 : 0

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const formatPourcentage = (value: number) => {
    return value.toFixed(2) + '%'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
        Supplément - Calcul de l'Impôt sur les Sociétés (en FCFA)
      </Typography>

      <Alert severity={usingImported ? 'success' : 'warning'} sx={{ mb: 3 }}>
        {usingImported
          ? `Calcul automatique depuis la balance importée — CA: ${formatMontant(passage.chiffre_affaires)} FCFA — Base: ${passage.base_is}`
          : 'Données de démonstration — Importez une balance pour un calcul réel'}
      </Alert>

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
                  <Typography variant="caption" color="text.secondary">BASE D'IMPOSITION</Typography>
                  <Chip
                    label={passage.base_is === 'IMF' ? `IMF (${formatMontant(passage.imf)})` : 'IS 25%'}
                    color={passage.base_is === 'IMF' ? 'warning' : 'primary'}
                    sx={{ fontWeight: 600 }}
                  />
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
                <strong>Régime :</strong> Régime réel d'imposition — {passage.base_is === 'IMF'
                  ? `IMF retenu (${formatMontant(passage.imf)} > IS ${formatMontant(passage.is_brut)})`
                  : `IS retenu à 25% (${formatMontant(passage.is_brut)} > IMF ${formatMontant(passage.imf)})`}
              </Typography>
            </Alert>
            <Alert severity={passage.resultat_fiscal >= 0 ? 'success' : 'warning'}>
              <Typography variant="body2">
                <strong>Résultat fiscal :</strong> {formatMontant(passage.resultat_fiscal)} FCFA
                {passage.resultat_fiscal < 0 && ' (déficit reportable)'}
              </Typography>
            </Alert>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Échéance :</strong> Solde à verser avant le 30 avril de l'exercice suivant
              </Typography>
            </Alert>
            <Alert severity="error">
              <Typography variant="body2">
                <strong>Pénalités :</strong> 10% de majoration en cas de retard de paiement (CGI Art. 168)
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SupplementImpotSociete