import { logger } from '@/utils/logger'
/**
 * Composant pour gérer les templates et modèles
 * Consomme les APIs du moteur de templates backend
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
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  Upload,
  Copy,
  Trash,
  Eye,
  Plus,
  Play,
  FileSpreadsheet,
  FileCode
} from 'lucide-react'
import templatesService from '@/services/templatesService'
import { useToast } from '@/components/ui/use-toast'

interface Template {
  id: string
  nom: string
  description: string
  type_template: string
  categorie: string
  version: string
  norme_applicable: string
  is_public: boolean
  is_actif: boolean
  format_sortie: string[]
  usage_count: number
  tags: string[]
  created_at: string
  variables: TemplateVariable[]
  sections: TemplateSection[]
}

interface TemplateVariable {
  id: string
  nom: string
  libelle: string
  type: string
  obligatoire: boolean
  valeur_defaut?: any
}

interface TemplateSection {
  id: string
  nom: string
  ordre: number
  type_section: string
  contenu_template: string
}

interface TemplateInstance {
  id: string
  nom_instance: string
  statut: string
  progression: number
  fichier_genere?: string
  created_at: string
}

export default function TemplateManagerView() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [instances, setInstances] = useState<TemplateInstance[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [_loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [generationParams, setGenerationParams] = useState<Record<string, any>>({})
  const [previewContent, setPreviewContent] = useState<string>('')
  const { toast } = useToast()

  // État pour le nouveau template
  const [newTemplate, setNewTemplate] = useState({
    nom: '',
    description: '',
    type_template: 'DOCUMENT',
    categorie: 'Finance',
    norme_applicable: 'SYSCOHADA',
    is_public: false
  })

  useEffect(() => {
    loadTemplates()
    loadInstances()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedCategory !== 'all') {
        params.categorie = selectedCategory
      }
      if (searchQuery) {
        params.search = searchQuery
      }

      const data = await templatesService.getTemplates(params) as any
      setTemplates(data.results || data)
    } catch (error) {
      logger.error('Erreur lors du chargement des templates:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadInstances = async () => {
    try {
      const data = await templatesService.getTemplateInstances() as any
      setInstances(data.results || data)
    } catch (error) {
      logger.error('Erreur lors du chargement des instances:', error)
    }
  }

  const createTemplate = async () => {
    try {
      const created = await templatesService.createTemplate(newTemplate as any)
      toast({
        title: "Template créé",
        description: `Le template "${created.nom}" a été créé avec succès`
      })
      setShowCreateDialog(false)
      loadTemplates()
      setNewTemplate({
        nom: '',
        description: '',
        type_template: 'DOCUMENT',
        categorie: 'Finance',
        norme_applicable: 'SYSCOHADA',
        is_public: false
      })
    } catch (error) {
      logger.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      })
    }
  }

  const duplicateTemplate = async (templateId: string, templateName: string) => {
    try {
      const newName = `${templateName} (Copie)`
      await templatesService.duplicateTemplate(templateId, newName)
      toast({
        title: "Template dupliqué",
        description: `Le template a été dupliqué sous le nom "${newName}"`
      })
      loadTemplates()
    } catch (error) {
      logger.error('Erreur lors de la duplication:', error)
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le template",
        variant: "destructive"
      })
    }
  }

  const generateInstance = async () => {
    if (!selectedTemplate) return

    try {
      const instance = await templatesService.generateInstance({
        template_id: selectedTemplate.id,
        nom_instance: `Instance de ${selectedTemplate.nom}`,
        parametres: generationParams,
        format_sortie: 'PDF'
      })

      toast({
        title: "Génération lancée",
        description: "La génération du document est en cours..."
      })

      // Vérifier le statut
      checkInstanceStatus(instance.id)
      setShowGenerateDialog(false)
      loadInstances()
    } catch (error) {
      logger.error('Erreur lors de la génération:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive"
      })
    }
  }

  const checkInstanceStatus = async (instanceId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await templatesService.getInstanceStatus(instanceId)

        if (status.statut === 'TERMINE') {
          clearInterval(interval)
          toast({
            title: "Génération terminée",
            description: "Le document a été généré avec succès"
          })
          loadInstances()
        } else if (status.statut === 'ERREUR') {
          clearInterval(interval)
          toast({
            title: "Erreur de génération",
            description: "La génération a échoué",
            variant: "destructive"
          })
        }
      } catch (error) {
        clearInterval(interval)
        logger.error('Erreur lors de la vérification:', error)
      }
    }, 2000)
  }

  const previewTemplate = async (template: Template) => {
    try {
      const preview = await templatesService.previewTemplate(
        template.id,
        generationParams,
        { sample: true }
      ) as Record<string, any>
      setPreviewContent(preview.html || preview.content || 'Aperçu non disponible')
      setShowPreviewDialog(true)
    } catch (error) {
      logger.error('Erreur lors de l\'aperçu:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer l'aperçu",
        variant: "destructive"
      })
    }
  }

  const downloadTemplate = async (templateId: string) => {
    try {
      const blob = await templatesService.downloadTemplate(templateId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `template_${templateId}.docx`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement lancé",
        description: "Le template a été téléchargé"
      })
    } catch (error) {
      logger.error('Erreur lors du téléchargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le template",
        variant: "destructive"
      })
    }
  }

  const downloadInstance = async (instanceId: string) => {
    try {
      const blob = await templatesService.downloadInstance(instanceId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `document_${instanceId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement lancé",
        description: "Le document a été téléchargé"
      })
    } catch (error) {
      logger.error('Erreur lors du téléchargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      })
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      await templatesService.deleteTemplate(templateId)
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès"
      })
      loadTemplates()
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      })
    }
  }

  const getFormatIcon = (format: string) => {
    switch(format.toUpperCase()) {
      case 'PDF': return <FileText className="h-4 w-4" />
      case 'EXCEL':
      case 'XLSX': return <FileSpreadsheet className="h-4 w-4" />
      case 'HTML': return <FileCode className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'EN_PREPARATION': return 'bg-gray-100 text-gray-800'
      case 'EN_COURS': return 'bg-blue-100 text-blue-800'
      case 'TERMINE': return 'bg-green-100 text-green-800'
      case 'ERREUR': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestionnaire de Templates</h1>
          <p className="text-gray-600">Créez et gérez vos modèles de documents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
          <Button variant="outlined">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTemplates()}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Comptabilite">Comptabilité</SelectItem>
                <SelectItem value="RH">Ressources Humaines</SelectItem>
                <SelectItem value="Juridique">Juridique</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadTemplates}>
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="instances">Documents générés</TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.nom}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.is_public && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags?.map((tag, idx) => (
                      <Badge key={idx} variant="outlined" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span>{template.type_template}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Version:</span>
                      <span>{template.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Utilisations:</span>
                      <span>{template.usage_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Formats:</span>
                      <div className="flex gap-1">
                        {template.format_sortie?.map((format, idx) => (
                          <span key={idx}>{getFormatIcon(format)}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="small"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowGenerateDialog(true)
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Générer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => previewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => duplicateTemplate(template.id, template.nom)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => downloadTemplate(template.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Instances */}
        <TabsContent value="instances">
          <Card>
            <CardHeader>
              <CardTitle>Documents générés</CardTitle>
              <CardDescription>
                Historique des documents générés à partir des templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instances.map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{instance.nom_instance}</p>
                        <p className="text-sm text-gray-500">
                          Généré le {new Date(instance.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(instance.statut)}>
                        {instance.statut.replace('_', ' ')}
                      </Badge>
                      {instance.statut === 'EN_COURS' && (
                        <span className="text-sm text-gray-500">
                          {instance.progression}%
                        </span>
                      )}
                      {instance.statut === 'TERMINE' && instance.fichier_genere && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => downloadInstance(instance.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau template</DialogTitle>
            <DialogDescription>
              Définissez les informations de base du template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du template</label>
              <Input
                value={newTemplate.nom}
                onChange={(e) => setNewTemplate({ ...newTemplate, nom: e.target.value })}
                placeholder="Ex: Facture SYSCOHADA"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Description du template..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newTemplate.type_template}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, type_template: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="LIASSE">Liasse fiscale</SelectItem>
                    <SelectItem value="RAPPORT">Rapport</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="ETIQUETTE">Étiquette</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select
                  value={newTemplate.categorie}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, categorie: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Comptabilite">Comptabilité</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Juridique">Juridique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newTemplate.is_public}
                onChange={(e) => setNewTemplate({ ...newTemplate, is_public: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Rendre ce template public</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={createTemplate}>
              Créer le template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de génération */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Générer un document</DialogTitle>
            <DialogDescription>
              Configurez les paramètres pour générer le document
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium mb-2">Template: {selectedTemplate.nom}</h3>
                <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
              </div>

              {selectedTemplate.variables?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Variables du template</h4>
                  <div className="space-y-3">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable.id} className="space-y-1">
                        <label className="text-sm font-medium">
                          {variable.libelle}
                          {variable.obligatoire && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                          placeholder={`Entrez ${variable.libelle.toLowerCase()}`}
                          value={generationParams[variable.nom] || variable.valeur_defaut || ''}
                          onChange={(e) => setGenerationParams({
                            ...generationParams,
                            [variable.nom]: e.target.value
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowGenerateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={generateInstance}>
              <Play className="h-4 w-4 mr-2" />
              Générer le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'aperçu */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du template</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto p-4 border rounded-lg bg-white">
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}