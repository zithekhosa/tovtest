import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  Building, 
  DollarSign, 
  FileText, 
  Plus,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  ChevronRight,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Property, Lease, Payment } from "@shared/schema";
import { format } from "date-fns";

// Helper for formatting currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-BW", {
    style: "currency",
    currency: "BWP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Finances() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Get properties data
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });
  
  // Get leases data
  const { data: leases = [] } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
  });
  
  // Get payments data
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments/landlord"],
  });

  // Financial metrics
  const totalPortfolioValue = properties.reduce((sum, property) => 
    sum + (property.rentAmount * 12 * 10), 0);
    
  const monthlyRentalIncome = properties.reduce((sum, property) => 
    sum + property.rentAmount, 0);
  
  const estimatedExpenses = monthlyRentalIncome * 0.3; // 30% of income for expenses
  const netIncome = monthlyRentalIncome - estimatedExpenses;
  
  // Filter transactions based on type
  const filteredTransactions = payments.filter(payment => {
    if (activeFilter === "all") return true;
    if (activeFilter === "income") return payment.paymentType === "rent";
    if (activeFilter === "expenses") return payment.paymentType !== "rent";
    return true;
  });

  return (
    <StandardLayout title="Finances">
      {/* Financial summary */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Income</div>
              <div className="text-xl font-semibold">{formatCurrency(monthlyRentalIncome)}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-500 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>4.2% from last month</span>
          </div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
              <div className="text-xl font-semibold">{formatCurrency(estimatedExpenses)}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-red-600 dark:text-red-500 flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" />
            <span>2.1% from last month</span>
          </div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Net Income</div>
              <div className="text-xl font-semibold">{formatCurrency(netIncome)}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-500 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>{formatCurrency(netIncome - (netIncome * 0.95))} more than last month</span>
          </div>
        </div>
      </div>

      {/* Filter and Add Buttons */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex rounded-md overflow-hidden border">
          <button 
            className={`px-3 py-1.5 text-sm ${activeFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1.5 text-sm ${activeFilter === 'income' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('income')}
          >
            Income
          </button>
          <button 
            className={`px-3 py-1.5 text-sm ${activeFilter === 'expenses' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('expenses')}
          >
            Expenses
          </button>
        </div>
        
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const lease = leases.find(l => l.id === transaction.leaseId);
            const property = lease ? properties.find(p => p.id === lease.propertyId) : null;
            const isIncome = transaction.paymentType === "rent";
            
            return (
              <div 
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg hover:shadow-sm"
              >
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    isIncome 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {isIncome ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {transaction.description || (isIncome ? "Rent Payment" : "Expense")}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(transaction.paymentDate), "MMM d, yyyy")}
                      
                      {property && (
                        <span className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                          {property.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                  <Badge 
                    variant="outline" 
                    className={`${isIncome 
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                  >
                    {transaction.paymentMethod}
                  </Badge>
                  
                  <span className={`font-medium ${isIncome 
                    ? "text-emerald-600 dark:text-emerald-500" 
                    : "text-red-600 dark:text-red-500"} min-w-[100px] text-right`}>
                    {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
          <DollarSign className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            {activeFilter !== "all" 
              ? `No ${activeFilter} transactions found. Try a different filter.` 
              : "Start recording your financial transactions to track your property finances."}
          </p>
          {activeFilter !== "all" ? (
            <Button variant="outline" onClick={() => setActiveFilter("all")}>
              Show All Transactions
            </Button>
          ) : (
            <Button onClick={() => toast({
              title: "Add Transaction",
              description: "The transaction recording feature will be available soon"
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Record First Transaction
            </Button>
          )}
        </div>
      )}

      {/* Financial Reports Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Reports</h3>
          <Button variant="outline" size="sm" onClick={() => toast({
            title: "Export Feature",
            description: "The export feature will be available soon"
          })}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div 
            className="bg-white dark:bg-gray-900 p-4 rounded-lg text-center hover:shadow-sm cursor-pointer"
            onClick={() => toast({
              title: "Coming Soon",
              description: "The income statement report will be available soon"
            })}
          >
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="font-medium mb-1">Income Statement</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Income, expenses, and profit
            </p>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-900 p-4 rounded-lg text-center hover:shadow-sm cursor-pointer"
            onClick={() => toast({
              title: "Coming Soon",
              description: "The property performance report will be available soon"
            })}
          >
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div className="font-medium mb-1">Property Performance</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ROI and occupancy analysis
            </p>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-900 p-4 rounded-lg text-center hover:shadow-sm cursor-pointer"
            onClick={() => toast({
              title: "Coming Soon",
              description: "The tax summary report will be available soon"
            })}
          >
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="font-medium mb-1">Tax Summary</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tax-ready statement
            </p>
          </div>
        </div>
      </div>

      {/* Properties Financial Summary */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Property Summary</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary text-xs font-normal p-0 h-auto"
            asChild
          >
            <Link href="/landlord/properties">
              View All Properties
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="space-y-3">
          {properties.slice(0, 3).map(property => (
            <div 
              key={property.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div className="font-medium">{property.title}</div>
                <Badge className={property.available ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}>
                  {property.available ? "Vacant" : "Occupied"}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {property.address}, {property.city}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">MONTHLY</div>
                  <div className="font-medium text-sm">{formatCurrency(property.rentAmount)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">ANNUAL</div>
                  <div className="font-medium text-sm">{formatCurrency(property.rentAmount * 12)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">PROFIT</div>
                  <div className="font-medium text-sm">{formatCurrency(property.rentAmount * 0.7)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StandardLayout>
  );
}