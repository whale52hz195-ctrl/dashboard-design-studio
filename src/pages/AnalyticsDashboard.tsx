import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  getAnalyticsStats, 
  getRealTimeAnalytics, 
  subscribeToRealTimeAnalytics,
  trackEvent,
  trackPageView,
  startSession,
  endSession
} from '@/lib/analyticsService';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  DollarSign, 
  Activity,
  BarChart3,
  LineChart,
  PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  const { t, isRTL } = useLanguage();
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Start session tracking
        await startSession();
        
        // Track page view
        await trackPageView('/analytics', 'Analytics Dashboard');
        
        const [stats, realTime] = await Promise.all([
          getAnalyticsStats(dateRange),
          getRealTimeAnalytics()
        ]);
        
        setAnalyticsStats(stats);
        setRealTimeData(realTime);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealTimeAnalytics((data) => {
      setRealTimeData(data);
    });

    return () => {
      unsubscribe();
      endSession();
    };
  }, [dateRange]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await trackEvent('analytics_refresh', { metric: selectedMetric });
      
      const [stats, realTime] = await Promise.all([
        getAnalyticsStats(dateRange),
        getRealTimeAnalytics()
      ]);
      
      setAnalyticsStats(stats);
      setRealTimeData(realTime);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Mock data for charts
  const chartData = [
    { name: 'Mon', users: 4000, pageViews: 2400, revenue: 2400 },
    { name: 'Tue', users: 3000, pageViews: 1398, revenue: 2210 },
    { name: 'Wed', users: 2000, pageViews: 9800, revenue: 2290 },
    { name: 'Thu', users: 2780, pageViews: 3908, revenue: 2000 },
    { name: 'Fri', users: 1890, pageViews: 4800, revenue: 2181 },
    { name: 'Sat', users: 2390, pageViews: 3800, revenue: 2500 },
    { name: 'Sun', users: 3490, pageViews: 4300, revenue: 2100 }
  ];

  const pieData = [
    { name: 'Desktop', value: 45, color: '#8884d8' },
    { name: 'Mobile', value: 35, color: '#82ca9d' },
    { name: 'Tablet', value: 20, color: '#ffc658' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time analytics and user insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Real-time
            </Badge>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Stats */}
        {realTimeData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(realTimeData.activeUsers)}</div>
                    <div className="text-muted-foreground text-sm">Active Now</div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(realTimeData.pageViews)}</div>
                    <div className="text-muted-foreground text-sm">Page Views (5m)</div>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(realTimeData.events)}</div>
                    <div className="text-muted-foreground text-sm">Events (5m)</div>
                  </div>
                  <MousePointer className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {new Date(realTimeData.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-muted-foreground text-sm">Last Update</div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Analytics Stats */}
        {analyticsStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsStats.totalUsers)}</div>
                    <div className="text-muted-foreground text-sm">Total Users</div>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsStats.activeUsers)}</div>
                    <div className="text-muted-foreground text-sm">Active Users</div>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsStats.totalPageViews)}</div>
                    <div className="text-muted-foreground text-sm">Page Views</div>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatDuration(analyticsStats.avgSessionDuration)}</div>
                    <div className="text-muted-foreground text-sm">Avg Session</div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Daily Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Device Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Device Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    name="Device"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsStats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Day 1</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${analyticsStats.userRetention.day1}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analyticsStats.userRetention.day1}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Day 7</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${analyticsStats.userRetention.day7}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analyticsStats.userRetention.day7}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Day 30</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${analyticsStats.userRetention.day30}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analyticsStats.userRetention.day30}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsStats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Registration</span>
                    <Badge variant="secondary">{analyticsStats.conversionRates.registration}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Purchase</span>
                    <Badge variant="secondary">{analyticsStats.conversionRates.purchase}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement</span>
                    <Badge variant="secondary">{analyticsStats.conversionRates.engagement}%</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        {analyticsStats && (
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsStats.topPages.map((page: any, index: number) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-muted-foreground">{page.uniqueViews} unique views</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(page.views)}</div>
                      <div className="text-sm text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
