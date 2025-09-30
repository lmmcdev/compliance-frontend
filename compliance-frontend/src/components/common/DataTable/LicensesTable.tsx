import React, { useMemo } from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { useLicenses, useLicenseOperations, type License } from '../../../contexts';

interface LicensesTableProps {
  onEditLicense?: (license: License) => void;
  onViewLicense?: (license: License) => void;
  onDeleteLicense?: (license: License) => void;
  selectable?: boolean;
  selectedLicenses?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export const LicensesTable: React.FC<LicensesTableProps> = ({
  onEditLicense,
  onViewLicense,
  onDeleteLicense,
  selectable = false,
  selectedLicenses = new Set(),
  onSelectionChange,
}) => {
  // Data hooks
  const { data: licenses, loading, error, refresh, pagination } = useLicenses();
  const { delete: deleteOperation } = useLicenseOperations();

  // Table columns definition
  const columns: DataTableColumn<License>[] = useMemo(() => [
    {
      id: 'code',
      label: 'License Code',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'displayName',
      label: 'Display Name',
      minWidth: 180,
      format: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value || 'No description'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 130,
      format: (value) => {
        if (!value) return 'Never';
        const date = new Date(value);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      minWidth: 130,
      format: (value) => {
        if (!value) return 'Never';
        const date = new Date(value);
        return date.toLocaleDateString();
      },
    },
  ], []);

  // Row actions
  const rowActions = useMemo(() => (license: License) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onViewLicense && (
        <IconButton
          size="small"
          onClick={() => onViewLicense(license)}
          title="View license details"
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      )}

      {onEditLicense && (
        <IconButton
          size="small"
          onClick={() => onEditLicense(license)}
          title="Edit license type"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}

      {onDeleteLicense && (
        <IconButton
          size="small"
          onClick={() => handleDeleteLicense(license)}
          title="Delete license type"
          color="error"
          disabled={deleteOperation.loading}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  ), [
    onViewLicense,
    onEditLicense,
    onDeleteLicense,
    deleteOperation.loading,
  ]);

  // Action handlers
  const handleDeleteLicense = async (license: License) => {
    if (!onDeleteLicense) return;

    try {
      await deleteOperation.mutate(license.id);
      onDeleteLicense(license);
    } catch (error) {
      console.error('Failed to delete license:', error);
    }
  };

  return (
    <DataTable<License>
      title="License Types"
      data={licenses}
      columns={columns}
      loading={loading}
      error={error}
      pagination={pagination}
      selectable={selectable}
      selectedItems={selectedLicenses}
      onSelectionChange={onSelectionChange}
      getItemId={(license) => license.id}
      onRefresh={refresh}
      rowActions={rowActions}
      emptyMessage="No license types found. Add your first license type to get started."
      density="normal"
    />
  );
};

export default LicensesTable;