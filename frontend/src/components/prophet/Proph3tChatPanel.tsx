import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Typography, TextField, IconButton, Chip, Grow } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import Proph3tMessageBubble, { TypingIndicator } from './Proph3tMessageBubble'
import { processQuery } from './Proph3tEngine'
import { balanceService } from '@/services/balanceService'
import type { Balance } from '@/types'
import type { ChatMessage, ConversationContext } from './types'

// ── Quick action chips ───────────────────────────────────────────────
const QUICK_ACTIONS = [
  'Chercher un compte',
  'Taux fiscaux CI',
  'Analyse predictive',
  'Controles audit',
  'Liasse fiscale',
  'Aide',
]

// ── Welcome message ──────────────────────────────────────────────────
function makeWelcome(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    text: "Bonjour ! Je suis **Proph3t**, votre assistant expert.\n\nJe maitrise **5 domaines** : SYSCOHADA, fiscalite CI, liasse fiscale, audit et analyse predictive.\n\nComment puis-je vous aider ?",
    suggestions: [
      'Taux IS',
      'Note 15',
      'Audit',
      'Mes ratios',
    ],
    timestamp: Date.now(),
  }
}

// ── Props ────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
}

export default function Proph3tChatPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcome()])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const contextRef = useRef<ConversationContext>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load balance data from service ──
  useEffect(() => {
    async function loadBalance() {
      try {
        const raw = await balanceService.getBalances({ page_size: 100 }) as Record<string, any>
        const balances = raw?.results || raw?.data || []
        if (balances.length > 0) {
          const details = await balanceService.getLignesBalance(balances[0].id, { page_size: 5000 }) as any
          const lignes: Balance[] = details?.results || details?.lignes || details?.data || []
          if (lignes.length > 0) {
            contextRef.current = {
              ...contextRef.current,
              balanceData: { balanceN: lignes },
            }
          }
        }
      } catch {
        // Balance not available — predictive features will show appropriate message
      }
    }
    loadBalance()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulate thinking delay (300-800ms)
    const delay = 300 + Math.random() * 500
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      const { response, newContext } = await processQuery(trimmed, contextRef.current)
      contextRef.current = newContext

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: response.text,
        content: response.content,
        suggestions: response.suggestions,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        text: "Desole, une erreur est survenue. Veuillez reformuler votre question.",
        suggestions: ['Aide', 'Statistiques'],
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setTyping(false)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleSuggestionClick = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  return (
    <Grow in={open} style={{ transformOrigin: 'bottom right' }}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          width: 'min(400px, calc(100vw - 32px))',
          height: 520,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          bgcolor: '#fff',
          zIndex: 1400,
          border: '1px solid #e5e5e5',
        }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: '#171717',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'Grand Hotel', cursive",
                fontSize: '1.6rem',
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              Proph3t
            </Typography>
            <Typography variant="caption" sx={{ color: '#a3a3a3' }}>
              Assistant SYSCOHADA & Fiscal CI
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#a3a3a3', '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Messages ────────────────────────────────────────── */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 2,
            bgcolor: '#fafafa',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#d4d4d4', borderRadius: 2 },
          }}
        >
          {messages.map(msg => (
            <Proph3tMessageBubble
              key={msg.id}
              message={msg}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
          {typing && <TypingIndicator />}
        </Box>

        {/* ── Quick actions ───────────────────────────────────── */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            gap: 0.5,
            overflowX: 'auto',
            flexShrink: 0,
            borderTop: '1px solid #f0f0f0',
            bgcolor: '#fff',
            '&::-webkit-scrollbar': { height: 0 },
          }}
        >
          {QUICK_ACTIONS.map(action => (
            <Chip
              key={action}
              label={action}
              size="small"
              variant="outlined"
              onClick={() => sendMessage(action)}
              sx={{
                fontSize: '0.7rem',
                height: 26,
                flexShrink: 0,
                cursor: 'pointer',
                borderColor: '#e5e5e5',
                color: '#525252',
                '&:hover': { bgcolor: '#f5f5f5', borderColor: '#171717' },
              }}
            />
          ))}
        </Box>

        {/* ── Input ───────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            borderTop: '1px solid #e5e5e5',
            bgcolor: '#fff',
            flexShrink: 0,
          }}
        >
          <TextField
            inputRef={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question..."
            variant="outlined"
            size="small"
            fullWidth
            multiline
            maxRows={3}
            disabled={typing}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontSize: '0.85rem',
                bgcolor: '#fafafa',
                '& fieldset': { borderColor: '#e5e5e5' },
                '&:hover fieldset': { borderColor: '#a3a3a3' },
                '&.Mui-focused fieldset': { borderColor: '#171717' },
              },
            }}
          />
          <IconButton
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            sx={{
              bgcolor: '#171717',
              color: '#fff',
              width: 36,
              height: 36,
              flexShrink: 0,
              '&:hover': { bgcolor: '#262626' },
              '&.Mui-disabled': { bgcolor: '#e5e5e5', color: '#a3a3a3' },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Grow>
  )
}
