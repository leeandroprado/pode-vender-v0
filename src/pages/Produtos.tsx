import { useState } from "react";
import type { Product } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Upload, FolderKanban, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { NewProductDialog } from "@/components/NewProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { ImportProductsDialog } from "@/components/ImportProductsDialog";
import { ProductFilters } from "@/components/ProductFilters";
import { ExportDropdown } from "@/components/ExportDropdown";
import { CategoryManagementDialog } from "@/components/CategoryManagementDialog";
import { ProductActionsDropdown } from "@/components/ProductActionsDropdown";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "@/components/produtos-columns";
import { EmptyState } from "@/components/EmptyState";

export default function Produtos() {
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);
  const { 
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
    refetch 
  } = useProducts();
  const isMobile = useIsMobile();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      ativo: "Ativo",
      inativo: "Inativo",
      baixo_estoque: "Baixo Estoque",
      esgotado: "Esgotado",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      ativo: "bg-success/10 text-success border-success/20",
      baixo_estoque: "bg-warning/10 text-warning border-warning/20",
      esgotado: "bg-destructive/10 text-destructive border-destructive/20",
      inativo: "bg-muted text-muted-foreground border-muted",
    };
    return classMap[status] || "";
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: deleteProduct });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {!isMobile && <ExportDropdown products={products} />}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setCategoryManagementOpen(true)}
            size={isMobile ? "sm" : "default"}
          >
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Categorias</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setImportOpen(true)}
            size={isMobile ? "sm" : "default"}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button 
            className="gap-2" 
            onClick={() => setNewProductOpen(true)}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto cadastrado"
              description="Comece adicionando produtos ao seu catálogo para gerenciar seu estoque e vendas"
              action={{
                label: "Adicionar Primeiro Produto",
                onClick: () => setNewProductOpen(true)
              }}
            />
          ) : isMobile ? (
            <div className="space-y-3">
              {products.map((product) => (
                <Card key={product.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <ProductActionsDropdown
                        product={product}
                        onEdit={handleEdit}
                        onDelete={deleteProduct}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-primary">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estoque: {product.stock}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(getStatusClass(product.status))}
                      >
                        {getStatusLabel(product.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={products} />
          )}
        </CardContent>
      </Card>

      <NewProductDialog
        open={newProductOpen}
        onOpenChange={setNewProductOpen}
        onSubmit={createProduct}
      />

      <ImportProductsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportComplete={refetch}
      />

      <CategoryManagementDialog
        open={categoryManagementOpen}
        onOpenChange={setCategoryManagementOpen}
      />

      <EditProductDialog
        open={editProductOpen}
        onOpenChange={setEditProductOpen}
        product={selectedProduct}
        onSubmit={updateProduct}
      />
    </div>
  );
}
