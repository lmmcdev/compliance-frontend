import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// Inline License type to avoid import issues
interface License {
  id: string;
  type: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

const LicenseTable = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock license data
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
      },
      {
        id: '4',
        type: 'Safety Certificate',
        issuer: 'OSHA California',
        issueDate: new Date('2023-08-05'),
        expirationDate: new Date('2024-08-05'),
        status: 'pending',
        documentUrl: '/docs/safety-cert.pdf'
      },
      {
        id: '5',
        type: 'Environmental Permit',
        issuer: 'EPA Region 9',
        issueDate: new Date('2023-02-28'),
        expirationDate: new Date('2026-02-28'),
        status: 'active',
        documentUrl: '/docs/env-permit.pdf'
      },
      {
        id: '6',
        type: 'Building Permit',
        issuer: 'San Francisco Building Dept',
        issueDate: new Date('2023-09-12'),
        expirationDate: new Date('2024-03-12'),
        status: 'expired',
        documentUrl: '/docs/building-permit.pdf'
      },
      {
        id: '7',
        type: 'Fire Safety License',
        issuer: 'SF Fire Department',
        issueDate: new Date('2023-11-01'),
        expirationDate: new Date('2024-11-01'),
        status: 'active',
        documentUrl: '/docs/fire-safety.pdf'
      },
      {
        id: '8',
        type: 'Health Department Permit',
        issuer: 'SF Health Department',
        issueDate: new Date('2023-07-15'),
        expirationDate: new Date('2024-07-15'),
        status: 'pending',
        documentUrl: '/docs/health-permit.pdf'
      }
    ];

    setTimeout(() => {
      setLicenses(mockLicenses);
      setLoading(false);
    }, 1000);
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

  const handleDelete = (id: string) => {
    console.log('Delete license:', id);
    setLicenses(prev => prev.filter(license => license.id !== id));
  };

  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'License Type',
      width: 200,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'issuer',
      headerName: 'Issuer',
      width: 250,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'issueDate',
      headerName: 'Issue Date',
      width: 130,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'expirationDate',
      headerName: 'Expiration Date',
      width: 150,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title="View Document">
              <ViewIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => handleView(params.id as string)}
          color="primary"
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit License">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.id as string)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete License">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        License Management
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2 }}>
        <DataGrid
          rows={licenses}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            height: 600,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default LicenseTable;