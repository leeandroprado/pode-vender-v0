import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { SystemSetting } from '@/hooks/useSystemSettings';

interface SystemSettingFieldProps {
  setting: SystemSetting;
  onUpdate: (id: string, value: string) => Promise<boolean>;
}

export function SystemSettingField({ setting, onUpdate }: SystemSettingFieldProps) {
  const [value, setValue] = useState(setting.setting_value || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isBooleanSetting = setting.setting_value === 'true' || setting.setting_value === 'false';
  const isPasswordField = setting.setting_key.includes('auth') || setting.setting_key.includes('token');

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate(setting.id, value);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleBooleanToggle = async (checked: boolean) => {
    setValue(checked.toString());
    await onUpdate(setting.id, checked.toString());
  };

  if (isBooleanSetting) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1 flex-1">
          <Label htmlFor={setting.id} className="text-sm font-medium">
            {setting.setting_key}
          </Label>
          {setting.description && (
            <p className="text-sm text-muted-foreground">{setting.description}</p>
          )}
        </div>
        <Switch
          id={setting.id}
          checked={value === 'true'}
          onCheckedChange={handleBooleanToggle}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <Label htmlFor={setting.id} className="text-sm font-medium">
        {setting.setting_key}
      </Label>
      {setting.description && (
        <p className="text-sm text-muted-foreground">{setting.description}</p>
      )}
      <div className="flex gap-2">
        <Input
          id={setting.id}
          type={isPasswordField ? 'password' : 'text'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsEditing(true);
          }}
          className="flex-1"
        />
        {isEditing && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        )}
      </div>
    </div>
  );
}
