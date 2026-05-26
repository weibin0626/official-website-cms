import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch?: (search: string) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  getRowId: (row: T) => string;
  rowKey?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  total,
  page,
  pageSize,
  loading = false,
  searchable = true,
  searchPlaceholder = '搜索...',
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSort,
  getRowId,
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    const direction = isAsc ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    onSort?.(field, direction);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = rows.map((row) => getRowId(row));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1),
      );
    }

    onSelectionChange?.(newSelected);
  };

  return (
    <Paper variant="outlined">
      {searchable && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            variant="standard"
            fullWidth
            InputProps={{ disableUnderline: true }}
          />
        </Box>
      )}

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ bgcolor: 'grey.50' }}>
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
                    checked={rows.length > 0 && selectedIds.length === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.minWidth,
                    width: col.width,
                    bgcolor: 'grey.50',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">暂无数据</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds.indexOf(id) !== -1;
                return (
                  <TableRow
                    hover
                    key={id}
                    selected={isSelected}
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align || 'left'} sx={{ fontSize: '0.8125rem' }}>
                        {col.render ? col.render(row) : (row as any)[col.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="每页"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
      />
    </Paper>
  );
}

export default DataTable;
