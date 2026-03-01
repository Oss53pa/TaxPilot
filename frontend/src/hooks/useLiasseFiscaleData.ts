/**
 * useLiasseFiscaleData — Hook partage pour charger les donnees de la liasse fiscale
 * depuis localStorage (entreprise, balance N, balance N-1, regime).
 *
 * Utilise par:
 *  - modules/liasse-fiscale/index.tsx  (module liasse)
 *  - components/liasse/templates/PageRenderer.tsx  (module templates)
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { EntrepriseData, BalanceEntry, RegimeImposition } from '@/modules/liasse-fiscale/types'

// ── EMPTY_ENTREPRISE ──

export const EMPTY_ENTREPRISE: EntrepriseData = {
  denomination: '', sigle: '', adresse: '', ncc: '', ntd: '',
  exercice_clos: '', exercice_precedent_fin: '', duree_mois: 12,
  regime: '', forme_juridique: '', code_forme_juridique: '',
  code_regime: '', code_pays: '', centre_depot: '', ville: '',
  boite_postale: '', capital_social: 0, nom_dirigeant: '',
  fonction_dirigeant: '', greffe: '', numero_repertoire_entites: '',
  numero_caisse_sociale: '', numero_code_importateur: '',
  code_ville: '', pourcentage_capacite_production: 0,
  branche_activite: '', code_secteur: '', nombre_etablissements: 0,
  effectif_permanent: 0, effectif_temporaire: 0,
  effectif_debut: 0, effectif_fin: 0, masse_salariale: 0,
  nom_groupe: '', pays_siege_groupe: '',
  cac_nom: '', cac_adresse: '', cac_numero_inscription: '',
  expert_nom: '', expert_adresse: '', expert_numero_inscription: '',
  personne_contact: '', etats_financiers_approuves: false,
  date_signature_etats: '', domiciliations_bancaires: [],
  dirigeants: [], commissaires_comptes: [], participations_filiales: [],
}

// ── Loading helpers ──

export const loadEntreprise = (): EntrepriseData => {
  const keys = ['fiscasync_entreprise_settings', 'fiscasync_db_entreprise_settings']
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const e = Array.isArray(parsed) ? parsed[0] : parsed
      if (!e) continue
      console.log(`[Liasse] Entreprise loaded from "${key}"`, e.raison_sociale || e.denomination || '(sans nom)')
      return {
        denomination: e.raison_sociale || e.denomination || '',
        sigle: e.sigle || '',
        adresse: [e.adresse_ligne1, e.adresse_ligne2, e.ville].filter(Boolean).join(' - '),
        ncc: e.numero_contribuable || '',
        ntd: e.numero_teledeclarant || '',
        exercice_clos: e.exercice_fin || e.date_arrete_comptes || '',
        exercice_precedent_fin: e.exercice_precedent_fin || '',
        duree_mois: e.duree_exercice_precedent || 12,
        regime: e.regime_imposition || 'Reel normal',
        forme_juridique: e.forme_juridique || '',
        code_forme_juridique: e.code_forme_juridique || '01',
        code_regime: e.code_regime || '1',
        code_pays: e.code_pays || '03',
        centre_depot: e.centre_impots || '',
        ville: e.ville || '',
        boite_postale: e.boite_postale || '',
        capital_social: e.capital_social || 0,
        nom_dirigeant: e.nom_dirigeant || '',
        fonction_dirigeant: e.fonction_dirigeant || '',
        greffe: e.greffe || '',
        numero_repertoire_entites: e.numero_repertoire_entites || '',
        numero_caisse_sociale: e.numero_caisse_sociale || '',
        numero_code_importateur: e.numero_code_importateur || '',
        code_ville: e.code_ville || '',
        pourcentage_capacite_production: e.pourcentage_capacite_production || 0,
        branche_activite: e.branche_activite || '',
        code_secteur: e.code_secteur || '',
        nombre_etablissements: e.nombre_etablissements || 0,
        effectif_permanent: e.effectif_permanent || 0,
        effectif_temporaire: e.effectif_temporaire || 0,
        effectif_debut: e.effectif_debut || 0,
        effectif_fin: e.effectif_fin || 0,
        masse_salariale: e.masse_salariale || 0,
        nom_groupe: e.nom_groupe || '',
        pays_siege_groupe: e.pays_siege_groupe || '',
        cac_nom: e.cac_nom || '',
        cac_adresse: e.cac_adresse || '',
        cac_numero_inscription: e.cac_numero_inscription || '',
        expert_nom: e.expert_nom || '',
        expert_adresse: e.expert_adresse || '',
        expert_numero_inscription: e.expert_numero_inscription || '',
        personne_contact: e.personne_contact || '',
        etats_financiers_approuves: e.etats_financiers_approuves || false,
        date_signature_etats: e.date_signature_etats || '',
        domiciliations_bancaires: e.domiciliations_bancaires || [],
        dirigeants: e.dirigeants || [],
        commissaires_comptes: e.commissaires_comptes || [],
        participations_filiales: e.participations_filiales || [],
      }
    } catch { /* try next key */ }
  }
  console.warn('[Liasse] Aucune donnee entreprise trouvee dans localStorage')
  return EMPTY_ENTREPRISE
}

export const parseEntries = (entries: unknown[]): BalanceEntry[] =>
  entries.map((item: unknown) => {
    const e = item as Record<string, unknown>
    return {
      compte: String(e.compte || ''),
      libelle: String(e.intitule || e.libelle || e.libelle_compte || ''),
      debit: Number(e.debit) || 0,
      credit: Number(e.credit) || 0,
      solde_debit: Number(e.solde_debit) || 0,
      solde_credit: Number(e.solde_credit) || 0,
    }
  })

export const loadBalanceN1 = (): BalanceEntry[] => {
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest_n1')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entries) && stored.entries.length > 0) {
        console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_latest_n1": ${stored.entries.length} comptes`)
        return parseEntries(stored.entries)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_latest')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entriesN1) && stored.entriesN1.length > 0) {
        console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_latest.entriesN1": ${stored.entriesN1.length} comptes`)
        return parseEntries(stored.entriesN1)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_list')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 1) {
        const entries = list[1]?.entries
        if (Array.isArray(entries) && entries.length > 0) {
          console.log(`[Liasse] Balance N-1 loaded from "fiscasync_balance_list[1]": ${entries.length} comptes`)
          return parseEntries(entries)
        }
      }
    }
  } catch { /* ignore */ }

  console.warn('[Liasse] Aucune balance N-1 trouvee')
  return []
}

export const loadBalance = (): BalanceEntry[] => {
  try {
    const raw = localStorage.getItem('fiscasync_balance_latest')
    if (raw) {
      const stored = JSON.parse(raw)
      if (Array.isArray(stored?.entries) && stored.entries.length > 0) {
        console.log(`[Liasse] Balance loaded from "fiscasync_balance_latest": ${stored.entries.length} comptes`)
        return parseEntries(stored.entries)
      }
    }
  } catch { /* try next */ }

  try {
    const raw = localStorage.getItem('fiscasync_balance_list')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        const entries = list[0]?.entries
        if (Array.isArray(entries) && entries.length > 0) {
          console.log(`[Liasse] Balance loaded from "fiscasync_balance_list[0]": ${entries.length} comptes`)
          return parseEntries(entries)
        }
      }
    }
  } catch { /* try next */ }

  console.warn('[Liasse] Aucune balance trouvee dans localStorage. Importez votre balance via le menu Import.')
  return []
}

export const detectRegime = (entreprise: EntrepriseData): RegimeImposition => {
  const r = (entreprise.regime || '').toLowerCase()
  if (r.includes('simplif') || r.includes('allege') || r.includes('alleg')) return 'REEL_SIMPLIFIE'
  if (r.includes('forfait')) return 'FORFAITAIRE'
  if (r.includes('micro')) return 'MICRO_ENTREPRISE'
  if (r.includes('smt') || r.includes('minimal')) return 'SMT'
  return 'REEL_NORMAL'
}

// ── Hook ──

export interface LiasseFiscaleData {
  entreprise: EntrepriseData
  balance: BalanceEntry[]
  balanceN1: BalanceEntry[]
  regime: RegimeImposition
  setRegime: (r: RegimeImposition) => void
  refresh: () => void
}

export function useLiasseFiscaleData(): LiasseFiscaleData {
  const [entreprise, setEntreprise] = useState<EntrepriseData>(EMPTY_ENTREPRISE)
  const [balance, setBalance] = useState<BalanceEntry[]>([])
  const [balanceN1, setBalanceN1] = useState<BalanceEntry[]>([])
  const [regime, setRegime] = useState<RegimeImposition>('REEL_NORMAL')

  const initialLoadDone = React.useRef(false)

  const refresh = useCallback(() => {
    const ent = loadEntreprise()
    const bal = loadBalance()
    const balN1 = loadBalanceN1()
    setEntreprise(ent)
    setBalance(bal)
    setBalanceN1(balN1)
    // Only auto-detect regime on initial load, not on focus refresh
    // (user may have manually selected a different regime)
    if (!initialLoadDone.current) {
      setRegime(detectRegime(ent))
      initialLoadDone.current = true
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entreprise, balance, balanceN1, regime, setRegime, refresh }
}
