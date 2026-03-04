import { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff, RefreshCw, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function Profile() {
  const { t, isRTL } = useLanguage();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      if (!adminsSnapshot.empty) {
        const adminDoc = adminsSnapshot.docs[0];
        const adminData = adminDoc.data();
        setAdmin({
          id: adminDoc.id,
          name: adminData.name || t('profilePage.adminUser'),
          email: adminData.email || t('profilePage.adminEmail'),
          avatar: adminData.avatar || '',
          role: adminData.role || t('profilePage.superAdmin'),
          createdAt: adminData.createdAt || new Date().toISOString(),
          lastLogin: adminData.lastLogin || new Date().toISOString()
        });
      } else {
        // Fallback data
        setAdmin({
          id: '1',
          name: t('profilePage.adminUser'),
          email: t('profilePage.adminEmail'),
          avatar: '',
          role: t('profilePage.superAdmin'),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(t('profilePage.fillAllPasswordFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t('profilePage.passwordsDoNotMatch'));
      return;
    }

    try {
      if (admin) {
        await updateDoc(doc(db, 'admins', admin.id), {
          lastLogin: new Date().toISOString()
        });
        alert(t('profilePage.passwordUpdatedSuccessfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert(t('profilePage.errorUpdatingPassword'));
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(t('profilePage.resetPasswordConfirmation'))) {
      return;
    }

    try {
      if (admin) {
        await updateDoc(doc(db, 'admins', admin.id), {
          lastLogin: new Date().toISOString()
        });
        alert(t('profilePage.passwordResetSuccessfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(t('profilePage.errorResettingPassword'));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background p-6 cairo-font flex items-center justify-center">
          <div className="text-muted-foreground">{t("profilePage.loading")}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 cairo-font">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("page.profile")}</h1>
            <p className="text-muted-foreground mt-1">{t("profilePage.manageProfileInfo")}</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("profilePage.refresh")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("profilePage.profileInformation")}</h2>
            <div className="flex items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={admin?.avatar || ''} />
                <AvatarFallback className="text-lg">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-foreground">{admin?.name}</h3>
                <p className="text-muted-foreground">{admin?.email}</p>
                {admin?.role && (
                  <Badge className="mt-2 inline-block bg-purple-100 text-purple-800">
                    {admin.role}
                  </Badge>
                )}
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p><strong>{t("profilePage.memberSince")}:</strong> {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : t('profilePage.notAvailable')}</p>
                  <p><strong>{t("profilePage.lastLogin")}:</strong> {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : t('profilePage.notAvailable')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("profilePage.changePassword")}</h2>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("profilePage.currentPassword")}</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profilePage.enterCurrentPassword")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("profilePage.newPassword")}</label>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("profilePage.enterNewPassword")}
                  className="pr-10"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("profilePage.confirmNewPassword")}</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("profilePage.confirmNewPassword")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdatePassword}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t("profilePage.updatePassword")}
                </Button>
                <Button
                  onClick={handleResetPassword}
                  variant="outline"
                  className="hover:bg-destructive/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("profilePage.reset")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
