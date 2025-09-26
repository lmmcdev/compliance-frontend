import React, { useMemo } from 'react';
import { Chip, IconButton, Box, Typography } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PlayArrow as ProcessIcon,
} from '@mui/icons-material';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { useLicenses, useLicenseOperations } from '../../../contexts';

interface License {
  id: string;
  accountId: string;
  documentType: string;
  status: 'pending' | 'processed' | 'failed';
  uploadedAt: string;
  processedAt?: string;
  createdBy: string;
  updatedAt: string;
}

interface LicensesTableProps {
  onEditLicense?: (license: License) => void;
  onViewLicense?: (license: License) => void;
  onDeleteLicense?: (license: License) => void;
  onProcessLicense?: (license: License) => void;
  onDownloadLicense?: (license: License) => void;
  selectable?: boolean;
  selectedLicenses?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export const LicensesTable: React.FC<LicensesTableProps> = ({
  onEditLicense,
  onViewLicense,
  onDeleteLicense,
  onProcessLicense,
  onDownloadLicense,
  selectable = false,
  selectedLicenses = new Set(),
  onSelectionChange,
}) => {
  // Data hooks
  const { data: licenses, loading, error, refresh, pagination } = useLicenses();
  const { delete: deleteOperation, process: processOperation } = useLicenseOperations();

  // Table columns definition
  const columns: DataTableColumn<License>[] = useMemo(() => [
    {
      id: 'documentType',
      label: 'Document Type',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'processed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
          }
        };

        return (
          <Chip
            label={value || 'Unknown'}
            size="small"
            color={getStatusColor(value)}
            variant="filled"
          />
        );
      },
    },
    {
      id: 'accountId',
      label: 'Account',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value ? `Account: ${value.substring(0, 8)}...` : 'No Account'}
        </Typography>
      ),
    },
    {
      id: 'createdBy',
      label: 'Created By',
      minWidth: 130,
      format: (value) => value || 'System',
    },
    {
      id: 'uploadedAt',
      label: 'Uploaded',
      minWidth: 130,
      format: (value) => {
        if (!value) return 'Never';
        const date = new Date(value);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'processedAt',
      label: 'Processed',
      minWidth: 130,
      format: (value) => {
        if (!value) return 'Not processed';
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

      {onDownloadLicense && (
        <IconButton
          size="small"
          onClick={() => onDownloadLicense(license)}
          title="Download license document"
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      )}

      {onProcessLicense && license.status === 'pending' && (
        <IconButton
          size="small"
          onClick={() => handleProcessLicense(license)}
          title="Process license"
          color="primary"
          disabled={processOperation.loading}
        >
          <ProcessIcon fontSize="small" />
        </IconButton>
      )}

      {onEditLicense && (
        <IconButton
          size="small"
          onClick={() => onEditLicense(license)}
          title="Edit license"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}

      {onDeleteLicense && (
        <IconButton
          size="small"
          onClick={() => handleDeleteLicense(license)}
          title="Delete license"
          color="error"
          disabled={deleteOperation.loading}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  ), [
    onViewLicense,
    onDownloadLicense,
    onProcessLicense,
    onEditLicense,
    onDeleteLicense,
    deleteOperation.loading,
    processOperation.loading,
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

  const handleProcessLicense = async (license: License) => {
    if (!onProcessLicense) return;

    try {
      await processOperation.mutate(license.id);
      onProcessLicense(license);
    } catch (error) {
      console.error('Failed to process license:', error);
    }
  };

  return (
    <DataTable<License>
      title="Licenses"
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
      emptyMessage="No licenses found. Upload your first license document to get started."
      density="normal"
    />
  );
};

export default LicensesTable;