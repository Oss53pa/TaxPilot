import type { BalanceEntry, EntrepriseData } from '../../types'
import type { ExerciceData } from '../liasse-export-excel'
import type { SheetData } from './helpers'

import { buildCouverture, buildGarde, buildRecevabilite } from './build-01-couverture'
import { buildNote36Codes, buildNote36Nomenclature } from './build-04-note36'
import { buildFicheR1, buildFicheR2, buildFicheR3 } from './build-06-fiches'
import { buildBilan, buildActif } from './build-09-bilan'
import { buildPassif, buildResultat } from './build-11-passif-resultat'
import { buildTFT, buildFicheR4 } from './build-13-tft-r4'
import {
  buildNote1, buildNote2, buildNote3A, buildNote3B, buildNote3C,
  buildNote3CBis, buildNote3D, buildNote3E, buildNote4, buildNote5, buildNote6,
} from './build-15-notes-1to6'
import { buildNote7, buildNote8, buildNote8A, buildNote8B, buildNote8C } from './build-26-notes-7to8c'
import { buildNote9, buildNote10, buildNote11, buildNote12 } from './build-31-notes-9to12'
import { buildNote13, buildNote14, buildNote15A, buildNote15B } from './build-35-notes-13to15b'
import {
  buildNote16A, buildNote16B, buildNote16BBis, buildNote16C,
  buildNote17, buildNote18, buildNote19,
} from './build-39-notes-16to19'
import { buildNote20, buildNote21, buildNote22, buildNote23, buildNote24 } from './build-46-notes-20to24'
import { buildNote25, buildNote26, buildNote27A, buildNote27B, buildNote28 } from './build-51-notes-25to28'
import { buildNote29, buildNote30, buildNote31, buildNote32 } from './build-56-notes-29to32'
import { buildNote33, buildNote34, buildNote35, buildNote37, buildNote38, buildNote39 } from './build-60-notes-33to39'

export type BuilderFn = (
  balance: BalanceEntry[],
  balanceN1: BalanceEntry[],
  entreprise: EntrepriseData,
  exercice: ExerciceData,
) => SheetData

// Registry of all sheet builders, keyed by exact Excel tab name
export const BUILDERS: Record<string, BuilderFn> = {
  'COUVERTURE': buildCouverture,
  'GARDE': buildGarde,
  'RECEVABILITE': buildRecevabilite,
  'NOTE36 (TABLE DES CODES)': buildNote36Codes,
  'NOTE36 Suite (Nomenclature)': buildNote36Nomenclature,
  'FICHE R1': buildFicheR1,
  'FICHE R2': buildFicheR2,
  'FICHE R3': buildFicheR3,
  'BILAN': buildBilan,
  'ACTIF': buildActif,
  'PASSIF': buildPassif,
  'RESULTAT': buildResultat,
  'TFT': buildTFT,
  'FICHE R4': buildFicheR4,
  'NOTE 1': buildNote1,
  'NOTE 2': buildNote2,
  'NOTE 3A': buildNote3A,
  'NOTE 3B': buildNote3B,
  'NOTE 3C': buildNote3C,
  'NOTE 3C BIS': buildNote3CBis,
  'NOTE 3D': buildNote3D,
  'NOTE 3E': buildNote3E,
  'NOTE 4': buildNote4,
  'NOTE 5': buildNote5,
  'NOTE 6': buildNote6,
  'NOTE 7': buildNote7,
  'NOTE 8': buildNote8,
  'NOTE 8A': buildNote8A,
  'NOTE 8B': buildNote8B,
  'NOTE 8C': buildNote8C,
  'NOTE 9': buildNote9,
  'NOTE 10': buildNote10,
  'NOTE 11': buildNote11,
  'NOTE 12': buildNote12,
  'NOTE 13': buildNote13,
  'NOTE 14': buildNote14,
  'NOTE 15A': buildNote15A,
  'NOTE 15B': buildNote15B,
  'NOTE 16A': buildNote16A,
  'NOTE 16B': buildNote16B,
  'NOTE 16B BIS': buildNote16BBis,
  'NOTE 16C': buildNote16C,
  'NOTE 17': buildNote17,
  'NOTE 18': buildNote18,
  'NOTE 19': buildNote19,
  'NOTE 20': buildNote20,
  'NOTE 21': buildNote21,
  'NOTE 22': buildNote22,
  'NOTE 23': buildNote23,
  'NOTE 24': buildNote24,
  'NOTE 25': buildNote25,
  'NOTE 26': buildNote26,
  'NOTE 27A': buildNote27A,
  'NOTE 27B': buildNote27B,
  'NOTE 28': buildNote28,
  'NOTE 29': buildNote29,
  'NOTE 30': buildNote30,
  'NOTE 31': buildNote31,
  'NOTE 32': buildNote32,
  'NOTE 33': buildNote33,
  'NOTE 34': buildNote34,
  'NOTE 35': buildNote35,
  'NOTE 37': buildNote37,
  'NOTE 38': buildNote38,
  'NOTE 39': buildNote39,
  // Sheets 66-84 will be added in the final batch
}
