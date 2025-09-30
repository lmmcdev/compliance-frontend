import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Account } from '../../../../../services/accountsService';

const ReviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
}));

interface ConfirmationStepProps {
  selectedAccount: Account | null;
  uploadedFile: File | null;
  formData: Record<string, any>;
}

/**
 * Step 4: Confirmation
 * Displays a summary of all entered information for final review
 */
export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedAccount,
  uploadedFile,
  formData,
}) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Review & Confirm
      </Typography>
      <ReviewPaper elevation={0}>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemText
              primary="Account"
              secondary={selectedAccount?.name || 'N/A'}
              primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'h6', color: 'text.primary' }}
            />
          </ListItem>
          <Divider sx={{ my: 2 }} />
          <ListItem disableGutters>
            <ListItemText
              primary="Uploaded File"
              secondary={uploadedFile?.name || 'N/A'}
              primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'h6', color: 'text.primary' }}
            />
          </ListItem>
          <Divider sx={{ my: 2 }} />
          {Object.keys(formData).length > 0 && (
            <>
              <ListItem disableGutters>
                <ListItemText
                  primary="Extracted Fields"
                  secondary={`${Object.keys(formData).length} fields extracted`}
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                />
              </ListItem>
              <Box sx={{ mt: 2, pl: 2 }}>
                {Object.entries(formData).map(([key, value]) => (
                  <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                    <strong>{key}:</strong> {String(value)}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </List>
      </ReviewPaper>
    </Box>
  );
};
