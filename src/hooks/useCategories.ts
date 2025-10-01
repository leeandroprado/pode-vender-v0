import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, "id" | "created_at" | "updated_at" | "user_id" | "is_active">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("categories").insert({
        ...category,
        user_id: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Categoria já existe",
            description: "Uma categoria com este nome já foi criada.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });

      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });

      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Soft delete - just set is_active to false
      const { error } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });

      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
