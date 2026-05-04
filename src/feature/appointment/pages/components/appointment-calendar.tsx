import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Semana completa: segunda a domingo (início da semana = segunda) */
const WEEKDAY_COLUMNS = 7;

const DAY_START_HOUR = 7;
/** Fim do dia na grade (24 = meia-noite); minutos usam 24 * 60 */
const DAY_END_HOUR = 24;
const SLOT_MINUTES = 15;

/** Desktop: altura por faixa de 15 min (mais compacto = menos rolagem na semana) */
const PX_PER_SLOT_DESKTOP = 30;
/** Mobile: coluna única — altura equilibrada entre legibilidade e rolagem */
const PX_PER_SLOT_MOBILE = 32;

const PALETTE = [
  "bg-emerald-600 border-emerald-700 text-white shadow-sm",
  "bg-rose-500 border-rose-600 text-white shadow-sm",
  "bg-sky-500 border-sky-600 text-white shadow-sm",
  "bg-violet-500 border-violet-600 text-white shadow-sm",
  "bg-amber-500 border-amber-600 text-white shadow-sm",
  "bg-cyan-600 border-cyan-700 text-white shadow-sm",
  "bg-fuchsia-500 border-fuchsia-600 text-white shadow-sm",
  "bg-teal-600 border-teal-700 text-white shadow-sm",
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
                "font-bold uppercase leading-snug line-clamp-2",
                isMobile ? "text-[11px]" : "text-[10px]"
              )}
            >
              {a.title}
            </div>
            <div
              className={cn(
                "font-semibold tabular-nums opacity-95",
                isMobile ? "text-[11px]" : "text-[10px]"
              )}
            >
              {formatHm(start)} – {formatHm(end)}
            </div>
            {a.subtitle?.trim() ? (
              <div
                className={cn(
                  "line-clamp-3 font-medium leading-snug opacity-95",
                  isMobile ? "text-[11px]" : "text-[10px]"
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

export function AppointmentCalendar({
  viewDate,
  appointments,
  onWeekChange,
  onNavigateToToday,
  onSelectDate,
  onSelectAppointment,
}: AppointmentCalendarProps) {
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
      const mm = m % 60;
      const isLastSlot = m + SLOT_MINUTES >= DAY_END_MIN;
      if (isLastSlot && DAY_END_MIN === 24 * 60) {
        labels.push("00:00");
      } else if (mm === 0) {
        const h = Math.floor(m / 60);
        labels.push(`${String(h).padStart(2, "0")}:00`);
      } else {
        labels.push("");
      }
    }
    return labels;
  }, []);

  const layoutByDay = useMemo(() => {
    const map = new Map<string, LayoutEv[]>();

    for (const day of weekDays) {
      const key = toLocalDateKey(day);
      const raw = appointments.filter((a) => toLocalDateKey(parseStartAt(a.startAt)) === key);

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
  }, [appointments, weekDays]);

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

  return (
    <div className="flex min-h-0 w-full flex-col">
      {/* Barra da semana: uma linha limpa em telas médias+ */}
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-tight tracking-tight text-slate-900 sm:text-lg lg:text-xl">
            <span className="lg:hidden">{weekRangeShort}</span>
            <span className="hidden capitalize lg:inline">{weekRangeLabel}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 lg:hidden">
            Um dia por vez · deslize os dias · grade com rolagem
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 flex-1 touch-manipulation rounded-xl px-3 sm:min-h-9 sm:flex-none"
            onClick={() => onWeekChange(-1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Semana anterior</span>
            <span className="sm:hidden">Anterior</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 flex-1 touch-manipulation rounded-xl px-3 sm:min-h-9 sm:flex-none"
            onClick={() => onWeekChange(1)}
          >
            <span className="hidden sm:inline">Próxima semana</span>
            <span className="sm:hidden">Próxima</span>
            <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="min-h-10 w-full touch-manipulation rounded-xl sm:min-h-9 sm:w-auto"
            onClick={() => onNavigateToToday?.()}
          >
            Hoje
          </Button>
        </div>
      </div>

      {/* ——— Mobile / tablet: um dia por vez (evita 7 colunas estreitas) ——— */}
      <div className="lg:hidden">
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

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
          <div
            className="grid max-h-[min(62vh,600px)] gap-px overflow-y-auto overscroll-contain bg-slate-200 touch-pan-y [scrollbar-gutter:stable]"
            style={{
              gridTemplateColumns: `56px minmax(0, 1fr)`,
            }}
          >
            <div className="relative bg-slate-50/90 shadow-[2px_0_8px_-4px_rgba(15,23,42,0.08)]">
              <div className="sticky left-0 flex flex-col bg-slate-50/95" style={{ height: `${columnHeightMobile}px` }}>
                {timeLabels.map((label, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex shrink-0 justify-end pr-1.5 text-[11px] font-medium leading-none text-slate-600",
                      i === timeLabels.length - 1 && label === "00:00" ? "items-end pb-0.5" : "items-start"
                    )}
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
                    rgb(241 245 249) ${PX_PER_SLOT_MOBILE - 1}px,
                    rgb(241 245 249) ${PX_PER_SLOT_MOBILE}px
                  )`,
                }}
              />
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
      <div className="hidden min-w-0 lg:block">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="max-h-[min(78vh,920px)] overflow-auto overscroll-contain [scrollbar-gutter:stable]">
            <div className="min-w-[960px]">
              <div
                className="sticky top-0 z-20 grid gap-px border-b border-slate-200 bg-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.06)]"
                style={{
                  gridTemplateColumns: `56px repeat(${WEEKDAY_COLUMNS}, minmax(0, 1fr))`,
                }}
              >
                <div className="bg-white" aria-hidden />
                {weekDays.map((d) => (
                  <div
                    key={toLocalDateKey(d)}
                    className={cn(
                      "bg-white px-1.5 py-2.5 text-center sm:px-2 sm:py-3",
                      isToday(d) && "bg-violet-50 ring-1 ring-inset ring-violet-200"
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
                className="grid gap-px bg-slate-200"
                style={{
                  gridTemplateColumns: `56px repeat(${WEEKDAY_COLUMNS}, minmax(0, 1fr))`,
                }}
              >
                <div className="relative z-10 bg-white shadow-[2px_0_8px_-4px_rgba(15,23,42,0.08)]">
                  <div className="sticky left-0 flex flex-col bg-white" style={{ height: `${columnHeightDesktop}px` }}>
                    {timeLabels.map((label, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex shrink-0 justify-end pr-2 text-[10px] leading-none text-slate-500 sm:text-[11px]",
                          i === timeLabels.length - 1 && label === "00:00" ? "items-end pb-0.5" : "items-start"
                        )}
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
                        rgb(241 245 249) ${PX_PER_SLOT_DESKTOP - 1}px,
                        rgb(241 245 249) ${PX_PER_SLOT_DESKTOP}px
                      )`,
                        }}
                      />

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
