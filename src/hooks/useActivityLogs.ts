import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useActivityLogs = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["activity_logs", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
