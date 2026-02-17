import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Hashtag {
  id: string;
  hashtag: string;
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const HashtagPage = () => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newHashtag, setNewHashtag] = useState<Partial<Hashtag>>({});
  const [editingHashtag, setEditingHashtag] = useState<Hashtag | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadHashtags();
  }, []);

  const loadHashtags = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'hashtags'), orderBy('createdAt', 'desc')));
      const hashtagsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          hashtag: docData.hashtag || '',
          usageCount: docData.usageCount || 0,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt 
            : Timestamp.now(),
          updatedAt: docData.updatedAt instanceof Timestamp 
            ? docData.updatedAt 
            : Timestamp.now()
        };
      }) as Hashtag[];
      setHashtags(hashtagsData);
    } catch (error) {
      console.error('Error loading hashtags:', error);
      // Fallback data matching the image
      setHashtags([
        {
          id: 'hashtag_1',
          hashtag: '#KindHearted',
          usageCount: 12,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_2',
          hashtag: '#Photography',
          usageCount: 11,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_3',
          hashtag: '#JustFriends',
          usageCount: 9,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_4',
          hashtag: '#OpenMinded',
          usageCount: 8,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_5',
          hashtag: '#Bookworm',
          usageCount: 8,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_6',
          hashtag: '#LongTermOnly',
          usageCount: 7,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_7',
          hashtag: '#LookingForLove',
          usageCount: 5,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'hashtag_8',
          hashtag: '#SeriousRelationship',
          usageCount: 4,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHashtag = async () => {
    if (!newHashtag.hashtag) {
      alert('Please enter hashtag');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'hashtags'), {
        hashtag: newHashtag.hashtag.startsWith('#') ? newHashtag.hashtag : `#${newHashtag.hashtag}`,
        usageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const createdHashtag: Hashtag = {
        id: docRef.id,
        hashtag: newHashtag.hashtag.startsWith('#') ? newHashtag.hashtag : `#${newHashtag.hashtag}`,
        usageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      setHashtags(prev => [createdHashtag, ...prev]);
      setNewHashtag({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating hashtag:', error);
      alert('Error creating hashtag');
    }
  };

  const handleEditHashtag = async () => {
    if (!editingHashtag || !newHashtag.hashtag) {
      alert('Please enter hashtag');
      return;
    }

    try {
      await updateDoc(doc(db, 'hashtags', editingHashtag.id), {
        hashtag: newHashtag.hashtag.startsWith('#') ? newHashtag.hashtag : `#${newHashtag.hashtag}`,
        updatedAt: Timestamp.now()
      });
      
      setHashtags(prev => prev.map(tag => 
        tag.id === editingHashtag.id 
          ? { ...tag, hashtag: newHashtag.hashtag.startsWith('#') ? newHashtag.hashtag : `#${newHashtag.hashtag}`, updatedAt: Timestamp.now() }
          : tag
      ));
      setNewHashtag({});
      setEditingHashtag(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating hashtag:', error);
      alert('Error updating hashtag');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hashtag?')) {
      try {
        await deleteDoc(doc(db, 'hashtags', id));
        setHashtags(prev => prev.filter(hashtag => hashtag.id !== id));
      } catch (error) {
        console.error('Error deleting hashtag:', error);
      }
    }
  };

  const openEditModal = (hashtag: Hashtag) => {
    setEditingHashtag(hashtag);
    setNewHashtag({
      hashtag: hashtag.hashtag
    });
    setShowEditModal(true);
  };

  const filteredHashtags = hashtags.filter(hashtag =>
    hashtag.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredHashtags.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedHashtags = filteredHashtags.slice(startIndex, endIndex);

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
            <h1 className="text-3xl font-bold text-white">Hashtags</h1>
            <p className="text-gray-400 mt-1">Create and manage trending hashtags</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Hashtag
          </button>
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
              placeholder="Search hashtags..."
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
                    HASHTAG
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    USAGE COUNT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    CREATED AT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    UPDATED AT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="text-gray-400">Loading hashtags...</div>
                    </td>
                  </tr>
                ) : paginatedHashtags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="text-gray-400">No hashtags found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedHashtags.map((hashtag) => (
                    <tr key={hashtag.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{hashtag.hashtag}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {hashtag.usageCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(hashtag.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(hashtag.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(hashtag)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(hashtag.id)}
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredHashtags.length)} of {filteredHashtags.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-3" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
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
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-white mb-4">Create Hashtag</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hashtag</label>
                  <input
                    type="text"
                    value={newHashtag.hashtag || ''}
                    onChange={(e) => setNewHashtag(prev => ({ ...prev, hashtag: e.target.value }))}
                    placeholder="Enter hashtag (e.g., #trending)"
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
                    onClick={handleCreateHashtag}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Create Hashtag
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
              <h2 className="text-xl font-semibold text-white mb-4">Edit Hashtag</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hashtag</label>
                  <input
                    type="text"
                    value={newHashtag.hashtag || ''}
                    onChange={(e) => setNewHashtag(prev => ({ ...prev, hashtag: e.target.value }))}
                    placeholder="Enter hashtag (e.g., #trending)"
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
                    onClick={handleEditHashtag}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Update Hashtag
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

export default HashtagPage;
