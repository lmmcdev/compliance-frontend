import React from 'react';
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
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LicenseProvider, useLicenses, useLicenseOperations, type License } from '../../contexts';
import { AccountProvider } from '../../contexts/AccountContext';
import { LicensesTable } from '../common/DataTable/LicensesTable';
import { AddLicenseDialog, UploadLicenseWizard } from '../common/Dialogs';
import { useSelection } from '../../hooks/patterns';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

const PageHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: theme.palette.success.contrastText,
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

interface LicensesPageContentProps {}

const LicensesPageContent: React.FC<LicensesPageContentProps> = () => {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [uploadWizardOpen, setUploadWizardOpen] = React.useState(false);

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

  const handleSaveLicense = async (licenseData: { code: string; displayName: string; description: string }) => {
    try {
      await createOperation.mutate(licenseData);
      console.log('License type created successfully');
    } catch (error) {
      console.error('Failed to create license type:', error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleUploadLicense = () => {
    setUploadWizardOpen(true);
  };

  const handleUploadSuccess = (licenseData: any) => {
    console.log('License uploaded successfully:', licenseData);
    refresh(); // Refresh the licenses list
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
      <PageHeader elevation={2}>
        <HeaderContent>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            License Types Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Create, manage, and organize license types for compliance tracking
          </Typography>

          {/* Statistics */}
          <StatsContainer>
            <StatItem>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total License Types</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue color="info">{stats.recent}</StatValue>
              <StatLabel>Added (30 days)</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue color="success">{stats.thisYear}</StatValue>
              <StatLabel>Created This Year</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue color="warning">{stats.lastUpdated}</StatValue>
              <StatLabel>Updated (7 days)</StatLabel>
            </StatItem>
          </StatsContainer>

          <HeaderActions>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<UploadIcon />}
              onClick={handleUploadLicense}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              Upload License
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleAddLicense}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Add Type
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
        <Tooltip title="Add new license type" placement="left">
          <Fab
            color="secondary"
            onClick={handleAddLicense}
          >
            <UploadIcon />
          </Fab>
        </Tooltip>
      </FloatingActions>

      {/* Add License Dialog */}
      <AddLicenseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveLicense}
      />

      {/* Upload License Wizard */}
      <UploadLicenseWizard
        open={uploadWizardOpen}
        onClose={() => setUploadWizardOpen(false)}
        onSuccess={handleUploadSuccess}
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