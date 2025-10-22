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
    console.log('🔔 CONNECTION.UPDATE webhook received');
    console.log('📦 Full payload:', JSON.stringify(webhookData, null, 2));
    console.log('📱 Instance data:', JSON.stringify(webhookData.instance, null, 2));
    console.log('🔌 State:', webhookData.state || webhookData.data?.state);

    const { instance, state, data } = webhookData;
    
    // Suportar múltiplos formatos de identificador
    const instanceIdentifier = instance?.instanceName || instance?.instanceId || instance?.name;
    const webhookState = state || data?.state;
    
    if (!instanceIdentifier) {
      console.warn('⚠️ Missing instance identifier in webhook');
      console.warn('⚠️ Available instance fields:', Object.keys(instance || {}));
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (!webhookState) {
      console.warn('⚠️ Missing state in webhook');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Map Evolution API state to our status
    let status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
    
    if (webhookState === 'open') {
      status = 'connected';
    } else if (webhookState === 'connecting') {
      status = 'connecting';
    } else if (webhookState === 'close') {
      status = 'disconnected';
    }

    console.log(`📱 Instance ${instanceIdentifier} changed to status: ${status}`);

    // Update whatsapp_instances table - tentar match por instance_name OU instance_id
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .or(`instance_name.eq.${instanceIdentifier},instance_id.eq.${instanceIdentifier}`)
      .select();

    if (updateError) {
      console.error('❌ Error updating instance status:', updateError);
      throw updateError;
    }

    if (!updateData || updateData.length === 0) {
      console.warn(`⚠️ No instance found with identifier: ${instanceIdentifier}`);
      return new Response(JSON.stringify({ received: true, warning: 'Instance not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`✅ Instance status updated in database:`, updateData[0]);

    // Update agent's whatsapp_connected field if connected
    if (status === 'connected' && updateData[0]?.agent_id) {
      await supabaseAdmin
        .from('agents')
        .update({ whatsapp_connected: true })
        .eq('id', updateData[0].agent_id);
      
      console.log(`✅ Agent ${updateData[0].agent_id} marked as connected`);
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
