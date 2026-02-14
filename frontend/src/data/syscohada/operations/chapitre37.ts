import type { ChapitreOperations } from '../types'

export const CHAPITRE_37: ChapitreOperations = {
  numero: 37,
  titre: 'Fusion et scission',
  sections: [
    {
      titre: 'Fusion-absorption',
      contenu:
        "La fusion-absorption est l'opération par laquelle une société (absorbée) transmet son patrimoine à une société existante (absorbante) qui l'absorbe. " +
        "La société absorbante augmente son capital en émettant de nouvelles actions au profit des actionnaires de l'absorbée. Le compte 101 est crédité et le compte 1042 « Prime de fusion » enregistre la différence entre la valeur d'apport et la valeur nominale des titres émis. " +
        "La société absorbée est dissoute sans liquidation ; ses actifs et passifs sont transférés à leur valeur comptable ou à leur valeur réelle selon les cas.",
      ecritures: [
        {
          numero: 1,
          description: "Chez l'absorbante : augmentation de capital de 15 000 000 FCFA avec prime de fusion de 3 000 000 FCFA suite à l'absorption",
          lignes: [
            { sens: 'D', compte: '46', libelleCompte: 'Associés et groupe', montant: 18000000, commentaire: 'Apport net reçu de l\'absorbée' },
            { sens: 'C', compte: '101', libelleCompte: 'Capital social', montant: 15000000, commentaire: 'Actions émises en rémunération' },
            { sens: 'C', compte: '1042', libelleCompte: 'Prime de fusion', montant: 3000000 },
          ],
        },
      ],
    },
    {
      titre: 'Fusion par création',
      contenu:
        "La fusion par création de société nouvelle entraîne la dissolution des sociétés fusionnantes et la création d'une entité nouvelle qui reçoit l'intégralité de leurs patrimoines. " +
        "Les actionnaires des sociétés dissoutes reçoivent des titres de la nouvelle société en échange. " +
        "Le traitement comptable est similaire à la fusion-absorption, avec la constitution du capital initial de la nouvelle société à partir des apports des sociétés fusionnantes.",
    },
    {
      titre: 'Scission',
      contenu:
        "La scission est l'opération par laquelle une société transmet son patrimoine à plusieurs sociétés existantes ou nouvelles. " +
        "Elle obéit aux mêmes règles que la fusion. Chaque société bénéficiaire reçoit une fraction du patrimoine et émet des titres en contrepartie. " +
        "L'éclatement du patrimoine doit respecter l'unité de chaque branche d'activité transmise.",
    },
    {
      titre: "Apport partiel d'actif",
      contenu:
        "L'apport partiel d'actif est l'opération par laquelle une société apporte une branche complète et autonome d'activité à une autre société, sans être dissoute. " +
        "La société apporteuse reçoit en contrepartie des titres de la société bénéficiaire, inscrits au compte 261 « Titres de participation ». " +
        "Le SYSCOHADA Révisé prévoit que l'apport partiel d'actif peut bénéficier du régime fiscal des fusions lorsqu'il porte sur une branche complète d'activité.",
      ecritures: [
        {
          numero: 2,
          description: "Apport partiel d'actif d'une branche d'activité : actifs nets 25 000 000, titres reçus en échange",
          lignes: [
            { sens: 'D', compte: '261', libelleCompte: 'Titres de participation', montant: 25000000, commentaire: 'Titres reçus de la bénéficiaire' },
            { sens: 'C', compte: '1043', libelleCompte: "Prime d'apport", montant: 5000000 },
            { sens: 'C', compte: '24', libelleCompte: 'Matériel', montant: 15000000, commentaire: 'Actifs apportés' },
            { sens: 'C', compte: '31', libelleCompte: 'Marchandises', montant: 5000000, commentaire: 'Stocks apportés' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['101', '104', '1042', '1043', '46'],
}
