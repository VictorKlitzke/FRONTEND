import { api } from "../../../app/api";

export interface ServiceDTO {
  id?: number;
  companyId: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  active?: boolean;
  products?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateServiceRequest = Omit<ServiceDTO, "id" | "active" | "createdAt" | "updatedAt">;
export type UpdateServiceRequest = CreateServiceRequest;

export class ServiceService {
  static async getByCompany(companyId: number): Promise<ServiceDTO[]> {
    const { data } = await api.get(`/services/company/${companyId}`);
    const list = data?.dados ?? data?.data ?? data;
    if (!Array.isArray(list)) return [];
    return list;
  }

  static async getAll(companyId: number): Promise<ServiceDTO[]> {
    const { data } = await api.get(`/services/company/${companyId}`);
    const list = data?.dados ?? data?.data ?? data;
    if (!Array.isArray(list)) return [];
    return list;
  }

  static async getById(id: number): Promise<ServiceDTO> {
    const { data } = await api.get(`/services/${id}`);
    const item = data?.dados ?? data?.data ?? data;
    return Array.isArray(item) ? item[0] : item;
  }

  static async create(payload: CreateServiceRequest): Promise<ServiceDTO> {
    const { data } = await api.post(`/services`, payload);
    const item = data?.dados ?? data?.data ?? data;
    return item;
  }

  static async update(id: number, payload: UpdateServiceRequest): Promise<ServiceDTO> {
    const { data } = await api.put(`/services/${id}`, payload);
    const item = data?.dados ?? data?.data ?? data;
    return item;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  }
}
