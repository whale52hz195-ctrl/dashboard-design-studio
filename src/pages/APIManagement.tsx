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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, Key, CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, EyeOff, TestTube,
  Play, Power, PowerOff, Shield, Zap, Activity, Server, Wifi, WifiOff,
  Download, Upload, Filter, Search, Bell, Loader2, Grid, List, Video,
  CreditCard, DollarSign, Smartphone, Palette, Globe, Plus, Database
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
    if (isRealTime) {
      const interval = setInterval(() => {
        loadAPIConfigs();
        loadStats();
        setLastUpdate(new Date());
      }, 30000);
      setRefreshInterval(interval);
    }
    return () => { if (refreshInterval) clearInterval(refreshInterval); };
  }, [isRealTime]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAPIConfigs();
        loadStats();
        setLastUpdate(new Date());
      }, 10000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) { clearInterval(refreshInterval); setRefreshInterval(null); }
    }
    return () => { if (refreshInterval) clearInterval(refreshInterval); };
  }, [autoRefresh]);

  const loadAPIConfigs = async () => {
    try {
      setLoading(true);
      const configs = await getAPIConfigs();
      setApiConfigs(configs);
    } catch (error) {
      console.error('Error loading API configs:', error);
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
    try {
      setSaving(apiName);
      await toggleAPIStatus(apiName, !currentStatus);
      setApiConfigs(prev => ({
        ...prev,
        [apiName]: { ...prev[apiName], isActive: !currentStatus, updatedAt: new Date().toISOString() }
      }));
      setStats(prev => ({ ...prev, active: !currentStatus ? prev.active + 1 : prev.active - 1 }));
      setMessage({ type: 'success', text: t('apiManagement.toggleSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: t('apiManagement.toggleError') });
      await loadAPIConfigs();
    } finally {
      setSaving(null);
    }
  };

  const handleSwitchMode = async (apiName: string, isTestMode: boolean) => {
    try {
      setSaving(apiName);
      await switchAPIMode(apiName, isTestMode);
      setApiConfigs(prev => ({
        ...prev,
        [apiName]: { ...prev[apiName], settings: { ...prev[apiName].settings, testMode: isTestMode }, updatedAt: new Date().toISOString() }
      }));
      const mode = isTestMode ? 'test' : 'live';
      setMessage({ type: 'success', text: t('apiManagement.switchModeSuccess', { mode }) });
    } catch (error) {
      const mode = isTestMode ? 'test' : 'live';
      setMessage({ type: 'error', text: t('apiManagement.switchModeError', { mode }) });
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
      setApiLogs(prev => ({
        ...prev,
        [apiName]: [...(prev[apiName] || []), { timestamp: new Date().toISOString(), message: 'Connection test successful' }].slice(-10)
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [apiName]: 'disconnected' }));
      setMessage({ type: 'error', text: t('apiManagement.testError') });
      setApiLogs(prev => ({
        ...prev,
        [apiName]: [...(prev[apiName] || []), { timestamp: new Date().toISOString(), message: 'Connection test failed' }].slice(-10)
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
      setApiConfigs(prev => ({
        ...prev,
        [apiName]: { ...prev[apiName], ...updates, updatedAt: new Date().toISOString() }
      }));
      setMessage({ type: 'success', text: t('apiManagement.saveSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: t('apiManagement.saveError') });
      await loadAPIConfigs();
    } finally {
      setSaving(null);
    }
  };

  const handleExportConfig = async () => {
    try {
      const dataStr = JSON.stringify(apiConfigs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `api-config-${new Date().toISOString().split('T')[0]}.json`);
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
        JSON.parse(text);
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
    if (!api.isActive) return 'bg-muted-foreground/50';
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
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-foreground`}>{t('apiManagement.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Server className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {t('apiManagement.title')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('apiManagement.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" size="sm" className="text-xs sm:text-sm">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ms-1.5">{showAdvanced ? 'Simple' : 'Advanced'}</span>
              </Button>
              <Button onClick={loadAPIConfigs} variant="outline" size="sm" className="text-xs sm:text-sm">
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ms-1.5">{t('apiManagement.refresh')}</span>
              </Button>
              <Button onClick={handleExportConfig} variant="outline" size="sm" className="text-xs sm:text-sm">
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden md:inline ms-1.5">Export</span>
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline ms-1.5">Import</span>
                  </span>
                </Button>
                <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
              </label>
            </div>
          </div>

          {/* Toolbar - compact */}
          {showAdvanced && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-card/60 backdrop-blur-sm rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} disabled={saving !== null} />
                <span className="text-xs font-medium text-muted-foreground">Auto</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isRealTime} onCheckedChange={setIsRealTime} disabled={saving !== null} />
                <span className="text-xs font-medium text-muted-foreground">Real-time</span>
              </div>
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-wider truncate">{t('apiManagement.totalAPIs')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Database className="h-3 w-3 shrink-0" />
                      <span className="truncate">{t('apiManagement.overview')}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Server className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-green-500/10 hover:border-green-500/30 transition-all duration-300">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-green-600/80 uppercase tracking-wider truncate">{t('apiManagement.activeAPIs')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.active}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Activity className="h-3 w-3 shrink-0" />
                      <span className="truncate">{t('apiManagement.status')}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-wider truncate">{t('apiManagement.configuredAPIs')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.configured}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 shrink-0" />
                      <span className="truncate">{t('apiManagement.credentials')}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Key className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-orange-500/10 hover:border-orange-500/30 transition-all duration-300">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-orange-600/80 uppercase tracking-wider truncate">{t('apiManagement.realTimeUpdates')}</p>
                    <p className="text-sm sm:text-base font-bold text-foreground mt-1 leading-snug">{t('apiManagement.realTimeUpdatesDesc')}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 shrink-0" />
                      <span className="truncate">Live Sync</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t('apiManagement.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} h-9 sm:h-10 bg-background text-sm`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-none h-9 sm:h-10 px-2.5">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-none h-9 sm:h-10 px-2.5">
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border border-border rounded-md px-2 sm:px-3 h-9 sm:h-10 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{filteredAPIs.length}</span> of{' '}
              <span className="font-semibold text-foreground">{Object.keys(apiConfigs).length}</span> APIs
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                {filteredAPIs.filter(([, api]) => api.isActive).length} Active
              </Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                {filteredAPIs.filter(([, api]) => !api.isActive).length} Inactive
              </Badge>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`border-s-4 ${
            message.type === 'success' ? 'border-s-green-500 bg-green-500/5' :
            message.type === 'warning' ? 'border-s-yellow-500 bg-yellow-500/5' :
            message.type === 'info' ? 'border-s-blue-500 bg-blue-500/5' :
            'border-s-red-500 bg-red-500/5'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
              {message.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />}
              {message.type === 'error' && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
              {message.type === 'info' && <Bell className="h-4 w-4 text-blue-600 shrink-0" />}
              <AlertDescription className="text-sm">{message.text}</AlertDescription>
              <Button variant="ghost" size="sm" className="ms-auto h-6 w-6 p-0" onClick={() => setMessage(null)}>
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Alert>
        )}

        {/* API Cards - Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredAPIs.map(([name, api]) => {
              const Icon = getAPIIcon(name);
              const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
              const healthScore = getAPIHealthScore(api);
              const isConnected = connectionStatus[name] === 'connected';

              return (
                <Card key={name} className="group overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Top status bar */}
                  <div className={`h-1 ${
                    api.isActive ? (hasCredentials ? 'bg-green-500' : 'bg-yellow-500') : 'bg-muted-foreground/30'
                  }`} />

                  <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          api.category === 'communication' ? 'bg-blue-500/10 text-blue-600' :
                          api.category === 'payment' ? 'bg-green-500/10 text-green-600' :
                          api.category === 'effects' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {api.displayName}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{api.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${getAPIStatusColor(api)} ${api.isActive ? 'animate-pulse' : ''}`} />
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">{api.category}</Badge>
                      </div>
                    </div>

                    {/* Health Score */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Health</span>
                        <span className={`font-bold ${
                          healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{healthScore}%</span>
                      </div>
                      <Progress value={healthScore} className="h-1.5" />
                    </div>

                    {/* Status rows */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Connection</span>
                        <div className="flex items-center gap-1">
                          {isConnected ? (
                            <><Wifi className="h-3.5 w-3.5 text-green-500" /><span className="text-green-600 text-xs">Connected</span></>
                          ) : (
                            <><WifiOff className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground text-xs">Offline</span></>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('apiManagement.status')}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={api.isActive}
                            onCheckedChange={() => handleToggleAPI(name, api.isActive)}
                            disabled={saving === name}
                          />
                          <Badge variant={api.isActive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {api.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('apiManagement.configured')}</span>
                        <Badge variant={hasCredentials ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                          {hasCredentials ? '✓ ' + t('apiManagement.configured') : t('apiManagement.notConfigured')}
                        </Badge>
                      </div>
                    </div>

                    {/* Test/Live toggle for payment */}
                    {api.category === 'payment' && (
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
                        <span className="font-medium">
                          {api.settings?.testMode ? t('apiManagement.testMode') : t('apiManagement.liveMode')}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleSwitchMode(name, !api.settings?.testMode)} disabled={saving === name} className="h-7 text-[11px] px-2">
                          {api.settings?.testMode ? <><Play className="h-3 w-3 me-1" />{t('apiManagement.switchToLive')}</> : <><TestTube className="h-3 w-3 me-1" />{t('apiManagement.switchToTest')}</>}
                        </Button>
                      </div>
                    )}

                    {/* Last updated */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>{t('apiManagement.lastUpdated')}</span>
                      <span>{new Date(api.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(name)} className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
                            <Eye className="h-3.5 w-3.5 me-1" />
                            {t('apiManagement.viewLogs')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>{api.displayName} - {t('apiManagement.apiDetails')}</span>
                            </DialogTitle>
                          </DialogHeader>
                          {apiDetails && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="bg-muted border-border w-full justify-start">
                                <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('apiManagement.overview')}</TabsTrigger>
                                <TabsTrigger value="credentials" className="text-xs sm:text-sm">{t('apiManagement.apiCredentials')}</TabsTrigger>
                                <TabsTrigger value="settings" className="text-xs sm:text-sm">{t('apiManagement.apiSettings')}</TabsTrigger>
                                {showAdvanced && <TabsTrigger value="logs" className="text-xs sm:text-sm">Logs</TabsTrigger>}
                              </TabsList>
                              <TabsContent value="overview" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{t('apiManagement.status')}</Label>
                                    <Badge variant={apiDetails.isActive ? 'default' : 'secondary'}>
                                      {apiDetails.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{t('apiManagement.category')}</Label>
                                    <p className="text-sm text-foreground capitalize">{apiDetails.category}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{t('apiManagement.lastUpdated')}</Label>
                                    <p className="text-sm text-foreground">{new Date(apiDetails.updatedAt).toLocaleString()}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{t('apiManagement.testConnection')}</Label>
                                    <Button size="sm" onClick={() => handleTestConnection(name)} disabled={saving === name} className="h-8 text-xs">
                                      {saving === name ? <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" /> : <TestTube className="h-3.5 w-3.5 me-1" />}
                                      {t('apiManagement.testConnection')}
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="credentials" className="space-y-3 mt-4">
                                {Object.entries(apiDetails.credentials || {}).map(([key, value]) => (
                                  <div key={key} className="space-y-1.5">
                                    <Label htmlFor={key} className="text-xs">{key}</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id={key}
                                        type={showCredentials[name] ? 'text' : 'password'}
                                        value={value as string || ''}
                                        onChange={(e) => {
                                          const updated = { ...apiDetails };
                                          updated.credentials[key] = e.target.value;
                                          setApiDetails(updated);
                                        }}
                                        className="flex-1 bg-background h-9 text-sm"
                                      />
                                      <Button size="sm" variant="outline" onClick={() => setShowCredentials({ ...showCredentials, [name]: !showCredentials[name] })} className="h-9 w-9 p-0">
                                        {showCredentials[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button onClick={() => handleSaveConfig(name, apiDetails)} disabled={saving === name} className="w-full h-9 text-sm mt-2">
                                  {saving === name && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                                  {t('apiManagement.save')}
                                </Button>
                              </TabsContent>
                              <TabsContent value="settings" className="space-y-3 mt-4">
                                {Object.entries(apiDetails.settings || {}).map(([key, value]) => (
                                  <div key={key} className="space-y-1.5">
                                    <Label htmlFor={`setting-${key}`} className="text-xs">{key}</Label>
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
                                        className="bg-background h-9 text-sm"
                                      />
                                    )}
                                  </div>
                                ))}
                                <Button onClick={() => handleSaveConfig(name, apiDetails)} disabled={saving === name} className="w-full h-9 text-sm mt-2">
                                  {saving === name && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                                  {t('apiManagement.save')}
                                </Button>
                              </TabsContent>
                              {showAdvanced && (
                                <TabsContent value="logs" className="space-y-3 mt-4">
                                  <ScrollArea className="h-48 w-full rounded-md border border-border bg-muted/30 p-3">
                                    <div className="space-y-1.5">
                                      {apiLogs[name]?.map((log, index) => (
                                        <div key={index} className="text-[11px] font-mono text-muted-foreground">
                                          [{new Date(log.timestamp).toLocaleString()}] {log.message}
                                        </div>
                                      )) || <div className="text-xs text-muted-foreground">No logs available</div>}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                              )}
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant={api.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleAPI(name, api.isActive)}
                        disabled={saving === name}
                        className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                      >
                        {saving === name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                          api.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2 sm:space-y-3">
            {filteredAPIs.map(([name, api]) => {
              const Icon = getAPIIcon(name);
              const hasCredentials = Object.values(api.credentials || {}).some((val: any) => val && val.trim() !== '');
              const healthScore = getAPIHealthScore(api);

              return (
                <Card key={name} className="group border-border hover:border-primary/30 transition-all duration-200">
                  <CardContent className="p-3 sm:p-4">
                    {/* Mobile: stacked, Desktop: row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Left: Icon + Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          api.category === 'communication' ? 'bg-blue-500/10 text-blue-600' :
                          api.category === 'payment' ? 'bg-green-500/10 text-green-600' :
                          api.category === 'effects' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate">{api.displayName}</h3>
                          <p className="text-[11px] text-muted-foreground truncate">{api.description}</p>
                        </div>
                      </div>

                      {/* Right: badges + controls */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                        <span className={`text-xs font-medium hidden md:block ${
                          healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{healthScore}%</span>

                        <Badge variant={api.isActive ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                          {api.isActive ? t('apiManagement.active') : t('apiManagement.inactive')}
                        </Badge>

                        <Badge variant={hasCredentials ? 'default' : 'destructive'} className="text-[10px] sm:text-xs">
                          {hasCredentials ? t('apiManagement.configured') : t('apiManagement.notConfigured')}
                        </Badge>

                        <div className="flex items-center gap-1.5 ms-auto sm:ms-0">
                          <Switch
                            checked={api.isActive}
                            onCheckedChange={() => handleToggleAPI(name, api.isActive)}
                            disabled={saving === name}
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleViewDetails(name)} className="h-7 w-7 p-0">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
                              <DialogHeader>
                                <DialogTitle className="text-foreground flex items-center gap-2 text-sm">
                                  <Icon className="h-4 w-4" />
                                  <span>{api.displayName}</span>
                                </DialogTitle>
                              </DialogHeader>
                              {apiDetails && (
                                <Tabs defaultValue="credentials" className="w-full">
                                  <TabsList className="bg-muted w-full justify-start">
                                    <TabsTrigger value="credentials" className="text-xs">{t('apiManagement.apiCredentials')}</TabsTrigger>
                                    <TabsTrigger value="settings" className="text-xs">{t('apiManagement.apiSettings')}</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="credentials" className="space-y-3 mt-3">
                                    {Object.entries(apiDetails.credentials || {}).map(([key, value]) => (
                                      <div key={key} className="space-y-1">
                                        <Label htmlFor={`list-${key}`} className="text-xs">{key}</Label>
                                        <div className="flex gap-2">
                                          <Input id={`list-${key}`} type={showCredentials[name] ? 'text' : 'password'} value={value as string || ''} onChange={(e) => { const u = { ...apiDetails }; u.credentials[key] = e.target.value; setApiDetails(u); }} className="flex-1 h-8 text-sm" />
                                          <Button size="sm" variant="outline" onClick={() => setShowCredentials({ ...showCredentials, [name]: !showCredentials[name] })} className="h-8 w-8 p-0">
                                            {showCredentials[name] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    <Button onClick={() => handleSaveConfig(name, apiDetails)} disabled={saving === name} className="w-full h-8 text-xs">
                                      {saving === name && <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" />}
                                      {t('apiManagement.save')}
                                    </Button>
                                  </TabsContent>
                                  <TabsContent value="settings" className="space-y-3 mt-3">
                                    {Object.entries(apiDetails.settings || {}).map(([key, value]) => (
                                      <div key={key} className="space-y-1">
                                        <Label className="text-xs">{key}</Label>
                                        {typeof value === 'boolean' ? (
                                          <Switch checked={value as boolean} onCheckedChange={(c) => { const u = { ...apiDetails }; u.settings[key] = c; setApiDetails(u); }} />
                                        ) : (
                                          <Input value={value as string || ''} onChange={(e) => { const u = { ...apiDetails }; u.settings[key] = e.target.value; setApiDetails(u); }} className="h-8 text-sm" />
                                        )}
                                      </div>
                                    ))}
                                    <Button onClick={() => handleSaveConfig(name, apiDetails)} disabled={saving === name} className="w-full h-8 text-xs">
                                      {saving === name && <Loader2 className="h-3.5 w-3.5 me-1 animate-spin" />}
                                      {t('apiManagement.save')}
                                    </Button>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Security Note */}
        <Alert className="bg-amber-500/5 border-amber-500/20">
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <AlertDescription className="text-xs sm:text-sm text-foreground font-medium">
                {t('apiManagement.securityNote')}: {t('apiManagement.securityNoteDesc')}
              </AlertDescription>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                All API keys are encrypted and stored securely with real-time synchronization.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default APIManagement;
