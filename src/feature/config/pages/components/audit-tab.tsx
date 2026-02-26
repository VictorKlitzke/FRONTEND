import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, LogIn, ShieldCheck, Zap } from "lucide-react";

const LOGS = [
  { icon: LogIn, label: "Login efetuado", detail: "Hoje, 09:12 · IP 192.168.1.4", color: "brand-success-box", iconColor: "brand-icon-primary" },
  { icon: ShieldCheck, label: "Permissões atualizadas", detail: "Ontem, 18:44 · Admin", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
  { icon: Zap, label: "Plano alterado", detail: "28/01/2026 · Upgrade para Pro", color: "bg-violet-50 border-violet-100", iconColor: "text-violet-600" },
];

export const AuditTab = () => (
  <Card className="card-refined border-0">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <div className="brand-icon-gradient h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0">
          <ClipboardList size={16} />
        </div>
        <div>
          <CardTitle className="text-base">Auditoria / Logs</CardTitle>
          <CardDescription className="text-xs">Atividades recentes da conta</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {LOGS.map(({ icon: Icon, label, detail, color, iconColor }) => (
        <div key={label} className={`rounded-xl border p-3 flex items-start gap-3 ${color}`}>
          <div className="h-7 w-7 rounded-lg bg-white/70 border border-white flex items-center justify-center shrink-0">
            <Icon size={13} className={iconColor} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
