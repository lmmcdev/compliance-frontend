import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Fab,
  Tooltip,
  Dialog,
  DialogActions,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LicenseProvider, useLicenses, useLicenseOperations, type License } from '../../contexts';
import { AccountProvider } from '../../contexts/AccountContext';
import { LicensesTable } from '../common/DataTable/LicensesTable';
import { AddLicenseDialog } from '../common/Dialogs';
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





interface LicensesPageContentProps {}

const LicensesPageContent: React.FC<LicensesPageContentProps> = () => {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  const {
    data: licenses,
    loading,
    error,
    refresh,
  } = useLicenses();

  const { create: createOperation } = useLicenseOperations();

  // Selection management - ensure we always pass an array
  const licensesArray = Array.isArray(licenses) ? licenses : [];
  const {
    selectedIds,
    selectItem,
    deselectItem,
  } = useSelection(licensesArray, {
    getItemId: (license) => license.id,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = licensesArray.length;
    const recent = licensesArray.filter(l => {
      const createdDate = new Date(l.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;
    const thisYear = licensesArray.filter(l => {
      const createdDate = new Date(l.createdAt);
      return createdDate.getFullYear() === new Date().getFullYear();
    }).length;
    const lastUpdated = licensesArray.filter(l => {
      const updatedDate = new Date(l.updatedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return updatedDate > sevenDaysAgo;
    }).length;

    return { total, recent, thisYear, lastUpdated };
  }, [licensesArray]);

  // Handlers
  const handleEditLicense = (license: License) => {
    // TODO: Implement edit license dialog
    console.log('Edit license:', license.id);
  };

  const handleViewLicense = (license: License) => {
    // TODO: Implement view license dialog
    console.log('View license:', license.id);
  };

  const handleDeleteLicense = (license: License) => {
    // The delete operation is handled by LicensesTable
    console.log('License deleted:', license.id);
  };


  const handleAddLicense = () => {
    setAddDialogOpen(true);
  };

  const handleSaveLicense = async (licenseData: any) => {
    try {
      await createOperation.mutate(licenseData);
      console.log('License created successfully');
      refresh(); // Refresh the licenses list
    } catch (error) {
      console.error('Failed to create license:', error);
      throw error; // Re-throw so the dialog can handle it
    }
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
          Failed to load licenses: {error}
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
              License Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                fontSize: '16px'
              }}
            >
              Manage and track all business licenses and certificates with our modern interface
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLicense}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add License
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
              Total Licenses
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803D', mb: 1 }}>
              {stats.recent}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Added (30 days)
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
              {stats.thisYear}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              This Year
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#FDF2F8',
            border: '1px solid #FBCFE8',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#BE185D', mb: 1 }}>
              {stats.lastUpdated}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Updated (7 days)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <LicensesTable
          onEditLicense={handleEditLicense}
          onViewLicense={handleViewLicense}
          onDeleteLicense={handleDeleteLicense}
          selectable={true}
          selectedLicenses={selectedIds}
          onSelectionChange={(newSelection) => {
            // Sync with useSelection hook
            const currentSelection = new Set(selectedIds);
            const newSelectionSet = new Set(newSelection);

            // Find items to select/deselect
            newSelectionSet.forEach(id => {
              if (!currentSelection.has(id)) {
                const license = licensesArray.find(l => l.id === id);
                if (license) selectItem(license);
              }
            });

            currentSelection.forEach(id => {
              if (!newSelectionSet.has(id)) {
                const license = licensesArray.find(l => l.id === id);
                if (license) deselectItem(license);
              }
            });
          }}
        />
      </Paper>

      {/* Floating Action Buttons */}
      <FloatingActions>
        <Tooltip title="Refresh licenses" placement="left">
          <Fab
            color="primary"
            size="medium"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Add new license" placement="left">
          <Fab
            color="secondary"
            onClick={handleAddLicense}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </FloatingActions>

      {/* Add License Dialog */}
      <AddLicenseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveLicense}
      />
    </PageContainer>
  );
};

// Main page component with context provider
export const LicensesPage: React.FC = () => {
  return (
    <LicenseProvider>
      <AccountProvider>
        <LicensesPageContent />
      </AccountProvider>
    </LicenseProvider>
  );
};

export default LicensesPage;