import { Building2, Scissors, CalendarDays, Clock, BadgeDollarSign } from "lucide-react";

interface Props {
  company: string | undefined;
  service: string | undefined;
  date: string;
  time: string;
  price?: number;
}

export default function SummaryCard({ company, service, date, time, price }: Props) {
  const rows = [
    { icon: Building2, label: "Empresa", value: company ?? "—" },
    { icon: Scissors, label: "Serviço", value: service ?? "—" },
    { icon: CalendarDays, label: "Data", value: date || "—" },
    { icon: Clock, label: "Horário", value: time || "—" },
  ];

  return (
    <div className="lg:sticky lg:top-10">
      <div className="public-card rounded-2xl overflow-hidden shadow-lg">
        {/* Gradient header */}
        <div
          className="px-5 py-4"
          style={{ background: "var(--brand-gradient-main)" }}
        >
          <h3 className="font-bold text-white text-sm">Resumo do Agendamento</h3>
          <p className="text-white/75 text-xs mt-0.5">Confira os detalhes antes de confirmar</p>
        </div>

        {/* Rows */}
        <div className="bg-white/90 backdrop-blur-sm p-5 space-y-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="brand-icon-soft-box h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={13} className="brand-icon-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
                <div className="text-sm font-semibold text-slate-800 truncate">{value}</div>
              </div>
            </div>
          ))}

          {price && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="brand-icon-soft-box h-7 w-7 rounded-lg flex items-center justify-center">
                  <BadgeDollarSign size={13} className="brand-icon-primary" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Total</span>
              </div>
              <span className="public-brand-text text-xl font-bold">R$ {price}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
