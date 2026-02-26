import { Building2, ArrowRight } from "lucide-react";

interface Props {
  companies: any[];
  onSelect: (id: string) => void;
}

export default function CompanySelector({ companies, onSelect }: Props) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-800 mb-3">Escolha a empresa</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(String(c.id))}
            className="group p-5 rounded-2xl border-2 border-slate-200 bg-white text-left transition-all duration-200
              public-hover-brand hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="brand-icon-soft-box h-10 w-10 rounded-xl flex items-center justify-center shrink-0 public-chip-hover transition-colors">
                <Building2 size={18} className="brand-icon-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 leading-tight">{c.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">Clique para agendar</div>
              </div>
              <ArrowRight size={16} className="public-arrow text-slate-300 transition-colors shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
