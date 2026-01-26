import { NavLink } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "../lib/utils";
import { menuItens } from "../shared/navigation/menu";

export const SideBarComponents = () => {
  return (
    <aside className="w-64 border-r bg-white h-screen flex flex-col">
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
          <Calendar size={20} />
        </div>
        <span className="font-semibold text-lg">AgendaPro</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItens.map((item) => {
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
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
