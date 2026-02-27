/**
 * Slider component using Material-UI
 */
import React from 'react'
import { Slider as MuiSlider, SliderProps } from '@mui/material'

interface CustomSliderProps extends Omit<SliderProps, 'onChange'> {
  onValueChange?: (value: number | number[]) => void
  onChange?: SliderProps['onChange']
}

export const Slider = ({ onValueChange, onChange, ...props }: CustomSliderProps) => {
  const handleChange = (event: Event, value: number | number[], activeThumb: number) => {
    if (onValueChange) {
      onValueChange(value)
    }
    if (onChange) {
      onChange(event, value, activeThumb)
    }
  }

  return <MuiSlider {...props} onChange={handleChange} />
}