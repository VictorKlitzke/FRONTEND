import { api } from "@/app/api";
import type { EmpresaDTO } from "@/feature/empresa/services/empresa-service";

export type SettingsDTO = {
    id?: number;
    company_id?: number;
    brand_name?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    logo_url?: string | null;
    favicon_url?: string | null;
    custom_domain?: string | null;
    email_from_name?: string | null;
    email_from_address?: string | null;
    public_start_time?: string | null;
    public_end_time?: string | null;
    public_slot_minutes?: number | null;
    public_working_days?: string | null;
    segment?: string | null;
    phone?: string | null;
    email?: string | null;
    /** Background color/gradient overrides for specific pages */
    header_bg_color?: string | null;
    login_bg_color?: string | null;
    register_bg_color?: string | null;
    empresa_bg_color?: string | null;
};

type ApiPayload<T> = {
    statusCode?: number;
    data?: T;
};

export const SettingsService = {
    async get(): Promise<SettingsDTO | null> {
        const { data } = await api.get<SettingsDTO | ApiPayload<SettingsDTO | null>>("/settings");
        if (data && "data" in (data as ApiPayload<SettingsDTO | null>)) {
            return (data as ApiPayload<SettingsDTO | null>).data ?? null;
        }
        return (data as SettingsDTO) ?? null;
    },

    async update(payload: SettingsDTO): Promise<SettingsDTO | null> {
        const { data } = await api.put<SettingsDTO | ApiPayload<SettingsDTO | null>>("/settings", payload);
        if (data && "data" in (data as ApiPayload<SettingsDTO | null>)) {
            return (data as ApiPayload<SettingsDTO | null>).data ?? null;
        }
        return (data as SettingsDTO) ?? null;
    },

    async getByUserId(userId: number): Promise<EmpresaDTO | null> {
        const { data } = await api.get(`/companies/user/${userId}`);
        const resolved = data.data;
        if (Array.isArray(resolved)) return resolved.length > 0 ? (resolved[0] as EmpresaDTO) : null;
        return resolved as EmpresaDTO | null;
    },
};
