import { logger } from '@/utils/logger'
/**
 * Composant pour afficher le tableau de bord de reporting
 * Utilise les nouvelles APIs backend
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
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react'
import reportingService from '@/services/reportingService'
import { useToast } from '@/components/ui/use-toast'

interface DashboardData {
  nb_tableaux_bord: number
  nb_widgets_total: number
  nb_rapports: number
  nb_kpis: number
  nb_exports: number
  derniere_activite: string
  kpis_critiques: any[]
  alertes_actives: any[]
  rapports_recents: any[]
  exports_en_cours: any[]
}

interface KPIWidget {
  id: number
  nom: string
  valeur: number
  evolution: number
  unite: string
  niveau_alerte: 'NORMAL' | 'ATTENTION' | 'CRITIQUE'
}

export default function DashboardView() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [kpis, setKpis] = useState<KPIWidget[]>([])
  const { toast } = useToast()

  // Charger les données du tableau de bord
  useEffect(() => {
    loadDashboardData()
    loadKPIs()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Récupérer l'ID de l'entreprise depuis le contexte ou le store
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'

      const data = await reportingService.getDashboardStatistics(parseInt(entrepriseId))
      setDashboardData(data as any)
    } catch (error) {
      logger.error('Erreur lors du chargement du dashboard:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadKPIs = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const kpisData = await reportingService.getKPIs({
        entreprise: entrepriseId
      } as any) as any[]

      // Transformer les données pour l'affichage
      const widgetData = kpisData.slice(0, 4).map((kpi: any) => ({
        id: kpi.id,
        nom: kpi.nom,
        valeur: kpi.valeur_actuelle?.valeur || 0,
        evolution: kpi.evolution_recente?.evolution || 0,
        unite: kpi.unite_affichage || '',
        niveau_alerte: kpi.valeur_actuelle?.niveau_alerte || 'NORMAL'
      }))

      setKpis(widgetData)
    } catch (error) {
      logger.error('Erreur lors du chargement des KPIs:', error)
    }
  }

  const refreshData = () => {
    loadDashboardData()
    loadKPIs()
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées"
    })
  }

  const exportDashboard = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'

      const exportData = await reportingService.lancerExport({
        entreprise_id: entrepriseId,
        type_rapport: 'DASHBOARD',
        periode_debut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        periode_fin: new Date().toISOString().split('T')[0],
        format: 'PDF'
      })

      toast({
        title: "Export lancé",
        description: "Votre export sera disponible dans quelques instants"
      })

      // Vérifier le statut de l'export périodiquement
      checkExportStatus(exportData.id as any)
    } catch (error) {
      logger.error('Erreur lors de l\'export:', error)
      toast({
        title: "Erreur",
        description: "Impossible de lancer l'export",
        variant: "destructive"
      })
    }
  }

  const checkExportStatus = async (exportId: number) => {
    const interval = setInterval(async () => {
      try {
        const status = await reportingService.getExport(exportId as any)

        if (status.statut === 'TERMINE') {
          clearInterval(interval)
          // Télécharger le fichier
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
        logger.error('Erreur lors de la vérification du statut:', error)
      }
    }, 2000) // Vérifier toutes les 2 secondes
  }

  const getKPIColor = (niveau: string) => {
    switch(niveau) {
      case 'CRITIQUE': return 'text-red-600'
      case 'ATTENTION': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  const getEvolutionIcon = (evolution: number) => {
    if (evolution > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (evolution < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
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
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outlined">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportDashboard} variant="outlined">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Widget
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.nom}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold ${getKPIColor(kpi.niveau_alerte)}`}>
                  {kpi.valeur.toLocaleString('fr-FR')} {kpi.unite}
                </span>
                <div className="flex items-center gap-1">
                  {getEvolutionIcon(kpi.evolution)}
                  <span className={`text-sm ${kpi.evolution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.evolution > 0 ? '+' : ''}{kpi.evolution.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques globales */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte des rapports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Rapports
              </CardTitle>
              <CardDescription>
                {dashboardData.nb_rapports} rapports générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Rapports récents:
                </div>
                {dashboardData.rapports_recents.slice(0, 3).map((rapport: any) => (
                  <div key={rapport.id} className="flex justify-between text-sm">
                    <span className="truncate">{rapport.nom}</span>
                    <span className="text-gray-500">
                      {new Date(rapport.date_generation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Carte des exports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exports
              </CardTitle>
              <CardDescription>
                {dashboardData.exports_en_cours.length} exports en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardData.exports_en_cours.length > 0 ? (
                  dashboardData.exports_en_cours.map((exp: any) => (
                    <div key={exp.id} className="flex justify-between text-sm">
                      <span className="truncate">{exp.type_rapport}</span>
                      <span className="text-blue-500">En cours...</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Aucun export en cours</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Carte des alertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertes KPI
              </CardTitle>
              <CardDescription>
                {dashboardData.kpis_critiques.length} KPIs critiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardData.kpis_critiques.slice(0, 3).map((kpi: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="truncate">{kpi.kpi__nom}</span>
                    <span className="text-red-600 ml-auto">{kpi.valeur}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Tendance des principaux indicateurs</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <LineChart className="h-32 w-32 text-gray-300" />
            <p className="ml-4 text-gray-500">Graphique en cours de chargement...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
            <CardDescription>Distribution des métriques</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <PieChart className="h-32 w-32 text-gray-300" />
            <p className="ml-4 text-gray-500">Graphique en cours de chargement...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}