'use client';

import * as React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { CommentsContainer } from '@/components/dashboard/comments/comments-container';

export default function CommentsPage(): React.JSX.Element {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Comments Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Review and respond to user feedback and support requests
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <CommentsContainer />
        </Paper>
      </Box>
    </Container>
  );
}






