import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Eye, CheckCircle, XCircle, Clock, FileText, User, Calendar, Check, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface VerificationUser {
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
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  idProof?: string;
  idProofImage?: string;
  selfieImage?: string;
  address?: string;
  applicationDate?: string;
  reviewDate?: string;
}

const UserVerification = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'pending');

  // Fetch users based on verification status
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      
      // For now, we'll simulate verification status based on isVerified field
      // In a real app, you'd have a separate verification collection or status field
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
      
      const querySnapshot = await getDocs(q);
      const usersData: VerificationUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as VerificationUser;
        
        // Simulate verification status based on some logic
        let verificationStatus: 'pending' | 'approved' | 'rejected' = 'pending';
        if (userData.isVerified) {
          verificationStatus = 'approved';
        } else if (Math.random() > 0.7) {
          verificationStatus = 'rejected';
        }
        
        // Add verification-related mock data
        const verificationUser: VerificationUser = {
          ...userData,
          uid: doc.id,
          verificationStatus,
          idProof: 'National ID',
          idProofImage: userData.image && userData.image.startsWith('http') ? userData.image : `https://picsum.photos/seed/150?img=${Math.floor(Math.random() * 70)}`,
          selfieImage: userData.image && userData.image.startsWith('http') ? userData.image : `https://picsum.photos/seed/150?img=${Math.floor(Math.random() * 70) + 70}`,
          address: `${userData.country}, City ${Math.floor(Math.random() * 100)}`,
          applicationDate: userData.createdAt,
          reviewDate: verificationStatus !== 'pending' ? new Date().toISOString() : ''
        };
        
        usersData.push(verificationUser);
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching verification users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />{t("userVerification.approved")}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />{t("userVerification.rejected")}</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />{t("userVerification.pending")}</Badge>;
    }
  };

  const renderTable = (status: string) => {
    const filteredUsers = users.filter(user => user.verificationStatus === status);
    
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t("userVerification.searchUsers")}
            className={`${isRTL ? "pr-10" : "pl-10"} bg-secondary border-border`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.user")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.uniqueId")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.idProof")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.idProofImage")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.selfieImage")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.status")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.address")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.applicationDate")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("userVerification.reviewDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">{t("userVerification.loadingUsers")}</div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">{t("userVerification.noStatusUsers", { status })}</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {user.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">@{user.userName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground font-mono text-sm">
                      {user.uid.slice(-8)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {user.idProof}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={user.idProofImage} 
                          alt="ID Proof" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/150?img=${Math.floor(Math.random() * 70)}`;
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={user.selfieImage} 
                          alt="Selfie" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/150?img=${Math.floor(Math.random() * 70) + 70}`;
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {getStatusBadge(user.verificationStatus || 'pending')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {user.address}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(user.applicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {user.reviewDate ? new Date(user.reviewDate).toLocaleDateString() : 'N/A'}
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
            {t("userVerification.showing", { start: 1, end: filteredUsers.length, total: filteredUsers.length })}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="bg-secondary border-border">
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-secondary border-border">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="bg-secondary border-border">
              1
            </Button>
            <Button variant="outline" className="bg-secondary border-border">
              2
            </Button>
            <Button variant="outline" className="bg-secondary border-border">
              3
            </Button>
            <Button variant="outline" size="icon" className="bg-secondary border-border">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-secondary border-border">
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const pendingCount = users.filter(u => u.verificationStatus === 'pending').length;
  const approvedCount = users.filter(u => u.verificationStatus === 'approved').length;
  const rejectedCount = users.filter(u => u.verificationStatus === 'rejected').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("userVerification.title")}</h1>
        <p className="text-muted-foreground">{t("userVerification.subtitle")}</p>
        
        <Card className="bg-card border-border">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
            <div className="p-4 border-b border-border">
              <TabsList className="bg-secondary">
                <TabsTrigger value="pending">{t("userVerification.pending")} ({pendingCount})</TabsTrigger>
                <TabsTrigger value="approved">{t("userVerification.approved")} ({approvedCount})</TabsTrigger>
                <TabsTrigger value="rejected">{t("userVerification.rejected")} ({rejectedCount})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="pending">{renderTable('pending')}</TabsContent>
            <TabsContent value="approved">{renderTable('approved')}</TabsContent>
            <TabsContent value="rejected">{renderTable('rejected')}</TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserVerification;
