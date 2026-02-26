import { useEffect, useMemo, useState } from "react";
import { useAlert } from "@/hooks/use-alert";
import type { SettingsDTO } from "@/feature/config/services/settings-service";
import { useSettingsStore } from "@/feature/config/store/settings-store";
import { AuthStore } from "@/feature/auth/stores/auth-store";
import { AgendaTab } from "@/feature/config/pages/components/agenda-tab";
import { BillingTab } from "@/feature/config/pages/components/billing-tab";
import { BrandingTab } from "@/feature/config/pages/components/branding-tab";
import { CompanyTab } from "@/feature/config/pages/components/company-tab";
import { Settings, Building2, CalendarDays, CreditCard, Palette, Loader2 } from "lucide-react";

const TABS = [
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "billing", label: "Cobrança", icon: CreditCard },
  { id: "branding", label: "Personalização", icon: Palette },
] as const;

export const ConfigPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("company");
  const { showAlert } = useAlert();
  const { settings, loading, setSettings, fetchSettings, updateSettings, fetchCompanyInfo, company } = useSettingsStore();

  const tabContent = useMemo(() => ({
    company: <CompanyTab settings={settings} onChange={(patch) => setSettings(patch)} company={company} />,
    agenda: <AgendaTab settings={settings} onChange={(patch) => setSettings(patch)} />,
    billing: <BillingTab />,
    branding: <BrandingTab settings={settings} onChange={(patch) => setSettings(patch)} />,
  } as const), [setSettings, settings, company]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchSettings();
        const authUserId = AuthStore.getState().user?.id;
        if (authUserId) await fetchCompanyInfo(authUserId);
      } catch (error) {
        console.error(error);
        showAlert({ title: "Erro", message: "Não foi possível carregar as configurações", type: "error" });
      }
    };
    loadSettings();
  }, [fetchSettings, fetchCompanyInfo, settings.company_id, showAlert]);

  const handleSave = async () => {
    try {
      const payload: SettingsDTO = {
        brand_name: settings.brand_name?.trim() || null,
        primary_color: settings.primary_color?.trim() || null,
        secondary_color: settings.secondary_color?.trim() || null,
        logo_url: settings.logo_url?.trim() || null,
        favicon_url: settings.favicon_url?.trim() || null,
        custom_domain: settings.custom_domain?.trim() || null,
        email_from_name: settings.email_from_name?.trim() || null,
        email_from_address: settings.email_from_address?.trim() || null,
        public_start_time: settings.public_start_time?.trim() || null,
        public_end_time: settings.public_end_time?.trim() || null,
        public_slot_minutes: settings.public_slot_minutes ?? null,
        public_working_days: settings.public_working_days?.trim() || null,
        segment: settings.segment?.trim() || null,
        phone: settings.phone?.trim() || null,
        email: settings.email?.trim() || null,
        header_bg_color: settings.header_bg_color?.trim() || null,
        login_bg_color: settings.login_bg_color?.trim() || null,
        register_bg_color: settings.register_bg_color?.trim() || null,
        empresa_bg_color: settings.empresa_bg_color?.trim() || null,
      };
      await updateSettings(payload);
      showAlert({ title: "Sucesso", message: "Configurações salvas", type: "success" });
    } catch {
      showAlert({ title: "Erro", message: "Não foi possível salvar as configurações", type: "error" });
    }
  };

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-5">
      {/* Page Header */}
      <div className="page-feature-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: "var(--brand-gradient-main)", boxShadow: "0 4px 12px rgba(var(--brand-primary-rgb, 5, 150, 105), 0.28)" }}
          >
            <Settings size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Configurações</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gerencie as preferências da sua conta</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-gradient h-10 px-5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed sm:shrink-0"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${isActive
                  ? "config-tab-button-active"
                  : "config-tab-button bg-white border-slate-200 text-slate-600"
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tabContent[activeTab]}
    </div>
  );
};
