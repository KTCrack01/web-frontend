"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Download, RefreshCw } from "lucide-react"

type TimeFilter = "1day" | "1week" | "1month"

export function DashboardAnalytics() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("1week")

  const mockData = {
    totalMessages: 1247,
    activeUsers: 89,
    responseTime: "1.2s",
    successRate: "99.8%",
  }

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-sans">Analytics Dashboard</h2>
            <p className="text-muted-foreground font-mono">Monitor your messaging platform performance</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Filter Buttons */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                variant={activeFilter === "1day" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("1day")}
                className="font-sans"
              >
                1 Day
              </Button>
              <Button
                variant={activeFilter === "1week" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("1week")}
                className="font-sans"
              >
                1 Week
              </Button>
              <Button
                variant={activeFilter === "1month" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("1month")}
                className="font-sans"
              >
                1 Month
              </Button>
            </div>

            {/* Calendar and Action Buttons */}
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

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
