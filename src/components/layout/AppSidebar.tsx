import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Mic,
  UserCheck,
  Building2,
  Coins,
  Image,
  LogOut,
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

const menuSections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "User Management",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Verification", url: "/verification", icon: ShieldCheck },
    ],
  },
  {
    label: "Host & Agency",
    items: [
      { title: "Host Applications", url: "/host-applications", icon: Mic },
      { title: "Host Management", url: "/hosts", icon: UserCheck },
      { title: "Agencies", url: "/agencies", icon: Building2 },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Coin Traders", url: "/coin-traders", icon: Coins },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Splash Banner", url: "/banners", icon: Image },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-accent-foreground text-lg leading-tight">Tingle</h2>
            <p className="text-xs text-sidebar-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50 px-3">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-primary/15 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
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
            <SidebarMenuButton asChild>
              <NavLink
                to="/login"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                activeClassName=""
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
