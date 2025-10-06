-- Create ENUMs for cart, order and payment status
CREATE TYPE cart_status AS ENUM ('active', 'abandoned', 'converted');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');

-- Create carts table
CREATE TABLE public.carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  status cart_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carts
CREATE POLICY "Users can view carts from their conversations"
  ON public.carts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = carts.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create carts from their conversations"
  ON public.carts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = carts.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update carts from their conversations"
  ON public.carts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = carts.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to carts"
  ON public.carts FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for cart_items
CREATE POLICY "Users can view cart_items from their carts"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.conversations ON conversations.id = carts.conversation_id
      WHERE carts.id = cart_items.cart_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cart_items in their carts"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.conversations ON conversations.id = carts.conversation_id
      WHERE carts.id = cart_items.cart_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cart_items in their carts"
  ON public.cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.conversations ON conversations.id = carts.conversation_id
      WHERE carts.id = cart_items.cart_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cart_items from their carts"
  ON public.cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.conversations ON conversations.id = carts.conversation_id
      WHERE carts.id = cart_items.cart_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to cart_items"
  ON public.cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to orders"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for order_items
CREATE POLICY "Users can view order_items from their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order_items in their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to order_items"
  ON public.order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_carts_conversation_id ON public.carts(conversation_id);
CREATE INDEX idx_carts_client_id ON public.carts(client_id);
CREATE INDEX idx_carts_status ON public.carts(status);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_client_id ON public.orders(client_id);
CREATE INDEX idx_orders_conversation_id ON public.orders(conversation_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);