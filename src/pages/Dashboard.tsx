import { Users, Crown, Mic, Building2, Coins, TrendingUp, UserPlus, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardStats, activityData, topContributors } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={dashboardStats.totalUsers} icon={Users} trend="+12.5%" trendUp />
          <StatCard title="VIP Users" value={dashboardStats.vipUsers} icon={Crown} iconColor="text-warning" trend="+8.2%" trendUp />
          <StatCard title="Total Hosts" value={dashboardStats.totalHosts} icon={Mic} iconColor="text-chart-2" trend="+5.1%" trendUp />
          <StatCard title="Agencies" value={dashboardStats.totalAgencies} icon={Building2} iconColor="text-chart-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Coins" value={dashboardStats.totalCoins} icon={Coins} iconColor="text-chart-4" />
          <StatCard title="Active Users" value={dashboardStats.activeUsers} icon={TrendingUp} trend="+3.8%" trendUp />
          <StatCard title="New Today" value={dashboardStats.newUsersToday} icon={UserPlus} iconColor="text-chart-5" />
          <StatCard title="Revenue" value={`$${dashboardStats.revenue.toLocaleString()}`} icon={DollarSign} iconColor="text-success" trend="+15.3%" trendUp />
        </div>

        {/* Chart + Top Contributors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270 60% 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(270 60% 55%)" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="users" stroke="hsl(270 60% 55%)" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(200 70% 50%)" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((user, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.coins.toLocaleString()} coins</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
