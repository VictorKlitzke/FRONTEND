import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import type { SettingsDTO } from "@/feature/config/services/settings-service";

interface AgendaTabProps {
  settings: SettingsDTO;
  onChange: (patch: Partial<SettingsDTO>) => void;
}

const weekDays = [
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
  { value: "7", label: "Dom" },
];

export const AgendaTab = ({ settings, onChange }: AgendaTabProps) => {
  const selectedDays = (settings.public_working_days || "").split(",").map((d) => d.trim()).filter(Boolean);
  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    onChange({ public_working_days: next.join(",") });
  };

  return (
    <Card className="card-refined border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="brand-icon-gradient h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0"
          >
            <CalendarDays size={16} />
          </div>
          <div>
            <CardTitle className="text-base">Preferências da agenda</CardTitle>
            <CardDescription className="text-xs">Defina horários públicos e regras padrão</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Horário de abertura (público)</Label>
            <Input
              type="time"
              value={settings.public_start_time ?? ""}
              onChange={(e) => onChange({ public_start_time: e.target.value })}
              className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Horário de fechamento (público)</Label>
            <Input
              type="time"
              value={settings.public_end_time ?? ""}
              onChange={(e) => onChange({ public_end_time: e.target.value })}
              className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Duração do slot (min)</Label>
            <Input
              type="number"
              placeholder="30"
              value={settings.public_slot_minutes ?? ""}
              onChange={(e) => onChange({ public_slot_minutes: Number(e.target.value) || null })}
              className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Dias disponíveis (público)</Label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => {
              const active = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`h-9 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200
                    ${active
                      ? "text-white border-transparent shadow-sm"
                      : "brand-soft-button border bg-white"
                    }`}
                  style={active ? { background: "var(--brand-gradient-main)" } : undefined}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">Define os dias em que o cliente pode solicitar agendamento.</p>
        </div>
      </CardContent>
    </Card>
  );
};
