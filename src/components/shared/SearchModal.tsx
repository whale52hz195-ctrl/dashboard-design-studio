import { useState, useEffect, useRef } from "react";
import { Search, X, Home, User, UserCheck, FileText, DollarSign, Hash, Gift, Gamepad2, Store, Smile, Sparkles, History, Coins, Package, CreditCard, HelpCircle, Users, Settings, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Icon mapping
const iconMap = {
  Home,
  User,
  UserCheck,
  FileText,
  DollarSign,
  Hash,
  Gift,
  Gamepad2,
  Store,
  Smile,
  Sparkles,
  History,
  Coins,
  Package,
  CreditCard,
  HelpCircle,
  Users,
  Settings,
  UserCircle,
};

// Menu items from AppSidebar
const menuSections = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: "Home" },
    ],
  },
  {
    label: "USER MANAGEMENT",
    items: [
      { title: "User", url: "/user", icon: "User" },
      { title: "User Verification", url: "/user-verification", icon: "UserCheck" },
      { title: "Host Application", url: "/host-application", icon: "FileText" },
      { title: "Coin Trader", url: "/coin-trader", icon: "Coins" },
    ],
  },
  {
    label: "BANNER",
    items: [
      { title: "Splash", url: "/splash", icon: "DollarSign" },
      { title: "Home", url: "/home", icon: "Home" },
      { title: "Gift", url: "/gift", icon: "Gift" },
      { title: "Game", url: "/game", icon: "Gamepad2" },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { title: "Hashtag", url: "/hashtag", icon: "Hash" },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      { title: "Gifts", url: "/gifts", icon: "Gift" },
      { title: "Store", url: "/store", icon: "Store" },
      { title: "Reaction", url: "/reaction", icon: "Smile" },
      { title: "Beauty Effect", url: "/beauty-effect", icon: "Sparkles" },
    ],
  },
  {
    label: "GAME",
    items: [
      { title: "Game List", url: "/game-list", icon: "Gamepad2" },
      { title: "Game History", url: "/game-history", icon: "History" },
    ],
  },
  {
    label: "PACKAGE",
    items: [
      { title: "Coin Plan", url: "/coin-plan", icon: "Coins" },
      { title: "Order History", url: "/order-history", icon: "Package" },
    ],
  },
  {
    label: "WEALTH LEVEL",
    items: [
      { title: "Wealth Level", url: "/wealth-level", icon: "CreditCard" },
    ],
  },
  {
    label: "SUPPORT & REPORTING",
    items: [
      { title: "Help", url: "/help", icon: "HelpCircle" },
      { title: "Report", url: "/report", icon: "FileText" },
    ],
  },
  {
    label: "REFERRAL SYSTEM",
    items: [
      { title: "Referral System", url: "/referral-system", icon: "Users" },
    ],
  },
  {
    label: "FINANCIAL",
    items: [
      { title: "Payout Method", url: "/payout-method", icon: "CreditCard" },
      { title: "Payout Request", url: "/payout-request", icon: "DollarSign" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Setting", url: "/settings", icon: "Settings" },
      { title: "Profile", url: "/profile", icon: "UserCircle" },
    ],
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all menu items for searching
  const allMenuItems = menuSections.flatMap(section => 
    section.items.map(item => ({
      ...item,
      category: section.label,
      Icon: iconMap[item.icon as keyof typeof iconMap] || Home
    }))
  );

  // Filter items based on search term
  const filteredItems = allMenuItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleItemClick(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleItemClick = (item: any) => {
    navigate(item.url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold">Search Menu</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No menu items found for "{searchTerm}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      index === selectedIndex
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <item.Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {item.url}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredItems.length > 0 && (
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>ESC to close</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
