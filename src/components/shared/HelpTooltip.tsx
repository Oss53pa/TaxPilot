/**
 * Composant d'aide contextuelle avec tooltips explicatives
 * Améliore l'autonomie utilisateur
 */

import React from 'react'
import {
  Tooltip,
  IconButton,
  Typography,
  Box,
  Fade,
  Paper,
} from '@mui/material'
import {
  Help as HelpIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface HelpTooltipProps {
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  type?: 'help' | 'info'
  maxWidth?: number
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  placement = 'top',
  type = 'help',
  maxWidth = 300
}) => {
  const CustomTooltip = (props: any) => (
    <Tooltip
      {...props}
      title={
        <Box sx={{ p: 1, maxWidth }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2">
            {content}
          </Typography>
        </Box>
      }
      placement={placement}
      arrow
      TransitionComponent={Fade}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 4,
            border: 1,
            borderColor: 'divider',
            '& .MuiTooltip-arrow': {
              color: 'background.paper'
            }
          }
        }
      }}
    >
      <IconButton size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
        {type === 'help' ? (
          <HelpIcon fontSize="small" />
        ) : (
          <InfoIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  )

  return <CustomTooltip />
}

export default HelpTooltip