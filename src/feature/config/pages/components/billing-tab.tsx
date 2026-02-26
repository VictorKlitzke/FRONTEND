import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BillingService } from "@/feature/billing/services/billing-service";
import { format, addMonths } from "date-fns";
import { CreditCard, Zap, Download } from "lucide-react";

type InvoiceDTO = {
  ref: string;
  display_id?: string;
  amount: number;
  currency?: string;
  due_date?: string | null;
  status?: string | null;
  description?: string | null;
};

export const BillingTab = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const month = format(new Date(), "yyyy-MM");
        const data = await BillingService.getInvoices(month);
        const list = Array.isArray(data) ? data : data?.invoices ?? [];
        setInvoices(list as InvoiceDTO[]);
      } catch {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <Card className="card-refined border-0 overflow-hidden">
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg, rgba(var(--brand-primary-rgb, 5, 150, 105), 0.06) 0%, rgba(var(--brand-secondary-rgb, 13, 148, 136), 0.04) 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="brand-icon-gradient h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Cobrança e plano</h3>
              <p className="text-xs text-slate-500 mt-0.5">Plano atual, upgrade e histórico de faturas</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-5">
          <div className="brand-success-box rounded-xl border p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Plano atual</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800">Pro Mensal</span>
                <span className="brand-success-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  <Zap size={10} />
                  Ativo
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/planos')}
              className="btn-gradient h-9 px-4 rounded-xl text-white font-semibold text-sm flex items-center gap-2"
            >
              <Zap size={14} />
              Upgrade
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="card-refined border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Faturas do mês</CardTitle>
          <CardDescription className="text-xs">Histórico de cobranças do período atual</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">Nenhuma fatura para este mês.</div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => {
                const parsedDue = inv.due_date ? new Date(inv.due_date) : null;
                const displayDue = parsedDue && parsedDue.getTime() > Date.now() ? parsedDue : addMonths(new Date(), 1);
                return (
                  <div key={inv.ref} className="rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{inv.description ?? `Fatura ${inv.display_id ?? ""}`}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Vencimento: {format(displayDue, "dd/MM/yyyy")}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">
                          {(inv.currency ?? "BRL").toUpperCase()} {(inv.amount / 100).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-400">{inv.status ?? "—"}</div>
                      </div>
                      <button
                        className="brand-soft-button h-8 w-8 flex items-center justify-center rounded-lg border transition-colors"
                        onClick={async () => {
                          try {
                            const blob = await BillingService.downloadInvoice(inv.ref);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `invoice_${inv.display_id ?? "invoice"}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch {
                            alert("Não foi possível baixar a fatura");
                          }
                        }}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
