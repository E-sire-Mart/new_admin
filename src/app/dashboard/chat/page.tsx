'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Chip,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Videocam as VideocamIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import socketService from '../../../services/socket-service';
import { getBESiteURL } from '@/lib/get-site-url';
import { error } from 'node:console';

interface Message {
  id: string;
  text: string;
  sender: 'admin' | 'customer';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

type SocketMessage = {
  type?: string;
  message?: {
    id: string;
    content: string;
    senderId: string;
    roomId?: string;
    timestamp: string | number | Date;
    status: 'sent' | 'delivered' | 'read';
  };
  userId?: string;
  user?: { id?: string; _id?: string };
  users?: Array<{ id?: string; _id?: string; userId?: string; isOnline?: boolean }>;
  initiator?: { id: string; name?: string };
  participant?: { id: string; name?: string };
  timestamp?: string | number | Date;
  rooms?: unknown[];
};

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  isOnline: boolean;
  status: 'online' | 'away' | 'offline';
  roles: ('admin' | 'vendor' | 'delivery' | 'user')[];
  role: 'admin' | 'vendor' | 'delivery' | 'user'; // Keep for backward compatibility
  isTyping?: boolean; // Add typing indicator
}

const AdminChatPage: React.FC = () => {
  const { mode } = useTheme();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'vendor' | 'delivery' | 'user'>('all');
  const [loading, setLoading] = useState(true);
  
  // Socket state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Helper function to get user data from localStorage
  const getUserDataFromStorage = () => {
    // Try multiple storage keys for admin authentication
    const possibleKeys = [
      'user-data',           // Admin dashboard stores user data here
      'user',                // Fallback to customer format
      'custom-auth-token'    // Admin dashboard stores token here
    ];
    
    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          
          return parsed;
      } catch (e) {
          throw new Error(`Failed to parse data from localStorage key '${key}':`, e as Error);
        }
      }
    }
    
    // If no structured data found, try to construct from token
    const token = localStorage.getItem('custom-auth-token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return {
          access_token: token,
          userId: tokenPayload.userId,
          _id: tokenPayload.userId,
          id: tokenPayload.userId,
          username: tokenPayload.username,
          isAdmin: tokenPayload.isAdmin
        };
      } catch (e) {
        throw Error('Failed to decode token for user data construction:', e as Error);
      }
    }
    
    return null;
  };

  // Helper function to extract user ID from JWT token
  const extractUserIdFromToken = (token: string) => {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.userId;
    } catch (e) {
      return null;
    }
  };

    // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get current user data and token from localStorage
        const parsedUser = getUserDataFromStorage();
        let token = null;
        
        if (parsedUser) {
          token = parsedUser.access_token;
          if (!token) {
            // Try to get token from custom-auth-token storage
            token = localStorage.getItem('custom-auth-token');
          }
        }

        const API_BASE = getBESiteURL();
        const response = await fetch(`${API_BASE}chat`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const users = data.data || [];

        // Map backend users to chat contacts (no need to filter current user - backend handles it)
        const mappedContacts: ChatContact[] = users.map((user: any) => {
          // Determine roles based on backend fields (users can have multiple roles)
          const roles: ('admin' | 'vendor' | 'delivery' | 'user')[] = [];
          if (user.isAdmin) roles.push('admin');
          if (user.is_owner) roles.push('vendor');
          if (user.isDelivery) roles.push('delivery');
          if (roles.length === 0) roles.push('user');

          // Handle avatar URL
          let avatarUrl = '';
          if (user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null') {
            const FILE_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/,'');
            avatarUrl = `${FILE_BASE}/uploads/${user.avatar}`;
          } else {
            avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.first_name || user.username || 'User')}`;
          }

          return {
            id: user._id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
            avatar: avatarUrl,
            lastMessage: '',
            lastMessageTime: new Date(user.created_at || Date.now()),
                  // Removed unreadCount
            isOnline: Boolean(user.isOnline),
            status: user.isOnline ? 'online' : 'offline',
            roles,
            role: roles[0], // Keep for backward compatibility
          };
        });

        setContacts(mappedContacts);
      } catch (error) {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Initialize socket connection and handlers
  useEffect(() => {
    const parsedUser = getUserDataFromStorage();
    if (!parsedUser) return;

    try {
      let userId = parsedUser._id || parsedUser.id || parsedUser.userId;
      
      // Extract userId from JWT token if not directly available
      let token = parsedUser.access_token;
      if (!token) {
        // Try to get token from custom-auth-token storage
        token = localStorage.getItem('custom-auth-token');
      }
      
      if (!userId && token) {
        userId = extractUserIdFromToken(token);
      }
      
      setCurrentUserId(userId);
      
      if (userId) {
        // Get the correct token for socket connection
        let token = parsedUser.access_token;
        if (!token) {
          // Try to get token from custom-auth-token storage
          token = localStorage.getItem('custom-auth-token');
        }
        
        if (token) {
          // Clear any existing handlers first
          socketService.clearHandlers();
          const connected = socketService.connect(userId, token);
          
          // Wait a moment for connection to establish
          setTimeout(() => {
          }, 1000);
        
          
          const unsubscribeMessage = socketService.onMessage((data) => {
            const evt = data as SocketMessage;
            
          if (evt.type === 'new_message' && evt.message) {
              
              // Process ALL messages to ensure sync works
              let shouldProcessMessage = true;
              let processReason = 'process_all';
              
              
              
              if (shouldProcessMessage) {
                
                // Create message object with proper sender identification
                const newMsg: Message = {
                  id: evt.message.id,
                  text: evt.message.content,
                  sender: evt.message.senderId === currentUserId ? 'admin' : 'customer',
                  timestamp: new Date(evt.message.timestamp),
                  status: evt.message.status
                };
                
            
                setMessages(prev => {
                  
                  // Enhanced duplicate detection
                  const messageExistsById = prev.some(msg => msg.id === newMsg.id);
                  const messageExistsByContentAndTime = prev.some(msg => 
                    msg.text === newMsg.text && 
                    msg.sender === newMsg.sender &&
                    Math.abs(new Date(msg.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 5000 // Within 5 seconds
                  );
                  
                  if (messageExistsById) {
                    return prev;
                  }
                  
                  if (messageExistsByContentAndTime) {
                    return prev;
                  }
                  
                  // Check if this is a message we just sent (by content and sender)
                  const isOwnMessage = newMsg.sender === 'admin' && 
                    prev.some(msg => msg.text === newMsg.text && msg.sender === 'admin' && msg.id.startsWith('local_'));
                  
                  if (isOwnMessage) {
                    // Replace the local message with the server message (to get proper ID and status)
                    const updated = prev.map(msg => 
                      (msg.text === newMsg.text && msg.sender === 'admin' && msg.id.startsWith('local_')) 
                        ? newMsg 
                        : msg
                    );
                    return updated;
                  } else {
                    // This is a message from someone else, add it normally
                    const updated = [...prev, newMsg];
                    return updated;
                  }
                });
            
            // Scroll to bottom when new message arrives
            setTimeout(() => scrollToBottom(), 100);
              } else {
                Error('❌ Message not processed - shouldProcessMessage is false');
              }
              
              // Update contact's last message regardless of room (for contact list updates)
              // Update for messages from others
              const m = evt.message;
              if (!m) {
                return;
              }
              if (m.senderId !== currentUserId) {
                setContacts(prevContacts => 
                  prevContacts.map(contact => {
                    if (contact.id === m.senderId) {
                      return {
                        ...contact,
                        lastMessage: m.content,
                        lastMessageTime: new Date(m.timestamp)
                        // Removed unreadCount increment
                      };
                    }
                    return contact;
                  })
                );
              } else {
                // Update for messages sent by current user (admin)
                if (selectedContact) {
                  setContacts(prevContacts => 
                    prevContacts.map(contact => {
                      if (contact.id === selectedContact.id) {
                        return {
                          ...contact,
                          lastMessage: m.content,
                          lastMessageTime: new Date(m.timestamp)
                        };
                      }
                      return contact;
                    })
                  );
                }
              }
            } else if (evt.type === 'typing') {
              // Handle typing indicator
              if (evt.userId !== userId) {
                setContacts(prevContacts => 
                  prevContacts.map(contact => {
                    if (contact.id === evt.userId) {
                      return {
                        ...contact,
                        isTyping: Boolean((evt as { isTyping?: boolean }).isTyping)
                      };
                    }
                    return contact;
                  })
                );
              }
            } else if (evt.type === 'user_online') {
              // Update contact online status
              setContacts(prevContacts => 
                prevContacts.map(contact => {
                  if (contact.id === (evt.user?.id || (evt.user as { _id?: string })?._id)) {
                    return {
                      ...contact,
                      isOnline: true,
                      status: 'online'
                    };
                  }
                  return contact;
                })
              );
            } else if (evt.type === 'user_offline') {
              // Update contact online status
              setContacts(prevContacts => 
                prevContacts.map(contact => {
                  if (contact.id === (evt.user?.id || (evt.user as { _id?: string })?._id)) {
                    return {
                      ...contact,
                      isOnline: false,
                      status: 'offline'
                    };
                  }
                  return contact;
                })
              );
            } else if (evt.type === 'room_available') {
              
              // This notification means a new chat room has been created
              // We can use this to update contact information or prepare for future chat
              if (evt.initiator && evt.participant) {
                
                // Update contact information if needed
                setContacts(prevContacts => {
                  return prevContacts.map(contact => {
                    // Update last message time for the contact involved in the new room
                    const initiatorId = evt.initiator?.id;
                    const participantId = evt.participant?.id;
                    if ((initiatorId && contact.id === initiatorId) || (participantId && contact.id === participantId)) {
                      return {
                        ...contact,
                        lastMessageTime: new Date(evt.timestamp || Date.now())
                      };
                    }
                    return contact;
                  });
                });
              }
            } else if (evt.type === 'available_rooms_list') {
              
              // This can be used to populate existing chat rooms
              // For now, we'll just log it for debugging
              if (Array.isArray(evt.rooms) && evt.rooms.length > 0) {
              }
            } else if (evt.type === 'online_users_list') {
              // Update contacts with online status
              setContacts(prevContacts => 
                prevContacts.map(contact => {
                  const onlineUser = Array.isArray(evt.users)
                    ? evt.users.find((u) => u.id === contact.id)
                    : undefined;
                  if (onlineUser) {
                    return {
                      ...contact,
                      isOnline: true,
                      status: 'online'
                    };
                  }
                  return contact;
                })
              );
            }
        });

        // Set up socket status handlers for online/offline updates
        const unsubscribeStatus = socketService.onStatusChange((data) => {
          const evt = data as SocketMessage;

          if (evt.type === 'status_update' && Array.isArray(evt.users)) {

            updateContactsOnlineStatus(evt.users as any[]);

          } else if (evt.type === 'user_online') {

            setContacts(prevContacts => 
              prevContacts.map(contact => {
                if (contact.id === (evt.user?.id || (evt.user as { _id?: string })?._id)) {
                  return {
                    ...contact,
                    isOnline: true,
                    status: 'online'
                  };
                }
                return contact;
              })
            );
          } else if (evt.type === 'user_offline') {
            setContacts(prevContacts => 
              prevContacts.map(contact => {
                if (contact.id === (evt.user?.id || (evt.user as { _id?: string })?._id)) {
                  return {
                    ...contact,
                    isOnline: false,
                    status: 'offline'
                  };
                }
                return contact;
              })
            );
          }
        });
        
        // Mark current user as online

        const API_BASE = getBESiteURL();
        fetch(`${API_BASE}chat/online`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline: true })
        }).then(response => {
          if (response.ok) {
            alert('✅ Successfully marked user as online');
          } else {
            error('⚠️ Failed to mark user as online, status:', response.status);
          }
        }).catch(error => {
          throw new Error('❌ Failed to mark user as online:', error);
        });
          
          // Request available rooms for synchronization
          setTimeout(() => {
            if (socketService.isConnected()) {
              socketService.requestAvailableRooms();
            }
          }, 1500);
          
          // Cleanup function for all handlers
        return () => {
          unsubscribeMessage();
          unsubscribeStatus();
        };
        } else {
          error('No valid token found for socket connection');
        }
      } else {
        error('No valid user ID found for socket connection');
      }
    } catch (e) {
      throw new Error('Failed to initialize socket connection');
    }
  }, []);

  // Chat history loading state
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);

  // Cleanup and offline status when component unmounts
  useEffect(() => {
    return () => {
      socketService.disconnect();
      
      // Mark current user as offline when component unmounts
      const parsedUser = getUserDataFromStorage();
      if (parsedUser) {
        // Get the correct token for API calls
        let token = parsedUser.access_token;
        if (!token) {
          // Try to get token from custom-auth-token storage
          token = localStorage.getItem('custom-auth-token');
        }
        
        if (token) {
        try {
          const API_BASE = getBESiteURL();
          fetch(`${API_BASE}chat/online`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isOnline: false })
          }).catch(error => {
            throw error('Failed to mark user as offline:', error);
          });
        } catch (e) {
          throw new Error('Failed to mark user as offline');
          }
        }
      }
    };
  }, []);

  // Periodically refresh online status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const API_BASE = getBESiteURL();
        const response = await fetch(`${API_BASE}chat`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const users = data.data || [];
          updateContactsOnlineStatus(users);
        }
      } catch (error) {
       throw new Error('Failed to refresh online status:', error as Error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateContactsOnlineStatus = (users: any[]) => {

    setContacts(prevContacts => 
      prevContacts.map(contact => {
        const updatedUser = users.find((u: any) => 
          u._id === contact.id || 
          u.id === contact.id || 
          u.userId === contact.id
        );
        if (updatedUser) {

          return {
            ...contact,
            isOnline: !!updatedUser.isOnline,
            status: updatedUser.isOnline ? 'online' : 'offline'
          };
        }
        return contact;
      })
    );
  };



  // Message handlers are now set up globally in the socket connection useEffect

  useEffect(() => {
    if (selectedContact) {
      // Load chat history from backend
      if (currentUserId && selectedContact.id) {
        const roomId = [currentUserId, selectedContact.id].sort().join('_');
        setCurrentRoomId(roomId);
        loadChatHistory(roomId);
        socketService.joinChatRoom(currentUserId, selectedContact.id);
        socketService.markAsRead(currentUserId, selectedContact.id, roomId);
      }
      
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedContact, currentUserId]);

  const loadChatHistory = async (roomId: string) => {
    if (!roomId) return;
    
    setChatHistoryLoading(true);
    try {
      const parsedUser = getUserDataFromStorage();
      if (parsedUser) {
        // Get the correct token for API calls
        let token = parsedUser.access_token;
        if (!token) {
          // Try to get token from custom-auth-token storage
          token = localStorage.getItem('custom-auth-token');

        }
        
        if (token) {


        const API_BASE = getBESiteURL();
        const response = await fetch(`${API_BASE}chat/rooms/${roomId}/messages`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
        });
          
        
        if (response.ok) {
          const data = await response.json();
            
            if (data.success && data.data && data.data.messages) {
            const formattedMessages: Message[] = data.data.messages.map((msg: any) => ({
              id: msg.id || msg._id,
              text: msg.content,
              sender: msg.senderId === currentUserId ? 'admin' : 'customer',
              timestamp: new Date(msg.timestamp || msg.createdAt),
              status: msg.status || 'sent'
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([]);
          }
        } else {
            const errorData = await response.text();
            error('Failed to load chat history. Status:', response.status, 'Response:', errorData);
            
            if (response.status === 401) {
              error('Authentication failed. Token might be expired or invalid.');
              // Try to refresh token or redirect to login
            } else if (response.status === 403) {
              error('Access denied to this chat room. User might not be a participant.');
            }
            
          setMessages([]);
        }
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSelect = async (contact: ChatContact) => {
    
    setSelectedContact(contact);
    const roomId = [currentUserId, contact.id].sort().join('_');
    setCurrentRoomId(roomId);
    
    // Join chat room via socket
    if (currentUserId) {
      socketService.joinChatRoom(currentUserId, contact.id, contact.name);
    }
    
    // Load chat history from backend
    await loadChatHistory(roomId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !currentUserId || !currentRoomId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    // Check if we already have a local message with this content to prevent duplicates
    setMessages(prev => {
      const hasLocalMessage = prev.some(msg => 
        msg.text === messageText && 
        msg.sender === 'admin' && 
        msg.id.startsWith('local_') &&
        Date.now() - new Date(msg.timestamp).getTime() < 5000 // Within 5 seconds
      );
      
      if (hasLocalMessage) {
        return prev;
      }

      // Create local message for immediate display
      const localMessageId = `local_${Date.now()}`;
      const localMessage: Message = {
        id: localMessageId,
        text: messageText,
        sender: 'admin',
        timestamp: new Date(),
        status: 'sent'
      };

      return [...prev, localMessage];
    });
    
    setTimeout(() => scrollToBottom(), 100);

    // Send message via socket

    socketService.sendMessage(currentUserId, selectedContact.id, messageText, currentRoomId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (currentRoomId && currentUserId) {
      socketService.sendTyping(currentRoomId, currentUserId, true);
    }
  };

  const handleTypingStop = () => {
    if (currentRoomId && currentUserId) {
      socketService.sendTyping(currentRoomId, currentUserId, false);
    }
  };

  // Debounced typing stop
  useEffect(() => {
    if (newMessage.trim()) {
      handleTypingStart();
      const timer = setTimeout(() => {
        handleTypingStop();
      }, 1000); // Stop typing indicator after 1 second of no input
      
      return () => clearTimeout(timer);
    } else {
      handleTypingStop();
    }
  }, [newMessage, currentRoomId, currentUserId]);

  // Monitor messages state changes
  useEffect(() => {

  }, [messages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CircleIcon sx={{ fontSize: 12, color: 'success.main' }} />;
      case 'away':
        return <CircleIcon sx={{ fontSize: 12, color: 'warning.main' }} />;
      case 'offline':
        return <CircleIcon sx={{ fontSize: 12, color: 'text.disabled' }} />;
      default:
        return null;
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckIcon sx={{ fontSize: 14, color: 'text.disabled' }} />;
      case 'delivered':
        return <CheckIcon sx={{ fontSize: 14, color: 'info.main' }} />;
      case 'read':
        return <CheckCircleIcon sx={{ fontSize: 14, color: 'info.main' }} />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'vendor':
        return 'success';
      case 'delivery':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const isDark = mode === 'dark';

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼'
  ];

  // Function to detect if a message contains only emojis
  const isEmojiOnly = (text: string): boolean => {
    // Remove whitespace and check if the entire string is emoji
    const cleanText = text.trim();
    if (cleanText.length === 0) return false;
    
    // Simple emoji detection using our common emojis list
    // Check if the text contains only characters from our emoji list
    const emojiChars = cleanText.split('').filter(char => commonEmojis.includes(char));
    const nonEmojiChars = cleanText.split('').filter(char => !commonEmojis.includes(char) && char.trim() !== '');
    
    // If all characters are emojis and no regular text, it's emoji-only
    return emojiChars.length > 0 && nonEmojiChars.length === 0;
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.emoji-picker') && !target.closest('.emoji-button')) {
        setEmojiPickerOpen(false);
      }
    };

    if (emojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emojiPickerOpen]);

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Admin Chat
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={socketService.isConnected() ? '🟢 Connected' : '🔴 Disconnected'} 
            color={socketService.isConnected() ? 'success' : 'error'}
            size="small"
          />
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              
              // Test: Add a message directly to see if rendering works
              if (selectedContact) {
                const testMessage: Message = {
                  id: `test_${Date.now()}`,
                  text: `Test message ${Date.now()}`,
                  sender: 'customer',
                  timestamp: new Date(),
                  status: 'sent'
                };
                setMessages(prev => [...prev, testMessage]);
              }
            }}
          >
            Debug
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              if (selectedContact && currentUserId && currentRoomId) {
                
                // Send a test message
                socketService.sendMessage(currentUserId, selectedContact.id, `Test sync message ${Date.now()}`, currentRoomId);
              } else {
                throw new Error('❌ Cannot test: missing contact, user ID, or room ID');
              }
            }}
          >
            Test Sync
          </Button>
        </Box>
      </Box>
      

      

      
      <Paper 
        elevation={isDark ? 8 : 2}
        sx={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {/* Contacts Sidebar */}
        <Box sx={{ 
          width: 320, 
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper'
        }}>
          {/* Contacts Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            backgroundColor: 'background.paper'
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
              Conversations
            </Typography>
            
            {/* Role Filter */}
            <TextField
              select
              size="small"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              sx={{ width: '100%', mb: 1 }}
              label="Filter by Role"
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
              <MenuItem value="vendor">Vendors</MenuItem>
              <MenuItem value="delivery">Delivery Workers</MenuItem>
              <MenuItem value="user">General Users</MenuItem>
            </TextField>
            
            <TextField
              size="small"
              placeholder="Search contacts..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '100%' }}
            />
          </Box>
          
          {/* Contacts List */}
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography>Loading users...</Typography>
              </Box>
            ) : (
              contacts
                .filter((contact) => roleFilter === 'all' || contact.roles.includes(roleFilter))
                .map((contact) => (
              <ListItemButton
                key={contact.id}
                selected={selectedContact?.id === contact.id}
                onClick={() => handleContactSelect(contact)}
                sx={{
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getStatusIcon(contact.status)}
                  >
                    <Avatar src={contact.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        {contact.name}
                      </Typography>
                      {contact.roles?.map((role, index) => (
                      <Chip 
                          key={index}
                          label={
                            role === 'admin' ? '👑 Admin' :
                            role === 'vendor' ? '🏪 Shop Admin' :
                            role === 'delivery' ? '🚚 Delivery' :
                            '👤 User'
                          }
                        size="small" 
                          color={getRoleColor(role) as any}
                        variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                      />
                      ))}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" noWrap>
                        {contact.lastMessage}
      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {contact.lastMessageTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
      </Typography>
    </Box>
                  }
                />
                {/* Removed unread count badge */}
              </ListItemButton>
            ))
            )}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getStatusIcon(selectedContact.status)}
                  >
                    <Avatar src={selectedContact.avatar} />
                  </Badge>
                  <Box>
                    <Typography variant="h6" color="text.primary">
                      {selectedContact.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedContact.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                      {selectedContact.isTyping && (
                        <Typography variant="body2" color="info.main" sx={{ fontStyle: 'italic' }}>
                          typing...
                        </Typography>
                      )}
                      {selectedContact.roles?.map((role, index) => (
                      <Chip 
                          key={index}
                          label={
                            role === 'admin' ? '👑 Admin' :
                            role === 'vendor' ? '🏪 Shop Admin' :
                            role === 'delivery' ? '🚚 Delivery' :
                            '👤 User'
                          }
                        size="small" 
                          color={getRoleColor(role) as any}
                        variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                      />
                      ))}
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Voice Call">
                    <IconButton size="small">
                      <PhoneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Video Call">
                    <IconButton size="small">
                      <VideocamIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More Options">
                    <IconButton 
                      size="small"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                backgroundColor: 'background.default',
              }}>
                {chatHistoryLoading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '200px',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body1">Loading chat history...</Typography>
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '200px',
                    color: 'text.secondary',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>💬</Typography>
                    <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                      No Chat History
                    </Typography>
                    <Typography variant="body2">
                      Start a conversation with {selectedContact?.name} by sending your first message!
                    </Typography>
                  </Box>
                ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                        mb: 0.5,
                        px: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {message.sender === 'customer' && (
                          <Avatar 
                            src={selectedContact.avatar} 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              mb: 0.5,
                              border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                            }}
                          />
                        )}
                        
                        {isEmojiOnly(message.text) ? (
                          // Emoji-only message - no background, larger size
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              p: 1,
                              fontSize: '3rem', // 3x larger than normal text
                              lineHeight: 1,
                              userSelect: 'none',
                              cursor: 'default'
                            }}
                          >
                            {message.text}
                          </Box>
                        ) : (
                          // Regular text message - with background
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: message.sender === 'admin' 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              backgroundColor: message.sender === 'admin' 
                                ? 'primary.main' 
                                : isDark 
                                  ? 'rgba(255,255,255,0.05)' 
                                  : 'rgba(0,0,0,0.03)',
                              color: message.sender === 'admin' 
                                ? 'primary.contrastText' 
                                : 'text.primary',
                              border: message.sender === 'customer' 
                                ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` 
                                : 'none',
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                              boxShadow: message.sender === 'admin'
                                ? '0 2px 8px rgba(0,0,0,0.15)'
                                : '0 1px 3px rgba(0,0,0,0.1)',
                              '&:hover': {
                                boxShadow: message.sender === 'admin'
                                  ? '0 4px 12px rgba(0,0,0,0.2)'
                                  : '0 2px 6px rgba(0,0,0,0.15)',
                                transition: 'box-shadow 0.2s ease-in-out'
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                lineHeight: 1.4,
                                fontSize: '0.95rem',
                                fontWeight: message.sender === 'admin' ? 500 : 400
                              }}
                            >
                              {message.text}
                            </Typography>
                          </Paper>
                        )}
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5, 
                          mt: 0.5,
                          px: 0.5,
                          justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start'
                        }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.75rem',
                              opacity: 0.7
                            }}
                          >
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                          {message.sender === 'admin' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                              {getMessageStatusIcon(message.status)}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                  
                  <div ref={messagesEndRef} />
                </Box>
                  )}
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: 'background.paper',
                position: 'relative'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1.5, 
                  alignItems: 'flex-end',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 3,
                  p: 1.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  minHeight: 56,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}>
                  <TextField
                    multiline
                    maxRows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        writingMode: 'horizontal-tb !important',
                        textOrientation: 'mixed',
                        direction: 'ltr',
                        '&::placeholder': {
                          opacity: 1,
                          color: 'text.secondary',
                          writingMode: 'horizontal-tb !important',
                          textOrientation: 'mixed',
                          direction: 'ltr',
                        },
                      },
                      '& textarea': {
                        writingMode: 'horizontal-tb !important',
                        textOrientation: 'mixed',
                        direction: 'ltr',
                      },
                      '& .MuiInputBase-inputMultiline': {
                        writingMode: 'horizontal-tb !important',
                        textOrientation: 'mixed',
                        direction: 'ltr',
                      }
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Attach File">
                      <IconButton size="small">
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Emoji">
                      <IconButton 
                        size="small"
                        className="emoji-button"
                        onClick={() => {
                          setEmojiPickerOpen(!emojiPickerOpen);
                        }}
                      >
                        <EmojiIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        flexShrink: 0,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                          color: 'action.disabled',
                          boxShadow: 'none',
                          transform: 'none'
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Emoji Picker */}
                {emojiPickerOpen && (
                  <Box
                    className="emoji-picker"
                    sx={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      mb: 1,
                      backgroundColor: 'background.paper',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: 2,
                      p: 1,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxWidth: 300,
                      maxHeight: 200,
                      overflow: 'auto',
                      display: 'block'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: 0.5
                      }}
                    >
                      {commonEmojis.map((emoji, index) => (
                        <IconButton
                          key={index}
                          size="small"
                          onClick={() => handleEmojiClick(emoji)}
                          sx={{
                            fontSize: '1.2rem',
                            minWidth: 32,
                            height: 32,
                            '&:hover': {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          {emoji}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'background.default',
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2, color: 'text.secondary' }}>
                  💬
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose from your contacts to start chatting
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }
        }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SearchIcon sx={{ mr: 1 }} />
          Search Messages
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <PhoneIcon sx={{ mr: 1 }} />
          Call Contact
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <VideocamIcon sx={{ mr: 1 }} />
          Video Call
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Block Contact
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminChatPage;

