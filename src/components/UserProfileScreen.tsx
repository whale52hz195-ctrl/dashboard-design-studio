import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Coins, 
  Calendar, 
  Phone, 
  MapPin, 
  Mail, 
  Shield, 
  User, 
  Clock, 
  Wifi, 
  WifiOff,
  Video,
  MessageCircle,
  Gift,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";

interface UserProfileScreenProps {
  user: any | null;
  open: boolean;
  onClose: () => void;
}

const UserProfileScreen = ({ user, open, onClose }: UserProfileScreenProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  const permissions = [
    { name: "Live Streaming", granted: user.wealthLevel?.level >= 1 },
    { name: "Free Call", granted: user.wealthLevel?.level >= 2 },
    { name: "Redeem Cashout", granted: user.wealthLevel?.level >= 3 },
    { name: "Upload Social Post", granted: user.wealthLevel?.level >= 1 },
    { name: "Upload Video", granted: user.wealthLevel?.level >= 2 }
  ];

  const nextLevelThreshold = user.wealthLevel?.level === 1 ? 1500 : 
                           user.wealthLevel?.level === 2 ? 5000 : 10000;
  const currentProgress = user.coin || user.coins || 0;
  const progressPercentage = (currentProgress / nextLevelThreshold) * 100;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            className="bg-secondary border-border"
            onClick={onClose}
          >
            ← Back to Users
          </Button>
          <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="bg-card border-border p-6">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {user.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mb-2">{user.name}</h2>
                <Badge variant="secondary" className="bg-muted text-muted-foreground mb-4">
                  User
                </Badge>
                
                {/* Coins Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Received Coins</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {user.coin || user.coins || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Coins className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Spent Coins</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">0</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Details Card */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bio</span>
                  <span className="text-foreground">{user.bio || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username</span>
                  <span className="text-foreground">@{user.userName}_{user.uid.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unique ID</span>
                  <span className="text-foreground font-mono">{user.uid.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coins</span>
                  <span className="text-foreground">{user.coin || user.coins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="text-foreground">{user.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="text-foreground">{user.age || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Login Type</span>
                  <span className="text-foreground">{user.loginType === 1 ? 'Quick' : 'Normal'}</span>
                </div>
              </div>
            </Card>

            {/* Wealth Level Progress */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Wealth Level Progress</h3>
              
              <div className="mb-4">
                <Badge className="bg-orange-500/20 text-orange-400 mb-2">
                  {user.wealthLevel?.name || 'Bronze Explorer'} Level {user.wealthLevel?.level || 1}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {nextLevelThreshold} coins threshold
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Top Up Coins</span>
                  <span className="text-foreground">0</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{permission.name}</span>
                    <div className={`w-4 h-4 rounded ${permission.granted ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {permission.granted && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to next level</span>
                  <span className="text-foreground">{currentProgress}/{nextLevelThreshold}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Current: {user.wealthLevel?.name || 'Bronze Explorer'}</span>
                  <span>Next: {user.wealthLevel?.level === 1 ? 'Silver Spender' : 
                              user.wealthLevel?.level === 2 ? 'Gold Spender' : 'Platinum Spender'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted border-border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Account Information */}
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Account Created</div>
                      <div className="text-foreground">
                        {new Date(user.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Mobile Number</div>
                      <div className="text-foreground">N/A</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Identity / Device</div>
                      <div className="text-foreground font-mono text-xs">
                        {user.uid.slice(-8).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Country</div>
                      <div className="flex items-center gap-2 text-foreground">
                        <span>{user.countryFlagImage || '🌍'}</span>
                        <span>{user.country}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Provider</div>
                      <div className="text-foreground">anonymous</div>
                    </div>
                  </div>
                </Card>

                {/* Wealth & Coins Information */}
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Wealth & Coins Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">
                        {user.coin || user.coins || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Coins</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Top Up Coins</div>
                    </div>
                    <div className="text-center">
                      <Gift className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Spent Coins</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">
                        {user.coin || user.coins || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Received Coins</div>
                    </div>
                    <div className="text-center">
                      <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Received Gifts</div>
                    </div>
                    <div className="text-center">
                      <Coins className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Withdrawn Coins</div>
                    </div>
                  </div>
                </Card>

                {/* Wealth Level */}
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Wealth Level</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-orange-500/20 text-orange-400">
                      {user.wealthLevel?.name || 'Bronze Explorer'} Level {user.wealthLevel?.level || 1}
                    </Badge>
                    <span className="text-muted-foreground">
                      {nextLevelThreshold} Coins Threshold
                    </span>
                  </div>
                </Card>

                {/* Level Permissions */}
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Level Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          permission.granted ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {permission.granted && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-foreground">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Account Status */}
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">VIP Status</div>
                        <div className="text-foreground">
                          {user.wealthLevel?.level > 1 ? 'VIP' : 'Not VIP'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Block Status</div>
                        <div className="text-foreground">
                          {user.isProfilePicBanned ? 'Blocked' : 'Not Blocked'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Verification Status</div>
                        <div className="text-foreground">
                          {user.isVerified ? 'Verified' : 'Not Verified'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <WifiOff className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Online Status</div>
                        <div className="text-foreground">Offline</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">User History</h3>
                  <p className="text-muted-foreground">No history available yet.</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileScreen;
