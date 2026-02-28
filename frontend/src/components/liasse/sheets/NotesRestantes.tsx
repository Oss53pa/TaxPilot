/**
 * Composant générique pour toutes les notes restantes (4, 7, 9-10, 12-13, 15-16, 18, 20-35)
 * Affiche le contenu complet avec tableaux détaillés et sections d'information
 */

import React, { useMemo } from 'react'
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
  Alert,
  Chip,
  useTheme,
} from '@mui/material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'
import EditableToolbar from '../shared/EditableToolbar'
import { useEditableTable } from '@/hooks/useEditableTable'
import { generateAnnexeData } from '@/services/annexeDataService'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { getLatestBalance } from '@/services/balanceStorageService'

interface NoteRestanteProps {
  numeroNote: number | string
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

const NOTES_DATA: Record<number | string, NoteData> = {
  4: {
    titre: 'Immobilisations financières',
    tableau: {
      titre: 'Détail des immobilisations financières',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Titres de participation', '', '', '', ''],
        ['Autres titres immobilisés', '', '', '', ''],
        ['Prêts et créances non commerciales', '', '', '', ''],
        ['Dépôts et cautionnements versés', '', '', '', ''],
        ['Créances rattachées à des participations', '', '', '', ''],
        ['Prêts au personnel', '', '', '', ''],
        ['Intérêts courus sur prêts', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  7: {
    titre: 'Clients',
    tableau: {
      titre: 'Créances clients et comptes rattachés',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Clients — ventes de biens', '', '', '', ''],
        ['Clients — prestations de services', '', '', '', ''],
        ['Clients — effets à recevoir', '', '', '', ''],
        ['Clients douteux ou litigieux', '', '', '', ''],
        ['Provisions pour dépréciation des clients', '', '', '', ''],
        ['TOTAL NET', '', '', '', ''],
      ]
    },
  },
  9: {
    titre: 'Titres de placement',
    tableau: {
      titre: 'Titres de placement et valeurs mobilières',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Actions cotées', '', '', '', ''],
        ['Actions non cotées', '', '', '', ''],
        ['Obligations et bons', '', '', '', ''],
        ['Dépôts à terme', '', '', '', ''],
        ['Provisions pour dépréciation des titres', '', '', '', ''],
        ['TOTAL NET', '', '', '', ''],
      ]
    },
  },
  10: {
    titre: 'Valeurs à encaisser',
    tableau: {
      titre: 'Effets à l\'encaissement et chèques à encaisser',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Chèques à encaisser', '', '', '', ''],
        ['Effets à l\'encaissement', '', '', '', ''],
        ['Effets à l\'escompte', '', '', '', ''],
        ['Autres valeurs à l\'encaissement', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  13: {
    titre: 'Capital',
    tableau: {
      titre: 'Capital social et actionnaires',
      colonnes: ['Éléments', 'Montant N', 'Montant N-1', 'Variation'],
      lignes: [
        ['Capital social', '', '', ''],
        ['Actionnaires, capital souscrit non appelé', '', '', ''],
        ['Actionnaires, capital souscrit appelé non versé', '', '', ''],
        ['TOTAL', '', '', ''],
      ]
    },
  },
  16: {
    titre: 'Dettes financières et retraite',
    tableau: {
      titre: 'Note supprimée — voir sous-notes 16A à 16C',
      colonnes: ['Information'],
      lignes: [['Cette note est détaillée dans les sous-notes 16A, 16B, 16B BIS et 16C']],
    },
  },
  18: {
    titre: 'Dettes fiscales et sociales',
    tableau: {
      titre: 'Dettes fiscales et sociales',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Personnel — rémunérations dues', '', '', '', ''],
        ['Organismes sociaux', '', '', '', ''],
        ['État — impôts sur les bénéfices', '', '', '', ''],
        ['État — TVA due', '', '', '', ''],
        ['État — autres impôts et taxes', '', '', '', ''],
        ['Autres dettes fiscales', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  20: {
    titre: 'Banques, crédit d\'escompte et de trésorerie',
    tableau: {
      titre: 'Trésorerie passive',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Banques — soldes créditeurs', '', '', '', ''],
        ['Crédits d\'escompte', '', '', '', ''],
        ['Crédits de trésorerie', '', '', '', ''],
        ['Découverts bancaires', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  21: {
    titre: 'Chiffre d\'affaires et autres produits',
    tableau: {
      titre: 'Chiffre d\'affaires et autres produits',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Ventes de marchandises', '', '', '', ''],
        ['Ventes de produits fabriqués', '', '', '', ''],
        ['Travaux et services vendus', '', '', '', ''],
        ['Produits accessoires', '', '', '', ''],
        ['Subventions d\'exploitation', '', '', '', ''],
        ['Autres produits', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  22: {
    titre: 'Achats',
    tableau: {
      titre: 'Achats de l\'exercice',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Achats de marchandises', '', '', '', ''],
        ['Achats de matières premières', '', '', '', ''],
        ['Achats de fournitures liées', '', '', '', ''],
        ['Achats d\'emballages', '', '', '', ''],
        ['Variation de stocks', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  23: {
    titre: 'Transports',
    tableau: {
      titre: 'Charges de transport',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Transports sur achats', '', '', '', ''],
        ['Transports sur ventes', '', '', '', ''],
        ['Transports du personnel', '', '', '', ''],
        ['Autres frais de transport', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  24: {
    titre: 'Services extérieurs',
    tableau: {
      titre: 'Services extérieurs',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Sous-traitance générale', '', '', '', ''],
        ['Locations et charges locatives', '', '', '', ''],
        ['Entretien, réparations et maintenance', '', '', '', ''],
        ['Primes d\'assurance', '', '', '', ''],
        ['Études, recherches et documentation', '', '', '', ''],
        ['Publicité et relations publiques', '', '', '', ''],
        ['Frais de télécommunications', '', '', '', ''],
        ['Honoraires', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  25: {
    titre: 'Impôts et taxes',
    tableau: {
      titre: 'Impôts et taxes',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Impôts et taxes directs', '', '', '', ''],
        ['Impôts et taxes indirects', '', '', '', ''],
        ['Droits d\'enregistrement', '', '', '', ''],
        ['Autres impôts et taxes', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  26: {
    titre: 'Autres charges',
    tableau: {
      titre: 'Autres charges d\'exploitation',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Charges diverses d\'exploitation', '', '', '', ''],
        ['Pertes sur créances clients', '', '', '', ''],
        ['Charges provisionnées d\'exploitation', '', '', '', ''],
        ['Autres charges', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  27: {
    titre: 'Charges de personnel',
    tableau: {
      titre: 'Note supprimée — voir sous-notes 27A et 27B',
      colonnes: ['Information'],
      lignes: [['Cette note est détaillée dans les sous-notes 27A et 27B']],
    },
  },
  28: {
    titre: 'Dotations et charges pour provisions',
    tableau: {
      titre: 'Dotations aux amortissements, dépréciations et provisions',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Dotations aux amortissements d\'exploitation', '', '', '', ''],
        ['Dotations aux provisions d\'exploitation', '', '', '', ''],
        ['Dotations aux dépréciations', '', '', '', ''],
        ['Reprises de provisions', '', '', '', ''],
        ['Reprises de dépréciations', '', '', '', ''],
        ['TOTAL NET', '', '', '', ''],
      ]
    },
  },
  29: {
    titre: 'Charges et revenus financiers',
    tableau: {
      titre: 'Résultat financier',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['PRODUITS FINANCIERS:', '', '', '', ''],
        ['Revenus des titres de participation', '', '', '', ''],
        ['Intérêts et produits assimilés', '', '', '', ''],
        ['Gains de change', '', '', '', ''],
        ['Reprises de provisions financières', '', '', '', ''],
        ['Total produits financiers', '', '', '', ''],
        ['CHARGES FINANCIÈRES:', '', '', '', ''],
        ['Intérêts et charges assimilées', '', '', '', ''],
        ['Pertes de change', '', '', '', ''],
        ['Dotations provisions financières', '', '', '', ''],
        ['Total charges financières', '', '', '', ''],
        ['RÉSULTAT FINANCIER', '', '', '', ''],
      ]
    },
  },
  30: {
    titre: 'Autres charges et produits HAO',
    tableau: {
      titre: 'Charges et produits hors activités ordinaires',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Produits HAO', '', '', '', ''],
        ['Charges HAO', '', '', '', ''],
        ['RÉSULTAT HAO', '', '', '', ''],
      ]
    },
  },
  31: {
    titre: 'Répartition du résultat',
    tableau: {
      titre: 'Proposition d\'affectation du résultat',
      colonnes: ['Éléments', 'Montant'],
      lignes: [
        ['Résultat net de l\'exercice', ''],
        ['Report à nouveau antérieur', ''],
        ['TOTAL À AFFECTER', ''],
        ['Réserve légale (5%)', ''],
        ['Autres réserves', ''],
        ['Dividendes', ''],
        ['Report à nouveau', ''],
      ]
    },
  },
  32: {
    titre: 'Production de l\'exercice',
    tableau: {
      titre: 'Production de l\'exercice',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Production vendue', '', '', '', ''],
        ['Production stockée', '', '', '', ''],
        ['Production immobilisée', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  33: {
    titre: 'Achats destinés à la production',
    tableau: {
      titre: 'Achats destinés à la production',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Achats de matières premières', '', '', '', ''],
        ['Achats de matières consommables', '', '', '', ''],
        ['Achats d\'emballages', '', '', '', ''],
        ['Variation de stocks matières', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  34: {
    titre: 'Fiche de synthèse des indicateurs financiers',
    tableau: {
      titre: 'Indicateurs financiers de synthèse',
      colonnes: ['Indicateur', 'Montant N', 'Montant N-1', 'Variation %'],
      lignes: [
        ['Chiffre d\'affaires', '', '', ''],
        ['Valeur ajoutée', '', '', ''],
        ['Excédent brut d\'exploitation', '', '', ''],
        ['Résultat d\'exploitation', '', '', ''],
        ['Résultat financier', '', '', ''],
        ['Résultat des activités ordinaires', '', '', ''],
        ['Résultat HAO', '', '', ''],
        ['Résultat net', '', '', ''],
        ['Capacité d\'autofinancement', '', '', ''],
        ['Effectif moyen', '', '', ''],
      ]
    },
  },
  35: {
    titre: 'Liste des informations sociales/environnementales',
    tableau: {
      titre: 'Informations sociales et environnementales',
      colonnes: ['Rubrique', 'Information'],
      lignes: [
        ['Effectif total au 31/12', ''],
        ['Répartition H/F', ''],
        ['Masse salariale annuelle', ''],
        ['Formation professionnelle', ''],
        ['Politique environnementale', ''],
        ['Certifications', ''],
      ]
    },
  },
  37: {
    titre: 'Détermination impôts sur le résultat',
    tableau: {
      titre: 'Calcul de l\'impôt sur le résultat',
      colonnes: ['Éléments', 'Montant'],
      lignes: [
        ['Résultat comptable avant impôt', ''],
        ['Réintégrations fiscales', ''],
        ['Déductions fiscales', ''],
        ['Résultat fiscal', ''],
        ['Impôt sur les sociétés (25%)', ''],
        ['Impôt minimum forfaitaire', ''],
        ['Impôt dû', ''],
      ]
    },
  },
  38: {
    titre: 'Événements postérieurs à la clôture',
    contenu: {
      'Événements ajustants': {
        description: 'Événements fournissant des informations sur des conditions existant à la date de clôture :',
        details: ['À renseigner']
      },
      'Événements non ajustants': {
        description: 'Événements significatifs survenus après la clôture :',
        details: ['À renseigner']
      },
      'Continuité d\'exploitation': {
        description: 'Appréciation de la continuité d\'exploitation :',
        details: ['À renseigner']
      },
    }
  },
  39: {
    titre: 'Changements de méthodes comptables',
    contenu: {
      'Changements de méthodes': {
        description: 'Description des changements de méthodes comptables intervenus au cours de l\'exercice :',
        details: ['À renseigner']
      },
      'Impact sur les comptes': {
        description: 'Impact des changements sur les états financiers :',
        details: ['À renseigner']
      },
    }
  },
  0: {
    titre: 'Notes DGI-INS',
    tableau: {
      titre: 'Informations statistiques et fiscales (DSF)',
      colonnes: ['Rubrique DSF', 'Code', 'Montant N', 'Montant N-1'],
      lignes: [
        ['Effectif total au 31/12', 'A01', '', ''],
        ['Masse salariale brute annuelle', 'A02', '', ''],
        ['Chiffre d\'affaires HT total', 'A03', '', ''],
        ['Valeur ajoutée', 'A04', '', ''],
        ['Excédent brut d\'exploitation', 'A05', '', ''],
        ['Résultat fiscal imposable', 'F01', '', ''],
        ['Impôt sur les sociétés', 'F02', '', ''],
        ['TVA nette due (cumul annuel)', 'F03', '', ''],
      ]
    },
  },

  // ========== SOUS-NOTES 3A - 3E ==========
  '3B': {
    titre: 'Biens pris en location-acquisition',
    tableau: {
      titre: 'Biens pris en location-acquisition (crédit-bail retraité)',
      colonnes: ['Nature du contrat', 'Brut ouverture', 'Acquisitions', 'Virements+', 'Réévaluation', 'Cessions', 'Virements-', 'Brut clôture'],
      lignes: [
        ['Immobilisations incorporelles', '', '', '', '', '', '', ''],
        ['Terrains', '', '', '', '', '', '', ''],
        ['Bâtiments', '', '', '', '', '', '', ''],
        ['Installations et agencements', '', '', '', '', '', '', ''],
        ['Matériel de transport', '', '', '', '', '', '', ''],
        ['Matériel informatique', '', '', '', '', '', '', ''],
        ['Autres immobilisations corporelles', '', '', '', '', '', '', ''],
        ['TOTAL', '', '', '', '', '', '', ''],
      ]
    },
  },
  '3C': {
    titre: 'Amortissements',
    tableau: {
      titre: 'Tableau des amortissements',
      colonnes: ['Rubriques', 'Amort. ouverture', 'Dotations', 'Sorties/Reprises', 'Virements', 'Amort. clôture'],
      lignes: [
        ['Immobilisations incorporelles', '', '', '', '', ''],
        ['Terrains', '', '', '', '', ''],
        ['Bâtiments', '', '', '', '', ''],
        ['Installations techniques', '', '', '', '', ''],
        ['Matériel de transport', '', '', '', '', ''],
        ['Mobilier et matériel informatique', '', '', '', '', ''],
        ['Autres immobilisations corporelles', '', '', '', '', ''],
        ['TOTAL', '', '', '', '', ''],
      ]
    },
  },
  '3C_BIS': {
    titre: 'Dépréciations',
    tableau: {
      titre: 'Tableau des dépréciations d\'immobilisations',
      colonnes: ['Rubriques', 'Dépréc. ouverture', 'Dotations', 'Reprises', 'Dépréc. clôture'],
      lignes: [
        ['Immobilisations incorporelles', '', '', '', ''],
        ['Terrains', '', '', '', ''],
        ['Bâtiments', '', '', '', ''],
        ['Installations techniques', '', '', '', ''],
        ['Matériel de transport', '', '', '', ''],
        ['Autres immobilisations corporelles', '', '', '', ''],
        ['Immobilisations financières', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  '3D': {
    titre: 'Plus et moins-values de cession',
    tableau: {
      titre: 'Plus et moins-values de cession d\'immobilisations',
      colonnes: ['Nature du bien cédé', 'Montant brut', 'Amort. pratiqués', 'VNC', 'Prix de cession', 'Plus/Moins-value'],
      lignes: [
        ['Immobilisations incorporelles', '', '', '', '', ''],
        ['Terrains', '', '', '', '', ''],
        ['Bâtiments', '', '', '', '', ''],
        ['Matériel de transport', '', '', '', '', ''],
        ['Autres immobilisations corporelles', '', '', '', '', ''],
        ['Immobilisations financières', '', '', '', '', ''],
        ['TOTAL', '', '', '', '', ''],
      ]
    },
  },
  '3E': {
    titre: 'Réévaluations et écarts',
    tableau: {
      titre: 'Informations sur les réévaluations',
      colonnes: ['Rubriques', 'Coût historique', 'Montant réévalué', 'Écart de réévaluation', 'Amort. supplémentaires'],
      lignes: [
        ['Terrains', '', '', '', ''],
        ['Bâtiments', '', '', '', ''],
        ['Installations techniques', '', '', '', ''],
        ['Autres immobilisations corporelles', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },

  // ========== SOUS-NOTES 8A - 8C ==========
  '8A': {
    titre: 'Charges immobilisées',
    tableau: {
      titre: 'Charges immobilisées',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Frais d\'établissement', '', '', '', ''],
        ['Charges à répartir sur plusieurs exercices', '', '', '', ''],
        ['Primes de remboursement des obligations', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  '8B': {
    titre: 'Provisions pour charges',
    tableau: {
      titre: 'Provisions pour charges à répartir',
      colonnes: ['Nature', 'Solde début N', 'Dotations', 'Reprises', 'Solde fin N'],
      lignes: [
        ['Provisions pour grosses réparations', '', '', '', ''],
        ['Provisions pour charges à répartir', '', '', '', ''],
        ['Autres provisions pour charges', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
  '8C': {
    titre: 'Provisions pour engagements de retraite',
    tableau: {
      titre: 'Provisions pour pensions et obligations similaires',
      colonnes: ['Nature', 'Solde début N', 'Dotations', 'Reprises', 'Solde fin N'],
      lignes: [
        ['Provisions pour indemnités de départ', '', '', '', ''],
        ['Provisions pour pensions', '', '', '', ''],
        ['Autres engagements de retraite', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },

  // ========== SOUS-NOTES 15A - 15B ==========
  '15A': {
    titre: 'Subventions d\'investissement',
    tableau: {
      titre: 'Subventions d\'investissement',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %', 'Régime fiscal', 'Échéances'],
      lignes: [
        ['Subventions d\'équipement', '', '', '', '', '', ''],
        ['Subventions d\'investissement État', '', '', '', '', '', ''],
        ['Autres subventions d\'investissement', '', '', '', '', '', ''],
        ['Reprises de subventions au résultat', '', '', '', '', '', ''],
        ['TOTAL NET', '', '', '', '', '', ''],
      ]
    },
  },
  '15B': {
    titre: 'Autres fonds propres',
    tableau: {
      titre: 'Autres fonds propres',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %', 'Échéances'],
      lignes: [
        ['Provisions réglementées', '', '', '', '', ''],
        ['Amortissements dérogatoires', '', '', '', '', ''],
        ['Plus-values de cession à réinvestir', '', '', '', '', ''],
        ['Fonds réglementés', '', '', '', '', ''],
        ['TOTAL', '', '', '', '', ''],
      ]
    },
  },

  // ========== SOUS-NOTES 16A - 16C ==========
  '16A': {
    titre: 'Dettes financières et ressources assimilées',
    tableau: {
      titre: 'Dettes financières par échéance',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Var. %', '< 1 an', '1-2 ans', '> 2 ans'],
      lignes: [
        ['Emprunts obligataires', '', '', '', '', '', '', ''],
        ['Emprunts et dettes auprès des établissements de crédit', '', '', '', '', '', '', ''],
        ['Dettes de location-acquisition', '', '', '', '', '', '', ''],
        ['Dettes financières diverses', '', '', '', '', '', '', ''],
        ['Comptes courants d\'associés', '', '', '', '', '', '', ''],
        ['TOTAL', '', '', '', '', '', '', ''],
      ]
    },
  },
  '16B': {
    titre: 'Engagements de retraite — Hypothèses',
    tableau: {
      titre: 'Hypothèses actuarielles',
      colonnes: ['Hypothèse', 'Année N', 'Année N-1'],
      lignes: [
        ['Taux d\'actualisation', '', ''],
        ['Taux de progression des salaires', '', ''],
        ['Taux de rotation du personnel', '', ''],
        ['Âge moyen de départ à la retraite', '', ''],
        ['Table de mortalité utilisée', '', ''],
      ]
    },
  },
  '16B_BIS': {
    titre: 'Engagements de retraite — Actif/Passif',
    tableau: {
      titre: 'Bilan actuariel des engagements de retraite',
      colonnes: ['Éléments', 'Année N', 'Année N-1'],
      lignes: [
        ['Valeur actualisée de l\'obligation', '', ''],
        ['Juste valeur des actifs du régime', '', ''],
        ['Déficit / (Excédent)', '', ''],
        ['Écarts actuariels non reconnus', '', ''],
        ['Passif (actif) net comptabilisé', '', ''],
        ['Charge de l\'exercice', '', ''],
      ]
    },
  },
  '16C': {
    titre: 'Actifs et passifs éventuels',
    tableau: {
      titre: 'Actifs et passifs éventuels',
      colonnes: ['Nature', 'Année N', 'Année N-1'],
      lignes: [
        ['Actifs éventuels', '', ''],
        ['Passifs éventuels — Litiges', '', ''],
        ['Passifs éventuels — Garanties données', '', ''],
        ['Passifs éventuels — Autres', '', ''],
      ]
    },
  },

  // ========== SOUS-NOTES 27A - 27B ==========
  '27A': {
    titre: 'Charges de personnel',
    tableau: {
      titre: 'Charges de personnel',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation %'],
      lignes: [
        ['Salaires et appointements', '', '', ''],
        ['Primes et gratifications', '', '', ''],
        ['Congés payés', '', '', ''],
        ['Charges sociales CNPS', '', '', ''],
        ['Autres charges sociales', '', '', ''],
        ['Charges de formation professionnelle', '', '', ''],
        ['Médecine du travail', '', '', ''],
        ['Avantages en nature', '', '', ''],
        ['TOTAL', '', '', ''],
      ]
    },
  },
  '27B': {
    titre: 'Effectifs et masse salariale',
    tableau: {
      titre: 'Effectifs par catégorie et masse salariale',
      colonnes: ['Catégorie', 'Hommes', 'Femmes', 'Total', 'Masse salariale'],
      lignes: [
        ['Cadres supérieurs', '', '', '', ''],
        ['Cadres moyens', '', '', '', ''],
        ['Agents de maîtrise', '', '', '', ''],
        ['Employés', '', '', '', ''],
        ['Ouvriers', '', '', '', ''],
        ['Temporaires et stagiaires', '', '', '', ''],
        ['TOTAL', '', '', '', ''],
      ]
    },
  },
}

// ========== COMPOSANT PRINCIPAL ==========

const NotesRestantes: React.FC<NoteRestanteProps> = ({
  numeroNote,
  titre,
}) => {
  const theme = useTheme()

  // Générer les données depuis la balance importée
  const computedNotes = useMemo(() => {
    const stored = getLatestBalance()
    const entries = stored?.entries?.length ? stored.entries : []
    return generateAnnexeData(entries)
  }, [])
  const usingImported = !!getLatestBalance()?.entries?.length

  // Utiliser les données calculées si disponibles, sinon fallback hardcodé
  const noteData = (typeof numeroNote === 'number' ? computedNotes[numeroNote] as NoteData : undefined) || NOTES_DATA[numeroNote]
  const isComputed = typeof numeroNote === 'number' && !!computedNotes[numeroNote]

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

      {/* Indicateur source des données */}
      {isComputed && (
        <Alert severity={usingImported ? 'success' : 'info'} sx={{ mb: 2 }}>
          {usingImported
            ? 'Donnees calculees depuis la balance importee'
            : 'Donnees calculees depuis la balance de demonstration'}
          <Chip label="Auto" size="small" color={usingImported ? 'success' : 'default'} sx={{ ml: 1 }} />
        </Alert>
      )}

      {/* Alerte info */}
      {noteData.alerteInfo && !isComputed && (
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
                {typeof value === 'object' && value && 'description' in value ? (
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
                            border: `1px solid ${P.primary200}`,
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

// Configuration des notes — titres alignés sur le fichier Excel SYSCOHADA
export const NOTES_CONFIGS = {
  note4: { numeroNote: 4, titre: 'IMMOBILISATIONS FINANCIÈRES', description: 'Titres de participation, prêts et créances non commerciales', contenuPrevu: ['Tableau des immobilisations financières'], priorite: 'haute' as const },
  note7: { numeroNote: 7, titre: 'CLIENTS', description: 'Créances clients et comptes rattachés', contenuPrevu: ['Créances clients'], priorite: 'haute' as const },
  note9: { numeroNote: 9, titre: 'TITRES DE PLACEMENT', description: 'Titres de placement et valeurs mobilières', contenuPrevu: ['Titres de placement'], priorite: 'moyenne' as const },
  note10: { numeroNote: 10, titre: 'VALEURS À ENCAISSER', description: 'Effets et chèques à encaisser', contenuPrevu: ['Valeurs à encaisser'], priorite: 'moyenne' as const },
  note13: { numeroNote: 13, titre: 'CAPITAL', description: 'Capital social et actionnaires', contenuPrevu: ['Capital social'], priorite: 'haute' as const },
  note16: { numeroNote: 16, titre: 'DETTES FINANCIÈRES ET RETRAITE', description: 'Voir sous-notes 16A à 16C', contenuPrevu: ['Sous-notes'], priorite: 'moyenne' as const },
  note18: { numeroNote: 18, titre: 'DETTES FISCALES ET SOCIALES', description: 'Impôts, taxes et cotisations sociales à payer', contenuPrevu: ['Dettes fiscales et sociales'], priorite: 'haute' as const },
  note20: { numeroNote: 20, titre: 'BANQUES, CRÉDIT D\'ESCOMPTE ET DE TRÉSORERIE', description: 'Trésorerie passive', contenuPrevu: ['Trésorerie passive'], priorite: 'haute' as const },
  note21: { numeroNote: 21, titre: 'CHIFFRE D\'AFFAIRES ET AUTRES PRODUITS', description: 'CA et autres produits d\'exploitation', contenuPrevu: ['CA et produits'], priorite: 'haute' as const },
  note22: { numeroNote: 22, titre: 'ACHATS', description: 'Achats de marchandises et matières', contenuPrevu: ['Achats'], priorite: 'haute' as const },
  note23: { numeroNote: 23, titre: 'TRANSPORTS', description: 'Frais de transport sur achats et ventes', contenuPrevu: ['Transports'], priorite: 'moyenne' as const },
  note24: { numeroNote: 24, titre: 'SERVICES EXTÉRIEURS', description: 'Loyers, entretien, assurances, honoraires', contenuPrevu: ['Services extérieurs'], priorite: 'moyenne' as const },
  note25: { numeroNote: 25, titre: 'IMPÔTS ET TAXES', description: 'Impôts, taxes et versements assimilés', contenuPrevu: ['Impôts et taxes'], priorite: 'moyenne' as const },
  note26: { numeroNote: 26, titre: 'AUTRES CHARGES', description: 'Autres charges d\'exploitation', contenuPrevu: ['Autres charges'], priorite: 'moyenne' as const },
  note27: { numeroNote: 27, titre: 'CHARGES DE PERSONNEL', description: 'Voir sous-notes 27A et 27B', contenuPrevu: ['Sous-notes'], priorite: 'moyenne' as const },
  note28: { numeroNote: 28, titre: 'DOTATIONS ET CHARGES POUR PROVISIONS', description: 'Dotations aux amortissements, dépréciations et provisions', contenuPrevu: ['Dotations et provisions'], priorite: 'haute' as const },
  note29: { numeroNote: 29, titre: 'CHARGES ET REVENUS FINANCIERS', description: 'Résultat financier', contenuPrevu: ['Résultat financier'], priorite: 'moyenne' as const },
  note30: { numeroNote: 30, titre: 'AUTRES CHARGES ET PRODUITS HAO', description: 'Charges et produits hors activités ordinaires', contenuPrevu: ['HAO'], priorite: 'moyenne' as const },
  note31: { numeroNote: 31, titre: 'RÉPARTITION DU RÉSULTAT', description: 'Proposition d\'affectation du résultat', contenuPrevu: ['Affectation résultat'], priorite: 'haute' as const },
  note32: { numeroNote: 32, titre: 'PRODUCTION DE L\'EXERCICE', description: 'Production vendue, stockée et immobilisée', contenuPrevu: ['Production'], priorite: 'moyenne' as const },
  note33: { numeroNote: 33, titre: 'ACHATS DESTINÉS À LA PRODUCTION', description: 'Achats de matières premières', contenuPrevu: ['Achats production'], priorite: 'moyenne' as const },
  note34: { numeroNote: 34, titre: 'FICHE DE SYNTHÈSE DES INDICATEURS FINANCIERS', description: 'Ratios et indicateurs financiers', contenuPrevu: ['Indicateurs'], priorite: 'moyenne' as const },
  note35: { numeroNote: 35, titre: 'INFORMATIONS SOCIALES/ENVIRONNEMENTALES', description: 'Informations sociales et environnementales', contenuPrevu: ['RSE'], priorite: 'basse' as const },
  note36: { numeroNote: 36, titre: 'TABLE DES CODES', description: 'Nomenclature et codes comptables', contenuPrevu: ['Table des codes'], priorite: 'basse' as const },
  note37: { numeroNote: 37, titre: 'DÉTERMINATION IMPÔTS SUR LE RÉSULTAT', description: 'Calcul de l\'impôt sur le résultat', contenuPrevu: ['Calcul IS'], priorite: 'haute' as const },
  note38: { numeroNote: 38, titre: 'ÉVÉNEMENTS POSTÉRIEURS À LA CLÔTURE', description: 'Événements survenus après la date de clôture', contenuPrevu: ['Événements postérieurs'], priorite: 'haute' as const },
  note39: { numeroNote: 39, titre: 'CHANGEMENTS DE MÉTHODES COMPTABLES', description: 'Changements de principes et méthodes comptables', contenuPrevu: ['Changements méthodes'], priorite: 'moyenne' as const },
  noteDgiIns: { numeroNote: 0, titre: 'NOTES DGI-INS', description: 'Informations statistiques et fiscales (DSF)', contenuPrevu: ['DSF'], priorite: 'haute' as const },
  // Sous-notes
  note3B: { numeroNote: '3B', titre: 'BIENS EN LOCATION-ACQUISITION', description: 'Crédit-bail retraité', contenuPrevu: ['Crédit-bail'], priorite: 'haute' as const },
  note3C: { numeroNote: '3C', titre: 'AMORTISSEMENTS', description: 'Mouvements des amortissements', contenuPrevu: ['Amortissements'], priorite: 'haute' as const },
  note3C_BIS: { numeroNote: '3C_BIS', titre: 'DÉPRÉCIATIONS', description: 'Mouvements des dépréciations', contenuPrevu: ['Dépréciations'], priorite: 'haute' as const },
  note3D: { numeroNote: '3D', titre: 'PLUS ET MOINS-VALUES DE CESSION', description: 'Cessions d\'immobilisations', contenuPrevu: ['Plus/Moins-values'], priorite: 'moyenne' as const },
  note3E: { numeroNote: '3E', titre: 'RÉÉVALUATIONS ET ÉCARTS', description: 'Réévaluations d\'immobilisations', contenuPrevu: ['Réévaluations'], priorite: 'basse' as const },
  note8A: { numeroNote: '8A', titre: 'CHARGES IMMOBILISÉES', description: 'Frais d\'établissement et charges à répartir', contenuPrevu: ['Charges immobilisées'], priorite: 'moyenne' as const },
  note8B: { numeroNote: '8B', titre: 'PROVISIONS POUR CHARGES', description: 'Provisions pour charges à répartir', contenuPrevu: ['Provisions charges'], priorite: 'moyenne' as const },
  note8C: { numeroNote: '8C', titre: 'PROVISIONS ENGAGEMENTS DE RETRAITE', description: 'Provisions pour pensions et obligations', contenuPrevu: ['Pensions'], priorite: 'moyenne' as const },
  note15A: { numeroNote: '15A', titre: 'SUBVENTIONS D\'INVESTISSEMENT', description: 'Subventions d\'investissement au passif', contenuPrevu: ['Subventions'], priorite: 'haute' as const },
  note15B: { numeroNote: '15B', titre: 'AUTRES FONDS PROPRES', description: 'Provisions réglementées et autres fonds propres', contenuPrevu: ['Fonds propres'], priorite: 'moyenne' as const },
  note16A: { numeroNote: '16A', titre: 'DETTES FINANCIÈRES', description: 'Emprunts et dettes par échéance', contenuPrevu: ['Dettes financières'], priorite: 'haute' as const },
  note16B: { numeroNote: '16B', titre: 'ENGAGEMENTS DE RETRAITE — HYPOTHÈSES', description: 'Hypothèses actuarielles', contenuPrevu: ['Hypothèses retraite'], priorite: 'basse' as const },
  note16B_BIS: { numeroNote: '16B_BIS', titre: 'ENGAGEMENTS DE RETRAITE — ACTIF/PASSIF', description: 'Bilan actuariel retraite', contenuPrevu: ['Bilan retraite'], priorite: 'basse' as const },
  note16C: { numeroNote: '16C', titre: 'ACTIFS ET PASSIFS ÉVENTUELS', description: 'Actifs et passifs éventuels', contenuPrevu: ['Éventuels'], priorite: 'basse' as const },
  note27A: { numeroNote: '27A', titre: 'CHARGES DE PERSONNEL', description: 'Détail des charges de personnel', contenuPrevu: ['Charges personnel'], priorite: 'haute' as const },
  note27B: { numeroNote: '27B', titre: 'EFFECTIFS ET MASSE SALARIALE', description: 'Effectifs par catégorie et masse salariale', contenuPrevu: ['Effectifs'], priorite: 'haute' as const },
}

// Exports des composants individuels (notes entières)
export const Note4SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note4)
export const Note7SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note7)
export const Note9SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note9)
export const Note10SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note10)
export const Note13SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note13)
export const Note16SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note16)
export const Note18SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note18)
export const Note20SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note20)
export const Note21SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note21)
export const Note22SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note22)
export const Note23SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note23)
export const Note24SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note24)
export const Note25SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note25)
export const Note26SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note26)
export const Note27SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note27)
export const Note28SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note28)
export const Note29SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note29)
export const Note30SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note30)
export const Note31SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note31)
export const Note32SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note32)
export const Note33SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note33)
export const Note34SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note34)
export const Note35SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note35)
export const Note36SYSCOHADA_NR = createNoteComponent(NOTES_CONFIGS.note36)
export const Note36NomenclatureSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note36)
export const Note37SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note37)
export const Note38SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note38)
export const Note39SYSCOHADA = createNoteComponent(NOTES_CONFIGS.note39)
export const NotesDgiInsSYSCOHADA = createNoteComponent(NOTES_CONFIGS.noteDgiIns)

// Exports des sous-notes
export const Note3BSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note3B)
export const Note3CSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note3C)
export const Note3CBISSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note3C_BIS)
export const Note3DSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note3D)
export const Note3ESYSCOHADA = createNoteComponent(NOTES_CONFIGS.note3E)
export const Note8ASYSCOHADA = createNoteComponent(NOTES_CONFIGS.note8A)
export const Note8BSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note8B)
export const Note8CSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note8C)
export const Note15ASYSCOHADA = createNoteComponent(NOTES_CONFIGS.note15A)
export const Note15BSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note15B)
export const Note16ASYSCOHADA = createNoteComponent(NOTES_CONFIGS.note16A)
export const Note16BSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note16B)
export const Note16BBISSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note16B_BIS)
export const Note16CSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note16C)
export const Note27ASYSCOHADA = createNoteComponent(NOTES_CONFIGS.note27A)
export const Note27BSYSCOHADA = createNoteComponent(NOTES_CONFIGS.note27B)

export default NotesRestantes
