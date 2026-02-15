import { useEffect, useState } from "react";
import { AcoesRapidas } from "../components/acoes-rapida";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardService, type DashboardMetrics } from "../services/dashboard-service";
import { useAlert } from "@/hooks/use-alert";

export const DashboardPage = () => {
  const { showAlert } = useAlert();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error(error);
        showAlert({ title: "Erro", message: "Não foi possível carregar o dashboard", type: "error" });
      }
    };

    load();
  }, [showAlert]);

  return (
    <>
      <AcoesRapidas />
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Agendamentos do dia</CardDescription>
              <CardTitle>{metrics?.appointmentsToday ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Clientes novos (hoje)</CardDescription>
              <CardTitle>{metrics?.newClientsToday ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Produtos em baixa</CardDescription>
              <CardTitle>{metrics?.lowStock?.length ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Taxa de cancelamento (30 dias)</CardDescription>
              <CardTitle>{metrics?.cancelRate?.rate ?? 0}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Serviços mais vendidos</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.topServices?.length ? (
                <ul className="space-y-3">
                  {metrics.topServices.map((service) => (
                    <li key={service.service_id} className="flex items-center justify-between">
                      <span>{service.service_name}</span>
                      <span className="text-sm text-muted-foreground">{service.total} vendas</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados no período</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos em baixa</CardTitle>
              <CardDescription>Estoque abaixo do mínimo</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.lowStock?.length ? (
                <ul className="space-y-3">
                  {metrics.lowStock.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.stock_quantity} unidades</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum produto em baixa</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}