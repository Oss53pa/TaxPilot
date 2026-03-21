/**
 * paysTheme.ts — Configuration visuelle multi-pays pour les pages de garde
 * Séparé de pays-ohada.ts qui gère la config fiscale
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaysTheme {
  couleurPrimaire: string;
  couleurSecondaire: string;
  couleurFond: string;
  couleurTexte: string;
  couleurTitre: string;
  couleurBordure: string;
  fonteTitre: string;
  fonteCorps: string;
  tailleFonteTitre: number;
  tailleFonteCorps: number;
  logoPosition: 'gauche' | 'centre' | 'droite';
  drapeauPosition: 'gauche' | 'droite' | 'aucun';
  afficherBandeauPays: boolean;
}

export interface PaysVisualConfig {
  codePaysIso: string;
  nomPays: string;
  nomAdminFiscale: string;
  sigleAdminFiscale: string;
  devise: string;
  refFormulaire: string;
  theme: PaysTheme;
}

// ─── Default theme ──────────────────────────────────────────────────────────

const DEFAULT_THEME: PaysTheme = {
  couleurPrimaire: '#333333',
  couleurSecondaire: '#666666',
  couleurFond: '#FFFFFF',
  couleurTexte: '#1A1A1A',
  couleurTitre: '#333333',
  couleurBordure: '#CCCCCC',
  fonteTitre: 'Arial',
  fonteCorps: 'Arial',
  tailleFonteTitre: 13,
  tailleFonteCorps: 10,
  logoPosition: 'gauche',
  drapeauPosition: 'droite',
  afficherBandeauPays: true,
};

// ─── Pays configs ───────────────────────────────────────────────────────────

export const PAYS_VISUAL_CONFIGS: Record<string, PaysVisualConfig> = {
  CI: {
    codePaysIso: 'CI',
    nomPays: "Cote d'Ivoire",
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-CI',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA Revise 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#F77F00',
      couleurSecondaire: '#009A44',
      couleurTitre: '#F77F00',
    },
  },
  CM: {
    codePaysIso: 'CM',
    nomPays: 'Cameroun',
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-CM',
    devise: 'FCFA',
    refFormulaire: 'DSF 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#007A5E',
      couleurSecondaire: '#CE1126',
      couleurTitre: '#007A5E',
    },
  },
  SN: {
    codePaysIso: 'SN',
    nomPays: 'Senegal',
    nomAdminFiscale: 'Direction Generale des Impots et Domaines',
    sigleAdminFiscale: 'DGID-SN',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#00853F',
      couleurSecondaire: '#FDEF42',
      couleurTitre: '#00853F',
    },
  },
  GA: {
    codePaysIso: 'GA',
    nomPays: 'Gabon',
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-GA',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#009E60',
      couleurSecondaire: '#FCD116',
      couleurTitre: '#009E60',
    },
  },
  BJ: {
    codePaysIso: 'BJ',
    nomPays: 'Benin',
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-BJ',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#008751',
      couleurSecondaire: '#FCD116',
      couleurTitre: '#008751',
    },
  },
  TG: {
    codePaysIso: 'TG',
    nomPays: 'Togo',
    nomAdminFiscale: 'Office Togolais des Recettes',
    sigleAdminFiscale: 'OTR-TG',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#006A4E',
      couleurSecondaire: '#FCD116',
      couleurTitre: '#006A4E',
    },
  },
  ML: {
    codePaysIso: 'ML',
    nomPays: 'Mali',
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-ML',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#009A3B',
      couleurSecondaire: '#FCD116',
      couleurTitre: '#009A3B',
    },
  },
  BF: {
    codePaysIso: 'BF',
    nomPays: 'Burkina Faso',
    nomAdminFiscale: 'Direction Generale des Impots',
    sigleAdminFiscale: 'DGI-BF',
    devise: 'FCFA',
    refFormulaire: 'Liasse SYSCOHADA 2024',
    theme: {
      ...DEFAULT_THEME,
      couleurPrimaire: '#EF2B2D',
      couleurSecondaire: '#009E49',
      couleurTitre: '#EF2B2D',
    },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const FALLBACK_CONFIG: PaysVisualConfig = {
  codePaysIso: 'XX',
  nomPays: 'Pays OHADA',
  nomAdminFiscale: 'Administration Fiscale',
  sigleAdminFiscale: 'DGI',
  devise: 'FCFA',
  refFormulaire: 'Liasse SYSCOHADA 2024',
  theme: DEFAULT_THEME,
};

/** Get visual config for a country code */
export function getPaysVisualConfig(codePays: string): PaysVisualConfig {
  return PAYS_VISUAL_CONFIGS[codePays?.toUpperCase()] || FALLBACK_CONFIG;
}

/** Resolve theme: country defaults + optional enterprise overrides */
export function resolvePaysTheme(codePays: string, surcharge?: Partial<PaysTheme>): PaysTheme {
  const config = getPaysVisualConfig(codePays);
  if (!surcharge) return config.theme;
  // Merge: only override non-undefined values
  const merged = { ...config.theme };
  for (const [key, val] of Object.entries(surcharge)) {
    if (val !== undefined && val !== null && val !== '') {
      (merged as any)[key] = val;
    }
  }
  return merged;
}
