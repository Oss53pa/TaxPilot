/**
 * Button component using Material-UI
 */
import React from 'react'
import { Button as MuiButton, ButtonProps } from '@mui/material'

export const Button = ({ children, variant = 'contained', ...props }: ButtonProps) => (
  <MuiButton variant={variant} {...props}>{children}</MuiButton>
)