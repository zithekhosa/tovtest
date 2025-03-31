import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Edit, Save, MoveUp, MoveDown } from "lucide-react";
import { DocumentClause } from "./DocumentViewer";

// Lease template form schema
const leaseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  documentType: z.string().min(1, "Document type is required"),
  property: z.object({
    address: z.string().min(1, "Property address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    propertyType: z.string().min(1, "Property type is required"),
    squareFootage: z.coerce.number().positive("Must be a positive number").optional(),
  }),
  lessor: z.object({
    name: z.string().min(1, "Lessor name is required"),
    address: z.string().min(1, "Lessor address is required"),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Must be a valid email").optional(),
  }),
  lessee: z.object({
    name: z.string().min(1, "Lessee name is required"),
    address: z.string().min(1, "Lessee address is required"),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Must be a valid email").optional(),
  }),
  terms: z.object({
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    rentAmount: z.coerce.number().positive("Must be a positive number"),
    rentFrequency: z.string().min(1, "Rent frequency is required"),
    securityDeposit: z.coerce.number().positive("Must be a positive number"),
    latePaymentFee: z.coerce.number().min(0, "Must be a positive number or zero"),
    utilities: z.string().optional(),
    renewalOption: z.boolean().default(false),
    renewalTerms: z.string().optional(),
    termination: z.string().optional(),
  }),
  additionalTerms: z.string().optional(),
});

// Type for form data
type LeaseFormData = z.infer<typeof leaseFormSchema>;

// Interface for component props
interface LeaseTemplateFormProps {
  onSubmit?: (formData: LeaseFormData, clauses: DocumentClause[]) => void;
  initialData?: Partial<LeaseFormData>;
}

// Default values for the form
const defaultValues: LeaseFormData = {
  title: "Lease Agreement",
  documentType: "Residential Lease",
  property: {
    address: "",
    city: "Gaborone",
    state: "South-East District",
    zipCode: "",
    propertyType: "Residential",
    squareFootage: undefined,
  },
  lessor: {
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
  },
  lessee: {
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
  },
  terms: {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    rentAmount: 0,
    rentFrequency: "Monthly",
    securityDeposit: 0,
    latePaymentFee: 0,
    utilities: "",
    renewalOption: false,
    renewalTerms: "",
    termination: "",
  },
  additionalTerms: "",
};

// Standard lease clauses
const standardClauses: DocumentClause[] = [
  {
    id: 1,
    number: "1",
    title: "PARTIES",
    content: "This Lease Agreement is entered into between the Lessor and Lessee as identified above."
  },
  {
    id: 2,
    number: "2",
    title: "PREMISES",
    content: "The Lessor hereby leases to the Lessee the property described above."
  },
  {
    id: 3,
    number: "3",
    title: "TERM",
    content: "The lease term shall commence on the start date and end on the end date specified above, unless terminated earlier as provided herein."
  },
  {
    id: 4,
    number: "4",
    title: "RENT",
    content: "Lessee shall pay to Lessor as rent for the premises the amount specified above, payable in advance on the first day of each month during the term of this lease."
  },
  {
    id: 5,
    number: "5",
    title: "SECURITY DEPOSIT",
    content: "Upon execution of this lease, Lessee shall deposit with Lessor the security deposit amount specified above, to be held as security for the faithful performance by Lessee of all terms of this lease. The security deposit shall be returned to Lessee, without interest, within 30 days after the termination of this lease, less any amount necessary to compensate Lessor for damages caused by Lessee's breach of this lease."
  },
  {
    id: 6,
    number: "6",
    title: "UTILITIES",
    content: "Lessee shall be responsible for payment of all utility services required on the premises, except as follows: [Utility arrangements to be specified based on form input]"
  },
  {
    id: 7,
    number: "7",
    title: "USE AND OCCUPANCY",
    content: "The premises shall be used and occupied by Lessee exclusively as a private residence and for no other purpose. Lessee shall comply with all laws, ordinances, regulations and rules applicable to the premises."
  },
  {
    id: 8,
    number: "8",
    title: "MAINTENANCE AND REPAIRS",
    content: "Lessee shall maintain the premises in a clean and sanitary manner and shall surrender the premises at termination of this lease in as good condition as received, normal wear and tear excepted. Lessee shall be responsible for damages caused by Lessee's negligence and that of Lessee's family or invitees."
  },
  {
    id: 9,
    number: "9",
    title: "ALTERATIONS",
    content: "Lessee shall not make alterations to the premises without the prior written consent of Lessor. All alterations shall become the property of Lessor unless otherwise agreed in writing."
  },
  {
    id: 10,
    number: "10",
    title: "ENTRY AND INSPECTION",
    content: "Lessor shall have the right to enter the premises at reasonable times to inspect the premises, make necessary repairs, or show the premises to prospective lessees or purchasers. Except in case of emergency, Lessor shall give Lessee reasonable notice of intent to enter."
  }
];

export function LeaseTemplateForm({ 
  onSubmit,
  initialData
}: LeaseTemplateFormProps) {
  const [clauses, setClauses] = useState<DocumentClause[]>(standardClauses);
  const [editingClause, setEditingClause] = useState<DocumentClause | null>(null);
  const [editClauseIndex, setEditClauseIndex] = useState<number | null>(null);
  const [newClauseTitle, setNewClauseTitle] = useState("");
  const [newClauseContent, setNewClauseContent] = useState("");

  // Configure form with react-hook-form and zod validation
  const form = useForm<LeaseFormData>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
  });

  // Process clauses with form data to replace placeholders
  const processClausesWithFormData = (formData: LeaseFormData) => {
    return clauses.map(clause => {
      let content = clause.content;
      
      // Replace placeholders with actual data
      content = content.replace("[Utility arrangements to be specified based on form input]", formData.terms.utilities || "");
      
      return {
        ...clause,
        content
      };
    });
  };

  // Handle form submission
  const onFormSubmit = (formData: LeaseFormData) => {
    const processedClauses = processClausesWithFormData(formData);
    if (onSubmit) {
      onSubmit(formData, processedClauses);
    }
  };

  // Add a new clause
  const addClause = () => {
    if (!newClauseTitle.trim()) return;
    
    const newId = Math.max(0, ...clauses.map(c => c.id)) + 1;
    const newNumber = String(clauses.length + 1);
    
    setClauses([...clauses, {
      id: newId,
      number: newNumber,
      title: newClauseTitle,
      content: newClauseContent
    }]);
    
    setNewClauseTitle("");
    setNewClauseContent("");
  };
  
  // Delete a clause
  const deleteClause = (id: number) => {
    setClauses(clauses.filter(clause => clause.id !== id));
  };
  
  // Start editing a clause
  const startEditClause = (index: number) => {
    setEditingClause(clauses[index]);
    setEditClauseIndex(index);
  };
  
  // Save edited clause
  const saveEditClause = () => {
    if (!editingClause || editClauseIndex === null) return;
    
    const updatedClauses = [...clauses];
    updatedClauses[editClauseIndex] = editingClause;
    setClauses(updatedClauses);
    
    setEditingClause(null);
    setEditClauseIndex(null);
  };
  
  // Move clause up in order
  const moveClauseUp = (index: number) => {
    if (index === 0) return;
    
    const updatedClauses = [...clauses];
    [updatedClauses[index], updatedClauses[index - 1]] = [updatedClauses[index - 1], updatedClauses[index]];
    
    // Update the "number" field to reflect new order
    updatedClauses.forEach((clause, idx) => {
      clause.number = String(idx + 1);
    });
    
    setClauses(updatedClauses);
  };
  
  // Move clause down in order
  const moveClauseDown = (index: number) => {
    if (index === clauses.length - 1) return;
    
    const updatedClauses = [...clauses];
    [updatedClauses[index], updatedClauses[index + 1]] = [updatedClauses[index + 1], updatedClauses[index]];
    
    // Update the "number" field to reflect new order
    updatedClauses.forEach((clause, idx) => {
      clause.number = String(idx + 1);
    });
    
    setClauses(updatedClauses);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Commercial Lease Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Residential Lease">Residential Lease</SelectItem>
                        <SelectItem value="Commercial Lease">Commercial Lease</SelectItem>
                        <SelectItem value="Office Lease">Office Lease</SelectItem>
                        <SelectItem value="Retail Lease">Retail Lease</SelectItem>
                        <SelectItem value="Industrial Lease">Industrial Lease</SelectItem>
                        <SelectItem value="Vacation Property Lease">Vacation Property Lease</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="property.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property.propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Agricultural">Agricultural</SelectItem>
                        <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="property.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/District</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Central District">Central District</SelectItem>
                        <SelectItem value="Ghanzi District">Ghanzi District</SelectItem>
                        <SelectItem value="Kgalagadi District">Kgalagadi District</SelectItem>
                        <SelectItem value="Kgatleng District">Kgatleng District</SelectItem>
                        <SelectItem value="Kweneng District">Kweneng District</SelectItem>
                        <SelectItem value="North-East District">North-East District</SelectItem>
                        <SelectItem value="North-West District">North-West District</SelectItem>
                        <SelectItem value="South-East District">South-East District</SelectItem>
                        <SelectItem value="Southern District">Southern District</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="property.squareFootage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Square Footage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Area in square meters" 
                      {...field} 
                      value={field.value || ''}
                      onChange={e => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Area of the property in square meters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessor (Owner) Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lessor.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full legal name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessor Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Legal address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lessor.contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessee (Tenant) Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lessee.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full legal name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessee.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessee Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Legal address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lessee.contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessee.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessee.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lease Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="terms.startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms.endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="terms.rentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Amount (BWP)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Amount in Pula" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms.rentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Bi-Annually">Bi-Annually</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms.securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit (BWP)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Amount in Pula" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terms.latePaymentFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Payment Fee (BWP)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Amount in Pula" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms.utilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilities Arrangement</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Specify which utilities are included and which are the responsibility of the tenant" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms.renewalOption"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Renewal Option</FormLabel>
                    <FormDescription>
                      Allow tenant to renew the lease under specified terms
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("terms.renewalOption") && (
              <FormField
                control={form.control}
                name="terms.renewalTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal Terms</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Specify renewal period, notice requirements, and any changes to terms" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="terms.termination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termination Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Specify early termination penalties and notice requirements" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lease Clauses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Standard Clauses</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">No.</TableHead>
                        <TableHead className="w-1/5">Title</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clauses.map((clause, index) => (
                        <TableRow key={clause.id}>
                          <TableCell>{clause.number}</TableCell>
                          <TableCell className="font-medium">{clause.title}</TableCell>
                          <TableCell className="max-w-md truncate">{clause.content}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => moveClauseUp(index)}
                                disabled={index === 0}
                                type="button"
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => moveClauseDown(index)}
                                disabled={index === clauses.length - 1}
                                type="button"
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => startEditClause(index)}
                                type="button"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteClause(clause.id)}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {editingClause && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>Edit Clause</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Clause Number</label>
                      <Input 
                        value={editingClause.number}
                        onChange={(e) => setEditingClause({...editingClause, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Clause Title</label>
                      <Input 
                        value={editingClause.title}
                        onChange={(e) => setEditingClause({...editingClause, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Clause Content</label>
                    <Textarea 
                      value={editingClause.content}
                      onChange={(e) => setEditingClause({...editingClause, content: e.target.value})}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setEditingClause(null)} 
                      variant="outline" 
                      className="mr-2"
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveEditClause}
                      type="button"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Add New Clause</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Clause Title</label>
                  <Input 
                    value={newClauseTitle}
                    onChange={(e) => setNewClauseTitle(e.target.value)}
                    placeholder="Enter clause title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Clause Content</label>
                  <Textarea 
                    value={newClauseContent}
                    onChange={(e) => setNewClauseContent(e.target.value)}
                    placeholder="Enter clause content"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={addClause}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Clause
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="additionalTerms"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional terms or conditions not covered in the clauses above" 
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Create Document
          </Button>
        </div>
      </form>
    </Form>
  );
}