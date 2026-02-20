import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import PublicLinkGenerator from "./public-link-generator";

interface CompanyTabProps {
  settings: SettingsDTO;
  onChange: (patch: Partial<SettingsDTO>) => void;
}

export const CompanyTab = ({ settings, onChange }: CompanyTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Perfil da empresa</CardTitle>
      <CardDescription>Dados básicos e identidade do negócio</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome da empresa</Label>
          <Input
            placeholder="AgendaPro Studios"
            value={settings.brand_name ?? ""}
            onChange={(e) => onChange({ brand_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Segmento</Label>
          <select
            className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm"
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
          <Label>CNPJ</Label>
          <Input placeholder="00.000.000/0001-00" disabled value={settings.phone ?? ""}/>
        </div>
        <div className="space-y-2">
          <Label>Endereço</Label>
          <Input placeholder="Rua Exemplo, 123" disabled />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input placeholder="São Paulo" disabled />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input placeholder="SP" disabled />
        </div>
        <div className="space-y-2">
          <Label>Fuso horário</Label>
          <Input placeholder="America/Sao_Paulo" disabled />
        </div>
      </div>
      <Separator />
      {/* Public link generator */}
      <PublicLinkGenerator settings={settings} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Logo da empresa</p>
          <p className="text-xs text-muted-foreground">PNG ou JPG até 2MB</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="https://.../logo.png"
            value={settings.logo_url ?? ""}
            onChange={(e) => onChange({ logo_url: e.target.value })}
            className="w-full sm:w-64"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);
