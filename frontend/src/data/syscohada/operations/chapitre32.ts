import type { ChapitreOperations } from '../types'

export const CHAPITRE_32: ChapitreOperations = {
  numero: 32,
  titre: 'Opérations en commun et GIE',
  sections: [
    {
      titre: 'Participation aux résultats',
      contenu:
        "Les opérations faites en commun (sociétés en participation, GIE) donnent lieu à un partage du résultat entre les participants selon les termes du contrat. " +
        "La quote-part de bénéfice revenant à chaque participant est comptabilisée au crédit du compte 755 « Quote-part de résultat sur opérations faites en commun ». " +
        "La quote-part de perte est enregistrée au débit du compte 652 « Quote-part de résultat sur opérations faites en commun (charges) ».",
      ecritures: [
        {
          numero: 1,
          description: "Quote-part de bénéfice de 2 500 000 FCFA revenant à l'entreprise au titre d'une participation dans un GIE",
          lignes: [
            { sens: 'D', compte: '463', libelleCompte: 'Associés, comptes courants', montant: 2500000 },
            { sens: 'C', compte: '755', libelleCompte: 'Quote-part de résultat sur opérations faites en commun', montant: 2500000 },
          ],
        },
      ],
    },
    {
      titre: 'Comptabilisation chez le gérant',
      contenu:
        "Le gérant (ou pilote) de l'opération en commun tient une comptabilité autonome des opérations du groupement. " +
        "Il enregistre l'intégralité des charges et produits de l'opération dans ses propres comptes, puis répartit le résultat entre les participants. " +
        "Les quotes-parts dues aux autres participants sont enregistrées au débit du compte 652 par le crédit du compte 463 « Associés, comptes courants ».",
    },
    {
      titre: 'Comptabilisation chez les participants',
      contenu:
        "Les participants non-gérants comptabilisent uniquement leur quote-part de résultat dans l'opération commune. " +
        "Le versement de leur apport initial est enregistré au débit du compte 463 par le crédit du compte de trésorerie. " +
        "La réception de la quote-part de bénéfice se traduit par le débit du compte de trésorerie et le crédit du compte 755 ou le débit du compte 652 en cas de perte.",
      ecritures: [
        {
          numero: 2,
          description: "Apport du participant au GIE de 5 000 000 FCFA et réception de sa quote-part de bénéfice de 2 500 000 FCFA",
          lignes: [
            { sens: 'D', compte: '463', libelleCompte: 'Associés, comptes courants', montant: 5000000, commentaire: 'Apport initial' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 5000000 },
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 2500000, commentaire: 'Quote-part de bénéfice reçue' },
            { sens: 'C', compte: '755', libelleCompte: 'Quote-part de résultat sur opérations faites en commun', montant: 2500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['463', '652', '755'],
}
