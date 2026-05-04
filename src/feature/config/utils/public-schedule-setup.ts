export type PublicScheduleSettings = {
  public_start_time?: string | null;
  public_end_time?: string | null;
  public_slot_minutes?: number | null;
  public_working_days?: string | null;
};

const isValidTime = (value?: string | null): boolean => {
  if (!value) return false;
  const t = value.trim();
  if (/^24:00(:00)?$/.test(t)) return true;
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(t);
};

const toMinutes = (value: string): number => {
  const t = value.trim();
  if (/^24:00/.test(t)) return 24 * 60;
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
};

/** Mesmos fallbacks que o PHP em `AppointmentRequestPublicAvailabilityAction` (null → padrão). */
export const getEffectivePublicSchedule = (
  settings?: PublicScheduleSettings | null
): Required<Pick<PublicScheduleSettings, "public_start_time" | "public_end_time" | "public_slot_minutes" | "public_working_days">> => {
  const s = settings ?? {};
  return {
    public_start_time: s.public_start_time?.trim() || "09:00:00",
    public_end_time: s.public_end_time?.trim() || "18:00:00",
    public_slot_minutes: s.public_slot_minutes ?? 30,
    public_working_days:
      s.public_working_days === undefined || s.public_working_days === null
        ? "1,2,3,4,5"
        : s.public_working_days,
  };
};

function scheduleStartBeforeEnd(start: string, end: string): boolean {
  if (!isValidTime(start) || !isValidTime(end)) return false;
  let startMin = toMinutes(start);
  let endMin = toMinutes(end);
  // Fim "00:00" com início pela manhã/tarde = meia-noite do mesmo dia (24h)
  if (/^00:00/.test(end.trim()) && startMin > 0 && endMin === 0) {
    endMin = 24 * 60;
  }
  return startMin < endMin;
}

function hasAtLeastOneWorkingDay(raw: string): boolean {
  const days = raw
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean)
    .map((d) => Number.parseInt(d, 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 7);
  return days.length > 0;
}

/** Admin salvou agenda pública explícita (campos obrigatórios preenchidos). */
export const isPublicScheduleConfigured = (settings?: PublicScheduleSettings | null): boolean => {
  if (!settings) return false;

  const start = settings.public_start_time?.trim() ?? "";
  const end = settings.public_end_time?.trim() ?? "";
  const slot = settings.public_slot_minutes ?? null;
  const days = (settings.public_working_days ?? "")
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean);

  if (!isValidTime(start) || !isValidTime(end)) return false;
  if (!scheduleStartBeforeEnd(start, end)) return false;
  if (slot !== null && slot !== undefined) {
    if (!Number.isFinite(slot) || Number(slot) <= 0) return false;
  }
  if (days.length === 0) return false;

  return true;
};

/**
 * Página pública: pode exibir serviços/horários? Usa os mesmos defaults da API quando os campos vêm null.
 * Diferente de `isPublicScheduleConfigured` (painel admin ainda pede configuração explícita).
 */
export const isPublicBookingScheduleRunnable = (settings?: PublicScheduleSettings | null): boolean => {
  const eff = getEffectivePublicSchedule(settings);
  const slot = eff.public_slot_minutes;
  if (!Number.isFinite(slot) || Number(slot) <= 0) return false;
  if (!hasAtLeastOneWorkingDay(eff.public_working_days)) return false;
  return scheduleStartBeforeEnd(eff.public_start_time, eff.public_end_time);
};
