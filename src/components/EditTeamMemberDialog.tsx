import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember } from "@/hooks/useTeamMembers";
import { UserRole } from "@/hooks/useUserRole";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const memberSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
  role: z.enum(["user", "vendedor", "moderator", "admin", "super_admin"]),
});

interface EditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  currentUserId: string | null;
  currentUserRole: UserRole | null;
  onUpdate: (args: { 
    userId: string; 
    updates: { full_name?: string; email?: string; avatar_url?: string };
    role?: UserRole;
  }) => void;
  isUpdating: boolean;
}

export function EditTeamMemberDialog({
  open,
  onOpenChange,
  member,
  currentUserId,
  currentUserRole,
  onUpdate,
  isUpdating,
}: EditTeamMemberDialogProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(member.full_name || "");
  const [email, setEmail] = useState(member.email);
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || "");
  const [selectedRole, setSelectedRole] = useState<UserRole>(member.role);

  const isEditingSelf = currentUserId === member.id;
  const isSuperAdmin = currentUserRole === 'super_admin';
  const shouldDisableRoleChange = isEditingSelf && isSuperAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = memberSchema.parse({
        full_name: fullName,
        email,
        avatar_url: avatarUrl,
        role: selectedRole,
      });

      onUpdate({ 
        userId: member.id, 
        updates: {
          full_name: validatedData.full_name,
          email: validatedData.email,
          avatar_url: validatedData.avatar_url,
        },
        role: shouldDisableRoleChange ? undefined : validatedData.role,
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              required
            />
          </div>

          <div>
            <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              disabled={shouldDisableRoleChange}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            {shouldDisableRoleChange && (
              <p className="text-xs text-muted-foreground mt-1">
                Você não pode alterar sua própria função
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
