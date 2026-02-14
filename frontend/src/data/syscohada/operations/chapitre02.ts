import type { ChapitreOperations } from '../types'

export const CHAPITRE_02: ChapitreOperations = {
  numero: 2,
  titre: 'Augmentation du capital',
  sections: [
    {
      titre: 'Par apports nouveaux',
      contenu:
        "L'augmentation du capital par apports nouveaux en numéraire entraîne l'émission de nouvelles actions ou parts sociales. " +
        "Le prix d'émission comprend la valeur nominale et, le cas échéant, une prime d'émission comptabilisée au compte 1041. " +
        "Les anciens actionnaires disposent d'un droit préférentiel de souscription qui peut être négocié. " +
        "La libération peut être fractionnée dans les conditions prévues par l'Acte Uniforme OHADA.",
      ecritures: [
        {
          numero: 1,
          description: 'Augmentation de capital de 5 000 000 FCFA avec prime d\'émission de 1 000 000 FCFA, libérée intégralement',
          lignes: [
            { sens: 'D', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 6000000 },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social', montant: 5000000 },
            { sens: 'C', compte: '1041', libelleCompte: "Primes d'émission", montant: 1000000 },
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 6000000, commentaire: 'Versement des souscripteurs' },
            { sens: 'C', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 6000000 },
          ],
        },
      ],
    },
    {
      titre: 'Par incorporation de réserves',
      contenu:
        "L'incorporation de réserves au capital consiste à transférer des réserves (compte 11) ou des primes (compte 104) vers le compte 101 « Capital social ». " +
        "Cette opération ne modifie pas les capitaux propres dans leur ensemble mais augmente le capital nominal. " +
        "Elle peut se traduire par une augmentation de la valeur nominale des titres existants ou par l'attribution gratuite de titres nouveaux.",
      ecritures: [
        {
          numero: 2,
          description: 'Incorporation de la réserve facultative de 3 000 000 FCFA au capital',
          lignes: [
            { sens: 'D', compte: '1181', libelleCompte: 'Réserves facultatives', montant: 3000000 },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social', montant: 3000000 },
          ],
        },
      ],
    },
    {
      titre: 'Par conversion de dettes',
      contenu:
        "La conversion de dettes en capital permet de transformer une créance sur la société en parts de capital. " +
        "Le créancier devient alors associé. Cette opération est fréquente dans les restructurations financières et dans les conversions d'obligations en actions. " +
        "Le compte du créancier (classe 4 ou 16) est débité par le crédit du compte 101 et éventuellement du compte 1042 « Primes de conversion ».",
    },
  ],
  comptesLies: ['101', '104', '109', '461'],
}
