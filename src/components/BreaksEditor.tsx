import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Break } from '@/hooks/useAgendas';

interface BreaksEditorProps {
  breaks: Break[];
  onChange: (breaks: Break[]) => void;
}

const daysOfWeek = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export const BreaksEditor = ({ breaks, onChange }: BreaksEditorProps) => {
  const addBreak = () => {
    onChange([
      ...breaks,
      { start: '12:00', end: '13:00', days: [1, 2, 3, 4, 5] },
    ]);
  };

  const removeBreak = (index: number) => {
    onChange(breaks.filter((_, i) => i !== index));
  };

  const updateBreak = (index: number, field: keyof Break, value: any) => {
    const updated = [...breaks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const toggleDay = (breakIndex: number, day: number) => {
    const breakItem = breaks[breakIndex];
    const days = breakItem.days.includes(day)
      ? breakItem.days.filter((d) => d !== day)
      : [...breakItem.days, day];
    updateBreak(breakIndex, 'days', days);
  };

  return (
    <div className="space-y-4">
      {breaks.map((breakItem, index) => (
        <div key={index} className="p-4 rounded-lg border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Label className="text-sm">Horário:</Label>
              <Input
                type="time"
                value={breakItem.start}
                onChange={(e) => updateBreak(index, 'start', e.target.value)}
                className="w-32"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="time"
                value={breakItem.end}
                onChange={(e) => updateBreak(index, 'end', e.target.value)}
                className="w-32"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeBreak(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Dias da semana:</Label>
            <div className="flex gap-2 flex-wrap">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center gap-1">
                  <Checkbox
                    checked={breakItem.days.includes(day.value)}
                    onCheckedChange={() => toggleDay(index, day.value)}
                    id={`break-${index}-day-${day.value}`}
                  />
                  <label
                    htmlFor={`break-${index}-day-${day.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addBreak} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Intervalo
      </Button>
    </div>
  );
};
