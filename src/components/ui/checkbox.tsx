/**
 * Checkbox component using Material-UI
 */
import React from 'react'
import { Checkbox as MuiCheckbox, CheckboxProps, FormControlLabel } from '@mui/material'

interface CustomCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  children?: React.ReactNode
  onCheckedChange?: (checked: boolean) => void
  onChange?: CheckboxProps['onChange']
}

export const Checkbox = ({ children, onCheckedChange, onChange, ...props }: CustomCheckboxProps) => {
  const handleChange: CheckboxProps['onChange'] = (event, checked) => {
    if (onCheckedChange) {
      onCheckedChange(checked)
    }
    if (onChange) {
      onChange(event, checked)
    }
  }

  if (children) {
    return <FormControlLabel control={<MuiCheckbox {...props} onChange={handleChange} />} label={children} />
  }
  return <MuiCheckbox {...props} onChange={handleChange} />
}