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
    console.log('QRCODE_UPDATED webhook received:', JSON.stringify(webhookData, null, 2));

    const { instance, qrcode } = webhookData;
    
    if (!instance?.instanceId) {
      console.warn('Missing instanceId in webhook');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Extract QR code from different possible structures
    let qrBase64 = null;
    let qrText = null;

    if (qrcode?.base64) {
      qrBase64 = qrcode.base64;
      qrText = qrcode.code || qrcode.text || null;
    } else if (qrcode?.pairingCode) {
      qrBase64 = qrcode.base64 || null;
      qrText = qrcode.pairingCode;
    }

    if (!qrBase64) {
      console.log('No QR code base64 in webhook, might be pairing code only');
    }

    // Update whatsapp_instances table with QR Code
    const { error } = await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        qr_code_base64: qrBase64,
        qr_code_text: qrText,
        updated_at: new Date().toISOString(),
      })
      .eq('instance_id', instance.instanceId);

    if (error) {
      console.error('Error updating QR Code:', error);
      throw error;
    }

    console.log(`✅ QR Code updated for instance ${instance.instanceId}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in webhook-qrcode-updated:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
