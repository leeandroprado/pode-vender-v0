import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    console.log('Deletando usuário:', userId);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se quem está chamando é admin/super_admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      throw new Error('Não autorizado');
    }

    // Não pode deletar a si mesmo
    if (caller.id === userId) {
      throw new Error('Você não pode deletar sua própria conta');
    }

    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (!callerRole || (callerRole.role !== 'admin' && callerRole.role !== 'super_admin')) {
      throw new Error('Apenas administradores podem deletar usuários');
    }

    // Verificar se é o último super_admin
    const { data: superAdmins } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    if (superAdmins?.length === 1 && superAdmins[0].user_id === userId) {
      throw new Error('Não é possível deletar o último super administrador');
    }

    // Deletar usuário (cascade delete automático para profiles e user_roles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }

    console.log('Usuário deletado com sucesso');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
