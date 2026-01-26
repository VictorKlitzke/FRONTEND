import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { menuItens } from "../shared/navigation/menu";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";

export const HeaderComponents = () => {
  const location = useLocation();

  const currentRoute = menuItens.find(
    (item) => item.path === location.pathname
  );

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">
          {currentRoute?.label ?? "Dashboard"}
        </h1>
        <span className="text-sm text-slate-500">
          Gestão inteligente do seu negócio
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="pl-9 w-56"
          />
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition">
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-sky-500 text-white">
            VP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
