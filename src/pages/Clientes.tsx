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
import { Plus, Search, MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Clientes() {
  const isMobile = useIsMobile();
  
  const clients = [
    { name: "João Silva", cpf: "123.456.789-00", phone: "(11) 98765-4321", city: "São Paulo", purchases: 5 },
    { name: "Maria Santos", cpf: "987.654.321-00", phone: "(21) 91234-5678", city: "Rio de Janeiro", purchases: 12 },
    { name: "Pedro Costa", cpf: "456.789.123-00", phone: "(31) 99876-5432", city: "Belo Horizonte", purchases: 3 },
    { name: "Ana Oliveira", cpf: "321.654.987-00", phone: "(41) 98765-1234", city: "Curitiba", purchases: 8 },
    { name: "Carlos Pereira", cpf: "789.123.456-00", phone: "(51) 91234-9876", city: "Porto Alegre", purchases: 15 },
  ];
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar clientes..." className="pl-10" />
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-3">
              {clients.map((client, index) => (
                <Card key={index}>
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
                          <p className="text-xs text-muted-foreground">{client.city}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPF:</span>
                        <span className="font-medium">{client.cpf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{client.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compras:</span>
                        <span className="font-bold text-primary">{client.purchases}</span>
                      </div>
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
                    <TableHead>Compras</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={index}>
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
                      <TableCell>{client.cpf}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>
                        <span className="font-medium">{client.purchases}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
