import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  user_id: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    status: "",
    startDate: undefined,
    endDate: undefined,
  });
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchProducts = useCallback(async () => {
    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setLoading(true);
      abortControllerRef.current = new AbortController();

      // Build base query for counting
      let countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Apply filters to count query
      if (filters.search) {
        countQuery = countQuery.ilike("name", `%${filters.search}%`);
      }
      if (filters.category) {
        countQuery = countQuery.eq("category", filters.category);
      }
      if (filters.status) {
        countQuery = countQuery.eq("status", filters.status);
      }
      if (filters.startDate) {
        countQuery = countQuery.gte("created_at", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        countQuery = countQuery.lte("created_at", endOfDay.toISOString());
      }

      // Get total count
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Build data query with pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let dataQuery = supabase
        .from("products")
        .select("id, name, category, price, stock, status, description, user_id, created_at, updated_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply filters to data query
      if (filters.search) {
        dataQuery = dataQuery.ilike("name", `%${filters.search}%`);
      }
      if (filters.category) {
        dataQuery = dataQuery.eq("category", filters.category);
      }
      if (filters.status) {
        dataQuery = dataQuery.eq("status", filters.status);
      }
      if (filters.startDate) {
        dataQuery = dataQuery.gte("created_at", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dataQuery = dataQuery.lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching products:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar a lista de produtos.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filters, currentPage, pageSize, toast]);

  const createProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at" | "user_id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("products").insert({
        ...product,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Debounce filter changes to avoid excessive queries
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

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
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
