/**
 * Card component using Material-UI
 */
import React from 'react'
import { Card as MuiCard, CardProps, CardContent as MuiCardContent, CardHeader as MuiCardHeader } from '@mui/material'

export const Card = ({ children, ...props }: CardProps) => (
  <MuiCard {...props}>{children}</MuiCard>
)

export const CardContent = MuiCardContent
export const CardHeader = MuiCardHeader
export const CardTitle = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)
export const CardDescription = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)