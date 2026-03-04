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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  getFCMConfig,
  updateFCMConfig,
  createNotificationTemplate,
  getNotificationTemplates,
  sendNotification,
  sendBulkNotification,
  getUserNotifications,
  subscribeToUserNotifications,
  getNotificationStats,
  type NotificationTemplate,
  type Notification
} from '@/lib/notificationService';
import { 
  Bell, 
  Send, 
  Users, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Plus,
  Eye,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const NotificationManager = () => {
  const { t, isRTL } = useLanguage();
  const [fcmConfig, setFcmConfig] = useState<any>(null);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationStats, setNotificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);

  // Form states
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'push' as 'push' | 'email' | 'in_app',
    title: '',
    body: '',
    enabled: true,
    triggers: [] as string[]
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'push' as 'push' | 'email' | 'in_app',
    userId: '',
    userEmail: '',
    scheduledAt: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, templates, stats] = await Promise.all([
          getFCMConfig(),
          getNotificationTemplates(),
          getNotificationStats()
        ]);
        
        setFcmConfig(config);
        setNotificationTemplates(templates);
        setNotificationStats(stats);
      } catch (error) {
        console.error('Error fetching notification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTemplate = async () => {
    try {
      await createNotificationTemplate(newTemplate);
      setShowCreateTemplate(false);
      setNewTemplate({
        name: '',
        type: 'push',
        title: '',
        body: '',
        enabled: true,
        triggers: []
      });
      
      // Refresh templates
      const templates = await getNotificationTemplates();
      setNotificationTemplates(templates);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleSendNotification = async () => {
    try {
      const notificationData = {
        ...newNotification,
        data: { type: 'custom', source: 'admin' }
      };

      if (newNotification.userId) {
        await sendNotification(notificationData);
      } else {
        // Send to all users (bulk)
        await sendBulkNotification([notificationData]);
      }

      setShowSendNotification(false);
      setNewNotification({
        title: '',
        body: '',
        type: 'push',
        userId: '',
        userEmail: '',
        scheduledAt: ''
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleUpdateFCMConfig = async (config: any) => {
    try {
      await updateFCMConfig(config);
      setFcmConfig({ ...fcmConfig, ...config });
    } catch (error) {
      console.error('Error updating FCM config:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      sent: 'default',
      failed: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'in_app': return <MessageSquare className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Notification Manager</h1>
            <p className="text-muted-foreground">Manage push notifications and communication</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={fcmConfig?.enabled ? "default" : "secondary"}>
              {fcmConfig?.enabled ? "FCM Connected" : "FCM Not Configured"}
            </Badge>
            <Button onClick={() => setShowSendNotification(true)}>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {notificationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{notificationStats.total}</div>
                    <div className="text-muted-foreground text-sm">Total Sent</div>
                  </div>
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{notificationStats.sent}</div>
                    <div className="text-muted-foreground text-sm">Delivered</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{notificationStats.read}</div>
                    <div className="text-muted-foreground text-sm">Read</div>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{notificationStats.deliveryRate.toFixed(1)}%</div>
                    <div className="text-muted-foreground text-sm">Delivery Rate</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Notification Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notification Templates</h3>
              <Button onClick={() => setShowCreateTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notificationTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Switch checked={template.enabled} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Title</Label>
                        <p className="font-medium">{template.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Body</Label>
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.body}</p>
                      </div>
                      <div className="flex gap-2">
                        {template.triggers.map((trigger) => (
                          <Badge key={trigger} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Send Notification */}
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send New Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Notification Type</Label>
                    <Select value={newNotification.type} onValueChange={(value: any) => 
                      setNewNotification({...newNotification, type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="in_app">In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Target</Label>
                    <Select value={newNotification.userId ? 'specific' : 'all'} onValueChange={(value) => 
                      setNewNotification({...newNotification, userId: value === 'specific' ? 'demo_user' : ''})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="specific">Specific User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Notification message"
                    value={newNotification.body}
                    onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                    rows={4}
                  />
                </div>

                {newNotification.userId && (
                  <div>
                    <Label>User ID</Label>
                    <Input
                      placeholder="User ID (optional)"
                      value={newNotification.userId}
                      onChange={(e) => setNewNotification({...newNotification, userId: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <Label>Schedule (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newNotification.scheduledAt}
                    onChange={(e) => setNewNotification({...newNotification, scheduledAt: e.target.value})}
                  />
                </div>

                <Button onClick={handleSendNotification} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.slice(0, 10).map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>{notification.userId || 'All Users'}</TableCell>
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        <TableCell>
                          {new Date(notification.createdAt?.toDate?.() || notification.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Resend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <Card>
              <CardHeader>
                <CardTitle>FCM Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Allow sending push notifications to users</p>
                  </div>
                  <Switch
                    checked={fcmConfig?.enabled || false}
                    onCheckedChange={(enabled) => handleUpdateFCMConfig({ enabled })}
                  />
                </div>

                <div>
                  <Label>Server Key</Label>
                  <Input
                    type="password"
                    placeholder="FCM Server Key"
                    value={fcmConfig?.serverKey || ''}
                    onChange={(e) => handleUpdateFCMConfig({ serverKey: e.target.value })}
                  />
                </div>

                <div>
                  <Label>API Key</Label>
                  <Input
                    placeholder="Firebase API Key"
                    value={fcmConfig?.apiKey || ''}
                    onChange={(e) => handleUpdateFCMConfig({ apiKey: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Project ID</Label>
                    <Input
                      placeholder="Firebase Project ID"
                      value={fcmConfig?.projectId || ''}
                      onChange={(e) => handleUpdateFCMConfig({ projectId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sender ID</Label>
                    <Input
                      placeholder="Sender ID"
                      value={fcmConfig?.messagingSenderId || ''}
                      onChange={(e) => handleUpdateFCMConfig({ messagingSenderId: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleUpdateFCMConfig(fcmConfig)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default NotificationManager;
