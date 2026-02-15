/**
 * Composant Documentation Juridique
 * Base de connaissances réglementaire SYSCOHADA enrichie avec 4 sous-onglets :
 * - Lois de Finances
 * - Évolutions SYSCOHADA
 * - Synthèse SYSCOHADA (principes, règles, erreurs fréquentes)
 * - Règles & Contrôles (validation intelligente liée aux articles SYSCOHADA)
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  InputAdornment,
  Alert,
  Switch,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Gavel,
  TrendingUp,
  AutoAwesome,
  CloudUpload,
  Download,
  Delete,
  Visibility,
  Search,
  Close,
  InsertDriveFile,
  PictureAsPdf,
  Description,
  VerifiedUser,
  Warning,
  Error as ErrorIcon,
  Info,
  Block,
  Shield,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import type {
  DocumentJuridique,
  EvolutionSyscohada,
  SyntheseSyscohada,
  RegleValidation,
} from '@/services/documentationJuridiqueService'
import { TabPanel } from '@/components/shared/TabPanel'

// === Données demo : Lois de Finances ===

const demoLoisFinances: DocumentJuridique[] = [
  {
    id: '1',
    titre: 'Loi de Finances 2024 - Cameroun',
    pays: 'Cameroun',
    annee: 2024,
    thematique: 'Fiscalité des entreprises',
    format: 'PDF',
    dateImport: '15/01/2024',
    tailleFichier: '2.4 MB',
    description: 'Loi de finances exercice 2024 de la République du Cameroun',
    contenuExtrait: 'Article 1 : Le budget de l\'État pour l\'exercice 2024 est arrêté en recettes à...',
  },
  {
    id: '2',
    titre: 'Loi de Finances Rectificative 2023 - Côte d\'Ivoire',
    pays: 'Côte d\'Ivoire',
    annee: 2023,
    thematique: 'TVA',
    format: 'PDF',
    dateImport: '20/07/2023',
    tailleFichier: '1.8 MB',
    description: 'Loi de finances rectificative pour la gestion 2023',
    contenuExtrait: 'Modifications des taux de TVA applicables aux services numériques...',
  },
  {
    id: '3',
    titre: 'Code Général des Impôts 2024 - Sénégal',
    pays: 'Sénégal',
    annee: 2024,
    thematique: 'Impôt sur les sociétés',
    format: 'Word',
    dateImport: '05/02/2024',
    tailleFichier: '5.1 MB',
    description: 'Version consolidée du Code Général des Impôts du Sénégal',
    contenuExtrait: 'Titre I - Impôt sur les sociétés. Chapitre 1 - Champ d\'application...',
  },
  {
    id: '4',
    titre: 'Loi de Finances 2024 - Gabon',
    pays: 'Gabon',
    annee: 2024,
    thematique: 'Fiscalité des entreprises',
    format: 'PDF',
    dateImport: '10/01/2024',
    tailleFichier: '3.2 MB',
    description: 'Loi de finances de la République Gabonaise pour l\'année 2024',
    contenuExtrait: 'Dispositions relatives à l\'impôt sur les sociétés et à la contribution...',
  },
  {
    id: '5',
    titre: 'Ordonnance fiscale 2023 - Congo',
    pays: 'Congo',
    annee: 2023,
    thematique: 'Droits de douane',
    format: 'PDF',
    dateImport: '12/12/2023',
    tailleFichier: '1.5 MB',
    description: 'Ordonnance portant loi de finances pour l\'exercice 2023',
    contenuExtrait: 'Chapitre III - Dispositions relatives aux droits de douane et taxes...',
  },
  {
    id: '6',
    titre: 'Loi de Finances 2024 - Mali',
    pays: 'Mali',
    annee: 2024,
    thematique: 'TVA',
    format: 'PDF',
    dateImport: '28/01/2024',
    tailleFichier: '2.0 MB',
    description: 'Loi de finances pour l\'exercice budgétaire 2024',
    contenuExtrait: 'Section II - De la taxe sur la valeur ajoutée. Article 15...',
  },
]

// === Données demo : Évolutions SYSCOHADA ===

const demoEvolutions: EvolutionSyscohada[] = [
  {
    id: '1',
    titre: 'Révision du cadre conceptuel SYSCOHADA',
    type: 'Norme',
    dateEffet: '01/01/2024',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Mise à jour du cadre conceptuel pour intégrer les IFRS applicables',
    contenuExtrait: 'Le cadre conceptuel révisé introduit de nouvelles définitions des éléments des états financiers, alignées sur les IFRS tout en préservant les spécificités de la zone OHADA. Les actifs sont désormais définis comme des ressources contrôlées par l\'entité résultant d\'événements passés et dont des avantages économiques futurs sont attendus.',
    dateImport: '15/11/2023',
    format: 'PDF',
    tailleFichier: '4.2 MB',
  },
  {
    id: '2',
    titre: 'Circulaire sur les instruments financiers',
    type: 'Circulaire',
    dateEffet: '01/07/2024',
    pays: 'Zone OHADA',
    statut: 'En attente',
    description: 'Précisions sur le traitement comptable des instruments financiers dérivés',
    contenuExtrait: 'La présente circulaire précise les modalités de comptabilisation des instruments financiers dérivés (options, swaps, contrats à terme) dans le cadre du SYSCOHADA Révisé. Les dérivés de couverture sont évalués à la juste valeur avec impact en résultat ou en capitaux propres selon la nature de la couverture.',
    dateImport: '20/03/2024',
    format: 'PDF',
    tailleFichier: '1.8 MB',
  },
  {
    id: '3',
    titre: 'Modification du plan des comptes - Comptes de crypto-actifs',
    type: 'Modification plan',
    dateEffet: '01/01/2025',
    pays: 'Zone OHADA',
    statut: 'En attente',
    description: 'Ajout de comptes spécifiques pour la comptabilisation des crypto-actifs',
    contenuExtrait: 'Création des comptes 274 - Crypto-actifs immobilisés et 506 - Crypto-actifs de placement. Les crypto-actifs détenus à long terme sont classés en immobilisations incorporelles (compte 274). Les crypto-actifs détenus à des fins de trading sont classés en valeurs mobilières de placement (compte 506).',
    dateImport: '05/06/2024',
    format: 'Word',
    tailleFichier: '890 KB',
  },
  {
    id: '4',
    titre: 'Norme sur les contrats de location SYSCOHADA',
    type: 'Norme',
    dateEffet: '01/01/2023',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Alignement sur IFRS 16 pour le traitement des contrats de location',
    contenuExtrait: 'Le preneur doit comptabiliser un actif lié au droit d\'utilisation et un passif au titre des paiements de loyers. L\'actif est amorti linéairement sur la durée du contrat. Le passif est évalué à la valeur actualisée des paiements futurs. Exception : contrats de courte durée (< 12 mois) et actifs de faible valeur.',
    dateImport: '10/09/2022',
    format: 'PDF',
    tailleFichier: '3.5 MB',
  },
  {
    id: '5',
    titre: 'Abrogation de l\'ancien référentiel comptable OCAM',
    type: 'Circulaire',
    dateEffet: '01/01/2018',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Confirmation de l\'abrogation définitive du référentiel OCAM',
    contenuExtrait: 'À compter du 1er janvier 2018, le référentiel OCAM est définitivement abrogé. Toute entité relevant du droit OHADA doit appliquer le SYSCOHADA Révisé. Les comptes spécifiques OCAM (séries 19x, 47x spéciales) doivent être reclassés.',
    dateImport: '15/01/2018',
    format: 'PDF',
    tailleFichier: '520 KB',
  },
  {
    id: '6',
    titre: 'Adoption du Tableau des Flux de Trésorerie (TFT)',
    type: 'Norme',
    dateEffet: '01/01/2018',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Remplacement du TAFIRE par le TFT dans les états financiers obligatoires',
    contenuExtrait: 'Le TAFIRE (Tableau Financier des Ressources et Emplois) est remplacé par le Tableau des Flux de Trésorerie (TFT), aligné sur IAS 7. Le TFT présente les flux de trésorerie en trois catégories : activités opérationnelles (méthode indirecte), activités d\'investissement et activités de financement. Les comptes TAFIRE (séries 694, etc.) sont supprimés.',
    dateImport: '01/01/2018',
    format: 'PDF',
    tailleFichier: '2.1 MB',
  },
  {
    id: '7',
    titre: 'Norme sur la comptabilisation des subventions',
    type: 'Norme',
    dateEffet: '01/01/2018',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Traitement comptable des subventions d\'investissement et d\'exploitation selon SYSCOHADA Révisé',
    contenuExtrait: 'Les subventions d\'investissement sont inscrites au passif (compte 14) et reprises en résultat au rythme de l\'amortissement des immobilisations financées. Les subventions d\'exploitation sont comptabilisées en produits (compte 71) dès l\'obtention du droit. Les subventions d\'équilibre sont enregistrées en produits HAO (compte 88).',
    dateImport: '15/03/2018',
    format: 'PDF',
    tailleFichier: '1.2 MB',
  },
  {
    id: '8',
    titre: 'Circulaire sur les provisions pour dépréciation des créances',
    type: 'Circulaire',
    dateEffet: '01/01/2020',
    pays: 'Zone OHADA',
    statut: 'En vigueur',
    description: 'Méthodologie de calcul des provisions pour créances douteuses conforme au SYSCOHADA',
    contenuExtrait: 'Les créances douteuses doivent être provisionnées individuellement selon le risque de non-recouvrement. Le montant de la provision est calculé HT pour les entités assujetties à la TVA. Les créances irrécouvrables sont passées en charges après épuisement des voies de recouvrement. La provision est enregistrée au compte 491.',
    dateImport: '10/02/2020',
    format: 'PDF',
    tailleFichier: '980 KB',
  },
]

// === Données demo : Synthèses SYSCOHADA enrichies ===

const demoSyntheses: SyntheseSyscohada[] = [
  // ─── 14 Principes comptables SYSCOHADA ─────────────────────────────────
  {
    id: '1',
    titre: 'Principe de prudence',
    categorie: 'Principes comptables',
    resume: 'Art. 6 Acte Uniforme - La prudence est l\'appréciation raisonnable des faits afin d\'éviter le transfert sur des périodes futures d\'incertitudes présentes susceptibles de grever le patrimoine et le résultat. Conséquences : constater toutes les pertes probables dès qu\'elles sont connues, ne jamais comptabiliser de gains latents, constituer des provisions dès l\'apparition d\'un risque probable même si le montant est estimé. Erreur fréquente : omission de provisions pour litiges ou créances douteuses.',
    documentSource: 'Acte Uniforme OHADA - Art. 6',
    documentSourceId: '1',
    dateGeneration: '20/01/2024',
    genereParIA: false,
  },
  {
    id: '2',
    titre: 'Principe de permanence des méthodes',
    categorie: 'Principes comptables',
    resume: 'Art. 40 Acte Uniforme - La cohérence et la comparabilité des informations comptables imposent la permanence dans l\'application des règles et procédures. Tout changement de méthode comptable doit être justifié par la recherche d\'une meilleure information et mentionné dans les Notes annexes avec l\'impact chiffré sur le résultat et les capitaux propres. Erreur fréquente : changer de méthode d\'amortissement (linéaire ↔ dégressif) sans justification dans les notes.',
    documentSource: 'Acte Uniforme OHADA - Art. 40',
    documentSourceId: '1',
    dateGeneration: '20/01/2024',
    genereParIA: false,
  },
  {
    id: '3',
    titre: 'Principe de continuité d\'exploitation',
    categorie: 'Principes comptables',
    resume: 'Art. 39 Acte Uniforme - L\'entité est présumée poursuivre ses activités dans un avenir prévisible (12 mois minimum). Si la continuité est compromise, les actifs doivent être évalués à leur valeur liquidative. L\'auditeur doit vérifier : capitaux propres > 50% du capital (sinon obligation légale de recapitaliser), absence de cessation de paiement, absence de pertes cumulées supérieures aux réserves. Erreur fréquente : ne pas mentionner l\'incertitude dans les notes quand le ratio capitaux propres/capital est critique.',
    documentSource: 'Acte Uniforme OHADA - Art. 39',
    documentSourceId: '1',
    dateGeneration: '25/01/2024',
    genereParIA: false,
  },
  {
    id: '4',
    titre: 'Principe du coût historique',
    categorie: 'Principes comptables',
    resume: 'Art. 35-36 Acte Uniforme - Les actifs sont enregistrés à leur coût d\'acquisition ou de production à la date d\'entrée dans le patrimoine. Les seules exceptions admises sont : la réévaluation légale (libre ou réglementée, compte 106), la mise en équivalence pour les titres de participation dans les comptes consolidés, et la juste valeur pour certains instruments financiers. Erreur fréquente : réévaluer des actifs sans base légale ou ne pas inscrire l\'écart de réévaluation au compte 106.',
    documentSource: 'Acte Uniforme OHADA - Art. 35-36',
    documentSourceId: '1',
    dateGeneration: '28/01/2024',
    genereParIA: false,
  },
  {
    id: '5',
    titre: 'Principe d\'intangibilité du bilan d\'ouverture',
    categorie: 'Principes comptables',
    resume: 'Art. 34 Acte Uniforme - Le bilan d\'ouverture d\'un exercice doit correspondre exactement au bilan de clôture de l\'exercice précédent. Aucune écriture ne peut modifier rétroactivement les comptes d\'un exercice clôturé. Les corrections d\'erreurs significatives sur exercices antérieurs sont comptabilisées dans le compte 475 (Report à nouveau) avec mention dans les notes annexes. Erreur fréquente : modifier des écritures après clôture définitive au lieu d\'utiliser le compte 475.',
    documentSource: 'Acte Uniforme OHADA - Art. 34',
    documentSourceId: '1',
    dateGeneration: '28/01/2024',
    genereParIA: false,
  },
  {
    id: '6',
    titre: 'Principe de spécialisation des exercices (indépendance)',
    categorie: 'Principes comptables',
    resume: 'Art. 59 Acte Uniforme - Les charges et produits doivent être rattachés à l\'exercice qui les concerne, indépendamment de leur date d\'encaissement ou de paiement. Mécanismes SYSCOHADA : charges constatées d\'avance (476), produits constatés d\'avance (477), charges à payer (408, 428, 438, 448), produits à recevoir (418, 428). L\'application stricte de ce principe est vérifiée par TaxPilot (contrôle EF-005). Erreur fréquente : comptabiliser une facture fournisseur de janvier N+1 relative à une prestation de décembre N directement en charges N+1.',
    documentSource: 'Acte Uniforme OHADA - Art. 59',
    documentSourceId: '1',
    dateGeneration: '30/01/2024',
    genereParIA: false,
  },
  {
    id: '7',
    titre: 'Principe de transparence (régularité et sincérité)',
    categorie: 'Principes comptables',
    resume: 'Art. 8-10 Acte Uniforme - La comptabilité doit être conforme aux règles et procédures en vigueur (régularité) et traduire la connaissance que les responsables ont de la réalité (sincérité). L\'image fidèle est la résultante de l\'application de bonne foi de ces principes. Toute information significative doit figurer dans les Notes annexes. Les engagements hors bilan (cautions, garanties) doivent être mentionnés en Note 30 et suivants.',
    documentSource: 'Acte Uniforme OHADA - Art. 8-10',
    documentSourceId: '1',
    dateGeneration: '01/02/2024',
    genereParIA: false,
  },
  {
    id: '8',
    titre: 'Principe de non-compensation',
    categorie: 'Principes comptables',
    resume: 'Art. 34 Acte Uniforme - Aucune compensation ne peut être opérée entre les postes d\'actif et de passif, ni entre les postes de charges et de produits. Exceptions : soldes réciproques avec un même tiers (à condition qu\'il existe un droit juridique de compensation), et opérations en devises (écarts de conversion actif et passif). Erreur fréquente : compenser des créances et dettes envers le même fournisseur sans convention juridique de netting.',
    documentSource: 'Acte Uniforme OHADA - Art. 34',
    documentSourceId: '1',
    dateGeneration: '01/02/2024',
    genereParIA: false,
  },
  {
    id: '9',
    titre: 'Principe de prééminence de la réalité économique sur l\'apparence juridique',
    categorie: 'Principes comptables',
    resume: 'Art. 35 Acte Uniforme (SYSCOHADA Révisé) - Les opérations sont enregistrées en conformité avec leur nature et leur réalité économique, et non pas seulement selon leur apparence juridique. Application principale : le crédit-bail (location-financement) est comptabilisé à l\'actif du preneur même s\'il n\'en est pas juridiquement propriétaire (comptes 24x). Autre cas : les contrats de concession où les infrastructures sont inscrites au bilan du concédant.',
    documentSource: 'Acte Uniforme OHADA - Art. 35',
    documentSourceId: '1',
    dateGeneration: '03/02/2024',
    genereParIA: false,
  },
  {
    id: '10',
    titre: 'Principe d\'importance significative',
    categorie: 'Principes comptables',
    resume: 'Art. 33 Acte Uniforme - Tout élément susceptible d\'influencer le jugement des utilisateurs des états financiers doit être communiqué. Le seuil de signification est apprécié par l\'entité en fonction de sa taille (en général 1 à 5% du total bilan ou du résultat). Les éléments non significatifs peuvent être regroupés dans les postes « Autres ». Erreur fréquente : ne pas mentionner en notes annexes un changement de méthode ou un événement postérieur significatif.',
    documentSource: 'Acte Uniforme OHADA - Art. 33',
    documentSourceId: '1',
    dateGeneration: '03/02/2024',
    genereParIA: false,
  },

  // ─── États financiers ──────────────────────────────────────────────────
  {
    id: '11',
    titre: 'Système Normal : 4 états financiers obligatoires',
    categorie: 'États financiers',
    resume: 'Art. 26-27 Acte Uniforme - Le Système Normal comprend 4 états financiers annuels formant un tout indissociable : le Bilan (actif et passif selon le format SYSCOHADA), le Compte de Résultat (en liste, avec distinction charges/produits d\'exploitation, financiers et HAO), le Tableau des Flux de Trésorerie (TFT, remplaçant le TAFIRE depuis 2018), et les Notes annexes (34 notes minimum). Le Système Minimal de Trésorerie (SMT) est réservé aux très petites entités (CA < seuil national).',
    documentSource: 'Acte Uniforme OHADA - Art. 26-27',
    documentSourceId: '1',
    dateGeneration: '05/02/2024',
    genereParIA: false,
  },
  {
    id: '12',
    titre: 'Bilan SYSCOHADA : Structure et cohérence des REF codes',
    categorie: 'États financiers',
    resume: 'Pages 981-982 SYSCOHADA Révisé - Le Bilan Actif utilise les REF AE à BZ (7 colonnes : REF, Libellé, Note, Brut, Amort/Dépréc, Net N, Net N-1). Le Bilan Passif utilise les REF CA à DZ (5 colonnes : REF, Libellé, Note, Net N, Net N-1). Contrôles obligatoires : BZ (Total Actif) = DZ (Total Passif), AZ = somme des immobilisations, BK = actif circulant, BT = trésorerie actif. TaxPilot vérifie automatiquement l\'équilibre (contrôle EF-001) et la cohérence des sous-totaux (EF-002 à EF-004).',
    documentSource: 'SYSCOHADA Révisé - Pages 981-982',
    documentSourceId: '1',
    dateGeneration: '10/02/2024',
    genereParIA: false,
  },
  {
    id: '13',
    titre: 'Compte de Résultat SYSCOHADA : Les 4 niveaux de résultat',
    categorie: 'États financiers',
    resume: 'Page 997 SYSCOHADA Révisé - Le Compte de Résultat distingue 4 niveaux de résultat : (1) Résultat d\'exploitation (REF XB, différence activités opérationnelles), (2) Résultat financier (REF XD, charges et produits financiers), (3) Résultat des Activités Ordinaires (XE = XB + XD), (4) Résultat HAO (XG, charges et produits Hors Activités Ordinaires), puis le Résultat Net = XE + XG - Impôts (REF XI). Erreur fréquente : classer des charges courantes en HAO pour embellir le résultat d\'exploitation.',
    documentSource: 'SYSCOHADA Révisé - Page 997',
    documentSourceId: '1',
    dateGeneration: '10/02/2024',
    genereParIA: false,
  },

  // ─── Règles de comptabilisation ────────────────────────────────────────
  {
    id: '14',
    titre: 'Amortissements : méthodes et durées SYSCOHADA',
    categorie: 'Règles de comptabilisation',
    resume: 'Art. 45-46 Acte Uniforme - L\'amortissement est la répartition systématique du montant amortissable sur la durée d\'utilité. Méthodes admises : linéaire (par défaut), dégressif (si admis fiscalement), unités de production (pour les actifs dont l\'utilisation est variable). Durées usuelles : bâtiments 20-40 ans, matériel industriel 5-10 ans, matériel de transport 4-5 ans, mobilier 5-10 ans, logiciels 3-5 ans. L\'amortissement dérogatoire (différence fiscal/comptable) est inscrit au compte 151. Erreur fréquente : ne pas amortir les composants séparément quand ils ont des durées d\'utilité différentes.',
    documentSource: 'Acte Uniforme OHADA - Art. 45-46',
    documentSourceId: '1',
    dateGeneration: '12/02/2024',
    genereParIA: false,
  },
  {
    id: '15',
    titre: 'Provisions : conditions de constitution et catégories',
    categorie: 'Règles de comptabilisation',
    resume: 'Art. 48-49 Acte Uniforme - Une provision est constituée lorsque 3 conditions sont réunies : (1) obligation actuelle résultant d\'un événement passé, (2) sortie probable de ressources, (3) estimation fiable du montant. Catégories : provisions pour risques (compte 19x) - litiges, garanties, amendes ; provisions pour dépréciation (comptes 29x, 39x, 49x) - actifs dont la valeur actuelle est inférieure à la valeur nette comptable ; provisions réglementées (compte 15x) - investissement, hausse des prix. Erreur fréquente : constituer une provision sans obligation avérée (provision de confort).',
    documentSource: 'Acte Uniforme OHADA - Art. 48-49',
    documentSourceId: '1',
    dateGeneration: '12/02/2024',
    genereParIA: false,
  },
  {
    id: '16',
    titre: 'Comptabilisation des contrats de location (crédit-bail)',
    categorie: 'Règles de comptabilisation',
    resume: 'Chapitre 9 SYSCOHADA Révisé (page 610) - Le SYSCOHADA Révisé aligne le traitement sur IFRS 16 : le preneur inscrit à l\'actif un droit d\'utilisation (compte 24x) et au passif un emprunt de location-financement (compte 17x). L\'actif est amorti sur la durée du contrat. Le passif est remboursé selon un tableau d\'amortissement financier. Exception : contrats < 12 mois ou actifs de faible valeur (< 5 millions FCFA). Contrôle TaxPilot : vérification que le compte 24 a une contrepartie en 17.',
    documentSource: 'SYSCOHADA Révisé - Chapitre 9',
    documentSourceId: '1',
    dateGeneration: '15/01/2024',
    genereParIA: false,
  },
  {
    id: '17',
    titre: 'Traitement des écarts de conversion (opérations en devises)',
    categorie: 'Traitements spécifiques',
    resume: 'Chapitre 24 SYSCOHADA Révisé (page 781) - Les créances et dettes en devises sont converties au cours de clôture. Écarts de conversion-Actif (pertes latentes, compte 478) : provisionnés obligatoirement (compte 194). Écarts de conversion-Passif (gains latents, compte 479) : inscrits en produits constatés d\'avance, non imposables. Les écarts doivent figurer séparément au bilan (lignes BU et DV). TaxPilot vérifie que les ECA sont provisionnés (contrôle EF-012).',
    documentSource: 'SYSCOHADA Révisé - Chapitre 24',
    documentSourceId: '1',
    dateGeneration: '22/01/2024',
    genereParIA: false,
  },
  {
    id: '18',
    titre: 'Immobilisations incorporelles - Frais de R&D',
    categorie: 'Règles de comptabilisation',
    resume: 'Chapitre 2 SYSCOHADA Révisé (page 551) - Les frais de recherche sont obligatoirement en charges (comptes 6x). Les frais de développement peuvent être immobilisés (compte 211) si les 6 critères IAS 38 sont satisfaits : faisabilité technique, intention d\'achever, capacité d\'utiliser/vendre, avantages économiques futurs probables, ressources disponibles, évaluation fiable. Durée d\'amortissement : 5 ans maximum. Erreur fréquente : immobiliser des frais de recherche fondamentale.',
    documentSource: 'SYSCOHADA Révisé - Chapitre 2',
    documentSourceId: '1',
    dateGeneration: '28/01/2024',
    genereParIA: true,
  },

  // ─── Erreurs fréquentes ────────────────────────────────────────────────
  {
    id: '19',
    titre: 'TOP 10 des erreurs comptables détectées par TaxPilot',
    categorie: 'Erreurs fréquentes',
    resume: '1. Balance non équilibrée (total débits ≠ crédits) - Contrôle E-001. 2. Comptes non conformes au plan SYSCOHADA - C-001. 3. Comptes de résultat avec solde inversé (charge créditrice ou produit débiteur) - S-003. 4. Écart de conversion-Actif non provisionné - EF-012. 5. Bilan déséquilibré (Actif ≠ Passif) - EF-001. 6. Capitaux propres négatifs sans mention - EF-010. 7. Résultat du bilan ≠ résultat du CdR - EF-007. 8. Absence de comptes d\'amortissement pour les immobilisations - IA-001. 9. TVA collectée sans TVA déductible correspondante - F-003. 10. Charges HAO > 10% du résultat sans justification - EF-015.',
    documentSource: 'TaxPilot - Module Audit',
    documentSourceId: '1',
    dateGeneration: '15/02/2024',
    genereParIA: false,
  },
  {
    id: '20',
    titre: 'Erreurs de classification HAO vs exploitation',
    categorie: 'Erreurs fréquentes',
    resume: 'Art. 60 Acte Uniforme - Les activités HAO (Hors Activités Ordinaires) sont des événements exceptionnels, non récurrents et hors du contrôle de l\'entité (catastrophes naturelles, expropriations, restructurations exceptionnelles). Erreur fréquente : classer en HAO des charges récurrentes (pertes sur créances courantes, moins-values sur cessions courantes). Conséquence : le résultat d\'exploitation est artificiellement amélioré. TaxPilot alerte si les charges HAO (comptes 83x) dépassent 10% du total des charges (contrôle EF-015).',
    documentSource: 'Acte Uniforme OHADA - Art. 60',
    documentSourceId: '1',
    dateGeneration: '15/02/2024',
    genereParIA: false,
  },
  {
    id: '21',
    titre: 'Erreurs sur les comptes de tiers (classe 4)',
    categorie: 'Erreurs fréquentes',
    resume: 'Erreurs les plus fréquentes sur les comptes de tiers : (1) Fournisseurs avec solde débiteur sans avance versée justifiée - vérifier les comptes 409 (avances fournisseurs). (2) Clients avec solde créditeur sans avance reçue justifiée - vérifier les comptes 419 (avances clients). (3) Absence de lettrage entre factures et règlements. (4) TVA déductible non rapprochée des factures fournisseurs. (5) Comptes courants d\'associés (compte 462) avec solde débiteur (interdit dans certaines législations). TaxPilot détecte ces anomalies via les contrôles S-003, IA-002 et IA-003.',
    documentSource: 'SYSCOHADA Révisé - Classe 4',
    documentSourceId: '1',
    dateGeneration: '18/02/2024',
    genereParIA: false,
  },

  // ─── Référentiel SYSCOHADA ─────────────────────────────────────────────
  {
    id: '22',
    titre: 'Fonctionnement des comptes SYSCOHADA',
    categorie: 'Référentiel SYSCOHADA',
    resume: 'Le Titre VII, Chapitre 3 du SYSCOHADA Révisé (pages 277-542, ~265 pages) décrit pour chaque compte les règles précises de fonctionnement : quand le compte est débité, quand il est crédité, les contreparties habituelles, les subdivisions possibles, les exclusions (comptes à ne pas confondre) et les éléments de contrôle. Ces règles constituent la base normative de toute comptabilisation conforme au référentiel OHADA. TaxPilot intègre ces données pour 67 comptes principaux couvrant les 9 classes.',
    documentSource: 'SYSCOHADA Révisé 2017 - Titre VII, Chapitre 3',
    documentSourceId: '1',
    dateGeneration: '13/02/2026',
    genereParIA: false,
  },
  {
    id: '23',
    titre: 'Opérations spécifiques SYSCOHADA - 41 chapitres',
    categorie: 'Référentiel SYSCOHADA',
    resume: 'Le Titre VIII du SYSCOHADA Révisé (pages 543-960) détaille 41 chapitres d\'opérations spécifiques couvrant l\'ensemble des cas comptables : constitution de sociétés, augmentation/réduction de capital, emprunts, subventions, amortissements, cessions d\'immobilisations, crédit-bail, stocks, fournisseurs, clients, personnel, TVA, opérations en devises, opérations HAO, fusions et scissions, contrats à long terme, concessions, dissolution, exploitations agricoles, associations/EBNL et tableau des flux de trésorerie (TFT). Chaque chapitre inclut les écritures types avec les comptes et montants en FCFA.',
    documentSource: 'SYSCOHADA Révisé 2017 - Titre VIII',
    documentSourceId: '1',
    dateGeneration: '13/02/2026',
    genereParIA: false,
  },
  {
    id: '24',
    titre: 'Plan des comptes SYSCOHADA : 9 classes, 1000+ comptes',
    categorie: 'Référentiel SYSCOHADA',
    resume: 'Le plan comptable SYSCOHADA Révisé 2017 comprend plus de 1 000 comptes répartis en 9 classes : Classe 1 (Ressources durables - capitaux propres et emprunts), Classe 2 (Actif immobilisé - incorporel, corporel, financier), Classe 3 (Stocks et encours), Classe 4 (Tiers - fournisseurs, clients, État), Classe 5 (Trésorerie - banques, caisse), Classe 6 (Charges - exploitation, financières, HAO), Classe 7 (Produits - exploitation, financiers, HAO), Classe 8 (Autres charges/produits - engagements, analytique), Classe 9 (Engagements hors bilan et comptabilité analytique). Les comptes 1-5 figurent au bilan, les comptes 6-8 au compte de résultat.',
    documentSource: 'SYSCOHADA Révisé 2017 - Plan des comptes',
    documentSourceId: '1',
    dateGeneration: '13/02/2026',
    genereParIA: false,
  },
]

// === Données demo : Règles de Validation SYSCOHADA ===

const demoRegles: RegleValidation[] = [
  // Principes fondamentaux
  {
    id: '1', code: 'PF-001', libelle: 'Équilibre de la balance générale',
    categorie: 'Principes fondamentaux', severite: 'BLOQUANT',
    articleReference: 'Art. 14 Acte Uniforme OHADA',
    description: 'Le total des débits doit être strictement égal au total des crédits dans la balance générale. Un déséquilibre traduit une erreur de saisie ou un dysfonctionnement.',
    controleAssocie: 'E-001', actif: true,
  },
  {
    id: '2', code: 'PF-002', libelle: 'Conformité des comptes au plan SYSCOHADA',
    categorie: 'Principes fondamentaux', severite: 'MAJEUR',
    articleReference: 'Art. 14 Acte Uniforme OHADA',
    description: 'Chaque numéro de compte utilisé doit exister dans le plan comptable SYSCOHADA Révisé 2017. Les comptes OCAM obsolètes ou les numéros fantaisistes doivent être reclassés.',
    controleAssocie: 'C-001', actif: true,
  },
  {
    id: '3', code: 'PF-003', libelle: 'Classes de comptes valides (1-9)',
    categorie: 'Principes fondamentaux', severite: 'BLOQUANT',
    articleReference: 'Art. 17 Acte Uniforme OHADA',
    description: 'Seules les classes 1 à 9 sont admises dans le plan SYSCOHADA. La classe 0 n\'existe pas. Les comptes commençant par 0 sont rejetés.',
    controleAssocie: 'C-002', actif: true,
  },
  {
    id: '4', code: 'PF-004', libelle: 'Longueur standard des comptes (4-8 chiffres)',
    categorie: 'Principes fondamentaux', severite: 'MINEUR',
    articleReference: 'Art. 18 Acte Uniforme OHADA',
    description: 'Les comptes SYSCOHADA ont 4 chiffres minimum (comptes principaux) et peuvent être subdivisés jusqu\'à 8 chiffres pour le détail analytique.',
    controleAssocie: 'C-003', actif: true,
  },
  {
    id: '5', code: 'PF-005', libelle: 'Détection des comptes OCAM/SYSCOA obsolètes',
    categorie: 'Principes fondamentaux', severite: 'MAJEUR',
    articleReference: 'Circulaire OHADA 2018 - Abrogation OCAM',
    description: 'Les comptes des anciens référentiels (OCAM, SYSCOA pré-révisé) sont détectés : séries 195, 196, 471 spécial, 694 (TAFIRE). Ces comptes doivent être reclassés selon le plan SYSCOHADA Révisé.',
    controleAssocie: 'C-004, C-005', actif: true,
  },

  // Présentation des états financiers
  {
    id: '6', code: 'EF-001', libelle: 'Équilibre du bilan (Actif = Passif)',
    categorie: 'Présentation états financiers', severite: 'BLOQUANT',
    articleReference: 'Art. 29 Acte Uniforme OHADA',
    description: 'Le total de l\'Actif (REF BZ) doit être strictement égal au total du Passif (REF DZ). Un écart, même de 1 FCFA, est une anomalie bloquante qui empêche le dépôt de la liasse.',
    controleAssocie: 'EF-001', actif: true,
  },
  {
    id: '7', code: 'EF-002', libelle: 'Cohérence des sous-totaux du bilan',
    categorie: 'Présentation états financiers', severite: 'MAJEUR',
    articleReference: 'SYSCOHADA Révisé - Pages 981-982',
    description: 'Vérification que AZ = AD + AI + AP + AQ (actif immobilisé), BK = BA + BB + BG (actif circulant), BT = BQ + BR + BS (trésorerie actif), et que BZ = AZ + BK + BT + BU.',
    controleAssocie: 'EF-002', actif: true,
  },
  {
    id: '8', code: 'EF-003', libelle: 'Résultat bilan = Résultat compte de résultat',
    categorie: 'Présentation états financiers', severite: 'BLOQUANT',
    articleReference: 'Art. 30 Acte Uniforme OHADA',
    description: 'Le résultat net au bilan (REF CJ passif) doit être identique au résultat net du compte de résultat (REF XI). Un écart traduit une incohérence entre les deux états.',
    controleAssocie: 'EF-007', actif: true,
  },
  {
    id: '9', code: 'EF-004', libelle: 'Capitaux propres > 50% du capital social',
    categorie: 'Présentation états financiers', severite: 'MAJEUR',
    articleReference: 'Art. 664 Acte Uniforme Sociétés',
    description: 'Si les capitaux propres (CP) deviennent inférieurs à la moitié du capital social (CA), l\'assemblée générale doit être convoquée dans les 4 mois pour décider la dissolution anticipée ou la recapitalisation. Cette situation doit être mentionnée dans les Notes annexes.',
    controleAssocie: 'EF-010', actif: true,
  },

  // Évaluation & comptabilisation
  {
    id: '10', code: 'EC-001', libelle: 'Sens normal des soldes comptables',
    categorie: 'Évaluation & comptabilisation', severite: 'MAJEUR',
    articleReference: 'Art. 17-18 Acte Uniforme OHADA',
    description: 'Les comptes d\'actif (classes 2, 3, 5) et de charges (classe 6) sont normalement débiteurs. Les comptes de passif (classe 1, 4 partiel) et de produits (classe 7) sont normalement créditeurs. Un solde inversé est une alerte (sauf cas justifiés : avances fournisseurs 409, avances clients 419).',
    controleAssocie: 'S-003', actif: true,
  },
  {
    id: '11', code: 'EC-002', libelle: 'Provision obligatoire sur écarts de conversion-Actif',
    categorie: 'Évaluation & comptabilisation', severite: 'MAJEUR',
    articleReference: 'Art. 54-55 Acte Uniforme OHADA',
    description: 'Les écarts de conversion-Actif (pertes latentes sur créances/dettes en devises, compte 478) doivent obligatoirement faire l\'objet d\'une provision pour risques (compte 194). L\'absence de provision constitue un manquement au principe de prudence.',
    controleAssocie: 'EF-012', actif: true,
  },
  {
    id: '12', code: 'EC-003', libelle: 'Intangibilité du bilan d\'ouverture',
    categorie: 'Évaluation & comptabilisation', severite: 'BLOQUANT',
    articleReference: 'Art. 34 Acte Uniforme OHADA',
    description: 'Les soldes d\'ouverture de l\'exercice N doivent correspondre exactement aux soldes de clôture N-1. Un écart signifie une modification rétroactive interdite ou une erreur de reprise des à-nouveaux.',
    controleAssocie: 'YOY-001', actif: true,
  },

  // Amortissements & provisions
  {
    id: '13', code: 'AP-001', libelle: 'Immobilisations amortissables avec dotation',
    categorie: 'Amortissements & provisions', severite: 'MAJEUR',
    articleReference: 'Art. 45 Acte Uniforme OHADA',
    description: 'Toute immobilisation amortissable (comptes 21x-24x, hors terrains 22x) doit avoir un compte d\'amortissement correspondant (28x) avec des dotations annuelles. L\'absence d\'amortissement sur un exercice complet est une anomalie.',
    controleAssocie: 'IA-001', actif: true,
  },
  {
    id: '14', code: 'AP-002', libelle: 'Amortissements cumulés ≤ valeur brute',
    categorie: 'Amortissements & provisions', severite: 'BLOQUANT',
    articleReference: 'Art. 46 Acte Uniforme OHADA',
    description: 'Le cumul des amortissements (comptes 28x) ne peut jamais dépasser la valeur brute de l\'immobilisation correspondante (comptes 2x). Un excès signifie une erreur de calcul ou une immobilisation sortie mais non dé-comptabilisée.',
    controleAssocie: 'IA-003', actif: true,
  },

  // Opérations spécifiques
  {
    id: '15', code: 'OS-001', libelle: 'Crédit-bail : cohérence actif 24 / passif 17',
    categorie: 'Opérations spécifiques', severite: 'MAJEUR',
    articleReference: 'SYSCOHADA Révisé - Chapitre 9 (p. 610)',
    description: 'Lorsqu\'un compte 24x (matériel en crédit-bail) existe à l\'actif, un compte 17x (emprunts de location-financement) correspondant doit exister au passif. L\'absence de l\'un des deux comptes traduit un déséquilibre.',
    controleAssocie: 'IA-005', actif: true,
  },
  {
    id: '16', code: 'OS-002', libelle: 'Charges HAO < 10% du total charges',
    categorie: 'Opérations spécifiques', severite: 'MINEUR',
    articleReference: 'Art. 60 Acte Uniforme OHADA',
    description: 'Les charges HAO (comptes 83x) ne doivent pas dépasser 10% du total des charges. Un pourcentage élevé suggère un mauvais classement de charges ordinaires en HAO, ce qui fausse le résultat d\'exploitation.',
    controleAssocie: 'EF-015', actif: true,
  },
  {
    id: '17', code: 'OS-003', libelle: 'Cohérence TVA collectée / TVA déductible',
    categorie: 'Opérations spécifiques', severite: 'MINEUR',
    articleReference: 'Art. 56 Acte Uniforme OHADA',
    description: 'Si un compte de TVA collectée (4431-4435) existe, un compte de TVA déductible (4451-4456) devrait aussi exister, et inversement. L\'absence de l\'un des deux peut indiquer une omission de déclaration.',
    controleAssocie: 'F-003', actif: true,
  },

  // Contrôles de cohérence
  {
    id: '18', code: 'CC-001', libelle: 'Variation N/N-1 cohérente (<30%)',
    categorie: 'Contrôles de cohérence', severite: 'MINEUR',
    articleReference: 'Art. 33 Acte Uniforme OHADA - Importance significative',
    description: 'Les variations significatives (>30%) entre N et N-1 sur les postes principaux du bilan et du compte de résultat doivent être justifiées dans les Notes annexes. TaxPilot identifie automatiquement ces variations pour alerter le comptable.',
    controleAssocie: 'YOY-002', actif: true,
  },
  {
    id: '19', code: 'CC-002', libelle: 'Fonds de roulement positif recommandé',
    categorie: 'Contrôles de cohérence', severite: 'INFO',
    articleReference: 'SYSCOHADA Révisé - Page 977',
    description: 'Le Fonds de Roulement (FR = Ressources stables - Actif immobilisé net) devrait être positif, indiquant que les ressources longues financent les emplois longs avec un excédent. Un FR négatif est un signal d\'alerte sur la structure financière.',
    controleAssocie: 'EF-009', actif: true,
  },
  {
    id: '20', code: 'CC-003', libelle: 'Trésorerie nette = FR - BFG',
    categorie: 'Contrôles de cohérence', severite: 'MAJEUR',
    articleReference: 'SYSCOHADA Révisé - Page 977',
    description: 'La Trésorerie Nette (TN = BT - DT) doit être égale à FR - BFG (Fonds de Roulement moins Besoin de Financement Global). Un écart traduit une incohérence dans les grands équilibres financiers.',
    controleAssocie: 'EF-011', actif: true,
  },

  // Obligations fiscales
  {
    id: '21', code: 'OF-001', libelle: 'Présence des notes annexes obligatoires',
    categorie: 'Obligations fiscales', severite: 'MAJEUR',
    articleReference: 'Art. 27 & 31 Acte Uniforme OHADA',
    description: 'Le Système Normal exige 34 notes annexes minimum : Note 1 (Méthodes comptables), Notes 2-15 (détails du bilan), Notes 16-19 (dettes), Notes 20-30 (compte de résultat), et notes complémentaires. L\'absence de notes constitue un manquement.',
    controleAssocie: 'EF-018', actif: true,
  },
  {
    id: '22', code: 'OF-002', libelle: 'Concordance résultat comptable / résultat fiscal',
    categorie: 'Obligations fiscales', severite: 'MAJEUR',
    articleReference: 'Codes des impôts OHADA',
    description: 'Le résultat fiscal est obtenu en réintégrant les charges non déductibles et en déduisant les produits non imposables. Le passage du résultat comptable (REF XI) au résultat fiscal doit être documenté dans le tableau de détermination du résultat fiscal.',
    controleAssocie: 'F-001', actif: true,
  },
  {
    id: '23', code: 'OF-003', libelle: 'Dépôt dans les délais légaux',
    categorie: 'Obligations fiscales', severite: 'INFO',
    articleReference: 'Codes des impôts nationaux',
    description: 'La liasse fiscale doit être déposée dans les délais légaux du pays (généralement 30 avril N+1 pour les exercices clos au 31/12). TaxPilot affiche un compte à rebours dans le calendrier fiscal.',
    controleAssocie: '-', actif: true,
  },
]

// === Options de filtres ===

const paysOptions = ['Cameroun', 'Côte d\'Ivoire', 'Sénégal', 'Gabon', 'Congo', 'Mali', 'Zone OHADA']
const anneeOptions = [2024, 2023, 2022, 2021, 2020]
const thematiqueOptions = ['Fiscalité des entreprises', 'TVA', 'Impôt sur les sociétés', 'Droits de douane']
const typeEvolutionOptions = ['Norme', 'Circulaire', 'Modification plan']
const categorieOptions = ['Principes comptables', 'Règles de comptabilisation', 'Traitements spécifiques', 'Référentiel SYSCOHADA', 'États financiers', 'Erreurs fréquentes']
const categorieReglesOptions = ['Principes fondamentaux', 'Présentation états financiers', 'Évaluation & comptabilisation', 'Amortissements & provisions', 'Opérations spécifiques', 'Contrôles de cohérence', 'Obligations fiscales']
const severiteOptions = ['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO']

// === Composant principal ===

const DocumentationJuridique: React.FC = () => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)

  // --- State Lois de Finances ---
  const [loisFinances, setLoisFinances] = useState<DocumentJuridique[]>(demoLoisFinances)
  const [loisPage, setLoisPage] = useState(0)
  const [loisRowsPerPage, setLoisRowsPerPage] = useState(5)
  const [loisFiltrePays, setLoisFiltrePays] = useState('')
  const [loisFiltreAnnee, setLoisFiltreAnnee] = useState<number | ''>('')
  const [loisFiltreThematique, setLoisFiltreThematique] = useState('')
  const [loisRecherche, setLoisRecherche] = useState('')

  // --- State Évolutions ---
  const [evolutions, setEvolutions] = useState<EvolutionSyscohada[]>(demoEvolutions)
  const [evoPage, setEvoPage] = useState(0)
  const [evoRowsPerPage, setEvoRowsPerPage] = useState(5)
  const [evoFiltreType, setEvoFiltreType] = useState('')
  const [evoFiltrePays, setEvoFiltrePays] = useState('')
  const [evoFiltreAnnee, setEvoFiltreAnnee] = useState<number | ''>('')
  const [evoRecherche, setEvoRecherche] = useState('')

  // --- State Synthèses ---
  const [syntheses] = useState<SyntheseSyscohada[]>(demoSyntheses)
  const [synthPage, setSynthPage] = useState(0)
  const [synthRowsPerPage, setSynthRowsPerPage] = useState(6)
  const [synthFiltreCategorie, setSynthFiltreCategorie] = useState('')
  const [synthRecherche, setSynthRecherche] = useState('')

  // --- State Règles ---
  const [regles, setRegles] = useState<RegleValidation[]>(demoRegles)
  const [reglesPage, setReglesPage] = useState(0)
  const [reglesRowsPerPage, setReglesRowsPerPage] = useState(10)
  const [reglesFiltreCategorie, setReglesFiltreCategorie] = useState('')
  const [reglesFiltreSeverite, setReglesFiltreSeverite] = useState('')
  const [reglesRecherche, setReglesRecherche] = useState('')

  // --- Dialogs ---
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importDialogType, setImportDialogType] = useState<'loi' | 'evolution'>('loi')
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<{ titre: string; contenu: string } | null>(null)
  const [regleDetailOpen, setRegleDetailOpen] = useState(false)
  const [regleDetail, setRegleDetail] = useState<RegleValidation | null>(null)

  // --- Import form state ---
  const [importTitre, setImportTitre] = useState('')
  const [importPays, setImportPays] = useState('')
  const [importAnnee, setImportAnnee] = useState<number | ''>(2024)
  const [importThematique, setImportThematique] = useState('')
  const [importType, setImportType] = useState('')
  const [importFiles, setImportFiles] = useState<File[]>([])

  // === Filtrage Lois de Finances ===
  const loisFiltrees = useMemo(() => {
    return loisFinances.filter((doc) => {
      if (loisFiltrePays && doc.pays !== loisFiltrePays) return false
      if (loisFiltreAnnee && doc.annee !== loisFiltreAnnee) return false
      if (loisFiltreThematique && doc.thematique !== loisFiltreThematique) return false
      if (loisRecherche) {
        const search = loisRecherche.toLowerCase()
        return doc.titre.toLowerCase().includes(search) || doc.description?.toLowerCase().includes(search)
      }
      return true
    })
  }, [loisFinances, loisFiltrePays, loisFiltreAnnee, loisFiltreThematique, loisRecherche])

  // === Filtrage Évolutions ===
  const evolutionsFiltrees = useMemo(() => {
    return evolutions.filter((evo) => {
      if (evoFiltreType && evo.type !== evoFiltreType) return false
      if (evoFiltrePays && evo.pays !== evoFiltrePays) return false
      if (evoFiltreAnnee) {
        const anneeEffet = parseInt(evo.dateEffet.split('/')[2])
        if (anneeEffet !== evoFiltreAnnee) return false
      }
      if (evoRecherche) {
        const search = evoRecherche.toLowerCase()
        return evo.titre.toLowerCase().includes(search) || evo.description?.toLowerCase().includes(search)
      }
      return true
    })
  }, [evolutions, evoFiltreType, evoFiltrePays, evoFiltreAnnee, evoRecherche])

  // === Filtrage Synthèses ===
  const synthesesFiltrees = useMemo(() => {
    return syntheses.filter((synth) => {
      if (synthFiltreCategorie && synth.categorie !== synthFiltreCategorie) return false
      if (synthRecherche) {
        const search = synthRecherche.toLowerCase()
        return synth.titre.toLowerCase().includes(search) || synth.resume.toLowerCase().includes(search)
      }
      return true
    })
  }, [syntheses, synthFiltreCategorie, synthRecherche])

  // === Filtrage Règles ===
  const reglesFiltrees = useMemo(() => {
    return regles.filter((r) => {
      if (reglesFiltreCategorie && r.categorie !== reglesFiltreCategorie) return false
      if (reglesFiltreSeverite && r.severite !== reglesFiltreSeverite) return false
      if (reglesRecherche) {
        const search = reglesRecherche.toLowerCase()
        return r.libelle.toLowerCase().includes(search) || r.description.toLowerCase().includes(search) || r.articleReference.toLowerCase().includes(search)
      }
      return true
    })
  }, [regles, reglesFiltreCategorie, reglesFiltreSeverite, reglesRecherche])

  // === Stats Règles ===
  const reglesStats = useMemo(() => {
    const actives = regles.filter(r => r.actif).length
    const bloquants = regles.filter(r => r.severite === 'BLOQUANT').length
    const majeurs = regles.filter(r => r.severite === 'MAJEUR').length
    return { total: regles.length, actives, bloquants, majeurs }
  }, [regles])

  // === Dropzone ===
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImportFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  })

  // === Handlers ===
  const openImportDialog = (type: 'loi' | 'evolution') => {
    setImportDialogType(type)
    setImportTitre('')
    setImportPays('')
    setImportAnnee(2024)
    setImportThematique('')
    setImportType('')
    setImportFiles([])
    setImportDialogOpen(true)
  }

  const handleImport = () => {
    if (!importFiles.length || !importTitre) return

    const file = importFiles[0]
    const format = file.name.endsWith('.pdf') ? 'PDF' : 'Word'
    const taille = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`

    if (importDialogType === 'loi') {
      const newDoc: DocumentJuridique = {
        id: String(Date.now()),
        titre: importTitre,
        pays: importPays || 'Non spécifié',
        annee: importAnnee || 2024,
        thematique: importThematique || 'Non spécifié',
        format: format as 'PDF' | 'Word',
        dateImport: new Date().toLocaleDateString('fr-FR'),
        tailleFichier: taille,
        description: importTitre,
        contenuExtrait: 'Contenu extrait du document importé...',
      }
      setLoisFinances((prev) => [newDoc, ...prev])
    } else {
      const newEvo: EvolutionSyscohada = {
        id: String(Date.now()),
        titre: importTitre,
        type: (importType || 'Norme') as EvolutionSyscohada['type'],
        dateEffet: `01/01/${importAnnee || 2024}`,
        pays: importPays || 'Zone OHADA',
        statut: 'En attente',
        description: importTitre,
        contenuExtrait: 'Contenu extrait du document importé...',
        dateImport: new Date().toLocaleDateString('fr-FR'),
        format: format as 'PDF' | 'Word',
        tailleFichier: taille,
      }
      setEvolutions((prev) => [newEvo, ...prev])
    }

    setImportDialogOpen(false)
  }

  const handlePreview = (titre: string, contenu?: string) => {
    setPreviewDocument({ titre, contenu: contenu || 'Aperçu non disponible pour ce document.' })
    setPreviewDialogOpen(true)
  }

  const handleDeleteLoi = (id: string) => {
    setLoisFinances((prev) => prev.filter((d) => d.id !== id))
  }

  const handleDeleteEvolution = (id: string) => {
    setEvolutions((prev) => prev.filter((e) => e.id !== id))
  }

  const handleToggleRegle = (id: string) => {
    setRegles((prev) => prev.map((r) => r.id === id ? { ...r, actif: !r.actif } : r))
  }

  const getFormatIcon = (format: string) => {
    if (format === 'PDF') return <PictureAsPdf color="error" fontSize="small" />
    if (format === 'Word') return <Description color="primary" fontSize="small" />
    return <InsertDriveFile fontSize="small" />
  }

  const getStatutColor = (statut: string): 'success' | 'warning' | 'default' => {
    if (statut === 'En vigueur') return 'success'
    if (statut === 'En attente') return 'warning'
    return 'default'
  }

  const getSeveriteIcon = (severite: string) => {
    switch (severite) {
      case 'BLOQUANT': return <Block fontSize="small" />
      case 'MAJEUR': return <ErrorIcon fontSize="small" />
      case 'MINEUR': return <Warning fontSize="small" />
      default: return <Info fontSize="small" />
    }
  }

  const getSeveriteColor = (severite: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severite) {
      case 'BLOQUANT': return 'error'
      case 'MAJEUR': return 'warning'
      case 'MINEUR': return 'info'
      default: return 'default'
    }
  }

  // === Chips de filtres actifs (Lois) ===
  const loisActiveFilters = useMemo(() => {
    const filters: { label: string; onClear: () => void }[] = []
    if (loisFiltrePays) filters.push({ label: `Pays: ${loisFiltrePays}`, onClear: () => setLoisFiltrePays('') })
    if (loisFiltreAnnee) filters.push({ label: `Année: ${loisFiltreAnnee}`, onClear: () => setLoisFiltreAnnee('') })
    if (loisFiltreThematique) filters.push({ label: `Thème: ${loisFiltreThematique}`, onClear: () => setLoisFiltreThematique('') })
    return filters
  }, [loisFiltrePays, loisFiltreAnnee, loisFiltreThematique])

  // === Chips de filtres actifs (Évolutions) ===
  const evoActiveFilters = useMemo(() => {
    const filters: { label: string; onClear: () => void }[] = []
    if (evoFiltreType) filters.push({ label: `Type: ${evoFiltreType}`, onClear: () => setEvoFiltreType('') })
    if (evoFiltrePays) filters.push({ label: `Pays: ${evoFiltrePays}`, onClear: () => setEvoFiltrePays('') })
    if (evoFiltreAnnee) filters.push({ label: `Année: ${evoFiltreAnnee}`, onClear: () => setEvoFiltreAnnee('') })
    return filters
  }, [evoFiltreType, evoFiltrePays, evoFiltreAnnee])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Documentation Juridique SYSCOHADA
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Base de connaissances réglementaire : lois de finances, normes SYSCOHADA, synthèses des principes comptables et règles de contrôle automatisées
      </Typography>

      {/* Sous-onglets */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Lois de Finances" icon={<Gavel />} iconPosition="start" />
            <Tab label="Évolutions SYSCOHADA" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Synthèse SYSCOHADA" icon={<AutoAwesome />} iconPosition="start" />
            <Tab label="Règles & Contrôles" icon={<Shield />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* ============================== */}
        {/* Sous-onglet 1 : Lois de Finances */}
        {/* ============================== */}
        <TabPanel value={activeTab} index={0}>
          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<CloudUpload />} onClick={() => openImportDialog('loi')}>
              Importer un document
            </Button>
          </Stack>

          {/* Filtres */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={loisRecherche}
              onChange={(e) => { setLoisRecherche(e.target.value); setLoisPage(0) }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Pays</InputLabel>
              <Select value={loisFiltrePays} label="Pays" onChange={(e) => { setLoisFiltrePays(e.target.value); setLoisPage(0) }}>
                <MenuItem value="">Tous</MenuItem>
                {paysOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Année</InputLabel>
              <Select value={loisFiltreAnnee} label="Année" onChange={(e) => { setLoisFiltreAnnee(e.target.value as number | ''); setLoisPage(0) }}>
                <MenuItem value="">Toutes</MenuItem>
                {anneeOptions.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Thématique</InputLabel>
              <Select value={loisFiltreThematique} label="Thématique" onChange={(e) => { setLoisFiltreThematique(e.target.value); setLoisPage(0) }}>
                <MenuItem value="">Toutes</MenuItem>
                {thematiqueOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {/* Chips filtres actifs */}
          {loisActiveFilters.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {loisActiveFilters.map((f) => (
                <Chip key={f.label} label={f.label} size="small" onDelete={f.onClear} />
              ))}
            </Stack>
          )}

          {/* Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Pays</TableCell>
                  <TableCell>Année</TableCell>
                  <TableCell>Thématique</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Date import</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loisFiltrees
                  .slice(loisPage * loisRowsPerPage, loisPage * loisRowsPerPage + loisRowsPerPage)
                  .map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{doc.titre}</Typography>
                      </TableCell>
                      <TableCell>{doc.pays}</TableCell>
                      <TableCell>{doc.annee}</TableCell>
                      <TableCell><Chip label={doc.thematique} size="small" /></TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {getFormatIcon(doc.format)}
                          <Typography variant="body2">{doc.format}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{doc.dateImport}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Consulter">
                            <IconButton size="small" onClick={() => handlePreview(doc.titre, doc.contenuExtrait)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger">
                            <IconButton size="small">
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={() => handleDeleteLoi(doc.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {loisFiltrees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Aucun document trouvé</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={loisFiltrees.length}
              page={loisPage}
              onPageChange={(_, p) => setLoisPage(p)}
              rowsPerPage={loisRowsPerPage}
              onRowsPerPageChange={(e) => { setLoisRowsPerPage(parseInt(e.target.value, 10)); setLoisPage(0) }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </TableContainer>
        </TabPanel>

        {/* ============================== */}
        {/* Sous-onglet 2 : Évolutions SYSCOHADA */}
        {/* ============================== */}
        <TabPanel value={activeTab} index={1}>
          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<CloudUpload />} onClick={() => openImportDialog('evolution')}>
              Importer un document
            </Button>
          </Stack>

          {/* Filtres */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={evoRecherche}
              onChange={(e) => { setEvoRecherche(e.target.value); setEvoPage(0) }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Type de modification</InputLabel>
              <Select value={evoFiltreType} label="Type de modification" onChange={(e) => { setEvoFiltreType(e.target.value); setEvoPage(0) }}>
                <MenuItem value="">Tous</MenuItem>
                {typeEvolutionOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Pays</InputLabel>
              <Select value={evoFiltrePays} label="Pays" onChange={(e) => { setEvoFiltrePays(e.target.value); setEvoPage(0) }}>
                <MenuItem value="">Tous</MenuItem>
                {paysOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Année</InputLabel>
              <Select value={evoFiltreAnnee} label="Année" onChange={(e) => { setEvoFiltreAnnee(e.target.value as number | ''); setEvoPage(0) }}>
                <MenuItem value="">Toutes</MenuItem>
                {anneeOptions.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {/* Chips filtres actifs */}
          {evoActiveFilters.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {evoActiveFilters.map((f) => (
                <Chip key={f.label} label={f.label} size="small" onDelete={f.onClear} />
              ))}
            </Stack>
          )}

          {/* Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date d'effet</TableCell>
                  <TableCell>Pays</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evolutionsFiltrees
                  .slice(evoPage * evoRowsPerPage, evoPage * evoRowsPerPage + evoRowsPerPage)
                  .map((evo) => (
                    <TableRow key={evo.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{evo.titre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={evo.type}
                          size="small"
                          color={evo.type === 'Norme' ? 'primary' : evo.type === 'Circulaire' ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{evo.dateEffet}</TableCell>
                      <TableCell>{evo.pays}</TableCell>
                      <TableCell>
                        <Chip label={evo.statut} size="small" color={getStatutColor(evo.statut)} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Consulter">
                            <IconButton size="small" onClick={() => handlePreview(evo.titre, evo.contenuExtrait)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger">
                            <IconButton size="small">
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={() => handleDeleteEvolution(evo.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {evolutionsFiltrees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Aucune évolution trouvée</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={evolutionsFiltrees.length}
              page={evoPage}
              onPageChange={(_, p) => setEvoPage(p)}
              rowsPerPage={evoRowsPerPage}
              onRowsPerPageChange={(e) => { setEvoRowsPerPage(parseInt(e.target.value, 10)); setEvoPage(0) }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </TableContainer>
        </TabPanel>

        {/* ============================== */}
        {/* Sous-onglet 3 : Synthèse SYSCOHADA */}
        {/* ============================== */}
        <TabPanel value={activeTab} index={2}>
          {/* Stats */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            {categorieOptions.map((cat) => {
              const count = syntheses.filter(s => s.categorie === cat).length
              if (count === 0) return null
              return (
                <Chip
                  key={cat}
                  label={`${cat} (${count})`}
                  size="small"
                  variant={synthFiltreCategorie === cat ? 'filled' : 'outlined'}
                  color={synthFiltreCategorie === cat ? 'primary' : 'default'}
                  onClick={() => { setSynthFiltreCategorie(synthFiltreCategorie === cat ? '' : cat); setSynthPage(0) }}
                  onDelete={synthFiltreCategorie === cat ? () => setSynthFiltreCategorie('') : undefined}
                />
              )
            })}
          </Stack>

          {/* Filtres */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Rechercher dans les synthèses..."
              value={synthRecherche}
              onChange={(e) => { setSynthRecherche(e.target.value); setSynthPage(0) }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ minWidth: 300 }}
            />
          </Stack>

          {/* Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {synthesesFiltrees
              .slice(synthPage * synthRowsPerPage, synthPage * synthRowsPerPage + synthRowsPerPage)
              .map((synth) => (
                <Card key={synth.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {synth.titre}
                      </Typography>
                      {synth.genereParIA && (
                        <Chip
                          icon={<AutoAwesome />}
                          label="Extrait par IA"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      )}
                    </Stack>
                    <Chip label={synth.categorie} size="small" sx={{ mb: 1.5 }} color={
                      synth.categorie === 'Principes comptables' ? 'primary' :
                      synth.categorie === 'Erreurs fréquentes' ? 'error' :
                      synth.categorie === 'États financiers' ? 'info' :
                      'default'
                    } variant="outlined" />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {synth.resume}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Source : {synth.documentSource} &bull; {synth.dateGeneration}
                      </Typography>
                      <Tooltip title="Voir le document source">
                        <IconButton size="small" onClick={() => handlePreview(synth.documentSource, synth.resume)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
          </Box>

          {synthesesFiltrees.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Aucune synthèse trouvée</Typography>
            </Box>
          )}

          {synthesesFiltrees.length > 0 && (
            <TablePagination
              component="div"
              count={synthesesFiltrees.length}
              page={synthPage}
              onPageChange={(_, p) => setSynthPage(p)}
              rowsPerPage={synthRowsPerPage}
              onRowsPerPageChange={(e) => { setSynthRowsPerPage(parseInt(e.target.value, 10)); setSynthPage(0) }}
              rowsPerPageOptions={[6, 12, 24]}
              labelRowsPerPage="Cartes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          )}
        </TabPanel>

        {/* ============================== */}
        {/* Sous-onglet 4 : Règles & Contrôles SYSCOHADA */}
        {/* ============================== */}
        <TabPanel value={activeTab} index={3}>
          {/* En-tête avec stats */}
          <Alert severity="info" sx={{ mb: 3 }} icon={<Shield />}>
            <Typography variant="body2">
              TaxPilot applique <strong>{reglesStats.total} règles de validation</strong> basées sur l'Acte Uniforme OHADA et le SYSCOHADA Révisé 2017.
              Dont <strong>{reglesStats.bloquants} bloquantes</strong> et <strong>{reglesStats.majeurs} majeures</strong>.
              Chaque règle est liée à un article officiel. Vous pouvez activer/désactiver les contrôles non bloquants.
            </Typography>
          </Alert>

          {/* Stats cards */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            <Card elevation={0} sx={{ flex: 1, minWidth: 150, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">Total règles</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{reglesStats.total}</Typography>
              </CardContent>
            </Card>
            <Card elevation={0} sx={{ flex: 1, minWidth: 150, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.success.main, 0.04) }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">Actives</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{reglesStats.actives}</Typography>
              </CardContent>
            </Card>
            <Card elevation={0} sx={{ flex: 1, minWidth: 150, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.error.main, 0.04) }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">Bloquantes</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{reglesStats.bloquants}</Typography>
              </CardContent>
            </Card>
            <Card elevation={0} sx={{ flex: 1, minWidth: 150, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">Majeures</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>{reglesStats.majeurs}</Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Filtres */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Rechercher une règle, un article..."
              value={reglesRecherche}
              onChange={(e) => { setReglesRecherche(e.target.value); setReglesPage(0) }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ minWidth: 280 }}
            />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select value={reglesFiltreCategorie} label="Catégorie" onChange={(e) => { setReglesFiltreCategorie(e.target.value); setReglesPage(0) }}>
                <MenuItem value="">Toutes</MenuItem>
                {categorieReglesOptions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sévérité</InputLabel>
              <Select value={reglesFiltreSeverite} label="Sévérité" onChange={(e) => { setReglesFiltreSeverite(e.target.value); setReglesPage(0) }}>
                <MenuItem value="">Toutes</MenuItem>
                {severiteOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {/* Chips filtres actifs */}
          {(reglesFiltreCategorie || reglesFiltreSeverite) && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {reglesFiltreCategorie && <Chip label={`Catégorie: ${reglesFiltreCategorie}`} size="small" onDelete={() => setReglesFiltreCategorie('')} />}
              {reglesFiltreSeverite && <Chip label={`Sévérité: ${reglesFiltreSeverite}`} size="small" onDelete={() => setReglesFiltreSeverite('')} />}
            </Stack>
          )}

          {/* Table des règles */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 600, width: 80 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Règle de contrôle</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 200 }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 110 }}>Sévérité</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 220 }}>Article SYSCOHADA</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 90 }} align="center">Contrôle</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Actif</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 50 }} align="center">Détail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reglesFiltrees
                  .slice(reglesPage * reglesRowsPerPage, reglesPage * reglesRowsPerPage + reglesRowsPerPage)
                  .map((regle) => (
                    <TableRow
                      key={regle.id}
                      hover
                      sx={{
                        opacity: regle.actif ? 1 : 0.5,
                        bgcolor: regle.severite === 'BLOQUANT' ? alpha(theme.palette.error.main, 0.02) : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {regle.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={regle.description} arrow placement="top-start">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {regle.libelle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {regle.description}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip label={regle.categorie} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getSeveriteIcon(regle.severite)}
                          label={regle.severite}
                          size="small"
                          color={getSeveriteColor(regle.severite)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                          {regle.articleReference}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {regle.controleAssocie && regle.controleAssocie !== '-' && (
                          <Chip
                            icon={<VerifiedUser />}
                            label={regle.controleAssocie}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={regle.actif}
                          onChange={() => handleToggleRegle(regle.id)}
                          disabled={regle.severite === 'BLOQUANT'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Voir le détail">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => { setRegleDetail(regle); setRegleDetailOpen(true) }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {reglesFiltrees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Aucune règle trouvée</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={reglesFiltrees.length}
              page={reglesPage}
              onPageChange={(_, p) => setReglesPage(p)}
              rowsPerPage={reglesRowsPerPage}
              onRowsPerPageChange={(e) => { setReglesRowsPerPage(parseInt(e.target.value, 10)); setReglesPage(0) }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Règles par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </TableContainer>

          {/* Note explicative */}
          <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
            <Typography variant="body2">
              Les règles <strong>BLOQUANTES</strong> ne peuvent pas être désactivées car elles correspondent à des obligations légales de l'Acte Uniforme OHADA.
              Les contrôles MAJEUR, MINEUR et INFO peuvent être désactivés selon les besoins de l'entreprise.
            </Typography>
          </Alert>
        </TabPanel>
      </Paper>

      {/* ============================== */}
      {/* Dialog d'import */}
      {/* ============================== */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {importDialogType === 'loi' ? 'Importer une Loi de Finances' : 'Importer une Évolution SYSCOHADA'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Zone de drag-and-drop */}
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                bgcolor: isDragActive ? 'action.hover' : 'background.default',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier PDF ou Word'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formats acceptés : PDF, DOC, DOCX (max 50 MB)
              </Typography>
            </Paper>

            {/* Fichier sélectionné */}
            {importFiles.length > 0 && (
              <Alert severity="success" icon={<InsertDriveFile />}>
                {importFiles[0].name} ({(importFiles[0].size / (1024 * 1024)).toFixed(1)} MB)
              </Alert>
            )}

            <TextField
              fullWidth
              label="Titre du document"
              value={importTitre}
              onChange={(e) => setImportTitre(e.target.value)}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Pays</InputLabel>
              <Select value={importPays} label="Pays" onChange={(e) => setImportPays(e.target.value)}>
                {paysOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Année</InputLabel>
              <Select value={importAnnee} label="Année" onChange={(e) => setImportAnnee(e.target.value as number)}>
                {anneeOptions.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>

            {importDialogType === 'loi' ? (
              <FormControl fullWidth>
                <InputLabel>Thématique</InputLabel>
                <Select value={importThematique} label="Thématique" onChange={(e) => setImportThematique(e.target.value)}>
                  {thematiqueOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Type de modification</InputLabel>
                <Select value={importType} label="Type de modification" onChange={(e) => setImportType(e.target.value)}>
                  {typeEvolutionOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleImport}
            disabled={!importFiles.length || !importTitre}
          >
            Importer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================== */}
      {/* Dialog d'aperçu */}
      {/* ============================== */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{previewDocument?.titre}</Typography>
            <IconButton onClick={() => setPreviewDialogOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {previewDocument?.contenu}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Fermer</Button>
          <Button variant="outlined" startIcon={<Download />}>
            Télécharger le document complet
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================== */}
      {/* Dialog détail d'une règle */}
      {/* ============================== */}
      <Dialog open={regleDetailOpen} onClose={() => setRegleDetailOpen(false)} maxWidth="sm" fullWidth>
        {regleDetail && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Shield color="primary" />
                  <Typography variant="h6">Règle {regleDetail.code}</Typography>
                </Stack>
                <IconButton onClick={() => setRegleDetailOpen(false)} size="small">
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                {/* Libellé */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Libellé
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {regleDetail.libelle}
                  </Typography>
                </Box>

                {/* Chips sévérité + catégorie + statut */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={getSeveriteIcon(regleDetail.severite)}
                    label={regleDetail.severite}
                    size="small"
                    color={getSeveriteColor(regleDetail.severite)}
                  />
                  <Chip label={regleDetail.categorie} size="small" variant="outlined" />
                  <Chip
                    label={regleDetail.actif ? 'Actif' : 'Inactif'}
                    size="small"
                    color={regleDetail.actif ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>

                {/* Article SYSCOHADA */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Référence SYSCOHADA
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'primary.main' }}>
                    {regleDetail.articleReference}
                  </Typography>
                </Box>

                {/* Description complète */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Description du contrôle
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                      {regleDetail.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Contrôle TaxPilot associé */}
                {regleDetail.controleAssocie && regleDetail.controleAssocie !== '-' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Contrôle TaxPilot associé
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<VerifiedUser />}
                        label={regleDetail.controleAssocie}
                        color="success"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Ce contrôle est automatiquement exécuté lors de l'audit de la liasse
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRegleDetailOpen(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default DocumentationJuridique
