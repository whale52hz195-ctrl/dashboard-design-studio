import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockAgencies } from "@/data/mockData";

const Agencies = () => {
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agencies</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Create Agency</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Agency</DialogTitle>
                <DialogDescription>Fill in the details to create a new agency</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Name</Label>
                  <Input className="bg-secondary" placeholder="Enter agency name" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input className="bg-secondary" placeholder="email@agency.com" type="email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mobile</Label>
                    <Input className="bg-secondary" placeholder="+1 234 567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Commission (%)</Label>
                    <Input className="bg-secondary" type="number" placeholder="10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input className="bg-secondary" placeholder="Country" />
                </div>
                <Button className="w-full" onClick={() => setOpen(false)}>Create Agency</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search agencies..." className="pl-9 bg-secondary" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Agency</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Hosts</TableHead>
                <TableHead>Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAgencies.map((agency) => (
                <TableRow key={agency.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agency.logo} />
                        <AvatarFallback>{agency.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{agency.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{agency.user}</TableCell>
                  <TableCell className="text-sm">{agency.country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agency.email}</TableCell>
                  <TableCell className="text-sm">{agency.mobile}</TableCell>
                  <TableCell className="text-sm">{agency.commission}%</TableCell>
                  <TableCell className="text-sm">{agency.hosts}</TableCell>
                  <TableCell className="text-sm font-medium">${agency.hostEarnings.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Agencies;
