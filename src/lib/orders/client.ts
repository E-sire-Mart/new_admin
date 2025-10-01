import apiClient from '../api-client';

export class OrdersClient {
  async getOrderCounts(): Promise<number> {
    try {
      const response = await apiClient.get<{ counts: number }>('/orders/counts');
      return response.data.counts;
    } catch (error) {
      console.error('Failed to fetch orders count:', error);
      throw new Error('Failed to fetch orders count');
    }
  }
}

export const ordersClient = new OrdersClient();
