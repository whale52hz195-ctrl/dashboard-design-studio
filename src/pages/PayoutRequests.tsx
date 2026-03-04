import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPayoutRequests, updatePayoutRequest, PayoutRequest } from "@/lib/firestoreService";
import { useLanguage } from "@/lib/i18n";

export default function PayoutRequests() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [filter, setFilter] = useState("pending");
  const [userType, setUserType] = useState("agency");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load payout requests from Firestore
  useEffect(() => {
    const loadPayoutRequests = async () => {
      try {
        setLoading(true);
        const data = await getPayoutRequests();
        setPayoutRequests(data);
      } catch (error) {
        console.error('Error loading payout requests:', error);
        toast({
          title: "Error",
          description: "Failed to load payout requests",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPayoutRequests();
  }, [toast]);

  // Filter requests based on status and user type
  const filteredRequests = payoutRequests.filter(request => {
    const statusMatch = filter === "all" || request.status === filter;
    const userTypeMatch = userType === "all" || request.userType === userType;
    return statusMatch && userTypeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRequests.length);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getPayoutRequests();
      setPayoutRequests(data);
    } catch (error) {
      console.error('Error refreshing payout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      // Find the document by requestId
      const request = payoutRequests.find(r => r.requestId === requestId);
      if (!request) {
        toast({
          title: "Error",
          description: "Request not found",
          variant: "destructive"
        });
        return;
      }

      const success = await updatePayoutRequest(request.id, { status: 'approved' });
      if (success) {
        // Reload the data
        const data = await getPayoutRequests();
        setPayoutRequests(data);
        toast({
          title: "Success",
          description: "Payout request approved successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to approve payout request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving payout request:', error);
      toast({
        title: "Error",
        description: "Failed to approve payout request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // Find the document by requestId
      const request = payoutRequests.find(r => r.requestId === requestId);
      if (!request) {
        toast({
          title: "Error",
          description: "Request not found",
          variant: "destructive"
        });
        return;
      }

      const success = await updatePayoutRequest(request.id, { status: 'rejected' });
      if (success) {
        // Reload the data
        const data = await getPayoutRequests();
        setPayoutRequests(data);
        toast({
          title: "Success",
          description: "Payout request rejected successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reject payout request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error rejecting payout request:', error);
      toast({
        title: "Error",
        description: "Failed to reject payout request",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("page.payoutRequests")}</h1>
            <p className="text-gray-400 text-sm mt-1">{t("payoutRequestsPage.reviewProcessRequests")}</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status Filter */}
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 bg-[#1a1a2e] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700">
                <SelectItem value="pending">{t("payoutRequestsPage.pending")}</SelectItem>
                <SelectItem value="approved">{t("payoutRequestsPage.approved")}</SelectItem>
                <SelectItem value="rejected">{t("payoutRequestsPage.rejected")}</SelectItem>
                <SelectItem value="all">{t("common.all")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Page Size */}
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-16 bg-[#1a1a2e] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type Toggle */}
          <div className="flex bg-[#1a1a2e] border border-gray-700 rounded-lg p-1">
            <Button
              variant={userType === "agency" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("agency")}
              className={`px-4 py-1 text-sm ${
                userType === "agency"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-transparent"
              }`}
            >
              {t("payoutRequestsPage.agency")}
            </Button>
            <Button
              variant={userType === "host" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("host")}
              className={`px-4 py-1 text-sm ${
                userType === "host"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-transparent"
              }`}
            >
              {t("payoutRequestsPage.host")}
            </Button>
            <Button
              variant={userType === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("user")}
              className={`px-4 py-1 text-sm ${
                userType === "user"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-transparent"
              }`}
            >
              {t("payoutRequestsPage.user")}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
            <span className="ml-2 text-gray-400">{t("payoutRequestsPage.loadingPayoutRequests")}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Table */}
            <div className="border border-gray-700/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.requestId")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.agency")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.coins")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.amount")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.paymentMethod")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.paymentDetails")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("payoutRequestsPage.requestDate")}</TableHead>
                    <TableHead className={`text-gray-400 ${isRTL ? "text-left" : "text-right"}`}>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        {t("payoutRequestsPage.noPayoutRequestsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700/50 hover:bg-purple-600/5">
                        <TableCell className="text-white font-mono text-sm">
                          {request.requestId}
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                              <img
                                src={request.agencyImage || request.hostImage}
                                alt={request.agencyName || request.hostName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <span>{request.agencyName || request.hostName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{request.coins.toLocaleString()}</TableCell>
                        <TableCell className="text-white">${request.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-white">{request.paymentMethod}</TableCell>
                        <TableCell className="text-gray-400">
                          <div className="max-w-xs">
                            {Array.isArray(request.paymentDetails) 
                              ? request.paymentDetails.join(', ')
                              : request.paymentDetails
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">{request.requestDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.requestId)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {t("payoutRequestsPage.approve")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.requestId)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {t("payoutRequestsPage.reject")}
                                </Button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <span className="text-green-400 text-sm">{t("payoutRequestsPage.approved")}</span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="text-red-400 text-sm">{t("payoutRequestsPage.rejected")}</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                {t("payoutRequestsPage.showing", { start: startIndex + 1, end: endIndex, total: filteredRequests.length })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400 px-2">
                  {t("payoutRequestsPage.page", { current: currentPage, total: totalPages || 1 })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
