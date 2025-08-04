import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSupplierSchema, type Supplier, type InsertSupplier } from "@shared/schema";

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const { toast } = useToast();
  const isEditing = !!supplier;

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      cnpj: supplier?.cnpj || "",
      address: supplier?.address || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const url = isEditing ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `Fornecedor ${isEditing ? "atualizado" : "criado"} com sucesso!`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? "atualizar" : "criar"} fornecedor`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    mutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
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
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...form.register("cnpj")}
            placeholder="12.345.678/0001-90"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="(11) 3333-3333"
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="contato@fornecedor.com"
          />
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Textarea
            id="address"
            {...form.register("address")}
            placeholder="Rua, número, complemento, bairro, cidade, CEP"
            rows={3}
          />
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
