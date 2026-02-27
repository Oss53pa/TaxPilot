/**
 * Date Range Picker component using Material-UI
 */
import React from 'react'
import { TextField } from '@mui/material'

interface DateRangePickerProps {
  value?: { from: Date; to: Date }
  onChange?: (range: { from: Date; to: Date } | undefined) => void
  placeholder?: string
}

export const DateRangePicker = ({ value, onChange, placeholder }: DateRangePickerProps) => (
  <TextField
    type="date"
    placeholder={placeholder}
    size="small"
    variant="outlined"
    onChange={(e) => {
      const date = new Date(e.target.value)
      if (onChange) {
        onChange({ from: date, to: date })
      }
    }}
  />
)