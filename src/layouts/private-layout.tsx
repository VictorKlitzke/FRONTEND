import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { SideBarComponents } from "../components/sidebar"
import { HeaderComponents } from "../components/header"
import { SidebarProvider } from "../components/ui/sidebar"
import { AuthStore } from "@/feature/auth/stores/auth-store"
import { BillingService } from "@/feature/billing/services/billing-service"

export const PrivateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, user } = AuthStore();

  useEffect(() => {
    if (!token) return;
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
  }, [logout, navigate, token]);

  useEffect(() => {
    if (!token) return;
    if (user?.tipoConta?.toLowerCase() === "administrador") return;
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
      const maxAttempts = 6; // ~12s

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
  }, [location.pathname, location.search, navigate, token, user?.tipoConta]);


  return (
    <SidebarProvider className="min-h-0 bg-slate-50">
      <SideBarComponents />

      <div className="flex-1 flex flex-col">
        <HeaderComponents />

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}