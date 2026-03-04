import { useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import LogoutConfirmationDialog from "@/components/shared/LogoutConfirmationDialog";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    signOut(auth).finally(() => {
      window.location.href = '/login';
    });
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar onLogoutClick={handleLogout} />
      <SidebarInset className="min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </SidebarProvider>
  );
}
