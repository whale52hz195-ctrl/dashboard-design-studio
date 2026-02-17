import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye, MousePointer, TrendingUp, Calendar, ExternalLink, Home } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkTo: string;
  linkType: 'internal' | 'external';
  status: 'Active' | 'Inactive';
  type: 'splash' | 'popup' | 'banner';
  startDate: Timestamp;
  endDate: Timestamp;
  order: number;
  views: number;
  clicks: number;
  clickRate: number;
  createdAt: Timestamp;
}

const HomePage = () => {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newBanner, setNewBanner] = useState<Partial<HomeBanner>>({});
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
      const bannersData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          title: docData.title || '',
          imageUrl: docData.imageUrl || '',
          linkTo: docData.linkTo || '',
          linkType: docData.linkType || 'internal',
          status: docData.status || 'Active',
          type: docData.type || 'splash',
          startDate: docData.startDate instanceof Timestamp 
            ? docData.startDate 
            : Timestamp.now(),
          endDate: docData.endDate instanceof Timestamp 
            ? docData.endDate 
            : Timestamp.now(),
          order: docData.order || 1,
          views: docData.views || 0,
          clicks: docData.clicks || 0,
          clickRate: docData.clickRate || 0,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt 
            : Timestamp.now()
        };
      }) as HomeBanner[];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error loading banners:', error);
      // Fallback data matching the structure
      setBanners([
        {
          id: 'banner_0',
          title: 'Welcome Banner',
          imageUrl: 'https://via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=Welcome',
          linkTo: '/dashboard',
          linkType: 'internal',
          status: 'Active',
          type: 'splash',
          startDate: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00')),
          endDate: Timestamp.fromDate(new Date('2026-02-03T04:13:01+02:00')),
          order: 1,
          views: 12340,
          clicks: 890,
          clickRate: 7.2,
          createdAt: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00'))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl || !newBanner.linkTo) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'banners'), {
        title: newBanner.title,
        imageUrl: newBanner.imageUrl,
        linkTo: newBanner.linkTo,
        linkType: newBanner.linkType || 'internal',
        status: 'Active',
        type: newBanner.type || 'splash',
        startDate: newBanner.startDate || Timestamp.now(),
        endDate: newBanner.endDate || Timestamp.now(),
        order: newBanner.order || banners.length + 1,
        views: 0,
        clicks: 0,
        clickRate: 0,
        createdAt: Timestamp.now()
      });
      
      const createdBanner: HomeBanner = {
        id: docRef.id,
        title: newBanner.title || '',
        imageUrl: newBanner.imageUrl || '',
        linkTo: newBanner.linkTo || '',
        linkType: newBanner.linkType || 'internal',
        status: 'Active',
        type: newBanner.type || 'splash',
        startDate: newBanner.startDate || Timestamp.now(),
        endDate: newBanner.endDate || Timestamp.now(),
        order: newBanner.order || banners.length + 1,
        views: 0,
        clicks: 0,
        clickRate: 0,
        createdAt: Timestamp.now()
      };
      
      setBanners(prev => [...prev, createdBanner]);
      setNewBanner({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating banner:', error);
      alert('Error creating banner');
    }
  };

  const handleEditBanner = async () => {
    if (!editingBanner || !newBanner.title || !newBanner.imageUrl || !newBanner.linkTo) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'banners', editingBanner.id), {
        title: newBanner.title,
        imageUrl: newBanner.imageUrl,
        linkTo: newBanner.linkTo,
        linkType: newBanner.linkType,
        status: newBanner.status,
        type: newBanner.type,
        startDate: newBanner.startDate,
        endDate: newBanner.endDate,
        order: newBanner.order
      });
      
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner.id 
          ? { ...banner, 
              title: newBanner.title || '',
              imageUrl: newBanner.imageUrl || '',
              linkTo: newBanner.linkTo || '',
              linkType: newBanner.linkType || 'internal',
              status: newBanner.status || 'Active',
              type: newBanner.type || 'splash',
              startDate: newBanner.startDate || banner.startDate,
              endDate: newBanner.endDate || banner.endDate,
              order: newBanner.order || banner.order
            }
          : banner
      ));
      setNewBanner({});
      setEditingBanner(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', id));
        setBanners(prev => prev.filter(banner => banner.id !== id));
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'banners', id), {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active'
      });
      setBanners(prev => prev.map(banner => 
        banner.id === id 
          ? { ...banner, status: currentStatus === 'Active' ? 'Inactive' as const : 'Active' as const }
          : banner
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openEditModal = (banner: HomeBanner) => {
    setEditingBanner(banner);
    setNewBanner({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkTo: banner.linkTo,
      linkType: banner.linkType,
      status: banner.status,
      type: banner.type,
      startDate: banner.startDate,
      endDate: banner.endDate,
      order: banner.order
    });
    setShowEditModal(true);
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBanners.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedBanners = filteredBanners.slice(startIndex, endIndex);

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Home Banner Management</h1>
            <p className="text-gray-400 mt-1">Manage your home banners and splash screens</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Banner
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="text-gray-300">
            Total Banners: <span className="text-white font-medium">{banners.length}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Entries per page */}
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <label className="text-gray-400 text-sm">entries</label>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search ⌘K"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    BANNER
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    LINK
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    DURATION
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ANALYTICS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="text-gray-400">Loading banners...</div>
                    </td>
                  </tr>
                ) : paginatedBanners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="text-gray-400">No banners found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title}
                            className="h-16 w-24 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://picsum.photos/seed/homebanner/96/64.jpg';
                              e.currentTarget.onerror = null;
                            }}
                          />
                          <div>
                            <div className="text-white font-medium">{banner.title}</div>
                            <div className="text-gray-400 text-sm">Order: {banner.order}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {banner.linkType === 'internal' ? (
                            <Home className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="text-gray-300 text-sm truncate max-w-xs">
                            {banner.linkTo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          banner.type === 'splash' ? 'bg-blue-100 text-blue-800' :
                          banner.type === 'popup' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {banner.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(banner.id, banner.status)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            banner.status === 'Active' ? 'bg-green-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              banner.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-300 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(banner.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400">to</span>
                            <span>{formatDate(banner.endDate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">{formatNumber(banner.views)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">{formatNumber(banner.clicks)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-green-400 text-sm font-medium">{banner.clickRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(banner)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBanners.length)} of {filteredBanners.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Banner</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={newBanner.title || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter banner title"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newBanner.type || 'splash'}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="splash">Splash</option>
                      <option value="popup">Popup</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newBanner.imageUrl || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Enter image URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link To</label>
                    <input
                      type="text"
                      value={newBanner.linkTo || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, linkTo: e.target.value }))}
                      placeholder="Enter link URL"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link Type</label>
                    <select
                      value={newBanner.linkType || 'internal'}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, linkType: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                    <input
                      type="number"
                      value={newBanner.order || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      placeholder="Order"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={newBanner.startDate ? new Date(newBanner.startDate.toDate()).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, startDate: Timestamp.fromDate(new Date(e.target.value)) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={newBanner.endDate ? new Date(newBanner.endDate.toDate()).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, endDate: Timestamp.fromDate(new Date(e.target.value)) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBanner}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Banner</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={newBanner.title || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter banner title"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newBanner.type || 'splash'}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="splash">Splash</option>
                      <option value="popup">Popup</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newBanner.imageUrl || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Enter image URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link To</label>
                    <input
                      type="text"
                      value={newBanner.linkTo || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, linkTo: e.target.value }))}
                      placeholder="Enter link URL"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link Type</label>
                    <select
                      value={newBanner.linkType || 'internal'}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, linkType: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                    <input
                      type="number"
                      value={newBanner.order || ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      placeholder="Order"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={newBanner.startDate ? new Date(newBanner.startDate.toDate()).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, startDate: Timestamp.fromDate(new Date(e.target.value)) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={newBanner.endDate ? new Date(newBanner.endDate.toDate()).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, endDate: Timestamp.fromDate(new Date(e.target.value)) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditBanner}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Update Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
