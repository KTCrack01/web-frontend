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

interface PhoneRankingItem {
  phoneNum: string
  count: number
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
  
  // Phone Ranking States
  const [rankingUserEmail, setRankingUserEmail] = useState("jessica0409@naver.com")
  const [phoneRankingData, setPhoneRankingData] = useState<PhoneRankingItem[]>([])
  const [isLoadingRanking, setIsLoadingRanking] = useState(false)
  const [rankingError, setRankingError] = useState<string | null>(null)

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

  const fetchPhoneRankingData = async () => {
    if (!rankingUserEmail.trim()) return
    
    setIsLoadingRanking(true)
    setRankingError(null)
    
    try {
      const response = await fetch(
        `http://localhost:8081/api/v1/dashboard/data/phone-num-ranking?userEmail=${rankingUserEmail}`
      )
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
      }
      
      const data: PhoneRankingItem[] = await response.json()
      // 상위 5개만 선택
      setPhoneRankingData(data.slice(0, 5))
    } catch (error) {
      console.error("Phone ranking data fetch error:", error)
      setRankingError(error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다")
    } finally {
      setIsLoadingRanking(false)
    }
  }

  const formatPhoneNumber = (phoneNum: string) => {
    // +82로 시작하는 한국 번호를 010-xxxx-xxxx 형태로 변환
    if (phoneNum.startsWith('+82')) {
      const number = phoneNum.slice(3) // +82 제거
      if (number.length >= 9) {
        return `010-${number.slice(-8, -4)}-${number.slice(-4)}`
      }
    }
    return phoneNum
  }

  useEffect(() => {
    fetchStatusData()
  }, [statusYear, statusMonth])

  useEffect(() => {
    fetchPhoneRankingData()
  }, [rankingUserEmail])

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

        {/* Phone Number Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans flex items-center">
              <User className="h-5 w-5 mr-2" />
              Top 5 Phone Numbers
            </CardTitle>
            <CardDescription className="font-mono">
              Most frequently messaged phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="rankingUserEmail" className="text-sm font-medium">
                  User Email
                </Label>
                <Input
                  id="rankingUserEmail"
                  type="email"
                  value={rankingUserEmail}
                  onChange={(e) => setRankingUserEmail(e.target.value)}
                  placeholder="Enter user email..."
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={fetchPhoneRankingData}
                disabled={isLoadingRanking || !rankingUserEmail.trim()}
                className="font-sans"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingRanking ? 'animate-spin' : ''}`} />
                {isLoadingRanking ? 'Loading...' : 'Update'}
              </Button>
            </div>

            {/* Ranking Display */}
            {rankingError ? (
              <div className="h-64 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive font-mono text-center">
                  Error: {rankingError}
                </p>
              </div>
            ) : phoneRankingData.length > 0 ? (
              <div className="space-y-3">
                {phoneRankingData.map((item, index) => {
                  const maxCount = Math.max(...phoneRankingData.map(d => d.count))
                  const percentage = (item.count / maxCount) * 100
                  
                  return (
                    <Card key={item.phoneNum} className="relative overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm
                              ${index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-orange-600' : 'bg-blue-500'}
                            `}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-mono text-sm font-medium">
                                {formatPhoneNumber(item.phoneNum)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.phoneNum}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {item.count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              messages
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar Background */}
                        <div 
                          className="absolute inset-0 bg-primary/10 opacity-30 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground font-mono">
                  Enter user email to view phone number rankings
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
