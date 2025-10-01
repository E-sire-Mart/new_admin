import type { Components, Theme } from '@mui/material/styles';

export const MuiTableHead = {
  styleOverrides: {
    root: {
      '& .MuiTableCell-root': {
        backgroundColor: 'var(--mui-palette-background-level1)',
        color: 'var(--mui-palette-text-secondary)',
        lineHeight: 1,
      },
    },
  },
} satisfies Components<Theme>['MuiTableHead'];
