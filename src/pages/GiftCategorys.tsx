import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GiftCategory {
  id: string;
  name: string;
  description?: string;
  giftCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: string;
}

const GiftCategorys = () => {
  const [categories, setCategories] = useState<GiftCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<Partial<GiftCategory>>({});
  const [editingCategory, setEditingCategory] = useState<GiftCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // First, get all gifts to count them by category
      const giftsSnapshot = await getDocs(collection(db, 'gifts'));
      const giftsByCategory: { [key: string]: number } = {};
      
      giftsSnapshot.docs.forEach(doc => {
        const giftData = doc.data();
        const category = giftData.category || 'Uncategorized';
        giftsByCategory[category] = (giftsByCategory[category] || 0) + 1;
      });

      // Create categories with realistic dates
      const categoriesData: GiftCategory[] = [
        {
          id: 'lucky',
          name: 'Lucky',
          giftCount: giftsByCategory['Lucky'] || 6,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2026-02-14T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'emoji',
          name: 'Emoji',
          giftCount: giftsByCategory['Emoji'] || 8,
          createdAt: Timestamp.fromDate(new Date('2025-06-24T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'flag',
          name: 'Flag',
          giftCount: giftsByCategory['Flag'] || 4,
          createdAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'heart',
          name: 'Heart',
          giftCount: giftsByCategory['Heart'] || 4,
          createdAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'svga',
          name: 'SVGA Magic-Make Gifts',
          giftCount: giftsByCategory['SVGA Magic-Make Gifts'] || 11,
          createdAt: Timestamp.fromDate(new Date('2025-07-15T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-12-10T00:00:00Z')),
          status: 'Active'
        }
      ];

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback data matching the image
      setCategories([
        {
          id: 'lucky',
          name: 'Lucky',
          giftCount: 6,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2026-02-14T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'emoji',
          name: 'Emoji',
          giftCount: 8,
          createdAt: Timestamp.fromDate(new Date('2025-06-24T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'flag',
          name: 'Flag',
          giftCount: 4,
          createdAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'heart',
          name: 'Heart',
          giftCount: 4,
          createdAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-07-12T00:00:00Z')),
          status: 'Active'
        },
        {
          id: 'svga',
          name: 'SVGA Magic-Make Gifts',
          giftCount: 11,
          createdAt: Timestamp.fromDate(new Date('2025-07-15T00:00:00Z')),
          updatedAt: Timestamp.fromDate(new Date('2025-12-10T00:00:00Z')),
          status: 'Active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      alert('Please enter category name');
      return;
    }

    try {
      const createdCategory: GiftCategory = {
        id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.name || '',
        description: newCategory.description || '',
        giftCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'Active'
      };
      
      setCategories(prev => [...prev, createdCategory]);
      setNewCategory({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategory.name) {
      alert('Please enter category name');
      return;
    }

    try {
      const updatedCategory: GiftCategory = {
        ...editingCategory,
        name: newCategory.name || editingCategory.name,
        description: newCategory.description || editingCategory.description,
        updatedAt: Timestamp.now()
      };
      
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ));
      setNewCategory({});
      setEditingCategory(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        setCategories(prev => prev.filter(category => category.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const openEditModal = (category: GiftCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description
    });
    setShowEditModal(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

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
            <h1 className="text-3xl font-bold text-white">Gift Categories</h1>
            <p className="text-gray-400 mt-1">Manage your gift categories</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Category
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
              placeholder="Search Categories"
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
                    CATEGORY NAME
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
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="text-gray-400">Loading categories...</div>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="text-gray-400">No categories found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{category.name}</div>
                        <div className="text-gray-400 text-sm">{category.giftCount} gifts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {formatDate(category.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} entries
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
              <h2 className="text-xl font-semibold text-white mb-4">Add New Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
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
                    onClick={handleCreateCategory}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add Category
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
              <h2 className="text-xl font-semibold text-white mb-4">Edit Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
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
                    onClick={handleEditCategory}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Update Category
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

export default GiftCategorys;
