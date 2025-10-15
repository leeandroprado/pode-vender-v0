import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkingHours } from '@/hooks/useAgendas';

interface WorkingHoursEditorProps {
  workingHours: WorkingHours;
  onChange: (hours: WorkingHours) => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const WorkingHoursEditor = ({ workingHours, onChange }: WorkingHoursEditorProps) => {
  const handleToggle = (day: keyof WorkingHours) => {
    onChange({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        enabled: !workingHours[day].enabled,
      },
    });
  };

  const handleTimeChange = (day: keyof WorkingHours, field: 'start' | 'end', value: string) => {
    onChange({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {daysOfWeek.map(({ key, label }) => {
        const dayKey = key as keyof WorkingHours;
        const day = workingHours[dayKey];
        
        return (
          <div key={key} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 w-40">
              <Switch
                checked={day.enabled}
                onCheckedChange={() => handleToggle(dayKey)}
              />
              <Label className="text-sm">{label}</Label>
            </div>
            
            {day.enabled && (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={day.start}
                  onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                  className="w-32"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="time"
                  value={day.end}
                  onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
