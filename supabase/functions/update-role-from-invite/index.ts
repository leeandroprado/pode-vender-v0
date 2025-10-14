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
      throw new Error('Convite não encontrado ou já utilizado');
    }

    // Verificar se expirou
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('Convite expirado');
    }

    // Atualizar role do usuário
    // Primeiro, deletar role padrão criada pelo trigger
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar role padrão:', deleteError);
    }

    // Inserir role do convite
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: invite.role,
      });

    if (insertError) {
      console.error('Erro ao inserir role:', insertError);
      throw insertError;
    }

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
