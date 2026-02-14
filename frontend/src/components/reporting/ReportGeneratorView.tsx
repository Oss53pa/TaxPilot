/**
 * Composant pour générer des rapports personnalisés
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  FilePdf,
  FileJson,
  Mail,
  Save,
  Zap
} from 'lucide-react'
import reportingService from '@/services/reportingService'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Report {
  id: string
  nom: string
  type_rapport: string
  periode_debut: string
  periode_fin: string
  statut: string
  progression: number
  fichier_url?: string
  format: string
  created_at: string
}

interface ReportTemplate {
  id: string
  nom: string
  description: string
  type_rapport: string
  format_defaut: string
  sections: any[]
  usage_count: number
}

interface ReportRequest {
  type_rapport: 'FINANCIAL' | 'TAX' | 'AUDIT' | 'COMPLIANCE' | 'DASHBOARD'
  nom?: string
  description?: string
  entreprise_id?: string
  exercice_id?: string
  periode_debut: string
  periode_fin: string
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON'
  template_id?: string
  parametres?: {
    inclure_details: boolean
    inclure_graphiques: boolean
    inclure_comparaisons: boolean
    niveau_detail: 'RESUME' | 'STANDARD' | 'DETAILLE'
    filtres_specifiques?: any
  }
  schedule?: {
    active: boolean
    frequence: string
    heure: string
    destinataires: string[]
  }
}

export default function ReportGeneratorView() {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set())
  const [_loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('generate')
  const { toast } = useToast()

  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    type_rapport: 'FINANCIAL',
    periode_debut: new Date().toISOString().split('T')[0],
    periode_fin: new Date().toISOString().split('T')[0],
    format: 'PDF',
    parametres: {
      inclure_details: true,
      inclure_graphiques: true,
      inclure_comparaisons: false,
      niveau_detail: 'STANDARD'
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(),
    to: new Date()
  })

  useEffect(() => {
    loadReports()
    loadTemplates()
    // Auto-refresh pour suivre les rapports en cours
    const interval = setInterval(() => {
      checkReportsStatus()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const data = await reportingService.getReports({
        entreprise: entrepriseId
      }) as any
      setReports(data.results || data)
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const data = await reportingService.getReportTemplates() as any
      setTemplates(data.results || data)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  const generateReport = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const exerciceId = localStorage.getItem('exercice_id') || '1'

      const request = {
        ...reportRequest,
        entreprise_id: entrepriseId,
        exercice_id: exerciceId,
        periode_debut: format(dateRange.from, 'yyyy-MM-dd'),
        periode_fin: format(dateRange.to, 'yyyy-MM-dd'),
        template_id: selectedTemplate || undefined
      }

      const report = await reportingService.generateReport(request as any)

      toast({
        title: "Génération lancée",
        description: `Le rapport "${report.nom}" est en cours de génération...`
      })

      // Ajouter à la liste des rapports en cours
      setGeneratingReports(prev => new Set(prev).add(report.id))

      // Recharger la liste
      loadReports()
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      })
    }
  }

  const checkReportsStatus = async () => {
    if (generatingReports.size === 0) return

    for (const reportId of generatingReports) {
      try {
        const status = await reportingService.getReportStatus(reportId)

        if (status.statut === 'TERMINE') {
          setGeneratingReports(prev => {
            const newSet = new Set(prev)
            newSet.delete(reportId)
            return newSet
          })

          toast({
            title: "Rapport terminé",
            description: `Le rapport "${status.nom}" est prêt`
          })

          loadReports()
        } else if (status.statut === 'ERREUR') {
          setGeneratingReports(prev => {
            const newSet = new Set(prev)
            newSet.delete(reportId)
            return newSet
          })

          toast({
            title: "Erreur de génération",
            description: `Le rapport "${status.nom}" a échoué`,
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error)
      }
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      const blob = await reportingService.downloadReport(reportId)
      const report = reports.find(r => r.id === reportId)

      const extension = report?.format.toLowerCase() || 'pdf'
      const filename = `rapport_${reportId}.${extension}`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement lancé",
        description: "Le rapport a été téléchargé"
      })
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le rapport",
        variant: "destructive"
      })
    }
  }

  const shareReport = async (reportId: string) => {
    try {
      const emails = prompt("Entrez les emails des destinataires (séparés par des virgules):")
      if (!emails) return

      await reportingService.shareReport(reportId, {
        emails: emails.split(',').map(e => e.trim()),
        message: "Veuillez trouver ci-joint le rapport demandé",
        require_password: false
      })

      toast({
        title: "Rapport partagé",
        description: "Le rapport a été envoyé aux destinataires"
      })
    } catch (error) {
      console.error('Erreur lors du partage:', error)
      toast({
        title: "Erreur",
        description: "Impossible de partager le rapport",
        variant: "destructive"
      })
    }
  }

  const cancelReport = async (reportId: string) => {
    try {
      await reportingService.cancelReport(reportId)

      setGeneratingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })

      toast({
        title: "Génération annulée",
        description: "La génération du rapport a été annulée"
      })

      loadReports()
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la génération",
        variant: "destructive"
      })
    }
  }

  const scheduleReport = async () => {
    if (!reportRequest.schedule?.active) return

    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'

      await reportingService.scheduleReport(selectedTemplate, {
        cron_expression: getCronExpression(reportRequest.schedule.frequence),
        destinataires: reportRequest.schedule.destinataires,
        parametres: {
          ...reportRequest,
          entreprise_id: entrepriseId
        }
      })

      toast({
        title: "Planification créée",
        description: "Le rapport sera généré automatiquement selon la fréquence définie"
      })
    } catch (error) {
      console.error('Erreur lors de la planification:', error)
      toast({
        title: "Erreur",
        description: "Impossible de planifier le rapport",
        variant: "destructive"
      })
    }
  }

  const getCronExpression = (frequence: string): string => {
    switch(frequence) {
      case 'daily': return '0 9 * * *'
      case 'weekly': return '0 9 * * 1'
      case 'monthly': return '0 9 1 * *'
      case 'quarterly': return '0 9 1 */3 *'
      default: return '0 9 * * *'
    }
  }

  const getFormatIcon = (format: string) => {
    switch(format.toUpperCase()) {
      case 'PDF': return <FilePdf className="h-4 w-4" />
      case 'EXCEL': return <FileSpreadsheet className="h-4 w-4" />
      case 'CSV': return <FileText className="h-4 w-4" />
      case 'JSON': return <FileJson className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (statut: string) => {
    switch(statut) {
      case 'EN_PREPARATION': return <Clock className="h-4 w-4 text-gray-500" />
      case 'EN_COURS': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'TERMINE': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ERREUR': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Générateur de Rapports</h1>
          <p className="text-gray-600">Créez et gérez vos rapports personnalisés</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadReports} variant="outlined">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="scheduled">Planifiés</TabsTrigger>
        </TabsList>

        {/* Onglet Génération */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration du rapport */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du rapport</CardTitle>
                  <CardDescription>
                    Définissez les paramètres de votre rapport
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type de rapport</Label>
                      <Select
                        value={reportRequest.type_rapport}
                        onValueChange={(value) => setReportRequest({
                          ...reportRequest,
                          type_rapport: value as any
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FINANCIAL">Financier</SelectItem>
                          <SelectItem value="TAX">Fiscal</SelectItem>
                          <SelectItem value="AUDIT">Audit</SelectItem>
                          <SelectItem value="COMPLIANCE">Conformité</SelectItem>
                          <SelectItem value="DASHBOARD">Tableau de bord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Format de sortie</Label>
                      <Select
                        value={reportRequest.format}
                        onValueChange={(value) => setReportRequest({
                          ...reportRequest,
                          format: value as any
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="EXCEL">Excel</SelectItem>
                          <SelectItem value="CSV">CSV</SelectItem>
                          <SelectItem value="JSON">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nom du rapport (optionnel)</Label>
                    <Input
                      placeholder="Ex: Rapport financier T1 2024"
                      value={reportRequest.nom || ''}
                      onChange={(e) => setReportRequest({
                        ...reportRequest,
                        nom: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Période</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Du</Label>
                        <Input
                          type="date"
                          value={format(dateRange.from, 'yyyy-MM-dd')}
                          onChange={(e) => setDateRange({
                            ...dateRange,
                            from: new Date(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Au</Label>
                        <Input
                          type="date"
                          value={format(dateRange.to, 'yyyy-MM-dd')}
                          onChange={(e) => setDateRange({
                            ...dateRange,
                            to: new Date(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Template (optionnel)</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun template</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options du rapport</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Niveau de détail</Label>
                    <Select
                      value={reportRequest.parametres?.niveau_detail}
                      onValueChange={(value) => setReportRequest({
                        ...reportRequest,
                        parametres: {
                          ...reportRequest.parametres!,
                          niveau_detail: value as any
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESUME">Résumé</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="DETAILLE">Détaillé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={reportRequest.parametres?.inclure_details}
                        onCheckedChange={(checked) => setReportRequest({
                          ...reportRequest,
                          parametres: {
                            ...reportRequest.parametres!,
                            inclure_details: checked as boolean
                          }
                        })}
                      />
                      <Label className="text-sm font-normal">
                        Inclure les détails des transactions
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={reportRequest.parametres?.inclure_graphiques}
                        onCheckedChange={(checked) => setReportRequest({
                          ...reportRequest,
                          parametres: {
                            ...reportRequest.parametres!,
                            inclure_graphiques: checked as boolean
                          }
                        })}
                      />
                      <Label className="text-sm font-normal">
                        Inclure les graphiques et visualisations
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={reportRequest.parametres?.inclure_comparaisons}
                        onCheckedChange={(checked) => setReportRequest({
                          ...reportRequest,
                          parametres: {
                            ...reportRequest.parametres!,
                            inclure_comparaisons: checked as boolean
                          }
                        })}
                      />
                      <Label className="text-sm font-normal">
                        Inclure les comparaisons avec la période précédente
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planification (optionnel)</CardTitle>
                  <CardDescription>
                    Programmez la génération automatique de ce rapport
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={reportRequest.schedule?.active}
                      onCheckedChange={(checked) => setReportRequest({
                        ...reportRequest,
                        schedule: {
                          active: checked as boolean,
                          frequence: 'monthly',
                          heure: '09:00',
                          destinataires: []
                        }
                      })}
                    />
                    <Label className="text-sm font-normal">
                      Activer la génération automatique
                    </Label>
                  </div>

                  {reportRequest.schedule?.active && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Fréquence</Label>
                          <Select
                            value={reportRequest.schedule.frequence}
                            onValueChange={(value) => setReportRequest({
                              ...reportRequest,
                              schedule: {
                                ...reportRequest.schedule!,
                                frequence: value
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Quotidien</SelectItem>
                              <SelectItem value="weekly">Hebdomadaire</SelectItem>
                              <SelectItem value="monthly">Mensuel</SelectItem>
                              <SelectItem value="quarterly">Trimestriel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Heure d'envoi</Label>
                          <Input
                            type="time"
                            value={reportRequest.schedule.heure}
                            onChange={(e) => setReportRequest({
                              ...reportRequest,
                              schedule: {
                                ...reportRequest.schedule!,
                                heure: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Destinataires (emails séparés par des virgules)</Label>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          onChange={(e) => setReportRequest({
                            ...reportRequest,
                            schedule: {
                              ...reportRequest.schedule!,
                              destinataires: e.target.value.split(',').map(s => s.trim())
                            }
                          })}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions et aperçu */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu de la configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{reportRequest.type_rapport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{reportRequest.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Période:</span>
                    <span className="font-medium">
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: fr })} -
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Niveau de détail:</span>
                    <span className="font-medium">{reportRequest.parametres?.niveau_detail}</span>
                  </div>
                  {reportRequest.schedule?.active && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planification:</span>
                      <span className="font-medium">{reportRequest.schedule.frequence}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="large"
                  onClick={generateReport}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Générer le rapport
                </Button>

                {reportRequest.schedule?.active && (
                  <Button
                    className="w-full"
                    variant="outlined"
                    onClick={scheduleReport}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Planifier le rapport
                  </Button>
                )}

                <Button
                  className="w-full"
                  variant="outlined"
                  onClick={() => {
                    // Sauvegarder comme template
                    toast({
                      title: "Template sauvegardé",
                      description: "La configuration a été sauvegardée comme template"
                    })
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder comme template
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des rapports</CardTitle>
              <CardDescription>
                Liste de tous les rapports générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.statut)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{report.nom}</p>
                          {getFormatIcon(report.format)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{report.type_rapport}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(report.periode_debut), 'dd/MM/yyyy')} -
                            {format(new Date(report.periode_fin), 'dd/MM/yyyy')}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {report.statut === 'EN_COURS' && (
                        <>
                          <div className="w-32">
                            <Progress value={report.progression} className="h-2" />
                          </div>
                          <span className="text-sm text-gray-500">{report.progression}%</span>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => cancelReport(report.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {report.statut === 'TERMINE' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => downloadReport(report.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => shareReport(report.id)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {report.statut === 'ERREUR' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={generateReport}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun rapport généré pour le moment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Planifiés */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Rapports planifiés</CardTitle>
              <CardDescription>
                Gérez vos rapports automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fonctionnalité en cours de développement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}