import { Search, RotateCcw, Filter, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Define Game History interface
interface GameHistory {
  id: string;
  no: number;
  adminCoin: number;
  totalBetCoin: number;
  winnerCoin: number;
  winLose: string;
  info: string;
  gameType: string;
  createdAt: string;
}

const GameHistory = () => {
  const { toast } = useToast();
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("teen-patti");
  const [adminTotalCoin, setAdminTotalCoin] = useState(1064680);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Mock data for demonstration
  const mockData: GameHistory[] = [
    { id: "1", no: 1, adminCoin: 1064680, totalBetCoin: 5000, winnerCoin: 4500, winLose: "WIN", info: "Teen Patti Game #1", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "2", no: 2, adminCoin: 1064180, totalBetCoin: 3000, winnerCoin: 3200, winLose: "LOSE", info: "Teen Patti Game #2", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "3", no: 3, adminCoin: 1067380, totalBetCoin: 2000, winnerCoin: 1800, winLose: "WIN", info: "Teen Patti Game #3", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "4", no: 4, adminCoin: 1065580, totalBetCoin: 4000, winnerCoin: 4200, winLose: "LOSE", info: "Teen Patti Game #4", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "5", no: 5, adminCoin: 1069780, totalBetCoin: 1500, winnerCoin: 1400, winLose: "WIN", info: "Teen Patti Game #5", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "6", no: 6, adminCoin: 1068280, totalBetCoin: 2500, winnerCoin: 2300, winLose: "WIN", info: "Teen Patti Game #6", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "7", no: 7, adminCoin: 1070780, totalBetCoin: 3500, winnerCoin: 3700, winLose: "LOSE", info: "Teen Patti Game #7", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "8", no: 8, adminCoin: 1067080, totalBetCoin: 1800, winnerCoin: 1600, winLose: "WIN", info: "Teen Patti Game #8", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "9", no: 9, adminCoin: 1068880, totalBetCoin: 2200, winnerCoin: 2100, winLose: "WIN", info: "Teen Patti Game #9", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
    { id: "10", no: 10, adminCoin: 1066780, totalBetCoin: 2800, winnerCoin: 3000, winLose: "LOSE", info: "Teen Patti Game #10", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
  ];

  // Fetch game history from Firestore
  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch game history from Firestore
      const gameHistoryRef = collection(db, 'gameHistory');
      const q = query(
        gameHistoryRef, 
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const querySnapshot = await getDocs(q);
      
      const historyData: GameHistory[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        historyData.push({
          id: docSnapshot.id,
          no: historyData.length + 1,
          adminCoin: data.adminCoin || 0,
          totalBetCoin: data.totalBetCoin || 0,
          winnerCoin: data.winnerCoin || 0,
          winLose: data.winLose || 'WIN',
          info: data.info || `Game #${historyData.length + 1}`,
          gameType: data.gameType || activeTab,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      
      setGameHistory(historyData);
      
      // Get total count for pagination
      const countSnapshot = await getDocs(collection(db, 'gameHistory'));
      setTotalEntries(countSnapshot.size);
      
      // Calculate admin total coin
      const totalAdminCoin = historyData.reduce((sum, game) => sum + game.adminCoin, 0);
      if (totalAdminCoin > 0) {
        setAdminTotalCoin(totalAdminCoin);
      }
      
    } catch (error) {
      console.error('Error fetching game history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch game history. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data if Firebase fails
      const mockData: GameHistory[] = [
        { id: "1", no: 1, adminCoin: 1064680, totalBetCoin: 5000, winnerCoin: 4500, winLose: "WIN", info: "Teen Patti Game #1", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "2", no: 2, adminCoin: 1064180, totalBetCoin: 3000, winnerCoin: 3200, winLose: "LOSE", info: "Teen Patti Game #2", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "3", no: 3, adminCoin: 1067380, totalBetCoin: 2000, winnerCoin: 1800, winLose: "WIN", info: "Teen Patti Game #3", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "4", no: 4, adminCoin: 1065580, totalBetCoin: 4000, winnerCoin: 4200, winLose: "LOSE", info: "Teen Patti Game #4", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "5", no: 5, adminCoin: 1069780, totalBetCoin: 1500, winnerCoin: 1400, winLose: "WIN", info: "Teen Patti Game #5", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "6", no: 6, adminCoin: 1068280, totalBetCoin: 2500, winnerCoin: 2300, winLose: "WIN", info: "Teen Patti Game #6", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "7", no: 7, adminCoin: 1070780, totalBetCoin: 3500, winnerCoin: 3700, winLose: "LOSE", info: "Teen Patti Game #7", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "8", no: 8, adminCoin: 1067080, totalBetCoin: 1800, winnerCoin: 1600, winLose: "WIN", info: "Teen Patti Game #8", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "9", no: 9, adminCoin: 1068880, totalBetCoin: 2200, winnerCoin: 2100, winLose: "WIN", info: "Teen Patti Game #9", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
        { id: "10", no: 10, adminCoin: 1066780, totalBetCoin: 2800, winnerCoin: 3000, winLose: "LOSE", info: "Teen Patti Game #10", gameType: "teen-patti", createdAt: "2026-01-04T04:13:01" },
      ];
      setGameHistory(mockData);
      setTotalEntries(25);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameHistory();
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle reset coin
  const handleResetCoin = () => {
    toast({
      title: "Success",
      description: "Admin coin reset successfully!",
    });
    setAdminTotalCoin(1000000);
  };

  // Handle filter by date
  const handleFilterByDate = () => {
    toast({
      title: "Filter Applied",
      description: "Date filter has been applied.",
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalEntries / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Game History</h1>
            <p className="text-muted-foreground mt-1">View and manage all game transactions</p>
          </div>
          <div className="bg-card border-border border px-4 py-2 rounded-lg">
            <span className="text-sm text-muted-foreground">Admin Total Coin: </span>
            <span className="text-lg font-bold text-foreground">{adminTotalCoin.toLocaleString()}</span>
          </div>
        </div>

        {/* Tabs and Controls */}
        <Card className="bg-card border-border mb-6">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => handleTabChange("teen-patti")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "teen-patti"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Teen Patti
              </button>
              <button
                onClick={() => handleTabChange("casino")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "casino"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Casino
              </button>
              <button
                onClick={() => handleTabChange("ferry-wheel")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "ferry-wheel"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Ferry Wheel
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="bg-secondary border-border flex items-center gap-2"
                onClick={handleResetCoin}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Coin
              </Button>
              <Button 
                variant="outline" 
                className="bg-secondary border-border flex items-center gap-2"
                onClick={handleFilterByDate}
              >
                <Filter className="h-4 w-4" />
                Filter By Date
              </Button>
            </div>
          </div>
        </Card>

        {/* Game History Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">NO</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">ADMIN COIN</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">TOTAL BET COIN</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">WINNER COIN</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">WIN / LOSE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">INFO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">Loading game history...</div>
                    </TableCell>
                  </TableRow>
                ) : gameHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">No game history found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  gameHistory.map((game) => (
                    <TableRow key={game.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 text-foreground font-medium">
                        {game.no}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground font-medium">
                        {game.adminCoin.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        {game.totalBetCoin.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        {game.winnerCoin.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge 
                          variant={game.winLose === "WIN" ? "default" : "destructive"}
                          className={game.winLose === "WIN" 
                            ? "bg-green-500 text-white hover:bg-green-600 px-3 py-1 text-xs font-medium"
                            : "bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-xs font-medium"
                          }
                        >
                          {game.winLose}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">{game.info}</span>
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
              Showing {startIndex} to {endIndex} of {totalEntries} entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="bg-secondary border-border"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-secondary border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Show page numbers */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                
                return (
                  <Button 
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"} 
                    className={currentPage === pageNum ? "bg-primary text-primary-foreground" : "bg-secondary border-border"}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-secondary border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(totalPages)}
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

export default GameHistory;
