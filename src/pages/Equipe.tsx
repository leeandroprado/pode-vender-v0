import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import { InviteMemberDialog } from "@/components/InviteMemberDialog";

const TeamPage = () => {
  const { profile } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ["team_members", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("organization_id", profile.organization_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os membros da sua organização.
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Convidar Membro
        </Button>
      </div>

      {/* Tabela de Membros (a ser implementada) */}
      <div className="border rounded-lg p-4">
        {isLoading ? (
          <p>Carregando membros...</p>
        ) : (
          <ul>
            {members?.map((member) => (
              <li key={member.id} className="flex justify-between items-center p-2 border-b">
                <span>{member.full_name}</span>
                <span className="text-sm text-muted-foreground">{member.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <InviteMemberDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
    </div>
  );
};

export default TeamPage;
