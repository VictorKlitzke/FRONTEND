import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store";
import { useAlert } from "@/hooks/use-alert";
import { BillingService, type PlanCode } from "../services/billing-service";
import { AuthStore } from "@/feature/auth/stores/auth-store";

const plans = [
  {
    code: "basic" as PlanCode,
    name: "Básico",
    price: "R$ 39,90",
    description: "Para começar",
    limits: ["200 agendamentos/mês", "1 unidade", "2 profissionais"],
  },
  {
    code: "medium" as PlanCode,
    name: "Médio",
    price: "R$ 49,90",
    description: "Para equipes em crescimento",
    limits: ["800 agendamentos/mês", "3 unidades", "10 profissionais"],
  },
  {
    code: "advanced" as PlanCode,
    name: "Avançado",
    price: "R$ 79,90",
    description: "Para operação completa",
    limits: ["2000 agendamentos/mês", "unidades ilimitadas", "profissionais ilimitados"],
  },
];

export const PlanSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const { company, fetchByUserId } = useEmpresaStore();
  const { user } = AuthStore();
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);

  useEffect(() => {
    if (!company?.id && user?.id) {
      fetchByUserId(user.id);
    }
  }, [company?.id, fetchByUserId, user?.id]);

  const statusMessage = useMemo(() => {
    if (searchParams.get("success")) return "Plano selecionado. Conclua o pagamento no Stripe.";
    if (searchParams.get("canceled")) return "Checkout cancelado. Escolha um plano para continuar.";
    return null;
  }, [searchParams]);

  const handleSelect = async (plan: PlanCode) => {
    if (!company?.id) {
      showAlert({ title: "Empresa não encontrada", message: "Cadastre sua empresa primeiro.", type: "destructive" });
      navigate("/empresa/cadastro");
      return;
    }

    try {
      setLoadingPlan(plan);
      const response = await BillingService.createCheckoutSession(plan, company.id);
      if (response?.url) {
        window.location.href = response.url;
      } else {
        showAlert({ title: "Erro", message: "Não foi possível iniciar o checkout.", type: "destructive" });
      }
    } catch {
      showAlert({ title: "Erro", message: "Falha ao iniciar o checkout.", type: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Escolha seu plano</h1>
          <p className="text-sm text-muted-foreground">
            Ao criar sua conta, voce recebe automaticamente 7 dias gratis no plano Free.
          </p>
          {statusMessage ? (
            <p className="text-sm text-slate-600">{statusMessage}</p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.code} className="border-slate-200">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold">{plan.price}</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.limits.map((limit) => (
                    <li key={limit}>• {limit}</li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSelect(plan.code)}
                  disabled={loadingPlan === plan.code}
                >
                  {loadingPlan === plan.code ? "Redirecionando..." : "Selecionar plano"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
