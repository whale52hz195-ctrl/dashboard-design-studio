import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GameBanner {
  id: string;
  image: string;
  redirectUrl: string;
  status: 'Active' | 'Inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const GamePage = () => {
  const [banners, setBanners] = useState<GameBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newBanner, setNewBanner] = useState<Partial<GameBanner>>({});
  const [editingBanner, setEditingBanner] = useState<GameBanner | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'gameBanners'), orderBy('createdAt', 'desc')));
      const bannersData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          image: docData.image || '',
          redirectUrl: docData.redirectUrl || '',
          status: docData.status || 'Active',
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt 
            : Timestamp.now(),
          updatedAt: docData.updatedAt instanceof Timestamp 
            ? docData.updatedAt 
            : Timestamp.now()
        };
      }) as GameBanner[];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error loading banners:', error);
      // Fallback data matching the image
      setBanners([
        {
          id: 'banner_1',
          image: 'https://images.unsplash.com/photo-1511519549404-497d0f95c75f?w=800&h=200&fit=crop',
          redirectUrl: 'https://www.google.com/',
          status: 'Active',
          createdAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-08-07T00:00:00Z'))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.image || !newBanner.redirectUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'gameBanners'), {
        image: newBanner.image,
        redirectUrl: newBanner.redirectUrl,
        status: 'Active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const createdBanner: GameBanner = {
        id: docRef.id,
        image: newBanner.image || '',
        redirectUrl: newBanner.redirectUrl || '',
        status: 'Active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      setBanners(prev => [createdBanner, ...prev]);
      setNewBanner({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating banner:', error);
      alert('Error creating banner');
    }
  };

  const handleEditBanner = async () => {
    if (!editingBanner || !newBanner.image || !newBanner.redirectUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'gameBanners', editingBanner.id), {
        image: newBanner.image,
        redirectUrl: newBanner.redirectUrl,
        updatedAt: Timestamp.now()
      });
      
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner.id 
          ? { ...banner, image: newBanner.image || '', redirectUrl: newBanner.redirectUrl || '', updatedAt: Timestamp.now() }
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
        await deleteDoc(doc(db, 'gameBanners', id));
        setBanners(prev => prev.filter(banner => banner.id !== id));
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'gameBanners', id), {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active',
        updatedAt: Timestamp.now()
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

  const openEditModal = (banner: GameBanner) => {
    setEditingBanner(banner);
    setNewBanner({
      image: banner.image,
      redirectUrl: banner.redirectUrl
    });
    setShowEditModal(true);
  };

  const filteredBanners = banners.filter(banner =>
    banner.redirectUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.status.toLowerCase().includes(searchTerm.toLowerCase())
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
      year: 'numeric' 
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Game Announcement Banner</h1>
            <p className="text-gray-400 mt-1">Manage your game banner</p>
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
                    IMAGE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    REDIRECT URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    LAST UPDATED
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="text-gray-400">Loading banners...</div>
                    </td>
                  </tr>
                ) : paginatedBanners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="text-gray-400">No banners found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={banner.image} 
                            alt="Banner" 
                            className="h-12 w-20 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/80x40/cccccc/000000?text=No+Image';
                            e.currentTarget.onerror = null;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-300 text-sm truncate max-w-xs">
                          {banner.redirectUrl}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(banner.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(banner.updatedAt)}
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
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Banner</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newBanner.image || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter image URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Redirect URL</label>
                  <input
                    type="text"
                    value={newBanner.redirectUrl || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="Enter redirect URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Banner</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newBanner.image || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter image URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Redirect URL</label>
                  <input
                    type="text"
                    value={newBanner.redirectUrl || ''}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="Enter redirect URL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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

export default GamePage;
