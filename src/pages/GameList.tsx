import { Search, Plus, Edit, Trash2, ExternalLink, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Define Game interface based on Firestore structure
interface Game {
  id: string;
  createdAt: string;
  description: string;
  featured: boolean;
  icon: string;
  maxBet: number;
  minBet: number;
  name: string;
  status: string;
  totalBets: number;
  totalPlays: number;
  totalWins: number;
  type: string;
  gameLink?: string;
  minWinPercent?: number;
  maxWinPercent?: number;
}

const GameList = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gameLink: "",
    minWinPercent: "",
    maxWinPercent: "",
    icon: "",
    description: "",
    minBet: "",
    maxBet: "",
    type: "luck",
    featured: false
  });

  // Fetch games from Firestore
  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const gamesData: Game[] = [];
      querySnapshot.forEach((doc) => {
        const gameData = doc.data() as Game;
        gamesData.push({ id: doc.id, ...gameData });
      });
      
      // Apply search filter
      let filteredData = gamesData;
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(game => 
          game.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setGames(filteredData);
    } catch (error) {
      console.error('Error fetching games from Firestore:', error);
      toast({
        title: "Error",
        description: "Failed to fetch games. Please try again.",
        variant: "destructive",
      });
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [searchTerm]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle add/edit game
  const handleSubmit = async () => {
    try {
      const gameData = {
        ...formData,
        minBet: parseInt(formData.minBet) || 0,
        maxBet: parseInt(formData.maxBet) || 0,
        minWinPercent: parseFloat(formData.minWinPercent) || 0,
        maxWinPercent: parseFloat(formData.maxWinPercent) || 0,
        createdAt: editingGame?.createdAt || new Date().toISOString(),
        totalBets: editingGame?.totalBets || 0,
        totalPlays: editingGame?.totalPlays || 0,
        totalWins: editingGame?.totalWins || 0,
        status: "Active"
      };

      if (editingGame) {
        // Update existing game
        await updateDoc(doc(db, 'games', editingGame.id), gameData);
        toast({
          title: "Success",
          description: `Game "${formData.name}" updated successfully!`,
        });
      } else {
        // Add new game
        const newGameRef = await addDoc(collection(db, 'games'), gameData);
        toast({
          title: "Success",
          description: `Game "${formData.name}" added successfully!`,
        });
      }

      // Reset form and refresh data
      setFormData({
        name: "",
        gameLink: "",
        minWinPercent: "",
        maxWinPercent: "",
        icon: "",
        description: "",
        minBet: "",
        maxBet: "",
        type: "luck",
        featured: false
      });
      setEditingGame(null);
      setIsAddModalOpen(false);
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Error",
        description: "Failed to save game. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit game
  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      gameLink: game.gameLink || "",
      minWinPercent: game.minWinPercent?.toString() || "",
      maxWinPercent: game.maxWinPercent?.toString() || "",
      icon: game.icon,
      description: game.description,
      minBet: game.minBet.toString(),
      maxBet: game.maxBet.toString(),
      type: game.type,
      featured: game.featured
    });
    setIsAddModalOpen(true);
  };

  // Handle delete game
  const handleDeleteGame = async (gameId: string) => {
    try {
      const gameToDelete = games.find(g => g.id === gameId);
      await deleteDoc(doc(db, 'games', gameId));
      toast({
        title: "Success",
        description: `Game "${gameToDelete?.name}" deleted successfully!`,
      });
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete game. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Game" 
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Games Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor games</p>
        </div>

        {/* Games Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="text-lg font-semibold text-foreground">Games List</div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  onClick={() => {
                    setEditingGame(null);
                    setFormData({
                      name: "",
                      gameLink: "",
                      minWinPercent: "",
                      maxWinPercent: "",
                      icon: "",
                      description: "",
                      minBet: "",
                      maxBet: "",
                      type: "luck",
                      featured: false
                    });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingGame ? "Edit Game" : "Add New Game"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="gameName" className="text-sm font-medium">Game Name</Label>
                    <Input
                      id="gameName"
                      placeholder="Enter game name"
                      className="mt-1 bg-secondary border-border"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gameLink" className="text-sm font-medium">Game Link</Label>
                    <Input
                      id="gameLink"
                      placeholder="Enter game link"
                      className="mt-1 bg-secondary border-border"
                      value={formData.gameLink}
                      onChange={(e) => handleInputChange('gameLink', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minWin" className="text-sm font-medium">Min Win Percent</Label>
                      <Input
                        id="minWin"
                        placeholder="0"
                        className="mt-1 bg-secondary border-border"
                        value={formData.minWinPercent}
                        onChange={(e) => handleInputChange('minWinPercent', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxWin" className="text-sm font-medium">Max Win Percent</Label>
                      <Input
                        id="maxWin"
                        placeholder="100"
                        className="mt-1 bg-secondary border-border"
                        value={formData.maxWinPercent}
                        onChange={(e) => handleInputChange('maxWinPercent', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="gameIcon" className="text-sm font-medium">Game Icon</Label>
                    <Input
                      id="gameIcon"
                      placeholder="🎰"
                      className="mt-1 bg-secondary border-border"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter game description"
                      className="mt-1 bg-secondary border-border"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minBet" className="text-sm font-medium">Min Bet</Label>
                      <Input
                        id="minBet"
                        placeholder="0"
                        className="mt-1 bg-secondary border-border"
                        value={formData.minBet}
                        onChange={(e) => handleInputChange('minBet', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxBet" className="text-sm font-medium">Max Bet</Label>
                      <Input
                        id="maxBet"
                        placeholder="1000"
                        className="mt-1 bg-secondary border-border"
                        value={formData.maxBet}
                        onChange={(e) => handleInputChange('maxBet', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-secondary border-border"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">IMAGE</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">GAME NAME</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">GAME LINK</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">MIN WIN %</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">MAX WIN %</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">STATUS</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-xs px-4 py-3">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">Loading games...</div>
                    </TableCell>
                  </TableRow>
                ) : games.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">No games found. Click 'Add Game' to create your first game.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  games.map((game) => (
                    <TableRow key={game.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3">
                        <div className="text-2xl">{game.icon}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-foreground">{game.name}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {game.gameLink ? (
                          <a 
                            href={game.gameLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        {game.minWinPercent || 0}%
                      </TableCell>
                      <TableCell className="px-4 py-3 text-foreground">
                        {game.maxWinPercent || 0}%
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge 
                          variant={game.status === 'Active' ? 'default' : 'secondary'}
                          className={game.status === 'Active' 
                            ? 'bg-green-500 text-white hover:bg-green-600 px-3 py-1 text-xs font-medium'
                            : 'bg-muted text-muted-foreground px-3 py-1 text-xs font-medium'
                          }
                        >
                          {game.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditGame(game)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteGame(game.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GameList;
