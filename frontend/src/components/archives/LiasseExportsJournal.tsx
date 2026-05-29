/**
 * LiasseExportsJournal — journal Supabase (append-only) des liasses générées.
 * Lecture seule, scopé par utilisateur (RLS). Affiché dans Archives.
 */
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import { History as HistoryIcon } from '@mui/icons-material'
import { format as formatDate } from 'date-fns'
import { listLiasseExports, type LiasseExportRecord } from '@/services/liasseHistoryService'

const LiasseExportsJournal: React.FC = () => {
  const [rows, setRows] = useState<LiasseExportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void listLiasseExports().then((r) => {
      if (!cancelled) {
        setRows(r)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        avatar={<HistoryIcon color="primary" />}
        title="Journal des liasses générées"
        subheader="Traçabilité Supabase — empreinte SHA-256, append-only (immuable)"
      />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune liasse générée pour l'instant. Exportez une liasse (Excel/PDF) :
              elle sera tracée ici avec son empreinte d'intégrité.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Entreprise</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Exercice</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Empreinte</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.entreprise || '—'}</TableCell>
                    <TableCell>{r.exercice}</TableCell>
                    <TableCell>
                      <Chip label={r.typeLiasse} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={r.format} size="small" />
                    </TableCell>
                    <TableCell>
                      {r.hash ? (
                        <Tooltip title={r.hash}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {r.hash.slice(0, 12)}…
                          </Typography>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default LiasseExportsJournal
