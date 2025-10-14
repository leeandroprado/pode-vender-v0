import { useState } from "react";
import { Users, UserPlus, Mail, Clock, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InviteUserDialog } from "@/components/InviteUserDialog";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import type { UserRole } from "@/hooks/useUserRole";

const roleLabels: Partial<Record<UserRole, string>> = {
  user: "Usuário",
  vendedor: "Vendedor",
  moderator: "Moderador",
  admin: "Administrador",
  super_admin: "Super Admin",
};

const roleVariants: Partial<Record<UserRole, "default" | "secondary" | "outline" | "destructive">> = {
  user: "outline",
  vendedor: "default",
  moderator: "secondary",
  admin: "destructive",
  super_admin: "destructive",
};

export default function Equipe() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { 
    members, 
    pendingInvites, 
    isLoading, 
    inviteUser, 
    updateUserRole, 
    cancelInvite, 
    resendInvite, 
    isInviting,
    isCanceling,
    isResending 
  } = useTeamMembers();

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole({ userId, newRole });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da sua equipe</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      </div>

      {/* Convites Pendentes */}
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Convites Pendentes</h2>
            <Badge variant="secondary">{pendingInvites.length}</Badge>
          </div>
          
          <div className="grid gap-4">
            {pendingInvites.map((invite) => (
              <Card key={invite.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{invite.email}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {invite.phone && (
                            <span>{invite.phone}</span>
                          )}
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>
                            Expira em{" "}
                            {new Date(invite.expires_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={roleVariants[invite.role] || "outline"}>
                        {roleLabels[invite.role] || invite.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => resendInvite(invite)}
                        disabled={isResending}
                        title="Reenviar convite"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => cancelInvite(invite.id)}
                        disabled={isCanceling}
                        title="Cancelar convite"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Membros Ativos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Membros Ativos</h2>
          <Badge variant="secondary">{members.length}</Badge>
        </div>

      <div className="grid gap-4">
        {members.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum membro encontrado. Comece convidando alguém!
              </p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {member.full_name || "Sem nome"}
                      </CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleVariants[member.role] || "outline"}>
                      {roleLabels[member.role] || member.role}
                    </Badge>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      </div>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={inviteUser}
        isInviting={isInviting}
      />
    </div>
  );
}
