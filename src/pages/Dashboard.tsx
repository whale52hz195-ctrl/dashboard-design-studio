import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  getDashboardStats, 
  getActivityData, 
  getTopContributors
} from '@/lib/firestoreService';
import { 
  subscribeToDashboardStats,
  subscribeToLiveStreams,
  subscribeToTransactions
} from '@/lib/realtimeService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/i18n';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const { t, isRTL } = useLanguage();
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    vipUsers: 0,
    totalHosts: 0,
    totalAgencies: 0,
    totalCoins: 0,
    activeUsers: 0,
    newUsersToday: 0,
    revenue: 0,
  });
  const [activityData, setActivityData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, activity, contributors] = await Promise.all([
          getDashboardStats(),
          getActivityData(),
          getTopContributors()
        ]);
        setDashboardStats(stats);
        setActivityData(activity);
        setTopContributors(contributors);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const unsubscribeStats = subscribeToDashboardStats((stats) => {
      setDashboardStats(stats);
      setIsRealTime(true);
    });

    const unsubscribeStreams = subscribeToLiveStreams((streams) => {
      setLiveStreams(streams);
    });

    const unsubscribeTransactions = subscribeToTransactions((transactions) => {
      setRecentTransactions(transactions.slice(0, 5));
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeStats();
      unsubscribeStreams();
      unsubscribeTransactions();
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          {isRealTime && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              {t("dashboard.realTime")}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">{t("dashboard.totalUsers")}</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">+{dashboardStats.newUsersToday} {t("dashboard.today")}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t("dashboard.activeUsers")}</p>
                  <p className="text-2xl font-bold">{dashboardStats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.now")}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">{t("dashboard.totalRevenue")}</p>
                  <p className="text-2xl font-bold">${dashboardStats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.allTime")}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">{t("dashboard.totalCoins")}</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalCoins.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.inCirculation")}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(177 59% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(177 59% 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200 70% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200 70% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 15% 22%)" />
                <XAxis dataKey="name" stroke="hsl(260 10% 60%)" fontSize={12} />
                <YAxis stroke="hsl(260 10% 60%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(260 20% 13%)",
                    border: "1px solid hsl(260 15% 22%)",
                    borderRadius: "8px",
                    color: "hsl(260 10% 95%)",
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="hsl(177 59% 48%)" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(200 70% 50%)" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.topContributors")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContributors.length > 0 ? topContributors.map((user, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground">{user.coins.toLocaleString()} coins</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No contributors available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
