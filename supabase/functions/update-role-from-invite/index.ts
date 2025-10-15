import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      throw new Error('Token e userId são obrigatórios');
    }

    console.log('Atualizando role para userId:', userId, 'com token:', token);

    // Usar service role para atualizar role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar convite pelo token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      console.error('Erro ao buscar convite:', inviteError);
      throw new Error('Convite não encontrado ou já utilizado');
    }

    // Verificar se expirou
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('Convite expirado');
    }

    console.log('Convite encontrado, role a definir:', invite.role);

    // Usar UPSERT para definir o role (cria se não existe, atualiza se existe)
    const { error: upsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: invite.role,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Erro ao fazer upsert do role:', upsertError);
      throw new Error(`Falha ao definir role: ${upsertError.message}`);
    }

    console.log('Role definido com sucesso via UPSERT:', invite.role);

    // Marcar convite como aceito
    const { error: updateError } = await supabaseAdmin
      .from('invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (updateError) {
      console.error('Erro ao atualizar convite:', updateError);
    }

    console.log('Role atualizada com sucesso para:', invite.role);

    return new Response(
      JSON.stringify({ 
        success: true, 
        role: invite.role,
        message: 'Role atualizada com sucesso' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar role:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
