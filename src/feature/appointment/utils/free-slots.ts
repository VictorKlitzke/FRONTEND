import type { AppointmentDTO } from "../services/appointment-service";
import type { SettingsDTO } from "@/feature/config/services/settings-service";

const DEFAULT_START = "09:00:00";
const DEFAULT_END = "18:00:00";
const DEFAULT_SLOT = 30;
const DEFAULT_WORKING_DAYS = "1,2,3,4,5";

function parseClockToMinutes(value: string): number | null {
  const raw = value.trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

function minutesToClock(total: number): string {
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseAppointmentLocalBounds(a: AppointmentDTO): { startMs: number; endMs: number } | null {
  if (!a.startAt) return null;
  const raw = a.startAt;
  let d: Date;
  if (raw.includes("T")) {
    d = new Date(raw);
  } else {
    const [datePart, timePart = "00:00:00"] = raw.split(" ");
    const [y, mo, day] = datePart.split("-").map(Number);
    const [hh, mm, ss = 0] = timePart.split(":").map(Number);
    d = new Date(y, (mo || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0);
  }
  const startMs = d.getTime();
  const dur = Math.max(1, a.durationMinutes ?? 0);
  const endMs = startMs + dur * 60000;
  return { startMs, endMs };
}

function sameCalendarDay(dateStr: string, startMs: number): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, (m || 1) - 1, d || 1);
  const t = new Date(startMs);
  return (
    day.getFullYear() === t.getFullYear() &&
    day.getMonth() === t.getMonth() &&
    day.getDate() === t.getDate()
  );
}

export interface FreeSlotsParams {
  dateStr: string;
  durationMinutes: number;
  professionalId: number;
  appointments: AppointmentDTO[];
  settings: SettingsDTO | null | undefined;
  excludeAppointmentId?: number | null;
}

/**
 * Horários de início possíveis dentro do expediente (settings) sem sobrepor outros agendamentos do mesmo profissional.
 */
export function computeFreeSlotStarts(params: FreeSlotsParams): string[] {
  const {
    dateStr,
    durationMinutes,
    professionalId,
    appointments,
    settings,
    excludeAppointmentId,
  } = params;

  if (!dateStr || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || !professionalId) {
    return [];
  }

  const startRaw = String(settings?.public_start_time ?? "").trim() || DEFAULT_START;
  const endRaw = String(settings?.public_end_time ?? "").trim() || DEFAULT_END;
  const slotMinutes = Math.max(
    5,
    Number(settings?.public_slot_minutes ?? DEFAULT_SLOT) || DEFAULT_SLOT
  );

  const workingRaw = String(settings?.public_working_days ?? "").trim() || DEFAULT_WORKING_DAYS;
  const workingDays = workingRaw
    .split(",")
    .map((x) => Number.parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 7);

  const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay();
  const isoWeekday = dayOfWeek === 0 ? 7 : dayOfWeek;
  if (workingDays.length > 0 && !workingDays.includes(isoWeekday)) {
    return [];
  }

  const openMin = parseClockToMinutes(startRaw.length <= 5 ? `${startRaw}:00` : startRaw);
  const closeMin = parseClockToMinutes(endRaw.length <= 5 ? `${endRaw}:00` : endRaw);
  if (openMin === null || closeMin === null || closeMin <= openMin) {
    return [];
  }

  const [y, mo, d] = dateStr.split("-").map(Number);
  const windowClose = new Date(y, (mo || 1) - 1, d || 1, Math.floor(closeMin / 60), closeMin % 60, 0, 0).getTime();

  const durationMs = durationMinutes * 60000;

  const busy = appointments.filter((a) => {
    if (!a.professionalId || a.professionalId !== professionalId) return false;
    if (excludeAppointmentId != null && a.id === excludeAppointmentId) return false;
    const bounds = parseAppointmentLocalBounds(a);
    if (!bounds) return false;
    if (!sameCalendarDay(dateStr, bounds.startMs)) return false;
    return true;
  });

  const overlaps = (candidateStartMs: number, candidateEndMs: number): boolean =>
    busy.some((a) => {
      const b = parseAppointmentLocalBounds(a);
      if (!b) return false;
      return candidateStartMs < b.endMs && candidateEndMs > b.startMs;
    });

  const out: string[] = [];
  let cursorMin = openMin;
  while (true) {
    const startMs = new Date(y, (mo || 1) - 1, d || 1, Math.floor(cursorMin / 60), cursorMin % 60, 0, 0).getTime();
    const endMs = startMs + durationMs;
    if (endMs > windowClose) {
      break;
    }
    if (!overlaps(startMs, endMs)) {
      out.push(minutesToClock(cursorMin));
    }
    cursorMin += slotMinutes;
    if (cursorMin >= 24 * 60) break;
  }

  return out;
}

export function isDateInConfiguredWorkingDays(
  dateStr: string,
  settings: SettingsDTO | null | undefined
): boolean {
  const workingRaw = String(settings?.public_working_days ?? "").trim() || DEFAULT_WORKING_DAYS;
  const workingDays = workingRaw
    .split(",")
    .map((x) => Number.parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 7);

  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (mo || 1) - 1, d || 1, 12, 0, 0, 0);
  const isoWeekday = date.getDay() === 0 ? 7 : date.getDay();
  return workingDays.length === 0 || workingDays.includes(isoWeekday);
}
