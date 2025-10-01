'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Add,
  Refresh,
  ViewList,
  AccountTree,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import CategoryTree from '@/components/categories/CategoryTree';
import CategoryFormModal from '@/components/categories/CategoryFormModal';
import DeleteCategoryModal from '@/components/categories/DeleteCategoryModal';

import { categoriesService, type Category, type CreateCategoryRequest, type UpdateCategoryRequest, getCategoryId } from '@/lib/services/categories-service';
import { mockApiResponses } from '@/lib/services/mock-categories-data';
import { testEnvironmentVariables } from '@/lib/test-env';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export default function CategoriesPage() {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  
  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Success/Error messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load categories on component mount
  useEffect(() => {
    testEnvironmentVariables();
    loadCategories();
  }, []);

  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoriesService.getAllCategories();
      
      if (response.success && response.data) {
        console.log('Categories loaded from backend:', response.data);
        console.log('First category sample:', response.data[0]);
        console.log('Category ID field:', response.data[0]?.id);
        console.log('Category _id field:', response.data[0]?._id);
        
        setCategories(response.data);
        // Auto-expand first level categories
        const rootIds = response.data
          .filter(cat => !cat.parentId)
          .map(cat => getCategoryId(cat));
        setExpandedNodes(rootIds);
      } else {
        setError(response.message || response.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      setFormLoading(true);
      
      console.log('Form submission - editingCategory:', editingCategory);
      console.log('Form submission - editingCategory.id:', getCategoryId(editingCategory));
      console.log('Form submission - formData:', formData);
      
      let response;
      if (editingCategory && getCategoryId(editingCategory)) {
        // Update existing category
        const categoryId = getCategoryId(editingCategory);
        console.log('Updating category with ID:', categoryId);
        response = await categoriesService.updateCategory(categoryId, formData as UpdateCategoryRequest);
      } else {
        // Create new category
        console.log('Creating new category');
        response = await categoriesService.createCategory(formData as CreateCategoryRequest);
      }
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: editingCategory 
            ? 'Category updated successfully!' 
            : 'Category created successfully!',
          severity: 'success',
        });
        
        // Reload categories and close modal
        await loadCategories();
        handleCloseFormModal();
      } else {
        setSnackbar({
          open: true,
          message: response.message || response.error || 'Operation failed',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save category. Please try again.',
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setDeleteLoading(true);
      
      console.log('Deleting category with ID:', categoryId);
      const response = await categoriesService.deleteCategory(categoryId);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Category deleted successfully!',
          severity: 'success',
        });
        
        // Reload categories and close modal
        await loadCategories();
        setDeleteModalOpen(false);
        setSelectedCategory(null);
      } else {
        setSnackbar({
          open: true,
          message: response.message || response.error || 'Failed to delete category',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modal handlers
  const handleOpenFormModal = (category: Category | null = null, parent: Category | null = null) => {
    console.log('Opening form modal with category:', category);
    console.log('Category ID:', category?.id);
    console.log('Category object keys:', category ? Object.keys(category) : 'null');
    setEditingCategory(category);
    setParentCategory(parent);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingCategory(null);
    setParentCategory(null);
  };

  const handleOpenDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  // Event handlers for CategoryTree
  const handleEditCategory = (category: Category) => {
    console.log('Edit category clicked:', category);
    console.log('Category ID (using helper):', getCategoryId(category));
    handleOpenFormModal(category);
  };

  const handleDeleteCategoryFromTree = (category: Category) => {
    handleOpenDeleteModal(category);
  };

  const handleAddChildCategory = (parentCategory: Category) => {
    handleOpenFormModal(null, parentCategory);
  };

  const handleMoveCategory = (categoryId: string, newParentId: string | null) => {
    // Implementation for moving categories
    console.log('Move category:', categoryId, 'to parent:', newParentId);
  };

  const handleToggleNode = (nodeId: string, isExpanded: boolean) => {
    setExpandedNodes(prev => {
      if (isExpanded) {
        return [...prev, nodeId];
      } else {
        return prev.filter(id => id !== nodeId);
      }
    });
  };

  // Get parent categories for form dropdown
  const getParentCategories = (): Category[] => {
    const flattenCategories = (cats: Category[], result: Category[] = []): Category[] => {
      cats.forEach(cat => {
        if (editingCategory && getCategoryId(cat) === getCategoryId(editingCategory)) return; // Skip self
        result.push({
          id: getCategoryId(cat),
          name: cat.name,
          level: cat.level || 0,
        } as Category);
        if (cat.children && cat.children.length > 0) {
          flattenCategories(cat.children, result);
        }
      });
      return result;
    };
    
    return flattenCategories(categories);
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Box
              mx={2}
              mt={-3}
              py={3}
              px={2}
              bgcolor="info.main"
              borderRadius={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" color="white">
                  Categories Management
                </Typography>
                <Chip
                  label={`${categories.length} Categories`}
                  color="secondary"
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Refresh />}
                  onClick={loadCategories}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => handleOpenFormModal()}
                >
                  Add Category
                </Button>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* View Mode Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                  value={viewMode}
                  onChange={(e, newValue) => setViewMode(newValue as 'tree' | 'list')}
                  aria-label="category view mode"
                >
                  <Tab
                    icon={<AccountTree />}
                    label="Tree View"
                    value="tree"
                  />
                  <Tab
                    icon={<ViewList />}
                    label="List View"
                    value="list"
                  />
                </Tabs>
              </Box>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Categories Content */}
              {viewMode === 'tree' ? (
                <StyledPaper elevation={0}>
                  <CategoryTree
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategoryFromTree}
                    onAddChild={handleAddChildCategory}
                    onMove={handleMoveCategory}
                    expanded={expandedNodes}
                    onToggle={handleToggleNode}
                  />
                </StyledPaper>
              ) : (
                <StyledPaper elevation={0}>
                  <Typography variant="h6" color="text.secondary" align="center">
                    List View Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Switch to Tree View for full functionality
                  </Typography>
                </StyledPaper>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Category Form Modal */}
      <CategoryFormModal
        open={formModalOpen}
        onClose={handleCloseFormModal}
        category={editingCategory}
        parentCategories={getParentCategories()}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        category={selectedCategory}
        onConfirm={handleDeleteCategory}
        loading={deleteLoading}
        hasChildren={selectedCategory?.children?.length ? selectedCategory.children.length > 0 : false}
        hasProducts={false} // This would need to be fetched from API
        childCategories={selectedCategory?.children || []}
        productCount={0} // This would need to be fetched from API
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
