import { useEffect, useState } from "react";
import { AcoesRapidas } from "../components/acoes-rapida";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardService, type DashboardMetrics } from "../services/dashboard-service";
import { useAlert } from "@/hooks/use-alert";
import { Calendar, Users, Package, TrendingDown, TrendingUp, ArrowUpRight, AlertTriangle } from "lucide-react";

const METRIC_CONFIGS = [
  {
    key: "appointmentsToday",
    label: "Agendamentos hoje",
    icon: Calendar,
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    trend: "+12%",
    trendUp: true,
  },
  {
    key: "newClientsToday",
    label: "Clientes novos",
    icon: Users,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
    trend: "+5%",
    trendUp: true,
  },
  {
    key: "lowStockCount",
    label: "Produtos em baixa",
    icon: Package,
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    trend: "Atenção",
    trendUp: false,
  },
  {
    key: "cancelRate",
    label: "Taxa cancelamento",
    icon: TrendingDown,
    color: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
    trend: "30 dias",
    trendUp: false,
  },
]

export const DashboardPage = () => {
  const { showAlert } = useAlert();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DashboardService.getMetrics();
        setMetrics(data);
        setTimeout(() => setVisible(true), 80);
      } catch (error) {
        console.error(error);
        showAlert({ title: "Erro", message: "Não foi possível carregar o dashboard", type: "error" });
      }
    };
    load();
  }, [showAlert]);

  const metricValues = {
    appointmentsToday: metrics?.appointmentsToday ?? 0,
    newClientsToday: metrics?.newClientsToday ?? 0,
    lowStockCount: metrics?.lowStock?.length ?? 0,
    cancelRate: `${metrics?.cancelRate?.rate ?? 0}%`,
  };

  const maxService = metrics?.topServices?.length
    ? Math.max(...metrics.topServices.map(s => s.total))
    : 1;

  return (
    <div className={`page-enter ${visible ? "" : "opacity-0"}`}>
      {/* Quick Actions */}
      <AcoesRapidas />

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* ── Metric Cards ── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {METRIC_CONFIGS.map((cfg, i) => {
            const Icon = cfg.icon;
            const value = metricValues[cfg.key as keyof typeof metricValues];

            return (
              <Card
                key={cfg.key}
                className={`metric-card card-hover border-0 shadow-sm animate-metric delay-${(i + 1) * 100}`}
                style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="metric-icon"
                      style={{ background: cfg.bg }}
                    >
                      <Icon size={20} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: cfg.trendUp ? "#059669" : cfg.color }}
                    >
                      {cfg.trendUp ? <TrendingUp size={12} /> : <ArrowUpRight size={12} className="rotate-90" />}
                      {cfg.trend}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                      {value}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{cfg.label}</div>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="mt-4 h-1 rounded-full" style={{ background: cfg.bg }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: "65%", background: cfg.color, opacity: 0.7 }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Top Services */}
          <Card className="border-0 shadow-sm card-hover animate-metric delay-500" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">Serviços mais vendidos</CardTitle>
                <span className="badge-success">Últimos 30 dias</span>
              </div>
            </CardHeader>
            <CardContent>
              {metrics?.topServices?.length ? (
                <div className="space-y-4">
                  {metrics.topServices.map((service, i) => {
                    const pct = Math.round((service.total / maxService) * 100);
                    const colors = ["#059669", "#0d9488", "#0891b2", "#6366f1", "#8b5cf6"];
                    const color = colors[i % colors.length];
                    return (
                      <div key={service.service_id} className="list-item-hover">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                            <span className="text-sm font-medium text-slate-800">{service.service_name}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color }}>{service.total}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-2xl mb-3 flex items-center justify-center" style={{ background: "rgba(5,150,105,0.08)" }}>
                    <TrendingUp size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Sem dados no período</p>
                  <p className="text-xs text-slate-300 mt-1">Os dados aparecerão após os primeiros agendamentos</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="border-0 shadow-sm card-hover animate-metric delay-600" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">Produtos em baixa</CardTitle>
                {metrics?.lowStock?.length ? (
                  <span className="badge-warning flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {metrics.lowStock.length} itens
                  </span>
                ) : (
                  <span className="badge-success">Tudo ok</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {metrics?.lowStock?.length ? (
                <div className="space-y-3">
                  {metrics.lowStock.map((item) => {
                    const stockPct = Math.min(100, Math.round((item.stock_quantity / 10) * 100));
                    const isLow = item.stock_quantity <= 3;
                    return (
                      <div key={item.id} className="list-item-hover">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isLow ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                            <span className="text-sm font-medium text-slate-800">{item.name}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLow ? "badge-danger" : "badge-warning"}`}>
                            {item.stock_quantity} un.
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${stockPct}%`,
                              background: isLow
                                ? "linear-gradient(90deg, #ef4444, #f87171)"
                                : "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-2xl mb-3 flex items-center justify-center" style={{ background: "rgba(5,150,105,0.08)" }}>
                    <Package size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Estoque saudável</p>
                  <p className="text-xs text-slate-300 mt-1">Nenhum produto abaixo do mínimo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
