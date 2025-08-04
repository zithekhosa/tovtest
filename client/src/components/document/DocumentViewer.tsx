import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Printer, 
  Download, 
  Share2, 
  Edit, 
  FileSignature,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineProvider, Timeline, TimelineItem } from "../ui/timeline";

// Types for document metadata
export type DocumentVersion = {
  id: number;
  versionNumber: string;
  date: Date;
  changedBy: string;
  comment: string;
  url: string;
};

export type DocumentApproval = {
  id: number;
  approverName: string;
  approverRole: string;
  status: "pending" | "approved" | "rejected";
  date?: Date;
  comment?: string;
};

export type DocumentClause = {
  id: number;
  number: string;
  title: string;
  content: string;
  isHighlighted?: boolean;
};

export type DocumentMetadata = {
  id: number;
  title: string;
  documentType: string;
  createdBy: string;
  createdDate: Date;
  status: "draft" | "pending" | "active" | "expired" | "terminated";
  expiryDate?: Date;
  parties: {
    name: string;
    role: string;
  }[];
  versions: DocumentVersion[];
  approvals: DocumentApproval[];
  summary?: string;
  clauses: DocumentClause[];
};

// Interface for component props
interface DocumentViewerProps {
  document: DocumentMetadata;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onSign?: () => void;
}

export function DocumentViewer({
  document,
  onPrint,
  onDownload,
  onShare,
  onEdit,
  onSign
}: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("document");
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-warning text-warning-foreground border-warning">Pending</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-success text-success-foreground border-success/30">Active</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-destructive text-destructive-foreground border-destructive/30">Expired</Badge>;
      case "terminated":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get approval status icon
  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-success-foreground" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive-foreground" />;
      default:
        return <AlertCircle className="h-5 w-5 text-warning-foreground" />;
    }
  };
  
  // Open document viewer
  const openDocument = () => {
    setIsOpen(true);
  };
  
  return (
    <>
      <Button variant="outline" size="sm" onClick={openDocument}>
        <FileText className="mr-2 h-4 w-4" />
        View Document
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {document.title}
              {getStatusBadge(document.status)}
            </DialogTitle>
            <DialogDescription>
              {document.documentType} - Created on {formatDate(document.createdDate)}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="pt-4">
              <div className="flex justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Created by</h3>
                  <p className="text-sm">{document.createdBy}</p>
                </div>
                <div className="space-y-1 text-right">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="text-sm inline-flex">
                    {getStatusBadge(document.status)}
                  </p>
                </div>
              </div>
              
              {document.summary && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-1">Summary</h3>
                  <p className="text-sm text-muted-foreground">{document.summary}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Parties</h3>
                <div className="grid grid-cols-2 gap-4">
                  {document.parties.map((party, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <User className="h-4 w-4 mt-0.5 text-primary/70" />
                      <div>
                        <p className="text-sm font-medium">{party.name}</p>
                        <p className="text-xs text-muted-foreground">{party.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex mb-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(document.createdDate)}</p>
                  </div>
                </div>
                
                {document.expiryDate && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p className="text-sm">{formatDate(document.expiryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-base font-medium mb-2">Document Content</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-6">
                  {document.clauses.map((clause) => (
                    <div key={clause.id} className={cn(
                      "space-y-1",
                      clause.isHighlighted && "bg-warning/10 dark:bg-warning/10 p-2 rounded"
                    )}>
                      <h4 className="text-sm font-bold">{clause.number}. {clause.title}</h4>
                      <p className="text-sm whitespace-pre-wrap">{clause.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between mt-4">
                <div className="flex space-x-2">
                  {onPrint && (
                    <Button variant="outline" size="sm" onClick={onPrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  )}
                  {onDownload && (
                    <Button variant="outline" size="sm" onClick={onDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  {onShare && (
                    <Button variant="outline" size="sm" onClick={onShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {onSign && (
                    <Button variant="default" size="sm" onClick={onSign}>
                      <FileSignature className="mr-2 h-4 w-4" />
                      Sign
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <h3 className="text-base font-medium mb-2">Document Timeline</h3>
              
              <TimelineProvider>
                <Timeline className="px-4">
                  {document.versions.map((version, index) => (
                    <TimelineItem 
                      key={version.id}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Version {version.versionNumber}</p>
                          <p className="text-sm text-muted-foreground">{version.comment}</p>
                        </div>
                      </div>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">Version {version.versionNumber}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(version.date)}
                            </span>
                          </div>
                          <p className="text-sm">{version.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Changes by: {version.changedBy}
                          </p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="px-0 py-0 h-auto text-xs mt-2"
                            onClick={() => window.open(version.url, "_blank")}
                          >
                            View this version
                          </Button>
                        </CardContent>
                      </Card>
                    </TimelineItem>
                  ))}
                </Timeline>
              </TimelineProvider>
            </TabsContent>
            
            <TabsContent value="approvals" className="pt-4">
              <h3 className="text-base font-medium mb-2">Approval Status</h3>
              <div className="space-y-4">
                {document.approvals.map((approval) => (
                  <Card key={approval.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium">{approval.approverName}</h4>
                          <p className="text-xs text-muted-foreground">{approval.approverRole}</p>
                          {approval.comment && (
                            <p className="text-sm mt-1">{approval.comment}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            {getApprovalStatusIcon(approval.status)}
                            <span className="ml-2 text-sm capitalize">{approval.status}</span>
                          </div>
                          {approval.date && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {formatDate(approval.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}