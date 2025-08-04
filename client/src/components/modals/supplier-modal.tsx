import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SupplierForm from "@/components/forms/supplier-form";
import { type Supplier } from "@shared/schema";

interface SupplierModalProps {
  supplier?: Supplier | null;
  onSuccess: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SupplierModal({ 
  supplier, 
  onSuccess, 
  children, 
  open, 
  onOpenChange 
}: SupplierModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onOpenChange?.(false);
  };

  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <SupplierForm
            supplier={supplier}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <SupplierForm
          supplier={supplier}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
