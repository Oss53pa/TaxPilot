/**
 * Démo interactive : Audit automatisé de la liasse fiscale (129 contrôles)
 * Simule l'exécution en temps réel des contrôles N1/N2/N3 avec résultats.
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Play,
  RotateCcw, Sparkles, Clock, FileText,
} from 'lucide-react'

type ControlStatus = 'pending' | 'running' | 'ok' | 'warning' | 'error'
type ControlLevel = 'N1' | 'N2' | 'N3'
type ControlCategory = 'Balance' | 'Bilan' | 'Résultat' | 'Annexes' | 'Fiscal' | 'Cohérence'

interface ControlPoint {
  id: string
  label: string
  level: ControlLevel
  category: ControlCategory
  expectedStatus: 'ok' | 'warning' | 'error'
  details: string
  status: ControlStatus
}

const buildControls = (): ControlPoint[] => [
  { id: 'C001', label: 'Équilibre de la balance (Total Débit = Total Crédit)', level: 'N1', category: 'Balance', expectedStatus: 'ok', details: 'Δ = 0 FCFA', status: 'pending' },
  { id: 'C002', label: 'Continuité comptable (soldes d\'ouverture N = clôture N-1)', level: 'N1', category: 'Balance', expectedStatus: 'ok', details: '1 005 comptes vérifiés', status: 'pending' },
  { id: 'C003', label: 'Mapping plan SYSCOHADA révisé complet', level: 'N1', category: 'Balance', expectedStatus: 'ok', details: '13 / 13 comptes atypiques résolus', status: 'pending' },
  { id: 'C004', label: 'Total Actif = Total Passif', level: 'N1', category: 'Bilan', expectedStatus: 'ok', details: '81 200 000 FCFA = 81 200 000 FCFA', status: 'pending' },
  { id: 'C005', label: 'Amortissements ≤ Valeurs brutes', level: 'N1', category: 'Bilan', expectedStatus: 'ok', details: '14 postes contrôlés', status: 'pending' },
  { id: 'C006', label: 'Capitaux propres ≥ Capital social / 2', level: 'N2', category: 'Bilan', expectedStatus: 'ok', details: '96 300 000 ≥ 30 000 000', status: 'pending' },
  { id: 'C007', label: 'Cohérence créances clients vs chiffre d\'affaires', level: 'N2', category: 'Bilan', expectedStatus: 'warning', details: 'DSO à 84 jours (alerte > 75j)', status: 'pending' },
  { id: 'C008', label: 'Résultat bilan = Résultat compte de résultat', level: 'N1', category: 'Résultat', expectedStatus: 'ok', details: '12 400 000 FCFA', status: 'pending' },
  { id: 'C009', label: 'Valeur ajoutée positive', level: 'N2', category: 'Résultat', expectedStatus: 'ok', details: 'VA = 58 700 000 FCFA', status: 'pending' },
  { id: 'C010', label: 'Marge brute cohérente (Vente - Achats - Var. stocks)', level: 'N2', category: 'Résultat', expectedStatus: 'ok', details: 'Marge = 42 %', status: 'pending' },
  { id: 'C011', label: 'TVA collectée concordante avec CA HT', level: 'N2', category: 'Fiscal', expectedStatus: 'ok', details: '30 240 000 = 168 000 000 × 18 %', status: 'pending' },
  { id: 'C012', label: 'Concordance IS / Résultat fiscal', level: 'N2', category: 'Fiscal', expectedStatus: 'ok', details: 'IS = 3 720 000 FCFA (30 %)', status: 'pending' },
  { id: 'C013', label: 'Charges de personnel ≤ 40 % VA (alerte UEMOA)', level: 'N3', category: 'Fiscal', expectedStatus: 'ok', details: '47,7 % (alerte douce)', status: 'pending' },
  { id: 'C014', label: 'Annexes fiscales renseignées (22 états obligatoires)', level: 'N1', category: 'Annexes', expectedStatus: 'warning', details: '20 / 22 annexes complètes', status: 'pending' },
  { id: 'C015', label: 'État 5 - Détail des immobilisations', level: 'N2', category: 'Annexes', expectedStatus: 'ok', details: '14 immobilisations détaillées', status: 'pending' },
  { id: 'C016', label: 'État 6 - Tableau des amortissements', level: 'N2', category: 'Annexes', expectedStatus: 'ok', details: 'Concordance avec Note 3A', status: 'pending' },
  { id: 'C017', label: 'Ratio d\'autonomie financière > 20 %', level: 'N3', category: 'Cohérence', expectedStatus: 'ok', details: 'Ratio = 45,2 %', status: 'pending' },
  { id: 'C018', label: 'Rotation stocks cohérente (≤ 120 jours)', level: 'N3', category: 'Cohérence', expectedStatus: 'warning', details: '128 jours (limite dépassée)', status: 'pending' },
  { id: 'C019', label: 'Audit Benford sur la loi de distribution', level: 'N3', category: 'Cohérence', expectedStatus: 'ok', details: 'Distribution conforme (p > 0,05)', status: 'pending' },
  { id: 'C020', label: 'Détection d\'anomalies IA (PROPH3T)', level: 'N3', category: 'Cohérence', expectedStatus: 'ok', details: 'Aucune anomalie détectée', status: 'pending' },
]

const LEVEL_COLORS: Record<ControlLevel, string> = {
  N1: 'bg-red-100 text-red-700',
  N2: 'bg-orange-100 text-orange-700',
  N3: 'bg-blue-100 text-blue-700',
}

const CATEGORIES: ControlCategory[] = ['Balance', 'Bilan', 'Résultat', 'Fiscal', 'Annexes', 'Cohérence']

const InteractiveAuditDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [controls, setControls] = useState<ControlPoint[]>(buildControls())
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState<ControlCategory | 'Tous'>('Tous')
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const runAudit = () => {
    setRunning(true)
    setDone(false)
    setControls(buildControls())
    let idx = 0

    timerRef.current = setInterval(() => {
      setControls((prev) => {
        if (idx >= prev.length) {
          if (timerRef.current) clearInterval(timerRef.current)
          setRunning(false)
          setDone(true)
          return prev
        }
        const copy = [...prev]
        if (idx > 0) {
          const previous = copy[idx - 1]
          if (previous) copy[idx - 1] = { ...previous, status: previous.expectedStatus }
        }
        const current = copy[idx]
        if (current) copy[idx] = { ...current, status: 'running' }
        return copy
      })
      idx += 1
      if (idx > controls.length) {
        setControls((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last && last.status === 'running') {
            copy[copy.length - 1] = { ...last, status: last.expectedStatus }
          }
          return copy
        })
        if (timerRef.current) clearInterval(timerRef.current)
        setRunning(false)
        setDone(true)
      }
    }, 280)
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setControls(buildControls())
    setRunning(false)
    setDone(false)
  }

  const stats = {
    total: controls.length,
    completed: controls.filter((c) => c.status === 'ok' || c.status === 'warning' || c.status === 'error').length,
    ok: controls.filter((c) => c.status === 'ok').length,
    warning: controls.filter((c) => c.status === 'warning').length,
    error: controls.filter((c) => c.status === 'error').length,
  }

  const filtered = filter === 'Tous' ? controls : controls.filter((c) => c.category === filter)

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Démo interactive</strong> — 129 contrôles automatisés (N1 bloquants, N2 majeurs, N3 vigilance)
          balayent votre liasse en quelques secondes. Cet extrait en présente 20.
        </div>
      </div>

      {/* Header + launch */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#c9a96e]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Audit automatisé SYSCOHADA</p>
            <h4 className="text-base font-bold">Liasse SARL AKWABA · 129 contrôles</h4>
            <p className="text-xs text-white/60 mt-0.5">Niveaux N1 / N2 / N3 · Durée moyenne : 8 s</p>
          </div>
        </div>
        {!running && !done && (
          <button
            onClick={runAudit}
            className="px-5 py-2.5 bg-[#c9a96e] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#dbc396] transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Lancer les contrôles
          </button>
        )}
        {running && (
          <div className="flex items-center gap-2 text-xs text-white/80">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Audit en cours...
          </div>
        )}
        {done && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Rejouer
          </button>
        )}
      </div>

      {/* Progress */}
      {(running || done) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#141414]">Progression</span>
            <span className="font-mono text-gray-500">
              {stats.completed} / {stats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#141414] h-2 rounded-full transition-all duration-200"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* KPI */}
      {done && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 font-medium">Contrôles exécutés</p>
            <p className="text-lg font-bold text-[#141414]">{stats.total}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-[10px] text-green-600 font-medium">Conformes</p>
            <p className="text-lg font-bold text-green-800">{stats.ok}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="text-[10px] text-orange-600 font-medium">Alertes</p>
            <p className="text-lg font-bold text-orange-800">{stats.warning}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="text-[10px] text-red-600 font-medium">Erreurs bloquantes</p>
            <p className="text-lg font-bold text-red-800">{stats.error}</p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['Tous', ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-colors ${
              filter === cat
                ? 'bg-[#141414] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-gray-50">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                {c.status === 'pending' && <div className="w-3 h-3 bg-gray-200 rounded-full" />}
                {c.status === 'running' && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#141414] rounded-full animate-spin" />
                )}
                {c.status === 'ok' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {c.status === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                {c.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
              </div>
              <span className="font-mono text-gray-400 w-10">{c.id}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${LEVEL_COLORS[c.level]}`}
              >
                {c.level}
              </span>
              <span className="flex-1 text-gray-800 truncate">{c.label}</span>
              <span className="text-[10px] text-gray-500 hidden sm:inline truncate max-w-[200px] text-right">
                {(c.status === 'ok' || c.status === 'warning' || c.status === 'error') ? c.details : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 bg-[#141414] text-white rounded-lg text-sm font-semibold hover:bg-[#2a2a2a] flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Exporter le rapport d&apos;audit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Fermer la démo
          </button>
        </div>
      )}
    </div>
  )
}

export default InteractiveAuditDemo
