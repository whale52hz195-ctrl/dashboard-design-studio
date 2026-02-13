import { Users, UserCheck, UserX, Crown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockUsers } from "@/data/mockData";

const UserManagement = () => {
  const males = mockUsers.filter((u) => u.gender === "Male").length;
  const females = mockUsers.filter((u) => u.gender === "Female").length;
  const vips = mockUsers.filter((u) => u.role === "VIP").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Management</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={mockUsers.length} icon={Users} />
          <StatCard title="Males" value={males} icon={UserCheck} iconColor="text-chart-2" />
          <StatCard title="Females" value={females} icon={UserX} iconColor="text-chart-5" />
          <StatCard title="VIP Users" value={vips} icon={Crown} iconColor="text-warning" />
        </div>

        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 bg-secondary" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>UniqueID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Followers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.role}</TableCell>
                  <TableCell className="text-sm">{user.userType}</TableCell>
                  <TableCell className="text-sm">{user.coins.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.uniqueId}</TableCell>
                  <TableCell className="text-sm">{user.gender}</TableCell>
                  <TableCell className="text-sm">{user.age}</TableCell>
                  <TableCell className="text-sm">{user.country}</TableCell>
                  <TableCell className="text-sm">{user.followers.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
