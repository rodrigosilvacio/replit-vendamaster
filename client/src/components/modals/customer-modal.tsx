import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CustomerForm from "@/components/forms/customer-form";
import { type Customer } from "@shared/schema";

interface CustomerModalProps {
  customer?: Customer | null;
  onSuccess: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomerModal({ 
  customer, 
  onSuccess, 
  children, 
  open, 
  onOpenChange 
}: CustomerModalProps) {
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
          <CustomerForm
            customer={customer}
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
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <CustomerForm
          customer={customer}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
