import { Mic, UserCheck, UserX, Crown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockHosts } from "@/data/mockData";

const HostManagement = () => {
  const males = mockHosts.filter((h) => h.gender === "Male").length;
  const females = mockHosts.filter((h) => h.gender === "Female").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Host Management</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Hosts" value={mockHosts.length} icon={Mic} />
          <StatCard title="Males" value={males} icon={UserCheck} iconColor="text-chart-2" />
          <StatCard title="Females" value={females} icon={UserX} iconColor="text-chart-5" />
          <StatCard title="VIP Hosts" value={1} icon={Crown} iconColor="text-warning" />
        </div>

        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search hosts..." className="pl-9 bg-secondary" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Agency</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>UniqueID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Followings</TableHead>
                <TableHead>Friends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHosts.map((host) => (
                <TableRow key={host.id} className="border-border">
                  <TableCell className="text-sm">{host.agency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={host.avatar} />
                        <AvatarFallback>{host.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{host.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{host.uniqueId}</TableCell>
                  <TableCell className="text-sm">{host.gender}</TableCell>
                  <TableCell className="text-sm">{host.age}</TableCell>
                  <TableCell className="text-sm">{host.coins.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{host.country}</TableCell>
                  <TableCell className="text-sm">{host.followers.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{host.followings}</TableCell>
                  <TableCell className="text-sm">{host.friends}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostManagement;
