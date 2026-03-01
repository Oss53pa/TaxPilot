import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps, BalanceEntry } from '../../types'
import { getActifBrut, getAmortProv, getBalanceSolde, fmt } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

interface ActifRowDef {
  ref: string; label: string; comptes: string[]; amort: string[]
  note?: string; isTotal?: boolean; indent?: number; bold?: boolean
}
interface PassifRowDef {
  ref: string; label: string; comptes: string[]
  note?: string; isTotal?: boolean; indent?: number; bold?: boolean
}

const ACTIF_ROWS: ActifRowDef[] = [
  { ref: 'AD', label: 'IMMOBILISATIONS INCORPORELLES', comptes: ['211','212','213','214','215','216','217'], amort: ['2811','2812','2813','2814','2815','2816','2817','2911','2912','2913','2914','2915','2916','2917'], note: '3', bold: true },
  { ref: 'AE', label: 'Frais de developpement et de prospection', comptes: ['211','212'], amort: ['2811','2812','2911','2912'], indent: 1 },
  { ref: 'AF', label: 'Brevets, licences, logiciels et droits similaires', comptes: ['213','214','215'], amort: ['2813','2814','2815','2913','2914','2915'], indent: 1 },
  { ref: 'AG', label: 'Fonds commercial et droit au bail', comptes: ['216'], amort: ['2816','2916'], indent: 1 },
  { ref: 'AH', label: 'Autres immobilisations incorporelles', comptes: ['217','218','219'], amort: ['2817','2818','2819','2917','2918','2919'], indent: 1 },
  { ref: 'AI', label: 'IMMOBILISATIONS CORPORELLES', comptes: ['22','231','232','233','234','235','237','238','241','242','243','244','245'], amort: ['282','2831','2832','2833','2834','2835','2837','2838','2841','2842','2843','2844','2845','292','2931','2932','2933','2934','2935','2937','2938','2941','2942','2943','2944','2945'], note: '3', bold: true },
  { ref: 'AJ', label: 'Terrains', comptes: ['22'], amort: ['282','292'], indent: 1 },
  { ref: 'AK', label: 'Batiments', comptes: ['231','232','233','234'], amort: ['2831','2832','2833','2834','2931','2932','2933','2934'], indent: 1 },
  { ref: 'AL', label: 'Amenagements, agencements et installations', comptes: ['235','237','238'], amort: ['2835','2837','2838','2935','2937','2938'], indent: 1 },
  { ref: 'AM', label: 'Materiel, mobilier et actifs biologiques', comptes: ['241','242','243','244'], amort: ['2841','2842','2843','2844','2941','2942','2943','2944'], indent: 1 },
  { ref: 'AN', label: 'Materiel de transport', comptes: ['245'], amort: ['2845','2945'], indent: 1 },
  { ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', comptes: ['251','252'], amort: [], note: '3', bold: true },
  { ref: 'AQ', label: 'IMMOBILISATIONS FINANCIERES', comptes: ['26','271','272','273','274','275','276','277'], amort: ['296','297'], note: '4', bold: true },
  { ref: 'AR', label: 'Titres de participation', comptes: ['26'], amort: ['296'], indent: 1 },
  { ref: 'AS', label: 'Autres immobilisations financieres', comptes: ['271','272','273','274','275','276','277'], amort: ['297'], indent: 1 },
  { ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISE', comptes: [], amort: [], isTotal: true },
  { ref: 'BA', label: 'ACTIF CIRCULANT HAO', comptes: ['485','486','487','488'], amort: ['498'], note: '5', bold: true },
  { ref: 'BB', label: 'STOCKS ET ENCOURS', comptes: ['31','32','33','34','35','36','37','38'], amort: ['391','392','393','394','395','396','397','398'], note: '6', bold: true },
  { ref: 'BG', label: 'CREANCES ET EMPLOIS ASSIMILES', comptes: ['409','411','412','413','414','415','416','418','43','44','45','46','47'], amort: ['490','491','492','493','494','495','496','497'], bold: true },
  { ref: 'BH', label: 'Fournisseurs avances versees', comptes: ['409'], amort: ['490'], note: '17', indent: 1 },
  { ref: 'BI', label: 'Clients', comptes: ['411','412','413','414','415','416','418'], amort: ['491'], note: '7', indent: 1 },
  { ref: 'BJ', label: 'Autres creances', comptes: ['43','44','45','46','47'], amort: ['492','493','494','495','496','497'], note: '8', indent: 1 },
  { ref: 'BK', label: 'TOTAL ACTIF CIRCULANT', comptes: [], amort: [], isTotal: true },
  { ref: 'BQ', label: 'Titres de placement', comptes: ['50'], amort: ['590'], note: '9' },
  { ref: 'BR', label: 'Valeurs a encaisser', comptes: ['51'], amort: ['591'], note: '10' },
  { ref: 'BS', label: 'Banques, cheques postaux, caisse et assimiles', comptes: ['52','53','54','55','56','57','58'], amort: ['592','593','594'], note: '11' },
  { ref: 'BT', label: 'TOTAL TRESORERIE-ACTIF', comptes: [], amort: [], isTotal: true },
  { ref: 'BU', label: 'Ecart de conversion-Actif', comptes: ['478'], amort: [], note: '12' },
  { ref: 'BZ', label: 'TOTAL GENERAL', comptes: [], amort: [], isTotal: true },
]

const PASSIF_ROWS: PassifRowDef[] = [
  { ref: 'CA', label: 'Capital', comptes: ['101','102','103'], note: '13' },
  { ref: 'CB', label: 'Apporteurs capital non appele (-)', comptes: ['109'], note: '13' },
  { ref: 'CD', label: 'Primes liees au capital social', comptes: ['104','105'], note: '14' },
  { ref: 'CE', label: 'Ecarts de reevaluation', comptes: ['106'], note: '3e' },
  { ref: 'CF', label: 'Reserves indisponibles', comptes: ['111','112'], note: '14' },
  { ref: 'CG', label: 'Reserves libres', comptes: ['113','118'], note: '14' },
  { ref: 'CH', label: 'Report a nouveau (+ ou -)', comptes: ['12'], note: '14' },
  { ref: 'CJ', label: 'Resultat net de l\'exercice (benefice + ou perte -)', comptes: ['13'] },
  { ref: 'CL', label: 'Subventions d\'investissement', comptes: ['14'], note: '15' },
  { ref: 'CM', label: 'Provisions reglementees', comptes: ['15'], note: '15' },
  { ref: 'CP', label: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DA', label: 'Emprunts et dettes financieres diverses', comptes: ['161','162','163','164','165','166','168'], note: '16' },
  { ref: 'DB', label: 'Dettes de location-acquisition', comptes: ['17'], note: '16' },
  { ref: 'DC', label: 'Provisions pour risques et charges', comptes: ['19'], note: '16' },
  { ref: 'DD', label: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DF', label: 'TOTAL RESSOURCES STABLES', comptes: [], isTotal: true },
  { ref: 'DH', label: 'Dettes circulantes HAO', comptes: ['481','482','483','484'], note: '5' },
  { ref: 'DI', label: 'Clients, avances recues', comptes: ['419'], note: '7' },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', comptes: ['401','402','403','404','405','408'], note: '17' },
  { ref: 'DK', label: 'Dettes fiscales et sociales', comptes: ['43','44'], note: '18' },
  { ref: 'DM', label: 'Autres dettes', comptes: ['421','422','423','424','425','426','427','428'], note: '19' },
  { ref: 'DN', label: 'Provisions pour risques a court terme', comptes: ['499'], note: '19' },
  { ref: 'DP', label: 'TOTAL PASSIF CIRCULANT', comptes: [], isTotal: true },
  { ref: 'DQ', label: 'Banques, credits d\'escompte', comptes: ['565'], note: '20' },
  { ref: 'DR', label: 'Banques, etablissements financiers et credits de tresorerie', comptes: ['52','561','564'], note: '20' },
  { ref: 'DT', label: 'TOTAL TRESORERIE-PASSIF', comptes: [], isTotal: true },
  { ref: 'DV', label: 'Ecart de conversion-Passif', comptes: ['479'], note: '12' },
  { ref: 'DZ', label: 'TOTAL GENERAL', comptes: [], isTotal: true },
]

function computeActif(bal: BalanceEntry[]) {
  const vals = new Map<string, { brut: number; amort: number; net: number }>()

  for (const r of ACTIF_ROWS) {
    if (r.isTotal) continue
    const brut = getActifBrut(bal, r.comptes)
    const amort = r.amort.length > 0 ? getAmortProv(bal, r.amort) : 0
    vals.set(r.ref, { brut, amort, net: brut - amort })
  }

  const sumRefs = (refs: string[]) => {
    let b = 0, a = 0
    for (const ref of refs) {
      const v = vals.get(ref)
      if (v) { b += v.brut; a += v.amort }
    }
    return { brut: b, amort: a, net: b - a }
  }

  vals.set('AZ', sumRefs(['AD', 'AI', 'AP', 'AQ']))
  vals.set('BK', sumRefs(['BA', 'BB', 'BG']))
  vals.set('BT', sumRefs(['BQ', 'BR', 'BS']))
  vals.set('BZ', sumRefs(['AZ', 'BK', 'BT', 'BU']))

  return ACTIF_ROWS.map(r => {
    const v = vals.get(r.ref) || { brut: 0, amort: 0, net: 0 }
    return { ref: r.ref, label: r.label, note: r.note || '', brut: v.brut, amort: v.amort, net: v.net, isTotal: !!r.isTotal, indent: r.indent, bold: r.bold }
  })
}

function computePassif(bal: BalanceEntry[]) {
  const vals = new Map<string, number>()

  for (const r of PASSIF_ROWS) {
    if (r.isTotal) continue
    // -getBalanceSolde: credit balance → positive, debit balance → negative
    const montant = -getBalanceSolde(bal, r.comptes)
    vals.set(r.ref, montant)
  }

  const sumRefs = (refs: string[]) => refs.reduce((s, ref) => s + (vals.get(ref) || 0), 0)

  vals.set('CP', sumRefs(['CA', 'CB', 'CD', 'CE', 'CF', 'CG', 'CH', 'CJ', 'CL', 'CM']))
  vals.set('DD', sumRefs(['DA', 'DB', 'DC']))
  vals.set('DF', sumRefs(['CP', 'DD']))
  vals.set('DP', sumRefs(['DH', 'DI', 'DJ', 'DK', 'DM', 'DN']))
  vals.set('DT', sumRefs(['DQ', 'DR']))
  vals.set('DZ', sumRefs(['DF', 'DP', 'DT', 'DV']))

  return PASSIF_ROWS.map(r => ({
    ref: r.ref, label: r.label, note: r.note || '',
    montant: vals.get(r.ref) || 0,
    isTotal: !!r.isTotal, indent: r.indent, bold: r.bold,
  }))
}

const v = (n: number) => n || null

const Bilan: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const actifData = computeActif(balance)
  const actifN1 = balanceN1 && balanceN1.length > 0 ? computeActif(balanceN1) : null
  const passifData = computePassif(balance)
  const passifN1 = balanceN1 && balanceN1.length > 0 ? computePassif(balanceN1) : null

  const actifColumns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'ACTIF', width: '35%', align: 'left' },
    { key: 'note', label: 'NOTE', width: 30, align: 'center' },
    { key: 'brut', label: 'BRUT', align: 'right', subLabel: 'Exercice N' },
    { key: 'amort', label: 'AMORT/DEPREC.', align: 'right', subLabel: 'Exercice N' },
    { key: 'net', label: 'NET', align: 'right', subLabel: 'Exercice N' },
    { key: 'net_n1', label: 'NET', align: 'right', subLabel: 'Exercice N-1' },
  ]

  const actifRows: Row[] = actifData.map((r, i) => ({
    id: `a-${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      brut: v(r.brut),
      amort: v(r.amort),
      net: v(r.net),
      net_n1: actifN1 ? v(actifN1[i].net) : null,
    },
    isTotal: r.isTotal,
    indent: r.indent,
    bold: r.bold || r.isTotal,
  }))

  const passifColumns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'PASSIF', width: '50%', align: 'left' },
    { key: 'note', label: 'NOTE', width: 30, align: 'center' },
    { key: 'montant', label: 'NET', align: 'right', subLabel: 'Exercice N' },
    { key: 'montant_n1', label: 'NET', align: 'right', subLabel: 'Exercice N-1' },
  ]

  const passifRows: Row[] = passifData.map((r, i) => ({
    id: `p-${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      montant: v(r.montant),
      montant_n1: passifN1 ? v(passifN1[i].montant) : null,
    },
    isTotal: r.isTotal,
    indent: r.indent,
    bold: r.bold || r.isTotal,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="" pageNumber="7" />

      <Typography sx={{ fontSize: '10pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        BILAN AU {new Date(entreprise.exercice_clos || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
      </Typography>

      <LiasseTable columns={actifColumns} rows={actifRows} title="ACTIF" compact onNoteClick={onNoteClick} />

      <Box sx={{ mt: 2 }}>
        <LiasseTable columns={passifColumns} rows={passifRows} title="PASSIF" compact onNoteClick={onNoteClick} />
      </Box>

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '7pt', fontWeight: 700, fontFamily: 'inherit' }}>
          Controle : Total Actif (BZ) = {fmt(actifData.find(r => r.ref === 'BZ')?.net || 0)} | Total Passif (DZ) = {fmt(passifData.find(r => r.ref === 'DZ')?.montant || 0)}
        </Typography>
      </Box>
    </Box>
  )
}

export default Bilan
