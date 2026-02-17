import { 
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
  ChevronDown, 
  ChevronRight, 
  LogOut 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useState } from "react";

const menuSections = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home, hasArrow: false },
    ],
  },
  {
    label: "USER MANAGEMENT",
    items: [
      { title: "User", url: "/user", icon: User, hasArrow: false },
      { title: "User Verification", url: "/user-verification", icon: UserCheck, hasArrow: false },
      { title: "Host Application", url: "/host-application", icon: FileText, hasArrow: false },
      { title: "Coin Trader", url: "/coin-trader", icon: Coins, hasArrow: false },
    ],
  },
  {
    label: "BANNER",
    items: [
      { title: "Splash", url: "/splash", icon: DollarSign, hasArrow: false },
      { title: "Home", url: "/home", icon: Home, hasArrow: false },
      { title: "Gift", url: "/gift", icon: Gift, hasArrow: false },
      { title: "Game", url: "/game", icon: Gamepad2, hasArrow: false },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { title: "Hashtag", url: "/hashtag", icon: Hash, hasArrow: false },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      { title: "Gifts", url: "/gifts", icon: Gift, hasDropdown: true, subItems: ["Gift Category", "Gift"] },
      { title: "Store", url: "/store", icon: Store, hasDropdown: true, subItems: ["Ride", "Theme", "Frame"] },
      { title: "Reaction", url: "/reaction", icon: Smile, hasArrow: false },
      { title: "Beauty Effect", url: "/beauty-effect", icon: Sparkles, hasArrow: false },
    ],
  },
  {
    label: "GAME",
    items: [
      { title: "Game List", url: "/game-list", icon: Gamepad2, hasArrow: false },
      { title: "Game History", url: "/game-history", icon: History, hasArrow: false },
    ],
  },
  {
    label: "PACKAGE",
    items: [
      { title: "Coin Plan", url: "/coin-plan", icon: Coins, hasArrow: false },
      { title: "Order History", url: "/order-history", icon: Package, hasArrow: false },
    ],
  },
  {
    label: "WEALTH LEVEL",
    items: [
      { title: "Wealth Level", url: "/wealth-level", icon: CreditCard, hasArrow: false },
    ],
  },
  {
    label: "SUPPORT & REPORTING",
    items: [
      { title: "Help", url: "/help", icon: HelpCircle, hasArrow: false },
      { title: "Report", url: "/report", icon: FileText, hasArrow: false },
    ],
  },
  {
    label: "REFERRAL SYSTEM",
    items: [
      { title: "Referral System", url: "/referral-system", icon: Users, hasArrow: false },
    ],
  },
  {
    label: "FINANCIAL",
    items: [
      { title: "Payout Method", url: "/payout-method", icon: CreditCard, hasArrow: false },
      { title: "Payout Request", url: "/payout-request", icon: DollarSign, hasArrow: false },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Setting", url: "/settings", icon: Settings, hasArrow: false },
      { title: "Profile", url: "/profile", icon: UserCircle, hasArrow: false },
    ],
  },
];

export function AppSidebar({ onLogoutClick }: { onLogoutClick?: () => void } = {}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-[#0a0a0a] w-64">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/alkasser-d7701.firebasestorage.app/o/images%2FIconLogo.jpeg?alt=media&token=24ff1d49-2541-48f2-9902-86f5deafe345" 
            alt="Dashboard Logo" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-bold text-white text-xl leading-tight">ALKASSER</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-2 font-semibold">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.hasDropdown ? (
                      <div>
                        <SidebarMenuButton
                          onClick={() => toggleExpanded(item.title)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-primary/20 hover:text-white transition-colors w-full text-left"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1">{item.title}</span>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${
                              expandedItems.includes(item.title) ? 'rotate-180' : ''
                            }`} 
                          />
                        </SidebarMenuButton>
                        {expandedItems.includes(item.title) && item.subItems && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton key={subItem}>
                                <NavLink
                                  to={subItem === "Gift Category" ? "/store/giftcategorys" : `/store/${subItem.toLowerCase().replace(/\s+/g, '')}s`}
                                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary/10 transition-colors w-full text-left text-sm"
                                  activeClassName="bg-primary/20 text-primary font-medium"
                                >
                                  <span className="w-2 h-2 rounded-full border border-gray-500"></span>
                                  <span>{subItem}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-primary/20 hover:text-white"
                          activeClassName="bg-primary text-white font-medium"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1">{item.title}</span>
                          {item.hasArrow && <ChevronRight className="h-4 w-4 text-gray-500" />}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => onLogoutClick && onLogoutClick()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
