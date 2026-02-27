/**
 * Table component using Material-UI
 */
import React from 'react'
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Paper
} from '@mui/material'

export const Table = ({ children, ...props }: { children: React.ReactNode }) => (
  <TableContainer component={Paper}>
    <MuiTable {...props}>{children}</MuiTable>
  </TableContainer>
)

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <MuiTableHead>{children}</MuiTableHead>
)

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <MuiTableBody>{children}</MuiTableBody>
)

export const TableRow = ({ children, ...props }: { children: React.ReactNode }) => (
  <MuiTableRow {...props}>{children}</MuiTableRow>
)

export const TableHead = ({ children, ...props }: { children: React.ReactNode }) => (
  <MuiTableCell component="th" scope="row" {...props}>{children}</MuiTableCell>
)

export const TableCell = ({ children, ...props }: { children: React.ReactNode }) => (
  <MuiTableCell {...props}>{children}</MuiTableCell>
)