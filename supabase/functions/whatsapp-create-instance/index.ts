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

// Helper function to fetch existing instance from ApiZap
async function fetchInstanceFromApizap(instanceName: string, apiKey: string, baseUrl: string): Promise<any | null> {
  try {
    const response = await fetch(`${baseUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // ApiZap returns array of instances, find the one with matching name
    if (Array.isArray(data) && data.length > 0) {
      return data.find((inst: any) => inst.instance.instanceName === instanceName);
    }
    return null;
  } catch (error) {
    console.error('Error fetching instance from ApiZap:', error);
    return null;
  }
}

// Helper function to get QR code from existing instance
async function getQRCodeFromApizap(instanceName: string, apiKey: string, baseUrl: string): Promise<any | null> {
  try {
    const response = await fetch(`${baseUrl}/instance/qrcode/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching QR code from ApiZap:', error);
    return null;
  }
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

    // Check if instance already exists in our database for this agent
    const { data: existingInstance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (existingInstance) {
      console.log('Instance already exists in database, returning existing instance');
      return new Response(
        JSON.stringify({
          success: true,
          instance: existingInstance,
          message: 'Instance already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate instance name using agent ID
    const instanceName = `agent_${agentId}`;

    console.log('Checking for instance with name:', instanceName);

    // Get Apizap API key from environment
    const apizapApiKey = Deno.env.get('APIZAP_API_KEY');
    if (!apizapApiKey) {
      throw new Error('APIZAP_API_KEY not configured');
    }

    console.log('Fetching system settings...');

    // Fetch system settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('setting_category', 'apizap');

    if (settingsError) {
      console.error('Error fetching system settings:', settingsError);
      throw new Error('Failed to fetch system settings');
    }

    // Transform settings array into object
    const settings: Record<string, string> = {};
    settingsData?.forEach((setting) => {
      settings[setting.setting_key] = setting.setting_value || '';
    });

    const baseUrl = settings.base_url || 'https://api.apizap.tech';

    // Check if instance already exists in ApiZap
    console.log('Checking if instance exists in ApiZap...');
    const existingApizapInstance = await fetchInstanceFromApizap(instanceName, apizapApiKey, baseUrl);

    if (existingApizapInstance) {
      console.log('Instance found in ApiZap, recovering it...');
      
      // Get QR code from existing instance
      const qrCodeData = await getQRCodeFromApizap(instanceName, apizapApiKey, baseUrl);
      
      // Save the recovered instance to our database
      const { data: recoveredInstance, error: insertError } = await supabase
        .from('whatsapp_instances')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          instance_name: instanceName,
          instance_id: existingApizapInstance.instance.instanceId,
          hash: existingApizapInstance.hash,
          status: existingApizapInstance.instance.status || 'connecting',
          qr_code_base64: qrCodeData?.qrcode?.base64 || existingApizapInstance.qrcode?.base64,
          qr_code_text: qrCodeData?.qrcode?.code || existingApizapInstance.qrcode?.code,
          integration: existingApizapInstance.instance.integration,
          settings: existingApizapInstance.settings,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error while recovering:', insertError);
        throw new Error(`Failed to save recovered instance: ${insertError.message}`);
      }

      console.log('Recovered instance saved to database:', recoveredInstance.id);

      return new Response(
        JSON.stringify({
          success: true,
          instance: recoveredInstance,
          message: 'Instance recovered from ApiZap'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating new WhatsApp instance with ApiZap...');

    // Generate unique token for this instance
    const tokenPrefix = settings.token_prefix || 'apizap_token_';
    const uniqueToken = `${tokenPrefix}${agentId}_${Date.now()}`;
    
    console.log('Generated token for instance (prefix only):', tokenPrefix);

    console.log('Checking WhatsApp phone configuration...');

    // Build request body exactly as per ApiZap curl example
    const requestBody: any = {
      instanceName,
      integration: settings.default_integration || 'WHATSAPP-BAILEYS',
      qrcode: settings.qrcode_enabled === 'true',
      rejectCall: settings.reject_call === 'true',
      groupsIgnore: settings.groups_ignore === 'true',
      syncFullHistory: settings.sync_full_history === 'true',
    };

    // Always add webhook when webhook_enabled is true
    const webhookEnabled = settings.webhook_enabled === 'true';
    console.log('Webhook enabled:', webhookEnabled);
    
    if (webhookEnabled) {
      if (!settings.webhook_url) {
        throw new Error('Webhook URL is required when webhook is enabled');
      }
      
      // Build headers object in the format ApiZap expects: { "Header-Name": "value" }
      const webhookHeaders: Record<string, string> = {
        'Content-Type': settings.webhook_content_type || 'application/json',
      };
      
      // Add authorization header only if it has a value
      if (settings.webhook_auth_header && settings.webhook_auth_header.trim() !== '') {
        webhookHeaders['authorization'] = settings.webhook_auth_header;
      }
      
      requestBody.webhook = {
        url: settings.webhook_url,
        headers: webhookHeaders,
        events: ['MESSAGES_UPSERT'],
      };
      
      console.log('Webhook configured with URL:', settings.webhook_url);
      console.log('Webhook headers object:', JSON.stringify(webhookHeaders));
    } else {
      console.log('Webhook is disabled in system settings');
    }

    const createEndpoint = settings.create_instance_endpoint || '/instance/create';

    // Log complete request body for debugging (excluding sensitive token)
    const debugBody = { ...requestBody };
    if (debugBody.token) {
      debugBody.token = '[REDACTED]';
    }
    console.log('Complete request body:', JSON.stringify(debugBody, null, 2));

    // Call Apizap API to create instance
    const apizapResponse = await fetch(`${baseUrl}${createEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apizapApiKey,
      },
      body: JSON.stringify(requestBody),
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
