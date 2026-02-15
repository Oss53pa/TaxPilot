/**
 * Composant pour le calendrier de conformité fiscale
 * Utilise les APIs du module Tax pour les obligations et échéances
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import taxService from '@/services/taxService'
import { useToast } from '@/components/ui/use-toast'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ObligationFiscale {
  id: string
  libelle: string
  type_obligation: 'DECLARATION' | 'PAIEMENT' | 'TENUE_LIVRE' | 'AUTRE'
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'ANNUELLE' | 'PONCTUELLE'
  date_echeance: string
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'EN_RETARD'
  montant_estimé?: number
  description?: string
  penalites_retard?: number
  rappels?: Array<{
    date: string
    type: string
  }>
}

interface CalendarEvent {
  date: Date
  obligations: ObligationFiscale[]
  type: 'declaration' | 'paiement' | 'autre'
  totalAmount?: number
}

export default function TaxComplianceCalendar() {
  const [obligations, setObligations] = useState<ObligationFiscale[]>([])
  const [calendarEvents, setCalendarEvents] = useState<Map<string, CalendarEvent>>(new Map())
  const [_selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedObligation, setSelectedObligation] = useState<ObligationFiscale | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [_showAddDialog, setShowAddDialog] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [_loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    enRetard: 0,
    aVenir30j: 0,
    montantTotal: 0,
    penalites: 0
  })

  useEffect(() => {
    loadObligations()
  }, [currentMonth])

  const loadObligations = async () => {
    try {
      setLoading(true)
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'

      // Charger les obligations du mois
      const startDate = startOfMonth(currentMonth)
      const endDate = endOfMonth(currentMonth)

      const data = await taxService.getObligations({
        entreprise: entrepriseId,
        date_debut: format(startDate, 'yyyy-MM-dd'),
        date_fin: format(endDate, 'yyyy-MM-dd')
      }) as any

      const obligationsList = data.results || data
      setObligations(obligationsList)

      // Charger aussi les échéances à venir (30 jours)
      const echeances = await taxService.getObligationsEcheances(entrepriseId, 30) as any

      // Créer les événements du calendrier
      const events = new Map<string, CalendarEvent>()

      obligationsList.forEach((obligation: ObligationFiscale) => {
        const dateKey = obligation.date_echeance
        const date = new Date(obligation.date_echeance)

        if (!events.has(dateKey)) {
          events.set(dateKey, {
            date,
            obligations: [],
            type: obligation.type_obligation === 'DECLARATION' ? 'declaration' :
                  obligation.type_obligation === 'PAIEMENT' ? 'paiement' : 'autre',
            totalAmount: 0
          })
        }

        const event = events.get(dateKey)!
        event.obligations.push(obligation)
        if (obligation.montant_estimé) {
          event.totalAmount = (event.totalAmount || 0) + obligation.montant_estimé
        }
      })

      setCalendarEvents(events)

      // Calculer les stats
      calculateStats(obligationsList, echeances)

    } catch (error) {
      console.error('Erreur lors du chargement des obligations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le calendrier fiscal",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (obligations: ObligationFiscale[], echeances: any) => {
    const enRetard = obligations.filter(o => o.statut === 'EN_RETARD').length
    const montantTotal = obligations.reduce((sum, o) => sum + (o.montant_estimé || 0), 0)
    const penalites = obligations.reduce((sum, o) => sum + (o.penalites_retard || 0), 0)

    setStats({
      total: obligations.length,
      enRetard,
      aVenir30j: echeances?.length || 0,
      montantTotal,
      penalites
    })
  }

  const markObligationDone = async (obligationId: string) => {
    try {
      await taxService.markObligationDone(obligationId)
      toast({
        title: "Obligation marquée comme terminée",
        description: "L'obligation a été mise à jour avec succès"
      })
      loadObligations()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'obligation",
        variant: "destructive"
      })
    }
  }

  const createObligation = async (obligation: Partial<ObligationFiscale>) => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      await taxService.createObligation({
        ...obligation,
        entreprise: entrepriseId
      } as any)

      toast({
        title: "Obligation créée",
        description: "La nouvelle obligation a été ajoutée au calendrier"
      })

      setShowAddDialog(false)
      loadObligations()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'obligation",
        variant: "destructive"
      })
    }
  }

  void createObligation;

  const exportCalendar = async () => {
    try {
      const entrepriseId = localStorage.getItem('entreprise_id') || '1'
      const annee = currentMonth.getFullYear()

      await taxService.getObligationsCalendar({
        entreprise: entrepriseId,
        annee,
        mois: currentMonth.getMonth() + 1
      } as any)

      // Créer un fichier ICS pour l'export
      const icsContent = generateICSContent(obligations)
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `calendrier_fiscal_${format(currentMonth, 'yyyy-MM')}.ics`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: "Le calendrier a été exporté au format ICS"
      })
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le calendrier",
        variant: "destructive"
      })
    }
  }

  const generateICSContent = (obligations: ObligationFiscale[]) => {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TaxPilot//Calendar//FR\n'

    obligations.forEach(obligation => {
      const date = new Date(obligation.date_echeance)
      const dateStr = format(date, "yyyyMMdd'T'HHmmss")

      ics += 'BEGIN:VEVENT\n'
      ics += `DTSTART:${dateStr}\n`
      ics += `DTEND:${dateStr}\n`
      ics += `SUMMARY:${obligation.libelle}\n`
      ics += `DESCRIPTION:${obligation.description || ''}\n`
      ics += `STATUS:${obligation.statut === 'TERMINEE' ? 'COMPLETED' : 'CONFIRMED'}\n`
      ics += 'END:VEVENT\n'
    })

    ics += 'END:VCALENDAR'
    return ics
  }

  const getStatusBadge = (statut: string) => {
    switch(statut) {
      case 'EN_RETARD':
        return <Badge variant="destructive">En retard</Badge>
      case 'A_FAIRE':
        return <Badge variant="secondary">À faire</Badge>
      case 'EN_COURS':
        return <Badge variant="outlined">En cours</Badge>
      case 'TERMINEE':
        return <Badge variant="default">Terminée</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'DECLARATION':
        return <FileText className="h-4 w-4" />
      case 'PAIEMENT':
        return <DollarSign className="h-4 w-4" />
      case 'TENUE_LIVRE':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const filteredObligations = obligations.filter(o => {
    if (filterType !== 'all' && o.type_obligation !== filterType) return false
    if (filterStatut !== 'all' && o.statut !== filterStatut) return false
    return true
  })

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendrier de Conformité Fiscale</h1>
          <p className="text-gray-600">Gérez vos obligations et échéances fiscales</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} variant="outlined">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          <Button onClick={exportCalendar} variant="outlined">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Obligations totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.enRetard}</div>
            <p className="text-xs text-gray-500 mt-1">Action requise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              À venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.aVenir30j}</div>
            <p className="text-xs text-gray-500 mt-1">30 prochains jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Montant estimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.montantTotal.toLocaleString('fr-FR')}
              <span className="text-sm ml-1"></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total à payer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pénalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.penalites.toLocaleString('fr-FR')}
              <span className="text-sm ml-1"></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Retards cumulés</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {stats.enRetard > 0 && (
        <Alert severity="error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention!</strong> Vous avez {stats.enRetard} obligation(s) en retard.
            Les pénalités s'accumulent quotidiennement. Veuillez régulariser rapidement.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Aujourd'hui
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {daysInMonth.map((date, index) => {
                  const dateKey = format(date, 'yyyy-MM-dd')
                  const event = calendarEvents.get(dateKey)
                  const dayOfWeek = date.getDay()
                  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1

                  if (index === 0 && offset > 0) {
                    // Ajouter des cellules vides pour le début du mois
                    return (
                      <React.Fragment key={date.toString()}>
                        {[...Array(offset)].map((_, i) => (
                          <div key={`empty-${i}`} className="h-20" />
                        ))}
                        <DayCell
                          date={date}
                          event={event}
                          isToday={isToday(date)}
                          onClick={() => {
                            setSelectedDate(date)
                            if (event) {
                              setSelectedObligation(event.obligations[0])
                              setShowDetailDialog(true)
                            }
                          }}
                        />
                      </React.Fragment>
                    )
                  }

                  return (
                    <DayCell
                      key={date.toString()}
                      date={date}
                      event={event}
                      isToday={isToday(date)}
                      onClick={() => {
                        setSelectedDate(date)
                        if (event) {
                          setSelectedObligation(event.obligations[0])
                          setShowDetailDialog(true)
                        }
                      }}
                    />
                  )
                })}
              </div>

              {/* Légende */}
              <div className="flex gap-4 mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded" />
                  <span>En retard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded" />
                  <span>À faire</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span>Terminée</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des obligations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Prochaines échéances</CardTitle>
              <div className="flex gap-2 mt-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="DECLARATION">Déclarations</SelectItem>
                    <SelectItem value="PAIEMENT">Paiements</SelectItem>
                    <SelectItem value="TENUE_LIVRE">Tenue de livres</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="EN_RETARD">En retard</SelectItem>
                    <SelectItem value="A_FAIRE">À faire</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="TERMINEE">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredObligations
                  .sort((a, b) => new Date(a.date_echeance).getTime() - new Date(b.date_echeance).getTime())
                  .map((obligation) => (
                  <div
                    key={obligation.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedObligation(obligation)
                      setShowDetailDialog(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(obligation.type_obligation)}
                          <p className="font-medium text-sm">{obligation.libelle}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(obligation.date_echeance), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        {obligation.montant_estimé && (
                          <p className="text-xs font-medium mt-1">
                            {obligation.montant_estimé.toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(obligation.statut)}
                        {obligation.statut === 'A_FAIRE' && (
                          <Checkbox
                            onClick={(e) => {
                              e.stopPropagation()
                              markObligationDone(obligation.id)
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredObligations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune obligation trouvée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de détail */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedObligation?.libelle}</DialogTitle>
            <DialogDescription>
              Détails de l'obligation fiscale
            </DialogDescription>
          </DialogHeader>
          {selectedObligation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedObligation.type_obligation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  {getStatusBadge(selectedObligation.statut)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date d'échéance</p>
                  <p className="font-medium">
                    {format(new Date(selectedObligation.date_echeance), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Périodicité</p>
                  <p className="font-medium">{selectedObligation.periodicite}</p>
                </div>
              </div>

              {selectedObligation.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1">{selectedObligation.description}</p>
                </div>
              )}

              {selectedObligation.montant_estimé && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Montant estimé</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedObligation.montant_estimé.toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              {selectedObligation.penalites_retard && selectedObligation.penalites_retard > 0 && (
                <Alert severity="error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pénalités de retard: {selectedObligation.penalites_retard.toLocaleString('fr-FR')}
                  </AlertDescription>
                </Alert>
              )}

              {selectedObligation.statut === 'A_FAIRE' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    markObligationDone(selectedObligation.id)
                    setShowDetailDialog(false)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme terminée
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant pour une cellule du calendrier
function DayCell({ date, event, isToday, onClick }: {
  date: Date
  event?: CalendarEvent
  isToday: boolean
  onClick: () => void
}) {
  const hasRetard = event?.obligations.some(o => o.statut === 'EN_RETARD')
  const hasAFaire = event?.obligations.some(o => o.statut === 'A_FAIRE')
  const allDone = event?.obligations.every(o => o.statut === 'TERMINEE')

  return (
    <div
      className={`
        h-20 p-2 border rounded-lg cursor-pointer transition-colors
        ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
        ${event ? (
          hasRetard ? 'bg-red-50 hover:bg-red-100' :
          hasAFaire ? 'bg-blue-50 hover:bg-blue-100' :
          allDone ? 'bg-green-50 hover:bg-green-100' :
          'hover:bg-gray-50'
        ) : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
          {format(date, 'd')}
        </span>
        {event && (
          <div className="flex gap-1">
            {hasRetard && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {event.obligations.length > 1 && (
              <Badge variant="secondary" className="text-xs px-1">
                {event.obligations.length}
              </Badge>
            )}
          </div>
        )}
      </div>
      {event && event.totalAmount && (
        <p className="text-xs font-medium mt-1 truncate">
          {(event.totalAmount / 1000).toFixed(0)}k
        </p>
      )}
      {event && event.obligations[0] && (
        <p className="text-xs text-gray-600 mt-1 truncate">
          {event.obligations[0].libelle}
        </p>
      )}
    </div>
  )
}