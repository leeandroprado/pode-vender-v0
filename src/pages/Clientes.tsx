import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreVertical, Pencil, Trash2, UserX } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClients, Client } from "@/hooks/useClients";
import { AddClientDialog } from "@/components/AddClientDialog";
import { EditClientDialog } from "@/components/EditClientDialog";

export default function Clientes() {
  const isMobile = useIsMobile();
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.cpf?.toLowerCase().includes(search) ||
      client.city?.toLowerCase().includes(search)
    );
  });

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      await deleteClient.mutateAsync(selectedClient.id);
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Client>) => {
    await updateClient.mutateAsync({ id, ...data });
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar clientes..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente buscar com outros termos" 
                  : "Comece adicionando seu primeiro cliente"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
              )}
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-base">{client.name}</h3>
                          <p className="text-xs text-muted-foreground">{client.city || "N/A"}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(client)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPF:</span>
                        <span className="font-medium">{client.cpf || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-xs">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.cpf || "N/A"}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.city || "N/A"}</TableCell>
                      <TableCell className="text-sm">{client.email || "N/A"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(client)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onClientAdded={() => setAddDialogOpen(false)}
      />

      {selectedClient && (
        <EditClientDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          client={selectedClient}
          onUpdate={handleUpdate}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{selectedClient?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
