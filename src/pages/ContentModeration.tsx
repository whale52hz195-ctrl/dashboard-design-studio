import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  getModerationConfig,
  updateModerationConfig,
  getModerationReports,
  updateModerationReport,
  addBannedContent,
  getBannedContent,
  autoModerateContent,
  getModerationStats,
  type ModerationConfig,
  type ModerationReport,
  type BannedContent
} from '@/lib/moderationService';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Ban, 
  Settings, 
  Plus,
  Filter,
  Search,
  Trash2,
  Flag,
  User,
  Image,
  MessageSquare,
  Video,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const ContentModeration = () => {
  const { t, isRTL } = useLanguage();
  const [moderationConfig, setModerationConfig] = useState<ModerationConfig | null>(null);
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>([]);
  const [bannedContent, setBannedContent] = useState<BannedContent[]>([]);
  const [moderationStats, setModerationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newBannedContent, setNewBannedContent] = useState({
    type: 'keyword' as 'keyword' | 'image_hash' | 'user_id' | 'domain',
    value: '',
    reason: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, reports, banned, stats] = await Promise.all([
          getModerationConfig(),
          getModerationReports(),
          getBannedContent(),
          getModerationStats()
        ]);
        
        setModerationConfig(config);
        setModerationReports(reports);
        setBannedContent(banned);
        setModerationStats(stats);
      } catch (error) {
        console.error('Error fetching moderation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateConfig = async (config: Partial<ModerationConfig>) => {
    try {
      if (moderationConfig) {
        await updateModerationConfig(moderationConfig.id, config);
        setModerationConfig({ ...moderationConfig, ...config });
      }
    } catch (error) {
      console.error('Error updating moderation config:', error);
    }
  };

  const handleReviewReport = async (reportId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      await updateModerationReport(reportId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        action: action === 'approve' ? 'warning' : 'none',
        reviewedAt: new Date().toISOString(),
        notes: notes || ''
      });
      
      // Refresh reports
      const reports = await getModerationReports();
      setModerationReports(reports);
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  const handleAddBannedContent = async () => {
    try {
      await addBannedContent({
        ...newBannedContent,
        addedBy: 'admin'
      });
      
      // Reset form
      setNewBannedContent({
        type: 'keyword',
        value: '',
        reason: '',
        severity: 'medium',
        active: true
      });
      
      // Refresh banned content
      const banned = await getBannedContent();
      setBannedContent(banned);
    } catch (error) {
      console.error('Error adding banned content:', error);
    }
  };

  const handleAutoModerate = async (contentId: string, contentType: 'image' | 'text' | 'video' | 'profile' | 'live_stream', content: any, userId?: string) => {
    try {
      const result = await autoModerateContent(contentId, contentType, content, userId);
      console.log('Auto-moderation result:', result);
    } catch (error) {
      console.error('Error auto-moderating content:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      reviewed: 'default',
      approved: 'default',
      rejected: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'live_stream': return <Video className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    };
    
    return (
      <Badge variant={variants[severity] || 'secondary'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Filter reports
  const filteredReports = moderationReports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesContentType = contentTypeFilter === 'all' || report.contentType === contentTypeFilter;
    const matchesSearch = searchTerm === '' || 
      report.contentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.violationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesContentType && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Moderation</h1>
            <p className="text-muted-foreground">AI-powered content moderation and safety</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={moderationConfig?.enabled ? "default" : "secondary"}>
              {moderationConfig?.enabled ? "Auto-Moderation ON" : "Auto-Moderation OFF"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        {moderationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{moderationStats.total}</div>
                    <div className="text-muted-foreground text-sm">Total Reports</div>
                  </div>
                  <Flag className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{moderationStats.aiDetected}</div>
                    <div className="text-muted-foreground text-sm">AI Detected</div>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{moderationStats.pending}</div>
                    <div className="text-muted-foreground text-sm">Pending Review</div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{moderationStats.reviewRate.toFixed(1)}%</div>
                    <div className="text-muted-foreground text-sm">Review Rate</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="banned">Banned Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Moderation Reports */}
          <TabsContent value="reports" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="profile">Profiles</SelectItem>
                      <SelectItem value="live_stream">Live Streams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Violation</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.slice(0, 20).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(report.contentType)}
                            <span className="font-mono text-sm">{report.contentId.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{report.contentType.replace('_', ' ')}</TableCell>
                        <TableCell className="capitalize">{report.violationType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${report.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{(report.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {report.aiDetected && <Badge variant="secondary" className="text-xs">AI</Badge>}
                            {report.userReported && <Badge variant="outline" className="text-xs">User</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleReviewReport(report.id, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReviewReport(report.id, 'reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            {moderationConfig && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Auto-Moderation</Label>
                        <p className="text-sm text-muted-foreground">Automatically detect and flag inappropriate content</p>
                      </div>
                      <Switch
                        checked={moderationConfig.enabled}
                        onCheckedChange={(enabled) => handleUpdateConfig({ enabled })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Moderate Images</Label>
                        <p className="text-sm text-muted-foreground">Analyze uploaded images for inappropriate content</p>
                      </div>
                      <Switch
                        checked={moderationConfig.autoModerateImages}
                        onCheckedChange={(autoModerateImages) => handleUpdateConfig({ autoModerateImages })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Moderate Text</Label>
                        <p className="text-sm text-muted-foreground">Check text for banned keywords and spam</p>
                      </div>
                      <Switch
                        checked={moderationConfig.autoModerateText}
                        onCheckedChange={(autoModerateText) => handleUpdateConfig({ autoModerateText })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Moderate Video</Label>
                        <p className="text-sm text-muted-foreground">Analyze video content for violations</p>
                      </div>
                      <Switch
                        checked={moderationConfig.autoModerateVideo}
                        onCheckedChange={(autoModerateVideo) => handleUpdateConfig({ autoModerateVideo })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detection Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Image Detection Threshold: {(moderationConfig.imageThreshold * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[moderationConfig.imageThreshold * 100]}
                        onValueChange={([value]) => handleUpdateConfig({ imageThreshold: value / 100 })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Text Detection Threshold: {(moderationConfig.textThreshold * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[moderationConfig.textThreshold * 100]}
                        onValueChange={([value]) => handleUpdateConfig({ textThreshold: value / 100 })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Video Detection Threshold: {(moderationConfig.videoThreshold * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[moderationConfig.videoThreshold * 100]}
                        onValueChange={([value]) => handleUpdateConfig({ videoThreshold: value / 100 })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sightengine API</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>API User</Label>
                      <Input
                        placeholder="Sightengine API User"
                        value={moderationConfig.sightengineUser || ''}
                        onChange={(e) => handleUpdateConfig({ sightengineUser: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input
                        type="password"
                        placeholder="Sightengine API Secret"
                        value={moderationConfig.sightengineApiSecret || ''}
                        onChange={(e) => handleUpdateConfig({ sightengineApiSecret: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Banned Content */}
          <TabsContent value="banned" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Banned Content</h3>
              <Button onClick={() => {}}>
                <Plus className="w-4 h-4 mr-2" />
                Add Banned Content
              </Button>
            </div>

            {/* Add Banned Content Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Banned Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newBannedContent.type} onValueChange={(value: any) => 
                      setNewBannedContent({...newBannedContent, type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyword">Keyword</SelectItem>
                        <SelectItem value="image_hash">Image Hash</SelectItem>
                        <SelectItem value="user_id">User ID</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Severity</Label>
                    <Select value={newBannedContent.severity} onValueChange={(value: any) => 
                      setNewBannedContent({...newBannedContent, severity: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Value</Label>
                  <Input
                    placeholder="Enter the value to ban"
                    value={newBannedContent.value}
                    onChange={(e) => setNewBannedContent({...newBannedContent, value: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Reason for banning this content"
                    value={newBannedContent.reason}
                    onChange={(e) => setNewBannedContent({...newBannedContent, reason: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newBannedContent.active}
                    onCheckedChange={(active) => setNewBannedContent({...newBannedContent, active})}
                  />
                  <Label>Active</Label>
                </div>

                <Button onClick={handleAddBannedContent} className="w-full">
                  <Ban className="w-4 h-4 mr-2" />
                  Add Banned Content
                </Button>
              </CardContent>
            </Card>

            {/* Banned Content List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Banned Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannedContent.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="capitalize">{content.type.replace('_', ' ')}</TableCell>
                        <TableCell className="font-mono text-sm">{content.value}</TableCell>
                        <TableCell>{content.reason}</TableCell>
                        <TableCell>{getSeverityBadge(content.severity)}</TableCell>
                        <TableCell>
                          <Badge variant={content.active ? 'default' : 'secondary'}>
                            {content.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Content Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {moderationStats && Object.entries(moderationStats.statsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center py-2">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span className="font-bold">{count as number}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Violation Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {moderationStats && Object.entries(moderationStats.statsByViolation).map(([violation, count]) => (
                    <div key={violation} className="flex justify-between items-center py-2">
                      <span className="capitalize">{violation}</span>
                      <span className="font-bold">{count as number}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentModeration;
