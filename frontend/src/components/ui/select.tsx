/**
 * Select component using Material-UI
 */
import React from 'react'
import { Select as MuiSelect, MenuItem, SelectProps, SelectChangeEvent } from '@mui/material'

export interface CustomSelectProps extends Omit<SelectProps, 'children' | 'onChange'> {
  children?: React.ReactNode
  onValueChange?: (value: string) => void
  onChange?: SelectProps['onChange']
}

export const Select = ({ children, onValueChange, onChange, ...props }: CustomSelectProps) => {
  const handleChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const value = event.target.value as string
    if (onValueChange) {
      onValueChange(value)
    }
    if (onChange) {
      onChange(event, child)
    }
  }

  return <MuiSelect {...props} onChange={handleChange}>{children}</MuiSelect>
}

export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <MenuItem value={value}>{children}</MenuItem>
)
export const SelectTrigger = ({ children }: { children: React.ReactNode; className?: string }) => <>{children}</>
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>
