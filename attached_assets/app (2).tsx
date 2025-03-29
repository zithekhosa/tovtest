"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Home, Building, FileText, Wrench, DollarSign, BarChart, Menu, Users } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import LandlordDashboard from "./landlord-dashboard"
import TenantDashboard from "./tenant-dashboard"
import MaintenancePortal from "./maintenance-portal"
import DocumentCenter from "./document-center"

function HomePage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent, userType: string) => {
    e.preventDefault()
    onLogin(userType)
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={(e) => handleLogin(e, "tenant")}>Tenant Login</Button>
              <Button variant="default" onClick={(e) => handleLogin(e, "landlord")}>Landlord Login</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <section className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Simplify Your Real Estate Management</h1>
              <p className="text-xl mb-8">Streamline your property management tasks with our all-in-one solution</p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" onClick={(e) => handleLogin(e, "landlord")}>Get Started as Landlord</Button>
                <Button size="lg" variant="outline" onClick={(e) => handleLogin(e, "tenant")}>Get Started as Tenant</Button>
              </div>
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
                <form onSubmit={(e) => handleLogin(e, "landlord")}>
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

  const handleLogin = (type) => {
    setIsLoggedIn(true)
    setUserType(type)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveTab("dashboard")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return userType === "tenant" ? <TenantDashboard /> : <LandlordDashboard />
      case "properties":
        return <LandlordDashboard />
      case "maintenance":
        return <MaintenancePortal />
      case "documents":
        return <DocumentCenter />
      default:
        return null
    }
  }

  const getMenuItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
      { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
    ]

    const userSpecificItems = {
      tenant: [
        { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
      ],
      landlord: [
        { id: "properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        { id: "financials", label: "Financials", icon: <DollarSign className="h-5 w-5" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart className="h-5 w-5" /> },
        { id: "tenants", label: "Tenants", icon: <Users className="h-5 w-5" /> },
      ],
    }

    return [...commonItems, ...userSpecificItems[userType]]
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