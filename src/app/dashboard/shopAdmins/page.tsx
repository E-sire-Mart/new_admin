'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import type { ShopAdmin } from '@/types/ShopAdmin';
import { shopClient } from '@/lib/shopAdmins/client';
import { ShopFilters } from '@/components/dashboard/shopAdmins/shop-filters';
import { ShopTable } from '@/components/dashboard/shopAdmins/shop-table';

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<ShopAdmin[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());

  const fetchCustomers = async (): Promise<void> => {
    const result = await shopClient.getUniversities(page, rowsPerPage, searchQuery);
    if (result.data) {
      setCustomers(result.data);
      setTotal(result.total || 0);
    } else {
      setCustomers([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, [page, rowsPerPage, searchQuery]);

  const handleDelete = async (): Promise<void> => {
    const deletePromises = Array.from(selectedCustomerIds).map((id) => shopClient.deleteShop(id));
    await Promise.all(deletePromises);
    setSelectedCustomerIds(new Set());
    await fetchCustomers();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shop Admins</Typography>
        </Stack>
        <div>
          <Button
            color="error"
            startIcon={<TrashIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleDelete}
            disabled={selectedCustomerIds.size === 0}
            sx={{ ml: 1 }}
          >
            Delete
          </Button>
        </div>
      </Stack>
      <ShopFilters
        onSearch={(query) => {
          setSearchQuery(query);
        }}
      />
      <ShopTable
        count={total}
        page={page}
        rows={customers}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
        }}
        onSelectedChange={setSelectedCustomerIds} // Pass the setSelectedCustomerIds function
      />
    </Stack>
  );
}
