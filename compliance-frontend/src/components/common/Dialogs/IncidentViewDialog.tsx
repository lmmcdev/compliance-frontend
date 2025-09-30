import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { Incident } from '../../../contexts/IncidentsContext';
import {
  getIncidentWorkingHoursSummary,
  formatHours,
  formatCurrency,
  calculateHoursDuration,
} from '../../../utils/workingHoursCalculator';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: 1200,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  '& .MuiCardHeader-root': {
    backgroundColor: theme.palette.grey[50],
    paddingBottom: theme.spacing(1),
  },
}));

const StyledChip = styled(Chip)(() => ({
  fontWeight: 'bold',
}));


const WorkingHoursCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`incident-tabpanel-${index}`}
    aria-labelledby={`incident-tab-${index}`}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </div>
);

interface IncidentViewDialogProps {
  open: boolean;
  onClose: () => void;
  incident: Incident;
  onEdit?: (incident: Incident) => void;
}

export const IncidentViewDialog: React.FC<IncidentViewDialogProps> = ({
  open,
  onClose,
  incident,
  onEdit,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const workingHoursSummary = getIncidentWorkingHoursSummary(incident);
  const comments = incident.comments || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'in progress':
        return 'warning';
      case 'resolved':
      case 'closed':
        return 'success';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <StyledDialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Incident #{incident.Ticket_number || incident.Ticket_ID}
          </Typography>
          <StyledChip
            label={incident.Activity_status}
            color={getStatusColor(incident.Activity_status) as any}
            size="medium"
          />
          <StyledChip
            label={`Priority: ${incident.Ticket_priority}`}
            color={getPriorityColor(incident.Ticket_priority) as any}
            size="medium"
          />
        </Box>
        <Box>
          {onEdit && (
            <Tooltip title="Edit Incident">
              <IconButton
                onClick={() => onEdit(incident)}
                sx={{ color: 'inherit', mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<PersonIcon />} />
          <Tab label="Comments" icon={<CommentIcon />} />
          <Tab label="Working Hours" icon={<WorkIcon />} />
          <Tab label="Technical Details" icon={<BusinessIcon />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Cards in vertical layout for simplicity */}
              <InfoCard>
                <CardHeader title="Basic Information" />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {incident.Ticket_title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type: <strong>{incident.Ticket_type}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Source: <strong>{incident.Ticket_source}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Impact: <strong>{incident.Ticket_impact}</strong>
                    </Typography>
                  </Box>
                  {incident.Ticket_resolved_Date && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Resolved: <strong>{formatDate(incident.Ticket_resolved_Date)}</strong>
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </InfoCard>

              <InfoCard>
                <CardHeader title="End User Information" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {incident.End_User_full_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {incident.End_User_status || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  {incident.End_User_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{incident.End_User_email}</Typography>
                    </Box>
                  )}
                  {incident.End_User_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{incident.End_User_phone}</Typography>
                    </Box>
                  )}
                </CardContent>
              </InfoCard>

              <InfoCard>
                <CardHeader title="Working Hours Summary" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {formatHours(workingHoursSummary.totalHours)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(workingHoursSummary.totalCost)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Billable: {formatHours(workingHoursSummary.billiableHours)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Non-Billable: {formatHours(workingHoursSummary.nonBilliableHours)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sessions: {workingHoursSummary.totalSessions}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No comments available for this incident.
              </Typography>
            ) : (
              <List>
                {comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: comment.IsInternal ? 'primary.main' : 'secondary.main' }}>
                        {comment.FirstName ? comment.FirstName[0] : 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2">
                            {comment.FirstName && comment.LastName
                              ? `${comment.FirstName} ${comment.LastName}`
                              : 'Unknown User'}
                          </Typography>
                          <Chip
                            size="small"
                            label={comment.IsInternal ? 'Internal' : 'External'}
                            color={comment.IsInternal ? 'primary' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.Date)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {comment.Email && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {comment.Email}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {/* Render sanitized HTML or fallback to plain text */}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: comment.CommentHtml || '',
                              }}
                            />
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Working Hours Details
            </Typography>

            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatHours(workingHoursSummary.totalHours)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(workingHoursSummary.totalCost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {formatHours(workingHoursSummary.billiableHours)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Billable Hours
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {workingHoursSummary.totalSessions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Agent Breakdown */}
            {workingHoursSummary.agentBreakdown.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Agent Breakdown
                </Typography>
                {workingHoursSummary.agentBreakdown.map((agent) => (
                  <WorkingHoursCard key={agent.technicianId}>
                    <CardHeader
                      avatar={<Avatar>{agent.technicianName[0]}</Avatar>}
                      title={agent.technicianName}
                      subheader={agent.technicianEmail}
                      action={
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6">{formatHours(agent.totalHours)}</Typography>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(agent.totalCost)}
                          </Typography>
                        </Box>
                      }
                    />
                    <CardContent>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Start Time</TableCell>
                              <TableCell>End Time</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Rate</TableCell>
                              <TableCell>Cost</TableCell>
                              <TableCell>Billable</TableCell>
                              <TableCell>On-Site</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {agent.sessions.map((session, sessionIndex) => (
                              <TableRow key={sessionIndex}>
                                <TableCell>{formatDate(session.StartWorkHour)}</TableCell>
                                <TableCell>{formatDate(session.EndWorkHour)}</TableCell>
                                <TableCell>
                                  {formatHours(calculateHoursDuration(session.StartWorkHour, session.EndWorkHour))}
                                </TableCell>
                                <TableCell>{formatCurrency(session.RateAmount)}/hr</TableCell>
                                <TableCell>
                                  {formatCurrency(
                                    calculateHoursDuration(session.StartWorkHour, session.EndWorkHour) * session.RateAmount
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={session.Billiable ? 'Yes' : 'No'}
                                    color={session.Billiable ? 'success' : 'default'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={session.OnCustomerSite ? 'Yes' : 'No'}
                                    color={session.OnCustomerSite ? 'info' : 'default'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </WorkingHoursCard>
                ))}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Technical Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <InfoCard>
                <CardHeader title="System Information" />
                <CardContent>
                  <Typography variant="body2" gutterBottom>
                    <strong>Machine Name:</strong> {incident.Machine_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Machine ID:</strong> {incident.Machine_ID || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Public IP:</strong> {incident.Public_IP_address || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Agent:</strong> {incident.Agent_name || 'N/A'}
                  </Typography>
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardHeader title="Database Information" />
                <CardContent>
                  <Typography variant="body2" gutterBottom>
                    <strong>Document ID:</strong> {incident.id}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Document Type:</strong> {incident.doc_type}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Row Number:</strong> {incident.row_number}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Timestamp:</strong> {new Date(incident._ts * 1000).toLocaleString()}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button onClick={() => onEdit(incident)} variant="contained" startIcon={<EditIcon />}>
            Edit Incident
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default IncidentViewDialog;