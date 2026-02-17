import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Gift {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  status: string;
  featured: boolean;
  totalSent: number;
  totalRevenue: number;
  createdAt: Timestamp;
}

interface GiftCategory {
  id: string;
  name: string;
}

const Gifts = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newGift, setNewGift] = useState<Partial<Gift>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  useEffect(() => {
    loadGifts();
  }, []);

  useEffect(() => {
    // Extract categories from gifts
    const uniqueCategories = Array.from(new Set(gifts.map(gift => gift.category)));
    setCategories(uniqueCategories);
  }, [gifts]);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'gifts'), orderBy('createdAt', 'desc')));
      const giftsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name || '',
          image: docData.image || '',
          category: docData.category || '',
          price: docData.price || 0,
          status: docData.status || 'Active',
          featured: docData.featured || false,
          totalSent: docData.totalSent || 0,
          totalRevenue: docData.totalRevenue || 0,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt 
            : Timestamp.now()
        };
      }) as Gift[];
      setGifts(giftsData);
    } catch (error) {
      console.error('Error loading gifts:', error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGift = async () => {
    if (!newGift.name || !newGift.image || !newGift.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'gifts'), {
        name: newGift.name,
        image: newGift.image,
        category: newGift.category,
        price: newGift.price || 0,
        status: 'Active',
        featured: newGift.featured || false,
        totalSent: 0,
        totalRevenue: 0,
        createdAt: Timestamp.now()
      });
      
      const createdGift: Gift = {
        id: docRef.id,
        name: newGift.name || '',
        image: newGift.image || '',
        category: newGift.category || '',
        price: newGift.price || 0,
        status: 'Active',
        featured: newGift.featured || false,
        totalSent: 0,
        totalRevenue: 0,
        createdAt: Timestamp.now()
      };
      
      setGifts(prev => [createdGift, ...prev]);
      setNewGift({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating gift:', error);
      alert('Error creating gift');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gift?')) {
      try {
        await deleteDoc(doc(db, 'gifts', id));
        setGifts(prev => prev.filter(gift => gift.id !== id));
      } catch (error) {
        console.error('Error deleting gift:', error);
      }
    }
  };

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedGifts = filteredGifts.reduce((acc, gift) => {
    if (!acc[gift.category]) {
      acc[gift.category] = [];
    }
    acc[gift.category].push(gift);
    return acc;
  }, {} as { [key: string]: Gift[] });

  // Helper function to render different types of gift images
  const renderGiftImage = (image: string, name: string, featured: boolean) => {
    // Check if it's a URL (image or GIF)
    if (image.startsWith('http')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={image} 
            alt={name}
            className="max-h-full max-w-full object-contain rounded-lg"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-6xl">🎁</div>`;
              }
            }}
          />
          {featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
      );
    }
    
    // Check if it's an SVGA file
    if (image.endsWith('.svga')) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">🎬</div>
          <div className="text-xs text-gray-400">SVGA</div>
          {featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
      );
    }
    
    // Check if it's a GIF file
    if (image.endsWith('.gif')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={image} 
            alt={name}
            className="max-h-full max-w-full object-contain rounded-lg"
            onError={(e) => {
              // Fallback to emoji if GIF fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-6xl">🎁</div>`;
              }
            }}
          />
          {featured && (
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
              GIF
            </div>
          )}
        </div>
      );
    }
    
    // Default: treat as emoji or text
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-6xl">{image || '🎁'}</div>
        {featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
    );
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get all categories for filter tabs
  const allCategories = ['All Categories', ...categories];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gifts</h1>
            <p className="text-gray-400 mt-1">Manage your gift categories and items</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Gift
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search gifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gifts Grid by Category */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading gifts from Firestore...</div>
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400">No gifts found</div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedGifts).map(([category, categoryGifts]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {category} <span className="text-gray-400 text-sm ml-2">({categoryGifts.length} gifts)</span>
                  </h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Add
                  </button>
                </div>
                
                {/* Gifts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryGifts.map((gift) => (
                    <div key={gift.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                      {/* Gift Image */}
                      <div className="bg-gray-700 p-4 h-40 relative">
                        {renderGiftImage(gift.image, gift.name, gift.featured)}
                      </div>
                      
                      {/* Gift Info */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-2">{gift.name}</h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                            <span className="text-white font-medium">{gift.price}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            gift.status === 'Active' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {gift.status}
                          </span>
                        </div>
                        
                        <div className="text-gray-400 text-sm mb-4">
                          Created {formatDate(gift.createdAt)}
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          <div className="text-gray-400">
                            <span className="text-white font-medium">{gift.totalSent.toLocaleString()}</span> sent
                          </div>
                          <div className="text-gray-400">
                            <span className="text-white font-medium">${gift.totalRevenue.toLocaleString()}</span> revenue
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(gift.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button className="ml-auto text-purple-400 hover:text-purple-300 text-sm font-medium">
                            Add Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Gift</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gift Name</label>
                  <input
                    type="text"
                    value={newGift.name || ''}
                    onChange={(e) => setNewGift(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter gift name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gift Image/Emoji</label>
                  <input
                    type="text"
                    value={newGift.image || ''}
                    onChange={(e) => setNewGift(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter emoji (❤️) or image URL (https://...)"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Supports: Emoji, Image URLs, GIFs, SVGA files</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newGift.category || ''}
                    onChange={(e) => setNewGift(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    value={newGift.price || ''}
                    onChange={(e) => setNewGift(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter price"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newGift.featured || false}
                    onChange={(e) => setNewGift(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Featured</label>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGift}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add Gift
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

export default Gifts;
