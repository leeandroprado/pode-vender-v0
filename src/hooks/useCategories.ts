import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES_QUERY_KEY = "categories";

export function useCategories() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!profile?.organization_id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  };

  const createCategory = useMutation({
    ...mutationOptions,
    mutationFn: async (category: Omit<Category, "id" | "created_at" | "updated_at" | "organization_id" | "is_active">) => {
      if (!profile?.organization_id) throw new Error("Organização não encontrada.");
      const { error } = await supabase.from("categories").insert({ ...category, organization_id: profile.organization_id, is_active: true });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Categoria criada." });
    },
  });

  const updateCategory = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { error } = await supabase.from("categories").update(updates).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Categoria atualizada." });
    },
  });

  const deleteCategory = useMutation({
    ...mutationOptions,
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").update({ is_active: false }).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Categoria removida." });
    },
  });

  return {
    categories,
    loading,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] }),
  };
}
