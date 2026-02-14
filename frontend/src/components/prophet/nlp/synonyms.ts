/**
 * NLP — Dictionnaire de synonymes comptables/fiscaux FR
 */

const SYNONYM_GROUPS: [string, string[]][] = [
  ['impot', ['impot', 'impots', 'taxe', 'taxes', 'imposition', 'fiscal', 'fiscalite', 'fiscaux']],
  ['societe', ['societe', 'entreprise', 'entite', 'personne morale', 'compagnie', 'firme']],
  ['benefice', ['benefice', 'benefices', 'resultat', 'profit', 'gain', 'excedent']],
  ['tva', ['tva', 'taxe valeur ajoutee', 'valeur ajoutee']],
  ['is', ['is', 'impot societe', 'impot benefice', 'bic']],
  ['salaire', ['salaire', 'salaires', 'remuneration', 'paie', 'paye', 'traitement']],
  ['cnps', ['cnps', 'cotisation sociale', 'cotisations sociales', 'securite sociale', 'retraite']],
  ['liasse', ['liasse', 'liasse fiscale', 'declaration fiscale', 'etats financiers']],
  ['audit', ['audit', 'controle', 'verification', 'revision', 'inspection']],
  ['bilan', ['bilan', 'situation patrimoniale', 'etat financier']],
  ['tresorerie', ['tresorerie', 'cash', 'liquidite', 'liquidites', 'encaisse', 'disponibilites']],
  ['ratio', ['ratio', 'ratios', 'indicateur', 'indicateurs', 'kpi']],
  ['prevision', ['prevision', 'previsions', 'prediction', 'predictions', 'projection', 'estimation', 'prospectif']],
  ['fournisseur', ['fournisseur', 'fournisseurs', 'achat', 'achats', 'approvisionnement']],
  ['client', ['client', 'clients', 'vente', 'ventes', 'creance', 'creances']],
  ['amortissement', ['amortissement', 'amortissements', 'depreciation', 'depreciations', 'dotation']],
  ['provision', ['provision', 'provisions', 'risque', 'risques']],
  ['capital', ['capital', 'capitaux', 'fonds propres', 'capitaux propres']],
  ['dette', ['dette', 'dettes', 'emprunt', 'emprunts', 'passif', 'engagement']],
  ['stock', ['stock', 'stocks', 'inventaire', 'marchandise', 'marchandises']],
  ['charge', ['charge', 'charges', 'depense', 'depenses', 'cout', 'couts', 'frais']],
  ['produit', ['produit', 'produits', 'revenu', 'revenus', 'recette', 'recettes', 'chiffre affaires']],
  ['patente', ['patente', 'contribution patente', 'droit patente']],
  ['retenue', ['retenue', 'retenues', 'prelevement', 'prelevements', 'retenue source']],
  ['deductible', ['deductible', 'deductibilite', 'deduction', 'non deductible', 'deductibles']],
]

const TOKEN_TO_CANONICAL = new Map<string, string>()

for (const [canonical, synonyms] of SYNONYM_GROUPS) {
  for (const s of synonyms) {
    TOKEN_TO_CANONICAL.set(s, canonical)
  }
}

export function canonicalize(token: string): string {
  return TOKEN_TO_CANONICAL.get(token) || token
}

export function canonicalizeTokens(tokens: string[]): string[] {
  return tokens.map(canonicalize)
}

export function hasCanonical(tokens: string[], canonical: string): boolean {
  return tokens.some(t => canonicalize(t) === canonical)
}
