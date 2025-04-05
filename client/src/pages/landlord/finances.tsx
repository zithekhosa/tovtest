import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  Building, 
  LineChart, 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Calendar, 
  Plus,
  ChevronRight,
  Filter,
  ArrowUp,
  ArrowDown,
  Wallet,
  Download,
  ChevronDown
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2025");
  
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
    
  const annualRentalIncome = properties.reduce((sum, property) => 
    sum + property.rentAmount * 12, 0);
    
  const monthlyRentalIncome = annualRentalIncome / 12;
  
  const estimatedExpenses = annualRentalIncome * 0.3; // 30% of income for expenses
  const netIncome = annualRentalIncome - estimatedExpenses;
  
  const occupancyRate = (() => {
    const totalUnits = properties.length;
    if (totalUnits === 0) return 0;
    
    const occupiedUnits = leases.filter(lease => {
      const startDate = new Date(lease.startDate);
      const endDate = new Date(lease.endDate);
      const today = new Date();
      return startDate <= today && endDate >= today && lease.active;
    }).length;
    
    return (occupiedUnits / totalUnits) * 100;
  })();

  // Monthly income data (for chart)
  const monthlyData = [
    { name: "Jan", income: 32000, expenses: 21000 },
    { name: "Feb", income: 35000, expenses: 18000 },
    { name: "Mar", income: 38000, expenses: 19000 },
    { name: "Apr", income: 38000, expenses: 24000 },
    { name: "May", income: 40000, expenses: 22000 },
    { name: "Jun", income: 42000, expenses: 23000 },
    { name: "Jul", income: 42000, expenses: 20000 },
    { name: "Aug", income: 45000, expenses: 25000 },
    { name: "Sep", income: 46000, expenses: 21000 },
    { name: "Oct", income: 48000, expenses: 24000 },
    { name: "Nov", income: 48000, expenses: 22000 },
    { name: "Dec", income: 50000, expenses: 26000 },
  ];

  // Expense breakdown data
  const expenseData = [
    { name: "Maintenance", value: 35 },
    { name: "Taxes", value: 25 },
    { name: "Insurance", value: 15 },
    { name: "Utilities", value: 15 },
    { name: "Other", value: 10 }
  ];
  
  const EXPENSE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EA5545'];

  // Helper to get colored amount
  const getAmountColor = (amount: number, isIncome: boolean) => {
    return isIncome ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500";
  };

  return (
    <StandardLayout title="Finances" subtitle="Manage your property income and expenses">
      {/* Financial overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
        {/* Total Portfolio Value */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Portfolio</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">{formatCurrency(totalPortfolioValue)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated portfolio value</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>7.2% annual growth</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Income</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">{formatCurrency(monthlyRentalIncome)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly rental income</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>4.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Expenses</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">{formatCurrency(estimatedExpenses / 12)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated monthly expenses</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-400">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
                <LineChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Occupancy</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">{occupancyRate.toFixed(0)}%</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current occupancy rate</p>
            </div>
            <div className="mt-2">
              <Progress value={occupancyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different financial sections */}
      <Tabs 
        defaultValue="overview" 
        value={activeSection}
        onValueChange={setActiveSection}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-900"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Record Transaction
            </Button>
          </div>
        </div>

        {/* Filter section */}
        {filterOpen && (
          <Card className="mb-6 bg-white dark:bg-gray-900">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Month</p>
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      variant={selectedMonth === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedMonth("all")}
                      className="text-xs h-7"
                    >
                      All
                    </Button>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(month => (
                      <Button 
                        key={month}
                        variant={selectedMonth === month ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedMonth(month)}
                        className="text-xs h-7"
                      >
                        {month}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Year</p>
                  <div className="flex gap-1">
                    {["2023", "2024", "2025"].map(year => (
                      <Button 
                        key={year}
                        variant={selectedYear === year ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedYear(year)}
                        className="text-xs h-7"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Income vs Expenses Chart */}
            <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Income vs Expenses</h3>
                  <Badge variant="outline" className="font-normal">
                    {selectedYear}
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Income"
                        stackId="1" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.5} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses"
                        stackId="2" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.5} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Expense Breakdown</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value}%`}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  {expenseData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-400">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Financial Performance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Property Performance</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2 font-normal">
                <Link href="/landlord/properties">
                  View All Properties
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {properties.slice(0, 3).map(property => (
                <Card key={property.id} className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <Link href={`/landlord/properties/${property.id}`}>
                          <div className="font-medium mb-1 text-primary">{property.title}</div>
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {property.address}, {property.city}
                        </div>
                        <Badge className={property.available ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}>
                          {property.available ? "Vacant" : "Occupied"}
                        </Badge>
                      </div>
                      <div className="md:col-span-3 grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Rent</div>
                          <div className="font-medium text-sm">P{property.rentAmount.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Yearly</div>
                          <div className="font-medium text-sm">P{(property.rentAmount * 12).toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">ROI</div>
                          <div className="font-medium text-sm">7.2%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2 font-normal">
                <Link href="/landlord/finances/transactions">
                  View All
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {payments.slice(0, 3).map(payment => (
                <Card key={payment.id} className="bg-white dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.paymentType === "rent" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {payment.paymentType === "rent" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-medium">{payment.description || (payment.paymentType === "rent" ? "Rent Payment" : "Expense")}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(payment.paymentDate), "MMM d, yyyy")} • {payment.paymentMethod}</div>
                        </div>
                      </div>
                      <div className={getAmountColor(payment.amount, payment.paymentType === "rent")}>
                        {payment.paymentType === "rent" ? "+" : "-"}{formatCurrency(payment.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {payments.length === 0 && (
                <Card className="bg-white dark:bg-gray-900 text-center py-8">
                  <CardContent>
                    <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Receipt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Start recording your rental income and expenses to track your property finances.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Your First Transaction
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Income Tab Content */}
        <TabsContent value="income" className="mt-0">
          <Card className="mb-6 bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium">Income Summary</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total for {selectedMonth === "all" ? "all months" : selectedMonth} {selectedYear}: {formatCurrency(monthlyRentalIncome * (selectedMonth === "all" ? 12 : 1))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-3 font-medium text-sm bg-gray-50 dark:bg-gray-800">
                  <div className="col-span-2">Property</div>
                  <div>Date</div>
                  <div>Category</div>
                  <div className="text-right">Amount</div>
                </div>
                
                <div className="divide-y">
                  {payments.filter(p => p.paymentType === "rent").slice(0, 10).map(payment => {
                    const lease = leases.find(l => l.id === payment.leaseId);
                    const property = lease ? properties.find(p => p.id === lease.propertyId) : null;
                    
                    return (
                      <div key={payment.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="col-span-2">
                          <div className="font-medium">{property?.title || `Property #${lease?.propertyId || 'Unknown'}`}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{payment.description || "Rent Payment"}</div>
                        </div>
                        <div className="self-center">{format(new Date(payment.paymentDate), "MMM d, yyyy")}</div>
                        <div className="self-center">
                          <Badge variant="outline" className="font-normal bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            {payment.paymentType === "rent" ? "Rent" : payment.description || "Income"}
                          </Badge>
                        </div>
                        <div className="self-center text-right font-medium text-emerald-600 dark:text-emerald-500">
                          +{formatCurrency(payment.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {payments.filter(p => p.paymentType === "rent").length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Income Recorded</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Start recording your rental income to track your property finances.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Income
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab Content */}
        <TabsContent value="expenses" className="mt-0">
          <Card className="mb-6 bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium">Expenses Summary</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total for {selectedMonth === "all" ? "all months" : selectedMonth} {selectedYear}: {formatCurrency(estimatedExpenses / (selectedMonth === "all" ? 1 : 12))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-3 font-medium text-sm bg-gray-50 dark:bg-gray-800">
                  <div className="col-span-2">Property</div>
                  <div>Date</div>
                  <div>Category</div>
                  <div className="text-right">Amount</div>
                </div>
                
                <div className="divide-y">
                  {/* Sample expenses - would come from API in real app */}
                  {[
                    { id: 1, propertyTitle: "Gaborone Heights", description: "Plumbing repair", date: "Mar 15, 2025", category: "Maintenance", amount: 2300 },
                    { id: 2, propertyTitle: "Palm Residences", description: "Property taxes", date: "Feb 28, 2025", category: "Taxes", amount: 5600 },
                    { id: 3, propertyTitle: "Francistown Apartments", description: "Insurance premium", date: "Feb 10, 2025", category: "Insurance", amount: 4200 },
                    { id: 4, propertyTitle: "Sunshine Villa", description: "Landscaping", date: "Jan 22, 2025", category: "Maintenance", amount: 1800 },
                    { id: 5, propertyTitle: "All Properties", description: "Management fees", date: "Jan 05, 2025", category: "Management", amount: 3500 },
                  ].map(expense => (
                    <div key={expense.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="col-span-2">
                        <div className="font-medium">{expense.propertyTitle}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{expense.description}</div>
                      </div>
                      <div className="self-center">{expense.date}</div>
                      <div className="self-center">
                        <Badge variant="outline" className="font-normal bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="self-center text-right font-medium text-red-600 dark:text-red-500">
                        -{formatCurrency(expense.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab Content */}
        <TabsContent value="reports" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast({
              title: "Coming Soon",
              description: "This report feature will be available soon",
            })}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Income Statement</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive view of income, expenses, and profit
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast({
              title: "Coming Soon",
              description: "This report feature will be available soon",
            })}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Tax Report</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tax-ready statement for your rental properties
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast({
              title: "Coming Soon",
              description: "This report feature will be available soon",
            })}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Performance Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed ROI and property performance metrics
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white dark:bg-gray-900 mb-6">
            <CardContent className="p-6">
              <h3 className="font-medium mb-1">Custom Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Generate a custom financial report for your properties
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Report Type</label>
                  <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option>Income Statement</option>
                    <option>Cash Flow</option>
                    <option>Balance Sheet</option>
                    <option>Tax Summary</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date Range</label>
                  <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last Quarter</option>
                    <option>Year to Date</option>
                    <option>Last Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Properties</label>
                  <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option>All Properties</option>
                    <option>Gaborone Heights</option>
                    <option>Palm Residences</option>
                    <option>Francistown Apartments</option>
                  </select>
                </div>
              </div>
              
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardLayout>
  );
}