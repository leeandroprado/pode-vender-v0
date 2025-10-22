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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('🔔 CONNECTION.UPDATE webhook received:', JSON.stringify(webhookData, null, 2));

    const { instance, state } = webhookData;
    
    if (!instance?.instanceName) {
      console.warn('⚠️ Missing instanceName in webhook');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Map Evolution API state to our status
    let status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
    
    if (state === 'open') {
      status = 'connected';
    } else if (state === 'connecting') {
      status = 'connecting';
    } else if (state === 'close') {
      status = 'disconnected';
    }

    console.log(`📱 Instance ${instance.instanceName} changed to status: ${status}`);

    // Update whatsapp_instances table
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('instance_name', instance.instanceName);

    if (updateError) {
      console.error('❌ Error updating instance status:', updateError);
      throw updateError;
    }

    console.log(`✅ Instance status updated in database`);

    // Update agent's whatsapp_connected field if connected
    if (status === 'connected') {
      const { data: instanceData } = await supabaseAdmin
        .from('whatsapp_instances')
        .select('agent_id')
        .eq('instance_name', instance.instanceName)
        .single();

      if (instanceData?.agent_id) {
        await supabaseAdmin
          .from('agents')
          .update({ whatsapp_connected: true })
          .eq('id', instanceData.agent_id);
        
        console.log(`✅ Agent ${instanceData.agent_id} marked as connected`);
      }
    }

    return new Response(JSON.stringify({ success: true, status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Error in webhook-connection-update:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
