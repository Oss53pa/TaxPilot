/**
 * Composant générique pour toutes les notes restantes (4, 7, 9-10, 12-13, 15-16, 18, 20-35)
 * Affiche le contenu complet avec tableaux détaillés et sections d'information
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  useTheme,
} from '@mui/material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'
import EditableToolbar from '../shared/EditableToolbar'
import { useEditableTable } from '../../../hooks/useEditableTable'

interface NoteRestanteProps {
  numeroNote: number
  titre: string
  description: string
  contenuPrevu: string[]
  priorite: 'haute' | 'moyenne' | 'basse'
  datePrevisionnelle?: string
}

// ========== DONNÉES COMPLÈTES DE CHAQUE NOTE ==========

interface NoteData {
  titre: string
  alerteInfo?: string
  tableau?: {
    titre: string
    colonnes: string[]
    lignes: string[][]
  }
  details?: Record<string, Record<string, string> | string>
  contenu?: Record<string, { description: string; details?: string[] } | Record<string, string> | string>
}

const NOTES_DATA: Record<number, NoteData> = {
  4: {
    titre: 'Immobilisations financières',
    alerteInfo: 'Les immobilisations financières sont évaluées à leur coût d\'acquisition. Une provision pour dépréciation est constituée lorsque la valeur d\'inventaire est inférieure à la valeur comptable.',
    tableau: {
      titre: 'Détail des immobilisations financières',
      colonnes: ['Nature', 'Valeur début N', 'Augmentations', 'Diminutions', 'Valeur fin N', 'Provisions', 'Valeur nette'],
      lignes: [
        ['Titres de participation', '5 000 000', '0', '0', '5 000 000', '0', '5 000 000'],
        ['Autres titres immobilisés', '1 000 000', '0', '0', '1 000 000', '0', '1 000 000'],
        ['Prêts et créances non commerciales', '2 000 000', '800 000', '300 000', '2 500 000', '100 000', '2 400 000'],
        ['Dépôts et cautionnements versés', '1 200 000', '200 000', '100 000', '1 300 000', '0', '1 300 000'],
        ['Créances rattachées à des participations', '500 000', '200 000', '0', '700 000', '0', '700 000'],
        ['Prêts au personnel', '300 000', '150 000', '50 000', '400 000', '0', '400 000'],
        ['Intérêts courus sur prêts', '50 000', '80 000', '50 000', '80 000', '0', '80 000'],
        ['TOTAL', '10 050 000', '1 430 000', '500 000', '10 980 000', '100 000', '10 880 000'],
      ]
    },
    details: {
      'Titres de participation': {
        'FILIALE BENIN SARL (75%)': '3 000 000 - Cotonou',
        'FILIALE TOGO SA (60%)': '2 000 000 - Lomé',
        'Valeur de marché estimée': '6 200 000 (pas de dépréciation nécessaire)',
        'Dividendes reçus en N': '330 000'
      },
      'Prêts accordés': {
        'Prêt dirigeant M. FONDATEUR': '1 500 000 à 3% sur 5 ans - échéance 2026',
        'Prêt société liée PARTENAIRE A': '1 000 000 à 5% sur 3 ans - échéance 2025',
        'Prêts au personnel': '400 000 (divers prêts sociaux)'
      },
      'Dépôts et cautionnements': {
        'Caution bail siège social': '600 000',
        'Caution bail entrepôt': '400 000',
        'Caution compteur électrique': '200 000',
        'Caution téléphonie': '100 000'
      },
      'Provisions pour dépréciation': {
        'Prêt société liée (risque partiel)': '100 000',
        'Dotation de l\'exercice': '100 000',
        'Reprise de l\'exercice': '0'
      }
    }
  },
  7: {
    titre: 'Autres créances',
    alerteInfo: 'Les autres créances sont évaluées à leur valeur nominale. Une provision pour dépréciation est constituée lorsque le recouvrement est incertain.',
    tableau: {
      titre: 'Détail des autres créances',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Échéance'],
      lignes: [
        ['Personnel - avances et acomptes', '500 000', '400 000', '+25,0%', '< 1 an'],
        ['État - TVA déductible', '3 200 000', '2 800 000', '+14,3%', '< 3 mois'],
        ['État - Crédit de TVA', '1 800 000', '1 500 000', '+20,0%', 'Variable'],
        ['État - Impôts sur les sociétés (crédit)', '0', '0', '-', '-'],
        ['État - Autres créances fiscales', '800 000', '600 000', '+33,3%', '< 6 mois'],
        ['Organismes sociaux', '200 000', '150 000', '+33,3%', '< 1 mois'],
        ['Débiteurs divers', '1 900 000', '1 500 000', '+26,7%', 'Variable'],
        ['Charges constatées d\'avance', '800 000', '650 000', '+23,1%', '< 1 an'],
        ['TOTAL', '9 200 000', '7 500 000', '+22,7%', '-'],
      ]
    },
    details: {
      'Créances TVA': {
        'TVA sur immobilisations': '1 200 000',
        'TVA sur achats et services': '2 000 000',
        'Crédit de TVA à reporter': '1 800 000'
      },
      'Charges constatées d\'avance': {
        'Assurances': '400 000 (prorata janv-mars N+1)',
        'Loyers': '300 000 (janvier N+1 payé d\'avance)',
        'Autres charges': '100 000 (abonnements, maintenance)'
      },
      'Échéancier des autres créances': {
        '< 1 mois': '3 900 000 (42,4%)',
        '1 à 3 mois': '2 400 000 (26,1%)',
        '3 mois à 1 an': '2 900 000 (31,5%)',
        '> 1 an': '0 (0%)'
      }
    }
  },
  9: {
    titre: 'Capitaux propres - Mouvement',
    alerteInfo: 'Le tableau ci-dessous retrace les mouvements ayant affecté les capitaux propres au cours de l\'exercice, conformément à l\'Acte uniforme OHADA.',
    tableau: {
      titre: 'Variation des capitaux propres',
      colonnes: ['Éléments', 'Capital', 'Primes', 'Réserves', 'Report à nouveau', 'Résultat N', 'Total'],
      lignes: [
        ['Solde au 01/01/N', '100 000 000', '5 000 000', '25 000 000', '6 500 000', '10 200 000', '146 700 000'],
        ['Affectation résultat N-1:', '', '', '', '', '', ''],
        ['  - Réserve légale', '0', '0', '510 000', '0', '-510 000', '0'],
        ['  - Autres réserves', '0', '0', '3 000 000', '0', '-3 000 000', '0'],
        ['  - Report à nouveau', '0', '0', '0', '1 690 000', '-1 690 000', '0'],
        ['  - Dividendes distribués', '0', '0', '0', '0', '-5 000 000', '-5 000 000'],
        ['Augmentation de capital', '0', '0', '0', '0', '0', '0'],
        ['Résultat de l\'exercice N', '0', '0', '0', '0', '12 500 000', '12 500 000'],
        ['Autres mouvements', '0', '0', '-10 000', '10 000', '0', '0'],
        ['Solde au 31/12/N', '100 000 000', '5 000 000', '28 500 000', '8 200 000', '12 500 000', '154 200 000'],
      ]
    },
    details: {
      'Capital social': {
        'Nombre d\'actions': '10 000',
        'Valeur nominale': '10 000 FCFA',
        'Capital entièrement libéré': 'Oui',
        'Dernière modification': 'Augmentation de capital en 2022'
      },
      'Réserve légale': {
        'Taux de dotation': '5% du résultat net',
        'Plafond légal': '10% du capital (10 000 000)',
        'Solde actuel': '5 100 000 (51% du plafond)',
        'Dotation de l\'exercice': '510 000'
      },
      'Politique de distribution': {
        'Dividendes distribués N': '5 000 000 (500 FCFA/action)',
        'Taux de distribution': '49% du résultat N-1',
        'Date de mise en paiement': 'Juillet N'
      }
    }
  },
  10: {
    titre: 'Provisions pour risques et charges',
    alerteInfo: 'Les provisions sont constituées dès lors qu\'il existe une obligation actuelle résultant d\'un fait générateur passé, qu\'une sortie de ressources est probable et que le montant peut être estimé de manière fiable.',
    tableau: {
      titre: 'Mouvement des provisions pour risques et charges',
      colonnes: ['Nature', 'Solde début N', 'Dotations', 'Reprises utilisées', 'Reprises non utilisées', 'Solde fin N'],
      lignes: [
        ['Provisions pour litiges', '2 000 000', '800 000', '300 000', '0', '2 500 000'],
        ['Provisions pour garanties clients', '1 200 000', '400 000', '200 000', '100 000', '1 300 000'],
        ['Provisions pour gros entretien', '600 000', '200 000', '0', '0', '800 000'],
        ['Provisions pour restructuration', '0', '500 000', '0', '0', '500 000'],
        ['Provisions pour perte de change', '300 000', '0', '250 000', '50 000', '0'],
        ['Provisions pour impôts', '0', '200 000', '0', '0', '200 000'],
        ['Autres provisions pour risques', '100 000', '50 000', '0', '0', '150 000'],
        ['TOTAL', '4 200 000', '2 150 000', '750 000', '150 000', '5 450 000'],
      ]
    },
    details: {
      'Provisions pour litiges': {
        'Litige commercial CLIENT Y': '1 500 000 - Transaction amiable probable',
        'Litige social ex-salarié Z': '800 000 - Audience T2 N+1',
        'Provision risque fiscal': '200 000 - Contrôle en cours'
      },
      'Provisions pour garanties': {
        'Base de calcul': '2% du CA avec garantie contractuelle de 24 mois',
        'Sinistres survenus en N': '200 000 (reprise provision)',
        'Garanties en cours au 31/12/N': 'Estimation : 1 300 000'
      },
      'Provisions pour restructuration': {
        'Nature': 'Réorganisation du service logistique',
        'Indemnités de départ estimées': '350 000',
        'Coûts de formation reconversion': '150 000',
        'Échéance prévisionnelle': 'T1-T2 N+1'
      }
    }
  },
  13: {
    titre: 'Dettes fiscales et sociales',
    alerteInfo: 'Les dettes fiscales et sociales sont évaluées à leur valeur nominale. Elles comprennent les impôts, taxes et cotisations sociales dus à la clôture de l\'exercice.',
    tableau: {
      titre: 'Détail des dettes fiscales et sociales',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Échéance'],
      lignes: [
        ['Personnel - salaires à payer', '3 500 000', '3 200 000', '+9,4%', '< 1 mois'],
        ['Personnel - congés payés provisionnés', '1 200 000', '1 100 000', '+9,1%', '< 1 an'],
        ['Organismes sociaux - CNPS', '2 100 000', '1 900 000', '+10,5%', '< 1 mois'],
        ['Organismes sociaux - Autres', '700 000', '600 000', '+16,7%', '< 1 mois'],
        ['Impôt sur les sociétés', '4 300 000', '3 500 000', '+22,9%', '< 3 mois'],
        ['TVA collectée', '5 200 000', '4 800 000', '+8,3%', '< 1 mois'],
        ['Retenues à la source (IRPP)', '800 000', '700 000', '+14,3%', '< 1 mois'],
        ['Patente et licences', '600 000', '550 000', '+9,1%', '< 3 mois'],
        ['Autres impôts et taxes', '900 000', '850 000', '+5,9%', 'Variable'],
        ['TOTAL', '19 300 000', '17 200 000', '+12,2%', '-'],
      ]
    },
    details: {
      'Impôt sur les sociétés': {
        'Taux applicable': '30%',
        'Base imposable estimée': '14 333 333',
        'Acomptes versés': '0',
        'Solde à payer': '4 300 000'
      },
      'Charges sociales': {
        'CNPS employeur': '18% du salaire brut plafonné',
        'FNE (Fonds National Emploi)': '1,2% du salaire brut',
        'FDFP (Formation professionnelle)': '1,2% du salaire brut',
        'Taxe d\'apprentissage': '0,4% du salaire brut'
      },
      'Échéancier des dettes fiscales et sociales': {
        '< 1 mois': '12 300 000 (63,7%)',
        '1 à 3 mois': '5 500 000 (28,5%)',
        '3 mois à 1 an': '1 500 000 (7,8%)',
        '> 1 an': '0 (0%)'
      }
    }
  },
  16: {
    titre: 'Charges de personnel',
    alerteInfo: 'Les charges de personnel comprennent les salaires et traitements, les charges sociales patronales et les autres avantages au personnel. L\'effectif moyen de l\'exercice est de 78 personnes (ETP).',
    tableau: {
      titre: 'Analyse des charges de personnel',
      colonnes: ['Rubriques', 'Montant N', 'Montant N-1', 'Variation', '% CA'],
      lignes: [
        ['Salaires et appointements', '35 000 000', '32 500 000', '+7,7%', '16,6%'],
        ['Charges sociales CNPS', '6 300 000', '5 850 000', '+7,7%', '3,0%'],
        ['Contribution FNE', '420 000', '390 000', '+7,7%', '0,2%'],
        ['Contribution FDFP', '420 000', '390 000', '+7,7%', '0,2%'],
        ['Taxe d\'apprentissage', '140 000', '130 000', '+7,7%', '0,1%'],
        ['Autres charges sociales', '1 220 000', '1 240 000', '-1,6%', '0,6%'],
        ['Formation professionnelle', '500 000', '400 000', '+25,0%', '0,2%'],
        ['Médecine du travail', '300 000', '250 000', '+20,0%', '0,1%'],
        ['Indemnités et primes diverses', '2 800 000', '2 700 000', '+3,7%', '1,3%'],
        ['Avantages en nature', '1 400 000', '1 350 000', '+3,7%', '0,7%'],
        ['TOTAL', '48 500 000', '45 200 000', '+7,3%', '23,0%'],
      ]
    },
    details: {
      'Effectifs par catégorie': {
        'Cadres supérieurs (cat. 10-12)': '6 personnes',
        'Cadres moyens (cat. 7-9)': '13 personnes',
        'Agents de maîtrise (cat. 5-6)': '9 personnes',
        'Employés (cat. 1-4)': '28 personnes',
        'Ouvriers': '20 personnes',
        'Stagiaires et apprentis': '4 personnes',
        'Temporaires': '3 personnes',
        'Total': '83 personnes'
      },
      'Salaire moyen et indicateurs': {
        'Salaire moyen mensuel': '583 333 FCFA (hors dirigeants)',
        'Masse salariale / CA': '23,0%',
        'Masse salariale / Valeur ajoutée': '42,0%',
        'Productivité par employé': '2 539 759 FCFA (CA/effectif)'
      },
      'Évolution effectifs': {
        'Effectif début N': '73 personnes',
        'Embauches': '18 personnes',
        'Départs': '8 personnes',
        'Effectif fin N': '83 personnes',
        'Variation nette': '+10 personnes (+13,7%)'
      }
    }
  },
  18: {
    titre: 'Charges et produits financiers',
    alerteInfo: 'Le résultat financier se compose des produits et charges liés aux activités de financement, aux placements et aux opérations en devises de la société.',
    tableau: {
      titre: 'Détail du résultat financier',
      colonnes: ['Éléments', 'Montant N', 'Montant N-1', 'Variation', 'Commentaires'],
      lignes: [
        ['PRODUITS FINANCIERS:', '', '', '', ''],
        ['Revenus des titres de participation', '330 000', '250 000', '+32,0%', 'Dividendes filiales'],
        ['Intérêts sur prêts accordés', '520 000', '450 000', '+15,6%', 'Prêts dirigeants et tiers'],
        ['Intérêts sur placements', '280 000', '250 000', '+12,0%', 'DAT et bons du Trésor'],
        ['Reprises provisions financières', '300 000', '150 000', '+100,0%', 'Reprise prov. change'],
        ['Gains de change', '1 200 000', '1 000 000', '+20,0%', 'Opérations USD/EUR'],
        ['Produits nets cessions VMP', '100 000', '50 000', '+100,0%', 'Plus-values titres'],
        ['Total produits financiers', '2 730 000', '2 150 000', '+27,0%', ''],
        ['CHARGES FINANCIÈRES:', '', '', '', ''],
        ['Dotations provisions financières', '280 000', '100 000', '+180,0%', 'Prov. titres et change'],
        ['Intérêts sur emprunts bancaires', '3 500 000', '4 200 000', '-16,7%', 'Remboursements en cours'],
        ['Intérêts sur comptes courants associés', '150 000', '135 000', '+11,1%', 'Rémunération à 3%'],
        ['Intérêts sur crédit-bail', '550 000', '465 000', '+18,3%', 'Redevances financières'],
        ['Pertes de change', '600 000', '700 000', '-14,3%', 'Opérations devises'],
        ['Charges nettes cessions VMP', '50 000', '100 000', '-50,0%', 'Moins-values titres'],
        ['Total charges financières', '5 130 000', '5 700 000', '-10,0%', ''],
        ['RÉSULTAT FINANCIER', '-2 400 000', '-3 550 000', '+32,4%', 'Amélioration'],
      ]
    },
    details: {
      'Endettement financier': {
        'Total emprunts et dettes financières': '64 200 000',
        'Taux d\'intérêt moyen pondéré': '4,8%',
        'Charges d\'intérêts / CA': '2,0%',
        'Ratio d\'endettement': '41,6% (dettes financières / capitaux propres)'
      },
      'Opérations en devises': {
        'Gains de change réalisés': '1 200 000',
        'Pertes de change réalisées': '600 000',
        'Solde net de change': '+600 000 (gain)',
        'Provisions pour risque de change': '80 000'
      }
    }
  },
  20: {
    titre: 'Engagements hors bilan',
    alerteInfo: 'Les engagements hors bilan comprennent les engagements donnés et reçus par la société qui ne figurent pas au bilan mais qui sont susceptibles d\'affecter sa situation financière future.',
    tableau: {
      titre: 'État des engagements hors bilan',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Échéance', 'Bénéficiaire', 'Garanties'],
      lignes: [
        ['ENGAGEMENTS DONNÉS:', '', '', '', '', ''],
        ['Avals et cautions bancaires', '15 000 000', '12 000 000', '2027', 'Banques', 'Hypothèque terrain'],
        ['Hypothèques données', '50 000 000', '50 000 000', '2029', 'BANK A', 'Terrain + bâtiments'],
        ['Nantissements fonds de commerce', '20 000 000', '20 000 000', '2026', 'BANK B', 'Fonds de commerce'],
        ['Nantissement stocks', '8 000 000', '6 000 000', '2026', 'BANK B', 'Stocks marchandises'],
        ['Engagements crédit-bail', '2 500 000', '3 200 000', '2025-2027', 'Sociétés leasing', 'Matériel financé'],
        ['Cautions pour filiales', '14 000 000', '10 000 000', '2027', 'Banques filiales', 'Caution solidaire'],
        ['ENGAGEMENTS REÇUS:', '', '', '', '', ''],
        ['Cautions clients reçues', '5 000 000', '4 500 000', 'Variable', 'Clients', 'Bancaire'],
        ['Lignes de crédit non utilisées', '25 000 000', '20 000 000', '2025', 'BANK A/C', 'Nantissement'],
        ['Assurances crédit export', '10 000 000', '8 000 000', 'Permanente', 'COFACE', 'Police RC'],
      ]
    },
    details: {
      'Crédit-bail': {
        'Véhicules (3 contrats)': '1 500 000',
        'Matériel informatique (2 contrats)': '1 000 000',
        'Redevances restantes': '34 000 000'
      },
      'Engagements de loyers': {
        'Bail siège social': '3 600 000/an - échéance 2028',
        'Bail entrepôt': '2 400 000/an - échéance 2027',
        'Total loyers futurs': '24 000 000'
      }
    }
  },
  21: {
    titre: 'Effectif du personnel et frais de personnel',
    alerteInfo: 'L\'effectif est présenté en personnes physiques au 31/12/N. La masse salariale inclut les salaires bruts, primes et indemnités versées au personnel.',
    tableau: {
      titre: 'Évolution de l\'effectif par catégorie professionnelle',
      colonnes: ['Catégorie', 'Effectif début N', 'Embauches', 'Départs', 'Effectif fin N', 'Effectif N-1', 'Masse salariale N'],
      lignes: [
        ['Cadres supérieurs (cat. 10-12)', '5', '1', '0', '6', '5', '24 000 000'],
        ['Cadres moyens (cat. 7-9)', '12', '2', '1', '13', '12', '32 500 000'],
        ['Agents de maîtrise (cat. 5-6)', '8', '1', '0', '9', '8', '15 200 000'],
        ['Employés qualifiés (cat. 3-4)', '15', '3', '1', '17', '15', '16 800 000'],
        ['Employés (cat. 1-2)', '10', '2', '1', '11', '7', '8 500 000'],
        ['Ouvriers qualifiés', '12', '2', '1', '13', '12', '11 700 000'],
        ['Ouvriers et manœuvres', '6', '1', '0', '7', '6', '4 800 000'],
        ['Stagiaires et apprentis', '3', '2', '1', '4', '3', '1 200 000'],
        ['Personnel temporaire / intérimaire', '2', '4', '3', '3', '2', '2 400 000'],
        ['TOTAL', '73', '18', '8', '83', '70', '117 100 000'],
      ]
    },
    details: {
      'Répartition hommes / femmes': {
        'Hommes': '52 (62,7%)',
        'Femmes': '31 (37,3%)',
        'Ratio H/F cadres': '58% / 42%',
        'Ratio H/F non-cadres': '65% / 35%'
      },
      'Ancienneté moyenne': {
        'Cadres supérieurs': '8,5 ans',
        'Cadres moyens': '6,2 ans',
        'Agents de maîtrise': '5,8 ans',
        'Employés': '3,4 ans',
        'Ouvriers': '4,1 ans',
        'Moyenne générale': '5,2 ans'
      },
      'Formation professionnelle': {
        'Budget formation N': '1 850 000 (1,6% masse salariale)',
        'Budget formation N-1': '1 500 000 (1,4% masse salariale)',
        'Nombre de salariés formés': '38 (45,8% de l\'effectif)',
        'Heures de formation dispensées': '1 520 heures'
      },
      'Motifs de départ': {
        'Démissions': '4',
        'Fins de contrat CDD': '2',
        'Licenciements': '1',
        'Départ à la retraite': '1',
        'Taux de rotation': '10,3%'
      }
    }
  },
  22: {
    titre: 'Rémunération des dirigeants et mandataires sociaux',
    alerteInfo: 'Conformément aux dispositions de l\'Acte uniforme OHADA, les rémunérations et avantages de toute nature alloués aux dirigeants et mandataires sociaux sont détaillés ci-dessous.',
    tableau: {
      titre: 'Détail des rémunérations et avantages des dirigeants',
      colonnes: ['Bénéficiaire / Nature', 'Montant brut N', 'Charges sociales', 'Avantages en nature', 'Montant total N', 'Montant total N-1'],
      lignes: [
        ['DIRIGEANTS:', '', '', '', '', ''],
        ['Gérant - M. FONDATEUR', '9 600 000', '1 920 000', '480 000', '12 000 000', '11 400 000'],
        ['Directeur général - M. DIRECTEUR', '6 800 000', '1 360 000', '240 000', '8 400 000', '7 800 000'],
        ['Directeur financier - M. FINANCE', '5 200 000', '1 040 000', '160 000', '6 400 000', '6 000 000'],
        ['MANDATAIRES SOCIAUX:', '', '', '', '', ''],
        ['Jetons de présence - CA', '800 000', '0', '0', '800 000', '700 000'],
        ['Commissaires aux comptes', '2 500 000', '0', '0', '2 500 000', '2 300 000'],
        ['Conseil juridique permanent', '1 200 000', '0', '0', '1 200 000', '1 000 000'],
        ['TOTAL', '26 100 000', '4 320 000', '880 000', '31 300 000', '29 200 000'],
      ]
    },
    details: {
      'Avantages en nature': {
        'Véhicule de fonction gérant': '300 000 / an',
        'Véhicule de fonction DG': '240 000 / an',
        'Logement de fonction DG': '120 000 / an (prorata)',
        'Téléphonie et communication': '220 000 / an'
      },
      'Prêts aux dirigeants': {
        'Prêt M. FONDATEUR': '1 500 000 à 3% - échéance 2026',
        'Prêt M. DIRECTEUR': '800 000 à 3% - échéance 2025',
        'Solde total des prêts': '2 300 000'
      },
      'Jetons de présence': {
        'Nombre de séances CA': '4 séances en N',
        'Montant par séance': '200 000',
        'Nombre d\'administrateurs bénéficiaires': '4'
      },
      'Obligations déclaratives': 'Les rémunérations ci-dessus sont conformes aux conventions réglementées approuvées par l\'assemblée générale'
    }
  },
  23: {
    titre: 'Répartition du capital et droits de vote',
    alerteInfo: 'Le capital social est de 100 000 000 FCFA, divisé en 10 000 actions de 10 000 FCFA de valeur nominale chacune, entièrement souscrites et libérées.',
    tableau: {
      titre: 'Structure de l\'actionnariat au 31/12/N',
      colonnes: ['Actionnaire', 'Nb actions', 'Valeur nominale', 'Montant', '% Capital', '% Droits de vote', 'Catégorie'],
      lignes: [
        ['M. FONDATEUR (Gérant)', '5 000', '10 000', '50 000 000', '50,0%', '50,0%', 'Pers. physique'],
        ['Mme ASSOCIÉE', '1 500', '10 000', '15 000 000', '15,0%', '15,0%', 'Pers. physique'],
        ['M. PARTENAIRE', '1 000', '10 000', '10 000 000', '10,0%', '10,0%', 'Pers. physique'],
        ['INVESTISSEUR SA', '1 500', '10 000', '15 000 000', '15,0%', '15,0%', 'Pers. morale'],
        ['FONDS DÉVELOPPEMENT PME', '800', '10 000', '8 000 000', '8,0%', '8,0%', 'Pers. morale'],
        ['Salariés (plan actionnariat)', '200', '10 000', '2 000 000', '2,0%', '2,0%', 'Pers. physiques'],
        ['TOTAL', '10 000', '10 000', '100 000 000', '100,0%', '100,0%', '-'],
      ]
    },
    details: {
      'Historique du capital': {
        'Capital initial (création)': '10 000 000 (1 000 actions)',
        'Augmentation 2018': '40 000 000 (4 000 actions - apports numéraire)',
        'Augmentation 2020': '30 000 000 (3 000 actions - incorporation réserves)',
        'Augmentation 2022': '20 000 000 (2 000 actions - entrée investisseurs)'
      },
      'Pacte d\'actionnaires': {
        'Clause de préemption': 'Droit de préemption entre actionnaires fondateurs',
        'Clause d\'agrément': 'Agrément CA pour toute cession à un tiers',
        'Clause de sortie conjointe': 'Tag-along au bénéfice des minoritaires'
      },
      'Dividendes': {
        'Dividendes distribués N': '5 000 000 (500 FCFA / action)',
        'Dividendes distribués N-1': '4 000 000 (400 FCFA / action)',
        'Taux de distribution': '40% du résultat net'
      }
    }
  },
  24: {
    titre: 'Ventilation du chiffre d\'affaires',
    alerteInfo: 'Le chiffre d\'affaires est présenté selon une double ventilation : par zone géographique et par type d\'activité, conformément aux prescriptions du SYSCOHADA révisé.',
    tableau: {
      titre: 'Chiffre d\'affaires par secteur géographique et par activité',
      colonnes: ['Axe de ventilation', 'Montant N', '% N', 'Montant N-1', '% N-1', 'Évolution'],
      lignes: [
        ['PAR ZONE GÉOGRAPHIQUE:', '', '', '', '', ''],
        ['Marché national', '168 640 000', '80,0%', '157 920 000', '80,0%', '+6,8%'],
        ['Exportations CEDEAO', '21 080 000', '10,0%', '18 766 000', '9,5%', '+12,3%'],
        ['Exportations CEMAC', '12 648 000', '6,0%', '11 844 000', '6,0%', '+6,8%'],
        ['Autres exportations', '8 432 000', '4,0%', '8 870 000', '4,5%', '-4,9%'],
        ['PAR TYPE D\'ACTIVITÉ:', '', '', '', '', ''],
        ['Vente de marchandises', '125 600 000', '59,6%', '118 900 000', '60,2%', '+5,6%'],
        ['Production de biens', '65 200 000', '30,9%', '60 500 000', '30,6%', '+7,8%'],
        ['Prestations de services', '20 000 000', '9,5%', '18 000 000', '9,1%', '+11,1%'],
        ['TOTAL CHIFFRE D\'AFFAIRES', '210 800 000', '100,0%', '197 400 000', '100,0%', '+6,8%'],
      ]
    },
    details: {
      'Saisonnalité du chiffre d\'affaires': {
        '1er trimestre': '42 160 000 (20,0%) - Période basse',
        '2ème trimestre': '50 592 000 (24,0%) - Reprise activité',
        '3ème trimestre': '48 484 000 (23,0%) - Période intermédiaire',
        '4ème trimestre': '69 564 000 (33,0%) - Pic d\'activité'
      },
      'Concentration clients (Top 5)': {
        'CLIENT A': '33 728 000 (16,0%)',
        'CLIENT B': '25 296 000 (12,0%)',
        'CLIENT C': '19 972 000 (9,5%)',
        'CLIENT D': '14 756 000 (7,0%)',
        'CLIENT E': '10 540 000 (5,0%)',
        'Total Top 5': '104 292 000 (49,5% du CA)'
      },
      'Nouveaux marchés': {
        'Contrats remportés en N': '3 nouveaux clients majeurs',
        'CA généré par nouveaux clients': '15 200 000 (7,2% du CA)',
        'Taux de rétention clients': '92,5%',
        'Carnet de commandes au 31/12': '45 000 000 (2,6 mois de CA)'
      }
    }
  },
  25: {
    titre: 'Transactions avec les parties liées',
    alerteInfo: 'Conformément à l\'article 44 de l\'Acte uniforme OHADA, les transactions avec les parties liées sont réalisées à des conditions normales de marché. Les conventions réglementées ont été approuvées par l\'assemblée générale.',
    tableau: {
      titre: 'Détail des transactions avec les parties liées',
      colonnes: ['Partie liée', 'Relation', 'Achats/Charges', 'Ventes/Produits', 'Créances', 'Dettes', 'Engagements'],
      lignes: [
        ['M. FONDATEUR', 'Dirigeant', '12 000 000', '0', '1 500 000', '2 000 000', '0'],
        ['Mme ASSOCIÉE', 'Actionnaire', '0', '0', '0', '1 200 000', '0'],
        ['INVESTISSEUR SA', 'Actionnaire', '2 400 000', '3 500 000', '800 000', '600 000', '5 000 000'],
        ['FILIALE BENIN SARL', 'Filiale (75%)', '1 800 000', '4 200 000', '2 500 000', '300 000', '8 000 000'],
        ['FILIALE TOGO SA', 'Filiale (60%)', '2 200 000', '3 800 000', '1 800 000', '500 000', '6 000 000'],
        ['PARTENAIRE A SARL', 'Associée (30%)', '800 000', '600 000', '400 000', '800 000', '0'],
        ['Membres du CA', 'Administrateurs', '800 000', '0', '0', '200 000', '0'],
        ['TOTAL', '-', '20 000 000', '12 100 000', '7 000 000', '5 600 000', '19 000 000'],
      ]
    },
    details: {
      'Conventions réglementées': {
        'Convention de gestion M. FONDATEUR': 'Approuvée AG du 15/06/N',
        'Convention de trésorerie FILIALE BENIN': 'Taux 4,5% - Approuvée AG du 15/06/N',
        'Convention prestation INVESTISSEUR SA': 'Assistance technique - 2 400 000/an',
        'Convention sous-traitance FILIALE TOGO': 'Au prix du marché'
      },
      'Conditions des transactions': {
        'Prêts aux dirigeants': '1 500 000 à 3% l\'an (taux conventionnel)',
        'Comptes courants d\'associés': 'Rémunérés à 3% (taux fiscal autorisé)',
        'Ventes inter-groupe': 'Prix de marché avec marge réduite de 5%',
        'Achats inter-groupe': 'Conditions normales du marché'
      },
      'Soldes et garanties': {
        'Total créances parties liées': '7 000 000 (échéance < 1 an pour 80%)',
        'Total dettes parties liées': '5 600 000',
        'Garanties données aux filiales': '14 000 000 (cautions bancaires)',
        'Garanties reçues': '5 000 000 (nantissement parts)'
      }
    }
  },
  26: {
    titre: 'Engagements financiers donnés et reçus',
    alerteInfo: 'Les engagements financiers sont présentés hors bilan conformément aux prescriptions du SYSCOHADA révisé. Ils incluent les garanties données et reçues, les engagements de loyers et les promesses d\'investissement.',
    tableau: {
      titre: 'État détaillé des engagements hors bilan',
      colonnes: ['Nature de l\'engagement', 'Montant N', 'Montant N-1', 'Échéance', 'Bénéficiaire', 'Garantie'],
      lignes: [
        ['ENGAGEMENTS DONNÉS:', '', '', '', '', ''],
        ['Avals et cautions bancaires', '15 000 000', '12 000 000', '2027', 'BANK A / BANK B', 'Hypothèque'],
        ['Hypothèques données', '50 000 000', '50 000 000', '2029', 'BANK A', 'Terrain + bâtiments'],
        ['Nantissements fonds de commerce', '20 000 000', '20 000 000', '2026', 'BANK B', 'Fonds commerce'],
        ['Nantissement stocks et créances', '8 000 000', '6 000 000', '2026', 'BANK B', 'Stocks'],
        ['Cautions données pour filiales', '14 000 000', '10 000 000', '2027', 'Banques filiales', 'Solidaire'],
        ['Engagements crédit-bail', '2 500 000', '3 200 000', '2025-2027', 'Leasing', 'Matériel'],
        ['ENGAGEMENTS REÇUS:', '', '', '', '', ''],
        ['Cautions clients reçues', '5 000 000', '4 500 000', 'Variable', 'Clients', 'Bancaire'],
        ['Lignes de crédit non utilisées', '25 000 000', '20 000 000', '2025', 'BANK A/C', 'Nantissement'],
        ['Assurances crédit export', '10 000 000', '8 000 000', 'Permanente', 'COFACE', 'Police RC'],
        ['Garantie maison mère', '15 000 000', '15 000 000', '2026', 'INVESTISSEUR SA', 'Lettre confort'],
      ]
    },
    details: {
      'Engagements de loyers non résiliables': {
        'Bail siège social': '3 600 000/an - échéance 2028 (reste 14 400 000)',
        'Bail entrepôt zone industrielle': '2 400 000/an - échéance 2027 (reste 7 200 000)',
        'Bail bureau annexe': '1 200 000/an - échéance 2026 (reste 2 400 000)',
        'Total loyers futurs': '24 000 000'
      },
      'Engagements d\'investissement': {
        'Commandes d\'équipements en cours': '5 500 000 (livraison T1 N+1)',
        'Projet extension usine': '18 000 000 (financement validé)',
        'Total engagements investissement': '23 500 000'
      },
      'Engagements contractuels divers': {
        'Contrats de maintenance': '1 800 000 / an',
        'Contrats d\'assurance': '2 200 000 / an',
        'Contrats prestations informatiques': '960 000 / an'
      }
    }
  },
  27: {
    titre: 'Crédit-bail et contrats assimilés',
    alerteInfo: 'Les biens utilisés dans le cadre de contrats de crédit-bail ne sont pas inscrits au bilan. Les redevances sont comptabilisées en charges de l\'exercice. Le détail ci-dessous présente les informations de retraitement.',
    tableau: {
      titre: 'État des contrats de crédit-bail en cours',
      colonnes: ['Description du bien', 'Date contrat', 'Durée', 'Valeur d\'origine', 'Redevances N', 'Cumul redevances', 'Valeur résiduelle', 'Option achat'],
      lignes: [
        ['Véhicule utilitaire TOYOTA', '01/03/2022', '48 mois', '8 500 000', '2 550 000', '7 650 000', '850 000', '850 000'],
        ['Véhicule berline direction', '15/06/2023', '36 mois', '12 000 000', '4 800 000', '7 200 000', '1 200 000', '1 200 000'],
        ['Photocopieur professionnel', '01/01/2023', '36 mois', '3 500 000', '1 400 000', '2 800 000', '350 000', '350 000'],
        ['Serveur informatique', '01/07/2023', '36 mois', '4 200 000', '1 680 000', '2 520 000', '420 000', '420 000'],
        ['Chariot élévateur', '01/09/2022', '48 mois', '6 800 000', '2 040 000', '5 100 000', '680 000', '680 000'],
        ['Machine d\'emballage', '01/04/2024', '60 mois', '15 000 000', '3 600 000', '3 600 000', '1 500 000', '1 500 000'],
        ['TOTAL', '-', '-', '50 000 000', '16 070 000', '28 870 000', '5 000 000', '5 000 000'],
      ]
    },
    details: {
      'Échéancier des redevances restantes': {
        'N+1 (2025)': '14 200 000',
        'N+2 (2026)': '10 800 000',
        'N+3 (2027)': '5 400 000',
        'N+4 (2028)': '3 600 000',
        'Total redevances restantes': '34 000 000'
      },
      'Retraitement en immobilisation (si acquisition)': {
        'Valeur des biens financés': '50 000 000',
        'Amortissements théoriques cumulés': '22 500 000',
        'Valeur nette théorique': '27 500 000',
        'Impact résultat si retraitement': '-1 200 000'
      },
      'Contrats arrivant à échéance en N+1': {
        'Photocopieur professionnel': 'Échéance 12/2025 - Levée option probable',
        'Véhicule utilitaire TOYOTA': 'Échéance 02/2026 - Renouvellement prévu'
      }
    }
  },
  28: {
    titre: 'Tableau des échéances des créances et dettes',
    alerteInfo: 'Ce tableau présente la ventilation par échéance de l\'ensemble des créances et dettes de la société au 31/12/N, conformément aux exigences du SYSCOHADA révisé.',
    tableau: {
      titre: 'Ventilation par échéance au 31/12/N',
      colonnes: ['Éléments', 'Montant total', '< 3 mois', '3 mois à 1 an', '1 à 5 ans', '> 5 ans'],
      lignes: [
        ['ACTIF - CRÉANCES:', '', '', '', '', ''],
        ['Créances clients et rattachés', '33 200 000', '25 000 000', '7 400 000', '800 000', '0'],
        ['Autres créances d\'exploitation', '9 200 000', '5 200 000', '3 200 000', '800 000', '0'],
        ['Créances sur immobilisations', '800 000', '0', '800 000', '0', '0'],
        ['Prêts au personnel', '1 500 000', '200 000', '600 000', '700 000', '0'],
        ['Créances fiscales (TVA, IS)', '5 000 000', '3 200 000', '1 800 000', '0', '0'],
        ['Total créances', '49 700 000', '33 600 000', '13 800 000', '2 300 000', '0'],
        ['PASSIF - DETTES:', '', '', '', '', ''],
        ['Emprunts et dettes financières', '64 200 000', '4 500 000', '11 000 000', '41 700 000', '7 000 000'],
        ['Dettes fournisseurs et rattachés', '30 500 000', '24 500 000', '6 000 000', '0', '0'],
        ['Dettes fiscales et sociales', '19 300 000', '12 300 000', '7 000 000', '0', '0'],
        ['Autres dettes', '14 200 000', '6 200 000', '5 000 000', '3 000 000', '0'],
        ['Total dettes', '128 200 000', '47 500 000', '29 000 000', '44 700 000', '7 000 000'],
      ]
    },
    details: {
      'Créances en souffrance': {
        '30 à 60 jours': '2 400 000',
        '60 à 90 jours': '1 200 000',
        'Plus de 90 jours': '3 200 000 (dont 2 400 000 provisionnés)',
        'Total créances en souffrance': '6 800 000 (20,5% des créances clients)'
      },
      'Dettes à taux variable': {
        'Emprunt BANK A - BCEAO + 2%': '15 000 000',
        'Emprunt BANK C - BCEAO + 1,8%': '8 000 000',
        'Total dettes à taux variable': '23 000 000 (35,8% des dettes financières)'
      },
      'Ratios de liquidité': {
        'Ratio liquidité générale': '1,28 (actif CT / passif CT)',
        'Ratio liquidité réduite': '0,95 (hors stocks)',
        'Ratio liquidité immédiate': '0,17 (trésorerie / passif CT)'
      }
    }
  },
  29: {
    titre: 'Ventilation charges et produits par destination',
    alerteInfo: 'Les charges d\'exploitation sont présentées selon une double classification : par destination (fonction) et par nature, permettant une analyse complète de la structure des coûts.',
    tableau: {
      titre: 'Répartition des charges d\'exploitation par fonction et par nature',
      colonnes: ['Fonction / Nature', 'Montant N', '% Total', 'Montant N-1', '% Total N-1', 'Variation'],
      lignes: [
        ['PAR DESTINATION:', '', '', '', '', ''],
        ['Coût de production / Achat marchandises', '98 500 000', '51,2%', '92 800 000', '51,6%', '+6,1%'],
        ['Charges commerciales et marketing', '28 400 000', '14,8%', '25 200 000', '14,0%', '+12,7%'],
        ['Charges administratives et générales', '18 600 000', '9,7%', '17 100 000', '9,5%', '+8,8%'],
        ['Charges de personnel', '48 500 000', '25,2%', '45 200 000', '25,1%', '+7,3%'],
        ['Total par destination', '194 000 000', '100,0%', '180 300 000', '100,0%', '+7,6%'],
        ['PAR NATURE:', '', '', '', '', ''],
        ['Achats matières et marchandises', '95 000 000', '49,0%', '89 500 000', '49,6%', '+6,1%'],
        ['Variation de stocks', '-3 300 000', '-1,7%', '-1 200 000', '-0,7%', '+175,0%'],
        ['Transports et déplacements', '8 500 000', '4,4%', '7 800 000', '4,3%', '+9,0%'],
        ['Services extérieurs', '12 400 000', '6,4%', '11 200 000', '6,2%', '+10,7%'],
        ['Impôts et taxes', '6 800 000', '3,5%', '6 200 000', '3,4%', '+9,7%'],
        ['Charges de personnel', '48 500 000', '25,0%', '45 200 000', '25,1%', '+7,3%'],
        ['Autres charges d\'exploitation', '26 100 000', '13,5%', '21 600 000', '12,0%', '+20,8%'],
        ['Total par nature', '194 000 000', '100,0%', '180 300 000', '100,0%', '+7,6%'],
      ]
    },
    details: {
      'Charges commerciales détaillées': {
        'Publicité et communication': '8 200 000',
        'Commissions sur ventes': '6 500 000',
        'Transport sur ventes': '5 800 000',
        'Frais de représentation': '3 400 000',
        'Salons et foires': '2 200 000',
        'Emballages commerciaux': '2 300 000'
      },
      'Charges administratives détaillées': {
        'Loyers et charges locatives': '7 200 000',
        'Honoraires et prestations': '4 800 000',
        'Fournitures de bureau': '2 400 000',
        'Télécommunications': '1 800 000',
        'Assurances': '2 400 000'
      },
      'Indicateurs de performance': {
        'Marge brute': '115 800 000 (54,9% du CA)',
        'Marge brute N-1': '107 900 000 (54,7% du CA)',
        'Charges de structure / CA': '22,3%',
        'Productivité par employé': '2 539 759 (CA / effectif)'
      }
    }
  },
  30: {
    titre: 'Produits à recevoir et charges à payer',
    alerteInfo: 'Les produits à recevoir et charges à payer correspondent aux régularisations de fin d\'exercice permettant de rattacher les charges et produits à l\'exercice auquel ils se rapportent (principe de séparation des exercices).',
    tableau: {
      titre: 'Détail des régularisations de fin d\'exercice',
      colonnes: ['Nature', 'Charges à payer N', 'Charges N-1', 'Produits à recevoir N', 'Produits N-1'],
      lignes: [
        ['Intérêts courus sur emprunts', '1 200 000', '1 050 000', '0', '0'],
        ['Intérêts courus sur prêts et placements', '0', '0', '180 000', '150 000'],
        ['Fournisseurs - factures non parvenues', '2 700 000', '2 000 000', '0', '0'],
        ['Clients - factures à établir', '0', '0', '1 500 000', '1 200 000'],
        ['Commissions à payer aux agents', '450 000', '380 000', '0', '0'],
        ['Commissions à recevoir', '0', '0', '520 000', '450 000'],
        ['Honoraires à payer (audit, conseil)', '680 000', '550 000', '0', '0'],
        ['Gratifications et primes personnel', '1 800 000', '1 500 000', '0', '0'],
        ['Congés payés à provisionner', '1 200 000', '1 100 000', '0', '0'],
        ['Indemnités d\'assurance à recevoir', '0', '0', '350 000', '0'],
        ['TOTAL', '8 030 000', '6 580 000', '2 550 000', '1 800 000'],
      ]
    },
    details: {
      'Charges à payer significatives': {
        'Factures non parvenues': '2 700 000 - Basé sur bons de livraison non facturés',
        'Gratifications personnel': '1 800 000 - Prime annuelle (13ème mois prorata)',
        'Congés payés': '1 200 000 - Droits acquis non pris au 31/12',
        'Intérêts courus emprunts': '1 200 000 - Prorata temporis'
      },
      'Produits à recevoir significatifs': {
        'Factures à établir clients': '1 500 000 - Prestations réalisées en décembre N',
        'Commissions à recevoir': '520 000 - Commissions T4 apport d\'affaires',
        'Indemnités assurance': '350 000 - Sinistre véhicule déclaré déc. N'
      },
      'Évolution des régularisations': {
        'Variation charges à payer': '+22,0% (lié à la croissance de l\'activité)',
        'Variation produits à recevoir': '+41,7% (nouvelles commissions et sinistre)',
        'Impact net sur résultat': '-5 480 000 (charges nettes de régularisation)'
      }
    }
  },
  31: {
    titre: 'Charges et produits constatés d\'avance',
    alerteInfo: 'Les charges et produits constatés d\'avance sont comptabilisés en application du principe de séparation des exercices. Ils correspondent à des charges et produits enregistrés au cours de l\'exercice mais se rapportant à l\'exercice suivant.',
    tableau: {
      titre: 'Détail des charges et produits constatés d\'avance',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Période couverte', 'Date rattachement', 'Variation'],
      lignes: [
        ['CHARGES CONSTATÉES D\'AVANCE:', '', '', '', '', ''],
        ['Assurances payées d\'avance', '420 000', '380 000', 'Janv-Mars N+1', 'Exercice N+1', '+10,5%'],
        ['Loyers payés d\'avance', '300 000', '300 000', 'Janvier N+1', 'Exercice N+1', '0,0%'],
        ['Abonnements et cotisations', '85 000', '70 000', 'Janv-Juin N+1', 'Exercice N+1', '+21,4%'],
        ['Maintenance informatique prépayée', '180 000', '150 000', 'Janv-Mars N+1', 'Exercice N+1', '+20,0%'],
        ['Publicité campagne prépayée', '250 000', '0', 'Janv-Fév N+1', 'Exercice N+1', 'Nouveau'],
        ['Sous-total CCA', '1 235 000', '900 000', '-', '-', '+37,2%'],
        ['PRODUITS CONSTATÉS D\'AVANCE:', '', '', '', '', ''],
        ['Abonnements clients facturés d\'avance', '480 000', '350 000', 'Janv-Mars N+1', 'Exercice N+1', '+37,1%'],
        ['Prestations facturées d\'avance', '320 000', '250 000', 'Janv-Fév N+1', 'Exercice N+1', '+28,0%'],
        ['Loyers perçus d\'avance (sous-location)', '150 000', '150 000', 'Janvier N+1', 'Exercice N+1', '0,0%'],
        ['Subvention d\'exploitation prorata', '200 000', '0', 'Janv-Juin N+1', 'Exercice N+1', 'Nouveau'],
        ['Sous-total PCA', '1 150 000', '750 000', '-', '-', '+53,3%'],
      ]
    },
    details: {
      'Principe de comptabilisation': {
        'Méthode': 'Rattachement à l\'exercice concerné (séparation des exercices)',
        'Contrôle': 'Revue analytique des contrats à cheval sur deux exercices',
        'Validation': 'Vérification systématique des factures > 100 000 FCFA'
      },
      'CCA par nature de charges': {
        'Charges de fonctionnement': '805 000 (65,2%)',
        'Charges commerciales': '250 000 (20,2%)',
        'Autres charges': '180 000 (14,6%)'
      },
      'Impact sur le résultat': {
        'CCA (report charges sur N+1)': '+ 1 235 000 sur résultat N',
        'PCA (report produits sur N+1)': '- 1 150 000 sur résultat N',
        'Impact net': '+ 85 000 sur résultat N'
      }
    }
  },
  32: {
    titre: 'Conversion des opérations en devises',
    alerteInfo: 'La monnaie fonctionnelle est le Franc CFA (XOF), arrimé à l\'Euro par une parité fixe (1 EUR = 655,957 FCFA). Les créances et dettes en devises sont converties au cours de clôture. Les écarts de conversion sont comptabilisés au bilan.',
    tableau: {
      titre: 'Positions en devises et écarts de conversion',
      colonnes: ['Devise', 'Nature', 'Montant devise', 'Cours clôture', 'Contre-valeur FCFA', 'Cours historique', 'Écart conversion'],
      lignes: [
        ['ACTIF EN DEVISES:', '', '', '', '', '', ''],
        ['EUR', 'Créances clients export', '18 500', '655,957', '12 135 204', '655,957', '0'],
        ['USD', 'Créances clients export', '8 200', '585,250', '4 799 050', '592,100', '-56 170'],
        ['USD', 'Avoirs bancaires', '5 000', '585,250', '2 926 250', '590,000', '-23 750'],
        ['GBP', 'Créances diverses', '2 500', '742,800', '1 857 000', '738,200', '+11 500'],
        ['PASSIF EN DEVISES:', '', '', '', '', '', ''],
        ['EUR', 'Dettes fournisseurs import', '25 300', '655,957', '16 595 712', '655,957', '0'],
        ['USD', 'Dettes fournisseurs import', '12 000', '585,250', '7 023 000', '580,500', '+57 000'],
        ['USD', 'Emprunt fournisseur étranger', '15 000', '585,250', '8 778 750', '575,000', '+153 750'],
        ['CNY', 'Dettes fournisseurs Chine', '45 000', '80,350', '3 615 750', '82,100', '-78 750'],
        ['TOTAL ÉCARTS DE CONVERSION', '', '', '', '', '', '+63 580'],
      ]
    },
    details: {
      'Politique de gestion du risque de change': {
        'Devise fonctionnelle': 'Franc CFA (XOF) - Parité fixe avec EUR',
        'Exposition nette USD': '-13 800 USD (position courte)',
        'Exposition nette EUR': '-6 800 EUR (position courte)',
        'Couverture de change': 'Aucun instrument de couverture en N'
      },
      'Écarts de conversion': {
        'Pertes latentes (écarts actif)': '79 920 FCFA',
        'Gains latents (écarts passif)': '143 500 FCFA',
        'Provision risque de change': '79 920 FCFA (couverture intégrale)',
        'Gains de change réalisés N': '1 200 000 FCFA',
        'Pertes de change réalisées N': '600 000 FCFA'
      },
      'Méthode de conversion': {
        'Créances et dettes': 'Cours de clôture au 31/12/N',
        'Opérations de l\'exercice': 'Cours du jour de la transaction',
        'Immobilisations en devises': 'Cours historique d\'acquisition',
        'Zone FCFA (EUR)': 'Parité fixe - pas d\'écart'
      }
    }
  },
  33: {
    titre: 'Événements postérieurs à la clôture',
    alerteInfo: 'Les événements postérieurs à la date de clôture sont analysés selon qu\'ils fournissent des informations sur des conditions existant à la clôture (ajustants) ou sur des conditions apparues postérieurement (non ajustants).',
    contenu: {
      '33.1 Événements ajustants': {
        description: 'Événements fournissant des informations sur des conditions existant à la date de clôture :',
        details: [
          'Règlement du litige commercial A en janvier N+1 pour 1 200 000 FCFA (provision constituée à 1 500 000)',
          'Recouvrement partiel créance CLIENT DOUTEUX X pour 400 000 FCFA sur 800 000 provisionnés',
          'Ajustement provision stocks : destruction de 150 000 FCFA de marchandises périmées identifiées en janvier'
        ]
      },
      '33.2 Événements non ajustants': {
        description: 'Événements significatifs survenus après la clôture ne remettant pas en cause les comptes arrêtés :',
        details: [
          'Signature d\'un nouveau contrat commercial majeur en février N+1 (CA estimé : 15 000 000 sur 24 mois)',
          'Obtention d\'une nouvelle ligne de crédit de 10 000 000 auprès de BANK C en janvier N+1',
          'Décision du conseil d\'administration de procéder à l\'extension de l\'usine (investissement : 18 000 000)',
          'Aucune pandémie, catastrophe naturelle ou événement géopolitique majeur affectant l\'activité'
        ]
      },
      '33.3 Continuité d\'exploitation': {
        description: 'La direction confirme que l\'hypothèse de continuité d\'exploitation reste appropriée :',
        details: [
          'Résultat net positif pour le 5ème exercice consécutif',
          'Trésorerie nette positive de 13 000 000',
          'Carnet de commandes solide à 45 000 000',
          'Lignes de crédit disponibles de 25 000 000',
          'Aucune incertitude significative identifiée'
        ]
      },
      '33.4 Dates clés': {
        description: 'Calendrier post-clôture :',
        details: [
          'Date d\'arrêté des comptes par le conseil d\'administration : 15 mars N+1',
          'Date prévue de l\'assemblée générale ordinaire : 30 juin N+1',
          'Date limite de dépôt au greffe : 30 juillet N+1'
        ]
      }
    }
  },
  34: {
    titre: 'Filiales et participations',
    alerteInfo: 'Le tableau ci-dessous présente les informations relatives aux filiales (contrôle > 50%), aux entreprises associées (influence notable 20-50%) et aux autres participations. Les comptes ne sont pas consolidés (seuils non atteints).',
    tableau: {
      titre: 'Tableau des filiales et participations',
      colonnes: ['Société', 'Siège', 'Capital', '% détenu', 'Capitaux propres', 'CA N', 'Résultat N', 'Val. comptable', 'Dividendes'],
      lignes: [
        ['FILIALES (> 50%):', '', '', '', '', '', '', '', ''],
        ['FILIALE BENIN SARL', 'Cotonou', '25 000 000', '75%', '32 000 000', '45 000 000', '2 100 000', '18 750 000', '150 000'],
        ['FILIALE TOGO SA', 'Lomé', '50 000 000', '60%', '58 000 000', '62 000 000', '3 200 000', '30 000 000', '180 000'],
        ['PARTICIPATIONS (20-50%):', '', '', '', '', '', '', '', ''],
        ['PARTENAIRE A SARL', 'Abidjan', '10 000 000', '30%', '14 500 000', '18 000 000', '1 800 000', '3 000 000', '0'],
        ['SA PARTICIPÉE B', 'Dakar', '40 000 000', '25%', '42 000 000', '55 000 000', '2 500 000', '10 000 000', '0'],
        ['AUTRES TITRES (< 20%):', '', '', '', '', '', '', '', ''],
        ['SCI IMMOBILIÈRE X', 'Abidjan', '20 000 000', '10%', '22 000 000', '3 600 000', '800 000', '2 000 000', '0'],
        ['GIE LOGISTIQUE WEST', 'Abidjan', '5 000 000', '15%', '5 500 000', '12 000 000', '600 000', '750 000', '0'],
        ['TOTAL', '-', '-', '-', '-', '-', '-', '64 500 000', '330 000'],
      ]
    },
    details: {
      'Informations financières filiales': {
        'FILIALE BENIN SARL': 'Distribution - Résultat en hausse de 15% vs N-1',
        'FILIALE TOGO SA': 'Production et distribution - Marché en croissance',
        'Quote-part résultat filiales': '2 415 000 (proportionnelle)',
        'Dividendes reçus en N': '330 000'
      },
      'Provisions sur titres': {
        'Provision FILIALE BENIN': '0 (capitaux propres > valeur comptable)',
        'Provision FILIALE TOGO': '0 (capitaux propres > valeur comptable)',
        'Provision PARTENAIRE A': '0 (capitaux propres > valeur comptable)',
        'Total provisions': '0'
      },
      'Opérations intra-groupe': {
        'Ventes aux filiales': '8 000 000',
        'Achats aux filiales': '4 000 000',
        'Créances intra-groupe': '4 300 000',
        'Dettes intra-groupe': '800 000',
        'Consolidation': 'Non consolidé (seuils non atteints)'
      },
      'Événements significatifs': {
        'FILIALE TOGO SA': 'Augmentation de capital de 10 000 000 prévue en N+1',
        'SA PARTICIPÉE B': 'Introduction en bourse envisagée horizon N+2'
      }
    }
  },
  35: {
    titre: 'Informations complémentaires et diverses',
    alerteInfo: 'Cette note regroupe les informations complémentaires requises par le SYSCOHADA révisé et non présentées dans les notes précédentes.',
    tableau: {
      titre: 'Honoraires des conseils et prestataires externes',
      colonnes: ['Prestataire / Nature', 'Mission', 'Montant N', 'Montant N-1', 'Variation'],
      lignes: [
        ['CAC - Certification', 'Audit légal', '2 000 000', '1 800 000', '+11,1%'],
        ['CAC - Autres missions', 'Missions connexes', '500 000', '500 000', '0,0%'],
        ['Cabinet juridique', 'Conseil et contentieux', '1 200 000', '1 000 000', '+20,0%'],
        ['Cabinet fiscal', 'Conseil fiscal et déclarations', '800 000', '750 000', '+6,7%'],
        ['Consultant stratégie', 'Plan de développement', '1 500 000', '0', 'Nouveau'],
        ['Expert informatique', 'Migration système ERP', '2 200 000', '1 800 000', '+22,2%'],
        ['Notaire', 'Actes et formalités', '350 000', '300 000', '+16,7%'],
        ['TOTAL HONORAIRES', '-', '8 550 000', '6 150 000', '+39,0%'],
      ]
    },
    details: {
      'Litiges et contentieux en cours': {
        'Litige commercial CLIENT Y': 'Réclamé : 3 500 000 - Provisionné : 1 500 000 - Transaction amiable probable',
        'Litige social ex-salarié Z': 'Réclamé : 1 200 000 - Provisionné : 800 000 - Audience T2 N+1',
        'Contrôle fiscal N-2 et N-1': 'En cours - Aucun redressement notifié - Provision risque : 200 000',
        'Total provisions litiges': '2 500 000'
      },
      'Engagements retraite et avantages personnel': {
        'Régime de retraite': 'CNPS (pas d\'engagement à prestations définies)',
        'Indemnités de départ légales': 'Estimation actuarielle : 4 500 000 (non provisionné)',
        'Assurance maladie groupe': '1 800 000/an (couverture 83 salariés)',
        'Avantages postérieurs à l\'emploi': 'Néant hors obligations légales'
      },
      'Politique environnementale et RSE': {
        'Certification': 'Conformité ISO 14001 maintenue',
        'Investissements environnementaux N': '2 500 000 (traitement déchets et recyclage)',
        'Provisions environnementales': 'Néant (aucune obligation de remise en état)',
        'Bilan carbone': 'En cours d\'élaboration - Publication N+1'
      },
      'Autres informations': {
        'Subventions reçues': '1 500 000 (subvention FDFP formation)',
        'Effectif moyen annuel': '78 personnes (ETP)',
        'Date d\'arrêté des comptes': '15 mars N+1 par le CA',
        'Risque de crédit': 'Top client < 16% du CA - diversification satisfaisante'
      }
    }
  },
  37: {
    titre: 'Informations complémentaires',
    alerteInfo: 'Cette note présente les informations complémentaires exigées par l\'administration fiscale et non couvertes par les notes précédentes, conformément au Code Général des Impôts et au SYSCOHADA révisé.',
    tableau: {
      titre: 'Récapitulatif des informations complémentaires obligatoires',
      colonnes: ['Rubrique', 'Référence légale', 'Montant / Information N', 'Montant / Information N-1', 'Observations'],
      lignes: [
        ['Chiffre d\'affaires HT', 'Art. 35 CGI', '210 800 000', '197 400 000', 'Progression +6,8%'],
        ['Résultat comptable avant impôt', 'Art. 36 CGI', '16 800 000', '14 200 000', '+18,3%'],
        ['Résultat fiscal imposable', 'Art. 38 CGI', '14 333 333', '11 666 667', 'Après réintégrations'],
        ['Impôt sur les sociétés', 'Art. 4 CGI', '4 300 000', '3 500 000', 'Taux 30%'],
        ['TVA collectée sur l\'exercice', 'Art. 341 CGI', '37 944 000', '35 532 000', 'Taux 18%'],
        ['TVA déductible sur l\'exercice', 'Art. 355 CGI', '32 744 000', '30 732 000', 'Immobilisations + charges'],
        ['Patente et licences', 'Art. 263 CGI', '1 800 000', '1 650 000', '+9,1%'],
        ['Taxe foncière', 'Art. 150 CGI', '450 000', '450 000', 'Stable'],
        ['Retenues à la source (IRPP)', 'Art. 116 CGI', '4 800 000', '4 200 000', '+14,3%'],
        ['Contribution employeur CNPS', 'Code trav.', '6 300 000', '5 850 000', '+7,7%'],
        ['Amendes et pénalités (non déductibles)', 'Art. 39 CGI', '120 000', '80 000', 'Réintégrées au résultat fiscal'],
        ['Dons et libéralités', 'Art. 39 CGI', '350 000', '200 000', 'Déductibles dans la limite de 0,5% CA'],
      ]
    },
    details: {
      'Réintégrations fiscales': {
        'Amendes et pénalités': '120 000',
        'Amortissements excédentaires': '0',
        'Charges non déductibles (somptuaires)': '250 000',
        'Provisions non déductibles': '200 000',
        'Total réintégrations': '570 000'
      },
      'Déductions fiscales': {
        'Reprises de provisions imposées': '300 000',
        'Plus-values nettes à long terme': '0',
        'Dividendes (régime mère-fille)': '330 000',
        'Total déductions': '630 000'
      },
      'Crédits et avantages fiscaux': {
        'Crédit d\'impôt investissement': 'Néant',
        'Zone franche': 'Non applicable',
        'Exonérations temporaires': 'Néant',
        'Régime d\'agrément': 'Non applicable'
      },
      'Obligations déclaratives': {
        'DSF (Déclaration Statistique et Fiscale)': 'Déposée le 15/03/N+1',
        'DAS (Déclaration Annuelle des Salaires)': 'Déposée le 31/01/N+1',
        'État 301 (Honoraires, commissions)': 'Déposé le 15/03/N+1',
        'État 302 (Fournisseurs)': 'Déposé le 15/03/N+1',
        'Conformité générale': 'Toutes obligations déclaratives respectées'
      }
    }
  },
  38: {
    titre: 'Déclarations spéciales',
    alerteInfo: 'Cette note regroupe les informations relatives aux déclarations fiscales spéciales et annexes obligatoires : état des honoraires, commissions et courtages, état des fournisseurs, état des subventions, et déclarations sociales.',
    tableau: {
      titre: 'Synthèse des déclarations spéciales déposées',
      colonnes: ['Déclaration', 'Référence', 'Période', 'Date de dépôt', 'Montant déclaré', 'Statut'],
      lignes: [
        ['DÉCLARATIONS FISCALES:', '', '', '', '', ''],
        ['État 301 - Honoraires, commissions', 'Art. 49 CGI', 'Exercice N', '15/03/N+1', '8 550 000', 'Déposé'],
        ['État 302 - Fournisseurs > 1 000 000', 'Art. 49 CGI', 'Exercice N', '15/03/N+1', '85 000 000', 'Déposé'],
        ['Relevé des prix de transfert', 'Art. 19bis CGI', 'Exercice N', '15/03/N+1', '32 100 000', 'Déposé'],
        ['Déclaration de TVA (récap. annuelle)', 'Art. 370 CGI', 'Exercice N', '15/01/N+1', '5 200 000', 'Déposé'],
        ['Déclaration patente', 'Art. 263 CGI', 'Exercice N', '31/01/N+1', '1 800 000', 'Déposé'],
        ['DÉCLARATIONS SOCIALES:', '', '', '', '', ''],
        ['DAS - Déclaration annuelle salaires', 'Code travail', 'Exercice N', '31/01/N+1', '48 500 000', 'Déposé'],
        ['DISA - Déclaration individuelle salaires', 'CNPS', 'Exercice N', '31/01/N+1', '48 500 000', 'Déposé'],
        ['Déclaration FDFP', 'Loi formation', 'Exercice N', '28/02/N+1', '500 000', 'Déposé'],
        ['DÉCLARATIONS STATISTIQUES:', '', '', '', '', ''],
        ['DSF - Direction Statistique', 'Loi stats', 'Exercice N', '15/03/N+1', '-', 'Déposé'],
        ['Questionnaire INS annuel', 'Décret INS', 'Exercice N', '31/03/N+1', '-', 'Déposé'],
      ]
    },
    details: {
      'État 301 - Honoraires et commissions versés': {
        'Cabinet juridique LEGIS & ASSOCIÉS': '1 200 000',
        'Cabinet fiscal TAX CONSULT': '800 000',
        'CAC - Cabinet AUDIT PLUS': '2 500 000',
        'Consultant stratégie DEVCO': '1 500 000',
        'Expert informatique TECHPRO': '2 200 000',
        'Notaire Me KOFFI': '350 000',
        'Total honoraires déclarés': '8 550 000'
      },
      'État 302 - Principaux fournisseurs (> 1 000 000)': {
        'FOURNISSEUR A (marchandises)': '28 000 000',
        'FOURNISSEUR B (matières premières)': '22 500 000',
        'FOURNISSEUR C (emballages)': '8 500 000',
        'FOURNISSEUR D (transport)': '6 200 000',
        'FOURNISSEUR E (énergie)': '4 800 000',
        'Autres fournisseurs > 1M': '15 000 000',
        'Total fournisseurs déclarés': '85 000 000'
      },
      'Prix de transfert (parties liées)': {
        'Méthode utilisée': 'Prix comparable sur marché libre (CUP)',
        'Ventes aux filiales': '8 000 000 (marge 5% inférieure au marché)',
        'Achats aux filiales': '4 000 000 (conditions normales)',
        'Prestations INVESTISSEUR SA': '2 400 000 (assistance technique)',
        'Documentation disponible': 'Oui - Dossier prix de transfert à jour'
      },
      'Subventions et aides perçues': {
        'Subvention FDFP (formation)': '1 500 000',
        'Aides à l\'emploi': 'Néant',
        'Subventions d\'investissement': 'Néant',
        'Total subventions': '1 500 000'
      }
    }
  },
  39: {
    titre: 'Attestations et certifications',
    alerteInfo: 'Cette note regroupe les attestations, certifications et rapports des organes de contrôle légal ainsi que les engagements de conformité de la société.',
    contenu: {
      '39.1 Certification des commissaires aux comptes': {
        description: 'Le rapport général du commissaire aux comptes sur les comptes annuels de l\'exercice clos le 31 décembre N porte sur :',
        details: [
          'Opinion : Certification sans réserve des comptes annuels',
          'Les comptes annuels sont réguliers et sincères et donnent une image fidèle du patrimoine, de la situation financière et du résultat de la société',
          'Cabinet : AUDIT PLUS - Représenté par M. AUDITEUR, inscrit au tableau de l\'Ordre des Experts-Comptables',
          'Date du rapport : 15 mars N+1',
          'Honoraires d\'audit légal : 2 000 000 FCFA',
          'Honoraires missions connexes : 500 000 FCFA'
        ]
      },
      '39.2 Rapport spécial sur les conventions réglementées': {
        description: 'Le commissaire aux comptes a établi son rapport spécial sur les conventions visées aux articles 438 et suivants de l\'Acte uniforme OHADA :',
        details: [
          'Convention de rémunération du gérant M. FONDATEUR : 12 000 000 FCFA/an - Autorisée par AG du 15/06/N',
          'Convention de compte courant associé Mme ASSOCIÉE : Rémunéré à 3% - Autorisée par AG du 15/06/N',
          'Convention d\'assistance technique INVESTISSEUR SA : 2 400 000 FCFA/an - Autorisée par AG du 15/06/N',
          'Convention de trésorerie avec FILIALE BENIN SARL : Taux 4,5% - Autorisée par AG du 15/06/N',
          'Aucune convention non autorisée n\'a été identifiée'
        ]
      },
      '39.3 Attestations fiscales et sociales': {
        description: 'La société détient les attestations suivantes en cours de validité :',
        details: [
          'Attestation de régularité fiscale : Valide jusqu\'au 30/06/N+1 - Délivrée par la DGI',
          'Attestation CNPS (sécurité sociale) : À jour des cotisations au 31/12/N',
          'Attestation de non-faillite : Délivrée par le Tribunal de Commerce le 15/01/N+1',
          'Quitus fiscal : Obtenu pour les exercices N-3 à N-1',
          'Attestation d\'immatriculation au RCCM : Valide - N° CI-ABJ-2015-B-12345'
        ]
      },
      '39.4 Certifications qualité et conformité': {
        description: 'Certifications et normes auxquelles la société est conforme :',
        details: [
          'ISO 9001:2015 - Système de management de la qualité : Certifié - Audit de surveillance réalisé en octobre N',
          'ISO 14001:2015 - Management environnemental : Certifié - Renouvellement prévu en N+1',
          'Conformité OHADA : Comptes établis selon le SYSCOHADA révisé (Acte uniforme du 26/01/2017)',
          'Conformité Code du travail : Règlement intérieur déposé à l\'Inspection du travail',
          'Registre de commerce : À jour - Dernière modification inscrite le 15/05/2022'
        ]
      },
      '39.5 Engagements de la direction': {
        description: 'La direction atteste que :',
        details: [
          'Les comptes annuels donnent une image fidèle de la situation financière et du patrimoine de la société',
          'Toutes les informations nécessaires à la compréhension des comptes ont été communiquées au commissaire aux comptes',
          'Il n\'existe aucun engagement significatif non mentionné dans les présentes notes annexes',
          'L\'hypothèse de continuité d\'exploitation est confirmée pour les 12 prochains mois',
          'Les comptes ont été arrêtés par le conseil d\'administration en sa séance du 15 mars N+1'
        ]
      }
    }
  },
  0: {
    titre: 'Notes DGI-INS',
    alerteInfo: 'Notes spécifiques destinées à la Direction Générale des Impôts (DGI) et à l\'Institut National de la Statistique (INS). Ces informations complémentaires sont requises dans le cadre de la Déclaration Statistique et Fiscale (DSF).',
    tableau: {
      titre: 'Informations statistiques et fiscales (DSF)',
      colonnes: ['Rubrique DSF', 'Code', 'Montant / Valeur N', 'Montant / Valeur N-1', 'Source'],
      lignes: [
        ['INFORMATIONS GÉNÉRALES:', '', '', '', ''],
        ['Effectif total au 31/12', 'A01', '83', '70', 'Registre du personnel'],
        ['Masse salariale brute annuelle', 'A02', '48 500 000', '45 200 000', 'Livre de paie'],
        ['Chiffre d\'affaires HT total', 'A03', '210 800 000', '197 400 000', 'Compte de résultat'],
        ['Valeur ajoutée', 'A04', '115 800 000', '107 900 000', 'SIG'],
        ['Excédent brut d\'exploitation', 'A05', '67 300 000', '62 700 000', 'SIG'],
        ['DONNÉES FISCALES:', '', '', '', ''],
        ['Résultat fiscal imposable', 'F01', '14 333 333', '11 666 667', 'Tableau passage'],
        ['Impôt sur les sociétés', 'F02', '4 300 000', '3 500 000', 'Calcul fiscal'],
        ['TVA nette due (cumul annuel)', 'F03', '5 200 000', '4 800 000', 'Déclarations TVA'],
        ['Retenues à la source versées', 'F04', '4 800 000', '4 200 000', 'Bordereaux'],
        ['Total charges fiscales', 'F05', '12 950 000', '11 600 000', 'Comptes classe 6'],
        ['DONNÉES STATISTIQUES INS:', '', '', '', ''],
        ['Investissements de l\'exercice', 'S01', '5 130 000', '8 200 000', 'Tableau immob.'],
        ['Consommations intermédiaires', 'S02', '95 000 000', '89 500 000', 'Achats + services'],
        ['Production de l\'exercice', 'S03', '210 800 000', '197 400 000', 'CA + prod. stockée'],
        ['Exportations directes', 'S04', '42 160 000', '39 480 000', 'Factures export'],
        ['Importations directes', 'S05', '35 200 000', '32 800 000', 'Déclarations douane'],
      ]
    },
    details: {
      'Répartition sectorielle (nomenclature INS)': {
        'Code APE / NAF': '4711 - Commerce de détail en magasin non spécialisé',
        'Secteur d\'activité': 'Commerce et Distribution',
        'Branche principale': 'Commerce de gros et de détail',
        'Activité secondaire': 'Production et transformation'
      },
      'Indicateurs macroéconomiques (INS)': {
        'Valeur ajoutée / CA': '54,9%',
        'Taux d\'investissement': '2,4% du CA',
        'Taux d\'exportation': '20,0% du CA',
        'Taux d\'importation': '16,7% du CA',
        'Productivité apparente du travail': '1 394 578 FCFA (VA / effectif)'
      },
      'Informations douanières': {
        'Régime douanier principal': 'Mise à la consommation (D6)',
        'Principaux produits importés': 'Matières premières, équipements industriels',
        'Principaux produits exportés': 'Produits finis, marchandises',
        'Pays d\'origine importations': 'Chine (35%), France (25%), Inde (15%)',
        'Pays destination exportations': 'Burkina Faso (30%), Mali (25%), Niger (20%)'
      },
      'Calendrier des dépôts': {
        'DSF auprès de la DGI': 'Déposée le 15/03/N+1 (dans le délai légal)',
        'Questionnaire INS': 'Déposé le 31/03/N+1',
        'Déclaration statistique douanière': 'Mensuelle - À jour',
        'Conformité': 'Toutes obligations de reporting statistique et fiscal respectées'
      }
    }
  },
}

// ========== COMPOSANT PRINCIPAL ==========

const NotesRestantes: React.FC<NoteRestanteProps> = ({
  numeroNote,
  titre,
}) => {
  const theme = useTheme()
  const noteData = NOTES_DATA[numeroNote]
  const { isEditMode, toggleEditMode, handleCellChange, getCellValue, hasChanges, handleSave } = useEditableTable()

  const formatMontant = (val: string) => val

  // Si pas de données détaillées pour cette note, afficher un rendu minimal
  if (!noteData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
          Note {numeroNote} - {titre}
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Le contenu détaillé de cette note sera disponible prochainement.
          </Typography>
        </Paper>
        <CommentairesSection
          titre={`Commentaires et Observations - Note ${numeroNote}`}
          noteId={`note${numeroNote}`}
          commentairesInitiaux={[]}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Titre + Toolbar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Note {numeroNote} - {noteData.titre} (en FCFA)
        </Typography>
        <EditableToolbar
          isEditMode={isEditMode}
          onToggleEdit={toggleEditMode}
          hasChanges={hasChanges}
          onSave={handleSave}
        />
      </Stack>

      {/* Actions */}
      <TableActions
        tableName={`Note ${numeroNote} - ${noteData.titre}`}
        showCalculate={false}
        onSave={() => alert(`Note ${numeroNote} sauvegardée`)}
        onAdd={() => alert('Nouvelle ligne ajoutée')}
        onImport={() => alert('Import des données')}
      />

      {/* Alerte info */}
      {noteData.alerteInfo && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f0f7ff', border: '1px solid #bbdefb' }}>
          <Typography variant="body2" sx={{ color: '#1565c0' }}>
            {noteData.alerteInfo}
          </Typography>
        </Paper>
      )}

      {/* Contenu structuré (pour Note 33 par exemple) */}
      {noteData.contenu && (
        <Box sx={{ mb: 3 }}>
          {Object.entries(noteData.contenu).map(([key, value]) => (
            <Card key={key} sx={{ mb: 2 }} variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                  {key}
                </Typography>
                {typeof value === 'object' && 'description' in value ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {(value as { description: string; details?: string[] }).description}
                    </Typography>
                    {(value as { description: string; details?: string[] }).details && (
                      <Box sx={{ pl: 2 }}>
                        {(value as { description: string; details?: string[] }).details!.map((detail: string, i: number) => (
                          <Typography key={i} variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                            <Box component="span" sx={{ mr: 1, color: 'success.main', fontWeight: 700 }}>•</Box>
                            {detail}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : typeof value === 'string' ? (
                  <Typography variant="body1">{value}</Typography>
                ) : (
                  <Box sx={{ pl: 2 }}>
                    {Object.entries(value as Record<string, string>).map(([subKey, subValue]) => (
                      <Box key={subKey} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{subKey}:</Typography>
                        <Typography variant="body2">{subValue}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Tableau principal */}
      {noteData.tableau && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                {noteData.tableau.colonnes.map((col, i) => (
                  <TableCell
                    key={i}
                    align={i > 0 ? 'right' : 'left'}
                    sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {noteData.tableau.lignes.map((ligne, rowIdx) => {
                const isTotal = ligne[0].includes('TOTAL') || ligne[0].includes('Total')
                const isHeader = ligne[0].endsWith(':')
                const isDataRow = !isTotal && !isHeader
                return (
                  <TableRow
                    key={rowIdx}
                    sx={{
                      backgroundColor: isTotal
                        ? theme.palette.grey[100]
                        : isHeader
                        ? theme.palette.grey[50]
                        : rowIdx % 2 === 0
                        ? 'white'
                        : theme.palette.grey[50],
                      borderTop: isTotal ? `2px solid ${theme.palette.primary.main}` : undefined,
                    }}
                  >
                    {ligne.map((cell, cellIdx) => {
                      const isEditable = isEditMode && isDataRow && cellIdx > 0 && cell !== ''
                      const cellValue = getCellValue(`r${rowIdx}`, `c${cellIdx}`, cell) as string
                      return (
                        <TableCell
                          key={cellIdx}
                          align={cellIdx > 0 ? 'right' : 'left'}
                          sx={{
                            fontWeight: isTotal || isHeader ? 700 : 400,
                            fontStyle: isHeader ? 'italic' : 'normal',
                            fontSize: isTotal ? '0.9rem' : '0.85rem',
                            color: isTotal && cellIdx > 0 ? theme.palette.primary.main : 'inherit',
                            border: '1px solid #e5e5e5',
                            whiteSpace: 'nowrap',
                            pl: cell.startsWith('  ') ? 4 : undefined,
                            p: isEditable ? 0.5 : undefined,
                          }}
                        >
                          {isEditable ? (
                            <TextField
                              size="small"
                              value={cellValue}
                              onChange={(e) => handleCellChange(`r${rowIdx}`, `c${cellIdx}`, e.target.value)}
                              variant="outlined"
                              sx={{ minWidth: 80 }}
                              InputProps={{ sx: { fontSize: '0.85rem' } }}
                            />
                          ) : (
                            formatMontant(cellValue)
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Sections détails */}
      {noteData.details && (
        <Grid container spacing={3}>
          {Object.entries(noteData.details).map(([sectionTitle, sectionContent]) => (
            <Grid item xs={12} md={6} key={sectionTitle}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main, fontSize: '1rem' }}>
                    {sectionTitle}
                  </Typography>
                  {typeof sectionContent === 'string' ? (
                    <Typography variant="body2">{sectionContent}</Typography>
                  ) : (
                    <Box>
                      {Object.entries(sectionContent).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', minWidth: '40%' }}>
                            {key}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: key.toLowerCase().includes('total') ? 600 : 400 }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Section Commentaires */}
      <CommentairesSection
        titre={`Commentaires et Observations - Note ${numeroNote}`}
        noteId={`note${numeroNote}`}
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Expert-comptable',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: `Vérification effectuée sur la Note ${numeroNote} - ${noteData.titre}.\n\nLes montants sont cohérents avec les états financiers et les pièces justificatives examinées.`,
            type: 'observation'
          }
        ]}
      />
    </Box>
  )
}

// Factory function pour créer toutes les notes
export const createNoteComponent = (config: NoteRestanteProps) => {
  return () => <NotesRestantes {...config} />
}

// Configuration legacy (conservée pour compatibilité)
export const NOTES_CONFIGS = {
  note4: {
    numeroNote: 4,
    titre: 'IMMOBILISATIONS FINANCIÈRES',
    description: 'Détail des titres de participation, créances rattachées à des participations, autres titres immobilisés.',
    contenuPrevu: ['Tableau des mouvements des immobilisations financières'],
    priorite: 'haute' as const,
  },
  note7: {
    numeroNote: 7,
    titre: 'AUTRES CRÉANCES',
    description: 'Analyse détaillée des créances autres que clients.',
    contenuPrevu: ['Créances sur le personnel, État, organismes sociaux'],
    priorite: 'haute' as const,
  },
  note9: {
    numeroNote: 9,
    titre: 'CAPITAUX PROPRES - MOUVEMENT',
    description: 'Tableau de variation des capitaux propres.',
    contenuPrevu: ['Mouvement du capital social, réserves, report à nouveau'],
    priorite: 'haute' as const,
  },
  note10: {
    numeroNote: 10,
    titre: 'PROVISIONS POUR RISQUES ET CHARGES',
    description: 'Détail des provisions constituées.',
    contenuPrevu: ['Provisions pour litiges, garanties, restructuration'],
    priorite: 'moyenne' as const,
  },
}

// Exports des composants individuels
export const Note4SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note4)
export const Note7SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note7)
export const Note9SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note9)
export const Note10SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note10)

export default NotesRestantes
