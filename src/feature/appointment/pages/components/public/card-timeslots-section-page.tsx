import { Loader2 } from "lucide-react";

interface Props {
  slots: string[];
  selected: string;
  loading: boolean;
  onSelect: (time: string) => void;
}

export default function TimeSlotsSection({
  slots,
  selected,
  loading,
  onSelect,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
        <Loader2 size={14} className="animate-spin public-brand-text" />
        Carregando horários disponíveis...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
      {slots.map((slot) => {
        const isActive = slot === selected;
        return (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={`h-11 rounded-xl border-2 text-sm font-semibold transition-all duration-200
              ${isActive
                ? "text-white border-transparent public-selected-shadow"
                : "border-slate-200 text-slate-700 bg-white public-hover-brand"
              }`}
            style={isActive ? {
              background: "var(--brand-gradient-main)",
            } : undefined}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
