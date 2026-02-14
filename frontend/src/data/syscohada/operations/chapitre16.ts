import type { ChapitreOperations } from '../types'

export const CHAPITRE_16: ChapitreOperations = {
  numero: 16,
  titre: 'Stocks : sorties et variations',
  sections: [
    {
      titre: 'Variation de stocks de marchandises',
      contenu:
        "En inventaire intermittent, la variation de stocks de marchandises est constatée en fin d'exercice par le jeu des comptes 6031 « Variation de stocks de marchandises » et 31 « Marchandises ». " +
        "Le stock initial est annulé (débit 6031, crédit 31) et le stock final est constaté (débit 31, crédit 6031). " +
        "Le solde du compte 6031 représente la variation de stock : débiteur si le stock a diminué (déstockage), créditeur si le stock a augmenté (stockage).",
      ecritures: [
        {
          numero: 1,
          description: 'Variation de stocks de marchandises : stock initial 4 000 000, stock final 5 500 000 FCFA (stockage net)',
          lignes: [
            { sens: 'D', compte: '6031', libelleCompte: 'Variation de stocks de marchandises', montant: 4000000, commentaire: 'Annulation stock initial' },
            { sens: 'C', compte: '31', libelleCompte: 'Marchandises', montant: 4000000 },
            { sens: 'D', compte: '31', libelleCompte: 'Marchandises', montant: 5500000, commentaire: 'Constatation stock final' },
            { sens: 'C', compte: '6031', libelleCompte: 'Variation de stocks de marchandises', montant: 5500000 },
          ],
        },
      ],
    },
    {
      titre: 'Variation de stocks de matières',
      contenu:
        "La variation de stocks de matières premières et fournitures suit le même mécanisme que celle des marchandises, via le compte 6032 « Variation de stocks de matières premières ». " +
        "Les méthodes de valorisation des sorties admises par le SYSCOHADA sont le CUMP (Coût Unitaire Moyen Pondéré) après chaque entrée ou sur la période, et le FIFO (Premier Entré, Premier Sorti). " +
        "La méthode LIFO n'est pas admise par le SYSCOHADA Révisé.",
    },
    {
      titre: 'Production déstockée',
      contenu:
        "La diminution des stocks de produits finis et en-cours constitue un déstockage comptabilisé au crédit du compte 73 « Variations de stocks de produits fabriqués ». " +
        "Un solde débiteur du compte 73 traduit un déstockage (la production vendue est supérieure à la production de l'exercice), tandis qu'un solde créditeur traduit un stockage. " +
        "Le compte 73 figure dans les produits d'exploitation du compte de résultat.",
      ecritures: [
        {
          numero: 2,
          description: 'Déstockage de produits finis : stock initial 12 000 000, stock final 9 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '73', libelleCompte: 'Variations de stocks de produits fabriqués', montant: 12000000, commentaire: 'Annulation stock initial' },
            { sens: 'C', compte: '36', libelleCompte: 'Produits finis', montant: 12000000 },
            { sens: 'D', compte: '36', libelleCompte: 'Produits finis', montant: 9500000, commentaire: 'Constatation stock final' },
            { sens: 'C', compte: '73', libelleCompte: 'Variations de stocks de produits fabriqués', montant: 9500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['603', '73', '31', '32', '36'],
}
