import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { licenseApi, type LicenseType } from './api';

interface License extends Omit<LicenseType, 'issueDate' | 'expirationDate'> {
  issueDate: Date;
  expirationDate: Date;
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

        console.log(licenseTypes)
        const transformedLicenses: License[] = licenseTypes.map(license => ({
          ...license,
          issueDate: new Date(license.issueDate),
          expirationDate: new Date(license.expirationDate),
        }));

        setLicenses(transformedLicenses);
      } catch (err) {
        console.error('Failed to fetch licenses:', err);
        setError('Failed to load licenses. Please try again later.');

        // Fallback to mock data if API fails
        const mockLicenses: License[] = [
          {
            id: '1',
            type: 'Business License',
            issuer: 'State of California',
            issueDate: new Date('2023-01-15'),
            expirationDate: new Date('2024-01-15'),
            status: 'expired',
            documentUrl: '/docs/business-license.pdf'
          },
          {
            id: '2',
            type: 'Professional License',
            issuer: 'California Board of Engineers',
            issueDate: new Date('2023-03-20'),
            expirationDate: new Date('2025-03-20'),
            status: 'active',
            documentUrl: '/docs/professional-license.pdf'
          },
          {
            id: '3',
            type: 'Operating Permit',
            issuer: 'City of San Francisco',
            issueDate: new Date('2023-06-10'),
            expirationDate: new Date('2024-12-31'),
            status: 'active',
            documentUrl: '/docs/operating-permit.pdf'
          }
        ];
        setLicenses(mockLicenses);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  const getStatusColor = (status: string) => {
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
  };

  const handleEdit = (id: string) => {
    console.log('Edit license:', id);
  };

  const handleDelete = async (id: string) => {
    try {
      await licenseApi.deleteLicenseType(id);
      setLicenses(prev => prev.filter(license => license.id !== id));
    } catch (err) {
      console.error('Failed to delete license:', err);
      setError('Failed to delete license. Please try again.');
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: { xs: 'center', sm: 'left' }
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
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <TableContainer sx={{ maxHeight: { xs: '70vh', md: 'none' } }}>
          <Table sx={{ minWidth: { xs: 300, sm: 650 } }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}
                >
                  License Type
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Code
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                    display: { xs: 'none', md: 'table-cell' }
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                    display: { xs: 'none', md: 'table-cell' }
                  }}
                >
                  Expiration Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Actions
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
                    <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                  </TableRow>
                ))
              ) : licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No licenses found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((license) => (
                  <TableRow
                    key={license.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.001)',
                        transition: 'all 0.2s ease-in-out',
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: 'grey.50',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        py: { xs: 1, sm: 2 },
                        display: { xs: 'none', sm: 'table-cell' }
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {license.displayName || license.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {license.code || license.issuer}
                        </Typography>
                        {/* Show license type on mobile when hidden */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          {license.displayName || license.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: { xs: 1, sm: 2 },
                        display: { xs: 'none', md: 'table-cell' }
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatDate(license.createdAt || license.issueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: { xs: 1, sm: 2 },
                        display: { xs: 'none', md: 'table-cell' }
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatDate(license.expirationDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, sm: 2 } }}>
                      <Chip
                        label={license.status?.toUpperCase() || 'UNKNOWN'}
                        color={getStatusColor(license.status || 'default') as any}
                        size="small"
                        variant="filled"
                        sx={{
                          fontWeight: 'bold',
                          minWidth: { xs: 60, sm: 80 },
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, sm: 2 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: { xs: 0.25, sm: 0.5 },
                          justifyContent: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Tooltip title="View Document">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleView(license.id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              p: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <ViewIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit License">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(license.id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'warning.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              p: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <EditIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete License">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(license.id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              p: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LicenseTable;