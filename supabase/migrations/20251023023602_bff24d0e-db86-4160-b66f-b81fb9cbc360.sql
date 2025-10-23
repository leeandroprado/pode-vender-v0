-- Permitir conversation_id como NULL em orders para suportar pedidos manuais
ALTER TABLE public.orders 
ALTER COLUMN conversation_id DROP NOT NULL;

-- Adicionar comentário para documentar o propósito
COMMENT ON COLUMN public.orders.conversation_id IS 
'ID da conversa WhatsApp associada ao pedido. NULL para pedidos manuais criados diretamente pelo sistema.';