import { Users, UserCheck, UserX, Crown, Search, Filter, Calendar, Settings, Eye, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, ArrowUp, User as UserIcon, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import UserDetailsModal from "@/components/UserDetailsModal";
import UserProfileScreen from "@/components/UserProfileScreen";

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
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, males: 0, females: 0, vips: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [filters, setFilters] = useState({
    realUsers: "all",
    status: "all",
    role: "all"
  });

  // Fetch users from Firestore with pagination and filters
  const fetchUsers = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      
      // Simple query without complex filters to avoid index issues
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));
      
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        usersData.push({ uid: doc.id, ...userData });
      });
      
      // Apply client-side filtering
      let filteredData = usersData;
      
      // Filter by real users
      if (filters.realUsers !== "all") {
        filteredData = filteredData.filter(user => 
          filters.realUsers === "real" ? user.loginType === 1 : user.loginType !== 1
        );
      }
      
      // Filter by status
      if (filters.status !== "all") {
        filteredData = filteredData.filter(user => 
          filters.status === "banned" ? user.isProfilePicBanned : !user.isProfilePicBanned
        );
      }
      
      // Filter by role
      if (filters.role !== "all") {
        filteredData = filteredData.filter(user => 
          filters.role === "vip" ? user.wealthLevel?.level > 1 : user.wealthLevel?.level === 1
        );
      }
      
      // Apply search
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply date filter if set
      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(filterDate);
        nextDay.setDate(filterDate.getDate() + 1);
        
        filteredData = filteredData.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= filterDate && userDate < nextDay;
        });
      }
      
      setUsers(filteredData);
      setTotalUsers(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      setCurrentPage(page);
      
      // Calculate stats
      const userStats = {
        total: filteredData.length,
        males: filteredData.filter(u => u.gender === 'Male').length,
        females: filteredData.filter(u => u.gender === 'Female').length,
        vips: filteredData.filter(u => u.wealthLevel?.level > 1).length
      };
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      // Fallback to mock data if Firebase fails
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Trigger refetch when filters or search change
  useEffect(() => {
    fetchUsers(1, true);
  }, [filters, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    fetchUsers(1, true);
  };
  
  // Handle date filter
  const handleDateFilter = () => {
    // For now, just reset to today. You can add a date picker here
    const today = new Date();
    setDateFilter(today);
    fetchUsers(1, true);
  };
  
  // Handle view user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Handle user profile
  const handleUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  // Handle profile close
  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedUser(null);
  };

  // Handle search
  const handleSearch = () => {
    // Search is already handled by useEffect when searchTerm changes
    // This function can be used for manual search trigger if needed
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ realUsers: 'all', status: 'all', role: 'all' });
    setSearchTerm('');
    setDateFilter(undefined);
    fetchUsers(1, true);
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
                placeholder="Search User" 
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor user accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Males</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.males}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Females</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.females}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.vips}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-card border-border mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select 
                value={filters.realUsers} 
                onValueChange={(value) => handleFilterChange('realUsers', value)}
              >
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue placeholder="Real Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="real">Real Users</SelectItem>
                  <SelectItem value="bot">Bot Users</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.role} 
                onValueChange={(value) => handleFilterChange('role', value)}
              >
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search User" 
                    className="pl-10 bg-secondary border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="bg-secondary border-border flex items-center gap-2"
                onClick={handleDateFilter}
              >
                <Calendar className="h-4 w-4" />
                Filter by Date
              </Button>
              
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
              
              {(filters.realUsers !== 'all' || filters.status !== 'all' || filters.role !== 'all' || searchTerm || dateFilter) && (
                <Button 
                  variant="outline" 
                  className="bg-secondary border-border flex items-center gap-2"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">USER</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">ROLE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">USERTYPE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">COIN</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">STATUS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">GENDER</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">AGE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">COUNTRY</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">FOLLOWERS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">FOLLOWING</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">FRINDS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">POSTS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">VIDEOS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">BLOCK</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">CREATED AT</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8">
                      <div className="text-muted-foreground">Loading users...</div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8">
                      <div className="text-muted-foreground">No users found</div>
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
                            <div className="text-xs text-muted-foreground">@{user.userName}_{user.uid.slice(-4)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 px-3 py-1 text-xs font-medium">
                            User
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className="border-border text-muted-foreground px-3 py-1 text-xs font-medium">
                          Normal
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground font-medium text-sm">
                        {user.coin || user.coins || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-xs font-medium">
                          Offline
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {user.gender}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {user.age || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.countryFlagImage || '🌍'}</span>
                          <span className="text-muted-foreground text-sm">{user.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {user.followers || user.followersCount || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {user.followings || user.followingCount || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        0
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        0
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        0
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Switch />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleUserProfile(user)}
                          >
                            <Settings className="h-4 w-4" />
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
                <ChevronsRight className="h-4 w-4" />
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
        
        {/* User Details Modal */}
        <UserDetailsModal 
          user={selectedUser} 
          open={isModalOpen} 
          onClose={handleCloseModal} 
        />
        
        {/* User Profile Screen */}
        <UserProfileScreen 
          user={selectedUser} 
          open={isProfileOpen} 
          onClose={handleCloseProfile} 
        />
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
