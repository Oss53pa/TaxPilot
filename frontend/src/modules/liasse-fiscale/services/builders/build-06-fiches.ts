/**
 * build-06-fiches.ts
 * Builders for sheets 6-8 of the SYSCOHADA liasse fiscale:
 *   - Sheet 6: FICHE R1 (22 cols, ~64 rows) - Identification & general information
 *   - Sheet 7: FICHE R2 (38 cols, ~61 rows) - Activity & entity control
 *   - Sheet 8: FICHE R3 (10 cols, ~36 rows) - Directors & board members
 */

import { SheetData, Row, emptyRow, rowAt, m, formatDate, headerRows } from './helpers'
import type { EntrepriseData, ExerciceData, BalanceEntry } from './helpers'

// ────────────────────────────────────────────────────────────────────────────
// Sheet 6 : FICHE R1 — 22 columns (A..V), ~64 rows
// ────────────────────────────────────────────────────────────────────────────

function buildFicheR1(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 22 // total columns A(0)..V(21)
  const rows: Row[] = []
  const merges = [] as ReturnType<typeof m>[]

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 4 -']))
  merges.push(m(0, 0, 0, C - 1)) // A1:V1

  // ── Row 1: sheet label top-right ──
  rows.push(rowAt(C, [17, 'FICHE R1']))
  merges.push(m(1, 17, 1, 21)) // R2:V2

  // ── Rows 2-5: standard header ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 4,   // denomination in col E
    sigleCol: 18,   // S
    sigleValCol: 21, // V
  })
  // Adjust: adresse goes in col D(3), NCC in col E(4), exercice in col J(9), duree in col U(20)
  if (hdr.length >= 2) {
    hdr[1][3] = ent.adresse || '' // adresse col D
  }
  if (hdr.length >= 3) {
    hdr[2][4] = ent.ncc || ''    // NCC col E
    hdr[2][9] = 'Exercice clos le :'
    hdr[2][10] = formatDate(ex.dateFin)
    hdr[2][20] = ex.dureeMois    // duree col U
  }
  rows.push(...hdr) // rows 2,3,4,5

  // ── Row 6: full title ──
  rows.push(rowAt(C, [0, 'FICHE R1 : FICHE D\'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 1']))
  merges.push(m(6, 0, 6, C - 1)) // A7:V7

  // ── Row 7 (ZA): Exercice comptable ──
  const r7 = emptyRow(C)
  r7[0] = 'ZA'
  r7[2] = 'EXERCICE COMPTABLE :'
  r7[6] = 'DU :'
  r7[7] = formatDate(ex.dateDebut)
  r7[10] = 'AU :'
  r7[11] = formatDate(ex.dateFin)
  rows.push(r7)

  // ── Row 8: spacer ──
  rows.push(emptyRow(C))

  // ── Row 9 (ZB + ZD): Date d'arrete + ZD col T ──
  const r9 = emptyRow(C)
  r9[0] = 'ZB'
  r9[2] = 'DATE D\'ARRETE EFFECTIF DES COMPTES :'
  r9[10] = formatDate(ex.dateFin)
  r9[19] = 'ZD' // col T
  r9[20] = formatDate(ex.dateFin)
  rows.push(r9)

  // ── Row 10: spacer ──
  rows.push(emptyRow(C))

  // ── Row 11 (ZC): Exercice precedent ──
  const r11 = emptyRow(C)
  r11[0] = 'ZC'
  r11[2] = 'EXERCICE PRECEDENT CLOS LE :'
  r11[8] = formatDate(ent.exercice_precedent_fin)
  r11[12] = 'DUREE EXERCICE PRECEDENT EN MOIS :'
  r11[17] = 12
  rows.push(r11)

  // ── Row 12: spacer ──
  rows.push(emptyRow(C))

  // ── Row 13 (ZE + ZF): Greffe / Registre commerce + Numero repertoire ──
  const r13 = emptyRow(C)
  r13[0] = 'ZE'
  r13[2] = 'N° d\'enregistrement au Greffe :'
  r13[6] = ent.greffe || ''
  r13[9] = 'ZF'
  r13[10] = 'N° Répertoire des Entités :'
  r13[14] = ent.numero_repertoire_entites || ''
  rows.push(r13)

  // ── Row 14: spacer ──
  rows.push(emptyRow(C))

  // ── Row 15: spacer ──
  rows.push(emptyRow(C))

  // ── Row 16 (ZG + ZH + ZI): Caisse sociale, code importateur, branche activite ──
  const r16 = emptyRow(C)
  r16[0] = 'ZG'
  r16[2] = 'N° Caisse Sociale :'
  r16[4] = ent.numero_caisse_sociale || '' // col E
  r16[7] = 'ZH'
  r16[8] = 'N° Code Importateur :'
  r16[10] = ent.numero_code_importateur || ''
  r16[15] = 'ZI'
  r16[16] = 'Code Activité :'
  r16[18] = ent.branche_activite || ''
  rows.push(r16)

  // ── Rows 17-18: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 19 (ZJ): Denomination + Sigle ──
  const r19 = emptyRow(C)
  r19[0] = 'ZJ'
  r19[2] = 'Dénomination sociale :'
  r19[6] = ent.denomination || ''
  r19[14] = 'Sigle :'
  r19[16] = ent.sigle || ''
  rows.push(r19)

  // ── Rows 20-21: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 22 (ZK): Telephone, email, code ville, BP, ville ──
  const r22 = emptyRow(C)
  r22[0] = 'ZK'
  r22[2] = 'Téléphone :'
  r22[4] = ''
  r22[7] = 'Email :'
  r22[9] = ''
  r22[12] = 'Code Ville :'
  r22[14] = ent.code_ville || ''
  r22[16] = 'B.P. :'
  r22[17] = ent.boite_postale || ''
  r22[19] = 'Ville :'
  r22[20] = ent.ville || ''
  rows.push(r22)

  // ── Rows 23-24: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 25 (ZL): Adresse geographique ──
  const r25 = emptyRow(C)
  r25[0] = 'ZL'
  r25[2] = 'Adresse géographique :'
  r25[6] = ent.adresse || ''
  rows.push(r25)

  // ── Rows 26: spacer ──
  rows.push(emptyRow(C))

  // ── Row 27 (ZN col P): linked ──
  const r27 = emptyRow(C)
  r27[15] = 'ZN'
  r27[16] = ent.code_secteur || ''
  rows.push(r27)

  // ── Row 28 (ZM): Branche activite + % capacite ──
  const r28 = emptyRow(C)
  r28[0] = 'ZM'
  r28[2] = 'Branche d\'activité :'
  r28[6] = ent.branche_activite || ''
  r28[14] = '% Capacité de production utilisée :'
  r28[19] = ent.pourcentage_capacite_production ?? ''
  rows.push(r28)

  // ── Rows 29-30: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 31 (ZO): Personne contact ──
  const r31 = emptyRow(C)
  r31[0] = 'ZO'
  r31[2] = 'Personne à contacter :'
  r31[6] = ent.personne_contact || ''
  rows.push(r31)

  // ── Rows 32-33: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 34 (ZP): Expert comptable ──
  const r34 = emptyRow(C)
  r34[0] = 'ZP'
  r34[2] = 'Expert comptable - Nom :'
  r34[6] = ent.expert_nom || ''
  r34[12] = 'Adresse :'
  r34[14] = ent.expert_adresse || ''
  rows.push(r34)

  // ── Rows 35-37: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 38 (ZQ): CAC info (attestation visa) ──
  const r38 = emptyRow(C)
  r38[0] = 'ZQ'
  r38[2] = 'Commissaire aux comptes - Attestation / Visa :'
  r38[10] = ent.cac_numero_inscription || ''
  rows.push(r38)

  // ── Rows 39-41: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 42 (ZR): CAC nom + adresse ──
  const r42 = emptyRow(C)
  r42[0] = 'ZR'
  r42[2] = 'Commissaire aux comptes - Nom :'
  r42[6] = ent.cac_nom || ''
  r42[12] = 'Adresse :'
  r42[14] = ent.cac_adresse || ''
  rows.push(r42)

  // ── Rows 43-45: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 46 (ZS): Etats financiers approuves ──
  const r46 = emptyRow(C)
  r46[0] = 'ZS'
  r46[2] = 'États financiers approuvés :'
  r46[8] = 'Oui'
  r46[9] = ent.etats_financiers_approuves ? 'X' : ''
  r46[11] = 'Non'
  r46[12] = ent.etats_financiers_approuves ? '' : 'X'
  rows.push(r46)

  // ── Rows 47-48: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 49 (ZT + ZW): Nom dirigeant + Domiciliations bancaires header ──
  const r49 = emptyRow(C)
  r49[0] = 'ZT'
  r49[2] = 'Nom du dirigeant :'
  r49[6] = ent.nom_dirigeant || ''
  r49[9] = 'ZW'
  r49[10] = 'Domiciliations bancaires'
  rows.push(r49)

  // ── Row 50: spacer ──
  rows.push(emptyRow(C))

  // ── Rows 51-61: Domiciliations bancaires ──
  const bankAccounts = ent.domiciliations_bancaires || []
  for (let i = 0; i < 11; i++) {
    const rb = emptyRow(C)
    if (i < bankAccounts.length) {
      rb[10] = bankAccounts[i].banque || ''
      rb[15] = bankAccounts[i].numero_compte || ''
    }
    rows.push(rb)
  }

  // ── Row 52 (ZU): Fonction dirigeant - placed within the bank rows area ──
  // ZU is at row 52, which is rows[52]. We already pushed row 51 as first bank row.
  // We need to go back and set ZU on what will be row index 52.
  // Row 51 = bank[0] (index 51), row 52 = bank[1] (index 52)
  if (rows.length > 52) {
    rows[52][0] = 'ZU'
    rows[52][2] = 'Fonction du dirigeant :'
    rows[52][6] = ent.fonction_dirigeant || ''
  }

  // ── Row 55 (ZV): Date signature ──
  if (rows.length > 55) {
    rows[55][0] = 'ZV'
    rows[55][2] = 'Date de signature des états financiers :'
    rows[55][6] = formatDate(ent.date_signature_etats)
  }

  // ── Row 62: Signature ──
  // Pad to row 62 if needed
  while (rows.length < 62) {
    rows.push(emptyRow(C))
  }
  rows.push(rowAt(C, [0, 'Signature']))

  // Pad to ~64 rows
  while (rows.length < 64) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 7 : FICHE R2 — 38 columns (A..AL), ~61 rows
// ────────────────────────────────────────────────────────────────────────────

function buildFicheR2(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 38 // total columns A(0)..AL(37)
  const rows: Row[] = []
  const merges = [] as ReturnType<typeof m>[]

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 5 -']))
  merges.push(m(0, 0, 0, 37)) // A1:AL1

  // ── Row 1: sheet label top-right ──
  rows.push(rowAt(C, [32, 'FICHE R2']))
  merges.push(m(1, 32, 1, 37)) // AG2:AL2

  // ── Rows 2-5: standard header adapted for 38 cols ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 4,
    sigleCol: 34,  // AI
    sigleValCol: 37, // AL
  })
  rows.push(...hdr) // rows 2,3,4,5

  // ── Row 6: full title ──
  rows.push(rowAt(C, [0, 'FICHE R2 : FICHE D\'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 2']))
  merges.push(m(6, 0, 6, C - 1)) // A7:AL7

  // ── Row 7: Control header ──
  const r7 = emptyRow(C)
  r7[21] = 'Contrôle de l\'Entité (cocher la case)'
  rows.push(r7)

  // ── Row 8 (ZX + ZZ5): Forme juridique + Public sector control ──
  const r8 = emptyRow(C)
  r8[0] = 'ZX'
  r8[2] = 'Forme juridique :'
  r8[6] = ent.code_forme_juridique || ''
  r8[8] = ent.forme_juridique || ''
  r8[21] = 'ZZ5'
  r8[23] = 'Entité du secteur public'
  r8[30] = ''  // checkbox placeholder
  rows.push(r8)

  // ── Row 9: spacer ──
  rows.push(emptyRow(C))

  // ── Row 10 (ZY + ZZ6): Regime fiscal + Private national control ──
  const r10 = emptyRow(C)
  r10[0] = 'ZY'
  r10[2] = 'Régime fiscal :'
  r10[6] = ent.code_regime || ''
  r10[8] = ent.regime || ''
  r10[21] = 'ZZ6'
  r10[23] = 'Entité du secteur privé national'
  r10[30] = '' // checkbox placeholder
  rows.push(r10)

  // ── Row 11: spacer ──
  rows.push(emptyRow(C))

  // ── Row 12 (ZZ1 + ZZ7): Pays siege + Private foreign control ──
  const r12 = emptyRow(C)
  r12[0] = 'ZZ1'
  r12[2] = 'Pays du siège social :'
  r12[6] = ent.code_pays || ''
  r12[21] = 'ZZ7'
  r12[23] = 'Entité du secteur privé étranger'
  r12[30] = '' // checkbox placeholder
  rows.push(r12)

  // ── Row 13: spacer ──
  rows.push(emptyRow(C))

  // ── Row 14 (ZZ2): Nombre etablissements ──
  const r14 = emptyRow(C)
  r14[0] = 'ZZ2'
  r14[2] = 'Nombre d\'établissements dans le pays :'
  r14[10] = ent.nombre_etablissements ?? ''
  rows.push(r14)

  // ── Row 15: spacer ──
  rows.push(emptyRow(C))

  // ── Row 16 (ZZ3): Nombre etablissements hors pays ──
  const r16 = emptyRow(C)
  r16[0] = 'ZZ3'
  r16[2] = 'Nombre d\'établissements hors du pays :'
  r16[10] = ''
  rows.push(r16)

  // ── Rows 17-18: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 19 (ZZ4): Premiere annee exercice ──
  const r19 = emptyRow(C)
  r19[0] = 'ZZ4'
  r19[2] = 'Première année d\'exercice :'
  r19[8] = ''
  rows.push(r19)

  // ── Rows 20-21: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Row 22: ACTIVITE DE L'ENTITE ──
  rows.push(rowAt(C, [0, 'ACTIVITE DE L\'ENTITE']))
  merges.push(m(22, 0, 22, C - 1))

  // ── Row 23: spacer ──
  rows.push(emptyRow(C))

  // ── Row 24: Column headers for activities table ──
  const rHdr = emptyRow(C)
  rHdr[0] = 'N°'
  rHdr[2] = 'Nature de l\'activité'
  rHdr[10] = 'Code NACEMA'
  rHdr[14] = 'Lieu d\'exercice'
  rHdr[20] = 'Chiffre d\'affaires HT (N)'
  rHdr[26] = 'Chiffre d\'affaires HT (N-1)'
  rHdr[32] = '% du CA total'
  rows.push(rHdr)

  // ── Rows 25-27: sub-headers / spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Rows 28-50: Activity rows (23 rows) ──
  for (let i = 0; i < 23; i++) {
    const rAct = emptyRow(C)
    if (i === 0 && ent.branche_activite) {
      rAct[0] = 1
      rAct[2] = ent.branche_activite
      rAct[10] = ent.code_secteur || ''
      rAct[14] = ent.ville || ''
    } else {
      rAct[0] = i > 0 ? i + 1 : null
    }
    rows.push(rAct)
  }

  // ── Row 51: Divers ──
  rows.push(rowAt(C, [0, 'Divers']))

  // ── Row 52: spacer ──
  rows.push(emptyRow(C))

  // ── Row 53: TOTAL ──
  const rTotal = emptyRow(C)
  rTotal[0] = 'TOTAL'
  rTotal[20] = '' // SUM placeholder for CA N
  rTotal[26] = '' // SUM placeholder for CA N-1
  rTotal[32] = '100%'
  rows.push(rTotal)

  // ── Rows 54-55: spacer ──
  rows.push(emptyRow(C))
  rows.push(emptyRow(C))

  // ── Rows 56-59: Footnotes ──
  rows.push(rowAt(C, [0, '(1) Préciser la nature de l\'activité (industrie, commerce, services, agriculture, etc.)']))
  rows.push(rowAt(C, [0, '(2) Indiquer le code NACEMA (Nomenclature d\'Activités des Etats Membres d\'Afrique)']))
  rows.push(rowAt(C, [0, '(3) Préciser le lieu d\'exercice de chaque activité']))
  rows.push(rowAt(C, [0, '(4) Indiquer le chiffre d\'affaires HT réalisé par activité']))

  // ── Pad to ~61 rows ──
  while (rows.length < 61) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet 8 : FICHE R3 — 10 columns (A..J), ~36 rows
// ────────────────────────────────────────────────────────────────────────────

function buildFicheR3(
  _bal: BalanceEntry[],
  _balN1: BalanceEntry[],
  ent: EntrepriseData,
  ex: ExerciceData,
): SheetData {
  const C = 10 // total columns A(0)..J(9)
  const rows: Row[] = []
  const merges = [] as ReturnType<typeof m>[]
  const dirigeants = ent.dirigeants || []

  // ── Row 0: page number ──
  rows.push(rowAt(C, [0, '- 6 -']))
  merges.push(m(0, 0, 0, 9)) // A1:J1

  // ── Row 1: sheet label top-right ──
  rows.push(rowAt(C, [8, 'FICHE R3']))
  merges.push(m(1, 8, 1, 9)) // I2:J2

  // ── Rows 2-5: standard header (10 cols) ──
  const hdr = headerRows(ent, ex, C, {
    labelCol: 0,
    valueCol: 2,
    sigleCol: 7,
    sigleValCol: 9,
  })
  rows.push(...hdr) // rows 2,3,4,5

  // ── Row 6: full title ──
  rows.push(rowAt(C, [0, 'FICHE R3 : FICHE D\'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 3']))
  merges.push(m(6, 0, 6, 9)) // A7:J7

  // ── Row 7: DIRIGEANTS section title ──
  rows.push(rowAt(C, [0, 'DIRIGEANTS (1)']))

  // ── Row 8: spacer ──
  rows.push(emptyRow(C))

  // ── Row 9: Column headers for dirigeants table ──
  const rDirHdr = emptyRow(C)
  rDirHdr[0] = 'Nom / Prénoms'
  rDirHdr[2] = 'Nationalité'
  rDirHdr[3] = 'Autres nationalités'
  rDirHdr[5] = 'Qualité'
  rDirHdr[6] = 'N° identification'
  rDirHdr[8] = 'Adresse'
  rows.push(rDirHdr)

  // ── Rows 10-19: Dirigeants data (max 10 rows) ──
  for (let i = 0; i < 10; i++) {
    const rDir = emptyRow(C)
    if (i < dirigeants.length) {
      const d = dirigeants[i]
      rDir[0] = `${d.nom || ''} ${d.prenoms || ''}`.trim()
      rDir[2] = '' // nationalite not in DirigeantInfo
      rDir[3] = '' // autres nationalites
      rDir[5] = d.qualite || ''
      rDir[6] = '' // numero identification
      rDir[8] = d.adresse || ''
    }
    rows.push(rDir)
  }

  // ── Row 20: spacer ──
  rows.push(emptyRow(C))

  // ── Rows 21-22: Footnotes ──
  rows.push(rowAt(C, [0, '(1) Dirigeants : Président, Directeur Général, Gérant, Administrateur Général, etc.']))
  rows.push(emptyRow(C))

  // ── Row 23: MEMBRES DU CONSEIL D'ADMINISTRATION ──
  rows.push(rowAt(C, [0, 'MEMBRES DU CONSEIL D\'ADMINISTRATION']))

  // ── Row 24: spacer ──
  rows.push(emptyRow(C))

  // ── Row 25: Column headers for board members ──
  const rBrdHdr = emptyRow(C)
  rBrdHdr[0] = 'Nom / Prénoms'
  rBrdHdr[2] = 'Nationalité'
  rBrdHdr[3] = 'Autres nationalités'
  rBrdHdr[5] = 'Qualité'
  rBrdHdr[6] = 'N° identification'
  rBrdHdr[8] = 'Adresse'
  rows.push(rBrdHdr)

  // ── Rows 26-35: Board members data (max 10 rows) ──
  // Board members are not separately typed in EntrepriseData;
  // we reuse dirigeants with qualite that indicates board membership,
  // or leave empty rows for manual filling.
  for (let i = 0; i < 10; i++) {
    rows.push(emptyRow(C))
  }

  // ── Pad to ~36 rows ──
  while (rows.length < 36) {
    rows.push(emptyRow(C))
  }

  return { rows, merges }
}

export { buildFicheR1, buildFicheR2, buildFicheR3 }
