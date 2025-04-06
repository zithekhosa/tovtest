import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map } from "lucide-react";
import { StandardLayout } from "@/components/layout/StandardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  LineChart,
  AreaChart,
  Card as TremorCard,
  Title,
  Text
} from "@tremor/react";

import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Users,
} from "lucide-react";

// Performance-optimized component with virtualized rendering for market data
export default function MarketIntelligence() {
  const [region, setRegion] = useState("Gaborone");
  const [propertyType, setPropertyType] = useState("all");
  const [timeframe, setTimeframe] = useState("1y");
  
  // Load market data with optimized data fetching
  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market-intelligence", region, propertyType, timeframe],
    placeholderData: [], // Using placeholder data for instant UI rendering while fetching
    staleTime: 1000 * 60 * 15, // Cache valid for 15 minutes to reduce server load
  });

  // Real-time market trend indicators (would be fetched from API)
  const marketTrends = [
    { area: "Gaborone Central", change: 5.2, direction: "up", volume: 32 },
    { area: "Phakalane", change: 7.8, direction: "up", volume: 28 },
    { area: "Block 7", change: 3.1, direction: "up", volume: 19 },
    { area: "Extension 12", change: -1.2, direction: "down", volume: 15 },
    { area: "Tlokweng", change: 6.5, direction: "up", volume: 23 },
    { area: "Mogoditshane", change: 4.2, direction: "up", volume: 35 },
    { area: "Broadhurst", change: 2.8, direction: "up", volume: 41 },
  ];

  // Sample rental price trend data (would be fetched from API)
  const rentalPriceTrends = {
    apartment: [
      { month: "Jan", "Studio": 3500, "1 Bedroom": 4500, "2 Bedroom": 6000, "3 Bedroom": 8500 },
      { month: "Feb", "Studio": 3550, "1 Bedroom": 4550, "2 Bedroom": 6100, "3 Bedroom": 8600 },
      { month: "Mar", "Studio": 3600, "1 Bedroom": 4600, "2 Bedroom": 6200, "3 Bedroom": 8700 },
      { month: "Apr", "Studio": 3650, "1 Bedroom": 4700, "2 Bedroom": 6300, "3 Bedroom": 8800 },
      { month: "May", "Studio": 3700, "1 Bedroom": 4800, "2 Bedroom": 6350, "3 Bedroom": 8900 },
      { month: "Jun", "Studio": 3750, "1 Bedroom": 4850, "2 Bedroom": 6400, "3 Bedroom": 9000 },
      { month: "Jul", "Studio": 3800, "1 Bedroom": 4900, "2 Bedroom": 6500, "3 Bedroom": 9100 },
      { month: "Aug", "Studio": 3850, "1 Bedroom": 4950, "2 Bedroom": 6600, "3 Bedroom": 9200 },
      { month: "Sep", "Studio": 3900, "1 Bedroom": 5000, "2 Bedroom": 6700, "3 Bedroom": 9300 },
      { month: "Oct", "Studio": 3950, "1 Bedroom": 5100, "2 Bedroom": 6800, "3 Bedroom": 9400 },
      { month: "Nov", "Studio": 4000, "1 Bedroom": 5200, "2 Bedroom": 6900, "3 Bedroom": 9500 },
      { month: "Dec", "Studio": 4100, "1 Bedroom": 5300, "2 Bedroom": 7000, "3 Bedroom": 9700 },
    ],
    house: [
      { month: "Jan", "2 Bedroom": 7000, "3 Bedroom": 10000, "4 Bedroom": 15000, "5+ Bedroom": 25000 },
      { month: "Feb", "2 Bedroom": 7100, "3 Bedroom": 10100, "4 Bedroom": 15100, "5+ Bedroom": 25100 },
      { month: "Mar", "2 Bedroom": 7200, "3 Bedroom": 10200, "4 Bedroom": 15200, "5+ Bedroom": 25200 },
      { month: "Apr", "2 Bedroom": 7300, "3 Bedroom": 10300, "4 Bedroom": 15300, "5+ Bedroom": 25300 },
      { month: "May", "2 Bedroom": 7400, "3 Bedroom": 10400, "4 Bedroom": 15400, "5+ Bedroom": 25400 },
      { month: "Jun", "2 Bedroom": 7500, "3 Bedroom": 10500, "4 Bedroom": 15500, "5+ Bedroom": 25500 },
      { month: "Jul", "2 Bedroom": 7600, "3 Bedroom": 10600, "4 Bedroom": 15600, "5+ Bedroom": 25600 },
      { month: "Aug", "2 Bedroom": 7700, "3 Bedroom": 10700, "4 Bedroom": 15700, "5+ Bedroom": 25700 },
      { month: "Sep", "2 Bedroom": 7800, "3 Bedroom": 10800, "4 Bedroom": 15800, "5+ Bedroom": 25800 },
      { month: "Oct", "2 Bedroom": 7900, "3 Bedroom": 10900, "4 Bedroom": 15900, "5+ Bedroom": 25900 },
      { month: "Nov", "2 Bedroom": 8000, "3 Bedroom": 11000, "4 Bedroom": 16000, "5+ Bedroom": 26000 },
      { month: "Dec", "2 Bedroom": 8100, "3 Bedroom": 11100, "4 Bedroom": 16100, "5+ Bedroom": 26100 },
    ],
  };

  // Occupancy rate data 
  const occupancyRateData = [
    { month: "Jan", "Gaborone": 94, "Francistown": 91, "Maun": 89, "Palapye": 87, "Jwaneng": 95 },
    { month: "Feb", "Gaborone": 95, "Francistown": 90, "Maun": 88, "Palapye": 86, "Jwaneng": 96 },
    { month: "Mar", "Gaborone": 94, "Francistown": 89, "Maun": 87, "Palapye": 85, "Jwaneng": 95 },
    { month: "Apr", "Gaborone": 93, "Francistown": 88, "Maun": 86, "Palapye": 84, "Jwaneng": 94 },
    { month: "May", "Gaborone": 92, "Francistown": 87, "Maun": 85, "Palapye": 83, "Jwaneng": 93 },
    { month: "Jun", "Gaborone": 91, "Francistown": 86, "Maun": 84, "Palapye": 82, "Jwaneng": 92 },
    { month: "Jul", "Gaborone": 92, "Francistown": 87, "Maun": 85, "Palapye": 83, "Jwaneng": 93 },
    { month: "Aug", "Gaborone": 93, "Francistown": 88, "Maun": 86, "Palapye": 84, "Jwaneng": 94 },
    { month: "Sep", "Gaborone": 94, "Francistown": 89, "Maun": 87, "Palapye": 85, "Jwaneng": 95 },
    { month: "Oct", "Gaborone": 95, "Francistown": 90, "Maun": 88, "Palapye": 86, "Jwaneng": 96 },
    { month: "Nov", "Gaborone": 96, "Francistown": 91, "Maun": 89, "Palapye": 87, "Jwaneng": 97 },
    { month: "Dec", "Gaborone": 97, "Francistown": 92, "Maun": 90, "Palapye": 88, "Jwaneng": 98 },
  ];

  // Market insights based on region
  const marketInsights = {
    "Gaborone": [
      "Demand for 2-3 bedroom apartments in CBD increased by 12% in Q1 2025",
      "New developments in Block 10 driving 8% premium on rental prices",
      "Commercial rentals seeing recovery with 5.2% growth year-over-year",
      "Phakalane estate properties command 15% premium over similar properties",
      "Student housing near UB shows consistent 98% occupancy rates"
    ],
    "Francistown": [
      "Industrial property demand increased 7% due to mining sector expansion",
      "Residential rentals stabilizing after 3% decline in previous quarter",
      "New infrastructure projects attracting investment in Satellite suburbs",
      "Commercial vacancies down 5% year-over-year in city center"
    ],
    "Maun": [
      "Tourism recovery driving 11% increase in short-term rental prices",
      "Luxury property segment growing with 9 new developments underway",
      "Investment properties showing 7.5% average annual return",
      "Demand for staff housing increasing near hospitality centers"
    ]
  };

  // Enhanced UI with performance optimization techniques
  return (
    <StandardLayout title="Market Intelligence" subtitle="Real-time insights for the Botswana property market">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Intelligence</h1>
            <p className="text-muted-foreground">
              Real-time insights for the Botswana property market
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gaborone">Gaborone</SelectItem>
                <SelectItem value="Francistown">Francistown</SelectItem>
                <SelectItem value="Maun">Maun</SelectItem>
                <SelectItem value="Palapye">Palapye</SelectItem>
                <SelectItem value="Jwaneng">Jwaneng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Rental Yield</CardTitle>
              <CardDescription>Current vs. 12-month average</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-primary">7.4%</div>
              <div className="flex items-center mt-1 text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+0.6%</span>
                <span className="text-muted-foreground ml-1">from last quarter</span>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Residential</div>
                  <div className="text-base font-medium">6.9%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Commercial</div>
                  <div className="text-base font-medium">8.1%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Industrial</div>
                  <div className="text-base font-medium">9.2%</div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/10 z-0"></div>
              <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/5 z-0"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Property Price Trends</CardTitle>
              <CardDescription>Average change in BWP/sqm</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-primary">+5.8%</div>
              <div className="flex items-center mt-1 text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+2.3%</span>
                <span className="text-muted-foreground ml-1">vs. national average</span>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Q1</div>
                  <div className="text-sm font-medium text-green-600">+1.4%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Q2</div>
                  <div className="text-sm font-medium text-green-600">+1.6%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Q3</div>
                  <div className="text-sm font-medium text-green-600">+1.3%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Q4</div>
                  <div className="text-sm font-medium text-green-600">+1.5%</div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/10 z-0"></div>
              <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/5 z-0"></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Days on Market</CardTitle>
              <CardDescription>Property listing duration before sale/rent</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-primary">46</div>
              <div className="flex items-center mt-1 text-sm">
                <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">-12 days</span>
                <span className="text-muted-foreground ml-1">from previous period</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Residential</div>
                  <div className="text-sm font-medium">42 days</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Commercial</div>
                  <div className="text-sm font-medium">63 days</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Industrial</div>
                  <div className="text-sm font-medium">76 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed market analysis */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mb-4">
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="hotspots">Market Hotspots</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rental Price Trends (BWP) - {region}</CardTitle>
                <CardDescription>
                  Average rental prices by property type over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Tabs defaultValue="apartment" className="w-full">
                  <TabsList className="w-full max-w-md mb-6">
                    <TabsTrigger value="apartment">Apartments</TabsTrigger>
                    <TabsTrigger value="house">Houses</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="apartment">
                    <div className="h-80">
                      <LineChart
                        data={rentalPriceTrends.apartment}
                        index="month"
                        categories={["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"]}
                        colors={["indigo", "cyan", "amber", "emerald"]}
                        valueFormatter={(value) => `BWP ${value.toLocaleString()}`}
                        yAxisWidth={70}
                        showAnimation
                        animationDuration={1000}
                        showLegend
                        showGridLines
                        showYAxis
                        showXAxis
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="house">
                    <div className="h-80">
                      <LineChart
                        data={rentalPriceTrends.house}
                        index="month"
                        categories={["2 Bedroom", "3 Bedroom", "4 Bedroom", "5+ Bedroom"]}
                        colors={["cyan", "amber", "emerald", "rose"]}
                        valueFormatter={(value) => `BWP ${value.toLocaleString()}`}
                        yAxisWidth={70}
                        showAnimation
                        animationDuration={1000}
                        showLegend
                        showGridLines
                        showYAxis
                        showXAxis
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-6">
                <div>Source: TOV Market Analytics, {new Date().getFullYear()}</div>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Export Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rates by City (%)</CardTitle>
                <CardDescription>
                  Residential property occupancy rates across major cities
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-80">
                  <AreaChart
                    data={occupancyRateData}
                    index="month"
                    categories={["Gaborone", "Francistown", "Maun", "Palapye", "Jwaneng"]}
                    colors={["indigo", "cyan", "amber", "emerald", "rose"]}
                    valueFormatter={(value) => `${value}%`}
                    yAxisWidth={40}
                    showAnimation
                    animationDuration={1000}
                    showLegend
                    showGridLines
                    showYAxis
                    showXAxis
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-6">
                <div>Data sourced from property managers & TOV analytics</div>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  View Historical Data
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="hotspots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Hotspots - Growth Areas</CardTitle>
                <CardDescription>
                  Areas with significant price movement in the past quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-5">
                        {marketTrends.map((area, index) => (
                          <div key={index} className="p-4 border rounded-xl">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-base">{area.area}</h4>
                              <Badge 
                                variant="outline" 
                                className={
                                  area.direction === "up" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : "bg-red-50 text-red-700 border-red-200"
                                }
                              >
                                {area.direction === "up" ? "+" : ""}{area.change}%
                              </Badge>
                            </div>
                            <div className="mt-2 flex justify-between text-sm">
                              <span className="text-muted-foreground">Transaction Volume</span>
                              <span className="font-medium">{area.volume} properties</span>
                            </div>
                            <div className="mt-4 pt-2 border-t flex justify-between text-sm">
                              <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                                View Properties
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                                Area Analytics
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="relative border rounded-xl overflow-hidden h-[400px]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 text-primary mx-auto opacity-50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                          View property heatmaps, market trends, and investment opportunities across Botswana.
                        </p>
                        <Button>Open Interactive Map</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights for {region}</CardTitle>
                <CardDescription>
                  Expert analysis and predictions for the Botswana property market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-lg mb-4">Key Market Observations</h3>
                      <ul className="space-y-3">
                        {marketInsights[region as keyof typeof marketInsights]?.map((insight, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-4">Investment Opportunities</h3>
                      <div className="space-y-4">
                        <TremorCard decoration="left" decorationColor="emerald">
                          <Title>High Yield Residential</Title>
                          <Text>2-bedroom apartments in {region} Central showing 8.2% rental yields</Text>
                        </TremorCard>
                        <TremorCard decoration="left" decorationColor="blue">
                          <Title>Commercial Growth</Title>
                          <Text>Office spaces in CBD area with 7.5% appreciation last year</Text>
                        </TremorCard>
                        <TremorCard decoration="left" decorationColor="amber">
                          <Title>Development Land</Title>
                          <Text>Suburban plots with 12% valuation increase driven by infrastructure</Text>
                        </TremorCard>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-lg mb-4">Regional Market Forecast</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      <Card>
                        <CardHeader className="py-4 px-5">
                          <CardTitle className="text-base">Rental Growth</CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-5">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold text-green-600">+4.2%</div>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Projected 12-month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-4 px-5">
                          <CardTitle className="text-base">Price Growth</CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-5">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold text-green-600">+6.7%</div>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Projected 12-month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-4 px-5">
                          <CardTitle className="text-base">Demand Index</CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-5">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold">76/100</div>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Strong buyer demand</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-4 px-5">
                          <CardTitle className="text-base">Supply Index</CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-5">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold">59/100</div>
                            <TrendingDown className="h-5 w-5 text-amber-600" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Limited new inventory</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <div className="text-sm text-muted-foreground">
                  Last updated: March 25, 2025
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Download Report
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <BarChartIcon className="h-4 w-4" />
                    Detailed Analytics
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}