import React from 'react'
import { LIASSE_PAGES } from '@/config/liasse-pages-config'
import type { LiassePage } from '@/config/liasse-pages-config'
import type { PageDef, PageProps, SectionKey } from './types'

const lp = (name: string) => React.lazy(() => import(`./components/pages/${name}`))

// Map master config sections to module sections
const SECTION_MAP: Record<string, SectionKey> = {
  couverture: 'couverture',
  garde: 'couverture',
  fiches: 'fiches',
  etats: 'etats',
  notes: 'notes',
  supplements: 'supplements',
  commentaires: 'commentaire',
}

// Overrides for pages where master 'garde' maps to different module sections
const SECTION_OVERRIDES: Record<string, SectionKey> = {
  'garde-dgi-ins': 'supplements',
  'notes-dgi-ins': 'supplements',
  'garde-bic': 'gardes',
  'garde-bnc': 'gardes',
  'garde-ba': 'gardes',
  'garde-301': 'gardes',
  'garde-302': 'gardes',
  'garde-3': 'gardes',
}

function resolveSection(p: LiassePage): SectionKey {
  return SECTION_OVERRIDES[p.moduleId] || SECTION_MAP[p.section] || 'notes'
}

export const PAGES: PageDef[] = LIASSE_PAGES.map(p => ({
  id: p.moduleId,
  numero: p.pageNum,
  ongletExcel: p.label.toUpperCase(),
  titre: p.label.toUpperCase(),
  section: resolveSection(p),
  component: lp(p.componentFile),
  orientation: p.orientation,
}))

export const getPageById = (id: string): PageDef | undefined => PAGES.find(p => p.id === id)
export const getPagesBySection = (section: PageDef['section']): PageDef[] => PAGES.filter(p => p.section === section)

/** Load page component modules and return resolved components (bypasses React.lazy) */
export async function loadPageComponents(pages: PageDef[]): Promise<Map<string, React.ComponentType<PageProps>>> {
  const result = new Map<string, React.ComponentType<PageProps>>()
  const pageIds = new Set(pages.map(p => p.id))
  const toLoad = LIASSE_PAGES.filter(p => pageIds.has(p.moduleId))
  await Promise.all(toLoad.map(async (p) => {
    const mod = await import(`./components/pages/${p.componentFile}`)
    result.set(p.moduleId, mod.default)
  }))
  return result
}
