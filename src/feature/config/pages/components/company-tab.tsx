import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2 } from "lucide-react";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import type { EmpresaDTO } from "@/feature/empresa/services/empresa-service";
import PublicLinkGenerator from "./public-link-generator";
import { WhatsappConnectionCard } from "./whatsapp-connection-card";

interface CompanyTabProps {
  settings: SettingsDTO;
  onChange: (patch: Partial<SettingsDTO>) => void;
  company?: EmpresaDTO | null;
}

export const CompanyTab = ({ settings, onChange, company }: CompanyTabProps) => {
  const displayBrandName = (settings.brand_name && settings.brand_name.trim()) ? settings.brand_name : company?.name ?? "";

  return (
    <Card className="card-refined border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="brand-icon-gradient h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0"
          >
            <Building2 size={16} />
          </div>
          <div>
            <CardTitle className="text-base">Perfil da empresa</CardTitle>
            <CardDescription className="text-xs">Dados básicos e identidade do negócio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Nome da empresa</Label>
            <Input
              placeholder="AgendaPro Studios"
              value={displayBrandName}
              onChange={(e) => onChange({ brand_name: e.target.value })}
              className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Segmento</Label>
            <select
              className="brand-input-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none transition-all"
              value={settings.segment ?? ""}
              onChange={(e) => onChange({ segment: e.target.value })}
            >
              <option value="">Selecione</option>
              <option value="beauty-salon">Salão de beleza</option>
              <option value="nails">Unhas</option>
              <option value="lashes">Cílios</option>
              <option value="barbershop">Barbearia</option>
              <option value="law">Advocacia</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">CNPJ</Label>
            <Input placeholder="00.000.000/0001-00" disabled value={company?.cnpj}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/30 text-slate-500" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Endereço</Label>
            <Input placeholder="Rua Exemplo, 123" disabled value={company?.address}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/30 text-slate-500" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Cidade</Label>
            <Input placeholder="São Paulo" disabled value={company?.city}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/30 text-slate-500" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Estado</Label>
            <Input placeholder="SP" disabled value={company?.state ?? ""}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/30 text-slate-500" />
          </div>
        </div>
        <Separator />
        <WhatsappConnectionCard companyId={company?.id} />
        <Separator />
        <PublicLinkGenerator settings={settings} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Logo da empresa</p>
            <p className="text-xs text-slate-400">PNG ou JPG até 2MB</p>
          </div>
          <Input
            placeholder="https://.../logo.png"
            value={settings.logo_url ?? ""}
            onChange={(e) => onChange({ logo_url: e.target.value })}
            className="brand-input-focus h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all w-full sm:w-72"
          />
        </div>
      </CardContent>
    </Card>
  );
};
