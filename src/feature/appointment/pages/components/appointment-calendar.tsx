import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface CalendarAppointment {
  id?: number;
  startAt: string;
  title: string;
}

interface AppointmentCalendarProps {
  currentMonth: Date;
  appointments: CalendarAppointment[];
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onSelectAppointment?: (appointmentId?: number) => void;
}

export function AppointmentCalendar({
  currentMonth,
  appointments,
  onMonthChange,
  onSelectDate,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const monthLabel = currentMonth.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const toLocalDateKey = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseStartAt = (value?: string) => {
    if (!value) return new Date("1970-01-01T00:00:00");
    if (value.includes("T")) return new Date(value);
    const [datePart, timePart = "00:00:00"] = value.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
  };

  const formatTime = (value?: string) => {
    const date = parseStartAt(value);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getItemsForDate = (date: Date) => {
    const key = toLocalDateKey(date);
    return appointments
      .filter(
        (a) => toLocalDateKey(parseStartAt(a.startAt)) === key
      )
      .sort(
        (a, b) =>
          parseStartAt(a.startAt).getTime() -
          parseStartAt(b.startAt).getTime()
      );
  };

  return (
    <div className="flex min-h-0 w-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="text-xl sm:text-2xl font-semibold capitalize tracking-tight">
          {monthLabel}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto pb-1">
        <div className="min-w-[700px] sm:min-w-0">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3 text-[10px] sm:text-xs font-medium text-muted-foreground">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="text-center truncate px-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid — auto row heights (avoid fr rows: they overlap siblings when height is indefinite) */}
          <div className="grid w-full min-w-0 grid-cols-7 grid-flow-row gap-1 auto-rows-min sm:gap-2 md:gap-3">
            {days.map((date, idx) => {
              if (!date)
                return <div key={idx} className="rounded-xl bg-transparent" />;

              const dayItems = getItemsForDate(date);
              const visibleItems = dayItems.slice(0, 3);
              const hiddenCount = dayItems.length - 3;

              return (
                <div
                  key={idx}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "group min-w-0 rounded-lg sm:rounded-xl md:rounded-2xl border p-1.5 sm:p-2 md:p-3 flex flex-col transition-all cursor-pointer",
                    "hover:shadow-md hover:border-primary/60 hover:bg-primary/5",
                    isToday(date) &&
                      "border-primary shadow-sm bg-primary/5"
                  )}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs md:text-sm font-semibold tabular-nums">
                      {date.getDate()}
                    </span>

                    {isToday(date) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Appointments: row wrap on narrow cells to save vertical space */}
                  <div className="flex flex-row flex-wrap gap-0.5 sm:gap-1 content-start">
                    {visibleItems.map((item) => (
                      <button
                        key={item.id ?? item.startAt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment?.(item.id);
                        }}
                        className="max-w-full text-left text-[9px] sm:text-[10px] md:text-[11px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition"
                      >
                        <span className="font-medium tabular-nums">{formatTime(item.startAt)}</span>
                        <span className="hidden sm:inline text-primary/80"> · </span>
                        <span className="hidden sm:inline break-words">{item.title}</span>
                      </button>
                    ))}

                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(date);
                        }}
                        className="text-[10px] sm:text-[11px] text-muted-foreground hover:text-primary transition text-left"
                      >
                        +{hiddenCount} mais
                      </button>
                    )}

                    {dayItems.length === 0 && (
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Disponível
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
