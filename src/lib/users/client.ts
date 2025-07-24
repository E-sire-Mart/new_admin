import { Customer } from '../../types/customer';
import { DeliveryMan } from '../../types/delivery';

import apiClient from '../api-client';

interface CustomersResponseData {
  total: number;
  data: Customer[];
}
interface DeliveryManResponse {
  data: DeliveryMan[];
  total: number;
}
export class UsersClient {
  async deleteUser(userId: string): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async grantAdminAccess(userId: string): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.put(
      `/users/${userId}/make-admin`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async addUser(user: Partial<Customer>): Promise<void> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      throw new Error('No auth token found');
    }
    await apiClient.post('/users', user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getCustomerCount(): Promise<number> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('No auth token found');
        // return { data: null }
      }
      const response = await apiClient.get<{ counts: number }>('/users/counts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },

      });
      return response.data.counts;
    } catch (error) {
      throw new Error('Failed to fetch customer count');
    }
  }

  async getCustomers(
    page: number,
    rowsPerPage: number,
    searchQuery: string
  ): Promise<{ data?: Customer[] | null; total?: number; error?: string }> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return { data: null };
      }

      const response = await apiClient.get<CustomersResponseData>('/users', {
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
      // console.log(error, 'this is my network error');
      return { data: null, total: 0, error: 'Failed to fetch customers' };
    }
    return { data: null, total: 0, error: 'Unexpected error' };
  }
  // services/userService.ts

  async getDeliveryMen(
    page: number,
    rowsPerPage: number,
    searchQuery: string
  ): Promise<{ data?: DeliveryMan[] | null; total?: number; error?: string }> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return { data: null };
      }

      // Use the DeliveryManResponse interface as the generic type for apiClient.get
      const response = await apiClient.get<DeliveryManResponse>('/users/deliverymans', {
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
      return { data: null, total: 0, error: 'Failed to fetch delivery personnel' };
    }
    return { data: null, total: 0, error: 'Unexpected error' };
  }
}

export const usersClient = new UsersClient();
