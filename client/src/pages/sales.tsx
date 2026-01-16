import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Check } from "lucide-react";
import { type ProductWithSupplier, type Customer } from "@shared/schema";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unitPrice: z.number().min(0, "Preço deve ser positivo"),
  subtotal: z.number().min(0, "Subtotal deve ser positivo"),
});

const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Adicione pelo menos um produto"),
});

type SaleFormData = z.infer<typeof saleSchema>;
type SaleItem = z.infer<typeof saleItemSchema>;

export default function Sales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  const { data: products = [] } = useQuery<ProductWithSupplier[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "none",
      items: [],
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
      const saleData = {
        sale: {
          customerId: data.customerId === "none" ? null : data.customerId || null,
          total: total.toString(),
        },
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
        })),
      };
      return await apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Venda realizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/sales-stats"] });
      form.reset();
      setSaleItems([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar venda",
        variant: "destructive",
      });
    },
  });

  const addProduct = () => {
    setSaleItems([...saleItems, {
      productId: "",
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    }]);
  };

  const removeProduct = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update subtotal when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Update unit price when product changes
    if (field === "productId") {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = parseFloat(product.price);
        newItems[index].subtotal = newItems[index].quantity * parseFloat(product.price);
      }
    }
    
    setSaleItems(newItems);
  };

  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const onSubmit = (data: SaleFormData) => {
    if (saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive",
      });
      return;
    }

    // Validate stock
    for (const item of saleItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        });
        return;
      }
      if (product.stock < item.quantity) {
        toast({
          title: "Estoque Insuficiente",
          description: `${product.name}: Disponível ${product.stock}, Solicitado ${item.quantity}`,
          variant: "destructive",
        });
        return;
      }
    }

    createSaleMutation.mutate({ ...data, items: saleItems });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customer">Cliente (Opcional)</Label>
                <Select 
                  value={form.watch("customerId")} 
                  onValueChange={(value) => form.setValue("customerId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem cliente</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input 
                  type="date" 
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                />
              </div>
            </div>

            {/* Products Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Produtos</Label>
                <Button type="button" onClick={addProduct} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>

              {/* Products Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Unit.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saleItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Nenhum produto adicionado
                        </td>
                      </tr>
                    ) : (
                      saleItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateItem(index, "productId", value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} (Estoque: {product.stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>{formatCurrency(getTotalAmount())}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSaleItems([]);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createSaleMutation.isPending || saleItems.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg font-semibold"
              >
                <Check className="w-5 h-5 mr-2" />
                {createSaleMutation.isPending ? "Gravando..." : "Gravar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
