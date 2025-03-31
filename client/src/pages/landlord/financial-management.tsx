import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, Calculator, LineChart, Percent, Receipt, TrendingUp, DollarSign, FileSpreadsheet, PiggyBank, Calendar, ArrowUpDown } from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart as RechartsLineChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Property, Lease, Payment } from "@shared/schema";

// Helper for formatting currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-BW", {
    style: "currency",
    currency: "BWP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FinancialManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
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

  // Tax Calculator States
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(25);
  
  // Loan Calculator States
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [loanTerm, setLoanTerm] = useState<number>(20);
  
  // ROI Calculator States
  const [purchasePrice, setPurchasePrice] = useState<number>(1500000);
  const [annualRent, setAnnualRent] = useState<number>(180000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(20000);
  const [appreciationRate, setAppreciationRate] = useState<number>(3);
  
  // Calculate financial metrics for the overview section
  const totalPortfolioValue = properties.reduce((sum, property) => 
    sum + (property.rentAmount * 12 * 10), 0);
    
  const annualRentalIncome = properties.reduce((sum, property) => 
    sum + property.rentAmount * 12, 0);
    
  const monthlyRentalIncome = annualRentalIncome / 12;
  
  const estimatedExpenses = annualRentalIncome * 0.3; // 30% of income for expenses
  
  const netOperatingIncome = annualRentalIncome - estimatedExpenses;
  
  const cashOnCash = (netOperatingIncome / (totalPortfolioValue * 0.25)) * 100; // Assuming 25% down payment
  
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
  
  // Generate monthly cash flow data for the last 12 months
  const getMonthlyData = () => {
    const today = new Date();
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: monthNames[month.getMonth()],
        month: month.getMonth(),
        year: month.getFullYear()
      });
    }
    
    return months.map(monthData => {
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === monthData.month && 
               paymentDate.getFullYear() === monthData.year;
      });
      
      const income = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const expenses = income * 0.3; // Assuming expenses are 30% of income
      
      return {
        name: monthData.name,
        income: income,
        expenses: expenses,
        profit: income - expenses
      };
    });
  };
  
  // Financial Projection Data - 5 year projection
  const getProjectionData = () => {
    const currentYear = new Date().getFullYear();
    const years = [0, 1, 2, 3, 4]; // Current + 4 future years
    
    // Base values
    const baseIncome = annualRentalIncome;
    const baseExpenses = estimatedExpenses;
    const basePropertyValue = totalPortfolioValue;
    
    // Annual increase rates
    const incomeGrowthRate = 0.04; // 4% annual increase in rental income
    const expenseGrowthRate = 0.05; // 5% annual increase in expenses
    const propertyValueGrowthRate = 0.03; // 3% annual property value appreciation
    
    return years.map(yearOffset => {
      const income = baseIncome * Math.pow(1 + incomeGrowthRate, yearOffset);
      const expenses = baseExpenses * Math.pow(1 + expenseGrowthRate, yearOffset);
      const propertyValue = basePropertyValue * Math.pow(1 + propertyValueGrowthRate, yearOffset);
      
      return {
        year: currentYear + yearOffset,
        income: Math.round(income),
        expenses: Math.round(expenses),
        cashFlow: Math.round(income - expenses),
        propertyValue: Math.round(propertyValue),
        roi: Math.round(((income - expenses) / (propertyValue * 0.25)) * 100) / 100 // ROI based on 25% down payment
      };
    });
  };

  // Property value distribution for the pie chart
  const getPropertyDistribution = () => {
    // Group properties by type
    const typeGroups = properties.reduce((groups, property) => {
      const type = property.propertyType;
      if (!groups[type]) {
        groups[type] = {
          name: type,
          value: 0,
          count: 0
        };
      }
      
      groups[type].value += property.rentAmount * 12 * 10; // Estimated property value
      groups[type].count += 1;
      
      return groups;
    }, {});
    
    return Object.values(typeGroups);
  };
  
  // Property expense breakdown
  const getExpenseBreakdown = () => {
    const totalExpenses = estimatedExpenses;
    
    return [
      { name: 'Maintenance', value: totalExpenses * 0.40, color: '#0088FE' },
      { name: 'Insurance', value: totalExpenses * 0.15, color: '#00C49F' },
      { name: 'Property Taxes', value: totalExpenses * 0.25, color: '#FFBB28' },
      { name: 'Management Fees', value: totalExpenses * 0.10, color: '#FF8042' },
      { name: 'Utilities', value: totalExpenses * 0.10, color: '#8884d8' }
    ];
  };
  
  // Tax Calculator functionality
  const calculateTax = () => {
    const taxableIncome = income - expenses;
    const taxAmount = (taxableIncome > 0) ? taxableIncome * (taxRate / 100) : 0;
    
    return {
      taxableIncome,
      taxAmount,
      afterTaxIncome: taxableIncome - taxAmount
    };
  };
  
  // Loan Calculator functionality
  const calculateLoan = () => {
    const monthlyInterest = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)) / 
      (Math.pow(1 + monthlyInterest, totalPayments) - 1);
      
    const totalInterest = (monthlyPayment * totalPayments) - loanAmount;
    
    // Generate amortization schedule summary (yearly)
    const amortizationSummary = [];
    let remainingPrincipal = loanAmount;
    
    for (let year = 1; year <= Math.min(loanTerm, 5); year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingPrincipal * monthlyInterest;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        remainingPrincipal -= principalPayment;
      }
      
      amortizationSummary.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: remainingPrincipal
      });
    }
    
    return {
      monthlyPayment,
      totalInterest,
      totalCost: loanAmount + totalInterest,
      amortizationSummary
    };
  };
  
  // ROI Calculator functionality
  const calculateROI = () => {
    // Assume 25% down payment
    const downPayment = purchasePrice * 0.25;
    const mortgage = purchasePrice - downPayment;
    
    // Monthly mortgage payment (simplified)
    const monthlyInterest = 0.075 / 12; // 7.5% annual rate
    const totalPayments = 20 * 12; // 20 year term
    const monthlyPayment = mortgage * 
      (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)) / 
      (Math.pow(1 + monthlyInterest, totalPayments) - 1);
    
    const annualMortgagePayment = monthlyPayment * 12;
    
    // Calculate cash flow
    const netOperatingIncome = annualRent - annualExpenses;
    const cashFlow = netOperatingIncome - annualMortgagePayment;
    
    // Calculate ROI metrics
    const cashOnCashReturn = (cashFlow / downPayment) * 100;
    
    // 5-year projection
    const projection = [];
    let currentValue = purchasePrice;
    let cumulativeCashFlow = 0;
    
    for (let year = 1; year <= 5; year++) {
      currentValue *= (1 + (appreciationRate / 100));
      cumulativeCashFlow += cashFlow * Math.pow(1.03, year - 1); // Assuming 3% annual rent increase
      
      const totalReturn = (currentValue - purchasePrice) + cumulativeCashFlow;
      const annualizedROI = (Math.pow((purchasePrice + totalReturn) / purchasePrice, 1/year) - 1) * 100;
      
      projection.push({
        year,
        propertyValue: Math.round(currentValue),
        appreciation: Math.round(currentValue - purchasePrice),
        cashFlow: Math.round(cumulativeCashFlow),
        totalReturn: Math.round(totalReturn),
        roi: annualizedROI.toFixed(2)
      });
    }
    
    return {
      monthlyCashFlow: cashFlow / 12,
      cashOnCashReturn,
      capRate: (netOperatingIncome / purchasePrice) * 100,
      projection
    };
  };
  
  // Get data for different calculator functions
  const monthlyData = getMonthlyData();
  const projectionData = getProjectionData();
  const propertyDistribution = getPropertyDistribution();
  const expenseBreakdown = getExpenseBreakdown();
  const taxResults = calculateTax();
  const loanResults = calculateLoan();
  const roiResults = calculateROI();
  
  const renderPropertyBreakdown = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Distribution</CardTitle>
              <CardDescription>Breakdown of property value by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {propertyDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Property Count by Type</h4>
                <div className="space-y-1">
                  {propertyDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.count} properties</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              <CardDescription>Annual expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseBreakdown.map((expense, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        {expense.name}
                      </span>
                      <span>{formatCurrency(expense.value)}</span>
                    </div>
                    <Progress 
                      value={(expense.value / expenseBreakdown.reduce((sum, exp) => sum + exp.value, 0)) * 100} 
                      className={`h-1.5 ${index === 0 ? '[&>div]:bg-blue-500' : 
                                          index === 1 ? '[&>div]:bg-green-500' : 
                                          index === 2 ? '[&>div]:bg-yellow-500' : 
                                          index === 3 ? '[&>div]:bg-orange-500' : 
                                          '[&>div]:bg-purple-500'}`}
                    />
                  </div>
                ))}
                
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total Annual Expenses</span>
                    <span>{formatCurrency(estimatedExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Monthly Average</span>
                    <span>{formatCurrency(estimatedExpenses / 12)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Performance</CardTitle>
            <CardDescription>Key performance metrics by property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-7 font-medium text-sm p-3 bg-muted/50">
                <div>Property</div>
                <div>Monthly Rent</div>
                <div>Annual NOI</div>
                <div>Cap Rate</div>
                <div>Cash Flow</div>
                <div>ROI</div>
                <div>Occupancy</div>
              </div>
              <div className="divide-y">
                {properties.map((property, index) => {
                  const propertyLeases = leases.filter(lease => lease.propertyId === property.id);
                  const isOccupied = propertyLeases.some(lease => {
                    const startDate = new Date(lease.startDate);
                    const endDate = new Date(lease.endDate);
                    const today = new Date();
                    return startDate <= today && endDate >= today && lease.active;
                  });
                  
                  const annualNOI = (property.rentAmount * 12) - (property.rentAmount * 12 * 0.3);
                  const propertyValue = property.rentAmount * 12 * 10;
                  const capRate = (annualNOI / propertyValue) * 100;
                  
                  // Calculate mortgage payment (simplified)
                  const loanAmount = propertyValue * 0.75; // 75% LTV
                  const monthlyInterest = 0.075 / 12; // 7.5% annual rate
                  const totalPayments = 20 * 12; // 20 year term
                  const monthlyPayment = loanAmount * 
                    (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)) / 
                    (Math.pow(1 + monthlyInterest, totalPayments) - 1);
                  
                  const monthlyCashFlow = property.rentAmount - (property.rentAmount * 0.3 / 12) - monthlyPayment;
                  const downPayment = propertyValue * 0.25; // 25% down payment
                  const roi = (monthlyCashFlow * 12) / downPayment * 100;
                  
                  return (
                    <div key={index} className="grid grid-cols-7 p-3 text-sm items-center">
                      <div className="font-medium truncate">{property.address.split(',')[0]}</div>
                      <div>{formatCurrency(property.rentAmount)}</div>
                      <div>{formatCurrency(annualNOI)}</div>
                      <div className="flex items-center">
                        <span className={`${capRate >= 8 ? 'text-green-600' : 
                                         capRate >= 6 ? 'text-amber-600' : 
                                         'text-red-600'}`}>
                          {capRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(monthlyCashFlow)}/mo
                      </div>
                      <div>{roi.toFixed(1)}%</div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isOccupied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isOccupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderCashFlowAnalysis = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
            <CardDescription>Income and expenses over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `${value / 1000}k`}
                    label={{ value: 'BWP', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4CAF50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#FF5722" />
                  <Bar dataKey="profit" name="Profit" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">5-Year Projection</CardTitle>
              <CardDescription>Financial performance forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => `${value / 1000000}M`}
                      label={{ value: 'BWP', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="income" name="Income" fill="#4CAF50" stroke="#4CAF50" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" fill="#FF5722" stroke="#FF5722" />
                    <Area type="monotone" dataKey="cashFlow" name="Cash Flow" fill="#2196F3" stroke="#2196F3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-4">
                  {projectionData.map((data, index) => (
                    <div key={index} className={`text-center p-2 rounded-md ${
                      index === 0 ? 'bg-blue-50' : 
                      index === 1 ? 'bg-green-50' : 
                      index === 2 ? 'bg-yellow-50' : 
                      index === 3 ? 'bg-orange-50' : 
                      'bg-purple-50'
                    }`}>
                      <div className="text-xs font-medium text-muted-foreground">{data.year}</div>
                      <div className="text-lg font-bold">{formatCurrency(data.cashFlow)}</div>
                      <div className="text-xs">Cash Flow</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Growth</CardTitle>
              <CardDescription>Property value and ROI forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => `${value / 1000000}M`}
                      label={{ value: 'Value (BWP)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 'dataMax + 2']}
                      label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'roi' ? `${value}%` : formatCurrency(Number(value)),
                        name === 'roi' ? 'ROI' : 'Property Value'
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="propertyValue" 
                      name="Property Value" 
                      stroke="#9C27B0" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="roi" 
                      name="ROI" 
                      stroke="#FFC107" 
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-purple-50">
                  <div className="text-sm font-medium text-purple-700">Property Value (5y)</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(projectionData[projectionData.length - 1].propertyValue)}
                  </div>
                  <div className="text-sm text-purple-600">
                    {formatCurrency(
                      projectionData[projectionData.length - 1].propertyValue - 
                      projectionData[0].propertyValue
                    )} growth
                  </div>
                </div>
                <div className="p-3 rounded-md bg-amber-50">
                  <div className="text-sm font-medium text-amber-700">Average ROI (5y)</div>
                  <div className="text-xl font-bold">
                    {(projectionData.reduce((sum, data) => sum + parseFloat(data.roi), 0) / 
                     projectionData.length).toFixed(2)}%
                  </div>
                  <div className="text-sm text-amber-600">
                    {((parseFloat(projectionData[projectionData.length - 1].roi) - 
                      parseFloat(projectionData[0].roi))).toFixed(2)}% change
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  const renderTaxCalculator = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Estimation Calculator</CardTitle>
            <CardDescription>Estimate your rental property tax liability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="income">Annual Rental Income (BWP)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="expenses">Deductible Expenses (BWP)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                      className="text-lg"
                    />
                    <span className="text-lg">%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Tax Deductibles</AlertTitle>
                    <AlertDescription className="text-sm text-blue-700">
                      Common deductible expenses include repairs, maintenance, insurance, property taxes,
                      management fees, and mortgage interest.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Tax Calculation Updated",
                        description: "Your tax estimation has been calculated based on the provided figures.",
                      })
                    }}
                    className="w-full"
                  >
                    Calculate Tax
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Gross Rental Income</div>
                        <div className="text-lg font-bold">{formatCurrency(income)}</div>
                      </div>
                      <Receipt className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Deductible Expenses</div>
                        <div className="text-lg font-bold">- {formatCurrency(expenses)}</div>
                      </div>
                      <Calculator className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-blue-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-blue-600">Taxable Rental Income</div>
                        <div className="text-lg font-bold text-blue-700">
                          {formatCurrency(taxResults.taxableIncome)}
                        </div>
                      </div>
                      <ArrowUpDown className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-orange-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-orange-600">
                          Tax Payable ({taxRate}%)
                        </div>
                        <div className="text-lg font-bold text-orange-700">
                          {formatCurrency(taxResults.taxAmount)}
                        </div>
                      </div>
                      <Percent className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-green-600">After-Tax Income</div>
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(taxResults.afterTaxIncome)}
                        </div>
                      </div>
                      <PiggyBank className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </div>
                
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Tax Disclaimer</AlertTitle>
                  <AlertDescription className="text-sm text-amber-700">
                    This is only an estimation. Please consult with a tax professional for 
                    accurate tax advice tailored to your situation.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderLoanCalculator = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
            <CardDescription>Calculate mortgage payments and amortization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="loanAmount">Loan Amount (BWP)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="interestRate"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                      step={0.1}
                      className="text-lg"
                    />
                    <span className="text-lg">%</span>
                  </div>
                  
                  <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
                      min={1}
                      max={30}
                      className="text-lg"
                    />
                    <span className="text-lg">years</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-blue-50">
                    <div className="text-sm text-blue-600">Monthly Payment</div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatCurrency(loanResults.monthlyPayment)}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-amber-50">
                    <div className="text-sm text-amber-600">Total Interest</div>
                    <div className="text-xl font-bold text-amber-700">
                      {formatCurrency(loanResults.totalInterest)}
                    </div>
                  </div>
                </div>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Payment Breakdown</AlertTitle>
                  <AlertDescription className="text-sm text-blue-700">
                    Total Cost: {formatCurrency(loanResults.totalCost)} <br />
                    Principal: {formatCurrency(loanAmount)} ({((loanAmount / loanResults.totalCost) * 100).toFixed(1)}%) <br />
                    Interest: {formatCurrency(loanResults.totalInterest)} ({((loanResults.totalInterest / loanResults.totalCost) * 100).toFixed(1)}%)
                  </AlertDescription>
                </Alert>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Amortization Schedule (First 5 Years)</h3>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 font-medium text-sm p-3 bg-muted/50">
                      <div>Year</div>
                      <div>Principal</div>
                      <div>Interest</div>
                      <div>Remaining Balance</div>
                    </div>
                    <div className="divide-y">
                      {loanResults.amortizationSummary.map((year, index) => (
                        <div key={index} className="grid grid-cols-4 p-3 text-sm">
                          <div className="font-medium">Year {year.year}</div>
                          <div>{formatCurrency(year.principal)}</div>
                          <div>{formatCurrency(year.interest)}</div>
                          <div>{formatCurrency(year.balance)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Principal', value: loanAmount, color: '#2196F3' },
                          { name: 'Interest', value: loanResults.totalInterest, color: '#FFA000' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        <Cell fill="#2196F3" />
                        <Cell fill="#FFA000" />
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderROICalculator = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI Calculator</CardTitle>
            <CardDescription>Analyze return on investment for property purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="purchasePrice">Purchase Price (BWP)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="annualRent">Annual Rental Income (BWP)</Label>
                  <Input
                    id="annualRent"
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="annualExpenses">Annual Expenses (BWP)</Label>
                  <Input
                    id="annualExpenses"
                    type="number"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  
                  <Label htmlFor="appreciationRate">Annual Appreciation Rate (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="appreciationRate"
                      type="number"
                      value={appreciationRate}
                      onChange={(e) => setAppreciationRate(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={15}
                      step={0.1}
                      className="text-lg"
                    />
                    <span className="text-lg">%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-green-50">
                    <div className="text-sm text-green-600">Monthly Cash Flow</div>
                    <div className="text-xl font-bold text-green-700">
                      {formatCurrency(roiResults.monthlyCashFlow)}
                    </div>
                    <div className="text-xs text-green-600">
                      {roiResults.monthlyCashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-blue-50">
                    <div className="text-sm text-blue-600">Cash-on-Cash Return</div>
                    <div className="text-xl font-bold text-blue-700">
                      {roiResults.cashOnCashReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-blue-600">
                      Annual return on down payment
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-purple-50">
                    <div className="text-sm text-purple-600">Cap Rate</div>
                    <div className="text-xl font-bold text-purple-700">
                      {roiResults.capRate.toFixed(2)}%
                    </div>
                    <div className="text-xs text-purple-600">
                      NOI / Property Value
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md bg-amber-50">
                    <div className="text-sm text-amber-600">5-Year ROI</div>
                    <div className="text-xl font-bold text-amber-700">
                      {roiResults.projection[4].roi}%
                    </div>
                    <div className="text-xs text-amber-600">
                      Annualized total return
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">5-Year Projection</h3>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 font-medium text-sm p-3 bg-muted/50">
                      <div>Year</div>
                      <div>Property Value</div>
                      <div>Cumulative Cash Flow</div>
                      <div>Total Return</div>
                    </div>
                    <div className="divide-y">
                      {roiResults.projection.map((year, index) => (
                        <div key={index} className="grid grid-cols-4 p-3 text-sm">
                          <div className="font-medium">Year {year.year}</div>
                          <div>{formatCurrency(year.propertyValue)}</div>
                          <div>{formatCurrency(year.cashFlow)}</div>
                          <div className="font-medium">
                            {formatCurrency(year.totalReturn)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiResults.projection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="appreciation" name="Appreciation" fill="#9C27B0" stackId="a" />
                      <Bar dataKey="cashFlow" name="Cash Flow" fill="#4CAF50" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Alert className="bg-blue-50 border-blue-200 w-full">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Investment Tips</AlertTitle>
              <AlertDescription className="text-sm text-blue-700">
                A good rental property typically has a cap rate between 4-10%, positive cash flow, 
                and a cash-on-cash return of at least 6-8%. The 1% rule suggests monthly rent should be at least 
                1% of the purchase price.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  const renderDocumentLibrary = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Document Library</CardTitle>
            <CardDescription>Access and manage important financial documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-md font-medium">Tax Documents</h3>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
              
              <div className="rounded-md border divide-y">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">2023 Tax Return</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 15/04/2023</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">Property Income Statement 2023</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 05/01/2024</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">Tax Deduction Records 2023</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 12/12/2023</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-md font-medium">Mortgage Documents</h3>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
              
              <div className="rounded-md border divide-y">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <div className="font-medium">Mortgage Statement - 123 Main St</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 03/02/2024</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <div className="font-medium">Loan Agreement - 45 Park Ave</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 15/07/2023</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="text-md font-medium">Financial Reports</h3>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
              
              <div className="rounded-md border divide-y">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <div className="font-medium">Annual ROI Report 2023</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 10/01/2024</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <div className="font-medium">Cash Flow Analysis Q4 2023</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 05/01/2024</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <div className="font-medium">Property Expense Breakdown 2023</div>
                      <div className="text-xs text-muted-foreground">Uploaded on 18/12/2023</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Comprehensive financial tools for managing your property portfolio
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select 
            defaultValue={new Date().getFullYear().toString()} 
            onValueChange={(value) => {
              toast({
                title: "Time Period Changed",
                description: `Financial data updated for ${value}.`,
              })
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Portfolio Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                +5.2% YTD
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Monthly Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyRentalIncome)}</p>
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                +3.8% YTD
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Cash-on-Cash ROI</p>
                  <p className="text-2xl font-bold">{cashOnCash.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                +0.7% YTD
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                +2.5% YTD
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex overflow-auto pb-2 border-b mb-6">
        <div className="flex space-x-1">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "overview" ? "active" : ""}
          >
            <Building className="h-4 w-4 mr-2" />
            Portfolio Overview
          </Button>
          
          <Button 
            variant={activeTab === "cashflow" ? "default" : "ghost"}
            onClick={() => setActiveTab("cashflow")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "cashflow" ? "active" : ""}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Cash Flow Analysis
          </Button>
          
          <Button 
            variant={activeTab === "tax" ? "default" : "ghost"}
            onClick={() => setActiveTab("tax")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "tax" ? "active" : ""}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Tax Calculator
          </Button>
          
          <Button 
            variant={activeTab === "loan" ? "default" : "ghost"}
            onClick={() => setActiveTab("loan")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "loan" ? "active" : ""}
          >
            <LineChart className="h-4 w-4 mr-2" />
            Loan Calculator
          </Button>
          
          <Button 
            variant={activeTab === "roi" ? "default" : "ghost"}
            onClick={() => setActiveTab("roi")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "roi" ? "active" : ""}
          >
            <Percent className="h-4 w-4 mr-2" />
            ROI Calculator
          </Button>
          
          <Button 
            variant={activeTab === "documents" ? "default" : "ghost"}
            onClick={() => setActiveTab("documents")}
            className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            data-state={activeTab === "documents" ? "active" : ""}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Financial Documents
          </Button>
        </div>
      </div>
      
      {activeTab === "overview" && renderPropertyBreakdown()}
      {activeTab === "cashflow" && renderCashFlowAnalysis()}
      {activeTab === "tax" && renderTaxCalculator()}
      {activeTab === "loan" && renderLoanCalculator()}
      {activeTab === "roi" && renderROICalculator()}
      {activeTab === "documents" && renderDocumentLibrary()}
    </div>
  );
}