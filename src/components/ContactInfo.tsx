import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Bell, Pin, Settings, X, Mail, MapPin, CreditCard, Calendar, Edit2, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClients } from "@/hooks/useClients";
import { EditClientDialog } from "@/components/EditClientDialog";
import { useVendedores } from "@/hooks/useVendedores";
import { useUserRole } from "@/hooks/useUserRole";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ContactInfoProps {
  conversationPhone: string;
  clientName: string | null;
  clientId: string | null;
  conversationId: string;
  assignedTo: string | null;
  assignedName: string | null;
  onAssignVendedor: (conversationId: string, userId: string | null) => void;
  onClose: () => void;
}

export const ContactInfo = ({ 
  conversationPhone, 
  clientName,
  clientId,
  conversationId,
  assignedTo,
  assignedName,
  onAssignVendedor,
  onClose 
}: ContactInfoProps) => {
  const { clients, updateClient } = useClients();
  const { vendedores, isLoading: isLoadingVendedores } = useVendedores();
  const { isAdmin } = useUserRole();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const displayName = clientName || conversationPhone;
  
  // Buscar dados completos do cliente
  const clientData = clients.find(c => c.id === clientId);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Informações</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Avatar e nome */}
      <div className="p-6 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarFallback className="bg-primary/10 text-2xl">
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-xl mb-1">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{conversationPhone}</p>
      </div>

      <Separator />

      {/* Botões de ação */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Bell className="w-5 h-5" />
          <span className="text-xs">Notificar</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Pin className="w-5 h-5" />
          <span className="text-xs">Fixar</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Settings className="w-5 h-5" />
          <span className="text-xs">Config</span>
        </Button>
      </div>

      <Separator />

      {/* Seção de Atribuição de Vendedor - Apenas para admins */}
      {isAdmin && (
        <>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="vendedor-assignment" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Vendedor Responsável</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Badge do vendedor atual */}
                  {assignedTo && assignedName && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Atribuído para</p>
                        <Badge variant="secondary" className="mt-1">
                          {assignedName}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Select de vendedores */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Alterar vendedor responsável
                    </label>
                    <Select
                      value={assignedTo || "unassigned"}
                      onValueChange={(value) =>
                        onAssignVendedor(conversationId, value === "unassigned" ? null : value)
                      }
                      disabled={isLoadingVendedores}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um vendedor" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="unassigned">
                          Sem vendedor
                        </SelectItem>
                        {vendedores.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.full_name || v.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Informação adicional */}
                  {!assignedTo && (
                    <p className="text-xs text-muted-foreground">
                      Esta conversa não está atribuída a nenhum vendedor
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
        </>
      )}

      {/* Área de dados do cliente */}
      <div className="flex-1 overflow-y-auto">
        {clientData ? (
          <Accordion type="single" collapsible defaultValue="client-data" className="w-full">
            <AccordionItem value="client-data" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Dados do Cliente</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Nome */}
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm font-medium truncate">{clientData.name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  {clientData.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm break-all">{clientData.email}</p>
                      </div>
                    </div>
                  )}

                  {/* CPF */}
                  {clientData.cpf && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">CPF</p>
                        <p className="text-sm">{clientData.cpf}</p>
                      </div>
                    </div>
                  )}

                  {/* Cidade */}
                  {clientData.city && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Cidade</p>
                        <p className="text-sm">{clientData.city}</p>
                      </div>
                    </div>
                  )}

                  {/* Data de cadastro */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Cliente desde</p>
                      <p className="text-sm">
                        {format(new Date(clientData.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Botão editar */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Dados
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum cliente vinculado a esta conversa
            </p>
          </div>
        )}
      </div>

      {/* Dialog de edição */}
      {clientData && (
        <EditClientDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          client={clientData}
          onUpdate={async (id, data) => {
            await updateClient.mutateAsync({ id, ...data });
          }}
        />
      )}
    </div>
  );
};
