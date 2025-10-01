import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log('Getting instance status for user:', user.id);

    // Parse request body
    const { agentId } = await req.json();

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    console.log('Agent ID:', agentId);

    // Get instance from database
    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .single();

    if (instanceError || !instance) {
      throw new Error('Instance not found');
    }

    console.log('Instance found:', instance.instance_name);

    // Get Apizap API key
    const apizapApiKey = Deno.env.get('APIZAP_API_KEY');
    if (!apizapApiKey) {
      throw new Error('APIZAP_API_KEY not configured');
    }

    // Call Apizap API to get instance status
    const apizapResponse = await fetch(
      `https://api.apizap.tech/instance/connectionState/${instance.instance_name}`,
      {
        method: 'GET',
        headers: {
          'apikey': apizapApiKey,
        },
      }
    );

    if (!apizapResponse.ok) {
      const errorText = await apizapResponse.text();
      console.error('Apizap API error:', errorText);
      throw new Error(`Failed to get instance status: ${errorText}`);
    }

    const statusData = await apizapResponse.json();
    console.log('Status from API:', statusData);

    // Map API status to our enum
    let newStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
    
    // Check if instance object exists and has state property
    if (statusData.instance && statusData.instance.state) {
      if (statusData.instance.state === 'open') {
        newStatus = 'connected';
      } else if (statusData.instance.state === 'connecting') {
        newStatus = 'connecting';
      } else if (statusData.instance.state === 'close') {
        newStatus = 'disconnected';
      }
      console.log('Mapped status:', newStatus);
    } else {
      console.error('Invalid status data structure:', statusData);
    }

    // Update instance status in database
    const { data: updatedInstance, error: updateError } = await supabase
      .from('whatsapp_instances')
      .update({ status: newStatus })
      .eq('id', instance.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update instance status:', updateError);
    }

    // If connected, update agent's whatsapp_connected field
    if (newStatus === 'connected') {
      await supabase
        .from('agents')
        .update({ whatsapp_connected: true })
        .eq('id', agentId);
      
      console.log('Agent marked as connected');
    }

    return new Response(
      JSON.stringify({
        success: true,
        instance: updatedInstance || instance,
        status: newStatus,
        apiStatus: statusData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-get-instance-status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
