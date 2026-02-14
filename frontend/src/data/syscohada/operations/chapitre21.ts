import type { ChapitreOperations } from '../types'

export const CHAPITRE_21: ChapitreOperations = {
  numero: 21,
  titre: 'Charges de personnel',
  sections: [
    {
      titre: 'Comptabilisation de la paie',
      contenu:
        "La paie est comptabilisée en distinguant le salaire brut (compte 661 « Rémunérations directes versées au personnel »), les retenues salariales (cotisations sociales, impôts sur salaires retenus à la source) et le salaire net à payer. " +
        "Le compte 422 « Personnel, rémunérations dues » est crédité du salaire net. Les retenues sont portées au crédit des comptes 43 (organismes sociaux) et 447 (État, impôts retenus à la source). " +
        "Le paiement effectif des salaires se traduit par le débit du compte 422 et le crédit du compte de trésorerie.",
      ecritures: [
        {
          numero: 1,
          description: 'Comptabilisation de la paie mensuelle : brut 5 000 000 FCFA, cotisations salariales 900 000, impôt retenu 350 000',
          lignes: [
            { sens: 'D', compte: '661', libelleCompte: 'Rémunérations directes versées au personnel', montant: 5000000 },
            { sens: 'C', compte: '431', libelleCompte: 'Sécurité sociale', montant: 900000, commentaire: 'Cotisations salariales' },
            { sens: 'C', compte: '447', libelleCompte: 'État, impôts retenus à la source', montant: 350000 },
            { sens: 'C', compte: '422', libelleCompte: 'Personnel, rémunérations dues', montant: 3750000, commentaire: 'Net à payer' },
          ],
        },
      ],
    },
    {
      titre: 'Charges sociales',
      contenu:
        "Les charges sociales patronales sont comptabilisées au débit du compte 664 « Charges sociales » par le crédit des comptes 43 correspondants (431 Sécurité sociale, 432 Caisses de retraite, etc.). " +
        "Elles comprennent les cotisations patronales de sécurité sociale, les cotisations de retraite complémentaire, les cotisations d'assurance chômage et les contributions diverses. " +
        "Le paiement aux organismes sociaux se fait par le débit des comptes 43 et le crédit du compte de trésorerie.",
      ecritures: [
        {
          numero: 2,
          description: 'Charges sociales patronales sur la paie : CNSS 800 000, retraite complémentaire 250 000 FCFA',
          lignes: [
            { sens: 'D', compte: '6641', libelleCompte: 'Charges sociales sur rémunérations du personnel national', montant: 1050000 },
            { sens: 'C', compte: '431', libelleCompte: 'Sécurité sociale', montant: 800000 },
            { sens: 'C', compte: '432', libelleCompte: 'Caisses de retraite', montant: 250000 },
          ],
        },
      ],
    },
    {
      titre: 'Congés payés',
      contenu:
        "Les droits à congés payés acquis par les salariés constituent une charge à payer rattachée à l'exercice au cours duquel les droits sont acquis. " +
        "Une provision pour congés payés est constituée à la clôture : le compte 6181 « Charges de provisions pour congés payés » est débité par le crédit du compte 4281 « Dettes provisionnées pour congés à payer ». " +
        "Le montant provisionné comprend les salaires bruts, les charges sociales patronales et la taxe sur salaires correspondantes.",
    },
  ],
  comptesLies: ['42', '43', '66', '661', '664'],
}
