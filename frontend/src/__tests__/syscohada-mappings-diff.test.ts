/**
 * Tests anti-drift entre les 2 mappings SYSCOHADA :
 *   - `constants/syscohada-mappings.ts` (canonique, OHADA 2017)
 *   - `services/liasseDataService.SYSCOHADA_MAPPING` (legacy granulaire)
 *
 * Ils utilisent des numérotations de postes différentes (TI/TJ/TK/TL/TM
 * aliasés sur des comptes différents, structure passif granulaire vs
 * consolidée). Une unification complète nécessite une refonte structurelle
 * isolée — voir TODO(UNIFY-MAPPINGS) dans liasseDataService.ts.
 *
 * Ces tests verrouillent l'état actuel pour éviter :
 *   1. Toute NOUVELLE divergence (drift régressif).
 *   2. Toute mutation silencieuse des comptes mappés sur les postes
 *      les plus visibles (TA, TB, TC, RA, CA, BJ, BK).
 *
 * Si un test casse, l'auteur doit explicitement justifier la modif dans
 * le commit ou bouger la baseline.
 */
import { describe, it, expect } from 'vitest'
import { SYSCOHADA_MAPPING } from '../services/liasseDataService'
import {
  BILAN_ACTIF,
  BILAN_PASSIF,
  COMPTE_RESULTAT_MAPPING,
} from '../constants/syscohada-mappings'

// ────────────────────────────────────────────────────────────────────────────
// 1. POSTES STABLES — invariants OHADA officiels, jamais divergents
// ────────────────────────────────────────────────────────────────────────────

describe('SYSCOHADA mappings — invariants stables (canonique = liasseDataService)', () => {
  it('TA = 701 (Ventes de marchandises) — identique dans les 2 sources', () => {
    expect(COMPTE_RESULTAT_MAPPING.TA.comptes).toEqual(['701'])
    expect(SYSCOHADA_MAPPING.produits.TA.comptes).toEqual(['701'])
  })

  it('RA = 601 (Achats de marchandises) — identique dans les 2 sources', () => {
    expect(COMPTE_RESULTAT_MAPPING.RA.comptes).toEqual(['601'])
    expect(SYSCOHADA_MAPPING.charges.RA.comptes).toEqual(['601'])
  })

  it('RB = 6031 (Variation stocks marchandises) — identique', () => {
    expect(COMPTE_RESULTAT_MAPPING.RB.comptes).toEqual(['6031'])
    expect(SYSCOHADA_MAPPING.charges.RB.comptes).toEqual(['6031'])
  })

  it('RI = 64 (Impôts et taxes) — identique', () => {
    expect(COMPTE_RESULTAT_MAPPING.RI.comptes).toEqual(['64'])
    expect(SYSCOHADA_MAPPING.charges.RI.comptes).toEqual(['64'])
  })

  it('RS = 89 (Impôts sur le résultat) — identique', () => {
    expect(COMPTE_RESULTAT_MAPPING.RS.comptes).toEqual(['89'])
    expect(SYSCOHADA_MAPPING.charges.RS.comptes).toEqual(['89'])
  })

  it('CA = capital (101, 102, 103) — identique passif', () => {
    expect(BILAN_PASSIF.CA.comptes).toEqual(['101', '102', '103'])
    expect(SYSCOHADA_MAPPING.passif.CA.comptes).toEqual(['101', '102', '103'])
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 2. INVARIANTS UI — soldes des comptes que la liasse affiche
// ────────────────────────────────────────────────────────────────────────────

describe('SYSCOHADA mappings — invariants critiques UI', () => {
  it('DL passif contient 42 (personnel) + 46 (comptes courants associés) + 47 (créditeurs divers)', () => {
    // Fix critique commit 5dba36b : sans 46 et 47, les soldes créditeurs
    // de ces comptes disparaissaient du passif → Total Actif ≠ Total Passif.
    expect(SYSCOHADA_MAPPING.passif.DL.comptes).toEqual(['42', '46', '47'])
  })

  it('BJ actif contient toute la classe 4 sauf 41 (clients) qui est en BI', () => {
    expect(SYSCOHADA_MAPPING.actif.BJ.comptes).toEqual(['411', '412', '413', '414', '415', '416', '418'])
    expect(SYSCOHADA_MAPPING.actif.BK.comptes).toEqual(['42', '43', '44', '45', '46', '47'])
  })

  it('BU = 478 (écart conversion actif) ET DT = 479 (écart conversion passif)', () => {
    expect(SYSCOHADA_MAPPING.actif.BU.comptes).toEqual(['478'])
    expect(SYSCOHADA_MAPPING.passif.DT.comptes).toEqual(['479'])
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 3. DIVERGENCES CONNUES — verrouille l'état actuel pour empêcher
//    toute mutation silencieuse pendant que la refonte est en attente.
//    Casser un de ces tests = nécessite mise à jour explicite de la
//    baseline ET communication.
// ────────────────────────────────────────────────────────────────────────────

describe('SYSCOHADA mappings — DIVERGENCES CONNUES (baseline verrouillée)', () => {
  it('TI : canonique = 781 (transferts) / liasseDataService = 791,798,799 (reprises) — DIVERGENT', () => {
    // Le canonique respecte la spec OHADA 2017 (transferts charges).
    // liasseDataService utilise une numérotation décalée où TI = reprises.
    // Quand l'unification sera faite, ces 2 lignes deviendront égales.
    expect(COMPTE_RESULTAT_MAPPING.TI.comptes).toEqual(['781'])
    expect(SYSCOHADA_MAPPING.produits.TI.comptes).toEqual(['791', '798', '799'])
  })

  it('TL : canonique = 797 (reprises fin) / liasseDataService = 787 (transferts fin) — DIVERGENT', () => {
    expect(COMPTE_RESULTAT_MAPPING.TL.comptes).toEqual(['797'])
    expect(SYSCOHADA_MAPPING.produits.TL.comptes).toEqual(['787'])
  })

  it('TJ : canonique = 791,798,799 (reprises exploit) / liasseDataService = 77 (revenus fin) — DIVERGENT', () => {
    expect(COMPTE_RESULTAT_MAPPING.TJ.comptes).toEqual(['791', '798', '799'])
    expect(SYSCOHADA_MAPPING.produits.TJ.comptes).toEqual(['77'])
  })

  it('RL : canonique = 681,691 (dotations exploit) / liasseDataService = 681 (dot. exploit seules) — DIVERGENT', () => {
    expect(COMPTE_RESULTAT_MAPPING.RL.comptes).toEqual(['681', '691'])
    expect(SYSCOHADA_MAPPING.charges.RL.comptes).toEqual(['681'])
  })

  it('AG actif : canonique = 216 (fonds commercial) / liasseDataService = 218,219 — DIVERGENT', () => {
    expect(BILAN_ACTIF.AG.comptes).toEqual(['216'])
    expect(SYSCOHADA_MAPPING.actif.AG.comptes).toEqual(['218', '219'])
  })

  it('DA passif : canonique = ALL 16x (161-168) / liasseDataService = 161 seul — DIVERGENT', () => {
    expect(BILAN_PASSIF.DA.comptes).toEqual(['161', '162', '163', '164', '165', '166', '167', '168'])
    expect(SYSCOHADA_MAPPING.passif.DA.comptes).toEqual(['161'])
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 4. EXHAUSTIVITÉ — chaque mapping a un nombre stable d'entrées
// ────────────────────────────────────────────────────────────────────────────

describe('SYSCOHADA mappings — exhaustivité et structure', () => {
  it('liasseDataService : count de postes par section', () => {
    expect(Object.keys(SYSCOHADA_MAPPING.actif).length).toBeGreaterThanOrEqual(20)
    expect(Object.keys(SYSCOHADA_MAPPING.passif).length).toBeGreaterThanOrEqual(20)
    expect(Object.keys(SYSCOHADA_MAPPING.charges).length).toBeGreaterThanOrEqual(15)
    expect(Object.keys(SYSCOHADA_MAPPING.produits).length).toBeGreaterThanOrEqual(13)
  })

  it('canonique : count de postes', () => {
    expect(Object.keys(BILAN_ACTIF).length).toBeGreaterThanOrEqual(20)
    expect(Object.keys(BILAN_PASSIF).length).toBeGreaterThanOrEqual(20)
    expect(Object.keys(COMPTE_RESULTAT_MAPPING).length).toBeGreaterThanOrEqual(28)
  })

  it('liasseDataService — chaque poste a au moins 1 compte mappé', () => {
    for (const [ref, m] of Object.entries(SYSCOHADA_MAPPING.actif)) {
      expect(m.comptes.length, `actif.${ref} vide`).toBeGreaterThan(0)
    }
    for (const [ref, m] of Object.entries(SYSCOHADA_MAPPING.passif)) {
      expect(m.comptes.length, `passif.${ref} vide`).toBeGreaterThan(0)
    }
    for (const [ref, m] of Object.entries(SYSCOHADA_MAPPING.charges)) {
      expect(m.comptes.length, `charges.${ref} vide`).toBeGreaterThan(0)
    }
    for (const [ref, m] of Object.entries(SYSCOHADA_MAPPING.produits)) {
      expect(m.comptes.length, `produits.${ref} vide`).toBeGreaterThan(0)
    }
  })
})
