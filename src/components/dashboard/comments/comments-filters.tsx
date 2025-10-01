'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

interface CommentsFiltersProps {
  onFiltersChange: (filters: CommentFilters) => void;
}

export interface CommentFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  role: string;
}

const initialFilters: CommentFilters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  role: '',
};

export function CommentsFilters({ onFiltersChange }: CommentsFiltersProps): React.JSX.Element {
  const [filters, setFilters] = useState<CommentFilters>(initialFilters);

  const handleFilterChange = (key: keyof CommentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterIcon color="primary" />
        <Typography variant="h6">Filters</Typography>
        {hasActiveFilters && (
          <Chip
            label={`${Object.values(filters).filter(v => v !== '').length} active`}
            color="primary"
            size="small"
          />
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search comments..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>

        {/* Status Filter */}
        <Grid xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Priority Filter */}
        <Grid xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Category Filter */}
        <Grid xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="support">Support</MenuItem>
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="feature">Feature</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Role Filter */}
        <Grid xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          variant="outlined"
          size="small"
        >
          Clear Filters
        </Button>
      </Box>
    </Paper>
  );
}
