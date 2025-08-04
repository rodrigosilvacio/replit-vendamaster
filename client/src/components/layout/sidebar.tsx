import { Button } from "@/components/ui/button";
import { 
  ScanBarcode, 
  LayoutDashboard, 
  ShoppingCart, 
  History, 
  Users, 
  Package, 
  Truck, 
  UserCog,
  LogOut
} from "lucide-react";
import { type User } from "@shared/schema";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  user: User;
}

export default function Sidebar({ currentSection, onSectionChange, user }: SidebarProps) {
  const isAdmin = user.role === "admin";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { id: "sales", label: "Nova Venda", icon: ShoppingCart, adminOnly: false },
    { id: "history", label: "Histórico de Vendas", icon: History, adminOnly: true },
    { id: "customers", label: "Clientes", icon: Users, adminOnly: false },
    { id: "products", label: "Produtos", icon: Package, adminOnly: false },
    { id: "suppliers", label: "Fornecedores", icon: Truck, adminOnly: true },
    { id: "users", label: "Usuários", icon: UserCog, adminOnly: true },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <div className="flex items-center">
            <ScanBarcode className="text-white text-xl mr-2" />
            <span className="text-white text-lg font-semibold">PDV Online</span>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {user.role === "admin" ? "Administrador" : "Vendedor"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start ${
                  isActive 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
