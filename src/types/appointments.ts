export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  client_id: string | null;
  status: AppointmentStatus;
  appointment_type: string | null;
  location: string | null;
  internal_notes: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
}

export interface CreateAppointmentInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  client_id?: string | null;
  status?: AppointmentStatus;
  appointment_type?: string;
  location?: string;
  internal_notes?: string;
}

export interface UpdateAppointmentInput extends Partial<CreateAppointmentInput> {
  id: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus[];
  client_id?: string;
  appointment_type?: string;
  start_date?: Date;
  end_date?: Date;
  search?: string;
}
