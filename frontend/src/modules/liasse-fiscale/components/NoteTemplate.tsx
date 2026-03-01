import React, { useState, useCallback } from 'react'
import { Box, Typography, TextField, Stack, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Comment as CommentIcon } from '@mui/icons-material'
import LiasseHeader from './LiasseHeader'
import LiasseTable from './LiasseTable'
import type { PageProps } from '../types'
import type { Column, Row } from './LiasseTable'

interface NoteTemplateProps extends PageProps {
  noteLabel: string
  noteTitle: string
  pageNumber: string
  columns?: Column[]
  rows?: Row[]
  commentSection?: boolean
  children?: React.ReactNode
}

const COMMENT_PREFIX = 'fiscasync_liasse_note_comment_'

const NoteTemplate: React.FC<NoteTemplateProps> = ({
  entreprise,
  noteLabel,
  noteTitle,
  pageNumber,
  columns,
  rows,
  commentSection = true,
  children,
  onNoteClick,
}) => {
  const theme = useTheme()
  const storageKey = COMMENT_PREFIX + noteLabel.replace(/\s+/g, '_').toLowerCase()

  const [comment, setComment] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || ''
    } catch { return '' }
  })

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setComment(val)
    try { localStorage.setItem(storageKey, val) } catch { /* full */ }
  }, [storageKey])

  return (
    <Box>
      <LiasseHeader entreprise={entreprise} noteLabel={noteLabel} pageNumber={pageNumber} />

      {/* Note title — like System A fullTitle style */}
      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1.5, borderTop: '1px solid #000', pt: 0.75 }}>
        {noteTitle}
      </Typography>

      {columns && rows && (
        <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
      )}

      {children}

      {/* Comment section — matches BilanActifSYSCOHADA style */}
      {commentSection && (
        <Box sx={{
          mt: 2,
          p: 2,
          bgcolor: alpha(theme.palette.action.hover, 0.3),
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CommentIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Commentaires et observations
            </Typography>
          </Stack>
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Saisissez vos commentaires et observations..."
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.background.paper,
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default NoteTemplate
