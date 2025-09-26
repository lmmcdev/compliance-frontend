import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { usePagination, useSearch } from '../../../hooks/data';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.grey[50],
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const LoadingOverlay = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 200,
}));

const SearchToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  minHeight: 64,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export interface DataTableColumn<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface DataTableProps<T = any> {
  // Data and state
  data: T[] | null;
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;

  // Pagination integration
  pagination?: ReturnType<typeof usePagination>;

  // Search integration
  search?: ReturnType<typeof useSearch>;

  // Selection
  selectable?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  getItemId?: (item: T) => string;

  // Actions
  onRefresh?: () => void;

  // Customization
  title?: string;
  emptyMessage?: string;
  density?: 'compact' | 'normal' | 'comfortable';

  // Row actions
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
}

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  search,
  selectable = false,
  selectedItems = new Set(),
  onSelectionChange,
  getItemId = (item: any) => item.id,
  onRefresh,
  title,
  emptyMessage = 'No data available',
  density = 'normal',
  onRowClick,
  rowActions,
}: DataTableProps<T>) {

  // Calculate display data
  const displayData = useMemo(() => {
    if (search?.hasSearched && search.data) {
      return Array.isArray(search.data) ? search.data : [];
    }
    return Array.isArray(data) ? data : [];
  }, [data, search?.hasSearched, search?.data]);

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange || !displayData) return;

    if (event.target.checked) {
      const allIds = new Set(displayData.map(getItemId));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedItems);
    if (selectedItems.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = displayData.length > 0 &&
    displayData.every(item => selectedItems.has(getItemId(item)));
  const isIndeterminate = selectedItems.size > 0 && !isAllSelected;

  // Table density styles
  const getDensityProps = () => {
    switch (density) {
      case 'compact':
        return { size: 'small' as const, padding: 'checkbox' as const };
      case 'comfortable':
        return { size: 'medium' as const, padding: 'normal' as const };
      default:
        return { size: 'medium' as const, padding: 'normal' as const };
    }
  };

  return (
    <Paper elevation={1}>
      {/* Search and Actions Toolbar */}
      {(search || title || onRefresh) && (
        <SearchToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {title && (
              <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                {title}
              </Typography>
            )}

            {search && (
              <TextField
                size="small"
                placeholder="Search..."
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search.query && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={search.clearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250, mr: 2 }}
              />
            )}
          </Box>

          {onRefresh && (
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          )}
        </SearchToolbar>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !displayData.length && (
        <LoadingOverlay>
          <CircularProgress />
        </LoadingOverlay>
      )}

      {/* Empty State */}
      {!loading && !error && displayData.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      )}

      {/* Data Table */}
      {displayData.length > 0 && (
        <>
          <StyledTableContainer>
            <Table {...getDensityProps()}>
              <TableHead>
                <TableRow>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell align="right">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayData.map((row, _) => {
                  const itemId = getItemId(row);
                  const isSelected = selectedItems.has(itemId);

                  return (
                    <TableRow
                      hover
                      key={itemId}
                      selected={isSelected}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        ...(loading && { opacity: 0.7 })
                      }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectItem(itemId)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = (row as any)[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                      {rowActions && (
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          {rowActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {/* Pagination */}
          {pagination && (
            <TablePagination
              rowsPerPageOptions={pagination.pageSizeOptions}
              component="div"
              count={pagination.total}
              rowsPerPage={pagination.pageSize}
              page={pagination.page - 1} // MUI uses 0-based indexing
              onPageChange={(_, page) => pagination.setPage(page + 1)}
              onRowsPerPageChange={(e) => pagination.setPageSize(parseInt(e.target.value, 10))}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
              }
            />
          )}
        </>
      )}
    </Paper>
  );
}

export default DataTable;