/**
 * Textarea component using Material-UI
 */
import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

export const Textarea = ({ ...props }: TextFieldProps) => (
  <TextField
    multiline
    rows={4}
    variant="outlined"
    {...props}
  />
)