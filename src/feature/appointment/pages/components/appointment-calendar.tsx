import { ChevronLeft, ChevronRight, Plus, Search, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Semana completa: segunda a domingo (início da semana = segunda) */
const WEEKDAY_COLUMNS = 7;

/** Início da grade alinhado a agendas clínicas (ex.: 09:00 no print) */
const DAY_START_HOUR = 9;
/** Fim do dia na grade (24 = meia-noite); minutos usam 24 * 60 */
const DAY_END_HOUR = 24;
const SLOT_MINUTES = 15;

/** Desktop: altura por faixa de 15 min (mais compacto = menos rolagem na semana) */
const PX_PER_SLOT_DESKTOP = 28;
/** Mobile: coluna única — altura equilibrada entre legibilidade e rolagem */
const PX_PER_SLOT_MOBILE = 30;

/** Cores suaves estilo agenda médica (texto escuro para leitura) */
const PALETTE = [
  "bg-emerald-100 border-emerald-300/80 text-slate-900 shadow-sm",
  "bg-rose-100 border-rose-300/80 text-slate-900 shadow-sm",
  "bg-sky-100 border-sky-300/80 text-slate-900 shadow-sm",
  "bg-indigo-100 border-indigo-300/80 text-slate-900 shadow-sm",
  "bg-amber-100 border-amber-300/80 text-slate-900 shadow-sm",
  "bg-violet-100 border-violet-300/80 text-slate-900 shadow-sm",
  "bg-orange-100 border-orange-300/80 text-slate-900 shadow-sm",
  "bg-teal-100 border-teal-300/80 text-slate-900 shadow-sm",
];

function paletteClass(key: string | number | undefined): string {
  const n = typeof key === "number" ? key : String(key).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[Math.abs(n) % PALETTE.length];
}

export interface CalendarAppointment {
  id?: number;
  startAt: string;
  endAt?: string;
  durationMinutes?: number;
  /** Nome do serviço (primeira linha) */
  title: string;
  /** Nome do cliente (segunda linha) */
  subtitle?: string;
  /** Cor estável (ex.: professionalId) */
  colorKey?: string | number;
}

interface AppointmentCalendarProps {
  /** Qualquer data dentro da semana visível (normalizamos para semana começando na segunda) */
  viewDate: Date;
  appointments: CalendarAppointment[];
  onWeekChange: (deltaWeeks: number) => void;
  /** Apenas centraliza a semana em “hoje”, sem abrir modal */
  onNavigateToToday?: () => void;
  onSelectDate: (date: Date) => void;
  onSelectAppointment?: (appointmentId?: number) => void;
  /** Abre fluxo de novo agendamento (sem slot) */
  onNewAppointment?: () => void;
  /** Ex.: navegar para /config */
  onConfigure?: () => void;
  /** Elemento que recebe requestFullscreen (card da agenda) */
  fullscreenTargetRef?: RefObject<HTMLElement | null>;
}

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toLocalDateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseStartAt(value?: string): Date {
  if (!value) return new Date("1970-01-01T00:00:00");
  if (value.includes("T")) return new Date(value);
  const [datePart, timePart = "00:00:00"] = value.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function formatHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const DAY_START_MIN = DAY_START_HOUR * 60;
const DAY_END_MIN = DAY_END_HOUR * 60;
const RANGE_MIN = DAY_END_MIN - DAY_START_MIN;
const SLOT_COUNT = RANGE_MIN / SLOT_MINUTES;

type LayoutEv = {
  id?: number;
  startMin: number;
  endMin: number;
  topPct: number;
  heightPct: number;
  data: CalendarAppointment;
  col: number;
  colCount: number;
};

/** Colunas para intervalos sobrepostos (primeira coluna livre que já terminou). */
function assignColumns(events: { startMin: number; endMin: number }[]): { col: number; colCount: number }[] {
  const sorted = events
    .map((e, i) => ({ ...e, i }))
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const trackEnds: number[] = [];
  const colIndex: number[] = new Array(events.length).fill(0);

  for (const item of sorted) {
    let col = trackEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) {
      col = trackEnds.length;
      trackEnds.push(item.endMin);
    } else {
      trackEnds[col] = item.endMin;
    }
    colIndex[item.i] = col;
  }

  const colCount = Math.max(1, trackEnds.length);
  return events.map((_, i) => ({ col: colIndex[i], colCount }));
}

function AppointmentBlocks({
  blocks,
  variant,
  onSelectAppointment,
}: {
  blocks: LayoutEv[];
  variant: "desktop" | "mobile";
  onSelectAppointment?: (appointmentId?: number) => void;
}) {
  const isMobile = variant === "mobile";

  return (
    <>
      {blocks.map((b) => {
        const a = b.data;
        const start = parseStartAt(a.startAt);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (b.endMin - b.startMin));
        const w = 100 / b.colCount;
        const left = (b.col / b.colCount) * 100;

        return (
          <button
            key={`${variant}-${a.id}-${b.startMin}`}
            type="button"
            data-appt-block
            className={cn(
              "absolute flex flex-col overflow-y-auto text-left transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
              isMobile
                ? cn(
                    "touch-manipulation gap-1 rounded-xl border-2 border-white/10 px-2.5 py-2 shadow-md active:scale-[0.98]",
                    paletteClass(a.colorKey ?? a.id)
                  )
                : cn(
                    "touch-manipulation gap-0.5 rounded-md border px-2 py-1.5 shadow-sm lg:active:scale-100",
                    paletteClass(a.colorKey ?? a.id)
                  )
            )}
            style={{
              top: `${b.topPct}%`,
              height: `${b.heightPct}%`,
              left: `${left}%`,
              width: `${w}%`,
              boxSizing: "border-box",
              WebkitTapHighlightColor: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAppointment?.(a.id);
            }}
          >
            <div
              className={cn(
                "line-clamp-2 font-semibold leading-snug",
                isMobile ? "text-[11px]" : "text-[10px]"
              )}
            >
              {a.title}{" "}
              <span className="whitespace-nowrap font-bold tabular-nums">
                {formatHm(start)} – {formatHm(end)}
              </span>
            </div>
            {a.subtitle?.trim() ? (
              <div
                className={cn(
                  "line-clamp-2 font-medium leading-snug opacity-90",
                  isMobile ? "text-[10px]" : "text-[9px]"
                )}
              >
                {a.subtitle}
              </div>
            ) : null}
          </button>
        );
      })}
    </>
  );
}

function CurrentTimeLine({ columnHeightPx }: { columnHeightPx: number }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  const mins = minutesSinceMidnight(now);
  if (mins < DAY_START_MIN || mins >= DAY_END_MIN) return null;
  const topPx = ((mins - DAY_START_MIN) / RANGE_MIN) * columnHeightPx;
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-30 border-t-[3px] border-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
      style={{ top: topPx }}
      aria-hidden
    />
  );
}

export function AppointmentCalendar({
  viewDate,
  appointments,
  onWeekChange,
  onNavigateToToday,
  onSelectDate,
  onSelectAppointment,
  onNewAppointment,
  onConfigure,
  fullscreenTargetRef,
}: AppointmentCalendarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = fullscreenTargetRef?.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, [fullscreenTargetRef]);

  const weekStart = useMemo(() => startOfWeekMonday(viewDate), [viewDate]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < WEEKDAY_COLUMNS; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  const todayInWeekIndex = useMemo(() => {
    const t = new Date();
    return weekDays.findIndex(
      (d) =>
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
    );
  }, [weekDays]);

  const [mobileDayIdx, setMobileDayIdx] = useState(0);
  const dayStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileDayIdx(todayInWeekIndex >= 0 ? todayInWeekIndex : 0);
  }, [weekStart.getTime(), todayInWeekIndex]);

  useEffect(() => {
    const strip = dayStripRef.current;
    if (!strip) return;
    const btn = strip.querySelector<HTMLElement>(`[data-mobile-day="${mobileDayIdx}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [mobileDayIdx, weekStart]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[WEEKDAY_COLUMNS - 1];
    if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
      return `${first.getDate()}–${last.getDate()} de ${first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;
    }
    return `${first.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${last.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`;
  }, [weekDays]);

  const weekRangeShort = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[WEEKDAY_COLUMNS - 1];
    return `${first.getDate()}/${first.getMonth() + 1} – ${last.getDate()}/${last.getMonth() + 1} · ${first.getFullYear()}`;
  }, [weekDays]);

  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let m = DAY_START_MIN; m < DAY_END_MIN; m += SLOT_MINUTES) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      labels.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    }
    return labels;
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredAppointments = useMemo(() => {
    if (!q) return appointments;
    return appointments.filter((a) => {
      const hay = `${a.title} ${a.subtitle ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [appointments, q]);

  const layoutByDay = useMemo(() => {
    const map = new Map<string, LayoutEv[]>();

    for (const day of weekDays) {
      const key = toLocalDateKey(day);
      const raw = filteredAppointments.filter((a) => toLocalDateKey(parseStartAt(a.startAt)) === key);

      const enriched = raw.map((a) => {
        const start = parseStartAt(a.startAt);
        let end: Date;
        if (a.endAt) {
          end = parseStartAt(a.endAt);
        } else {
          end = new Date(start);
          end.setMinutes(end.getMinutes() + Math.max(a.durationMinutes ?? 30, 15));
        }
        let startMin = minutesSinceMidnight(start);
        let endMin = minutesSinceMidnight(end);
        if (endMin <= startMin) endMin = startMin + SLOT_MINUTES;
        startMin = Math.max(DAY_START_MIN, Math.min(startMin, DAY_END_MIN));
        endMin = Math.max(startMin + SLOT_MINUTES, Math.min(endMin, DAY_END_MIN));

        const topPct = ((startMin - DAY_START_MIN) / RANGE_MIN) * 100;
        const heightPct = Math.max(((endMin - startMin) / RANGE_MIN) * 100, 0.35);

        return {
          id: a.id,
          startMin,
          endMin,
          topPct,
          heightPct,
          data: a,
        };
      });

      const cols = assignColumns(enriched.map((e) => ({ startMin: e.startMin, endMin: e.endMin })));

      const laid = enriched.map((e, i) => ({
        ...e,
        col: cols[i].col,
        colCount: cols[i].colCount,
      }));

      map.set(key, laid);
    }

    return map;
  }, [filteredAppointments, weekDays]);

  const handleColumnBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, day: Date) => {
      if ((e.target as HTMLElement).closest("[data-appt-block]")) return;
      const col = e.currentTarget;
      const rect = col.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = Math.min(1, Math.max(0, y / rect.height));
      let minutes = DAY_START_MIN + pct * RANGE_MIN;
      minutes = Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
      minutes = Math.min(Math.max(minutes, DAY_START_MIN), DAY_END_MIN - SLOT_MINUTES);

      const next = new Date(day);
      next.setHours(0, 0, 0, 0);
      next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      onSelectDate(next);
    },
    [onSelectDate]
  );

  const mobileDay = weekDays[mobileDayIdx] ?? weekDays[0];
  const mobileKey = mobileDay ? toLocalDateKey(mobileDay) : "";
  const mobileBlocks = mobileKey ? layoutByDay.get(mobileKey) ?? [] : [];

  const columnHeightDesktop = SLOT_COUNT * PX_PER_SLOT_DESKTOP;
  const columnHeightMobile = SLOT_COUNT * PX_PER_SLOT_MOBILE;

  const isToday = (date: Date) => {
    const t = new Date();
    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    );
  };

  const gridTimeCol = "60px";

  return (
    <div className={cn("flex min-h-0 w-full flex-col", isFullscreen && "min-h-0 flex-1")}>
      {fullscreenTargetRef ? (
        <div className="mb-2 flex justify-end lg:mb-2.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
            <span>Agenda tela cheia</span>
            <button
              type="button"
              role="switch"
              aria-checked={isFullscreen}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Agenda em tela cheia"}
              onClick={() => void toggleFullscreen()}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                isFullscreen ? "border-slate-500 bg-slate-600" : "border-slate-300 bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  isFullscreen ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </label>
        </div>
      ) : null}

      <div className="mb-3 flex flex-col gap-3 border-b border-slate-200/80 pb-3 sm:mb-4 sm:pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 touch-manipulation px-3"
              onClick={() => onNavigateToToday?.()}
            >
              Hoje
            </Button>
            <Select value="week" onValueChange={() => {}}>
              <SelectTrigger size="sm" className="h-9 w-[118px] bg-white">
                <SelectValue placeholder="Semana" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 touch-manipulation"
              onClick={() => onWeekChange(-1)}
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 px-1 text-center sm:px-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">
                Semana
              </div>
              <div className="truncate text-xs font-semibold capitalize text-slate-900 sm:text-sm">
                <span className="lg:hidden">{weekRangeShort}</span>
                <span className="hidden lg:inline">{weekRangeLabel}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 touch-manipulation"
              onClick={() => onWeekChange(1)}
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-36 bg-white pl-8 lg:w-44"
              />
            </div>
            <Button
              size="sm"
              className="h-9 gap-1 bg-blue-600 px-3 text-white hover:bg-blue-700"
              onClick={() => onNewAppointment?.()}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Novo agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 border-orange-400 text-orange-700 hover:bg-orange-50"
              onClick={() => onConfigure?.()}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </div>

        <div className="relative md:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full bg-white pl-8"
          />
        </div>
      </div>

      {/* ——— Mobile / tablet: um dia por vez (evita 7 colunas estreitas) ——— */}
      <div className={cn("lg:hidden", isFullscreen && "flex min-h-0 flex-1 flex-col")}>
        <div
          ref={dayStripRef}
          className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-pl-3 scroll-pr-3 pb-2 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {weekDays.map((d, i) => (
            <button
              key={toLocalDateKey(d)}
              type="button"
              data-mobile-day={i}
              onClick={() => setMobileDayIdx(i)}
              className={cn(
                "snap-start flex min-h-[56px] min-w-20 shrink-0 touch-manipulation flex-col items-center justify-center rounded-2xl border-2 px-3 py-2 text-center transition active:scale-[0.97]",
                mobileDayIdx === i
                  ? "border-violet-500 bg-violet-50 shadow-md ring-1 ring-violet-200"
                  : "border-slate-200/90 bg-white shadow-sm"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {d
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .replace(/\./g, "")
                  .slice(0, 3)
                  .toUpperCase()}
              </span>
              <span className="text-base font-bold tabular-nums leading-none text-slate-900">
                {d.getDate()}/{d.getMonth() + 1}
              </span>
              {isToday(d) ? (
                <span className="mt-0.5 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  Hoje
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100",
            isFullscreen && "min-h-0 flex-1"
          )}
        >
          <div
            className={cn(
              "grid gap-px overflow-y-auto overscroll-contain bg-slate-200 touch-pan-y [scrollbar-gutter:stable]",
              isFullscreen ? "max-h-none min-h-0 flex-1" : "max-h-[min(62vh,600px)]"
            )}
            style={{
              gridTemplateColumns: `${gridTimeCol} minmax(0, 1fr)`,
            }}
          >
            <div className="relative bg-slate-100 shadow-[2px_0_8px_-4px_rgba(15,23,42,0.08)]">
              <div className="sticky left-0 flex flex-col bg-slate-100" style={{ height: `${columnHeightMobile}px` }}>
                {timeLabels.map((label, i) => (
                  <div
                    key={i}
                    className="flex shrink-0 items-start justify-end pr-1.5 text-[10px] font-medium leading-none text-slate-600"
                    style={{ height: PX_PER_SLOT_MOBILE }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative min-h-0 touch-manipulation bg-white"
              style={{ minHeight: columnHeightMobile }}
              onClick={(e) => mobileDay && handleColumnBackgroundClick(e, mobileDay)}
              role="presentation"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    to bottom,
                    transparent 0,
                    transparent ${PX_PER_SLOT_MOBILE - 1}px,
                    rgb(226 232 240) ${PX_PER_SLOT_MOBILE - 1}px,
                    rgb(226 232 240) ${PX_PER_SLOT_MOBILE}px
                  )`,
                }}
              />
              {mobileDay && isToday(mobileDay) ? (
                <CurrentTimeLine columnHeightPx={columnHeightMobile} />
              ) : null}
              <AppointmentBlocks
                blocks={mobileBlocks}
                variant="mobile"
                onSelectAppointment={onSelectAppointment}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ——— Desktop: semana completa, rolagem única, cabeçalho dos dias fixo ——— */}
      <div className={cn("hidden min-h-0 min-w-0 lg:flex lg:flex-col", isFullscreen && "flex-1")}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100",
            isFullscreen && "flex min-h-0 flex-1 flex-col"
          )}
        >
          <div
            className={cn(
              "overflow-auto overscroll-contain [scrollbar-gutter:stable]",
              isFullscreen ? "max-h-none min-h-0 flex-1" : "max-h-[min(78vh,920px)]"
            )}
          >
            <div className="min-w-[960px]">
              <div
                className="sticky top-0 z-20 grid gap-px border-b border-slate-300/80 bg-slate-300/80 shadow-[0_1px_0_rgba(15,23,42,0.06)]"
                style={{
                  gridTemplateColumns: `${gridTimeCol} repeat(${WEEKDAY_COLUMNS}, minmax(0, 1fr))`,
                }}
              >
                <div className="bg-slate-100" aria-hidden />
                {weekDays.map((d) => (
                  <div
                    key={toLocalDateKey(d)}
                    className={cn(
                      "bg-slate-100 px-1.5 py-2.5 text-center sm:px-2 sm:py-3",
                      isToday(d) && "bg-sky-100 ring-1 ring-inset ring-sky-300/70"
                    )}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-[11px]">
                      {d
                        .toLocaleDateString("pt-BR", { weekday: "short" })
                        .replace(/\./g, "")
                        .slice(0, 3)
                        .toUpperCase()}
                    </div>
                    <div className="text-xs font-bold tabular-nums text-slate-900 sm:text-sm">
                      {d.getDate()}/{d.getMonth() + 1}
                    </div>
                    {isToday(d) ? (
                      <div className="mt-0.5 inline-block rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-medium text-white sm:mt-1 sm:px-2 sm:text-[10px]">
                        Hoje
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div
                className="grid gap-px bg-slate-300/70"
                style={{
                  gridTemplateColumns: `${gridTimeCol} repeat(${WEEKDAY_COLUMNS}, minmax(0, 1fr))`,
                }}
              >
                <div className="relative z-10 bg-slate-50 shadow-[2px_0_8px_-4px_rgba(15,23,42,0.08)]">
                  <div className="sticky left-0 flex flex-col bg-slate-50" style={{ height: `${columnHeightDesktop}px` }}>
                    {timeLabels.map((label, i) => (
                      <div
                        key={i}
                        className="flex shrink-0 items-start justify-end pr-2 text-[10px] leading-none text-slate-600 sm:text-[11px]"
                        style={{ height: PX_PER_SLOT_DESKTOP }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {weekDays.map((day) => {
                  const key = toLocalDateKey(day);
                  const blocks = layoutByDay.get(key) ?? [];

                  return (
                    <div
                      key={key}
                      className="relative bg-white"
                      style={{ minHeight: columnHeightDesktop }}
                      onClick={(e) => handleColumnBackgroundClick(e, day)}
                      role="presentation"
                    >
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                        to bottom,
                        transparent 0,
                        transparent ${PX_PER_SLOT_DESKTOP - 1}px,
                        rgb(226 232 240) ${PX_PER_SLOT_DESKTOP - 1}px,
                        rgb(226 232 240) ${PX_PER_SLOT_DESKTOP}px
                      )`,
                        }}
                      />

                      {isToday(day) ? <CurrentTimeLine columnHeightPx={columnHeightDesktop} /> : null}
                      <AppointmentBlocks blocks={blocks} variant="desktop" onSelectAppointment={onSelectAppointment} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] text-slate-500 lg:mt-3 lg:text-xs">
        <span className="lg:hidden">Horário vazio = novo agendamento · bloco = editar</span>
        <span className="hidden lg:inline">
          Horário vazio cria agendamento · clique no bloco para editar · {DAY_START_HOUR}h–0h · faixas de {SLOT_MINUTES}{" "}
          min
        </span>
      </p>
    </div>
  );
}
