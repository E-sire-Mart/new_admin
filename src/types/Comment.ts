export interface CommentUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: CommentUser;
  timestamp: Date;
  isResolved: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'support' | 'feedback' | 'bug' | 'feature';
  replies: CommentReply[];
  attachments?: string[];
  rating?: number;
  storeName?: string;
}

export interface CommentReply {
  id: string;
  content: string;
  author: CommentUser;
  timestamp: Date;
  isAdminResponse: boolean;
  attachments?: string[];
}

export interface CommentThread {
  id: string;
  title: string;
  comments: Comment[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: CommentUser;
  createdAt: Date;
  updatedAt: Date;
}


