import { NavLink } from "react-router-dom";
import { Calendar, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { menuItens } from "../shared/navigation/menu";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { Sidebar, SidebarContent } from "./ui/sidebar";
import { getSegmentLabels, isCasesEnabled } from "@/shared/segments/segment-labels";

const NAV_SECTIONS: { label: string; paths: string[] }[] = [
  { label: "Principal", paths: ["/dashboard", "/appointments"] },
  { label: "Gestão", paths: ["/clientes", "/casos", "/profissionais", "/servicos"] },
  { label: "Estoque", paths: ["/produtos", "/estoque/movimentacoes"] },
  { label: "Sistema", paths: ["/permissoes", "/config"] },
];

export const SideBarComponents = () => {
  const { user } = AuthStore();
  const { settings } = useSettingsStore()
  const role = (user?.tipoConta ?? "").toUpperCase();
  const labels = getSegmentLabels(settings?.segment);

  const visibleItems = menuItens.filter((item) => {
    if (item.label === "Casos" && !isCasesEnabled(settings?.segment)) return false;
    return !item.roles || item.roles.map((r) => r.toUpperCase()).includes(role);
  });

  const brandName = settings?.brand_name ?? "AgendaPro";

  const resolveLabel = (label: string) => {
    switch (label) {
      case "Clientes": return labels.clients.plural;
      case "Profissionais": return labels.professionals.plural;
      case "Serviços": return labels.services.plural;
      case "Agenda": return labels.appointments.plural;
      case "Casos": return labels.cases.plural;
      default: return label;
    }
  };

  const renderedPaths = new Set<string>();

  return (
    <Sidebar
      className="sidebar-theme-border border-r"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Brand area */}
      <div className="sidebar-theme-border h-18 flex items-center justify-between px-5 border-b">
        <div className="flex items-center gap-3">
          <div
            className="sidebar-brand-icon h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ boxShadow: "0 4px 14px rgba(var(--brand-primary-rgb, 5, 150, 105), 0.35)" }}
          >
            <Calendar size={19} />
          </div>
          <div>
            <span className="font-bold text-[17px] tracking-tight gradient-text leading-none">{brandName}</span>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Gestão inteligente</div>
          </div>
        </div>
        <div
          className="sidebar-pro-badge flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
        >
          <Zap className="h-2.5 w-2.5" />
          PRO
        </div>
      </div>

      <SidebarContent className="px-3 pt-2 pb-4">
        <nav className="flex flex-col">
          {NAV_SECTIONS.map((section) => {
            const sectionItems = visibleItems.filter((item) =>
              section.paths.includes(item.path)
            );

            if (sectionItems.length === 0) return null;

            sectionItems.forEach((item) => renderedPaths.add(item.path));

            return (
              <div key={section.label}>
                <span className="nav-section-label">{section.label}</span>
                <div className="flex flex-col gap-0.5">
                  {sectionItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        style={{ animationDelay: `${index * 0.04}s` }}
                        className={({ isActive }) =>
                          cn(
                            "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                            isActive
                              ? "sidebar-active-item"
                              : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-100/80 hover:bg-slate-50/80"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                                isActive ? "sidebar-active-icon" : "sidebar-icon-inactive"
                              )}
                            >
                              <Icon size={15} />
                            </div>
                            <span className="flex-1">{resolveLabel(item.label)}</span>
                            {isActive && (
                              <div className="sidebar-active-dot h-1.5 w-1.5 rounded-full shrink-0" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Ungrouped items */}
          {visibleItems
            .filter((item) => !renderedPaths.has(item.path))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border mt-0.5",
                      isActive
                        ? "sidebar-active-item"
                        : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-100/80 hover:bg-slate-50/80"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                          isActive ? "sidebar-active-icon" : "sidebar-icon-inactive"
                        )}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="flex-1">{resolveLabel(item.label)}</span>
                      {isActive && (
                        <div className="sidebar-active-dot h-1.5 w-1.5 rounded-full shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>
      </SidebarContent>

      {/* Bottom user area */}
      <div className="sidebar-theme-border border-t px-4 py-4">
        <div
          className="sidebar-user-card rounded-xl p-3 flex items-center gap-3"
        >
          <div
            className="sidebar-user-avatar h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {(user?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 truncate">{user?.name ?? "Usuário"}</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{user?.tipoConta ?? ""}</div>
          </div>
          <div className="sidebar-online-dot h-2 w-2 rounded-full shrink-0" title="Online" />
        </div>
      </div>
    </Sidebar>
  );
};
