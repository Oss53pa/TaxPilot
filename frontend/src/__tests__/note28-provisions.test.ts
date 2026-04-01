/**
 * Tests P1-2 : Note 28 — Dotations et provisions computed from balance
 *
 * Verifies that the Note 28 component correctly extracts:
 * - Opening balances from N-1 provision/depreciation accounts
 * - Dotations from P&L charge accounts (68x, 69x, 85x)
 * - Reprises from P&L income accounts (78x, 79x, 86x)
 * - Closing balances from N provision/depreciation accounts
 */
import { describe, it, expect } from 'vitest'
import {
  getCharges,
  getProduits,
  getPassif,
} from '../modules/liasse-fiscale/services/liasse-calculs'

import type { BalanceEntry } from '../modules/liasse-fiscale/types'

const mkEntry = (compte: string, debit: number, credit: number): BalanceEntry => ({
  compte,
  libelle: `Compte ${compte}`,
  debit,
  credit,
  solde_debit: debit,
  solde_credit: credit,
})

describe('Note 28 — Provisions & Depreciations', () => {
  // Balance N with provision accounts (credit side) and dotation/reprise P&L accounts
  const balanceN: BalanceEntry[] = [
    // Provision accounts (balance sheet — credit side = closing)
    mkEntry('151000', 0, 5_000_000),    // Provisions reglementees
    mkEntry('191000', 0, 3_000_000),    // Provisions financieres
    mkEntry('281000', 0, 12_000_000),   // Amort immobilisations corporelles
    mkEntry('291000', 0, 2_000_000),    // Depreciation immobilisations
    mkEntry('391000', 0, 1_500_000),    // Depreciation stocks
    mkEntry('491000', 0, 800_000),      // Depreciation clients
    mkEntry('590000', 0, 400_000),      // Depreciation titres placement

    // Dotation accounts (P&L — debit side)
    mkEntry('691100', 2_000_000, 0),    // Dotation provisions reglementees
    mkEntry('691200', 500_000, 0),      // Dotation provisions financieres (exploitation)
    mkEntry('697200', 300_000, 0),      // Dotation provisions financieres (financieres)
    mkEntry('681000', 4_000_000, 0),    // Dotation amort immobilisations (exploitation)
    mkEntry('691400', 1_000_000, 0),    // Dotation depreciation immobilisations (exploitation)
    mkEntry('659300', 600_000, 0),      // Dotation depreciation stocks
    mkEntry('659400', 200_000, 0),      // Dotation depreciation clients
    mkEntry('679500', 100_000, 0),      // Dotation depreciation titres (financieres)

    // Reprise accounts (P&L — credit side)
    mkEntry('791100', 0, 1_000_000),    // Reprise provisions reglementees
    mkEntry('791200', 0, 200_000),      // Reprise provisions financieres (exploitation)
    mkEntry('797200', 0, 150_000),      // Reprise provisions financieres (financieres)
    mkEntry('781000', 0, 2_000_000),    // Reprise amort immobilisations (exploitation)
    mkEntry('759300', 0, 300_000),      // Reprise depreciation stocks
    mkEntry('759400', 0, 100_000),      // Reprise depreciation clients
    mkEntry('779500', 0, 50_000),       // Reprise depreciation titres (financieres)
  ]

  // Balance N-1 for opening values
  const balanceN1: BalanceEntry[] = [
    mkEntry('151000', 0, 4_000_000),    // Provisions reglementees N-1
    mkEntry('191000', 0, 2_500_000),    // Provisions financieres N-1
    mkEntry('281000', 0, 10_000_000),   // Amort immobilisations N-1
    mkEntry('291000', 0, 1_500_000),    // Depreciation immobilisations N-1
    mkEntry('391000', 0, 1_200_000),    // Depreciation stocks N-1
    mkEntry('491000', 0, 700_000),      // Depreciation clients N-1
    mkEntry('590000', 0, 350_000),      // Depreciation titres N-1
  ]

  describe('Provisions reglementees (compte 15)', () => {
    it('extracts opening from N-1', () => {
      expect(getPassif(balanceN1, ['15'])).toBe(4_000_000)
    })

    it('extracts closing from N', () => {
      expect(getPassif(balanceN, ['15'])).toBe(5_000_000)
    })

    it('extracts dotation exploitation', () => {
      expect(getCharges(balanceN, ['6911'])).toBe(2_000_000)
    })

    it('extracts reprise exploitation', () => {
      expect(getProduits(balanceN, ['7911'])).toBe(1_000_000)
    })
  })

  describe('Provisions financieres (compte 19)', () => {
    it('extracts opening from N-1', () => {
      expect(getPassif(balanceN1, ['19'])).toBe(2_500_000)
    })

    it('extracts closing from N', () => {
      expect(getPassif(balanceN, ['19'])).toBe(3_000_000)
    })

    it('extracts dotation exploitation', () => {
      expect(getCharges(balanceN, ['6912', '6913'])).toBe(500_000)
    })

    it('extracts dotation financieres', () => {
      expect(getCharges(balanceN, ['6972'])).toBe(300_000)
    })

    it('extracts reprise exploitation', () => {
      expect(getProduits(balanceN, ['7912', '7913'])).toBe(200_000)
    })

    it('extracts reprise financieres', () => {
      expect(getProduits(balanceN, ['7972'])).toBe(150_000)
    })
  })

  describe('Depreciations immobilisations (comptes 28/29)', () => {
    it('extracts opening from N-1', () => {
      // 28 (10M) + 29 (1.5M) = 11.5M
      expect(getPassif(balanceN1, ['28', '29'])).toBe(11_500_000)
    })

    it('extracts closing from N', () => {
      // 28 (12M) + 29 (2M) = 14M
      expect(getPassif(balanceN, ['28', '29'])).toBe(14_000_000)
    })

    it('extracts dotation exploitation', () => {
      // 681 (4M) + 6914 (1M) = 5M
      expect(getCharges(balanceN, ['681', '6914'])).toBe(5_000_000)
    })

    it('extracts reprise exploitation', () => {
      // 781 (2M) + 7914 (0) = 2M
      expect(getProduits(balanceN, ['781', '7914'])).toBe(2_000_000)
    })
  })

  describe('Depreciations stocks (compte 39)', () => {
    it('extracts opening from N-1', () => {
      expect(getPassif(balanceN1, ['39'])).toBe(1_200_000)
    })

    it('extracts closing from N', () => {
      expect(getPassif(balanceN, ['39'])).toBe(1_500_000)
    })

    it('extracts dotation exploitation', () => {
      expect(getCharges(balanceN, ['6593'])).toBe(600_000)
    })

    it('extracts reprise exploitation', () => {
      expect(getProduits(balanceN, ['7593'])).toBe(300_000)
    })
  })

  describe('Depreciations clients (compte 491)', () => {
    it('extracts opening from N-1', () => {
      expect(getPassif(balanceN1, ['491'])).toBe(700_000)
    })

    it('extracts closing from N', () => {
      expect(getPassif(balanceN, ['491'])).toBe(800_000)
    })
  })

  describe('Depreciations titres placement (compte 59)', () => {
    it('extracts opening from N-1', () => {
      expect(getPassif(balanceN1, ['59'])).toBe(350_000)
    })

    it('extracts dotation financieres', () => {
      expect(getCharges(balanceN, ['6795'])).toBe(100_000)
    })

    it('extracts reprise financieres', () => {
      expect(getProduits(balanceN, ['7795'])).toBe(50_000)
    })
  })

  describe('Totals coherence', () => {
    it('total dotations exploitation = sum of all exploitation dotations', () => {
      const dotExpl = getCharges(balanceN, ['6911'])  // 2M
        + getCharges(balanceN, ['6912', '6913'])       // 500K
        + getCharges(balanceN, ['681', '6914'])         // 5M
        + getCharges(balanceN, ['6593'])                // 600K
        + getCharges(balanceN, ['6594'])                // 200K (clients)
      expect(dotExpl).toBe(8_300_000)
    })

    it('total reprises exploitation = sum of all exploitation reprises', () => {
      const repExpl = getProduits(balanceN, ['7911'])  // 1M
        + getProduits(balanceN, ['7912', '7913'])       // 200K
        + getProduits(balanceN, ['781', '7914'])         // 2M
        + getProduits(balanceN, ['7593'])                // 300K
        + getProduits(balanceN, ['7594'])                // 100K (clients)
      expect(repExpl).toBe(3_600_000)
    })

    it('opening + dotations - reprises approximates closing for provisions reglementees', () => {
      const ouv = getPassif(balanceN1, ['15'])
      const dot = getCharges(balanceN, ['6911'])
      const rep = getProduits(balanceN, ['7911'])
      const clo = getPassif(balanceN, ['15'])
      // 4M + 2M - 1M = 5M = closing
      expect(ouv + dot - rep).toBe(clo)
    })
  })
})
