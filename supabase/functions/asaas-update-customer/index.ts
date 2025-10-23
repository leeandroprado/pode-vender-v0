import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
    const ASAAS_BASE_URL = 'https://sandbox.asaas.com/api/v3';

    if (!ASAAS_API_KEY) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Não autenticado');
    }

    const { customerId, cpfCnpj, phone, name } = await req.json();

    console.log('Atualizando customer no Asaas:', { customerId, cpfCnpj, phone, name });

    // Atualizar customer no Asaas
    const updateResponse = await fetch(`${ASAAS_BASE_URL}/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: name,
        cpfCnpj: cpfCnpj,
        phone: phone,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Erro ao atualizar customer no Asaas:', errorData);
      throw new Error(errorData.errors?.[0]?.description || 'Erro ao atualizar customer no Asaas');
    }

    const updatedCustomer = await updateResponse.json();
    console.log('Customer atualizado com sucesso:', updatedCustomer);

    return new Response(
      JSON.stringify({ success: true, customer: updatedCustomer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro em asaas-update-customer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
