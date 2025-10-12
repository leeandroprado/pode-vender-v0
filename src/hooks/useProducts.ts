import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
}

const PRODUCTS_QUERY_KEY = "products";

export function useProducts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ProductFilters>({ search: "", category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const { data, isLoading: loading } = useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, filters, currentPage, pageSize],
    queryFn: async () => {
      if (!profile?.organization_id) return { data: [], count: 0 };

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('organization_id', profile.organization_id);

      // Apply filters
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('created_at', filters.startDate.toISOString());
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data as Product[], count: count ?? 0 };
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  };

  const createProductMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!profile?.organization_id) throw new Error("Organização não encontrada.");
      const { error } = await supabase.from("products").insert({ ...product, organization_id: profile.organization_id });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Produto criado." });
    },
  });

  const updateProductMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Produto atualizado." });
    },
  });

  const deleteProductMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Produto excluído." });
    },
  });
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return {
    products,
    loading,
    filters,
    setFilters,
    currentPage,
    totalCount,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] }),
  };
}
