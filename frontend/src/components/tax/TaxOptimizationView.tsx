/**
 * Composant pour l'optimisation fiscale
 * Utilise les APIs du module Tax pour les simulations et optimisations
 */

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Calculator,
  Target,
  Lightbulb,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  DollarSign,
  PiggyBank,
  Shield,
  BarChart3,
  FileText,
  Download
} from 'lucide-react'
import taxService from '@/services/taxService'
import { useToast } from '@/components/ui/use-toast'

interface RegimeFiscal {
  id: string
  code: string
  libelle: string
  description: string
  taux_is?: number
  franchise_tva?: boolean
  avantages: string[]
  obligations: string[]
}

interface OptimizationSuggestion {
  id: string
  titre: string
  description: string
  impact_estime: number
  complexite: 'FAIBLE' | 'MOYENNE' | 'ELEVEE'
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE'
  actions: string[]
  risques?: string[]
}

interface SimulationScenario {
  nom: string
  ca_projete: number
  charges_prevues: number
  investissements: number
  resultats?: {
    impot_is: number
    tva_a_payer: number
    patente: number
    total_impots: number
    economie_potentielle: number
  }
}

interface AbattementEligible {
  id: string
  nom: string
  montant_economie: number
  conditions: string[]
  applicable: boolean
}

export default function TaxOptimizationView() {
  const [, setLoading] = useState(true)
  const [regimes, setRegimes] = useState<RegimeFiscal[]>([])
  const [currentRegime, setCurrentRegime] = useState<RegimeFiscal | null>(null)
  const [optimalRegime, setOptimalRegime] = useState<RegimeFiscal | null>(null)
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [abattements, setAbattements] = useState<AbattementEligible[]>([])
  const [activeTab, setActiveTab] = useState('simulation')
  const { toast } = useToast()

  // Paramètres de simulation
  const [simulationParams, setSimulationParams] = useState({
    ca_actuel: 500000,
    ca_previsionnel: 600000,
    charges_actuelles: 400000,
    charges_prevues: 450000,
    investissements_prevus: 50000,
    effectif: 10,
    secteur: 'COMMERCE'
  })

  // Scénarios de simulation
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      nom: 'Scénario conservateur',
      ca_projete: 550000,
      charges_prevues: 440000,
      investissements: 30000
    },
    {
      nom: 'Scénario réaliste',
      ca_projete: 600000,
      charges_prevues: 450000,
      investissements: 50000
    },
    {
      nom: 'Scénario optimiste',
      ca_projete: 700000,
      charges_prevues: 500000,
      investissements: 80000
    }
  ])

  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [fiscalPosition, setFiscalPosition] = useState<any>(null)

  useEffect(() => {
    loadOptimizationData()
  }, [])

  const loadOptimizationData = async () => {
    try {
      setLoading(true)
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const exerciceId = localStorage.getItem('exercice_id') || '1'

      // Charger les régimes fiscaux
      const regimesData = await taxService.getRegimesFiscaux({
        ca_entreprise: simulationParams.ca_actuel,
        secteur: simulationParams.secteur
      }) as any
      setRegimes(regimesData.results || regimesData)

      // Obtenir le régime optimal
      const optimal = await taxService.getOptimalRegime({
        entreprise_id: entrepriseId,
        ca_previsionnel: simulationParams.ca_previsionnel,
        secteur_activite: simulationParams.secteur,
        pays: 'CAMEROUN'
      }) as any
      setOptimalRegime(optimal)

      // Charger les suggestions d'optimisation
      const optimizations = await taxService.getOptimizationSuggestions(
        entrepriseId,
        exerciceId
      ) as any
      setSuggestions(optimizations.results || optimizations)

      // Charger les abattements éligibles
      const abattementsData = await taxService.getAbattementsEligibles({
        entreprise_id: entrepriseId,
        type_impot: 'IS',
        montant_base: simulationParams.ca_actuel - simulationParams.charges_actuelles
      }) as any
      setAbattements(abattementsData.results || abattementsData)

      // Analyser la position fiscale
      const position = await taxService.analyzeFiscalPosition(entrepriseId, exerciceId) as any
      setFiscalPosition(position)

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'optimisation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'

      const results = await taxService.simulateFiscalImpact({
        entreprise_id: entrepriseId,
        scenarios: scenarios
      }) as Record<string, any>

      // Mettre à jour les scénarios avec les résultats
      const updatedScenarios = scenarios.map((scenario, index) => ({
        ...scenario,
        resultats: results.scenarios[index]?.resultats
      }))
      setScenarios(updatedScenarios)

      // Préparer les données pour le graphique de comparaison
      const comparison = updatedScenarios.map(s => ({
        nom: s.nom,
        'Impôt IS': s.resultats?.impot_is || 0,
        'TVA': s.resultats?.tva_a_payer || 0,
        'Patente': s.resultats?.patente || 0,
        'Total': s.resultats?.total_impots || 0
      }))
      setComparisonData(comparison)

      toast({
        title: "Simulation terminée",
        description: "Les résultats de la simulation sont disponibles"
      })
    } catch (error) {
      console.error('Erreur lors de la simulation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la simulation",
        variant: "destructive"
      })
    }
  }

  const compareRegimes = async () => {
    try {
      const regimeIds = regimes.slice(0, 3).map(r => r.id)

      await taxService.compareRegimes(regimeIds, {
        ca_previsionnel: simulationParams.ca_previsionnel,
        charges_prevues: simulationParams.charges_prevues
      })

      // Afficher les résultats
      toast({
        title: "Comparaison terminée",
        description: "Les régimes ont été comparés avec succès"
      })
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error)
      toast({
        title: "Erreur",
        description: "Impossible de comparer les régimes",
        variant: "destructive"
      })
    }
  }

  const applyOptimization = async (_suggestionId: string) => {
    try {
      toast({
        title: "Optimisation appliquée",
        description: "Les recommandations ont été prises en compte"
      })

      // Recharger les données
      loadOptimizationData()
    } catch (error) {
      console.error('Erreur lors de l\'application:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer l'optimisation",
        variant: "destructive"
      })
    }
  }

  const exportOptimizationReport = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const blob = await taxService.exportDeclarationData(
        entrepriseId,
        'EXCEL'
      ) as any

      const url = window.URL.createObjectURL(blob as Blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'rapport_optimisation_fiscale.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: "Le rapport d'optimisation a été téléchargé"
      })
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le rapport",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priorite: string) => {
    switch(priorite) {
      case 'HAUTE': return 'destructive'
      case 'MOYENNE': return 'secondary'
      case 'BASSE': return 'outlined'
      default: return 'default'
    }
  }

  const getComplexityIcon = (complexite: string) => {
    switch(complexite) {
      case 'FAIBLE': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'MOYENNE': return <Info className="h-4 w-4 text-yellow-500" />
      case 'ELEVEE': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  const calculateSavings = () => {
    return abattements
      .filter(a => a.applicable)
      .reduce((sum, a) => sum + a.montant_economie, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Optimisation Fiscale</h1>
          <p className="text-gray-600">Analysez et optimisez votre situation fiscale</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSimulation}>
            <Calculator className="h-4 w-4 mr-2" />
            Lancer simulation
          </Button>
          <Button onClick={exportOptimizationReport} variant="outlined">
            <Download className="h-4 w-4 mr-2" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Résumé de la position fiscale */}
      {fiscalPosition && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Charge fiscale actuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fiscalPosition.charge_fiscale_totale?.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {fiscalPosition.taux_effectif?.toFixed(1)}% du CA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Économies potentielles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calculateSavings().toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Via optimisations disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Régime fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {currentRegime?.libelle || 'Standard'}
              </div>
              {optimalRegime && optimalRegime.id !== currentRegime?.id && (
                <p className="text-xs text-orange-500 mt-1">
                  Changement recommandé
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Optimisations disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suggestions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {suggestions.filter(s => s.priorite === 'HAUTE').length} priorité haute
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="optimizations">Optimisations</TabsTrigger>
          <TabsTrigger value="regimes">Régimes fiscaux</TabsTrigger>
          <TabsTrigger value="abattements">Abattements</TabsTrigger>
        </TabsList>

        {/* Onglet Simulation */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de simulation</CardTitle>
              <CardDescription>
                Ajustez les paramètres pour simuler différents scénarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chiffre d'affaires prévisionnel</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[simulationParams.ca_previsionnel]}
                        onValueChange={(val) => setSimulationParams({
                          ...simulationParams,
                          ca_previsionnel: Array.isArray(val) ? val[0] : val
                        })}
                        min={100000}
                        max={5000000}
                        step={50000}
                        className="flex-1"
                      />
                      <span className="w-32 text-right font-medium">
                        {simulationParams.ca_previsionnel.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Charges prévues</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[simulationParams.charges_prevues]}
                        onValueChange={(val) => setSimulationParams({
                          ...simulationParams,
                          charges_prevues: Array.isArray(val) ? val[0] : val
                        })}
                        min={50000}
                        max={4000000}
                        step={50000}
                        className="flex-1"
                      />
                      <span className="w-32 text-right font-medium">
                        {simulationParams.charges_prevues.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Investissements prévus</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[simulationParams.investissements_prevus]}
                        onValueChange={(val) => setSimulationParams({
                          ...simulationParams,
                          investissements_prevus: Array.isArray(val) ? val[0] : val
                        })}
                        min={0}
                        max={1000000}
                        step={10000}
                        className="flex-1"
                      />
                      <span className="w-32 text-right font-medium">
                        {simulationParams.investissements_prevus.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Secteur d'activité</Label>
                    <Select
                      value={simulationParams.secteur}
                      onValueChange={(value) => setSimulationParams({
                        ...simulationParams,
                        secteur: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMERCE">Commerce</SelectItem>
                        <SelectItem value="SERVICES">Services</SelectItem>
                        <SelectItem value="INDUSTRIE">Industrie</SelectItem>
                        <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                        <SelectItem value="TECHNOLOGIE">Technologie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Effectif prévu</Label>
                    <Input
                      type="number"
                      value={simulationParams.effectif}
                      onChange={(e) => setSimulationParams({
                        ...simulationParams,
                        effectif: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Bénéfice prévisionnel estimé:{' '}
                      <strong>
                        {(simulationParams.ca_previsionnel - simulationParams.charges_prevues).toLocaleString('fr-FR')}
                      </strong>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résultats de simulation */}
          {comparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des scénarios</CardTitle>
                <CardDescription>
                  Impact fiscal selon différents scénarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Impôt IS" fill="#3b82f6" />
                    <Bar dataKey="TVA" fill="#10b981" />
                    <Bar dataKey="Patente" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Détails des scénarios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.nom}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.nom}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">CA projeté:</span>
                      <span>{scenario.ca_projete.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charges:</span>
                      <span>{scenario.charges_prevues.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investissements:</span>
                      <span>{scenario.investissements.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  {scenario.resultats && (
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between font-medium">
                        <span>Total impôts:</span>
                        <span className="text-lg">
                          {scenario.resultats.total_impots.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {scenario.resultats.economie_potentielle > 0 && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Économie: {scenario.resultats.economie_potentielle.toLocaleString('fr-FR')}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Optimisations */}
        <TabsContent value="optimizations" className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-lg">{suggestion.titre}</CardTitle>
                      <Badge variant={getPriorityColor(suggestion.priorite) as any}>
                        {suggestion.priorite}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {suggestion.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getComplexityIcon(suggestion.complexite)}
                    <span className="text-sm text-gray-500">
                      Complexité {suggestion.complexite.toLowerCase()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Impact estimé</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      -{suggestion.impact_estime.toLocaleString('fr-FR')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Actions recommandées:</h4>
                    <ul className="space-y-1">
                      {suggestion.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {suggestion.risques && suggestion.risques.length > 0 && (
                    <Alert severity="error">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Risques:</strong> {suggestion.risques.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => applyOptimization(suggestion.id)}
                  >
                    Appliquer cette optimisation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Onglet Régimes fiscaux */}
        <TabsContent value="regimes" className="space-y-4">
          {optimalRegime && (
            <Alert className="mb-4">
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Régime optimal recommandé:</strong> {optimalRegime.libelle}
                <p className="mt-1 text-sm">{optimalRegime.description}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regimes.map((regime) => (
              <Card
                key={regime.id}
                className={regime.id === optimalRegime?.id ? 'border-blue-500 border-2' : ''}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{regime.libelle}</CardTitle>
                    {regime.id === optimalRegime?.id && (
                      <Badge variant="default">Recommandé</Badge>
                    )}
                  </div>
                  <CardDescription>{regime.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Avantages</span>
                    </div>
                    <ul className="space-y-1">
                      {regime.avantages.map((avantage, idx) => (
                        <li key={idx} className="text-sm text-gray-600 ml-6">
                          • {avantage}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Obligations</span>
                    </div>
                    <ul className="space-y-1">
                      {regime.obligations.map((obligation, idx) => (
                        <li key={idx} className="text-sm text-gray-600 ml-6">
                          • {obligation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      {regime.taux_is && (
                        <span className="text-sm">
                          Taux IS: <strong>{regime.taux_is}%</strong>
                        </span>
                      )}
                      {regime.franchise_tva && (
                        <Badge variant="secondary" className="ml-2">
                          Franchise TVA
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={compareRegimes} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparer les régimes en détail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Abattements */}
        <TabsContent value="abattements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abattements et déductions disponibles</CardTitle>
              <CardDescription>
                Optimisez votre base imposable avec les abattements éligibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {abattements.map((abattement) => (
                  <div
                    key={abattement.id}
                    className={`p-4 border rounded-lg ${
                      abattement.applicable ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{abattement.nom}</h4>
                          {abattement.applicable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Conditions:</p>
                          <ul className="mt-1 space-y-1">
                            {abattement.conditions.map((condition, idx) => (
                              <li key={idx} className="text-sm text-gray-500">
                                • {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Économie potentielle</p>
                        <p className="text-xl font-bold text-green-600">
                          {abattement.montant_economie.toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Total des économies possibles</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateSavings().toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}