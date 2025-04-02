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
    
    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        
        // Send authentication message immediately after connection
        if (user?.id) {
          socket.send(JSON.stringify({
            type: 'auth',
            userId: user.id
          }));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Call the onMessage callback if provided
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code);
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection error",
          description: "Failed to connect to real-time updates.",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      setConnected(false);
    }
  }, [user, onMessage, toast]);
  
  // Send message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message, WebSocket is not connected');
      return;
    }
    
    try {
      socketRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      toast({
        title: "Message error",
        description: "Failed to send real-time message.",
        variant: "destructive",
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