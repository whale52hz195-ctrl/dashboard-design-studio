import { useState, useEffect } from "react";
import { Search, Bell, Phone, Check, X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { helpRequestsService, HelpRequestData } from "@/lib/helpRequestsService";

const HelpRequests = () => {
  const [requests, setRequests] = useState<HelpRequestData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HelpRequestData[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'solved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    loadHelpRequests();
  }, []);

  const loadHelpRequests = async () => {
    try {
      setLoading(true);
      const data = await helpRequestsService.getAllHelpRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading help requests:', error);
      // Fallback to sample data if Firebase fails
      const sampleRequests: HelpRequestData[] = [
        {
          id: '1',
          user: {
            name: 'Mr John Smith',
            username: '@john',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            hasHeart: true
          },
          helpRequest: 'I want to suggest an improvement for the library\'s collection system. The current interface could be more user-friendly with better search filters and categorization options.',
          contact: '+917226838645',
          date: '11/14/2025, 10:45:25 AM',
          image: 'https://picsum.photos/seed/help1/40/40',
          status: 'pending'
        }
      ];
      setRequests(sampleRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = requests.filter(req => req.status === statusFilter);
    
    if (searchQuery) {
      filtered = filtered.filter(req => 
        req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.helpRequest.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [requests, statusFilter, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'solved') => {
    try {
      await helpRequestsService.updateHelpRequestStatus(id, newStatus);
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      );
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local update
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      );
      setRequests(updatedRequests);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await helpRequestsService.deleteHelpRequest(id);
      const updatedRequests = requests.filter(req => req.id !== id);
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error deleting request:', error);
      // Fallback to local update
      const updatedRequests = requests.filter(req => req.id !== id);
      setRequests(updatedRequests);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 cairo-font">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help Requests</h1>
            <p className="text-muted-foreground mt-1">Review and respond to user support requests</p>
          </div>
        </div>

          {/* Status Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'solved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('solved')}
          >
            Solved
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-muted-foreground">Loading help requests...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">USER</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">NAME</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">HELP REQUEST</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">CONTACT</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">DATE</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">IMAGE</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((request) => (
                      <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.user.avatar} />
                            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{request.user.name}</span>
                            {request.user.hasHeart && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                          </div>
                          <div className="text-sm text-muted-foreground">{request.user.username}</div>
                        </td>
                        <td className="p-4 max-w-md">
                          <div className="text-sm text-foreground line-clamp-2">
                            {request.helpRequest}
                          </div>
                          <button className="text-primary hover:text-primary/80 text-sm mt-1">
                            Read more
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{request.contact}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {request.date}
                        </td>
                        <td className="p-4">
                          <img 
                            src={request.image} 
                            alt="Request" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(request.id!, 'solved')}
                              className="p-2 rounded hover:bg-green-600/20 transition-colors group"
                              title="Mark as solved"
                            >
                              <Check className="w-4 h-4 text-green-500 group-hover:text-green-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(request.id!)}
                              className="p-2 rounded hover:bg-red-600/20 transition-colors group"
                              title="Delete"
                            >
                              <X className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    K
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  <button className="px-3 py-1 rounded bg-primary text-primary-foreground">
                    {currentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                    className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(filteredRequests.length / itemsPerPage))}
                    disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                    className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    I
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpRequests;
