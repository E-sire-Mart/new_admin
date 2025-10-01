'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import { CommentsContainer } from '@/components/dashboard/comments/comments-container';
import type { CommentUser } from '@/types/Comment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communications-tabpanel-${index}`}
      aria-labelledby={`communications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          py: 4,
          px: 1,
          minHeight: '400px'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `communications-tab-${index}`,
    'aria-controls': `communications-tabpanel-${index}`,
  };
}

export default function CommunicationsPage(): React.JSX.Element {
  const [tabValue, setTabValue] = useState(0);

  // Mock current user for demonstration
  const currentUser: CommentUser = {
    id: '2',
    name: 'Support Team',
    email: 'support@store.com',
    role: 'admin',
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ 
        mb: 5,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography 
          variant="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          Communications
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}
        >
          Manage comments and feedback from users and vendors
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="communications tabs"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            '& .MuiTab-root': {
              minHeight: 64,
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'primary.main',
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              },
            },
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
              backgroundColor: 'primary.main',
            }
          }}
        >
          <Tab
            label={
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                px: 1
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'inherit',
                    fontSize: 'inherit'
                  }}
                >
                  Comments & Feedback
                </Typography>
              </Box>
            }
            {...a11yProps(0)}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <CommentsContainer currentUser={currentUser} />
      </TabPanel>
    </Box>
  );
}

