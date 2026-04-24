import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { SideBarComponents } from "../components/sidebar"
import { HeaderComponents } from "../components/header"
import { SidebarProvider } from "../components/ui/sidebar"
import { AuthStore } from "@/feature/auth/stores/auth-store"
import { BillingService } from "@/feature/billing/services/billing-service"
import { useEmpresaStore } from "@/feature/empresa/stores/empresa-store"
import { useSettingsStore } from "@/feature/config/store/settings-store"
import { isPublicScheduleConfigured } from "@/feature/config/utils/public-schedule-setup"
import { useAlert } from "@/hooks/use-alert"

export const PrivateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, initialized, bootstrap, logout, user } = AuthStore();
  const fetchCompanyByUserId = useEmpresaStore((state) => state.fetchByUserId);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const settings = useSettingsStore((state) => state.settings);
  const { showAlert } = useAlert();
  const [settingsReady, setSettingsReady] = useState(false);
  const setupReminderShownRef = useRef(false);
  const setupRedirectDoneRef = useRef(false);

  useEffect(() => {
    if (!initialized) {
      bootstrap();
    }
  }, [bootstrap, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setSettingsReady(false);
    void fetchSettings().finally(() => {
      setSettingsReady(true);
    });
  }, [isAuthenticated, fetchSettings]);

  useEffect(() => {
    if (!isAuthenticated || !settingsReady) return;

    if (location.pathname.startsWith("/config")) return;
    if (location.pathname.startsWith("/primeiro-acesso")) return;
    if (location.pathname === "/inactive") return;

    const hasPublicSchedule = isPublicScheduleConfigured(settings);
    if (hasPublicSchedule) return;

    if (!setupReminderShownRef.current) {
      showAlert({
        title: "Finalize sua agenda pública",
        message: "Configure dias e horários de atendimento para liberar o agendamento online.",
        type: "warning",
      });
      setupReminderShownRef.current = true;
    }

    if (!setupRedirectDoneRef.current) {
      setupRedirectDoneRef.current = true;
      navigate("/config?tab=agenda&firstSetup=1", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, settings, settingsReady, showAlert]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const idleTimeMs = 5 * 60 * 1000;
    let timeoutId: number | undefined;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        navigate("/inactive", { replace: true });
        logout();
      }, idleTimeMs);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.tipoConta?.toLowerCase() === "admin") return;
    if (location.pathname === "/planos") return;
    if (location.pathname === "/empresa/cadastro") return;

    const searchParams = new URLSearchParams(location.search);
    const successCheckout = searchParams.get("success") === "1";

    const checkPlan = async () => {
        if (!user?.id) return;

        const company = await fetchCompanyByUserId(user.id);
        if (!company?.id) {
          navigate("/empresa/cadastro", { replace: true });
          return;
        }

        const status = await BillingService.getStatus();
        const planStatus = String(status?.plan?.status ?? "").toLowerCase();
        const planCode = String(status?.plan?.plan_code ?? "").toLowerCase();
        const periodEnd = status?.plan?.current_period_end;
        const isActive = planStatus === "active" || planStatus === "trialing";
        const hasPlan = planCode.length > 0;

        if (planCode === "trial" && planStatus === "trialing" && periodEnd) {
          const now = new Date();
          const end = new Date(periodEnd);
          if (now > end) {
            navigate("/planos", { replace: true });
            return;
          }
        }

        if (!isActive || !hasPlan) navigate("/planos", { replace: true });
    };

    if (successCheckout) {
      let attempts = 0;
      const maxAttempts = 30;

      const pollStatus = async () => {
        attempts += 1;
        try {
          const status = await BillingService.getStatus();
          const planStatus = String(status?.plan?.status ?? "").toLowerCase();
          const isActive = planStatus === "active" || planStatus === "trialing";
          if (isActive) {
            navigate("/dashboard", { replace: true });
            return;
          }
        } catch {
          // ignore and retry
        }

        if (attempts >= maxAttempts) {
          navigate("/planos", { replace: true });
          return;
        }

        setTimeout(pollStatus, 2000);
      };

      pollStatus();
      return;
    }

    checkPlan();
  }, [fetchCompanyByUserId, isAuthenticated, location.pathname, location.search, navigate, user?.id, user?.tipoConta]);

  if (!initialized) {
    return null;
  }


  return (
    <SidebarProvider className="min-h-0">
      <SideBarComponents />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderComponents />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 main-bg">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}