import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Upload, MoreVertical, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { NewProductDialog } from "@/components/NewProductDialog";
import { ImportProductsDialog } from "@/components/ImportProductsDialog";
import { ProductFilters } from "@/components/ProductFilters";
import { ExportDropdown } from "@/components/ExportDropdown";
import { cn } from "@/lib/utils";

export default function Produtos() {
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { products, loading, filters, setFilters, createProduct, refetch } = useProducts();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown products={products} />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Importar Planilha
          </Button>
          <Button className="gap-2" onClick={() => setNewProductOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
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
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum produto encontrado
              </p>
              <Button onClick={() => setNewProductOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(getStatusClass(product.status))}
                        >
                          {getStatusLabel(product.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {products.length}{" "}
              {products.length === 1 ? "produto" : "produtos"}
            </div>
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
    </div>
  );
}
