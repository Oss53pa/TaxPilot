/**
 * Table component using Material-UI
 */
import React from 'react'
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableCellProps,
  TableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  TableRowProps,
  TableProps,
  Paper
} from '@mui/material'

export const Table = ({ children, ...props }: TableProps & { children: React.ReactNode }) => (
  <TableContainer component={Paper}>
    <MuiTable {...props}>{children}</MuiTable>
  </TableContainer>
)

export const TableHeader = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLTableSectionElement>) => (
  <MuiTableHead {...props as any}>{children}</MuiTableHead>
)

export const TableBody = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLTableSectionElement>) => (
  <MuiTableBody {...props as any}>{children}</MuiTableBody>
)

export const TableRow = ({ children, ...props }: TableRowProps & { children: React.ReactNode }) => (
  <MuiTableRow {...props}>{children}</MuiTableRow>
)

export const TableHead = ({ children, ...props }: TableCellProps & { children: React.ReactNode }) => (
  <MuiTableCell component="th" scope="row" {...props}>{children}</MuiTableCell>
)

export const TableCell = ({ children, ...props }: TableCellProps & { children?: React.ReactNode }) => (
  <MuiTableCell {...props}>{children}</MuiTableCell>
)
