/**
 * build-13-tft-r4.ts
 * Builders for sheets 13-14 of the SYSCOHADA liasse fiscale:
 *   - Sheet 13: TFT (10 cols, ~44 rows) - Tableau des Flux de Trésorerie
 *   - Sheet 14: FICHE R4 (10 cols, ~65 rows) - Fiche récapitulative des notes annexes
 */

import { SheetData, Row, emptyRow, rowAt, m, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'
import { getBalanceSolde, getCharges, getProduits } from './helpers'
import { getActifBrut, getPassif } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 13 : TFT — 10 columns (A=0 to J=9), ~44 rows
// ────────────────────────────────────────────────────────────────────────────

function buildTFT(
  bal: BalanceEntry[],
  balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10 // total columns A(0)..J(9)
  const rows: Row[] = []
  const merges = [] as ReturnType<typeof m>[]

  // Column indices for data rows
  const cRef = 0
  // B(1)-F(5) = LIBELLES (merged)
  const cLetter = 6  // G col: letter A/B/C/D/E/F/G/H
  const cNote = 7    // H col: NOTE
  const cN = 8       // I col: EXERCICE N
  const cN1 = 9      // J col: EXERCICE N-1

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 9 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1: sheet label top-right ──
  rows.push(rowAt(C, [7, 'FLUX DE TRESORERIE SYSTEME NORMAL\nPAGE 1/1']))
  merges.push(m(1, 7, 1, 9)) // H2:J2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 8,
    sigleValCol: 9,
  })
  rows.push(...hdr) // rows 2,3,4,5

  // ── Row 6: full title ──
  rows.push(rowAt(C, [0, 'TABLEAU DES FLUX DE TRESORERIE']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[cRef] = 'REF'
  r7[1] = 'LIBELLES'
  r7[cNote] = 'NOTE'
  r7[cN] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() : 'N'}`
  r7[cN1] = `EXERCICE AU ${ex.dateFin ? new Date(ex.dateFin).getFullYear() - 1 : 'N-1'}`
  rows.push(r7)

  // ── Row 8: empty sub-row ──
  rows.push(emptyRow(C))

  // Header area merges (rows 7-8 = indices 7,8)
  merges.push(m(7, 0, 8, 0))   // A8:A9  - REF spans 2 rows
  merges.push(m(7, 1, 8, 6))   // B8:G9  - LIBELLES spans 2 rows, 6 cols
  merges.push(m(7, 7, 8, 7))   // H8:H9  - NOTE spans 2 rows

  // ── Helper to make a data row ──
  const makeRow = (
    ref: string | null, label: string, letter: string | null,
    note: string | number | null, valN: number | null, valN1: number | null,
  ): Row => {
    const row = emptyRow(C)
    row[cRef] = ref
    row[1] = label
    row[cLetter] = letter
    row[cNote] = note
    row[cN] = valN
    row[cN1] = valN1
    return row
  }

  // Helper to add merge for LIBELLES label cell B:F on data rows
  const addLabelMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 1, rowIdx, 5))
  }

  // Helper to add merge for section headers B:F
  const addSectionMerge = (rowIdx: number): void => {
    merges.push(m(rowIdx, 1, rowIdx, 5))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // ZA: Trésorerie nette au 1er janvier
  // Trésorerie actif N-1 = getActifBrut for cash accounts from balN1
  // Trésorerie passif N-1 = getPassif for account 56 from balN1
  const tresoActifN1 = getActifBrut(balN1, ['50', '51', '52', '53', '54', '55', '57', '58'])
  const tresoPassifN1 = getPassif(balN1, ['56'])
  const ZA_n = tresoActifN1 - tresoPassifN1
  const ZA_n1 = 0 // would need balN-2 which we don't have

  // FA: Capacité d'Autofinancement Globale (CAFG)
  // CAFG = Résultat Net + Dotations(681,691,697) - Reprises(791,797,798,799) + VCN cessions(81) - Prix cession(82)
  const resultatNet_n = -getBalanceSolde(bal, ['13'])
  const dotations_n = getCharges(bal, ['681', '691', '697'])
  const reprises_n = getProduits(bal, ['791', '797', '798', '799'])
  const vcnCessions_n = getCharges(bal, ['81'])
  const prixCessions_n = getProduits(bal, ['82'])
  const FA_n = resultatNet_n + dotations_n - reprises_n + vcnCessions_n - prixCessions_n

  const resultatNet_n1 = -getBalanceSolde(balN1, ['13'])
  const dotations_n1 = getCharges(balN1, ['681', '691', '697'])
  const reprises_n1 = getProduits(balN1, ['791', '797', '798', '799'])
  const vcnCessions_n1 = getCharges(balN1, ['81'])
  const prixCessions_n1 = getProduits(balN1, ['82'])
  const FA_n1 = resultatNet_n1 + dotations_n1 - reprises_n1 + vcnCessions_n1 - prixCessions_n1

  // Manual entry fields (default 0)
  const FB_n = 0, FB_n1 = 0
  const FC_n = 0, FC_n1 = 0
  const FD_n = 0, FD_n1 = 0
  const FE_n = 0, FE_n1 = 0

  // Subtotal: variation du BF
  const varBF_n = FB_n + FC_n + FD_n + FE_n
  const varBF_n1 = FB_n1 + FC_n1 + FD_n1 + FE_n1

  // ZB: Flux de trésorerie provenant des activités opérationnelles
  const ZB_n = FA_n + FB_n + FC_n + FD_n + FE_n
  const ZB_n1 = FA_n1 + FB_n1 + FC_n1 + FD_n1 + FE_n1

  // Investment activities (manual entry, default 0)
  const FF_n = 0, FF_n1 = 0
  const FG_n = 0, FG_n1 = 0
  const FH_n = 0, FH_n1 = 0
  const FI_n = 0, FI_n1 = 0
  const FJ_n = 0, FJ_n1 = 0

  // ZC: Flux de trésorerie provenant des activités d'investissement
  const ZC_n = FF_n + FG_n + FH_n + FI_n + FJ_n
  const ZC_n1 = FF_n1 + FG_n1 + FH_n1 + FI_n1 + FJ_n1

  // Equity financing (manual entry, default 0)
  const FK_n = 0, FK_n1 = 0
  const FL_n = 0, FL_n1 = 0
  const FM_n = 0, FM_n1 = 0
  const FN_n = 0, FN_n1 = 0

  // ZD: Flux de trésorerie provenant des capitaux propres
  const ZD_n = FK_n + FL_n + FM_n + FN_n
  const ZD_n1 = FK_n1 + FL_n1 + FM_n1 + FN_n1

  // Foreign capital financing (manual entry, default 0)
  const FO_n = 0, FO_n1 = 0
  const FP_n = 0, FP_n1 = 0
  const FQ_n = 0, FQ_n1 = 0

  // ZE: Flux de trésorerie provenant des capitaux étrangers
  const ZE_n = FO_n + FP_n + FQ_n
  const ZE_n1 = FO_n1 + FP_n1 + FQ_n1

  // ZF: Flux de trésorerie provenant des activités de financement (D+E)
  const ZF_n = ZD_n + ZE_n
  const ZF_n1 = ZD_n1 + ZE_n1

  // ZG: VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE (B+C+F)
  const ZG_n = ZB_n + ZC_n + ZF_n
  const ZG_n1 = ZB_n1 + ZC_n1 + ZF_n1

  // ZH: Trésorerie nette au 31 Décembre (G+A)
  const ZH_n = ZA_n + ZG_n
  const ZH_n1 = ZA_n1 + ZG_n1

  // Control: Trésorerie actif N - Trésorerie passif N
  const tresoActifN = getActifBrut(bal, ['50', '51', '52', '53', '54', '55', '57', '58'])
  const tresoPassifN = getPassif(bal, ['56'])
  const controle_n = tresoActifN - tresoPassifN
  const controle_n1 = ZA_n // N-1 control = opening treasury which is ZA_n

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA ROWS (starting at row index 9)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── ZA: Trésorerie nette au 1er janvier ──
  rows.push(makeRow('ZA', 'Trésorerie nette au 1er janvier\n(Trésorerie actif N-1 - Trésorerie passif N-1)', 'A', null, ZA_n, ZA_n1))
  addLabelMerge(rows.length - 1)

  // ── Section header: Flux opérationnels ──
  rows.push(makeRow(null, 'Flux de trésorerie provenant des activités opérationnelles', null, null, null, null))
  addSectionMerge(rows.length - 1)

  // ── FA: CAFG ──
  rows.push(makeRow('FA', 'Capacité d\'Autofinancement Globale (CAFG)', null, null, FA_n, FA_n1))
  addLabelMerge(rows.length - 1)

  // ── FB: Variation actif circulant HAO ──
  rows.push(makeRow('FB', '- Variation d\'actif circulant HAO (1)', null, null, FB_n, FB_n1))
  addLabelMerge(rows.length - 1)

  // ── FC: Variation des stocks ──
  rows.push(makeRow('FC', '- Variation des stocks', null, null, FC_n, FC_n1))
  addLabelMerge(rows.length - 1)

  // ── FD: Variation des créances ──
  rows.push(makeRow('FD', '- Variation des créances', null, null, FD_n, FD_n1))
  addLabelMerge(rows.length - 1)

  // ── FE: Variation du passif circulant ──
  rows.push(makeRow('FE', '+ Variation du passif circulant (1)', null, null, FE_n, FE_n1))
  addLabelMerge(rows.length - 1)

  // ── Variation du BF sub-row ──
  const rVarBF = emptyRow(C)
  rVarBF[1] = 'Variation du BF lié aux activités opérationnelles (FB+FC+FD+FE) :'
  rVarBF[cN] = varBF_n
  rVarBF[cN1] = varBF_n1
  rows.push(rVarBF)
  addLabelMerge(rows.length - 1)

  // ── ZB: Flux opérationnels ──
  rows.push(makeRow('ZB', 'Flux de trésorerie provenant des activités opérationnelles (Somme FA à FE)', 'B', null, ZB_n, ZB_n1))
  addLabelMerge(rows.length - 1)

  // ── Section header: Investissements ──
  rows.push(makeRow(null, 'Flux de trésorerie provenant des activités d\'investissements', null, null, null, null))
  addSectionMerge(rows.length - 1)

  // ── FF: Décaissements immob incorporelles ──
  rows.push(makeRow('FF', '- Décaissements liés aux acquisitions d\'immobilisations incorporelles', null, null, FF_n, FF_n1))
  addLabelMerge(rows.length - 1)

  // ── FG: Décaissements immob corporelles ──
  rows.push(makeRow('FG', '- Décaissements liés aux acquisitions d\'immobilisations corporelles', null, null, FG_n, FG_n1))
  addLabelMerge(rows.length - 1)

  // ── FH: Décaissements immob financières ──
  rows.push(makeRow('FH', '- Décaissements liés aux acquisitions d\'immobilisations financières', null, null, FH_n, FH_n1))
  addLabelMerge(rows.length - 1)

  // ── FI: Encaissements cessions incorporelles et corporelles ──
  rows.push(makeRow('FI', '+ Encaissements liés aux cessions d\'immobilisations incorporelles et corporelles', null, null, FI_n, FI_n1))
  addLabelMerge(rows.length - 1)

  // ── FJ: Encaissements cessions financières ──
  rows.push(makeRow('FJ', '+ Encaissements liés aux cessions d\'immobilisations financières', null, null, FJ_n, FJ_n1))
  addLabelMerge(rows.length - 1)

  // ── ZC: Flux investissements ──
  rows.push(makeRow('ZC', 'Flux de trésorerie provenant des activités d\'investissement (somme FF à FJ)', 'C', null, ZC_n, ZC_n1))
  addLabelMerge(rows.length - 1)

  // ── Section header: Capitaux propres ──
  rows.push(makeRow(null, 'Flux de trésorerie provenant du financement par les capitaux propres', null, null, null, null))
  addSectionMerge(rows.length - 1)

  // ── FK: Augmentations de capital ──
  rows.push(makeRow('FK', '+ Augmentations de capital par apports nouveaux', null, null, FK_n, FK_n1))
  addLabelMerge(rows.length - 1)

  // ── FL: Subventions d'investissement reçues ──
  rows.push(makeRow('FL', '+ Subventions d\'investissement reçues', null, null, FL_n, FL_n1))
  addLabelMerge(rows.length - 1)

  // ── FM: Prélèvements sur le capital ──
  rows.push(makeRow('FM', '- Prélèvements sur le capital', null, null, FM_n, FM_n1))
  addLabelMerge(rows.length - 1)

  // ── FN: Dividendes versés ──
  rows.push(makeRow('FN', '- Dividendes versés', null, null, FN_n, FN_n1))
  addLabelMerge(rows.length - 1)

  // ── ZD: Flux capitaux propres ──
  rows.push(makeRow('ZD', 'Flux de trésorerie provenant des capitaux propres (somme FK à FN)', 'D', null, ZD_n, ZD_n1))
  addLabelMerge(rows.length - 1)

  // ── Section header: Capitaux étrangers ──
  rows.push(makeRow(null, 'Trésorerie provenant du financement par les capitaux étrangers', null, null, null, null))
  addSectionMerge(rows.length - 1)

  // ── FO: Emprunts ──
  rows.push(makeRow('FO', '+ Emprunts (2)', null, null, FO_n, FO_n1))
  addLabelMerge(rows.length - 1)

  // ── FP: Autres dettes financières ──
  rows.push(makeRow('FP', '+ Autres dettes financières diverses (3)', null, null, FP_n, FP_n1))
  addLabelMerge(rows.length - 1)

  // ── FQ: Remboursements ──
  rows.push(makeRow('FQ', '- Remboursements des emprunts et autres dettes financières', null, null, FQ_n, FQ_n1))
  addLabelMerge(rows.length - 1)

  // ── ZE: Flux capitaux étrangers ──
  rows.push(makeRow('ZE', 'Flux de trésorerie provenant des capitaux étrangers (somme FO à FQ)', 'E', null, ZE_n, ZE_n1))
  addLabelMerge(rows.length - 1)

  // ── ZF: Flux financement (D+E) ──
  rows.push(makeRow('ZF', 'Flux de trésorerie provenant des activités de financement (D+E)', 'F', null, ZF_n, ZF_n1))
  addLabelMerge(rows.length - 1)

  // ── ZG: VARIATION DE LA TRÉSORERIE NETTE (B+C+F) ──
  rows.push(makeRow('ZG', 'VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE (B+C+F)', 'G', null, ZG_n, ZG_n1))
  addLabelMerge(rows.length - 1)

  // ── ZH: Trésorerie nette au 31 Décembre (G+A) ──
  rows.push(makeRow('ZH', 'Trésorerie nette au 31 Décembre (G+A)', 'H', null, ZH_n, ZH_n1))
  addLabelMerge(rows.length - 1)

  // ── Contrôle row ──
  rows.push(makeRow(null, 'Contrôle : Trésorerie actif N - Trésorerie passif N', null, null, controle_n, controle_n1))
  addLabelMerge(rows.length - 1)

  // ── Empty separator ──
  rows.push(emptyRow(C))

  // ── Footnotes ──
  const fn1 = emptyRow(C)
  fn1[0] = '(1)'
  fn1[1] = 'A l\'exclusion des variations des créances et dettes liées aux activités d\'investissement'
  rows.push(fn1)
  addLabelMerge(rows.length - 1)

  const fn2 = emptyRow(C)
  fn2[0] = '(2)'
  fn2[1] = 'Comptes 161, 162, 1661, 1662'
  rows.push(fn2)
  addLabelMerge(rows.length - 1)

  const fn3 = emptyRow(C)
  fn3[0] = '(3)'
  fn3[1] = 'Comptes 16 sauf Comptes (161, 162, 1661, 1662) et comptes 18'
  rows.push(fn3)
  addLabelMerge(rows.length - 1)

  // Pad to ~44 rows
  while (rows.length < 44) rows.push(emptyRow(C))

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 14 : FICHE R4 — 10 columns (A=0 to J=9), ~65 rows
// ────────────────────────────────────────────────────────────────────────────

interface NoteEntry {
  note: string
  intitule: string
  applicable: string  // 'X' or ''
  nonApplicable: string  // 'X' or ''
}

const NOTES_LIST: NoteEntry[] = [
  { note: 'NOTE 1', intitule: 'DETTES GARANTIES PAR DES SURETES REELLES ET LES ENGAGEMENTS FINANCIERS', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 2', intitule: 'INFORMATIONS OBLIGATOIRES', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 3A', intitule: 'IMMOBILISATIONS BRUTES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 3B', intitule: 'BIENS PRIS EN LOCATION-ACQUISITION', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 3C', intitule: 'IMMOBILISATIONS : AMORTISSEMENTS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 3C bis', intitule: 'IMMOBILISATIONS : DEPRECIATIONS', applicable: '', nonApplicable: '' },
  { note: 'NOTE 3D', intitule: 'IMMOBILISATIONS : PLUS-VALUES ET MOINS VALUE DE CESSION', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 3E', intitule: 'INFORMATIONS SUR LES REEVALUATIONS EFFECTUEES PAR L\'ENTITE', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 4', intitule: 'IMMOBILISATIONS FINANCIERES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 5', intitule: 'ACTIF CIRCULANT ET DETTES CIRCULANTES HAO', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 6', intitule: 'STOCKS ET ENCOURS', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 7', intitule: 'CLIENTS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 8', intitule: 'AUTRES CREANCES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 8A', intitule: 'TABLEAU D\'ETALEMENT DES CHARGES IMMOBILISEES', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 8B', intitule: 'TABLEAU D\'ETALEMENT DES PROVISIONS POUR CHARGES A REPARTIR', applicable: '', nonApplicable: '' },
  { note: 'NOTE 8C', intitule: 'TABLEAU D\'ETALEMENT DES PROVISIONS POUR ENGAGEMENT DE RETRAITE', applicable: '', nonApplicable: '' },
  { note: 'NOTE 9', intitule: 'TITRES DE PLACEMENT', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 10', intitule: 'VALEURS A ENCAISSER', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 11', intitule: 'DISPONIBILITES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 12', intitule: 'ECARTS DE CONVERSION ET TRANSFERT DE CHARGES', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 13', intitule: 'CAPITAL : VALEUR NOMINALE DES ACTIONS OU PARTS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 14', intitule: 'PRIMES ET RESERVES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 15A', intitule: 'SUBVENTIONS ET PROVISIONS REGLEMENTEES', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 15B', intitule: 'AUTRES FONDS PROPRES', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 16A', intitule: 'DETTES FINANCIERES ET RESSOURCES ASSIMILEES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 16B', intitule: 'ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES : (METHODE ACTUARIELLE)', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 16B bis', intitule: 'ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES : (METHODE ACTUARIELLE SUITE)', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 16C', intitule: 'ACTIFS ET PASSIFS EVENTUELS', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 17', intitule: 'FOURNISSEURS D\'EXPLOITATION', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 18', intitule: 'DETTES FISCALES ET SOCIALES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 19', intitule: 'AUTRES DETTES ET PROVISIONS POUR RISQUES A COURT TERME', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 20', intitule: 'BANQUES, CREDIT D\'ESCOMPTE ET DE TRESORERIE', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 21', intitule: 'CHIFFRE D\'AFFAIRES ET AUTRES PRODUITS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 22', intitule: 'ACHATS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 23', intitule: 'TRANSPORTS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 24', intitule: 'SERVICES EXTERIEURS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 25', intitule: 'IMPOTS ET TAXES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 26', intitule: 'AUTRES CHARGES', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 27A', intitule: 'CHARGES DE PERSONNEL', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 27B', intitule: 'EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 28', intitule: 'DOTATIONS ET CHARGES POUR PROVISIONS ET DEPRECIATIONS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 29', intitule: 'CHARGES ET REVENUS FINANCIERS', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 30', intitule: 'AUTRES CHARGES ET PRODUITS HAO', applicable: 'X', nonApplicable: '' },
  { note: 'NOTE 31', intitule: 'REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EX', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 32', intitule: 'PRODUCTION DE L\'EXERCICE', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 33', intitule: 'ACHATS DESTINES A LA PRODUCTION', applicable: '', nonApplicable: 'X' },
  { note: 'NOTE 34', intitule: 'FICHE DE SYNTHESE DES PRINCIPAUX INDICATEURS FINANCIERS', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 35', intitule: 'LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES A FOURNIR', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 36', intitule: 'TABLES DES CODES', applicable: 'X', nonApplicable: 'X' },
  { note: 'NOTE 37', intitule: 'DETERMINATION IMPOT SUR RESULTAT', applicable: '', nonApplicable: '' },
  { note: 'NOTE 38', intitule: 'EVENEMENTS POSTERIEURS A LA CLOTURE DE L\'EXERCICE', applicable: '', nonApplicable: '' },
  { note: 'NOTE 39', intitule: 'CHANGEMENTS DE METHODES COMPTABLES, D\'ESTIMATIONS ET CORRECTIONS D\'ERREURS', applicable: '', nonApplicable: '' },
  { note: 'NOTES DGI & INS', intitule: 'ETATS SUPPLEMENTAIRES DGI et INS', applicable: '', nonApplicable: '' },
]

function buildFicheR4(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10 // total columns A(0)..J(9)
  const rows: Row[] = []
  const merges = [] as ReturnType<typeof m>[]

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 10 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1: sheet label top-right ──
  rows.push(rowAt(C, [8, 'FICHE R4']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 8,
  })
  // Adjust: adresse starts at B4 (col 1) instead of default
  if (hdr.length >= 2) {
    hdr[1][1] = ent.adresse || '' // adresse col B
    hdr[1][7] = 'Sigle usuel :'
    hdr[1][8] = ent.sigle || ''
  }
  // Adjust L5: NCC col, exercice col, duree col
  if (hdr.length >= 3) {
    hdr[2][2] = ent.ncc || ''
    hdr[2][4] = 'Exercice clos le :'
    hdr[2][5] = ex.dateFin ? new Date(ex.dateFin).toLocaleDateString('fr-FR') : ''
    hdr[2][7] = 'Durée (en mois) :'
    hdr[2][8] = ex.dureeMois
  }
  rows.push(...hdr) // rows 2,3,4,5

  // ── Row 6: full title ──
  rows.push(rowAt(C, [0, 'FICHE R4 : FICHE RECAPITULATIVE DES NOTES ANNEXES PRESENTEES (1)']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7: column headers ──
  const r7 = emptyRow(C)
  r7[0] = 'NOTES'
  r7[1] = 'INTITULES'
  r7[8] = 'A'
  r7[9] = 'N/A'
  rows.push(r7)
  merges.push(m(7, 1, 7, 7)) // B8:H8

  // ── Rows 8-60: Notes data rows ──
  for (const entry of NOTES_LIST) {
    const row = emptyRow(C)
    row[0] = entry.note
    row[1] = entry.intitule
    row[8] = entry.applicable
    row[9] = entry.nonApplicable
    rows.push(row)
    merges.push(m(rows.length - 1, 1, rows.length - 1, 7)) // B:H merged for intitulé
  }

  // ── Empty separator row ──
  rows.push(emptyRow(C))

  // ── Footnote rows ──
  const fn1 = emptyRow(C)
  fn1[0] = '(1)'
  fn1[1] = 'les Notes non documentées ne doivent pas être jointes aux états financiers.'
  rows.push(fn1)
  merges.push(m(rows.length - 1, 1, rows.length - 1, 9))

  const fn2 = emptyRow(C)
  fn2[0] = '(2)'
  fn2[1] = 'A : Applicable    A/N : Non applicable.'
  rows.push(fn2)
  merges.push(m(rows.length - 1, 1, rows.length - 1, 9))

  const fn3 = emptyRow(C)
  fn3[1] = 'Par exemple pour une entité qui n\'a pas de stocks, la Note 6 est non applicable et ne doit pas être jointe aux états financiers.'
  rows.push(fn3)
  merges.push(m(rows.length - 1, 1, rows.length - 1, 9))

  // Pad to ~65 rows
  while (rows.length < 65) rows.push(emptyRow(C))

  return { rows, merges }
}

export { buildTFT, buildFicheR4 }
