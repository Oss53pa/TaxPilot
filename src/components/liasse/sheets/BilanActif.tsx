/**
 * Composant Bilan Actif - Reproduction exacte de l'onglet ACTIF du fichier Excel
 * Liasse Fiscale SYSCOHADA
 */

import React, { useState, useEffect } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import LiasseTableauGenerique from '../LiasseTableauGenerique'

interface BilanActifData {
  rows: any[]
  totals: any
  comment: string
}

const BilanActif: React.FC = () => {
  const [data, setData] = useState<BilanActifData>({
    rows: [],
    totals: {},
    comment: ''
  })

  // Structure exacte du Bilan Actif SYSCOHADA
  const columns = [
    { id: 'ref', label: 'Réf', type: 'text' as const, width: '60px', editable: false },
    { id: 'poste', label: 'ACTIF', type: 'text' as const, width: '400px', editable: false },
    { id: 'note', label: 'Note', type: 'text' as const, width: '60px', editable: true },
    { id: 'brut', label: 'Brut', type: 'currency' as const, width: '150px', editable: true, required: true },
    { id: 'amort_prov', label: 'Amort./Prov.', type: 'currency' as const, width: '150px', editable: true },
    { id: 'net', label: 'Net', type: 'currency' as const, width: '150px', editable: false, formula: 'brut - amort_prov' },
    { id: 'net_n1', label: 'Net N-1', type: 'currency' as const, width: '150px', editable: true }
  ]

  // Données du Bilan Actif selon SYSCOHADA
  const initialRows = [
    // ACTIF IMMOBILISÉ
    { id: 'header_immobilise', ref: '', poste: 'ACTIF IMMOBILISÉ', note: '', brut: null, amort_prov: null, net: null, net_n1: null, isHeader: true },
    
    // Charges immobilisées
    { id: 'AX', ref: 'AX', poste: 'Charges immobilisées', note: '3', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AQ', ref: 'AQ', poste: 'Frais d\'établissement', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AR', ref: 'AR', poste: 'Charges à répartir', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AS', ref: 'AS', poste: 'Primes de remboursement des obligations', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Immobilisations incorporelles
    { id: 'AC', ref: 'AC', poste: 'Immobilisations incorporelles', note: '3', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AD', ref: 'AD', poste: 'Frais de recherche et développement', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AE', ref: 'AE', poste: 'Brevets, licences, logiciels, et droits similaires', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AF', ref: 'AF', poste: 'Fonds commercial et droit au bail', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AG', ref: 'AG', poste: 'Autres immobilisations incorporelles', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Immobilisations corporelles
    { id: 'AI', ref: 'AI', poste: 'Immobilisations corporelles', note: '3', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AJ', ref: 'AJ', poste: 'Terrains', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AK', ref: 'AK', poste: 'Bâtiments', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AL', ref: 'AL', poste: 'Installations et agencements', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AM', ref: 'AM', poste: 'Matériel', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AN', ref: 'AN', poste: 'Matériel de transport', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Avances et acomptes sur immobilisations
    { id: 'AP', ref: 'AP', poste: 'Avances et acomptes versés sur immobilisations', note: '3', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Immobilisations financières
    { id: 'AW', ref: 'AW', poste: 'Immobilisations financières', note: '4', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AT', ref: 'AT', poste: 'Titres de participation', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'AU', ref: 'AU', poste: 'Autres immobilisations financières', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Total Actif Immobilisé
    { id: 'AZ', ref: 'AZ', poste: 'TOTAL ACTIF IMMOBILISÉ', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0, isTotal: true },
    
    // ACTIF CIRCULANT
    { id: 'header_circulant', ref: '', poste: 'ACTIF CIRCULANT', note: '', brut: null, amort_prov: null, net: null, net_n1: null, isHeader: true },
    
    // Actif circulant HAO
    { id: 'BA', ref: 'BA', poste: 'Actif circulant HAO', note: '5', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Stocks et encours
    { id: 'BB', ref: 'BB', poste: 'Stocks et encours', note: '6', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BC', ref: 'BC', poste: 'Marchandises', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BD', ref: 'BD', poste: 'Matières premières et fournitures liées', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BE', ref: 'BE', poste: 'Autres approvisionnements', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BF', ref: 'BF', poste: 'Encours', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BG', ref: 'BG', poste: 'Produits fabriqués', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Créances et emplois assimilés
    { id: 'BH', ref: 'BH', poste: 'Créances et emplois assimilés', note: '7', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BI', ref: 'BI', poste: 'Fournisseurs, avances versées', note: '17', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BJ', ref: 'BJ', poste: 'Clients', note: '7', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BK', ref: 'BK', poste: 'Autres créances', note: '8', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Total Actif Circulant
    { id: 'BL', ref: 'BL', poste: 'TOTAL ACTIF CIRCULANT', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0, isTotal: true },
    
    // TRÉSORERIE ACTIF
    { id: 'header_tresorerie', ref: '', poste: 'TRÉSORERIE - ACTIF', note: '', brut: null, amort_prov: null, net: null, net_n1: null, isHeader: true },
    
    { id: 'BQ', ref: 'BQ', poste: 'Titres de placement', note: '9', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BR', ref: 'BR', poste: 'Valeurs à encaisser', note: '10', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    { id: 'BS', ref: 'BS', poste: 'Banques, chèques postaux, caisse et assimilés', note: '11', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // Total Trésorerie Actif
    { id: 'BT', ref: 'BT', poste: 'TOTAL TRÉSORERIE - ACTIF', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0, isTotal: true },
    
    // Écart de conversion Actif
    { id: 'BU', ref: 'BU', poste: 'Écart de conversion - Actif', note: '12', brut: 0, amort_prov: 0, net: 0, net_n1: 0 },
    
    // TOTAL GÉNÉRAL ACTIF
    { id: 'BZ', ref: 'BZ', poste: 'TOTAL GÉNÉRAL ACTIF', note: '', brut: 0, amort_prov: 0, net: 0, net_n1: 0, isTotalGeneral: true }
  ]

  useEffect(() => {
    setData({
      rows: initialRows,
      totals: calculateTotals(initialRows),
      comment: ''
    })
  }, [])

  // Calcul automatique des totaux
  const calculateTotals = (rows: any[]) => {
    const totals = {
      AZ: { brut: 0, amort_prov: 0, net: 0, net_n1: 0 }, // Total Actif Immobilisé
      BL: { brut: 0, amort_prov: 0, net: 0, net_n1: 0 }, // Total Actif Circulant
      BT: { brut: 0, amort_prov: 0, net: 0, net_n1: 0 }, // Total Trésorerie Actif
      BZ: { brut: 0, amort_prov: 0, net: 0, net_n1: 0 }  // Total Général
    }

    // Calcul Total Actif Immobilisé (AZ)
    const immobiliseRows = ['AX', 'AC', 'AI', 'AP', 'AW']
    immobiliseRows.forEach(ref => {
      const row = rows.find(r => r.id === ref)
      if (row) {
        totals.AZ.brut += row.brut || 0
        totals.AZ.amort_prov += row.amort_prov || 0
        totals.AZ.net += (row.brut || 0) - (row.amort_prov || 0)
        totals.AZ.net_n1 += row.net_n1 || 0
      }
    })

    // Calcul Total Actif Circulant (BL)
    const circulantRows = ['BA', 'BB', 'BH']
    circulantRows.forEach(ref => {
      const row = rows.find(r => r.id === ref)
      if (row) {
        totals.BL.brut += row.brut || 0
        totals.BL.amort_prov += row.amort_prov || 0
        totals.BL.net += (row.brut || 0) - (row.amort_prov || 0)
        totals.BL.net_n1 += row.net_n1 || 0
      }
    })

    // Calcul Total Trésorerie Actif (BT)
    const tresorerieRows = ['BQ', 'BR', 'BS']
    tresorerieRows.forEach(ref => {
      const row = rows.find(r => r.id === ref)
      if (row) {
        totals.BT.brut += row.brut || 0
        totals.BT.amort_prov += row.amort_prov || 0
        totals.BT.net += (row.brut || 0) - (row.amort_prov || 0)
        totals.BT.net_n1 += row.net_n1 || 0
      }
    })

    // Calcul Total Général (BZ)
    totals.BZ.brut = totals.AZ.brut + totals.BL.brut + totals.BT.brut
    totals.BZ.amort_prov = totals.AZ.amort_prov + totals.BL.amort_prov + totals.BT.amort_prov
    totals.BZ.net = totals.AZ.net + totals.BL.net + totals.BT.net
    totals.BZ.net_n1 = totals.AZ.net_n1 + totals.BL.net_n1 + totals.BT.net_n1

    // Ajouter l'écart de conversion
    const ecartRow = rows.find(r => r.id === 'BU')
    if (ecartRow) {
      totals.BZ.brut += ecartRow.brut || 0
      totals.BZ.net += (ecartRow.brut || 0) - (ecartRow.amort_prov || 0)
      totals.BZ.net_n1 += ecartRow.net_n1 || 0
    }

    return totals
  }

  const handleCellChange = (rowId: string, columnId: string, value: any) => {
    const updatedRows = data.rows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [columnId]: parseFloat(value) || 0 }
        
        // Recalculer le net si brut ou amort_prov change
        if (columnId === 'brut' || columnId === 'amort_prov') {
          updatedRow.net = (updatedRow.brut || 0) - (updatedRow.amort_prov || 0)
        }
        
        return updatedRow
      }
      return row
    })

    // Mise à jour des totaux
    const totals = calculateTotals(updatedRows)
    
    // Appliquer les totaux aux lignes de total
    const finalRows = updatedRows.map(row => {
      if (totals[row.id]) {
        return { ...row, ...totals[row.id] }
      }
      return row
    })

    setData({
      ...data,
      rows: finalRows,
      totals
    })
  }

  const handleCommentChange = (comment: string) => {
    setData({ ...data, comment })
  }

  const handleSave = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde du Bilan Actif:', data)
  }

  // Formater les lignes pour l'affichage
  const displayRows = data.rows.map(row => ({
    ...row,
    poste: row.isHeader ? (
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#171717' }}>
        {row.poste}
      </Typography>
    ) : row.isTotal ? (
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f57c00' }}>
        {row.poste}
      </Typography>
    ) : row.isTotalGeneral ? (
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
        {row.poste}
      </Typography>
    ) : (
      <Typography variant="body2" sx={{ pl: row.ref.length === 2 ? 2 : 4 }}>
        {row.poste}
      </Typography>
    )
  }))

  // Validation
  const validations = []
  
  // Vérifier que le total actif est équilibré
  const totalActif = data.totals?.BZ?.net || 0
  if (totalActif === 0) {
    validations.push({
      type: 'warning' as const,
      message: 'Le bilan actif est vide. Veuillez saisir les données.'
    })
  }

  return (
    <Box>
      <LiasseTableauGenerique
        title="BILAN - ACTIF"
        sheetId="actif"
        columns={columns}
        rows={displayRows.filter(r => !r.isHeader && !r.isTotal && !r.isTotalGeneral)}
        onCellChange={handleCellChange}
        onCommentChange={handleCommentChange}
        onSave={handleSave}
        comment={data.comment}
        validations={validations}
        headerColor="#171717"
        alternateRowColors={true}
      />
    </Box>
  )
}

export default BilanActif