'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  TextField,
  Button,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import Rating from '@mui/material/Rating';
import type { Comment, CommentReply, CommentUser } from '@/types/Comment';

interface CommentItemProps {
  comment: Comment;
  currentUser?: CommentUser;
  onReply: (commentId: string, replyContent: string) => void;
  onResolve: (commentId: string) => void;
}

export function CommentItem({ comment, currentUser, onReply, onResolve }: CommentItemProps): React.JSX.Element {
  // Default current user if none provided
  const defaultCurrentUser: CommentUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@store.com',
    role: 'admin',
    avatar: '/assets/avatars/avatar-1.png'
  };

  const user = currentUser || defaultCurrentUser;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const toAbsoluteUploadsUrl = (path?: string) => {
    if (!path) return undefined as any;
    const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '';
    const normalized = String(path).replace(/^\/+/, '');
    const withUploads = normalized.startsWith('uploads/') ? normalized : `uploads/${normalized}`;
    return `${base}/${withUploads}`;
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleResolve = () => {
    onResolve(comment.id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'error';
      case 'feature': return 'success';
      case 'support': return 'info';
      case 'feedback': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string): React.ReactElement | undefined => {
    if (priority === 'high') return <PriorityHighIcon fontSize="small" />;
    return undefined;
  };

  return (
    <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
              {/* Resolved Badge - Right Bottom Corner */}
        {comment.isResolved && (
          <Box sx={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            zIndex: 1
          }}>
          <Chip
            icon={<CheckCircleIcon />}
            label="✓ Resolved"
            color="error"
            size="small"
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontWeight: '500'
            }}
          />
        </Box>
      )}
      
      {/* Comment Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar sx={{ width: 40, height: 40 }} src={toAbsoluteUploadsUrl(comment.author.avatar)}>
          {(!comment.author.avatar && comment.author.name) ? comment.author.name.charAt(0) : ''}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.author.name}
            </Typography>
            <Chip
              label={comment.author.role === 'vendor' ? 'Store Admin' : comment.author.role}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            {comment.storeName && (
              <Chip label={comment.storeName} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            )}
            {comment.isResolved && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Resolved"
                color="error"
                size="small"
                sx={{ 
                  fontSize: '0.7rem',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca'
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={getPriorityIcon(comment.priority)}
              label={comment.priority}
              color={getPriorityColor(comment.priority) as any}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip
              icon={<CategoryIcon />}
              label={comment.category}
              color={getCategoryColor(comment.category) as any}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
            {!!comment.rating && comment.rating > 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                <Rating size="small" value={Number(comment.rating)} precision={0.5} readOnly />
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatTime(comment.timestamp)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Attachments (main comment) */}
      {comment.attachments && comment.attachments.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {comment.attachments.map((a, i) => (
            <img key={i} src={`${(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/+$/,'')}/${String(a).replace(/^\/+/, '')}`} alt={`attachment-${i}`} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
          ))}
        </Box>
      )}

      {/* Comment Content */}
      <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
        {comment.content}
      </Typography>

      {/* Comment Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {/* Reply button - only enabled for unresolved comments */}
        {!comment.isResolved ? (
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </Button>
        ) : (
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            disabled
            sx={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Reply (Resolved)
          </Button>
        )}
        {!comment.isResolved && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={handleResolve}
          >
            Mark as Resolved
          </Button>
        )}
      </Box>

      {/* Reply Form - only show for unresolved comments */}
      <Collapse in={showReplyForm && !comment.isResolved}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              Send Reply
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <Box sx={{ ml: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Replies ({comment.replies.length})
          </Typography>
          {comment.replies.map((reply, index) => (
            <Box key={reply.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }} src={toAbsoluteUploadsUrl(reply.author.avatar)}>
                  {(!reply.author.avatar && reply.author.name) ? reply.author.name.charAt(0) : ''}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {reply.author.name}
                    </Typography>
                    {reply.isAdminResponse && (
                      <Chip
                        label="Admin"
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(reply.timestamp)}
                    </Typography>
                  </Box>
                  {reply.attachments && reply.attachments.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {reply.attachments.map((a, i) => (
                        <img key={i} src={`${(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/+$/,'')}/${String(a).replace(/^\/+/, '')}`} alt={`reply-attachment-${i}`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                      ))}
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {reply.content}
                  </Typography>
                </Box>
              </Box>
              {index < comment.replies.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
