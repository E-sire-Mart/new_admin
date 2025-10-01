'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Fade,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Add,
  Edit,
  Delete,
  DragIndicator,
  Folder,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import type { Category } from '@/lib/services/categories-service';
import { getCategoryId } from '@/lib/services/categories-service';
import { getImageUrl } from '@/lib/utils/image-url';

const StyledTreeItem = styled(Box)(({ theme }) => ({
  '& .tree-item-content': {
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 0),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .tree-item-children': {
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    borderLeft: `1px dashed ${theme.palette.divider}`,
  },
}));

interface CategoryTreeItemProps {
  category: Category;
  level?: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentCategory: Category) => void;
  onMove: (categoryId: string, newParentId: string | null) => void;
  expanded: boolean;
  onToggle: (categoryId: string, isExpanded: boolean) => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  expanded,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const hasChildren = category.children && category.children.length > 0;

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle(getCategoryId(category), newExpanded);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit(category);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete(category);
  };

  const handleAddChild = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onAddChild(category);
  };

  return (
    <StyledTreeItem>
      <Box
        className="tree-item-content"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 40,
          cursor: 'pointer',
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIndicator
            sx={{
              cursor: 'grab',
              color: 'text.secondary',
              fontSize: 16,
            }}
          />
          {category.image ? (
            <img
              src={getImageUrl(category.image) || ''}
              alt={category.name}
              style={{
                width: 24,
                height: 24,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ) : !category.parentId ? (
            <Folder sx={{ color: 'primary.main', fontSize: 20 }} />
          ) : (
            <CategoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {category.name}
          </Typography>
          {category.slug && (
            <Chip
              label={category.slug}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Add Child Category">
            <IconButton
              size="small"
              onClick={handleAddChild}
              sx={{ color: 'success.main' }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Category">
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{ color: 'info.main' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'error.main' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {hasChildren && (
        <Collapse in={isExpanded}>
          <Box className="tree-item-children">
            {category.children!.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onMove={onMove}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </StyledTreeItem>
  );
};

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentCategory: Category) => void;
  onMove: (categoryId: string, newParentId: string | null) => void;
  expanded: string[];
  onToggle: (nodeId: string, isExpanded: boolean) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories = [],
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  expanded = [],
  onToggle,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(expanded);

  useEffect(() => {
    setExpandedNodes(expanded);
  }, [expanded]);

  const handleToggle = (nodeId: string, isExpanded: boolean) => {
    setExpandedNodes((prev) => {
      if (isExpanded) {
        return [...prev, nodeId];
      } else {
        return prev.filter((id) => id !== nodeId);
      }
    });
    onToggle(nodeId, isExpanded);
  };

  const renderCategories = (cats: Category[], level = 0) => {
    return cats.map((category) => (
      <CategoryTreeItem
        key={getCategoryId(category)}
        category={category}
        level={level}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChild={onAddChild}
        onMove={onMove}
                  expanded={expandedNodes.includes(getCategoryId(category))}
        onToggle={handleToggle}
      />
    ));
  };

  if (!categories || categories.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          color: 'text.secondary',
        }}
      >
        <CategoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          No Categories Found
        </Typography>
        <Typography variant="body2">
          Start by creating your first category
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        '& .tree-item-root': {
          '& .tree-item-content': {
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
        },
      }}
    >
      {renderCategories(categories)}
    </Box>
  );
};

export default CategoryTree;
