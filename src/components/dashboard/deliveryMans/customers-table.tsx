import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { notification } from 'antd';

import type { DeliveryMan } from '@/types/delivery';
import { useSelection } from '@/hooks/use-selection';
import axiosInstance from '../../../../utils/axiosInstance';

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: DeliveryMan[];
  rowsPerPage?: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSelectedChange?: (selected: Set<string>) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange,
  onRowsPerPageChange,
  onSelectedChange,
}: CustomersTableProps): React.JSX.Element {
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rows.map((row) => row._id));

  React.useEffect((): void => {
    if (onSelectedChange) {
      onSelectedChange(selected);
    }
  }, [selected, onSelectedChange]);

  const [open, setOpen] = React.useState(false);
  const [licenseContent, setLicenseContent] = React.useState<string | null>(null);
  const [licenseType, setLicenseType] = React.useState<'pdf' | 'image' | null>(null);

  const handleOpenLicense = async (licensePath: string): Promise<void> => {
    const fileName = licensePath.split('/').pop();
    if (!fileName) return;

    try {
      const response = await axiosInstance.get<Blob>(`/api/v1/users/delivery-license/${fileName}`, {
        responseType: 'blob',
      });

      const fileType = response.headers['content-type'] as string;
      const url = URL.createObjectURL(response.data);
      setLicenseContent(url);
      setLicenseType(fileType.includes('pdf') ? 'pdf' : 'image');
      setOpen(true);
    } catch (error: unknown) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch the license file. Please try again.',
        placement: 'topRight',
      });
    }
  };

  const handleClose = (): void => {
    setOpen(false);
    if (licenseContent) {
      URL.revokeObjectURL(licenseContent);
    }
    setLicenseContent(null);
    setLicenseType(null);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.size === rows.length}
                  indeterminate={selected.size > 0 && selected.size < rows.length}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Shop name</TableCell>
              <TableCell sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Delivery License
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.has(row._id);

              return (
                <TableRow hover key={row._id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row._id);
                        } else {
                          deselectOne(row._id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.avatar} />
                      <Typography variant="subtitle2">{`${row.first_name} ${row.last_name}`}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.status === 'inactive' ? 'Inactive' : 'Active'}</TableCell>
                  <TableCell>{row.phone_number}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>No shop</TableCell>
                  <TableCell sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {row.DeliveryLicense ? (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        onClick={() => handleOpenLicense(row.DeliveryLicense)}
                      >
                        View License
                      </Button>
                    ) : (
                      'No License'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(event, newPage) => {
          onPageChange(newPage);
        }}
        onRowsPerPageChange={(event) => {
          onRowsPerPageChange(parseInt(event.target.value, 10));
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Delivery License</DialogTitle>
        <DialogContent dividers>
          {licenseContent && licenseType === 'pdf' ? (
            <iframe
              src={licenseContent}
              title="Delivery License"
              style={{ width: '100%', height: '500px', border: 'none' }}
            />
          ) : (
            licenseContent && (
              <img src={licenseContent} alt="Delivery License" style={{ width: '100%', height: 'auto' }} />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
