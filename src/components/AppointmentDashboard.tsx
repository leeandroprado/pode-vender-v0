import { AppointmentStats } from "./AppointmentStats";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import type { Appointment } from "@/types/appointments";
import { format, isToday, isFuture, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentDashboardProps {
  appointments: Appointment[];
}

export function AppointmentDashboard({ appointments }: AppointmentDashboardProps) {
  const now = new Date();
  
  // Today's appointments
  const todayAppointments = appointments.filter(apt => 
    isToday(new Date(apt.start_time))
  );

  // Next appointment
  const futureAppointments = appointments.filter(apt => 
    isFuture(new Date(apt.start_time))
  ).sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const nextAppointment = futureAppointments[0];

  // Completion rate (last 30 appointments)
  const recentAppointments = appointments
    .filter(apt => isPast(new Date(apt.end_time)))
    .slice(0, 30);
  const completedCount = recentAppointments.filter(apt => 
    apt.status === 'completed'
  ).length;
  const completionRate = recentAppointments.length > 0
    ? Math.round((completedCount / recentAppointments.length) * 100)
    : 0;

  // Free slots today (simplified: total hours - booked hours)
  const todayBookedHours = todayAppointments.reduce((total, apt) => {
    const start = new Date(apt.start_time);
    const end = new Date(apt.end_time);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);
  const totalWorkHours = 10; // 8h-18h
  const freeSlots = Math.max(0, Math.floor(totalWorkHours - todayBookedHours));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <AppointmentStats
        label="Agendamentos Hoje"
        value={todayAppointments.length}
        icon={Calendar}
      />
      
      <AppointmentStats
        label="Próximo Agendamento"
        value={nextAppointment 
          ? format(new Date(nextAppointment.start_time), "HH:mm", { locale: ptBR })
          : "Nenhum"
        }
        icon={Clock}
      />
      
      <AppointmentStats
        label="Taxa de Comparecimento"
        value={`${completionRate}%`}
        icon={TrendingUp}
        trend={{
          value: 5,
          isPositive: true
        }}
      />
      
      <AppointmentStats
        label="Horários Livres Hoje"
        value={`${freeSlots}h`}
        icon={Users}
      />
    </div>
  );
}
