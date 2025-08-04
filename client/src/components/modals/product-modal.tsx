import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductForm from "@/components/forms/product-form";
import { type ProductWithSupplier } from "@shared/schema";

interface ProductModalProps {
  product?: ProductWithSupplier | null;
  onSuccess: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProductModal({ 
  product, 
  onSuccess, 
  children, 
  open, 
  onOpenChange 
}: ProductModalProps) {
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
          <ProductForm
            product={product}
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
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <ProductForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
