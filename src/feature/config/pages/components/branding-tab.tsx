import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import type { SettingsDTO } from "@/feature/config/services/settings-service";

interface BrandingTabProps {
  settings: SettingsDTO;
  onChange: (patch: Partial<SettingsDTO>) => void;
}

export const BrandingTab = ({ settings, onChange }: BrandingTabProps) => {
  return (
    <div className="space-y-5">
      {/* Brand Colors */}
      <Card className="card-refined border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="brand-icon-gradient h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0">
              <Palette size={16} />
            </div>
            <div>
              <CardTitle className="text-base">Cores da marca</CardTitle>
              <CardDescription className="text-xs">Tom principal e secundário do sistema</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Cor primária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color || "#059669"}
                  onChange={(e) => onChange({ primary_color: e.target.value })}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-0.5 bg-white"
                />
                <Input
                  value={settings.primary_color || ""}
                  onChange={(e) => onChange({ primary_color: e.target.value })}
                  placeholder="#059669"
                  className="brand-input-focus h-9 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Cor secundária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondary_color || "#0d9488"}
                  onChange={(e) => onChange({ secondary_color: e.target.value })}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-0.5 bg-white"
                />
                <Input
                  value={settings.secondary_color || ""}
                  onChange={(e) => onChange({ secondary_color: e.target.value })}
                  placeholder="#0d9488"
                  className="brand-input-focus h-9 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
};
