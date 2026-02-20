/**
 * Panneau de validation des contrôles croisés SYSCOHADA
 * Affiche BZ=DZ (Actif=Passif) et XI=CJ (Résultat CdR=Résultat Bilan)
 */

import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Alert,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { liasseDataService } from '@/services/liasseDataService'

const formatFCFA = (n: number) => Math.round(n).toLocaleString('fr-FR')

const ValidationPanel: React.FC = () => {
  const theme = useTheme()

  const validation = useMemo(() => {
    return liasseDataService.validateCoherenceDetailed()
  }, [])

  return (
    <Box>
      <Alert
        severity={validation.isValid ? 'success' : 'error'}
        sx={{ mb: 2 }}
        icon={validation.isValid ? <CheckCircleIcon /> : <ErrorIcon />}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {validation.isValid
            ? 'Tous les controles croises sont valides'
            : `${validation.checks.filter(c => !c.ok).length} controle(s) en ecart`}
        </Typography>
      </Alert>

      <Stack spacing={2}>
        {validation.checks.map(check => (
          <Paper
            key={check.code}
            variant="outlined"
            sx={{
              p: 2,
              borderColor: check.ok ? theme.palette.success.main : theme.palette.error.main,
              borderWidth: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {check.code} — {check.label}
              </Typography>
              <Chip
                icon={check.ok ? <CheckCircleIcon /> : <ErrorIcon />}
                label={check.ok ? 'OK' : `Ecart: ${formatFCFA(check.ecart)}`}
                color={check.ok ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 0.5 }}>{check.labelA}</TableCell>
                    <TableCell align="right" sx={{ border: 0, py: 0.5, fontWeight: 600 }}>
                      {formatFCFA(check.valeurA)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 0.5 }}>{check.labelB}</TableCell>
                    <TableCell align="right" sx={{ border: 0, py: 0.5, fontWeight: 600 }}>
                      {formatFCFA(check.valeurB)}
                    </TableCell>
                  </TableRow>
                  {!check.ok && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 0.5, color: 'error.main', fontWeight: 600 }}>
                        Ecart
                      </TableCell>
                      <TableCell align="right" sx={{ border: 0, py: 0.5, color: 'error.main', fontWeight: 700 }}>
                        {formatFCFA(check.ecart)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default ValidationPanel
