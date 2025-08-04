import { ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <ScanBarcode className="text-white text-2xl" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDV Online</h1>
              <p className="mt-2 text-sm text-gray-600">Sistema de Ponto de Venda</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Faça login para acessar o sistema
              </p>
              
              <Button 
                onClick={handleLogin}
                className="w-full"
                size="lg"
              >
                <span className="mr-2">🔐</span>
                Entrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
