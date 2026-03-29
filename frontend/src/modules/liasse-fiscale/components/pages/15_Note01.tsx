import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getPassif } from '../../services/liasse-calculs'
import { NOTE_01 } from '@/constants/syscohada-mappings'

const v = (n: number) => n || null

const Note01: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'designation', label: 'LIBELLES', width: '40%', align: 'left' },
    { key: 'note', label: 'Note', width: 30, align: 'center' },
    { key: 'montant_brut', label: 'Montant brut', align: 'right' },
    { key: 'hypotheques', label: 'Hypotheques', align: 'right' },
    { key: 'nantissements', label: 'Nantissements', align: 'right' },
    { key: 'gages', label: 'Gages/autres', align: 'right' },
  ]

  // ── Section 1: Emprunts et dettes financieres diverses ──
  const empruntsObligConv = getPassif(balance, [...NOTE_01.empruntsObligConv.comptes])
  const autresEmpruntsOblig = getPassif(balance, [...NOTE_01.autresEmpruntsOblig.comptes])
  const empruntsEtabCredit = getPassif(balance, [...NOTE_01.empruntsEtabCredit.comptes])
  const autresDettesFinanc = getPassif(balance, [...NOTE_01.autresDettesFinanc.comptes])
  const sousTot1 = empruntsObligConv + autresEmpruntsOblig + empruntsEtabCredit + autresDettesFinanc

  // ── Section 2: Dettes de location-acquisition ──
  const creditBailImmo = getPassif(balance, [...NOTE_01.creditBailImmo.comptes])
  const creditBailMob = getPassif(balance, [...NOTE_01.creditBailMob.comptes])
  const locationVente = getPassif(balance, [...NOTE_01.locationVente.comptes])
  const autresLocAcq = getPassif(balance, [...NOTE_01.autresLocAcq.comptes])
  const sousTot2 = creditBailImmo + creditBailMob + locationVente + autresLocAcq

  // ── Section 3: Dettes du passif circulant ──
  const fournisseurs = getPassif(balance, [...NOTE_01.fournisseurs.comptes])
  const clients = getPassif(balance, [...NOTE_01.clients.comptes])
  const personnel = getPassif(balance, [...NOTE_01.personnel.comptes])
  const securiteSociale = getPassif(balance, [...NOTE_01.securiteSociale.comptes])
  const etat = getPassif(balance, [...NOTE_01.etat.comptes])
  const orgInternat = getPassif(balance, [...NOTE_01.orgInternat.comptes])
  const associesGroupe = getPassif(balance, [...NOTE_01.associesGroupe.comptes])
  const crediteursDivers = getPassif(balance, [...NOTE_01.crediteursDivers.comptes])
  const sousTot3 = fournisseurs + clients + personnel + securiteSociale + etat + orgInternat + associesGroupe + crediteursDivers

  const total = sousTot1 + sousTot2 + sousTot3

  const rows: Row[] = [
    // Section 1 header
    { id: 'sec1', cells: { designation: 'Emprunts et dettes financieres diverses :', note: '16' }, isSectionHeader: true },
    { id: 'r1', cells: { designation: 'Emprunts obligataires convertibles', note: null, montant_brut: v(empruntsObligConv), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r2', cells: { designation: 'Autres emprunts obligataires', note: null, montant_brut: v(autresEmpruntsOblig), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r3', cells: { designation: 'Emprunts et dettes des etablissements de credit', note: null, montant_brut: v(empruntsEtabCredit), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r4', cells: { designation: 'Autres dettes financieres', note: null, montant_brut: v(autresDettesFinanc), hypotheques: null, nantissements: null, gages: null } },
    { id: 'st1', cells: { designation: 'SOUS TOTAL (1)', note: null, montant_brut: v(sousTot1), hypotheques: null, nantissements: null, gages: null }, isSubtotal: true, bold: true },

    // Section 2 header
    { id: 'sec2', cells: { designation: 'Dettes de location-acquisition :', note: '16' }, isSectionHeader: true },
    { id: 'r5', cells: { designation: 'Dettes de credit-bail immobilier', note: null, montant_brut: v(creditBailImmo), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r6', cells: { designation: 'Dettes de credit-bail mobilier', note: null, montant_brut: v(creditBailMob), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r7', cells: { designation: 'Dettes de location-vente', note: null, montant_brut: v(locationVente), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r8', cells: { designation: 'Autres dettes de location-acquisition', note: null, montant_brut: v(autresLocAcq), hypotheques: null, nantissements: null, gages: null } },
    { id: 'st2', cells: { designation: 'SOUS TOTAL (2)', note: null, montant_brut: v(sousTot2), hypotheques: null, nantissements: null, gages: null }, isSubtotal: true, bold: true },

    // Section 3 header
    { id: 'sec3', cells: { designation: 'Dettes du passif circulant :' }, isSectionHeader: true },
    { id: 'r9', cells: { designation: 'Fournisseurs et comptes rattaches', note: '17', montant_brut: v(fournisseurs), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r10', cells: { designation: 'Clients', note: '7', montant_brut: v(clients), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r11', cells: { designation: 'Personnel', note: '18', montant_brut: v(personnel), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r12', cells: { designation: 'Securite sociale et organismes sociaux', note: '18', montant_brut: v(securiteSociale), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r13', cells: { designation: 'Etat', note: '18', montant_brut: v(etat), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r14', cells: { designation: 'Organismes internationaux', note: '19', montant_brut: v(orgInternat), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r15', cells: { designation: 'Associes et groupe', note: '19', montant_brut: v(associesGroupe), hypotheques: null, nantissements: null, gages: null } },
    { id: 'r16', cells: { designation: 'Crediteurs divers', note: '19', montant_brut: v(crediteursDivers), hypotheques: null, nantissements: null, gages: null } },
    { id: 'st3', cells: { designation: 'SOUS TOTAL (3)', note: null, montant_brut: v(sousTot3), hypotheques: null, nantissements: null, gages: null }, isSubtotal: true, bold: true },

    // Grand total
    { id: 'total', cells: { designation: 'TOTAL (1) + (2) + (3)', note: null, montant_brut: v(total), hypotheques: null, nantissements: null, gages: null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 1"
      noteTitle="NOTE 1 : DETTES GARANTIES PAR DES SURETES REELLES CONSENTIES SUR LES ACTIFS DE L'ENTITE"
      pageNumber="11"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note01
