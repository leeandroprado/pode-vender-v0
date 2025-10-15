import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { toZonedTime, fromZonedTime } from 'https://esm.sh/date-fns-tz@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Available Slots Request ===');
    
    // 1. Validar token
    const tokenValidation = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-api-token`, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    if (!tokenValidation.ok) {
      console.error('Token validation failed');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { organization_id, scopes } = await tokenValidation.json();
    console.log('Token validated for organization:', organization_id);

    // 2. Verificar scope
    if (!scopes.includes('read:appointments') && !scopes.includes('admin:all')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Obter parâmetros
    const url = new URL(req.url);
    const agendaId = url.searchParams.get('agenda_id');
    const date = url.searchParams.get('date'); // YYYY-MM-DD
    const duration = parseInt(url.searchParams.get('duration') || '30');

    if (!agendaId || !date) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: agenda_id, date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parameters:', { agendaId, date, duration: `${duration} (will be ignored, using agenda slot_duration)` });

    // 4. Buscar agenda
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: agenda, error: agendaError } = await supabase
      .from('agendas')
      .select('*')
      .eq('id', agendaId)
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .single();

    if (agendaError || !agenda) {
      console.error('Agenda not found:', agendaError);
      return new Response(
        JSON.stringify({ error: 'Agenda not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Calcular slots disponíveis
    const slots = await calculateAvailableSlots(supabase, agenda, date);
    console.log(`Found ${slots.length} available slots`);

    return new Response(JSON.stringify({ slots }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function calculateAvailableSlots(supabase: any, agenda: any, dateStr: string) {
  const TIMEZONE = 'America/Sao_Paulo';
  
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  const workingHours = agenda.working_hours[dayName];
  if (!workingHours || !workingHours.enabled) {
    console.log('Day not enabled:', dayName);
    return [];
  }

  console.log('Working hours for', dayName, ':', workingHours);

  // Converter working_hours (horário local) para UTC
  const localStartDate = new Date(`${dateStr}T${workingHours.start}:00`);
  const localEndDate = new Date(`${dateStr}T${workingHours.end}:00`);
  
  const startTimeUTC = fromZonedTime(localStartDate, TIMEZONE);
  const endTimeUTC = fromZonedTime(localEndDate, TIMEZONE);

  console.log('Working hours in UTC:', {
    start: startTimeUTC.toISOString(),
    end: endTimeUTC.toISOString()
  });

  // Buscar agendamentos existentes
  const startOfDay = new Date(dateStr + 'T00:00:00Z');
  const endOfDay = new Date(dateStr + 'T23:59:59Z');

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('agenda_id', agenda.id)
    .neq('status', 'cancelled')
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());

  console.log(`Found ${appointments?.length || 0} existing appointments`);
  if (appointments && appointments.length > 0) {
    console.log('Appointments details:', appointments.map((apt: any) => ({
      start: apt.start_time,
      end: apt.end_time
    })));
  }

  // Gerar slots em UTC
  const slots = [];
  let currentTime = new Date(startTimeUTC);
  const endTime = new Date(endTimeUTC);

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + agenda.slot_duration * 60000);
    
    // Verificar se não conflita com agendamentos
    const hasConflict = appointments?.some((apt: any) => {
      const aptStart = new Date(apt.start_time);
      const aptEnd = new Date(apt.end_time);
      return (currentTime < aptEnd && slotEnd > aptStart);
    });

    if (hasConflict) {
      console.log(`Slot ${currentTime.toISOString()} - ${slotEnd.toISOString()} BLOCKED by appointment`);
    }

    // Verificar se não conflita com breaks (converter horário local para UTC)
    const isInBreak = agenda.breaks?.some((brk: any) => {
      if (!brk.days.includes(dayOfWeek)) return false;
      
      const localBreakStart = new Date(`${dateStr}T${brk.start}:00`);
      const localBreakEnd = new Date(`${dateStr}T${brk.end}:00`);
      
      const breakStartUTC = fromZonedTime(localBreakStart, TIMEZONE);
      const breakEndUTC = fromZonedTime(localBreakEnd, TIMEZONE);
      
      return (currentTime < breakEndUTC && slotEnd > breakStartUTC);
    });

    if (isInBreak) {
      console.log(`Slot ${currentTime.toISOString()} - ${slotEnd.toISOString()} BLOCKED by break`);
    }

    if (!hasConflict && !isInBreak && slotEnd <= endTime) {
      // Converter UTC para horário de São Paulo
      const localStart = toZonedTime(currentTime, TIMEZONE);
      const localEnd = toZonedTime(slotEnd, TIMEZONE);
      
      slots.push({
        start: localStart.toISOString().replace('Z', '-03:00'),
        end: localEnd.toISOString().replace('Z', '-03:00'),
      });
    }

    currentTime = new Date(currentTime.getTime() + agenda.slot_duration * 60000);
  }

  return slots;
}
