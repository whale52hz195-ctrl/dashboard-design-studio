import { Search, Plus, Edit, Trash2, Star, DollarSign, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

// Define Coin Plan interface based on Firestore structure
interface CoinPlan {
  id: string;
  bonus: number;
  coins: number;
  color: string;
  createdAt: string;
  currency: string;
  discount: number;
  featured: boolean;
  icon: string;
  name: string;
  originalPrice: number;
  popular: boolean;
  price: number;
  status: string;
  totalCoins: number;
  totalRevenue: number;
  totalSales: number;
  updatedAt: string;
}

const CoinPlans = () => {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [coinPlans, setCoinPlans] = useState<CoinPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CoinPlan | null>(null);
  const [formData, setFormData] = useState({
    coins: "",
    amount: "",
    productKey: "",
    name: "",
    icon: "🪙",
    color: "#FFD700",
    bonus: 0,
    discount: 0,
    featured: false,
    popular: false,
    status: "Active"
  });

  // Fetch coin plans from Firestore
  const fetchCoinPlans = async () => {
    try {
      setLoading(true);
      const plansRef = collection(db, 'coinPlans');
      const q = query(plansRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const plansData: CoinPlan[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        plansData.push({
          id: docSnapshot.id,
          bonus: data.bonus || 0,
          coins: data.coins || 0,
          color: data.color || "#FFD700",
          createdAt: data.createdAt || new Date().toISOString(),
          currency: data.currency || "USD",
          discount: data.discount || 0,
          featured: data.featured || false,
          icon: data.icon || "🪙",
          name: data.name || "",
          originalPrice: data.originalPrice || 0,
          popular: data.popular || false,
          price: data.price || 0,
          status: data.status || "Active",
          totalCoins: data.totalCoins || 0,
          totalRevenue: data.totalRevenue || 0,
          totalSales: data.totalSales || 0,
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      
      // Apply search filter
      let filteredData = plansData;
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(plan => 
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.coins.toString().includes(searchTerm)
        );
      }
      
      setCoinPlans(filteredData);
    } catch (error) {
      console.error('Error fetching coin plans from Firestore:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coin plans. Please try again.",
        variant: "destructive",
      });
      setCoinPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinPlans();
  }, [searchTerm]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle create/edit coin plan
  const handleSubmit = async () => {
    try {
      const planData = {
        ...formData,
        coins: parseInt(formData.coins) || 0,
        amount: parseFloat(formData.amount) || 0,
        originalPrice: parseFloat(formData.amount) || 0,
        price: parseFloat(formData.amount) || 0,
        totalCoins: parseInt(formData.coins) || 0,
        totalRevenue: 0,
        totalSales: 0,
        createdAt: editingPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingPlan) {
        // Update existing plan
        await updateDoc(doc(db, 'coinPlans', editingPlan.id), planData);
        toast({
          title: "Success",
          description: `Coin plan "${formData.name}" updated successfully!`,
        });
      } else {
        // Add new plan
        const newPlanRef = await addDoc(collection(db, 'coinPlans'), planData);
        toast({
          title: "Success",
          description: `Coin plan "${formData.name}" created successfully!`,
        });
      }

      // Reset form and refresh data
      setFormData({
        coins: "",
        amount: "",
        productKey: "",
        name: "",
        icon: "🪙",
        color: "#FFD700",
        bonus: 0,
        discount: 0,
        featured: false,
        popular: false,
        status: "Active"
      });
      setEditingPlan(null);
      setIsCreateModalOpen(false);
      fetchCoinPlans();
    } catch (error) {
      console.error('Error saving coin plan:', error);
      toast({
        title: "Error",
        description: "Failed to save coin plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit plan
  const handleEditPlan = (plan: CoinPlan) => {
    setEditingPlan(plan);
    setFormData({
      coins: plan.coins.toString(),
      amount: plan.price.toString(),
      productKey: plan.id,
      name: plan.name,
      icon: plan.icon,
      color: plan.color,
      bonus: plan.bonus,
      discount: plan.discount,
      featured: plan.featured,
      popular: plan.popular,
      status: plan.status
    });
    setIsCreateModalOpen(true);
  };

  // Handle delete plan
  const handleDeletePlan = async (planId: string) => {
    try {
      const planToDelete = coinPlans.find(p => p.id === planId);
      await deleteDoc(doc(db, 'coinPlans', planId));
      toast({
        title: "Success",
        description: `Coin plan "${planToDelete?.name}" deleted successfully!`,
      });
      fetchCoinPlans();
    } catch (error) {
      console.error('Error deleting coin plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete coin plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (plan: CoinPlan) => {
    try {
      const newStatus = plan.status === "Active" ? "Inactive" : "Active";
      await updateDoc(doc(db, 'coinPlans', plan.id), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Success",
        description: `Coin plan "${plan.name}" status changed to ${newStatus}!`,
      });
      fetchCoinPlans();
    } catch (error) {
      console.error('Error updating coin plan status:', error);
      toast({
        title: "Error",
        description: "Failed to update coin plan status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input 
                placeholder={t("coinPlansPage.searchCoinPlan")} 
                className={`${isRTL ? "pr-10 pl-4" : "pl-10"} bg-secondary border-border`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                onClick={() => {
                  setEditingPlan(null);
                  setFormData({
                    coins: "",
                    amount: "",
                    productKey: "",
                    name: "",
                    icon: "🪙",
                    color: "#FFD700",
                    bonus: 0,
                    discount: 0,
                    featured: false,
                    popular: false,
                    status: "Active"
                  });
                }}
              >
                <Plus className="h-4 w-4" />
                {t("coinPlansPage.createCoinPlan")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingPlan ? t("coinPlansPage.editCoinPlan") : t("coinPlansPage.createCoinPlan")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="coins" className="text-sm font-medium">{t("coinPlansPage.coins")}</Label>
                  <Input
                    id="coins"
                    type="number"
                    placeholder="88"
                    className="mt-1 bg-secondary border-border"
                    value={formData.coins}
                    onChange={(e) => handleInputChange('coins', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">{t("coinPlansPage.amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="1.07"
                    className="mt-1 bg-secondary border-border"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="productKey" className="text-sm font-medium">{t("coinPlansPage.productKey")}</Label>
                  <Input
                    id="productKey"
                    placeholder="plan_0"
                    className="mt-1 bg-secondary border-border"
                    value={formData.productKey}
                    onChange={(e) => handleInputChange('productKey', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">{t("coinPlansPage.planName")}</Label>
                  <Input
                    id="name"
                    placeholder="Quick Charge"
                    className="mt-1 bg-secondary border-border"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="icon" className="text-sm font-medium">{t("coinPlansPage.icon")}</Label>
                  <Input
                    id="icon"
                    placeholder="🪙"
                    className="mt-1 bg-secondary border-border"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                    <Label htmlFor="featured" className="text-sm font-medium">{t("coinPlansPage.featured")}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="popular"
                      checked={formData.popular}
                      onCheckedChange={(checked) => handleInputChange('popular', checked)}
                    />
                    <Label htmlFor="popular" className="text-sm font-medium">{t("coinPlansPage.popular")}</Label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-secondary border-border"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSubmit}
                  >
                    {t("common.submit")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("page.coinPlans")}</h1>
          <p className="text-muted-foreground mt-1">{t("coinPlansPage.manageMonitorPlans")}</p>
        </div>

        {/* Coin Plans Table */}
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.no")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.coinsHeader")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.amountHeader")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.productKeyHeader")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.popularHeader")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("coinPlansPage.activeHeader")}</TableHead>
                  <TableHead className={`text-muted-foreground font-semibold uppercase text-xs px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">{t("coinPlansPage.loadingCoinPlans")}</div>
                    </TableCell>
                  </TableRow>
                ) : coinPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">{t("coinPlansPage.noCoinPlansFound")}</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  coinPlans.map((plan, index) => (
                    <TableRow key={plan.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 text-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{plan.icon}</span>
                          <div>
                            <div className="font-medium text-foreground">{plan.coins.toLocaleString()}</div>
                            {plan.bonus > 0 && (
                              <div className="text-xs text-green-500">+{plan.bonus} {t("coinPlansPage.bonus")}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{plan.price.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <code className="bg-muted px-2 py-1 rounded text-xs text-foreground">
                          {plan.id}
                        </code>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {plan.popular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {plan.featured && <Package className="h-4 w-4 text-blue-500" />}
                          {plan.popular && <span className="text-xs text-muted-foreground">{t("coinPlansPage.popular")}</span>}
                          {plan.featured && <span className="text-xs text-muted-foreground">{t("coinPlansPage.featured")}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Switch
                          checked={plan.status === "Active"}
                          onCheckedChange={() => handleToggleStatus(plan)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoinPlans;
