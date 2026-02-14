/**
 * Alert component using Material-UI
 */
import React from 'react'
import { Alert as MuiAlert, AlertProps, AlertTitle } from '@mui/material'

export const Alert = ({ children, ...props }: AlertProps) => (
  <MuiAlert {...props}>{children}</MuiAlert>
)

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

export { AlertTitle }