/**
 * Tabs component using Material-UI
 */
import React from 'react'
import { Tabs as MuiTabs, Tab, TabsProps, Box } from '@mui/material'

interface TabsPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

interface CustomTabsProps extends Omit<TabsProps, 'onChange' | 'value'> {
  value?: string | number
  onValueChange?: (value: string) => void
  onChange?: TabsProps['onChange']
}

export const Tabs = ({ children, value, onValueChange, onChange, ...props }: CustomTabsProps) => {
  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    if (onValueChange) {
      onValueChange(String(newValue))
    }
    if (onChange) {
      onChange(event, newValue)
    }
  }

  return (
    <MuiTabs {...props} value={value} onChange={handleChange}>
      {children}
    </MuiTabs>
  )
}

export const TabsList = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <Tab label={children} value={value} />
)
export const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <Box>{children}</Box>
)