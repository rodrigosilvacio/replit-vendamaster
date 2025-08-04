import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import SalesChart from "@/components/charts/sales-chart";
import { 
  DollarSign, 
  Calendar, 
  CalendarDays, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/sales-stats"],
    retry: false,
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["/api/products/low-stock"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vendas Hoje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.todaySales || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vendas Semana
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.weekSales || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDays className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vendas Mês
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.monthSales || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estoque Baixo
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {lowStockProducts?.length || 0} produtos
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vendas por Período
            </h3>
            <SalesChart data={stats?.salesByPeriod || []} />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Produtos Mais Vendidos
            </h3>
            <div className="space-y-4">
              {stats?.topProducts?.length ? (
                stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {product.totalSold} vendas
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Produtos com Estoque Baixo
            </h3>
            <div className="divide-y divide-gray-200">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Categoria: {product.category || "Sem categoria"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock <= 5 
                      ? "bg-red-100 text-red-800" 
                      : "bg-orange-100 text-orange-800"
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
