import type { ChapitreOperations } from '../types'

export const CHAPITRE_30: ChapitreOperations = {
  numero: 30,
  titre: 'Détermination du résultat',
  sections: [
    {
      titre: 'Clôture des comptes de charges et produits',
      contenu:
        "La détermination du résultat s'effectue en soldant l'ensemble des comptes de charges (classes 6 et 8 débiteurs) et de produits (classes 7 et 8 créditeurs) par le débit ou crédit du compte 13 « Résultat net de l'exercice ». " +
        "Les comptes de charges sont crédités pour solde par le débit du compte 13. Les comptes de produits sont débités pour solde par le crédit du compte 13. " +
        "Le solde du compte 13 représente le résultat net : créditeur en cas de bénéfice, débiteur en cas de perte.",
      ecritures: [
        {
          numero: 1,
          description: 'Clôture simplifiée : total des produits 80 000 000, total des charges 65 000 000, résultat brut 15 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '89', libelleCompte: 'Impôts sur le résultat', montant: 4500000, commentaire: 'IS 30% sur 15M' },
            { sens: 'C', compte: '891', libelleCompte: 'Impôts sur les bénéfices de l\'exercice', montant: 4500000 },
          ],
        },
      ],
    },
    {
      titre: "Calcul de l'IS",
      contenu:
        "L'impôt sur les sociétés est calculé sur le résultat fiscal, obtenu par retraitements extracomptables du résultat comptable (réintégrations des charges non déductibles, déductions des produits non imposables). " +
        "Le taux d'IS varie selon les pays de l'espace OHADA (25% à 30% généralement). L'impôt est comptabilisé au débit du compte 891 « Impôts sur les bénéfices » par le crédit du compte 441. " +
        "L'impôt minimum forfaitaire (IMF), lorsqu'il est supérieur à l'IS, se substitue à ce dernier.",
    },
    {
      titre: 'Résultat net',
      contenu:
        "Le résultat net est déterminé après impôt et se compose du résultat d'exploitation, du résultat financier, du résultat HAO et de l'impôt sur les bénéfices. " +
        "Un bénéfice net est viré au crédit du compte 120 « Résultat de l'exercice (bénéfice) ». Une perte nette est virée au débit du compte 129 « Résultat de l'exercice (perte) ». " +
        "Le résultat net reste dans le compte 12 jusqu'à la décision d'affectation par l'assemblée générale.",
      ecritures: [
        {
          numero: 2,
          description: 'Constatation du résultat net bénéficiaire de 10 500 000 FCFA après IS',
          lignes: [
            { sens: 'D', compte: '89', libelleCompte: 'Impôts sur le résultat', montant: 10500000, commentaire: 'Solde des comptes de gestion' },
            { sens: 'C', compte: '120', libelleCompte: 'Résultat de l\'exercice (bénéfice)', montant: 10500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['12', '120', '129', '89', '891'],
}
