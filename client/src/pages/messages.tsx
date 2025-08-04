import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Search, MoreVertical, Phone, Video, Info } from "lucide-react";
import { User, Message } from "@shared/schema";

export default function Messages() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch contacts for the chat list (relationship-based)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/contacts"],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts");
      return response;
    }
  });

  // Fetch messages for the selected user
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/messages/conversation/${selectedUser!.id}`);
      return response;
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUser?.id] });
      setMessage("");
    },
  });

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: message,
    });
  };

  if (!user) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-heading-3 text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">You must be logged in to view messages.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Communicate with your contacts</p>
      </header>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-220px)] md:h-[calc(100vh-240px)]">
        <div className="flex h-full">
          {/* Contacts sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="search" 
                  placeholder="Search contacts..." 
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    {user?.role === 'tenant' 
                      ? "No landlord contacts found. You need an active lease to communicate with your landlord."
                      : user?.role === 'landlord'
                      ? "No tenant contacts found. You'll see tenants here once they have active leases on your properties."
                      : "No contacts available."
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map((userItem) => (
                    <div 
                      key={userItem.id} 
                      className={`flex items-center p-4 cursor-pointer btn-premium-ghost transition-colors ${
                        selectedUser?.id === userItem.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedUser(userItem)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {getUserInitials(`${(userItem as any).firstName || ''} ${(userItem as any).lastName || ''}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-900 truncate">{(userItem as any).firstName || ''} {(userItem as any).lastName || ''}</p>
                          <span className="text-caption">12:34 PM</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">Latest message preview...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="hidden md:flex flex-col flex-1">
            {selectedUser ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getUserInitials(`${(selectedUser as any).firstName || ''} ${(selectedUser as any).lastName || ''}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{(selectedUser as any).firstName || ''} {(selectedUser as any).lastName || ''}</p>
                      <p className="text-caption capitalize">{selectedUser.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isCurrentUser = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] ${isCurrentUser ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-4 py-2`}>
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'} text-right`}>
                                {formatMessageTime(msg.sentAt.toString())}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !message.trim()}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-md">
                  {user?.role === 'tenant' 
                    ? "Select your landlord from the contacts to start chatting about your property."
                    : user?.role === 'landlord'
                    ? "Select a tenant from your contacts to communicate about property matters."
                    : "Select a contact from the list to start chatting."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
