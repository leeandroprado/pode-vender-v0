import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./CodeBlock";

interface ResponseExample {
  status: number;
  description: string;
  body: string;
}

interface ApiResponseExampleProps {
  examples: ResponseExample[];
}

export function ApiResponseExample({ examples }: ApiResponseExampleProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Exemplos de Resposta</h4>
      <Tabs defaultValue={examples[0]?.status.toString()}>
        <TabsList>
          {examples.map((example) => (
            <TabsTrigger key={example.status} value={example.status.toString()}>
              {example.status} {example.description}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => (
          <TabsContent key={example.status} value={example.status.toString()}>
            <CodeBlock code={example.body} language="json" />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
