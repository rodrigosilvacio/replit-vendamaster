import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema, type ProductWithSupplier, type InsertProduct, type Supplier } from "@shared/schema";

interface ProductFormProps {
  product?: ProductWithSupplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const isEditing = !!product;

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price ? parseFloat(product.price.toString()) : 0,
      stock: product?.stock || 0,
      category: product?.category || "",
      supplierId: product?.supplierId || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const formattedData = {
        ...data,
        price: data.price.toString(),
        supplierId: data.supplierId || null,
      };
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(method, url, formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `Produto ${isEditing ? "atualizado" : "criado"} com sucesso!`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? "atualizar" : "criar"} produto`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    mutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...form.register("name")}
            className={form.formState.errors.name ? "border-red-500" : ""}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Descrição do produto"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...form.register("price", { valueAsNumber: true })}
              className={form.formState.errors.price ? "border-red-500" : ""}
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="stock">Estoque *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              {...form.register("stock", { valueAsNumber: true })}
              className={form.formState.errors.stock ? "border-red-500" : ""}
            />
            {form.formState.errors.stock && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.stock.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            {...form.register("category")}
            placeholder="ex: Informática, Acessórios"
          />
        </div>

        <div>
          <Label htmlFor="supplier">Fornecedor</Label>
          <Select
            value={form.watch("supplierId")}
            onValueChange={(value) => form.setValue("supplierId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem fornecedor</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </>
  );
}
