import type { ChapitreOperations } from '../types'

export const CHAPITRE_39: ChapitreOperations = {
  numero: 39,
  titre: 'Comptabilité des exploitations agricoles',
  sections: [
    {
      titre: 'Actifs biologiques',
      contenu:
        "Les actifs biologiques (animaux et plantes vivants) sont comptabilisés selon le SYSCOHADA Révisé à leur juste valeur diminuée des coûts estimés au point de vente, lorsque cette juste valeur peut être déterminée de manière fiable. " +
        "Les actifs biologiques producteurs (arbres fruitiers, animaux reproducteurs) sont inscrits au compte 246 « Immobilisations animales et agricoles » et amortis sur leur durée d'utilité. " +
        "Les produits agricoles récoltés sont évalués à leur juste valeur au point de récolte et inscrits en stocks.",
      ecritures: [
        {
          numero: 1,
          description: 'Acquisition d\'un troupeau de 50 bovins reproducteurs évalué à 25 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '246', libelleCompte: 'Immobilisations animales et agricoles', montant: 25000000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 25000000 },
          ],
        },
      ],
    },
    {
      titre: 'Stocks agricoles',
      contenu:
        "Les stocks agricoles comprennent les produits récoltés (céréales, fruits, coton, cacao, etc.), les intrants (semences, engrais, produits phytosanitaires) et les animaux destinés à la vente. " +
        "Les récoltes sont évaluées à leur juste valeur nette des coûts estimés au point de vente et inscrites au compte 36 « Produits finis » ou 33 « Autres approvisionnements ». " +
        "Les variations de la juste valeur des actifs biologiques sont comptabilisées en résultat de l'exercice.",
      ecritures: [
        {
          numero: 2,
          description: 'Entrée en stock de la récolte de cacao : juste valeur nette 8 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '36', libelleCompte: 'Produits finis', montant: 8000000, commentaire: 'Récolte à la juste valeur' },
            { sens: 'C', compte: '73', libelleCompte: 'Variations de stocks de produits fabriqués', montant: 8000000 },
          ],
        },
      ],
    },
    {
      titre: 'Subventions agricoles',
      contenu:
        "Les exploitations agricoles peuvent bénéficier de subventions publiques liées à l'exploitation (primes à la production, aide aux intrants) ou à l'investissement (équipement, modernisation). " +
        "Les subventions d'exploitation sont comptabilisées au crédit du compte 71 « Subventions d'exploitation » au fur et à mesure de la réalisation des conditions. " +
        "Les subventions d'investissement suivent le traitement classique du chapitre 6 (compte 131) avec reprise au rythme de l'amortissement du bien financé.",
    },
  ],
  comptesLies: ['246', '33', '36'],
}
