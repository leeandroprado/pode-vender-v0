import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;
type UpdateAgentInput = {
  id: string;
  name?: string;
  description?: string;
  model?: Agent["model"];
  prompt_system?: string;
  status?: Agent["status"];
  whatsapp_phone?: string;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    "x-ai/grok-code-fast-1",
    "x-ai/grok-4-fast:free",
    "google/gemini-2.5-pro",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-flash-lite",
    "deepseek/deepseek-chat-v3-0324",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    "openai/gpt-5-nano",
  ]),
  prompt_system: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
  status: z.enum(["active", "inactive", "maintenance"]),
  whatsapp_phone: z.string().optional(),
});

const modelOptions = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Recomendado)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Mais Poderoso)" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Rápido)" },
  { value: "x-ai/grok-code-fast-1", label: "Grok Code Fast 1 (Código Rápido)" },
  { value: "x-ai/grok-4-fast:free", label: "Grok 4 Fast (Gratuito)" },
  { value: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek V3 (Econômico)" },
  { value: "openai/gpt-5", label: "GPT-5 (Premium)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
];

interface ConfigureAgentDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureAgentDialog({ agent, open, onOpenChange }: ConfigureAgentDialogProps) {
  const { updateAgent, deleteAgent } = useAgents();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "google/gemini-2.5-flash",
      prompt_system: "",
      status: "active",
      whatsapp_phone: "",
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        description: agent.description || "",
        model: agent.model as any,
        prompt_system: agent.prompt_system,
        status: agent.status === "training" ? "maintenance" : agent.status,
        whatsapp_phone: agent.whatsapp_phone || "",
      });
    }
  }, [agent, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!agent) return;
    await updateAgent.mutateAsync({ id: agent.id, ...values } as UpdateAgentInput);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!agent) return;
    await deleteAgent.mutateAsync(agent.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Agente</DialogTitle>
          <DialogDescription>
            Edite as configurações do seu agente de IA
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
                    <Input placeholder="Breve descrição do agente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: +55 11 98765-4321" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número conectado ao WhatsApp Business
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

            <div className="flex gap-3 justify-between pt-4 border-t">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                Excluir Agente
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAgent.isPending}>
                  {updateAgent.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agente "{agent?.name}" será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAgent.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
