import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Skeleton,
  Button,
} from '@mui/material';
import UploadLicenseDialog from '../dialogs/UploadLicenseDialog';
import {
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { licenseApi, type LicenseType } from './api';
import EmptyState from '../../utils/EmptyState';

interface License {
  id: string;
  code: string;
  createdAt: string;
  description: string;
  displayName: string;
  updatedAt: string;
  location?: string;
  assignedTo?: string;
}

const LicenseTable = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const licenseTypes = await licenseApi.getLicenseTypes();


        // Transform the API response to match our interface
        const transformedLicenses: License[] = licenseTypes.map((license: LicenseType) => ({
          id: license.id,
          code: license.code || '—',
          createdAt: license.createdAt || '',
          description: license.description || '—',
          displayName: license.displayName || '—',
          updatedAt: license.updatedAt || '',
        }));

        setLicenses(transformedLicenses);
      } catch (err) {
        console.error('Failed to fetch licenses:', err);
        setError('Failed to load licenses. Please try again later.');
        setLicenses([]); // Set empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  const retryFetch = () => {
    setError(null);
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        const licenseTypes = await licenseApi.getLicenseTypes();

        const transformedLicenses: License[] = licenseTypes.map(license => ({
          id: license.id,
          code: license.code || '—',
          createdAt: license.createdAt || '',
          description: license.description || '—',
          displayName: license.displayName || '—',
          updatedAt: license.updatedAt || '—',
          // Copy any additional fields if present
          ...(license.documentUrl ? { documentUrl: license.documentUrl } : {}),
        }));

        setLicenses(transformedLicenses);
      } catch (err) {
        console.error('Failed to fetch licenses:', err);
        setError('Failed to load licenses. Please try again later.');
        setLicenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  };

  /*const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleView = (id: string) => {
    console.log('View license:', id);
  };*/

  const handleEdit = (id: string) => {
    console.log('Edit license:', id);
  };

  /*const handleDelete = async (id: string) => {
    try {
      await licenseApi.deleteLicenseType(id);
      setLicenses(prev => prev.filter(license => license.id !== id));
    } catch (err) {
      console.error('Failed to delete license:', err);
      setError('Failed to delete license. Please try again.');
    }
  };*/

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '—';
    }
  };

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const handleOpenUploadDialog = () => setUploadDialogOpen(true);
  const handleCloseUploadDialog = () => setUploadDialogOpen(false);

  return (
      <>
        <Box sx={{ width: '100%', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: 1 }}
              onClick={handleOpenUploadDialog}
            >
              Upload License
            </Button>
          </Box>
      
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 600,
          color: '#424242',
        }}
      >
        License Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={1}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Code
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Created At
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Updated At
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#424242' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                  </TableRow>
                ))
              ) : licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 0, border: 'none' }}>
                    <EmptyState
                      title="No license records found"
                      description="There are no license records available in the system. Try refreshing the page or check back later."
                      onAction={retryFetch}
                      actionLabel="Refresh Data"
                      showRetry={true}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((license) => (
                  <TableRow
                    key={license.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#ff9800',
                          }}
                        />
                        <Box
                          sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderBottom: '6px solid #f44336',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: '#2196f3',
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {license.code}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {license.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {formatDate(license.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {license.updatedAt ? formatDate(license.updatedAt) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(license.id)}
                        sx={{
                          color: '#2196f3',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        </Box>
        <UploadLicenseDialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} />
      </>
    );
};

export default LicenseTable;