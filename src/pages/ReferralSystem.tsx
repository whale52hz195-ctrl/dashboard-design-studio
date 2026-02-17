import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Users, Calendar, Clock, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Referral {
  id: string;
  targetReferrals: number;
  rewardCoins: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'expired';
}

const ReferralSystem = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReferral, setNewReferral] = useState({
    targetReferrals: 0,
    rewardCoins: 0
  });

  // Sample data matching the image
  const sampleReferrals: Referral[] = [
    {
      id: '1',
      targetReferrals: 50,
      rewardCoins: 100,
      createdAt: '2026-01-15 10:30:00',
      updatedAt: '2026-01-15 10:30:00',
      status: 'active'
    },
    {
      id: '2',
      targetReferrals: 100,
      rewardCoins: 200,
      createdAt: '2026-01-14 14:20:00',
      updatedAt: '2026-01-14 14:20:00',
      status: 'completed'
    },
    {
      id: '3',
      targetReferrals: 25,
      rewardCoins: 50,
      createdAt: '2026-01-13 09:15:00',
      updatedAt: '2026-01-13 09:15:00',
      status: 'expired'
    },
    {
      id: '4',
      targetReferrals: 75,
      rewardCoins: 150,
      createdAt: '2026-01-12 16:45:00',
      updatedAt: '2026-01-12 16:45:00',
      status: 'active'
    }
  ];

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'referrals'), orderBy('createdAt', 'desc')));
      const referralsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          targetReferrals: docData.targetReferrals,
          rewardCoins: docData.rewardCoins,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt.toDate().toISOString().replace('T', ' ').substring(0, 19) 
            : docData.createdAt,
          updatedAt: docData.updatedAt instanceof Timestamp 
            ? docData.updatedAt.toDate().toISOString().replace('T', ' ').substring(0, 19) 
            : docData.updatedAt,
          status: docData.status
        };
      }) as Referral[];
      setReferrals(referralsData);
    } catch (error) {
      console.error('Error loading referrals:', error);
      // Fallback to sample data
      setReferrals(sampleReferrals);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReferral = async () => {
    try {
      const docRef = await addDoc(collection(db, 'referrals'), {
        ...newReferral,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const
      });
      const newReferralWithId: Referral = {
        id: docRef.id,
        ...newReferral,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setReferrals(prev => [newReferralWithId, ...prev]);
      setShowAddModal(false);
      setNewReferral({ targetReferrals: 0, rewardCoins: 0 });
    } catch (error) {
      console.error('Error adding referral:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: Referral['status']) => {
    try {
      await updateDoc(doc(db, 'referrals', id), {
        status,
        updatedAt: serverTimestamp()
      });
      setReferrals(prev => prev.map(ref => 
        ref.id === id ? { 
          ...ref, 
          status, 
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) 
        } : ref
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'referrals', id));
      setReferrals(prev => prev.filter(ref => ref.id !== id));
    } catch (error) {
      console.error('Error deleting referral:', error);
    }
  };

  const filteredReferrals = referrals.filter(referral =>
    referral.targetReferrals.toString().includes(searchQuery) ||
    referral.rewardCoins.toString().includes(searchQuery) ||
    referral.status.includes(searchQuery)
  );

  const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 cairo-font">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referral System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-muted border-border"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Referral
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">1,234</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">856</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">378</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold text-foreground">45,678</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground font-medium">TARGET REFERRALS</TableHead>
                  <TableHead className="text-muted-foreground font-medium">REWARD COINS</TableHead>
                  <TableHead className="text-muted-foreground font-medium">CREATED AT</TableHead>
                  <TableHead className="text-muted-foreground font-medium">UPDATED AT</TableHead>
                  <TableHead className="text-muted-foreground font-medium">STATUS</TableHead>
                  <TableHead className="text-muted-foreground font-medium">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">Loading referral data...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((referral) => (
                    <TableRow key={referral.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{referral.targetReferrals}</TableCell>
                      <TableCell className="text-foreground">{referral.rewardCoins}</TableCell>
                      <TableCell className="text-muted-foreground">{referral.createdAt}</TableCell>
                      <TableCell className="text-muted-foreground">{referral.updatedAt}</TableCell>
                      <TableCell>
                        {getStatusBadge(referral.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(referral.id, referral.status === 'active' ? 'completed' : 'active')}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(referral.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Add Referral Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card border-border p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Add New Referral</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Target Referrals</label>
                  <Input
                    type="number"
                    value={newReferral.targetReferrals}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, targetReferrals: parseInt(e.target.value) || 0 }))}
                    className="bg-background border-border"
                    placeholder="Enter target referrals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reward Coins</label>
                  <Input
                    type="number"
                    value={newReferral.rewardCoins}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, rewardCoins: parseInt(e.target.value) || 0 }))}
                    className="bg-background border-border"
                    placeholder="Enter reward coins"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddReferral}
                  className="bg-primary text-primary-foreground"
                >
                  Add Referral
                </Button>
              </div>
            </Card>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReferralSystem;
