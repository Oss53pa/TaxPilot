/**
 * Tabs component using Material-UI
 */
import React from 'react'
import { Tabs as MuiTabs, Tab, TabsProps, Box } from '@mui/material'

interface CustomTabsProps extends Omit<TabsProps, 'onChange' | 'value'> {
  value?: string | number
  onValueChange?: (value: string) => void
  onChange?: TabsProps['onChange']
}

export const Tabs = ({ children, value, onValueChange, onChange, ...props }: CustomTabsProps) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: any) => {
    if (onValueChange) {
      onValueChange(String(newValue))
    }
    if (onChange) {
      onChange(_event, newValue)
    }
  }

  return (
    <MuiTabs {...props} value={value} onChange={handleChange}>
      {children}
    </MuiTabs>
  )
}

export const TabsList = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <Tab label={children} value={value} />
)
export const TabsContent = ({ value: _value, children, className, ...props }: { value: string; children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <Box className={className} {...props}>{children}</Box>
)
