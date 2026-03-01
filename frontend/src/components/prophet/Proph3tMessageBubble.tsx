import React from 'react'
import { Box, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import type {
  ChatMessage, RichContent, AccountCard, FonctionnementCard, ChapitreCard, EcritureCard,
  SearchResultCard, StatsCard, FiscalInfoCard, LiasseSheetCard, AuditControlCard, PredictionCard,
} from './types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// ── Bold markdown renderer ───────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: P.primary100,
            padding: '1px 5px',
            borderRadius: 4,
            fontSize: '0.85em',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

// ── Text with line breaks ────────────────────────────────────────────
function TextBlock({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Typography
          key={i}
          variant="body2"
          sx={{
            lineHeight: 1.6,
            mb: line.startsWith('-') ? 0.3 : line === '' ? 0.8 : 0.2,
            pl: line.startsWith('-') ? 1 : 0,
          }}
        >
          {renderMarkdown(line)}
        </Typography>
      ))}
    </>
  )
}

// ── Account card ─────────────────────────────────────────────────────
function AccountCardView({ data }: { data: AccountCard }) {
  const { compte, children } = data
  const natureColor: Record<string, string> = {
    ACTIF: '#2563eb',
    PASSIF: '#7c3aed',
    CHARGE: '#dc2626',
    PRODUIT: '#16a34a',
    SPECIAL: '#d97706',
  }

  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
        <Chip label={compte.nature} size="small" sx={{ bgcolor: natureColor[compte.nature] || P.primary500, color: P.white, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
        <Chip label={compte.sens} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
        <Chip label={compte.utilisation} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22, borderColor: compte.utilisation === 'OBLIGATOIRE' ? '#dc2626' : P.primary500, color: compte.utilisation === 'OBLIGATOIRE' ? '#dc2626' : P.primary500 }} />
      </Box>
      {children && children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Sous-comptes ({children.length})
          </Typography>
          {children.slice(0, 8).map(c => (
            <Typography key={c.numero} variant="caption" sx={{ display: 'block', color: P.primary700, pl: 1, lineHeight: 1.7 }}>
              {c.numero} — {c.libelle}
            </Typography>
          ))}
          {children.length > 8 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1 }}>
              ... et {children.length - 8} autres
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

// ── Fonctionnement card ──────────────────────────────────────────────
function FonctionnementCardView({ data }: { data: FonctionnementCard }) {
  const { fonctionnement: fonc } = data
  const { debit, credit } = fonc.fonctionnement

  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block', mb: 0.5 }}>
            DEBIT
          </Typography>
          {debit.length > 0 ? debit.map((d, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', color: P.primary700, lineHeight: 1.6 }}>
              • {d.description}
            </Typography>
          )) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
          )}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 0.5 }}>
            CREDIT
          </Typography>
          {credit.length > 0 ? credit.map((c, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', color: P.primary700, lineHeight: 1.6 }}>
              • {c.description}
            </Typography>
          )) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
          )}
        </Box>
      </Box>

      {fonc.exclusions.length > 0 && (
        <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${P.primary200}` }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
            Exclusions
          </Typography>
          {fonc.exclusions.map((ex, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.5 }}>
              → {ex.description} (voir {ex.compteCorrige})
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ── Chapitre card ────────────────────────────────────────────────────
function ChapitreCardView({ data }: { data: ChapitreCard }) {
  const { chapitre } = data

  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      {chapitre.sections.slice(0, 3).map((section, i) => (
        <Box key={i} sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
            {section.titre}
          </Typography>
          <Typography variant="caption" sx={{ color: P.primary700, lineHeight: 1.5, display: 'block' }}>
            {section.contenu.slice(0, 200)}{section.contenu.length > 200 ? '...' : ''}
          </Typography>
          {section.ecritures && section.ecritures.slice(0, 1).map((ecr, j) => (
            <Box key={j} sx={{ mt: 0.5, ml: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.7rem' }}>
                {ecr.description}
              </Typography>
              <Table size="small" sx={{ mt: 0.3, '& td, & th': { py: 0.2, px: 0.5, fontSize: '0.7rem', border: 'none' } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600, color: 'text.secondary' } }}>
                    <TableCell></TableCell>
                    <TableCell>Compte</TableCell>
                    <TableCell>Libelle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ecr.lignes.map((l, k) => (
                    <TableRow key={k}>
                      <TableCell sx={{ color: l.sens === 'D' ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {l.sens === 'D' ? 'D' : 'C'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{l.compte}</TableCell>
                      <TableCell>{l.libelleCompte}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>
      ))}
      {chapitre.sections.length > 3 && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          ... et {chapitre.sections.length - 3} autres sections
        </Typography>
      )}
    </Box>
  )
}

// ── Search results card ──────────────────────────────────────────────
function SearchResultsCardView({ data, onSelect }: { data: SearchResultCard; onSelect: (q: string) => void }) {
  return (
    <Box sx={{ mt: 1 }}>
      {data.results.map((r, i) => (
        <Box
          key={i}
          onClick={() => onSelect(r.numero)}
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
            py: 0.5,
            px: 1,
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'text.primary', minWidth: 48 }}>
            {r.numero}
          </Typography>
          <Typography variant="caption" sx={{ color: P.primary700, flex: 1 }}>
            {r.libelle}
          </Typography>
          {r.detail && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
              {r.detail}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

// ── Stats card ───────────────────────────────────────────────────────
function StatsCardView({ data }: { data: StatsCard }) {
  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block', mb: 0.5 }}>
        Repartition par classe
      </Typography>
      {Object.entries(data.parClasse).map(([cls, count]) => (
        <Box key={cls} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
          <Typography variant="caption" sx={{ minWidth: 60, fontWeight: 500, color: P.primary700 }}>
            Classe {cls}
          </Typography>
          <Box sx={{ flex: 1, height: 6, bgcolor: 'grey.300', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${(count / data.total) * 100 * 3}%`, bgcolor: 'text.primary', borderRadius: 3, maxWidth: '100%' }} />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 28, textAlign: 'right' }}>
            {count}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ── Fiscal Info card ─────────────────────────────────────────────────
function FiscalInfoCardView({ data }: { data: FiscalInfoCard }) {
  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block', mb: 0.75, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
        {data.category}
      </Typography>
      {data.items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3, borderBottom: i < data.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
          <Typography variant="caption" sx={{ color: P.primary700 }}>
            {item.label}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'JetBrains Mono', monospace" }}>
            {item.value}
          </Typography>
        </Box>
      ))}
      {data.calculation && (
        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${P.primary200}` }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.3 }}>
            Detail du calcul
          </Typography>
          {data.calculation.steps.map((step, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', color: P.primary700, lineHeight: 1.7, pl: 1 }}>
              {i + 1}. {step}
            </Typography>
          ))}
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'success.main', mt: 0.5, pl: 1 }}>
            = {data.calculation.result}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

// ── Liasse Sheet card ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  cover: '#3b82f6', guards: '#22c55e', fiches: '#f59e0b',
  statements: '#8b5cf6', notes: '#06b6d4', supplements: '#d97706', comments: P.primary500,
}

function LiasseSheetCardView({ data }: { data: LiasseSheetCard }) {
  return (
    <Box sx={{ mt: 1 }}>
      {data.sheets.map((sheet, i) => (
        <Box key={i} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50', mb: i < data.sheets.length - 1 ? 1 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={sheet.category}
              size="small"
              sx={{ bgcolor: CATEGORY_COLORS[sheet.category] || P.primary500, color: P.white, fontWeight: 600, fontSize: '0.6rem', height: 20 }}
            />
            <Chip
              label={sheet.required ? 'Obligatoire' : 'Facultatif'}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.6rem', height: 20,
                borderColor: sheet.required ? '#dc2626' : P.primary400,
                color: sheet.required ? '#dc2626' : P.primary400,
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
            {sheet.name} — {sheet.title}
          </Typography>
          {sheet.description && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
              {sheet.description}
            </Typography>
          )}
          {sheet.regimes && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
              {Object.entries(sheet.regimes).map(([regime, status]) => {
                const color = status === 'obligatoire' ? '#dc2626' : status === 'facultatif' ? '#d97706' : P.primary400
                return (
                  <Chip
                    key={regime}
                    label={`${regime}: ${status}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.55rem', height: 18, borderColor: color, color }}
                  />
                )
              })}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}

// ── Audit Control card ───────────────────────────────────────────────
const SEVERITY_COLORS: Record<string, string> = {
  BLOQUANT: '#dc2626', MAJEUR: '#d97706', MINEUR: '#3b82f6', INFO: P.primary500, OK: '#16a34a',
}

function AuditControlCardView({ data }: { data: AuditControlCard }) {
  return (
    <Box sx={{ mt: 1 }}>
      {data.summary && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75, fontStyle: 'italic' }}>
          {data.summary}
        </Typography>
      )}
      {data.controls.map((ctrl, i) => (
        <Box key={i} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50', mb: i < data.controls.length - 1 ? 0.75 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={ctrl.ref}
              size="small"
              sx={{ bgcolor: 'text.primary', color: P.white, fontWeight: 700, fontSize: '0.65rem', height: 22, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <Chip
              label={ctrl.severite}
              size="small"
              sx={{ bgcolor: SEVERITY_COLORS[ctrl.severite] || P.primary500, color: P.white, fontWeight: 600, fontSize: '0.6rem', height: 20 }}
            />
            <Chip
              label={`Niveau ${ctrl.niveau}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.6rem', height: 20, color: 'text.secondary' }}
            />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
            {ctrl.nom}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            {ctrl.description.slice(0, 150)}{ctrl.description.length > 150 ? '...' : ''}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ── Prediction card ──────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  excellent: '#16a34a', bon: '#3b82f6', acceptable: '#d97706', critique: '#dc2626',
}

const TREND_ARROWS: Record<string, string> = {
  up: '\u2191', down: '\u2193', stable: '\u2192',
}

function PredictionCardView({ data }: { data: PredictionCard }) {
  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 1, fontSize: '0.75rem' }}>
        {data.title}
      </Typography>

      {/* Indicators grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
        {data.indicators.map((ind, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 0.75, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid #f0f0f0' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[ind.status] || P.primary500, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.6rem', lineHeight: 1.2 }}>
                {ind.label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>
                {ind.value}
                {ind.trend && (
                  <span style={{ color: ind.trend === 'up' ? '#16a34a' : ind.trend === 'down' ? '#dc2626' : P.primary500, marginLeft: 4 }}>
                    {TREND_ARROWS[ind.trend]}
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Narrative */}
      {data.narrative && (
        <Box sx={{ mt: 1, pt: 0.75, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="caption" sx={{ color: P.primary700, lineHeight: 1.6 }}>
            {renderMarkdown(data.narrative)}
          </Typography>
        </Box>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.25, fontSize: '0.6rem' }}>
            RECOMMANDATIONS
          </Typography>
          {data.recommendations.map((rec, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', color: P.primary700, lineHeight: 1.6, pl: 1 }}>
              • {rec}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ── Ecriture card ───────────────────────────────────────────────────
function EcritureCardView({ data }: { data: EcritureCard }) {
  const { ecriture } = data
  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: `1px solid ${P.primary200}`, bgcolor: 'grey.50' }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block', mb: 0.5 }}>
        {data.description}
      </Typography>
      <Table size="small" sx={{ '& td, & th': { py: 0.3, px: 0.75, fontSize: '0.7rem', borderBottom: '1px solid #f0f0f0' } }}>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem' } }}>
            <TableCell>Compte</TableCell>
            <TableCell>Libelle</TableCell>
            <TableCell align="right">Debit</TableCell>
            <TableCell align="right">Credit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ecriture.lignes.map((l, k) => (
            <TableRow key={k}>
              <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{l.compte}</TableCell>
              <TableCell>{l.libelleCompte}</TableCell>
              <TableCell align="right" sx={{ color: l.sens === 'D' ? '#dc2626' : 'transparent', fontFamily: "'JetBrains Mono', monospace" }}>
                {l.sens === 'D' ? 'X' : ''}
              </TableCell>
              <TableCell align="right" sx={{ color: l.sens === 'C' ? '#16a34a' : 'transparent', fontFamily: "'JetBrains Mono', monospace" }}>
                {l.sens === 'C' ? 'X' : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

// ── Rich content renderer ────────────────────────────────────────────
function RichContentView({ content, onSelect }: { content: RichContent; onSelect: (q: string) => void }) {
  switch (content.type) {
    case 'account':
      return <AccountCardView data={content} />
    case 'fonctionnement':
      return <FonctionnementCardView data={content} />
    case 'chapitre':
      return <ChapitreCardView data={content} />
    case 'search_results':
      return <SearchResultsCardView data={content} onSelect={onSelect} />
    case 'stats':
      return <StatsCardView data={content} />
    case 'fiscal_info':
      return <FiscalInfoCardView data={content} />
    case 'liasse_sheet':
      return <LiasseSheetCardView data={content} />
    case 'audit_control':
      return <AuditControlCardView data={content} />
    case 'prediction':
      return <PredictionCardView data={content} />
    case 'ecriture':
      return <EcritureCardView data={content} />
    default:
      return null
  }
}

// ── Typing indicator ─────────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5, px: 2 }}>
      <Box
        sx={{
          maxWidth: '85%',
          bgcolor: 'background.paper',
          border: `1px solid ${P.primary200}`,
          borderRadius: '12px 12px 12px 4px',
          px: 2,
          py: 1.2,
          display: 'flex',
          gap: 0.6,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'text.disabled',
              animation: 'prophet-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
              '@keyframes prophet-bounce': {
                '0%, 60%, 100%': { transform: 'translateY(0)' },
                '30%': { transform: 'translateY(-6px)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

// ── Main bubble component ────────────────────────────────────────────
interface Props {
  message: ChatMessage
  onSuggestionClick: (text: string) => void
}

export default function Proph3tMessageBubble({ message, onSuggestionClick }: Props) {
  const isUser = message.role === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: isUser ? '80%' : '85%',
          bgcolor: isUser ? P.primary100 : P.white,
          border: isUser ? 'none' : `1px solid ${P.primary200}`,
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          px: 2,
          py: 1.2,
        }}
      >
        {/* Text content */}
        <TextBlock text={message.text} />

        {/* Rich content */}
        {message.content?.map((c, i) => (
          <RichContentView key={i} content={c} onSelect={onSuggestionClick} />
        ))}

        {/* Suggestion chips */}
        {message.suggestions && message.suggestions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
            {message.suggestions.map((s, i) => (
              <Chip
                key={i}
                label={s}
                size="small"
                variant="outlined"
                onClick={() => onSuggestionClick(s)}
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  cursor: 'pointer',
                  borderColor: P.primary300,
                  color: P.primary600,
                  '&:hover': { bgcolor: 'grey.100', borderColor: P.primary900 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
