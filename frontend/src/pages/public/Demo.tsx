import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import {
  ArrowForward, ArrowBack, CloudUpload, Description, Assessment,
  CheckCircle, TrendingUp, TrendingDown, Warning, BarChart,
  PlayArrow, Visibility, FolderOpen, Print, Download, Send,
  ZoomIn, ZoomOut, Search, FilterList,
} from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK, DARK_SURFACE, GOLD, GOLD_MUTED, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY, BRAND } from './theme'

// ─── Mock data ───────────────────────────────────────────────
const MOCK_BALANCE = [
  { compte: '101000', libelle: 'Capital social', sdN1: '', scN1: '50 000 000', mvtD: '', mvtC: '10 000 000', sdN: '', scN: '60 000 000' },
  { compte: '121000', libelle: 'Report à nouveau', sdN1: '', scN1: '12 500 000', mvtD: '', mvtC: '3 200 000', sdN: '', scN: '15 700 000' },
  { compte: '215000', libelle: 'Matériel de transport', sdN1: '18 000 000', scN1: '', mvtD: '5 500 000', mvtC: '', sdN: '23 500 000', scN: '' },
  { compte: '411000', libelle: 'Clients', sdN1: '32 000 000', scN1: '', mvtD: '45 000 000', mvtC: '38 000 000', sdN: '39 000 000', scN: '' },
  { compte: '521000', libelle: 'Banques locales', sdN1: '8 200 000', scN1: '', mvtD: '125 000 000', mvtC: '118 500 000', sdN: '14 700 000', scN: '' },
  { compte: '601000', libelle: 'Achats de marchandises', sdN1: '85 000 000', scN1: '', mvtD: '92 000 000', mvtC: '', sdN: '92 000 000', scN: '' },
  { compte: '701000', libelle: 'Ventes de marchandises', sdN1: '', scN1: '142 000 000', mvtD: '', mvtC: '168 000 000', sdN: '', scN: '168 000 000' },
  { compte: '661000', libelle: 'Charges de personnel', sdN1: '24 000 000', scN1: '', mvtD: '28 000 000', mvtC: '', sdN: '28 000 000', scN: '' },
]

const MOCK_CONTROLS = [
  { id: 'C001', label: 'Équilibre du bilan', niveau: 'N1', status: 'ok' },
  { id: 'C002', label: 'Total Actif = Total Passif', niveau: 'N1', status: 'ok' },
  { id: 'C003', label: 'Résultat net concordant', niveau: 'N2', status: 'ok' },
  { id: 'C004', label: 'Cohérence TAFIRE / Bilan', niveau: 'N3', status: 'warning' },
  { id: 'C005', label: 'Amortissements <= Brut', niveau: 'N2', status: 'ok' },
  { id: 'C006', label: 'Capitaux propres > 0', niveau: 'N1', status: 'ok' },
  { id: 'C007', label: 'Variation BFR cohérente', niveau: 'N4', status: 'ok' },
  { id: 'C008', label: 'TVA collectée cohérente', niveau: 'N5', status: 'warning' },
]

const LIASSE_PAGES = [
  'Bilan Actif — Brut',
  'Bilan Actif — Amort. & Net',
  'Bilan Passif',
  'Compte de Résultat — Charges',
  'Compte de Résultat — Produits',
  'TAFIRE — Partie I',
  'TAFIRE — Partie II',
  'Note 1 — Immobilisations',
  'Note 2 — Amortissements',
  'Note 5 — Provisions',
  'Note 12 — Dettes',
  'Note 27 — Effectifs',
]

// ─── Tour step definition ────────────────────────────────────
interface TourStep {
  id: string
  title: string
  subtitle: string
  desc: string
}

const tourSteps: TourStep[] = [
  { id: 'dashboard', title: 'Tableau de bord', subtitle: 'Vue d\'ensemble', desc: 'Suivez l\'avancement de votre liasse en temps réel : KPIs, workflow, échéances fiscales.' },
  { id: 'import', title: 'Import Balance', subtitle: 'Étape 1 — Importez vos données', desc: 'Glissez-déposez votre fichier Excel ou CSV. Liass\'Pilot détecte automatiquement les colonnes et mappe les 1 005 comptes SYSCOHADA.' },
  { id: 'balance', title: 'Balance Comptable', subtitle: 'Étape 2 — Vérifiez votre balance', desc: 'Visualisez votre balance générale avec comparatif N/N-1, mouvements et soldes. Filtrez par classe, recherchez par compte.' },
  { id: 'audit', title: 'Audit & Contrôles', subtitle: 'Étape 3 — 129 contrôles Proph3t', desc: '129 contrôles de cohérence automatiques. Score de conformité, anomalies classées par sévérité, rapport d\'audit complet.' },
  { id: 'liasse', title: 'Liasse Fiscale', subtitle: 'Étape 4 — Votre liasse est prête', desc: '84 onglets calculés automatiquement. Bilan, Compte de Résultat, TAFIRE, 18 Notes Annexes. Export Excel conforme DGI.' },
  { id: 'export', title: 'Export & Télédéclaration', subtitle: 'Étape 5 — Exportez et déclarez', desc: 'Export Excel 84 onglets, template DGI, PDF. Prochainement : XML télédéclaration DSF, DAS, TVA, IS.' },
]

// ─── Shared sub-components ───────────────────────────────────

const FakeWindowBar: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 2, py: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(0,0,0,0.3)' }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff5f57' }} />
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#febc2e' }} />
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#28c840' }} />
    <Box sx={{ flex: 1, textAlign: 'center', fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>{title}</Box>
  </Box>
)

const StatCard: React.FC<{ label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }> = ({ label, value, sub, color = GOLD, icon }) => (
  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: `1px solid ${BORDER}`, bgcolor: 'rgba(255,255,255,0.02)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {icon}
      <Box sx={{ fontFamily: BODY, fontSize: '0.65rem', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Box>
    </Box>
    <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.1rem', color, lineHeight: 1 }}>{value}</Box>
    {sub && <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: TEXT_SECONDARY, mt: 0.3 }}>{sub}</Box>}
  </Box>
)

// ─── Screen renderers ────────────────────────────────────────

const DashboardScreen = () => (
  <Box sx={{ p: 2.5 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
      <Box>
        <Box sx={{ fontFamily: BRAND, fontSize: '1.5rem', color: TEXT_PRIMARY }}>Liass'Pilot</Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>SARL EXAMPLE — Exercice 2025</Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(239,68,68,0.1)', fontFamily: BODY, fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>J-45</Box>
        <Box sx={{ px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(201,168,76,0.1)', fontFamily: BODY, fontSize: '0.7rem', color: GOLD }}>Système Normal</Box>
      </Box>
    </Box>
    {/* KPIs */}
    <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
      <StatCard label="Chiffre d'Affaires" value="168 M" sub="FCFA" icon={<TrendingUp sx={{ fontSize: 12, color: '#22c55e' }} />} />
      <StatCard label="Résultat Net" value="23.5 M" sub="+18% vs N-1" color="#22c55e" icon={<TrendingUp sx={{ fontSize: 12, color: '#22c55e' }} />} />
      <StatCard label="Score Conformité" value="96%" sub="129/129 contrôles" icon={<CheckCircle sx={{ fontSize: 12, color: '#22c55e' }} />} />
      <StatCard label="Avancement" value="3/5" sub="Étapes complétées" icon={<BarChart sx={{ fontSize: 12, color: GOLD }} />} />
    </Box>
    {/* Workflow */}
    <Box sx={{ mb: 2 }}>
      <Box sx={{ fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, color: TEXT_PRIMARY, mb: 1 }}>Processus de production</Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {['Configuration', 'Import', 'Contrôle', 'Génération', 'Liasse'].map((step, i) => (
          <React.Fragment key={step}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: i < 3 ? '#22c55e' : i === 3 ? GOLD : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.3 }}>
                {i < 3 ? <CheckCircle sx={{ fontSize: 14, color: '#fff' }} /> : <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i === 3 ? '#1a1200' : TEXT_SECONDARY }} />}
              </Box>
              <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: i <= 3 ? TEXT_PRIMARY : TEXT_SECONDARY }}>{step}</Box>
            </Box>
            {i < 4 && <Box sx={{ width: 20, height: 1, bgcolor: i < 3 ? '#22c55e' : BORDER }} />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
    {/* Deadlines */}
    <Box sx={{ fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, color: TEXT_PRIMARY, mb: 0.8 }}>Échéances fiscales</Box>
    {[
      { label: 'TVA mensuelle', date: '15 mai 2025', days: 'J-12', color: '#f59e0b' },
      { label: 'Liasse SYSCOHADA', date: '30 juin 2025', days: 'J-45', color: '#ef4444' },
      { label: 'IS Acompte T2', date: '15 juil. 2025', days: 'J-60', color: TEXT_SECONDARY },
    ].map((d) => (
      <Box key={d.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6, borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ fontFamily: BODY, fontSize: '0.68rem', color: TEXT_SECONDARY }}>{d.label}</Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ fontFamily: BODY, fontSize: '0.65rem', color: TEXT_SECONDARY }}>{d.date}</Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.62rem', fontWeight: 600, color: d.color }}>{d.days}</Box>
        </Box>
      </Box>
    ))}
  </Box>
)

const ImportScreen = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '0.95rem', color: TEXT_PRIMARY, mb: 0.5 }}>Import Balance</Box>
    <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY, mb: 2 }}>Étape 1 — Téléversement du fichier</Box>
    {/* Drag-drop zone */}
    <Box
      sx={{
        border: `2px dashed rgba(201,168,76,0.3)`,
        borderRadius: '12px',
        p: 3,
        textAlign: 'center',
        mb: 2,
        bgcolor: 'rgba(201,168,76,0.03)',
        transition: 'border-color 0.3s',
      }}
    >
      <CloudUpload sx={{ fontSize: 36, color: GOLD, mb: 1 }} />
      <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_PRIMARY, mb: 0.5 }}>Glissez-déposez votre fichier ici</Box>
      <Box sx={{ fontFamily: BODY, fontSize: '0.68rem', color: TEXT_SECONDARY, mb: 1.5 }}>Excel (.xlsx, .xls), CSV, FEC</Box>
      <Box sx={{ display: 'inline-block', px: 2, py: 0.6, borderRadius: '6px', bgcolor: GOLD, fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, color: '#1a1200' }}>
        Parcourir
      </Box>
    </Box>
    {/* File preview */}
    <Box sx={{ borderRadius: '8px', border: `1px solid ${BORDER}`, bgcolor: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(201,168,76,0.04)' }}>
        <Description sx={{ fontSize: 14, color: GOLD }} />
        <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_PRIMARY, fontWeight: 500 }}>balance_2025.xlsx</Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.62rem', color: '#22c55e', ml: 'auto' }}>245 comptes détectés</Box>
      </Box>
      <Box sx={{ px: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
          {['Compte', 'Libellé', 'Débit', 'Crédit'].map((h) => (
            <Box key={h} sx={{ flex: h === 'Libellé' ? 2 : 1, fontFamily: BODY, fontSize: '0.6rem', fontWeight: 600, color: TEXT_SECONDARY, textTransform: 'uppercase' }}>{h}</Box>
          ))}
        </Box>
        {MOCK_BALANCE.slice(0, 4).map((row) => (
          <Box key={row.compte} sx={{ display: 'flex', gap: 0.5, py: 0.3, borderBottom: `1px solid ${BORDER}` }}>
            <Box sx={{ flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', color: GOLD }}>{row.compte}</Box>
            <Box sx={{ flex: 2, fontFamily: BODY, fontSize: '0.62rem', color: TEXT_SECONDARY }}>{row.libelle}</Box>
            <Box sx={{ flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', color: TEXT_SECONDARY, textAlign: 'right' }}>{row.mvtD || '—'}</Box>
            <Box sx={{ flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', color: TEXT_SECONDARY, textAlign: 'right' }}>{row.mvtC || '—'}</Box>
          </Box>
        ))}
        <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: TEXT_SECONDARY, mt: 0.5, textAlign: 'center' }}>… 241 comptes supplémentaires</Box>
      </Box>
    </Box>
  </Box>
)

const BalanceScreen = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Box>
        <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '0.95rem', color: TEXT_PRIMARY }}>Balance comptable</Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.68rem', color: TEXT_SECONDARY }}>Balance générale SYSCOHADA — Exercice 2025 / 2024</Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Box sx={{ p: 0.5, borderRadius: '4px', border: `1px solid ${BORDER}`, display: 'flex' }}><Print sx={{ fontSize: 14, color: TEXT_SECONDARY }} /></Box>
        <Box sx={{ p: 0.5, borderRadius: '4px', border: `1px solid ${BORDER}`, display: 'flex' }}><Download sx={{ fontSize: 14, color: TEXT_SECONDARY }} /></Box>
      </Box>
    </Box>
    {/* Status alert */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.8, borderRadius: '8px', bgcolor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', mb: 1.5 }}>
      <CheckCircle sx={{ fontSize: 14, color: '#22c55e' }} />
      <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: '#22c55e' }}>Balance équilibrée — Total Débit = Total Crédit</Box>
    </Box>
    {/* Stats row */}
    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
      <StatCard label="Comptes" value="245" sub="7 classes" icon={<FolderOpen sx={{ fontSize: 12, color: GOLD }} />} />
      <StatCard label="Total Débit" value="295.5 M" color="#22c55e" icon={<TrendingUp sx={{ fontSize: 12, color: '#22c55e' }} />} />
      <StatCard label="Total Crédit" value="295.5 M" color="#ef4444" icon={<TrendingDown sx={{ fontSize: 12, color: '#ef4444' }} />} />
      <StatCard label="Écart" value="0" color="#22c55e" icon={<CheckCircle sx={{ fontSize: 12, color: '#22c55e' }} />} />
    </Box>
    {/* Filters */}
    <Box sx={{ display: 'flex', gap: 0.8, mb: 1, alignItems: 'center' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: '6px', border: `1px solid ${BORDER}`, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Search sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
        <Box sx={{ fontFamily: BODY, fontSize: '0.65rem', color: TEXT_SECONDARY }}>Rechercher un compte…</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 1, py: 0.5, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
        <FilterList sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
        <Box sx={{ fontFamily: BODY, fontSize: '0.65rem', color: TEXT_SECONDARY }}>Toutes classes</Box>
      </Box>
    </Box>
    {/* Table */}
    <Box sx={{ borderRadius: '8px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', bgcolor: 'rgba(201,168,76,0.04)', borderBottom: `1px solid ${BORDER}` }}>
        {['Compte', 'Libellé', 'SD N-1', 'SC N-1', 'Mvt D', 'Mvt C', 'SD N', 'SC N'].map((h, i) => (
          <Box key={h} sx={{ flex: i === 1 ? 2.5 : 1, px: 0.8, py: 0.6, fontFamily: BODY, fontSize: '0.58rem', fontWeight: 600, color: TEXT_SECONDARY, textAlign: i > 1 ? 'right' : 'left', textTransform: 'uppercase' }}>{h}</Box>
        ))}
      </Box>
      {MOCK_BALANCE.map((row, idx) => (
        <Box key={row.compte} sx={{ display: 'flex', borderBottom: idx < MOCK_BALANCE.length - 1 ? `1px solid ${BORDER}` : 'none', '&:hover': { bgcolor: 'rgba(201,168,76,0.03)' } }}>
          <Box sx={{ flex: 1, px: 0.8, py: 0.5, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: GOLD }}>{row.compte}</Box>
          <Box sx={{ flex: 2.5, px: 0.8, py: 0.5, fontFamily: BODY, fontSize: '0.6rem', color: TEXT_PRIMARY }}>{row.libelle}</Box>
          {[row.sdN1, row.scN1, row.mvtD, row.mvtC, row.sdN, row.scN].map((v, i) => (
            <Box key={i} sx={{ flex: 1, px: 0.8, py: 0.5, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.58rem', color: v ? TEXT_SECONDARY : 'rgba(255,255,255,0.15)', textAlign: 'right' }}>{v || '—'}</Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
)

const AuditScreen = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Box>
        <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '0.95rem', color: TEXT_PRIMARY }}>Audit & Contrôles Proph3t</Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.68rem', color: TEXT_SECONDARY }}>129 contrôles de cohérence — SYSCOHADA Révisé</Box>
      </Box>
      <Box sx={{ px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: GOLD, fontFamily: BODY, fontSize: '0.68rem', fontWeight: 600, color: '#1a1200' }}>
        Lancer l'audit
      </Box>
    </Box>
    {/* Metrics */}
    <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
      {[
        { label: 'Bloquants', value: '0', color: '#22c55e' },
        { label: 'Majeurs', value: '2', color: '#f59e0b' },
        { label: 'Mineurs', value: '5', color: GOLD_MUTED },
        { label: 'Info', value: '12', color: TEXT_SECONDARY },
        { label: 'Score', value: '96%', color: '#22c55e' },
      ].map((m) => (
        <Box key={m.label} sx={{ flex: 1, p: 1.2, borderRadius: '8px', border: `1px solid ${BORDER}`, bgcolor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
          <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.2rem', color: m.color, lineHeight: 1 }}>{m.value}</Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: TEXT_SECONDARY, mt: 0.3 }}>{m.label}</Box>
        </Box>
      ))}
    </Box>
    {/* Compliance */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.8, borderRadius: '8px', bgcolor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', mb: 1.5 }}>
      <CheckCircle sx={{ fontSize: 14, color: '#22c55e' }} />
      <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: '#22c55e' }}>Balance CONFORME — 0 anomalie bloquante</Box>
    </Box>
    {/* Progress bar */}
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
        <Box sx={{ fontFamily: BODY, fontSize: '0.65rem', color: TEXT_SECONDARY }}>Score de conformité</Box>
        <Box sx={{ fontFamily: HEADING, fontSize: '0.72rem', fontWeight: 700, color: '#22c55e' }}>96%</Box>
      </Box>
      <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <Box sx={{ width: '96%', height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />
      </Box>
      <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: TEXT_SECONDARY, mt: 0.3 }}>129 contrôles exécutés | 122 OK / 7 anomalies</Box>
    </Box>
    {/* Controls list */}
    <Box sx={{ borderRadius: '8px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      {MOCK_CONTROLS.map((c, i) => (
        <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1.2, py: 0.6, borderBottom: i < MOCK_CONTROLS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
          {c.status === 'ok'
            ? <CheckCircle sx={{ fontSize: 13, color: '#22c55e' }} />
            : <Warning sx={{ fontSize: 13, color: '#f59e0b' }} />
          }
          <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: GOLD, minWidth: 36 }}>{c.id}</Box>
          <Box sx={{ flex: 1, fontFamily: BODY, fontSize: '0.65rem', color: TEXT_PRIMARY }}>{c.label}</Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.58rem', color: TEXT_SECONDARY, px: 0.8, py: 0.2, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.04)' }}>{c.niveau}</Box>
        </Box>
      ))}
    </Box>
  </Box>
)

const LiasseScreen = () => {
  const [page, setPage] = useState(0)
  return (
    <Box sx={{ display: 'flex', height: 420 }}>
      {/* Left sidebar */}
      <Box sx={{ width: 140, borderRight: `1px solid ${BORDER}`, bgcolor: 'rgba(0,0,0,0.2)', overflow: 'auto', flexShrink: 0 }}>
        <Box sx={{ px: 1, py: 0.8, fontFamily: BODY, fontSize: '0.65rem', fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER}` }}>Pages (84)</Box>
        {LIASSE_PAGES.map((p, i) => (
          <Box
            key={p}
            onClick={() => setPage(i)}
            sx={{
              px: 1, py: 0.6, fontFamily: BODY, fontSize: '0.6rem',
              color: i === page ? GOLD : TEXT_SECONDARY,
              bgcolor: i === page ? 'rgba(201,168,76,0.08)' : 'transparent',
              cursor: 'pointer', borderLeft: i === page ? `2px solid ${GOLD}` : '2px solid transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
            }}
          >
            {p}
          </Box>
        ))}
      </Box>
      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.6, borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(0,0,0,0.15)' }}>
          <ZoomOut sx={{ fontSize: 14, color: TEXT_SECONDARY, cursor: 'pointer' }} />
          <Box sx={{ fontFamily: BODY, fontSize: '0.62rem', color: TEXT_SECONDARY }}>75%</Box>
          <ZoomIn sx={{ fontSize: 14, color: TEXT_SECONDARY, cursor: 'pointer' }} />
          <Box sx={{ flex: 1 }} />
          <Box sx={{ fontFamily: BODY, fontSize: '0.62rem', color: TEXT_SECONDARY }}>Page {page + 1} / 84</Box>
          <Box sx={{ flex: 1 }} />
          <Print sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
          <Download sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
          <Send sx={{ fontSize: 14, color: GOLD }} />
        </Box>
        {/* A4 page */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.1)' }}>
          <Box sx={{ width: '85%', maxWidth: 320, bgcolor: '#fff', borderRadius: '4px', p: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.4)', color: '#111' }}>
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '0.7rem', color: '#333', mb: 0.3 }}>SYSCOHADA RÉVISÉ — {LIASSE_PAGES[page]}</Box>
              <Box sx={{ fontFamily: BODY, fontSize: '0.58rem', color: '#888' }}>SARL EXAMPLE · Exercice clos le 31/12/2025</Box>
            </Box>
            {/* Fake table rows */}
            {[
              { label: page < 3 ? 'Immobilisations incorporelles' : 'Ventes de marchandises', ref: page < 3 ? 'AA' : 'TA', val: '12 500 000' },
              { label: page < 3 ? 'Immobilisations corporelles' : 'Production vendue', ref: page < 3 ? 'AB' : 'TB', val: '23 500 000' },
              { label: page < 3 ? 'Immobilisations financières' : 'Produits accessoires', ref: page < 3 ? 'AC' : 'TC', val: '8 200 000' },
              { label: page < 3 ? 'Stocks et en-cours' : 'Achats consommés', ref: page < 3 ? 'AD' : 'RA', val: '92 000 000' },
              { label: page < 3 ? 'Créances et emplois assim.' : 'Charges de personnel', ref: page < 3 ? 'AE' : 'RB', val: '28 000 000' },
              { label: page < 3 ? 'Trésorerie-Actif' : 'Impôts et taxes', ref: page < 3 ? 'AF' : 'RC', val: '4 800 000' },
            ].map((r, i) => (
              <Box key={i} sx={{ display: 'flex', py: 0.4, borderBottom: '1px solid #eee', alignItems: 'center' }}>
                <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.5rem', color: '#999', width: 20 }}>{r.ref}</Box>
                <Box sx={{ flex: 1, fontFamily: BODY, fontSize: '0.55rem', color: '#444' }}>{r.label}</Box>
                <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.55rem', color: '#333', textAlign: 'right' }}>{r.val}</Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', py: 0.5, mt: 0.5, borderTop: '2px solid #333' }}>
              <Box sx={{ flex: 1, fontFamily: BODY, fontSize: '0.58rem', fontWeight: 700, color: '#222' }}>TOTAL</Box>
              <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.58rem', fontWeight: 700, color: '#222' }}>169 000 000</Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const ExportScreen = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '0.95rem', color: TEXT_PRIMARY, mb: 0.5 }}>Export & Télédéclaration</Box>
    <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY, mb: 2.5 }}>Exportez votre liasse dans le format souhaité</Box>
    {/* Export options */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {[
        { icon: <Description sx={{ fontSize: 28, color: GOLD }} />, title: 'Excel — 84 onglets (Mode A)', desc: 'Export complet avec tous les feuillets calculés, formules et mise en forme.', badge: 'Disponible', badgeColor: '#22c55e' },
        { icon: <Description sx={{ fontSize: 28, color: GOLD }} />, title: 'Excel — Template DGI (Mode B)', desc: 'Export conforme au modèle officiel de la Direction Générale des Impôts.', badge: 'Disponible', badgeColor: '#22c55e' },
        { icon: <Print sx={{ fontSize: 28, color: GOLD }} />, title: 'PDF — Impression A3/A4/A5', desc: 'Export PDF haute fidélité pour impression et archivage physique.', badge: 'Disponible', badgeColor: '#22c55e' },
        { icon: <Send sx={{ fontSize: 28, color: GOLD_MUTED }} />, title: 'XML — Télédéclaration (DSF, DAS, TVA, IS)', desc: 'Génération XML pour soumission électronique à l\'administration fiscale.', badge: 'Prochainement', badgeColor: TEXT_SECONDARY },
      ].map((opt) => (
        <Box
          key={opt.title}
          sx={{
            display: 'flex', gap: 1.5, p: 1.8,
            borderRadius: '10px', border: `1px solid ${BORDER}`,
            bgcolor: 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'rgba(201,168,76,0.2)' },
          }}
        >
          <Box sx={{ mt: 0.2 }}>{opt.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '0.82rem', color: TEXT_PRIMARY, mb: 0.3 }}>{opt.title}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.68rem', color: TEXT_SECONDARY, lineHeight: 1.5 }}>{opt.desc}</Box>
          </Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', fontWeight: 500, color: opt.badgeColor, alignSelf: 'center', px: 1, py: 0.3, borderRadius: '999px', border: `1px solid ${opt.badgeColor}33`, whiteSpace: 'nowrap' }}>{opt.badge}</Box>
        </Box>
      ))}
    </Box>
    {/* Progress simulation */}
    <Box sx={{ mt: 2.5, p: 1.5, borderRadius: '8px', border: `1px solid ${BORDER}`, bgcolor: 'rgba(201,168,76,0.04)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_PRIMARY }}>Export Excel Mode A en cours…</Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', fontWeight: 600, color: GOLD }}>67%</Box>
      </Box>
      <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <Box sx={{ width: '67%', height: '100%', borderRadius: 2, bgcolor: GOLD, transition: 'width 1s' }} />
      </Box>
      <Box sx={{ fontFamily: BODY, fontSize: '0.6rem', color: TEXT_SECONDARY, mt: 0.5 }}>56 / 84 onglets traités</Box>
    </Box>
  </Box>
)

// ─── Screen map ──────────────────────────────────────────────
const SCREENS: Record<string, { component: React.ReactNode; windowTitle: string }> = {
  dashboard: { component: <DashboardScreen />, windowTitle: 'Liass\'Pilot — Tableau de bord' },
  import: { component: <ImportScreen />, windowTitle: 'Liass\'Pilot — Import Balance' },
  balance: { component: <BalanceScreen />, windowTitle: 'Liass\'Pilot — Balance Comptable' },
  audit: { component: <AuditScreen />, windowTitle: 'Liass\'Pilot — Audit Proph3t' },
  liasse: { component: <LiasseScreen />, windowTitle: 'Liass\'Pilot — Liasse Fiscale' },
  export: { component: <ExportScreen />, windowTitle: 'Liass\'Pilot — Export' },
}

// ─── Main Demo component ────────────────────────────────────
const Demo: React.FC = () => {
  const [step, setStep] = useState(0)
  const current = tourSteps[step]
  const screen = SCREENS[current.id]

  return (
    <PublicLayout>
      {/* Header */}
      <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 700, mx: 'auto', px: 3 }}>
          <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.2rem', md: '3rem' }, color: TEXT_PRIMARY, m: 0, mb: 1 }}>
            Visite guidée
          </Box>
          <Box component="p" sx={{ fontFamily: BODY, fontSize: '1rem', color: TEXT_SECONDARY, m: 0 }}>
            Découvrez Liass'Pilot en 6 étapes — de l'import à la télédéclaration.
          </Box>
        </Box>
      </Box>

      {/* Tour navigation pills */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {tourSteps.map((s, i) => (
            <Box
              key={s.id}
              onClick={() => setStep(i)}
              sx={{
                px: 2, py: 0.8,
                borderRadius: '999px',
                fontFamily: BODY,
                fontSize: '0.78rem',
                fontWeight: i === step ? 600 : 400,
                color: i === step ? '#1a1200' : TEXT_SECONDARY,
                bgcolor: i === step ? GOLD : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === step ? GOLD : BORDER}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': i !== step ? { borderColor: 'rgba(255,255,255,0.15)' } : {},
              }}
            >
              {i + 1}. {s.title}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main demo area */}
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, pb: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left: description */}
          <Box sx={{ flex: '0 0 280px' }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              {/* Step indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEADING, fontWeight: 700, fontSize: '0.85rem', color: '#1a1200' }}>
                  {step + 1}
                </Box>
                <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: GOLD, fontWeight: 500 }}>{current.subtitle}</Box>
              </Box>

              <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.5rem', color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
                {current.title}
              </Box>

              <Box component="p" sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY, lineHeight: 1.7, m: 0, mb: 3 }}>
                {current.desc}
              </Box>

              {/* Navigation */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  onClick={() => step > 0 && setStep(step - 1)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 2, py: 1,
                    borderRadius: '8px',
                    border: `1px solid ${BORDER}`,
                    fontFamily: BODY, fontSize: '0.82rem',
                    color: step > 0 ? TEXT_PRIMARY : TEXT_SECONDARY,
                    cursor: step > 0 ? 'pointer' : 'default',
                    opacity: step > 0 ? 1 : 0.3,
                    transition: 'all 0.2s',
                    '&:hover': step > 0 ? { borderColor: 'rgba(255,255,255,0.2)' } : {},
                  }}
                >
                  <ArrowBack sx={{ fontSize: 16 }} /> Précédent
                </Box>
                <Box
                  onClick={() => step < tourSteps.length - 1 && setStep(step + 1)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 2, py: 1,
                    borderRadius: '8px',
                    bgcolor: step < tourSteps.length - 1 ? GOLD : 'transparent',
                    border: step < tourSteps.length - 1 ? 'none' : `1px solid ${BORDER}`,
                    fontFamily: BODY, fontSize: '0.82rem',
                    color: step < tourSteps.length - 1 ? '#1a1200' : TEXT_SECONDARY,
                    cursor: step < tourSteps.length - 1 ? 'pointer' : 'default',
                    opacity: step < tourSteps.length - 1 ? 1 : 0.3,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    '&:hover': step < tourSteps.length - 1 ? { bgcolor: '#d4b35a' } : {},
                  }}
                >
                  Suivant <ArrowForward sx={{ fontSize: 16 }} />
                </Box>
              </Box>

              {/* Progress */}
              <Box sx={{ mt: 3, display: 'flex', gap: 0.5 }}>
                {tourSteps.map((_, i) => (
                  <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: i <= step ? GOLD : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right: app screenshot */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                bgcolor: DARK_SURFACE,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              }}
            >
              <FakeWindowBar title={screen.windowTitle} />
              <Box sx={{ minHeight: 420, overflow: 'auto' }}>
                {screen.component}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CTA */}
      <Box sx={{ bgcolor: DARK_SURFACE, borderTop: `1px solid ${BORDER}`, py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.6rem', md: '2rem' }, color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
          Convaincu ?
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, color: TEXT_SECONDARY, fontSize: '0.92rem', m: 0, mb: 4 }}>
          Essayez Liass'Pilot gratuitement — 14 jours, sans carte bancaire.
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box
            component={RouterLink} to="/register"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              bgcolor: GOLD, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
              fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
              transition: 'background 0.2s', '&:hover': { bgcolor: '#d4b35a' },
            }}
          >
            Commencer gratuitement <ArrowForward sx={{ fontSize: 16 }} />
          </Box>
          <Box
            component={RouterLink} to="/contact"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              border: `1px solid rgba(255,255,255,0.15)`, bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`, fontWeight: 400, fontFamily: BODY,
              fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
              transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Demander une démo privée
          </Box>
        </Box>
      </Box>
    </PublicLayout>
  )
}

export default Demo
