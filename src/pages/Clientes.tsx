import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Plus, Search, MoreVertical, Pencil, Trash2, UserX, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClients, Client } from "@/hooks/useClients";
import { AddClientDialog } from "@/components/AddClientDialog";
import { EditClientDialog } from "@/components/EditClientDialog";
import { ImportClientsDialog } from "@/components/ImportClientsDialog";
import { ExportClientsDropdown } from "@/components/ExportClientsDropdown";
import { useQueryClient } from "@tanstack/react-query";

export default function Clientes() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.cpf?.toLowerCase().includes(search) ||
      client.city?.toLowerCase().includes(search)
    );
  });

  // Resetar para primeira página quando buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calcular índices de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            className="gap-2 flex-1 sm:flex-initial"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <ExportClientsDropdown clients={filteredClients} />
          <Button 
            className="gap-2 flex-1 sm:flex-initial"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
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
              {currentClients.map((client) => (
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
                  {currentClients.map((client) => (
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

          {/* Paginação */}
          {filteredClients.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
              {/* Info de registros */}
              <div className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredClients.length)}
                </span>{" "}
                de <span className="font-medium">{filteredClients.length}</span> clientes
              </div>

              <div className="flex items-center gap-4">
                {/* Seletor de itens por página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Por página:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Controles de navegação */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {/* Números de página (apenas desktop) */}
                    {!isMobile && (
                      <>
                        {[...Array(totalPages)].map((_, idx) => {
                          const pageNumber = idx + 1;
                          // Mostrar apenas páginas próximas
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNumber)}
                                  isActive={currentPage === pageNumber}
                                  className="cursor-pointer"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <PaginationEllipsis key={pageNumber} />;
                          }
                          return null;
                        })}
                      </>
                    )}

                    {/* Indicador mobile */}
                    {isMobile && (
                      <PaginationItem>
                        <span className="text-sm px-4">
                          {currentPage} / {totalPages}
                        </span>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        className={
                          currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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

      <ImportClientsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={() => {
          setImportDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["clients"] });
        }}
      />

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
