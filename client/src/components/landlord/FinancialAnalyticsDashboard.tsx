import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Property, Lease, Payment } from '@shared/schema';
import { Building, TrendingUp, DollarSign, ArrowRight, PiggyBank, BarChart3, Percent } from 'lucide-react';

interface FinancialAnalyticsProps {
  properties: Property[];
  leases: Lease[];
  payments: Payment[];
}

export default function FinancialAnalyticsDashboard({ properties, leases, payments }: FinancialAnalyticsProps) {
  // Helper function to format currency in BWP
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'BWP',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Generate monthly income data for the past 12 months
  const getMonthlyIncomeData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = new Date().getFullYear() - (currentMonth < monthIndex ? 1 : 0);
      const month = months[monthIndex];
      
      // Calculate total rent collected for this month/year
      const monthlyIncome = payments
        .filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year;
        })
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate expected income based on all properties
      const expectedIncome = properties.reduce((sum, property) => sum + property.rentAmount, 0);
      
      data.unshift({
        name: month,
        actual: monthlyIncome,
        expected: expectedIncome,
      });
    }

    return data;
  };

  // Calculate ROI for each property
  const getPropertyROIData = () => {
    return properties.map(property => {
      // For this example, we'll use a simplified ROI calculation
      // In a real application, you would include purchase price, expenses, appreciation, etc.
      const propertyPayments = payments.filter(payment => {
        const lease = leases.find(l => l.id === payment.leaseId);
        return lease && lease.propertyId === property.id;
      });
      
      const annualIncome = propertyPayments.reduce((sum, payment) => sum + payment.amount, 0);
      // Since we don't have these properties in our schema, we'll calculate estimates
      const estimatedValue = property.rentAmount * 12 * 10; // Simplified estimate based on annual rent
      const maintenanceCosts = annualIncome * 0.1; // Assume 10% of income for maintenance
      
      // Calculate a simplified ROI: (Annual Income - Maintenance) / Estimated Value
      const roi = estimatedValue > 0 
        ? ((annualIncome - maintenanceCosts) / estimatedValue) * 100 
        : 0;
      
      return {
        name: property.address.split(',')[0], // Use just the street address for brevity
        roi: parseFloat(roi.toFixed(2)),
        income: annualIncome
      };
    });
  };

  // Calculate expense breakdown
  const getExpenseBreakdown = () => {
    // In a real application, you would categorize actual expenses
    // Here, we'll use a simplified model with estimated percentages
    const totalExpenses = properties.reduce((sum, property) => {
      return sum + (property.rentAmount * 0.1); // Estimate maintenance costs as 10% of rent
    }, 0);
    
    return [
      { name: 'Maintenance', value: totalExpenses * 0.40, color: '#0088FE' },
      { name: 'Insurance', value: totalExpenses * 0.15, color: '#00C49F' },
      { name: 'Property Taxes', value: totalExpenses * 0.25, color: '#FFBB28' },
      { name: 'Management Fees', value: totalExpenses * 0.10, color: '#FF8042' },
      { name: 'Utilities', value: totalExpenses * 0.10, color: '#8884d8' }
    ];
  };

  // Calculate occupancy rate
  const getOccupancyRate = () => {
    const totalUnits = properties.reduce((sum, property) => sum + 1, 0);
    const occupiedUnits = leases.filter(lease => {
      const startDate = new Date(lease.startDate);
      const endDate = new Date(lease.endDate);
      const today = new Date();
      return startDate <= today && endDate >= today;
    }).length;
    
    return (occupiedUnits / totalUnits) * 100;
  };

  // Calculate cash flow
  const getCashFlow = () => {
    const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = properties.reduce((sum, property) => {
      return sum + (property.rentAmount * 0.1); // Estimate maintenance costs as 10% of rent
    }, 0);
    
    return totalIncome - totalExpenses;
  };

  // Calculate mortgage equity
  const getMortgageEquityData = () => {
    // Simplified mortgage calculation for visualization
    const totalPropertyValue = properties.reduce((sum, property) => 
      sum + (property.rentAmount * 12 * 10), 0); // Estimate property value based on annual rent
    
    // Assume 70% of properties have mortgages with average 30% equity
    const mortgageRemaining = totalPropertyValue * 0.7 * 0.7;
    const equity = totalPropertyValue - mortgageRemaining;
    
    return [
      { name: 'Equity', value: equity, color: '#4CAF50' },
      { name: 'Mortgage', value: mortgageRemaining, color: '#F44336' }
    ];
  };

  // Calculate cap rates
  const getCapRates = () => {
    return properties.map(property => {
      const annualIncome = property.rentAmount * 12;
      const expenses = annualIncome * 0.1; // Estimate maintenance costs as 10% of annual income
      const noi = annualIncome - expenses;
      const propertyValue = property.rentAmount * 12 * 10; // Estimate property value based on rent
      const capRate = (noi / propertyValue) * 100;
      
      return {
        name: property.address.split(',')[0],
        capRate: parseFloat(capRate.toFixed(2))
      };
    });
  };

  // Data for the various charts
  const monthlyIncomeData = getMonthlyIncomeData();
  const propertyROIData = getPropertyROIData();
  const expenseBreakdown = getExpenseBreakdown();
  const occupancyRate = getOccupancyRate();
  const cashFlow = getCashFlow();
  const mortgageEquityData = getMortgageEquityData();
  const capRateData = getCapRates();

  // Total portfolio value
  const totalPortfolioValue = properties.reduce((sum, property) => 
    sum + (property.rentAmount * 12 * 10), 0); // Estimate property value based on annual rent

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {properties.length} properties in portfolio
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className={`h-5 w-5 ${cashFlow >= 0 ? 'text-green-500' : 'text-red-500'} mr-2`} />
              <div className="text-2xl font-bold">{formatCurrency(cashFlow / 12)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cashFlow >= 0 ? 'Positive' : 'Negative'} monthly cash flow
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">{occupancyRate.toFixed(0)}%</div>
            </div>
            <div className="mt-2">
              <Progress value={occupancyRate} className="h-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cap Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Percent className="h-5 w-5 text-indigo-500 mr-2" />
              <div className="text-2xl font-bold">
                {(capRateData.reduce((sum, item) => sum + item.capRate, 0) / capRateData.length).toFixed(2)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average capitalization rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="income">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="income">Income Analysis</TabsTrigger>
          <TabsTrigger value="roi">Property ROI</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="mortgage">Equity & Loans</TabsTrigger>
        </TabsList>
        
        {/* Income Analysis Tab */}
        <TabsContent value="income" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Income Analysis</CardTitle>
              <CardDescription>
                Actual vs expected rental income over the past 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyIncomeData}>
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
                    <Bar dataKey="actual" name="Actual Income" fill="#4CAF50" />
                    <Bar dataKey="expected" name="Expected Income" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="bg-blue-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-blue-700 text-sm font-medium">Collection Rate</p>
                    <p className="text-2xl font-bold">
                      {((monthlyIncomeData.reduce((sum, month) => sum + month.actual, 0) / 
                         monthlyIncomeData.reduce((sum, month) => sum + month.expected, 0)) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-green-700 text-sm font-medium">Avg. Monthly Income</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlyIncomeData.reduce((sum, month) => sum + month.actual, 0) / 12)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-purple-700 text-sm font-medium">Yearly Total</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlyIncomeData.reduce((sum, month) => sum + month.actual, 0))}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ROI Analysis Tab */}
        <TabsContent value="roi" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property ROI Comparison</CardTitle>
              <CardDescription>
                Return on investment analysis across your property portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyROIData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Income (BWP)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'roi' ? `${value}%` : formatCurrency(Number(value)),
                        name === 'roi' ? 'ROI' : 'Annual Income'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="roi" name="ROI" fill="#FF5722" />
                    <Bar yAxisId="right" dataKey="income" name="Annual Income" fill="#3F51B5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="bg-orange-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-orange-700 text-sm font-medium">Avg. ROI</p>
                    <p className="text-2xl font-bold">
                      {(propertyROIData.reduce((sum, prop) => sum + prop.roi, 0) / propertyROIData.length).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-indigo-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-indigo-700 text-sm font-medium">Best Performing</p>
                    <p className="text-xl font-bold truncate">
                      {propertyROIData.sort((a, b) => b.roi - a.roi)[0]?.name || "N/A"}
                    </p>
                    <p className="text-sm font-medium text-indigo-600">
                      {propertyROIData.sort((a, b) => b.roi - a.roi)[0]?.roi.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-red-700 text-sm font-medium">Needs Attention</p>
                    <p className="text-xl font-bold truncate">
                      {propertyROIData.sort((a, b) => a.roi - b.roi)[0]?.name || "N/A"}
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      {propertyROIData.sort((a, b) => a.roi - b.roi)[0]?.roi.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              <CardDescription>
                Analysis of property-related expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium mb-4">Expense Summary</h3>
                  <div className="space-y-3">
                    {expenseBreakdown.map((expense, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{expense.name}</span>
                            <span className="font-medium">{formatCurrency(expense.value)}</span>
                          </div>
                          <Progress 
                            value={(expense.value / expenseBreakdown.reduce((sum, exp) => sum + exp.value, 0)) * 100} 
                            className="h-1 mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Expenses</span>
                      <span className="font-bold">
                        {formatCurrency(expenseBreakdown.reduce((sum, expense) => sum + expense.value, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Mortgage & Equity Tab */}
        <TabsContent value="mortgage" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mortgage & Equity Analysis</CardTitle>
              <CardDescription>
                Track your property equity growth and mortgage payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Portfolio Equity Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mortgageEquityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {mortgageEquityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {mortgageEquityData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-medium">{formatCurrency(item.value)}</span>
                          </div>
                          <Progress 
                            value={(item.value / mortgageEquityData.reduce((sum, i) => sum + i.value, 0)) * 100} 
                            className={`h-1 mt-1 ${item.name === 'Equity' ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-4">Loan-to-Value Ratio</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">Overall LTV Ratio</p>
                      <p className="text-3xl font-bold">
                        {(mortgageEquityData[1].value / (mortgageEquityData[0].value + mortgageEquityData[1].value) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-6">
                      <div 
                        className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                        style={{ 
                          width: `${(mortgageEquityData[1].value / (mortgageEquityData[0].value + mortgageEquityData[1].value) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>0% (Fully Paid)</span>
                      <span>50%</span>
                      <span>100% (Full Mortgage)</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Financial Health Indicators</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Debt Service Coverage Ratio</span>
                          <span className="font-medium">1.54</span>
                        </div>
                        <Progress value={77} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Vacancy Impact Resilience</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <Progress value={68} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Emergency Fund Adequacy</span>
                          <span className="font-medium">83%</span>
                        </div>
                        <Progress value={83} className="h-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}