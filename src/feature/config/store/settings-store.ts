import { create } from "zustand";
import { SettingsService, type SettingsDTO } from "../services/settings-service";
import { applyBranding } from "../utils/apply-branding";
import type { EmpresaDTO } from "@/feature/empresa/services/empresa-service";

const emptySettings: SettingsDTO = {
  brand_name: "",
  primary_color: "",
  secondary_color: "",
  logo_url: "",
  favicon_url: "",
  custom_domain: "",
  email_from_name: "",
  email_from_address: "",
  public_start_time: "",
  public_end_time: "",
  public_slot_minutes: null,
  public_working_days: "",
  segment: "",
  phone: "",
  email: "",
  header_bg_color: "",
  login_bg_color: "",
  register_bg_color: "",
  empresa_bg_color: "",
};

const normalizeSettings = (data?: SettingsDTO | null): SettingsDTO => ({
  brand_name: data?.brand_name ?? "",
  primary_color: data?.primary_color ?? "",
  secondary_color: data?.secondary_color ?? "",
  logo_url: data?.logo_url ?? "",
  favicon_url: data?.favicon_url ?? "",
  custom_domain: data?.custom_domain ?? "",
  email_from_name: data?.email_from_name ?? "",
  email_from_address: data?.email_from_address ?? "",
  public_start_time: data?.public_start_time ?? "",
  public_end_time: data?.public_end_time ?? "",
  public_slot_minutes: data?.public_slot_minutes ?? null,
  public_working_days: data?.public_working_days ?? "",
  segment: data?.segment ?? "",
  phone: data?.phone ?? "",
  email: data?.email ?? "",
  header_bg_color: data?.header_bg_color ?? "",
  login_bg_color: data?.login_bg_color ?? "",
  register_bg_color: data?.register_bg_color ?? "",
  empresa_bg_color: data?.empresa_bg_color ?? "",
});

const persistSettings = (data: SettingsDTO | null) => {
  if (data) {
    sessionStorage.setItem("settings-storage", JSON.stringify(data));
  }
};

interface SettingsState {
  settings: SettingsDTO;
  company: EmpresaDTO | null;
  loading: boolean;
  error: string | null;
  setSettings: (updater: Partial<SettingsDTO> | ((prev: SettingsDTO) => SettingsDTO)) => void;
  fetchSettings: () => Promise<SettingsDTO | null>;
  fetchCompanyInfo: (userId: number) => Promise<void>;
  updateSettings: (payload: SettingsDTO) => Promise<SettingsDTO | null>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: emptySettings,
  company: null,
  loading: false,
  error: null,

  setSettings: (updater) => {
    set((state) => ({
      settings: typeof updater === "function" ? updater(state.settings) : { ...state.settings, ...updater },
    }));
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await SettingsService.get();
      if (data) {
        set({ settings: normalizeSettings(data) });
        applyBranding(data);
        persistSettings(data);
      } else {
        set({ settings: emptySettings });
      }
      return data ?? null;
    } catch {
      set({ error: "Erro ao carregar configurações" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchCompanyInfo: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await SettingsService.getByUserId(userId);
      const companyPayload = data ?? null;
      set(() => ({ company: companyPayload }));
    } catch {
      set({ error: "Erro ao carregar informações da empresa" });
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (payload: SettingsDTO) => {
    set({ loading: true, error: null });
    try {
      const saved = await SettingsService.update(payload);
      if (saved) {
        set({ settings: normalizeSettings(saved) });
        applyBranding(saved);
        persistSettings(saved);
      }
      return saved ?? null;
    } catch {
      set({ error: "Erro ao salvar configurações" });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
