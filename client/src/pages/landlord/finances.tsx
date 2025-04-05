import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Loader2 
} from "lucide-react";

// Simple formatter with fallback
const formatCurrency = (value: number = 0) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return "$" + value;
  }
};

// Simplified date formatter with error handling
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

export default function Finances() {
  // Use a simple in-memory state for filter to avoid extra renders
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Get properties with error handling
  const { 
    data: properties = [], 
    isLoading: propertiesLoading,
    isError: propertiesError
  } = useQuery({
    queryKey: ["/api/properties/landlord"],
    retry: 1, // Reduce retries to prevent hanging
    staleTime: 60000, // Cache data for 1 minute
  });
  
  // Get payments with error handling
  const { 
    data: payments = [], 
    isLoading: paymentsLoading,
    isError: paymentsError
  } = useQuery({
    queryKey: ["/api/payments/landlord"],
    retry: 1,
    staleTime: 60000,
  });

  // Calculate simple metrics with safe defaults
  const income = properties.reduce((sum, p) => sum + (p?.rentAmount || 0), 0);
  const expenses = income * 0.3; // Simplified expense calculation
  const netIncome = income - expenses;

  // Filter payments - keep simple
  const filteredPayments = activeFilter === "all" 
    ? payments.slice(0, 3) 
    : payments
        .filter(p => activeFilter === "income" ? p.paymentType === "rent" : p.paymentType !== "rent")
        .slice(0, 3);

  // Loading state components - keep super light
  if (propertiesLoading || paymentsLoading) {
    return (
      <StandardLayout title="Finances">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </StandardLayout>
    );
  }

  // Error state - very simple
  if (propertiesError || paymentsError) {
    return (
      <StandardLayout title="Finances">
        <div className="text-center py-8">
          <p>Could not load financial data. Please try again later.</p>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout title="Finances">
      {/* Ultra simple financial cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white p-3 rounded border">
          <div className="text-sm text-gray-500">Income</div>
          <div className="text-lg font-medium">{formatCurrency(income)}</div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-lg font-medium">{formatCurrency(expenses)}</div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <div className="text-sm text-gray-500">Net</div>
          <div className="text-lg font-medium">{formatCurrency(netIncome)}</div>
        </div>
      </div>

      {/* Simple filter buttons */}
      <div className="flex mb-3 border rounded-md overflow-hidden inline-flex">
        <button 
          className={`px-2 py-1 text-xs ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-white'}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-2 py-1 text-xs ${activeFilter === 'income' ? 'bg-primary text-white' : 'bg-white'}`}
          onClick={() => setActiveFilter('income')}
        >
          Income
        </button>
        <button 
          className={`px-2 py-1 text-xs ${activeFilter === 'expenses' ? 'bg-primary text-white' : 'bg-white'}`}
          onClick={() => setActiveFilter('expenses')}
        >
          Expenses
        </button>
      </div>

      {/* Ultra minimal transaction list */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {filteredPayments.map((payment) => {
            const isIncome = payment.paymentType === "rent";
            
            return (
              <div 
                key={payment.id}
                className="flex justify-between p-2 bg-white rounded border"
              >
                <div className="flex items-center">
                  {isIncome ? 
                    <ArrowUp className="h-3 w-3 text-green-500 mr-2" /> : 
                    <ArrowDown className="h-3 w-3 text-red-500 mr-2" />
                  }
                  <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                </div>
                <span className={`text-sm ${isIncome ? "text-green-500" : "text-red-500"}`}>
                  {isIncome ? "+" : "-"}{formatCurrency(payment.amount)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-4 bg-white rounded border">
          <DollarSign className="h-6 w-6 mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">No transactions</p>
        </div>
      )}

      {/* Ultra minimal property list */}
      {properties.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Properties</h3>
          <div className="space-y-2">
            {properties.slice(0, 3).map(property => (
              <div 
                key={property.id}
                className="flex justify-between p-2 bg-white rounded border"
              >
                <span className="text-sm">{property.title}</span>
                <span className="text-sm">{formatCurrency(property.rentAmount)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </StandardLayout>
  );
}