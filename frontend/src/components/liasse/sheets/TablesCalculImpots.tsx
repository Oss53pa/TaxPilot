/**
 * Tables de Calcul des Impôts - Liasse Fiscale SYSCOHADA
 * Calculs automatiques IS, TVA, Taxes diverses selon pays OHADA
 */

import { useState, useEffect, type FC, type ReactNode } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  AccountBalance as TaxIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendIcon,
  Save as SaveIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { arrondiFCFA, getTauxFiscaux } from '@/config/taux-fiscaux-ci'
import { calculerRetenues, type RetenuesResult } from '@/services/retenuesSourceService'
import { getLatestBalance } from '@/services/balanceStorageService'
import { MOCK_BALANCE } from '@/data/mockBalance'

interface LigneCalculImpot {
  code: string
  libelle: string
  base_imposable: number
  taux: number
  montant_calcule: number
  montant_declare: number
  ecart: number
}

const TablesCalculImpots: FC = () => {
  // États pour les calculs d'impôts
  const [impotSociete, setImpotSociete] = useState<LigneCalculImpot[]>([])
  const [taxesTVA, setTaxesTVA] = useState<LigneCalculImpot[]>([])
  const [autresTaxes, setAutresTaxes] = useState<LigneCalculImpot[]>([])
  const [parametresFiscaux, setParametresFiscaux] = useState(() => {
    const taux = getTauxFiscaux()
    return {
      taux_is: taux.IS.taux_normal * 100,
      taux_tva_standard: taux.TVA.taux_normal * 100,
      taux_tva_reduit: taux.TVA.taux_reduit * 100,
      regime_fiscal: 'REEL_NORMAL',
      pays: 'COTE_DIVOIRE'
    }
  })
  
  // Données de base depuis la liasse
  const [donneesComptables] = useState({
    benefice_comptable: 2500000,
    chiffre_affaires_ht: 15000000,
    achats_ht: 8000000,
    reintegrations: 150000,
    deductions: 75000,
    reports_deficitaires: 0
  })
  
  const [calculAutomatique, setCalculAutomatique] = useState(true)

  // Calcul automatique des retenues à la source depuis la balance
  const retenuesResult: RetenuesResult = (() => {
    const stored = getLatestBalance()
    const entries = stored?.entries?.length ? stored.entries : MOCK_BALANCE
    return calculerRetenues(entries)
  })()

  useEffect(() => {
    if (calculAutomatique) {
      calculerImpotSociete()
      calculerTaxesTVA()
      calculerAutresTaxes()
    }
  }, [donneesComptables, parametresFiscaux, calculAutomatique])

  const calculerImpotSociete = () => {
    const { benefice_comptable, reintegrations, deductions, reports_deficitaires } = donneesComptables
    const { taux_is } = parametresFiscaux
    
    // Calcul du résultat fiscal
    const resultat_fiscal = benefice_comptable + reintegrations - deductions
    
    // Application des reports déficitaires (limitation 50%)
    const reports_utilisables = Math.min(reports_deficitaires, arrondiFCFA(resultat_fiscal * 0.5))
    const base_imposable = Math.max(0, resultat_fiscal - reports_utilisables)

    // Calcul IS
    const is_calcule = arrondiFCFA(base_imposable * (taux_is / 100))
    
    const calculsIS: LigneCalculImpot[] = [
      {
        code: 'IS_001',
        libelle: 'Bénéfice comptable',
        base_imposable: benefice_comptable,
        taux: 0,
        montant_calcule: benefice_comptable,
        montant_declare: benefice_comptable,
        ecart: 0
      },
      {
        code: 'IS_002',
        libelle: 'Réintégrations fiscales',
        base_imposable: reintegrations,
        taux: 0,
        montant_calcule: reintegrations,
        montant_declare: reintegrations,
        ecart: 0
      },
      {
        code: 'IS_003',
        libelle: 'Déductions fiscales',
        base_imposable: deductions,
        taux: 0,
        montant_calcule: -deductions,
        montant_declare: -deductions,
        ecart: 0
      },
      {
        code: 'IS_004',
        libelle: 'Résultat fiscal avant reports',
        base_imposable: resultat_fiscal,
        taux: 0,
        montant_calcule: resultat_fiscal,
        montant_declare: resultat_fiscal,
        ecart: 0
      },
      {
        code: 'IS_005',
        libelle: 'Reports déficitaires utilisés',
        base_imposable: reports_utilisables,
        taux: 0,
        montant_calcule: -reports_utilisables,
        montant_declare: -reports_utilisables,
        ecart: 0
      },
      {
        code: 'IS_006',
        libelle: 'Base imposable IS',
        base_imposable: base_imposable,
        taux: 0,
        montant_calcule: base_imposable,
        montant_declare: base_imposable,
        ecart: 0
      },
      {
        code: 'IS_007',
        libelle: 'Impôt sur les sociétés',
        base_imposable: base_imposable,
        taux: taux_is,
        montant_calcule: is_calcule,
        montant_declare: is_calcule,
        ecart: 0
      }
    ]
    
    setImpotSociete(calculsIS)
  }

  const calculerTaxesTVA = () => {
    const { chiffre_affaires_ht, achats_ht } = donneesComptables
    const { taux_tva_standard } = parametresFiscaux
    
    // TVA collectée
    const tva_collectee = arrondiFCFA(chiffre_affaires_ht * (taux_tva_standard / 100))

    // TVA déductible
    const tva_deductible = arrondiFCFA(achats_ht * (taux_tva_standard / 100))

    // TVA nette à payer
    const tva_nette = Math.max(0, tva_collectee - tva_deductible)
    
    const calculsTVA: LigneCalculImpot[] = [
      {
        code: 'TVA_001',
        libelle: 'Chiffre d\'affaires HT',
        base_imposable: chiffre_affaires_ht,
        taux: 0,
        montant_calcule: chiffre_affaires_ht,
        montant_declare: chiffre_affaires_ht,
        ecart: 0
      },
      {
        code: 'TVA_002',
        libelle: 'TVA collectée',
        base_imposable: chiffre_affaires_ht,
        taux: taux_tva_standard,
        montant_calcule: tva_collectee,
        montant_declare: tva_collectee,
        ecart: 0
      },
      {
        code: 'TVA_003',
        libelle: 'Achats et charges HT',
        base_imposable: achats_ht,
        taux: 0,
        montant_calcule: achats_ht,
        montant_declare: achats_ht,
        ecart: 0
      },
      {
        code: 'TVA_004',
        libelle: 'TVA déductible',
        base_imposable: achats_ht,
        taux: taux_tva_standard,
        montant_calcule: tva_deductible,
        montant_declare: tva_deductible,
        ecart: 0
      },
      {
        code: 'TVA_005',
        libelle: 'TVA nette à payer',
        base_imposable: tva_nette,
        taux: 0,
        montant_calcule: tva_nette,
        montant_declare: tva_nette,
        ecart: 0
      }
    ]
    
    setTaxesTVA(calculsTVA)
  }

  const calculerAutresTaxes = () => {
    const { chiffre_affaires_ht } = donneesComptables
    
    // Autres taxes selon le pays OHADA
    const taxes_diverses = [
      {
        code: 'TAX_001',
        libelle: 'Taxe sur le chiffre d\'affaires',
        base_imposable: chiffre_affaires_ht,
        taux: 1, // 1% exemple
        montant_calcule: arrondiFCFA(chiffre_affaires_ht * 0.01),
        montant_declare: arrondiFCFA(chiffre_affaires_ht * 0.01),
        ecart: 0
      },
      {
        code: 'TAX_002', 
        libelle: 'Contribution des patentes',
        base_imposable: 500000, // Base fixe
        taux: 0,
        montant_calcule: 500000,
        montant_declare: 500000,
        ecart: 0
      },
      {
        code: 'TAX_003',
        libelle: 'Taxe foncière',
        base_imposable: 200000,
        taux: 0,
        montant_calcule: 200000,
        montant_declare: 200000,
        ecart: 0
      }
    ]
    
    setAutresTaxes(taxes_diverses)
  }

  const formaterMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant)
  }

  const renderTableauCalcul = (
    titre: string,
    donnees: LigneCalculImpot[],
    couleur: string,
    icone: ReactNode
  ) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {icone}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {titre}
          </Typography>
          <Chip 
            label={`${donnees.length} lignes`} 
            size="small" 
            sx={{ bgcolor: couleur, color: 'white' }} 
          />
        </Stack>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Base imposable</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Taux (%)</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Montant calculé</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Montant déclaré</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Écart</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donnees.map((ligne) => (
                <TableRow key={ligne.code}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {ligne.code}
                  </TableCell>
                  <TableCell>{ligne.libelle}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {formaterMontant(ligne.base_imposable)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {ligne.taux > 0 ? `${ligne.taux}%` : '-'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {formaterMontant(ligne.montant_calcule)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {formaterMontant(ligne.montant_declare)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: ligne.ecart === 0 ? 'success.main' : 'error.main',
                        fontWeight: ligne.ecart !== 0 ? 600 : 400
                      }}
                    >
                      {formaterMontant(ligne.ecart)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📊 Tables de Calcul des Impôts
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Calculs automatiques des impôts et taxes selon la réglementation OHADA
      </Typography>

      {/* Paramètres fiscaux */}
      <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            ⚙️ Paramètres Fiscaux
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Pays OHADA</InputLabel>
                <Select
                  value={parametresFiscaux.pays}
                  onChange={(e) => setParametresFiscaux(prev => ({...prev, pays: e.target.value}))}
                >
                  <MenuItem value="CAMEROUN">Cameroun</MenuItem>
                  <MenuItem value="SENEGAL">Sénégal</MenuItem>
                  <MenuItem value="COTE_IVOIRE">Côte d'Ivoire</MenuItem>
                  <MenuItem value="GABON">Gabon</MenuItem>
                  <MenuItem value="BURKINA_FASO">Burkina Faso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Taux IS (%)"
                type="number"
                value={parametresFiscaux.taux_is}
                onChange={(e) => setParametresFiscaux(prev => ({...prev, taux_is: Number(e.target.value)}))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="TVA Standard (%)"
                type="number"
                value={parametresFiscaux.taux_tva_standard}
                onChange={(e) => setParametresFiscaux(prev => ({...prev, taux_tva_standard: Number(e.target.value)}))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={calculAutomatique}
                    onChange={(e) => setCalculAutomatique(e.target.checked)}
                  />
                }
                label="Calcul automatique"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table Impôt sur les Sociétés */}
      {renderTableauCalcul(
        '🏛️ Impôt sur les Sociétés (IS)',
        impotSociete,
        '#2563eb',
        <TaxIcon sx={{ color: 'primary.main' }} />
      )}

      {/* Table TVA */}
      {renderTableauCalcul(
        '🧾 Taxe sur la Valeur Ajoutée (TVA)',
        taxesTVA,
        '#16a34a',
        <ReceiptIcon sx={{ color: 'success.main' }} />
      )}

      {/* Autres taxes */}
      {renderTableauCalcul(
        '📋 Autres Taxes et Contributions',
        autresTaxes,
        '#d97706',
        <TrendIcon sx={{ color: 'warning.main' }} />
      )}

      {/* Récapitulatif fiscal */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            💰 Récapitulatif Fiscal - Exercice 2024
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="caption">Impôt Sociétés</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formaterMontant(impotSociete.find(i => i.code === 'IS_007')?.montant_calcule || 0)}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="caption">TVA Nette</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formaterMontant(taxesTVA.find(i => i.code === 'TVA_005')?.montant_calcule || 0)}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="caption">Autres Taxes</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formaterMontant(autresTaxes.reduce((sum, tax) => sum + tax.montant_calcule, 0))}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="caption">TOTAL IMPÔTS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {formaterMontant(
                  (impotSociete.find(i => i.code === 'IS_007')?.montant_calcule || 0) +
                  (taxesTVA.find(i => i.code === 'TVA_005')?.montant_calcule || 0) +
                  autresTaxes.reduce((sum, tax) => sum + tax.montant_calcule, 0)
                )}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Retenues à la source */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Retenues a la Source
            </Typography>
            <Chip
              label={`Total: ${formaterMontant(retenuesResult.total)}`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Base</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Taux</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Base legale</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retenuesResult.retenues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      Aucune retenue detectee dans la balance
                    </TableCell>
                  </TableRow>
                ) : (
                  retenuesResult.retenues.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Chip label={r.code} size="small" color="warning" variant="outlined" />
                      </TableCell>
                      <TableCell>{r.libelle}</TableCell>
                      <TableCell align="right">{formaterMontant(r.base)}</TableCell>
                      <TableCell align="right">{(r.taux * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formaterMontant(r.montant)}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{r.base_legale}</TableCell>
                    </TableRow>
                  ))
                )}
                {retenuesResult.retenues.length > 0 && (
                  <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 700 }}>TOTAL RETENUES</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formaterMontant(retenuesResult.total)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions */}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<SaveIcon />}>
          Sauvegarder Calculs
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />}>
          Imprimer Tables
        </Button>
        <Button variant="outlined" startIcon={<CalculateIcon />}>
          Recalculer Tout
        </Button>
      </Stack>

      {/* Notes explicatives */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          💡 Calculs selon la réglementation {parametresFiscaux.pays}
        </Typography>
        <Typography variant="body2">
          Les taux et bases de calcul sont automatiquement appliqués selon la législation fiscale du pays sélectionné.
          Les calculs intègrent les spécificités OHADA et les règles de déductibilité.
        </Typography>
      </Alert>
    </Box>
  )
}

export default TablesCalculImpots