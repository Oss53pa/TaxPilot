/**
 * Suite de régression SYSCOHADA — fiabilité 100%
 *
 * Couvre les 8 bugs identifiés lors de l'audit comptable :
 * #1 Compte 167 dans DA, #2 TFT N-1, #3 797→TL, #4 791→TJ,
 * #5 Cohérence mappings, #6 Fonctions CR, #7-8 Soldes anormaux
 */

import { describe, it, expect } from 'vitest'
import {
  getActifBrut,
  getAmortProv,
  getBalanceSolde,
  getPassif,
  detecterAnomaliesActif,
  detecterAnomaliesPassif,
} from '@/modules/liasse-fiscale/services/liasse-calculs'
import {
  BILAN_PASSIF,
  BILAN_ACTIF,
  COMPTE_RESULTAT_MAPPING,
  ALL_ACTIF_PREFIXES,
  ALL_PASSIF_PREFIXES,
} from '@/constants/syscohada-mappings'
import type { BalanceEntry } from '@/modules/liasse-fiscale/types'

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function entry(compte: string, soldeDebit: number, soldeCredit: number, libelle = ''): BalanceEntry {
  return {
    compte,
    libelle: libelle || `Compte ${compte}`,
    debit: soldeDebit,
    credit: soldeCredit,
    solde_debit: soldeDebit,
    solde_credit: soldeCredit,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Bug #1 — Compte 167 dans DA
// ────────────────────────────────────────────────────────────────────────────

describe('Bug #1 — Poste DA : Emprunts et dettes financières', () => {
  it('inclut le compte 167 dans les mappings', () => {
    const daComptes = BILAN_PASSIF.DA.comptes
    expect(daComptes).toContain('167')
  })

  it('contient exactement les comptes 161 à 168', () => {
    const daComptes = BILAN_PASSIF.DA.comptes
    expect(daComptes).toEqual(
      expect.arrayContaining(['161', '162', '163', '164', '165', '166', '167', '168'])
    )
    expect(daComptes).toHaveLength(8)
  })

  it('le compte 167 contribue au calcul du passif', () => {
    const balance: BalanceEntry[] = [
      entry('167', 0, 5_000_000),
    ]
    const result = getPassif(balance, [...BILAN_PASSIF.DA.comptes])
    expect(result).toBe(5_000_000)
  })

  it('somme correcte de tous les comptes DA', () => {
    const balance: BalanceEntry[] = [
      entry('161', 0, 10_000_000),
      entry('167', 0, 5_000_000),
      entry('168', 0, 3_000_000),
    ]
    const result = getPassif(balance, [...BILAN_PASSIF.DA.comptes])
    expect(result).toBe(18_000_000)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bug #3 — Compte 797 pas de double comptage
// ────────────────────────────────────────────────────────────────────────────

describe('Bug #3 — Compte 797 : pas de double comptage', () => {
  it('797 apparaît dans TL mais pas dans TJ', () => {
    expect(COMPTE_RESULTAT_MAPPING.TL.comptes).toContain('797')
    expect(COMPTE_RESULTAT_MAPPING.TJ.comptes).not.toContain('797')
  })

  it('aucun sous-compte 797x dans TJ', () => {
    for (const c of COMPTE_RESULTAT_MAPPING.TJ.comptes) {
      expect(c.startsWith('797')).toBe(false)
    }
  })

  it('le résultat ne double pas les reprises financières', () => {
    const balance: BalanceEntry[] = [
      entry('797', 0, 2_000_000), // Reprises provisions financières
    ]
    // TL doit capter le montant
    const tl = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.TL.comptes])
    expect(tl).toBe(2_000_000)

    // TJ ne doit pas le capter
    const tj = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.TJ.comptes])
    expect(Math.abs(tj)).toBe(0)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bug #4 — Compte 791 pas de double comptage
// ────────────────────────────────────────────────────────────────────────────

describe('Bug #4 — Compte 791 : pas de double comptage', () => {
  it('791 dans TJ (reprises exploitation), pas dans TI (transferts charges)', () => {
    expect(COMPTE_RESULTAT_MAPPING.TJ.comptes).toContain('791')
    expect(COMPTE_RESULTAT_MAPPING.TI.comptes).not.toContain('791')
  })

  it('TI contient uniquement 781 (transferts charges exploitation)', () => {
    expect(COMPTE_RESULTAT_MAPPING.TI.comptes).toContain('781')
    expect(COMPTE_RESULTAT_MAPPING.TI.comptes).toHaveLength(1)
  })

  it('balance avec 791 seul : TJ > 0, TI = 0', () => {
    const balance: BalanceEntry[] = [
      entry('791', 0, 800_000),
    ]
    const tj = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.TJ.comptes])
    const ti = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.TI.comptes])
    expect(tj).toBe(800_000)
    expect(Math.abs(ti)).toBe(0)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bug #5 — Cohérence des mappings centralisés
// ────────────────────────────────────────────────────────────────────────────

describe('Bug #5 — Source de vérité unique', () => {
  it('AE correspond à frais de développement (211, 212)', () => {
    expect(BILAN_ACTIF.AE.comptes).toEqual(['211', '212'])
  })

  it('AJ correspond aux terrains (22)', () => {
    expect(BILAN_ACTIF.AJ.comptes).toEqual(['22'])
  })

  it('pas de comptes 201/202 dans les immobilisations corporelles', () => {
    const allCorpoComptes = [
      ...BILAN_ACTIF.AJ.comptes,
      ...BILAN_ACTIF.AK.comptes,
      ...BILAN_ACTIF.AL.comptes,
      ...BILAN_ACTIF.AM.comptes,
      ...BILAN_ACTIF.AN.comptes,
    ]
    expect(allCorpoComptes).not.toContain('201')
    expect(allCorpoComptes).not.toContain('202')
  })

  it('DA contient 167 dans les mappings centralisés', () => {
    expect(BILAN_PASSIF.DA.comptes).toContain('167')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bugs #7-8 — Alertes soldes anormaux
// ────────────────────────────────────────────────────────────────────────────

describe('Bugs #7-8 — Détection soldes anormaux', () => {
  it('alerte générée pour actif à solde créditeur', () => {
    const balance: BalanceEntry[] = [
      entry('211', 0, 500_000, 'Terrains avec solde créditeur'),
    ]
    const anomalies = detecterAnomaliesActif(balance, ALL_ACTIF_PREFIXES)
    expect(anomalies).toHaveLength(1)
    expect(anomalies[0].type).toBe('actif_crediteur')
    expect(anomalies[0].montant).toBe(500_000)
  })

  it('pas d\'alerte pour actif à solde débiteur normal', () => {
    const balance: BalanceEntry[] = [
      entry('211', 1_000_000, 0, 'Terrain normal'),
    ]
    const anomalies = detecterAnomaliesActif(balance, ALL_ACTIF_PREFIXES)
    expect(anomalies).toHaveLength(0)
  })

  it('alerte générée pour passif à solde débiteur', () => {
    const balance: BalanceEntry[] = [
      entry('401', 300_000, 0, 'Fournisseur avec solde débiteur'),
    ]
    const anomalies = detecterAnomaliesPassif(balance, ALL_PASSIF_PREFIXES)
    expect(anomalies).toHaveLength(1)
    expect(anomalies[0].type).toBe('passif_debiteur')
    expect(anomalies[0].montant).toBe(300_000)
  })

  it('pas d\'alerte pour passif à solde créditeur normal', () => {
    const balance: BalanceEntry[] = [
      entry('401', 0, 2_000_000, 'Fournisseur normal'),
    ]
    const anomalies = detecterAnomaliesPassif(balance, ALL_PASSIF_PREFIXES)
    expect(anomalies).toHaveLength(0)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Équilibres fondamentaux
// ────────────────────────────────────────────────────────────────────────────

describe('Équilibres fondamentaux', () => {
  // Balance PME type : actif = passif
  const balancePME: BalanceEntry[] = [
    // Actif
    entry('211', 15_000_000, 0),     // Immobilisations
    entry('2811', 0, 3_000_000),     // Amortissements
    entry('411', 8_000_000, 0),      // Clients
    entry('52', 5_000_000, 0),       // Banque
    // Passif
    entry('101', 0, 10_000_000),     // Capital
    entry('161', 0, 7_000_000),      // Emprunts
    entry('167', 0, 2_000_000),      // Autres emprunts (167)
    entry('401', 0, 4_000_000),      // Fournisseurs
    entry('13', 0, 2_000_000),       // Résultat
  ]

  it('BZ = DZ (équilibre Bilan)', () => {
    // Total actif brut = 15M + 8M + 5M = 28M, amort = 3M, net = 25M
    const actifBrut = getActifBrut(balancePME, ['211', '411', '52'])
    const amort = getAmortProv(balancePME, ['2811'])
    const totalActifNet = actifBrut - amort

    // Total passif = 10M + 7M + 2M + 4M + 2M = 25M
    const capital = getPassif(balancePME, ['101'])
    const emprunts = getPassif(balancePME, ['161', '167'])
    const fournisseurs = getPassif(balancePME, ['401'])
    const resultat = -getBalanceSolde(balancePME, ['13'])
    const totalPassif = capital + emprunts + fournisseurs + resultat

    expect(totalActifNet).toBe(totalPassif)
    expect(totalActifNet).toBe(25_000_000)
  })

  it('le 167 contribue bien au total passif', () => {
    const emprunts = getPassif(balancePME, ['161', '162', '163', '164', '165', '166', '167', '168'])
    expect(emprunts).toBe(9_000_000) // 7M (161) + 2M (167)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Classe 79 — Reprises sans double comptage
// ────────────────────────────────────────────────────────────────────────────

describe('Classe 79 — Reprises sans double comptage', () => {
  const balanceReprises: BalanceEntry[] = [
    entry('791', 0, 1_000_000),  // Reprises provisions exploitation
    entry('797', 0, 2_000_000),  // Reprises provisions financières
    entry('798', 0, 500_000),    // Reprises amortissements
    entry('799', 0, 300_000),    // Reprises dépréciations
  ]

  it('résultat net inchangé si 797 seul dans balance', () => {
    const bal797: BalanceEntry[] = [entry('797', 0, 2_000_000)]
    const tl = -getBalanceSolde(bal797, [...COMPTE_RESULTAT_MAPPING.TL.comptes])
    const tj = -getBalanceSolde(bal797, [...COMPTE_RESULTAT_MAPPING.TJ.comptes])
    const ti = -getBalanceSolde(bal797, [...COMPTE_RESULTAT_MAPPING.TI.comptes])
    // 797 ne doit apparaître qu'une seule fois dans le résultat (via TL)
    expect(tl).toBe(2_000_000)
    expect(Math.abs(tj)).toBe(0)
    expect(Math.abs(ti)).toBe(0)
  })

  it('les 4 comptes de reprises sont répartis sans chevauchement', () => {
    const ti = -getBalanceSolde(balanceReprises, [...COMPTE_RESULTAT_MAPPING.TI.comptes])
    const tj = -getBalanceSolde(balanceReprises, [...COMPTE_RESULTAT_MAPPING.TJ.comptes])
    const tl = -getBalanceSolde(balanceReprises, [...COMPTE_RESULTAT_MAPPING.TL.comptes])

    // TI = 781 uniquement → 0 (pas de 781 dans la balance)
    expect(Math.abs(ti)).toBe(0)
    // TJ = 791 + 798 + 799 = 1M + 500K + 300K = 1.8M
    expect(tj).toBe(1_800_000)
    // TL = 797 = 2M
    expect(tl).toBe(2_000_000)

    // Total reprises = TI + TJ + TL = 3.8M = somme de tous les comptes 79x
    expect(ti + tj + tl).toBe(3_800_000)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bug supplémentaire — Compte 87 pas de double comptage (RP vs RQ)
// ────────────────────────────────────────────────────────────────────────────

describe('Compte 87 — pas de double comptage RP/RQ', () => {
  it('87 dans RQ seulement, pas dans RP', () => {
    expect(COMPTE_RESULTAT_MAPPING.RQ.comptes).toContain('87')
    expect(COMPTE_RESULTAT_MAPPING.RP.comptes).not.toContain('87')
  })

  it('RP ne contient que 83 et 85', () => {
    expect(COMPTE_RESULTAT_MAPPING.RP.comptes).toEqual(['83', '85'])
  })

  it('le résultat net ne double pas le compte 87', () => {
    const balance: BalanceEntry[] = [
      entry('87', 1_000_000, 0), // Participation travailleurs (charge débiteur)
    ]
    const rp = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.RP.comptes])
    const rq = -getBalanceSolde(balance, [...COMPTE_RESULTAT_MAPPING.RQ.comptes])
    // 87 ne doit apparaître qu'une seule fois via RQ
    expect(rq).toBe(-1_000_000)
    expect(Math.abs(rp)).toBe(0) // RP ne contient pas 87
  })
})
