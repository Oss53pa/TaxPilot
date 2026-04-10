/**
 * Démo interactive : Génération du Bilan SYSCOHADA (3 colonnes Brut/Amort/Net)
 * Simule la génération automatique des 80+ pages de la liasse fiscale
 * avec drill-down par poste et comparaison N / N-1.
 */
import React, { useState } from 'react'
import {
  ChevronDown, ChevronRight, FileText, Sparkles, TrendingUp,
  TrendingDown, Download, Printer,
} from 'lucide-react'

interface DetailLine {
  code: string
  label: string
  brut: number
  amort: number
}

interface BilanRow {
  ref: string
  label: string
  brut: number
  amort: number
  detail: DetailLine[]
}

const ACTIF_IMMO: BilanRow[] = [
  {
    ref: 'AD',
    label: 'Charges immobilisées',
    brut: 1200000,
    amort: 0,
    detail: [
      { code: '201', label: 'Frais d\'établissement', brut: 800000, amort: 0 },
      { code: '202', label: 'Charges à répartir sur plusieurs exercices', brut: 400000, amort: 0 },
    ],
  },
  {
    ref: 'AF',
    label: 'Immobilisations incorporelles',
    brut: 5400000,
    amort: 1800000,
    detail: [
      { code: '213', label: 'Brevets, licences, concessions', brut: 3200000, amort: 1280000 },
      { code: '215', label: 'Logiciels et sites internet', brut: 2200000, amort: 520000 },
    ],
  },
  {
    ref: 'AI',
    label: 'Immobilisations corporelles',
    brut: 42500000,
    amort: 12300000,
    detail: [
      { code: '231', label: 'Bâtiments industriels', brut: 22000000, amort: 6600000 },
      { code: '244', label: 'Matériel et mobilier', brut: 8000000, amort: 2000000 },
      { code: '245', label: 'Matériel de transport', brut: 9500000, amort: 2850000 },
      { code: '246', label: 'Matériel informatique', brut: 3000000, amort: 850000 },
    ],
  },
  {
    ref: 'AR',
    label: 'Immobilisations financières',
    brut: 3500000,
    amort: 0,
    detail: [
      { code: '261', label: 'Titres de participation', brut: 2500000, amort: 0 },
      { code: '275', label: 'Dépôts et cautionnements', brut: 1000000, amort: 0 },
    ],
  },
]

const ACTIF_CIRC: BilanRow[] = [
  {
    ref: 'BA',
    label: 'Actif circulant HAO',
    brut: 500000,
    amort: 0,
    detail: [{ code: '485', label: 'Créances sur cessions', brut: 500000, amort: 0 }],
  },
  {
    ref: 'BB',
    label: 'Stocks et en-cours',
    brut: 18500000,
    amort: 800000,
    detail: [
      { code: '311', label: 'Marchandises', brut: 12000000, amort: 500000 },
      { code: '321', label: 'Matières premières', brut: 6500000, amort: 300000 },
    ],
  },
  {
    ref: 'BI',
    label: 'Créances clients et comptes rattachés',
    brut: 39000000,
    amort: 2100000,
    detail: [
      { code: '411', label: 'Clients', brut: 33000000, amort: 0 },
      { code: '416', label: 'Clients douteux', brut: 4500000, amort: 2100000 },
      { code: '418', label: 'Clients - produits non encore facturés', brut: 1500000, amort: 0 },
    ],
  },
  {
    ref: 'BJ',
    label: 'Autres créances',
    brut: 2800000,
    amort: 0,
    detail: [
      { code: '425', label: 'Personnel - avances et acomptes', brut: 1000000, amort: 0 },
      { code: '445', label: 'État - TVA déductible', brut: 1800000, amort: 0 },
    ],
  },
]

const TRESO_ACTIF: BilanRow[] = [
  {
    ref: 'BQ',
    label: 'Banques, chèques postaux, caisse',
    brut: 14700000,
    amort: 0,
    detail: [
      { code: '521', label: 'Banques locales (SGBCI)', brut: 11200000, amort: 0 },
      { code: '531', label: 'Chèques postaux', brut: 1800000, amort: 0 },
      { code: '571', label: 'Caisse principale', brut: 1700000, amort: 0 },
    ],
  },
]

interface PassifRow {
  ref: string
  label: string
  montant: number
}

const PASSIF_CP: PassifRow[] = [
  { ref: 'CA', label: 'Capital', montant: 60000000 },
  { ref: 'CD', label: 'Réserves', montant: 8200000 },
  { ref: 'CH', label: 'Report à nouveau', montant: 15700000 },
  { ref: 'CK', label: 'Résultat net de l\'exercice', montant: 12400000 },
]

const PASSIF_DETTES: PassifRow[] = [
  { ref: 'DD', label: 'Emprunts et dettes financières', montant: 18500000 },
  { ref: 'DH', label: 'Clients, avances reçues', montant: 1500000 },
  { ref: 'DI', label: 'Fournisseurs d\'exploitation', montant: 12300000 },
  { ref: 'DJ', label: 'Dettes fiscales et sociales', montant: 5200000 },
]

const fmt = (n: number): string => n.toLocaleString('fr-FR')

interface ActifSectionProps {
  title: string
  code: string
  rows: BilanRow[]
}

const ActifSection: React.FC<ActifSectionProps> = ({ title, code, rows }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const totalBrut = rows.reduce((s, r) => s + r.brut, 0)
  const totalAmort = rows.reduce((s, r) => s + r.amort, 0)
  const totalNet = totalBrut - totalAmort

  return (
    <div className="mb-3">
      <div className="bg-[#1e293b] text-white px-3 py-2 rounded-t-lg flex items-center justify-between text-xs font-bold">
        <span>
          <span className="font-mono text-[#94a3b8] mr-2">{code}</span>
          {title}
        </span>
        <span className="font-mono">{fmt(totalNet)}</span>
      </div>
      <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 font-medium">
              <th className="px-2 py-1.5 text-left w-10">Réf</th>
              <th className="px-2 py-1.5 text-left">Poste</th>
              <th className="px-2 py-1.5 text-right w-24">Brut</th>
              <th className="px-2 py-1.5 text-right w-24">Amort / Prov</th>
              <th className="px-2 py-1.5 text-right w-24">Net N</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const net = row.brut - row.amort
              const isOpen = expanded[row.ref] ?? false
              return (
                <React.Fragment key={row.ref}>
                  <tr
                    onClick={() => setExpanded((p) => ({ ...p, [row.ref]: !isOpen }))}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-2 py-1.5 font-mono text-gray-500 font-semibold">{row.ref}</td>
                    <td className="px-2 py-1.5 text-gray-800 flex items-center gap-1">
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                      {row.label}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-gray-600">{fmt(row.brut)}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-orange-600">
                      {row.amort > 0 ? fmt(row.amort) : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold text-[#141414]">
                      {fmt(net)}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-3 py-2">
                        <div className="space-y-1">
                          {row.detail.map((d) => {
                            const dnet = d.brut - d.amort
                            return (
                              <div key={d.code} className="flex items-center text-[11px] text-gray-600 pl-4">
                                <span className="font-mono text-gray-400 w-12">{d.code}</span>
                                <span className="flex-1 truncate">{d.label}</span>
                                <span className="font-mono text-gray-500 w-24 text-right">{fmt(d.brut)}</span>
                                <span className="font-mono text-orange-500 w-24 text-right">
                                  {d.amort > 0 ? fmt(d.amort) : '—'}
                                </span>
                                <span className="font-mono font-semibold text-gray-800 w-24 text-right">
                                  {fmt(dnet)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold text-gray-700">
              <td colSpan={2} className="px-2 py-1.5 text-right">Sous-total {code}</td>
              <td className="px-2 py-1.5 text-right font-mono">{fmt(totalBrut)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-orange-700">{fmt(totalAmort)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[#141414]">{fmt(totalNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const InteractiveLiasseDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [view, setView] = useState<'bilan-actif' | 'bilan-passif'>('bilan-actif')

  const totalActifNet =
    ACTIF_IMMO.reduce((s, r) => s + (r.brut - r.amort), 0) +
    ACTIF_CIRC.reduce((s, r) => s + (r.brut - r.amort), 0) +
    TRESO_ACTIF.reduce((s, r) => s + (r.brut - r.amort), 0)

  const totalCapitauxPropres = PASSIF_CP.reduce((s, r) => s + r.montant, 0)
  const totalDettes = PASSIF_DETTES.reduce((s, r) => s + r.montant, 0)
  const totalPassif = totalCapitauxPropres + totalDettes

  const equilibre = Math.abs(totalActifNet - totalPassif)
  const balanced = equilibre < 1000

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Démo interactive</strong> — Bilan SYSCOHADA généré automatiquement depuis la balance importée.
          Cliquez sur un poste pour voir le détail des sous-comptes. Les colonnes Brut, Amortissements et Net sont
          calculées en temps réel.
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white rounded-xl p-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/50">Liasse fiscale SYSCOHADA</p>
          <h4 className="text-base font-bold">SARL AKWABA · Exercice clos le 31/12/2025</h4>
          <p className="text-xs text-white/60 mt-0.5">Page générée automatiquement · 80+ pages dans la liasse complète</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Download className="w-3 h-3" /> Excel
          </button>
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Printer className="w-3 h-3" /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setView('bilan-actif')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            view === 'bilan-actif'
              ? 'border-[#141414] text-[#141414]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          BILAN - ACTIF
        </button>
        <button
          onClick={() => setView('bilan-passif')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            view === 'bilan-passif'
              ? 'border-[#141414] text-[#141414]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          BILAN - PASSIF
        </button>
        <div className="ml-auto text-[10px] text-gray-400 flex items-center gap-2 px-2">
          <FileText className="w-3 h-3" /> Page 1 / 80+
        </div>
      </div>

      {view === 'bilan-actif' && (
        <div>
          <ActifSection title="ACTIF IMMOBILISÉ" code="AZ" rows={ACTIF_IMMO} />
          <ActifSection title="ACTIF CIRCULANT" code="BK" rows={ACTIF_CIRC} />
          <ActifSection title="TRÉSORERIE ACTIF" code="BT" rows={TRESO_ACTIF} />

          <div className="mt-2 bg-[#c9a96e] text-[#0d0d0d] rounded-lg px-4 py-3 flex items-center justify-between font-bold">
            <span className="text-sm">
              <span className="font-mono mr-2">BZ</span>TOTAL GÉNÉRAL ACTIF
            </span>
            <span className="font-mono">{fmt(totalActifNet)} FCFA</span>
          </div>
        </div>
      )}

      {view === 'bilan-passif' && (
        <div className="space-y-3">
          <div>
            <div className="bg-[#1e293b] text-white px-3 py-2 rounded-t-lg flex items-center justify-between text-xs font-bold">
              <span>
                <span className="font-mono text-[#94a3b8] mr-2">CP</span>CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES
              </span>
              <span className="font-mono">{fmt(totalCapitauxPropres)}</span>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden divide-y divide-gray-100">
              {PASSIF_CP.map((r) => (
                <div key={r.ref} className="flex items-center px-3 py-2 text-xs hover:bg-gray-50">
                  <span className="font-mono text-gray-500 font-semibold w-12">{r.ref}</span>
                  <span className="flex-1 text-gray-800">{r.label}</span>
                  <span className="font-mono font-semibold text-[#141414]">{fmt(r.montant)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-[#1e293b] text-white px-3 py-2 rounded-t-lg flex items-center justify-between text-xs font-bold">
              <span>
                <span className="font-mono text-[#94a3b8] mr-2">DF</span>DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES
              </span>
              <span className="font-mono">{fmt(totalDettes)}</span>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden divide-y divide-gray-100">
              {PASSIF_DETTES.map((r) => (
                <div key={r.ref} className="flex items-center px-3 py-2 text-xs hover:bg-gray-50">
                  <span className="font-mono text-gray-500 font-semibold w-12">{r.ref}</span>
                  <span className="flex-1 text-gray-800">{r.label}</span>
                  <span className="font-mono font-semibold text-[#141414]">{fmt(r.montant)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 bg-[#c9a96e] text-[#0d0d0d] rounded-lg px-4 py-3 flex items-center justify-between font-bold">
            <span className="text-sm">
              <span className="font-mono mr-2">DZ</span>TOTAL GÉNÉRAL PASSIF
            </span>
            <span className="font-mono">{fmt(totalPassif)} FCFA</span>
          </div>
        </div>
      )}

      {/* Equilibre indicator */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          balanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {balanced ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Bilan équilibré · Actif = Passif = {fmt(totalActifNet)} FCFA
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Écart : {fmt(equilibre)} FCFA
              </span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-white/50 rounded"
        >
          Fermer la démo
        </button>
      </div>
    </div>
  )
}

export default InteractiveLiasseDemo
