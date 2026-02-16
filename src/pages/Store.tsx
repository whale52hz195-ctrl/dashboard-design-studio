import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, Calendar, Coins, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockRides, mockThemes, mockFrames } from "@/data/mockStoreData";

interface StoreItem {
  id: number;
  name: string;
  image: string;
  price: number;
  validity: number;
  validityType: string;
  addedDate: string;
  status: boolean;
}

interface StorePageProps {
  title: string;
  type: "Rides" | "Themes" | "Frames";
  initialData: StoreItem[];
}

const StorePage = ({ title, type, initialData }: StorePageProps) => {
  const [items, setItems] = useState<StoreItem[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, status: !item.status } : item
    ));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{title} Collection</h1>
            <p className="text-muted-foreground">Manage your {type.toLowerCase()} collection</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
            <Plus className="mr-2 h-4 w-4" /> Create {type.slice(0, -1)}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1e293b] border-slate-700 text-white w-full max-w-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-[#1e293b] border-slate-700 overflow-hidden group">
              <div className="relative aspect-video overflow-hidden bg-black/20">
                <div className="absolute top-2 left-2 z-10">
                  <Switch checked={item.status} onCheckedChange={() => handleToggleStatus(item.id)} />
                </div>
                <div className="absolute top-2 right-2 z-10">
                   <div className="w-8 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                   </div>
                </div>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg text-white">
                  {type === "Frames" ? `Name: ${item.name}` : item.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-400">Price</p>
                    <p className="text-white flex items-center gap-1">
                      <Coins className="h-3 w-3 text-yellow-400" /> {item.price.toLocaleString()} Coins
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400">Validity</p>
                    <p className="text-white flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-400" /> {item.validity} {item.validityType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500">Added on {item.addedDate}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent> Card
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Create'} {type.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{type.slice(0, -1)} Name</Label>
              <Input id="name" defaultValue={editingItem?.name} className="bg-[#0f172a] border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coins">Coins</Label>
              <Input id="coins" type="number" defaultValue={editingItem?.price} className="bg-[#0f172a] border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity">Validity</Label>
              <Input id="validity" type="number" defaultValue={editingItem?.validity} className="bg-[#0f172a] border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityType">Validity Type</Label>
              <Select defaultValue={editingItem?.validityType || "Days"}>
                <SelectTrigger className="bg-[#0f172a] border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                  <SelectItem value="Days">Days</SelectItem>
                  <SelectItem value="Months">Months</SelectItem>
                  <SelectItem value="Years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="rideType">{type.slice(0, -1)} Type</Label>
              <Select defaultValue="Image">
                <SelectTrigger className="bg-[#0f172a] border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full border-dashed border-slate-700 hover:bg-slate-800 text-slate-400">
              <Plus className="mr-2 h-4 w-4" /> Upload Image/GIF
            </Button>
            <p className="text-[10px] text-slate-500 text-center">Accepted formats: .jpg, .jpeg, .png, .webp</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-[#7c3aed] hover:bg-[#6d28d9]">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export const StoreRides = () => <StorePage title="Rides" type="Rides" initialData={mockRides} />;
export const StoreThemes = () => <StorePage title="Themes" type="Themes" initialData={mockThemes} />;
export const StoreFrames = () => <StorePage title="Frames" type="Frames" initialData={mockFrames} />;
