/**
 * Textarea component using Material-UI
 */
import { TextField, TextFieldProps } from '@mui/material'

export const Textarea = ({ ...props }: TextFieldProps) => (
  <TextField
    multiline
    rows={4}
    variant="outlined"
    {...props}
  />
)