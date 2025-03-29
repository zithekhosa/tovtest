import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './use-websocket';

type MessageType = 'maintenance_update' | 'property_notification' | 'chat_message';

interface WebSocketMessage {
  type: MessageType;
  [key: string]: any;
}

interface WebSocketContextType {
  connected: boolean;
  sendMaintenanceUpdate: (requestId: number, message: string, status?: string) => void;
  sendPropertyNotification: (propertyId: number, message: string) => void;
  sendChatMessage: (receiverId: number, content: string) => void;
  messages: WebSocketMessage[];
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  
  // Handle incoming messages
  const handleMessage = useCallback((data: WebSocketMessage) => {
    // Add new message to the messages array
    setMessages(prevMessages => [...prevMessages, data]);
  }, []);
  
  // Connect to WebSocket
  const { connected, sendMessage } = useWebSocket(handleMessage);
  
  // Send a maintenance update
  const sendMaintenanceUpdate = useCallback((requestId: number, message: string, status?: string) => {
    sendMessage({
      type: 'maintenance_update',
      requestId,
      message,
      status,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);
  
  // Send a property notification
  const sendPropertyNotification = useCallback((propertyId: number, message: string) => {
    sendMessage({
      type: 'property_notification',
      propertyId,
      message,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);
  
  // Send a chat message
  const sendChatMessage = useCallback((receiverId: number, content: string) => {
    sendMessage({
      type: 'chat_message',
      receiverId,
      content,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);
  
  // Keep last 50 messages only
  useEffect(() => {
    if (messages.length > 50) {
      setMessages(messages.slice(messages.length - 50));
    }
  }, [messages]);
  
  return (
    <WebSocketContext.Provider
      value={{
        connected,
        sendMaintenanceUpdate,
        sendPropertyNotification,
        sendChatMessage,
        messages
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}