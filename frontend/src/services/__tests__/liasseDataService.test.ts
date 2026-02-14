/**
 * Tests Unitaires - Service de Mapping Liasse Fiscale
 *
 * Teste le mapping automatique Balance → États financiers SYSCOHADA
 * et les validations de cohérence
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { liasseDataService, BalanceEntry, SYSCOHADA_MAPPING } from '../liasseDataService'

describe('LiasseDataService - Mapping SYSCOHADA', () => {
  // Balance de test
  const mockBalance: BalanceEntry[] = [
    // ACTIF - Immobilisations
    { compte: '211', intitule: 'Frais de R&D', debit: 50000, credit: 0, solde_debit: 50000, solde_credit: 0 },
    { compte: '2811', intitule: 'Amort Frais R&D', debit: 0, credit: 10000, solde_debit: 0, solde_credit: 10000 },
    { compte: '22', intitule: 'Terrains', debit: 200000, credit: 0, solde_debit: 200000, solde_credit: 0 },
    { compte: '231', intitule: 'Bâtiments', debit: 500000, credit: 0, solde_debit: 500000, solde_credit: 0 },
    { compte: '2831', intitule: 'Amort Bâtiments', debit: 0, credit: 100000, solde_debit: 0, solde_credit: 100000 },

    // ACTIF - Stocks
    { compte: '31', intitule: 'Marchandises', debit: 80000, credit: 0, solde_debit: 80000, solde_credit: 0 },

    // ACTIF - Créances
    { compte: '411', intitule: 'Clients', debit: 150000, credit: 0, solde_debit: 150000, solde_credit: 0 },

    // ACTIF - Trésorerie
    { compte: '521', intitule: 'Banque', debit: 100000, credit: 0, solde_debit: 100000, solde_credit: 0 },

    // PASSIF - Capitaux propres
    { compte: '101', intitule: 'Capital', debit: 0, credit: 500000, solde_debit: 0, solde_credit: 500000 },
    { compte: '11', intitule: 'Réserves', debit: 0, credit: 100000, solde_debit: 0, solde_credit: 100000 },
    { compte: '13', intitule: 'Résultat', debit: 0, credit: 270000, solde_debit: 0, solde_credit: 270000 },

    // PASSIF - Dettes
    { compte: '161', intitule: 'Emprunts', debit: 0, credit: 200000, solde_debit: 0, solde_credit: 200000 },
    { compte: '401', intitule: 'Fournisseurs', debit: 0, credit: 100000, solde_debit: 0, solde_credit: 100000 },

    // COMPTE DE RÉSULTAT - Charges
    { compte: '601', intitule: 'Achats marchandises', debit: 200000, credit: 0, solde_debit: 200000, solde_credit: 0 },
    { compte: '61', intitule: 'Transport', debit: 30000, credit: 0, solde_debit: 30000, solde_credit: 0 },
    { compte: '66', intitule: 'Charges personnel', debit: 150000, credit: 0, solde_debit: 150000, solde_credit: 0 },
    { compte: '681', intitule: 'Dotations amort', debit: 50000, credit: 0, solde_debit: 50000, solde_credit: 0 },

    // COMPTE DE RÉSULTAT - Produits
    { compte: '701', intitule: 'Ventes marchandises', debit: 0, credit: 700000, solde_debit: 0, solde_credit: 700000 },
  ]

  beforeEach(() => {
    liasseDataService.loadBalance(mockBalance)
  })

  describe('Chargement de la balance', () => {
    it('devrait charger la balance correctement', () => {
      expect(() => liasseDataService.loadBalance(mockBalance)).not.toThrow()
    })

    it('devrait construire un cache de mapping', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      expect(bilanActif).toBeDefined()
      expect(Array.isArray(bilanActif)).toBe(true)
    })
  })

  describe('Génération Bilan Actif', () => {
    it('devrait générer un bilan actif avec tous les postes', () => {
      const bilanActif = liasseDataService.generateBilanActif()

      expect(bilanActif).toBeDefined()
      expect(bilanActif.length).toBeGreaterThan(0)
    })

    it('devrait calculer correctement les immobilisations incorporelles (AD)', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      const posteAD = bilanActif.find((row: any) => row.ref === 'AD')

      expect(posteAD).toBeDefined()
      expect(posteAD.brut).toBe(50000) // Compte 211
      expect(posteAD.amortProv).toBe(10000) // Compte 2811
      expect(posteAD.net).toBe(40000) // 50000 - 10000
    })

    it('devrait calculer correctement les terrains (AJ)', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      const posteAJ = bilanActif.find((row: any) => row.ref === 'AJ')

      expect(posteAJ).toBeDefined()
      expect(posteAJ.brut).toBe(200000)
      expect(posteAJ.net).toBe(200000)
    })

    it('devrait calculer correctement les bâtiments (AK)', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      const posteAK = bilanActif.find((row: any) => row.ref === 'AK')

      expect(posteAK).toBeDefined()
      expect(posteAK.brut).toBe(500000)
      expect(posteAK.amortProv).toBe(100000)
      expect(posteAK.net).toBe(400000)
    })

    it('devrait calculer correctement les stocks marchandises (BC)', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      const posteBC = bilanActif.find((row: any) => row.ref === 'BC')

      expect(posteBC).toBeDefined()
      expect(posteBC.brut).toBe(80000)
    })

    it('devrait calculer correctement les créances clients (BJ)', () => {
      const bilanActif = liasseDataService.generateBilanActif()
      const posteBJ = bilanActif.find((row: any) => row.ref === 'BJ')

      expect(posteBJ).toBeDefined()
      expect(posteBJ.brut).toBe(150000)
    })
  })

  describe('Génération Bilan Passif', () => {
    it('devrait générer un bilan passif avec tous les postes', () => {
      const bilanPassif = liasseDataService.generateBilanPassif()

      expect(bilanPassif).toBeDefined()
      expect(bilanPassif.length).toBeGreaterThan(0)
    })

    it('devrait calculer correctement le capital (CA)', () => {
      const bilanPassif = liasseDataService.generateBilanPassif()
      const posteCA = bilanPassif.find((row: any) => row.ref === 'CA')

      expect(posteCA).toBeDefined()
      expect(posteCA.montant).toBe(500000)
    })

    it('devrait calculer correctement les réserves (CC)', () => {
      const bilanPassif = liasseDataService.generateBilanPassif()
      const posteCC = bilanPassif.find((row: any) => row.ref === 'CC')

      expect(posteCC).toBeDefined()
      expect(posteCC.montant).toBe(100000)
    })

    it('devrait calculer correctement le résultat (CE)', () => {
      const bilanPassif = liasseDataService.generateBilanPassif()
      const posteCE = bilanPassif.find((row: any) => row.ref === 'CE')

      expect(posteCE).toBeDefined()
      expect(posteCE.montant).toBe(270000)
    })

    it('devrait calculer correctement les emprunts (DA)', () => {
      const bilanPassif = liasseDataService.generateBilanPassif()
      const posteDA = bilanPassif.find((row: any) => row.ref === 'DA')

      expect(posteDA).toBeDefined()
      expect(posteDA.montant).toBe(200000)
    })
  })

  describe('Génération Compte de Résultat', () => {
    it('devrait générer un compte de résultat avec charges et produits', () => {
      const { charges, produits } = liasseDataService.generateCompteResultat()

      expect(charges).toBeDefined()
      expect(produits).toBeDefined()
      expect(Array.isArray(charges)).toBe(true)
      expect(Array.isArray(produits)).toBe(true)
    })

    it('devrait calculer correctement les achats de marchandises (RA)', () => {
      const { charges } = liasseDataService.generateCompteResultat()
      const posteRA = charges.find((row: any) => row.ref === 'RA')

      expect(posteRA).toBeDefined()
      expect(posteRA.montant).toBe(200000)
    })

    it('devrait calculer correctement les charges de personnel (RK)', () => {
      const { charges } = liasseDataService.generateCompteResultat()
      const posteRK = charges.find((row: any) => row.ref === 'RK')

      expect(posteRK).toBeDefined()
      expect(posteRK.montant).toBe(150000)
    })

    it('devrait calculer correctement les ventes de marchandises (TA)', () => {
      const { produits } = liasseDataService.generateCompteResultat()
      const posteTA = produits.find((row: any) => row.ref === 'TA')

      expect(posteTA).toBeDefined()
      expect(posteTA.montant).toBe(700000)
    })
  })

  describe('Validation de Cohérence', () => {
    it('devrait valider l\'équilibre du bilan', () => {
      const validation = liasseDataService.validateCoherence()

      expect(validation).toBeDefined()
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('devrait détecter un déséquilibre du bilan', () => {
      // Balance déséquilibrée
      const balanceDesequilibree: BalanceEntry[] = [
        { compte: '22', intitule: 'Terrains', debit: 100000, credit: 0, solde_debit: 100000, solde_credit: 0 },
        { compte: '101', intitule: 'Capital', debit: 0, credit: 50000, solde_debit: 0, solde_credit: 50000 },
      ]

      liasseDataService.loadBalance(balanceDesequilibree)
      const validation = liasseDataService.validateCoherence()

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors[0]).toContain('bilan n\'est pas équilibré')
    })

    it('devrait calculer le résultat correctement', () => {
      const { charges, produits } = liasseDataService.generateCompteResultat()

      const totalCharges = charges.reduce((sum: number, row: any) => sum + row.montant, 0)
      const totalProduits = produits.reduce((sum: number, row: any) => sum + row.montant, 0)
      const resultat = totalProduits - totalCharges

      // Résultat = 700000 (ventes) - (200000 + 30000 + 150000 + 50000) = 270000
      expect(resultat).toBe(270000)
    })

    it('devrait vérifier la cohérence résultat bilan vs compte de résultat', () => {
      const validation = liasseDataService.validateCoherence()

      expect(validation.isValid).toBe(true)
      expect(validation.errors).not.toContain('Incohérence du résultat')
    })
  })

  describe('Mapping SYSCOHADA', () => {
    it('devrait avoir un mapping complet pour l\'actif', () => {
      expect(SYSCOHADA_MAPPING.actif).toBeDefined()
      expect(Object.keys(SYSCOHADA_MAPPING.actif).length).toBeGreaterThan(10)
    })

    it('devrait avoir un mapping complet pour le passif', () => {
      expect(SYSCOHADA_MAPPING.passif).toBeDefined()
      expect(Object.keys(SYSCOHADA_MAPPING.passif).length).toBeGreaterThan(5)
    })

    it('devrait avoir un mapping complet pour les charges', () => {
      expect(SYSCOHADA_MAPPING.charges).toBeDefined()
      expect(Object.keys(SYSCOHADA_MAPPING.charges).length).toBeGreaterThan(10)
    })

    it('devrait avoir un mapping complet pour les produits', () => {
      expect(SYSCOHADA_MAPPING.produits).toBeDefined()
      expect(Object.keys(SYSCOHADA_MAPPING.produits).length).toBeGreaterThan(5)
    })

    it('devrait mapper les comptes par préfixe', () => {
      const balanceAvecPrefixes: BalanceEntry[] = [
        { compte: '2111', intitule: 'Frais R&D détaillé', debit: 10000, credit: 0, solde_debit: 10000, solde_credit: 0 },
        { compte: '2112', intitule: 'Frais R&D autres', debit: 5000, credit: 0, solde_debit: 5000, solde_credit: 0 },
      ]

      liasseDataService.loadBalance(balanceAvecPrefixes)
      const bilanActif = liasseDataService.generateBilanActif()
      const posteAD = bilanActif.find((row: any) => row.ref === 'AD')

      // Doit inclure tous les sous-comptes 211*
      expect(posteAD.brut).toBe(15000)
    })
  })

  describe('Performance', () => {
    it('devrait générer le bilan actif en moins de 100ms', () => {
      const start = performance.now()
      liasseDataService.generateBilanActif()
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('devrait générer le bilan passif en moins de 100ms', () => {
      const start = performance.now()
      liasseDataService.generateBilanPassif()
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('devrait valider la cohérence en moins de 200ms', () => {
      const start = performance.now()
      liasseDataService.validateCoherence()
      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
    })
  })

  describe('Cas limites', () => {
    it('devrait gérer une balance vide', () => {
      liasseDataService.loadBalance([])
      const bilanActif = liasseDataService.generateBilanActif()

      expect(bilanActif).toBeDefined()
      expect(Array.isArray(bilanActif)).toBe(true)
    })

    it('devrait gérer des valeurs nulles', () => {
      const balanceAvecNulls: BalanceEntry[] = [
        { compte: '22', intitule: 'Terrains', debit: 0, credit: 0, solde_debit: 0, solde_credit: 0 },
      ]

      liasseDataService.loadBalance(balanceAvecNulls)
      const bilanActif = liasseDataService.generateBilanActif()
      const posteAJ = bilanActif.find((row: any) => row.ref === 'AJ')

      expect(posteAJ.brut).toBe(0)
    })

    it('devrait gérer des comptes inexistants dans le mapping', () => {
      const balanceAvecInconnus: BalanceEntry[] = [
        { compte: '999', intitule: 'Compte inconnu', debit: 1000, credit: 0, solde_debit: 1000, solde_credit: 0 },
      ]

      expect(() => {
        liasseDataService.loadBalance(balanceAvecInconnus)
        liasseDataService.generateBilanActif()
      }).not.toThrow()
    })
  })
})
