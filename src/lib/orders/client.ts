import apiClient from '../api-client';

export class OrdersClient {
  async getOrderCounts(): Promise<number> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('No auth token found');
      }
      const response = await apiClient.get<{ counts: number }>('/orders/counts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //   console.log('response', response);
      return response.data.counts;
    } catch (error) {
      throw new Error('Failed to fetch customer count');
    }
  }
}

export const ordersClient = new OrdersClient();
