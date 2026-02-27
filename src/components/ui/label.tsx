/**
 * Label component using Material-UI
 */
import React from 'react'
import { FormLabel, FormLabelProps } from '@mui/material'

export const Label = ({ children, ...props }: FormLabelProps) => (
  <FormLabel {...props}>{children}</FormLabel>
)