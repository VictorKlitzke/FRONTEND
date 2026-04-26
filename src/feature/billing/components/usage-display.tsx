import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingService } from "../services/billing-service";
import type { UsageStats } from "../services/billing-service";
import { AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export function UsageDisplay() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [trialEndAt, setTrialEndAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getUsage();
      setUsage(data);
      const status = await BillingService.getStatus();
      setTrialEndAt(status?.plan?.current_period_end ?? null);
    } catch (error) {
      console.error("Erro ao buscar uso:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Agendamentos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const planNames = {
    trial: "Avaliação (Trial)",
    basic: "Básico",
    medium: "Médio",
    advanced: "Avançado",
  };

  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.remaining <= 0;
  const trialDaysLeft =
    usage.plan === "trial" && trialEndAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(trialEndAt).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          Agendamentos do Mês
        </CardTitle>
        <CardDescription>
          Plano {planNames[usage.plan]} - {usage.used} de {usage.limit} usados
        </CardDescription>
        {usage.plan === "trial" && (
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
            Você está no período de avaliação gratuito (7 dias)
            {trialEndAt
              ? ` até ${new Date(trialEndAt).toLocaleDateString("pt-BR")}`
              : ""}.
            {trialDaysLeft !== null ? ` Restam ${trialDaysLeft} dia(s).` : ""}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={Math.min(usage.percentage, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usage.used} usados</span>
            <span>{usage.remaining} restantes</span>
          </div>
        </div>

        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Você atingiu o limite do seu plano. Faça upgrade para continuar agendando.
            </AlertDescription>
          </Alert>
        )}

        {!isAtLimit && isNearLimit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Você está próximo do limite. Considere fazer upgrade.
            </AlertDescription>
          </Alert>
        )}

        {isAtLimit && (
          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => navigate("/planos")}
          >
            Fazer Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
