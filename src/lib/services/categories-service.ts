import simpleApiClient from '@/lib/simple-api-client';

export interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  level: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: File;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Helper function to get category ID (handles both 'id' and '_id' from MongoDB)
export function getCategoryId(category: Partial<Category> | null | undefined): string {
  if (!category) return '';
  const raw = (category as { id?: unknown; _id?: unknown }).id ?? (category as { id?: unknown; _id?: unknown })._id;
  return raw ? String(raw) : '';
}

// Normalize a single category coming from the backend so UI can always rely on `id`
function normalizeCategory(raw: Partial<Category> & Record<string, unknown>): Category {
  if (!raw) return raw as unknown as Category;
  const idLike = (raw as { id?: unknown; _id?: unknown }).id ?? (raw as { id?: unknown; _id?: unknown })._id;
  const normalizedId = (idLike as { toString?: () => string } | undefined)?.toString?.() ?? String(idLike ?? '');
  return {
    // Ensure `id` exists and keep `_id` for completeness
    id: normalizedId,
    _id: raw._id?.toString?.() ?? raw._id ?? normalizedId,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    image: raw.image,
    parentId: raw.parentId ?? null,
    isActive: raw.isActive,
    sortOrder: raw.sortOrder ?? 0,
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
    metaKeywords: raw.metaKeywords,
    level: raw.level ?? 0,
    // Recursively normalize children
    children: Array.isArray(raw.children)
      ? raw.children.map((c) => normalizeCategory(c as Partial<Category> & Record<string, unknown>))
      : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  } as Category;
}

function normalizeCategoryArray(arr: any[]): Category[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((c) => normalizeCategory(c));
}

class CategoriesService {
  // Get all categories with tree structure
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      
      if (!simpleApiClient || !simpleApiClient.get) {
        throw new Error('API client is not properly initialized');
      }
      
      const response = await simpleApiClient.get('/api/v1/categories');
      const normalized = normalizeCategoryArray(response.data?.data ?? []);
      return { ...response.data, data: normalized };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch categories',
      };
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await simpleApiClient.get(`/api/v1/categories/${id}`);
      const normalized = normalizeCategory(response.data?.data);
      return { ...response.data, data: normalized };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch category',
      };
    }
  }

  // Create new category
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const formData = new FormData();
      
      // Add all text fields
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.parentId) formData.append('parentId', data.parentId);
      formData.append('isActive', String(data.isActive));
      formData.append('sortOrder', String(data.sortOrder));
      if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
      if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
      if (data.metaKeywords) formData.append('metaKeywords', data.metaKeywords);
      
      // Add image file if provided
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await simpleApiClient.post('/api/v1/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const normalized = normalizeCategory(response.data?.data);
      return { ...response.data, data: normalized };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create category',
      };
    }
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const formData = new FormData();
      
      // Add all text fields
      if (data.name) formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.parentId !== undefined) formData.append('parentId', data.parentId || '');
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
      if (data.metaTitle !== undefined) formData.append('metaTitle', data.metaTitle || '');
      if (data.metaDescription !== undefined) formData.append('metaDescription', data.metaDescription || '');
      if (data.metaKeywords !== undefined) formData.append('metaKeywords', data.metaKeywords || '');
      
      // Add image file if provided
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await simpleApiClient.put(`/api/v1/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const normalized = normalizeCategory(response.data?.data);
      return { ...response.data, data: normalized };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update category',
      };
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await simpleApiClient.delete(`/api/v1/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete category',
      };
    }
  }

  // Get categories by parent ID (for tree structure)
  async getCategoriesByParent(parentId?: string | null): Promise<ApiResponse<Category[]>> {
    try {
      const endpoint = parentId 
        ? `/api/v1/categories/parent/${parentId}`
        : '/api/v1/categories/root';
      const response = await simpleApiClient.get(endpoint);
      const normalized = normalizeCategoryArray(response.data?.data ?? []);
      return { ...response.data, data: normalized };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories by parent',
      };
    }
  }

  // Move category to different parent
  async moveCategory(categoryId: string, newParentId: string | null): Promise<ApiResponse<void>> {
    try {
      const response = await simpleApiClient.patch(`/api/v1/categories/${categoryId}/move`, { 
        parentId: newParentId 
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to move category',
      };
    }
  }

  // Reorder categories
  async reorderCategories(categoryIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await simpleApiClient.patch('/api/v1/categories/reorder', { categoryIds });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reorder categories',
      };
    }
  }
}

export const categoriesService = new CategoriesService();
