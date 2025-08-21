"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageSquare, BarChart3, User, LogOut, Users } from "lucide-react"
import { MessagingInterface } from "@/components/messaging-interface"
import { DashboardAnalytics } from "@/components/dashboard-analytics"
import { AddressBook } from "@/components/address-book"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"

type ActiveTab = "messaging" | "dashboard" | "address-book"

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("messaging")
  const { userEmail, setUserEmail } = useUser()
  const router = useRouter()

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 사용자 이메일 초기화
    setUserEmail(null)
    
    // 로그인 페이지로 리디렉션
    router.push('/')
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground font-sans">Certified Messaging</h1>
              <p className="text-xs text-muted-foreground font-mono">Professional Platform</p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === "messaging" ? "default" : "ghost"}
              onClick={() => setActiveTab("messaging")}
              className="font-sans"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="font-sans"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "address-book" ? "default" : "ghost"}
              onClick={() => setActiveTab("address-book")}
              className="font-sans"
            >
              <Users className="h-4 w-4 mr-2" />
              Address Book
            </Button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userEmail || "로그인되지 않음"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>로그아웃</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "messaging" && <MessagingInterface />}
        {activeTab === "dashboard" && <DashboardAnalytics />}
        {activeTab === "address-book" && <AddressBook />}
      </main>
      </div>
    </TooltipProvider>
  )
}
