/**
 * Note 4 - État des créances et dettes SYSCOHADA
 */

import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  useTheme,
} from '@mui/material'
import { AccountBalance } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note4SYSCOHADA: React.FC = () => {
  const theme = useTheme()

  const donneesCreances = [
    { nature: 'Clients et comptes rattachés', montantBrut: 45000000, provision: 2500000, net: 42500000, moinsUnAn: 38000000, unACinqAns: 4500000, plusCinqAns: 0 },
    { nature: 'Personnel - Avances et acomptes', montantBrut: 1800000, provision: 0, net: 1800000, moinsUnAn: 1800000, unACinqAns: 0, plusCinqAns: 0 },
    { nature: 'État et collectivités publiques', montantBrut: 8500000, provision: 0, net: 8500000, moinsUnAn: 8500000, unACinqAns: 0, plusCinqAns: 0 },
    { nature: 'Organismes internationaux', montantBrut: 3200000, provision: 0, net: 3200000, moinsUnAn: 2000000, unACinqAns: 1200000, plusCinqAns: 0 },
    { nature: 'Débiteurs divers', montantBrut: 2500000, provision: 500000, net: 2000000, moinsUnAn: 1500000, unACinqAns: 500000, plusCinqAns: 0 },
  ]

  const donneesDettes = [
    { nature: 'Emprunts et dettes financières', montant: 35000000, moinsUnAn: 8000000, unACinqAns: 22000000, plusCinqAns: 5000000 },
    { nature: 'Fournisseurs et comptes rattachés', montant: 28000000, moinsUnAn: 26000000, unACinqAns: 2000000, plusCinqAns: 0 },
    { nature: 'Personnel', montant: 4500000, moinsUnAn: 4500000, unACinqAns: 0, plusCinqAns: 0 },
    { nature: 'État et collectivités publiques', montant: 6800000, moinsUnAn: 6800000, unACinqAns: 0, plusCinqAns: 0 },
    { nature: 'Organismes sociaux', montant: 3200000, moinsUnAn: 3200000, unACinqAns: 0, plusCinqAns: 0 },
    { nature: 'Autres dettes', montant: 2500000, moinsUnAn: 1500000, unACinqAns: 1000000, plusCinqAns: 0 },
  ]

  const totalCreances = {
    montantBrut: donneesCreances.reduce((s, i) => s + i.montantBrut, 0),
    provision: donneesCreances.reduce((s, i) => s + i.provision, 0),
    net: donneesCreances.reduce((s, i) => s + i.net, 0),
    moinsUnAn: donneesCreances.reduce((s, i) => s + i.moinsUnAn, 0),
    unACinqAns: donneesCreances.reduce((s, i) => s + i.unACinqAns, 0),
    plusCinqAns: donneesCreances.reduce((s, i) => s + i.plusCinqAns, 0),
  }

  const totalDettes = {
    montant: donneesDettes.reduce((s, i) => s + i.montant, 0),
    moinsUnAn: donneesDettes.reduce((s, i) => s + i.moinsUnAn, 0),
    unACinqAns: donneesDettes.reduce((s, i) => s + i.unACinqAns, 0),
    plusCinqAns: donneesDettes.reduce((s, i) => s + i.plusCinqAns, 0),
  }

  const formatMontant = (montant: number) => montant.toLocaleString('fr-FR') + ' FCFA'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 4 - État des créances et dettes
      </Typography>
      <TableActions tableName="État des créances et dettes" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<AccountBalance />}>
        <Typography variant="body2">
          Conformément à l'article 41 de l'Acte Uniforme OHADA, les créances et dettes sont ventilées selon leur échéance.
          Les créances douteuses font l'objet de provisions individualisées.
        </Typography>
      </Alert>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>État des créances</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200 }}>Nature</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant brut</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Provisions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant net</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>{'< 1 an'}</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>1 à 5 ans</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>{'> 5 ans'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesCreances.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.nature}</TableCell>
                <TableCell align="right">{formatMontant(l.montantBrut)}</TableCell>
                <TableCell align="right" sx={{ color: l.provision > 0 ? 'error.main' : 'inherit' }}>{formatMontant(l.provision)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(l.net)}</TableCell>
                <TableCell align="right">{formatMontant(l.moinsUnAn)}</TableCell>
                <TableCell align="right">{formatMontant(l.unACinqAns)}</TableCell>
                <TableCell align="right">{formatMontant(l.plusCinqAns)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL CRÉANCES</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalCreances.montantBrut)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatMontant(totalCreances.provision)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(totalCreances.net)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalCreances.moinsUnAn)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalCreances.unACinqAns)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalCreances.plusCinqAns)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>État des dettes</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200 }}>Nature</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>{'< 1 an'}</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>1 à 5 ans</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>{'> 5 ans'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesDettes.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.nature}</TableCell>
                <TableCell align="right">{formatMontant(l.montant)}</TableCell>
                <TableCell align="right">{formatMontant(l.moinsUnAn)}</TableCell>
                <TableCell align="right">{formatMontant(l.unACinqAns)}</TableCell>
                <TableCell align="right">{formatMontant(l.plusCinqAns)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL DETTES</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(totalDettes.montant)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalDettes.moinsUnAn)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalDettes.unACinqAns)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totalDettes.plusCinqAns)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Ratio de liquidité</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{(totalCreances.moinsUnAn / totalDettes.moinsUnAn).toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary">Créances CT / Dettes CT</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Taux de provisionnement</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{((totalCreances.provision / totalCreances.montantBrut) * 100).toFixed(1)}%</Typography>
            <Typography variant="caption" color="text.secondary">Provisions / Créances brutes</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Endettement net</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: totalDettes.montant > totalCreances.net ? 'error.main' : 'success.main' }}>{formatMontant(totalDettes.montant - totalCreances.net)}</Typography>
            <Typography variant="caption" color="text.secondary">Dettes - Créances nettes</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <CommentairesSection titre="Commentaires et Observations - Note 4" noteId="note4"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'Les créances et dettes sont ventilées par échéance conformément au SYSCOHADA.\n\nObservations :\n- Provision pour créances douteuses de 3 000 000 FCFA\n- Dettes financières en cours de remboursement normal', type: 'observation' }]}
      />
    </Box>
  )
}

export default Note4SYSCOHADA