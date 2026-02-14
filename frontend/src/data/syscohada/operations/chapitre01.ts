import type { ChapitreOperations } from '../types'

export const CHAPITRE_01: ChapitreOperations = {
  numero: 1,
  titre: 'Constitution des sociétés',
  sections: [
    {
      titre: 'Apports en numéraire',
      contenu:
        "Les apports en numéraire correspondent aux sommes d'argent versées par les associés lors de la constitution de la société. " +
        "Selon le SYSCOHADA Révisé, le capital souscrit appelé non versé est enregistré au débit du compte 109 « Actionnaires, capital souscrit non appelé ». " +
        "Lors de l'appel de fonds, le compte 461 « Associés, opérations sur le capital » est débité par le crédit du compte 109. " +
        "La libération effective se traduit par le débit d'un compte de trésorerie (521) et le crédit du compte 461.",
      ecritures: [
        {
          numero: 1,
          description: "Souscription et libération intégrale du capital en numéraire lors de la constitution d'une SARL au capital de 10 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 10000000, commentaire: 'Promesse d\'apport' },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social', montant: 10000000, commentaire: 'Capital souscrit' },
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 10000000, commentaire: 'Versement effectif' },
            { sens: 'C', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 10000000, commentaire: 'Libération des apports' },
          ],
        },
      ],
    },
    {
      titre: 'Apports en nature',
      contenu:
        "Les apports en nature sont constitués de biens meubles ou immeubles mis à la disposition de la société par les associés. " +
        "Ils doivent faire l'objet d'une évaluation par un commissaire aux apports lorsque la loi l'exige. " +
        "L'enregistrement se fait au débit des comptes d'actif correspondants (immobilisations, stocks, créances) par le crédit du compte 101 « Capital social » et éventuellement du compte 104 « Primes liées au capital ».",
      ecritures: [
        {
          numero: 2,
          description: 'Apport en nature d\'un immeuble évalué à 25 000 000 FCFA et d\'un véhicule évalué à 5 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '231', libelleCompte: 'Bâtiments', montant: 25000000 },
            { sens: 'D', compte: '245', libelleCompte: 'Matériel de transport', montant: 5000000 },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social', montant: 30000000, commentaire: 'Valeur nominale des parts' },
          ],
        },
      ],
    },
    {
      titre: 'Frais de constitution',
      contenu:
        "Les frais de constitution comprennent les droits d'enregistrement, les honoraires du notaire, les frais de publicité légale et les frais d'immatriculation. " +
        "Le SYSCOHADA Révisé permet soit leur inscription en charges de l'exercice (comptes de la classe 6), soit leur activation au compte 201 « Frais d'établissement » avec amortissement sur 2 à 5 ans maximum. " +
        "La méthode préférentielle recommandée est la comptabilisation en charges.",
    },
  ],
  comptesLies: ['101', '104', '109', '461', '4612', '521'],
}
