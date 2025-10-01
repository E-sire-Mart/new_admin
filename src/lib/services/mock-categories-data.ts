import type { Category } from './categories-service';

// Mock data for categories during development
// This can be removed once the backend API is fully implemented

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'All electronic devices and accessories',
    parentId: null,
    isActive: true,
    sortOrder: 1,
    metaTitle: 'Electronics - Best Deals on Electronic Devices',
    metaDescription: 'Shop the latest electronics including smartphones, laptops, and accessories',
    metaKeywords: 'electronics, smartphones, laptops, gadgets',
    level: 0,
    children: [
      {
        id: '2',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        parentId: '1',
        isActive: true,
        sortOrder: 1,
        metaTitle: 'Smartphones - Latest Mobile Phones',
        metaDescription: 'Discover the newest smartphones with amazing features',
        metaKeywords: 'smartphones, mobile phones, android, iphone',
        level: 1,
        children: [
          {
            id: '3',
            name: 'Android Phones',
            slug: 'android-phones',
            description: 'Android-based smartphones',
            parentId: '2',
            isActive: true,
            sortOrder: 1,
            metaTitle: 'Android Phones - Best Android Smartphones',
            metaDescription: 'Top Android smartphones with latest features',
            metaKeywords: 'android, smartphones, samsung, google',
            level: 2,
            children: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '4',
            name: 'iPhone',
            slug: 'iphone',
            description: 'Apple iPhone devices',
            parentId: '2',
            isActive: true,
            sortOrder: 2,
            metaTitle: 'iPhone - Latest Apple iPhones',
            metaDescription: 'Shop the newest iPhone models',
            metaKeywords: 'iphone, apple, ios, smartphone',
            level: 2,
            children: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '5',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Portable computers and accessories',
        parentId: '1',
        isActive: true,
        sortOrder: 2,
        metaTitle: 'Laptops - Best Laptops for Work and Gaming',
        metaDescription: 'Find the perfect laptop for your needs',
        metaKeywords: 'laptops, computers, gaming, work',
        level: 1,
        children: [
          {
            id: '6',
            name: 'Gaming Laptops',
            slug: 'gaming-laptops',
            description: 'High-performance gaming computers',
            parentId: '5',
            isActive: true,
            sortOrder: 1,
            metaTitle: 'Gaming Laptops - High Performance Gaming',
            metaDescription: 'Best gaming laptops for ultimate gaming experience',
            metaKeywords: 'gaming, laptops, performance, graphics',
            level: 2,
            children: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '7',
            name: 'Business Laptops',
            slug: 'business-laptops',
            description: 'Professional and business computers',
            parentId: '5',
            isActive: true,
            sortOrder: 2,
            metaTitle: 'Business Laptops - Professional Computing',
            metaDescription: 'Reliable laptops for business professionals',
            metaKeywords: 'business, laptops, professional, work',
            level: 2,
            children: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, and accessories',
    parentId: null,
    isActive: true,
    sortOrder: 2,
    metaTitle: 'Fashion - Latest Trends in Clothing',
    metaDescription: 'Discover the latest fashion trends and styles',
    metaKeywords: 'fashion, clothing, shoes, accessories',
    level: 0,
    children: [
      {
        id: '9',
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Clothing for men',
        parentId: '8',
        isActive: true,
        sortOrder: 1,
        metaTitle: 'Men\'s Clothing - Stylish Men\'s Fashion',
        metaDescription: 'Trendy clothing options for men',
        metaKeywords: 'mens, clothing, fashion, style',
        level: 1,
        children: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '10',
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        description: 'Clothing for women',
        parentId: '8',
        isActive: true,
        sortOrder: 2,
        metaTitle: 'Women\'s Clothing - Elegant Women\'s Fashion',
        metaDescription: 'Beautiful clothing collection for women',
        metaKeywords: 'womens, clothing, fashion, style',
        level: 1,
        children: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '11',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    parentId: null,
    isActive: true,
    sortOrder: 3,
    metaTitle: 'Home & Garden - Improve Your Living Space',
    metaDescription: 'Everything you need for your home and garden',
    metaKeywords: 'home, garden, improvement, supplies',
    level: 0,
    children: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

// Helper function to build tree structure
export const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Mock API responses
export const mockApiResponses = {
  getAllCategories: () => ({
    success: true,
    data: mockCategories,
    message: 'Categories loaded successfully'
  }),
  
  getCategoryById: (id: string) => {
    const category = mockCategories.find(cat => cat.id === id);
    return {
      success: Boolean(category),
      data: category,
      message: category ? 'Category found' : 'Category not found'
    };
  },
  
  createCategory: (categoryData: Partial<Category>) => ({
    success: true,
    data: {
      id: Date.now().toString(),
      ...categoryData,
      level: categoryData.parentId ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Category created successfully'
  }),
  
  updateCategory: (id: string, categoryData: Partial<Category>) => ({
    success: true,
    data: {
      id,
      ...categoryData,
      updatedAt: new Date().toISOString()
    },
    message: 'Category updated successfully'
  }),
  
  deleteCategory: (_id: string) => ({
    success: true,
    message: 'Category deleted successfully'
  })
};
