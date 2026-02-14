/**
 * Configuration des composants de la Liasse Fiscale
 * Mapping complet de tous les onglets et composants
 */

import React from 'react'

// Import des composants existants
import BilanActif from '../components/liasse/BilanActif'
import BilanPassif from '../components/liasse/BilanPassif'
import CompteResultat from '../components/liasse/CompteResultat'
import Tafire from '../components/liasse/Tafire'
import FluxTresorerie from '../components/liasse/FluxTresorerie'
import VariationCapitaux from '../components/liasse/VariationCapitaux'
import NotesAnnexesCompletesFinal from '../components/liasse/NotesAnnexesCompletesFinal'

// Import des nouveaux composants
import Couverture from '../components/liasse/sheets/Couverture'
import BilanSynthetique from '../components/liasse/sheets/BilanSynthetique'
import Note36Tables from '../components/liasse/sheets/Note36Tables'
import FicheR1SYSCOHADA from '../components/liasse/sheets/FicheR1SYSCOHADA'
import FicheR2SYSCOHADA from '../components/liasse/sheets/FicheR2SYSCOHADA'
import FicheR3SYSCOHADA from '../components/liasse/sheets/FicheR3SYSCOHADA'
import FicheR4SYSCOHADA from '../components/liasse/sheets/FicheR4SYSCOHADA'
import TablesCalculImpots from '../components/liasse/sheets/TablesCalculImpots'
import TableauxSupplementaires from '../components/liasse/sheets/TableauxSupplementaires'
import Note12SYSCOHADA from '../components/liasse/sheets/Note12SYSCOHADA'

// Import des suppléments
import ComplementCharges from '../components/liasse/sheets/ComplementCharges'
import ComplementProduits from '../components/liasse/sheets/ComplementProduits'
import SupplementTVA from '../components/liasse/sheets/SupplementTVA'
import SupplementImpotSociete from '../components/liasse/sheets/SupplementImpotSociete'
import SupplementAvantagesFiscaux from '../components/liasse/sheets/SupplementAvantagesFiscaux'

// Import des composants SMT
import BilanSMT from '../components/liasse/sheets/BilanSMT'
import CompteResultatSMT from '../components/liasse/sheets/CompteResultatSMT'

// Import des composants sectoriels
import BilanBanque from '../components/liasse/sheets/BilanBanque'
import CompteExploitationBanque from '../components/liasse/sheets/CompteExploitationBanque'
import BilanAssurance from '../components/liasse/sheets/BilanAssurance'
import CompteResultatAssurance from '../components/liasse/sheets/CompteResultatAssurance'
import BilanMicrofinance from '../components/liasse/sheets/BilanMicrofinance'
import BilanEBNL from '../components/liasse/sheets/BilanEBNL'

// Icons
import {
  Assignment,
  AccountBalance,
  TrendingUp,
  TableChart,
  Description,
  Notes,
  AttachMoney,
  SwapHoriz,
  Assessment,
  Business,
  Group,
  TrendingDown,
  AccountTree,
  Shield,
  Calculate,
} from '@mui/icons-material'

export interface LiasseComponentConfig {
  id: string
  label: string
  icon: React.ReactElement
  component: React.ComponentType<any>
  description: string
  status: 'complete' | 'partial' | 'empty'
  completude: number
  category: string
  order: number
  isVisible: boolean
}

export const LIASSE_COMPONENTS: LiasseComponentConfig[] = [
  // Pages de garde et couverture
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture de la liasse fiscale',
    status: 'complete',
    completude: 100,
    category: 'Couverture',
    order: 1,
    isVisible: true,
  },
  
  // Tables de référence
  {
    id: 'note36-codes',
    label: 'Note 36 - Tables des Codes',
    icon: React.createElement(AccountTree),
    component: Note36Tables,
    description: 'Plan comptable SYSCOHADA et codes de référence',
    status: 'complete',
    completude: 100,
    category: 'Références',
    order: 2,
    isVisible: true,
  },

  // Fiches de renseignements
  {
    id: 'fiche-r1',
    label: 'Fiche R1 - Renseignements Généraux',
    icon: React.createElement(Business),
    component: FicheR1SYSCOHADA,
    description: 'Identification et renseignements généraux de l\'entreprise',
    status: 'complete',
    completude: 95,
    category: 'Fiches',
    order: 3,
    isVisible: true,
  },
  {
    id: 'fiche-r2',
    label: 'Fiche R2 - Dirigeants et CAC',
    icon: React.createElement(Group),
    component: FicheR2SYSCOHADA,
    description: 'Dirigeants et commissaires aux comptes',
    status: 'complete',
    completude: 90,
    category: 'Fiches',
    order: 4,
    isVisible: true,
  },
  {
    id: 'fiche-r3',
    label: 'Fiche R3 - Participations',
    icon: React.createElement(Shield),
    component: FicheR3SYSCOHADA,
    description: 'Participations et filiales',
    status: 'complete',
    completude: 85,
    category: 'Fiches',
    order: 5,
    isVisible: true,
  },
  {
    id: 'fiche-r4',
    label: 'Fiche R4 - Informations Complémentaires',
    icon: React.createElement(Description),
    component: FicheR4SYSCOHADA,
    description: 'Autres informations requises',
    status: 'partial',
    completude: 70,
    category: 'Fiches',
    order: 6,
    isVisible: true,
  },

  // États financiers principaux
  {
    id: 'bilan-synthetique',
    label: 'Bilan Synthétique',
    icon: React.createElement(Assessment),
    component: BilanSynthetique,
    description: 'Vue d\'ensemble de la situation patrimoniale',
    status: 'complete',
    completude: 100,
    category: 'États financiers',
    order: 7,
    isVisible: true,
  },
  {
    id: 'bilan-actif',
    label: 'Bilan - Actif',
    icon: React.createElement(AccountBalance),
    component: BilanActif,
    description: 'État de la situation patrimoniale - Actif',
    status: 'complete',
    completude: 95,
    category: 'États financiers',
    order: 8,
    isVisible: true,
  },
  {
    id: 'bilan-passif',
    label: 'Bilan - Passif',
    icon: React.createElement(AccountBalance),
    component: BilanPassif,
    description: 'État de la situation patrimoniale - Passif',
    status: 'complete',
    completude: 92,
    category: 'États financiers',
    order: 9,
    isVisible: true,
  },
  {
    id: 'compte-resultat',
    label: 'Compte de Résultat',
    icon: React.createElement(TrendingUp),
    component: CompteResultat,
    description: 'Performance économique de l\'exercice',
    status: 'complete',
    completude: 88,
    category: 'États financiers',
    order: 10,
    isVisible: true,
  },
  {
    id: 'tafire',
    label: 'TAFIRE',
    icon: React.createElement(TableChart),
    component: Tafire,
    description: 'Tableau Financier des Ressources et Emplois',
    status: 'partial',
    completude: 75,
    category: 'États financiers',
    order: 11,
    isVisible: true,
  },
  {
    id: 'flux-tresorerie',
    label: 'Flux de Trésorerie',
    icon: React.createElement(AttachMoney),
    component: FluxTresorerie,
    description: 'Mouvements de trésorerie de l\'exercice',
    status: 'partial',
    completude: 65,
    category: 'États financiers',
    order: 12,
    isVisible: true,
  },
  {
    id: 'variation-capitaux',
    label: 'Variation Capitaux Propres',
    icon: React.createElement(SwapHoriz),
    component: VariationCapitaux,
    description: 'Évolution des capitaux propres',
    status: 'partial',
    completude: 70,
    category: 'États financiers',
    order: 13,
    isVisible: true,
  },
  
  // Notes annexes individuelles (1-35)
  {
    id: 'note-1',
    label: 'Note 1 - Règles et Méthodes',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 0 }),
    description: 'Référentiel comptable et méthodes d\'évaluation',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 14,
    isVisible: true,
  },
  {
    id: 'note-2',
    label: 'Note 2 - Immobilisations Incorporelles',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 1 }),
    description: 'Brevets, licences, logiciels',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 15,
    isVisible: true,
  },
  {
    id: 'note-3',
    label: 'Note 3 - Immobilisations Corporelles',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 2 }),
    description: 'Terrains, bâtiments, matériel',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 16,
    isVisible: true,
  },
  {
    id: 'note-4',
    label: 'Note 4 - Immobilisations Financières',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 3 }),
    description: 'Titres, prêts, participations',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 17,
    isVisible: true,
  },
  {
    id: 'note-5',
    label: 'Note 5 - Stocks et En-cours',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 4 }),
    description: 'Composition et évaluation des stocks',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 18,
    isVisible: true,
  },
  {
    id: 'note-6',
    label: 'Note 6 - Créances Clients',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 5 }),
    description: 'Analyse et échéancier clients',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 19,
    isVisible: true,
  },
  {
    id: 'note-7',
    label: 'Note 7 - Autres Créances',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 6 }),
    description: 'TVA, personnel, État',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 20,
    isVisible: true,
  },
  {
    id: 'note-8',
    label: 'Note 8 - Trésorerie Actif',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 7 }),
    description: 'Banques, caisse, titres placement',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 21,
    isVisible: true,
  },
  {
    id: 'note-9',
    label: 'Note 9 - Capitaux Propres',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 8 }),
    description: 'Mouvement des capitaux propres',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 22,
    isVisible: true,
  },
  {
    id: 'note-10',
    label: 'Note 10 - Provisions Réglementées',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 9 }),
    description: 'Amortissements dérogatoires',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 23,
    isVisible: true,
  },
  {
    id: 'note-11',
    label: 'Note 11 - Emprunts et Dettes',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 10 }),
    description: 'Dettes financières et échéances',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 24,
    isVisible: true,
  },
  {
    id: 'note-12',
    label: 'Note 12 - Éléments Exceptionnels',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 11 }),
    description: 'Produits et charges exceptionnels',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 25,
    isVisible: true,
  },
  {
    id: 'note-13',
    label: 'Note 13 - Impôts sur Résultat',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 12 }),
    description: 'IS courant et différé',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 26,
    isVisible: true,
  },
  {
    id: 'note-14',
    label: 'Note 14 - Résultat par Action',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 13 }),
    description: 'Résultat de base et dilué',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 27,
    isVisible: true,
  },
  {
    id: 'note-15',
    label: 'Note 15 - Plus/Moins-Values',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 14 }),
    description: 'Cessions d\'immobilisations',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 28,
    isVisible: true,
  },
  {
    id: 'note-16',
    label: 'Note 16 - Subventions',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 15 }),
    description: 'Subventions reçues et emploi',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 29,
    isVisible: true,
  },
  {
    id: 'note-17',
    label: 'Note 17 - Résultats Exercices Antérieurs',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 16 }),
    description: 'Évolution sur 5 exercices',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 30,
    isVisible: true,
  },
  {
    id: 'note-18',
    label: 'Note 18 - Affectation Résultat',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 17 }),
    description: 'Proposition affectation',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 31,
    isVisible: true,
  },
  {
    id: 'note-19',
    label: 'Note 19 - Filiales Participations',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 18 }),
    description: 'Détail des participations',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 32,
    isVisible: true,
  },
  {
    id: 'note-20',
    label: 'Note 20 - Engagements Hors Bilan',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 19 }),
    description: 'Garanties, avals, crédit-bail',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 33,
    isVisible: true,
  },
  {
    id: 'note-21',
    label: 'Note 21 - Effectif Personnel',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 20 }),
    description: 'Évolution effectif et masse salariale',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 34,
    isVisible: true,
  },
  {
    id: 'note-22',
    label: 'Note 22 - Rémunérations Dirigeants',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 21 }),
    description: 'Mandataires sociaux et CAC',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 35,
    isVisible: true,
  },
  {
    id: 'note-23',
    label: 'Note 23 - Répartition Capital',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 22 }),
    description: 'Actionnariat et droits de vote',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 36,
    isVisible: true,
  },
  {
    id: 'note-24',
    label: 'Note 24 - Ventilation CA',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 23 }),
    description: 'CA par secteur géographique',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 37,
    isVisible: true,
  },
  {
    id: 'note-25',
    label: 'Note 25 - Parties Liées',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 24 }),
    description: 'Transactions avec parties liées',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 38,
    isVisible: true,
  },
  {
    id: 'note-26',
    label: 'Note 26 - Engagements Financiers',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 25 }),
    description: 'Garanties données et reçues',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 39,
    isVisible: true,
  },
  {
    id: 'note-27',
    label: 'Note 27 - Crédit-bail',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 26 }),
    description: 'Contrats crédit-bail et assimilés',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 40,
    isVisible: true,
  },
  {
    id: 'note-28',
    label: 'Note 28 - Échéances',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 27 }),
    description: 'Échéances créances et dettes',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 41,
    isVisible: true,
  },
  {
    id: 'note-29',
    label: 'Note 29 - Charges par Destination',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 28 }),
    description: 'Ventilation fonctionnelle',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 42,
    isVisible: true,
  },
  {
    id: 'note-30',
    label: 'Note 30 - Produits/Charges Ajustement',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 29 }),
    description: 'À recevoir et à payer',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 43,
    isVisible: true,
  },
  {
    id: 'note-31',
    label: 'Note 31 - Charges/Produits d\'Avance',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 30 }),
    description: 'Constatés d\'avance',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 44,
    isVisible: true,
  },
  {
    id: 'note-32',
    label: 'Note 32 - Conversion Devises',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 31 }),
    description: 'Écarts de change et provisions',
    status: 'complete',
    completude: 85,
    category: 'Notes annexes',
    order: 45,
    isVisible: true,
  },
  {
    id: 'note-33',
    label: 'Note 33 - Événements Post-Clôture',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 32 }),
    description: 'Événements après arrêté',
    status: 'complete',
    completude: 80,
    category: 'Notes annexes',
    order: 46,
    isVisible: true,
  },
  {
    id: 'note-34',
    label: 'Note 34 - Filiales',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 33 }),
    description: 'Participations et filiales',
    status: 'complete',
    completude: 90,
    category: 'Notes annexes',
    order: 47,
    isVisible: true,
  },
  {
    id: 'note-35',
    label: 'Note 35 - Informations Diverses',
    icon: React.createElement(Notes),
    component: () => React.createElement(NotesAnnexesCompletesFinal, { noteFixe: 34 }),
    description: 'Autres informations requises',
    status: 'complete',
    completude: 95,
    category: 'Notes annexes',
    order: 48,
    isVisible: true,
  },
  
  // SUPPLÉMENTS ET COMPLÉMENTS (selon fichier Excel)
  {
    id: 'supplement-tva',
    label: 'Supplément TVA',
    icon: React.createElement(Assessment),
    component: SupplementTVA,
    description: 'Détails TVA collectée, déductible, régularisations',
    status: 'complete',
    completude: 100,
    category: 'Suppléments fiscaux',
    order: 15,
    isVisible: true,
  },
  {
    id: 'supplement-impot-societe',
    label: 'Supplément Impôt Sociétés',
    icon: React.createElement(AccountBalance),
    component: SupplementImpotSociete,
    description: 'Calculs IS, réintégrations, déductions',
    status: 'complete',
    completude: 100,
    category: 'Suppléments fiscaux',
    order: 16,
    isVisible: true,
  },
  {
    id: 'supplement-avantages-fiscaux',
    label: 'Supplément Avantages Fiscaux',
    icon: React.createElement(TrendingUp),
    component: SupplementAvantagesFiscaux,
    description: 'Exonérations, déductions, crédits d\'impôt',
    status: 'complete',
    completude: 95,
    category: 'Suppléments fiscaux',
    order: 17,
    isVisible: true,
  },
  {
    id: 'complement-charges',
    label: 'Complément Charges',
    icon: React.createElement(TrendingDown),
    component: ComplementCharges,
    description: 'Détail des charges par nature et destination',
    status: 'complete',
    completude: 90,
    category: 'Compléments détaillés',
    order: 18,
    isVisible: true,
  },
  {
    id: 'complement-produits',
    label: 'Complément Produits',
    icon: React.createElement(TrendingUp),
    component: ComplementProduits,
    description: 'Détail des produits par nature et origine',
    status: 'complete',
    completude: 95,
    category: 'Compléments détaillés',
    order: 19,
    isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impôts',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes diverses selon pays OHADA',
    status: 'complete',
    completude: 100,
    category: 'Calculs fiscaux',
    order: 20,
    isVisible: true,
  },
  {
    id: 'tableaux-supplementaires',
    label: 'Tableaux Supplémentaires',
    icon: React.createElement(TableChart),
    component: TableauxSupplementaires,
    description: 'Effectif, filiales, engagements hors bilan (Notes 19-21)',
    status: 'complete',
    completude: 95,
    category: 'Annexes détaillées',
    order: 16,
    isVisible: true,
  },
  {
    id: 'note-12-standalone',
    label: 'Note 12 - Éléments Exceptionnels',
    icon: React.createElement(TrendingUp),
    component: Note12SYSCOHADA,
    description: 'Produits et charges exceptionnels avec commentaires détaillés',
    status: 'complete',
    completude: 100,
    category: 'Notes annexes',
    order: 17,
    isVisible: true,
  },
]

// ============ Composants SMT ============
export const SMT_COMPONENTS: LiasseComponentConfig[] = [
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture de la liasse fiscale SMT',
    status: 'complete',
    completude: 100,
    category: 'Couverture',
    order: 1,
    isVisible: true,
  },
  {
    id: 'fiche-r1',
    label: 'Fiche R1 - Renseignements Generaux',
    icon: React.createElement(Business),
    component: FicheR1SYSCOHADA,
    description: 'Identification et renseignements generaux',
    status: 'complete',
    completude: 95,
    category: 'Fiches',
    order: 2,
    isVisible: true,
  },
  {
    id: 'bilan-smt',
    label: 'Bilan Simplifie SMT',
    icon: React.createElement(AccountBalance),
    component: BilanSMT,
    description: 'Bilan simplifie actif + passif (une page)',
    status: 'complete',
    completude: 100,
    category: 'Etats financiers',
    order: 3,
    isVisible: true,
  },
  {
    id: 'cdr-smt',
    label: 'Compte de Resultat SMT',
    icon: React.createElement(TrendingUp),
    component: CompteResultatSMT,
    description: 'Compte de resultat simplifie SMT',
    status: 'complete',
    completude: 100,
    category: 'Etats financiers',
    order: 4,
    isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impots',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes',
    status: 'complete',
    completude: 100,
    category: 'Calculs fiscaux',
    order: 5,
    isVisible: true,
  },
]

// ============ Composants BANQUE ============
export const BANQUE_COMPONENTS: LiasseComponentConfig[] = [
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture liasse bancaire',
    status: 'complete', completude: 100, category: 'Couverture', order: 1, isVisible: true,
  },
  {
    id: 'bilan-banque',
    label: 'Bilan Bancaire',
    icon: React.createElement(AccountBalance),
    component: BilanBanque,
    description: 'Bilan bancaire PCEC/PCB',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 2, isVisible: true,
  },
  {
    id: 'cdr-banque',
    label: 'Compte d\'Exploitation Bancaire',
    icon: React.createElement(TrendingUp),
    component: CompteExploitationBanque,
    description: 'PNB et resultat bancaire',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 3, isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impots',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes',
    status: 'complete', completude: 100, category: 'Calculs fiscaux', order: 4, isVisible: true,
  },
]

// ============ Composants ASSURANCE ============
export const ASSURANCE_COMPONENTS: LiasseComponentConfig[] = [
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture liasse assurance',
    status: 'complete', completude: 100, category: 'Couverture', order: 1, isVisible: true,
  },
  {
    id: 'bilan-assurance',
    label: 'Bilan Assurance',
    icon: React.createElement(AccountBalance),
    component: BilanAssurance,
    description: 'Bilan specifique assurance CIMA',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 2, isVisible: true,
  },
  {
    id: 'cdr-assurance',
    label: 'Compte de Resultat Assurance',
    icon: React.createElement(TrendingUp),
    component: CompteResultatAssurance,
    description: 'Compte technique et non-technique',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 3, isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impots',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes',
    status: 'complete', completude: 100, category: 'Calculs fiscaux', order: 4, isVisible: true,
  },
]

// ============ Composants MICROFINANCE ============
export const MICROFINANCE_COMPONENTS: LiasseComponentConfig[] = [
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture liasse SFD',
    status: 'complete', completude: 100, category: 'Couverture', order: 1, isVisible: true,
  },
  {
    id: 'bilan-microfinance',
    label: 'Bilan SFD',
    icon: React.createElement(AccountBalance),
    component: BilanMicrofinance,
    description: 'Bilan SFD BCEAO/COBAC',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 2, isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impots',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes',
    status: 'complete', completude: 100, category: 'Calculs fiscaux', order: 3, isVisible: true,
  },
]

// ============ Composants EBNL ============
export const EBNL_COMPONENTS: LiasseComponentConfig[] = [
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture liasse EBNL',
    status: 'complete', completude: 100, category: 'Couverture', order: 1, isVisible: true,
  },
  {
    id: 'bilan-ebnl',
    label: 'Bilan EBNL',
    icon: React.createElement(AccountBalance),
    component: BilanEBNL,
    description: 'Bilan SYCEBNL avec fonds associatifs',
    status: 'complete', completude: 100, category: 'Etats financiers', order: 2, isVisible: true,
  },
  {
    id: 'tables-calcul-impots',
    label: 'Tables Calcul Impots',
    icon: React.createElement(Calculate),
    component: TablesCalculImpots,
    description: 'Calculs automatiques IS, TVA, taxes',
    status: 'complete', completude: 100, category: 'Calculs fiscaux', order: 3, isVisible: true,
  },
]

/**
 * Retourne les composants adaptés au type de liasse
 */
export type TypeLiasseComponents = 'SN' | 'SMT' | 'BANQUE' | 'ASSURANCE' | 'MICROFINANCE' | 'EBNL' | 'CONSO'

export function getComponentsForType(type: TypeLiasseComponents): LiasseComponentConfig[] {
  switch (type) {
    case 'SMT': return SMT_COMPONENTS
    case 'BANQUE': return BANQUE_COMPONENTS
    case 'ASSURANCE': return ASSURANCE_COMPONENTS
    case 'MICROFINANCE': return MICROFINANCE_COMPONENTS
    case 'EBNL': return EBNL_COMPONENTS
    case 'CONSO':
    case 'SN':
    default:
      return LIASSE_COMPONENTS
  }
}

// Fonction utilitaire pour obtenir un composant par ID
export const getComponentById = (id: string): LiasseComponentConfig | undefined => {
  return LIASSE_COMPONENTS.find(comp => comp.id === id)
}

// Fonction pour obtenir les composants par catégorie
export const getComponentsByCategory = (): Record<string, LiasseComponentConfig[]> => {
  return LIASSE_COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = []
    }
    acc[comp.category].push(comp)
    return acc
  }, {} as Record<string, LiasseComponentConfig[]>)
}

// Calcul de la complétude globale
export const getGlobalCompletude = (): number => {
  const visibleComponents = LIASSE_COMPONENTS.filter(comp => comp.isVisible)
  const totalCompletude = visibleComponents.reduce((sum, comp) => sum + comp.completude, 0)
  return Math.round(totalCompletude / visibleComponents.length)
}

// Statistiques par statut
export const getStatusStats = () => {
  const visibleComponents = LIASSE_COMPONENTS.filter(comp => comp.isVisible)
  return {
    total: visibleComponents.length,
    complete: visibleComponents.filter(comp => comp.status === 'complete').length,
    partial: visibleComponents.filter(comp => comp.status === 'partial').length,
    empty: visibleComponents.filter(comp => comp.status === 'empty').length,
  }
}