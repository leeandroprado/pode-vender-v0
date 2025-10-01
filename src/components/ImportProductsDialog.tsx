import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string }>;
}

export function ImportProductsDialog({
  open,
  onOpenChange,
  onImportComplete,
}: ImportProductsDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        nome: "Notebook Dell Inspiron",
        categoria: "Eletrônicos",
        preco: 3499.00,
        estoque: 12,
        status: "ativo",
        descricao: "Notebook de alto desempenho",
      },
      {
        nome: "Mouse Gamer RGB",
        categoria: "Acessórios",
        preco: 149.90,
        estoque: 45,
        status: "ativo",
        descricao: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    XLSX.writeFile(wb, "template_produtos.xlsx");

    toast({
      title: "Template baixado",
      description: "Use este arquivo como modelo para importação.",
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo .xlsx ou .csv",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        setPreviewData(json.slice(0, 5)); // Show first 5 rows as preview
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível processar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "Nenhum dado para importar",
        description: "Por favor, selecione um arquivo primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    const result: ImportResult = { success: 0, errors: [] };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Read the file again to get all data
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        for (let i = 0; i < json.length; i++) {
          const row: any = json[i];
          try {
            // Validate required fields
            if (!row.nome || !row.categoria || !row.preco || row.estoque === undefined || !row.status) {
              throw new Error("Campos obrigatórios faltando");
            }

            await supabase.from("products").insert({
              name: row.nome,
              category: row.categoria,
              price: parseFloat(row.preco),
              stock: parseInt(row.estoque),
              status: row.status,
              description: row.descricao || null,
              user_id: user.id,
            });

            result.success++;
          } catch (error: any) {
            result.errors.push({
              row: i + 2, // +2 because of header row and 0-based index
              error: error.message,
            });
          }
        }

        setImportResult(result);
        setIsImporting(false);

        if (result.success > 0) {
          toast({
            title: "Importação concluída",
            description: `${result.success} produtos importados com sucesso.`,
          });
          onImportComplete();
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar os produtos.",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setPreviewData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Produtos</DialogTitle>
          <DialogDescription>
            Faça upload de uma planilha com seus produtos ou baixe o template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Baixar Planilha Modelo</h3>
                <p className="text-sm text-muted-foreground">
                  Use como referência para suas importações
                </p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Clique para selecionar um arquivo
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: .xlsx, .csv (máx. 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Prévia dos Dados (primeiras 5 linhas)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Nome</th>
                          <th className="px-4 py-2 text-left">Categoria</th>
                          <th className="px-4 py-2 text-left">Preço</th>
                          <th className="px-4 py-2 text-left">Estoque</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row: any, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{row.nome}</td>
                            <td className="px-4 py-2">{row.categoria}</td>
                            <td className="px-4 py-2">R$ {row.preco}</td>
                            <td className="px-4 py-2">{row.estoque}</td>
                            <td className="px-4 py-2">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {importResult.success} produtos importados com sucesso
                  </span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {importResult.errors.length} erros encontrados:
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index}>
                          Linha {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            {previewData.length > 0 && !importResult && (
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar Produtos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
