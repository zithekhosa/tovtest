import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentViewer, DocumentMetadata } from "@/components/document/DocumentViewer";
import { LeaseTemplateForm } from "@/components/document/LeaseTemplateForm";
import { 
  FileText, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Filter, 
  File, 
  FileBadge, 
  FileCheck, 
  FileWarning,
  Download,
  Printer,
  Share2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Sample lease document for demonstration purposes
const sampleLeaseDocument: DocumentMetadata = {
  id: 1,
  title: "BOMU Office Lease Agreement",
  documentType: "Commercial Office Lease",
  createdBy: "Dynamic Insurance Brokers (PTY) LTD",
  createdDate: new Date("2024-09-15"),
  status: "active",
  expiryDate: new Date("2025-10-18"),
  parties: [
    {
      name: "Dynamic Insurance Brokers (PTY) LTD",
      role: "Lessor"
    },
    {
      name: "Botswana Musicians Union (BOMU)",
      role: "Lessee"
    }
  ],
  versions: [
    {
      id: 1,
      versionNumber: "1.0",
      date: new Date("2024-09-15"),
      changedBy: "Kaindu Tshombela",
      comment: "Initial draft created",
      url: "#"
    },
    {
      id: 2,
      versionNumber: "1.1",
      date: new Date("2024-09-20"),
      changedBy: "Kaindu Tshombela",
      comment: "Updated rental terms",
      url: "#"
    },
    {
      id: 3,
      versionNumber: "2.0",
      date: new Date("2024-10-05"),
      changedBy: "Legal Department",
      comment: "Final version with all terms agreed",
      url: "#"
    }
  ],
  approvals: [
    {
      id: 1,
      approverName: "Kaindu Tshombela",
      approverRole: "Lessor Representative",
      status: "approved",
      date: new Date("2024-10-10"),
      comment: "Approved all terms"
    },
    {
      id: 2,
      approverName: "Letsweletse Moshabi",
      approverRole: "Lessee Representative",
      status: "approved",
      date: new Date("2024-10-12"),
      comment: "Terms acceptable"
    }
  ],
  summary: "This lease agreement is for the rental of Unit 8, Plot A101, Commerce Park, Gaborone, Botswana. The lease is for an office block of 273m² which is fully furnished and includes all furniture. The lease commences on October 18, 2024 and expires on October 18, 2025, with an option to renew for 4 years.",
  clauses: [
    {
      id: 1,
      number: "1",
      title: "COMMENCEMENT OF THE LEASE",
      content: "Notwithstanding the date of signing hereof and/or occupation of the premises, the lease shall commence from the 18 October 2024 and shall continue for a period of a year thereafter. The lease shall terminate on the 18 October 2025."
    },
    {
      id: 2,
      number: "2",
      title: "RIGHT OF RENEWAL",
      content: "The Lessor hereby grants to the Lessee a right to renew this Lease, after the expiry date, for a further period of 4 years, subject however to the following:\n\nThe Lessee may not exercise the right of renewal while in breach or default of any of the terms of this Lease;\n\nThe Lessee shall exercise the right of renewal, in writing, at least three months prior to the expiry date (if the right of renewal is not so exercised then the right of renewal shall lapse and no longer be capable of exercise thereafter);\n\nIf this Lessee does not endure for the full term for which it was initially contracted the right of renewal shall lapse and any notice of exercise thereof given prior to such lapsing shall be null and void;\n\nThe terms and conditions of this Lease shall apply to the period for which this Lease is extended;\n\nThe rental for the first year of the extended period, and for each subsequent year thereof, shall agree to by the Parties;\n\nA new lease agreement to be signed by both parties prior to the 3 (three) months expiry of this lease failing which lessee will have no claim against this."
    },
    {
      id: 3,
      number: "3",
      title: "RENTAL",
      content: "The rental payable by the Lessee for the hire of the leased premises shall be P2100 (Pula Two Thousand One Hundred) per month for the first year of the lease.\n\nThe rental shall increase annually with effect from the commencement of the second and each successive year of the lease thereafter by an amount equivalent to 5% of the rental paid per month in the immediately preceding year. For the purposes of computation of each successive increase the aforesaid increases of 5% shall be compounded.\n\nThe rental shall be payable monthly in advance before the 7th day of each and every month in Botswana Currency to the Lessor at company's bank account to be noted in each invoice given to the lessee.\n\nIn addition to the rental payment, the Lessee shall pay to the Lessor monthly in advance, such amounts as the Lessor's property managers may determine, in respect of Levy charges such as common services. Such determination by the property managers shall be final and binding on both parties. This should be based on actual cost and prorate use. The Lessee shall be provided copy of bills to support claim."
    },
    {
      id: 4,
      number: "4",
      title: "SECURITY DEPOSIT",
      content: "P2100 (Pula Two Thousand One Hundred) which is equivalent to one (1) month's rent to be held by the Lessor for the duration of this Lease.\n\nNo interest shall accrue on the deposit which is to be held as security.\n\nWhenever during the Lease Period the deposit is so applied in whole or part, the Lessee shall on demand reinstate the deposit to its original amount.\n\nAs soon as all the obligations of the Lessee to the Lessor have been discharged following the termination of this lease, the Lessor shall refund to the Lessee."
    },
    {
      id: 5,
      number: "5",
      title: "PAYMENTS",
      content: "All payments due by the Lessee to the Lessor under this lease shall be made by a way of electronic transfer of funds to the bank account for the Lessor for this purpose or cheque duly crossed marked not negotiable and account payee only, issued in favour of the Lessor to such other person, if any, at such other place, if any, as the Lessor has designated for the time being, by written notice to the Lessee, as shall be agreed by the parties.\n\nThe Lessee shall not withhold, defer, or make any deduction from any payment due to the Lessor, whether or not the Lessor is indebted to the Lessee or in breach of any obligation to the Lessee.\n\nThe rent and all other amounts payable by the Lessee under this lease shall be net of Value Added Tax, 14% withholding Tax and such tax shall be recoverable by the Lessor from the Lessee in addition to the rent and such other amounts.\n\nThe Lessee shall be liable for interest on all overdue amounts payable under this lease at a rate per annum 5% (Five percent) above the interest rate per annum of First National Bank of Botswana Limited from time to time, reckoned from the due dates of such amounts until they are respectively paid.\n\nThe Lessee shall contribute a sum of P 300 (Pula three hundred only) towards the month for electricity. This payment shall be paid to the front desk personnel who shall issue a receipt of payment."
    },
    {
      id: 6,
      number: "6",
      title: "USAGE OF THE PROPERTY",
      content: "The premises are let to the Lessee for the purpose of conducting its Office business. The Lessee shall not use the premises or any part thereof or allow the same to be used for any purpose other than stated herein without the Lessor's prior written consent. The Lessee shall carry on in the premises a business of high standing and in any event of no lessor standing and standard than those of the other tenants in the building so as to maintain the class or standing of the building."
    },
    {
      id: 7,
      number: "7",
      title: "INSURANCE",
      content: "The Lessor will insure the Premises against loss by fire under normal terms of insurance applicable to buildings of this nature.\n\nThe Lessee shall not at any time do or carry on or allow to be done or carried on at the premises any matter or thing whereby such insurance may become void or voidable. If the rate of the premium on such insurance is increased as a result of any action by the Lessee, the Lessor without prejudice to any of the rights hereunder may recover from the Lessee the amount due in respect of such additional premium and the Lessee shall pay the same immediately on notification to the Lessee."
    },
    {
      id: 8,
      number: "8",
      title: "ASSIGNMENT, CESSION AND SUB-LETTING",
      content: "The Lessee shall be not be allowed to cede, assign or any of the rights or obligations of the Lessee under this lease."
    },
    {
      id: 9,
      number: "10",
      title: "PARKING",
      content: "The Lessee will be use all parking at no cost to the Lessee."
    },
    {
      id: 10,
      number: "11",
      title: "CHANGES IN EQUITY/OWNERSHIP",
      content: "In case of any change in Equity, Shareholding, or the ownership of the business or associated business of lessee, the Lessee is bound to inform the Lessor in advance about the changes."
    }
  ],
};

// Sample template documents
const sampleTemplates = [
  {
    id: 1,
    title: "Residential Lease Agreement",
    documentType: "Residential",
    lastUpdated: new Date("2024-03-15"),
    icon: FileText
  },
  {
    id: 2,
    title: "Commercial Property Lease",
    documentType: "Commercial",
    lastUpdated: new Date("2024-02-20"),
    icon: FileBadge
  },
  {
    id: 3,
    title: "Office Space Rental Agreement",
    documentType: "Commercial",
    lastUpdated: new Date("2024-01-10"),
    icon: FileText
  },
  {
    id: 4,
    title: "Room Rental Agreement",
    documentType: "Residential",
    lastUpdated: new Date("2024-03-05"),
    icon: FileCheck
  },
  {
    id: 5,
    title: "Vacation Property Rental",
    documentType: "Short-term",
    lastUpdated: new Date("2024-02-28"),
    icon: FileWarning
  }
];

// Sample document library
const sampleDocuments = [
  {
    ...sampleLeaseDocument,
    id: 1,
  },
  {
    id: 2,
    title: "Plot 45 Residential Lease - John Moagi",
    documentType: "Residential Lease",
    createdBy: "TOV Property OS",
    createdDate: new Date("2024-02-10"),
    status: "active",
    expiryDate: new Date("2025-02-10"),
    parties: [
      {
        name: "TOV Properties",
        role: "Lessor"
      },
      {
        name: "John Moagi",
        role: "Lessee"
      }
    ],
    versions: [
      {
        id: 1,
        versionNumber: "1.0",
        date: new Date("2024-02-05"),
        changedBy: "Admin",
        comment: "Initial draft",
        url: "#"
      },
      {
        id: 2,
        versionNumber: "1.1",
        date: new Date("2024-02-10"),
        changedBy: "Admin",
        comment: "Final version",
        url: "#"
      }
    ],
    approvals: [
      {
        id: 1,
        approverName: "Property Manager",
        approverRole: "Manager",
        status: "approved",
        date: new Date("2024-02-08"),
        comment: ""
      },
      {
        id: 2,
        approverName: "John Moagi",
        approverRole: "Tenant",
        status: "approved",
        date: new Date("2024-02-10"),
        comment: ""
      }
    ],
    summary: "Standard residential lease for Plot 45, Extension 16, Gaborone with a monthly rental of P5,500.",
    clauses: sampleLeaseDocument.clauses.map((clause) => ({ ...clause, id: clause.id + 20 }))
  },
  {
    id: 3,
    title: "Commercial Shop Lease - Broadhurst Mall",
    documentType: "Commercial Lease",
    createdBy: "TOV Property OS",
    createdDate: new Date("2023-11-15"),
    status: "active",
    expiryDate: new Date("2026-11-15"),
    parties: [
      {
        name: "Broadhurst Investments",
        role: "Lessor"
      },
      {
        name: "Fashion Boutique Inc.",
        role: "Lessee"
      }
    ],
    versions: [
      {
        id: 1,
        versionNumber: "1.0",
        date: new Date("2023-11-01"),
        changedBy: "Legal Team",
        comment: "Initial commercial lease draft",
        url: "#"
      },
      {
        id: 2,
        versionNumber: "2.0",
        date: new Date("2023-11-15"),
        changedBy: "Legal Team",
        comment: "Final version with amendments",
        url: "#"
      }
    ],
    approvals: [
      {
        id: 1,
        approverName: "Mall Manager",
        approverRole: "Property Manager",
        status: "approved",
        date: new Date("2023-11-10"),
        comment: ""
      },
      {
        id: 2,
        approverName: "Fashion Boutique CEO",
        approverRole: "Tenant",
        status: "approved",
        date: new Date("2023-11-12"),
        comment: ""
      }
    ],
    summary: "Three-year commercial lease for Shop 15, Broadhurst Mall with a monthly rental of P15,000 for retail fashion store.",
    clauses: sampleLeaseDocument.clauses.map((clause) => ({ ...clause, id: clause.id + 40 }))
  },
  {
    id: 4,
    title: "Rental Agreement Termination - Tsela Apartments",
    documentType: "Termination Notice",
    createdBy: "TOV Property OS",
    createdDate: new Date("2024-03-01"),
    status: "terminated",
    parties: [
      {
        name: "Tsela Property Management",
        role: "Lessor"
      },
      {
        name: "Sarah Kgosi",
        role: "Lessee"
      }
    ],
    versions: [
      {
        id: 1,
        versionNumber: "1.0",
        date: new Date("2024-03-01"),
        changedBy: "Admin",
        comment: "Termination document created",
        url: "#"
      }
    ],
    approvals: [
      {
        id: 1,
        approverName: "Property Manager",
        approverRole: "Manager",
        status: "approved",
        date: new Date("2024-03-02"),
        comment: ""
      },
      {
        id: 2,
        approverName: "Sarah Kgosi",
        approverRole: "Tenant",
        status: "approved",
        date: new Date("2024-03-05"),
        comment: "Acknowledge lease termination"
      }
    ],
    summary: "Termination of residential lease for Unit 204, Tsela Apartments as requested by tenant with proper notice period.",
    clauses: [
      {
        id: 1,
        number: "1",
        title: "TERMINATION NOTICE",
        content: "This document confirms the termination of the residential lease agreement between Tsela Property Management and Sarah Kgosi for Unit 204, Tsela Apartments. The termination is effective from April 30, 2024."
      },
      {
        id: 2,
        number: "2",
        title: "DEPOSIT REFUND",
        content: "The security deposit of P4,500 will be refunded within 14 days after inspection of the premises, less any deductions for damages beyond normal wear and tear or outstanding payments."
      }
    ]
  }
];

export default function DocumentManagementPage() {
  const [activeTab, setActiveTab] = useState("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  
  // Filter and sort documents
  const filteredDocuments = sampleDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = documentType === "all" || doc.documentType.toLowerCase().includes(documentType.toLowerCase());
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "type") {
      return a.documentType.localeCompare(b.documentType);
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });
  
  // Status badge styling
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
  
  // Handle template selection for new document
  const handleTemplateSelect = (templateId: number) => {
    // In a real implementation, this would load the template into the form
    setCreateDocumentOpen(true);
  };
  
  // Handle document actions
  const handlePrint = () => {
    console.log("Printing document");
  };
  
  const handleDownload = () => {
    console.log("Downloading document");
  };
  
  const handleShare = () => {
    console.log("Sharing document");
  };
  
  const handleEdit = () => {
    console.log("Editing document");
  };
  
  const handleSign = () => {
    console.log("Signing document");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-2 tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and e-sign your property documents
          </p>
        </div>
        <div className="flex gap-2 self-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Select a Document Template</DialogTitle>
                <DialogDescription>
                  Choose a template to start or create a document from scratch
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {sampleTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <template.icon className="h-8 w-8 text-primary" />
                          <Badge variant="outline" className="text-xs">
                            {template.documentType}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{template.title}</CardTitle>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                        Last updated: {template.lastUpdated.toLocaleDateString()}
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {/* Create from scratch option */}
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-colors border-dashed"
                    onClick={() => setCreateDocumentOpen(true)}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-col items-center text-center">
                      <File className="h-8 w-8 text-muted-foreground" />
                      <CardTitle className="text-lg mt-2">Blank Document</CardTitle>
                      <CardDescription>Create a document from scratch</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Template creation dialog */}
      <Dialog open={createDocumentOpen} onOpenChange={setCreateDocumentOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Lease Document</DialogTitle>
            <DialogDescription>
              Fill in the details to create a comprehensive lease agreement
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            <LeaseTemplateForm 
              onSubmit={(formData, clauses) => {
                console.log("Form data:", formData);
                console.log("Clauses:", clauses);
                setCreateDocumentOpen(false);
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Document Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="termination">Termination</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy("date")}>
                    Date Created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("title")}>
                    Title
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("type")}>
                    Document Type
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("status")}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{document.documentType}</Badge>
                    {getStatusBadge(document.status)}
                  </div>
                  <CardTitle className="text-lg truncate" title={document.title}>
                    {document.title}
                  </CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>Created: {new Date(document.createdDate).toLocaleDateString()}</span>
                    {document.expiryDate && (
                      <span className="text-xs">
                        Expires: {new Date(document.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="text-sm truncate">
                    <span className="font-medium">Parties: </span>
                    {document.parties.map(p => p.name).join(", ")}
                  </div>
                  {document.summary && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {document.summary}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-4 pb-4 flex justify-between">
                  <DocumentViewer 
                    document={document} 
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onSign={handleSign}
                  />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleEdit}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive-foreground">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="col-span-3 py-8 text-center text-muted-foreground">
                No documents found. Try changing your search criteria or create a new document.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <template.icon className="h-8 w-8 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {template.documentType}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Standard {template.documentType.toLowerCase()} lease agreement template
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {template.lastUpdated.toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm">
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}