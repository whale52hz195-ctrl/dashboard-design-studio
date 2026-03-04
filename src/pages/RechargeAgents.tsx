import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, Clock, Eye, Search, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  RechargeAgent,
  RechargeAgentStatus,
  subscribeToRechargeAgents,
  updateRechargeAgentStatus,
} from "@/lib/rechargeAgentsService";

function formatAgentType(agentType: RechargeAgent["agentType"]) {
  if (agentType === "individual") return "Individual";
  if (agentType === "institution") return "Institution";
  return "Company";
}

function formatStatus(status: RechargeAgentStatus) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function StatusPill({ status }: { status: RechargeAgentStatus }) {
  const props =
    status === "approved"
      ? { className: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle }
      : status === "rejected"
        ? { className: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle }
        : { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock };

  const Icon = props.icon;

  return (
    <Badge variant="outline" className={props.className}>
      <span className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {formatStatus(status)}
      </span>
    </Badge>
  );
}

const RechargeAgents = () => {
  const { t, isRTL } = useLanguage();

  const [agents, setAgents] = useState<RechargeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | RechargeAgentStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<RechargeAgent | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [mutating, setMutating] = useState(false);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogUrl, setImageDialogUrl] = useState<string | null>(null);
  const [imageDialogTitle, setImageDialogTitle] = useState<string>("");

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToRechargeAgents(
      { status: activeTab === "all" ? undefined : activeTab },
      (data) => {
        setAgents(data);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        toast.error("Failed to load recharge agents");
        console.error(error);
      },
    );

    return () => unsubscribe();
  }, [activeTab]);

  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return agents;

    const s = searchTerm.toLowerCase();
    return agents.filter((a) => {
      const name = (a.agentType === "individual" ? a.fullName : a.companyName) || "";
      return (
        a.id.toLowerCase().includes(s) ||
        a.userId.toLowerCase().includes(s) ||
        name.toLowerCase().includes(s) ||
        (a.phone || "").toLowerCase().includes(s) ||
        (a.country || "").toLowerCase().includes(s) ||
        (a.city || "").toLowerCase().includes(s)
      );
    });
  }, [agents, searchTerm]);

  const openDetails = (agent: RechargeAgent) => {
    setSelectedAgent(agent);
    setDetailsOpen(true);
  };

  const handleApprove = async (agent: RechargeAgent) => {
    try {
      setMutating(true);
      await updateRechargeAgentStatus({ agentId: agent.id, status: "approved" });
      toast.success("Approved");
    } catch (e) {
      toast.error("Failed to approve");
      console.error(e);
    } finally {
      setMutating(false);
    }
  };

  const beginReject = (agent: RechargeAgent) => {
    setSelectedAgent(agent);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedAgent) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setMutating(true);
      await updateRechargeAgentStatus({
        agentId: selectedAgent.id,
        status: "rejected",
        rejectionReason: rejectReason.trim(),
      });
      toast.success("Rejected");
      setRejectDialogOpen(false);
    } catch (e) {
      toast.error("Failed to reject");
      console.error(e);
    } finally {
      setMutating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("rechargeAgents.title")}</h1>
            <p className="text-muted-foreground">{t("rechargeAgents.subtitle")}</p>
          </div>
        </div>

        <Card className="p-4 border-border bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full lg:w-auto">
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">{t("rechargeAgents.tabs.all")}</TabsTrigger>
                <TabsTrigger value="pending">{t("rechargeAgents.tabs.pending")}</TabsTrigger>
                <TabsTrigger value="approved">{t("rechargeAgents.tabs.approved")}</TabsTrigger>
                <TabsTrigger value="rejected">{t("rechargeAgents.tabs.rejected")}</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="hidden" />
            </Tabs>

            <div className="relative w-full lg:max-w-sm">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("rechargeAgents.searchPlaceholder")}
                className={`${isRTL ? "pr-10" : "pl-10"} bg-secondary border-border`}
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("rechargeAgents.table.agent")}</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("rechargeAgents.table.type")}</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("rechargeAgents.table.location")}</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("rechargeAgents.table.phone")}</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">{t("rechargeAgents.table.status")}</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3 text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      {t("rechargeAgents.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => {
                    const displayName =
                      agent.agentType === "individual" ? agent.fullName || "-" : agent.companyName || "-";

                    return (
                      <TableRow key={agent.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground text-sm">{displayName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{agent.id.slice(-8)}</div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">{formatAgentType(agent.agentType)}</TableCell>

                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                          {[agent.country, agent.city].filter(Boolean).join(" / ") || "-"}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">{agent.phone || "-"}</TableCell>

                        <TableCell className="px-4 py-3">
                          <StatusPill status={agent.status} />
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetails(agent)}
                              className="border-border"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleApprove(agent)}
                              disabled={mutating || agent.status === "approved"}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {t("rechargeAgents.actions.approve")}
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => beginReject(agent)}
                              disabled={mutating || agent.status === "rejected"}
                            >
                              {t("rechargeAgents.actions.reject")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:max-w-xl overflow-auto">
          <SheetHeader>
            <SheetTitle>{t("rechargeAgents.details.title")}</SheetTitle>
            <SheetDescription>{selectedAgent ? selectedAgent.id : ""}</SheetDescription>
          </SheetHeader>

          {selectedAgent && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {selectedAgent.agentType === "individual"
                      ? selectedAgent.fullName || "-"
                      : selectedAgent.companyName || "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatAgentType(selectedAgent.agentType)}</div>
                </div>
                <StatusPill status={selectedAgent.status} />
              </div>

              {selectedAgent.status === "rejected" && selectedAgent.rejectionReason && (
                <Card className="p-4 border-red-500/20 bg-red-500/5">
                  <div className="text-sm font-semibold text-red-400">{t("rechargeAgents.details.rejectionReason")}</div>
                  <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{selectedAgent.rejectionReason}</div>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.userId")}</Label>
                  <div className="text-sm text-muted-foreground font-mono break-all">{selectedAgent.userId}</div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.applicationId")}</Label>
                  <div className="text-sm text-muted-foreground font-mono break-all">{selectedAgent.id}</div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.phone")}</Label>
                  <div className="text-sm text-muted-foreground break-all">{selectedAgent.phone || "-"}</div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.countryCode")}</Label>
                  <div className="text-sm text-muted-foreground break-all">{selectedAgent.countryCode || "-"}</div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.location")}</Label>
                  <div className="text-sm text-muted-foreground break-all">
                    {[selectedAgent.country, selectedAgent.city].filter(Boolean).join(" / ") || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.address")}</Label>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{selectedAgent.address || "-"}</div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.createdAt")}</Label>
                  <div className="text-sm text-muted-foreground break-all">
                    {selectedAgent.createdAt?.toDate ? selectedAgent.createdAt.toDate().toLocaleString() : "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t("rechargeAgents.details.updatedAt")}</Label>
                  <div className="text-sm text-muted-foreground break-all">
                    {selectedAgent.updatedAt?.toDate ? selectedAgent.updatedAt.toDate().toLocaleString() : "-"}
                  </div>
                </div>
              </div>

              {selectedAgent.agentType === "individual" ? (
                <Card className="p-4 border-border bg-card">
                  <div className="text-sm font-semibold text-foreground mb-3">{t("rechargeAgents.details.individualSection")}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.fullName")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.fullName || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.nationalId")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.nationalId || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.dob")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.dob || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.gender")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.gender || "-"}</div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 border-border bg-card">
                  <div className="text-sm font-semibold text-foreground mb-3">{t("rechargeAgents.details.companySection")}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.companyName")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.companyName || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.activityType")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.activityType || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.commercialReg")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.commercialReg || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.regSource")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.regSource || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.calendarType")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.calendarType || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t("rechargeAgents.details.regExpiry")}</Label>
                      <div className="text-sm text-muted-foreground break-all">{selectedAgent.regExpiry || "-"}</div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">{t("rechargeAgents.details.documents")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { key: "idFront", label: "ID Front", url: selectedAgent.idFront },
                      { key: "idBack", label: "ID Back", url: selectedAgent.idBack },
                      { key: "selfie", label: "Selfie", url: selectedAgent.selfie },
                    ] as const
                  ).map((d) => (
                    <Card key={d.key} className="p-3 border-border bg-card">
                      <div className="text-xs text-muted-foreground">{d.label}</div>
                      {d.url ? (
                        <div className="mt-2 space-y-2">
                          <button
                            type="button"
                            className="w-full overflow-hidden rounded-md border border-border bg-secondary/30"
                            onClick={() => {
                              setImageDialogTitle(d.label);
                              setImageDialogUrl(d.url || null);
                              setImageDialogOpen(true);
                            }}
                          >
                            <img
                              src={d.url}
                              alt={d.label}
                              className="h-40 w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const el = e.currentTarget;
                                el.style.display = "none";
                              }}
                            />
                          </button>

                          <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-primary break-all">
                            {t("rechargeAgents.details.openDocument")}
                          </a>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mt-2">-</div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={imageDialogOpen}
        onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            setImageDialogUrl(null);
            setImageDialogTitle("");
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{imageDialogTitle}</DialogTitle>
            <DialogDescription>{imageDialogUrl || ""}</DialogDescription>
          </DialogHeader>
          {imageDialogUrl && (
            <div className="w-full overflow-hidden rounded-md border border-border bg-black/20">
              <img src={imageDialogUrl} alt={imageDialogTitle} className="w-full h-auto" />
            </div>
          )}
          <DialogFooter>
            {imageDialogUrl && (
              <Button asChild variant="outline">
                <a href={imageDialogUrl} target="_blank" rel="noreferrer">
                  {t("rechargeAgents.details.openDocument")}
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rechargeAgents.rejectDialog.title")}</DialogTitle>
            <DialogDescription>{t("rechargeAgents.rejectDialog.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>{t("rechargeAgents.rejectDialog.reason")}</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={mutating}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={mutating}>
              {t("rechargeAgents.actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RechargeAgents;
