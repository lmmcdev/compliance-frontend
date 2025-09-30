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
  minHeight: '100%',
  backgroundColor: theme.palette.grey[50],
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
      <Box sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        p: 4,
        mb: 3,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Incident Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                fontSize: '16px'
              }}
            >
              Track, manage, and resolve security and operational incidents efficiently
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateIncident}
              sx={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              New Incident
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748b',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#00A1FF',
                  backgroundColor: '#F8FAFC',
                  color: '#00A1FF',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Modern Statistics Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mt: 3
        }}>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0369A1', mb: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Total Incidents
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#DC2626', mb: 1 }}>
              {stats.open}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Open Cases
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FED7AA',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#D97706', mb: 1 }}>
              {stats.critical}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Critical Impact
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #D1D5DB',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6B7280', mb: 1 }}>
              {stats.unassigned}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Unassigned
            </Typography>
          </Box>
        </Box>
      </Box>

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