export interface ModuleFormation {
  id: string
  titre: string
  description: string
  duree: string
  type: 'video' | 'guide' | 'exercice'
  niveau: 'debutant' | 'intermediaire' | 'avance'
  tags: string[]
}

export const MODULES_FORMATION: ModuleFormation[] = [
  {
    id: 'F01', titre: 'Prise en main de LiassPilot',
    description: 'Créer un dossier, importer une balance CSV, naviguer dans l\'interface.',
    duree: '8 min', type: 'video', niveau: 'debutant',
    tags: ['démarrage', 'interface', 'balance'],
  },
  {
    id: 'F02', titre: 'Importer une balance Excel SYSCOHADA',
    description: 'Formats acceptés, auto-détection des colonnes, gestion des erreurs.',
    duree: '6 min', type: 'guide', niveau: 'debutant',
    tags: ['import', 'balance', 'Excel'],
  },
  {
    id: 'F03', titre: 'Comprendre le Bilan SYSCOHADA révisé',
    description: 'Actif immobilisé, actif circulant, passif — logique des reports.',
    duree: '15 min', type: 'video', niveau: 'intermediaire',
    tags: ['bilan', 'SYSCOHADA', 'actif', 'passif'],
  },
  {
    id: 'F04', titre: 'Compte de résultat et SIG',
    description: 'XA à XI — calcul de la marge, VA, EBE, RE, résultat net.',
    duree: '12 min', type: 'video', niveau: 'intermediaire',
    tags: ['compte de résultat', 'SIG', 'EBE'],
  },
  {
    id: 'F05', titre: 'TFT : CAFG, FR, BFR, TN',
    description: 'Tableau de financement, lecture de la trésorerie nette.',
    duree: '10 min', type: 'guide', niveau: 'intermediaire',
    tags: ['TFT', 'CAFG', 'trésorerie'],
  },
  {
    id: 'F06', titre: 'Passage fiscal CI : IS, IMF, réintégrations',
    description: 'CGI Art. 18 & 19, calcul IS, IMF 1% CA minimum 3M FCFA.',
    duree: '14 min', type: 'video', niveau: 'avance',
    tags: ['IS', 'IMF', 'fiscal', 'CGI'],
  },
  {
    id: 'F07', titre: 'Export liasse DGI (Mode B)',
    description: 'Générer le fichier Excel aux normes DGI Côte d\'Ivoire.',
    duree: '5 min', type: 'guide', niveau: 'intermediaire',
    tags: ['export', 'DGI', 'Excel'],
  },
  {
    id: 'F08', titre: 'Utiliser PROPH3T pour auditer une liasse',
    description: '169 contrôles automatiques, interpréter les alertes, corriger les anomalies.',
    duree: '10 min', type: 'video', niveau: 'intermediaire',
    tags: ['PROPH3T', 'audit', 'contrôles'],
  },
  {
    id: 'F09', titre: 'Gérer plusieurs dossiers clients',
    description: 'Switch rapide, isolation des données, droits par collaborateur.',
    duree: '8 min', type: 'guide', niveau: 'intermediaire',
    tags: ['multi-dossiers', 'cabinet', 'RBAC'],
  },
  {
    id: 'F10', titre: 'Multi-pays OHADA : adapter la liasse',
    description: 'Sélectionner un pays, taux fiscaux locaux, calendrier déclaratif.',
    duree: '7 min', type: 'guide', niveau: 'avance',
    tags: ['OHADA', 'multi-pays', 'fiscal'],
  },
]
