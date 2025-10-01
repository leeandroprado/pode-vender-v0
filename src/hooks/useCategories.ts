import { useState, useEffect, useCallback, useRef } from "react";
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

// Cache configuration
const CACHE_KEY = 'categories_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: Category[];
  timestamp: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCategories = useCallback(async (skipCache = false) => {
    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check cache first
      if (!skipCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const cacheData: CacheData = JSON.parse(cached);
          const now = Date.now();
          if (now - cacheData.timestamp < CACHE_TTL) {
            setCategories(cacheData.data);
            setLoading(false);
            return;
          }
        }
      }

      setLoading(true);
      abortControllerRef.current = new AbortController();

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description, color, user_id, is_active, created_at, updated_at")
        .eq("is_active", true)
        .order("name", { ascending: true })
        .limit(100);

      if (error) throw error;

      const categoriesData = data || [];
      setCategories(categoriesData);

      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: categoriesData,
        timestamp: Date.now(),
      }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching categories:", error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar a lista de categorias.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [toast]);

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

      // Invalidate cache and refetch
      localStorage.removeItem(CACHE_KEY);
      fetchCategories(true);
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

      // Invalidate cache and refetch
      localStorage.removeItem(CACHE_KEY);
      fetchCategories(true);
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
      const { error } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });

      // Invalidate cache and refetch
      localStorage.removeItem(CACHE_KEY);
      fetchCategories(true);
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

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCategories]);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: () => fetchCategories(true),
  };
}
