import { api } from "../../../app/api";

export interface EmpresaDTO {
    id?: number;
    name: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    userId: number;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/** Empresa só existe no app quando o backend retornou um id numérico válido. */
export function hasRegisteredCompany(company: EmpresaDTO | null | undefined): boolean {
    const id = company?.id;
    return typeof id === "number" && Number.isFinite(id) && id > 0;
}

function isCompanyRow(row: unknown): row is Record<string, unknown> {
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;
    const id = Number((row as Record<string, unknown>).id);
    return Number.isFinite(id) && id > 0;
}

function rowToEmpresaDTO(row: Record<string, unknown>): EmpresaDTO {
    return {
        id: Number(row.id),
        name: String(row.name ?? ""),
        cnpj: String(row.cnpj ?? ""),
        address: String(row.address ?? ""),
        city: String(row.city ?? ""),
        state: String(row.state ?? ""),
        userId: Number(row.user_id ?? row.userId ?? 0),
        active: row.active === undefined ? undefined : Boolean(row.active),
        createdAt: row.created_at != null ? String(row.created_at) : row.createdAt != null ? String(row.createdAt) : undefined,
        updatedAt: row.updated_at != null ? String(row.updated_at) : row.updatedAt != null ? String(row.updatedAt) : undefined,
    };
}

/** Resposta típica do backend Slim: `{ statusCode, data: ... }` ou lista/entidade crua. */
export function normalizeCompanyApiEnvelope(raw: unknown): EmpresaDTO | null {
    if (raw == null) return null;
    if (typeof raw === "object" && raw !== null && "data" in raw) {
        return pickCompanyFromPayload((raw as { data: unknown }).data);
    }
    return pickCompanyFromPayload(raw);
}

function pickCompanyFromPayload(payload: unknown): EmpresaDTO | null {
    if (payload == null) return null;
    if (Array.isArray(payload)) {
        for (const row of payload) {
            if (isCompanyRow(row)) return rowToEmpresaDTO(row);
        }
        return null;
    }
    if (isCompanyRow(payload)) return rowToEmpresaDTO(payload);
    return null;
}

export class EmpresaService {
    static async createEmpresa(data: EmpresaDTO) {
        const response = await api.post('/companies', data);
        return response.data;
    }

    static async getAll(): Promise<EmpresaDTO[]> {
        const { data } = await api.get('/companies');
        return data;
    }

    static async getByUserId(userId: number): Promise<EmpresaDTO | null> {
        const { data } = await api.get(`/companies/user/${userId}`);
        // Normalize different backend shapes:
        // - { data: { ... } }
        // - { data: [ ... ] }
        // - [ ... ]
        // - { ... }
        const payload = data?.data ?? data;
        return pickCompanyFromPayload(payload);
    }

    static async update(id: number, data: Omit<EmpresaDTO, "userId" | "id">): Promise<EmpresaDTO> {
        const { data: response } = await api.put(`/companies/${id}`, data);
        return response;
    }

    static async inactivate(id: number): Promise<void> {
        await api.patch(`/companies/${id}/inactivate`);
    }
}
