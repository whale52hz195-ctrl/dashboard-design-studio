import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  amount: number;
  createdAt: string;
  currency: string;
  itemId: string;
  itemName: string;
  itemType: string;
  status: string;
  transactionId: string;
  userId: string;
  userName: string;
}

const OrderHistory = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData: Order[] = [];
      let total = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        ordersData.push({
          id: docSnapshot.id,
          amount: data.amount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          currency: data.currency || "USD",
          itemId: data.itemId || "",
          itemName: data.itemName || "",
          itemType: data.itemType || "",
          status: data.status || "Completed",
          transactionId: data.transactionId || "",
          userId: data.userId || "",
          userName: data.userName || ""
        });
        total += data.amount || 0;
      });
      
      setTotalEarnings(total);
      
      // Apply search filter
      let filteredData = ordersData;
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(order => 
          order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setOrders(filteredData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm]);

  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, orders.length);
  const paginatedOrders = orders.slice(startIndex - 1, endIndex);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search K" 
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{totalEarnings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Earnings</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground mt-1">View and track user purchase history</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="w-20 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Date
          </Button>
        </div>

        {/* Orders Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">USER</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">TOTAL PLANS PURCHASED</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">TOTAL PLANS PURCHASED</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">PLANS PURCHASED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-muted-foreground">Loading orders...</div>
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-muted-foreground">No data available</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3">
                        <div>
                          <div className="font-medium text-foreground">{order.userName}</div>
                          <div className="text-xs text-muted-foreground">{order.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{order.amount.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        <Badge variant="outline" className="border-border text-muted-foreground px-3 py-1 text-xs font-medium">
                          {order.itemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div>
                          <div className="font-medium text-foreground">{order.itemName}</div>
                          <div className="text-xs text-muted-foreground">{order.transactionId}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length > 0 ? startIndex : 0} to {endIndex} of {orders.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="bg-secondary border-border"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-secondary border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-secondary border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="bg-secondary border-border"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrderHistory;
