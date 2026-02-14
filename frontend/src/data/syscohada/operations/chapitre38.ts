import type { ChapitreOperations } from '../types'

export const CHAPITRE_38: ChapitreOperations = {
  numero: 38,
  titre: 'Transformation de sociétés',
  sections: [
    {
      titre: 'Transformation en SA',
      contenu:
        "La transformation d'une SARL en SA nécessite un rapport du commissaire aux comptes sur la situation de la société et un rapport d'un commissaire à la transformation sur la valeur des biens. " +
        "Si la valeur nominale des actions diffère de celle des parts sociales, un ajustement est opéré sur le compte 101 « Capital social » avec contrepartie au compte 104 « Primes liées au capital ». " +
        "Les frais de transformation (publicité légale, honoraires) sont enregistrés en charges de l'exercice ou immobilisés en frais d'établissement.",
      ecritures: [
        {
          numero: 1,
          description: 'Transformation d\'une SARL en SA : ajustement du capital de 10 000 000 FCFA (2 000 parts de 5 000) en 1 000 actions de 10 000 FCFA',
          lignes: [
            { sens: 'D', compte: '101', libelleCompte: 'Capital social (SARL)', montant: 10000000, commentaire: 'Annulation ancien capital' },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social (SA)', montant: 10000000, commentaire: 'Constitution nouveau capital' },
          ],
        },
      ],
    },
    {
      titre: 'Transformation en SARL',
      contenu:
        "La transformation d'une SA en SARL est possible lorsque le nombre d'actionnaires ne dépasse pas le maximum légal autorisé pour une SARL. " +
        "Les actions sont converties en parts sociales. Les titres au porteur deviennent nominatifs. Le capital social est maintenu à l'identique sauf décision contraire de l'assemblée. " +
        "Un rapport du commissaire aux comptes est requis pour attester de la régularité de l'opération et de la valeur des actifs.",
    },
    {
      titre: 'Incidences fiscales',
      contenu:
        "La transformation de société n'entraîne généralement pas les conséquences fiscales d'une dissolution suivie de création, à condition qu'aucune modification substantielle du pacte social n'intervienne. " +
        "En revanche, si la transformation modifie le régime fiscal applicable (passage de l'IR à l'IS ou inversement), elle peut entraîner l'imposition immédiate des plus-values latentes et des bénéfices en sursis d'imposition. " +
        "Les droits d'enregistrement sont réduits en cas de simple transformation sans modification du capital.",
      ecritures: [
        {
          numero: 2,
          description: 'Frais de transformation : honoraires du commissaire 1 500 000 FCFA, frais de publicité 200 000 FCFA',
          lignes: [
            { sens: 'D', compte: '6324', libelleCompte: 'Honoraires', montant: 1500000 },
            { sens: 'D', compte: '6271', libelleCompte: 'Annonces et insertions', montant: 200000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 1700000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['101', '104', '106'],
}
