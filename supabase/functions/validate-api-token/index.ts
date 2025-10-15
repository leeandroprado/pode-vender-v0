import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenValidationResult {
  valid: boolean;
  organization_id?: string;
  scopes?: string[];
  token_id?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Validating token:', token.substring(0, 10) + '...');

    // Buscar token no banco
    const { data: tokenData, error: tokenError } = await supabase
      .from('api_tokens')
      .select('id, organization_id, scopes, is_active, expires_at, allowed_ips, rate_limit_per_minute')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('Token validation failed:', tokenError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar expiração
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired:', tokenData.expires_at);
      return new Response(
        JSON.stringify({ valid: false, error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar IP (se configurado)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip');
    if (tokenData.allowed_ips && tokenData.allowed_ips.length > 0 && clientIp) {
      if (!tokenData.allowed_ips.includes(clientIp)) {
        console.log('IP not allowed:', clientIp);
        return new Response(
          JSON.stringify({ valid: false, error: 'IP not allowed' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Atualizar last_used_at
    await supabase
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('Token validated successfully for organization:', tokenData.organization_id);

    const result: TokenValidationResult = {
      valid: true,
      organization_id: tokenData.organization_id,
      scopes: tokenData.scopes,
      token_id: tokenData.id,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
