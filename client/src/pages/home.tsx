import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "./dashboard";
import Sales from "./sales";
import SalesHistory from "./sales-history";
import Customers from "./customers";
import Products from "./products";
import Suppliers from "./suppliers";
import Users from "./users";

export default function Home() {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState("dashboard");

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "sales":
        return <Sales />;
      case "history":
        return <SalesHistory />;
      case "customers":
        return <Customers />;
      case "products":
        return <Products />;
      case "suppliers":
        return <Suppliers />;
      case "users":
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      sales: "Nova Venda",
      history: "Histórico de Vendas",
      customers: "Clientes",
      products: "Produtos",
      suppliers: "Fornecedores",
      users: "Usuários",
    };
    return titles[currentSection as keyof typeof titles] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        user={user}
      />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title={getPageTitle()} />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
