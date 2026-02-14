import type { ChapitreOperations } from '../types'

export const CHAPITRE_05: ChapitreOperations = {
  numero: 5,
  titre: 'Emprunts',
  sections: [
    {
      titre: "Émission d'un emprunt obligataire",
      contenu:
        "L'emprunt obligataire est une forme de financement à long terme par laquelle la société émet des titres de créance négociables (obligations). " +
        "Le produit de l'émission est enregistré au crédit du compte 161 « Emprunts obligataires ». La prime de remboursement (différence entre valeur de remboursement et prix d'émission) est inscrite au compte 206 « Primes de remboursement des obligations ». " +
        "Les frais d'émission peuvent être étalés sur la durée de l'emprunt.",
      ecritures: [
        {
          numero: 1,
          description: 'Émission de 1 000 obligations de nominal 10 000 FCFA au prix de 9 500 FCFA, soit un emprunt de 10 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 9500000, commentaire: 'Prix d\'émission encaissé' },
            { sens: 'D', compte: '206', libelleCompte: 'Primes de remboursement des obligations', montant: 500000 },
            { sens: 'C', compte: '161', libelleCompte: 'Emprunts obligataires', montant: 10000000 },
          ],
        },
      ],
    },
    {
      titre: 'Emprunts auprès des banques',
      contenu:
        "Les emprunts bancaires à moyen et long terme sont enregistrés au crédit du compte 162 « Emprunts et dettes auprès des établissements de crédit ». " +
        "Le déblocage des fonds se traduit par le débit du compte 521. Les échéances comprennent une part de capital (qui diminue la dette) et une part d'intérêts (comptabilisée en charges financières au compte 671). " +
        "Les emprunts à court terme (découverts) relèvent du compte 56.",
    },
    {
      titre: 'Intérêts et remboursement',
      contenu:
        "Les intérêts courus non échus à la date de clôture sont rattachés à l'exercice par le débit du compte 671 « Intérêts des emprunts » et le crédit du compte 166 « Intérêts courus ». " +
        "Le remboursement du principal se traduit par le débit du compte 161 ou 162 et le crédit du compte de trésorerie. " +
        "En cas de remboursement anticipé, les pénalités éventuelles sont comptabilisées en charges financières.",
      ecritures: [
        {
          numero: 2,
          description: 'Paiement d\'une échéance d\'emprunt bancaire : capital 2 000 000 FCFA et intérêts 350 000 FCFA',
          lignes: [
            { sens: 'D', compte: '162', libelleCompte: 'Emprunts et dettes auprès des établissements de crédit', montant: 2000000 },
            { sens: 'D', compte: '671', libelleCompte: 'Intérêts des emprunts', montant: 350000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 2350000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['16', '161', '162', '166', '671'],
}
