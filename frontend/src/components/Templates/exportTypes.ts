/**
 * Shared types for Templates & Export features
 */

import type { SectionId } from '@/config/liasse-pages-config'

// ── Country ──

export interface CountryInfo {
  code: string
  name: string
  flag: string
  defaultCurrency: string
}

export const OHADA_COUNTRIES: CountryInfo[] = [
  { code: 'CI', name: "Cote d'Ivoire", flag: '\u{1F1E8}\u{1F1EE}', defaultCurrency: 'XOF' },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', defaultCurrency: 'XOF' },
  { code: 'CM', name: 'Cameroun', flag: '\u{1F1E8}\u{1F1F2}', defaultCurrency: 'XAF' },
  { code: 'BF', name: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}', defaultCurrency: 'XOF' },
  { code: 'ML', name: 'Mali', flag: '\u{1F1F2}\u{1F1F1}', defaultCurrency: 'XOF' },
  { code: 'TG', name: 'Togo', flag: '\u{1F1F9}\u{1F1EC}', defaultCurrency: 'XOF' },
  { code: 'BJ', name: 'Benin', flag: '\u{1F1E7}\u{1F1EF}', defaultCurrency: 'XOF' },
  { code: 'NE', name: 'Niger', flag: '\u{1F1F3}\u{1F1EA}', defaultCurrency: 'XOF' },
  { code: 'GA', name: 'Gabon', flag: '\u{1F1EC}\u{1F1E6}', defaultCurrency: 'XAF' },
  { code: 'CG', name: 'Congo', flag: '\u{1F1E8}\u{1F1EC}', defaultCurrency: 'XAF' },
  { code: 'TD', name: 'Tchad', flag: '\u{1F1F9}\u{1F1E9}', defaultCurrency: 'XAF' },
  { code: 'GW', name: 'Guinee-Bissau', flag: '\u{1F1EC}\u{1F1FC}', defaultCurrency: 'XOF' },
  { code: 'GQ', name: 'Guinee equatoriale', flag: '\u{1F1EC}\u{1F1F6}', defaultCurrency: 'XAF' },
  { code: 'CF', name: 'Centrafrique', flag: '\u{1F1E8}\u{1F1EB}', defaultCurrency: 'XAF' },
  { code: 'KM', name: 'Comores', flag: '\u{1F1F0}\u{1F1F2}', defaultCurrency: 'KMF' },
  { code: 'CD', name: 'RD Congo', flag: '\u{1F1E8}\u{1F1E9}', defaultCurrency: 'CDF' },
]

// ── Export Formats ──

export type ExportFormatId = 'pdf' | 'excel' | 'word' | 'html' | 'xml' | 'json' | 'pptx'

export interface FormatOption {
  id: ExportFormatId
  label: string
  description: string
  icon: string  // MUI icon name
  color: string
  extensions: string[]
}

export const EXPORT_FORMATS: FormatOption[] = [
  { id: 'pdf',   label: 'PDF',        description: 'Document portable, ideal pour impression et archivage', icon: 'PictureAsPdf', color: '#ef4444', extensions: ['.pdf'] },
  { id: 'excel', label: 'Excel',      description: 'Tableur avec formules preservees et en-tetes figes', icon: 'TableChart',   color: '#22c55e', extensions: ['.xlsx'] },
  { id: 'word',  label: 'Word',       description: 'Document editable avec mise en forme', icon: 'Article',      color: '#3b82f6', extensions: ['.docx'] },
  { id: 'html',  label: 'HTML',       description: 'Page web autonome, responsive, CSS inline', icon: 'Code',         color: '#f59e0b', extensions: ['.html'] },
  { id: 'xml',   label: 'XML / XBRL', description: 'Donnees structurees pour echanges inter-systemes', icon: 'DataObject',   color: '#8b5cf6', extensions: ['.xml', '.xbrl'] },
  { id: 'json',  label: 'JSON',       description: 'Structure normalisee pour integration API', icon: 'DataObject',   color: '#171717', extensions: ['.json'] },
  { id: 'pptx',  label: 'PowerPoint', description: 'Presentation pour reunions et comites', icon: 'Slideshow',    color: '#f97316', extensions: ['.pptx'] },
]

// ── PDF Options ──

export interface PdfOptions {
  orientation: 'portrait' | 'landscape'
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  coverPage: boolean
  watermark: string
  passwordProtection: boolean
  password: string
}

// ── Export Profile ──

export interface ExportProfile {
  id: string
  name: string
  description: string
  country: string
  regime: string
  format: ExportFormatId
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived'

  // Header customization
  headerLogo: string        // base64 or empty
  headerCompanyName: boolean
  headerFiscalYear: boolean
  headerAdminHeader: string // custom admin header text

  // Footer customization
  footerPageFormat: 'Page X/Y' | 'Page X' | 'X/Y' | 'none'
  footerLegalMentions: string
  footerSignatureBlock: boolean

  // Style
  fontFamily: string
  primaryColor: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number

  // Pages
  excludedSections: SectionId[]
  excludedPages: string[]  // page IDs
  pageOrder: string[]      // ordered page IDs (if customized)
  pageNotes: Record<string, string>  // pageId -> custom note

  // PDF-specific
  pdfOptions: PdfOptions

  // Version tracking
  version: number
  versions: ProfileVersion[]
}

export interface ProfileVersion {
  version: number
  date: string
  changes: string
}

// ── Field Mapping ──

export type MappingStatus = 'mapped' | 'partial' | 'unmapped'

export interface FieldMapping {
  id: string
  templateField: string
  templateFieldLabel: string
  dataField: string
  dataFieldLabel: string
  status: MappingStatus
  autoMapped: boolean
}

// ── Export History ──

export interface ExportHistoryRecord {
  id: string
  date: string
  regime: string
  regimeLabel: string
  format: ExportFormatId
  company: string
  fiscalYear: string
  country: string
  countryLabel: string
  profileName: string
  status: 'completed' | 'error' | 'cancelled'
  fileSize: string
  fileName: string
  error?: string
}

// ── Scheduled Export ──

export interface ScheduledExport {
  id: string
  name: string
  regime: string
  format: ExportFormatId
  profileId: string
  profileName: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  customCron?: string
  enabled: boolean
  createdAt: string
  lastRun?: string
  nextRun: string
  notifyOnComplete: boolean
  notifyEmail: string
  status: 'active' | 'paused' | 'error'
}

// ── Batch Export ──

export interface BatchExportItem {
  id: string
  company: string
  fiscalYear: string
  regime: string
  country?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
}

// ── Storage Keys ──

export const STORAGE_KEYS = {
  EXPORT_PROFILES: 'fiscasync_db_export_profiles',
  EXPORT_HISTORY: 'fiscasync_db_export_history',
  SCHEDULED_EXPORTS: 'fiscasync_db_scheduled_exports',
  FIELD_MAPPINGS: 'fiscasync_db_field_mappings',
} as const

// ── Helpers ──

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getCountryFromConfig(): CountryInfo {
  // Read from enterprise settings first, then fall back to regional defaults
  try {
    const dbEntreprises = localStorage.getItem('fiscasync_db_entreprises')
    const entreprises = dbEntreprises ? JSON.parse(dbEntreprises) : []
    const pays = entreprises[0]?.pays
    if (pays) {
      const found = OHADA_COUNTRIES.find(c => c.code === pays)
      if (found) return found
    }
  } catch { /* ignore */ }
  return OHADA_COUNTRIES[0] // Default: Cote d'Ivoire
}

export function createDefaultProfile(country: string): ExportProfile {
  return {
    id: generateId(),
    name: '',
    description: '',
    country,
    regime: 'reel_normal',
    format: 'pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    headerLogo: '',
    headerCompanyName: true,
    headerFiscalYear: true,
    headerAdminHeader: '',
    footerPageFormat: 'Page X/Y',
    footerLegalMentions: '',
    footerSignatureBlock: true,
    fontFamily: 'Exo 2',
    primaryColor: '#171717',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15,
    excludedSections: [],
    excludedPages: [],
    pageOrder: [],
    pageNotes: {},
    pdfOptions: {
      orientation: 'portrait',
      paperSize: 'A4',
      coverPage: true,
      watermark: '',
      passwordProtection: false,
      password: '',
    },
    version: 1,
    versions: [],
  }
}
