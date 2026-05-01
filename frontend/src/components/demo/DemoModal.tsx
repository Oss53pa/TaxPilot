/**
 * DemoModal — Modal de découverte Liass'Pilot
 * Propose 3 modes : démos interactives, tutoriels pas-à-pas, démo live.
 */
import React, { useState } from 'react'
import {
  X, Monitor, Lightbulb, Users, Clock, Mail, ChevronRight,
  Calculator, Shield, Layers,
} from 'lucide-react'
import InteractiveBalanceImportDemo from './InteractiveBalanceImportDemo'
import InteractiveLiasseDemo from './InteractiveLiasseDemo'
import InteractiveAuditDemo from './InteractiveAuditDemo'
import { ATLAS_STUDIO } from '../../config/atlasStudio'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

type DemoView =
  | 'menu'
  | 'interactive-import'
  | 'interactive-liasse'
  | 'interactive-audit'
  | 'tutorials'
  | 'live'

interface InteractiveDemo {
  id: Exclude<DemoView, 'menu' | 'tutorials' | 'live'>
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  tags: string[]
}

const INTERACTIVE_DEMOS: InteractiveDemo[] = [
  {
    id: 'interactive-import',
    icon: Calculator,
    title: 'Import de balance SYSCOHADA',
    desc: 'Chargez un CSV de balance : détection du format, mapping sur 1 005 comptes SYSCOHADA révisés, contrôle débit = crédit en temps réel.',
    tags: ['SYSCOHADA', 'CSV/XLSX', 'Auto-mapping'],
  },
  {
    id: 'interactive-liasse',
    icon: Layers,
    title: 'Bilan SYSCOHADA (3 colonnes)',
    desc: 'Explorez le bilan généré automatiquement avec Brut / Amortissements / Net. Drill-down par poste, équilibre actif/passif.',
    tags: ['80+ pages', 'Brut/Amort/Net', 'Drill-down'],
  },
  {
    id: 'interactive-audit',
    icon: Shield,
    title: 'Audit automatisé (169 contrôles)',
    desc: 'Regardez le moteur exécuter les contrôles N1/N2/N3 sur votre liasse : équilibres, cohérences croisées, ratios UEMOA.',
    tags: ['169 contrôles', 'N1/N2/N3', 'IA PROPH3T'],
  },
]

interface Tutorial {
  title: string
  desc: string
  duration: string
  difficulty: 'Facile' | 'Moyen' | 'Avancé'
  steps: string[]
}

const TUTORIALS: Tutorial[] = [
  {
    title: 'Importer votre balance SYSCOHADA',
    desc: 'De l\'upload CSV au mapping automatique sur les 1 005 comptes.',
    duration: '3 min',
    difficulty: 'Facile',
    steps: [
      'Uploader le fichier CSV / XLSX',
      'Vérifier la détection du séparateur',
      'Valider le mapping SYSCOHADA',
      'Confirmer l\'équilibre débit = crédit',
      'Lancer l\'import',
    ],
  },
  {
    title: 'Générer la liasse fiscale complète',
    desc: '80+ pages produites automatiquement depuis la balance.',
    duration: '4 min',
    difficulty: 'Moyen',
    steps: [
      'Sélectionner l\'exercice fiscal',
      'Choisir le régime (Réel / Simplifié)',
      'Lancer la génération',
      'Vérifier les 22 annexes',
      'Exporter en Excel DGI',
    ],
  },
  {
    title: 'Exécuter l\'audit en 1 clic',
    desc: '169 contrôles automatisés N1/N2/N3 en quelques secondes.',
    duration: '2 min',
    difficulty: 'Facile',
    steps: [
      'Ouvrir le module Audit',
      'Lancer les contrôles',
      'Examiner les alertes N2',
      'Corriger les anomalies',
      'Re-valider la liasse',
    ],
  },
  {
    title: 'Calcul du passage fiscal IS / IMF',
    desc: 'Déterminez le résultat fiscal et l\'impôt dû multi-pays OHADA.',
    duration: '5 min',
    difficulty: 'Moyen',
    steps: [
      'Sélectionner le pays OHADA',
      'Importer le résultat comptable',
      'Saisir les réintégrations/déductions',
      'Calculer IS et IMF',
      'Générer la déclaration',
    ],
  },
]

const DEMOS_BY_VIEW: Record<string, InteractiveDemo | undefined> = INTERACTIVE_DEMOS.reduce(
  (acc, d) => {
    acc[d.id] = d
    return acc
  },
  {} as Record<string, InteractiveDemo | undefined>,
)

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'interactive' | 'tutorials' | 'live'>('interactive')
  const [view, setView] = useState<DemoView>('menu')
  const [tutoIndex, setTutoIndex] = useState(0)
  const [tutoStep, setTutoStep] = useState(0)

  if (!isOpen) return null

  const goBack = () => {
    setView('menu')
    setTutoStep(0)
  }

  const currentTuto = TUTORIALS[tutoIndex]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {view !== 'menu' && (
              <button
                onClick={goBack}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#141414]"
              >
                ←
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-[#141414]">
                {view === 'menu'
                  ? `Découvrir ${ATLAS_STUDIO.brand}`
                  : view.startsWith('interactive')
                  ? 'Démo interactive'
                  : view === 'tutorials'
                  ? 'Tutoriel pas-à-pas'
                  : 'Retour'}
              </h3>
              <p className="text-xs text-gray-500">
                {view === 'menu'
                  ? 'Choisissez votre mode de découverte'
                  : 'Mode interactif — testez en conditions réelles'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {view === 'menu' && (
          <>
            {/* Mode tabs */}
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'interactive' as const,
                  icon: Monitor,
                  title: 'Démos interactives',
                  desc: 'Testez en conditions réelles',
                  time: 'Illimité',
                  badge: 'Populaire',
                },
                {
                  id: 'tutorials' as const,
                  icon: Lightbulb,
                  title: 'Tutoriels',
                  desc: 'Pas à pas par fonctionnalité',
                  time: '3-5 min',
                  badge: null as string | null,
                },
                {
                  id: 'live' as const,
                  icon: Users,
                  title: 'Démo live',
                  desc: 'Un expert en direct',
                  time: '30 min',
                  badge: null as string | null,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTab(opt.id)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    tab === opt.id
                      ? 'border-[#141414] bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.badge && (
                    <span className="absolute -top-2 right-2 px-2 py-0.5 bg-[#141414] text-white text-[10px] font-bold rounded-full">
                      {opt.badge}
                    </span>
                  )}
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <opt.icon className="w-4 h-4 text-[#141414]" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#141414]">{opt.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" /> {opt.time}
                  </div>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              {tab === 'interactive' && (
                <div className="grid gap-3">
                  {INTERACTIVE_DEMOS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => setView(demo.id)}
                      className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#141414] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#141414] group-hover:text-white transition-colors">
                        <demo.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-[#141414]">{demo.title}</h5>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{demo.desc}</p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {demo.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#141414] shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}

              {tab === 'tutorials' && (
                <div className="space-y-2">
                  {TUTORIALS.map((tuto, i) => (
                    <button
                      key={tuto.title}
                      onClick={() => {
                        setTutoIndex(i)
                        setTutoStep(0)
                        setView('tutorials')
                      }}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-[#141414] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#141414] group-hover:text-white transition-colors">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#141414]">{tuto.title}</p>
                          <p className="text-xs text-gray-500">{tuto.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            tuto.difficulty === 'Facile'
                              ? 'bg-green-100 text-green-700'
                              : tuto.difficulty === 'Moyen'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tuto.difficulty}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {tuto.duration}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#141414]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'live' && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="text-center mb-6">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-[#141414] mb-2">Réservez une démo personnalisée</h4>
                    <p className="text-sm text-gray-500">
                      Un expert {ATLAS_STUDIO.company} vous accompagne en direct pendant 30 minutes sur votre
                      propre liasse fiscale.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Découverte', desc: 'Tour complet', icon: '🎯' },
                      { label: 'Migration', desc: 'Depuis Sage / Ciel', icon: '🔄' },
                      { label: 'Sur mesure', desc: 'Vos besoins', icon: '⚙️' },
                    ].map((opt) => (
                      <div key={opt.label} className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <p className="text-sm font-medium text-[#141414]">{opt.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <a
                      href={`mailto:${ATLAS_STUDIO.supportEmail}?subject=Demande de démo live Liass'Pilot`}
                      className="px-8 py-3 bg-[#141414] text-white rounded-lg text-sm font-semibold hover:bg-[#2a2a2a] inline-flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" /> Planifier un rendez-vous
                    </a>
                    <p className="text-xs text-gray-400 mt-2">{ATLAS_STUDIO.supportEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Interactive demos */}
        {view === 'interactive-import' && (
          <div className="p-5">
            <InteractiveBalanceImportDemo onClose={goBack} />
          </div>
        )}
        {view === 'interactive-liasse' && (
          <div className="p-5">
            <InteractiveLiasseDemo onClose={goBack} />
          </div>
        )}
        {view === 'interactive-audit' && (
          <div className="p-5">
            <InteractiveAuditDemo onClose={goBack} />
          </div>
        )}

        {/* Tutorial detail */}
        {view === 'tutorials' && currentTuto && (
          <div className="p-5 space-y-4">
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-[#141414]">{currentTuto.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentTuto.difficulty === 'Facile'
                      ? 'bg-green-100 text-green-700'
                      : currentTuto.difficulty === 'Moyen'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {currentTuto.difficulty} • {currentTuto.duration}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-5">{currentTuto.desc}</p>

              {/* Steps */}
              <div className="space-y-3">
                {currentTuto.steps.map((stepLabel, si) => (
                  <div
                    key={stepLabel}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      si === tutoStep
                        ? 'border-[#141414] bg-white shadow-sm'
                        : si < tutoStep
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        si < tutoStep
                          ? 'bg-green-500 text-white'
                          : si === tutoStep
                          ? 'bg-[#141414] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {si < tutoStep ? '✓' : si + 1}
                    </div>
                    <span
                      className={`text-sm ${
                        si === tutoStep
                          ? 'font-medium text-[#141414]'
                          : si < tutoStep
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {stepLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setTutoStep((s) => Math.max(0, s - 1))}
                  disabled={tutoStep === 0}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    tutoStep === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ← Précédent
                </button>
                {tutoStep < currentTuto.steps.length - 1 ? (
                  <button
                    onClick={() => setTutoStep((s) => s + 1)}
                    className="px-4 py-2 bg-[#141414] text-white text-sm rounded-lg font-semibold hover:bg-[#2a2a2a]"
                  >
                    Étape suivante →
                  </button>
                ) : (
                  <button
                    onClick={goBack}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700"
                  >
                    ✓ Tutoriel terminé
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoModal

// Keep the map referenced so linter does not flag it; may be used by caller code.
export const DEMOS_INDEX = DEMOS_BY_VIEW
