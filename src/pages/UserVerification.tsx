import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockVerifications } from "@/data/mockData";
import { Check, X } from "lucide-react";

const UserVerification = () => {
  const renderTable = (data: typeof mockVerifications) => (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead>User</TableHead>
          <TableHead>UniqueID</TableHead>
          <TableHead>ID Proof</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((v) => (
          <TableRow key={v.id} className="border-border">
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={v.avatar} />
                  <AvatarFallback>{v.user[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{v.user}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{v.uniqueId}</TableCell>
            <TableCell className="text-sm">{v.idProof}</TableCell>
            <TableCell><StatusBadge status={v.status} /></TableCell>
            <TableCell className="text-sm">{v.address}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{v.applicationDate}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:text-success">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
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
        <h1 className="text-2xl font-bold">User Verification</h1>
        <Card className="bg-card border-border">
          <Tabs defaultValue="pending">
            <div className="p-4 border-b border-border">
              <TabsList className="bg-secondary">
                <TabsTrigger value="pending">Pending ({mockVerifications.filter(v => v.status === "Pending").length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({mockVerifications.filter(v => v.status === "Approved").length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({mockVerifications.filter(v => v.status === "Rejected").length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="pending">{renderTable(mockVerifications.filter(v => v.status === "Pending"))}</TabsContent>
            <TabsContent value="approved">{renderTable(mockVerifications.filter(v => v.status === "Approved"))}</TabsContent>
            <TabsContent value="rejected">{renderTable(mockVerifications.filter(v => v.status === "Rejected"))}</TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserVerification;
