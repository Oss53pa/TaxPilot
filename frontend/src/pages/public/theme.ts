// Shared design tokens for all public/landing pages
// Palette "Nordic Slate" — light mode + teal accent
// Variables renommées sémantiquement, anciens noms (DARK/GOLD) conservés en aliases

// Surfaces (light)
export const BG_PAGE = '#ffffff'         // Fond de page principal
export const BG_SURFACE = '#fafaf9'      // Cards, sections lifted
export const BG_SURFACE_HOVER = '#f5f5f4' // Hover states

// Texte (charcoal warm)
export const TEXT_PRIMARY = '#1c1917'    // Texte principal (charcoal)
export const TEXT_SECONDARY = '#57534e'  // Texte secondaire (warm dark)
export const TEXT_TERTIARY = '#a8a29e'   // Captions, helpers

// Bordures
export const BORDER = 'rgba(0, 0, 0, 0.06)'      // Bordure subtile
export const BORDER_STRONG = 'rgba(0, 0, 0, 0.12)' // Bordure visible
export const BORDER_TEAL = '#99f6e4'             // Bordure accent (highlighted cards)

// Accent Teal (Nordic Slate)
export const TEAL = '#0f766e'            // Accent primaire
export const TEAL_LIGHT = '#5eead4'      // Hover glow
export const TEAL_DARK = '#115e59'       // Pressed
export const TEAL_BG = '#f0fdfa'         // Background tint très doux
export const TEAL_RGB = '15, 118, 110'

// ── Aliases legacy (DARK/GOLD) → maintenant light + teal ──
// Permet de ne pas casser le code existant qui réfère DARK/GOLD/etc.
export const DARK = BG_PAGE              // ⚠ valeur LIGHT maintenant (#ffffff)
export const DARK_SURFACE = BG_SURFACE
export const GOLD = TEAL                 // ⚠ valeur TEAL maintenant
export const GOLD_RGB = TEAL_RGB
export const GOLD_MUTED = TEAL_LIGHT

export const BRAND = '"Grand Hotel", cursive'
export const HEADING = '"Dosis", "Inter", "Exo 2", sans-serif'
export const BODY = '"Dosis", "Inter", "Exo 2", sans-serif'
