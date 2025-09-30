import React, { useMemo, useState } from 'react';
import {
  Chip,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assignment as AssignIcon,
  Flag as PriorityIcon,
} from '@mui/icons-material';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { useIncidents, useIncidentOperations, type Incident } from '../../../contexts/IncidentsContext';
import { useDebounce } from '../../../hooks/patterns';
import { styled } from '@mui/material/styles';
import { getQuickTotalHours, getQuickTotalCost, formatHours, formatCurrency } from '../../../utils/workingHoursCalculator';

const TableHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const FilterControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: 300,
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '100%',
  },
}));

interface IncidentsTableProps {
  onEditIncident?: (incident: Incident) => void;
  onViewIncident?: (incident: Incident) => void;
  onDeleteIncident?: (incident: Incident) => void;
  onAssignIncident?: (incident: Incident) => void;
  selectable?: boolean;
  selectedIncidents?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  onEditIncident,
  onViewIncident,
  onDeleteIncident,
  onAssignIncident,
  selectable = false,
  selectedIncidents = new Set(),
  onSelectionChange,
}) => {
  // Context hooks
  const {
    incidents,
    loading,
    error,
    refresh,
    pagination,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    loadMore,
  } = useIncidents();

  const { delete: deleteOperation } = useIncidentOperations();

  // Local search state for debouncing
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearchQuery, 300);

  // Update context search when debounced value changes
  React.useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Impact color mapping
  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'critical impact': return 'error';
      case 'high impact': return 'warning';
      case 'medium impact': return 'info';
      case 'low impact':
      case 'no impact': return 'success';
      default: return 'default';
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'read': return 'info';
      case 'in progress': return 'warning';
      case 'open': return 'error';
      default: return 'default';
    }
  };

  // Priority icon mapping
  const getPriorityIcon = (priority: string) => {
    const iconProps = { fontSize: 'small' as const };
    switch (priority?.toLowerCase()) {
      case 'urgent': return <PriorityIcon {...iconProps} color="error" />;
      case 'high': return <PriorityIcon {...iconProps} color="warning" />;
      case 'medium': return <PriorityIcon {...iconProps} color="info" />;
      case 'low': return <PriorityIcon {...iconProps} color="action" />;
      default: return null;
    }
  };

  // Table columns definition
  const columns: DataTableColumn<Incident>[] = useMemo(() => [
    {
      id: 'Ticket_title',
      label: 'Title',
      minWidth: 200,
      resizable: true,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {value || 'Untitled Incident'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Ticket: {row.Ticket_number}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'Ticket_impact',
      label: 'Impact',
      minWidth: 100,
      resizable: true,
      filterable: true,
      format: (value) => (
        <Chip
          label={value || 'Unknown'}
          size="small"
          color={getImpactColor(value)}
          variant="filled"
        />
      ),
    },
    {
      id: 'Activity_status',
      label: 'Status',
      minWidth: 120,
      resizable: true,
      filterable: true,
      format: (value) => (
        <Chip
          label={value || 'Unknown'}
          size="small"
          color={getStatusColor(value)}
          variant="outlined"
        />
      ),
    },
    {
      id: 'Ticket_priority',
      label: 'Priority',
      minWidth: 100,
      resizable: true,
      filterable: true,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getPriorityIcon(value)}
          <Typography variant="body2" textTransform="capitalize">
            {value || 'None'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'Agent_name',
      label: 'Assigned Agent',
      minWidth: 130,
      resizable: true,
      format: (value) => (
        <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
          {value || 'Unassigned'}
        </Typography>
      ),
    },
    {
      id: 'Ticket_type',
      label: 'Type',
      minWidth: 100,
      resizable: true,
      filterable: true,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'End_User_full_name',
      label: 'Reporter',
      minWidth: 120,
      resizable: true,
      format: (value, row) => (
        <Box>
          <Typography variant="body2">
            {value || 'Unknown'}
          </Typography>
          {row.End_User_email && (
            <Typography variant="caption" color="text.secondary">
              {row.End_User_email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'Work_hour_start_Time',
      label: 'Created',
      minWidth: 130,
      resizable: true,
      sortable: true,
      format: (value) => {
        if (!value) return 'Never';
        const date = new Date(value);
        return (
          <Tooltip title={date.toLocaleString()}>
            <Typography variant="body2">
              {date.toLocaleDateString()}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      id: 'Ticket_resolved_Time',
      label: 'Resolved',
      minWidth: 130,
      resizable: true,
      sortable: true,
      format: (value) => {
        if (!value) return 'Not resolved';
        const date = new Date(value);
        return (
          <Tooltip title={date.toLocaleString()}>
            <Typography variant="body2">
              {date.toLocaleDateString()}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      id: 'Site_name',
      label: 'Site',
      minWidth: 120,
      resizable: true,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value || 'Unknown'}
        </Typography>
      ),
    },
    {
      id: 'Ticket_source',
      label: 'Source',
      minWidth: 100,
      resizable: true,
      format: (value) => (
        <Chip
          label={value || 'Unknown'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
    {
      id: 'working_hours_total',
      label: 'Working Hours',
      minWidth: 140,
      resizable: true,
      sortable: true,
      format: (_, row) => {
        const totalHours = getQuickTotalHours(row);
        const totalCost = getQuickTotalCost(row);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="medium">
              {formatHours(totalHours)}
            </Typography>
            {totalCost > 0 && (
              <Typography variant="caption" color="success.main">
                {formatCurrency(totalCost)}
              </Typography>
            )}
          </Box>
        );
      },
    },
  ], []);

  // Row actions
  const rowActions = useMemo(() => (incident: Incident) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onViewIncident && (
        <Tooltip title="View incident details">
          <IconButton
            size="small"
            onClick={() => onViewIncident(incident)}
            color="primary"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEditIncident && (
        <Tooltip title="Edit incident">
          <IconButton
            size="small"
            onClick={() => onEditIncident(incident)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onAssignIncident && (
        <Tooltip title="Assign incident">
          <IconButton
            size="small"
            onClick={() => onAssignIncident(incident)}
            color="info"
          >
            <AssignIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDeleteIncident && (
        <Tooltip title="Delete incident">
          <IconButton
            size="small"
            onClick={() => handleDeleteIncident(incident)}
            color="error"
            disabled={deleteOperation.loading}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  ), [
    onViewIncident,
    onEditIncident,
    onAssignIncident,
    onDeleteIncident,
    deleteOperation.loading,
  ]);

  // Action handlers
  const handleDeleteIncident = async (incident: Incident) => {
    if (!onDeleteIncident) return;

    try {
      await deleteOperation.mutate(incident.id);
      onDeleteIncident(incident);
    } catch (error) {
      console.error('Failed to delete incident:', error);
    }
  };

  // Custom table header with search and filters
  const tableHeader = (
    <TableHeader>
      <Typography variant="h5" component="h2" fontWeight="bold">
        Incidents
        {pagination.totalLoaded > 0 && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({pagination.totalLoaded} loaded{pagination.hasMore ? ', more available' : ''})
          </Typography>
        )}
      </Typography>

      <FilterControls>
        <SearchField
          placeholder="Search incidents..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Read">Read</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
      </FilterControls>
    </TableHeader>
  );

  return (
    <Box>
      {tableHeader}
      <DataTable<Incident>
        data={incidents}
        columns={columns}
        loading={loading}
        error={error}
        selectable={selectable}
        selectedItems={selectedIncidents}
        onSelectionChange={onSelectionChange}
        getItemId={(incident) => incident.id}
        onRefresh={refresh}
        rowActions={rowActions}
        emptyMessage="No incidents found. Create your first incident to get started."
        density="normal"
      />

      {/* Load More Button */}
      {pagination.hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Loading...' : `Load More (${pagination.totalLoaded} loaded)`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IncidentsTable;