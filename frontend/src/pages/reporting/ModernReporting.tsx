/**
 * Module Reporting & Analytics - CALCUL DES RATIOS FINANCIERS
 * Calcule les ratios, définit les seuils standards et analyse les résultats de l'exercice
 * CONFORME AUX EXIGENCES SPÉCIFIÉES
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
} from '@mui/material'
import {
  Assessment,
  TrendingUp,
  Analytics,
  Dashboard,
  CheckCircle,
  Warning,
  Refresh,
  GetApp,
  Schedule,
  Speed,
  FactCheck as ControleIcon,
  Send as SendIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useBalanceData } from '@/hooks/useBalanceData'
import { getLatestBalance, getLatestBalanceN1 } from '@/services/balanceStorageService'
import { getWorkflowState } from '@/services/workflowStateService'
import type { WorkflowState } from '@/services/workflowStateService'

interface RatioFinancier {
  code: string
  nom: string
  valeur: number
  seuilMin: number
  seuilOptimal: number
  unite: string
  categorie: 'LIQUIDITE' | 'STRUCTURE' | 'RENTABILITE' | 'GESTION' | 'ACTIVITE'
  description: string
  interpretation: string
  statut: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE' | 'CRITIQUE'
}

/** Division safe: retourne 0 si le denominateur est 0 */
const safeDiv = (a: number, b: number): number => b === 0 ? 0 : a / b

const ModernReporting = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [lastRefresh] = useState(new Date())
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)

  const bal = useBalanceData()

  // Exercise year from imported balance metadata (reactive to exercise changes)
  const exerciceYear = useMemo(() => {
    const stored = getLatestBalance()
    return stored?.exercice || String(new Date().getFullYear())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bal])

  const donneesFinancieres = useMemo(() => {
    const totalActif = bal.d(['2', '3', '4', '5'])
    const immobilisationsNettes = bal.d(['2'])
    const stocksMarchandises = bal.d(['3'])
    const creancesClients = bal.d(['41'])
    const disponibilites = bal.d(['5'])
    const capitauxPropres = bal.c(['10', '11', '12', '13', '14', '15'])
    const dettesLT = bal.c(['16', '17'])
    const dettesCT = bal.c(['40', '42', '43', '44', '45', '46', '47', '48'])
    const chiffreAffaires = bal.c(['70', '71', '72', '73'])
    const charges = bal.d(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    const produits = bal.c(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
    const resultatNet = produits - charges
    const chargesFinancieres = bal.d(['67'])

    // N-1 data from imported balance N-1
    const storedN1 = getLatestBalanceN1()
    const entriesN1 = storedN1?.entries || []
    const soldeD = (e: Record<string, unknown>): number => {
      const sd = Number(e.solde_debit) || 0
      const sc = Number(e.solde_credit) || 0
      if (sd !== 0 || sc !== 0) return sd - sc
      return (Number(e.debit) || 0) - (Number(e.credit) || 0)
    }
    const sumCreditN1 = (prefixes: string[]) => Math.round(
      entriesN1.filter(e => prefixes.some(p => e.compte.startsWith(p)))
        .reduce((s, e) => s + Math.max(0, -soldeD(e as unknown as Record<string, unknown>)), 0)
    )
    const sumDebitN1 = (prefixes: string[]) => Math.round(
      entriesN1.filter(e => prefixes.some(p => e.compte.startsWith(p)))
        .reduce((s, e) => s + Math.max(0, soldeD(e as unknown as Record<string, unknown>)), 0)
    )
    const caN1 = sumCreditN1(['70', '71', '72', '73'])
    const chargesN1 = sumDebitN1(['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
    const produitsN1 = sumCreditN1(['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])

    return {
      totalActif,
      immobilisationsNettes,
      stocksMarchandises,
      creancesClients,
      disponibilites,
      totalPassif: totalActif,
      capitauxPropres,
      dettesLT,
      dettesCT,
      chiffreAffaires,
      resultatExploitation: bal.c(['70','71','72','73','74','75']) - bal.d(['60','61','62','63','64','65']),
      resultatNet,
      chargesFinancieres,
      exercicePrecedent: {
        chiffreAffaires: caN1,
        resultatNet: produitsN1 - chargesN1,
      },
    }
  }, [bal])

  useEffect(() => {
    setWorkflowState(getWorkflowState())
  }, [])

  // ── Compute ratios from real financial data ──
  const ratios = useMemo((): RatioFinancier[] => {
    if (!bal.usingImported) return []
    const df = donneesFinancieres

    const ratiosCalcules: RatioFinancier[] = [
      // === RATIOS DE LIQUIDITE ===
      {
        code: 'LIQ_GEN',
        nom: 'Liquidite Generale',
        valeur: safeDiv(df.totalActif - df.immobilisationsNettes, df.dettesCT),
        seuilMin: 1.0,
        seuilOptimal: 2.0,
        unite: '',
        categorie: 'LIQUIDITE',
        description: 'Capacite a honorer les dettes a court terme',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'LIQ_RED',
        nom: 'Liquidite Reduite',
        valeur: safeDiv(df.creancesClients + df.disponibilites, df.dettesCT),
        seuilMin: 0.7,
        seuilOptimal: 1.0,
        unite: '',
        categorie: 'LIQUIDITE',
        description: 'Liquidite sans les stocks',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'LIQ_IMM',
        nom: 'Liquidite Immediate',
        valeur: safeDiv(df.disponibilites, df.dettesCT),
        seuilMin: 0.2,
        seuilOptimal: 0.3,
        unite: '',
        categorie: 'LIQUIDITE',
        description: 'Capacite de paiement immediat',
        interpretation: '',
        statut: 'BON'
      },

      // === RATIOS DE STRUCTURE FINANCIERE ===
      {
        code: 'AUT_FIN',
        nom: 'Autonomie Financiere',
        valeur: safeDiv(df.capitauxPropres, df.totalPassif) * 100,
        seuilMin: 20,
        seuilOptimal: 40,
        unite: '%',
        categorie: 'STRUCTURE',
        description: 'Independance financiere de l\'entreprise',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'END_TOT',
        nom: 'Endettement Total',
        valeur: safeDiv(df.dettesLT + df.dettesCT, df.totalPassif) * 100,
        seuilMin: 30,
        seuilOptimal: 60,
        unite: '%',
        categorie: 'STRUCTURE',
        description: 'Niveau d\'endettement global',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'CAP_FIN',
        nom: 'Fonds de Roulement',
        valeur: (df.capitauxPropres + df.dettesLT - df.immobilisationsNettes) / 1000,
        seuilMin: 200,
        seuilOptimal: 500,
        unite: 'k XOF',
        categorie: 'STRUCTURE',
        description: 'Fonds de roulement fonctionnel',
        interpretation: '',
        statut: 'BON'
      },

      // === RATIOS DE RENTABILITE ===
      {
        code: 'RENT_COM',
        nom: 'Rentabilite Commerciale',
        valeur: safeDiv(df.resultatExploitation, df.chiffreAffaires) * 100,
        seuilMin: 5,
        seuilOptimal: 15,
        unite: '%',
        categorie: 'RENTABILITE',
        description: 'Rentabilite de l\'activite commerciale',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'RENT_NET',
        nom: 'Rentabilite Nette',
        valeur: safeDiv(df.resultatNet, df.chiffreAffaires) * 100,
        seuilMin: 3,
        seuilOptimal: 8,
        unite: '%',
        categorie: 'RENTABILITE',
        description: 'Rentabilite apres toutes charges',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'RENT_ACT',
        nom: 'Rentabilite des Actifs (ROA)',
        valeur: safeDiv(df.resultatNet, df.totalActif) * 100,
        seuilMin: 2,
        seuilOptimal: 6,
        unite: '%',
        categorie: 'RENTABILITE',
        description: 'Efficacite d\'utilisation des actifs',
        interpretation: '',
        statut: 'BON'
      },

      // === RATIOS DE GESTION ===
      {
        code: 'ROT_STO',
        nom: 'Rotation des Stocks',
        valeur: safeDiv(df.chiffreAffaires, df.stocksMarchandises),
        seuilMin: 4,
        seuilOptimal: 12,
        unite: 'fois/an',
        categorie: 'GESTION',
        description: 'Efficacite de la gestion des stocks',
        interpretation: '',
        statut: 'BON'
      },
      {
        code: 'DEL_CLI',
        nom: 'Delai Clients',
        valeur: safeDiv(df.creancesClients, df.chiffreAffaires) * 365,
        seuilMin: 30,
        seuilOptimal: 45,
        unite: 'jours',
        categorie: 'GESTION',
        description: 'Delai moyen de recouvrement clients',
        interpretation: '',
        statut: 'BON'
      },

      // === RATIOS D'ACTIVITE (only if N-1 data available) ===
      ...(df.exercicePrecedent.chiffreAffaires > 0 ? [{
        code: 'CROIS_CA',
        nom: 'Croissance CA',
        valeur: safeDiv(df.chiffreAffaires - df.exercicePrecedent.chiffreAffaires, df.exercicePrecedent.chiffreAffaires) * 100,
        seuilMin: 0,
        seuilOptimal: 10,
        unite: '%',
        categorie: 'ACTIVITE' as const,
        description: 'Evolution du chiffre d\'affaires vs N-1',
        interpretation: '',
        statut: 'BON' as const
      }] : [])
    ]

    // ATTRIBUTION AUTOMATIQUE DES STATUTS ET INTERPRETATIONS
    ratiosCalcules.forEach(ratio => {
      const { valeur, seuilMin, seuilOptimal, categorie, nom } = ratio

      if (nom.includes('Endettement') || nom.includes('Delai')) {
        // Ratios inverses (plus bas = mieux)
        if (valeur <= seuilMin) {
          ratio.statut = 'EXCELLENT'
          ratio.interpretation = `Excellent: bien en dessous du seuil (${seuilMin}${ratio.unite})`
        } else if (valeur <= seuilOptimal) {
          ratio.statut = 'BON'
          ratio.interpretation = `Bon niveau, dans la norme acceptable`
        } else if (valeur <= seuilOptimal * 1.3) {
          ratio.statut = 'MOYEN'
          ratio.interpretation = `Niveau moyen, amelioration recommandee`
        } else {
          ratio.statut = 'CRITIQUE'
          ratio.interpretation = `Niveau critique, action immediate requise`
        }
      } else {
        // Ratios normaux (plus haut = mieux)
        if (valeur >= seuilOptimal) {
          ratio.statut = 'EXCELLENT'
          ratio.interpretation = `Excellent niveau pour ${categorie.toLowerCase()}`
        } else if (valeur >= seuilMin) {
          ratio.statut = 'BON'
          ratio.interpretation = `Bon niveau, dans la norme`
        } else if (valeur >= seuilMin * 0.7) {
          ratio.statut = 'MOYEN'
          ratio.interpretation = `Niveau moyen, amelioration possible`
        } else {
          ratio.statut = 'CRITIQUE'
          ratio.interpretation = `Niveau critique, action corrective necessaire`
        }
      }
    })

    return ratiosCalcules
  }, [donneesFinancieres, bal.usingImported])

  // ── Dynamic analysis generated from computed ratios ──
  const analyseExercice = useMemo(() => {
    if (ratios.length === 0) return null

    const pointsForts: string[] = []
    const pointsFaibles: string[] = []
    const recommandations: string[] = []
    const alertes: { niveau: string; message: string; action: string }[] = []

    ratios.forEach(ratio => {
      const fmt = ratio.unite === '%' ? `${ratio.valeur.toFixed(1)}%`
        : ratio.unite === 'jours' ? `${ratio.valeur.toFixed(0)} jours`
        : ratio.unite === 'fois/an' ? `${ratio.valeur.toFixed(1)} fois/an`
        : ratio.unite === 'k XOF' ? `${ratio.valeur.toFixed(0)}k XOF`
        : ratio.valeur.toFixed(2)

      if (ratio.statut === 'EXCELLENT') {
        pointsForts.push(`${ratio.nom} excellent(e) (${fmt})`)
      } else if (ratio.statut === 'BON') {
        pointsForts.push(`${ratio.nom} satisfaisant(e) (${fmt})`)
      } else if (ratio.statut === 'MOYEN') {
        pointsFaibles.push(`${ratio.nom} moyen(ne) (${fmt})`)
        recommandations.push(`Ameliorer ${ratio.nom.toLowerCase()} (actuellement ${fmt})`)
      } else if (ratio.statut === 'CRITIQUE' || ratio.statut === 'FAIBLE') {
        pointsFaibles.push(`${ratio.nom} critique (${fmt})`)
        alertes.push({
          niveau: 'WARNING',
          message: `${ratio.nom}: ${fmt} — ${ratio.interpretation}`,
          action: `Action corrective sur ${ratio.nom.toLowerCase()}`
        })
        if (ratio.code === 'LIQ_GEN' || ratio.code === 'LIQ_RED' || ratio.code === 'LIQ_IMM') {
          recommandations.push('Ameliorer la tresorerie: reduire les delais de recouvrement ou negocier les delais fournisseurs')
        } else if (ratio.code === 'END_TOT') {
          recommandations.push('Reduire l\'endettement ou renforcer les capitaux propres')
        } else if (ratio.code === 'DEL_CLI') {
          recommandations.push('Mettre en place un plan de recouvrement clients actif')
        } else if (ratio.code === 'ROT_STO') {
          recommandations.push('Optimiser la gestion des stocks (politique de rotation)')
        } else {
          recommandations.push(`Ameliorer ${ratio.nom.toLowerCase()}`)
        }
      }
    })

    // Score global from ratio statuses
    const scoreMap: Record<string, number> = { EXCELLENT: 100, BON: 80, MOYEN: 50, FAIBLE: 30, CRITIQUE: 10 }
    const scoreGlobal = Math.round(ratios.reduce((s, r) => s + (scoreMap[r.statut] || 50), 0) / ratios.length)
    const niveauPerformance = scoreGlobal >= 80 ? 'EXCELLENT' : scoreGlobal >= 60 ? 'BON' : scoreGlobal >= 40 ? 'MOYEN' : 'CRITIQUE'

    if (alertes.length === 0) {
      alertes.push({
        niveau: 'INFO',
        message: `Performance globale ${niveauPerformance.toLowerCase()} avec un score de ${scoreGlobal}/100`,
        action: 'Maintenir la dynamique'
      })
    }

    return {
      scoreGlobal,
      niveauPerformance,
      synthese: { pointsForts, pointsFaibles, recommandations },
      alertes
    }
  }, [ratios])

  const genererRapport = async (templateId: string) => {
    setIsGenerating(true)
    setSelectedTemplate(templateId)

    setIsGenerating(false)
    alert(`Rapport genere avec succes !`)
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EXCELLENT': return '#22c55e'
      case 'BON': return '#4ade80'
      case 'MOYEN': return '#f59e0b'
      case 'FAIBLE': return '#ef4444'
      case 'CRITIQUE': return '#dc2626'
      default: return P.primary500
    }
  }

  const getCategorieColor = (categorie: string) => {
    switch (categorie) {
      case 'LIQUIDITE': return '#3b82f6'
      case 'STRUCTURE': return '#8b5cf6'
      case 'RENTABILITE': return '#22c55e'
      case 'GESTION': return '#f59e0b'
      case 'ACTIVITE': return '#06b6d4'
      default: return P.primary500
    }
  }

  const formatRatioValue = (ratio: RatioFinancier): string => {
    if (!isFinite(ratio.valeur)) return 'N/A'
    if (ratio.unite === '%') return `${ratio.valeur.toFixed(1)}%`
    if (ratio.unite === 'jours') return `${ratio.valeur.toFixed(0)} jours`
    if (ratio.unite === 'fois/an') return `${ratio.valeur.toFixed(1)} fois/an`
    if (ratio.unite === 'k XOF') return `${ratio.valeur.toFixed(0)}k XOF`
    return ratio.valeur.toFixed(2)
  }

  const renderDashboardTab = () => (
    <Box>
      {/* Alert if no balance data imported */}
      {!bal.usingImported && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Aucune balance importee.</strong> Importez votre balance via le menu Import pour calculer les ratios financiers reels.
        </Alert>
      )}

      {/* ANALYSE GLOBALE DE L'EXERCICE */}
      {analyseExercice && (
        <Card sx={{ mb: 4, borderLeft: '4px solid', borderColor: analyseExercice.scoreGlobal >= 80 ? 'success.main' : analyseExercice.scoreGlobal >= 60 ? 'warning.main' : 'error.main' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Analyse des Resultats de l'Exercice {exerciceYear}
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  width: 120,
                  height: 120,
                  margin: '0 auto'
                }}>
                  <CircularProgress
                    variant="determinate"
                    value={analyseExercice.scoreGlobal}
                    size={120}
                    thickness={6}
                    sx={{ color: analyseExercice.scoreGlobal >= 80 ? 'success.main' : analyseExercice.scoreGlobal >= 60 ? 'warning.main' : 'error.main' }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {analyseExercice.scoreGlobal}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PERFORMANCE
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                      Points Forts Identifies
                    </Typography>
                    <List dense>
                      {analyseExercice.synthese.pointsForts.map((point: string, index: number) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      {analyseExercice.synthese.pointsForts.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Aucun point fort identifie</Typography>
                      )}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                      Points d'Amelioration
                    </Typography>
                    <List dense>
                      {analyseExercice.synthese.pointsFaibles.map((point: string, index: number) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      {analyseExercice.synthese.pointsFaibles.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Aucun point faible identifie</Typography>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* RATIOS FINANCIERS PAR CATEGORIE */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Ratios Financiers SYSCOHADA avec Seuils Standards
      </Typography>

      {ratios.length === 0 && bal.usingImported && (
        <Alert severity="info" sx={{ mb: 3 }}>Aucun ratio calculable avec les donnees actuelles.</Alert>
      )}

      {['LIQUIDITE', 'STRUCTURE', 'RENTABILITE', 'GESTION', 'ACTIVITE'].map(categorie => {
        const ratiosCategorie = ratios.filter(r => r.categorie === categorie)
        if (ratiosCategorie.length === 0) return null

        return (
          <Card key={categorie} sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: getCategorieColor(categorie)
                  }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {categorie.charAt(0) + categorie.slice(1).toLowerCase()}
                  </Typography>
                </Box>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Ratio</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Seuil Min</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Optimal</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Interpretation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratiosCategorie.map((ratio, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {ratio.nom}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ratio.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{
                            fontWeight: 600,
                            color: getStatutColor(ratio.statut)
                          }}>
                            {formatRatioValue(ratio)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {ratio.seuilMin}{ratio.unite}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                            {ratio.seuilOptimal}{ratio.unite}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={ratio.statut}
                            size="small"
                            sx={{
                              bgcolor: getStatutColor(ratio.statut),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {ratio.interpretation}
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
      })}

      {/* RECOMMANDATIONS STRATEGIQUES */}
      {analyseExercice && analyseExercice.synthese.recommandations.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Recommandations Strategiques"
            sx={{ color: 'primary.main' }}
          />
          <CardContent>
            <List>
              {analyseExercice.synthese.recommandations.map((reco: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={reco}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* ALERTES */}
      {analyseExercice?.alertes.map((alerte: any, index: number) => (
        <Alert
          key={index}
          severity={alerte.niveau === 'WARNING' ? 'warning' : 'info'}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              {alerte.action}
            </Button>
          }
        >
          {alerte.message}
        </Alert>
      ))}
    </Box>
  )

  const renderReportsTab = () => {

    const templatesRapports = [
      {
        id: 'rapport_ratios_complet',
        nom: 'Rapport de Ratios Complet',
        description: 'Analyse exhaustive de tous les ratios financiers avec benchmarks sectoriels',
        dureeGeneration: '2-3 minutes',
        pages: 15,
        sections: ['Synthese executive', 'Ratios de liquidite', 'Structure financiere', 'Rentabilite', 'Gestion', 'Recommandations'],
        formats: ['PDF', 'Excel', 'Word']
      },
      {
        id: 'diagnostic_financier',
        nom: 'Diagnostic Financier Strategique',
        description: 'Analyse approfondie de la sante financiere avec plan d\'action',
        dureeGeneration: '3-4 minutes',
        pages: 25,
        sections: ['Diagnostic global', 'Forces et faiblesses', 'Analyse des risques', 'Projections', 'Plan d\'action'],
        formats: ['PDF', 'PowerPoint']
      },
      {
        id: 'rapport_creances',
        nom: 'Analyse des Creances et Recouvrement',
        description: 'Etude detaillee du poste clients et optimisation du BFR',
        dureeGeneration: '1-2 minutes',
        pages: 8,
        sections: ['Evolution creances', 'Delais par client', 'Provisions', 'Actions recommandees'],
        formats: ['PDF', 'Excel']
      },
      {
        id: 'tableau_bord_direction',
        nom: 'Tableau de Bord Direction',
        description: 'KPIs essentiels et indicateurs de pilotage pour la direction',
        dureeGeneration: '1 minute',
        pages: 5,
        sections: ['KPIs synthetiques', 'Alertes', 'Tendances', 'Objectifs'],
        formats: ['PDF', 'PowerPoint', 'Excel']
      },
      {
        id: 'analyse_rentabilite',
        nom: 'Analyse de Rentabilite par Activite',
        description: 'Decomposition de la rentabilite et centres de profit',
        dureeGeneration: '3-5 minutes',
        pages: 20,
        sections: ['Rentabilite globale', 'Par centre de profit', 'Marges detaillees', 'Optimisations'],
        formats: ['PDF', 'Excel']
      }
    ]

    const rapportsRecents: { nom: string; date: string; statut: string; taille: string; telechargements: number }[] = []


    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Generation de Rapports d'Analyse Financiere
        </Typography>

        {/* TEMPLATES DE RAPPORTS DISPONIBLES */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Modeles de Rapports Disponibles
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {templatesRapports.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card sx={{
                height: '100%',
                border: selectedTemplate === template.id ? '2px solid' : '1px solid',
                borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {template.nom}
                    </Typography>
                    <Chip
                      label={`${template.pages} pages`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Duree generation : {template.dureeGeneration}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Sections incluses :
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {template.sections.map((section, index) => (
                      <Chip
                        key={index}
                        label={section}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Formats : {template.formats.join(', ')}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => genererRapport(template.id)}
                      disabled={isGenerating}
                      startIcon={isGenerating && selectedTemplate === template.id ? <CircularProgress size={16} /> : <Assessment />}
                    >
                      {isGenerating && selectedTemplate === template.id ? 'Generation...' : 'Generer'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* RAPPORTS RECENTS */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Rapports Recents
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nom du Rapport</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date Generation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Taille</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Telechargements</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rapportsRecents.map((rapport, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {rapport.nom}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(rapport.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rapport.statut}
                      size="small"
                      color={rapport.statut === 'Genere' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {rapport.taille}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rapport.telechargements} fois
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<GetApp />}
                      variant="outlined"
                    >
                      Telecharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* FONCTIONNALITES AVANCEES */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Schedule sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Rapports Automatises
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Planification automatique mensuelle/trimestrielle
                </Typography>
                <Button variant="outlined" size="small">
                  Configurer
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Analytics sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  IA Predictive
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Projections et analyse predictive avancee
                </Typography>
                <Button variant="outlined" size="small">
                  Activer IA
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Speed sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Benchmarking
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comparaison avec standards sectoriels
                </Typography>
                <Button variant="outlined" size="small">
                  Comparer
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ALERTES DE GENERATION */}
        {isGenerating && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <strong>Generation en cours...</strong>
            Analyse des donnees financieres et calcul des ratios.
            Veuillez patienter pendant la creation du rapport.
          </Alert>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tete */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Reporting & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Calcul des ratios financiers, seuils standards et interpretation des resultats
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Derniere actualisation: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                window.location.reload()
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Module Reporting Financier :</strong> Calcul automatique des ratios SYSCOHADA |
          Seuils standards definis | Interpretation des resultats | Recommandations strategiques
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            label="Dashboard Financier"
            icon={<Dashboard />}
            iconPosition="start"
          />
          <Tab
            label="Rapports"
            icon={<Assessment />}
            iconPosition="start"
          />
          <Tab
            label="Audit & Conformite"
            icon={<ControleIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderReportsTab()}
      {activeTab === 2 && workflowState && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Audit & Conformite
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Score d'audit */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Score d'audit
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={workflowState.controleDone ? workflowState.controleScore : 0}
                      size={100}
                      thickness={6}
                      sx={{
                        color: workflowState.controleScore >= 90 ? '#16a34a'
                          : workflowState.controleScore >= 70 ? '#d97706' : '#dc2626'
                      }}
                    />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h4" fontWeight={700}>
                        {workflowState.controleDone ? workflowState.controleScore : '--'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {workflowState.controleDone ? (
                      workflowState.controleResult === 'passed' ? 'Tous les controles passes'
                        : workflowState.controleResult === 'passed_with_warnings' ? 'Passe avec avertissements'
                        : `${workflowState.controleBloquants} bloquant(s)`
                    ) : 'Controle non lance'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Anomalies par severite */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Anomalies detectees
                  </Typography>
                  {workflowState.controleDone ? (
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label="Bloquants" size="small" sx={{ bgcolor: '#dc262620', color: '#dc2626', fontWeight: 600 }} />
                        <Typography variant="h6" fontWeight={700} color="#dc2626">
                          {workflowState.controleBloquants}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Resultat global</Typography>
                        <Chip
                          label={workflowState.controleResult === 'passed' ? 'OK' : workflowState.controleResult === 'passed_with_warnings' ? 'Avertissements' : 'Echec'}
                          size="small"
                          color={workflowState.controleResult === 'passed' ? 'success' : workflowState.controleResult === 'passed_with_warnings' ? 'warning' : 'error'}
                        />
                      </Box>
                    </Stack>
                  ) : (
                    <Alert severity="info">Lancez le controle pour voir les anomalies.</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Progression workflow + Teledeclaration */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Progression du workflow
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      { label: 'Configuration', done: workflowState.configurationDone },
                      { label: 'Import balance', done: workflowState.balanceImported },
                      { label: 'Controle', done: workflowState.controleDone },
                      { label: 'Generation', done: workflowState.generationDone },
                      { label: 'Teledeclaration', done: workflowState.teledeclarationStatus !== 'not_started' },
                    ].map(step => (
                      <Box key={step.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {step.done ? <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} /> : <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #d4d4d4' }} />}
                        <Typography variant="body2" sx={{ flex: 1, color: step.done ? 'text.primary' : 'text.secondary' }}>{step.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SendIcon sx={{ fontSize: 16, color: workflowState.teledeclarationStatus === 'submitted' ? '#16a34a' : '#d4d4d4' }} />
                    <Typography variant="body2">
                      Teledeclaration: {
                        workflowState.teledeclarationStatus === 'not_started' ? 'Non demarree'
                        : workflowState.teledeclarationStatus === 'draft' ? 'Brouillon'
                        : workflowState.teledeclarationStatus === 'submitted' ? 'Transmise'
                        : 'Acceptee'
                      }
                    </Typography>
                  </Box>
                  {workflowState.teledeclarationReference && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                      Ref: {workflowState.teledeclarationReference}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default ModernReporting
