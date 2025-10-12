import { supabase } from '@/integrations/supabase/client';

interface LogPayload {
  organization_id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
  source?: 'frontend' | 'backend' | 'edge-function';
}

export async function logActivity(payload: LogPayload) {
  try {
    if (!payload.organization_id) {
      throw new Error("Organization ID is required for logging.");
    }
    await supabase.from('activity_logs').insert({
      organization_id: payload.organization_id,
      level: payload.level,
      message: payload.message,
      details: payload.details || {},
      source: payload.source || 'frontend',
    });
  } catch (error) {
    // Silenciosamente ignora erros de log para não quebrar a aplicação
    console.error('Failed to write to activity log:', error);
  }
}
