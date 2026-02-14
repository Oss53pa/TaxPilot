/**
 * Registre central des controles d'audit
 * Enregistre les 108 controles et fournit des methodes d'acces
 */

import {
  ControleDefinition,
  ControlFunction,
  NiveauControle,
  PhaseAudit,
} from '@/types/audit.types'

interface RegisteredControl {
  definition: ControleDefinition
  execute: ControlFunction
}

class ControlRegistry {
  private controls: Map<string, RegisteredControl> = new Map()

  /**
   * Enregistre un controle avec sa definition et sa fonction d'execution
   */
  register(definition: ControleDefinition, executeFn: ControlFunction): void {
    this.controls.set(definition.ref, { definition, execute: executeFn })
  }

  /**
   * Retourne un controle par sa reference
   */
  get(ref: string): RegisteredControl | undefined {
    return this.controls.get(ref)
  }

  /**
   * Retourne tous les controles d'un niveau donne
   */
  getByLevel(niveau: NiveauControle): RegisteredControl[] {
    return Array.from(this.controls.values()).filter(
      (c) => c.definition.niveau === niveau && c.definition.actif
    )
  }

  /**
   * Retourne les controles d'une phase donnee
   */
  getByPhase(phase: PhaseAudit): RegisteredControl[] {
    return Array.from(this.controls.values()).filter(
      (c) => c.definition.phase === phase && c.definition.actif
    )
  }

  /**
   * Retourne tous les controles enregistres
   */
  getAll(): RegisteredControl[] {
    return Array.from(this.controls.values())
  }

  /**
   * Retourne toutes les definitions (incluant inactifs)
   */
  getAllDefinitions(): ControleDefinition[] {
    return Array.from(this.controls.values()).map((c) => c.definition)
  }

  /**
   * Active ou desactive un controle
   */
  setActive(ref: string, actif: boolean): void {
    const control = this.controls.get(ref)
    if (control) {
      control.definition.actif = actif
    }
  }

  /**
   * Nombre total de controles enregistres
   */
  get size(): number {
    return this.controls.size
  }

  /**
   * Nombre de controles actifs
   */
  get activeCount(): number {
    return Array.from(this.controls.values()).filter((c) => c.definition.actif).length
  }
}

// Singleton
export const controlRegistry = new ControlRegistry()
