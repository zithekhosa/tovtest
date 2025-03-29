import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type MessageType = 'maintenance_update' | 'property_notification' | 'chat_message';

interface WebSocketMessage {
  type: MessageType;
  [key: string]: any;
}

interface UseWebSocketReturn {
  connected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
}

export function useWebSocket(onMessage?: (data: any) => void): UseWebSocketReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id) return;
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with user ID
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Authentication confirmation
        if (data.type === 'auth_success') {
          setConnected(true);
        }
        
        // Handle other message types
        if (onMessage && data.type !== 'auth_success') {
          onMessage(data);
          
          // Show toast notification for certain message types
          if (data.type === 'maintenance_update') {
            toast({
              title: 'Maintenance Update',
              description: data.message || 'A maintenance request has been updated',
              variant: 'default'
            });
          } else if (data.type === 'property_notification') {
            toast({
              title: 'Property Update',
              description: data.message || 'There is an update for your property',
              variant: 'default'
            });
          } else if (data.type === 'chat_message') {
            toast({
              title: 'New Message',
              description: 'You have received a new message',
              variant: 'default'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connect();
      }, 5000);
    };
  }, [user?.id, onMessage, toast]);
  
  // Send message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      toast({
        title: 'Connection Error',
        description: 'Unable to send message. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [toast]);
  
  // Connect on component mount or when user changes
  useEffect(() => {
    if (user?.id) {
      connect();
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id, connect]);
  
  return { connected, sendMessage };
}