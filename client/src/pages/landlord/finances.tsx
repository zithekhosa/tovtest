import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Loader2, 
  Building
} from "lucide-react";
import { Property, Payment } from "@shared/schema";

// Currency formatter with proper typing and error handling
const formatCurrency = (value: number = 0): string => {
  try {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
      minimumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return "BWP " + value;
  }
};

// Date formatter with proper typing and error handling
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

export default function Finances() {
  // Simple state for filter selection
  const [activeFilter, setActiveFilter] = useState<"all" | "income" | "expenses">("all");
  
  // Fetch properties data with proper typing
  const { 
    data: properties = [] as Property[], 
    isLoading: propertiesLoading,
    isError: propertiesError
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Fetch payments data with proper typing
  const { 
    data: payments = [] as Payment[], 
    isLoading: paymentsLoading,
    isError: paymentsError
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/landlord"],
    retry: 1,
    staleTime: 30000,
  });

  // Calculate financial metrics with proper typing
  const income = properties.reduce((sum: number, property: Property) => 
    sum + (property.rentAmount || 0), 0);
  const expenses = Math.round(income * 0.3); // Estimate expenses as 30% of income
  const netIncome = income - expenses;

  // Filter payments based on selected filter
  const filteredPayments = activeFilter === "all" 
    ? payments.slice(0, 5) 
    : payments
        .filter((payment: Payment) => 
          activeFilter === "income" 
            ? payment.paymentType === "rent" 
            : payment.paymentType !== "rent")
        .slice(0, 5);

  // Loading state - simple spinner
  if (propertiesLoading || paymentsLoading) {
    return (
      <StandardLayout title="Finances">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </StandardLayout>
    );
  }

  // Error state - simple message
  if (propertiesError || paymentsError) {
    return (
      <StandardLayout title="Finances">
        <div className="text-center py-8">
          <p>Unable to load financial data. Please try again later.</p>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout title="Finances">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
          <div className="text-sm text-gray-500 dark:text-gray-400">Income</div>
          <div className="text-lg font-medium">{formatCurrency(income)}</div>
          <div className="text-xs text-emerald-500">+4.2% from last month</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
          <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
          <div className="text-lg font-medium">{formatCurrency(expenses)}</div>
          <div className="text-xs text-red-500">-2.1% from last month</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
          <div className="text-sm text-gray-500 dark:text-gray-400">Net Income</div>
          <div className="text-lg font-medium">{formatCurrency(netIncome)}</div>
          <div className="text-xs text-emerald-500">+5.3% from last month</div>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="flex mb-3">
        <div className="flex border rounded-md overflow-hidden">
          <button 
            className={`px-2 py-1 text-xs ${activeFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-2 py-1 text-xs ${activeFilter === 'income' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('income')}
          >
            Income
          </button>
          <button 
            className={`px-2 py-1 text-xs ${activeFilter === 'expenses' 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveFilter('expenses')}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
      {filteredPayments.length > 0 ? (
        <div className="space-y-1 mb-4">
          {filteredPayments.map((payment: Payment) => {
            const isIncome = payment.paymentType === "rent";
            
            return (
              <div 
                key={payment.id}
                className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border"
              >
                <div className="flex items-center">
                  {isIncome ? 
                    <ArrowUp className="h-3 w-3 text-emerald-500 mr-2" /> : 
                    <ArrowDown className="h-3 w-3 text-red-500 mr-2" />
                  }
                  <span className="text-sm">{formatDate(payment.paymentDate.toString())}</span>
                </div>
                <span className={`text-sm ${isIncome ? "text-emerald-500" : "text-red-500"}`}>
                  {isIncome ? "+" : "-"}{formatCurrency(payment.amount)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded border mb-4">
          <DollarSign className="h-6 w-6 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found</p>
        </div>
      )}

      {/* Properties List */}
      {properties.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Properties</h3>
          <div className="space-y-1">
            {properties.slice(0, 3).map((property: Property) => (
              <div 
                key={property.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
              >
                <div className="flex items-center">
                  <Building className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-sm">{property.title}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(property.rentAmount)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </StandardLayout>
  );
}