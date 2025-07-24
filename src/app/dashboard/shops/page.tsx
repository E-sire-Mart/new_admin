'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckFat } from '@phosphor-icons/react';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { notification } from 'antd'; // Import Ant Design notification

import type { Shop } from '@/types/shop';
import { shopClient } from '@/lib/shops/client';
import { ShopFilters } from '@/components/dashboard/shops/shop-filters';
import { ShopTable } from '@/components/dashboard/shops/shop-table';

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<Shop[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for the Add button
  const [loadingDelete, setLoadingDelete] = useState(false); // Loading state for the Delete button
  const [loadingApprove, setLoadingApprove] = useState(false); // Loading state for the Approve button
  const [newCustomer, setNewCustomer] = useState<Shop>({
    _id: '',
    name: '',
    description: '',
    email: '',
    password: '',
    approved: false,
    first_name: '',
    last_name: '',
    phone_number: '',
    ownerId: '',
    owner: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent the default action of the button
  };

  // Ant Design notification utility functions
  const openSuccessNotification = (message: string, description: string) => {
    notification.success({
      message,
      description,
      placement: 'topRight',
    });
  };

  const openErrorNotification = (message: string, description: string) => {
    notification.error({
      message,
      description,
      placement: 'topRight',
    });
  };

  const fetchCustomers = async (): Promise<void> => {
    const result = await shopClient.getUniversities(page, rowsPerPage, searchQuery);
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

  const handleAdd = async (): Promise<void> => {
    setLoading(true); // Set loading state to true before the Add process starts
    try {
      // Validation or warning cases (example)
      if (!newCustomer.name) {
        openErrorNotification('Shop name is required.', 'Please provide a shop name.');
        setLoading(false);
        return;
      }

      await shopClient.addShop(newCustomer);
      setOpen(false);
      setNewCustomer({
        _id: '',
        name: '',
        description: '',
        email: '',
        password: '',
        approved: false,
        first_name: '',
        last_name: '',
        phone_number: '',
        owner: {
          first_name: '',
          last_name: '',
          email: '',
        },
      });
      await fetchCustomers();

      // Show success notification
      openSuccessNotification('Shop Added', 'The shop has been added successfully.');
    } catch (err) {
      openErrorNotification('Failed to Add Shop', 'There was an error adding the shop. Please try again.');
    } finally {
      setLoading(false); // Set loading state to false when the Add process is done
    }
  };

  const handleDelete = async (): Promise<void> => {
    setLoadingDelete(true); // Set loading state for the Delete button
    try {
      const deletePromises = Array.from(selectedCustomerIds).map((id) => shopClient.deleteShop(id));
      await Promise.all(deletePromises);
      setSelectedCustomerIds(new Set());
      await fetchCustomers();

      // Show success notification after deletion
      openSuccessNotification('Shops Deleted', 'The selected shops have been deleted successfully.');
    } catch (err) {
      openErrorNotification('Failed to Delete Shops', 'There was an error deleting the selected shops.');
    } finally {
      setLoadingDelete(false); // Set loading state to false after deletion
    }
  };

  const handleApprove = async (): Promise<void> => {
    setLoadingApprove(true); // Set loading state for the Approve button
    try {
      const approvePromises = Array.from(selectedCustomerIds).map((id) => shopClient.approveShop(id));
      await Promise.all(approvePromises);
      setSelectedCustomerIds(new Set());
      await fetchCustomers();

      // Show success notification after approval
      openSuccessNotification('Shops Approved', 'The selected shops have been approved successfully.');
    } catch (err) {
      openErrorNotification('Failed to Approve Shops', 'There was an error approving the selected shops.');
    } finally {
      setLoadingApprove(false); // Set loading state to false after approval
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, [page, rowsPerPage, searchQuery]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shops</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            Add
          </Button>
          <Button
            color="error"
            startIcon={
              loadingDelete ? <CircularProgress size={20} /> : <TrashIcon fontSize="var(--icon-fontSize-md)" />
            } // Show spinner when deleting
            variant="contained"
            onClick={handleDelete}
            disabled={selectedCustomerIds.size === 0 || loadingDelete} // Disable button while deleting
            sx={{ ml: 1 }}
          >
            {loadingDelete ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            color="info"
            startIcon={
              loadingApprove ? <CircularProgress size={20} /> : <CheckFat fontSize="var(--icon-fontSize-md)" />
            } // Show spinner when approving
            variant="contained"
            onClick={handleApprove}
            disabled={selectedCustomerIds.size === 0 || loadingApprove} // Disable button while approving
            sx={{ ml: 1 }}
          >
            {loadingApprove ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </Stack>
      <ShopFilters
        onSearch={(query) => {
          setSearchQuery(query);
        }}
      />
      {error && <Typography color="error">{error}</Typography>}
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
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle sx={{ fontSize: '25px' }}>Add New Shop</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Shop Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, name: e.target.value });
            }}
          />

          <TextField
            margin="dense"
            label="Shop Description"
            multiline // Enables the textarea behavior
            rows={3} // Specifies the number of visible rows
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, description: e.target.value });
            }}
          />

          <TextField
            margin="dense"
            label="Owner First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.first_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, first_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Owner Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.last_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, last_name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Owner Phone Number"
            type="number"
            fullWidth
            variant="outlined"
            value={newCustomer.phone_number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, phone_number: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newCustomer.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, email: e.target.value });
            }}
          />

          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? 'text' : 'password'} // Toggle between text and password
            fullWidth
            variant="outlined"
            value={newCustomer.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCustomer({ ...newCustomer, password: e.target.value });
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ paddingRight: '25px' }}>
          <Button
            sx={{ borderRadius: '8px' }}
            color="error"
            variant="contained"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            sx={{ borderRadius: '8px' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
