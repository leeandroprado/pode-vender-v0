import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inviteSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  role: z.enum(["admin", "member"], { required_error: "Selecione uma função." }),
});

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const { profile } = useAuth();
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" },
  });

  const log = (level: 'info' | 'error', message: string, details?: object) => {
    if (profile?.organization_id) {
      logActivity({ organization_id: profile.organization_id, level, message, details });
    }
  };

  const inviteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof inviteSchema>) => {
      log('info', 'Tentativa de convite iniciada', values);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão não encontrada. Faça login novamente.");

      const { error, data } = await supabase.functions.invoke("invite-user", {
        body: values,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        log('error', 'Erro ao invocar função de convite', { error: error.message });
        throw new Error(error.message);
      }

      if (data?.error) {
        log('error', 'Erro retornado pela função de convite', { error: data.error });
        throw new Error(data.error);
      }
    },
    onSuccess: (_, variables) => {
      log('info', 'Convite enviado com sucesso', { email: variables.email });
      toast.success("Convite enviado!", { description: "O usuário receberá um e-mail para se juntar à sua organização." });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      log('error', 'Falha na mutação de convite', { error: error.message });
      toast.error("Erro ao enviar convite", { description: error.message });
    },
  });

  const onSubmit = (values: z.infer<typeof inviteSchema>) => {
    inviteMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            O usuário receberá um e-mail com um link para criar sua conta e se juntar à sua organização.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
