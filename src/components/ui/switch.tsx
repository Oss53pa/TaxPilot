/**
 * Switch component using Material-UI
 */
import React from 'react'
import { Switch as MuiSwitch, SwitchProps, FormControlLabel } from '@mui/material'

interface CustomSwitchProps extends Omit<SwitchProps, 'onChange'> {
  children?: React.ReactNode
  onCheckedChange?: (checked: boolean) => void
  onChange?: SwitchProps['onChange']
}

export const Switch = ({ children, onCheckedChange, onChange, ...props }: CustomSwitchProps) => {
  const handleChange: SwitchProps['onChange'] = (event, checked) => {
    if (onCheckedChange) {
      onCheckedChange(checked)
    }
    if (onChange) {
      onChange(event, checked)
    }
  }

  if (children) {
    return <FormControlLabel control={<MuiSwitch {...props} onChange={handleChange} />} label={children} />
  }
  return <MuiSwitch {...props} onChange={handleChange} />
}