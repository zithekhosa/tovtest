import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  DollarSign, 
  Plus,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const monthlyRentalIncome = properties.reduce((sum, property) => 
    sum + property.rentAmount, 0);
  
  const expenses = monthlyRentalIncome * 0.3; // 30% of income for expenses
  const netIncome = monthlyRentalIncome - expenses;
  
  // Filter transactions based on type
  const filteredTransactions = payments.filter(payment => {
    if (activeFilter === "all") return true;
    if (activeFilter === "income") return payment.paymentType === "rent";
    if (activeFilter === "expenses") return payment.paymentType !== "rent";
    return true;
  });

  return (
    <StandardLayout title="Finances">
      {/* Simple Financial Summary - 3 Cards */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Income</div>
          <div className="text-xl font-semibold mt-1">{formatCurrency(monthlyRentalIncome)}</div>
          <div className="text-xs text-emerald-600 mt-1">+4.2% from last month</div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-xl font-semibold mt-1">{formatCurrency(expenses)}</div>
          <div className="text-xs text-red-600 mt-1">-2.1% from last month</div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Net Income</div>
          <div className="text-xl font-semibold mt-1">{formatCurrency(netIncome)}</div>
          <div className="text-xs text-emerald-600 mt-1">+5.3% from last month</div>
        </div>
      </div>

      {/* Simple Filter and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex border rounded-md overflow-hidden">
          <button 
            className={`px-3 py-1 text-sm ${activeFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-sm ${activeFilter === 'income' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900'}`}
            onClick={() => setActiveFilter('income')}
          >
            Income
          </button>
          <button 
            className={`px-3 py-1 text-sm ${activeFilter === 'expenses' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-900'}`}
            onClick={() => setActiveFilter('expenses')}
          >
            Expenses
          </button>
        </div>
        
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.slice(0, 5).map((transaction) => {
            const lease = leases.find(l => l.id === transaction.leaseId);
            const property = lease ? properties.find(p => p.id === lease.propertyId) : null;
            const isIncome = transaction.paymentType === "rent";
            
            return (
              <div 
                key={transaction.id}
                className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-md border"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isIncome ? "bg-emerald-100" : "bg-red-100"}`}>
                    {isIncome ? <ArrowUp className="h-4 w-4 text-emerald-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />}
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm">
                      {isIncome ? "Rent Payment" : "Expense"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(transaction.paymentDate), "MMM d, yyyy")}
                      {property && ` • ${property.title}`}
                    </div>
                  </div>
                </div>
                
                <div className={`font-medium ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                  {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })}

          {/* View All Link */}
          <div className="text-center mt-3">
            <Link href="/landlord/finances/transactions" className="text-sm text-primary">
              View all transactions
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-md border">
          <DollarSign className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">No transactions found</p>
          <Button size="sm" onClick={() => setActiveFilter("all")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Property Summary Section - Simple List */}
      <div className="mt-6 pt-5 border-t">
        <h3 className="font-medium mb-3">Properties</h3>
        
        <div className="space-y-2">
          {properties.slice(0, 3).map(property => (
            <div 
              key={property.id}
              className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-md border"
            >
              <div>
                <div className="font-medium text-sm">{property.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{property.address}</div>
              </div>
              
              <div>
                <Badge className="whitespace-nowrap">{formatCurrency(property.rentAmount)}/mo</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StandardLayout>
  );
}