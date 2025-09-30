import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { FormBuilder, type FormFieldConfig } from '../common/Forms/FormBuilder';
import { useIncidents, useIncidentOperations, type Incident, type UpdateIncidentData } from '../../contexts/IncidentsContext';
import { styled } from '@mui/material/styles';
import { getIncidentWorkingHoursSummary, formatHours, formatCurrency } from '../../utils/workingHoursCalculator';

const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const IncidentInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));


interface EditIncidentProps {
  open: boolean;
  onClose: () => void;
  incidentId?: string;
  incident?: Incident;
  mode?: 'view' | 'edit';
}

export const EditIncident: React.FC<EditIncidentProps> = ({
  open,
  onClose,
  incidentId,
  incident: propIncident,
  mode: initialMode = 'view',
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [incident, setIncident] = useState<Incident | null>(propIncident || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getIncidentById } = useIncidents();
  const { update: updateOperation } = useIncidentOperations();

  // Fetch incident data if ID is provided but incident object is not
  useEffect(() => {
    if (open && incidentId && !propIncident) {
      setLoading(true);
      setError(null);

      getIncidentById(incidentId)
        .then(setIncident)
        .catch((err) => {
          console.error('Failed to fetch incident:', err);
          setError('Failed to load incident details');
        })
        .finally(() => setLoading(false));
    } else if (propIncident) {
      setIncident(propIncident);
    }
  }, [open, incidentId, propIncident, getIncidentById]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setError(null);
      if (!propIncident) {
        setIncident(null);
      }
    }
  }, [open, initialMode, propIncident]);

  // Form field configurations
  const formFields: FormFieldConfig[] = [
    {
      name: 'Ticket_title',
      label: 'Incident Title',
      type: 'text',
      required: true,
      placeholder: 'Enter incident title',
      grid: { xs: 12 },
      validation: {
        minLength: 5,
        maxLength: 200,
      },
    },
    {
      name: 'Ticket_type',
      label: 'Ticket Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Incident', value: 'Incident' },
        { label: 'Request', value: 'Request' },
        { label: 'Problem', value: 'Problem' },
      ],
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'Ticket_priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Urgent', value: 'Urgent' },
      ],
      grid: { xs: 12, sm: 6, md: 3 },
    },
    {
      name: 'Activity_status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Read', value: 'Read' },
        { label: 'Open', value: 'Open' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Resolved', value: 'Resolved' },
      ],
      grid: { xs: 12, sm: 6, md: 3 },
    },
    {
      name: 'Ticket_impact',
      label: 'Impact',
      type: 'select',
      required: true,
      options: [
        { label: 'No Impact', value: 'No Impact' },
        { label: 'Low Impact', value: 'Low Impact' },
        { label: 'Medium Impact', value: 'Medium Impact' },
        { label: 'High Impact', value: 'High Impact' },
        { label: 'Critical Impact', value: 'Critical Impact' },
      ],
      grid: { xs: 12, sm: 6, md: 3 },
    },
    {
      name: 'Ticket_source',
      label: 'Source',
      type: 'select',
      required: true,
      options: [
        { label: 'Email', value: 'Email' },
        { label: 'Phone', value: 'Phone' },
        { label: 'Web', value: 'Web' },
        { label: 'App', value: 'App' },
      ],
      grid: { xs: 12, sm: 6, md: 3 },
    },
    {
      name: 'Agent_name',
      label: 'Assigned Agent',
      type: 'text',
      placeholder: 'Agent name',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'End_User_full_name',
      label: 'End User Name',
      type: 'text',
      placeholder: 'End user full name',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'End_User_email',
      label: 'End User Email',
      type: 'email',
      placeholder: 'End user email address',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'Site_name',
      label: 'Site',
      type: 'text',
      placeholder: 'Site name',
      grid: { xs: 12, sm: 6 },
    },
  ];

  // Initial values for the form
  const initialValues = incident ? {
    Ticket_title: incident.Ticket_title || '',
    Ticket_type: incident.Ticket_type || 'Incident',
    Ticket_priority: incident.Ticket_priority || 'Medium',
    Activity_status: incident.Activity_status || 'Read',
    Ticket_impact: incident.Ticket_impact || 'No Impact',
    Ticket_source: incident.Ticket_source || 'Email',
    Agent_name: incident.Agent_name || '',
    End_User_full_name: incident.End_User_full_name || '',
    End_User_email: incident.End_User_email || '',
    Site_name: incident.Site_name || '',
  } : {};

  // Handle form submission
  const handleSubmit = async (formData: Record<string, any>) => {
    if (!incident) return;

    try {
      setLoading(true);
      setError(null);

      // Process form data
      const updateData: UpdateIncidentData = {
        ...formData,
      };

      const updatedIncident = await updateOperation.mutate(incident.id, updateData);
      setIncident(updatedIncident);
      setMode('view');

      console.log('Incident updated successfully:', updatedIncident);
    } catch (err) {
      console.error('Failed to update incident:', err);
      setError('Failed to update incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogHeader>
        <Typography variant="h6" component="h2" fontWeight="bold">
          {mode === 'edit' ? 'Edit Incident' : 'Incident Details'}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {incident && !loading && (
          <>
            {mode === 'view' && (
              <>
                <IncidentInfo>
                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ticket ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {incident.Ticket_ID}
                    </Typography>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ticket Number
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {incident.Ticket_number}
                    </Typography>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Title
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {incident.Ticket_title || 'Untitled Incident'}
                    </Typography>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status & Impact
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={incident.Activity_status}
                        size="small"
                        color={getStatusColor(incident.Activity_status)}
                        variant="outlined"
                      />
                      <Chip
                        label={incident.Ticket_impact}
                        size="small"
                        color={getImpactColor(incident.Ticket_impact)}
                        variant="filled"
                      />
                    </Box>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority & Type
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip label={`Priority: ${incident.Ticket_priority}`} size="small" variant="outlined" />
                      <Chip label={`Type: ${incident.Ticket_type}`} size="small" variant="outlined" />
                    </Box>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Source
                    </Typography>
                    <Typography variant="body2">
                      {incident.Ticket_source || 'Unknown'}
                    </Typography>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Agent
                    </Typography>
                    <Typography variant="body2">
                      {incident.Agent_name || 'Unassigned'}
                    </Typography>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      End User
                    </Typography>
                    <Box>
                      <Typography variant="body2">
                        {incident.End_User_full_name || 'Unknown'}
                      </Typography>
                      {incident.End_User_email && (
                        <Typography variant="caption" color="text.secondary">
                          {incident.End_User_email}
                        </Typography>
                      )}
                    </Box>
                  </InfoRow>

                  <InfoRow>
                    <Typography variant="subtitle2" color="text.secondary">
                      Site
                    </Typography>
                    <Typography variant="body2">
                      {incident.Site_name || 'Unknown'}
                    </Typography>
                  </InfoRow>

                  {/* Working Hours Summary */}
                  {(() => {
                    const workingHoursSummary = getIncidentWorkingHoursSummary(incident);
                    if (workingHoursSummary.totalHours > 0) {
                      return (
                        <InfoRow>
                          <Typography variant="subtitle2" color="text.secondary">
                            Working Hours
                          </Typography>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Total: {formatHours(workingHoursSummary.totalHours)} • Cost: {formatCurrency(workingHoursSummary.totalCost)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Billable: {formatHours(workingHoursSummary.billiableHours)} •
                              Non-Billable: {formatHours(workingHoursSummary.nonBilliableHours)} •
                              {workingHoursSummary.agentBreakdown.length} Agent(s)
                            </Typography>
                          </Box>
                        </InfoRow>
                      );
                    }
                    return null;
                  })()}

                  {incident.Work_hour_start_Time && (
                    <InfoRow>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {new Date(incident.Work_hour_start_Time).toLocaleString()}
                      </Typography>
                    </InfoRow>
                  )}

                  {incident.Ticket_resolved_Time && (
                    <InfoRow>
                      <Typography variant="subtitle2" color="text.secondary">
                        Resolved
                      </Typography>
                      <Typography variant="body2">
                        {new Date(incident.Ticket_resolved_Time).toLocaleString()}
                      </Typography>
                    </InfoRow>
                  )}
                </IncidentInfo>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Additional Information
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {incident.Machine_name && (
                      <Typography variant="body2">
                        <strong>Machine:</strong> {incident.Machine_name}
                      </Typography>
                    )}
                    {incident.Public_IP_address && (
                      <Typography variant="body2">
                        <strong>IP Address:</strong> {incident.Public_IP_address}
                      </Typography>
                    )}
                    {incident.Comment_ID && (
                      <Typography variant="body2">
                        <strong>Comment ID:</strong> {incident.Comment_ID}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Document Type:</strong> {incident.doc_type}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {mode === 'edit' && (
              <FormBuilder
                fields={formFields}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Save Changes"
                showCancelButton={true}
                onCancel={() => setMode('view')}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {mode === 'view' && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setMode('edit')}
            disabled={loading}
          >
            Edit Incident
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditIncident;