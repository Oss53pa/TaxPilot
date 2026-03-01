/**
 * Modal affichant le resultat de la comparaison N vs N-1
 * Declenchee apres un import quand N-1 existe
 */

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import type { ComparisonReport } from '../../services/comparisonService'
import type { ResultatControle } from '@/types/audit.types'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
  report: ComparisonReport | null
}

const severiteIcon: Record<string, React.ReactNode> = {
  BLOQUANT: <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />,
  MAJEUR: <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />,
  MINEUR: <InfoIcon sx={{ color: '#3b82f6', fontSize: 20 }} />,
  INFO: <InfoIcon sx={{ color: '#6b7280', fontSize: 20 }} />,
  OK: <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />,
}

const severiteColor: Record<string, string> = {
  BLOQUANT: '#ef4444',
  MAJEUR: '#f59e0b',
  MINEUR: '#3b82f6',
  INFO: '#6b7280',
  OK: '#22c55e',
}

const ComparisonResultModal: React.FC<Props> = ({ open, onClose, report }) => {
  const navigate = useNavigate()

  if (!report) return null

  const { synthese, resultats } = report
  const hasBloquants = synthese.bloquants > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Comparaison N vs N-1
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {report.exerciceN} vs {report.exerciceN1}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Banniere resume */}
        <Alert
          severity={hasBloquants ? 'error' : synthese.anomalies > 0 ? 'warning' : 'success'}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${synthese.ok} OK`} size="small" sx={{ bgcolor: '#22c55e22', color: '#22c55e', fontWeight: 600 }} />
            {synthese.bloquants > 0 && (
              <Chip label={`${synthese.bloquants} bloquant(s)`} size="small" sx={{ bgcolor: '#ef444422', color: '#ef4444', fontWeight: 600 }} />
            )}
            {synthese.majeurs > 0 && (
              <Chip label={`${synthese.majeurs} majeur(s)`} size="small" sx={{ bgcolor: '#f59e0b22', color: '#f59e0b', fontWeight: 600 }} />
            )}
            {synthese.mineurs > 0 && (
              <Chip label={`${synthese.mineurs} mineur(s)`} size="small" sx={{ bgcolor: '#3b82f622', color: '#3b82f6', fontWeight: 600 }} />
            )}
            {synthese.info > 0 && (
              <Chip label={`${synthese.info} info`} size="small" sx={{ bgcolor: '#6b728022', color: '#6b7280', fontWeight: 600 }} />
            )}
          </Box>
        </Alert>

        {hasBloquants && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {synthese.bloquants} controle(s) bloquant(s) detecte(s). La balance presente des anomalies qui doivent etre corrigees avant de produire la liasse.
          </Alert>
        )}

        {/* Detail par controle */}
        {resultats.map((r: ResultatControle) => (
          <Accordion
            key={r.ref}
            defaultExpanded={r.statut === 'ANOMALIE' && (r.severite === 'BLOQUANT' || r.severite === 'MAJEUR')}
            sx={{
              border: `1px solid ${severiteColor[r.severite]}22`,
              '&:before': { display: 'none' },
              mb: 1,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                {severiteIcon[r.severite]}
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                  {r.ref} - {r.nom}
                </Typography>
                <Chip
                  label={r.statut === 'OK' ? 'OK' : r.severite}
                  size="small"
                  sx={{
                    bgcolor: severiteColor[r.severite] + '22',
                    color: severiteColor[r.severite],
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 1 }}>{r.message}</Typography>
              {r.details?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {r.details.description}
                </Typography>
              )}
              {r.details?.comptes && r.details.comptes.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" fontWeight={600}>Comptes concernes:</Typography>
                  {r.details.comptes.map((c, i) => (
                    <Typography key={i} variant="caption" display="block" sx={{ pl: 1, fontFamily: 'monospace' }}>
                      {c}
                    </Typography>
                  ))}
                </Box>
              )}
              {r.suggestion && (
                <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                  <Typography variant="caption">{r.suggestion}</Typography>
                </Alert>
              )}
              {r.referenceReglementaire && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                  Ref: {r.referenceReglementaire}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => { onClose(); navigate('/archives') }}
          color="inherit"
        >
          Voir archives
        </Button>
        <Button
          variant="contained"
          onClick={() => { onClose(); navigate('/audit') }}
        >
          Continuer vers l'audit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ComparisonResultModal
