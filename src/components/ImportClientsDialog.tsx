import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useClients, Client } from "@/hooks/useClients";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type ImportContact = Omit<Client, "id" | "user_id" | "created_at" | "updated_at">;

export function ImportClientsDialog({ open, onOpenChange, onImportComplete }: ImportClientsDialogProps) {
  const [activeTab, setActiveTab] = useState<"spreadsheet" | "whatsapp">("spreadsheet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ImportContact[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [importResult, setImportResult] = useState<{ success: number; errors: string[]; stats?: { fetched: number; valid: number; invalid: number } } | null>(null);

  const { importClientsFromSpreadsheet, importClientsFromWhatsApp } = useClients();
  const { agents } = useAgents();

  // Filtrar apenas agentes com WhatsApp conectado
  const whatsappAgents = agents.filter(agent => agent.status === 'active');

  const downloadTemplate = () => {
    const template = [
      { nome: "João Silva", telefone: "11999999999", email: "joao@email.com", cpf: "12345678900", cidade: "São Paulo" },
      { nome: "Maria Santos", telefone: "11988888888", email: "maria@email.com", cpf: "98765432100", cidade: "Rio de Janeiro" },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "template_clientes.xlsx");
    toast.success("Template baixado com sucesso!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 5MB");
      return;
    }

    // Validar extensão
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Formato inválido. Use .xlsx, .xls ou .csv");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const contacts: ImportContact[] = jsonData.map((row: any) => ({
        name: row.nome || row.name || "",
        phone: String(row.telefone || row.phone || "").replace(/\D/g, ""),
        email: row.email || null,
        cpf: row.cpf ? String(row.cpf).replace(/\D/g, "") : null,
        city: row.cidade || row.city || null,
      })).filter(c => c.name && c.phone);

      if (contacts.length === 0) {
        toast.error("Nenhum contato válido encontrado na planilha");
        setPreviewData([]);
      } else {
        setPreviewData(contacts);
        toast.success(`${contacts.length} contatos encontrados para importação`);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Erro ao ler arquivo. Verifique o formato.");
      setPreviewData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportSpreadsheet = async () => {
    if (previewData.length === 0) {
      toast.error("Nenhum contato para importar");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await importClientsFromSpreadsheet.mutateAsync(previewData);
      setImportResult(result);
      
      if (result.success > 0) {
        toast.success(`${result.success} contatos importados com sucesso!`);
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} contatos com erros`);
      }

      // Limpar preview após sucesso
      setTimeout(() => {
        setPreviewData([]);
        setImportResult(null);
        onImportComplete();
      }, 3000);
    } catch (error) {
      toast.error("Erro ao importar contatos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchWhatsAppContacts = async () => {
    if (!selectedAgentId) {
      toast.error("Selecione um agente");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await importClientsFromWhatsApp.mutateAsync(selectedAgentId);
      setPreviewData(result.contacts);
      
      // Mostrar estatísticas se disponíveis
      if (result.stats) {
        toast.success(`${result.stats.valid} contatos válidos encontrados!`);
        if (result.stats.invalid > 0) {
          toast.warning(`${result.stats.invalid} contatos ignorados (sem telefone válido)`);
        }
      } else {
        toast.success(`${result.contacts.length} contatos encontrados do WhatsApp!`);
      }
    } catch (error) {
      toast.error("Erro ao buscar contatos do WhatsApp");
      setPreviewData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportWhatsApp = async () => {
    if (previewData.length === 0) {
      toast.error("Nenhum contato para importar");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await importClientsFromSpreadsheet.mutateAsync(previewData);
      setImportResult({
        success: result.success,
        errors: result.errors,
      });
      
      if (result.success > 0) {
        toast.success(`${result.success} contatos importados com sucesso!`);
      }

      setTimeout(() => {
        setPreviewData([]);
        setImportResult(null);
        onImportComplete();
      }, 3000);
    } catch (error) {
      toast.error("Erro ao importar contatos");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Contatos</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spreadsheet" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Via Planilha
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Via WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spreadsheet" className="flex-1 space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Template de Importação</h4>
                    <p className="text-sm text-muted-foreground">
                      Baixe o modelo e preencha com seus dados
                    </p>
                  </div>
                  <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload de Arquivo (.xlsx, .csv)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo 5MB - Formatos: .xlsx, .csv
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {previewData.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">
                    Preview ({previewData.length} contatos)
                  </h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {previewData.slice(0, 10).map((contact, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                          </div>
                          {contact.city && (
                            <span className="text-xs text-muted-foreground">{contact.city}</span>
                          )}
                        </div>
                      ))}
                      {previewData.length > 10 && (
                        <p className="text-xs text-center text-muted-foreground py-2">
                          + {previewData.length - 10} contatos
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {importResult && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">
                      {importResult.success} contatos importados com sucesso!
                    </p>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {importResult.errors.length} com erros
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImportSpreadsheet} 
                disabled={previewData.length === 0 || isProcessing}
                className="gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Importar {previewData.length > 0 && `(${previewData.length})`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="flex-1 space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-select">Selecione o Agente WhatsApp</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger id="agent-select">
                      <SelectValue placeholder="Escolha um agente com WhatsApp conectado" />
                    </SelectTrigger>
                    <SelectContent>
                      {whatsappAgents.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum agente com WhatsApp conectado
                        </SelectItem>
                      ) : (
                        whatsappAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleFetchWhatsAppContacts} 
                  disabled={!selectedAgentId || isProcessing}
                  className="w-full gap-2"
                  variant="outline"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Smartphone className="h-4 w-4" />
                  Buscar Contatos do WhatsApp
                </Button>
              </CardContent>
            </Card>

            {previewData.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">
                    Contatos Encontrados ({previewData.length})
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {previewData.map((contact, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {importResult && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">
                      {importResult.success} contatos importados com sucesso!
                    </p>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {importResult.errors.length} contatos com erros
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImportWhatsApp} 
                disabled={previewData.length === 0 || isProcessing}
                className="gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Importar {previewData.length > 0 && `(${previewData.length})`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
