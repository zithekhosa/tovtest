import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Loader2, 
  Building,
  Download,
  FileText,
  Layers,
  Percent,
  BarChart3,
  PieChart,
  TrendingUp,
  Calculator,
  Home
} from "lucide-react";
import { Property, Payment, Lease } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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

// Percentage formatter
const formatPercent = (value: number = 0): string => {
  return value.toFixed(1) + '%';
};

// Mock data generation for demo purposes
const generateMockMonthlyData = (baseValue: number, months: number = 12): any[] => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return Array.from({ length: months }, (_, i) => {
    const monthIndex = (currentMonth - months + i + 12) % 12;
    const randomVariation = baseValue * (0.85 + Math.random() * 0.3);
    return {
      name: monthNames[monthIndex],
      value: Math.round(randomVariation),
      month: monthIndex
    };
  });
};

const generatePropertyPerformanceData = (properties: Property[]): any[] => {
  return properties.map((property) => {
    // Calculate ROI: Annual rent income / property value (estimated as 10 years of rent)
    const propertyValue = property.rentAmount * 12 * 10;
    const annualRent = property.rentAmount * 12;
    const expenses = annualRent * 0.3; // Estimate expenses as 30% of income
    const mortgagePayment = propertyValue * 0.05; // Rough estimate of annual mortgage payment
    const propertyTax = propertyValue * 0.01;
    const netIncome = annualRent - expenses - mortgagePayment - propertyTax;
    const roi = (netIncome / propertyValue) * 100;
    
    return {
      id: property.id,
      name: property.title,
      address: property.address,
      value: propertyValue,
      annualRent,
      expenses,
      mortgagePayment,
      propertyTax,
      netIncome,
      roi: Number(roi.toFixed(2)),
      capRate: Number(((annualRent - expenses) / propertyValue * 100).toFixed(2)),
      occupancyRate: property.available ? 0 : 100
    };
  });
};

// For the pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Finances() {
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeFilter, setActiveFilter] = useState<"all" | "income" | "expenses">("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  
  // Data fetching
  const { 
    data: properties = [] as Property[], 
    isLoading: propertiesLoading,
    isError: propertiesError
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
    retry: 1,
    staleTime: 30000,
  });
  
  const { 
    data: payments = [] as Payment[], 
    isLoading: paymentsLoading,
    isError: paymentsError
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/landlord"],
    retry: 1,
    staleTime: 30000,
  });
  
  const {
    data: leases = [] as Lease[],
    isLoading: leasesLoading,
    isError: leasesError
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
    retry: 1,
    staleTime: 30000,
  });

  // Calculate financial metrics
  const income = properties.reduce((sum: number, property: Property) => 
    sum + (property.rentAmount || 0), 0);
  const monthlyIncome = income;
  const annualIncome = income * 12;
  
  const estimatedMonthlyExpenses = Math.round(income * 0.3);
  const estimatedAnnualExpenses = estimatedMonthlyExpenses * 12;
  
  const monthlyNetIncome = income - estimatedMonthlyExpenses;
  const annualNetIncome = monthlyNetIncome * 12;
  
  // Portfolio valuation (estimated as 10 years of rent)
  const totalPortfolioValue = properties.reduce((sum, property) => 
    sum + (property.rentAmount * 12 * 10), 0);
  
  // Calculate occupancy rate
  const occupiedUnits = properties.filter(p => !p.available).length;
  const occupancyRate = properties.length > 0 
    ? (occupiedUnits / properties.length) * 100 
    : 0;
  
  // Generate derived data for reports
  const monthlyIncomeData = generateMockMonthlyData(monthlyIncome);
  const monthlyExpensesData = generateMockMonthlyData(estimatedMonthlyExpenses);
  const cashFlowData = monthlyIncomeData.map((item, index) => ({
    name: item.name,
    income: item.value,
    expenses: monthlyExpensesData[index].value,
    profit: item.value - monthlyExpensesData[index].value
  }));
  
  // Property performance data
  const propertyPerformanceData = generatePropertyPerformanceData(properties);
  const selectedProperty = selectedPropertyId 
    ? propertyPerformanceData.find(p => p.id === selectedPropertyId) 
    : propertyPerformanceData[0];
  
  // Filter payments for transactions tab
  const filteredPayments = activeFilter === "all" 
    ? payments.slice(0, 10) 
    : payments
        .filter((payment: Payment) => 
          activeFilter === "income" 
            ? payment.paymentType === "rent" 
            : payment.paymentType !== "rent")
        .slice(0, 10);
  
  // Pie chart data
  const expenseBreakdownData = [
    { name: 'Maintenance', value: Math.round(estimatedAnnualExpenses * 0.4) },
    { name: 'Property Tax', value: Math.round(estimatedAnnualExpenses * 0.25) },
    { name: 'Insurance', value: Math.round(estimatedAnnualExpenses * 0.15) },
    { name: 'Utilities', value: Math.round(estimatedAnnualExpenses * 0.1) },
    { name: 'Management', value: Math.round(estimatedAnnualExpenses * 0.05) },
    { name: 'Other', value: Math.round(estimatedAnnualExpenses * 0.05) }
  ];

  // Loading state
  if (propertiesLoading || paymentsLoading || leasesLoading) {
    return (
      <StandardLayout title="Financial Management">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p>Loading financial data...</p>
          </div>
        </div>
      </StandardLayout>
    );
  }

  // Error state
  if (propertiesError || paymentsError || leasesError) {
    return (
      <StandardLayout title="Financial Management">
        <div className="text-center py-8">
          <p className="text-lg font-medium text-red-500 mb-2">Unable to load financial data</p>
          <p className="text-gray-500">Please try again later or contact support if the problem persists.</p>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout title="Financial Management" subtitle="Track and analyze your property finances">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap mb-6 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="overview" className="min-w-fit">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="min-w-fit">Transactions</TabsTrigger>
          <TabsTrigger value="property-analysis" className="min-w-fit">Property Analysis</TabsTrigger>
          <TabsTrigger value="reports" className="min-w-fit">Reports</TabsTrigger>
          <TabsTrigger value="forecasting" className="min-w-fit">Forecasting</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-primary" />
                  Monthly Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
                <p className="text-xs text-muted-foreground mt-1">Annual: {formatCurrency(annualIncome)}</p>
                <div className="text-xs text-emerald-500 mt-2 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>4.2% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Building className="h-4 w-4 mr-1 text-primary" />
                  Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">{properties.length} properties</p>
                <div className="text-xs text-emerald-500 mt-2 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>2.8% annual appreciation</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Percent className="h-4 w-4 mr-1 text-primary" />
                  Occupancy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercent(occupancyRate)}</div>
                <p className="text-xs text-muted-foreground mt-1">{occupiedUnits} of {properties.length} units occupied</p>
                <div className="text-xs text-emerald-500 mt-2 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>1.5% from last quarter</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Monthly Cash Flow</CardTitle>
                <CardDescription>Income vs expenses over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cashFlowData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `P${value/1000}k`} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
                      <Line type="monotone" dataKey="profit" stroke="#ff7300" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Expense Breakdown</CardTitle>
                <CardDescription>Annual expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={expenseBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          // On small screens, only show percentage
                          return window.innerWidth < 768 ? 
                            `${(percent * 100).toFixed(0)}%` :
                            `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      {/* Move legend to bottom on mobile screens */}
                      <Legend 
                        layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
                        verticalAlign={window.innerWidth < 768 ? "bottom" : "middle"}
                        align={window.innerWidth < 768 ? "center" : "right"}
                        wrapperStyle={window.innerWidth < 768 ? { paddingTop: '20px' } : {}}
                      />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Properties Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Properties Performance</CardTitle>
                <Link href="/landlord/properties">
                  <Button variant="outline" size="sm">View All Properties</Button>
                </Link>
              </div>
              <CardDescription>Financial performance metrics for your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 font-medium text-sm text-left">Property</th>
                      <th className="p-3 font-medium text-sm text-left">Monthly Rent</th>
                      <th className="p-3 font-medium text-sm text-left">Annual Income</th>
                      <th className="p-3 font-medium text-sm text-left">Expenses</th>
                      <th className="p-3 font-medium text-sm text-left">Net Income</th>
                      <th className="p-3 font-medium text-sm text-left">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 5).map((property, index) => {
                      const annualRent = property.rentAmount * 12;
                      const expenses = annualRent * 0.3;
                      const netIncome = annualRent - expenses;
                      const propertyValue = property.rentAmount * 12 * 10;
                      const roi = (netIncome / propertyValue) * 100;
                      
                      return (
                        <tr key={property.id} className={`text-sm ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                          <td className="p-3 font-medium">{property.title}</td>
                          <td className="p-3">{formatCurrency(property.rentAmount)}</td>
                          <td className="p-3">{formatCurrency(annualRent)}</td>
                          <td className="p-3">{formatCurrency(expenses)}</td>
                          <td className="p-3">{formatCurrency(netIncome)}</td>
                          <td className={`p-3 ${roi > 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {roi.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export Financial Report
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Generate Tax Documents
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Calculator className="h-4 w-4 mr-1" />
              ROI Calculator
            </Button>
          </div>
        </TabsContent>
        
        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Track all your property-related income and expenses</CardDescription>
              
              {/* Transaction Filters */}
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={activeFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                >
                  All Transactions
                </Button>
                <Button 
                  variant={activeFilter === 'income' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('income')}
                >
                  Income
                </Button>
                <Button 
                  variant={activeFilter === 'expenses' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('expenses')}
                >
                  Expenses
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 font-medium text-sm text-left">Date</th>
                        <th className="p-3 font-medium text-sm text-left">Description</th>
                        <th className="p-3 font-medium text-sm text-left">Property</th>
                        <th className="p-3 font-medium text-sm text-left">Status</th>
                        <th className="p-3 font-medium text-sm text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment: Payment) => {
                        // Find related lease and property
                        const lease = leases.find(l => l.id === payment.leaseId);
                        const property = lease 
                          ? properties.find(p => p.id === lease.propertyId) 
                          : undefined;
                        const isIncome = payment.paymentType === "rent";
                        
                        return (
                          <tr key={payment.id} className="text-sm border-t">
                            <td className="p-3">{formatDate(payment.paymentDate.toString())}</td>
                            <td className="p-3">{payment.description || (isIncome ? 'Rent Payment' : 'Expense')}</td>
                            <td className="p-3">{property?.title || 'Unknown'}</td>
                            <td className="p-3">
                              <Badge 
                                variant="outline"
                                className={payment.status === 'paid' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'}
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className={`p-3 text-right font-medium ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(payment.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <DollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Transactions
                </Button>
                <Button size="sm">
                  Record New Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PROPERTY ANALYSIS TAB */}
        <TabsContent value="property-analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Property Selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Select a property to view its financial details</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-3 border rounded-md cursor-pointer hover:border-primary transition-colors ${
                        selectedPropertyId === property.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{property.address}</div>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span>{formatCurrency(property.rentAmount)}/mo</span>
                        <Badge variant={property.available ? 'destructive' : 'default'}>
                          {property.available ? 'Vacant' : 'Occupied'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Property Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedProperty?.title || 'Property Analysis'}</CardTitle>
                <CardDescription>
                  {selectedProperty?.address || 'Select a property to view financial details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProperty ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Property Value</div>
                        <div className="text-lg font-medium mt-1">{formatCurrency(selectedProperty.value)}</div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Annual Rent</div>
                        <div className="text-lg font-medium mt-1">{formatCurrency(selectedProperty.annualRent)}</div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Net Income</div>
                        <div className="text-lg font-medium mt-1">{formatCurrency(selectedProperty.netIncome)}</div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">ROI</div>
                        <div className="text-lg font-medium mt-1">{selectedProperty.roi}%</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 mb-6">
                      <h4 className="text-md font-medium mb-3">Annual Financial Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Rent Income</span>
                          <span className="font-medium">{formatCurrency(selectedProperty.annualRent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expenses</span>
                          <span className="font-medium text-red-600">-{formatCurrency(selectedProperty.expenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property Tax</span>
                          <span className="font-medium text-red-600">-{formatCurrency(selectedProperty.propertyTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mortgage Payments</span>
                          <span className="font-medium text-red-600">-{formatCurrency(selectedProperty.mortgagePayment)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-medium">Net Annual Income</span>
                          <span className={`font-medium ${selectedProperty.netIncome > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(selectedProperty.netIncome)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="text-md font-medium mb-3">Investment Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div className="text-lg font-medium">{selectedProperty.roi}%</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Return On Investment
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cap Rate</div>
                          <div className="text-lg font-medium">{selectedProperty.capRate}%</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Net Income ÷ Property Value
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cash On Cash</div>
                          <div className="text-lg font-medium">{(selectedProperty.roi * 1.2).toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Based on 20% down payment
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Home className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p>Select a property to view its financial analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Comprehensive view of income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-3">Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Income</span>
                      <span>{formatCurrency(annualIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Late Fees</span>
                      <span>{formatCurrency(annualIncome * 0.01)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Total Revenue</span>
                      <span className="font-medium">{formatCurrency(annualIncome * 1.01)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-3">Expenses</h4>
                  <div className="space-y-2">
                    {expenseBreakdownData.map((expense, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{expense.name}</span>
                        <span className="text-red-600">-{formatCurrency(expense.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Total Expenses</span>
                      <span className="font-medium text-red-600">-{formatCurrency(estimatedAnnualExpenses)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-muted">
                  <div className="flex justify-between">
                    <span className="font-medium">Net Operating Income</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(annualNetIncome)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Income Statement
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Valuation</CardTitle>
                <CardDescription>Current market value of your property portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `P${value/1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="value" fill="#8884d8" name="Property Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 font-medium text-sm text-left">Property</th>
                        <th className="p-3 font-medium text-sm text-left">Market Value</th>
                        <th className="p-3 font-medium text-sm text-left">Valuation Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property, index) => {
                        // Calculate property value (10 years of rent)
                        const value = property.rentAmount * 12 * 10;
                        
                        return (
                          <tr key={property.id} className="text-sm border-t">
                            <td className="p-3 font-medium">{property.title}</td>
                            <td className="p-3">{formatCurrency(value)}</td>
                            <td className="p-3 text-emerald-500">+2.8%</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted font-medium border-t">
                        <td className="p-3">Total Portfolio Value</td>
                        <td className="p-3">{formatCurrency(totalPortfolioValue)}</td>
                        <td className="p-3 text-emerald-500">+2.8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Valuation Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>Monthly income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cashFlowData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `P${value/1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 3 }} 
                        name="Income"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={{ r: 3 }}
                        name="Expenses"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#ff7300" 
                        strokeWidth={2} 
                        dot={{ r: 3 }}
                        name="Net Income"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="border rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Avg Monthly Income</div>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(monthlyIncome)}
                    </div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Avg Monthly Expenses</div>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(estimatedMonthlyExpenses)}
                    </div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Avg Monthly Profit</div>
                    <div className="text-lg font-medium mt-1">
                      {formatCurrency(monthlyNetIncome)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Cash Flow Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Return on Investment</CardTitle>
                <CardDescription>ROI comparison across your property portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'roi') return [`${value}%`, 'ROI'];
                        if (name === 'capRate') return [`${value}%`, 'Cap Rate'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar dataKey="roi" fill="#8884d8" name="ROI" />
                      <Bar dataKey="capRate" fill="#82ca9d" name="Cap Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md mt-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 font-medium text-sm text-left">Property</th>
                        <th className="p-3 font-medium text-sm text-left">ROI</th>
                        <th className="p-3 font-medium text-sm text-left">Cap Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyPerformanceData.map((property, index) => (
                        <tr key={property.id} className="text-sm border-t">
                          <td className="p-3 font-medium">{property.name}</td>
                          <td className={`p-3 ${property.roi > 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {property.roi}%
                          </td>
                          <td className="p-3">{property.capRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export ROI Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* FORECASTING TAB */}
        <TabsContent value="forecasting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Projected Cash Flow</CardTitle>
                <CardDescription>5-year cash flow projection for your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { year: '2025', income: monthlyIncome * 12, expenses: estimatedAnnualExpenses },
                        { year: '2026', income: monthlyIncome * 12 * 1.03, expenses: estimatedAnnualExpenses * 1.02 },
                        { year: '2027', income: monthlyIncome * 12 * 1.06, expenses: estimatedAnnualExpenses * 1.04 },
                        { year: '2028', income: monthlyIncome * 12 * 1.09, expenses: estimatedAnnualExpenses * 1.06 },
                        { year: '2029', income: monthlyIncome * 12 * 1.12, expenses: estimatedAnnualExpenses * 1.08 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `P${value/1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Area type="monotone" dataKey="income" name="Projected Income" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="expenses" name="Projected Expenses" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md mt-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 font-medium text-sm text-left">Year</th>
                        <th className="p-3 font-medium text-sm text-left">Projected Income</th>
                        <th className="p-3 font-medium text-sm text-left">Projected Expenses</th>
                        <th className="p-3 font-medium text-sm text-left">Net Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4].map((yearOffset) => {
                        const year = 2025 + yearOffset;
                        const incomeGrowth = 1 + (yearOffset * 0.03);
                        const expenseGrowth = 1 + (yearOffset * 0.02);
                        const projectedIncome = monthlyIncome * 12 * incomeGrowth;
                        const projectedExpenses = estimatedAnnualExpenses * expenseGrowth;
                        const netCashFlow = projectedIncome - projectedExpenses;
                        
                        return (
                          <tr key={year} className="text-sm border-t">
                            <td className="p-3 font-medium">{year}</td>
                            <td className="p-3">{formatCurrency(projectedIncome)}</td>
                            <td className="p-3">{formatCurrency(projectedExpenses)}</td>
                            <td className="p-3 font-medium text-emerald-600">{formatCurrency(netCashFlow)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Property Value Forecast</CardTitle>
                <CardDescription>Projected property value growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { year: '2025', value: totalPortfolioValue },
                        { year: '2026', value: totalPortfolioValue * 1.028 },
                        { year: '2027', value: totalPortfolioValue * 1.028 * 1.028 },
                        { year: '2028', value: totalPortfolioValue * 1.028 * 1.028 * 1.028 },
                        { year: '2029', value: totalPortfolioValue * 1.028 * 1.028 * 1.028 * 1.028 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `P${value/1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Portfolio Value"
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md mt-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 font-medium text-sm text-left">Year</th>
                        <th className="p-3 font-medium text-sm text-left">Projected Value</th>
                        <th className="p-3 font-medium text-sm text-left">Annual Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4].map((yearOffset) => {
                        const year = 2025 + yearOffset;
                        const growthFactor = Math.pow(1.028, yearOffset);
                        const projectedValue = totalPortfolioValue * growthFactor;
                        
                        return (
                          <tr key={year} className="text-sm border-t">
                            <td className="p-3 font-medium">{year}</td>
                            <td className="p-3">{formatCurrency(projectedValue)}</td>
                            <td className="p-3 text-emerald-500">+2.8%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-muted mt-4 rounded-md">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Forecast Assumptions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Annual property value appreciation: 2.8%</li>
                      <li>Annual rental income growth: 3%</li>
                      <li>Annual expense inflation: 2%</li>
                      <li>Consistent occupancy rate: {formatPercent(occupancyRate)}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </StandardLayout>
  );
}