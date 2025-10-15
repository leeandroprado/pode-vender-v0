import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface ApiParameterTableProps {
  parameters: Parameter[];
  title?: string;
}

const typeColors: Record<string, string> = {
  string: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  number: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  boolean: "bg-green-500/10 text-green-700 dark:text-green-300",
  object: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  array: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
};

export function ApiParameterTable({ parameters, title = "Parâmetros" }: ApiParameterTableProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Nome</TableHead>
              <TableHead className="w-[15%]">Tipo</TableHead>
              <TableHead className="w-[15%]">Obrigatório</TableHead>
              <TableHead className="w-[45%]">Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((param) => (
              <TableRow key={param.name}>
                <TableCell className="font-mono text-sm">{param.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeColors[param.type] || "bg-gray-500/10"}>
                    {param.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {param.required ? (
                    <Badge variant="destructive">Sim</Badge>
                  ) : (
                    <Badge variant="secondary">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {param.description}
                  {param.default && (
                    <span className="block mt-1 text-xs">
                      Padrão: <code className="bg-muted px-1 py-0.5 rounded">{param.default}</code>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
