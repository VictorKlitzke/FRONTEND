import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { menuItens } from "../../../shared/navigation/menu";

export const AcoesRapidas = () => {
  const navigate = useNavigate();

  const quickActions = menuItens.filter(item => item.quick);

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="font-semibold mb-4">Ações Rápidas</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <Icon size={18} />
              </div>
              <span className="text-sm">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
