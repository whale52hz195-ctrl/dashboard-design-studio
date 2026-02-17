import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmationDialog = ({ isOpen, onConfirm, onCancel }: LogoutConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border-border rounded-lg p-6 w-full max-w-md mx-4">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Logout Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Logout</h2>
          <p className="text-muted-foreground">Are you sure you want to logout?</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onConfirm}
            className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-3"
          >
            Logout
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-8 py-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationDialog;
