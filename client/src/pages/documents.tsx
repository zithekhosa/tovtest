import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FilePlus, 
  FolderPlus, 
  Search, 
  FileText, 
  Loader2, 
  Download, 
  Share2, 
  MoreHorizontal, 
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Document } from "@shared/schema";

export default function Documents() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch documents from our static endpoint for tenant or regular endpoint for other roles
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: [user?.role === 'tenant' ? "/api/documents/user-static" : "/api/documents/user"],
    enabled: !!user,
  });

  // Filter documents based on search term and active tab
  const filteredDocuments = documents.filter(doc => {
    // Handle different document structures (static API vs database API)
    const docName = doc.name || doc.title || '';
    const docDescription = doc.description || '';
    
    const searchMatch = docName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       docDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return searchMatch;
    // For static data, treat all documents as shared
    if (activeTab === "shared") return searchMatch && (doc.isPublic !== undefined ? doc.isPublic : true);
    if (activeTab === "private") return searchMatch && doc.isPublic === false;
    
    return searchMatch;
  });

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading documents...</p>
        </div>
      </DashLayout>
    );
  }

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>;
      case 'doc':
      case 'docx':
        return <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <DashLayout>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage and store your important documents</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getFileIcon(doc.fileType)}
                        <span className="ml-2">{doc.name || doc.title || doc.fileName || 'Untitled Document'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">{doc.fileType}</TableCell>
                    <TableCell>{doc.fileSize || '--'}</TableCell>
                    <TableCell>{formatDate((doc.createdAt || doc.uploadedAt).toString())}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.isPublic ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doc.isPublic !== undefined ? (doc.isPublic ? 'Shared' : 'Private') : 'Shared'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Document"
                          onClick={() => {
                            // Open document in new tab if it has a path
                            if (doc.path) {
                              window.open(doc.path, '_blank');
                            } else if (doc.fileUrl) {
                              window.open(doc.fileUrl, '_blank');
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Download"
                          onClick={() => {
                            // Handle download based on available fields
                            if (doc.path) {
                              window.open(doc.path, '_blank');
                            } else if (doc.fileUrl) {
                              window.open(doc.fileUrl, '_blank');
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Share">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Rename</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
              <p className="text-gray-500 mt-1 mb-4">
                {searchTerm ? "No documents match your search criteria" : "Get started by uploading your first document"}
              </p>
              {!searchTerm && (
                <Button>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
}
