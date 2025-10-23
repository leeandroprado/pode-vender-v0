import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const paymentDataSchema = z.object({
  cpf_cnpj: z.string()
    .min(11, "CPF/CNPJ inválido")
    .max(18, "CPF/CNPJ inválido")
    .regex(/^[\d.-]+$/, "Digite apenas números, pontos e traços"),
  phone: z.string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .regex(/^[\d\s()+-]+$/, "Digite apenas números e símbolos de telefone"),
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
});

type PaymentDataForm = z.infer<typeof paymentDataSchema>;

interface PaymentDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PaymentDataDialog({ open, onOpenChange, onSuccess }: PaymentDataDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();

  const form = useForm<PaymentDataForm>({
    resolver: zodResolver(paymentDataSchema),
    defaultValues: {
      cpf_cnpj: "",
      phone: profile?.phone || "",
      full_name: profile?.full_name || "",
    },
  });

  const onSubmit = async (data: PaymentDataForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          cpf_cnpj: data.cpf_cnpj.replace(/[^\d]/g, ""), // Remove formatação
          phone: data.phone.replace(/[^\d]/g, ""),
          full_name: data.full_name,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast({
        title: "Dados salvos com sucesso!",
        description: "Agora você pode selecionar um plano pago.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro ao salvar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 10) {
      // (00) 0000-0000
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      // (00) 00000-0000
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dados para Pagamento</DialogTitle>
          <DialogDescription>
            Para contratar um plano pago, precisamos de algumas informações adicionais.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf_cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF ou CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      onChange={(e) => {
                        const formatted = formatCpfCnpj(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="(00) 00000-0000"
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar e Continuar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
