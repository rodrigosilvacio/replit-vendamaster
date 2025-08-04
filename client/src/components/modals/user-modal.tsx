import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit } from "lucide-react";
import { type User } from "@shared/schema";

interface UserModalProps {
  user?: User | null;
  onSuccess: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UserModal({ 
  user, 
  onSuccess, 
  children, 
  open, 
  onOpenChange 
}: UserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<"admin" | "vendedor">(user?.role as "admin" | "vendedor" || "vendedor");
  const [isActive, setIsActive] = useState(user?.isActive || true);

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { role: string; isActive: boolean } }) => {
      await apiRequest("PUT", `/api/users/${id}/role`, data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onSuccess();
      onOpenChange?.(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!user) return;
    
    updateUserMutation.mutate({
      id: user.id,
      data: { role, isActive },
    });
  };

  const handleCancel = () => {
    if (user) {
      setRole(user.role as "admin" | "vendedor");
      setIsActive(user.isActive);
    }
    onOpenChange?.(false);
  };

  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {user && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <p className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <Label>E-mail</Label>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={role} onValueChange={(value: "admin" | "vendedor") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">Usuário ativo</Label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <p className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <Label>E-mail</Label>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div>
              <Label htmlFor="role">Tipo de Usuário</Label>
              <Select value={role} onValueChange={(value: "admin" | "vendedor") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Usuário ativo</Label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
