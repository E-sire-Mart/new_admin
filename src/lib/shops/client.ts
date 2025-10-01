import type { Shop } from '@/types/shop';

import apiClient from '../api-client';

interface ShopResponseData {
  total: number;
  data: Shop[];
}

export class ShopClient {
  async deleteShop(id: string): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.delete(`/shop/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async approveShop(id: string): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.patch(
      `/shop/${id}/approve`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async addShop(u: Partial<Shop>): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.post('/shop', u, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getShopsCounts(): Promise<number> {
    try {
      const response = await apiClient.get<{ counts: number }>('/shops/counts');
      return response.data.counts;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch shops count:', error);
      throw new Error('Failed to fetch shops count');
    }
  }
  async getUniversities(
    page: number,
    rowsPerPage: number,
    searchQuery: string
  ): Promise<{ data?: Shop[] | null; total?: number; error?: string }> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return { data: null };
      }
      const response = await apiClient.get<ShopResponseData>('/shop/admin', {
        params: {
          page,
          limit: rowsPerPage,
          search: searchQuery,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        return { data: response.data.data, total: response.data.total };
      }
    } catch (error) {
      return { data: null, total: 0, error: 'Failed to fetch customers' };
    }
    return { data: null, total: 0, error: 'Unexpected error' };
  }
}

export const shopClient = new ShopClient();
