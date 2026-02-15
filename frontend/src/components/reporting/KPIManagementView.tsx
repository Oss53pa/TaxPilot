import { logger } from '@/utils/logger'
/**
 * Composant pour gérer les KPIs et indicateurs de performance
 * Utilise les APIs du module Reporting
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Bell,
  CheckCircle,
} from 'lucide-react'
import reportingService from '@/services/reportingService'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface KPI {
  id: number
  nom: string
  description: string
  type_kpi: 'FINANCIER' | 'OPERATIONNEL' | 'QUALITE' | 'CUSTOM'
  formule_calcul: string
  unite_affichage: string
  valeur_actuelle?: {
    valeur: number
    date_calcul: string
    niveau_alerte: 'NORMAL' | 'ATTENTION' | 'CRITIQUE'
  }
  valeur_cible: number
  seuil_min: number
  seuil_max: number
  periodicite_calcul: 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL' | 'TRIMESTRIEL' | 'ANNUEL'
  evolution_recente?: {
    evolution: number
    tendance: 'HAUSSE' | 'BAISSE' | 'STABLE'
  }
  historique?: Array<{
    date: string
    valeur: number
  }>
  alertes_actives: number
  is_actif: boolean
}

interface AlerteKPI {
  id: number
  kpi: number
  kpi_nom: string
  type_alerte: 'SEUIL_MIN' | 'SEUIL_MAX' | 'VARIATION' | 'ABSENCE_DONNEES'
  message: string
  niveau: 'INFO' | 'ATTENTION' | 'CRITIQUE'
  date_declenchement: string
  is_resolue: boolean
}

export default function KPIManagementView() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [alertes, setAlertes] = useState<AlerteKPI[]>([])
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showAlertConfig, setShowAlertConfig] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { toast } = useToast()

  const [newKPI, setNewKPI] = useState({
    nom: '',
    description: '',
    type_kpi: 'FINANCIER',
    formule_calcul: '',
    unite_affichage: '',
    valeur_cible: 0,
    seuil_min: 0,
    seuil_max: 100,
    periodicite_calcul: 'MENSUEL'
  })

  const [alertConfig, setAlertConfig] = useState({
    seuil_min_active: true,
    seuil_max_active: true,
    variation_active: false,
    variation_seuil: 10,
    notification_email: false,
    notification_app: true
  })

  useEffect(() => {
    loadKPIs()
    loadAlertes()
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      loadKPIs()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadKPIs = async () => {
    try {
      setLoading(true)
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const data = await reportingService.getKPIs({
        entreprise: entrepriseId
      }) as any

      // Charger l'historique pour chaque KPI
      const kpisWithHistory = await Promise.all(
        ((data as any[]) ?? []).map(async (kpi: KPI) => {
          try {
            const history = await reportingService.getKPIHistory(String(kpi.id), {
              periode_debut: selectedPeriod
            }) as Record<string, any>
            return {
              ...kpi,
              historique: history.valeurs
            }
          } catch {
            return kpi
          }
        })
      )

      setKpis(kpisWithHistory)
    } catch (error) {
      logger.error('Erreur lors du chargement des KPIs:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les KPIs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAlertes = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const data = await reportingService.getKPIAlertes({
        entreprise: entrepriseId,
        active_only: true
      }) as any
      setAlertes(data.results || data)
    } catch (error) {
      logger.error('Erreur lors du chargement des alertes:', error)
    }
  }

  const createKPI = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const created = await reportingService.createKPI({
        ...newKPI,
        entreprise_id: parseInt(entrepriseId)
      }) as any

      toast({
        title: "KPI créé",
        description: `Le KPI "${created.nom}" a été créé avec succès`
      })

      setShowCreateDialog(false)
      loadKPIs()

      // Réinitialiser le formulaire
      setNewKPI({
        nom: '',
        description: '',
        type_kpi: 'FINANCIER',
        formule_calcul: '',
        unite_affichage: '',
        valeur_cible: 0,
        seuil_min: 0,
        seuil_max: 100,
        periodicite_calcul: 'MENSUEL'
      })
    } catch (error) {
      logger.error('Erreur lors de la création du KPI:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le KPI",
        variant: "destructive"
      })
    }
  }

  const deleteKPI = async (kpiId: number) => {
    try {
      await reportingService.deleteKPI(String(kpiId))
      toast({
        title: "KPI supprimé",
        description: "Le KPI a été supprimé avec succès"
      })
      loadKPIs()
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le KPI",
        variant: "destructive"
      })
    }
  }

  const recalculateKPI = async (kpiId: number) => {
    try {
      await reportingService.recalculateKPI(String(kpiId))
      toast({
        title: "Recalcul lancé",
        description: "Le KPI est en cours de recalcul..."
      })

      // Recharger après 2 secondes
      setTimeout(() => {
        loadKPIs()
      }, 2000)
    } catch (error) {
      logger.error('Erreur lors du recalcul:', error)
      toast({
        title: "Erreur",
        description: "Impossible de recalculer le KPI",
        variant: "destructive"
      })
    }
  }

  const exportKPIs = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const exportData = await reportingService.lancerExport({
        entreprise_id: entrepriseId,
        type_rapport: 'DASHBOARD',
        periode_debut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        periode_fin: new Date().toISOString().split('T')[0],
        format: 'EXCEL'
      }) as Record<string, any>

      toast({
        title: "Export lancé",
        description: "L'export des KPIs est en cours..."
      })

      // Vérifier le statut
      checkExportStatus(exportData.id)
    } catch (error) {
      logger.error('Erreur lors de l\'export:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les KPIs",
        variant: "destructive"
      })
    }
  }

  const checkExportStatus = async (exportId: number) => {
    const interval = setInterval(async () => {
      try {
        const status = await reportingService.getExport(String(exportId)) as Record<string, any>

        if (status.statut === 'TERMINE') {
          clearInterval(interval)
          window.open(status.fichier_genere, '_blank')
          toast({
            title: "Export terminé",
            description: "Le téléchargement va commencer"
          })
        } else if (status.statut === 'ERREUR') {
          clearInterval(interval)
          toast({
            title: "Erreur d'export",
            description: "L'export a échoué",
            variant: "destructive"
          })
        }
      } catch (error) {
        clearInterval(interval)
      }
    }, 2000)
  }

  const resolveAlerte = async (alerteId: number) => {
    try {
      await reportingService.resolveKPIAlerte(String(alerteId))
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue"
      })
      loadAlertes()
    } catch (error) {
      logger.error('Erreur lors de la résolution:', error)
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte",
        variant: "destructive"
      })
    }
  }

  const getKPIColor = (niveau?: string) => {
    switch(niveau) {
      case 'CRITIQUE': return 'text-red-600'
      case 'ATTENTION': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  const getEvolutionIcon = (evolution?: number) => {
    if (!evolution) return null
    if (evolution > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (evolution < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getProgressPercentage = (valeur: number, cible: number) => {
    return Math.min(100, Math.max(0, (valeur / cible) * 100))
  }

  const formatGraphData = (historique?: Array<{date: string, valeur: number}>) => {
    if (!historique || historique.length === 0) return []

    return historique.slice(-30).map(item => ({
      date: format(new Date(item.date), 'dd/MM', { locale: fr }),
      valeur: item.valeur
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des KPIs</h1>
          <p className="text-gray-600">Suivez vos indicateurs de performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadKPIs} variant="outlined">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportKPIs} variant="outlined">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau KPI
          </Button>
        </div>
      </div>

      {/* Alertes actives */}
      {alertes.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Alertes actives ({alertes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertes.slice(0, 3).map((alerte) => (
                <div key={alerte.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={alerte.niveau === 'CRITIQUE' ? 'destructive' : 'secondary'}>
                      {alerte.type_alerte}
                    </Badge>
                    <div>
                      <p className="font-medium">{alerte.kpi_nom}</p>
                      <p className="text-sm text-gray-600">{alerte.message}</p>
                    </div>
                  </div>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => resolveAlerte(alerte.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et vue */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="small"
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
              >
                Grille
              </Button>
              <Button
                size="small"
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
              >
                Liste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{kpi.nom}</CardTitle>
                    <CardDescription>{kpi.description}</CardDescription>
                  </div>
                  <Badge variant={kpi.is_actif ? 'default' : 'secondary'}>
                    {kpi.is_actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Valeur actuelle */}
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl font-bold ${getKPIColor(kpi.valeur_actuelle?.niveau_alerte)}`}>
                      {(kpi.valeur_actuelle?.valeur ?? 0).toLocaleString('fr-FR')}
                      <span className="text-sm ml-1">{kpi.unite_affichage}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {getEvolutionIcon(kpi.evolution_recente?.evolution)}
                      {kpi.evolution_recente && (
                        <span className={`text-sm ${kpi.evolution_recente.evolution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {kpi.evolution_recente.evolution > 0 ? '+' : ''}{kpi.evolution_recente.evolution.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progression vers la cible */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Cible: {kpi.valeur_cible} {kpi.unite_affichage}</span>
                      <span>{getProgressPercentage(kpi.valeur_actuelle?.valeur || 0, kpi.valeur_cible).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(kpi.valeur_actuelle?.valeur || 0, kpi.valeur_cible)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini graphique */}
                  {kpi.historique && kpi.historique.length > 0 && (
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={formatGraphData(kpi.historique)}>
                        <defs>
                          <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="valeur"
                          stroke="#3b82f6"
                          fill={`url(#gradient-${kpi.id})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      className="flex-1"
                      onClick={() => {
                        setSelectedKPI(kpi)
                        setShowDetailDialog(true)
                      }}
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => recalculateKPI(kpi.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedKPI(kpi)
                        setShowAlertConfig(true)
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => deleteKPI(kpi.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">KPI</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Valeur actuelle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cible</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Évolution</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{kpi.nom}</p>
                        <p className="text-sm text-gray-500">{kpi.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${getKPIColor(kpi.valeur_actuelle?.niveau_alerte)}`}>
                        {(kpi.valeur_actuelle?.valeur ?? 0).toLocaleString('fr-FR')} {kpi.unite_affichage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {kpi.valeur_cible} {kpi.unite_affichage}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getEvolutionIcon(kpi.evolution_recente?.evolution)}
                        {kpi.evolution_recente && (
                          <span className={`text-sm ${kpi.evolution_recente.evolution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {kpi.evolution_recente.evolution > 0 ? '+' : ''}{kpi.evolution_recente.evolution.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={kpi.valeur_actuelle?.niveau_alerte === 'NORMAL' ? 'default' : 'destructive'}>
                        {kpi.valeur_actuelle?.niveau_alerte || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="small" variant="text" onClick={() => recalculateKPI(kpi.id)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="small" variant="text" onClick={() => deleteKPI(kpi.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau KPI</DialogTitle>
            <DialogDescription>
              Définissez les paramètres de votre indicateur de performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du KPI</Label>
                <Input
                  value={newKPI.nom}
                  onChange={(e) => setNewKPI({ ...newKPI, nom: e.target.value })}
                  placeholder="Ex: Taux de marge brute"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newKPI.type_kpi}
                  onValueChange={(value) => setNewKPI({ ...newKPI, type_kpi: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINANCIER">Financier</SelectItem>
                    <SelectItem value="OPERATIONNEL">Opérationnel</SelectItem>
                    <SelectItem value="QUALITE">Qualité</SelectItem>
                    <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newKPI.description}
                onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
                placeholder="Description du KPI..."
              />
            </div>

            <div className="space-y-2">
              <Label>Formule de calcul</Label>
              <Input
                value={newKPI.formule_calcul}
                onChange={(e) => setNewKPI({ ...newKPI, formule_calcul: e.target.value })}
                placeholder="Ex: (chiffre_affaires - charges) / chiffre_affaires * 100"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unité d'affichage</Label>
                <Input
                  value={newKPI.unite_affichage}
                  onChange={(e) => setNewKPI({ ...newKPI, unite_affichage: e.target.value })}
                  placeholder="Ex: %, €, jours"
                />
              </div>
              <div className="space-y-2">
                <Label>Valeur cible</Label>
                <Input
                  type="number"
                  value={newKPI.valeur_cible}
                  onChange={(e) => setNewKPI({ ...newKPI, valeur_cible: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Périodicité</Label>
                <Select
                  value={newKPI.periodicite_calcul}
                  onValueChange={(value) => setNewKPI({ ...newKPI, periodicite_calcul: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUOTIDIEN">Quotidien</SelectItem>
                    <SelectItem value="HEBDOMADAIRE">Hebdomadaire</SelectItem>
                    <SelectItem value="MENSUEL">Mensuel</SelectItem>
                    <SelectItem value="TRIMESTRIEL">Trimestriel</SelectItem>
                    <SelectItem value="ANNUEL">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Seuils d'alerte</Label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Minimum: {newKPI.seuil_min}</span>
                    <span>Maximum: {newKPI.seuil_max}</span>
                  </div>
                  <Slider
                    value={[newKPI.seuil_min, newKPI.seuil_max]}
                    onValueChange={(value) => { const [min, max] = value as number[]; setNewKPI({ ...newKPI, seuil_min: min, seuil_max: max }) }}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={createKPI}>
              Créer le KPI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      {selectedKPI && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedKPI.nom}</DialogTitle>
              <DialogDescription>{selectedKPI.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Graphique principal */}
              {selectedKPI.historique && selectedKPI.historique.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution sur la période</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatGraphData(selectedKPI.historique)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="valeur"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Informations détaillées */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedKPI.type_kpi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Périodicité:</span>
                      <span>{selectedKPI.periodicite_calcul}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formule:</span>
                      <span className="font-mono text-xs">{selectedKPI.formule_calcul}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valeur actuelle:</span>
                      <span className="font-semibold">
                        {selectedKPI.valeur_actuelle?.valeur} {selectedKPI.unite_affichage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cible:</span>
                      <span>{selectedKPI.valeur_cible} {selectedKPI.unite_affichage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de réalisation:</span>
                      <span>
                        {getProgressPercentage(
                          selectedKPI.valeur_actuelle?.valeur || 0,
                          selectedKPI.valeur_cible
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDetailDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Configuration des alertes */}
      <Dialog open={showAlertConfig} onOpenChange={setShowAlertConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration des alertes</DialogTitle>
            <DialogDescription>
              Définissez les règles d'alerte pour {selectedKPI?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alerte seuil minimum</Label>
                <p className="text-sm text-gray-500">
                  Alerter si la valeur descend sous {selectedKPI?.seuil_min} {selectedKPI?.unite_affichage}
                </p>
              </div>
              <Switch
                checked={alertConfig.seuil_min_active}
                onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, seuil_min_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alerte seuil maximum</Label>
                <p className="text-sm text-gray-500">
                  Alerter si la valeur dépasse {selectedKPI?.seuil_max} {selectedKPI?.unite_affichage}
                </p>
              </div>
              <Switch
                checked={alertConfig.seuil_max_active}
                onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, seuil_max_active: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Alerte de variation</Label>
                <Switch
                  checked={alertConfig.variation_active}
                  onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, variation_active: checked })}
                />
              </div>
              {alertConfig.variation_active && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Alerter si variation &gt;</span>
                  <Input
                    type="number"
                    value={alertConfig.variation_seuil}
                    onChange={(e) => setAlertConfig({ ...alertConfig, variation_seuil: parseInt(e.target.value) })}
                    className="w-20"
                  />
                  <span className="text-sm">%</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Label>Notifications</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <Switch
                    checked={alertConfig.notification_email}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, notification_email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Application</span>
                  <Switch
                    checked={alertConfig.notification_app}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, notification_app: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowAlertConfig(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast({
                title: "Configuration enregistrée",
                description: "Les alertes ont été configurées avec succès"
              })
              setShowAlertConfig(false)
            }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}