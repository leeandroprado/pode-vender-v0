import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agentId } = await req.json();

    if (!agentId) {
      return new Response(JSON.stringify({ error: "Agent ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agent details
    const { data: agent, error: agentError } = await supabaseClient
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get WhatsApp instance
    const { data: instance, error: instanceError } = await supabaseClient
      .from("whatsapp_instances")
      .select("*")
      .eq("agent_id", agentId)
      .maybeSingle();

    if (instanceError) {
      console.error("Error fetching instance:", instanceError);
      return new Response(JSON.stringify({ error: instanceError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!instance) {
      return new Response(JSON.stringify({ error: "WhatsApp instance not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate instance hash
    if (!instance.hash) {
      return new Response(JSON.stringify({ error: "Instance hash not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get base URL from system_settings
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: settingsData } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_category', 'apizap')
      .eq('setting_key', 'base_url')
      .maybeSingle();

    const baseUrl = settingsData?.setting_value || 'https://application.wpp.imidiahouse.com.br';
    console.log("Using API base URL:", baseUrl);

    // Disconnect via Apizap API
    console.log("Disconnecting instance:", instance.instance_name);
    const disconnectResponse = await fetch(
      `${baseUrl}/instance/logout/${instance.instance_name}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": instance.hash,
        },
      }
    );

    if (!disconnectResponse.ok) {
      const errorText = await disconnectResponse.text();
      console.error("Apizap disconnect error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to disconnect from Apizap",
          details: errorText
        }),
        {
          status: disconnectResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update instance status in database
    const { error: updateError } = await supabaseClient
      .from("whatsapp_instances")
      .update({ 
        status: "disconnected",
        qr_code_text: null,
        qr_code_base64: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", instance.id);

    if (updateError) {
      console.error("Error updating instance:", updateError);
    }

    // Update agent
    await supabaseClient
      .from("agents")
      .update({ 
        whatsapp_connected: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", agentId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "WhatsApp disconnected successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in whatsapp-disconnect-instance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
