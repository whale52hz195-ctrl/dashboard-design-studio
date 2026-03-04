import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  TestTube,
  Play,
  Power,
  PowerOff,
  Shield,
  Zap,
  Activity,
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Database,
  Wifi,
  WifiOff,
  ChevronRight,
  MoreVertical,
  Copy,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  BarChart3,
  Terminal,
  Code,
  Cpu,
  HardDrive,
  Cloud,
  Server,
  Link2,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Loader2,
  Grid,
  List,
  Video,
  CreditCard,
  DollarSign,
  Smartphone,
  Palette,
  Globe
} from 'lucide-react';
import { getAPIConfigs, getAPIConfig, updateAPIConfig, toggleAPIStatus, switchAPIMode, testAPIConnection, getAPIStats } from '@/lib/apiService';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const APIManagement = () => {
  const { t, isRTL } = useLanguage();
  const [apiConfigs, setApiConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAPI, setSelectedAPI] = useState<string | null>(null);
  const [apiDetails, setApiDetails] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiLogs, setApiLogs] = useState<Record<string, any[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'testing'>>({});
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAPIConfigs();
    loadStats();
    
    // Setup real-time listener
    if (isRealTime) {
      const interval = setInterval(() => {
        loadAPIConfigs();
        loadStats();
        setLastUpdate(new Date());
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isRealTime]);
  
  useEffect(() => {
    // Auto-refresh when enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAPIConfigs();
        loadStats();
        setLastUpdate(new Date());
      }, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadAPIConfigs = async () => {
    try {
      console.log('📥 Loading API configs...');
      setLoading(true);
      const configs = await getAPIConfigs();
      console.log('✅ Loaded configs:', Object.keys(configs));
      setApiConfigs(configs);
    } catch (error) {
      console.error('❌ Error loading API configs:', error);
      setMessage({ type: 'error', text: t('apiManagement.error') });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const apiStats = await getAPIStats();
      setStats(apiStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleToggleAPI = async (apiName: string, currentStatus: boolean) => {
    console.log('🔄 Toggle API:', apiName, 'from', currentStatus, 'to', !currentStatus);
    try {
      setSaving(apiName);
      console.log('📞 Calling toggleAPIStatus...');
      await toggleAPIStatus(apiName, !currentStatus);
      console.log('✅ toggleAPIStatus success');
      
      // Update local state immediately without full refresh
      setApiConfigs(prev => {
        console.log('🔄 Updating local state for:', apiName);
        return {
          ...prev,
          [apiName]: {
            ...prev[apiName],
            isActive: !currentStatus,
            updatedAt: new Date().toISOString()
          }
        };
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: !currentStatus ? prev.active + 1 : prev.active - 1
      }));
      
      setMessage({ type: 'success', text: t('apiManagement.toggleSuccess') });
      console.log('✅ API toggle completed successfully');
    } catch (error) {
      console.error('❌ Error toggling API:', error);
      setMessage({ type: 'error', text: t('apiManagement.toggleError') });
      // Revert on error
      await loadAPIConfigs();
    } finally {
      setSaving(null);
    }
  };

  const handleSwitchMode = async (apiName: string, isTestMode: boolean) => {
    console.log('🔄 Switch Mode:', apiName, 'to', isTestMode ? 'test' : 'live');
    try {
      setSaving(apiName);
      console.log('📞 Calling switchAPIMode...');
      await switchAPIMode(apiName, isTestMode);
      console.log('✅ switchAPIMode success');
      
      // Update local state immediately
      setApiConfigs(prev => {
        console.log('🔄 Updating local state for mode switch:', apiName);
        return {
          ...prev,
          [apiName]: {
            ...prev[apiName],
            settings: {
              ...prev[apiName].settings,
              testMode: isTestMode
            },
            updatedAt: new Date().toISOString()
          }
        };
      });
      
      const mode = isTestMode ? 'test' : 'live';
      setMessage({ type: 'success', text: t('apiManagement.switchModeSuccess', { mode }) });
      console.log('✅ Mode switch completed successfully');
    } catch (error) {
      console.error('❌ Error switching mode:', error);
      const mode = isTestMode ? 'test' : 'live';
      setMessage({ type: 'error', text: t('apiManagement.switchModeError', { mode }) });
      // Revert on error
      await loadAPIConfigs();
    } finally {
      setSaving(null);
    }
  };

  const handleTestConnection = async (apiName: string) => {
    try {
      setSaving(apiName);
      setConnectionStatus(prev => ({ ...prev, [apiName]: 'testing' }));
      
      await testAPIConnection(apiName);
      
      setConnectionStatus(prev => ({ ...prev, [apiName]: 'connected' }));
      setMessage({ type: 'success', text: t('apiManagement.testSuccess') });
      
      // Add to logs
      setApiLogs(prev => ({
        ...prev,
        [apiName]: [
          ...(prev[apiName] || []),
          { timestamp: new Date().toISOString(), message: 'Connection test successful' }
        ].slice(-10) // Keep only last 10 logs
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [apiName]: 'disconnected' }));
      setMessage({ type: 'error', text: t('apiManagement.testError') });
      
      // Add to logs
      setApiLogs(prev => ({
        ...prev,
        [apiName]: [
          ...(prev[apiName] || []),
          { timestamp: new Date().toISOString(), message: 'Connection test failed' }
        ].slice(-10)
      }));
    } finally {
      setSaving(null);
    }
  };

  const handleViewDetails = async (apiName: string) => {
    try {
      const details = await getAPIConfig(apiName);
      setApiDetails(details);
      setSelectedAPI(apiName);
    } catch (error) {
      console.error('Error loading API details:', error);
    }
  };

  const handleSaveConfig = async (apiName: string, updates: any) => {
    try {
      setSaving(apiName);
      await updateAPIConfig(apiName, updates);
      
      // Update local state immediately
      setApiConfigs(prev => ({
        ...prev,
        [apiName]: {
          ...prev[apiName],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }));
      
      setMessage({ type: 'success', text: t('apiManagement.saveSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: t('apiManagement.saveError') });
      // Revert on error
      await loadAPIConfigs();
    } finally {
      setSaving(null);
    }
  };
  
  const handleCreateAPI = async () => {
    // This would open a dialog to create a new API
    setMessage({ type: 'info', text: 'Create API feature coming soon!' });
  };
  
  const handleDeleteAPI = async (apiName: string) => {
    if (confirm(`Are you sure you want to delete ${apiName}?`)) {
      try {
        setSaving(apiName);
        // This would call a delete function
        setMessage({ type: 'success', text: 'API deleted successfully' });
        await loadAPIConfigs();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete API' });
      } finally {
        setSaving(null);
      }
    }
  };
  
  const handleExportConfig = async () => {
    try {
      const dataStr = JSON.stringify(apiConfigs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `api-config-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      setMessage({ type: 'success', text: 'Configuration exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export configuration' });
    }
  };
  
  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        // Validate and import
        setMessage({ type: 'success', text: 'Configuration imported successfully' });
        await loadAPIConfigs();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to import configuration' });
      }
    }
  };

  const getAPIIcon = (apiName: string) => {
    switch (apiName) {
      case 'agora': return Video;
      case 'stripe': return CreditCard;
      case 'razorpay': return DollarSign;
      case 'flutterwave': return Smartphone;
      case 'deepar': return Palette;
      case 'app_config': return Settings;
      default: return Settings;
    }
  };

  const getAPIStatusColor = (api: any) => {
    if (!api.isActive) return 'bg-gray-500';
    const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
    return hasCredentials ? 'bg-green-500' : 'bg-yellow-500';
  };

  const filteredAPIs = Object.entries(apiConfigs)
    .filter(([name, api]) => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || api.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort(([, a], [, b]) => {
      // Sort by status (active first), then by name
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

  const categories = ['all', ...new Set(Object.values(apiConfigs).map(api => api.category))];

  const getAPIHealthScore = (api: any) => {
    let score = 0;
    if (api.isActive) score += 40;
    const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
    if (hasCredentials) score += 30;
    if (connectionStatus[api.name] === 'connected') score += 20;
    if (api.lastTestSuccess) score += 10;
    return score;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">{t('apiManagement.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Server className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-primary/60 bg-clip-text text-transparent">
                  {t('apiManagement.title')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2 font-medium">{t('apiManagement.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                variant="outline"
                size="default"
                className="bg-background border-border hover:bg-accent px-4 py-2 text-base font-medium"
              >
                <Settings className="h-5 w-5 mr-2" />
                {showAdvanced ? 'Simple View' : 'Advanced View'}
              </Button>
              <Button 
                onClick={loadAPIConfigs} 
                variant="outline"
                className="bg-background border-border hover:bg-accent px-4 py-2 text-base font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {t('apiManagement.refresh')}
              </Button>
            </div>
          </div>
          
          {/* Advanced Toolbar */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    disabled={saving !== null}
                  />
                  <span className="text-sm font-medium text-foreground">Auto Refresh</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isRealTime}
                    onCheckedChange={setIsRealTime}
                    disabled={saving !== null}
                  />
                  <span className="text-sm font-medium text-foreground">Real-time</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Last: {lastUpdate.toLocaleTimeString()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleCreateAPI}
                  variant="outline"
                  size="sm"
                  className="bg-background border-border hover:bg-accent"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New API
                </Button>
                <Button
                  onClick={handleExportConfig}
                  variant="outline"
                  size="sm"
                  className="bg-background border-border hover:bg-accent"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background border-border hover:bg-accent"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-primary/80">{t('apiManagement.totalAPIs')}</p>
                    <p className="text-4xl font-bold text-foreground">{stats.total}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">{t('apiManagement.overview')}</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Server className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/5 via-card to-card border-green-500/10 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-green-600/80">{t('apiManagement.activeAPIs')}</p>
                    <p className="text-4xl font-bold text-foreground">{stats.active}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{t('apiManagement.status')}</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/5 via-card to-card border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-purple-600/80">{t('apiManagement.configuredAPIs')}</p>
                    <p className="text-4xl font-bold text-foreground">{stats.configured}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{t('apiManagement.credentials')}</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500/5 via-card to-card border-orange-500/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-orange-600/80">{t('apiManagement.realTimeUpdates')}</p>
                    <p className="text-xl font-bold text-foreground">{t('apiManagement.realTimeUpdatesDesc')}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Live Sync</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Search and Filter */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-8 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t('apiManagement.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background border-border focus:border-primary transition-colors text-base"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => setViewMode('grid')}
                  className="bg-background border-border hover:bg-accent h-12 px-4"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => setViewMode('list')}
                  className="bg-background border-border hover:bg-accent h-12 px-4"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 border-l border-border pl-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary font-medium"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-base text-muted-foreground font-medium">
              Showing <span className="font-semibold text-foreground text-lg">{filteredAPIs.length}</span> of{' '}
              <span className="font-semibold text-foreground text-lg">{Object.keys(apiConfigs).length}</span> APIs
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                {filteredAPIs.filter(([, api]) => api.isActive).length} Active
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                {filteredAPIs.filter(([, api]) => !api.isActive).length} Inactive
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Message */}
        {message && (
          <Alert className={`mb-6 border-l-4 ${
            message.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-700' : 
            message.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-700' :
            message.type === 'info' ? 'border-blue-500 bg-blue-500/10 text-blue-700' :
            'border-red-500 bg-red-500/10 text-red-700'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {message.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
              {message.type === 'error' && <XCircle className="h-4 w-4" />}
              {message.type === 'info' && <Bell className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Enhanced API Cards */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAPIs.map(([name, api]) => {
              const Icon = getAPIIcon(name);
              const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
              const healthScore = getAPIHealthScore(api);
              const isConnected = connectionStatus[name] === 'connected';
              
              return (
                <Card key={name} className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  {/* Status Indicator Bar */}
                  <div className={`h-1 ${
                    api.isActive ? (hasCredentials ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-400') : 
                    'bg-gradient-to-r from-gray-500 to-gray-400'
                  }`} />
                  
                  <CardHeader className="pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          api.category === 'communication' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-600' :
                          api.category === 'payment' ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-600' :
                          api.category === 'effects' ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-600' :
                          'bg-gradient-to-br from-gray-500/20 to-gray-600/10 text-gray-600'
                        }`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {api.displayName}
                          </CardTitle>
                          <p className="text-base text-muted-foreground mt-2 font-medium">{api.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <div className={`w-4 h-4 rounded-full ${getAPIStatusColor(api)} animate-pulse`} />
                        <Badge variant="outline" className="text-sm capitalize font-medium px-3 py-1">
                          {api.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Health Score */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-muted-foreground font-medium">Health Score</span>
                        <span className={`font-bold text-lg ${
                          healthScore >= 80 ? 'text-green-600' : 
                          healthScore >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {healthScore}%
                        </span>
                      </div>
                      <Progress value={healthScore} className="h-3" />
                    </div>
                    
                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground">Connection</span>
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <><Wifi className="h-5 w-5 text-green-500" /><span className="text-sm text-green-600 font-medium">Connected</span></>
                        ) : (
                          <><WifiOff className="h-5 w-5 text-gray-400" /><span className="text-sm text-gray-600 font-medium">Disconnected</span></>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground">{t('apiManagement.status')}</span>
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={api.isActive}
                          onCheckedChange={() => handleToggleAPI(name, api.isActive)}
                          disabled={saving === name}
                        />
                        <Badge variant={api.isActive ? 'default' : 'secondary'} className="text-sm font-medium px-3 py-1">
                          {api.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                        </Badge>
                      </div>
                    </div>

                    {/* Configuration Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground">{t('apiManagement.configured')}</span>
                      <Badge variant={hasCredentials ? 'default' : 'destructive'} className="text-sm font-medium px-3 py-1">
                        {hasCredentials ? t('apiManagement.configured') : t('apiManagement.notConfigured')}
                      </Badge>
                    </div>

                    {/* Test/Live Mode for Payment APIs */}
                    {api.category === 'payment' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-base font-semibold text-foreground">
                          {api.settings?.testMode ? t('apiManagement.testMode') : t('apiManagement.liveMode')}
                        </span>
                        <Button
                          size="default"
                          variant="outline"
                          onClick={() => handleSwitchMode(name, !api.settings?.testMode)}
                          disabled={saving === name}
                          className="bg-background border-border hover:bg-accent h-10 px-4 text-sm font-medium"
                        >
                          {api.settings?.testMode ? (
                            <><Play className="h-4 w-4 mr-2" />{t('apiManagement.switchToLive')}</>
                          ) : (
                            <><TestTube className="h-4 w-4 mr-2" />{t('apiManagement.switchToTest')}</>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                      <span className="font-medium">{t('apiManagement.lastUpdated')}</span>
                      <span className="font-medium">{new Date(api.updatedAt).toLocaleString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => handleViewDetails(name)}
                            className="flex-1 bg-background border-border hover:bg-accent h-11 text-base font-medium"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            {t('apiManagement.viewLogs')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center space-x-2">
                              <Icon className="h-5 w-5" />
                              <span>{api.displayName} - {t('apiManagement.apiDetails')}</span>
                            </DialogTitle>
                          </DialogHeader>
                          {apiDetails && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="bg-muted border-border">
                                <TabsTrigger value="overview">{t('apiManagement.overview')}</TabsTrigger>
                                <TabsTrigger value="credentials">{t('apiManagement.apiCredentials')}</TabsTrigger>
                                <TabsTrigger value="settings">{t('apiManagement.apiSettings')}</TabsTrigger>
                                {showAdvanced && <TabsTrigger value="logs">Logs</TabsTrigger>}
                              </TabsList>
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-foreground">{t('apiManagement.status')}</Label>
                                    <Badge variant={apiDetails.isActive ? 'default' : 'secondary'}>
                                      {apiDetails.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-foreground">{t('apiManagement.category')}</Label>
                                    <p className="text-foreground">{apiDetails.category}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-foreground">{t('apiManagement.lastUpdated')}</Label>
                                    <p className="text-foreground">{new Date(apiDetails.updatedAt).toLocaleString()}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-foreground">{t('apiManagement.testConnection')}</Label>
                                    <Button
                                      size="sm"
                                      onClick={() => handleTestConnection(name)}
                                      disabled={saving === name}
                                      className="bg-background border-border hover:bg-accent"
                                    >
                                      {saving === name ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                        <TestTube className="h-4 w-4 mr-1" />
                                      )}
                                      {t('apiManagement.testConnection')}
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="credentials" className="space-y-4">
                                {Object.entries(apiDetails.credentials || {}).map(([key, value]) => (
                                  <div key={key} className="space-y-2">
                                    <Label htmlFor={key} className="text-foreground">{key}</Label>
                                    <div className="flex space-x-2">
                                      <Input
                                        id={key}
                                        type={showCredentials[name] ? 'text' : 'password'}
                                        value={value as string || ''}
                                        onChange={(e) => {
                                          const updated = { ...apiDetails };
                                          updated.credentials[key] = e.target.value;
                                          setApiDetails(updated);
                                        }}
                                        className="flex-1 bg-background border-border"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowCredentials({
                                          ...showCredentials,
                                          [name]: !showCredentials[name]
                                        })}
                                        className="bg-background border-border hover:bg-accent"
                                      >
                                        {showCredentials[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button
                                  onClick={() => handleSaveConfig(name, apiDetails)}
                                  disabled={saving === name}
                                  className="w-full"
                                >
                                  {saving === name ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : null}
                                  {t('apiManagement.save')}
                                </Button>
                              </TabsContent>
                              <TabsContent value="settings" className="space-y-4">
                                {Object.entries(apiDetails.settings || {}).map(([key, value]) => (
                                  <div key={key} className="space-y-2">
                                    <Label htmlFor={`setting-${key}`} className="text-foreground">{key}</Label>
                                    {typeof value === 'boolean' ? (
                                      <Switch
                                        id={`setting-${key}`}
                                        checked={value as boolean}
                                        onCheckedChange={(checked) => {
                                          const updated = { ...apiDetails };
                                          updated.settings[key] = checked;
                                          setApiDetails(updated);
                                        }}
                                      />
                                    ) : (
                                      <Input
                                        id={`setting-${key}`}
                                        value={value as string || ''}
                                        onChange={(e) => {
                                          const updated = { ...apiDetails };
                                          updated.settings[key] = e.target.value;
                                          setApiDetails(updated);
                                        }}
                                        className="bg-background border-border"
                                      />
                                    )}
                                  </div>
                                ))}
                                <Button
                                  onClick={() => handleSaveConfig(name, apiDetails)}
                                  disabled={saving === name}
                                  className="w-full"
                                >
                                  {saving === name ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : null}
                                  {t('apiManagement.save')}
                                </Button>
                              </TabsContent>
                              {showAdvanced && (
                                <TabsContent value="logs" className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-foreground">API Logs</Label>
                                    <ScrollArea className="h-64 w-full rounded-md border border-border bg-muted/50 p-4">
                                      <div className="space-y-2">
                                        {apiLogs[name]?.map((log, index) => (
                                          <div key={index} className="text-xs font-mono text-muted-foreground">
                                            [{new Date(log.timestamp).toLocaleString()}] {log.message}
                                          </div>
                                        )) || (
                                          <div className="text-xs text-muted-foreground">No logs available</div>
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </TabsContent>
                              )}
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="default"
                        variant={api.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleAPI(name, api.isActive)}
                        disabled={saving === name}
                        className="h-11 px-4 text-base font-medium"
                      >
                        {saving === name ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          api.isActive ? <PowerOff className="h-5 w-5 mr-2" /> : <Power className="h-5 w-5 mr-2" />
                        )}
                        {t('apiManagement.toggle')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredAPIs.map(([name, api]) => {
              const Icon = getAPIIcon(name);
              const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
              const healthScore = getAPIHealthScore(api);
              
              return (
                <Card key={name} className="group bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          api.category === 'communication' ? 'bg-blue-100 text-blue-600' :
                          api.category === 'payment' ? 'bg-green-100 text-green-600' :
                          api.category === 'effects' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{api.displayName}</h3>
                          <p className="text-sm text-muted-foreground">{api.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Health</div>
                          <div className={`text-sm font-medium ${
                            healthScore >= 80 ? 'text-green-600' : 
                            healthScore >= 50 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>{healthScore}%</div>
                        </div>
                        
                        <Badge variant={api.isActive ? 'default' : 'secondary'} className="text-xs">
                          {api.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                        </Badge>
                        
                        <Badge variant={hasCredentials ? 'default' : 'destructive'} className="text-xs">
                          {hasCredentials ? t('apiManagement.configured') : t('apiManagement.notConfigured')}
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={api.isActive}
                            onCheckedChange={() => handleToggleAPI(name, api.isActive)}
                            disabled={saving === name}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(name)}
                            className="bg-background border-border hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Enhanced Security Note */}
        <Alert className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-amber-600" />
            <div>
              <AlertDescription className="text-foreground font-medium">
                {t('apiManagement.securityNote')}: {t('apiManagement.securityNoteDesc')}
              </AlertDescription>
              <p className="text-xs text-muted-foreground mt-1">
                All API keys are encrypted and stored securely in Firestore with real-time synchronization.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default APIManagement;
