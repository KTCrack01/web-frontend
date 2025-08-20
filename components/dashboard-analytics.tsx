"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Download, RefreshCw, BarChart3, User } from "lucide-react"

type TimeFilter = "1day" | "1week" | "1month"

interface MonthlyCountsResponse {
  userEmail: string
  year: number
  counts: number[]
}

interface StatusMonthlyResponse {
  year: number
  month: number
  delivered: number
  failed: number
}

export function DashboardAnalytics() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("1week")
  const [userEmail, setUserEmail] = useState("jessica0409@naver.com")
  const [selectedYear, setSelectedYear] = useState(2023)
  const [monthlyData, setMonthlyData] = useState<MonthlyCountsResponse | null>(null)
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false)
  const [monthlyError, setMonthlyError] = useState<string | null>(null)
  
  // Status Monthly States
  const [statusYear, setStatusYear] = useState(2024)
  const [statusMonth, setStatusMonth] = useState(9)
  const [statusData, setStatusData] = useState<StatusMonthlyResponse | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const mockData = {
    totalMessages: 1247,
    activeUsers: 89,
    responseTime: "1.2s",
    successRate: "99.8%",
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  const fetchMonthlyData = async () => {
    if (!userEmail.trim()) return
    
    setIsLoadingMonthly(true)
    setMonthlyError(null)
    
    try {
      const response = await fetch(
        `http://localhost:8081/api/v1/dashboard/data/monthly-counts?userEmail=${encodeURIComponent(userEmail)}&year=${selectedYear}`
      )
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
      }
      
      const data: MonthlyCountsResponse = await response.json()
      setMonthlyData(data)
    } catch (error) {
      console.error("Monthly data fetch error:", error)
      setMonthlyError(error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다")
    } finally {
      setIsLoadingMonthly(false)
    }
  }

  const fetchStatusData = async () => {
    setIsLoadingStatus(true)
    setStatusError(null)
    
    try {
      const response = await fetch(
        `http://localhost:8081/api/v1/dashboard/data/status-monthly-counts?year=${statusYear}&month=${statusMonth}`
      )
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
      }
      
      const data: StatusMonthlyResponse = await response.json()
      setStatusData(data)
    } catch (error) {
      console.error("Status data fetch error:", error)
      setStatusError(error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다")
    } finally {
      setIsLoadingStatus(false)
    }
  }

  useEffect(() => {
    fetchMonthlyData()
  }, [userEmail, selectedYear])

  useEffect(() => {
    fetchStatusData()
  }, [statusYear, statusMonth])

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* User Email and Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans flex items-center">
              <User className="h-5 w-5 mr-2" />
              Monthly Message Statistics
            </CardTitle>
            <CardDescription className="font-mono">
              View monthly message counts for specific users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="userEmail" className="text-sm font-medium">
                  User Email
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter user email..."
                  className="mt-1"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="year" className="text-sm font-medium">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value) || 2023)}
                  min="2020"
                  max="2030"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={fetchMonthlyData}
                disabled={isLoadingMonthly || !userEmail.trim()}
                className="font-sans"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMonthly ? 'animate-spin' : ''}`} />
                {isLoadingMonthly ? 'Loading...' : 'Update'}
              </Button>
            </div>

            {/* Monthly Chart */}
            {monthlyError ? (
              <div className="h-64 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive font-mono text-center">
                  Error: {monthlyError}
                </p>
              </div>
            ) : monthlyData ? (
              <div className="h-64 bg-muted rounded-lg p-4">
                <div className="h-full flex items-end justify-between space-x-1">
                  {monthlyData.counts.map((count, index) => {
                    const maxCount = Math.max(...monthlyData.counts)
                    const height = maxCount > 0 ? (count / maxCount) * 180 : 0
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-primary rounded-t transition-all duration-300 hover:bg-primary/80 min-h-[4px] w-full"
                          style={{ height: `${height}px` }}
                          title={`${monthNames[index]}: ${count} messages`}
                        />
                        <span className="text-xs text-muted-foreground mt-2 font-mono">
                          {monthNames[index]}
                        </span>
                        <span className="text-xs text-foreground font-bold">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground font-mono">
                    Total messages in {monthlyData.year}: {monthlyData.counts.reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">
                  Enter user email and year to view monthly statistics
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Status Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Monthly Status Statistics
            </CardTitle>
            <CardDescription className="font-mono">
              View delivery success/failure rates and costs for specific month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 mb-4">
              <div className="w-32">
                <Label htmlFor="statusYear" className="text-sm font-medium">
                  Year
                </Label>
                <Input
                  id="statusYear"
                  type="number"
                  value={statusYear}
                  onChange={(e) => setStatusYear(parseInt(e.target.value) || 2024)}
                  min="2020"
                  max="2030"
                  className="mt-1"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="statusMonth" className="text-sm font-medium">
                  Month
                </Label>
                <Input
                  id="statusMonth"
                  type="number"
                  value={statusMonth}
                  onChange={(e) => setStatusMonth(parseInt(e.target.value) || 1)}
                  min="1"
                  max="12"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={fetchStatusData}
                disabled={isLoadingStatus}
                className="font-sans"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                {isLoadingStatus ? 'Loading...' : 'Update'}
              </Button>
            </div>

            {/* Status Chart and Stats */}
            {statusError ? (
              <div className="h-64 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive font-mono text-center">
                  Error: {statusError}
                </p>
              </div>
            ) : statusData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-64 bg-muted rounded-lg p-4 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simple CSS-based pie chart */}
                    <div className="w-full h-full rounded-full relative overflow-hidden bg-gray-200">
                      {statusData.delivered + statusData.failed > 0 && (
                        <>
                          <div 
                            className="absolute inset-0 rounded-full bg-green-500"
                            style={{
                              background: `conic-gradient(
                                #22c55e 0deg ${(statusData.delivered / (statusData.delivered + statusData.failed)) * 360}deg,
                                #ef4444 ${(statusData.delivered / (statusData.delivered + statusData.failed)) * 360}deg 360deg
                              )`
                            }}
                          />
                          <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {statusData.delivered + statusData.failed}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">Delivered: {statusData.delivered}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm">Failed: {statusData.failed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {statusData.delivered}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Delivered Messages
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {statusData.failed}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Failed Messages
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold text-foreground">
                        Success Rate
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {statusData.delivered + statusData.failed > 0 
                          ? ((statusData.delivered / (statusData.delivered + statusData.failed)) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold text-foreground mb-2">
                        Monthly Cost
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {(statusData.delivered * 66).toLocaleString()} won
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ({statusData.delivered} delivered × 66 won per message)
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">
                  Select year and month to view delivery statistics
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-mono">Total Messages</CardDescription>
              <CardTitle className="text-2xl font-sans">{mockData.totalMessages.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-mono">+12% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-mono">Active Users</CardDescription>
              <CardTitle className="text-2xl font-sans">{mockData.activeUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-mono">+5% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-mono">Avg Response Time</CardDescription>
              <CardTitle className="text-2xl font-sans">{mockData.responseTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-mono">-0.3s from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-mono">Success Rate</CardDescription>
              <CardTitle className="text-2xl font-sans">{mockData.successRate}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-mono">+0.1% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Message Volume</CardTitle>
              <CardDescription className="font-mono">Messages sent over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans">User Activity</CardTitle>
              <CardDescription className="font-mono">Active users by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Response Times</CardTitle>
              <CardDescription className="font-mono">API response performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Error Distribution</CardTitle>
              <CardDescription className="font-mono">Error types and frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
