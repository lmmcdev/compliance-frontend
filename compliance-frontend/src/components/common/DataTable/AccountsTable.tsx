import React, { useMemo } from 'react';
import { Chip, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { useAccounts, useAccountSearch, useAccountOperations } from '../../../contexts';
import { usePagination } from '../../../hooks/data';
import type { Account } from '../../../services/accountsService';

interface AccountsTableProps {
  onEditAccount?: (account: Account) => void;
  onViewAccount?: (account: Account) => void;
  onDeleteAccount?: (account: Account) => void;
  selectable?: boolean;
  selectedAccounts?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  onEditAccount,
  onViewAccount,
  onDeleteAccount,
  selectable = false,
  selectedAccounts = new Set(),
  onSelectionChange,
}) => {
  // Data hooks
  const { accounts, loading, error, refresh } = useAccounts();
  const search = useAccountSearch();
  const { delete: deleteOperation } = useAccountOperations();

  // Pagination
  const pagination = usePagination({
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  });

  // Update pagination total when accounts data changes
  React.useEffect(() => {
    if (accounts) {
      pagination.setTotal(accounts.length);
    }
  }, [accounts, pagination]);

  // Table columns definition
  const columns: DataTableColumn<Account>[] = useMemo(() => [
    {
      id: 'accountNumber',
      label: 'Account Number',
      minWidth: 120,
      format: (value) => value || 'N/A',
    },
    {
      id: 'name',
      label: 'Account Name',
      minWidth: 200,
      format: (value) => value || 'Unnamed Account',
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value || 'Unknown'}
          size="small"
          color={value === 'active' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
      format: (value) => value || 'No phone',
    },
    {
      id: 'inHouse',
      label: 'In House',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Yes' : 'No'}
          size="small"
          color={value ? 'primary' : 'default'}
          variant={value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'mdvitaDisenrollment',
      label: 'MDVITA Disenrollment',
      minWidth: 150,
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Yes' : 'No'}
          size="small"
          color={value ? 'warning' : 'success'}
          variant={value ? 'filled' : 'outlined'}
        />
      ),
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
  const rowActions = useMemo(() => (account: Account) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onViewAccount && (
        <IconButton
          size="small"
          onClick={() => onViewAccount(account)}
          title="View account details"
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      )}
      {onEditAccount && (
        <IconButton
          size="small"
          onClick={() => onEditAccount(account)}
          title="Edit account"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      {onDeleteAccount && (
        <IconButton
          size="small"
          onClick={() => handleDeleteAccount(account)}
          title="Delete account"
          color="error"
          disabled={deleteOperation.loading}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  ), [onViewAccount, onEditAccount, onDeleteAccount, deleteOperation.loading]);

  // Delete handler
  const handleDeleteAccount = async (account: Account) => {
    if (!onDeleteAccount) return;

    try {
      await deleteOperation.mutate(account.id);
      onDeleteAccount(account);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <DataTable<Account>
      title="Accounts"
      data={accounts}
      columns={columns}
      loading={loading}
      error={error}
      pagination={pagination}
      search={search}
      selectable={selectable}
      selectedItems={selectedAccounts}
      onSelectionChange={onSelectionChange}
      getItemId={(account) => account.id}
      onRefresh={refresh}
      rowActions={rowActions}
      emptyMessage="No accounts found. Create your first account to get started."
      density="normal"
    />
  );
};

export default AccountsTable;