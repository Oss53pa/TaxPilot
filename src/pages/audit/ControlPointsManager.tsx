/**
 * Interface de Gestion des Règles de Contrôle IA
 * Chaque règle est associée à un algorithme que l'IA utilisera lors de l'audit
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Tabs,
  Tab,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Psychology as AIIcon,
} from '@mui/icons-material'

interface ControlPoint {
  id: number
  code: string
  nom: string
  description: string
  type_regle: string
  algorithme: string
  niveau_severite: string
  est_active: boolean
  portee?: 'BALANCE' | 'LIASSE' | 'BOTH'
}

interface AlgorithmIA {
  code: string
  nom: string
  description: string
  parametres_disponibles: string[]
  type: 'DETECTION' | 'CLASSIFICATION' | 'PREDICTION'
  detailDescription?: string
  parametres?: {
    [key: string]: {
      type: string
      default: any
      description: string
    }
  }
}

const ControlPointsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([])
  const [algorithmes, setAlgorithmes] = useState<AlgorithmIA[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<ControlPoint | null>(null)
  const [algorithmModalOpen, setAlgorithmModalOpen] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmIA | null>(null)

  // Fonction pour déterminer la portée automatiquement
  const getPorteePoint = (point: ControlPoint): 'BALANCE' | 'LIASSE' | 'BOTH' => {
    // Si la propriété portee existe, l'utiliser
    if (point.portee) return point.portee
    
    // Sinon, déduire selon le type de règle et le code
    if (point.type_regle === 'Balance') return 'BALANCE'
    if (point.type_regle === 'TFT' || point.type_regle === 'Coherence') return 'LIASSE'
    if (point.type_regle === 'Fiscal' || point.type_regle === 'Legal') return 'BOTH'
    if (point.code.includes('I.8.') || point.code.includes('I.9.') || point.code.includes('I.10.')) return 'LIASSE'
    return 'BALANCE' // Par défaut
  }

  const getPorteeColor = (portee: string) => {
    switch (portee) {
      case 'BALANCE': return { bgcolor: '#f5f5f5', color: '#171717' } // Gris
      case 'LIASSE': return { bgcolor: '#e8f5e8', color: '#388e3c' }  // Vert
      case 'BOTH': return { bgcolor: '#fff3e0', color: '#f57c00' }    // Orange
      default: return { bgcolor: '#f5f5f5', color: '#757575' }        // Gris
    }
  }

  useEffect(() => {
    // 🔍 LISTE EXHAUSTIVE DES CONTRÔLES COMPTABLES OHADA/IFRS
    setControlPoints([
      // PARTIE I - CONTRÔLES DE LA BALANCE GÉNÉRALE
      
      // 1. CONTRÔLES D'ÉQUILIBRE FONDAMENTAUX
      {
        id: 1,
        code: 'I.1.1',
        nom: 'Équilibre Global Balance',
        description: 'Total Débit = Total Crédit (Tolérance: 0,01 FCFA)',
        type_regle: 'Balance',
        algorithme: 'EQUILIBRE_GLOBAL',
        niveau_severite: 'Critique',
        est_active: true,
        portee: 'BALANCE'
      },
      {
        id: 2,
        code: 'I.1.2',
        nom: 'Équilibre par Journal',
        description: 'Chaque journal (AC, VE, BQ, CA, OD, AN, CL, RO) équilibré',
        type_regle: 'Balance',
        algorithme: 'EQUILIBRE_JOURNAUX',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 3,
        code: 'I.1.3',
        nom: 'Soldes Multiples',
        description: 'Aucun compte ne peut avoir solde débiteur ET créditeur',
        type_regle: 'Balance',
        algorithme: 'DOUBLE_SOLDE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 4,
        code: 'I.1.4',
        nom: 'Équilibre Mensuel',
        description: 'Chaque période mensuelle doit être équilibrée',
        type_regle: 'Balance',
        algorithme: 'EQUILIBRE_PERIODIQUE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 2. CONTRÔLES DE COHÉRENCE DES COMPTES
      {
        id: 5,
        code: 'I.2.1.1',
        nom: 'Sens Classe 1 - Capitaux',
        description: 'Comptes 10*-11* créditeurs (sauf 109, 119)',
        type_regle: 'Cohérence',
        algorithme: 'SENS_CLASSE_1',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 6,
        code: 'I.2.1.2',
        nom: 'Sens Classe 2 - Immobilisations',
        description: 'Comptes 28*/29* (amortissements) créditeurs',
        type_regle: 'Cohérence',
        algorithme: 'SENS_CLASSE_2',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 7,
        code: 'I.2.1.3',
        nom: 'Sens Classe 3 - Stocks',
        description: 'Stocks débiteurs (sauf 39* dépréciations)',
        type_regle: 'Cohérence',
        algorithme: 'SENS_CLASSE_3',
        niveau_severite: 'Erreur',
        est_active: true
      },
      {
        id: 8,
        code: 'I.2.1.4',
        nom: 'Sens Classe 4 - Tiers',
        description: '401 créditeur, 411 débiteur (sauf exceptions)',
        type_regle: 'Cohérence',
        algorithme: 'SENS_CLASSE_4',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 9,
        code: 'I.2.1.5',
        nom: 'Sens Classe 5 - Trésorerie',
        description: 'Caisse (571) obligatoirement débiteur',
        type_regle: 'Cohérence',
        algorithme: 'SENS_CLASSE_5',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 10,
        code: 'I.2.2.1',
        nom: 'Immobilisations/Amortissements',
        description: 'Amortissements ≤ Valeur brute par classe',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_AMORTISSEMENTS',
        niveau_severite: 'Erreur',
        est_active: true
      },
      {
        id: 11,
        code: 'I.2.2.2',
        nom: 'TVA/Chiffre d\'Affaires',
        description: 'TVA collectée cohérente avec CA (±2%)',
        type_regle: 'Fiscal',
        algorithme: 'COHERENCE_TVA_CA',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 12,
        code: 'I.2.2.3',
        nom: 'TVA Déductible/Achats',
        description: 'TVA déductible proportionnelle aux achats',
        type_regle: 'Fiscal',
        algorithme: 'COHERENCE_TVA_ACHATS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 13,
        code: 'I.2.2.4',
        nom: 'Créances/Provisions',
        description: 'Provisions ≤ Créances brutes par catégorie',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_PROVISIONS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 3. CONTRÔLES ANALYTIQUES ET RATIOS
      {
        id: 14,
        code: 'I.3.1.1',
        nom: 'Fonds de Roulement',
        description: 'FDR = Capitaux permanents - Actif immobilisé',
        type_regle: 'Ratio',
        algorithme: 'CALCUL_FDR',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 15,
        code: 'I.3.1.2',
        nom: 'Besoin Fonds Roulement',
        description: 'BFR = Stocks + Créances - Dettes exploitation',
        type_regle: 'Ratio',
        algorithme: 'CALCUL_BFR',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 16,
        code: 'I.3.2.1',
        nom: 'Liquidité Générale',
        description: 'Actif CT / Passif CT (Seuil: > 1)',
        type_regle: 'Ratio',
        algorithme: 'RATIO_LIQUIDITE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 17,
        code: 'I.3.3.1',
        nom: 'Rotation des Stocks',
        description: 'CAMV / Stock Moyen par catégorie',
        type_regle: 'Ratio',
        algorithme: 'ROTATION_STOCKS',
        niveau_severite: 'Mineure',
        est_active: true
      },
      {
        id: 18,
        code: 'I.3.3.2',
        nom: 'Délai Recouvrement Clients',
        description: '(Créances clients / CA TTC) × 360',
        type_regle: 'Ratio',
        algorithme: 'DELAI_CLIENTS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 4. CONTRÔLES FISCAUX SPÉCIFIQUES
      {
        id: 19,
        code: 'I.4.1.1',
        nom: 'Charges Non Déductibles - Amendes',
        description: 'Détection comptes 6712, 6718 (réintégration)',
        type_regle: 'Fiscal',
        algorithme: 'DETECTION_AMENDES',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 20,
        code: 'I.4.1.2',
        nom: 'Charges Non Déductibles - Cadeaux',
        description: 'Limite 1‰ CA (compte 6234)',
        type_regle: 'Fiscal',
        algorithme: 'LIMITE_CADEAUX',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 21,
        code: 'I.4.1.3',
        nom: 'Charges Non Déductibles - Libéralités',
        description: 'Limite 5‰ CA (comptes 6238, 6588)',
        type_regle: 'Fiscal',
        algorithme: 'LIMITE_LIBERALITES',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 22,
        code: 'I.4.2.1',
        nom: 'Prorata Déduction TVA',
        description: 'TVA déductible selon activité imposable',
        type_regle: 'Fiscal',
        algorithme: 'PRORATA_TVA',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 5. DÉTECTION D'ANOMALIES PAR PATTERN
      {
        id: 23,
        code: 'I.5.1.1',
        nom: 'Doublons MD5',
        description: 'Hash(date+montant+compte+journal) + Levenshtein',
        type_regle: 'IA',
        algorithme: 'DETECTION_DOUBLONS_MD5',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 24,
        code: 'I.5.1.2',
        nom: 'Doublons Temporels',
        description: 'Transactions identiques ±3 jours',
        type_regle: 'IA',
        algorithme: 'DOUBLONS_PROXIMITE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 25,
        code: 'I.5.2.1',
        nom: 'Loi de Benford',
        description: 'Distribution premiers chiffres (Chi² test)',
        type_regle: 'IA',
        algorithme: 'LOI_BENFORD',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 26,
        code: 'I.5.3.1',
        nom: 'Isolation Forest',
        description: 'Détection outliers par ML',
        type_regle: 'IA',
        algorithme: 'ISOLATION_FOREST',
        niveau_severite: 'Mineure',
        est_active: true
      },
      {
        id: 27,
        code: 'I.5.4.1',
        nom: 'Séquences Anormales',
        description: 'Ruptures séquences numérotation',
        type_regle: 'IA',
        algorithme: 'ANALYSE_SEQUENCES',
        niveau_severite: 'Mineure',
        est_active: true
      },
      {
        id: 28,
        code: 'I.5.4.2',
        nom: 'Écritures Antidatées',
        description: 'Date saisie - date pièce > 30j',
        type_regle: 'IA',
        algorithme: 'DETECTION_ANTIDATE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 6. CONTRÔLES IFRS SPÉCIFIQUES
      {
        id: 29,
        code: 'I.6.1.1',
        nom: 'Test Dépréciation IAS 36',
        description: 'Valeur recouvrable UGT vs valeur comptable',
        type_regle: 'IFRS',
        algorithme: 'TEST_DEPRECIATION_IAS36',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 30,
        code: 'I.6.2.1',
        nom: 'Résultat Global IAS 1',
        description: 'Autres éléments résultat global (OCI)',
        type_regle: 'IFRS',
        algorithme: 'RESULTAT_GLOBAL_IAS1',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // PARTIE II - CONTRÔLES DE LA LIASSE FISCALE
      
      // 1. CONTRÔLES DE COHÉRENCE BALANCE/LIASSE
      {
        id: 31,
        code: 'II.1.1.1',
        nom: 'Mapping AA - Immo Incorporelles',
        description: '201+203+205+207 - 280-290 = AA',
        type_regle: 'Liasse',
        algorithme: 'MAPPING_BILAN_AA',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 32,
        code: 'II.1.1.2',
        nom: 'Mapping AB - Terrains',
        description: '222+223 - 282-292 = AB',
        type_regle: 'Liasse',
        algorithme: 'MAPPING_BILAN_AB',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 33,
        code: 'II.1.1.3',
        nom: 'Mapping AC - Bâtiments',
        description: '231+232+233 - 283-293 = AC',
        type_regle: 'Liasse',
        algorithme: 'MAPPING_BILAN_AC',
        niveau_severite: 'Critique',
        est_active: true
      },
      
      // 2. CONTRÔLES ARITHMÉTIQUES DES ÉTATS
      {
        id: 34,
        code: 'II.2.1.1',
        nom: 'Totalisation Actif',
        description: 'BT = AZ + BJ + BQ + BR + Trésorerie',
        type_regle: 'Liasse',
        algorithme: 'TOTALISATION_ACTIF',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 35,
        code: 'II.2.1.2',
        nom: 'Totalisation Passif',
        description: 'DV = CP + Dettes + Provisions + Trésorerie',
        type_regle: 'Liasse',
        algorithme: 'TOTALISATION_PASSIF',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 36,
        code: 'II.2.2.1',
        nom: 'Cascade Marge Commerciale',
        description: 'TB = TA - RA (Ventes - Achats marchandises)',
        type_regle: 'Liasse',
        algorithme: 'CASCADE_MARGE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 37,
        code: 'II.2.2.2',
        nom: 'Cascade Valeur Ajoutée',
        description: 'TK = Marge + Production - Consommations',
        type_regle: 'Liasse',
        algorithme: 'CASCADE_VA',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 38,
        code: 'II.2.2.3',
        nom: 'Cascade EBE',
        description: 'TN = VA - Charges personnel - Impôts',
        type_regle: 'Liasse',
        algorithme: 'CASCADE_EBE',
        niveau_severite: 'Critique',
        est_active: true
      },
      
      // 3. TABLEAU DE PASSAGE FISCAL
      {
        id: 39,
        code: 'II.3.1.1',
        nom: 'Réintégrations Automatiques',
        description: 'Détection charges non déductibles',
        type_regle: 'Fiscal',
        algorithme: 'REINTEGRATIONS_AUTO',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 40,
        code: 'II.3.2.1',
        nom: 'Déductions Autorisées',
        description: 'Validation reports déficitaires, PV exonérées',
        type_regle: 'Fiscal',
        algorithme: 'DEDUCTIONS_FISCALES',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 4. TABLEAUX ANNEXES OBLIGATOIRES
      {
        id: 41,
        code: 'II.4.1.1',
        nom: 'Tableau 1 - Immobilisations',
        description: 'Valeur_fin = Début + Acquisitions - Cessions',
        type_regle: 'Annexe',
        algorithme: 'TABLEAU_IMMOBILISATIONS',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 42,
        code: 'II.4.2.1',
        nom: 'Tableau 2 - Amortissements',
        description: 'Taux cohérents et calculs corrects',
        type_regle: 'Annexe',
        algorithme: 'TABLEAU_AMORTISSEMENTS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 43,
        code: 'II.4.3.1',
        nom: 'Tableau 3 - Provisions',
        description: 'Justification et évaluation provisions',
        type_regle: 'Annexe',
        algorithme: 'TABLEAU_PROVISIONS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 44,
        code: 'II.4.4.1',
        nom: 'Tableau 4 - Échéances',
        description: 'Analyse créances/dettes par échéance',
        type_regle: 'Annexe',
        algorithme: 'ANALYSE_ECHEANCES',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 5. TAFIRE (Tableau Financier)
      {
        id: 45,
        code: 'II.5.1.1',
        nom: 'CAF - Méthode Soustractive',
        description: 'CAF = EBE + Produits - Charges financières',
        type_regle: 'Liasse',
        algorithme: 'CAF_SOUSTRACTIVE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 46,
        code: 'II.5.1.2',
        nom: 'CAF - Méthode Additive',
        description: 'CAF = Résultat + Dotations - Reprises',
        type_regle: 'Liasse',
        algorithme: 'CAF_ADDITIVE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 47,
        code: 'II.5.2.1',
        nom: 'Variation BFR',
        description: 'ΔBFR = ΔStocks + ΔCréances - ΔDettes',
        type_regle: 'Liasse',
        algorithme: 'VARIATION_BFR',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 48,
        code: 'II.5.3.1',
        nom: 'Réconciliation Trésorerie',
        description: 'ΔTAFIRE = ΔBILAN (Cohérence flux)',
        type_regle: 'Liasse',
        algorithme: 'RECONCILIATION_TRESORERIE',
        niveau_severite: 'Critique',
        est_active: true
      },
      
      // 6. CONTRÔLES PAR SYSTÈME
      {
        id: 49,
        code: 'II.6.1.1',
        nom: 'Complétude Système Normal',
        description: '25 tableaux obligatoires + seuils CA',
        type_regle: 'Système',
        algorithme: 'COMPLETUDE_SN',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 50,
        code: 'II.6.2.1',
        nom: 'Éligibilité Système Allégé',
        description: 'CA ≤ 100M + Effectif ≤ 20',
        type_regle: 'Système',
        algorithme: 'ELIGIBILITE_SA',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 51,
        code: 'II.6.3.1',
        nom: 'Éligibilité Système Minimal',
        description: 'CA ≤ 30M + Flux trésorerie obligatoire',
        type_regle: 'Système',
        algorithme: 'ELIGIBILITE_SMT',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 7. SYSTÈME DE SCORING
      {
        id: 52,
        code: 'I.7.1.1',
        nom: 'Scoring Multi-Critères',
        description: 'Score pondéré (Équilibre 30% + Cohérence 25% + Fiscal 20% + Annexes 15% + Ratios 10%)',
        type_regle: 'Scoring',
        algorithme: 'SCORING_MULTICRITERES',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 53,
        code: 'I.7.2.1',
        nom: 'Certification Qualité',
        description: '≥90% Sans réserve, ≥75% Avec réserves, <75% Refusée',
        type_regle: 'Scoring',
        algorithme: 'CERTIFICATION_QUALITE',
        niveau_severite: 'Critique',
        est_active: true
      },
      
      // 8. CONTRÔLES DE COHÉRENCE ÉTATS/NOTES ANNEXES
      {
        id: 54,
        code: 'I.8.1.1',
        nom: 'Cohérence Immobilisations Corporelles',
        description: 'Bilan Actif = Note tableau immobilisations (seuil 1000)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_IMMO_CORP',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 55,
        code: 'I.8.1.2',
        nom: 'Cohérence Immobilisations Incorporelles',
        description: 'Bilan Actif = Note tableau immobilisations (seuil 500)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_IMMO_INCORP',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 56,
        code: 'I.8.2.1',
        nom: 'Cohérence Dettes Financières',
        description: 'Bilan Passif = Note dettes établissement crédit (seuil 2000)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_DETTES_FIN',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 57,
        code: 'I.8.2.2',
        nom: 'Cohérence Provisions',
        description: 'Bilan Passif = Note tableau provisions (seuil 1500)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_PROVISIONS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 58,
        code: 'I.8.3.1',
        nom: 'Cohérence Stocks',
        description: 'Bilan Actif = Note mouvement stocks (seuil 1000)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_STOCKS',
        niveau_severite: 'Majeure',
        est_active: true
      },
      
      // 9. CONTRÔLES TFT VS TABLEAU IMMOBILISATIONS
      {
        id: 59,
        code: 'I.9.1.1',
        nom: 'TFT Acquisitions vs Tableau',
        description: 'Flux investissement acquisitions = Augmentations tableau (seuil 5000)',
        type_regle: 'TFT',
        algorithme: 'TFT_ACQUISITIONS_COHERENCE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 60,
        code: 'I.9.1.2',
        nom: 'TFT Cessions vs Tableau',
        description: 'Flux investissement cessions = Diminutions tableau (seuil 3000)',
        type_regle: 'TFT',
        algorithme: 'TFT_CESSIONS_COHERENCE',
        niveau_severite: 'Critique',
        est_active: true
      },
      {
        id: 61,
        code: 'I.9.2.1',
        nom: 'TFT Amortissements vs Tableau',
        description: 'Dotations TFT = Dotations tableau amortissements (seuil 2000)',
        type_regle: 'TFT',
        algorithme: 'TFT_AMORTISSEMENTS_COHERENCE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 62,
        code: 'I.9.3.1',
        nom: 'TFT Variation Nette',
        description: 'Variation nette TFT = Variation nette tableau (seuil 1000)',
        type_regle: 'TFT',
        algorithme: 'TFT_VARIATION_NETTE',
        niveau_severite: 'Majeure',
        est_active: true
      },
      {
        id: 63,
        code: 'I.9.4.1',
        nom: 'TFT Équilibre Mathématique',
        description: 'Flux Exploitation + Investissement + Financement = Variation Trésorerie',
        type_regle: 'TFT',
        algorithme: 'TFT_EQUILIBRE_MATH',
        niveau_severite: 'Critique',
        est_active: true
      },
      
      // 10. CONTRÔLES CHIFFRE D'AFFAIRES
      {
        id: 64,
        code: 'I.10.1.1',
        nom: 'Cohérence CA Résultat vs Note 17',
        description: 'Chiffre affaires compte résultat = Note 17 (seuil 10000)',
        type_regle: 'Cohérence',
        algorithme: 'COHERENCE_CA_NOTE17',
        niveau_severite: 'Majeure',
        est_active: true
      }
    ])

    // 🤖 ALGORITHMES IA EXHAUSTIFS OHADA/IFRS
    setAlgorithmes([
      // ALGORITHMES ÉQUILIBRE ET COHÉRENCE
      {
        code: 'EQUILIBRE_GLOBAL',
        nom: 'Équilibre Global Balance',
        description: 'Contrôle critique équilibre débit/crédit',
        parametres_disponibles: ['tolerance', 'comptes_exclus'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.1.1:\nPOUR chaque ligne balance\n  SOMMER total_debit += ligne.debit\n  SOMMER total_credit += ligne.credit\nFIN POUR\nSI ABS(total_debit - total_credit) > 0.01 ALORS\n  ERREUR CRITIQUE: Balance déséquilibrée\n\nTOLÉRANCE: 0,01 FCFA`,
        parametres: {
          tolerance: { type: 'number', default: 0.01, description: 'Tolérance en FCFA' },
          comptes_exclus: { type: 'array', default: [], description: 'Comptes exclus du contrôle' }
        }
      },
      {
        code: 'EQUILIBRE_JOURNAUX',
        nom: 'Équilibre par Journal',
        description: 'Contrôle équilibre AC, VE, BQ, CA, OD, AN, CL, RO',
        parametres_disponibles: ['journaux_actifs', 'tolerance'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.1.2:\nPOUR chaque journal J dans [AC, VE, BQ, CA, OD, AN, CL, RO]\n  FILTRER lignes où ligne.journal = J\n  CALCULER debit_journal, credit_journal\n  SI ABS(debit_journal - credit_journal) > 0.01 ALORS\n    ERREUR MAJEURE: Journal J déséquilibré`,
        parametres: {
          journaux_actifs: { type: 'array', default: ['AC', 'VE', 'BQ', 'CA', 'OD', 'AN', 'CL', 'RO'], description: 'Journaux à contrôler' },
          tolerance: { type: 'number', default: 0.01, description: 'Tolérance par journal' }
        }
      },
      {
        code: 'DOUBLE_SOLDE',
        nom: 'Détection Double Solde',
        description: 'Compte ne peut être débiteur ET créditeur',
        parametres_disponibles: ['comptes_mixtes_autorises'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.1.3:\nSI compte.solde_debit > 0 ET compte.solde_credit > 0 ALORS\n  ERREUR CRITIQUE: Double solde impossible\n\nCONTRÔLE: Un compte ne peut avoir simultanément\n- Un solde débiteur ET\n- Un solde créditeur`,
        parametres: {
          comptes_mixtes_autorises: { type: 'array', default: [], description: 'Comptes autorisés à avoir double nature' }
        }
      },
      
      // ALGORITHMES SENS NORMAL COMPTES
      {
        code: 'SENS_CLASSE_1',
        nom: 'Sens Normal Classe 1',
        description: 'Capitaux créditeurs (sauf 109, 119)',
        parametres_disponibles: ['exceptions_autorisees'],
        type: 'CLASSIFICATION',
        detailDescription: `ALGORITHME I.2.1.1 CLASSE 1:\nComptes 101-109: Capitaux → CRÉDITEUR\nComptes 111-118: Réserves → CRÉDITEUR\nEXCEPTION: 109 (Capital souscrit non appelé) → DÉBITEUR\nEXCEPTION: 119 (Report nouveau débiteur) → DÉBITEUR\n\nSI compte = 10* ET solde_debiteur > 0 ALORS\n  SI compte != '109' ALORS\n    ANOMALIE: Capital débiteur anormal`,
        parametres: {
          exceptions_autorisees: { type: 'array', default: ['109', '119'], description: 'Comptes autorisés débiteurs' }
        }
      },
      {
        code: 'SENS_CLASSE_2',
        nom: 'Sens Normal Classe 2',
        description: 'Amortissements/Dépréciations créditeurs',
        parametres_disponibles: ['comptes_amortissables'],
        type: 'CLASSIFICATION',
        detailDescription: `ALGORITHME I.2.1.2 CLASSE 2:\nComptes 20-27: Immobilisations → DÉBITEUR\nComptes 28*: Amortissements → CRÉDITEUR\nComptes 29*: Dépréciations → CRÉDITEUR\n\nSI compte = 28* OU 29* ET solde_debiteur > 0 ALORS\n  ANOMALIE: Amortissement/dépréciation débiteur`,
        parametres: {
          comptes_amortissables: { type: 'array', default: ['21', '22', '23', '24'], description: 'Classes amortissables' }
        }
      },
      {
        code: 'SENS_CLASSE_3',
        nom: 'Sens Normal Classe 3',
        description: 'Stocks débiteurs (sauf 39* dépréciations)',
        parametres_disponibles: ['tolerance_stock'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.2.1.3 CLASSE 3:\nComptes 31-38: Stocks → DÉBITEUR\nComptes 39*: Dépréciations → CRÉDITEUR\n\nSI compte = 3[1-8]* ET solde < 0 ALORS\n  ERREUR: Stock négatif impossible\n\nCONTRÔLE: Stock physique ne peut être négatif`,
        parametres: {
          tolerance_stock: { type: 'number', default: 1.0, description: 'Tolérance pour stocks quasi-nuls' }
        }
      },
      {
        code: 'SENS_CLASSE_5',
        nom: 'Sens Normal Classe 5',
        description: 'Caisse obligatoirement débiteur',
        parametres_disponibles: ['limite_decouvert_autorise'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.2.1.5 CLASSE 5:\n57*: Caisse → OBLIGATOIREMENT DÉBITEUR\n52*: Banques → MIXTE (découvert autorisé)\n\nSI compte = '571' ET solde < 0 ALORS\n  ERREUR CRITIQUE: Caisse négative impossible\n\nSI compte = '52*' ET solde < 0 ALORS\n  VÉRIFIER autorisation découvert`,
        parametres: {
          limite_decouvert_autorise: { type: 'number', default: 1000000, description: 'Limite découvert bancaire en FCFA' }
        }
      },
      
      // ALGORITHMES COHÉRENCE
      {
        code: 'COHERENCE_AMORTISSEMENTS',
        nom: 'Cohérence Amortissements',
        description: 'Amortissements ≤ Valeur brute par classe',
        parametres_disponibles: ['classes_immobilisations'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.2.2.1:\nPOUR chaque classe d'immo [21, 22, 23, 24]\n  valeur_brute = SOMME comptes commençant par classe\n  amortissements = SOMME comptes '28' + classe[1]\n  SI ABS(amortissements) > valeur_brute ALORS\n    ERREUR: Amortissement > valeur brute`,
        parametres: {
          classes_immobilisations: { type: 'array', default: ['21', '22', '23', '24'], description: 'Classes immobilisations contrôlées' }
        }
      },
      {
        code: 'COHERENCE_TVA_CA',
        nom: 'Cohérence TVA/Chiffre d\'Affaires',
        description: 'TVA collectée vs CA selon taux pays',
        parametres_disponibles: ['taux_tva_standard', 'tolerance_relative'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.2.2.2:\nca_ht = SOMME comptes 70*\ntva_collectee = SOMME crédit comptes 4431\ntva_theorique = ca_ht * taux_tva_pays\n\necart = ABS(tva_collectee - tva_theorique) / tva_theorique\nSI ecart > 0.02 ALORS  // Tolérance 2%\n  ANOMALIE: TVA incohérente\n  ANALYSER: Ventes exonérées? Taux réduits? Erreurs?`,
        parametres: {
          taux_tva_standard: { type: 'number', default: 0.1925, description: 'Taux TVA standard du pays (19.25% Cameroun)' },
          tolerance_relative: { type: 'number', default: 0.02, description: 'Écart relatif acceptable (2%)' }
        }
      },
      {
        code: 'COHERENCE_PROVISIONS',
        nom: 'Cohérence Provisions',
        description: 'Provisions ≤ Créances brutes + taux acceptable',
        parametres_disponibles: ['taux_max_provision'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.2.2.4:\nclients_brut = SOMME comptes 411*\nprovisions_clients = ABS(SOMME comptes 491*)\n\nSI provisions_clients > clients_brut ALORS\n  ERREUR: Provision excessive\n\nCALCULER taux_provision = provisions_clients / clients_brut\nSI taux_provision > 0.5 ALORS\n  ALERTE: Taux provision > 50%`,
        parametres: {
          taux_max_provision: { type: 'number', default: 0.5, description: 'Taux maximum provision acceptable' }
        }
      },
      
      // ALGORITHMES RATIOS FINANCIERS
      {
        code: 'CALCUL_FDR',
        nom: 'Calcul Fonds de Roulement',
        description: 'FDR = Capitaux permanents - Actif immobilisé',
        parametres_disponibles: ['seuil_alerte'],
        type: 'PREDICTION',
        detailDescription: `ALGORITHME I.3.1.1:\ncapitaux_permanents = SOMME classe 1 + amortissements\nactif_immobilise = SOMME classe 2 nette\nfonds_roulement = capitaux_permanents - actif_immobilise\n\nSI fonds_roulement < 0 ALORS\n  ALERTE: FDR négatif\n  RISQUE: Financement immobilisations par court terme`,
        parametres: {
          seuil_alerte: { type: 'number', default: 0, description: 'Seuil minimum FDR acceptable' }
        }
      },
      {
        code: 'CALCUL_BFR',
        nom: 'Calcul BFR',
        description: 'BFR = Stocks + Créances - Dettes exploitation',
        parametres_disponibles: ['seuil_jours_ca'],
        type: 'PREDICTION',
        detailDescription: `ALGORITHME I.3.1.2:\nstocks = SOMME classe 3\ncreances_exploitation = SOMME 411+413+416+418\ndettes_exploitation = SOMME 401+402+408+419\n\nBFR = stocks + creances_exploitation - dettes_exploitation\nBFR_jours_CA = (BFR / CA_annuel) * 360\n\nSI BFR_jours_CA > 90 ALORS\n  ALERTE: BFR élevé (> 90 jours CA)`,
        parametres: {
          seuil_jours_ca: { type: 'number', default: 90, description: 'Seuil BFR en jours de CA' }
        }
      },
      {
        code: 'RATIO_LIQUIDITE',
        nom: 'Ratio Liquidité Générale',
        description: 'Actif CT / Passif CT (Seuil critique < 0.8)',
        parametres_disponibles: ['seuil_critique', 'seuil_alerte'],
        type: 'PREDICTION',
        detailDescription: `ALGORITHME I.3.2.1:\nactif_court_terme = classe_3 + classe_4_debiteur + classe_5\npassif_court_terme = dettes_CT + classe_5_crediteur\nratio = actif_court_terme / passif_court_terme\n\nSI ratio < 1 ALORS ALERTE: Risque liquidité\nSI ratio < 0.8 ALORS CRITIQUE: Risque cessation paiements`,
        parametres: {
          seuil_critique: { type: 'number', default: 0.8, description: 'Seuil critique cessation paiements' },
          seuil_alerte: { type: 'number', default: 1.0, description: 'Seuil alerte liquidité' }
        }
      },
      
      // ALGORITHMES DÉTECTION IA
      {
        code: 'DETECTION_DOUBLONS_MD5',
        nom: 'Détection Doublons MD5',
        description: 'Hash MD5(date+montant+compte+journal) + Levenshtein',
        parametres_disponibles: ['seuil_similarite', 'tolerance_temporelle'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.5.1.1:\nPOUR chaque écriture\n  hash = MD5(date + montant + compte_racine + journal)\n  SI hash EXISTS dans table_hash ALORS\n    similarity = LEVENSHTEIN(libelle1, libelle2)\n    SI similarity > 0.85 ALORS\n      ALERTE: Doublon probable\n\nMÉTHODE: Hachage cryptographique + Distance édition`,
        parametres: {
          seuil_similarite: { type: 'number', default: 0.85, description: 'Seuil similarité Levenshtein' },
          tolerance_temporelle: { type: 'number', default: 3, description: 'Tolérance en jours' }
        }
      },
      {
        code: 'LOI_BENFORD',
        nom: 'Analyse Loi de Benford',
        description: 'Test Chi² distribution premiers chiffres',
        parametres_disponibles: ['seuil_chi2', 'echantillon_min'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.5.2.1:\nPOUR chaque classe compte\n  CALCULER distribution premier chiffre montants\n  distribution_theorique = LOG10(1 + 1/d) pour d = 1..9\n\n  CHI2 = SOMME((observé - théorique)² / théorique)\n  SI CHI2 > 15.507 ALORS  // Seuil α=0.05\n    ALERTE: Distribution anormale (manipulation possible)`,
        parametres: {
          seuil_chi2: { type: 'number', default: 15.507, description: 'Seuil critique Chi² (α=0.05)' },
          echantillon_min: { type: 'number', default: 30, description: 'Taille échantillon minimum' }
        }
      },
      {
        code: 'ISOLATION_FOREST',
        nom: 'Isolation Forest ML',
        description: 'Machine Learning détection outliers',
        parametres_disponibles: ['contamination', 'n_estimators', 'seuil_score'],
        type: 'PREDICTION',
        detailDescription: `ALGORITHME I.5.3.1:\nfeatures = [montant, écart_date_saisie, heure_saisie,\n           fréquence_compte, ratio_montant_moyen]\n\nscore_anomalie = IsolationForest(features)\nSI score < -0.5 ALORS\n  ALERTE: Transaction atypique\n\nMÉTHODE: Forêt d'isolation (ensemble d'arbres)`,
        parametres: {
          contamination: { type: 'number', default: 0.1, description: 'Proportion outliers attendus' },
          n_estimators: { type: 'number', default: 100, description: 'Nombre arbres forêt' },
          seuil_score: { type: 'number', default: -0.5, description: 'Score seuil anomalie' }
        }
      },
      
      // ALGORITHMES FISCAUX
      {
        code: 'DETECTION_AMENDES',
        nom: 'Détection Amendes',
        description: 'Charges non déductibles comptes 6712, 6718',
        parametres_disponibles: ['comptes_amendes'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.4.1.1:\namendes = SOMME comptes 6712, 6718\nSI amendes > 0 ALORS\n  RÉINTÉGRATION FISCALE = amendes\n  ALERTE: Charges non déductibles\n\nCOMPTES SURVEILLÉS:\n- 6712: Pénalités, amendes fiscales\n- 6718: Autres pénalités`,
        parametres: {
          comptes_amendes: { type: 'array', default: ['6712', '6718'], description: 'Comptes amendes surveillés' }
        }
      },
      {
        code: 'LIMITE_CADEAUX',
        nom: 'Limite Cadeaux Publicitaires',
        description: 'Limite 1‰ du CA HT (compte 6234)',
        parametres_disponibles: ['taux_limite'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME I.4.1.2:\ncadeaux = SOMME compte 6234\nlimite_cadeaux = CA_HT * 0.001  // 1‰ du CA\n\nSI cadeaux > limite_cadeaux ALORS\n  RÉINTÉGRATION = cadeaux - limite_cadeaux\n  ALERTE: Dépassement limite cadeaux`,
        parametres: {
          taux_limite: { type: 'number', default: 0.001, description: 'Taux limite cadeaux (1‰)' }
        }
      },
      
      // ALGORITHMES MAPPING LIASSE
      {
        code: 'MAPPING_BILAN_AA',
        nom: 'Mapping AA - Immobilisations Incorporelles',
        description: '201+203+205+207 - 280-290 = AA',
        parametres_disponibles: ['tolerance_mapping'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.1.1.1:\ncomptes_positifs = [201, 203, 204, 205, 206, 207, 208]\ncomptes_negatifs = [2801-2808, 2901-2908]\n\nmontant_balance = SOMME(positifs) - SOMME(negatifs)\nmontant_liasse = LIGNE_AA\n\nSI ABS(montant_balance - montant_liasse) > tolerance ALORS\n  ERREUR: Report incorrect ligne AA`,
        parametres: {
          tolerance_mapping: { type: 'number', default: 0.01, description: 'Tolérance mapping balance/liasse' }
        }
      },
      {
        code: 'CASCADE_MARGE',
        nom: 'Cascade Marge Commerciale',
        description: 'TB = TA - RA (Ventes - Achats marchandises)',
        parametres_disponibles: ['tolerance_calcul'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.2.2.1:\nTA = Ventes marchandises (comptes 701-707)\nRA = Achats marchandises (601 - 6019)\n\nmarge_calculee = TA - RA\nmarge_affichee = LIGNE_TB\n\nSI ABS(marge_calculee - marge_affichee) > tolerance ALORS\n  ERREUR CASCADE: Marge commerciale incorrecte`,
        parametres: {
          tolerance_calcul: { type: 'number', default: 0.01, description: 'Tolérance calculs cascade' }
        }
      },
      {
        code: 'CASCADE_VA',
        nom: 'Cascade Valeur Ajoutée',
        description: 'TK = Marge + Production - Consommations',
        parametres_disponibles: ['tolerance_va'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.2.2.2:\nVA = Marge_commerciale + Production_periode - Consommations\nProduction = TC + TD + TE\nConsommations = RB + RC + RD\n\nva_calculee = marge + production - consommations\nva_affichee = LIGNE_TK\n\nCONTRÔLE: va_calculee = va_affichee`,
        parametres: {
          tolerance_va: { type: 'number', default: 0.01, description: 'Tolérance calcul VA' }
        }
      },
      {
        code: 'CASCADE_EBE',
        nom: 'Cascade EBE',
        description: 'TN = VA - Charges personnel - Impôts',
        parametres_disponibles: ['tolerance_ebe'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.2.2.3:\nEBE = VA - Charges_personnel - Impôts_taxes\nCharges_personnel = RF (compte 64*)\nImpôts_taxes = RG (compte 63*)\n\nebe_calcule = va - rf - rg\nebe_affiche = LIGNE_TN\n\nCONTRÔLE: ebe_calcule = ebe_affiche`,
        parametres: {
          tolerance_ebe: { type: 'number', default: 0.01, description: 'Tolérance calcul EBE' }
        }
      },
      
      // ALGORITHMES TAFIRE
      {
        code: 'CAF_SOUSTRACTIVE',
        nom: 'CAF Méthode Soustractive',
        description: 'CAF = EBE + Transferts - Production immo + Produits - Charges financières',
        parametres_disponibles: ['tolerance_caf'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.5.1.1:\nEBE = Résultat ligne TN\n+ Transferts charges (781)\n- Production immobilisée (72)\n+ Autres produits (707, 718, 719)\n- Autres charges (658)\n+ Produits financiers (77 sauf 775)\n- Charges financières (67 sauf 675)\n= CAF\n\nCONTRÔLE: CAF_calculée = CAF_affichée`,
        parametres: {
          tolerance_caf: { type: 'number', default: 100, description: 'Tolérance CAF en FCFA' }
        }
      },
      {
        code: 'RECONCILIATION_TRESORERIE',
        nom: 'Réconciliation Trésorerie',
        description: 'ΔTAFIRE = ΔBILAN (Flux = Variation)',
        parametres_disponibles: ['tolerance_reconciliation'],
        type: 'DETECTION',
        detailDescription: `ALGORITHME II.5.3.1:\nΔ_tresorerie_TAFIRE = Flux_exploitation + Flux_investissement + Flux_financement\nΔ_tresorerie_bilan = Tresorerie_N - Tresorerie_N-1\n\nSI ABS(Δ_TAFIRE - Δ_bilan) > 100 ALORS\n  ERREUR CRITIQUE: TAFIRE non équilibré\n\nCONTRÔLE: Cohérence flux/variation`,
        parametres: {
          tolerance_reconciliation: { type: 'number', default: 100, description: 'Tolérance réconciliation FCFA' }
        }
      },
      
      // ALGORITHMES IFRS
      {
        code: 'TEST_DEPRECIATION_IAS36',
        nom: 'Test Dépréciation IAS 36',
        description: 'Valeur recouvrable UGT vs valeur comptable',
        parametres_disponibles: ['taux_actualisation', 'duree_projection'],
        type: 'PREDICTION',
        detailDescription: `ALGORITHME I.6.1.1:\nPOUR chaque UGT\n  valeur_comptable = actifs_UGT - passifs_UGT\n\n  flux_futurs = PROJECTION(cash_flows, 5_ans)\n  valeur_utilite = VAN(flux_futurs, WACC)\n  juste_valeur = MARCHÉ - coûts_vente\n\n  valeur_recouvrable = MAX(valeur_utilite, juste_valeur)\n\n  SI valeur_comptable > valeur_recouvrable ALORS\n    depreciation = écart\n    ALERTE: Dépréciation IAS 36 requise`,
        parametres: {
          taux_actualisation: { type: 'number', default: 0.10, description: 'WACC pour actualisation' },
          duree_projection: { type: 'number', default: 5, description: 'Années projection flux' }
        }
      },
      
      // ALGORITHME SCORING FINAL
      {
        code: 'SCORING_MULTICRITERES',
        nom: 'Scoring Multi-Critères',
        description: 'Score pondéré certification qualité',
        parametres_disponibles: ['poids_criteres'],
        type: 'CLASSIFICATION',
        detailDescription: `ALGORITHME I.7.1.1:\nPOIDS = {\n  equilibre_balance: 30%,\n  coherence_etats: 25%,\n  conformite_fiscale: 20%,\n  qualite_annexes: 15%,\n  ratios_financiers: 10%\n}\n\nscore_final = SOMME(scores[k] * POIDS[k])\n\nSI score ≥ 90% ET erreurs_critiques = 0 →"Sans réserve"\nSI score ≥ 75% →"Avec réserves"\nSINON →"Refusée"`,
        parametres: {
          poids_criteres: { type: 'object', default: {equilibre:30, coherence:25, fiscal:20, annexes:15, ratios:10}, description: 'Pondération critères scoring' }
        }
      },
      
      // ALGORITHMES DE COHÉRENCE ÉTATS/NOTES ANNEXES
      {
        id: 28,
        code: 'COHERENCE_IMMO_CORP',
        nom: 'Cohérence Immobilisations Corporelles',
        description: 'Vérification Bilan vs Note tableau immobilisations',
        parametres_disponibles: ['seuil_tolerance'],
        type: 'COHERENCE',
        detailDescription: `ALGORITHME I.8.1.1 - COHÉRENCE IMMOBILISATIONS CORPORELLES:

1. EXTRACTION DONNÉES:
   valeur_bilan = bilan_actif.immobilisations_corporelles
   valeur_note = notes.tableau_immobilisations.total_net_corporelles

2. CALCUL ÉCART:
   ecart = ABS(valeur_bilan - valeur_note)
   
3. ÉVALUATION:
   SI ecart = 0 → CONFORME ✅
   SI ecart ≤ seuil → ECART ⚠️ 
   SINON → ERREUR ❌

4. ACTIONS CORRECTIVES:
   - Vérifier amortissements de l'exercice
   - Contrôler réévaluations
   - Valider cessions/acquisitions
   - Revoir dotations exceptionnelles`,
        parametres: {
          seuil_tolerance: { type: 'number', default: 1000, description: 'Seuil tolérance écart en XOF' }
        }
      },
      {
        id: 29,
        code: 'TFT_ACQUISITIONS_COHERENCE',
        nom: 'TFT Acquisitions vs Tableau Immobilisations',
        description: 'Flux investissement = Augmentations tableau',
        parametres_disponibles: ['seuil_acquisitions'],
        type: 'COHERENCE',
        detailDescription: `ALGORITHME I.9.1.1 - COHÉRENCE TFT ACQUISITIONS:

1. EXTRACTION TFT:
   acquisitions_tft = ABS(tft.flux_investissement.acquisitions_immobilisations)
   
2. EXTRACTION TABLEAU:
   acquisitions_tableau = tableau_immobilisations.mouvements.augmentations
   
3. CONTRÔLE COHÉRENCE:
   ecart = ABS(acquisitions_tft - acquisitions_tableau)
   
4. VALIDATION:
   SI ecart > seuil → ERREUR CRITIQUE ❌
   
5. DIAGNOSTIC AUTOMATIQUE:
   - Acquisitions non comptabilisées dans TFT
   - Augmentations tableau non reflétées flux
   - Erreur classification immobilisations/charges
   - Subventions mal traitées`,
        parametres: {
          seuil_acquisitions: { type: 'number', default: 5000, description: 'Seuil tolérance acquisitions' }
        }
      },
      {
        id: 30,
        code: 'TFT_EQUILIBRE_MATH',
        nom: 'Équilibre Mathématique TFT',
        description: 'Σ Flux = Variation Trésorerie',
        parametres_disponibles: ['tolerance_calcul'],
        type: 'COHERENCE',
        detailDescription: `ALGORITHME I.9.4.1 - ÉQUILIBRE MATHÉMATIQUE TFT:

1. EXTRACTION FLUX:
   flux_exploitation = tft.flux_exploitation.total
   flux_investissement = tft.flux_investissement.total  
   flux_financement = tft.flux_financement.total
   variation_tresorerie = tft.variation_tresorerie

2. CALCUL ÉQUILIBRE:
   somme_flux = flux_exploitation + flux_investissement + flux_financement
   ecart_equilibre = ABS(somme_flux - variation_tresorerie)

3. VALIDATION STRICTE:
   SI ecart > 100 XOF → ERREUR CRITIQUE ❌
   Message: "TFT mathématiquement incohérent"
   
4. DIAGNOSTIC:
   - Erreur calcul variation trésorerie
   - Flux mal classés entre catégories
   - Omission éléments trésorerie
   - Erreur de signe (encaissement/décaissement)`,
        parametres: {
          tolerance_calcul: { type: 'number', default: 100, description: 'Tolérance calcul (centimes)' }
        }
      }
    ])
  }, [])

  const handleCreatePoint = () => {
    setEditingPoint(null)
    setDialogOpen(true)
  }

  const handleEditPoint = (point: ControlPoint) => {
    setEditingPoint(point)
    setDialogOpen(true)
  }

  const handleViewAlgorithm = (algorithmCode: string) => {
    const algorithm = algorithmes.find(alg => alg.code === algorithmCode)
    if (algorithm) {
      setSelectedAlgorithm(algorithm)
      setAlgorithmModalOpen(true)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Points de Contrôle
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#171717' }}>
                Règles de Contrôle SYSCOHADA ({controlPoints.filter(p => p.est_active).length} actives)
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreatePoint}
                sx={{ 
                  bgcolor: '#171717',
                  '&:hover': { bgcolor: '#262626' }
                }}
              >
                Nouvelle Règle
              </Button>
            </Box>

            <TableContainer 
              component={Paper} 
              sx={{ 
                bgcolor: '#ffffff',
                '& .MuiTableHead-root': { bgcolor: '#e5e5e5' }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Règle</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Portée</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Criticité</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ color: '#171717', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {controlPoints.map((point, index) => (
                    <TableRow 
                      key={point.id}
                      sx={{ 
                        bgcolor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                        '&:hover': { bgcolor: '#e5e5e530' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#171717', fontWeight: 600 }}>
                          {point.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#171717', fontWeight: 500 }}>
                            {point.nom}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#737373' }}>
                            {point.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={point.type_regle}
                          size="small"
                          sx={{ bgcolor: '#e5e5e5', color: '#171717' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPorteePoint(point)}
                          size="small"
                          sx={getPorteeColor(getPorteePoint(point))}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={point.niveau_severite}
                          size="small"
                          color={
                            point.niveau_severite === 'Critique' ? 'error' :
                            point.niveau_severite === 'Majeure' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={point.est_active ? 'Actif' : 'Inactif'}
                          size="small"
                          sx={{
                            bgcolor: point.est_active ? '#E8F5E8' : '#F8D7DA',
                            color: point.est_active ? '#2E7D0F' : '#842029'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewAlgorithm(point.algorithme)}
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#171717',
                              borderColor: '#e5e5e5',
                              '&:hover': { borderColor: '#171717' }
                            }}
                          >
                            Algorithme
                          </Button>
                          <IconButton 
                            size="small"
                            onClick={() => handleEditPoint(point)}
                            sx={{ color: '#737373' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <Switch
                            checked={point.est_active}
                            size="small"
                            onChange={() => {
                              setControlPoints(prev => 
                                prev.map(p => 
                                  p.id === point.id 
                                    ? { ...p, est_active: !p.est_active }
                                    : p
                                )
                              )
                            }}
                            sx={{ ml: 1 }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )

      case 1: // Algorithmes IA
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#171717' }}>
              Algorithmes IA Disponibles
            </Typography>
            
            <Grid container spacing={3}>
              {algorithmes.map((algo) => (
                <Grid item xs={12} md={6} key={algo.code}>
                  <Card sx={{ bgcolor: '#ffffff' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AIIcon sx={{ color: '#171717', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: '#171717' }}>
                          {algo.nom}
                        </Typography>
                        <Chip 
                          label={algo.type}
                          size="small"
                          sx={{ ml: 'auto', bgcolor: '#e5e5e5', color: '#171717' }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: '#737373', mb: 2 }}>
                        {algo.description}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: '#737373' }}>
                        Paramètres: {algo.parametres_disponibles.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#171717' }}>
        🤖 Points de Contrôle IA - OHADA/IFRS
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ color: '#737373' }}>
        {controlPoints.length} Contrôles Exhaustifs • {controlPoints.filter(p => p.est_active).length} Actifs • Algorithmes SYSCOHADA/IFRS
      </Typography>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: '#e5e5e5',
          borderRadius: 2
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#171717', fontWeight: 600 }}>
          🔍 Contrôles Exhaustifs OHADA/IFRS - Liste Complète Implémentée
        </Typography>
        <Typography variant="body2" sx={{ color: '#171717' }}>
          ✅ Balance: Équilibre, Sens comptes, Cohérence • ✅ Liasse: Mapping, Cascade, TAFIRE • ✅ IA: Benford, Doublons, Outliers • ✅ IFRS: IAS 36
        </Typography>
      </Paper>

      <Paper sx={{ bgcolor: '#ffffff' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: '#e5e5e5',
            '& .MuiTab-root': { 
              color: '#737373',
              '&.Mui-selected': { color: '#171717' }
            }
          }}
        >
          <Tab label="Points de Contrôle" />
          <Tab label="Algorithmes IA" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>

      {/* Dialog de création/édition */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#171717', color: 'white' }}>
          {editingPoint ? 'Modifier Règle de Contrôle' : 'Nouvelle Règle de Contrôle'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#fafafa', mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la règle"
                defaultValue={editingPoint?.nom || ''}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Catégorie</InputLabel>
                <Select defaultValue={editingPoint?.type_regle || ''}>
                  <MenuItem value="Balance">Balance</MenuItem>
                  <MenuItem value="Légal">Légal</MenuItem>
                  <MenuItem value="Fiscal">Fiscal</MenuItem>
                  <MenuItem value="Cohérence">Cohérence</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Algorithme IA</InputLabel>
                <Select defaultValue={editingPoint?.algorithme || ''}>
                  {algorithmes.map((algo) => (
                    <MenuItem key={algo.code} value={algo.code}>
                      {algo.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Criticité</InputLabel>
                <Select defaultValue={editingPoint?.niveau_severite || 'Majeure'}>
                  <MenuItem value="Critique">Critique</MenuItem>
                  <MenuItem value="Majeure">Majeure</MenuItem>
                  <MenuItem value="Mineure">Mineure</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description détaillée"
                multiline
                rows={3}
                defaultValue={editingPoint?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#fafafa', p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: '#737373' }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              bgcolor: '#171717',
              '&:hover': { bgcolor: '#262626' }
            }}
          >
            {editingPoint ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal détail de l'algorithme */}
      <Dialog 
        open={algorithmModalOpen} 
        onClose={() => setAlgorithmModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#171717', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AIIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedAlgorithm?.nom}
            </Typography>
            <Chip 
              label={selectedAlgorithm?.type} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white' 
              }} 
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedAlgorithm && (
            <Box>
              {/* Description détaillée */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#171717' }}>
                📝 Description de l'Algorithme
              </Typography>
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#fafafa', border: '1px solid #e5e5e5' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#171717' }}>
                  {selectedAlgorithm.detailDescription}
                </Typography>
              </Paper>

              {/* Paramètres */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#171717' }}>
                ⚙️ Paramètres de Configuration
              </Typography>
              {selectedAlgorithm.parametres && Object.entries(selectedAlgorithm.parametres).map(([key, param]) => (
                <Paper key={key} sx={{ p: 2, mb: 2, border: '1px solid #e5e5e5' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: '#171717', fontWeight: 600 }}>
                        {key}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Chip 
                        label={param.type} 
                        size="small" 
                        sx={{ bgcolor: '#e5e5e5', color: '#171717' }} 
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#737373' }}>
                        {typeof param.default === 'object' ? JSON.stringify(param.default) : param.default.toString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="caption" sx={{ color: '#737373' }}>
                        {param.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {/* Type et utilisation */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#171717' }}>
                🤖 Type d'Intelligence Artificielle
              </Typography>
              <Paper sx={{ p: 3, bgcolor: getTypeColor(selectedAlgorithm.type) }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#171717' }}>
                  {getTypeLabel(selectedAlgorithm.type)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#737373' }}>
                  {getTypeDescription(selectedAlgorithm.type)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlgorithmModalOpen(false)}>
            Fermer
          </Button>
          <Button variant="contained" sx={{ bgcolor: '#171717' }}>
            Configurer Paramètres
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Fonctions utilitaires pour le modal
const getTypeColor = (type: string) => {
  switch (type) {
    case 'DETECTION': return '#E3F2FD'
    case 'CLASSIFICATION': return '#F3E5F5'
    case 'PREDICTION': return '#E8F5E8'
    default: return '#fafafa'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'DETECTION': return 'Algorithme de Détection'
    case 'CLASSIFICATION': return 'Intelligence Artificielle de Classification'
    case 'PREDICTION': return 'Machine Learning Prédictif'
    default: return type
  }
}

const getTypeDescription = (type: string) => {
  switch (type) {
    case 'DETECTION': return 'Détecte automatiquement les anomalies et incohérences dans les données comptables'
    case 'CLASSIFICATION': return 'Classe et vérifie la conformité des éléments selon les référentiels SYSCOHADA'
    case 'PREDICTION': return 'Prédit et identifie les patterns anormaux basés sur l\'apprentissage automatique'
    default: return 'Algorithme spécialisé pour l\'audit comptable'
  }
}

export default ControlPointsManager