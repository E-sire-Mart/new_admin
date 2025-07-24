import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { Shop } from '@/types/shop';
import { useSelection } from '@/hooks/use-selection';

interface ShopTableProps {
  count?: number;
  page?: number;
  rows?: Shop[];
  rowsPerPage?: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSelectedChange?: (selected: Set<string>) => void;
}

export function ShopTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange,
  onRowsPerPageChange,
  onSelectedChange,
}: ShopTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((shop) => shop._id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  React.useEffect(() => {
    if (onSelectedChange) {
      onSelectedChange(selected);
    }
  }, [selected, onSelectedChange]);

  const handlePageChange = (event: unknown, newPage: number): void => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // Helper function to format date to 'Month day, year' (e.g. May 25, 2024)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell>Shop Owner</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Approved</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row._id);

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
                      {row.avatar ? (
                        <Avatar src={row.avatar} />
                      ) : (
                        <Avatar>{row.name.charAt(0)}</Avatar> // Fallback to first letter of the shop name
                      )}
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{row.owner ? `${row.owner.first_name} ${row.owner.last_name}` : 'N/A'}</TableCell>

                  <TableCell>{row.description || 'No description'}</TableCell>

                  <TableCell>{row.owner ? row.owner.email : 'N/A'}</TableCell>

                  <TableCell>{row.approved ? 'Verified' : 'Not Verified'}</TableCell>

                  {/* Format the created_at date */}
                  <TableCell>{row.created_at ? formatDate(row.created_at) : 'N/A'}</TableCell>
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
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}
