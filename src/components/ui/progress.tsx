/**
 * Progress component using Material-UI
 */
import React from 'react'
import { LinearProgress, LinearProgressProps } from '@mui/material'

export const Progress = ({ value, ...props }: LinearProgressProps) => (
  <LinearProgress variant={value !== undefined ? 'determinate' : 'indeterminate'} value={value} {...props} />
)