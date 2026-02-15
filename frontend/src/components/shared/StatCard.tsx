import React from 'react'
import { Card, CardContent, Box, Typography, Avatar, alpha, useTheme } from '@mui/material'

interface StatCardProps {
  title: string
  value: string | number
  color: string
  icon: React.ReactElement
  subtitle?: string
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon, subtitle }) => {
  const theme = useTheme()

  return (
    <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: alpha(color, 0.1), color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}
