import { Users, Search, Filter, Calendar, Settings, Edit, Coins, History, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, ArrowUp, Plus, Minus, X, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, addDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

// Define User interface based on Firestore structure
interface User {
  uid: string;
  name: string;
  userName: string;
  email: string;
  image: string;
  gender: string;
  age: number;
  country: string;
  countryCode: string;
  countryFlagImage: string;
  coin: number;
  coins: number;
  followers: number;
  followersCount: number;
  followingCount: number;
  followings: number;
  isVerified: boolean;
  isProfilePicBanned: boolean;
  loginType: number;
  bio: string;
  fcmToken: string;
  createdAt: string;
  updatedAt: string;
  wealthLevel: {
    level: number;
    name: string;
  };
  mobile?: string;
  phoneNumber?: string; // Add real phone number field
  status?: boolean;
}

const CoinTraders = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [coinsToAdd, setCoinsToAdd] = useState<number | ''>('');
  const [isAddingCoins, setIsAddingCoins] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Fetch users from Firestore
  const fetchUsers = async (page = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      const usersRef = collection(db, 'users');
      
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));
      
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        // Add mobile field from real phone number or countryCode
        const mobile = userData.phoneNumber ? 
          `${userData.countryCode || '+20'} ${userData.phoneNumber}` : 
          userData.countryCode ? 
            `${userData.countryCode} Not available` : 
            'Not available';
        
        usersData.push({ 
          uid: doc.id, 
          ...userData,
          mobile,
          status: !userData.isProfilePicBanned // Use isProfilePicBanned as status
        });
      });
      
      // Apply search
      let filteredData = usersData;
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.uid.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setUsers(filteredData);
      setTotalUsers(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    fetchUsers(1, true);
  }, []);

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1);
    fetchUsers(1, true);
  };

  // Handle view user details (now opens coin adjustment modal)
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setCoinsToAdd(''); // Clear previous input
    setIsAddingCoins(true); // Default to adding coins
    setIsCoinModalOpen(true);
  };

  // Handle transaction history
  const handleTransactionHistory = async (user: User) => {
    setSelectedUser(user);
    
    try {
      // Try to fetch from transactions collection
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const realTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (realTransactions.length > 0) {
        setTransactionHistory(realTransactions);
      } else {
        // If no transactions found, show empty state
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Show empty state on error
      setTransactionHistory([]);
    }
    
    setIsHistoryModalOpen(true);
  };

  // Handle edit user mobile number
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setCountryCode(user.countryCode || '+20');
    
    // Use real phone number if available
    if (user.phoneNumber) {
      setMobileNumber(user.phoneNumber);
    } else if (user.mobile && user.mobile !== 'Not available') {
      // Extract from mobile field if phoneNumber not available
      const mobileParts = user.mobile.split(' ');
      if (mobileParts.length > 1) {
        setCountryCode(mobileParts[0]);
        setMobileNumber(mobileParts.slice(1).join(' '));
      } else {
        setMobileNumber(user.mobile);
      }
    } else {
      setMobileNumber('');
    }
    
    setIsEditModalOpen(true);
  };

  // Handle delete/ban user
  const handleDeleteUser = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isProfilePicBanned: !user.isProfilePicBanned
      });
      
      // Update local state without refetch
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? {...u, isProfilePicBanned: !u.isProfilePicBanned} : u
      ));
      
      toast.success(`User ${!user.isProfilePicBanned ? 'banned' : 'unbanned'} successfully`, {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status', {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isProfilePicBanned: !user.isProfilePicBanned
      });
      
      // Update local state without refetch
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? {...u, isProfilePicBanned: !u.isProfilePicBanned} : u
      ));
      
      toast.success(`User status updated successfully`, {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status', {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  // Handle update mobile number
  const handleUpdateMobile = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      
      await updateDoc(userRef, {
        countryCode: countryCode,
        phoneNumber: mobileNumber, // Save real phone number
      });
      
      // Update local state without refetch
      setUsers(prev => prev.map(u => 
        u.uid === selectedUser.uid ? {...u, countryCode, phoneNumber: mobileNumber, mobile: `${countryCode} ${mobileNumber}`} : u
      ));
      
      setIsEditModalOpen(false);
      toast.success('Mobile number updated successfully', {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error updating mobile number:', error);
      toast.error('Failed to update mobile number', {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  // Handle update coins
  const handleUpdateCoins = async () => {
    if (!selectedUser || coinsToAdd === '' || Number(coinsToAdd) <= 0) return;
    
    const currentCoins = selectedUser.coin || 0;
    const coinsAmount = Number(coinsToAdd);
    
    // Validation: Cannot remove more coins than available
    if (!isAddingCoins && coinsAmount > currentCoins) {
      toast.error(`Cannot remove ${coinsAmount} coins. User only has ${currentCoins} coins.`, {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
      return;
    }
    
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      
      const newCoinBalance = isAddingCoins ? 
        currentCoins + coinsAmount : 
        Math.max(0, currentCoins - coinsAmount);
      
      // Update user coins
      await updateDoc(userRef, {
        coin: newCoinBalance
      });
      
      // Record transaction in transactions collection
      const transactionRef = collection(db, 'transactions');
      await addDoc(transactionRef, {
        userId: selectedUser.uid,
        userName: selectedUser.name,
        type: isAddingCoins ? 'add' : 'remove',
        amount: coinsAmount,
        description: `Admin ${isAddingCoins ? 'added' : 'removed'} ${coinsAmount} coins`,
        timestamp: new Date().toISOString(),
        adminName: 'Admin',
        previousBalance: currentCoins,
        newBalance: newCoinBalance
      });
      
      // Update local state without refetch
      setUsers(prev => prev.map(u => 
        u.uid === selectedUser.uid ? {...u, coin: newCoinBalance} : u
      ));
      
      setIsCoinModalOpen(false);
      toast.success(`${isAddingCoins ? 'Added' : 'Removed'} ${coinsAmount} coins successfully`, {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error updating coins:', error);
      toast.error('Failed to update coins', {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalUsers);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Coin Trader" 
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/32?img=1" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Coin Traders</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor coin traders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Traders</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coins</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {users.reduce((sum, user) => sum + (user.coin || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Plus className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent Coins</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {users.reduce((sum, user) => sum + (user.coins || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Minus className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Traders</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {users.filter(user => !user.isProfilePicBanned).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-card border-border mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Coin Trader" 
                    className="pl-10 bg-secondary border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Select 
                value={pageSize.toString()} 
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-16 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Coin Traders Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">USER</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">UNIQUE ID</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">COIN BALANCE($)</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">SPENT COINS($)</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">MOBILE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">CREATED DATE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">STATUS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">Loading coin traders...</div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">No coin traders found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.uid} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="bg-muted text-muted-foreground">{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">@{user.userName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm font-mono">
                        {user.uid.slice(-8)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground font-medium text-sm">
                        ${user.coin || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground font-medium text-sm">
                        ${user.coins || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {user.mobile || 'Not available'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Switch 
                          checked={!user.isProfilePicBanned}
                          onCheckedChange={() => handleToggleStatus(user)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewUser(user)}
                            className="h-8 w-8"
                          >
                            <Coins className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleTransactionHistory(user)}
                            className="h-8 w-8 relative"
                          >
                            <History className="h-4 w-4" />
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500"></div>
                          </Button>
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
              Showing {startIndex} to {endIndex} of {totalUsers} entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="bg-secondary border-border"
              >
                <ChevronFirst className="h-4 w-4" />
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
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
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button 
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            size="icon"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
        
        {/* Edit Mobile Number Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="+91"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMobile}>
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coin Adjustment Modal */}
        <Dialog open={isCoinModalOpen} onOpenChange={setIsCoinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Coins for {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Coin Balance</p>
                <p className="text-2xl font-bold text-foreground">${selectedUser?.coin || 0}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={isAddingCoins ? "default" : "outline"}
                  onClick={() => setIsAddingCoins(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coins
                </Button>
                <Button
                  variant={!isAddingCoins ? "default" : "outline"}
                  onClick={() => setIsAddingCoins(false)}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Coins
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coins">Coins to {isAddingCoins ? 'Add' : 'Remove'}</Label>
                <Input
                  id="coins"
                  type="number"
                  min="1"
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCoinModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCoins} disabled={coinsToAdd === '' || Number(coinsToAdd) <= 0}>
                Update Coins
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction History Modal */}
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction History - {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">${selectedUser?.coin || 0}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                {transactionHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No transactions found</p>
                ) : (
                  <div className="space-y-2">
                    {transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.type === 'add' ? 'bg-green-500' : 
                            transaction.type === 'remove' ? 'bg-red-500' : 
                            'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-muted-foreground">By {transaction.adminName}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'add' ? 'text-green-500' : 
                          transaction.type === 'remove' ? 'text-red-500' : 
                          'text-blue-500'
                        }`}>
                          {transaction.type === 'add' ? '+' : transaction.type === 'remove' ? '-' : '-'}${transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsHistoryModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CoinTraders;
