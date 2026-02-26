import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { SideBarComponents } from "../components/sidebar"
import { HeaderComponents } from "../components/header"
import { SidebarProvider } from "../components/ui/sidebar"
import { AuthStore } from "@/feature/auth/stores/auth-store"
import { BillingService } from "@/feature/billing/services/billing-service"
import { useSettingsStore } from "@/feature/config/store/settings-store"

export const PrivateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, initialized, bootstrap, logout, user } = AuthStore();
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

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
    void fetchSettings();
  }, [isAuthenticated, fetchSettings]);

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

    const searchParams = new URLSearchParams(location.search);
    const successCheckout = searchParams.get("success") === "1";

    const checkPlan = async () => {
      try {
        const status = await BillingService.getStatus();
        const planStatus = status?.plan?.status ?? "";
        const isActive = planStatus === "active" || planStatus === "trialing";
        if (!isActive) {
          navigate("/planos", { replace: true });
        }
      } catch {
        navigate("/planos", { replace: true });
      }
    };

    if (successCheckout) {
      let attempts = 0;
      const maxAttempts = 6; 

      const pollStatus = async () => {
        attempts += 1;
        try {
          const status = await BillingService.getStatus();
          const planStatus = status?.plan?.status ?? "";
          const isActive = planStatus === "active" || planStatus === "trialing";
          if (isActive) return;
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
  }, [isAuthenticated, location.pathname, location.search, navigate, user?.tipoConta]);

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