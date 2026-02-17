import { Search, Plus, Edit, Trash2, Star, Crown, Gem, Shield, Zap, Users, Trophy, Diamond } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface WealthLevel {
  id: string;
  benefits: string[];
  color: string;
  createdAt: string;
  discountRate: number;
  icon: string;
  level: number;
  maxCoins: number;
  minCoins: number;
  minSpent: number;
  name: string;
}

const WealthLevels = () => {
  const { toast } = useToast();
  const [wealthLevels, setWealthLevels] = useState<WealthLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<WealthLevel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    color: "#E5E4E2",
    icon: "🥉",
    minCoins: 0,
    maxCoins: 999999,
    minSpent: 0,
    discountRate: 0,
    benefits: ["", "", "", ""]
  });

  // Icon mapping for different levels
  const getLevelIcon = (level: number) => {
    const icons = {
      1: "🥉", 2: "🥈", 3: "🥇", 4: "💎", 
      5: "👑", 6: "🏆", 7: "⭐", 8: "🌟"
    };
    return icons[level as keyof typeof icons] || "🥉";
  };

  // Color mapping for different levels
  const getLevelColor = (level: number) => {
    const colors = {
      1: "#CD7F32", 2: "#C0C0C0", 3: "#FFD700", 4: "#E5E4E2",
      5: "#FF6B6B", 6: "#4ECDC4", 7: "#45B7D1", 8: "#9B59B6"
    };
    return colors[level as keyof typeof colors] || "#E5E4E2";
  };

  // Fetch wealth levels from Firestore
  const fetchWealthLevels = async () => {
    try {
      setLoading(true);
      const levelsRef = collection(db, 'wealthLevels');
      const q = query(levelsRef, orderBy('level', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const levelsData: WealthLevel[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        levelsData.push({
          id: docSnapshot.id,
          benefits: data.benefits || [],
          color: data.color || "#E5E4E2",
          createdAt: data.createdAt || new Date().toISOString(),
          discountRate: data.discountRate || 0,
          icon: data.icon || "🥉",
          level: data.level || 1,
          maxCoins: data.maxCoins || 999999,
          minCoins: data.minCoins || 0,
          minSpent: data.minSpent || 0,
          name: data.name || ""
        });
      });
      
      // Apply search filter
      let filteredData = levelsData;
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(level => 
          level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          level.level.toString().includes(searchTerm)
        );
      }
      
      setWealthLevels(filteredData);
    } catch (error) {
      console.error('Error fetching wealth levels from Firestore:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wealth levels. Please try again.",
        variant: "destructive",
      });
      setWealthLevels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWealthLevels();
  }, [searchTerm]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle benefit change
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  // Add new benefit field
  const addBenefitField = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ""] }));
  };

  // Remove benefit field
  const removeBenefitField = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  // Handle create/edit wealth level
  const handleSubmit = async () => {
    try {
      const levelData = {
        ...formData,
        level: parseInt(formData.level.toString()) || 1,
        minCoins: parseInt(formData.minCoins.toString()) || 0,
        maxCoins: parseInt(formData.maxCoins.toString()) || 999999,
        minSpent: parseInt(formData.minSpent.toString()) || 0,
        discountRate: parseInt(formData.discountRate.toString()) || 0,
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ""),
        createdAt: editingLevel?.createdAt || new Date().toISOString()
      };

      if (editingLevel) {
        // Update existing level
        await updateDoc(doc(db, 'wealthLevels', editingLevel.id), levelData);
        toast({
          title: "Success",
          description: `Wealth level "${formData.name}" updated successfully!`,
        });
      } else {
        // Add new level
        const newLevelRef = await addDoc(collection(db, 'wealthLevels'), levelData);
        toast({
          title: "Success",
          description: `Wealth level "${formData.name}" created successfully!`,
        });
      }

      // Reset form and refresh data
      setFormData({
        name: "",
        level: 1,
        color: "#E5E4E2",
        icon: "🥉",
        minCoins: 0,
        maxCoins: 999999,
        minSpent: 0,
        discountRate: 0,
        benefits: ["", "", "", ""]
      });
      setEditingLevel(null);
      setIsCreateModalOpen(false);
      fetchWealthLevels();
    } catch (error) {
      console.error('Error saving wealth level:', error);
      toast({
        title: "Error",
        description: "Failed to save wealth level. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit level
  const handleEditLevel = (level: WealthLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      level: level.level,
      color: level.color,
      icon: level.icon,
      minCoins: level.minCoins,
      maxCoins: level.maxCoins,
      minSpent: level.minSpent,
      discountRate: level.discountRate,
      benefits: level.benefits.length > 0 ? level.benefits : ["", "", "", ""]
    });
    setIsCreateModalOpen(true);
  };

  // Handle delete level
  const handleDeleteLevel = async (levelId: string) => {
    try {
      const levelToDelete = wealthLevels.find(l => l.id === levelId);
      await deleteDoc(doc(db, 'wealthLevels', levelId));
      toast({
        title: "Success",
        description: `Wealth level "${levelToDelete?.name}" deleted successfully!`,
      });
      fetchWealthLevels();
    } catch (error) {
      console.error('Error deleting wealth level:', error);
      toast({
        title: "Error",
        description: "Failed to delete wealth level. Please try again.",
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Wealth Level" 
                className="pl-10 bg-secondary border-border"
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
                  setEditingLevel(null);
                  setFormData({
                    name: "",
                    level: 1,
                    color: "#E5E4E2",
                    icon: "🥉",
                    minCoins: 0,
                    maxCoins: 999999,
                    minSpent: 0,
                    discountRate: 0,
                    benefits: ["", "", "", ""]
                  });
                }}
              >
                <Plus className="h-4 w-4" />
                Create Wealth Level
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingLevel ? "Edit Wealth Level" : "Create Wealth Level"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Level Name</Label>
                    <Input
                      id="name"
                      placeholder="Platinum"
                      className="mt-1 bg-secondary border-border"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Level Number</Label>
                    <Input
                      id="level"
                      type="number"
                      placeholder="4"
                      className="mt-1 bg-secondary border-border"
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="icon" className="text-sm font-medium">Icon</Label>
                    <Input
                      id="icon"
                      placeholder="💎"
                      className="mt-1 bg-secondary border-border"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      className="mt-1 bg-secondary border-border h-10"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountRate" className="text-sm font-medium">Discount Rate (%)</Label>
                    <Input
                      id="discountRate"
                      type="number"
                      placeholder="15"
                      className="mt-1 bg-secondary border-border"
                      value={formData.discountRate}
                      onChange={(e) => handleInputChange('discountRate', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minCoins" className="text-sm font-medium">Min Coins</Label>
                    <Input
                      id="minCoins"
                      type="number"
                      placeholder="100000"
                      className="mt-1 bg-secondary border-border"
                      value={formData.minCoins}
                      onChange={(e) => handleInputChange('minCoins', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCoins" className="text-sm font-medium">Max Coins</Label>
                    <Input
                      id="maxCoins"
                      type="number"
                      placeholder="999999"
                      className="mt-1 bg-secondary border-border"
                      value={formData.maxCoins}
                      onChange={(e) => handleInputChange('maxCoins', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minSpent" className="text-sm font-medium">Min Spent ($)</Label>
                    <Input
                      id="minSpent"
                      type="number"
                      placeholder="1000"
                      className="mt-1 bg-secondary border-border"
                      value={formData.minSpent}
                      onChange={(e) => handleInputChange('minSpent', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Benefits</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addBenefitField}
                      className="bg-secondary border-border"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Benefit
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Enter benefit..."
                          className="bg-secondary border-border"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                        />
                        {formData.benefits.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => removeBenefitField(index)}
                            className="bg-secondary border-border"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-secondary border-border"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Wealth Levels</h1>
          <p className="text-muted-foreground mt-1">Manage user wealth levels and benefits</p>
        </div>

        {/* Wealth Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="bg-card border-border p-6 animate-pulse">
                <div className="h-32 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </Card>
            ))
          ) : wealthLevels.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">No wealth levels found. Click 'Create Wealth Level' to create your first level.</div>
            </div>
          ) : (
            wealthLevels.map((level) => (
              <Card 
                key={level.id} 
                className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow relative group"
                style={{ backgroundColor: level.color + '20' }}
              >
                <div 
                  className="h-32 flex items-center justify-center text-6xl mb-4 relative"
                  style={{ backgroundColor: level.color + '30' }}
                >
                  {level.icon}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditLevel(level)}
                      className="h-8 w-8 bg-background/80"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteLevel(level.id)}
                      className="h-8 w-8 bg-background/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground">{level.name}</h3>
                    <span className="text-sm font-medium text-muted-foreground">Level {level.level}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1 mb-4">
                    <div>Min: {level.minCoins.toLocaleString()} coins</div>
                    <div>Max: {level.maxCoins.toLocaleString()} coins</div>
                    <div>Min Spent: ${level.minSpent}</div>
                    {level.discountRate > 0 && (
                      <div className="text-green-500 font-medium">Discount: {level.discountRate}%</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {level.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-foreground">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    {level.benefits.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{level.benefits.length - 3} more benefits
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WealthLevels;
