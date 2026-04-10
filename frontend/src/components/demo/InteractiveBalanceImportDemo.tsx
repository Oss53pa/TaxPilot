/**
 * Démo interactive : Import d'une balance SYSCOHADA
 * Simule l'import CSV avec détection automatique du format,
 * mapping des comptes et validation en temps réel.
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  Upload, CheckCircle, AlertTriangle, FileSpreadsheet, Play,
  Database, Link2, Sparkles, RotateCcw,
} from 'lucide-react'

interface BalanceLine {
  compte: string
  libelle: string
  sdOuverture: number
  scOuverture: number
  mvtDebit: number
  mvtCredit: number
  sdCloture: number
  scCloture: number
  mapped: boolean
}

const SAMPLE_BALANCE: BalanceLine[] = [
  { compte: '101000', libelle: 'Capital social', sdOuverture: 0, scOuverture: 50000000, mvtDebit: 0, mvtCredit: 10000000, sdCloture: 0, scCloture: 60000000, mapped: true },
  { compte: '121000', libelle: 'Report à nouveau créditeur', sdOuverture: 0, scOuverture: 12500000, mvtDebit: 0, mvtCredit: 3200000, sdCloture: 0, scCloture: 15700000, mapped: true },
  { compte: '215000', libelle: 'Matériel de transport', sdOuverture: 18000000, scOuverture: 0, mvtDebit: 5500000, mvtCredit: 0, sdCloture: 23500000, scCloture: 0, mapped: true },
  { compte: '244000', libelle: 'Matériel et mobilier de bureau', sdOuverture: 6200000, scOuverture: 0, mvtDebit: 1800000, mvtCredit: 0, sdCloture: 8000000, scCloture: 0, mapped: true },
  { compte: '311000', libelle: 'Marchandises', sdOuverture: 14500000, scOuverture: 0, mvtDebit: 22000000, mvtCredit: 18500000, sdCloture: 18000000, scCloture: 0, mapped: true },
  { compte: '411000', libelle: 'Clients', sdOuverture: 32000000, scOuverture: 0, mvtDebit: 45000000, mvtCredit: 38000000, sdCloture: 39000000, scCloture: 0, mapped: true },
  { compte: '521000', libelle: 'Banques locales', sdOuverture: 8200000, scOuverture: 0, mvtDebit: 125000000, mvtCredit: 118500000, sdCloture: 14700000, scCloture: 0, mapped: true },
  { compte: '601000', libelle: 'Achats de marchandises', sdOuverture: 0, scOuverture: 0, mvtDebit: 92000000, mvtCredit: 0, sdCloture: 92000000, scCloture: 0, mapped: true },
  { compte: '701000', libelle: 'Ventes de marchandises', sdOuverture: 0, scOuverture: 0, mvtDebit: 0, mvtCredit: 168000000, sdCloture: 0, scCloture: 168000000, mapped: true },
  { compte: '661000', libelle: 'Charges de personnel', sdOuverture: 0, scOuverture: 0, mvtDebit: 28000000, mvtCredit: 0, sdCloture: 28000000, scCloture: 0, mapped: true },
  { compte: '445660', libelle: 'TVA déductible sur immobilisations', sdOuverture: 0, scOuverture: 0, mvtDebit: 1314000, mvtCredit: 0, sdCloture: 1314000, scCloture: 0, mapped: true },
  { compte: '443100', libelle: 'TVA collectée 18%', sdOuverture: 0, scOuverture: 0, mvtDebit: 0, mvtCredit: 30240000, sdCloture: 0, scCloture: 30240000, mapped: true },
  { compte: '489500', libelle: 'Compte non SYSCOHADA (atypique)', sdOuverture: 0, scOuverture: 0, mvtDebit: 150000, mvtCredit: 0, sdCloture: 150000, scCloture: 0, mapped: false },
]

type ImportStep = 'idle' | 'uploading' | 'parsing' | 'mapping' | 'validation' | 'done'

const fmt = (n: number): string => n.toLocaleString('fr-FR') + ' FCFA'

const InteractiveBalanceImportDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<ImportStep>('idle')
  const [progress, setProgress] = useState(0)
  const [linesDetected, setLinesDetected] = useState(0)
  const [filename] = useState('balance_sarl_akwaba_2025.csv')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const runImport = () => {
    setStep('uploading')
    setProgress(0)
    setLinesDetected(0)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4
        if (next >= 25 && prev < 25) setStep('parsing')
        if (next >= 55 && prev < 55) setStep('mapping')
        if (next >= 85 && prev < 85) setStep('validation')
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          setStep('done')
          return 100
        }
        return next
      })
      setLinesDetected((prev) => Math.min(prev + 1, SAMPLE_BALANCE.length))
    }, 180)
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setStep('idle')
    setProgress(0)
    setLinesDetected(0)
  }

  const totalDebit = SAMPLE_BALANCE.reduce((s, l) => s + l.mvtDebit, 0)
  const totalCredit = SAMPLE_BALANCE.reduce((s, l) => s + l.mvtCredit, 0)
  const mappedCount = SAMPLE_BALANCE.filter((l) => l.mapped).length
  const unmappedCount = SAMPLE_BALANCE.length - mappedCount

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Démo interactive</strong> — Cliquez sur &laquo;&nbsp;Lancer l&apos;import&nbsp;&raquo; pour voir
          Liass&apos;Pilot détecter le format, mapper vos comptes sur le plan SYSCOHADA révisé et valider la cohérence.
        </div>
      </div>

      {/* File card */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141414]">{filename}</p>
            <p className="text-xs text-gray-500">SYSCOHADA révisé · CSV · {SAMPLE_BALANCE.length} lignes · 4,2 Ko</p>
          </div>
        </div>
        {step === 'idle' && (
          <button
            onClick={runImport}
            className="px-5 py-2.5 bg-[#141414] text-white rounded-lg text-sm font-semibold hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Lancer l&apos;import
          </button>
        )}
        {step === 'done' && (
          <button
            onClick={reset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Rejouer
          </button>
        )}
      </div>

      {/* Idle illustration */}
      {step === 'idle' && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <Upload className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-[#141414] mb-1">Prêt à importer votre balance</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Formats reconnus : CSV, XLSX, TXT. Détection automatique du séparateur, du format des nombres et du plan
            comptable SYSCOHADA (1 005 comptes référencés).
          </p>
        </div>
      )}

      {/* Running steps */}
      {(step === 'uploading' || step === 'parsing' || step === 'mapping' || step === 'validation') && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-[#141414]">
                {step === 'uploading' && 'Téléversement du fichier...'}
                {step === 'parsing' && 'Analyse CSV & détection du séparateur...'}
                {step === 'mapping' && 'Mapping SYSCOHADA (1 005 comptes)...'}
                {step === 'validation' && 'Validation débit / crédit...'}
              </span>
              <span className="text-gray-500 font-mono text-xs">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#141414] h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Streaming line preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Lignes détectées</span>
              <span className="font-mono">{linesDetected} / {SAMPLE_BALANCE.length}</span>
            </div>
            <div className="max-h-44 overflow-y-auto text-xs divide-y divide-gray-100">
              {SAMPLE_BALANCE.slice(0, linesDetected).map((line) => (
                <div key={line.compte} className="flex items-center gap-2 px-3 py-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                  <span className="font-mono text-gray-400 w-16">{line.compte}</span>
                  <span className="flex-1 truncate text-gray-700">{line.libelle}</span>
                  <span className="font-mono text-gray-500 text-[10px]">
                    {fmt(Math.max(line.sdCloture, line.scCloture))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Done results */}
      {step === 'done' && (
        <div className="space-y-4">
          {/* KPI */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <Database className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-[10px] text-green-600 font-medium">Lignes importées</p>
              <p className="text-lg font-bold text-green-800">{SAMPLE_BALANCE.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <Link2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-[10px] text-blue-600 font-medium">Comptes mappés</p>
              <p className="text-lg font-bold text-blue-800">{mappedCount}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <AlertTriangle className="w-4 h-4 text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-orange-600 font-medium">À vérifier</p>
              <p className="text-lg font-bold text-orange-800">{unmappedCount}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <CheckCircle className="w-4 h-4 text-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600 font-medium">Équilibre</p>
              <p className="text-lg font-bold text-gray-900">
                {totalDebit === totalCredit ? '✓' : '≠'}
              </p>
            </div>
          </div>

          {/* Table preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#141414]">Aperçu de la balance</span>
              <span className="text-[10px] text-gray-500">SARL AKWABA · Exercice 2025</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="px-2 py-1.5">Compte</th>
                    <th className="px-2 py-1.5">Libellé</th>
                    <th className="px-2 py-1.5 text-right">Mvt Débit</th>
                    <th className="px-2 py-1.5 text-right">Mvt Crédit</th>
                    <th className="px-2 py-1.5 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SAMPLE_BALANCE.map((line) => (
                    <tr key={line.compte} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5 font-mono text-gray-700">{line.compte}</td>
                      <td className="px-2 py-1.5 text-gray-700">{line.libelle}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-gray-600">
                        {line.mvtDebit > 0 ? fmt(line.mvtDebit) : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono text-gray-600">
                        {line.mvtCredit > 0 ? fmt(line.mvtCredit) : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {line.mapped ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-medium">
                            <CheckCircle className="w-2.5 h-2.5" /> Mappé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[9px] font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" /> Manuel
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                    <td colSpan={2} className="px-2 py-2 text-right text-gray-600">TOTAUX MOUVEMENTS</td>
                    <td className="px-2 py-2 text-right font-mono text-blue-700">{fmt(totalDebit)}</td>
                    <td className="px-2 py-2 text-right font-mono text-green-700">{fmt(totalCredit)}</td>
                    <td className="px-2 py-2 text-center">
                      {totalDebit === totalCredit && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-[#141414] text-white rounded-lg text-sm font-semibold hover:bg-[#2a2a2a] flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Valider et passer à l&apos;audit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Fermer la démo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveBalanceImportDemo
