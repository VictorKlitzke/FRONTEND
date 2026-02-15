import { Bell, Search, LogOut } from "lucide-react";
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
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    setNotificationLoading(true);
    NotificationService.getAll()
      .then((list) => {
        if (mounted) setNotifications(list);
      })
      .catch(() => {
        if (mounted) setNotifications([]);
      })
      .finally(() => {
        if (mounted) setNotificationLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const notificationsList = useMemo(() => notifications ?? [], [notifications]);

  return (
    <header className="border-b bg-white px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-base sm:text-lg font-semibold">
            {currentRoute?.label ?? "Dashboard"}
          </h1>
          <span className="text-xs sm:text-sm text-slate-500">
            Gestão inteligente do seu negócio
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="pl-9 w-56"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filteredMenu.length > 0 && (
            <div className="absolute mt-2 w-64 rounded-lg border bg-white shadow-lg z-50">
              {filteredMenu.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setQuery("");
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
          <DialogTrigger asChild>
            <button className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition">
              <Bell size={18} />
              {notificationsList.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Notificações</DialogTitle>
              <DialogDescription>Alertas importantes para sua empresa</DialogDescription>
            </DialogHeader>
            {notificationLoading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : notificationsList.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma notificação no momento.</div>
            ) : (
              <div className="space-y-3">
                {notificationsList.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-slate-700">{user?.name ?? "Usuário"}</span>
          <span className="text-xs text-slate-500">{user?.email ?? ""}</span>
        </div>

        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-sky-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 hidden sm:inline-flex">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
        <Button variant="outline" size="icon" onClick={handleLogout} className="sm:hidden">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
