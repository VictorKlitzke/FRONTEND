import { NavLink } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "../lib/utils";
import { menuItens } from "../shared/navigation/menu";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { Sidebar, SidebarContent } from "./ui/sidebar";
import { getSegmentLabels, isCasesEnabled } from "@/shared/segments/segment-labels";

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
      case "Clientes":
        return labels.clients.plural;
      case "Profissionais":
        return labels.professionals.plural;
      case "Serviços":
        return labels.services.plural;
      case "Agenda":
        return labels.appointments.plural;
      case "Casos":
        return labels.cases.plural;
      default:
        return label;
    }
  };


  return (
    <Sidebar className="bg-white border-r">
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
          <Calendar size={20} />
        </div>
        <span className="font-semibold text-lg">{brandName}</span>
      </div>

      <SidebarContent className="px-3 py-4">
        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                <Icon size={18} />
                {resolveLabel(item.label)}
              </NavLink>
            );
          })}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
};
