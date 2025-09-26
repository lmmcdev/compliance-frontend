import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAccounts } from '../../contexts/DataContext';
import type { Account } from '../../services/accountsService';

interface AccountSelectionProps {
  selectedAccount?: Account | null;
  onAccountSelect: (account: Account) => void;
  disabled?: boolean;
}

const StyledCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const AccountsContainer = styled(Box)(() => ({
  maxHeight: 400,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: 4,
    '&:hover': {
      background: '#a1a1a1',
    },
  },
}));

const SelectedIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const AccountSelection: React.FC<AccountSelectionProps> = ({
  selectedAccount,
  onAccountSelect,
  disabled = false,
}) => {
  const { accounts, loading, error, fetchAccounts, searchAccounts, refreshAccounts, clearError } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchAccounts();
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        await searchAccounts(searchQuery.trim());
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAccountClick = (account: Account) => {
    if (disabled) return;
    onAccountSelect(account);
  };

  const handleRefresh = async () => {
    clearError();
    await refreshAccounts();
  };

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'center':
      case 'business':
      case 'company':
      case 'corporation':
        return <BusinessIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading accounts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Select Account
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <SearchContainer>
        <TextField
          fullWidth
          placeholder="Search accounts by name, email, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <IconButton
          onClick={handleRefresh}
          disabled={disabled || loading}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
          }}
        >
          <RefreshIcon />
        </IconButton>
      </SearchContainer>

      <AccountsContainer>
        {accounts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No accounts found matching your search.' : 'No accounts available.'}
            </Typography>
          </Box>
        ) : (
          accounts.map((account) => {
            const isSelected = selectedAccount?.id === account.id;

            return (
              <StyledCard key={account.id} selected={isSelected}>
                <CardActionArea
                  onClick={() => handleAccountClick(account)}
                  disabled={disabled}
                  sx={{ borderRadius: 3 }}
                >
                  <CardContent>
                    {isSelected && (
                      <SelectedIndicator>
                        <CheckCircleIcon />
                      </SelectedIndicator>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getAccountIcon(account.type)}
                      </Avatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {account.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={account.type}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                          <Chip
                            label={`#${account.accountNumber}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {account.inHouse && (
                            <Chip
                              label="In-House"
                              size="small"
                              color="success"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          )}
                        </Box>

                        {account.phone && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            📞 {account.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </StyledCard>
            );
          })
        )}
      </AccountsContainer>

      {selectedAccount && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, opacity: 0.1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
            Selected: {selectedAccount.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccountSelection;