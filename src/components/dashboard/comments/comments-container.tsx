'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { CommentsFilters, type CommentFilters } from './comments-filters';
import { CommentItem } from './comment-item';
import type { Comment, CommentUser, CommentThread } from '@/types/Comment';

interface CommentsContainerProps {
  currentUser?: CommentUser;
}

export function CommentsContainer({ currentUser }: CommentsContainerProps): React.JSX.Element {
  // Default current user if none provided
  const defaultCurrentUser: CommentUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@store.com',
    role: 'admin',
    avatar: '/assets/avatars/avatar-1.png'
  };

  const user = currentUser || defaultCurrentUser;
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CommentFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    role: '',
  });

  // Load from backend
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    try {
      const direct = localStorage.getItem('custom-auth-token') || localStorage.getItem('token');
      if (direct) return direct;
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        return parsed?.access_token || null;
      }
    } catch {}
    return null;
  };

  const fetchComments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '';
      const token = getAuthToken();
      const res = await fetch(`${base}/api/v1/comments?role=admin`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: 'no-store'
      });
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      const mapped: Comment[] = list.map((c: any) => {
        const commentAvatar = c.fromAvatar || c.avatar || c.profileImage || c.profilePic || c.photo || c.picture || c.image || c.userImage || c.imageUrl || c.avatarUrl || '';
        return {
        id: String(c._id || c.id),
        content: c.title ? `${c.title}\n\n${c.content}` : c.content,
        author: { id: c.fromUserId || 'n/a', name: (c.storeName || c.fromName || c.fromEmail || c.fromRole || '').toString(), email: c.fromEmail || '', role: c.fromRole, avatar: commentAvatar },
        timestamp: new Date(c.createdAt),
        isResolved: Boolean(c.isResolved),
        priority: (c.priority || 'medium'),
        category: (c.type === 'bug' || c.type === 'feature' || c.type === 'support' || c.type === 'feedback' || c.type === 'general') ? c.type : 'general',
        rating: typeof c.rating === 'number' ? c.rating : 0,
        storeName: c.storeName || '',
        attachments: Array.isArray(c.attachments) ? c.attachments : [],
        replies: (c.replies || []).map((r: any) => {
          const replyAvatar = r.authorAvatar || r.avatar || r.profileImage || r.profilePic || r.photo || r.picture || r.image || r.userImage || r.imageUrl || r.avatarUrl || '';
          return {
          id: String(r._id || r.id || Math.random()),
          content: r.content,
          author: { id: r.authorId, name: (r.authorName || r.authorEmail || r.authorRole || '').toString(), email: r.authorEmail || '', role: r.authorRole, avatar: replyAvatar },
          timestamp: new Date(r.createdAt),
          isAdminResponse: r.authorRole === 'admin',
          attachments: Array.isArray(r.attachments) ? r.attachments : [],
          };
        }),
      };
      });
      setComments(mapped);
      setFilteredComments(mapped);
    } catch (e) {
      throw new Error('Failed to load comments', e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Apply filters
  useEffect(() => {
    let filtered = [...comments];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchLower) ||
        comment.author.name.toLowerCase().includes(searchLower) ||
        comment.author.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(comment => {
        if (filters.status === 'resolved') return comment.isResolved;
        if (filters.status === 'open') return !comment.isResolved;
        return true;
      });
    }

    if (filters.priority) {
      filtered = filtered.filter(comment => comment.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(comment => comment.category === filters.category);
    }

    if (filters.role) {
      filtered = filtered.filter(comment => comment.author.role === filters.role);
    }

    setFilteredComments(filtered);
  }, [comments, filters]);

  const handleFiltersChange = (newFilters: CommentFilters) => {
    setFilters(newFilters);
  };

  const handleReply = async (commentId: string, replyContent: string) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '';
      const token = getAuthToken();
      await fetch(`${base}/api/v1/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: replyContent })
      });
      setComments(prev => prev.map(c => c.id === commentId ? {
        ...c,
        replies: [...c.replies, {
          id: Date.now().toString(),
          content: replyContent,
          author: user,
          timestamp: new Date(),
          isAdminResponse: user.role === 'admin',
        }]
      } : c));
    } catch (e) {
      throw new Error('Reply failed', e as Error);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '';
      const token = getAuthToken();
      await fetch(`${base}/api/v1/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isResolved: true } : c));
    } catch (e) {
      throw new Error('Resolve failed', e as Error);
    }
  };

  const handleRefresh = () => { fetchComments(); };

  const getStats = () => {
    const total = comments.length;
    const resolved = comments.filter(c => c.isResolved).length;
    const highPriority = comments.filter(c => c.priority === 'high' && !c.isResolved).length;
    const pending = total - resolved;

    return { total, resolved, highPriority, pending };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading comments...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Comments & Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and respond to comments from users and vendors
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {}}
          >
            New Comment
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Comments
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" gutterBottom>
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" gutterBottom>
              {stats.highPriority}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" gutterBottom>
              {stats.resolved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <CommentsFilters onFiltersChange={handleFiltersChange} />

      {/* Comments List */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Comments ({filteredComments.length})
          </Typography>
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              onDelete={() => handleFiltersChange({ ...filters, search: '' })}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {filteredComments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No comments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filters.search || Object.values(filters).some(f => f !== '')
                ? 'Try adjusting your filters or search terms.'
                : 'There are no comments yet. Users and vendors can leave comments that will appear here.'}
            </Typography>
          </Paper>
        ) : (
          filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              onReply={handleReply}
              onResolve={handleResolve}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
