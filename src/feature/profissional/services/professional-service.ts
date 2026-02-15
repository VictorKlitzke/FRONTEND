import { api } from "../../../app/api";

export interface ProfessionalDTO {
  id?: number;
  companyId: number;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  available?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProfessionalRequest = Omit<ProfessionalDTO, "id" | "createdAt" | "updatedAt" | "active" | "available">;
export type UpdateProfessionalRequest = CreateProfessionalRequest;

export class ProfessionalService {
  static async getAll(): Promise<ProfessionalDTO[]> {
    const { data } = await api.get(`/profissionals`);
    const list = data?.dados ?? data?.data ?? data;
    if (!Array.isArray(list)) return [];
    return list.map(mapBackendProfessional);
  }

  static async getById(id: number): Promise<ProfessionalDTO> {
    const { data } = await api.get(`/profissionals/${id}`);
    const item = data?.dados ?? data?.data ?? data;
    return Array.isArray(item) ? mapBackendProfessional(item[0]) : mapBackendProfessional(item);
  }

  static async create(payload: CreateProfessionalRequest): Promise<ProfessionalDTO> {
    const { data } = await api.post(`/profissionals`, payload);
    const item = data?.dados ?? data?.data ?? data;
    return mapBackendProfessional(item);
  }

  static async update(id: number, payload: UpdateProfessionalRequest): Promise<ProfessionalDTO> {
    const { data } = await api.put(`/profissionals/${id}`, payload);
    console.log("Update response:", data);
    const item = data?.dados ?? data?.data ?? data;
    return mapBackendProfessional(item);
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/profissionals/${id}`);
  }
}

function mapBackendProfessional(raw: any): ProfessionalDTO {
  if (!raw) return {} as ProfessionalDTO;

  return {
    id: raw.id ?? raw.ID ?? undefined,
    companyId: raw.company_id ?? raw.companyId ?? 0,
    name: raw.name ?? raw.nome ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? raw.telefone ?? undefined,
    specialty: raw.specialty ?? raw.specialization ?? raw.especialidade ?? undefined,
    active: raw.active ?? raw.ativo ?? undefined,
    available: raw.available ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  } as ProfessionalDTO;
}
