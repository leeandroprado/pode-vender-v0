import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiEndpointCardProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

const methodColors = {
  GET: "bg-blue-500 hover:bg-blue-600",
  POST: "bg-green-500 hover:bg-green-600",
  PUT: "bg-yellow-500 hover:bg-yellow-600",
  DELETE: "bg-red-500 hover:bg-red-600",
};

export function ApiEndpointCard({ method, path, title, description, children }: ApiEndpointCardProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Badge className={`${methodColors[method]} text-white font-mono`}>
            {method}
          </Badge>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{path}</code>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
