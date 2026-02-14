/**
 * Dialog component using Material-UI
 */
import { Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions, DialogProps } from '@mui/material'

interface CustomDialogProps extends Omit<DialogProps, 'onClose'> {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

export const Dialog = ({ children, open, onOpenChange, onClose, ...props }: CustomDialogProps) => {
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <MuiDialog open={!!open} onClose={handleClose} {...props}>
      {children}
    </MuiDialog>
  )
}

export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <MuiDialogContent className={className}>{children}</MuiDialogContent>
)
export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
)
export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <MuiDialogTitle>{children}</MuiDialogTitle>
)
export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <DialogActions>{children}</DialogActions>
)
export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
