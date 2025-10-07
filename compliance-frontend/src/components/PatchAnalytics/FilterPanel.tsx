import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { PatchAnalyticsFilters } from '../../types/patchAnalytics';

interface FilterPanelProps {
  filters: PatchAnalyticsFilters;
  onFiltersChange: (filters: PatchAnalyticsFilters) => void;
  sites?: string[];
  classifications?: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  sites = [],
  classifications = ['Definition Updates', 'Security Updates', 'Critical Updates', 'Feature Updates'],
}) => {
  const [localFilters, setLocalFilters] = useState<PatchAnalyticsFilters>(filters);
  const [expanded, setExpanded] = useState(true);

  const patchStatuses = ['Installed', 'Pending', 'Failed'];

  const handleFilterChange = (field: keyof PatchAnalyticsFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const cleared: PatchAnalyticsFilters = {};
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = Object.values(localFilters).some(v => v !== undefined && v !== '');

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        mb: 3,
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FilterIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                px: 1.5,
                py: 0.5,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {Object.values(localFilters).filter(v => v).length} active
            </Box>
          )}
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Filter Controls */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Month Filter */}
            <TextField
              label="Month"
              type="month"
              value={localFilters.month || ''}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            {/* Classification Filter */}
            <TextField
              select
              label="Classification"
              value={localFilters.Classification || ''}
              onChange={(e) => handleFilterChange('Classification', e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="">All Classifications</MenuItem>
              {classifications.map((classification) => (
                <MenuItem key={classification} value={classification}>
                  {classification}
                </MenuItem>
              ))}
            </TextField>

            {/* Patch Status Filter */}
            <TextField
              select
              label="Patch Status"
              value={localFilters.Patch_status || ''}
              onChange={(e) => handleFilterChange('Patch_status', e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {patchStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            {/* Site Name Filter */}
            <TextField
              select
              label="Site Name"
              value={localFilters.Site_name || ''}
              onChange={(e) => handleFilterChange('Site_name', e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="">All Sites</MenuItem>
              {sites.map((site) => (
                <MenuItem key={site} value={site}>
                  {site}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={!hasActiveFilters}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#f5576c',
                  backgroundColor: 'rgba(245, 87, 108, 0.05)',
                  color: '#f5576c',
                },
              }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleApply}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
