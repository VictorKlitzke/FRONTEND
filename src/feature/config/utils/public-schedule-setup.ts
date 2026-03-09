type PublicScheduleSettings = {
  public_start_time?: string | null;
  public_end_time?: string | null;
  public_slot_minutes?: number | null;
  public_working_days?: string | null;
};

const isValidTime = (value?: string | null): boolean => {
  if (!value) return false;
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value.trim());
};

const toMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
};

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
  if (toMinutes(start) >= toMinutes(end)) return false;
  if (!Number.isFinite(slot) || Number(slot) <= 0) return false;
  if (days.length === 0) return false;

  return true;
};
