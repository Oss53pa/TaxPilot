import { logger } from '@/utils/logger'
/**
 * Composant pour l'édition des variables et formules de templates
 * Utilise les APIs du module Templates Engine
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
// Monaco editor placeholder - renders a textarea when @monaco-editor/react is not installed
const MonacoEditor = ({ value, onChange, height, ...props }: any) => (
  <textarea
    value={value || ''}
    onChange={(e) => onChange?.(e.target.value)}
    style={{ width: '100%', height: height || '200px', fontFamily: 'monospace', fontSize: 14, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
    {...(props as any)}
  />
)
import {
  Variable,
  Sigma,
  Plus,
  Edit,
  Trash,
  Save,
  Play,
  Copy,
  Check,
  X,
  AlertCircle,
  Braces,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft,
  Database,
  Zap,
  Eye
} from 'lucide-react'
import templatesService from '@/services/templatesService'
import { useToast } from '@/components/ui/use-toast'

interface TemplateVariable {
  id: string
  nom: string
  libelle: string
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'LIST' | 'OBJECT'
  obligatoire: boolean
  valeur_defaut?: any
  validation_regex?: string
  description?: string
  source_donnees?: string
  dependances?: string[]
}

interface TemplateSection {
  id: string
  nom: string
  ordre: number
  type_section: 'HEADER' | 'BODY' | 'FOOTER' | 'TABLE' | 'CHART' | 'IMAGE'
  contenu_template: string
  conditions_affichage?: string
  style_css?: string
  parametres?: any
}

interface Formula {
  id: string
  nom: string
  expression: string
  description: string
  variables_utilisees: string[]
  type_retour: string
  est_valide: boolean
}

export default function TemplateVariablesEditor() {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [sections, setSections] = useState<TemplateSection[]>([])
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [_loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('variables')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  // État pour nouvelle variable
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    nom: '',
    libelle: '',
    type: 'TEXT',
    obligatoire: false,
    description: ''
  })

  // État pour nouvelle section
  const [, setNewSection] = useState<Partial<TemplateSection>>({
    nom: '',
    type_section: 'BODY',
    contenu_template: '',
    ordre: 1
  })

  // État pour la formule
  const [formulaEditor, setFormulaEditor] = useState({
    expression: '',
    testData: {},
    result: null,
    error: null
  })

  // État pour le test de template
  const [templateTest, setTemplateTest] = useState({
    data: {},
    preview: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateDetails()
    }
  }, [selectedTemplate])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await templatesService.getTemplates() as any
      setTemplates(data.results || data)
      if (data.length > 0) {
        setSelectedTemplate(data[0])
      }
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

  const loadTemplateDetails = async () => {
    if (!selectedTemplate) return

    try {
      // Charger les variables
      const varsData = await templatesService.getTemplateVariables(selectedTemplate.id) as any
      setVariables(varsData.results || varsData)

      // Charger les sections
      const sectionsData = await templatesService.getTemplateSections(selectedTemplate.id) as any
      setSections(sectionsData.results || sectionsData)

      // Créer des formules à partir des variables avec expressions
      const formulasFromVars = variables
        .filter(v => v.source_donnees && v.source_donnees.includes('='))
        .map(v => ({
          id: v.id,
          nom: v.nom,
          expression: v.source_donnees || '',
          description: v.description || '',
          variables_utilisees: extractVariablesFromExpression(v.source_donnees || ''),
          type_retour: v.type,
          est_valide: true
        }))
      setFormulas(formulasFromVars)

    } catch (error) {
      logger.error('Erreur lors du chargement des détails:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du template",
        variant: "destructive"
      })
    }
  }

  const extractVariablesFromExpression = (expression: string): string[] => {
    const regex = /\{([^}]+)\}/g
    const matches = expression.matchAll(regex)
    return Array.from(matches).map(match => match[1])
  }

  const addVariable = async () => {
    if (!selectedTemplate) return

    try {
      const created = await templatesService.addTemplateVariable(
        selectedTemplate.id,
        newVariable
      )

      toast({
        title: "Variable ajoutée",
        description: `La variable "${created.nom}" a été créée`
      })

      setShowAddDialog(false)
      setNewVariable({
        nom: '',
        libelle: '',
        type: 'TEXT',
        obligatoire: false,
        description: ''
      })
      loadTemplateDetails()
    } catch (error) {
      logger.error('Erreur lors de l\'ajout:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la variable",
        variant: "destructive"
      })
    }
  }

  const updateVariable = async (variableId: string, updates: Partial<TemplateVariable>) => {
    if (!selectedTemplate) return

    try {
      await templatesService.updateTemplateVariable(
        selectedTemplate.id,
        variableId,
        updates
      )

      toast({
        title: "Variable mise à jour",
        description: "Les modifications ont été enregistrées"
      })

      loadTemplateDetails()
    } catch (error) {
      logger.error('Erreur lors de la mise à jour:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la variable",
        variant: "destructive"
      })
    }
  }

  const deleteVariable = async (variableId: string) => {
    if (!selectedTemplate) return

    try {
      await templatesService.deleteTemplateVariable(
        selectedTemplate.id,
        variableId
      )

      toast({
        title: "Variable supprimée",
        description: "La variable a été supprimée"
      })

      loadTemplateDetails()
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la variable",
        variant: "destructive"
      })
    }
  }

  const reorderSections = async (newOrder: Array<{ id: string; ordre: number }>) => {
    if (!selectedTemplate) return

    try {
      await templatesService.reorderTemplateSections(selectedTemplate.id, newOrder)

      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des sections a été modifié"
      })

      loadTemplateDetails()
    } catch (error) {
      logger.error('Erreur lors du réordonnancement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de réordonner les sections",
        variant: "destructive"
      })
    }
  }

  const validateFormula = async () => {
    if (!selectedTemplate) return

    try {
      const result = await templatesService.validateTemplate(
        selectedTemplate.id,
        formulaEditor.testData
      ) as any

      if (result.valide) {
        setFormulaEditor({
          ...formulaEditor,
          result: result.resultat,
          error: null
        })
        toast({
          title: "Formule valide",
          description: "La formule s'exécute correctement"
        })
      } else {
        setFormulaEditor({
          ...formulaEditor,
          result: null,
          error: result.erreurs
        })
      }
    } catch (error) {
      logger.error('Erreur lors de la validation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de valider la formule",
        variant: "destructive"
      })
    }
  }

  const testTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const result = await templatesService.testTemplateGeneration(
        selectedTemplate.id,
        templateTest.data
      ) as any

      setTemplateTest({
        ...templateTest,
        preview: result.html || result.preview
      })

      setShowTestDialog(true)
    } catch (error) {
      logger.error('Erreur lors du test:', error)
      toast({
        title: "Erreur",
        description: "Impossible de tester le template",
        variant: "destructive"
      })
    }
  }

  const duplicateVariable = (variable: TemplateVariable) => {
    setNewVariable({
      ...variable,
      nom: `${variable.nom}_copie`,
      libelle: `${variable.libelle} (Copie)`
    })
    setShowAddDialog(true)
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'TEXT': return <Type className="h-4 w-4" />
      case 'NUMBER': return <Hash className="h-4 w-4" />
      case 'DATE': return <Calendar className="h-4 w-4" />
      case 'BOOLEAN': return <ToggleLeft className="h-4 w-4" />
      case 'LIST': return <List className="h-4 w-4" />
      case 'OBJECT': return <Database className="h-4 w-4" />
      default: return <Variable className="h-4 w-4" />
    }
  }

  const getSectionIcon = (type: string) => {
    switch(type) {
      case 'HEADER': return '📄'
      case 'BODY': return '📝'
      case 'FOOTER': return '📎'
      case 'TABLE': return '📊'
      case 'CHART': return '📈'
      case 'IMAGE': return '🖼️'
      default: return '📋'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Éditeur de Variables et Formules</h1>
          <p className="text-gray-600">Configurez les variables dynamiques et formules de vos templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testTemplate} variant="outlined">
            <Play className="h-4 w-4 mr-2" />
            Tester
          </Button>
          <Button onClick={() => {
            toast({
              title: "Template sauvegardé",
              description: "Les modifications ont été enregistrées"
            })
          }}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Sélection du template */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Label className="w-32">Template actif:</Label>
            <Select
              value={selectedTemplate?.id}
              onValueChange={(value) => {
                const template = templates.find(t => t.id === value)
                setSelectedTemplate(template)
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionnez un template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.nom} - {template.type_template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              Version {selectedTemplate?.version || '1.0'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="formulas">Formules</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
          </TabsList>

          {/* Onglet Variables */}
          <TabsContent value="variables">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Variables du template</CardTitle>
                    <CardDescription>
                      Définissez les variables dynamiques utilisables dans le template
                    </CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingItem(null)
                    setNewVariable({
                      nom: '',
                      libelle: '',
                      type: 'TEXT',
                      obligatoire: false,
                      description: ''
                    })
                    setShowAddDialog(true)
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter variable
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Libellé</TableHead>
                      <TableHead>Obligatoire</TableHead>
                      <TableHead>Valeur par défaut</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variables.map((variable) => (
                      <TableRow key={variable.id}>
                        <TableCell>{getTypeIcon(variable.type)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {'{' + variable.nom + '}'}
                        </TableCell>
                        <TableCell>{variable.libelle}</TableCell>
                        <TableCell>
                          {variable.obligatoire ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {variable.valeur_defaut || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {variable.source_donnees ? (
                            <Badge variant="secondary">
                              {variable.source_donnees.substring(0, 20)}...
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => duplicateVariable(variable)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                setEditingItem(variable)
                                setNewVariable(variable)
                                setShowAddDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => deleteVariable(variable.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {variables.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune variable définie pour ce template
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sections */}
          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sections du template</CardTitle>
                    <CardDescription>
                      Organisez le contenu en sections réutilisables
                    </CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingItem(null)
                    setNewSection({
                      nom: '',
                      type_section: 'BODY',
                      contenu_template: '',
                      ordre: sections.length + 1
                    })
                    setShowAddDialog(true)
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter section
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSectionIcon(section.type_section)}</span>
                          <div>
                            <h4 className="font-medium">{section.nom}</h4>
                            <p className="text-sm text-gray-500">
                              Section {section.ordre} - {section.type_section}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const newOrder = sections.map(s => ({
                                id: s.id,
                                ordre: s.id === section.id ? Math.max(1, section.ordre - 1) :
                                       s.ordre === section.ordre - 1 ? section.ordre : s.ordre
                              }))
                              reorderSections(newOrder)
                            }}
                            disabled={section.ordre === 1}
                          >
                            ↑
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const newOrder = sections.map(s => ({
                                id: s.id,
                                ordre: s.id === section.id ? section.ordre + 1 :
                                       s.ordre === section.ordre + 1 ? section.ordre : s.ordre
                              }))
                              reorderSections(newOrder)
                            }}
                            disabled={section.ordre === sections.length}
                          >
                            ↓
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setEditingItem(section)
                              setNewSection(section)
                              setShowAddDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm font-mono">
                        {section.contenu_template.substring(0, 200)}
                        {section.contenu_template.length > 200 && '...'}
                      </div>

                      {section.conditions_affichage && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Condition: <code>{section.conditions_affichage}</code>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>

                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune section définie pour ce template
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Formules */}
          <TabsContent value="formulas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Éditeur de formules</CardTitle>
                  <CardDescription>
                    Créez des formules avec les variables disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Expression de la formule</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="200px"
                        defaultLanguage="javascript"
                        theme="vs-light"
                        value={formulaEditor.expression}
                        onChange={(value: any) => setFormulaEditor({
                          ...formulaEditor,
                          expression: value || ''
                        })}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'off',
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Variables disponibles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {variables.map(v => (
                        <Badge
                          key={v.id}
                          variant="outlined"
                          className="cursor-pointer"
                          onClick={() => {
                            const newExpression = formulaEditor.expression + ` {${v.nom}}`
                            setFormulaEditor({
                              ...formulaEditor,
                              expression: newExpression
                            })
                          }}
                        >
                          <Braces className="h-3 w-3 mr-1" />
                          {v.nom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Fonctions disponibles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['somme', 'moyenne', 'min', 'max', 'si', 'arrondir', 'format_nombre'].map(fn => (
                        <Badge
                          key={fn}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const newExpression = formulaEditor.expression + ` ${fn}()`
                            setFormulaEditor({
                              ...formulaEditor,
                              expression: newExpression
                            })
                          }}
                        >
                          <Sigma className="h-3 w-3 mr-1" />
                          {fn}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={validateFormula} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Valider la formule
                  </Button>

                  {formulaEditor.result && (
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertDescription>
                        Résultat: <strong>{JSON.stringify(formulaEditor.result)}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {formulaEditor.error && (
                    <Alert severity="error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Erreur: {formulaEditor.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formules enregistrées</CardTitle>
                  <CardDescription>
                    Liste des formules utilisées dans le template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formulas.map(formula => (
                      <div key={formula.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{formula.nom}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {formula.description}
                            </p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                              {formula.expression}
                            </code>
                          </div>
                          {formula.est_valide ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formulas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucune formule définie
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Styles */}
          <TabsContent value="styles">
            <Card>
              <CardHeader>
                <CardTitle>Styles et mise en forme</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence du template avec du CSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>CSS personnalisé</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="400px"
                        defaultLanguage="css"
                        theme="vs-light"
                        value={selectedTemplate?.style_css || ''}
                        onChange={(_value: any) => {
                          // Mettre à jour le style CSS
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Palette de couleurs</Label>
                      <div className="flex gap-2 mt-2">
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                          <div
                            key={color}
                            className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              navigator.clipboard.writeText(color)
                              toast({
                                title: "Couleur copiée",
                                description: color
                              })
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Thème</Label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="professional">Professionnel</SelectItem>
                          <SelectItem value="colorful">Coloré</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="outlined" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu avec styles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog d'ajout/édition de variable */}
      <Dialog open={showAddDialog && activeTab === 'variables'} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier la variable' : 'Ajouter une variable'}
            </DialogTitle>
            <DialogDescription>
              Définissez les propriétés de la variable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom (identifiant)</Label>
                <Input
                  value={newVariable.nom}
                  onChange={(e) => setNewVariable({ ...newVariable, nom: e.target.value })}
                  placeholder="ex: nom_client"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newVariable.type}
                  onValueChange={(value) => setNewVariable({ ...newVariable, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Texte</SelectItem>
                    <SelectItem value="NUMBER">Nombre</SelectItem>
                    <SelectItem value="DATE">Date</SelectItem>
                    <SelectItem value="BOOLEAN">Booléen</SelectItem>
                    <SelectItem value="LIST">Liste</SelectItem>
                    <SelectItem value="OBJECT">Objet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Libellé</Label>
              <Input
                value={newVariable.libelle}
                onChange={(e) => setNewVariable({ ...newVariable, libelle: e.target.value })}
                placeholder="ex: Nom du client"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newVariable.description}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Valeur par défaut</Label>
              <Input
                value={newVariable.valeur_defaut}
                onChange={(e) => setNewVariable({ ...newVariable, valeur_defaut: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newVariable.obligatoire}
                onCheckedChange={(checked) => setNewVariable({ ...newVariable, obligatoire: checked })}
              />
              <Label>Variable obligatoire</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              if (editingItem) {
                updateVariable(editingItem.id, newVariable)
              } else {
                addVariable()
              }
            }}>
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de test */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test du template</DialogTitle>
            <DialogDescription>
              Aperçu avec les données de test
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto p-4 border rounded-lg bg-white">
            <div dangerouslySetInnerHTML={{ __html: templateTest.preview }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTestDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}