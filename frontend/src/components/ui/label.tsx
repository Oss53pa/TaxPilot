/**
 * Label component using Material-UI
 */
import { FormLabel, FormLabelProps } from '@mui/material'

export const Label = ({ children, ...props }: FormLabelProps) => (
  <FormLabel {...props}>{children}</FormLabel>
)