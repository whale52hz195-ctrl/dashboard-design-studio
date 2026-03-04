import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  getPaymentGateways,
  subscribeToPaymentGateways,
  updatePaymentGateway,
  getTransactions,
  subscribeToTransactions,
  getPayoutRequests,
  updatePayoutRequestStatus,
  getPaymentStats,
  type PaymentGateway,
  type Transaction,
  type PayoutRequest
} from '@/lib/paymentService';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

const PaymentManagement = () => {
  const { t, isRTL } = useLanguage();
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gateways');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gateways, txs, payouts, stats] = await Promise.all([
          getPaymentGateways(),
          getTransactions(),
          getPayoutRequests(),
          getPaymentStats()
        ]);
        
        setPaymentGateways(gateways);
        setTransactions(txs);
        setPayoutRequests(payouts);
        setPaymentStats(stats);
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const unsubscribeGateways = subscribeToPaymentGateways((gateways) => {
      setPaymentGateways(gateways);
    });

    const unsubscribeTransactions = subscribeToTransactions((txs) => {
      setTransactions(txs);
    });

    return () => {
      unsubscribeGateways();
      unsubscribeTransactions();
    };
  }, []);

  const handleUpdateGateway = async (gatewayId: string, config: Partial<PaymentGateway>) => {
    try {
      await updatePaymentGateway(gatewayId, config);
      console.log('Gateway updated successfully');
    } catch (error) {
      console.error('Error updating gateway:', error);
    }
  };

  const handlePayoutAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await updatePayoutRequestStatus(requestId, status, notes);
      console.log(`Payout ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing payout:`, error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      approved: 'default',
      rejected: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground">Manage payment gateways and transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(paymentStats.totalRevenue)}
                    </div>
                    <div className="text-muted-foreground text-sm">Total Revenue</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{paymentStats.totalTransactions}</div>
                    <div className="text-muted-foreground text-sm">Total Transactions</div>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{paymentStats.successRate.toFixed(1)}%</div>
                    <div className="text-muted-foreground text-sm">Success Rate</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{paymentStats.pendingTransactions}</div>
                    <div className="text-muted-foreground text-sm">Pending</div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gateways">Gateways</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Payment Gateways */}
          <TabsContent value="gateways" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentGateways.map((gateway) => (
                <Card key={gateway.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{gateway.name}</CardTitle>
                      <Switch
                        checked={gateway.enabled}
                        onCheckedChange={(enabled) => 
                          handleUpdateGateway(gateway.id, { enabled })
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Keys</Label>
                      {gateway.type === 'stripe' && (
                        <>
                          <Input
                            placeholder="Publishable Key (pk_...)"
                            value={gateway.config.publishableKey || ''}
                            onChange={(e) => handleUpdateGateway(gateway.id, {
                              config: { ...gateway.config, publishableKey: e.target.value }
                            })}
                          />
                          <Input
                            type="password"
                            placeholder="Secret Key (sk_...)"
                            value={gateway.config.secretKey || ''}
                            onChange={(e) => handleUpdateGateway(gateway.id, {
                              config: { ...gateway.config, secretKey: e.target.value }
                            })}
                          />
                        </>
                      )}
                      {gateway.type === 'razorpay' && (
                        <>
                          <Input
                            placeholder="Razorpay ID (rzp_...)"
                            value={gateway.config.clientId || ''}
                            onChange={(e) => handleUpdateGateway(gateway.id, {
                              config: { ...gateway.config, clientId: e.target.value }
                            })}
                          />
                          <Input
                            type="password"
                            placeholder="Secret Key"
                            value={gateway.config.clientSecret || ''}
                            onChange={(e) => handleUpdateGateway(gateway.id, {
                              config: { ...gateway.config, clientSecret: e.target.value }
                            })}
                          />
                        </>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleUpdateGateway(gateway.id, { enabled: !gateway.enabled })}
                    >
                      {gateway.enabled ? 'Disable' : 'Enable'} Gateway
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.transactionId.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{transaction.userEmail}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{transaction.gateway}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt?.toDate?.() || transaction.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem>Refund</DropdownMenuItem>
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

          {/* Payout Requests */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.requestId}</TableCell>
                        <TableCell>{request.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.userType}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>{request.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handlePayoutAction(request.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handlePayoutAction(request.id, 'reject')}
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
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
                  <CardTitle>Revenue by Gateway</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentStats && Object.entries(paymentStats.revenueByGateway).map(([gateway, revenue]) => (
                    <div key={gateway} className="flex justify-between items-center py-2">
                      <span className="capitalize">{gateway}</span>
                      <span className="font-bold">{formatCurrency(revenue as number)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentStats && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <span className="text-green-500">{paymentStats.completedTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="text-yellow-500">{paymentStats.pendingTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed</span>
                        <span className="text-red-500">{paymentStats.failedTransactions}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PaymentManagement;
