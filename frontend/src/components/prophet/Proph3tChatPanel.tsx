import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Box, Typography, TextField, IconButton, Chip, Grow, Tooltip } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined'
import { useLocation } from 'react-router-dom'
import Proph3tMessageBubble, { TypingIndicator } from './Proph3tMessageBubble'
import { processQuery } from './Proph3tEngine'
import { getLatestBalance, getLatestBalanceN1 } from '@/services/balanceStorageService'
import { getEntreprise } from '@/services/entrepriseStorageService'
import type { Balance } from '@/types'
import type { ChatMessage, ConversationContext } from './types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// ── Persistence constants ────────────────────────────────────────────
const CHAT_STORAGE_KEY = 'fiscasync_prophet_chat'
const MAX_PERSISTED_MESSAGES = 50

function loadPersistedMessages(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const msgs: ChatMessage[] = JSON.parse(raw)
      if (Array.isArray(msgs) && msgs.length > 0) return msgs
    }
  } catch { /* corrupt data — ignore */ }
  return null
}

function persistMessages(messages: ChatMessage[]) {
  try {
    // Keep only the last MAX messages (FIFO)
    const toSave = messages.slice(-MAX_PERSISTED_MESSAGES)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave))
  } catch { /* storage full — ignore */ }
}

// ── Convert BalanceEntry → Balance for the engine ────────────────────
function loadBalanceAsEngineFormat(): { balanceN: Balance[]; balanceN1?: Balance[] } | null {
  const stored = getLatestBalance()
  if (!stored?.entries?.length) return null

  const toBalance = (entries: typeof stored.entries, exercice: string): Balance[] =>
    entries.map(e => ({
      id: e.compte,
      exercice,
      compte: e.compte,
      debit: e.debit ?? 0,
      credit: e.credit ?? 0,
      solde: (e.solde_debit ?? 0) - (e.solde_credit ?? 0),
      libelle_compte: e.intitule || '',
      created_at: '',
      updated_at: '',
      is_active: true,
    }))

  const balanceN = toBalance(stored.entries, stored.exercice || '')

  let balanceN1: Balance[] | undefined
  const storedN1 = getLatestBalanceN1()
  if (storedN1?.entries?.length) {
    balanceN1 = toBalance(storedN1.entries, storedN1.exercice || '')
  }

  return { balanceN, balanceN1 }
}

// ── Detect liasse page from URL ──────────────────────────────────────
function detectLiassePage(pathname: string): string | undefined {
  if (!pathname.startsWith('/liasse-fiscale')) return undefined
  // /liasse-fiscale → module root
  // The page ID is tracked internally by the module, not in URL
  // Return 'module' to indicate user is in the liasse module
  return 'liasse-module'
}

// ── Dynamic quick actions ────────────────────────────────────────────
function getQuickActions(hasBalance: boolean, onLiasse: boolean): string[] {
  if (onLiasse && hasBalance) {
    return ['Analyse generale', 'SIG', 'Mes ratios', 'Estimation IS', 'Audit']
  }
  if (onLiasse) {
    return ['Liasse fiscale', 'Note 15', 'Taux fiscaux CI', 'Controles audit', 'Aide']
  }
  if (hasBalance) {
    return ['Analyse generale', 'Mes ratios', 'SIG', 'BFR', 'Estimation IS', 'Audit']
  }
  return ['Chercher un compte', 'Taux fiscaux CI', 'Controles audit', 'Liasse fiscale', 'Aide']
}

// ── Welcome message ──────────────────────────────────────────────────
function makeWelcome(hasBalance: boolean): ChatMessage {
  const balanceMsg = hasBalance
    ? '\n\nBalance importee detectee — analyses predictives disponibles.'
    : ''
  return {
    id: 'welcome',
    role: 'assistant',
    text: `Bonjour ! Je suis **Proph3t**, votre assistant expert.\n\nJe maitrise **5 domaines** : SYSCOHADA, fiscalite CI, liasse fiscale, audit et analyse predictive.${balanceMsg}\n\nComment puis-je vous aider ?`,
    suggestions: hasBalance
      ? ['Analyse generale', 'SIG', 'Mes ratios', 'Estimation IS']
      : ['Taux IS', 'Note 15', 'Audit', 'Aide'],
    timestamp: Date.now(),
  }
}

// ── Props ────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
}

export default function Proph3tChatPanel({ open, onClose }: Props) {
  const location = useLocation()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadPersistedMessages() || [makeWelcome(!!getLatestBalance()?.entries?.length)]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [balanceLoaded, setBalanceLoaded] = useState(false)
  const contextRef = useRef<ConversationContext>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load balance data directly from localStorage ──
  const refreshContext = useCallback(() => {
    const balData = loadBalanceAsEngineFormat()
    const ent = getEntreprise()
    const liassePage = detectLiassePage(location.pathname)

    contextRef.current = {
      ...contextRef.current,
      balanceData: balData ?? undefined,
      balanceLoaded: !!balData,
      currentLiassePage: liassePage,
      regime: ent?.regime_imposition,
      entreprise: ent ? {
        nom: ent.raison_sociale,
        regime_imposition: ent.regime_imposition,
        capital: (ent as any).capital_social,
        effectifs: (ent as any).effectifs,
        secteur_activite: ent.secteur_activite,
      } : undefined,
    }

    setBalanceLoaded(!!balData)
  }, [location.pathname])

  // Load on mount + refresh when panel opens or route changes
  useEffect(() => {
    refreshContext()
  }, [refreshContext, open])

  // Listen for balance changes via storage events (cross-tab) + custom event
  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('fiscasync_balance_')) {
        refreshContext()
      }
    }
    const onBalanceImport = () => refreshContext()

    window.addEventListener('storage', onStorageChange)
    window.addEventListener('fiscasync:balance-imported', onBalanceImport)
    return () => {
      window.removeEventListener('storage', onStorageChange)
      window.removeEventListener('fiscasync:balance-imported', onBalanceImport)
    }
  }, [refreshContext])

  // Detect liasse page on route change
  const onLiasse = location.pathname.startsWith('/liasse-fiscale')

  // Dynamic quick actions
  const quickActions = useMemo(
    () => getQuickActions(balanceLoaded, onLiasse),
    [balanceLoaded, onLiasse]
  )

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      persistMessages(messages)
    }
  }, [messages])

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

    // Refresh context before each query to catch new imports
    refreshContext()

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
  }, [refreshContext])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleSuggestionClick = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  const handleNewConversation = useCallback(() => {
    refreshContext()
    const welcome = makeWelcome(!!contextRef.current.balanceData)
    setMessages([welcome])
    persistMessages([welcome])
    setInput('')
  }, [refreshContext])

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
          bgcolor: 'background.paper',
          zIndex: 1400,
          border: `1px solid ${P.primary200}`,
        }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: 'text.primary',
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
                color: P.white,
                lineHeight: 1.2,
              }}
            >
              Proph3t
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Assistant SYSCOHADA & Fiscal CI
              {balanceLoaded && ' — Balance connectee'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Nouvelle conversation">
              <IconButton onClick={handleNewConversation} size="small" sx={{ color: 'text.disabled', '&:hover': { color: P.white } }}>
                <AddCommentOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.disabled', '&:hover': { color: P.white } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* ── Messages ────────────────────────────────────────── */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 2,
            bgcolor: 'grey.50',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: P.primary300, borderRadius: 2 },
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
            bgcolor: 'background.paper',
            '&::-webkit-scrollbar': { height: 0 },
          }}
        >
          {quickActions.map(action => (
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
                borderColor: P.primary200,
                color: P.primary600,
                '&:hover': { bgcolor: 'grey.100', borderColor: P.primary900 },
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
            borderTop: `1px solid ${P.primary200}`,
            bgcolor: 'background.paper',
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
                bgcolor: 'grey.50',
                '& fieldset': { borderColor: P.primary200 },
                '&:hover fieldset': { borderColor: P.primary400 },
                '&.Mui-focused fieldset': { borderColor: P.primary900 },
              },
            }}
          />
          <IconButton
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            sx={{
              bgcolor: 'text.primary',
              color: P.white,
              width: 36,
              height: 36,
              flexShrink: 0,
              '&:hover': { bgcolor: 'grey.900' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'text.disabled' },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Grow>
  )
}
