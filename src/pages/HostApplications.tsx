import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockHostApplications } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const HostApplications = () => {
  const renderTable = (data: typeof mockHostApplications) => (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead>User</TableHead>
          <TableHead>Agency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Application Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((app) => (
          <TableRow key={app.id} className="border-border">
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={app.avatar} />
                  <AvatarFallback>{app.user[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{app.user}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm">{app.agency}</TableCell>
            <TableCell><StatusBadge status={app.status} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">{app.applicationDate}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:text-success"><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"><X className="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Host Applications</h1>
        <Card className="bg-card border-border">
          <Tabs defaultValue="pending">
            <div className="p-4 border-b border-border">
              <TabsList className="bg-secondary">
                <TabsTrigger value="pending">Pending ({mockHostApplications.filter(a => a.status === "Pending").length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({mockHostApplications.filter(a => a.status === "Approved").length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({mockHostApplications.filter(a => a.status === "Rejected").length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="pending">{renderTable(mockHostApplications.filter(a => a.status === "Pending"))}</TabsContent>
            <TabsContent value="approved">{renderTable(mockHostApplications.filter(a => a.status === "Approved"))}</TabsContent>
            <TabsContent value="rejected">{renderTable(mockHostApplications.filter(a => a.status === "Rejected"))}</TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostApplications;
