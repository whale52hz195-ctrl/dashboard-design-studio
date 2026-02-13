import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockCoinTraders } from "@/data/mockData";

const CoinTraders = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Coin Traders</h1>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Coin Trader</Button>
        </div>

        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search traders..." className="pl-9 bg-secondary" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>UniqueID</TableHead>
                <TableHead>Coin Balance</TableHead>
                <TableHead>Spent Coins</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCoinTraders.map((trader) => (
                <TableRow key={trader.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={trader.avatar} />
                        <AvatarFallback>{trader.user[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{trader.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{trader.uniqueId}</TableCell>
                  <TableCell className="text-sm font-medium">{trader.coinBalance.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{trader.spentCoins.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{trader.mobile}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{trader.createdDate}</TableCell>
                  <TableCell><StatusBadge status={trader.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoinTraders;
