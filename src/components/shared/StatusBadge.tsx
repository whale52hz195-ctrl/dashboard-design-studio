import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Approved: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Banned: "bg-destructive/15 text-destructive border-destructive/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Inactive: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusStyles[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}
