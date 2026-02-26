import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAlert } from "@/hooks/use-alert";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import { Copy, Link, CheckCheck } from "lucide-react";

interface Props { settings: SettingsDTO }

export const PublicLinkGenerator = ({ settings }: Props) => {
  const user = AuthStore.getState().user;
  const initialCompanyId = String(settings.company_id ?? user?.empresaId ?? "");
  const [companyId, setCompanyId] = useState<string>(initialCompanyId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (companyId.trim()) return;
    const fallbackCompanyId = settings.company_id ?? user?.empresaId;
    if (fallbackCompanyId && Number(fallbackCompanyId) > 0) setCompanyId(String(fallbackCompanyId));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, settings.company_id, user?.empresaId]);

  const compose = () => {
    const base = `${window.location.origin}/public/appointment`;
    const parts: string[] = [];
    if (companyId) parts.push(`company=${encodeURIComponent(companyId)}`);
    return parts.length ? `${base}?${parts.join("&")}` : base;
  };

  const { showAlert } = useAlert();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compose());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showAlert({ title: "Link copiado", message: "Link público copiado para a área de transferência", type: "success" });
    } catch {
      showAlert({ title: "Erro", message: "Não foi possível copiar o link", type: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="brand-icon-soft-box h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
          <Link size={13} className="brand-icon-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Link de agendamento público</p>
          <p className="text-xs text-slate-400">Compartilhe com seus clientes para que possam agendar</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value.replace(/\D/g, ""))}
          placeholder="ID da empresa"
          className="brand-input-focus w-36 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700"
        />
        <Input
          readOnly
          value={compose()}
          className="flex-1 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-mono text-slate-600"
        />
        <button
          onClick={handleCopy}
          className={`h-10 px-4 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 shrink-0
            ${copied
              ? "brand-soft-button-active"
              : "brand-soft-button"
            }`}
        >
          {copied ? <><CheckCheck size={13} />Copiado!</> : <><Copy size={13} />Copiar</>}
        </button>
      </div>
    </div>
  );
};

export default PublicLinkGenerator;
