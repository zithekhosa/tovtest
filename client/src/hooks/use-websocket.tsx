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

function useWebSocket(onMessage?: (data: any) => void): UseWebSocketReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 3; // Reduced from 5
  const baseReconnectDelay = 2000; // Increased from 1000
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id) {
      console.log('No user ID available, skipping WebSocket connection');
      return;
    }
    
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress, skipping');
      return;
    }
    
    // Don't reconnect if already connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping');
      return;
    }
    
    isConnectingRef.current = true;
    
    // Close existing connection if any
    if (socketRef.current) {
      console.log('Closing existing WebSocket connection');
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      // Create WebSocket connection - use the same host as the current page
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host; // This includes port if present
      const wsUrl = `${protocol}//${host}/ws/notifications`;
      
      // Validate WebSocket URL
      if (!wsUrl || wsUrl.includes('undefined') || wsUrl.includes('null')) {
        console.error('Invalid WebSocket URL:', wsUrl);
        throw new Error('Invalid WebSocket URL');
      }
      
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        isConnectingRef.current = false;
        
        // Send authentication message immediately after connection
        if (user?.id) {
          try {
            socket.send(JSON.stringify({
              type: 'auth',
              userId: user.id
            }));
          } catch (error) {
            console.error('Error sending auth message:', error);
          }
        }
      };
      
      socket.onmessage = (event) => {
        try {
          if (!event.data) {
            console.warn('Received empty WebSocket message');
            return;
          }
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
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code);
        setConnected(false);
        isConnectingRef.current = false;
        
        // Only attempt to reconnect for specific close codes and if we haven't exceeded max attempts
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
          console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached, stopping reconnection attempts');
          toast({
            title: "Connection lost",
            description: "Unable to reconnect to real-time updates. Please refresh the page.",
            variant: "destructive",
          });
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      isConnectingRef.current = false;
      toast({
        title: "Connection Error",
        description: "Failed to establish real-time connection",
        variant: "destructive",
      });
    }
  }, [user?.id, onMessage, toast]);
  
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
    // Temporarily disable WebSocket to fix connection errors
    console.log('WebSocket temporarily disabled for debugging');
    return;
    
    if (user?.id) {
      console.log('User authenticated, attempting WebSocket connection for user:', user.id);
      connect();
    } else {
      console.log('No user authenticated, skipping WebSocket connection');
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      isConnectingRef.current = false;
    };
  }, [user?.id, connect]);
  
  return { connected, sendMessage };
}

export default useWebSocket;