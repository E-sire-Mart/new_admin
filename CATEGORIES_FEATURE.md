# Product Categories Management Feature

## Overview
The Product Categories Management feature provides a comprehensive interface for managing product categories with a hierarchical tree structure in the main site administrator dashboard. This feature allows administrators to create, edit, delete, and organize categories in a user-friendly tree view.

## Features

### 🌳 Tree Structure
- **Hierarchical Organization**: Categories can have unlimited levels of nesting
- **Visual Tree View**: Intuitive tree interface with expand/collapse functionality
- **Drag & Drop Ready**: Infrastructure in place for future drag-and-drop reordering

### ✨ CRUD Operations
- **Create**: Add new categories at any level
- **Read**: View categories in tree or list format
- **Update**: Edit existing category details
- **Delete**: Remove categories with safety checks

### 🎯 Advanced Features
- **SEO Optimization**: Meta title, description, and keywords for each category
- **Status Management**: Active/inactive category states
- **Sort Order**: Custom ordering within each level
- **Slug Generation**: Auto-generated URL-friendly slugs
- **Parent Selection**: Choose parent categories from dropdown

### 🛡️ Safety Features
- **Deletion Protection**: Prevents deletion of categories with children or products
- **Validation**: Form validation with real-time error checking
- **Confirmation Dialogs**: User-friendly confirmation for destructive actions

## File Structure

```
src/
├── app/
│   └── dashboard/
│       └── categories/
│           └── page.tsx                 # Main categories page
├── components/
│   └── categories/
│       ├── index.ts                     # Component exports
│       ├── CategoryTree.tsx             # Main tree component
│       ├── CategoryFormModal.tsx        # Create/Edit form
│       └── DeleteCategoryModal.tsx      # Delete confirmation
├── lib/
│   └── services/
│       ├── categories-service.ts        # API service layer
│       └── mock-categories-data.ts      # Development mock data
└── paths.ts                             # Navigation routing
```

## Components

### CategoryTree
The main tree visualization component that displays categories in a hierarchical structure.

**Features:**
- Expandable/collapsible nodes
- Action buttons for each category (Edit, Delete, Add Child)
- Visual indicators for folders vs. leaf categories
- Drag handles for future reordering

**Props:**
- `categories`: Array of category objects
- `onEdit`: Function called when edit button is clicked
- `onDelete`: Function called when delete button is clicked
- `onAddChild`: Function called when add child button is clicked
- `onMove`: Function called when category is moved
- `expanded`: Array of expanded node IDs
- `onToggle`: Function called when node is expanded/collapsed

### CategoryFormModal
A comprehensive form for creating and editing categories.

**Features:**
- Auto-slug generation from category name
- Parent category selection dropdown
- SEO fields (meta title, description, keywords)
- Form validation with real-time feedback
- Status and sort order controls

**Props:**
- `open`: Boolean to control modal visibility
- `onClose`: Function called when modal is closed
- `category`: Category object for editing (null for creation)
- `parentCategories`: Array of available parent categories
- `onSubmit`: Function called with form data
- `loading`: Boolean for loading state

### DeleteCategoryModal
Confirmation dialog for category deletion with safety checks.

**Features:**
- Checks for child categories
- Checks for associated products
- Detailed information about what prevents deletion
- Clear action buttons

**Props:**
- `open`: Boolean to control modal visibility
- `onClose`: Function called when modal is closed
- `category`: Category object to be deleted
- `onConfirm`: Function called when deletion is confirmed
- `loading`: Boolean for loading state
- `hasChildren`: Boolean indicating if category has children
- `hasProducts`: Boolean indicating if category has products
- `childCategories`: Array of child categories
- `productCount`: Number of products in category

## API Integration

### Categories Service
The service layer handles all API communication for categories.

**Methods:**
- `getAllCategories()`: Fetch all categories with tree structure
- `getCategoryById(id)`: Get single category by ID
- `createCategory(data)`: Create new category
- `updateCategory(id, data)`: Update existing category
- `deleteCategory(id)`: Delete category
- `getCategoriesByParent(parentId)`: Get categories by parent
- `moveCategory(id, newParentId)`: Move category to different parent
- `reorderCategories(ids)`: Reorder categories

### Mock Data
During development, the system uses mock data to demonstrate functionality without requiring a backend API.

**Features:**
- Sample category hierarchy (Electronics, Fashion, Home & Garden)
- Realistic data structure matching API expectations
- Easy to replace with actual API calls

## Usage

### Adding Categories
1. Navigate to Categories in the admin dashboard
2. Click "Add Category" button
3. Fill in category details (name, description, etc.)
4. Select parent category if creating a sub-category
5. Click "Create Category"

### Editing Categories
1. Click the edit button (pencil icon) on any category
2. Modify the desired fields
3. Click "Update Category"

### Deleting Categories
1. Click the delete button (trash icon) on any category
2. Review the confirmation dialog
3. If safe to delete, click "Delete Category"

### Managing Hierarchy
- Use the tree view to see category relationships
- Expand/collapse nodes to navigate the hierarchy
- Add child categories to any existing category
- Categories with children cannot be deleted until children are removed

## Data Structure

### Category Object
```typescript
interface Category {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier
  description?: string;          // Category description
  parentId?: string | null;      // Parent category ID
  isActive: boolean;             // Active status
  sortOrder: number;             // Display order
  metaTitle?: string;            // SEO title
  metaDescription?: string;      // SEO description
  metaKeywords?: string;         // SEO keywords
  level: number;                 // Hierarchy level (0 = root)
  children?: Category[];         // Sub-categories
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}
```

## Future Enhancements

### Planned Features
- **Drag & Drop Reordering**: Visual category reordering
- **Bulk Operations**: Select and modify multiple categories
- **Category Import/Export**: CSV/JSON import/export functionality
- **Category Templates**: Pre-defined category structures
- **Advanced Search**: Search within categories
- **Category Analytics**: Usage statistics and insights

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Caching**: Redis-based category caching
- **Performance**: Virtual scrolling for large category trees
- **Accessibility**: Enhanced screen reader support

## Configuration

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Development Settings
NODE_ENV=development
```

### Dependencies
The feature requires the following packages:
- `@mui/material`: Material-UI components
- `@mui/icons-material`: Material-UI icons
- `next`: Next.js framework
- `react`: React library

## Troubleshooting

### Common Issues

**Categories not loading:**
- Check API endpoint configuration
- Verify network connectivity
- Check browser console for errors

**Form validation errors:**
- Ensure required fields are filled
- Check slug format (lowercase, hyphens only)
- Verify character limits for SEO fields

**Delete operation blocked:**
- Remove all child categories first
- Move or delete associated products
- Check category dependencies

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'categories');
```

## Contributing

When contributing to this feature:

1. **Follow the existing code style**
2. **Add comprehensive tests** for new functionality
3. **Update documentation** for any changes
4. **Test with both mock and real API data**
5. **Ensure accessibility compliance**

## Support

For issues or questions about the Categories feature:
1. Check the troubleshooting section
2. Review the component documentation
3. Check the browser console for errors
4. Verify API endpoint configuration
