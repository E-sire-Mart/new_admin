'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { ordersClient } from '@/lib/orders/client';
import { shopClient } from '@/lib/shops/client';
import { usersClient } from '@/lib/users/client';
import { Budget } from '@/components/dashboard/overview/budget';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';


export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<number | null>(null);
  const [shops, setShops] = useState<number | null>(null);
  const [orders, setOrders] = useState<number | null>(null);

  const fetchCustomersCounts = async () => {
    const result = await usersClient.getCustomerCount();
    if (result) {
      setCustomers(result);
    } else {
      setCustomers(null);
    }
  };

  useEffect(() => {
    void fetchCustomersCounts();
  }, []);

  const fetchShopsCounts = async () => {
    const result = await shopClient.getShopsCounts();
    if (result) {
      setShops(result);
    } else {
      setShops(null);
    }
  };

  useEffect(() => {
    void fetchShopsCounts();
  }, []);

  const fetchOrdersCounts = async () => {
    const result = await ordersClient.getOrderCounts();
    if (result) {
      setOrders(result);
    } else {
      setOrders(null);
    }
  };

  useEffect(() => {
    void fetchOrdersCounts();
  }, []);

  const total = (customers ?? 0) + (orders ?? 0) + (shops ?? 0);
  const customersRatio = customers !== null && orders !== null ? Math.round((customers / total) * 100) : null;
  const shopsRatio = customers !== null && shops !== null ? Math.round((shops / total) * 100) : null;
  const ordersRatio = orders !== null && shops !== null ? Math.round((orders / total) * 100) : null;

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget diff={12} trend="up" sx={{ height: '100%' }} value={shops !== null ? shops.toString() : 'No data'} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers
          diff={16}
          trend="down"
          sx={{ height: '100%' }}
          value={customers !== null ? customers.toString() : 'No data'}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={orders !== null ? orders : 0} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value="$15k" />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic
          chartSeries={[customersRatio ?? 0, shopsRatio ?? 0, ordersRatio ?? 0]}
          labels={['Orders', 'Shops', 'Customers']}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
