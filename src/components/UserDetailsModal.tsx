import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail, Phone, Shield, Users, Coins, Heart, MessageCircle, Video, Settings } from "lucide-react";

interface UserDetailsModalProps {
  user: any | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, open, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-foreground">User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                {user.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                {user.isVerified && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.userName}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-border">
                  {user.gender}
                </Badge>
                <Badge variant="outline" className="border-border">
                  {user.age} years
                </Badge>
                <Badge className="bg-green-500/20 text-green-400">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {user.followers || user.followersCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {user.followings || user.followingCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {user.coin || user.coins || 0}
              </div>
              <div className="text-sm text-muted-foreground">Coins</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">0</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-foreground">{user.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center gap-2 text-foreground">
                    <span>{user.countryFlagImage || '🌍'}</span>
                    <span>{user.country}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                  <div className="text-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Wealth Level</div>
                  <div className="text-foreground">
                    {user.wealthLevel?.name || 'Bronze'} (Level {user.wealthLevel?.level || 1})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Bio</h3>
              <p className="text-muted-foreground">
                {user.bio || 'No bio available'}
              </p>
            </div>
          )}

          {/* Activity Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Activity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Friends</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Call
            </Button>
            <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
