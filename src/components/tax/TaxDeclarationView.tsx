/**
 * Composant pour gérer les déclarations fiscales
 * Consomme les APIs backend pour la gestion fiscale
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  Send,
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import taxService from '@/services/taxService'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Declaration {
  id: string
  type_declaration: 'IS' | 'TVA' | 'PATENTE' | 'BILAN_FISCAL'
  periode_debut: string
  periode_fin: string
  statut: 'BROUILLON' | 'VALIDEE' | 'DEPOSEE' | 'ACCEPTEE' | 'REJETEE'
  montant_impot: number
  montant_a_payer: number
  date_depot?: string
  numero_declaration?: string
  entreprise_detail?: {
    raison_sociale: string
    numero_contribuable: string
  }
}

interface ObligationFiscale {
  id: string
  libelle: string
  type_obligation: string
  date_echeance: string
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'EN_RETARD'
  montant_estimé?: number
}

interface CalculResult {
  base_imposable: number
  taux_applique: number
  montant_impot: number
  acomptes_verses: number
  solde_a_payer: number
  details_calcul: Array<{
    etape: string
    description: string
    montant: number
    taux?: number
  }>
}

export default function TaxDeclarationView() {
  const [loading, setLoading] = useState(true)
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [obligations, setObligations] = useState<ObligationFiscale[]>([])
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null)
  const [calculResult, setCalculResult] = useState<CalculResult | null>(null)
  const [selectedType, setSelectedType] = useState<string>('TVA')
  const [showCalculModal, setShowCalculModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDeclarations()
    loadObligations()
  }, [])

  const loadDeclarations = async () => {
    try {
      setLoading(true)
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const data = await taxService.getDeclarations({
        entreprise: entrepriseId
      })
      setDeclarations(data.results || data)
    } catch (error) {
      console.error('Erreur lors du chargement des déclarations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les déclarations fiscales",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadObligations = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const data = await taxService.getObligationsEcheances(entrepriseId, 60)
      setObligations(data.results || data)
    } catch (error) {
      console.error('Erreur lors du chargement des obligations:', error)
    }
  }

  const calculateTax = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const exerciceId = localStorage.getItem('exercice_id') || '1'

      let result
      if (selectedType === 'IS') {
        result = await taxService.calculateIS({
          entreprise_id: entrepriseId,
          exercice_id: exerciceId,
          benefice_comptable: 150000,
          reintegrations: 5000,
          deductions: 10000
        })
      } else if (selectedType === 'TVA') {
        result = await taxService.calculateTVA({
          entreprise_id: entrepriseId,
          periode_debut: new Date().toISOString().split('T')[0],
          periode_fin: new Date().toISOString().split('T')[0],
          tva_collectee: 20000,
          tva_deductible: 15000
        })
      } else {
        result = await taxService.calculatePatente({
          entreprise_id: entrepriseId,
          exercice_id: exerciceId,
          chiffre_affaires: 500000,
          valeur_locative: 100000
        })
      }

      setCalculResult(result.resultat)
      setShowCalculModal(true)
      toast({
        title: "Calcul effectué",
        description: `Montant de l'impôt: ${result.resultat.montant_impot.toLocaleString('fr-FR')} FCFA`
      })
    } catch (error) {
      console.error('Erreur lors du calcul:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le calcul fiscal",
        variant: "destructive"
      })
    }
  }

  const submitDeclaration = async (declarationId: string) => {
    try {
      await taxService.submitDeclaration(declarationId)
      toast({
        title: "Déclaration transmise",
        description: "La déclaration a été transmise avec succès"
      })
      loadDeclarations()
    } catch (error) {
      console.error('Erreur lors de la transmission:', error)
      toast({
        title: "Erreur",
        description: "Impossible de transmettre la déclaration",
        variant: "destructive"
      })
    }
  }

  const validateDeclaration = async (declarationId: string) => {
    try {
      await taxService.validateDeclaration(declarationId)
      toast({
        title: "Validation réussie",
        description: "La déclaration a été validée"
      })
      loadDeclarations()
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs avant de valider",
        variant: "destructive"
      })
    }
  }

  const downloadDeclarationPDF = async (declarationId: string) => {
    try {
      const blob = await taxService.generateDeclarationPDF(declarationId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `declaration_${declarationId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement lancé",
        description: "Le PDF a été téléchargé"
      })
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'BROUILLON': 'secondary',
      'VALIDEE': 'outline',
      'DEPOSEE': 'default',
      'ACCEPTEE': 'default',
      'REJETEE': 'destructive',
      'A_FAIRE': 'secondary',
      'EN_COURS': 'outline',
      'TERMINEE': 'default',
      'EN_RETARD': 'destructive'
    }

    const colors: Record<string, string> = {
      'BROUILLON': 'bg-gray-100 text-gray-800',
      'VALIDEE': 'bg-blue-100 text-blue-800',
      'DEPOSEE': 'bg-green-100 text-green-800',
      'ACCEPTEE': 'bg-green-200 text-green-900',
      'REJETEE': 'bg-red-100 text-red-800',
      'A_FAIRE': 'bg-yellow-100 text-yellow-800',
      'EN_COURS': 'bg-blue-100 text-blue-800',
      'TERMINEE': 'bg-green-100 text-green-800',
      'EN_RETARD': 'bg-red-100 text-red-800'
    }

    return (
      <Badge variant={variants[statut]} className={colors[statut]}>
        {statut.replace('_', ' ')}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'IS': return <Calculator className="h-4 w-4" />
      case 'TVA': return <TrendingUp className="h-4 w-4" />
      case 'PATENTE': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
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
          <h1 className="text-3xl font-bold">Déclarations Fiscales</h1>
          <p className="text-gray-600">Gérez vos obligations fiscales</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDeclarations} variant="outlined">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowCalculModal(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculer Impôt
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Déclarations en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {declarations.filter(d => d.statut === 'BROUILLON').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">À compléter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Montant à payer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {declarations
                .reduce((sum, d) => sum + (d.montant_a_payer || 0), 0)
                .toLocaleString('fr-FR')}
              <span className="text-sm ml-1">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total dû</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Obligations à venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {obligations.filter(o => o.statut === 'A_FAIRE').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Prochains 60 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taux de conformité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                (declarations.filter(d => d.statut === 'ACCEPTEE').length /
                 Math.max(declarations.length, 1)) * 100
              )}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Déclarations acceptées</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des déclarations */}
      <Card>
        <CardHeader>
          <CardTitle>Déclarations récentes</CardTitle>
          <CardDescription>
            Gérez et suivez vos déclarations fiscales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date dépôt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((declaration) => (
                <TableRow key={declaration.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(declaration.type_declaration)}
                      <span>{declaration.type_declaration}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(declaration.periode_debut), 'dd/MM/yyyy', { locale: fr })} -
                    {format(new Date(declaration.periode_fin), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {declaration.montant_a_payer.toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(declaration.statut)}
                  </TableCell>
                  <TableCell>
                    {declaration.date_depot
                      ? format(new Date(declaration.date_depot), 'dd/MM/yyyy', { locale: fr })
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {declaration.statut === 'BROUILLON' && (
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => validateDeclaration(declaration.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {declaration.statut === 'VALIDEE' && (
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => submitDeclaration(declaration.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadDeclarationPDF(declaration.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Obligations fiscales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines échéances
          </CardTitle>
          <CardDescription>
            Obligations fiscales à venir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {obligations.map((obligation) => (
              <div key={obligation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {obligation.statut === 'EN_RETARD' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{obligation.libelle}</p>
                    <p className="text-sm text-gray-500">
                      Échéance: {format(new Date(obligation.date_echeance), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {obligation.montant_estimé && (
                    <span className="text-sm font-medium">
                      {obligation.montant_estimé.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                  {getStatusBadge(obligation.statut)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de calcul */}
      {showCalculModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Calculateur Fiscal</CardTitle>
              <CardDescription>Simulez vos impôts et taxes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type d'impôt</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IS">Impôt sur les Sociétés</SelectItem>
                      <SelectItem value="TVA">TVA</SelectItem>
                      <SelectItem value="PATENTE">Patente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {calculResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Résultat du calcul</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Base imposable:</span>
                      <p className="font-medium">{calculResult.base_imposable.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux appliqué:</span>
                      <p className="font-medium">{calculResult.taux_applique}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant de l'impôt:</span>
                      <p className="font-medium text-lg">{calculResult.montant_impot.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Solde à payer:</span>
                      <p className="font-medium text-lg text-orange-600">
                        {calculResult.solde_a_payer.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outlined" onClick={() => setShowCalculModal(false)}>
                  Fermer
                </Button>
                <Button onClick={calculateTax}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}