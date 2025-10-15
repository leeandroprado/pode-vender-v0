import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/hooks/useClients";

interface ExportClientsDropdownProps {
  clients: Client[];
}

export function ExportClientsDropdown({ clients }: ExportClientsDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Lista de Clientes", 14, 22);

      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

      // Dados da tabela
      const tableData = clients.map((client) => [
        client.name,
        client.cpf || "N/A",
        client.phone,
        client.city || "N/A",
        client.email || "N/A",
      ]);

      // Tabela
      autoTable(doc, {
        startY: 35,
        head: [["Nome", "CPF", "Telefone", "Cidade", "Email"]],
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
          0: { cellWidth: 50 },  // Nome
          1: { cellWidth: 30 },  // CPF
          2: { cellWidth: 30 },  // Telefone
          3: { cellWidth: 30 },  // Cidade
          4: { cellWidth: 50 },  // Email
        },
      });

      // Salvar PDF
      doc.save(`clientes_${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "PDF exportado",
        description: `${clients.length} clientes foram exportados com sucesso.`,
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

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Dados para Excel
      const excelData = clients.map((client) => ({
        Nome: client.name,
        CPF: client.cpf || "",
        Telefone: client.phone,
        Cidade: client.city || "",
        Email: client.email || "",
        "Data de Criação": new Date(client.created_at).toLocaleDateString("pt-BR"),
      }));

      // Criar worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Definir larguras das colunas
      ws["!cols"] = [
        { wch: 30 }, // Nome
        { wch: 15 }, // CPF
        { wch: 15 }, // Telefone
        { wch: 20 }, // Cidade
        { wch: 30 }, // Email
        { wch: 15 }, // Data de Criação
      ];

      // Criar workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");

      // Salvar arquivo Excel
      XLSX.writeFile(wb, `clientes_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Excel exportado",
        description: `${clients.length} clientes foram exportados com sucesso.`,
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
        <Button variant="outline" className="gap-2" disabled={isExporting || clients.length === 0}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
          {clients.length} cliente(s) para exportar
        </div>
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
