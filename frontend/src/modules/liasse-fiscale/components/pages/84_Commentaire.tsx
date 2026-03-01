import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const COMMENT_PREFIX = 'fiscasync_liasse_note_comment_'

const NOTE_LIST = [
  { key: 'note_01', label: 'Note 1 — Immobilisations incorporelles' },
  { key: 'note_02', label: 'Note 2 — Methodes comptables' },
  { key: 'note_3a', label: 'Note 3A — Immobilisations corporelles (brut)' },
  { key: 'note_3b', label: 'Note 3B — Immobilisations corporelles (amort.)' },
  { key: 'note_3c', label: 'Note 3C — Immobilisations financieres' },
  { key: 'note_3c_bis', label: 'Note 3C BIS — Plus ou moins values de cession' },
  { key: 'note_3d', label: 'Note 3D — Creances et dettes liees' },
  { key: 'note_3e', label: 'Note 3E — Informations complementaires' },
  { key: 'note_04', label: 'Note 4 — Actif circulant HAO' },
  { key: 'note_05', label: 'Note 5 — Stocks et en-cours' },
  { key: 'note_06', label: 'Note 6 — Clients' },
  { key: 'note_07', label: 'Note 7 — Autres creances' },
  { key: 'note_08', label: 'Note 8 — Tresorerie' },
  { key: 'note_8a', label: 'Note 8A — Ecarts de conversion' },
  { key: 'note_8b', label: 'Note 8B — Charges constatees d\'avance' },
  { key: 'note_8c', label: 'Note 8C — Produits constates d\'avance' },
  { key: 'note_09', label: 'Note 9 — Capital' },
  { key: 'note_10', label: 'Note 10 — Primes et reserves' },
  { key: 'note_11', label: 'Note 11 — Report a nouveau' },
  { key: 'note_12', label: 'Note 12 — Resultat net de l\'exercice' },
  { key: 'note_13', label: 'Note 13 — Subventions d\'investissement' },
  { key: 'note_14', label: 'Note 14 — Provisions reglementees et fonds assimiles' },
  { key: 'note_15a', label: 'Note 15A — Emprunts et dettes financieres' },
  { key: 'note_15b', label: 'Note 15B — Fournisseurs' },
  { key: 'note_16a', label: 'Note 16A — Dettes fiscales et sociales' },
  { key: 'note_16b', label: 'Note 16B — Autres dettes' },
  { key: 'note_16b_bis', label: 'Note 16B BIS — Risques provisionnes' },
  { key: 'note_16c', label: 'Note 16C — Dettes HAO' },
  { key: 'note_17', label: 'Note 17 — Chiffre d\'affaires et autres produits' },
  { key: 'note_18', label: 'Note 18 — Autres achats' },
  { key: 'note_19', label: 'Note 19 — Transports' },
  { key: 'note_20', label: 'Note 20 — Services exterieurs' },
  { key: 'note_21', label: 'Note 21 — Impots et taxes' },
  { key: 'note_22', label: 'Note 22 — Autres charges' },
  { key: 'note_23', label: 'Note 23 — Charges de personnel' },
  { key: 'note_24', label: 'Note 24 — Charges HAO' },
  { key: 'note_25', label: 'Note 25 — Produits HAO' },
  { key: 'note_26', label: 'Note 26 — Impot sur le resultat' },
  { key: 'note_27a', label: 'Note 27A — Dotations aux amortissements' },
  { key: 'note_27b', label: 'Note 27B — Dotations aux provisions' },
  { key: 'note_28', label: 'Note 28 — Reprises de provisions' },
  { key: 'note_29', label: 'Note 29 — Transferts de charges' },
  { key: 'note_30', label: 'Note 30 — Effectif, masse salariale' },
  { key: 'note_31', label: 'Note 31 — Engagements donnes et recus' },
  { key: 'note_32', label: 'Note 32 — Production vendue' },
  { key: 'note_33', label: 'Note 33 — Achats destines a la production' },
  { key: 'note_34', label: 'Note 34 — Valeur ajoutee' },
  { key: 'note_35', label: 'Note 35 — Resultats intermediaires' },
  { key: 'note_37', label: 'Note 37 — Tableau de passage du resultat' },
  { key: 'note_38', label: 'Note 38 — Participation des travailleurs' },
  { key: 'note_39', label: 'Note 39 — Informations complementaires' },
]

const Commentaire: React.FC<PageProps> = ({ entreprise }) => {
  const columns: Column[] = [
    { key: 'note', label: 'Note', width: '35%', align: 'left' },
    { key: 'commentaire', label: 'Commentaire', width: '65%', align: 'left' },
  ]

  const rows: Row[] = useMemo(() => {
    return NOTE_LIST.map((n, i) => {
      let comment = ''
      try {
        comment = localStorage.getItem(COMMENT_PREFIX + n.key) || ''
      } catch { /* ignore */ }
      return {
        id: `c-${i}`,
        cells: {
          note: n.label,
          commentaire: comment || '—',
        },
      }
    })
  }, [])

  return (
    <Box>
      <LiasseHeader entreprise={entreprise} noteLabel="COMMENTAIRES" pageNumber="82" />
      <LiasseTable columns={columns} rows={rows} title="Table des commentaires par note" compact />
    </Box>
  )
}

export default Commentaire
