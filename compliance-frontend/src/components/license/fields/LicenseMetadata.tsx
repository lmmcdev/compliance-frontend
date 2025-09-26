import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { LicenseData } from '../../../types/license';
import { extractMetadata, getFieldCount } from '../../../utils/licenseDataParser';

interface LicenseMetadataProps {
  data: LicenseData;
}

export const LicenseMetadata: React.FC<LicenseMetadataProps> = ({ data }) => {
  const metadata = extractMetadata(data);
  const fieldCount = getFieldCount(data);

  return (
    <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Document Analysis Summary
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Model:</strong> {metadata.modelId}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Pages:</strong> {metadata.pages}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Fields:</strong> {fieldCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Processed:</strong> {new Date(metadata.timestamp).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};