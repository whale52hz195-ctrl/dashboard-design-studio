import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import LogoutConfirmationDialog from "@/components/shared/LogoutConfirmationDialog";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    // Add actual logout logic here (clear tokens, redirect to login, etc.)
    window.location.href = '/login';
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onLogoutClick={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </SidebarProvider>
  );
}
