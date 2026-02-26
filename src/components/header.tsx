import { Bell, Search, LogOut, Sparkles, CalendarDays } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItens } from "../shared/navigation/menu";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useMemo, useState, useEffect } from "react";
import { NotificationService, type NotificationDTO } from "@/feature/notifications/services/notification-service";

function useTodayLabel() {
  return useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
  }, []);
}

export const HeaderComponents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = AuthStore();
  const [query, setQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const role = (user?.tipoConta ?? "").toUpperCase();

  const currentRoute = menuItens.find(
    (item) => item.path === location.pathname
  );

  const filteredMenu = useMemo(() => {
    const visible = menuItens.filter(
      (item) => !item.roles || item.roles.map((r) => r.toUpperCase()).includes(role)
    );
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return visible.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, role]);

  const initials = user?.name
    ? user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "US";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    setNotificationLoading(true);
    NotificationService.getAll()
      .then((list) => { if (mounted) setNotifications(list); })
      .catch(() => { if (mounted) setNotifications([]); })
      .finally(() => { if (mounted) setNotificationLoading(false); });
    return () => { mounted = false; };
  }, []);

  const notificationsList = useMemo(() => notifications ?? [], [notifications]);
  const todayLabel = useTodayLabel();

  return (
    <header className="header-glass brand-header sticky top-0 z-40 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 min-h-16">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
            {currentRoute?.label ?? "Dashboard"}
          </h1>
          <span className="text-xs text-slate-400 inline-flex items-center gap-1.5 mt-0.5">
            <Sparkles className="h-3 w-3 header-accent-icon shrink-0" />
            Gestão inteligente do seu negócio
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Date chip */}
        <span className="date-chip hidden lg:inline-flex">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {todayLabel}
        </span>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar páginas..."
            className="header-search-input pl-9 w-48 h-9 rounded-xl border-slate-200 bg-white/70 hover:bg-white focus:bg-white transition-all text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filteredMenu.length > 0 && (
            <div className="absolute mt-2 w-64 rounded-xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => { navigate(item.path); setQuery(""); }}
                    className="header-menu-item w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors group"
                  >
                    <div className="header-menu-icon h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center transition-colors shrink-0">
                      <Icon size={14} className="text-slate-500 transition-colors" />
                    </div>
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
          <DialogTrigger asChild>
            <button className="header-bell relative h-9 w-9 flex items-center justify-center rounded-xl transition-colors border border-transparent">
              <Bell size={17} className="text-slate-600" />
              {notificationsList.length > 0 && (
                <span className="notification-dot absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="header-dialog-content rounded-2xl">
            <DialogHeader>
              <DialogTitle className="gradient-text">Notificações</DialogTitle>
              <DialogDescription>Alertas importantes para sua empresa</DialogDescription>
            </DialogHeader>
            {notificationLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : notificationsList.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificationsList.map((item) => (
                  <div key={item.id} className="header-notification-item rounded-xl border p-3 transition-colors">
                    <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Separator */}
        <div className="hidden sm:block h-6 w-px bg-slate-200/80" />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-slate-800">{user?.name ?? "Usuário"}</span>
          <span className="text-[11px] text-slate-400 truncate max-w-30">{user?.email ?? ""}</span>
        </div>

        {/* Avatar */}
        <Avatar className="header-avatar h-9 w-9 cursor-default">
          <AvatarFallback className="text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Logout */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 hidden sm:inline-flex h-9 rounded-xl border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all text-slate-500 text-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="sm:hidden h-9 w-9 rounded-xl border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
