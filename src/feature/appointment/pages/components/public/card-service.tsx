import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";

interface ServiceItem {
  id: number;
  service_name?: string | null;
  price?: number | null;
  duration?: number | null;
}

interface Props {
  services: ServiceItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const CardService: React.FC<Props> = ({ services, selectedId, onSelect }) => {
  return (
    <div className="public-card w-full rounded-2xl backdrop-blur-sm p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4">Escolha o serviço</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const label = s.service_name ?? (s as any).name ?? String(s.id);
          const isSelected = String(s.id) === String(selectedId);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(String(s.id))}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md w-full text-left
                ${isSelected
                  ? "public-chip border public-selected-shadow"
                  : "border-slate-200 bg-white public-hover-brand"
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="font-semibold text-sm text-slate-800">{label}</div>
                {isSelected
                  ? <CheckCircle2 size={16} className="brand-icon-primary shrink-0" />
                  : s.price
                    ? <div className="public-brand-text text-sm font-bold">R$ {s.price}</div>
                    : null
                }
              </div>
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} />
                  {s.duration ? `${s.duration} min` : "Duração não informada"}
                </div>
                {isSelected && s.price && (
                  <div className="public-brand-text ml-auto text-sm font-bold">R$ {s.price}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CardService;
