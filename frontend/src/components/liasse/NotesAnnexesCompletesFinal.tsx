/**
 * Composant Notes Annexes Complètes - UNE NOTE PAR PAGE
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material'
import { 
  NavigateNext, 
  NavigateBefore, 
  Edit, 
  Save,
  FirstPage,
  LastPage,
  Comment,
  Add,
} from '@mui/icons-material'

const PRIMARY_COLOR = '#171717'

interface NotesAnnexesCompletesFinalProps {
  modeEdition?: boolean
  noteFixe?: number  // Pour afficher une note spécifique sans navigation
}

const NotesAnnexesCompletesFinal: React.FC<NotesAnnexesCompletesFinalProps> = ({ modeEdition: _modeEdition = false, noteFixe }) => {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(noteFixe !== undefined ? noteFixe : 0)
  const [editMode, setEditMode] = useState(false)
  
  // Si une note fixe est spécifiée, on ne permet pas de changer
  const navigationDisabled = noteFixe !== undefined
  
  // Système de commentaires
  const [typeCommentaire, setTypeCommentaire] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [commentairesParNote, setCommentairesParNote] = useState<{[key: number]: Array<{
    id: string; type: string; contenu: string; date: Date
  }>}>({})
  
  const typesCommentaires = [
    'Explication méthodologique',
    'Justification montant',
    'Changement vs N-1',
    'Événement particulier',
    'Contrôle effectué',
    'Source information',
    'Autre observation'
  ]

  // Toutes les 35 notes SYSCOHADA développées complètement
  const notesCompletes = [
    {
      numero: 'NOTE ANNEXE N° 1',
      titre: 'RÈGLES ET MÉTHODES COMPTABLES',
      contenu: {
        '1.1 Référentiel comptable': {
          description: 'Les comptes annuels ont été établis conformément au Système Comptable OHADA révisé, entré en vigueur le 1er janvier 2018.',
          details: [
            'Acte uniforme relatif au droit comptable et à l\'information financière',
            'Règlements OHADA et normes comptables applicables',
            'Guide d\'application du système comptable OHADA révisé'
          ]
        },
        '1.2 Méthodes d\'évaluation': {
          description: 'Les méthodes d\'évaluation retenues sont les suivantes :',
          details: [
            'Coût historique pour les immobilisations',
            'Coût moyen pondéré pour les stocks',
            'Valeur nominale pour les créances et dettes',
            'Juste valeur pour les titres de placement'
          ]
        },
        '1.3 Changements de méthodes': {
          description: 'Aucun changement de méthode comptable n\'a été opéré au cours de l\'exercice.',
        },
        '1.4 Exercice comptable': {
          description: 'L\'exercice comptable commence le 1er janvier et se termine le 31 décembre.',
        },
        '1.5 Monnaie de présentation': {
          description: 'Les états financiers sont présentés en Franc CFA (XOF), monnaie fonctionnelle de la société.',
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 2',
      titre: 'IMMOBILISATIONS INCORPORELLES',
      tableau: {
        titre: 'Mouvement des immobilisations incorporelles',
        colonnes: ['Rubriques', 'Valeur brute début', 'Acquisitions', 'Cessions/Rebuts', 'Virements', 'Valeur brute fin', 'Amortissements', 'Valeur nette'],
        lignes: [
          ['Frais de développement et de prospection', '0', '0', '0', '0', '0', '0', '0'],
          ['Brevets, licences, logiciels', '3 500 000', '1 200 000', '0', '0', '4 700 000', '2 200 000', '2 500 000'],
          ['Fonds commercial', '0', '0', '0', '0', '0', '0', '0'],
          ['Droit au bail', '0', '0', '0', '0', '0', '0', '0'],
          ['Autres immobilisations incorporelles', '800 000', '0', '0', '0', '800 000', '450 000', '350 000'],
          ['TOTAL', '4 300 000', '1 200 000', '0', '0', '5 500 000', '2 650 000', '2 850 000'],
        ]
      },
      details: {
        'Amortissements': {
          'Brevets et licences': 'Amortis sur 5 ans selon le mode linéaire',
          'Logiciels': 'Amortis sur 3 ans selon le mode linéaire',
          'Autres immobilisations': 'Amortis selon leur durée d\'utilité'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 3',
      titre: 'IMMOBILISATIONS CORPORELLES',
      tableau: {
        titre: 'Mouvement des immobilisations corporelles',
        colonnes: ['Rubriques', 'Valeur brute début', 'Acquisitions', 'Cessions', 'Réévaluations', 'Valeur brute fin', 'Amortissements', 'Valeur nette'],
        lignes: [
          ['Terrains', '45 000 000', '0', '0', '0', '45 000 000', '0', '45 000 000'],
          ['Bâtiments', '180 000 000', '0', '0', '0', '180 000 000', '55 000 000', '125 000 000'],
          ['Installations techniques et outillages', '25 000 000', '2 000 000', '0', '0', '27 000 000', '14 500 000', '12 500 000'],
          ['Matériel de transport', '18 000 000', '0', '1 500 000', '0', '16 500 000', '7 600 000', '8 900 000'],
          ['Mobilier, matériel de bureau et informatique', '8 500 000', '1 200 000', '0', '0', '9 700 000', '4 200 000', '5 500 000'],
          ['Agencements et installations', '15 000 000', '0', '0', '0', '15 000 000', '8 000 000', '7 000 000'],
          ['Autres immobilisations corporelles', '2 500 000', '500 000', '0', '0', '3 000 000', '1 500 000', '1 500 000'],
          ['TOTAL', '294 000 000', '3 700 000', '1 500 000', '0', '296 200 000', '90 800 000', '205 400 000'],
        ]
      },
      details: {
        'Durées d\'amortissement': {
          'Constructions': '20 à 25 ans',
          'Installations techniques': '10 à 15 ans',
          'Matériel et outillage': '5 à 10 ans',
          'Matériel de transport': '4 à 5 ans',
          'Mobilier et matériel de bureau': '5 à 10 ans'
        },
        'Cessions de l\'exercice': {
          'Nature': 'Véhicule utilitaire',
          'Valeur brute': '1 500 000',
          'Amortissements cumulés': '1 200 000',
          'Prix de cession': '400 000',
          'Plus/Moins-value': '100 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 4',
      titre: 'IMMOBILISATIONS FINANCIÈRES',
      tableau: {
        titre: 'Détail des immobilisations financières',
        colonnes: ['Nature', 'Valeur début N', 'Augmentations', 'Diminutions', 'Valeur fin N', 'Provisions', 'Valeur nette'],
        lignes: [
          ['Titres de participation', '5 000 000', '0', '0', '5 000 000', '0', '5 000 000'],
          ['Autres titres immobilisés', '1 000 000', '0', '0', '1 000 000', '0', '1 000 000'],
          ['Prêts et créances diverses', '2 000 000', '800 000', '300 000', '2 500 000', '100 000', '2 400 000'],
          ['Dépôts et cautionnements versés', '1 200 000', '200 000', '100 000', '1 300 000', '0', '1 300 000'],
          ['TOTAL', '9 200 000', '1 000 000', '400 000', '9 800 000', '100 000', '9 700 000'],
        ]
      },
      details: {
        'Titres de participation': {
          'SARL PARTENAIRE A': '3 000 000 (30% du capital)',
          'SA FILIALE B': '2 000 000 (25% du capital)'
        },
        'Prêts accordés': {
          'Prêt personnel dirigeant': '1 500 000 à 3% sur 5 ans',
          'Prêt société liée': '1 000 000 à 5% sur 3 ans'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 5',
      titre: 'STOCKS ET EN-COURS',
      tableau: {
        titre: 'Composition des stocks',
        colonnes: ['Nature', 'Stock initial', 'Entrées', 'Sorties', 'Stock final brut', 'Provisions', 'Stock final net'],
        lignes: [
          ['Marchandises', '6 800 000', '42 500 000', '40 800 000', '8 500 000', '300 000', '8 200 000'],
          ['Matières premières', '3 500 000', '28 000 000', '27 300 000', '4 200 000', '200 000', '4 000 000'],
          ['Matières consommables', '800 000', '5 200 000', '5 200 000', '800 000', '0', '800 000'],
          ['En-cours de production', '1 200 000', '15 000 000', '14 400 000', '1 800 000', '0', '1 800 000'],
          ['Produits finis', '800 000', '12 500 000', '12 200 000', '1 100 000', '100 000', '1 000 000'],
          ['TOTAL', '13 100 000', '103 200 000', '99 900 000', '16 400 000', '600 000', '15 800 000'],
        ]
      },
      details: {
        'Méthode d\'évaluation': 'Coût moyen pondéré (CMP)',
        'Provisions pour dépréciation': {
          'Marchandises': '300 000 (stocks anciens > 12 mois)',
          'Matières premières': '200 000 (détérioration partielle)',
          'Produits finis': '100 000 (invendus depuis > 6 mois)'
        },
        'Inventaire physique': 'Effectué au 31 décembre 2024 sous contrôle des commissaires aux comptes'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 6',
      titre: 'CRÉANCES CLIENTS ET COMPTES RATTACHÉS',
      tableau: {
        titre: 'Analyse des créances clients',
        colonnes: ['Rubriques', 'Montant brut', 'Provisions', 'Montant net N', 'Montant net N-1', 'Variation'],
        lignes: [
          ['Clients ordinaires', '28 500 000', '1 200 000', '27 300 000', '19 500 000', '+40,0%'],
          ['Clients douteux', '3 200 000', '2 400 000', '800 000', '0', 'Nouveau'],
          ['Clients - effets à recevoir', '2 800 000', '0', '2 800 000', '2 200 000', '+27,3%'],
          ['Factures à établir', '1 500 000', '0', '1 500 000', '1 200 000', '+25,0%'],
          ['Clients - avances et acomptes', '800 000', '0', '800 000', '600 000', '+33,3%'],
          ['TOTAL', '36 800 000', '3 600 000', '33 200 000', '23 500 000', '+41,3%'],
        ]
      },
      details: {
        'Échéancier des créances': {
          'Non échues': '25 000 000 (75,3%)',
          '0 à 30 jours': '5 000 000 (15,1%)',
          '30 à 90 jours': '2 400 000 (7,2%)',
          'Plus de 90 jours': '800 000 (2,4%)'
        },
        'Provisions pour dépréciation': {
          'Clients douteux > 6 mois': '2 400 000',
          'Clients ordinaires > 12 mois': '1 200 000'
        },
        'Principaux débiteurs': {
          'CLIENT A': '8 500 000',
          'CLIENT B': '6 200 000',
          'CLIENT C': '4 800 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 7',
      titre: 'AUTRES CRÉANCES',
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
          'Assurances': '400 000',
          'Loyers': '300 000',
          'Autres charges': '100 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 8',
      titre: 'TRÉSORERIE ACTIF',
      tableau: {
        titre: 'Composition de la trésorerie',
        colonnes: ['Rubriques', 'Montant N', 'Montant N-1', 'Variation', 'Rendement moyen'],
        lignes: [
          ['Titres de placement', '2 000 000', '1 500 000', '+33,3%', '4,5%'],
          ['Valeurs à l\'encaissement', '800 000', '600 000', '+33,3%', '-'],
          ['Banques - comptes courants', '8 500 000', '5 800 000', '+46,6%', '1,2%'],
          ['Banques - comptes à terme', '1 000 000', '800 000', '+25,0%', '3,8%'],
          ['Chèques postaux', '400 000', '300 000', '+33,3%', '0,5%'],
          ['Caisse', '200 000', '200 000', '0,0%', '-'],
          ['Régies d\'avances', '100 000', '100 000', '0,0%', '-'],
          ['TOTAL', '13 000 000', '9 300 000', '+39,8%', '-'],
        ]
      },
      details: {
        'Titres de placement': {
          'Certificats de dépôt': '1 200 000 à 4,2%',
          'Bons du Trésor': '800 000 à 5,1%'
        },
        'Comptes bancaires': {
          'BANK A - Compte principal': '6 500 000',
          'BANK B - Compte devises': '1 500 000',
          'BANK C - Compte à terme': '1 000 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 9',
      titre: 'CAPITAUX PROPRES - MOUVEMENT',
      tableau: {
        titre: 'Variation des capitaux propres',
        colonnes: ['Éléments', 'Capital', 'Primes', 'Réserves', 'Report à nouveau', 'Résultat N', 'Total'],
        lignes: [
          ['Solde au 01/01/N', '100 000 000', '5 000 000', '25 000 000', '6 500 000', '10 200 000', '146 700 000'],
          ['Affectation résultat N-1:', '', '', '', '', '', ''],
          ['- Réserve légale', '0', '0', '510 000', '0', '-510 000', '0'],
          ['- Autres réserves', '0', '0', '3 000 000', '0', '-3 000 000', '0'],
          ['- Report à nouveau', '0', '0', '0', '1 690 000', '-1 690 000', '0'],
          ['- Dividendes distribués', '0', '0', '0', '0', '-5 000 000', '-5 000 000'],
          ['Augmentation de capital', '0', '0', '0', '0', '0', '0'],
          ['Résultat de l\'exercice N', '0', '0', '0', '0', '12 500 000', '12 500 000'],
          ['Autres mouvements', '0', '0', '-10 000', '10 000', '0', '0'],
          ['Solde au 31/12/N', '100 000 000', '5 000 000', '28 500 000', '8 200 000', '12 500 000', '154 200 000'],
        ]
      },
      details: {
        'Capital social': {
          'Nombre d\'actions': '10 000',
          'Valeur nominale': '10 000',
          'Entièrement libéré': 'Oui'
        },
        'Réserve légale': {
          'Taux': '5% du résultat net',
          'Plafond': '10% du capital (10 000 000)',
          'Solde actuel': '5 100 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 10',
      titre: 'PROVISIONS POUR RISQUES ET CHARGES',
      tableau: {
        titre: 'Mouvement des provisions',
        colonnes: ['Nature', 'Solde début', 'Dotations', 'Reprises utilisées', 'Reprises non utilisées', 'Solde fin'],
        lignes: [
          ['Provisions pour litiges', '2 000 000', '800 000', '300 000', '0', '2 500 000'],
          ['Provisions pour garanties clients', '1 200 000', '400 000', '200 000', '100 000', '1 300 000'],
          ['Provisions pour gros entretien', '600 000', '200 000', '0', '0', '800 000'],
          ['Provisions pour restructuration', '0', '500 000', '0', '0', '500 000'],
          ['Provisions pour perte de change', '300 000', '0', '250 000', '50 000', '0'],
          ['Autres provisions', '100 000', '50 000', '0', '0', '150 000'],
          ['TOTAL', '4 200 000', '1 950 000', '750 000', '150 000', '5 250 000'],
        ]
      },
      details: {
        'Provisions pour litiges': {
          'Litige commercial A': '1 500 000',
          'Litige social B': '800 000',
          'Litige fiscal C': '200 000'
        },
        'Provisions pour garanties': 'Calculées sur 2% du CA avec garantie de 24 mois'
      }
    },
    // Continuons avec les autres notes...
    {
      numero: 'NOTE ANNEXE N° 11',
      titre: 'DETTES FINANCIÈRES ET EMPRUNTS',
      tableau: {
        titre: 'État des dettes financières',
        colonnes: ['Nature', 'Solde début', 'Emprunts nouveaux', 'Remboursements', 'Solde fin', '< 1 an', '1-5 ans', '> 5 ans'],
        lignes: [
          ['Emprunts obligataires', '20 000 000', '0', '5 000 000', '15 000 000', '3 000 000', '12 000 000', '0'],
          ['Emprunts bancaires', '40 000 000', '10 000 000', '15 000 000', '35 000 000', '8 000 000', '20 000 000', '7 000 000'],
          ['Dettes de crédit-bail', '3 000 000', '0', '500 000', '2 500 000', '800 000', '1 700 000', '0'],
          ['Avances conditionnées', '2 000 000', '0', '0', '2 000 000', '0', '2 000 000', '0'],
          ['Autres emprunts', '8 000 000', '2 000 000', '1 500 000', '8 500 000', '2 500 000', '6 000 000', '0'],
          ['Intérêts courus', '1 000 000', '0', '1 000 000', '1 200 000', '1 200 000', '0', '0'],
          ['TOTAL', '74 000 000', '12 000 000', '23 000 000', '64 200 000', '15 500 000', '41 700 000', '7 000 000'],
        ]
      },
      details: {
        'Emprunts bancaires': {
          'BANQUE A - 4,5% échéance 2028': '15 000 000',
          'BANQUE B - 5,2% échéance 2026': '12 000 000',
          'BANQUE C - 3,8% échéance 2029': '8 000 000'
        },
        'Garanties données': {
          'Hypothèques': '45 000 000 sur terrain',
          'Nantissements': '15 000 000 sur fonds de commerce'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 12',
      titre: 'DETTES FOURNISSEURS ET COMPTES RATTACHÉS',
      tableau: {
        titre: 'Analyse des dettes fournisseurs',
        colonnes: ['Rubriques', 'Montant N', 'Montant N-1', 'Variation', 'Échéance moyenne'],
        lignes: [
          ['Fournisseurs ordinaires', '25 800 000', '22 000 000', '+17,3%', '45 jours'],
          ['Fournisseurs - effets à payer', '1 200 000', '800 000', '+50,0%', '60 jours'],
          ['Fournisseurs d\'immobilisations', '800 000', '1 200 000', '-33,3%', '30 jours'],
          ['Fournisseurs - factures non parvenues', '2 700 000', '2 000 000', '+35,0%', 'Immédiat'],
          ['TOTAL', '30 500 000', '26 000 000', '+17,3%', '47 jours'],
        ]
      },
      details: {
        'Échéancier des dettes': {
          'Non échues': '24 500 000 (80,3%)',
          '0 à 30 jours': '4 000 000 (13,1%)',
          '30 à 90 jours': '2 000 000 (6,6%)'
        },
        'Principaux créanciers': {
          'FOURNISSEUR A': '8 000 000',
          'FOURNISSEUR B': '6 500 000',
          'FOURNISSEUR C': '4 200 000'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 13',
      titre: 'DETTES FISCALES ET SOCIALES',
      tableau: {
        titre: 'Détail des dettes fiscales et sociales',
        colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Échéance'],
        lignes: [
          ['Personnel - salaires', '3 500 000', '3 200 000', '+9,4%', '< 1 mois'],
          ['Personnel - congés payés', '1 200 000', '1 100 000', '+9,1%', '< 1 an'],
          ['Sécurité sociale', '2 800 000', '2 500 000', '+12,0%', '< 1 mois'],
          ['Impôt sur les sociétés', '4 300 000', '3 500 000', '+22,9%', '< 3 mois'],
          ['TVA collectée', '5 200 000', '4 800 000', '+8,3%', '< 1 mois'],
          ['Retenues à la source', '800 000', '700 000', '+14,3%', '< 1 mois'],
          ['Autres impôts et taxes', '1 500 000', '1 400 000', '+7,1%', 'Variable'],
          ['TOTAL', '19 300 000', '17 200 000', '+12,2%', '-'],
        ]
      },
      details: {
        'Impôt sur les sociétés': {
          'Taux applicable': '30%',
          'Base imposable': '14 333 333',
          'Crédit d\'impôt': '0'
        },
        'Charges sociales': {
          'CNPS': '18% du salaire brut',
          'FNE': '1,2% du salaire brut',
          'FDFP': '1,2% du salaire brut'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 14',
      titre: 'AUTRES DETTES',
      tableau: {
        titre: 'Composition des autres dettes',
        colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Nature juridique'],
        lignes: [
          ['Clients - avances reçues', '3 200 000', '2 800 000', '+14,3%', 'Commerciale'],
          ['Associés - comptes courants', '5 000 000', '4 500 000', '+11,1%', 'Financière'],
          ['Associés - dividendes à payer', '2 000 000', '1 800 000', '+11,1%', 'Statutaire'],
          ['Créditeurs divers', '2 000 000', '1 700 000', '+17,6%', 'Diverse'],
          ['Dépôts et consignations reçus', '800 000', '600 000', '+33,3%', 'Garantie'],
          ['Produits constatés d\'avance', '1 200 000', '900 000', '+33,3%', 'Comptable'],
          ['TOTAL', '14 200 000', '12 300 000', '+15,4%', '-'],
        ]
      },
      details: {
        'Comptes courants d\'associés': {
          'Associé A': '2 000 000 à 3%',
          'Associé B': '1 800 000 à 3%',
          'Associé C': '1 200 000 à 3%'
        },
        'Produits constatés d\'avance': 'Prestations facturées d\'avance pour 2025'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 15',
      titre: 'CHIFFRE D\'AFFAIRES PAR ACTIVITÉ',
      tableau: {
        titre: 'Répartition du chiffre d\'affaires',
        colonnes: ['Activité', 'Montant N', '% N', 'Montant N-1', '% N-1', 'Évolution'],
        lignes: [
          ['Vente de marchandises', '125 600 000', '59,6%', '118 900 000', '60,2%', '+5,6%'],
          ['Production de biens', '65 200 000', '30,9%', '60 500 000', '30,6%', '+7,8%'],
          ['Prestations de services', '20 000 000', '9,5%', '18 000 000', '9,1%', '+11,1%'],
          ['TOTAL', '210 800 000', '100,0%', '197 400 000', '100,0%', '+6,8%'],
        ]
      },
      details: {
        'Répartition géographique': {
          'Marché national': '189 720 000 (90%)',
          'Exportations UEMOA': '16 864 000 (8%)',
          'Autres exportations': '4 216 000 (2%)'
        },
        'Saisonnalité': 'Activité plus soutenue au 4ème trimestre (+25% vs moyenne)'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 16',
      titre: 'CHARGES DE PERSONNEL',
      tableau: {
        titre: 'Analyse des charges de personnel',
        colonnes: ['Rubriques', 'Montant N', 'Montant N-1', 'Variation', '% CA'],
        lignes: [
          ['Salaires et appointements', '35 000 000', '32 500 000', '+7,7%', '16,6%'],
          ['Charges sociales CNPS', '6 300 000', '5 850 000', '+7,7%', '3,0%'],
          ['Autres charges sociales', '2 200 000', '2 150 000', '+2,3%', '1,0%'],
          ['Formation professionnelle', '500 000', '400 000', '+25,0%', '0,2%'],
          ['Médecine du travail', '300 000', '250 000', '+20,0%', '0,1%'],
          ['Autres charges de personnel', '4 200 000', '4 050 000', '+3,7%', '2,0%'],
          ['TOTAL', '48 500 000', '45 200 000', '+7,3%', '23,0%'],
        ]
      },
      details: {
        'Effectifs': {
          'Cadres': '8 personnes',
          'Employés': '15 personnes',
          'Ouvriers': '22 personnes',
          'Total': '45 personnes'
        },
        'Évolution effectifs': '+3 personnes par rapport à N-1'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 17',
      titre: 'DOTATIONS AUX AMORTISSEMENTS',
      tableau: {
        titre: 'Détail des amortissements',
        colonnes: ['Nature', 'Base', 'Taux', 'Dotation N', 'Dotation N-1', 'Variation'],
        lignes: [
          ['Immobilisations incorporelles', '5 500 000', 'Variable', '850 000', '750 000', '+13,3%'],
          ['Constructions', '180 000 000', '4-5%', '7 200 000', '7 200 000', '0,0%'],
          ['Installations techniques', '27 000 000', '10%', '2 700 000', '2 500 000', '+8,0%'],
          ['Matériel et outillage', '36 500 000', '20%', '7 300 000', '7 000 000', '+4,3%'],
          ['Matériel de transport', '16 500 000', '25%', '4 125 000', '4 500 000', '-8,3%'],
          ['Mobilier et informatique', '9 700 000', '20%', '1 940 000', '1 700 000', '+14,1%'],
          ['TOTAL', '-', '-', '24 115 000', '23 650 000', '+2,0%'],
        ]
      },
      details: {
        'Mode d\'amortissement': 'Linéaire pour tous les biens',
        'Seuil de comptabilisation': '100 000 pour les immobilisations'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 18',
      titre: 'CHARGES ET PRODUITS FINANCIERS',
      tableau: {
        titre: 'Détail du résultat financier',
        colonnes: ['Éléments', 'Montant N', 'Montant N-1', 'Variation', 'Commentaires'],
        lignes: [
          ['PRODUITS FINANCIERS:', '', '', '', ''],
          ['Revenus des titres de participation', '300 000', '250 000', '+20,0%', 'Dividendes reçus'],
          ['Autres intérêts et produits assimilés', '800 000', '700 000', '+14,3%', 'Intérêts prêts'],
          ['Reprises provisions et transferts', '200 000', '150 000', '+33,3%', 'Reprise provision'],
          ['Gains de change', '1 200 000', '1 000 000', '+20,0%', 'Opérations USD'],
          ['Produits nets sur cessions VMP', '100 000', '50 000', '+100,0%', 'Plus-values'],
          ['Total produits financiers', '2 600 000', '2 150 000', '+20,9%', ''],
          ['CHARGES FINANCIÈRES:', '', '', '', ''],
          ['Dotations provisions financières', '150 000', '100 000', '+50,0%', 'Provisions titres'],
          ['Intérêts et charges assimilées', '4 200 000', '4 800 000', '-12,5%', 'Emprunts'],
          ['Pertes de change', '600 000', '700 000', '-14,3%', 'Opérations devises'],
          ['Charges nettes sur cessions VMP', '50 000', '100 000', '-50,0%', 'Moins-values'],
          ['Total charges financières', '5 000 000', '5 700 000', '-12,3%', ''],
          ['RÉSULTAT FINANCIER', '-2 400 000', '-3 550 000', '+32,4%', 'Amélioration'],
        ]
      }
    },
    {
      numero: 'NOTE ANNEXE N° 19',
      titre: 'OPÉRATIONS AVEC LES PARTIES LIÉES',
      tableau: {
        titre: 'Transactions avec les parties liées',
        colonnes: ['Nature de la relation', 'Créances', 'Dettes', 'Charges', 'Produits', 'Engagements'],
        lignes: [
          ['Dirigeants et administrateurs', '1 500 000', '2 000 000', '12 000 000', '0', '0'],
          ['Sociétés mères', '0', '0', '0', '0', '0'],
          ['Filiales', '2 000 000', '500 000', '1 000 000', '2 500 000', '0'],
          ['Entreprises associées', '800 000', '1 200 000', '800 000', '600 000', '5 000 000'],
          ['Autres parties liées', '300 000', '800 000', '500 000', '200 000', '0'],
          ['TOTAL', '4 600 000', '4 500 000', '14 300 000', '3 300 000', '5 000 000'],
        ]
      },
      details: {
        'Rémunérations des dirigeants': {
          'Salaires et avantages': '12 000 000',
          'Jetons de présence': 'Néant',
          'Prêts accordés': '1 500 000 à 3%'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 20',
      titre: 'ENGAGEMENTS HORS BILAN',
      tableau: {
        titre: 'État des engagements',
        colonnes: ['Nature', 'Montant', 'Échéance', 'Bénéficiaire/Débiteur', 'Garanties'],
        lignes: [
          ['ENGAGEMENTS DONNÉS:', '', '', '', ''],
          ['Avals et cautions', '15 000 000', '2027', 'Banques', 'Hypothèque'],
          ['Hypothèques', '50 000 000', '2029', 'BANK A', 'Terrain'],
          ['Nantissements', '20 000 000', '2026', 'BANK B', 'Fonds commerce'],
          ['Engagements de crédit-bail', '2 500 000', '2025-2027', 'Société leasing', 'Matériel'],
          ['ENGAGEMENTS REÇUS:', '', '', '', ''],
          ['Cautions reçues', '5 000 000', 'Variable', 'Clients', 'Bancaire'],
          ['Lignes de crédit non utilisées', '25 000 000', '2025', 'BANK A', 'Hypothèque'],
          ['Assurances crédit', '10 000 000', 'Permanente', 'COFACE', 'Police'],
        ]
      },
      details: {
        'Crédit-bail': {
          'Véhicules': '1 500 000',
          'Matériel informatique': '1 000 000'
        }
      }
    },
    
    // NOTES 21-35 DÉVELOPPÉES COMPLÈTEMENT
    {
      numero: 'NOTE ANNEXE N° 21',
      titre: 'EFFECTIF DU PERSONNEL ET FRAIS DE PERSONNEL',
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
          'Départ à la retraite': '1'
        },
        'Taux de rotation': '10,3% (départs / effectif moyen)'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 22',
      titre: 'RÉMUNÉRATION DES DIRIGEANTS ET MANDATAIRES SOCIAUX',
      tableau: {
        titre: 'Détail des rémunérations et avantages des dirigeants',
        colonnes: ['Bénéficiaire / Nature', 'Montant brut N', 'Charges sociales', 'Avantages en nature', 'Montant total N', 'Montant total N-1'],
        lignes: [
          ['DIRIGEANTS:', '', '', '', '', ''],
          ['Gérant majoritaire - M. FONDATEUR', '9 600 000', '1 920 000', '480 000', '12 000 000', '11 400 000'],
          ['Directeur général - M. DIRECTEUR', '6 800 000', '1 360 000', '240 000', '8 400 000', '7 800 000'],
          ['Directeur financier - M. FINANCE', '5 200 000', '1 040 000', '160 000', '6 400 000', '6 000 000'],
          ['MANDATAIRES SOCIAUX:', '', '', '', '', ''],
          ['Jetons de présence - Conseil d\'administration', '800 000', '0', '0', '800 000', '700 000'],
          ['Rémunération commissaires aux comptes', '2 500 000', '0', '0', '2 500 000', '2 300 000'],
          ['Rémunération conseil juridique permanent', '1 200 000', '0', '0', '1 200 000', '1 000 000'],
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
    {
      numero: 'NOTE ANNEXE N° 23',
      titre: 'RÉPARTITION DU CAPITAL ET DROITS DE VOTE',
      tableau: {
        titre: 'Structure de l\'actionnariat au 31/12/N',
        colonnes: ['Actionnaire', 'Nb actions', 'Valeur nominale', 'Montant', '% Capital', '% Droits de vote', 'Catégorie'],
        lignes: [
          ['M. FONDATEUR (Gérant)', '5 000', '10 000', '50 000 000', '50,0%', '50,0%', 'Personne physique'],
          ['Mme ASSOCIÉE', '1 500', '10 000', '15 000 000', '15,0%', '15,0%', 'Personne physique'],
          ['M. PARTENAIRE', '1 000', '10 000', '10 000 000', '10,0%', '10,0%', 'Personne physique'],
          ['INVESTISSEUR SA', '1 500', '10 000', '15 000 000', '15,0%', '15,0%', 'Personne morale'],
          ['FONDS DÉVELOPPEMENT PME', '800', '10 000', '8 000 000', '8,0%', '8,0%', 'Personne morale'],
          ['Salariés (plan actionnariat)', '200', '10 000', '2 000 000', '2,0%', '2,0%', 'Personnes physiques'],
          ['TOTAL', '10 000', '10 000', '100 000 000', '100,0%', '100,0%', '-'],
        ]
      },
      details: {
        'Historique du capital': {
          'Capital initial (création)': '10 000 000 (1 000 actions)',
          'Augmentation 2018': '40 000 000 (4 000 actions - apports numéraire)',
          'Augmentation 2020': '30 000 000 (3 000 actions - incorporation réserves)',
          'Augmentation 2022': '20 000 000 (2 000 actions - entrée investisseurs)',
          'Capital actuel': '100 000 000 (10 000 actions)'
        },
        'Actions propres': {
          'Actions auto-détenues': 'Néant',
          'Programme de rachat': 'Aucun programme de rachat en cours'
        },
        'Pacte d\'actionnaires': {
          'Clause de préemption': 'Oui - droit de préemption entre actionnaires fondateurs',
          'Clause d\'agrément': 'Oui - agrément CA pour toute cession à un tiers',
          'Clause de sortie conjointe': 'Oui - tag-along au bénéfice des minoritaires'
        },
        'Dividendes': {
          'Dividendes distribués N': '5 000 000 (500 FCFA / action)',
          'Dividendes distribués N-1': '4 000 000 (400 FCFA / action)',
          'Taux de distribution': '40% du résultat net'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 24',
      titre: 'VENTILATION DU CHIFFRE D\'AFFAIRES',
      tableau: {
        titre: 'Chiffre d\'affaires par secteur géographique et par activité',
        colonnes: ['Axe de ventilation', 'Montant N', '% N', 'Montant N-1', '% N-1', 'Évolution'],
        lignes: [
          ['PAR ZONE GÉOGRAPHIQUE:', '', '', '', '', ''],
          ['Marché national', '168 640 000', '80,0%', '157 920 000', '80,0%', '+6,8%'],
          ['Exportations CEDEAO', '21 080 000', '10,0%', '18 766 000', '9,5%', '+12,3%'],
          ['Exportations CEMAC', '12 648 000', '6,0%', '11 844 000', '6,0%', '+6,8%'],
          ['Autres exportations (hors zone)', '8 432 000', '4,0%', '8 870 000', '4,5%', '-4,9%'],
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
        'Top 5 clients (concentration)': {
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
          'Taux de rétention clients': '92,5%'
        },
        'Carnet de commandes': 'Au 31/12/N, le carnet de commandes s\'établit à 45 000 000, soit 2,6 mois de CA'
      }
    },
    {
      numero: 'NOTE ANNEXE N° 25',
      titre: 'TRANSACTIONS AVEC LES PARTIES LIÉES',
      tableau: {
        titre: 'Détail des transactions avec les parties liées',
        colonnes: ['Partie liée', 'Nature relation', 'Achats / Charges', 'Ventes / Produits', 'Créances', 'Dettes', 'Engagements'],
        lignes: [
          ['M. FONDATEUR (Gérant)', 'Dirigeant', '12 000 000', '0', '1 500 000', '2 000 000', '0'],
          ['Mme ASSOCIÉE', 'Actionnaire', '0', '0', '0', '1 200 000', '0'],
          ['INVESTISSEUR SA', 'Actionnaire', '2 400 000', '3 500 000', '800 000', '600 000', '5 000 000'],
          ['FILIALE BENIN SARL', 'Filiale (75%)', '1 800 000', '4 200 000', '2 500 000', '300 000', '8 000 000'],
          ['FILIALE TOGO SA', 'Filiale (60%)', '2 200 000', '3 800 000', '1 800 000', '500 000', '6 000 000'],
          ['PARTENAIRE A SARL', 'Entreprise associée (30%)', '800 000', '600 000', '400 000', '800 000', '0'],
          ['Membres du CA', 'Administrateurs', '800 000', '0', '0', '200 000', '0'],
          ['TOTAL', '-', '20 000 000', '12 100 000', '7 000 000', '5 600 000', '19 000 000'],
        ]
      },
      details: {
        'Conventions réglementées': {
          'Convention de gestion M. FONDATEUR': 'Approuvée AG du 15/06/N',
          'Convention de trésorerie FILIALE BENIN': 'Taux de 4,5% - Approuvée AG du 15/06/N',
          'Convention de prestation INVESTISSEUR SA': 'Assistance technique - 2 400 000/an',
          'Convention de sous-traitance FILIALE TOGO': 'Au prix du marché'
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
          'Garanties reçues': '5 000 000 (nantissement parts INVESTISSEUR SA)'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 26',
      titre: 'ENGAGEMENTS FINANCIERS DONNÉS ET REÇUS',
      tableau: {
        titre: 'État détaillé des engagements hors bilan',
        colonnes: ['Nature de l\'engagement', 'Montant N', 'Montant N-1', 'Échéance', 'Bénéficiaire', 'Garantie associée'],
        lignes: [
          ['ENGAGEMENTS DONNÉS:', '', '', '', '', ''],
          ['Avals, cautions et garanties bancaires', '15 000 000', '12 000 000', '2027', 'BANK A / BANK B', 'Hypothèque terrain'],
          ['Hypothèques données', '50 000 000', '50 000 000', '2029', 'BANK A', 'Terrain et bâtiments'],
          ['Nantissements de fonds de commerce', '20 000 000', '20 000 000', '2026', 'BANK B', 'Fonds de commerce'],
          ['Nantissement stocks et créances', '8 000 000', '6 000 000', '2026', 'BANK B', 'Stocks marchandises'],
          ['Cautions données pour filiales', '14 000 000', '10 000 000', '2027', 'Banques filiales', 'Caution solidaire'],
          ['Engagements de crédit-bail', '2 500 000', '3 200 000', '2025-2027', 'Sociétés de leasing', 'Matériel financé'],
          ['ENGAGEMENTS REÇUS:', '', '', '', '', ''],
          ['Cautions clients reçues', '5 000 000', '4 500 000', 'Variable', 'Clients divers', 'Bancaire'],
          ['Lignes de crédit non utilisées', '25 000 000', '20 000 000', '2025', 'BANK A / BANK C', 'Nantissement'],
          ['Assurances crédit export', '10 000 000', '8 000 000', 'Permanente', 'COFACE', 'Police RC'],
          ['Garantie maison mère', '15 000 000', '15 000 000', '2026', 'INVESTISSEUR SA', 'Lettre de confort'],
        ]
      },
      details: {
        'Engagements de loyers non résiliables': {
          'Bail commercial siège social': '3 600 000 / an - échéance 2028 (reste 14 400 000)',
          'Bail entrepôt zone industrielle': '2 400 000 / an - échéance 2027 (reste 7 200 000)',
          'Bail bureau annexe': '1 200 000 / an - échéance 2026 (reste 2 400 000)',
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
          'Contrats de prestations informatiques': '960 000 / an'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 27',
      titre: 'CRÉDIT-BAIL ET CONTRATS ASSIMILÉS',
      tableau: {
        titre: 'État des contrats de crédit-bail en cours',
        colonnes: ['Description du bien', 'Date contrat', 'Durée', 'Valeur d\'origine', 'Redevances payées N', 'Cumul redevances', 'Valeur résiduelle', 'Option achat'],
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
          'Impact résultat si retraitement': '-1 200 000 (différence amort./redevances)'
        },
        'Contrats arrivant à échéance en N+1': {
          'Photocopieur professionnel': 'Échéance 12/2025 - Levée option probable',
          'Véhicule utilitaire TOYOTA': 'Échéance 02/2026 - Renouvellement prévu'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 28',
      titre: 'TABLEAU DES ÉCHÉANCES DES CRÉANCES ET DETTES',
      tableau: {
        titre: 'Ventilation par échéance au 31/12/N',
        colonnes: ['Éléments', 'Montant total', '< 3 mois', '3 mois à 1 an', '1 à 5 ans', '> 5 ans'],
        lignes: [
          ['ACTIF - CRÉANCES:', '', '', '', '', ''],
          ['Créances clients et comptes rattachés', '33 200 000', '25 000 000', '7 400 000', '800 000', '0'],
          ['Autres créances d\'exploitation', '9 200 000', '5 200 000', '3 200 000', '800 000', '0'],
          ['Créances sur immobilisations', '800 000', '0', '800 000', '0', '0'],
          ['Prêts au personnel', '1 500 000', '200 000', '600 000', '700 000', '0'],
          ['Créances fiscales (TVA, IS)', '5 000 000', '3 200 000', '1 800 000', '0', '0'],
          ['Total créances', '49 700 000', '33 600 000', '13 800 000', '2 300 000', '0'],
          ['PASSIF - DETTES:', '', '', '', '', ''],
          ['Emprunts et dettes financières', '64 200 000', '4 500 000', '11 000 000', '41 700 000', '7 000 000'],
          ['Dettes fournisseurs et comptes rattachés', '30 500 000', '24 500 000', '6 000 000', '0', '0'],
          ['Dettes fiscales et sociales', '19 300 000', '12 300 000', '7 000 000', '0', '0'],
          ['Autres dettes', '14 200 000', '6 200 000', '5 000 000', '3 000 000', '0'],
          ['Total dettes', '128 200 000', '47 500 000', '29 000 000', '44 700 000', '7 000 000'],
        ]
      },
      details: {
        'Créances en souffrance (impayées)': {
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
        'Ratio de liquidité': {
          'Ratio de liquidité générale': '1,28 (actif court terme / passif court terme)',
          'Ratio de liquidité réduite': '0,95 (hors stocks)',
          'Ratio de liquidité immédiate': '0,17 (trésorerie / passif court terme)'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 29',
      titre: 'VENTILATION CHARGES ET PRODUITS PAR DESTINATION',
      tableau: {
        titre: 'Répartition des charges d\'exploitation par fonction',
        colonnes: ['Fonction / Destination', 'Montant N', '% Total', 'Montant N-1', '% Total N-1', 'Variation'],
        lignes: [
          ['PAR DESTINATION:', '', '', '', '', ''],
          ['Coût de production / Achat marchandises', '98 500 000', '51,2%', '92 800 000', '51,6%', '+6,1%'],
          ['Charges commerciales et marketing', '28 400 000', '14,8%', '25 200 000', '14,0%', '+12,7%'],
          ['Charges administratives et générales', '18 600 000', '9,7%', '17 100 000', '9,5%', '+8,8%'],
          ['Charges de personnel (total)', '48 500 000', '25,2%', '45 200 000', '25,1%', '+7,3%'],
          ['Dotations aux amortissements', '24 115 000', '-', '23 650 000', '-', '+2,0%'],
          ['Total charges d\'exploitation par destination', '218 115 000', '100,0%', '203 950 000', '100,0%', '+6,9%'],
          ['PAR NATURE:', '', '', '', '', ''],
          ['Achats de matières et marchandises', '95 000 000', '43,6%', '89 500 000', '43,9%', '+6,1%'],
          ['Variation de stocks', '-3 300 000', '-1,5%', '-1 200 000', '-0,6%', '+175,0%'],
          ['Transports et déplacements', '8 500 000', '3,9%', '7 800 000', '3,8%', '+9,0%'],
          ['Services extérieurs', '12 400 000', '5,7%', '11 200 000', '5,5%', '+10,7%'],
          ['Impôts et taxes', '6 800 000', '3,1%', '6 200 000', '3,0%', '+9,7%'],
          ['Charges de personnel', '48 500 000', '22,2%', '45 200 000', '22,2%', '+7,3%'],
          ['Dotations aux amortissements et provisions', '26 065 000', '12,0%', '24 550 000', '12,0%', '+6,2%'],
          ['Autres charges d\'exploitation', '24 150 000', '11,1%', '20 700 000', '10,2%', '+16,7%'],
          ['Total charges d\'exploitation par nature', '218 115 000', '100,0%', '203 950 000', '100,0%', '+6,9%'],
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
          'Fournitures de bureau et consommables': '2 400 000',
          'Frais postaux et télécommunications': '1 800 000',
          'Assurances': '2 400 000'
        },
        'Indicateurs de performance': {
          'Marge brute': '115 800 000 (54,9% du CA)',
          'Marge brute N-1': '107 900 000 (54,7% du CA)',
          'Charges de structure / CA': '22,3%',
          'Productivité par employé': '2 539 759 (CA / effectif moyen)'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 30',
      titre: 'PRODUITS À RECEVOIR ET CHARGES À PAYER',
      tableau: {
        titre: 'Détail des régularisations de fin d\'exercice',
        colonnes: ['Nature', 'Charges à payer N', 'Charges à payer N-1', 'Produits à recevoir N', 'Produits à recevoir N-1'],
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
          'Factures non parvenues fournisseurs': '2 700 000 - Estimation basée sur bons de livraison non facturés',
          'Gratifications personnel': '1 800 000 - Prime annuelle (13ème mois prorata)',
          'Congés payés': '1 200 000 - Provision calculée sur droits acquis non pris',
          'Intérêts courus emprunts': '1 200 000 - Prorata temporis sur emprunts en cours'
        },
        'Produits à recevoir significatifs': {
          'Factures à établir clients': '1 500 000 - Prestations réalisées en décembre N',
          'Commissions à recevoir': '520 000 - Commissions T4 sur apport d\'affaires',
          'Indemnités assurance': '350 000 - Sinistre véhicule déclaré en décembre N'
        },
        'Évolution des régularisations': {
          'Variation charges à payer': '+22,0% (lié à la croissance de l\'activité)',
          'Variation produits à recevoir': '+41,7% (nouvelles commissions et sinistre)',
          'Impact net sur résultat': '-5 480 000 (charges nettes de régularisation)'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 31',
      titre: 'CHARGES ET PRODUITS CONSTATÉS D\'AVANCE',
      tableau: {
        titre: 'Détail des charges et produits constatés d\'avance',
        colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Période couverte', 'Date de rattachement', 'Variation'],
        lignes: [
          ['CHARGES CONSTATÉES D\'AVANCE:', '', '', '', '', ''],
          ['Assurances payées d\'avance', '420 000', '380 000', 'Janv-Mars N+1', 'Exercice N+1', '+10,5%'],
          ['Loyers payés d\'avance', '300 000', '300 000', 'Janvier N+1', 'Exercice N+1', '0,0%'],
          ['Abonnements et cotisations', '85 000', '70 000', 'Janv-Juin N+1', 'Exercice N+1', '+21,4%'],
          ['Maintenance informatique prépayée', '180 000', '150 000', 'Janv-Mars N+1', 'Exercice N+1', '+20,0%'],
          ['Frais de publicité campagne prépayée', '250 000', '0', 'Janv-Fév N+1', 'Exercice N+1', 'Nouveau'],
          ['Sous-total charges constatées d\'avance', '1 235 000', '900 000', '-', '-', '+37,2%'],
          ['PRODUITS CONSTATÉS D\'AVANCE:', '', '', '', '', ''],
          ['Abonnements clients facturés d\'avance', '480 000', '350 000', 'Janv-Mars N+1', 'Exercice N+1', '+37,1%'],
          ['Prestations de service facturées d\'avance', '320 000', '250 000', 'Janv-Fév N+1', 'Exercice N+1', '+28,0%'],
          ['Loyers perçus d\'avance (sous-location)', '150 000', '150 000', 'Janvier N+1', 'Exercice N+1', '0,0%'],
          ['Subvention d\'exploitation prorata', '200 000', '0', 'Janv-Juin N+1', 'Exercice N+1', 'Nouveau'],
          ['Sous-total produits constatés d\'avance', '1 150 000', '750 000', '-', '-', '+53,3%'],
        ]
      },
      details: {
        'Principe de comptabilisation': {
          'Méthode appliquée': 'Rattachement des charges et produits à l\'exercice concerné (principe de séparation des exercices)',
          'Contrôle': 'Revue analytique des contrats à cheval sur deux exercices',
          'Validation': 'Vérification systématique des factures > 100 000 FCFA'
        },
        'Charges constatées d\'avance par nature': {
          'Charges de fonctionnement': '805 000 (65,2%)',
          'Charges commerciales': '250 000 (20,2%)',
          'Charges financières': '0 (0%)',
          'Autres charges': '180 000 (14,6%)'
        },
        'Impact sur le résultat': {
          'Charges constatées d\'avance (report N+1)': '+ 1 235 000 sur résultat N',
          'Produits constatés d\'avance (report N+1)': '- 1 150 000 sur résultat N',
          'Impact net CCA/PCA': '+ 85 000 sur résultat N'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 32',
      titre: 'CONVERSION DES OPÉRATIONS EN DEVISES',
      tableau: {
        titre: 'Positions en devises et écarts de conversion',
        colonnes: ['Devise', 'Nature', 'Montant devise', 'Cours clôture', 'Contre-valeur FCFA', 'Cours historique', 'Écart de conversion'],
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
          'Devise fonctionnelle': 'Franc CFA (XOF) - Parité fixe avec EUR (1 EUR = 655,957 FCFA)',
          'Exposition nette USD': '-13 800 USD (position courte)',
          'Exposition nette EUR': '-6 800 EUR (position courte)',
          'Couverture de change': 'Aucun instrument de couverture utilisé en N'
        },
        'Écarts de conversion': {
          'Écarts de conversion actif (pertes latentes)': '79 920 FCFA',
          'Écarts de conversion passif (gains latents)': '143 500 FCFA',
          'Provision pour risque de change': '79 920 FCFA (couverture intégrale des pertes latentes)',
          'Gains de change réalisés en N': '1 200 000 FCFA',
          'Pertes de change réalisées en N': '600 000 FCFA'
        },
        'Méthode de conversion': {
          'Créances et dettes': 'Cours de clôture au 31/12/N',
          'Opérations de l\'exercice': 'Cours du jour de la transaction',
          'Immobilisations en devises': 'Cours historique d\'acquisition',
          'Zone FCFA (EUR)': 'Parité fixe - pas d\'écart de conversion'
        },
        'Évolution des cours': {
          'USD/XOF début N': '592,100',
          'USD/XOF fin N': '585,250',
          'Variation USD': '-1,16% (appréciation du FCFA)',
          'GBP/XOF début N': '738,200',
          'GBP/XOF fin N': '742,800',
          'Variation GBP': '+0,62%'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 33',
      titre: 'ÉVÉNEMENTS POSTÉRIEURS À LA CLÔTURE',
      contenu: {
        '33.1 Événements ajustants': {
          description: 'Événements fournissant des informations supplémentaires sur des conditions existant à la date de clôture :',
          details: [
            'Règlement du litige commercial A en janvier N+1 pour 1 200 000 FCFA (provision constituée à hauteur de 1 500 000)',
            'Recouvrement partiel de la créance CLIENT DOUTEUX X pour 400 000 FCFA sur 800 000 provisionnés',
            'Ajustement provision stocks : destruction de 150 000 FCFA de marchandises périmées identifiées lors de l\'inventaire de janvier'
          ]
        },
        '33.2 Événements non ajustants': {
          description: 'Événements significatifs survenus après la clôture mais ne remettant pas en cause les comptes arrêtés :',
          details: [
            'Signature d\'un nouveau contrat commercial majeur en février N+1 (CA estimé : 15 000 000 sur 24 mois)',
            'Obtention d\'une nouvelle ligne de crédit de 10 000 000 auprès de BANK C en janvier N+1',
            'Décision du conseil d\'administration de procéder à l\'extension de l\'usine (investissement de 18 000 000)',
            'Aucune pandémie, catastrophe naturelle ou événement géopolitique majeur affectant l\'activité'
          ]
        },
        '33.3 Continuité d\'exploitation': {
          description: 'La direction confirme que l\'hypothèse de continuité d\'exploitation reste appropriée. Les indicateurs financiers sont positifs :',
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
    {
      numero: 'NOTE ANNEXE N° 34',
      titre: 'FILIALES ET PARTICIPATIONS',
      tableau: {
        titre: 'Tableau des filiales et participations',
        colonnes: ['Société', 'Siège', 'Capital', '% détenu', 'Capitaux propres', 'CA N', 'Résultat N', 'Valeur comptable', 'Dividendes reçus'],
        lignes: [
          ['FILIALES (contrôle > 50%):', '', '', '', '', '', '', '', ''],
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
        'Informations financières des filiales': {
          'FILIALE BENIN SARL': 'Activité de distribution - Résultat en hausse de 15% vs N-1',
          'FILIALE TOGO SA': 'Activité de production et distribution - Marché en croissance',
          'Quote-part résultat filiales': '2 415 000 (quote-part proportionnelle)',
          'Dividendes reçus en N': '330 000'
        },
        'Provisions sur titres': {
          'Provision FILIALE BENIN': '0 (capitaux propres > valeur comptable)',
          'Provision FILIALE TOGO': '0 (capitaux propres > valeur comptable)',
          'Provision PARTENAIRE A': '0 (capitaux propres > valeur comptable)',
          'Total provisions titres': '0'
        },
        'Opérations intra-groupe': {
          'Ventes aux filiales': '8 000 000',
          'Achats aux filiales': '4 000 000',
          'Créances intra-groupe': '4 300 000',
          'Dettes intra-groupe': '800 000',
          'Méthode d\'élimination': 'Non consolidé (seuils non atteints)'
        },
        'Événements significatifs': {
          'FILIALE TOGO SA': 'Projet d\'augmentation de capital de 10 000 000 en N+1',
          'SA PARTICIPÉE B': 'Introduction en bourse envisagée à horizon N+2'
        }
      }
    },
    {
      numero: 'NOTE ANNEXE N° 35',
      titre: 'INFORMATIONS COMPLÉMENTAIRES ET DIVERSES',
      tableau: {
        titre: 'Honoraires des conseils et prestataires externes',
        colonnes: ['Prestataire / Nature', 'Mission', 'Montant N', 'Montant N-1', 'Variation'],
        lignes: [
          ['Commissaires aux comptes - Certification', 'Audit légal', '2 000 000', '1 800 000', '+11,1%'],
          ['Commissaires aux comptes - Autres', 'Missions connexes', '500 000', '500 000', '0,0%'],
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
          'Litige commercial - CLIENT Y': 'Montant réclamé : 3 500 000 - Provision constituée : 1 500 000 - Issue probable : transaction amiable',
          'Litige social - Ex-salarié Z': 'Indemnités réclamées : 1 200 000 - Provision constituée : 800 000 - Audience prévue T2 N+1',
          'Contrôle fiscal exercices N-2 et N-1': 'En cours - Aucun redressement notifié à ce jour - Provision pour risque : 200 000',
          'Total provisions pour litiges': '2 500 000'
        },
        'Engagements de retraite et avantages au personnel': {
          'Régime de retraite': 'Régime par répartition CNPS (pas d\'engagement à prestations définies)',
          'Indemnités de départ légales': 'Estimation actuarielle : 4 500 000 (non provisionné - méthode SYSCOHADA)',
          'Assurance maladie groupe': 'Cotisation annuelle : 1 800 000 (couverture 83 salariés)',
          'Avantages postérieurs à l\'emploi': 'Néant en dehors des obligations légales'
        },
        'Politique environnementale et RSE': {
          'Certification': 'Conformité ISO 14001 maintenue',
          'Investissements environnementaux N': '2 500 000 (traitement déchets et recyclage)',
          'Provisions environnementales': 'Néant (aucune obligation de remise en état identifiée)',
          'Bilan carbone': 'En cours d\'élaboration - Publication prévue N+1'
        },
        'Informations sur les instruments financiers': {
          'Instruments dérivés': 'Aucun instrument financier dérivé utilisé',
          'Juste valeur des actifs financiers': 'Pas d\'écart significatif avec la valeur comptable',
          'Risque de crédit': 'Diversification clients - Top client < 16% du CA',
          'Risque de liquidité': 'Couvert par lignes de crédit non tirées (25 000 000)'
        },
        'Autres informations': {
          'Subventions reçues': '1 500 000 (subvention d\'exploitation FDFP pour formation)',
          'Crédit d\'impôt investissement': 'Néant',
          'Effectif moyen annuel': '78 personnes (équivalent temps plein)',
          'Date d\'arrêté des comptes': '15 mars N+1 par le conseil d\'administration'
        }
      }
    }
  ]

  const currentNote = notesCompletes[currentNoteIndex]

  const nextNote = () => {
    if (currentNoteIndex < notesCompletes.length - 1) {
      setCurrentNoteIndex(currentNoteIndex + 1)
    }
  }

  const previousNote = () => {
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(currentNoteIndex - 1)
    }
  }

  const goToFirstNote = () => {
    setCurrentNoteIndex(0)
  }

  const goToLastNote = () => {
    setCurrentNoteIndex(notesCompletes.length - 1)
  }

  const renderTableau = (tableau: any) => (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: PRIMARY_COLOR }}>
            {tableau.colonnes.map((colonne: string, index: number) => (
              <TableCell
                key={index}
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: PRIMARY_COLOR,
                  border: '1px solid #e5e5e5'
                }}
                align={index > 0 ? 'right' : 'left'}
              >
                {colonne}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableau.lignes.map((ligne: string[], rowIndex: number) => (
            <TableRow key={rowIndex}>
              {ligne.map((cell: string, cellIndex: number) => (
                <TableCell 
                  key={cellIndex}
                  align={cellIndex > 0 ? 'right' : 'left'}
                  sx={{
                    border: '1px solid #e5e5e5',
                    fontWeight: cell.includes('TOTAL') || cell.includes(':') ? 700 : 400,
                    backgroundColor: cell.includes('TOTAL') || cell.includes(':') ? '#f5f5f5' : 'white',
                    fontStyle: cell.includes(':') ? 'italic' : 'normal',
                  }}
                >
                  {editMode && cellIndex > 0 && !cell.includes('TOTAL') && !cell.includes(':') ? (
                    <TextField
                      size="small"
                      defaultValue={cell}
                      variant="standard"
                      sx={{ width: '100%' }}
                      inputProps={{ style: { textAlign: cellIndex > 0 ? 'right' : 'left' } }}
                    />
                  ) : (
                    cell
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderContenu = (contenu: any) => (
    <Box sx={{ mt: 2 }}>
      {Object.entries(contenu).map(([key, value]) => (
        <Card key={key} sx={{ mb: 2 }} variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: PRIMARY_COLOR }}>
              {key}
            </Typography>
            {typeof value === 'object' && 'description' in (value as any) ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {(value as any).description}
                </Typography>
                {(value as any).details && (
                  <Box sx={{ pl: 2 }}>
                    {(value as any).details.map((detail: string, index: number) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                        • {detail}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ) : typeof value === 'object' ? (
              <Box sx={{ pl: 2 }}>
                {Object.entries(value as any).map(([subKey, subValue]) => (
                  <Box key={subKey} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {subKey}:
                    </Typography>
                    <Typography variant="body2">
                      {subValue as string}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">{value as string}</Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )

  return (
    <Box>
      {/* Header avec navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
            {currentNote.numero}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
            {currentNote.titre}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Note {currentNoteIndex + 1} sur {notesCompletes.length}
          </Typography>
          
          <Button
            variant={editMode ? 'contained' : 'outlined'}
            startIcon={editMode ? <Save /> : <Edit />}
            onClick={() => setEditMode(!editMode)}
            size="small"
            sx={{ ml: 2 }}
          >
            {editMode ? 'Sauvegarder' : 'Modifier'}
          </Button>
        </Box>
      </Box>

      {/* Navigation uniquement si pas de note fixe */}
      {!navigationDisabled && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
          <IconButton 
            onClick={goToFirstNote} 
            disabled={currentNoteIndex === 0}
            sx={{ color: PRIMARY_COLOR }}
          >
            <FirstPage />
          </IconButton>
          <IconButton 
            onClick={previousNote} 
            disabled={currentNoteIndex === 0}
            sx={{ color: PRIMARY_COLOR }}
          >
            <NavigateBefore />
          </IconButton>
          
          <Chip 
            label={`${currentNoteIndex + 1} / ${notesCompletes.length}`}
            sx={{ 
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              fontWeight: 600,
              minWidth: 80
            }}
          />
          
          <IconButton 
            onClick={nextNote} 
            disabled={currentNoteIndex === notesCompletes.length - 1}
            sx={{ color: PRIMARY_COLOR }}
          >
            <NavigateNext />
          </IconButton>
          <IconButton 
            onClick={goToLastNote} 
            disabled={currentNoteIndex === notesCompletes.length - 1}
            sx={{ color: PRIMARY_COLOR }}
          >
            <LastPage />
          </IconButton>
        </Box>
      )}

      {/* Contenu de la note courante */}
      <Paper sx={{ p: 3, backgroundColor: 'white', minHeight: '500px' }}>
        {currentNote.contenu && renderContenu(currentNote.contenu)}
        {currentNote.tableau && renderTableau(currentNote.tableau)}
        {currentNote.details && renderContenu(currentNote.details)}
      </Paper>

      {/* Section Commentaires pour chaque note */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Comment color="primary" />
            💬 Commentaires - {currentNote.numero}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Type de commentaire</InputLabel>
                  <Select
                    value={typeCommentaire}
                    onChange={(e) => setTypeCommentaire(e.target.value)}
                    label="Type de commentaire"
                  >
                    {typesCommentaires.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Commentaire détaillé"
                  placeholder="Ajoutez vos observations, justifications ou explications sur cette note annexe..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />

                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => {
                    if (typeCommentaire && commentaire.trim()) {
                      const nouveauComm = {
                        id: Date.now().toString(),
                        type: typeCommentaire,
                        contenu: commentaire,
                        date: new Date()
                      }
                      const nouveauxCommentaires = {...commentairesParNote}
                      if (!nouveauxCommentaires[currentNoteIndex]) {
                        nouveauxCommentaires[currentNoteIndex] = []
                      }
                      nouveauxCommentaires[currentNoteIndex].push(nouveauComm)
                      setCommentairesParNote(nouveauxCommentaires)
                      setCommentaire('')
                      setTypeCommentaire('')
                    }
                  }}
                  disabled={!typeCommentaire || !commentaire.trim()}
                >
                  Ajouter Commentaire
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                📝 Commentaires pour cette note ({(commentairesParNote[currentNoteIndex] || []).length})
              </Typography>
              
              {(commentairesParNote[currentNoteIndex] || []).length === 0 ? (
                <Alert severity="info">
                  Aucun commentaire ajouté pour cette note
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {(commentairesParNote[currentNoteIndex] || []).map((comm) => (
                    <Paper key={comm.id} sx={{ p: 2, border: '1px solid #e5e5e5' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Chip label={comm.type} size="small" color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          {comm.date.toLocaleDateString('fr-FR')}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">
                        {comm.contenu}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation en bas uniquement si navigation libre */}
      {!navigationDisabled && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={previousNote}
            disabled={currentNoteIndex === 0}
          >
            Note précédente
          </Button>
          
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={nextNote}
            disabled={currentNoteIndex === notesCompletes.length - 1}
            sx={{ backgroundColor: PRIMARY_COLOR }}
          >
            Note suivante
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default NotesAnnexesCompletesFinal