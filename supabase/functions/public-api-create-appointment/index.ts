import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('=== Create Appointment Request ===');
    
    // 1. Validar token
    const tokenValidation = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-api-token`, {
      headers: { 'Authorization': req.headers.get('Authorization') || '' },
    });

    if (!tokenValidation.ok) {
      console.error('Token validation failed');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { organization_id, scopes, token_id } = await tokenValidation.json();
    console.log('Token validated for organization:', organization_id);

    if (!scopes.includes('write:appointments') && !scopes.includes('admin:all')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse body
    const body = await req.json();
    const { agenda_id, start_time, end_time, client_name, client_phone, client_email, title, description } = body;

    if (!agenda_id || !start_time || !end_time || !client_phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agenda_id, start_time, end_time, client_phone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request data:', { agenda_id, start_time, end_time, client_phone });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Verificar se agenda pertence à organização
    const { data: agenda } = await supabase
      .from('agendas')
      .select('user_id, organization_id')
      .eq('id', agenda_id)
      .eq('organization_id', organization_id)
      .single();

    if (!agenda) {
      return new Response(
        JSON.stringify({ error: 'Agenda not found or not accessible' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verificar conflitos
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('agenda_id', agenda_id)
      .neq('status', 'cancelled')
      .lte('start_time', end_time)
      .gte('end_time', start_time);

    if (existingAppointments && existingAppointments.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Time slot already booked' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Criar ou buscar cliente
    let clientId = null;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', client_phone)
      .eq('organization_id', organization_id)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
      console.log('Using existing client:', clientId);
    } else if (client_name) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: client_name,
          phone: client_phone,
          email: client_email || null,
          user_id: agenda.user_id,
          organization_id: organization_id,
        })
        .select()
        .single();
      
      if (clientError) {
        console.error('Error creating client:', clientError);
      } else {
        clientId = newClient?.id;
        console.log('Created new client:', clientId);
      }
    }

    // 6. Criar agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        agenda_id,
        start_time,
        end_time,
        client_id: clientId,
        title: title || client_name || 'Agendamento via API',
        description: description || '',
        user_id: agenda.user_id,
        organization_id: organization_id,
        status: 'scheduled',
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return new Response(
        JSON.stringify({ error: appointmentError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Appointment created:', appointment.id);

    // 7. Log de auditoria
    const duration = Date.now() - startTime;
    await supabase.from('api_request_logs').insert({
      token_id,
      organization_id,
      endpoint: '/public-api-create-appointment',
      method: 'POST',
      status_code: 201,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      request_body: body,
      response_body: { appointment_id: appointment.id },
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ appointment }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Log error
    const duration = Date.now() - startTime;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase.from('api_request_logs').insert({
      token_id: null,
      organization_id: null,
      endpoint: '/public-api-create-appointment',
      method: 'POST',
      status_code: 500,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
