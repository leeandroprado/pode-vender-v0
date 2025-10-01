import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApizapCreateResponse {
  instance: {
    instanceName: string;
    instanceId: string;
    integration: string;
    webhookWaBusiness: string | null;
    accessTokenWaBusiness: string;
    status: string;
  };
  hash: string;
  webhook: Record<string, any>;
  websocket: Record<string, any>;
  rabbitmq: Record<string, any>;
  nats: Record<string, any>;
  sqs: Record<string, any>;
  settings: {
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
    wavoipToken: string;
  };
  qrcode: {
    pairingCode: string | null;
    code: string;
    base64: string;
    count: number;
  };
}

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

    console.log('Creating WhatsApp instance for user:', user.id);

    // Parse request body
    const { agentId } = await req.json();

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    console.log('Agent ID:', agentId);

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or access denied');
    }

    console.log('Agent found:', agent.name);

    // Check if instance already exists for this agent
    const { data: existingInstance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (existingInstance) {
      console.log('Instance already exists, returning existing instance');
      return new Response(
        JSON.stringify({
          success: true,
          instance: existingInstance,
          message: 'Instance already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique instance name
    const instanceName = `agent_${agentId.slice(0, 8)}_${Date.now()}`;

    console.log('Creating instance with name:', instanceName);

    // Get Apizap API key from environment
    const apizapApiKey = Deno.env.get('APIZAP_API_KEY');
    if (!apizapApiKey) {
      throw new Error('APIZAP_API_KEY not configured');
    }

    // Call Apizap API to create instance
    const apizapResponse = await fetch('https://api.apizap.tech/instance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apizapApiKey,
      },
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
        rejectCall: true,
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: false,
        syncFullHistory: true,
      }),
    });

    if (!apizapResponse.ok) {
      const errorText = await apizapResponse.text();
      console.error('Apizap API error:', errorText);
      throw new Error(`Failed to create instance: ${errorText}`);
    }

    const apizapData: ApizapCreateResponse = await apizapResponse.json();
    console.log('Instance created successfully:', apizapData.instance.instanceId);

    // Save instance to database
    const { data: newInstance, error: insertError } = await supabase
      .from('whatsapp_instances')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        instance_name: instanceName,
        instance_id: apizapData.instance.instanceId,
        hash: apizapData.hash,
        status: apizapData.instance.status === 'connecting' ? 'connecting' : 'disconnected',
        qr_code_base64: apizapData.qrcode.base64,
        qr_code_text: apizapData.qrcode.code,
        integration: apizapData.instance.integration,
        settings: apizapData.settings,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save instance: ${insertError.message}`);
    }

    console.log('Instance saved to database:', newInstance.id);

    return new Response(
      JSON.stringify({
        success: true,
        instance: newInstance,
        message: 'Instance created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-create-instance:', error);
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
