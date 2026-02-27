/**
 * Input component using Material-UI
 */
import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

export const Input = ({ ...props }: TextFieldProps) => (
  <TextField variant="outlined" size="small" {...props} />
)