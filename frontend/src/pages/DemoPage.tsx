/**
 * DemoPage — Page publique de démo interactive & visite guidée virtuelle Liass'Pilot
 * Thème dark cohérent avec la landing Atlas Studio.
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Play, Monitor, Users, Clock, Mail,
  Calculator, Shield, BarChart3, MapPin, Zap, CheckCircle, Eye,
  MousePointerClick, Brain, FileText, Sparkles, ArrowUpRight,
  Layers, Maximize2,
} from 'lucide-react'
import { ATLAS_STUDIO } from '../config/atlasStudio'
import InteractiveBalanceImportDemo from '../components/demo/InteractiveBalanceImportDemo'
import InteractiveLiasseDemo from '../components/demo/InteractiveLiasseDemo'
import InteractiveAuditDemo from '../components/demo/InteractiveAuditDemo'

/* ── Virtual tour sections — Liass'Pilot 8 modules ── */
interface TourSection {
  id: string
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  route: string
  features: string[]
  color: string
  demoId?: 'import' | 'liasse' | 'audit'
}

const TOUR_SECTIONS: TourSection[] = [
  {
    id: 'import-balance',
    title: 'Import Balance',
    desc: 'Importez votre balance SYSCOHADA en quelques clics. Détection automatique du format (CSV, XLSX, TXT), mapping intelligent sur 1 005 comptes, contrôle débit = crédit temps réel.',
    icon: Calculator,
    route: '/import-balance',
    features: ['CSV / XLSX / TXT', 'Auto-détection séparateur', 'Mapping SYSCOHADA', 'Contrôle D = C'],
    color: 'from-blue-500/20 to-blue-600/10',
    demoId: 'import',
  },
  {
    id: 'plan-syscohada',
    title: 'Plan Comptable OHADA',
    desc: '1 005 comptes SYSCOHADA révisés vérifiés, mappings automatiques entre votre plan interne et le plan officiel. Gestion des opérations spécifiques.',
    icon: FileText,
    route: '/plan-syscohada',
    features: ['1 005 comptes', 'Plan révisé 2017', 'Mappings automatiques', 'Opérations spécifiques'],
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    id: 'audit',
    title: 'Audit de Balance',
    desc: '169 contrôles automatisés en un clic. Niveaux N1 (bloquants), N2 (majeurs), N3 (vigilance). Cohérences croisées, équilibres, ratios UEMOA.',
    icon: Shield,
    route: '/audit',
    features: ['169 contrôles', 'Niveaux N1/N2/N3', 'Cohérences croisées', 'Ratios UEMOA'],
    color: 'from-red-500/20 to-red-600/10',
    demoId: 'audit',
  },
  {
    id: 'liasse-fiscale',
    title: 'Liasse Fiscale',
    desc: '80+ pages SYSCOHADA générées automatiquement depuis votre balance : Bilan (Brut/Amort/Net), Compte de résultat, TAFIRE, 22 annexes obligatoires.',
    icon: Layers,
    route: '/liasse-fiscale',
    features: ['80+ pages', 'Bilan 3 colonnes', '22 annexes', 'Multi-exercices'],
    color: 'from-[#0f766e]/20 to-[#115e59]/10',
    demoId: 'liasse',
  },
  {
    id: 'passage-fiscal',
    title: 'Passage Fiscal',
    desc: 'Calcul automatique IS / IMF multi-pays OHADA. Réintégrations, déductions, résultat fiscal, impôt dû. Paramétrages CI, SN, CM, BF...',
    icon: Calculator,
    route: '/compliance',
    features: ['IS / IMF auto', 'Multi-pays OHADA', 'Réintégrations', 'Déclaration DGI'],
    color: 'from-violet-500/20 to-violet-600/10',
  },
  {
    id: 'teledeclaration',
    title: 'Export Liasse',
    desc: 'Export Excel DGI officiel, PDF A4 prêt à imprimer, impression trimodale (fiduciaire, banque, archivage). Télédéclaration directe.',
    icon: Monitor,
    route: '/teledeclaration',
    features: ['Excel DGI', 'PDF A4 officiel', 'Impression trimodale', 'Télédéclaration'],
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    id: 'reporting',
    title: 'Analyse Financière',
    desc: 'Ratios automatiques, Soldes Intermédiaires de Gestion, Tableau des Flux de Trésorerie (TFT). Benchmarks sectoriels et alertes.',
    icon: BarChart3,
    route: '/reporting',
    features: ['Ratios auto', 'SIG 9 niveaux', 'TFT automatique', 'Benchmarks'],
    color: 'from-cyan-500/20 to-cyan-600/10',
  },
  {
    id: 'prophet-ia',
    title: 'PROPH3T IA',
    desc: 'Assistant IA spécialisé SYSCOHADA : détection d\'anomalies, suggestions de corrections, audit Benford, analyse prédictive des ratios.',
    icon: Brain,
    route: '/dashboard',
    features: ['IA SYSCOHADA', 'Détection anomalies', 'Audit Benford', 'Prédictif'],
    color: 'from-pink-500/20 to-pink-600/10',
  },
]

interface InteractiveDemoMeta {
  id: 'import' | 'liasse' | 'audit'
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  desc: string
  tags: string[]
  duration: string
}

const INTERACTIVE_DEMOS: InteractiveDemoMeta[] = [
  {
    id: 'import',
    icon: Calculator,
    title: 'Import d\'une balance SYSCOHADA',
    desc: 'Chargez un CSV de balance : détection du format, mapping sur 1 005 comptes, contrôle d\'équilibre temps réel.',
    tags: ['SYSCOHADA', 'CSV/XLSX', 'Auto-mapping'],
    duration: '3 min',
  },
  {
    id: 'liasse',
    icon: Layers,
    title: 'Bilan SYSCOHADA (Brut / Amort / Net)',
    desc: 'Explorez le bilan généré automatiquement avec 3 colonnes. Drill-down par poste, équilibre actif/passif.',
    tags: ['80+ pages', 'Drill-down', 'Temps réel'],
    duration: '2 min',
  },
  {
    id: 'audit',
    icon: Shield,
    title: 'Audit automatisé (169 contrôles)',
    desc: 'Regardez le moteur exécuter les contrôles N1/N2/N3 sur votre liasse en quelques secondes.',
    tags: ['169 contrôles', 'N1/N2/N3', 'IA PROPH3T'],
    duration: '2 min',
  },
]

type ActiveView = 'home' | 'tour' | 'demo-import' | 'demo-liasse' | 'demo-audit' | 'live-preview'

const IFRAME_BASE_WIDTH = 1440

const DemoPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<ActiveView>('home')
  const [tourStep, setTourStep] = useState(0)
  const [tourAutoPlay, setTourAutoPlay] = useState(false)
  const [previewRoute, setPreviewRoute] = useState('/dashboard')
  const [iframeScale, setIframeScale] = useState(0.72)
  const iframeContainerRef = React.useRef<HTMLDivElement>(null)

  // Dynamic scale via ResizeObserver — iframe always rendered at 1440px,
  // scaled to fit container width
  useEffect(() => {
    if (activeView !== 'live-preview') return
    const el = iframeContainerRef.current
    if (!el) return

    const updateScale = () => {
      const width = el.clientWidth
      if (width > 0) {
        setIframeScale(Math.min(1, width / IFRAME_BASE_WIDTH))
      }
    }

    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeView])

  useEffect(() => {
    if (!tourAutoPlay || activeView !== 'tour') return
    const timer = setInterval(() => {
      setTourStep((prev) => {
        if (prev >= TOUR_SECTIONS.length - 1) {
          setTourAutoPlay(false)
          return prev
        }
        return prev + 1
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [tourAutoPlay, activeView])

  const currentSection = TOUR_SECTIONS[tourStep] ?? TOUR_SECTIONS[0]!

  const openLivePreview = (route: string) => {
    sessionStorage.setItem('liasspilot-demo-mode', '1')
    setPreviewRoute(route)
    setActiveView('live-preview')
  }

  // Inline style constants — Nordic Slate light theme
  // Variables noms conservés (W = primary text) pour ne pas casser les references
  const W = '#1c1917'      // Texte principal (charcoal warm) — était #ffffff
  const W50 = 'rgba(28,25,23,0.55)'   // Texte secondaire foncé
  const W40 = 'rgba(28,25,23,0.65)'   // Texte body
  const W30 = 'rgba(28,25,23,0.75)'   // Texte emphasis
  const W20 = 'rgba(0,0,0,0.20)'      // Borders strong
  const W15 = 'rgba(0,0,0,0.12)'      // Borders default
  const W10 = 'rgba(0,0,0,0.06)'      // Borders subtle
  const G = '#0f766e'      // Accent TEAL (était #c9a96e gold)
  const BK = '#ffffff'     // Background (était #0d0d0d dark)
  const CHK = '#15803d'    // Check vert deep

  const CurrentIcon = currentSection.icon

  return (
    <div className="landing-page min-h-screen bg-white" style={{ color: W }}>
      {/* ═══ NAV ═══ */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              style={{ color: W30 }}
              className="hover:opacity-80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="atlas-brand text-2xl font-bold" style={{ color: W }}>
              {ATLAS_STUDIO.company}
            </span>
            <span style={{ color: W20 }}>/</span>
            <span className="atlas-brand text-lg" style={{ color: G }}>
              {ATLAS_STUDIO.brand}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: W30 }}>
            <button onClick={() => navigate('/modules')} className="hover:opacity-70 transition-colors">
              Applications
            </button>
            <button onClick={() => navigate('/pricing')} className="hover:opacity-70 transition-colors">
              Tarifs
            </button>
            <button onClick={() => navigate('/blog')} className="hover:opacity-70 transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/about')} className="hover:opacity-70 transition-colors">
              À propos
            </button>
            <button onClick={() => navigate('/faq')} className="hover:opacity-70 transition-colors">
              FAQ
            </button>
            <button onClick={() => navigate('/contact')} className="hover:opacity-70 transition-colors">
              Contact
            </button>
          </div>
          <a
            href={ATLAS_STUDIO.login}
            className="px-5 py-2.5 bg-[#0f766e] rounded-lg text-sm font-bold hover:bg-[#115e59] transition-all flex items-center gap-2"
            style={{ color: BK }}
          >
            Souscrire maintenant <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* ═══ HOME ═══ */}
      {activeView === 'home' && (
        <>
          {/* Hero */}
          <section className="relative pt-20 pb-16 px-6 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0f766e]/[0.05] rounded-full blur-[120px]" />
            </div>
            <div className="max-w-4xl mx-auto text-center relative">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f766e]/10 border border-[#0f766e]/20 rounded-full text-xs font-semibold mb-8"
                style={{ color: G }}
              >
                <Eye className="w-3.5 h-3.5" /> Aucun compte requis — explorez librement
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5" style={{ color: W }}>
                Découvrez {ATLAS_STUDIO.brand}
                <br />
                <span
                  className="bg-gradient-to-r from-[#0f766e] via-[#115e59] to-[#0f766e] bg-clip-text text-transparent"
                  style={{ color: 'transparent' }}
                >
                  en action.
                </span>
              </h1>
              <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: W40 }}>
                Visite guidée, démos interactives, aperçu des vraies interfaces. Importez une balance, générez
                une liasse, lancez l&apos;audit — sans inscription.
              </p>

              {/* 3 main cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    setActiveView('tour')
                    setTourStep(0)
                  }}
                  className="group relative p-7 bg-gradient-to-br from-[#0f766e]/[0.08] to-transparent border border-[#0f766e]/20 rounded-2xl text-left hover:border-[#0f766e]/40 transition-all hover:-translate-y-1"
                >
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 bg-[#115e59] text-[10px] font-bold rounded-full"
                    style={{ color: BK }}
                  >
                    Recommandé
                  </div>
                  <div className="w-14 h-14 bg-[#0f766e]/10 rounded-xl flex items-center justify-center mb-5">
                    <MapPin className="w-7 h-7" style={{ color: G }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: W }}>
                    Visite guidée
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: W30 }}>
                    Parcourez les 8 modules de Liass&apos;Pilot avec explications détaillées.
                  </p>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: W20 }}>
                    <Clock className="w-3 h-3" /> 5 min · 8 modules
                  </span>
                </button>

                <button
                  onClick={() => setActiveView('demo-import')}
                  className="group p-7 bg-black/[0.025] border border-black/[0.06] rounded-2xl text-left hover:bg-black/[0.04] hover:border-black/[0.12] transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-black/[0.04] rounded-xl flex items-center justify-center mb-5 group-hover:bg-black/[0.06] transition-colors">
                    <MousePointerClick className="w-7 h-7" style={{ color: G }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: W }}>
                    Démos interactives
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: W30 }}>
                    Testez l&apos;import, le bilan et l&apos;audit en conditions réelles.
                  </p>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: W20 }}>
                    <Clock className="w-3 h-3" /> 2-3 min chacune
                  </span>
                </button>

                <a
                  href={`mailto:${ATLAS_STUDIO.supportEmail}?subject=Demande de démo live Liass'Pilot`}
                  className="group p-7 bg-black/[0.025] border border-black/[0.06] rounded-2xl text-left hover:bg-black/[0.04] hover:border-black/[0.12] transition-all hover:-translate-y-1"
                  style={{ color: W }}
                >
                  <div className="w-14 h-14 bg-black/[0.04] rounded-xl flex items-center justify-center mb-5 group-hover:bg-black/[0.06] transition-colors">
                    <Users className="w-7 h-7" style={{ color: G }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: W }}>
                    Démo live
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: W30 }}>
                    Un expert vous accompagne en direct pendant 30 min. Sur rendez-vous.
                  </p>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: W20 }}>
                    <Mail className="w-3 h-3" /> {ATLAS_STUDIO.supportEmail}
                  </span>
                </a>
              </div>
            </div>
          </section>

          {/* Interactive demos */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#0f766e]/10 rounded-xl flex items-center justify-center">
                  <MousePointerClick className="w-5 h-5" style={{ color: G }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: W }}>
                    Démos interactives
                  </h2>
                  <p className="text-xs" style={{ color: W30 }}>
                    Manipulez les interfaces — tout fonctionne
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                {INTERACTIVE_DEMOS.map((demo) => {
                  const DemoIcon = demo.icon
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setActiveView(`demo-${demo.id}` as ActiveView)}
                      className="group flex items-start gap-5 p-5 bg-black/[0.025] border border-black/[0.06] rounded-2xl hover:bg-black/[0.04] hover:border-black/[0.12] transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-black/[0.03] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#0f766e]/10 transition-colors">
                        <DemoIcon className="w-7 h-7" style={{ color: W40 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold mb-1" style={{ color: W }}>
                          {demo.title}
                        </h3>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: W30 }}>
                          {demo.desc}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {demo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-black/[0.03] text-[10px] font-medium rounded-full"
                                style={{ color: W30 }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: W20 }}>
                            <Clock className="w-3 h-3" /> {demo.duration}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 shrink-0 mt-2" style={{ color: W10 }} />
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Tour preview grid */}
          <section className="py-20 px-6 border-t border-black/[0.06]">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#0f766e]/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" style={{ color: G }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: W }}>
                    Visite guidée — 8 modules
                  </h2>
                  <p className="text-xs" style={{ color: W30 }}>
                    Cliquez sur un module pour démarrer la visite
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TOUR_SECTIONS.map((section, i) => {
                  const SectionIcon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveView('tour')
                        setTourStep(i)
                      }}
                      className="group p-5 bg-black/[0.025] border border-black/[0.06] rounded-xl text-left hover:bg-black/[0.04] hover:border-black/[0.12] transition-all"
                    >
                      <div className="w-10 h-10 bg-black/[0.03] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#0f766e]/10 transition-colors">
                        <SectionIcon className="w-5 h-5" style={{ color: W30 }} />
                      </div>
                      <h4 className="text-xs font-bold mb-1" style={{ color: W }}>
                        {section.title}
                      </h4>
                      <p
                        className="text-[10px] leading-relaxed line-clamp-2"
                        style={{ color: W20 }}
                      >
                        {section.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
              <div className="text-center mt-10">
                <button
                  onClick={() => {
                    setActiveView('tour')
                    setTourStep(0)
                    setTourAutoPlay(true)
                  }}
                  className="group px-8 py-4 bg-[#0f766e] rounded-xl text-sm font-bold hover:bg-[#115e59] transition-all shadow-lg shadow-[#0f766e]/20 inline-flex items-center gap-2"
                  style={{ color: BK }}
                >
                  <Play className="w-4 h-4" /> Lancer la visite complète
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0f766e]/[0.06] rounded-full blur-[80px]" />
            </div>
            <div className="max-w-3xl mx-auto text-center relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: W }}>
                Convaincu ?
              </h2>
              <p className="mb-8" style={{ color: W40 }}>
                Souscrivez maintenant. Essai gratuit, Mobile Money ou virement.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href={ATLAS_STUDIO.login}
                  className="group px-8 py-4 bg-[#0f766e] rounded-xl text-sm font-bold hover:bg-[#115e59] transition-all shadow-lg shadow-[#0f766e]/20 inline-flex items-center gap-2"
                  style={{ color: BK }}
                >
                  <Zap className="w-4 h-4" /> Créer mon compte
                </a>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 bg-black/[0.03] border border-black/[0.1] rounded-xl text-sm font-semibold hover:bg-black/[0.06] transition-all"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  Voir les tarifs
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ VIRTUAL TOUR ═══ */}
      {activeView === 'tour' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => {
              setActiveView('home')
              setTourAutoPlay(false)
            }}
            className="flex items-center gap-2 text-sm hover:opacity-70 mb-6 transition-colors"
            style={{ color: W30 }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            {/* Sidebar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Modules
                </h3>
                <button
                  onClick={() => setTourAutoPlay(!tourAutoPlay)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    tourAutoPlay
                      ? 'bg-[#0f766e]/20 border border-[#0f766e]/30'
                      : 'bg-black/[0.03] border border-black/[0.06] hover:opacity-70'
                  }`}
                  style={{ color: tourAutoPlay ? G : W30 }}
                >
                  <Play className="w-3 h-3" /> {tourAutoPlay ? 'En cours' : 'Auto'}
                </button>
              </div>
              <div className="space-y-1">
                {TOUR_SECTIONS.map((section, i) => {
                  const SectionIcon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setTourStep(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        i === tourStep
                          ? 'bg-gradient-to-r from-[#0f766e]/15 to-transparent border border-[#0f766e]/20'
                          : i < tourStep
                          ? 'bg-black/[0.02] border border-black/[0.06]'
                          : 'border border-transparent hover:bg-black/[0.025]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          i === tourStep
                            ? 'bg-[#0f766e]/20'
                            : i < tourStep
                            ? 'bg-emerald-500/10'
                            : 'bg-black/[0.03]'
                        }`}
                      >
                        {i < tourStep ? (
                          <CheckCircle className="w-4 h-4" style={{ color: CHK }} />
                        ) : (
                          <SectionIcon
                            className="w-4 h-4"
                            style={{ color: i === tourStep ? G : W20 }}
                          />
                        )}
                      </div>
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: i === tourStep ? W : i < tourStep ? W40 : W30 }}
                      >
                        {section.title}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Progress */}
              <div className="mt-6 pt-4 border-t border-black/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span style={{ color: W20 }}>Progression</span>
                  <span style={{ color: G }}>
                    {Math.round(((tourStep + 1) / TOUR_SECTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0f766e] rounded-full transition-all duration-500"
                    style={{ width: `${((tourStep + 1) / TOUR_SECTIONS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5">
              {/* Header card */}
              <div
                className={`relative bg-gradient-to-br ${currentSection.color} border border-black/[0.08] rounded-2xl p-8 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-black/[0.02] rounded-full -translate-y-1/2 translate-x-1/4 blur-xl" />
                <div className="relative flex items-start gap-5">
                  <div className="w-16 h-16 bg-black/[0.05] rounded-2xl flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-8 h-8" style={{ color: G }} />
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-widest font-medium"
                      style={{ color: W30 }}
                    >
                      Étape {tourStep + 1} / {TOUR_SECTIONS.length}
                    </span>
                    <h2 className="text-2xl font-bold mt-1 mb-2" style={{ color: W }}>
                      {currentSection.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: W50 }}>
                      {currentSection.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {currentSection.features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-3 p-3.5 bg-black/[0.025] border border-black/[0.06] rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: CHK }} />
                    <span className="text-sm" style={{ color: W50 }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              {/* Preview / action area */}
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-8 text-center">
                <CurrentIcon
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: 'rgba(255,255,255,0.06)' }}
                />
                <p className="text-sm font-medium mb-2" style={{ color: W40 }}>
                  Module : {currentSection.title}
                </p>
                <p className="text-xs mb-5" style={{ color: W20 }}>
                  Explorez cette interface dans l&apos;application
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => openLivePreview(currentSection.route)}
                    className="px-5 py-2.5 bg-black/[0.04] border border-black/[0.1] rounded-lg text-xs font-semibold hover:bg-black/[0.06] transition-all inline-flex items-center gap-2"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Aperçu live
                  </button>
                  {currentSection.demoId && (
                    <button
                      onClick={() => setActiveView(`demo-${currentSection.demoId}` as ActiveView)}
                      className="px-5 py-2.5 bg-[#0f766e]/10 border border-[#0f766e]/20 rounded-lg text-xs font-semibold hover:bg-[#0f766e]/20 transition-all inline-flex items-center gap-2"
                      style={{ color: G }}
                    >
                      <MousePointerClick className="w-3.5 h-3.5" /> Démo interactive
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setTourStep(Math.max(0, tourStep - 1))}
                  disabled={tourStep === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-black/[0.03]"
                  style={{ color: tourStep === 0 ? W10 : W40 }}
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>
                <div className="flex items-center gap-1.5">
                  {TOUR_SECTIONS.map((section, i) => (
                    <button
                      key={section.id}
                      onClick={() => setTourStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === tourStep
                          ? 'w-6 bg-[#115e59]'
                          : i < tourStep
                          ? 'w-1.5 bg-emerald-400/50'
                          : 'w-1.5 bg-black/[0.06]'
                      }`}
                    />
                  ))}
                </div>
                {tourStep < TOUR_SECTIONS.length - 1 ? (
                  <button
                    onClick={() => setTourStep(tourStep + 1)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-[#0f766e] rounded-lg text-sm font-bold hover:bg-[#115e59] transition-all"
                    style={{ color: BK }}
                  >
                    Suivant{' '}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <a
                    href={ATLAS_STUDIO.login}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-emerald-500 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all"
                    style={{ color: W }}
                  >
                    <Zap className="w-4 h-4" /> Souscrire
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LIVE PREVIEW (iframe) ═══ */}
      {activeView === 'live-preview' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActiveView('tour')}
              className="flex items-center gap-2 text-sm hover:opacity-70 transition-colors"
              style={{ color: W30 }}
            >
              <ArrowLeft className="w-4 h-4" /> Retour à la visite
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: W20 }}>
                Aperçu :
              </span>
              <span
                className="text-xs font-mono bg-black/[0.03] px-2 py-1 rounded"
                style={{ color: G }}
              >
                {previewRoute}
              </span>
            </div>
          </div>
          <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl overflow-hidden">
            <div className="bg-black/[0.03] border-b border-black/[0.06] px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
                <div className="w-3 h-3 rounded-full bg-green-400/40" />
              </div>
              <div
                className="flex-1 bg-black/[0.03] rounded px-3 py-1 text-xs font-mono"
                style={{ color: W30 }}
              >
                liasspilot.app{previewRoute}
              </div>
            </div>
            <div
              ref={iframeContainerRef}
              className="relative bg-white overflow-hidden"
              style={{ height: '70vh' }}
            >
              <iframe
                key={previewRoute}
                src={`${window.location.origin}${previewRoute}?demo=1`}
                title={`Aperçu ${ATLAS_STUDIO.brand}`}
                style={{
                  width: `${IFRAME_BASE_WIDTH}px`,
                  height: `calc(70vh / ${iframeScale})`,
                  border: 0,
                  transform: `scale(${iframeScale})`,
                  transformOrigin: 'top left',
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            {TOUR_SECTIONS.filter((s) => s.route !== previewRoute)
              .slice(0, 3)
              .map((s) => {
                const NavIcon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setPreviewRoute(s.route)}
                    className="flex items-center gap-2 px-3 py-2 bg-black/[0.025] border border-black/[0.06] rounded-lg text-xs hover:border-black/[0.12] transition-all"
                    style={{ color: W40 }}
                  >
                    <NavIcon className="w-3.5 h-3.5" style={{ color: G }} /> {s.title}
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* ═══ INTERACTIVE DEMOS ═══ */}
      {(activeView === 'demo-import' || activeView === 'demo-liasse' || activeView === 'demo-audit') && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 text-sm hover:opacity-70 mb-6 transition-colors"
            style={{ color: W30 }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {INTERACTIVE_DEMOS.map((d) => {
              const DIcon = d.icon
              const viewId = `demo-${d.id}` as ActiveView
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveView(viewId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeView === viewId
                      ? 'bg-[#0f766e]/15 border border-[#0f766e]/20'
                      : 'bg-black/[0.025] border border-black/[0.06] hover:opacity-70'
                  }`}
                  style={{ color: activeView === viewId ? G : W30 }}
                >
                  <DIcon className="w-3.5 h-3.5" /> {d.title.split(' ').slice(0, 2).join(' ')}
                </button>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/10 overflow-hidden">
            <div className="bg-[#f5f5f4] px-6 py-4 flex items-center justify-between border-b border-black/[0.06]" style={{ color: W }}>
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" style={{ color: G }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: W }}>
                    {activeView === 'demo-import' && 'Import d\'une balance SYSCOHADA'}
                    {activeView === 'demo-liasse' && 'Bilan SYSCOHADA interactif'}
                    {activeView === 'demo-audit' && 'Audit automatisé (169 contrôles)'}
                  </h3>
                  <p className="text-[10px]" style={{ color: W40 }}>
                    Mode démo — données simulées SARL AKWABA
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px]" style={{ color: W30 }}>
                  Interactif
                </span>
              </div>
            </div>
            <div className="p-6">
              {activeView === 'demo-import' && (
                <InteractiveBalanceImportDemo onClose={() => setActiveView('home')} />
              )}
              {activeView === 'demo-liasse' && (
                <InteractiveLiasseDemo onClose={() => setActiveView('home')} />
              )}
              {activeView === 'demo-audit' && (
                <InteractiveAuditDemo onClose={() => setActiveView('home')} />
              )}
            </div>
          </div>

          <div className="mt-8 bg-black/[0.025] border border-black/[0.06] rounded-2xl p-8 text-center">
            <Sparkles
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: 'rgba(201,169,110,0.5)' }}
            />
            <p className="text-sm mb-4" style={{ color: W50 }}>
              La version complète offre bien plus. Souscrivez maintenant.
            </p>
            <a
              href={ATLAS_STUDIO.login}
              className="px-6 py-3 bg-[#0f766e] rounded-lg text-sm font-bold hover:bg-[#115e59] transition-all inline-flex items-center gap-2 shadow-lg shadow-[#0f766e]/20"
              style={{ color: BK }}
            >
              <Zap className="w-4 h-4" /> Souscrire maintenant
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="atlas-brand text-xl font-bold"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {ATLAS_STUDIO.company}
            </span>
            <span style={{ color: W10 }} className="mx-1">
              /
            </span>
            <span className="atlas-brand text-sm" style={{ color: 'rgba(201,169,110,0.6)' }}>
              {ATLAS_STUDIO.brand}
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: W15 }}>
            <span>{ATLAS_STUDIO.supportEmail}</span>
            <span>
              &copy; {new Date().getFullYear()} {ATLAS_STUDIO.company}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DemoPage
