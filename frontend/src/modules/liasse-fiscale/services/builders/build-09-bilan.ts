import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'
import { getActifBrut, getAmortProv, getBalanceSolde } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Account prefix mappings for ACTIF side
// ────────────────────────────────────────────────────────────────────────────

interface ActifLine {
  ref: string
  label: string
  note: string | number | null
  brutPfx: readonly string[]
  amortPfx: readonly string[]
}

const ACTIF_LINES: ActifLine[] = [
  // AE - Frais de développement
  { ref: 'AE', label: 'Frais de développement', note: null, brutPfx: ['201','202','206'], amortPfx: ['2801','2802','2806'] },
  // AF - Brevets, licences, logiciels
  { ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires', note: null, brutPfx: ['212','213','214','215'], amortPfx: ['2812','2813','2814','2815'] },
  // AG - Fonds commercial et droit au bail
  { ref: 'AG', label: 'Fonds commercial et droit au bail', note: null, brutPfx: ['216','217'], amortPfx: ['2816','2817'] },
  // AH - Autres immobilisations incorporelles
  { ref: 'AH', label: 'Autres immobilisations incorporelles', note: null, brutPfx: ['211','218','219'], amortPfx: ['2811','2818','2819'] },
]

const ACTIF_CORPO_LINES: ActifLine[] = [
  // AJ - Terrains
  { ref: 'AJ', label: 'Terrains (1)', note: null, brutPfx: ['22'], amortPfx: ['282'] },
  // AK - Bâtiments
  { ref: 'AK', label: 'Bâtiments (1)', note: null, brutPfx: ['23'], amortPfx: ['283'] },
  // AL - Aménagements, agencements et installations
  { ref: 'AL', label: 'Aménagements, agencements et installations', note: null, brutPfx: ['241','242','243'], amortPfx: ['2841','2842','2843'] },
  // AM - Matériel, mobilier et actifs biologiques
  { ref: 'AM', label: 'Matériel, mobilier et actifs biologiques', note: null, brutPfx: ['244','246','247','248'], amortPfx: ['2844','2846','2847','2848'] },
  // AN - Matériel de transport
  { ref: 'AN', label: 'Matériel de transport', note: null, brutPfx: ['245'], amortPfx: ['2845'] },
]

interface PassifLine {
  ref: string
  label: string
  note: string | number | null
  prefixes: readonly string[]
}

const PASSIF_LINES_CP: PassifLine[] = [
  { ref: 'CA', label: 'Capital', note: 13, prefixes: ['101','102','103','104','105'] },
  { ref: 'CB', label: 'Apporteurs capital non appelé (-)', note: 13, prefixes: ['109'] },
  { ref: 'CD', label: 'Primes liées au capital social', note: 14, prefixes: ['11'] },
  { ref: 'CE', label: 'Ecarts de réévaluation', note: '3e', prefixes: ['106'] },
  { ref: 'CF', label: 'Réserves indisponibles', note: 14, prefixes: ['111','112','113'] },
  { ref: 'CG', label: 'Réserves libres', note: 14, prefixes: ['118'] },
  { ref: 'CH', label: 'Report à nouveau (+ ou -)', note: 14, prefixes: ['12'] },
  { ref: 'CJ', label: 'Résultat net (bénéfice + ou perte -)', note: null, prefixes: ['13'] },
  { ref: 'CL', label: 'Subventions d\'investissement', note: 15, prefixes: ['14'] },
  { ref: 'CM', label: 'Provisions réglementées', note: 15, prefixes: ['15'] },
]

const PASSIF_LINES_DF: PassifLine[] = [
  { ref: 'DA', label: 'Emprunts et dettes financières diverses', note: 16, prefixes: ['16'] },
  { ref: 'DB', label: 'Dettes de location-acquisition', note: 16, prefixes: ['17'] },
  { ref: 'DC', label: 'Provisions pour risques et charges', note: 16, prefixes: ['19'] },
]

const PASSIF_LINES_CIRC: PassifLine[] = [
  { ref: 'DH', label: 'Dettes circulantes HAO', note: 5, prefixes: ['481','482','484','485','486','488'] },
  { ref: 'DI', label: 'Clients, avances reçues', note: 7, prefixes: ['419'] },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', note: 17, prefixes: ['40'] },
  { ref: 'DK', label: 'Dettes fiscales et sociales', note: 18, prefixes: ['42','43','44'] },
  { ref: 'DM', label: 'Autres dettes', note: 19, prefixes: ['45','46','47','48'] },
  { ref: 'DN', label: 'Provisions pour risques à court terme', note: 19, prefixes: ['499','599'] },
]

const PASSIF_LINES_TRESO: PassifLine[] = [
  { ref: 'DQ', label: 'Banques, crédits d\'escompte', note: 20, prefixes: ['564','565'] },
  { ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', note: 20, prefixes: ['56'] },
]

// ────────────────────────────────────────────────────────────────────────────
// Computation helpers
// ────────────────────────────────────────────────────────────────────────────

function computeActifBrut(bal: BalanceEntry[], pfx: readonly string[]): number {
  return getActifBrut(bal, pfx)
}

function computeAmort(bal: BalanceEntry[], pfx: readonly string[]): number {
  return pfx.length > 0 ? getAmortProv(bal, pfx) : 0
}

function computePassifVal(bal: BalanceEntry[], pfx: readonly string[]): number {
  return -getBalanceSolde(bal, pfx)
}

// ────────────────────────────────────────────────────────────────────────────
// Build the ACTIF data rows (shared between Sheet 9 and Sheet 10)
// Returns { rows, values } where values contains named totals
// ────────────────────────────────────────────────────────────────────────────

interface ActifValues {
  AZ_brut: number; AZ_amort: number; AZ_net: number; AZ_netN1: number
  BK_brut: number; BK_amort: number; BK_net: number; BK_netN1: number
  BT_brut: number; BT_amort: number; BT_net: number; BT_netN1: number
  BU_brut: number; BU_amort: number; BU_net: number; BU_netN1: number
  BZ_brut: number; BZ_amort: number; BZ_net: number; BZ_netN1: number
}

function buildActifRows(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  totalCols: number,
  // Column indices: ref, label (start), note, brut, amort, net, netN1
  cRef: number, cLabel: number, cNote: number, cBrut: number, cAmort: number, cNet: number, cNetN1: number,
): { rows: Row[]; values: ActifValues } {
  const rows: Row[] = []

  // Helper to compute a single actif line
  const actifRow = (line: ActifLine): [number, number, number, number] => {
    const brut = computeActifBrut(bal, line.brutPfx)
    const amort = computeAmort(bal, line.amortPfx)
    const net = brut - amort
    const brutN1 = computeActifBrut(balN1, line.brutPfx)
    const amortN1 = computeAmort(balN1, line.amortPfx)
    const netN1 = brutN1 - amortN1
    return [brut, amort, net, netN1]
  }

  // Helper to make a data row
  const makeRow = (
    ref: string, label: string, note: string | number | null,
    brut: number | null, amort: number | null, net: number | null, netN1: number | null,
  ): Row => {
    const row = emptyRow(totalCols)
    row[cRef] = ref
    row[cLabel] = label
    row[cNote] = note
    row[cBrut] = brut
    row[cAmort] = amort
    row[cNet] = net
    row[cNetN1] = netN1
    return row
  }

  // ── IMMOBILISATIONS INCORPORELLES (AD = sum AE..AH) ──
  let AD_brut = 0, AD_amort = 0, AD_net = 0, AD_netN1 = 0
  const incorpVals: [number, number, number, number][] = []
  for (const line of ACTIF_LINES) {
    const v = actifRow(line)
    incorpVals.push(v)
    AD_brut += v[0]; AD_amort += v[1]; AD_net += v[2]; AD_netN1 += v[3]
  }
  rows.push(makeRow('AD', 'IMMOBILISATIONS INCORPORELLES', 3, AD_brut, AD_amort, AD_net, AD_netN1))
  for (let i = 0; i < ACTIF_LINES.length; i++) {
    const [brut, amort, net, netN1] = incorpVals[i]
    rows.push(makeRow(ACTIF_LINES[i].ref, ACTIF_LINES[i].label, ACTIF_LINES[i].note, brut, amort, net, netN1))
  }

  // ── IMMOBILISATIONS CORPORELLES (AI = sum AJ..AN) ──
  let AI_brut = 0, AI_amort = 0, AI_net = 0, AI_netN1 = 0
  const corpoVals: [number, number, number, number][] = []
  for (const line of ACTIF_CORPO_LINES) {
    const v = actifRow(line)
    corpoVals.push(v)
    AI_brut += v[0]; AI_amort += v[1]; AI_net += v[2]; AI_netN1 += v[3]
  }
  rows.push(makeRow('AI', 'IMMOBILISATIONS CORPORELLES', 3, AI_brut, AI_amort, AI_net, AI_netN1))
  for (let i = 0; i < ACTIF_CORPO_LINES.length; i++) {
    const [brut, amort, net, netN1] = corpoVals[i]
    rows.push(makeRow(ACTIF_CORPO_LINES[i].ref, ACTIF_CORPO_LINES[i].label, ACTIF_CORPO_LINES[i].note, brut, amort, net, netN1))
  }

  // ── AVANCES ET ACOMPTES VERSES SUR IMMOB (AP) ──
  const AP_brut = computeActifBrut(bal, ['25'])
  const AP_amort = 0
  const AP_net = AP_brut
  const AP_brutN1 = computeActifBrut(balN1, ['25'])
  const AP_netN1 = AP_brutN1
  rows.push(makeRow('AP', 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', 3, AP_brut, AP_amort, AP_net, AP_netN1))

  // ── IMMOBILISATIONS FINANCIERES (AQ = sum AR+AS) ──
  const AR_brut = computeActifBrut(bal, ['26'])
  const AR_amort = computeAmort(bal, ['296'])
  const AR_net = AR_brut - AR_amort
  const AR_brutN1 = computeActifBrut(balN1, ['26'])
  const AR_amortN1 = computeAmort(balN1, ['296'])
  const AR_netN1 = AR_brutN1 - AR_amortN1

  const AS_brut = computeActifBrut(bal, ['271','272','273','274','275','276','277','278'])
  const AS_amort = computeAmort(bal, ['297'])
  const AS_net = AS_brut - AS_amort
  const AS_brutN1 = computeActifBrut(balN1, ['271','272','273','274','275','276','277','278'])
  const AS_amortN1 = computeAmort(balN1, ['297'])
  const AS_netN1 = AS_brutN1 - AS_amortN1

  const AQ_brut = AR_brut + AS_brut
  const AQ_amort = AR_amort + AS_amort
  const AQ_net = AR_net + AS_net
  const AQ_netN1 = AR_netN1 + AS_netN1
  rows.push(makeRow('AQ', 'IMMOBILISATIONS FINANCIERES', 4, AQ_brut, AQ_amort, AQ_net, AQ_netN1))
  rows.push(makeRow('AR', 'Titres de participation', null, AR_brut, AR_amort, AR_net, AR_netN1))
  rows.push(makeRow('AS', 'Autres immobilisations financières', null, AS_brut, AS_amort, AS_net, AS_netN1))

  // ── TOTAL ACTIF IMMOBILISE (AZ) ──
  const AZ_brut = AD_brut + AI_brut + AP_brut + AQ_brut
  const AZ_amort = AD_amort + AI_amort + AP_amort + AQ_amort
  const AZ_net = AD_net + AI_net + AP_net + AQ_net
  const AZ_netN1 = AD_netN1 + AI_netN1 + AP_netN1 + AQ_netN1
  rows.push(makeRow('AZ', 'TOTAL ACTIF IMMOBILISE', null, AZ_brut, AZ_amort, AZ_net, AZ_netN1))

  // ── ACTIF CIRCULANT HAO (BA) ──
  const BA_brut = computeActifBrut(bal, ['481','482','485','488'])
  const BA_amort = 0
  const BA_net = BA_brut
  const BA_brutN1 = computeActifBrut(balN1, ['481','482','485','488'])
  const BA_netN1 = BA_brutN1
  rows.push(makeRow('BA', 'ACTIF CIRCULANT HAO', 5, BA_brut, BA_amort, BA_net, BA_netN1))

  // ── STOCKS ET ENCOURS (BB) ──
  const BB_brut = computeActifBrut(bal, ['31','32','33','34','35','36','37','38'])
  const BB_amort = computeAmort(bal, ['39'])
  const BB_net = BB_brut - BB_amort
  const BB_brutN1 = computeActifBrut(balN1, ['31','32','33','34','35','36','37','38'])
  const BB_amortN1 = computeAmort(balN1, ['39'])
  const BB_netN1 = BB_brutN1 - BB_amortN1
  rows.push(makeRow('BB', 'STOCKS ET ENCOURS', 6, BB_brut, BB_amort, BB_net, BB_netN1))

  // ── CREANCES ET EMPLOIS ASSIMILES (BG = BH+BI+BJ) ──
  const BH_brut = computeActifBrut(bal, ['409'])
  const BH_amort = 0
  const BH_net = BH_brut
  const BH_brutN1 = computeActifBrut(balN1, ['409'])
  const BH_netN1 = BH_brutN1

  const BI_brut = computeActifBrut(bal, ['411','412','413','414','415','416','417','418'])
  const BI_amort = computeAmort(bal, ['491'])
  const BI_net = BI_brut - BI_amort
  const BI_brutN1 = computeActifBrut(balN1, ['411','412','413','414','415','416','417','418'])
  const BI_amortN1 = computeAmort(balN1, ['491'])
  const BI_netN1 = BI_brutN1 - BI_amortN1

  const BJ_brut = computeActifBrut(bal, ['42','43','44','45','46','47','48'])
  const BJ_amort = computeAmort(bal, ['492','493','494','495','496','497','498'])
  const BJ_net = BJ_brut - BJ_amort
  const BJ_brutN1 = computeActifBrut(balN1, ['42','43','44','45','46','47','48'])
  const BJ_amortN1 = computeAmort(balN1, ['492','493','494','495','496','497','498'])
  const BJ_netN1 = BJ_brutN1 - BJ_amortN1

  const BG_brut = BH_brut + BI_brut + BJ_brut
  const BG_amort = BH_amort + BI_amort + BJ_amort
  const BG_net = BH_net + BI_net + BJ_net
  const BG_netN1 = BH_netN1 + BI_netN1 + BJ_netN1
  rows.push(makeRow('BG', 'CREANCES ET EMPLOIS ASSIMILES', null, BG_brut, BG_amort, BG_net, BG_netN1))
  rows.push(makeRow('BH', 'Fournisseurs avances versées', 17, BH_brut, BH_amort, BH_net, BH_netN1))
  rows.push(makeRow('BI', 'Clients', 7, BI_brut, BI_amort, BI_net, BI_netN1))
  rows.push(makeRow('BJ', 'Autres créances', 8, BJ_brut, BJ_amort, BJ_net, BJ_netN1))

  // ── TOTAL ACTIF CIRCULANT (BK) ──
  const BK_brut = BA_brut + BB_brut + BG_brut
  const BK_amort = BA_amort + BB_amort + BG_amort
  const BK_net = BA_net + BB_net + BG_net
  const BK_netN1 = BA_netN1 + BB_netN1 + BG_netN1
  rows.push(makeRow('BK', 'TOTAL ACTIF CIRCULANT', null, BK_brut, BK_amort, BK_net, BK_netN1))

  // ── TRESORERIE-ACTIF ──
  const BQ_brut = computeActifBrut(bal, ['50'])
  const BQ_amort = computeAmort(bal, ['590'])
  const BQ_net = BQ_brut - BQ_amort
  const BQ_brutN1 = computeActifBrut(balN1, ['50'])
  const BQ_amortN1 = computeAmort(balN1, ['590'])
  const BQ_netN1 = BQ_brutN1 - BQ_amortN1

  const BR_brut = computeActifBrut(bal, ['51'])
  const BR_amort = 0
  const BR_net = BR_brut
  const BR_brutN1 = computeActifBrut(balN1, ['51'])
  const BR_netN1 = BR_brutN1

  const BS_brut = computeActifBrut(bal, ['52','53','54','55','56','57','58'])
  const BS_amort = 0
  const BS_net = BS_brut
  const BS_brutN1 = computeActifBrut(balN1, ['52','53','54','55','56','57','58'])
  const BS_netN1 = BS_brutN1

  rows.push(makeRow('BQ', 'Titres de placement', 9, BQ_brut, BQ_amort, BQ_net, BQ_netN1))
  rows.push(makeRow('BR', 'Valeurs à encaisser', 10, BR_brut, BR_amort, BR_net, BR_netN1))
  rows.push(makeRow('BS', 'Banques, chèques postaux, caisse et assimilés', 11, BS_brut, BS_amort, BS_net, BS_netN1))

  // ── TOTAL TRESORERIE-ACTIF (BT) ──
  const BT_brut = BQ_brut + BR_brut + BS_brut
  const BT_amort = BQ_amort + BR_amort + BS_amort
  const BT_net = BQ_net + BR_net + BS_net
  const BT_netN1 = BQ_netN1 + BR_netN1 + BS_netN1
  rows.push(makeRow('BT', 'TOTAL TRESORERIE-ACTIF', null, BT_brut, BT_amort, BT_net, BT_netN1))

  // ── ECART DE CONVERSION-ACTIF (BU) ──
  const BU_brut = computeActifBrut(bal, ['478'])
  const BU_amort = 0
  const BU_net = BU_brut
  const BU_brutN1 = computeActifBrut(balN1, ['478'])
  const BU_netN1 = BU_brutN1
  rows.push(makeRow('BU', 'Ecart de conversion-Actif', 12, BU_brut, BU_amort, BU_net, BU_netN1))

  // ── TOTAL GENERAL (BZ) ──
  const BZ_brut = AZ_brut + BK_brut + BT_brut + BU_brut
  const BZ_amort = AZ_amort + BK_amort + BT_amort + BU_amort
  const BZ_net = AZ_net + BK_net + BT_net + BU_net
  const BZ_netN1 = AZ_netN1 + BK_netN1 + BT_netN1 + BU_netN1
  rows.push(makeRow('BZ', 'TOTAL GENERAL', null, BZ_brut, BZ_amort, BZ_net, BZ_netN1))

  return {
    rows,
    values: {
      AZ_brut, AZ_amort, AZ_net, AZ_netN1,
      BK_brut, BK_amort, BK_net, BK_netN1,
      BT_brut, BT_amort, BT_net, BT_netN1,
      BU_brut, BU_amort, BU_net, BU_netN1,
      BZ_brut, BZ_amort, BZ_net, BZ_netN1,
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Build the PASSIF data rows (used only in Sheet 9)
// ────────────────────────────────────────────────────────────────────────────

function buildPassifRows(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  totalCols: number,
  cRef: number, cLabel: number, cNote: number, cNet: number, cNetN1: number,
): Row[] {
  const rows: Row[] = []

  const pv = (pfx: readonly string[]) => computePassifVal(bal, pfx)
  const pvN1 = (pfx: readonly string[]) => computePassifVal(balN1, pfx)

  const makeRow = (
    ref: string, label: string, note: string | number | null,
    net: number | null, netN1Arg: number | null,
  ): Row => {
    const row = emptyRow(totalCols)
    row[cRef] = ref
    row[cLabel] = label
    row[cNote] = note
    row[cNet] = net
    row[cNetN1] = netN1Arg
    return row
  }

  // ── CAPITAUX PROPRES (CP = sum CA..CM) ──
  let CP_net = 0, CP_netN1 = 0
  const cpRows: Row[] = []
  for (const line of PASSIF_LINES_CP) {
    const net = pv(line.prefixes)
    const n1 = pvN1(line.prefixes)
    CP_net += net
    CP_netN1 += n1
    cpRows.push(makeRow(line.ref, line.label, line.note, net, n1))
  }
  // Push individual lines then total
  for (const r of cpRows) rows.push(r)
  rows.push(makeRow('CP', 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', null, CP_net, CP_netN1))

  // ── DETTES FINANCIERES (DD = sum DA+DB+DC) ──
  let DD_net = 0, DD_netN1 = 0
  for (const line of PASSIF_LINES_DF) {
    const net = pv(line.prefixes)
    const n1 = pvN1(line.prefixes)
    DD_net += net
    DD_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
  }
  rows.push(makeRow('DD', 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', null, DD_net, DD_netN1))

  // ── TOTAL RESSOURCES STABLES (DF = CP + DD) ──
  const DF_net = CP_net + DD_net
  const DF_netN1 = CP_netN1 + DD_netN1
  rows.push(makeRow('DF', 'TOTAL RESSOURCES STABLES', null, DF_net, DF_netN1))

  // ── PASSIF CIRCULANT (DP = sum DH..DN) ──
  let DP_net = 0, DP_netN1 = 0
  for (const line of PASSIF_LINES_CIRC) {
    const net = pv(line.prefixes)
    const n1 = pvN1(line.prefixes)
    DP_net += net
    DP_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
  }
  rows.push(makeRow('DP', 'TOTAL PASSIF CIRCULANT', null, DP_net, DP_netN1))

  // ── Row 33 (empty row between passif circulant and trésorerie) ──
  rows.push(emptyRow(totalCols))

  // ── TRESORERIE-PASSIF (DT = sum DQ+DR) ──
  let DT_net = 0, DT_netN1 = 0
  for (const line of PASSIF_LINES_TRESO) {
    const net = pv(line.prefixes)
    const n1 = pvN1(line.prefixes)
    DT_net += net
    DT_netN1 += n1
    rows.push(makeRow(line.ref, line.label, line.note, net, n1))
  }
  rows.push(makeRow('DT', 'TOTAL TRESORERIE-PASSIF', null, DT_net, DT_netN1))

  // ── ECART DE CONVERSION-PASSIF (DV) ──
  const DV_net = pv(['479'])
  const DV_netN1 = pvN1(['479'])
  rows.push(makeRow('DV', 'Ecart de conversion-Passif', 12, DV_net, DV_netN1))

  // ── TOTAL GENERAL (DZ = DF + DP + DT + DV) ──
  const DZ_net = DF_net + DP_net + DT_net + DV_net
  const DZ_netN1 = DF_netN1 + DP_netN1 + DT_netN1 + DV_netN1
  rows.push(makeRow('DZ', 'TOTAL GENERAL', null, DZ_net, DZ_netN1))

  return rows
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 9: BILAN (14 columns A-N, 40 rows)
// Left side = ACTIF (cols A-I), Right side = PASSIF (cols J-N)
// ────────────────────────────────────────────────────────────────────────────

function buildBilan(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 14 // columns A(0) through N(13)
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 7 -']))
  merges.push(m(0, 0, 0, 13)) // A1:N1

  // ── Row 1: page label ──
  rows.push(rowAt(C, [11, 'BILAN SYSTEME NORMAL\nPAGE 1/1']))
  merges.push(m(1, 11, 1, 13)) // L2:N2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,       // denomination in col C
    sigleCol: 11,      // sigle label in col L
    sigleValCol: 13,   // sigle value in col N
  })
  rows.push(...hdr)

  // ── Row 6: BILAN title ──
  rows.push(rowAt(C, [0, 'BILAN']))
  merges.push(m(6, 0, 6, 13)) // A7:N7

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'REF'
  r7[1] = 'ACTIF'
  r7[4] = 'NOTE'
  r7[5] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[8] = 'EXERCICE N-1'
  r7[9] = 'REF'
  r7[10] = 'PASSIF'
  r7[11] = 'NOTE'
  r7[12] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[13] = 'EXERCICE N-1'
  rows.push(r7)

  // ── Row 8: empty sub-row ──
  rows.push(emptyRow(C))

  // ── Row 9: sub-headers ──
  const r9 = emptyRow(C)
  r9[5] = 'BRUT'
  r9[6] = 'AMORT et DEPREC.'
  r9[7] = 'NET'
  r9[8] = 'NET'
  r9[12] = 'NET'
  r9[13] = 'NET'
  rows.push(r9)

  // Header area merges (rows 7-9 = indices 7,8,9)
  merges.push(m(7, 0, 9, 0))    // A8:A10  - REF spans 3 rows
  merges.push(m(7, 1, 9, 3))    // B8:D10  - ACTIF label spans 3 rows, 3 cols
  merges.push(m(7, 4, 9, 4))    // E8:E10  - NOTE spans 3 rows
  merges.push(m(7, 5, 8, 7))    // F8:H9   - EXERCICE N spans 2 rows, 3 cols
  merges.push(m(7, 8, 8, 8))    // I8:I9   - EXERCICE N-1 spans 2 rows
  merges.push(m(7, 9, 9, 9))    // J8:J10  - REF spans 3 rows
  merges.push(m(7, 10, 9, 10))  // K8:K10  - PASSIF spans 3 rows
  merges.push(m(7, 11, 9, 11))  // L8:L10  - NOTE spans 3 rows
  merges.push(m(7, 12, 8, 12))  // M8:M9   - EXERCICE N NET spans 2 rows
  merges.push(m(7, 13, 8, 13))  // N8:N9   - EXERCICE N-1 NET spans 2 rows

  // ── Rows 10-38: data rows ──
  // Build ACTIF side (cols 0-8: ref=0, label=1, note=4, brut=5, amort=6, net=7, netN1=8)
  const actifResult = buildActifRows(bal, balN1, C, 0, 1, 4, 5, 6, 7, 8)

  // Build PASSIF side (cols 9-13: ref=9, label=10, note=11, net=12, netN1=13)
  const passifDataRows = buildPassifRows(bal, balN1, C, 9, 10, 11, 12, 13)

  // Merge ACTIF and PASSIF into combined rows
  const actifDataRows = actifResult.rows // 29 rows (AD through BZ)
  const maxDataRows = Math.max(actifDataRows.length, passifDataRows.length)

  for (let i = 0; i < maxDataRows; i++) {
    const row = emptyRow(C)

    // Copy ACTIF side (cols 0-8)
    if (i < actifDataRows.length) {
      for (let c = 0; c < 9; c++) {
        row[c] = actifDataRows[i][c]
      }
    }

    // Copy PASSIF side (cols 9-13)
    if (i < passifDataRows.length) {
      for (let c = 9; c < C; c++) {
        row[c] = passifDataRows[i][c]
      }
    }

    rows.push(row)
  }

  // Pad to 40 rows total
  while (rows.length < 40) rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 10: ACTIF (14 columns A-N, 39 rows)
// Standalone ACTIF page with same data as BILAN actif side
// ────────────────────────────────────────────────────────────────────────────

function buildActif(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 14 // 14 columns to match Excel dimensions
  const merges: ReturnType<typeof m>[] = []
  const rows: Row[] = []

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 8 -']))
  merges.push(m(0, 0, 0, 13))

  // ── Row 1: page label ──
  rows.push(rowAt(C, [11, 'BILAN - ACTIF\nSYSTEME NORMAL']))
  merges.push(m(1, 11, 1, 13))

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 11,
    sigleValCol: 13,
  })
  rows.push(...hdr)

  // ── Row 6: BILAN title ──
  rows.push(rowAt(C, [0, 'BILAN']))
  merges.push(m(6, 0, 6, 13))

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'REF'
  r7[1] = 'ACTIF'
  r7[4] = 'NOTE'
  r7[5] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[8] = 'EXERCICE N-1'
  rows.push(r7)

  // ── Row 8: empty sub-row ──
  rows.push(emptyRow(C))

  // ── Row 9: sub-headers ──
  const r9 = emptyRow(C)
  r9[5] = 'BRUT'
  r9[6] = 'AMORT et DEPREC.'
  r9[7] = 'NET'
  r9[8] = 'NET'
  rows.push(r9)

  // Header area merges (rows 7-9)
  merges.push(m(7, 0, 9, 0))    // A8:A10  - REF spans 3 rows
  merges.push(m(7, 1, 9, 3))    // B8:D10  - ACTIF label spans 3 rows, 3 cols
  merges.push(m(7, 4, 9, 4))    // E8:E10  - NOTE spans 3 rows
  merges.push(m(7, 5, 8, 7))    // F8:H9   - EXERCICE N spans 2 rows, 3 cols
  merges.push(m(7, 8, 8, 8))    // I8:I9   - EXERCICE N-1 spans 2 rows

  // ── Rows 10+: data rows (same as BILAN actif side) ──
  // Using cols: ref=0, label=1, note=4, brut=5, amort=6, net=7, netN1=8
  const actifResult = buildActifRows(bal, balN1, C, 0, 1, 4, 5, 6, 7, 8)
  for (const row of actifResult.rows) {
    rows.push(row)
  }

  // Pad to 39 rows total
  while (rows.length < 39) rows.push(emptyRow(C))

  return { rows, merges }
}

export { buildBilan, buildActif }
