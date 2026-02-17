import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BeautyEffect {
  id: string;
  name: string;
  image: string;
  active: boolean;
  addedOn: string;
}

const BeautyEffects = () => {
  const [effects, setEffects] = useState<BeautyEffect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newEffect, setNewEffect] = useState<Partial<BeautyEffect>>({});

  useEffect(() => {
    loadBeautyEffects();
  }, []);

  const loadBeautyEffects = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'beautyEffects'), orderBy('createdAt', 'desc')));
      const effectsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name || '',
          image: docData.image || '',
          active: docData.active ?? true,
          addedOn: docData.addedOn instanceof Timestamp 
            ? docData.addedOn.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : docData.addedOn || 'Dec 26, 2025'
        };
      }) as BeautyEffect[];
      setEffects(effectsData);
    } catch (error) {
      console.error('Error loading beauty effects:', error);
      // Fallback to sample data matching the image
      setEffects([
        {
          id: 'effect_1',
          name: 'Bright Glasses',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop',
          active: true,
          addedOn: 'Dec 26, 2025'
        },
        {
          id: 'effect_2',
          name: 'Butterfly Headband',
          image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop',
          active: true,
          addedOn: 'Dec 26, 2025'
        },
        {
          id: 'effect_3',
          name: 'Sparkle Crown',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
          active: false,
          addedOn: 'Dec 25, 2025'
        },
        {
          id: 'effect_4',
          name: 'Flower Crown',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop',
          active: true,
          addedOn: 'Dec 24, 2025'
        },
        {
          id: 'effect_5',
          name: 'Neon Glasses',
          image: 'https://images.unsplash.com/photo-1572635196237-14b3f2815032?w=300&h=200&fit=crop',
          active: true,
          addedOn: 'Dec 23, 2025'
        },
        {
          id: 'effect_6',
          name: 'Star Filter',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
          active: false,
          addedOn: 'Dec 22, 2025'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEffect = async () => {
    if (!newEffect.name) {
      alert('Please enter effect name');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'beautyEffects'), {
        ...newEffect,
        active: true,
        addedOn: Timestamp.now(),
        createdAt: Timestamp.now()
      });
      
      const createdEffect: BeautyEffect = {
        id: docRef.id,
        name: newEffect.name || '',
        image: newEffect.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
        active: true,
        addedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      
      setEffects(prev => [createdEffect, ...prev]);
      setNewEffect({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating effect:', error);
      alert('Error creating beauty effect');
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'beautyEffects', id), {
        active: !currentActive,
        updatedAt: Timestamp.now()
      });
      setEffects(prev => prev.map(effect => 
        effect.id === id ? { ...effect, active: !currentActive } : effect
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'beautyEffects', id));
      setEffects(prev => prev.filter(effect => effect.id !== id));
    } catch (error) {
      console.error('Error deleting effect:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Beauty Effects</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Beauty Effect
          </button>
        </div>

        {/* Effects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="text-gray-400">Loading beauty effects...</div>
            </div>
          ) : (
            effects.map((effect) => (
              <div key={effect.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Effect Image */}
                <div className="h-48 bg-gray-700 relative overflow-hidden">
                  <img 
                    src={effect.image}
                    alt={effect.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop';
                    }}
                  />
                </div>
                
                {/* Effect Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-3">{effect.name}</h3>
                  
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Active</span>
                    <button
                      onClick={() => handleToggleStatus(effect.id, effect.active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        effect.active ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          effect.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Added Date */}
                  <div className="text-gray-400 text-sm mb-4">
                    Added on {effect.addedOn}
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
                      onClick={() => handleDelete(effect.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Create Beauty Effect</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Effect Name</label>
                <input
                  type="text"
                  value={newEffect.name || ''}
                  onChange={(e) => setNewEffect(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter effect name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="text"
                  value={newEffect.image || ''}
                  onChange={(e) => setNewEffect(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL (optional)"
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
                  onClick={handleCreateEffect}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Create Effect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BeautyEffects;
