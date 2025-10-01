import type { Components, Theme } from '@mui/material/styles';

export const MuiTableBody = {
  styleOverrides: {
    root: {
      '& .MuiTableRow-root:last-child .MuiTableCell-root': {
        '--TableCell-borderWidth': 0,
      },
    },
  },
} satisfies Components<Theme>['MuiTableBody'];
