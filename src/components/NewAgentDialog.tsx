import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;
type CreateAgentInput = {
  name: string;
  description?: string;
  model: Agent["model"];
  prompt_system: string;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAgents } from "@/hooks/useAgents";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  description: z.string().optional(),
  model: z.enum([
    "google/gemini-2.5-pro",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-flash-lite",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    "openai/gpt-5-nano",
  ]),
  prompt_system: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
});

const modelOptions = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Recomendado)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Mais Poderoso)" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Rápido)" },
  { value: "openai/gpt-5", label: "GPT-5 (Premium)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
];

interface NewAgentDialogProps {
  children: React.ReactNode;
}

export function NewAgentDialog({ children }: NewAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const { createAgent } = useAgents();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "google/gemini-2.5-flash",
      prompt_system: "Você é um assistente de atendimento profissional e prestativo. Responda sempre em português brasileiro de forma clara e objetiva.",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createAgent.mutateAsync(values as CreateAgentInput);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Configure seu novo agente de IA para atendimento automatizado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Agente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Agente de Vendas" {...field} />
                  </FormControl>
                  <FormDescription>
                    Escolha um nome descritivo para identificar este agente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Atende clientes e responde dúvidas sobre produtos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de IA *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Gemini 2.5 Flash é recomendado para melhor custo-benefício
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt do Sistema *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva como o agente deve se comportar..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define a personalidade e comportamento do agente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAgent.isPending}>
                {createAgent.isPending ? "Criando..." : "Criar Agente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
