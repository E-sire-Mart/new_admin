import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <AuthGuard>
      <ThemeProvider>
        {/* The rest of your layout */}
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <SideNav />
          <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', marginLeft: { lg: 'var(--SideNav-width)' } }}>
            <MainNav />
            <Container maxWidth={false} sx={{ flex: 1, py: 6 }}>
              {children}
            </Container>
          </Box>
        </Box>
        <GlobalStyles 
          styles={{ 
            body: { 
              backgroundColor: 'var(--mui-palette-background-default)',
              margin: 0,
              padding: 0,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            '#__next': {
              height: '100%'
            }
          }} 
        />
      </ThemeProvider>
    </AuthGuard>
  );
}
