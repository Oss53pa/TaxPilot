/**
 * Badge component using Material-UI
 */
import React from 'react'
import { Chip, ChipProps } from '@mui/material'

type CustomVariant = 'default' | 'secondary' | 'destructive' | 'outlined' | 'filled'

interface CustomBadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: CustomVariant
}

export const Badge = ({ children, variant = 'default', ...props }: CustomBadgeProps) => {
  const variantMap: Record<CustomVariant, ChipProps['variant']> = {
    default: 'filled',
    secondary: 'outlined',
    destructive: 'filled',
    outlined: 'outlined',
    filled: 'filled'
  }

  const colorMap: Record<CustomVariant, ChipProps['color']> = {
    default: 'default',
    secondary: 'default',
    destructive: 'error',
    outlined: 'default',
    filled: 'primary'
  }

  return (
    <Chip
      label={children}
      variant={variantMap[variant]}
      color={colorMap[variant]}
      size="small"
      {...props}
    />
  )
}