/**
 * Dashboard Audit & Liasse Fiscale OHADA
 * Design adapté pour FiscaSync-Lite
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// === Palette FiscaSync ===
const C = {
  bg: "#F0F1F2",
  card: "#FFFFFF",
  cardAlt: "#F8F9FA",
  border: "#E5E7EB",
  accent: "#8691A6",
  red: "#D93829",
  orange: "#F59E0B",
  yellow: "#EAB308",
  green: "#22C55E",
  cyan: "#06b6d4",
  purple: "#a78bfa",
  pink: "#ec4899",
  t1: "#1F2937",
  t2: "#4B5563",
  t3: "#6B7280",
}

function useAnimatedValue(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const from = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function Ring({ pct, size = 130, stroke = 10, color, children }: any) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const animPct = useAnimatedValue(pct)
  const off = circ - (animPct / 100) * circ
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 6px ${color}66)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  )
}

function Spark({ points, color, w = 100, h = 32 }: any) {
  if (!points.length) return null
  const mn = Math.min(...points)
  const mx = Math.max(...points)
  const rng = mx - mn || 1
  const pts = points.map((p: number, i: number) =>
    `${(i / (points.length - 1)) * w},${h - ((p - mn) / rng) * (h - 4) - 2}`
  ).join(" ")
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Kpi({ icon, label, value, sub, color = C.accent }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: color + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.t1, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function DashCard({ children, style, span }: any) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 18,
      boxShadow: '0 2px 8px rgba(134, 145, 166, 0.08)',
      gridColumn: span ? `span ${span}` : undefined,
      ...style
    }}>{children}</div>
  )
}

function SevDot({ sev, size = 10 }: any) {
  const colors: Record<string, string> = {
    BLOQUANT: C.red, MAJEUR: C.orange, MINEUR: C.yellow, INFO: C.accent, OK: C.green
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[sev],
      boxShadow: `0 0 6px ${colors[sev]}55`,
      flexShrink: 0
    }} />
  )
}

// === Données d'audit ===
const anomalies = [
  { ref: "F-001", sev: "BLOQUANT", label: "Balance déséquilibrée", detail: "Écart: 5 500 FCFA" },
  { ref: "IC-001", sev: "BLOQUANT", label: "Amort. > Valeur brute", detail: "12 500 000 FCFA" },
  { ref: "NN-002", sev: "BLOQUANT", label: "Rupture soldes ouverture", detail: "3 comptes" },
  { ref: "C-001", sev: "MAJEUR", label: "Comptes non conformes OHADA", detail: "5 comptes" },
  { ref: "C-006", sev: "MAJEUR", label: "Mapping états financiers", detail: "2 comptes" },
  { ref: "NN-001", sev: "MAJEUR", label: "Report à nouveau incohérent", detail: "3 200 000 FCFA" },
  { ref: "F-008", sev: "MAJEUR", label: "RAN \u2260 Résultat N-1", detail: "3 200 000 FCFA" },
  { ref: "IC-008", sev: "MAJEUR", label: "Variation stocks incohérente", detail: "1 850 000 FCFA" },
  { ref: "MA-005", sev: "MAJEUR", label: "Capitaux propres négatifs", detail: "-12 450 000" },
  { ref: "AR-005", sev: "MAJEUR", label: "Reports successifs incohérents", detail: "5 M cumulé" },
  { ref: "SS-005", sev: "MINEUR", label: "Fournisseur débiteur 401", detail: "890 000 FCFA" },
  { ref: "SS-006", sev: "MINEUR", label: "Client créditeur 411", detail: "2 350 000 FCFA" },
  { ref: "SS-007", sev: "MINEUR", label: "Banque créditrice 521", detail: "15 800 000 FCFA" },
  { ref: "IC-002", sev: "MINEUR", label: "Immo. sans amortissement", detail: "Compte 2315" },
  { ref: "IC-014", sev: "MINEUR", label: "Bénéfice sans IS", detail: "67 M / IS: 0" },
  { ref: "NN-005", sev: "MINEUR", label: "Créances -73% vs N-1", detail: "Variation anormale" },
]

const niveaux = [
  { n: 0, l: "Structurel", total: 10, ok: 10 },
  { n: 1, l: "Fondamental", total: 11, ok: 8 },
  { n: 2, l: "Conformité", total: 8, ok: 3 },
  { n: 3, l: "Sens soldes", total: 16, ok: 11 },
  { n: 4, l: "Inter-comptes", total: 19, ok: 10 },
  { n: 5, l: "N/N-1", total: 8, ok: 3 },
  { n: 8, l: "Archives", total: 7, ok: 5 },
]

const hist = [
  { y: "2021", actif: 850, ca: 2100, res: 45, tres: 120 },
  { y: "2022", actif: 920, ca: 2400, res: 52, tres: 85 },
  { y: "2023", actif: 1100, ca: 2800, res: 38, tres: 150 },
  { y: "2024", actif: 1300, ca: 2300, res: -12, tres: -25 },
  { y: "2025", actif: 1500, ca: 3100, res: 67, tres: 210 },
]

const variations = [
  { p: "Immo. corporelles", n1: 150, n: 225, ref: "AP" },
  { p: "Créances clients", n1: 45, n: 12, ref: "BH" },
  { p: "Stocks", n1: 38, n: 42, ref: "BB" },
  { p: "Trésorerie", n1: -25, n: 210, ref: "BT" },
  { p: "Capital", n1: 100, n: 100, ref: "CA" },
  { p: "Dettes financières", n1: 80, n: 120, ref: "DA" },
  { p: "Résultat net", n1: -12, n: 67, ref: "XL" },
  { p: "Chiffre d'affaires", n1: 2300, n: 3100, ref: "TA" },
]

const reclassements = [
  { c: "411 DUPONT", de: "Actif", vers: "Passif", m: "2 350 000" },
  { c: "521 SGCI", de: "Trés. Actif", vers: "Trés. Passif", m: "15 800 000" },
  { c: "401 SARL X", de: "Passif", vers: "Actif", m: "890 000" },
]

// === Dashboard principal ===
const ModernDashboard: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const counts = { BLQ: 3, MAJ: 7, MIN: 12, INF: 18, OK: 85 }
  const total = 125
  const pctOk = Math.round((counts.OK / total) * 100)

  const handleBackToLanding = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ width: "100%", background: C.bg, color: C.t1, minHeight: "100vh" }}>

      {/* Top Bar */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
        borderBottom: `1px solid ${C.border}`,
        padding: "16px 24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Bouton retour accueil */}
            <div
              onClick={handleBackToLanding}
              role="button"
              title="Retour à l'accueil"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16, color: "#f1f5f9" }}>{'\u2190'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>Accueil</span>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #8691A6, #6B7280)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 16, color: "#fff"
            }}>F</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>FISCASYNC LIASSE</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Module d'Audit & Génération de Liasse Fiscale OHADA</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>SOCIETE EXEMPLE SA</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Exercice 2025 - Audit 08/02/2026 - 342 comptes</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1280, margin: "0 auto" }}>

        {/* Row 1: Statut global + KPIs + Sévérités */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 1fr", gap: 14, marginBottom: 14 }}>

          <DashCard>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1 }}>Statut Audit</div>
              <Ring pct={pctOk} size={120} stroke={9} color={pctOk >= 80 ? C.green : pctOk >= 50 ? C.yellow : C.red}>
                <span style={{ fontSize: 28, fontWeight: 900, color: C.t1 }}>{pctOk}%</span>
                <span style={{ fontSize: 9, color: C.t3 }}>validé</span>
              </Ring>
              <div style={{ padding: "5px 14px", borderRadius: 20, background: C.red + "15", border: `1px solid ${C.red}33` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>NON VALIDÉE</span>
              </div>
              <div style={{ fontSize: 10, color: C.t3, textAlign: "center" }}>3 bloquantes à corriger</div>
            </div>
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Indicateurs Financiers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Kpi icon={'\uD83D\uDCCA'} label="Total Bilan" value="4 521 M" sub="+15.4% vs N-1" color={C.cyan} />
              <Kpi icon={'\uD83D\uDCB0'} label="Chiffre d'affaires" value="3 100 M" sub="+34.8% vs N-1" color={C.green} />
              <Kpi icon={'\uD83D\uDCC8'} label="Résultat Net" value="67 M" sub="vs -12M en N-1" color={C.green} />
              <Kpi icon={'\uD83C\uDFE6'} label="Trésorerie Nette" value="210 M" sub="vs -25M en N-1" color={C.cyan} />
              <Kpi icon={'\uD83C\uDFE2'} label="Capital Social" value="100 M" sub="Stable" color={C.purple} />
              <Kpi icon={'\u26A0\uFE0F'} label="Capitaux Propres" value="-12.4 M" sub="Négatifs — alerte" color={C.red} />
            </div>
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Répartition des Contrôles</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              {[
                { l: "Bloquant", v: counts.BLQ, c: C.red },
                { l: "Majeur", v: counts.MAJ, c: C.orange },
                { l: "Mineur", v: counts.MIN, c: C.yellow },
                { l: "Info", v: counts.INF, c: C.accent },
                { l: "Validé", v: counts.OK, c: C.green },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: C.t3, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 14, borderRadius: 7, display: "flex", overflow: "hidden", marginBottom: 10 }}>
              {[
                { v: counts.BLQ, c: C.red },
                { v: counts.MAJ, c: C.orange },
                { v: counts.MIN, c: C.yellow },
                { v: counts.INF, c: C.accent },
                { v: counts.OK, c: C.green },
              ].map((s, i) => (
                <div key={i} style={{ width: `${(s.v / total) * 100}%`, background: s.c, transition: "width 1s ease" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.t2, textAlign: "center" }}>
              <span style={{ fontWeight: 700 }}>{total}</span> contrôles exécutés - <span style={{ fontWeight: 700, color: C.green }}>{counts.OK}</span> passés
            </div>
          </DashCard>
        </div>

        {/* Row 2: Niveaux + Anomalies + Reclassements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr 0.8fr", gap: 14, marginBottom: 14 }}>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Contrôles par Niveau</div>
            {niveaux.map(n => {
              const p = n.total > 0 ? Math.round((n.ok / n.total) * 100) : 0
              const col = p === 100 ? C.green : p >= 60 ? C.yellow : C.red
              return (
                <div key={n.n} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: C.t2 }}><span style={{ color: C.t3, marginRight: 4 }}>N{n.n}</span>{n.l}</span>
                    <span style={{ color: col, fontWeight: 600 }}>{n.ok}/{n.total}</span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${p}%`, height: "100%", background: col, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                </div>
              )
            })}
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Anomalies à traiter</div>
            <div style={{ maxHeight: 270, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {anomalies.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 8,
                  background: C.cardAlt, border: `1px solid ${C.border}`
                }}>
                  <SevDot sev={a.sev} />
                  <span style={{ fontSize: 10, color: C.t3, width: 48, flexShrink: 0 }}>{a.ref}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</span>
                  <span style={{ fontSize: 10, color: C.t3, whiteSpace: "nowrap" }}>{a.detail}</span>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Reclassements Auto</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reclassements.map((r, i) => (
                <div key={i} style={{ padding: 10, borderRadius: 8, background: C.cardAlt, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{r.c}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                    <span style={{ padding: "2px 6px", borderRadius: 4, background: C.red + "15", color: C.red }}>{r.de}</span>
                    <span style={{ color: C.t3 }}>{'\u2192'}</span>
                    <span style={{ padding: "2px 6px", borderRadius: 4, background: C.green + "15", color: C.green }}>{r.vers}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.cyan, marginTop: 4 }}>{r.m}</div>
                </div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Row 3: Historique 5 ans + Variations N/N-1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14, marginBottom: 14 }}>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Continuité 5 Exercices (M FCFA)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>{["", ...hist.map(h => h.y)].map((h, i) => (
                    <th key={i} style={{ padding: "6px 8px", textAlign: i ? "right" : "left", color: C.t3, fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    { l: "Total Actif", k: "actif" as const },
                    { l: "CA", k: "ca" as const },
                    { l: "Résultat", k: "res" as const },
                    { l: "Trésorerie", k: "tres" as const },
                  ].map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ padding: "6px 8px", color: C.t2, fontSize: 11 }}>{row.l}</td>
                      {hist.map((h, ci) => {
                        const v = h[row.k]
                        const isNeg = v < 0
                        const isLast = ci === hist.length - 1
                        return (
                          <td key={ci} style={{
                            padding: "6px 8px", textAlign: "right",
                            fontWeight: isLast ? 700 : 400,
                            color: isNeg ? C.red : isLast ? C.t1 : C.t2,
                            fontSize: 11
                          }}>
                            {v.toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              {[
                { l: "Actif", d: hist.map(h => h.actif), c: C.cyan },
                { l: "CA", d: hist.map(h => h.ca), c: C.green },
                { l: "Résultat", d: hist.map(h => h.res), c: C.purple },
                { l: "Trés.", d: hist.map(h => h.tres), c: C.accent },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <Spark points={s.d} color={s.c} w={70} h={28} />
                  <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Variations Significatives N / N-1 (M FCFA)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>{["Poste", "Réf", "N-1", "N", "Variation", "%", ""].map((h, i) => (
                    <th key={i} style={{ padding: "6px 8px", textAlign: i > 1 ? "right" : "left", color: C.t3, fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {variations.map((v, i) => {
                    const d = v.n - v.n1
                    const pv = v.n1 !== 0 ? Math.round((d / Math.abs(v.n1)) * 100) : 999
                    const alert = Math.abs(pv) > 50
                    return (
                      <tr key={i}>
                        <td style={{ padding: "6px 8px", fontWeight: 500 }}>{v.p}</td>
                        <td style={{ padding: "6px 8px", color: C.t3, fontSize: 10 }}>{v.ref}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: C.t3 }}>{v.n1}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{v.n}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: d >= 0 ? C.green : C.red, fontWeight: 600 }}>{d >= 0 ? "+" : ""}{d}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: alert ? C.orange : C.t3, fontWeight: alert ? 700 : 400 }}>{pv > 500 ? "N/A" : `${pv >= 0 ? "+" : ""}${pv}%`}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontSize: 12 }}>{alert ? "\u26A0\uFE0F" : "\u2705"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>

        {/* Row 4: Pipeline + Archives + Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Pipeline de Traitement</div>
            {[
              { n: 1, l: "Import Balance", s: "done", d: "N et N-1 importées" },
              { n: 2, l: "Audit Balance", s: "active", d: "108 contrôles en cours" },
              { n: 3, l: "Corrections Comptable", s: "pending", d: "En attente corrections" },
              { n: 4, l: "Génération Liasse", s: "pending", d: "Bilan, CdR, TFT, Notes" },
              { n: 5, l: "Export & Archivage", s: "pending", d: "PDF, Excel, Télédéclaration" },
            ].map((p, i) => {
              const col = p.s === "done" ? C.green : p.s === "active" ? C.accent : C.t3
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 12,
                      background: p.s === "pending" ? C.card : col,
                      border: `2px solid ${col}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800,
                      color: p.s === "pending" ? C.t3 : "#fff"
                    }}>
                      {p.s === "done" ? "\u2713" : p.n}
                    </div>
                    {i < 4 && <div style={{ width: 2, height: 16, background: p.s === "done" ? C.green + "44" : C.border }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: p.s === "pending" ? C.t3 : C.t1 }}>{p.l}</div>
                    <div style={{ fontSize: 10, color: C.t3 }}>{p.d}</div>
                  </div>
                </div>
              )
            })}
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Liasses Archivées</div>
            {[
              { y: "2024", s: "DÉPOSÉE", actif: "1 300M", res: "-12M", c: C.red },
              { y: "2023", s: "DÉPOSÉE", actif: "1 100M", res: "38M", c: C.green },
              { y: "2022", s: "DÉPOSÉE", actif: "920M", res: "52M", c: C.green },
              { y: "2021", s: "DÉPOSÉE", actif: "850M", res: "45M", c: C.green },
            ].map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", borderRadius: 8,
                background: C.cardAlt, border: `1px solid ${C.border}`,
                marginBottom: 6
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{'\uD83D\uDCC1'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{a.y}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>Actif {a.actif}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: a.c }}>{a.res}</div>
                  <div style={{ fontSize: 8, color: C.green, fontWeight: 600 }}>{a.s}</div>
                </div>
              </div>
            ))}
          </DashCard>

          <DashCard>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "\uD83D\uDCC4", l: "Exporter rapport d'audit", sub: "PDF détaillé avec suggestions", c: C.accent, active: true },
                { icon: "\uD83D\uDCE5", l: "Réimporter balance corrigée", sub: "Relancer les contrôles", c: C.cyan, active: true },
                { icon: "\u2705", l: "Valider la balance", sub: "3 erreurs bloquantes restantes", c: C.t3, active: false },
                { icon: "\uD83D\uDCCA", l: "Générer la liasse fiscale", sub: "Requiert validation balance", c: C.t3, active: false },
                { icon: "\uD83D\uDCE4", l: "Export Excel / Télédéclaration", sub: "e-impôts, DSF, e-Tax", c: C.t3, active: false },
                { icon: "\uD83D\uDDC4\uFE0F", l: "Consulter les archives", sub: "4 liasses archivées", c: C.purple, active: true },
              ].map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                  background: a.active ? C.cardAlt : C.bg,
                  border: `1px solid ${a.active ? a.c + "33" : C.border}`,
                  opacity: a.active ? 1 : 0.45,
                  cursor: a.active ? "pointer" : "not-allowed",
                  transition: "all 0.15s"
                }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: a.active ? C.t1 : C.t3 }}>{a.l}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>{a.sub}</div>
                  </div>
                  {a.active && <span style={{ fontSize: 12, color: C.t3 }}>{'\u203A'}</span>}
                </div>
              ))}
            </div>
          </DashCard>
        </div>

      </div>
    </div>
  )
}

export default ModernDashboard
