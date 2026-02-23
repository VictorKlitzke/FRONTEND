import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BillingService } from "@/feature/billing/services/billing-service";
import { format, addMonths } from "date-fns";

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
      } catch (err) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobrança e plano</CardTitle>
        <CardDescription>Plano atual, upgrade e histórico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="text-lg font-semibold">Pro Mensal</p>
          </div>
          <Button onClick={() => navigate('/planos')}>Fazer upgrade</Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Faturas do mês</p>
          {loading ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : invoices.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhuma fatura para este mês.</div>
          ) : (
              invoices.map((inv) => {
                const parsedDue = inv.due_date ? new Date(inv.due_date) : null;
                const displayDue = parsedDue && parsedDue.getTime() > Date.now() ? parsedDue : addMonths(new Date(), 1);
                return (
                  <div key={inv.ref} className="rounded-md border p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{inv.description ?? `Fatura ${inv.display_id ?? ''}`}</div>
                      <div className="text-xs text-muted-foreground">Vencimento: {format(displayDue, "dd/MM")}</div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-sm font-semibold">{(inv.currency ?? "BRL").toUpperCase()} {(inv.amount/100).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{inv.status ?? "-"}</div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={async () => {
                          try {
                            const blob = await BillingService.downloadInvoice(inv.ref);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `invoice_${inv.display_id ?? 'invoice'}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Erro ao baixar fatura', err);
                            alert('Não foi possível baixar a fatura');
                          }
                        }}>Baixar</Button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
