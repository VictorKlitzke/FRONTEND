import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { SideBarComponents } from "../components/sidebar"
import { HeaderComponents } from "../components/header"
import { SidebarProvider } from "../components/ui/sidebar"
import { AuthStore } from "@/feature/auth/stores/auth-store"

export const PrivateLayout = () => {
  const navigate = useNavigate();
  const { token, logout } = AuthStore();

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