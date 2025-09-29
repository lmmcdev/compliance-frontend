import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { IncidentsProvider, useIncidents, type Incident } from '../../contexts/IncidentsContext';
import { IncidentsTable } from '../common/DataTable/IncidentsTable';
import { EditIncident } from './EditIncidentForm';
import { IncidentViewDialog } from '../common/Dialogs/IncidentViewDialog';
import { useSelection } from '../../hooks/patterns';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

const PageHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
}));

const HeaderContent = styled(Box)(() => ({
  position: 'relative',
  zIndex: 1,
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const FloatingActions = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  zIndex: theme.zIndex.speedDial,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const StatItem = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StatValue = styled(Typography)(() => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  lineHeight: 1,
}));

const StatLabel = styled(Typography)(() => ({
  fontSize: '0.875rem',
  opacity: 0.9,
}));

interface IncidentsPageContentProps {}

const IncidentsPageContent: React.FC<IncidentsPageContentProps> = () => {
  const {
    incidents,
    loading,
    error,
    refresh,
  } = useIncidents();

  const [editIncidentOpen, setEditIncidentOpen] = useState(false);
  const [viewIncidentOpen, setViewIncidentOpen] = useState(false);
  const [selectedIncidentForEdit, setSelectedIncidentForEdit] = useState<Incident | null>(null);
  const [selectedIncidentForView, setSelectedIncidentForView] = useState<Incident | null>(null);

  // Selection management
  const {
    selectedIds,
    selectItem,
    deselectItem,
  } = useSelection(incidents, {
    getItemId: (incident) => incident.id,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter(i => i.Activity_status === 'Open').length;
    const critical = incidents.filter(i => i.Ticket_impact === 'Critical Impact').length;
    const unassigned = incidents.filter(i => !i.Agent_name).length;

    return { total, open, critical, unassigned };
  }, [incidents]);

  // Handlers
  const handleEditIncident = (incident: Incident) => {
    setSelectedIncidentForEdit(incident);
    setEditIncidentOpen(true);
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncidentForView(incident);
    setViewIncidentOpen(true);
  };

  const handleDeleteIncident = (incident: Incident) => {
    // The delete operation is handled by IncidentsTable
    console.log('Incident deleted:', incident.id);
  };

  const handleAssignIncident = (incident: Incident) => {
    // TODO: Implement assignment dialog
    console.log('Assign incident:', incident.id);
  };

  const handleCreateIncident = () => {
    // TODO: Implement create incident dialog
    console.log('Create new incident');
  };

  const handleCloseEditDialog = () => {
    setEditIncidentOpen(false);
    setSelectedIncidentForEdit(null);
  };

  const handleCloseViewDialog = () => {
    setViewIncidentOpen(false);
    setSelectedIncidentForView(null);
  };

  const handleEditFromView = (incident: Incident) => {
    // Close view dialog and open edit dialog
    setViewIncidentOpen(false);
    setSelectedIncidentForView(null);
    setSelectedIncidentForEdit(incident);
    setEditIncidentOpen(true);
  };

  if (error) {
    return (
      <PageContainer>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          Failed to load incidents: {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader elevation={2}>
        <HeaderContent>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Incident Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Track, manage, and resolve security and operational incidents
          </Typography>

          {/* Statistics */}
          <StatsContainer>
            <StatItem>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total Incidents</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue color="error">{stats.open}</StatValue>
              <StatLabel>Open</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue color="warning">{stats.critical}</StatValue>
              <StatLabel>Critical</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.unassigned}</StatValue>
              <StatLabel>Unassigned</StatLabel>
            </StatItem>
          </StatsContainer>

          <HeaderActions>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleCreateIncident}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              New Incident
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Refresh
            </Button>
          </HeaderActions>
        </HeaderContent>
      </PageHeader>

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <IncidentsTable
          onEditIncident={handleEditIncident}
          onViewIncident={handleViewIncident}
          onDeleteIncident={handleDeleteIncident}
          onAssignIncident={handleAssignIncident}
          selectable={true}
          selectedIncidents={selectedIds}
          onSelectionChange={(newSelection) => {
            // Sync with useSelection hook
            const currentSelection = new Set(selectedIds);
            const newSelectionSet = new Set(newSelection);

            // Find items to select/deselect
            newSelectionSet.forEach(id => {
              if (!currentSelection.has(id)) {
                const incident = incidents.find(i => i.id === id);
                if (incident) selectItem(incident);
              }
            });

            currentSelection.forEach(id => {
              if (!newSelectionSet.has(id)) {
                const incident = incidents.find(i => i.id === id);
                if (incident) deselectItem(incident);
              }
            });
          }}
        />
      </Paper>

      {/* Floating Action Buttons */}
      <FloatingActions>
        <Tooltip title="Refresh incidents" placement="left">
          <Fab
            color="primary"
            size="medium"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Create new incident" placement="left">
          <Fab
            color="secondary"
            onClick={handleCreateIncident}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </FloatingActions>

      {/* View Incident Dialog */}
      {selectedIncidentForView && (
        <IncidentViewDialog
          open={viewIncidentOpen}
          onClose={handleCloseViewDialog}
          incident={selectedIncidentForView}
          onEdit={handleEditFromView}
        />
      )}

      {/* Edit Incident Dialog */}
      <EditIncident
        open={editIncidentOpen}
        onClose={handleCloseEditDialog}
        incident={selectedIncidentForEdit || undefined}
        mode="edit"
      />
    </PageContainer>
  );
};

// Main page component with context provider
export const IncidentsPage: React.FC = () => {
  return (
    <IncidentsProvider>
      <IncidentsPageContent />
    </IncidentsProvider>
  );
};

export default IncidentsPage;