'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  Edit,
  Save,
  Cancel,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/services/categories-service';
import { getImageUrl } from '@/lib/utils/image-url';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: 500,
    maxWidth: 600,
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  parentCategories: Category[];
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  loading?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  onClose,
  category = null,
  parentCategories = [],
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    isActive: true,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId || null,
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        metaKeywords: category.metaKeywords || '',
      });
      // Set image preview if category has an image
      if (category.image) {
        setImagePreview(getImageUrl(category.image) || null);
      }
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: null,
        isActive: true,
        sortOrder: 0,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setErrors({});
    setTouched({});
  }, [category, open]);

  const handleTextChange = (field: keyof CreateCategoryRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === 'name' && !category) {
      const slug = String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Clear error when field is touched
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: keyof CreateCategoryRequest) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    
    // Handle boolean conversion for isActive field
    if (field === 'isActive') {
      setFormData((prev) => ({
        ...prev,
        [field]: value === 'true',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when field is touched
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setSelectedImage(file);
      setErrors((prev) => ({ ...prev, image: '' }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleBlur = (field: keyof CreateCategoryRequest) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title cannot exceed 60 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description cannot exceed 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        parentId: formData.parentId || null,
        // Only allow image upload for root categories
        image: !formData.parentId ? (selectedImage || undefined) : undefined,
      };
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const isEditMode = !!category;
  const hasErrors = Object.keys(errors).some((key) => errors[key]);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditMode ? <Edit color="primary" /> : <Add color="success" />}
          <Typography variant="h6">
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Basic Information */}
            <Typography variant="h6" color="primary" gutterBottom>
              Basic Information
            </Typography>

            <TextField
              label="Category Name *"
              value={formData.name}
              onChange={handleTextChange('name')}
              onBlur={handleBlur('name')}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              fullWidth
              required
            />

            <TextField
              label="Slug *"
              value={formData.slug}
              onChange={handleTextChange('slug')}
              onBlur={handleBlur('slug')}
              error={touched.slug && !!errors.slug}
              helperText={touched.slug && errors.slug}
              fullWidth
              required
              placeholder="auto-generated-from-name"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleTextChange('description')}
              onBlur={handleBlur('description')}
              error={touched.description && !!errors.description}
              helperText={
                (touched.description && errors.description) ||
                `${formData.description?.length || 0}/500 characters`
              }
              fullWidth
              multiline
              rows={3}
            />

            {/* Image Upload Section - Only for Root Categories */}
            {!formData.parentId && (
              <>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Category Image
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Image Preview */}
                  {imagePreview && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}

                  {/* Upload Button */}
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>

                  {errors.image && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.image}
                    </Alert>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </Typography>
                </Box>
              </>
            )}

            {/* Show message for sub-categories */}
            {formData.parentId && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ℹ️ Images can only be uploaded for root-level categories. Sub-categories inherit their parent's visual identity.
                </Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={formData.parentId || ''}
                onChange={handleSelectChange('parentId')}
                label="Parent Category"
              >
                <MenuItem value="">
                  <em>No Parent (Root Category)</em>
                </MenuItem>
                {parentCategories.map((parent) => (
                  <MenuItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={handleTextChange('sortOrder')}
                fullWidth
                inputProps={{ min: 0 }}
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={handleSelectChange('isActive')}
                  label="Status"
                >
                  <MenuItem value="true">
                    <Chip label="Active" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="false">
                    <Chip label="Inactive" color="error" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* SEO Information */}
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              SEO Information
            </Typography>

            <TextField
              label="Meta Title"
              value={formData.metaTitle}
              onChange={handleTextChange('metaTitle')}
              onBlur={handleBlur('metaTitle')}
              error={touched.metaTitle && !!errors.metaTitle}
              helperText={
                (touched.metaTitle && errors.metaTitle) ||
                `${formData.metaTitle?.length || 0}/60 characters`
              }
              fullWidth
              placeholder="SEO title for search engines"
            />

            <TextField
              label="Meta Description"
              value={formData.metaDescription}
              onChange={handleTextChange('metaDescription')}
              onBlur={handleBlur('metaDescription')}
              error={touched.metaDescription && !!errors.metaDescription}
              helperText={
                (touched.metaDescription && errors.metaDescription) ||
                `${formData.metaDescription?.length || 0}/160 characters`
              }
              fullWidth
              multiline
              rows={2}
              placeholder="SEO description for search engines"
            />

            <TextField
              label="Meta Keywords"
              value={formData.metaKeywords}
              onChange={handleTextChange('metaKeywords')}
              fullWidth
              placeholder="keyword1, keyword2, keyword3"
              helperText="Separate keywords with commas"
            />
          </Box>
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
          <Button
            type="submit"
            variant="contained"
            disabled={loading || hasErrors}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            color="primary"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default CategoryFormModal;
