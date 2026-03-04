import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Search, Edit2, Save, X, Plus, Trash2, RefreshCw, Globe, CheckCircle, AlertCircle,
  Filter, Download, Upload, Eye, EyeOff, BarChart3, Settings, Database,
  Languages, FileText, Tag, Clock, TrendingUp, Users, Zap, Shield, Activity,
  ChevronDown, ChevronUp, MoreVertical, Grid, List, Layers, Target
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

interface Translation {
  id: string;
  key: string;
  en: string;
  ar: string;
  category: string;
  isActive: boolean;
  lastUpdated: any;
}

const TranslationsManager: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ en: '', ar: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTranslation, setNewTranslation] = useState({ key: '', en: '', ar: '', category: 'general' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = [
    'all', 'nav', 'hero', 'categories', 'stream', 'discover', 'goLive', 'getCoins', 'auth', 
    'footer', 'contact', 'about', 'terms', 'privacy', 'community', 'admin', 'recharge', 'payment'
  ];

  const categoryColors: { [key: string]: { bg: string; text: string; border: string } } = {
    'nav': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'hero': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'categories': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'stream': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'discover': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'goLive': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'getCoins': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'auth': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'footer': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'contact': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'about': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    'terms': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'privacy': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'community': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'admin': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'recharge': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'payment': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    'general': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  useEffect(() => {
    filterTranslations();
  }, [translations, searchTerm, selectedCategory, showInactive]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'translations'), orderBy('key'));
      const querySnapshot = await getDocs(q);
      const translationsData: Translation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.key !== '_summary') {
          translationsData.push({
            id: doc.id,
            key: data.key || '',
            en: data.en || '',
            ar: data.ar || '',
            category: data.category || 'general',
            isActive: data.isActive !== false,
            lastUpdated: data.lastUpdated
          });
        }
      });
      
      setTranslations(translationsData);
    } catch (error) {
      console.error('Error fetching translations:', error);
      setMessage({ type: 'error', text: t('translations.fetchError') || 'Failed to fetch translations' });
    } finally {
      setLoading(false);
    }
  };

  const filterTranslations = () => {
    let filtered = translations;
    
    if (!showInactive) {
      filtered = filtered.filter(t => t.isActive);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.key.toLowerCase().includes(searchLower) ||
        t.en.toLowerCase().includes(searchLower) ||
        t.ar.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        (t.lastUpdated && t.lastUpdated.toDate && t.lastUpdated.toDate().toLocaleDateString().toLowerCase().includes(searchLower)) ||
        (t.isActive ? 'active' : 'inactive').includes(searchLower)
      );
    }
    
    setFilteredTranslations(filtered);
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditForm({ en: translation.en, ar: translation.ar });
  };

  const handleSave = async (id: string) => {
    try {
      const docRef = doc(db, 'translations', id);
      await updateDoc(docRef, {
        en: editForm.en,
        ar: editForm.ar,
        lastUpdated: new Date()
      });
      
      setTranslations(translations.map(t => 
        t.id === id ? { ...t, en: editForm.en, ar: editForm.ar, lastUpdated: new Date() } : t
      ));
      
      setEditingId(null);
      setMessage({ type: 'success', text: t('translations.updateSuccess') || 'Translation updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating translation:', error);
      setMessage({ type: 'error', text: t('translations.updateError') || 'Failed to update translation' });
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'translations', id));
      setTranslations(translations.filter(t => t.id !== id));
      setMessage({ type: 'success', text: t('translations.deleteSuccess') || 'Translation deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting translation:', error);
      setMessage({ type: 'error', text: t('translations.deleteError') || 'Failed to delete translation' });
    }
  };

  const handleAdd = async () => {
    if (!newTranslation.key || !newTranslation.en || !newTranslation.ar) {
      setMessage({ type: 'error', text: t('translations.fillAllFields') || 'Please fill all fields' });
      return;
    }

    try {
      await addDoc(collection(db, 'translations'), {
        key: newTranslation.key,
        en: newTranslation.en,
        ar: newTranslation.ar,
        category: newTranslation.category,
        isActive: true,
        lastUpdated: new Date()
      });

      setNewTranslation({ key: '', en: '', ar: '', category: 'general' });
      setShowAddForm(false);
      fetchTranslations();
      setMessage({ type: 'success', text: t('translations.addSuccess') || 'Translation added successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding translation:', error);
      setMessage({ type: 'error', text: t('translations.addError') || 'Failed to add translation' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const docRef = doc(db, 'translations', id);
      await updateDoc(docRef, { isActive: !isActive, lastUpdated: new Date() });
      
      setTranslations(translations.map(t => 
        t.id === id ? { ...t, isActive: !isActive, lastUpdated: new Date() } : t
      ));
    } catch (error) {
      console.error('Error toggling translation:', error);
      setMessage({ type: 'error', text: t('translations.toggleError') || 'Failed to update translation status' });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedTranslations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkToggleActive = async (isActive: boolean) => {
    try {
      const batch = selectedTranslations.map(id => 
        updateDoc(doc(db, 'translations', id), { isActive, lastUpdated: new Date() })
      );
      
      await Promise.all(batch);
      
      setTranslations(translations.map(t => 
        selectedTranslations.includes(t.id) ? { ...t, isActive, lastUpdated: new Date() } : t
      ));
      
      setSelectedTranslations([]);
      setMessage({ type: 'success', text: `Bulk ${isActive ? 'activated' : 'deactivated'} successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error bulk updating:', error);
      setMessage({ type: 'error', text: 'Failed to update translations' });
    }
  };

  const exportTranslations = () => {
    const dataStr = JSON.stringify(filteredTranslations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `translations_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const groupTranslationsByCategory = () => {
    const grouped: { [key: string]: Translation[] } = {};
    filteredTranslations.forEach(translation => {
      if (!grouped[translation.category]) {
        grouped[translation.category] = [];
      }
      grouped[translation.category].push(translation);
    });
    return grouped;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-700 border-t-blue-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('translations.loading') || 'Loading translations...'}</h3>
            <p className="text-slate-400">{t('translations.loadingSubtitle') || 'Fetching data from Firestore...'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedTranslations = groupTranslationsByCategory();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                  <Database className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('translations.title') || 'Translations Manager'}</h1>
                  <p className="text-muted-foreground mt-1">{t('translations.subtitle') || 'Manage all website translations from Firestore'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-success/10 rounded-lg px-4 py-2 border border-success/20">
                  <Activity className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">{translations.filter(t => t.isActive).length} active</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTranslations}
                  className="bg-background border-border text-foreground hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('translations.export') || 'Export'}
                </Button>
                <Button
                  onClick={fetchTranslations}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('translations.refresh') || 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{translations.length}</div>
                    <div className="text-muted-foreground text-sm mt-1">{t('translations.total') || 'Total'}</div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-success">{translations.filter(t => t.isActive).length}</div>
                    <div className="text-muted-foreground text-sm mt-1">{t('translations.active') || 'Active'}</div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-destructive">{translations.filter(t => !t.isActive).length}</div>
                    <div className="text-muted-foreground text-sm mt-1">{t('translations.inactive') || 'Inactive'}</div>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <EyeOff className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-chart-1">{Math.round((translations.filter(t => t.isActive).length / translations.length) * 100)}%</div>
                    <div className="text-muted-foreground text-sm mt-1">{t('translations.completion') || 'Completion'}</div>
                  </div>
                  <div className="p-3 bg-chart-1/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-chart-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="px-8">
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-success/10 border border-success/20 text-success' 
                : 'bg-destructive/10 border border-destructive/20 text-destructive'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="px-8 py-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">{t('translations.filters') || 'Filters & Actions'}</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                    className={`bg-background border-border text-foreground hover:bg-accent ${showInactive ? 'bg-accent' : ''}`}
                  >
                    {showInactive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    <span>{showInactive ? (t('translations.hideInactive') || 'Hide Inactive') : (t('translations.showInactive') || 'Show Inactive')}</span>
                  </Button>
                  {selectedTranslations.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bulkToggleActive(true)}
                        className="bg-success/10 border-success/20 text-success hover:bg-success/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bulkToggleActive(false)}
                        className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-2">{t('translations.search') || 'Search'}</label>
                  <Search className="absolute left-3 top-10 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('translations.searchPlaceholder') || 'Search everything: key, English, Arabic, category, status, date...'}
                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('translations.category') || 'Category'}</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-background">
                        {cat === 'all' ? (t('translations.allCategories') || 'All Categories') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('translations.addNew') || 'Add New Translation'}
                  </Button>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTranslations(
                      selectedTranslations.length === filteredTranslations.length ? [] : filteredTranslations.map(t => t.id)
                    )}
                    className="w-full bg-background border-border text-foreground hover:bg-accent"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    {selectedTranslations.length === filteredTranslations.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-8 pb-6">
            <Card className="bg-card border-2 border-success">
              <CardHeader className="bg-success/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-semibold text-success">{t('translations.addNewTitle') || 'Add New Translation'}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-success hover:bg-success/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('translations.key') || 'Key'}</label>
                    <Input
                      placeholder={t('translations.keyPlaceholder') || 'Key (e.g., nav.home)'}
                      value={newTranslation.key}
                      onChange={(e) => setNewTranslation({...newTranslation, key: e.target.value})}
                      className="bg-background border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('translations.english') || 'English'}</label>
                    <Input
                      placeholder={t('translations.englishPlaceholder') || 'English text'}
                      value={newTranslation.en}
                      onChange={(e) => setNewTranslation({...newTranslation, en: e.target.value})}
                      className="bg-background border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('translations.arabic') || 'Arabic'}</label>
                    <Input
                      placeholder={t('translations.arabicPlaceholder') || 'Arabic text'}
                      value={newTranslation.ar}
                      onChange={(e) => setNewTranslation({...newTranslation, ar: e.target.value})}
                      className="bg-background border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('translations.category') || 'Category'}</label>
                    <select
                      value={newTranslation.category}
                      onChange={(e) => setNewTranslation({...newTranslation, category: e.target.value})}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {categories.filter(cat => cat !== 'all').map(cat => (
                        <option key={cat} value={cat} className="bg-background">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAdd}
                      className="w-full bg-success hover:bg-success/90 text-success-foreground"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('translations.save') || 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Translations Content */}
        <div className="px-8 pb-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('translations.translationsList') || 'Translations List'} 
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                      {filteredTranslations.length} {t('translations.items') || 'items'}
                    </Badge>
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedTranslations.length > 0 && `${selectedTranslations.length} selected`}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedTranslations.length === filteredTranslations.length && filteredTranslations.length > 0}
                            onChange={() => setSelectedTranslations(
                              selectedTranslations.length === filteredTranslations.length ? [] : filteredTranslations.map(t => t.id)
                            )}
                            className="rounded bg-muted border-border"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.key') || 'Key'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.english') || 'English'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.arabic') || 'Arabic'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.category') || 'Category'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.lastUpdated') || 'Last Updated'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('translations.actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredTranslations.map((translation) => (
                        <tr key={translation.id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTranslations.includes(translation.id)}
                              onChange={() => toggleSelection(translation.id)}
                              className="rounded bg-muted border-border"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono text-foreground">{translation.key}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {editingId === translation.id ? (
                              <Input
                                value={editForm.en}
                                onChange={(e) => setEditForm({...editForm, en: e.target.value})}
                                className="w-full bg-background border-border text-foreground"
                              />
                            ) : (
                              <span className="text-sm text-foreground">{translation.en}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === translation.id ? (
                              <Input
                                value={editForm.ar}
                                onChange={(e) => setEditForm({...editForm, ar: e.target.value})}
                                className="w-full bg-background border-border text-foreground"
                              />
                            ) : (
                              <span className="text-sm text-foreground">{translation.ar}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${categoryColors[translation.category]?.bg || categoryColors['general'].bg} ${categoryColors[translation.category]?.text || categoryColors['general'].text} ${categoryColors[translation.category]?.border || categoryColors['general'].border} border`}>
                              {translation.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{translation.lastUpdated?.toDate?.().toLocaleDateString() || 'Never'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {editingId === translation.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(translation.id)}
                                    className="text-success hover:bg-success/10"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingId(null)}
                                    className="text-muted-foreground hover:bg-accent"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(translation)}
                                    className="text-primary hover:bg-primary/10"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(translation.id, translation.key)}
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredTranslations.length === 0 && (
                    <div className="p-12 text-center">
                      <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        {t('translations.noResults') || 'No translations found'}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('translations.noResultsSubtitle') || 'Try adjusting your filters or search terms'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedTranslations).map(([category, categoryTranslations]) => (
                      <Card key={category} className="bg-muted border-border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${categoryColors[category]?.bg || categoryColors['general'].bg} ${categoryColors[category]?.text || categoryColors['general'].text} ${categoryColors[category]?.border || categoryColors['general'].border} border`}>
                                {category}
                              </Badge>
                              <span className="text-muted-foreground text-sm">({categoryTranslations.length})</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategoryExpansion(category)}
                              className="text-muted-foreground hover:bg-accent"
                            >
                              {expandedCategories.has(category) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </div>
                        </CardHeader>
                        {expandedCategories.has(category) && (
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {categoryTranslations.map((translation) => (
                                <div key={translation.id} className="bg-card rounded-lg p-3 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedTranslations.includes(translation.id)}
                                        onChange={() => toggleSelection(translation.id)}
                                        className="rounded bg-muted border-border"
                                      />
                                      <span className="text-xs font-mono text-muted-foreground">{translation.key}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleActive(translation.id, translation.isActive)}
                                        className={`p-1 ${translation.isActive ? 'text-success' : 'text-destructive'}`}
                                      >
                                        {translation.isActive ? <CheckCircle className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(translation)}
                                        className="p-1 text-primary"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(translation.id, translation.key)}
                                        className="p-1 text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-foreground">
                                      <span className="text-muted-foreground">EN:</span> {translation.en}
                                    </div>
                                    <div className="text-xs text-foreground">
                                      <span className="text-muted-foreground">AR:</span> {translation.ar}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TranslationsManager;
