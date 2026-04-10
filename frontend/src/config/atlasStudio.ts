/**
 * Atlas Studio / Liass'Pilot branding & public links
 * Centralises brand constants used by the public demo page.
 */
export const ATLAS_STUDIO = {
  brand: "Liass'Pilot",
  company: 'Atlas Studio',
  supportEmail: 'contact@liasspilot.com',
  pricingUrl: 'https://atlasstudio.app/pricing',
  website: 'https://atlasstudio.app',
  login: 'https://atlasstudio.app/portal?app=liasspilot',
} as const

export type AtlasStudioConfig = typeof ATLAS_STUDIO
