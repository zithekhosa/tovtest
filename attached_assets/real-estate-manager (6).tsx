"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Home, Building, FileText, Wrench, DollarSign, BarChart, Menu, Users, Search, Pin } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Import all components
import TenantDashboard from "./tenant-dashboard"
import LandlordDashboard from "./landlord-dashboard"
import AgentDashboard from "./agent-dashboard"
import MaintenanceDashboard from "./maintenance-dashboard"
import CommunicationPortal from "./communication-portal"
import MaintenanceRequestForm from "./maintenance-request-form"
import AIPropertyValuation from "./ai-property-valuation"
import DocumentCenter from "./document-center"
import FinancialAnalytics from "./financial-analytics"
import TenantScreening from "./tenant-screening"
import RentalHistory from "./rental-history"
import PropertyListing from "./property-listing"
import LeaseManagement from "./lease-management"
import MaintenanceSchedule from "./maintenance-schedule"
import RentPayment from "./rent-payment"
import PropertyAnalytics from "./property-analytics"

const properties = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=500",
    title: "Modern Phakalane Estate Villa",
    price: "P4,850,000",
    location: "Phakalane Golf Estate, Gaborone",
    specs: "4 beds • 3.5 baths • 350 sq m",
    description: "Luxury villa with golf course views and modern finishes"
  },
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=500",
    title: "Block 6 Family Home",
    price: "P2,950,000",
    location: "Block 6, Gaborone",
    specs: "3 beds • 2.5 baths • 250 sq m",
    description: "Spacious family home with servant quarters"
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=500",
    title: "Executive Block 5 Residence",
    price: "P3,200,000",
    location: "Block 5, Gaborone",
    specs: "4 beds • 3 baths • 300 sq m",
    description: "Modern home near CBD with swimming pool"
  },
  {
    id: 4,
    image: "/placeholder.svg?height=400&width=500",
    title: "Broadhurst Garden Apartment",
    price: "P895,000",
    location: "Broadhurst, Gaborone",
    specs: "2 beds • 1 bath • 85 sq m",
    description: "Newly renovated apartment with security"
  },
]

function AgencyPropertyListing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [propertyType, setPropertyType] = useState('all')

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (propertyType === 'all' || property.title.toLowerCase().includes(propertyType.toLowerCase()))
  )

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <div 
            key={property.id} 
            className="relative group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg bg-white">
              <Image
                src={property.image}
                alt={property.title}
                width={400}
                height={500}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Pin className="w-4 h-4 text-primary" />
                <span className="sr-only">Save property</span>
              </Button>
              
              <div className="p-3">
                <h3 className="text-primary font-bold text-sm mb-1 truncate">{property.title}</h3>
                <p className="text-primary font-semibold text-sm">{property.price}</p>
                <p className="text-muted-foreground text-xs">{property.location}</p>
                <p className="text-muted-foreground text-xs mt-1">{property.specs}</p>
              </div>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-4 text-white h-full flex flex-col justify-end">
                  <h3 className="font-bold text-sm mb-1">{property.title}</h3>
                  <p className="font-semibold text-sm">{property.price}</p>
                  <p className="text-xs text-gray-200">{property.location}</p>
                  <p className="text-xs text-gray-300 mt-1">{property.specs}</p>
                  <p className="text-xs text-gray-300 mt-2">{property.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomePage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginType, setLoginType] = useState("tenant")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(loginType, email, password)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tov-fErG1o2ERV3FunLBDh5cjY0BhmpUnZ.png" 
                alt="TOV Logo" 
                width={100} 
                height={50} 
                className="mr-2"
              />
            </div>
            <nav className="hidden md:flex space-x-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="ghost">About</Button>
              <Button variant="ghost">Contact</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <section className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Simplify Your Real Estate Management</h1>
              <p className="text-xl mb-8">Streamline your property management tasks with our all-in-one solution</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Easily manage all your properties in one place</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Financial Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Streamline rent collection and expense management</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Centralize all your important documents</p>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginType">Login as</Label>
                      <Select value={loginType} onValueChange={setLoginType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="landlord">Landlord</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" type="submit">
                      Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Tov Real Estate Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userType, setUserType] = useState("tenant")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setActiveTab("dashboard")
  }, [userType])

  const handleLogin = (type, email, password) => {
    // Here you would typically validate the credentials
    // For this example, we'll just set the user as logged in
    setIsLoggedIn(true)
    setUserType(type)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveTab("dashboard")
    setUserType("tenant")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        switch (userType) {
          case "tenant":
            return <TenantDashboard />
          case "landlord":
            return <LandlordDashboard />
          case "agent":
            return <AgentDashboard />
          case "maintenance":
            return <MaintenanceDashboard />
          default:
            return null
        }
      case "properties":
        return userType === "tenant" ? <RentalHistory /> : <PropertyListing />
      case "leases":
        return <LeaseManagement />
      case "maintenance":
        return userType === "tenant" ? <MaintenanceRequestForm /> : <MaintenanceSchedule />
      case "payments":
        return userType === "tenant" ? <RentPayment /> : <FinancialAnalytics />
      case "documents":
        return <DocumentCenter />
      case "analytics":
        return userType === "landlord" || userType === "agent" ? <PropertyAnalytics /> : null
      case "screening":
        return userType === "landlord" || userType === "agent" ? <TenantScreening /> : null
      case "valuation":
        return userType === "landlord" || userType === "agent" ? <AIPropertyValuation /> : null
      case "communication":
        return <CommunicationPortal />
      case "agency-listings":
        return <AgencyPropertyListing />
      default:
        return null
    }
  }

  const getMenuItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
      { id: "communication", label: "Communication", icon: <FileText className="h-5 w-5" /> },
    ]

    const userSpecificItems  = {
      tenant: [
        { id: "properties", label: "Rental History", icon:  <Building className="h-5 w-5" /> },
        { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        { id: "payments", label: "Rent Payment", icon: <DollarSign className="h-5 w-5" /> },
        { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
      ],
      landlord: [
        { id: "properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { id: "leases", label: "Leases", icon: <FileText className="h-5 w-5" /> },
        { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        { id: "payments", label: "Financials", icon: <DollarSign className="h-5 w-5" /> },
        { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart className="h-5 w-5" /> },
        { id: "screening", label: "Tenant Screening", icon: <Users className="h-5 w-5" /> },
        { id: "valuation", label: "Property Valuation", icon: <Building className="h-5 w-5" /> },
      ],
      agent: [
        { id: "properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { id: "leases", label: "Leases", icon: <FileText className="h-5 w-5" /> },
        { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart className="h-5 w-5" /> },
        { id: "screening", label: "Tenant Screening", icon: <Users className="h-5 w-5" /> },
        { id: "valuation", label: "Property Valuation", icon: <Building className="h-5 w-5" /> },
        { id: "agency-listings", label: "Agency Listings", icon: <Building className="h-5 w-5" /> },
      ],
      maintenance: [
        { id: "maintenance", label: "Maintenance Requests", icon: <Wrench className="h-5 w-5" /> },
        { id: "schedule", label: "Schedule", icon: <FileText className="h-5 w-5" /> },
        { id: "inventory", label: "Inventory", icon: <Wrench className="h-5 w-5" /> },
      ],
    }

    return [...commonItems, ...(userSpecificItems[userType] || [])]
  }

  if (!isLoggedIn) {
    return <HomePage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tov-fErG1o2ERV3FunLBDh5cjY0BhmpUnZ.png" 
                  alt="TOV Logo" 
                  width={80} 
                  height={40} 
                  className="mr-2"
                />
              </Link>
            </div>
            <nav className="hidden md:flex space-x-4">
              {getMenuItems().map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="h-8"
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
            <Button
              className="md:hidden"
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
            <DialogDescription>Navigate through the application</DialogDescription>
          </DialogHeader>
          <nav className="flex flex-col space-y-2">
            {getMenuItems().map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="justify-start"
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
          <DialogFooter>
            <Button onClick={() => setIsMobileMenuOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto py-6 px-4">
        {renderContent()}
      </main>

      <footer className="border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>&copy; 2024 Tov Real Estate Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}