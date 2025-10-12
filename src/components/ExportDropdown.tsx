import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useProducts";

interface ExportDropdownProps {
  products: Product[];
}

export function ExportDropdown({ products }: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Lista de Produtos", 14, 22);

      // Add date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

      // Prepare data for table
      const tableData = products.map((product) => [
        product.name,
        product.category,
        `R$ ${product.price.toFixed(2)}`,
        product.stock.toString(),
        product.status,
      ]);

      // Add table
      autoTable(doc, {
        startY: 35,
        head: [["Produto", "Categoria", "Preço", "Estoque", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
        },
      });

      // Save PDF
      doc.save(`produtos_${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "PDF exportado",
        description: "A lista de produtos foi exportada com sucesso.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar para PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");

      // Prepare data for Excel
      const excelData = products.map((product) => ({
        Nome: product.name,
        Categoria: product.category,
        Preço: product.price,
        Estoque: product.stock,
        Status: product.status,
        Descrição: product.description || "",
        "Data de Criação": new Date(product.created_at).toLocaleDateString("pt-BR"),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 30 }, // Nome
        { wch: 15 }, // Categoria
        { wch: 12 }, // Preço
        { wch: 10 }, // Estoque
        { wch: 15 }, // Status
        { wch: 40 }, // Descrição
        { wch: 15 }, // Data de Criação
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Produtos");

      // Save Excel file
      XLSX.writeFile(wb, `produtos_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Excel exportado",
        description: "A lista de produtos foi exportada com sucesso.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar para Excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
