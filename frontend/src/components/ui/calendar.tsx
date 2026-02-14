/**
 * Calendar component using Material-UI
 */
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface CalendarProps {
  value?: Date
  onChange?: (date: Date | null) => void
  className?: string
}

export const Calendar = ({ value, onChange, className }: CalendarProps) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DatePicker
      value={value}
      onChange={onChange}
      className={className}
    />
  </LocalizationProvider>
)