'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

// import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import type { Customer } from '@/types/customer';
import { usersClient } from '@/lib/users/client';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    _id: '',
    email: '',
    phone_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    publishing_name: '',
    password: '',
    status: true,
  });

  const fetchCustomers = async (): Promise<void> => {
    const result = await usersClient.getCustomers(page, rowsPerPage, searchQuery);
    if (result.data) {
      setCustomers(result.data);
      setTotal(result.total || 0);
      setError(null);
    } else {
      setCustomers([]);
      setTotal(0);
      setError(result.error || 'Failed to fetch customers');
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, [page, rowsPerPage, searchQuery]);
  const handleAdd = async (): Promise<void> => {
    await usersClient.addUser(newCustomer);
    setOpen(false);
    setNewCustomer({
      _id: '',
      email: '',
      phone_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      publishing_name: '',
      password: '',
      status: true,
    });
    await fetchCustomers();
  };

  const handleDelete = async (): Promise<void> => {
    const deletePromises = Array.from(selectedCustomerIds).map((id) => usersClient.deleteUser(id));
    await Promise.all(deletePromises);
    setSelectedCustomerIds(new Set());
    await fetchCustomers();
  };

  const handleAdminAccess = async (): Promise<void> => {
    const grantAdminsPromises = Array.from(selectedCustomerIds).map((id) => usersClient.grantAdminAccess(id));
    await Promise.all(grantAdminsPromises);
    setSelectedCustomerIds(new Set());
    await fetchCustomers();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Customers</Typography>
        </Stack>
        <div>
          {/* <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            Add
          </Button> */}
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
          <Button
            color="info"
            startIcon={<TrashIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleAdminAccess}
            disabled={selectedCustomerIds.size === 0}
            sx={{ ml: 1 }}
          >
            Grant Admin Access
          </Button>
        </div>
      </Stack>
      <CustomersFilters
        onSearch={(query) => {
          setSearchQuery(query);
        }}
      />
      {error && <Typography color="error">{error}</Typography>}
      <CustomersTable
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
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            variant="standard"
            value={newCustomer.first_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, first_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Middle Name"
            type="text"
            fullWidth
            variant="standard"
            value={newCustomer.middle_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, middle_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            variant="standard"
            value={newCustomer.last_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, last_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
            value={newCustomer.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, email: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="text"
            fullWidth
            variant="standard"
            value={newCustomer.phone_number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, phone_number: e.target.value });
            }}
          />

          <TextField
            margin="dense"
            label="Publishing Name"
            type="text"
            fullWidth
            variant="standard"
            value={newCustomer.publishing_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, publishing_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={newCustomer.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, password: e.target.value });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
