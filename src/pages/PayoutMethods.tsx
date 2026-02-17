import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash2, Upload, X, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPayoutMethods, createPayoutMethod, updatePayoutMethod, deletePayoutMethod, PayoutMethod } from "@/lib/firestoreService";

export default function PayoutMethods() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PayoutMethod | null>(null);
  
  // Form states
  const [methodName, setMethodName] = useState("");
  const [methodImage, setMethodImage] = useState("");
  const [detailField, setDetailField] = useState("");
  const [detailFields, setDetailFields] = useState<string[]>([]);

  // Load payout methods from Firestore
  useEffect(() => {
    const loadPayoutMethods = async () => {
      try {
        setLoading(true);
        const data = await getPayoutMethods();
        setPayoutMethods(data);
      } catch (error) {
        console.error('Error loading payout methods:', error);
        toast({
          title: "Error",
          description: "Failed to load payout methods",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPayoutMethods();
  }, [toast]);

  const filteredMethods = payoutMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMethod = async () => {
    if (!methodName.trim()) {
      toast({
        title: "Error",
        description: "Method name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await createPayoutMethod({
        name: methodName,
        image: methodImage || "/placeholder.svg",
        requiredDetails: detailFields,
        status: true
      });

      if (success) {
        // Reload the data
        const data = await getPayoutMethods();
        setPayoutMethods(data);
        setAddDialog(false);
        resetForm();
        toast({
          title: "Success",
          description: "Payout method added successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add payout method",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding payout method:', error);
      toast({
        title: "Error",
        description: "Failed to add payout method",
        variant: "destructive"
      });
    }
  };

  const handleEditMethod = async () => {
    if (!editingMethod || !methodName.trim()) {
      toast({
        title: "Error",
        description: "Method name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await updatePayoutMethod(editingMethod.id, {
        name: methodName,
        image: methodImage || editingMethod.image,
        requiredDetails: detailFields.length > 0 ? detailFields : editingMethod.requiredDetails
      });

      if (success) {
        // Reload the data
        const data = await getPayoutMethods();
        setPayoutMethods(data);
        setEditDialog(false);
        resetForm();
        toast({
          title: "Success",
          description: "Payout method updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update payout method",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating payout method:', error);
      toast({
        title: "Error",
        description: "Failed to update payout method",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const success = await deletePayoutMethod(id);
      if (success) {
        // Reload the data
        const data = await getPayoutMethods();
        setPayoutMethods(data);
        toast({
          title: "Success",
          description: "Payout method deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete payout method",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting payout method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payout method",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const method = payoutMethods.find(m => m.id === id);
    if (!method) return;

    try {
      const success = await updatePayoutMethod(id, {
        status: !method.status
      });

      if (success) {
        // Reload the data
        const data = await getPayoutMethods();
        setPayoutMethods(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setMethodImage(result);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddDetailField = () => {
    if (detailField.trim()) {
      setDetailFields([...detailFields, detailField.trim()]);
      setDetailField("");
    }
  };

  const handleRemoveDetailField = (index: number) => {
    setDetailFields(detailFields.filter((_, i) => i !== index));
  };

  const openEditDialog = (method: PayoutMethod) => {
    setEditingMethod(method);
    setMethodName(method.name);
    setMethodImage(method.image);
    setDetailFields(method.requiredDetails);
    setEditDialog(true);
  };

  const resetForm = () => {
    setMethodName("");
    setMethodImage("");
    setDetailField("");
    setDetailFields([]);
    setEditingMethod(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Payout Methods</h1>
            <p className="text-gray-400 text-sm mt-1">Configure and manage payout options</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const loadPayoutMethods = async () => {
                  try {
                    setLoading(true);
                    const data = await getPayoutMethods();
                    setPayoutMethods(data);
                  } catch (error) {
                    console.error('Error refreshing payout methods:', error);
                  } finally {
                    setLoading(false);
                  }
                };
                loadPayoutMethods();
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setAddDialog(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Method
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
            <span className="ml-2 text-gray-400">Loading payout methods...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Payout Method"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Table */}
            <div className="border border-gray-700/50 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-gray-400">IMAGE</TableHead>
                <TableHead className="text-gray-400">NAME</TableHead>
                <TableHead className="text-gray-400">REQUIRED DETAILS</TableHead>
                <TableHead className="text-gray-400">STATUS</TableHead>
                <TableHead className="text-gray-400 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMethods.map((method) => (
                <TableRow key={method.id} className="border-gray-700/50 hover:bg-purple-600/5">
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      <img 
                        src={method.image} 
                        alt={method.name}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">{method.name}</TableCell>
                  <TableCell className="text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {method.requiredDetails.slice(0, 2).map((detail, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-700 rounded text-xs"
                        >
                          {detail}
                        </span>
                      ))}
                      {method.requiredDetails.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                          +{method.requiredDetails.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={method.status}
                      onCheckedChange={() => handleToggleStatus(method.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={() => openEditDialog(method)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add Method Dialog */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Payout Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="methodName">Payout Method Name</Label>
                <Input
                  id="methodName"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  placeholder="Enter method name"
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 mt-1"
                />
              </div>

              <div>
                <Label>Add Detail Field</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={detailField}
                    onChange={(e) => setDetailField(e.target.value)}
                    placeholder="Enter detail field name"
                    className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 flex-1"
                  />
                  <Button
                    onClick={handleAddDetailField}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add
                  </Button>
                </div>
                {detailFields.length === 0 && (
                  <p className="text-gray-500 text-xs mt-2">No detail fields added yet</p>
                )}
                {detailFields.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {detailFields.map((field, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {field}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-400"
                          onClick={() => handleRemoveDetailField(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Upload Image</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 mt-1">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2 hover:text-purple-400 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <p className="text-gray-500 text-sm">Accepted formats: image/*</p>
                      {methodImage && (
                        <div className="mt-2">
                          <img
                            src={methodImage}
                            alt="Preview"
                            className="w-16 h-16 rounded object-cover border border-gray-600"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialog(false);
                  resetForm();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMethod}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Method Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Payout Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editMethodName">Payout Method Name</Label>
                <Input
                  id="editMethodName"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  placeholder="Enter method name"
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 mt-1"
                />
              </div>

              <div>
                <Label>Add Detail Field</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={detailField}
                    onChange={(e) => setDetailField(e.target.value)}
                    placeholder="Enter detail field name"
                    className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 flex-1"
                  />
                  <Button
                    onClick={handleAddDetailField}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add
                  </Button>
                </div>
                {detailFields.length === 0 && (
                  <p className="text-gray-500 text-xs mt-2">No detail fields added yet</p>
                )}
                {detailFields.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {detailFields.map((field, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {field}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-400"
                          onClick={() => handleRemoveDetailField(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Upload Image</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 mt-1">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-edit"
                    />
                    <label 
                      htmlFor="image-upload-edit"
                      className="cursor-pointer flex flex-col items-center gap-2 hover:text-purple-400 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <p className="text-gray-500 text-sm">Accepted formats: image/*</p>
                      {(methodImage || editingMethod?.image) && (
                        <div className="mt-2">
                          <img
                            src={methodImage || editingMethod?.image}
                            alt="Preview"
                            className="w-16 h-16 rounded object-cover border border-gray-600"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialog(false);
                  resetForm();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditMethod}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </>
      )}
    </div>
    </DashboardLayout>
  );
}
