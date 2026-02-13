import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockBanners } from "@/data/mockData";

const SplashBanner = () => {
  const [banners, setBanners] = useState(mockBanners);

  const toggleStatus = (id: number) => {
    setBanners(banners.map((b) => (b.id === id ? { ...b, status: !b.status } : b)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Splash Banner</h1>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
        </div>

        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Image</TableHead>
                <TableHead>Redirect URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id} className="border-border">
                  <TableCell>
                    <img src={banner.image} alt="Banner" className="h-12 w-24 object-cover rounded-md" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{banner.redirectUrl}</TableCell>
                  <TableCell>
                    <Switch checked={banner.status} onCheckedChange={() => toggleStatus(banner.id)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{banner.createdDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{banner.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SplashBanner;
