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
import { useLanguage } from "@/lib/i18n";

const menuSections = [
  {
    labelKey: "sidebar.dashboard",
    items: [
      { titleKey: "sidebar.dashboard", url: "/dashboard", icon: Home, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.userManagement",
    items: [
      { titleKey: "sidebar.user", url: "/user", icon: User, hasArrow: false },
      { titleKey: "sidebar.userVerification", url: "/user-verification", icon: UserCheck, hasArrow: false },
      { titleKey: "sidebar.hostApplication", url: "/host-application", icon: FileText, hasArrow: false },
      { titleKey: "sidebar.coinTrader", url: "/coin-trader", icon: Coins, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.banner",
    items: [
      { titleKey: "sidebar.splash", url: "/splash", icon: DollarSign, hasArrow: false },
      { titleKey: "sidebar.home", url: "/home", icon: Home, hasArrow: false },
      { titleKey: "sidebar.gift", url: "/gift", icon: Gift, hasArrow: false },
      { titleKey: "sidebar.game", url: "/game", icon: Gamepad2, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.content",
    items: [
      { titleKey: "sidebar.hashtag", url: "/hashtag", icon: Hash, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.engagement",
    items: [
      { titleKey: "sidebar.gifts", url: "/gifts", icon: Gift, hasDropdown: true, subItems: [{ key: "sidebar.giftCategory", url: "/store/giftcategorys" }, { key: "sidebar.gift", url: "/store/gifts" }] },
      { titleKey: "sidebar.store", url: "/store", icon: Store, hasDropdown: true, subItems: [{ key: "sidebar.ride", url: "/store/rides" }, { key: "sidebar.theme", url: "/store/themes" }, { key: "sidebar.frame", url: "/store/frames" }] },
      { titleKey: "sidebar.reaction", url: "/reaction", icon: Smile, hasArrow: false },
      { titleKey: "sidebar.beautyEffect", url: "/beauty-effect", icon: Sparkles, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.gameSection",
    items: [
      { titleKey: "sidebar.gameList", url: "/game-list", icon: Gamepad2, hasArrow: false },
      { titleKey: "sidebar.gameHistory", url: "/game-history", icon: History, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.package",
    items: [
      { titleKey: "sidebar.coinPlan", url: "/coin-plan", icon: Coins, hasArrow: false },
      { titleKey: "sidebar.orderHistory", url: "/order-history", icon: Package, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.wealthLevel",
    items: [
      { titleKey: "sidebar.wealthLevelItem", url: "/wealth-level", icon: CreditCard, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.support",
    items: [
      { titleKey: "sidebar.help", url: "/help", icon: HelpCircle, hasArrow: false },
      { titleKey: "sidebar.report", url: "/report", icon: FileText, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.referralSystem",
    items: [
      { titleKey: "sidebar.referralSystemItem", url: "/referral-system", icon: Users, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.financial",
    items: [
      { titleKey: "sidebar.payoutMethod", url: "/payout-method", icon: CreditCard, hasArrow: false },
      { titleKey: "sidebar.payoutRequest", url: "/payout-request", icon: DollarSign, hasArrow: false },
    ],
  },
  {
    labelKey: "sidebar.system",
    items: [
      { titleKey: "sidebar.setting", url: "/settings", icon: Settings, hasArrow: false },
      { titleKey: "sidebar.profile", url: "/profile", icon: UserCircle, hasArrow: false },
    ],
  },
];

export function AppSidebar({ onLogoutClick }: { onLogoutClick?: () => void } = {}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { t } = useLanguage();

  const toggleExpanded = (titleKey: string) => {
    setExpandedItems(prev => 
      prev.includes(titleKey) 
        ? prev.filter(item => item !== titleKey)
        : [...prev, titleKey]
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
            <p className="text-xs text-gray-400">{t("sidebar.adminPanel")}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {menuSections.map((section) => (
          <SidebarGroup key={section.labelKey}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-2 font-semibold">
              {t(section.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    {item.hasDropdown ? (
                      <div>
                        <SidebarMenuButton
                          onClick={() => toggleExpanded(item.titleKey)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-primary/20 hover:text-white transition-colors w-full text-left"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1">{t(item.titleKey)}</span>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${
                              expandedItems.includes(item.titleKey) ? 'rotate-180' : ''
                            }`} 
                          />
                        </SidebarMenuButton>
                        {expandedItems.includes(item.titleKey) && item.subItems && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton key={subItem.key}>
                                <NavLink
                                  to={subItem.url}
                                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary/10 transition-colors w-full text-left text-sm"
                                  activeClassName="bg-primary/20 text-primary font-medium"
                                >
                                  <span className="w-2 h-2 rounded-full border border-gray-500"></span>
                                  <span>{t(subItem.key)}</span>
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
                          <span className="flex-1">{t(item.titleKey)}</span>
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
              <span>{t("sidebar.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
