import { useState, useEffect } from "react";
import { Search, Users, Video, FileText, Calendar, Filter, ChevronDown, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Report {
  id: string;
  createdAt: string;
  description: string;
  reason: string;
  reportedId: string;
  reporterId: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  type: 'User' | 'Stream' | 'Post';
}

const ReportManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'User' | 'Stream' | 'Post' | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'Pending' | 'Resolved' | 'Dismissed' | 'All'>('Pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Sample data matching the provided image data
  const sampleReports: Report[] = [
    {
      id: 'report_0',
      createdAt: '4 January 2026 at 02:13:01 UTC+2',
      description: 'User was being rude in chat',
      reason: 'Harassment',
      reportedId: 'user_2',
      reporterId: 'user_1',
      status: 'Pending',
      type: 'User'
    },
    {
      id: 'report_1',
      createdAt: '3 January 2026 at 23:13:01 UTC+2',
      description: 'Stream contains violence',
      reason: 'Inappropriate Content',
      reportedId: 'stream_0',
      reporterId: 'user_2',
      status: 'Resolved',
      type: 'Stream'
    },
    {
      id: 'report_2',
      createdAt: '3 January 2026 at 01:42:50 UTC+2',
      description: 'Spamming links',
      reason: 'Spam',
      reportedId: 'post_12',
      reporterId: 'user_4',
      status: 'Dismissed',
      type: 'Post'
    }
  ];

  useEffect(() => {
    loadReports();
  }, [filterType, filterStatus]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

      if (filterType !== 'All') {
        reportsQuery = query(reportsQuery, where('type', '==', filterType));
      }

      if (filterStatus !== 'All') {
        reportsQuery = query(reportsQuery, where('status', '==', filterStatus));
      }

      const data = await getDocs(reportsQuery);
      const reportsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt.toDate().toISOString().replace('T', ' ').substring(0, 19) 
            : docData.createdAt,
          description: docData.description,
          reason: docData.reason,
          reportedId: docData.reportedId,
          reporterId: docData.reporterId,
          status: docData.status,
          type: docData.type
        };
      }) as Report[];
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      // Fallback to sample data
      setReports(sampleReports);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || report.type === filterType;
    const matchesStatus = filterStatus === 'All' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'Dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'User':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'Stream':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'Post':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 cairo-font">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Report Management</h1>
            <p className="text-muted-foreground mt-1">Manage and review user reports</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-muted border-border"
              />
            </div>
            
            {/* Filter Type Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'User' ? 'default' : 'outline'}
                onClick={() => setFilterType('User')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                User Reports
              </Button>
              <Button
                variant={filterType === 'Stream' ? 'default' : 'outline'}
                onClick={() => setFilterType('Stream')}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Video Reports
              </Button>
              <Button
                variant={filterType === 'Post' ? 'default' : 'outline'}
                onClick={() => setFilterType('Post')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Post Reports
              </Button>
            </div>

            {/* Filter Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filterStatus === 'All' ? 'All Status' : filterStatus}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('All')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Resolved')}>
                  Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Dismissed')}>
                  Dismissed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filter by Date
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground font-medium">REPORTER</TableHead>
                  <TableHead className="text-muted-foreground font-medium">REPORT REASON</TableHead>
                  <TableHead className="text-muted-foreground font-medium">REPORTED USER</TableHead>
                  <TableHead className="text-muted-foreground font-medium">DATE</TableHead>
                  <TableHead className="text-muted-foreground font-medium">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">Loading report data...</div>
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">No Pending Reports</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((report) => (
                    <TableRow key={report.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="text-foreground">{report.reporterId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{report.reason}</TableCell>
                      <TableCell className="text-foreground">{report.reportedId}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.createdAt}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReports.length)} of {filteredReports.length} entries
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Showing {itemsPerPage}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                    Showing 10
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setItemsPerPage(25)}>
                    Showing 25
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                    Showing 50
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setItemsPerPage(100)}>
                    Showing 100
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportManagement;
