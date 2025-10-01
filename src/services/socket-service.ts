// Socket service for real-time chat functionality
class SocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private messageHandlers: Array<(data: Record<string, unknown>) => void> = [];
  private statusHandlers: Array<(data: Record<string, unknown>) => void> = [];
  private userId: string | null = null;
  private token: string | null = null;

  connect(userId: string, token: string): boolean {
    try {
      // Prevent multiple connections
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // eslint-disable-next-line no-console
        console.log('Socket already connected, skipping new connection');
        return true;
      }
      
      this.userId = userId;
      this.token = token;
      
      // Connect to real WebSocket server
      const wsUrl = `ws://localhost:3003?token=${token}`;
      
      // Close existing connection if any
      if (this.socket) {
        this.socket.close();
      }
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
      };
      
      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data as unknown as string) as unknown;
          if (parsed && typeof parsed === 'object') {
            this.handleIncomingMessage(parsed as Record<string, unknown>);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = () => {
        this.handleReconnection();
      };
      
      this.socket.onerror = (error) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket error:', error);
      };
      
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect to socket:', error);
      return false;
    }
  }

  private handleIncomingMessage(data: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.log('Received WebSocket message:', data);
    
    const messageType = typeof (data as { type?: unknown }).type === 'string'
      ? ((data as { type?: string }).type as string)
      : 'unknown';

    switch (messageType) {
      case 'connection':
        // eslint-disable-next-line no-console
        console.log('Connection confirmed:', data);
        break;
      case 'room_joined':
        // eslint-disable-next-line no-console
        console.log('Joined room:', data);
        break;
      case 'new_message':
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'user_joined':
        // eslint-disable-next-line no-console
        console.log('User joined room:', data);
        break;
      case 'typing':
        // eslint-disable-next-line no-console
        console.log('Typing indicator:', data);
        break;
      case 'messages_read':
        // eslint-disable-next-line no-console
        console.log('Messages marked as read:', data);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error('WebSocket error:', data.message);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown message type:', data.type);
    }
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId && this.token) {
      this.reconnectAttempts++;
      // eslint-disable-next-line no-console
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.userId!, this.token!);
      }, this.reconnectInterval);
    } else {
      // eslint-disable-next-line no-console
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    // Clear all handlers to prevent accumulation
    this.messageHandlers = [];
    this.statusHandlers = [];
    // eslint-disable-next-line no-console
    console.log('Socket service disconnected');
  }

  // Clear all handlers without disconnecting
  clearHandlers(): void {
    this.messageHandlers = [];
    this.statusHandlers = [];
    // eslint-disable-next-line no-console
    console.log('Socket handlers cleared');
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  onMessage(handler: (data: Record<string, unknown>) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onStatusChange(handler: (data: Record<string, unknown>) => void): () => void {
    this.statusHandlers.push(handler);
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  sendMessage(senderId: string, receiverId: string, message: string, roomId: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'send_message',
        roomId,
        content: message,
        messageType: 'text'
      };
      
      this.socket.send(JSON.stringify(messageData));
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected');
    }
  }

  joinChatRoom(userId: string, contactId: string, contactName?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const roomId = [userId, contactId].sort().join('_');
      const messageData = {
        type: 'join_room',
        roomId,
        contactId,
        contactName: contactName || 'Contact'
      };
      
      this.socket.send(JSON.stringify(messageData));
      // eslint-disable-next-line no-console
      console.log('Joining chat room via WebSocket:', messageData);
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected');
    }
  }

  markAsRead(userId: string, contactId: string, roomId: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'mark_read',
        roomId,
        messageIds: [] // This should be passed from the component
      };
      
      this.socket.send(JSON.stringify(messageData));
      // eslint-disable-next-line no-console
      console.log('Marking messages as read via WebSocket:', messageData);
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected');
    }
  }

  sendTyping(roomId: string, userId: string, isTyping: boolean): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'typing',
        roomId,
        isTyping
      };
      
      this.socket.send(JSON.stringify(messageData));
      // eslint-disable-next-line no-console
      console.log('Typing indicator sent via WebSocket:', messageData);
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected');
    }
  }

  requestAvailableRooms(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'request_available_rooms'
      };
      
      // eslint-disable-next-line no-console
      console.log('Requesting available rooms via WebSocket');
      this.socket.send(JSON.stringify(messageData));
      // eslint-disable-next-line no-console
      console.log('Available rooms request sent successfully');
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected, cannot request available rooms');
    }
  }
}

const socketService = new SocketService();
export default socketService;


