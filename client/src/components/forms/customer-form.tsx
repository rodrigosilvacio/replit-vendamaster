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
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { toast } = useToast();
  const isEditing = !!customer;

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      document: customer?.document || "",
      address: customer?.address || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const url = isEditing ? `/api/customers/${customer.id}` : "/api/customers";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `Cliente ${isEditing ? "atualizado" : "criado"} com sucesso!`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? "atualizar" : "criar"} cliente`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    mutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
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
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            {...form.register("document")}
            placeholder="123.456.789-00 ou 12.345.678/0001-90"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="cliente@email.com"
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
