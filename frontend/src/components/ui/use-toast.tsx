/**
 * Toast hook using Material-UI Snackbar
 */
import { useSnackbar } from 'notistack'

export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar()

  const toast = (message: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
    const variant = message.variant === 'destructive' ? 'error' : 'info'
    enqueueSnackbar(message.description || message.title || '', { variant })
  }

  return { toast }
}