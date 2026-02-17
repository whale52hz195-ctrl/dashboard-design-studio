import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Reaction {
  id: string;
  name: string;
  emoji: string;
  category: string;
  status: string;
  usageCount: number;
  createdAt: Timestamp;
}

const Reactions = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newReaction, setNewReaction] = useState<Partial<Reaction>>({});

  useEffect(() => {
    loadReactions();
  }, []);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const data = await getDocs(query(collection(db, 'reactions'), orderBy('createdAt', 'desc')));
      const reactionsData = data.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name || '',
          emoji: docData.emoji || '',
          category: docData.category || '',
          status: docData.status || 'Active',
          usageCount: docData.usageCount || 0,
          createdAt: docData.createdAt instanceof Timestamp 
            ? docData.createdAt 
            : Timestamp.now()
        };
      }) as Reaction[];
      setReactions(reactionsData);
    } catch (error) {
      console.error('Error loading reactions:', error);
      // Fallback to sample data matching Firestore structure
      setReactions([
        {
          id: 'reaction_0',
          name: 'Thumbs Up',
          emoji: '👍',
          category: 'Positive',
          status: 'Active',
          usageCount: 45230,
          createdAt: Timestamp.fromDate(new Date('2026-01-04T04:13:01Z'))
        },
        {
          id: 'reaction_1',
          name: 'Heart',
          emoji: '❤️',
          category: 'Love',
          status: 'Active',
          usageCount: 67890,
          createdAt: Timestamp.fromDate(new Date('2026-01-04T04:13:01Z'))
        },
        {
          id: 'reaction_2',
          name: 'Sick',
          emoji: '🤒',
          category: 'Negative',
          status: 'Active',
          usageCount: 1234,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'reaction_3',
          name: 'Hug',
          emoji: '🤗',
          category: 'Positive',
          status: 'Active',
          usageCount: 5678,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'reaction_4',
          name: 'Laugh',
          emoji: '😂',
          category: 'Positive',
          status: 'Active',
          usageCount: 34567,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        },
        {
          id: 'reaction_5',
          name: 'Sad',
          emoji: '😢',
          category: 'Negative',
          status: 'Active',
          usageCount: 2345,
          createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReaction = async () => {
    if (!newReaction.name || !newReaction.emoji) {
      alert('Please enter reaction name and emoji');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'reactions'), {
        name: newReaction.name,
        emoji: newReaction.emoji,
        category: newReaction.category || 'General',
        status: 'Active',
        usageCount: 0,
        createdAt: Timestamp.now()
      });
      
      const createdReaction: Reaction = {
        id: docRef.id,
        name: newReaction.name || '',
        emoji: newReaction.emoji || '',
        category: newReaction.category || 'General',
        status: 'Active',
        usageCount: 0,
        createdAt: Timestamp.now()
      };
      
      setReactions(prev => [createdReaction, ...prev]);
      setNewReaction({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating reaction:', error);
      alert('Error creating reaction');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reactions', id));
      setReactions(prev => prev.filter(reaction => reaction.id !== id));
    } catch (error) {
      console.error('Error deleting reaction:', error);
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reactions</h1>
            <p className="text-gray-400 mt-1">Manage your reactions</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Reaction
          </button>
        </div>

        {/* Reactions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="text-gray-400">Loading reactions...</div>
            </div>
          ) : (
            reactions.map((reaction) => (
              <div key={reaction.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Reaction Header */}
                <div className="bg-gray-700 p-6 text-center">
                  <div className="text-6xl mb-3">{reaction.emoji}</div>
                  <h3 className="text-white font-semibold text-lg">{reaction.name}</h3>
                </div>
                
                {/* Reaction Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Category</span>
                    <span className="text-white text-sm font-medium">{reaction.category}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`text-sm font-medium ${
                      reaction.status === 'Active' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {reaction.status}
                    </span>
                  </div>
                  
                  {/* Usage Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Usage Count</span>
                    <span className="text-white text-sm font-medium">{reaction.usageCount.toLocaleString()}</span>
                  </div>
                  
                  {/* Added Date */}
                  <div className="text-gray-400 text-sm mb-4">
                    Added on {formatDate(reaction.createdAt)}
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
                      onClick={() => handleDelete(reaction.id)}
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
            <h2 className="text-xl font-semibold text-white mb-4">Create Reaction</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reaction Name</label>
                <input
                  type="text"
                  value={newReaction.name || ''}
                  onChange={(e) => setNewReaction(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter reaction name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emoji</label>
                <input
                  type="text"
                  value={newReaction.emoji || ''}
                  onChange={(e) => setNewReaction(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="Enter emoji (e.g., 👍)"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newReaction.category || 'General'}
                  onChange={(e) => setNewReaction(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Positive">Positive</option>
                  <option value="Love">Love</option>
                  <option value="Negative">Negative</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReaction}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Create Reaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reactions;
