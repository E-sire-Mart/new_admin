'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Warning,
  Delete,
  Cancel,
  Error,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import type { Category } from '@/lib/services/categories-service';
import { getCategoryId } from '@/lib/services/categories-service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: 400,
    maxWidth: 500,
  },
}));

interface DeleteCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  onConfirm: (categoryId: string) => void;
  loading?: boolean;
  hasChildren?: boolean;
  hasProducts?: boolean;
  childCategories?: Category[];
  productCount?: number;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  open,
  onClose,
  category,
  onConfirm,
  loading = false,
  hasChildren = false,
  hasProducts = false,
  childCategories = [],
  productCount = 0,
}) => {
  const handleConfirm = () => {
    if (category) {
              onConfirm(getCategoryId(category));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getSeverity = () => {
    if (hasChildren || hasProducts) return 'error';
    return 'warning';
  };

  const getTitle = () => {
    if (hasChildren || hasProducts) {
      return 'Cannot Delete Category';
    }
    return 'Delete Category';
  };

  const getMessage = () => {
    if (hasChildren) {
      return `Cannot delete "${category?.name}" because it has ${childCategories.length} sub-categories. Please delete or move all sub-categories first.`;
    }
    if (hasProducts) {
      return `Cannot delete "${category?.name}" because it contains ${productCount} products. Please move or delete all products first.`;
    }
    return `Are you sure you want to delete "${category?.name}"? This action cannot be undone.`;
  };

  const renderChildrenList = () => {
    if (!hasChildren || childCategories.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Sub-categories that must be removed first:
        </Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {childCategories.map((child) => (
            <ListItem key={child.id} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Error color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={child.name}
                secondary={`ID: ${child.id}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderProductsInfo = () => {
    if (!hasProducts) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" icon={<Error />}>
          This category contains {productCount} product(s) that must be moved or deleted first.
        </Alert>
      </Box>
    );
  };

  const canDelete = !hasChildren && !hasProducts;

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color={getSeverity() as any} />
          <Typography variant="h6" color={getSeverity() as any}>
            {getTitle()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity={getSeverity() as any} icon={<Warning />}>
            {getMessage()}
          </Alert>
        </Box>

        {renderChildrenList()}
        {renderProductsInfo()}

        {canDelete && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Category Details:</strong>
            </Typography>
            <Box sx={{ mt: 1, pl: 2 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {category?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Slug:</strong> {category?.slug}
              </Typography>
              {category?.description && (
                <Typography variant="body2">
                  <strong>Description:</strong> {category.description}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancel
        </Button>
        
        {canDelete && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={<Delete />}
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default DeleteCategoryModal;
