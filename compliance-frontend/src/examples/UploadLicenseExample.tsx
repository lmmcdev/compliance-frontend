import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import UploadLicenseDialog from '../components/dialogs/UploadLicenseDialog';
import AppProviders from '../components/providers/AppProviders';

/**
 * Example component showing how to use the UploadLicenseDialog with the data context.
 *
 * Usage Instructions:
 * 1. Wrap your app or component with AppProviders to provide access to the DataContext
 * 2. Use the UploadLicenseDialog component with proper handlers
 * 3. Set the REACT_APP_COSMOS_API_URL environment variable to your Cosmos DB API endpoint
 */

const UploadLicenseExample: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = (licenseData: any) => {
    console.log('License data saved:', licenseData);
    // Handle the saved data - could send to API, update state, etc.

    // The licenseData object contains:
    // - account: Selected account information
    // - licenseData: Original webhook response from document analysis
    // - editedFields: User-edited field values
    // - documentUrl: Blob URL of the uploaded document
  };

  return (
    <AppProviders>
      <Box sx={{ p: 4 }}>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Upload License Document
        </Button>

        <UploadLicenseDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      </Box>
    </AppProviders>
  );
};

export default UploadLicenseExample;