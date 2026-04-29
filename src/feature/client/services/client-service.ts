import { api } from "../../../app/api";

export interface ClientDTO {
  id?: number;
  name: string;
  phone?: string;
  origem?: string;
}

export type CreateClientRequest = Omit<ClientDTO, "id" | "active"> & { password?: string };
export type UpdateClientRequest = CreateClientRequest;
export interface CreateClientResponse {
  id: number;
}

function normalizeClientBody(payload: CreateClientRequest): CreateClientRequest {
  const digits = String(payload.phone ?? "").replace(/\D/g, "");
  return {
    ...payload,
    phone: digits.length > 0 ? digits : "",
  };
}

export class ClientService {
  static async getAll(): Promise<ClientDTO[]> {
    const { data } = await api.get(`/clients`);
    return data.data ?? [];
  }

  static async getById(id: number): Promise<ClientDTO> {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  }

  static async create(payload: CreateClientRequest): Promise<CreateClientResponse> {
    const { data } = await api.post(`/clients`, normalizeClientBody(payload));
    return data?.data ?? data;
  }

  static async update(id: number, payload: UpdateClientRequest): Promise<ClientDTO> {
    const { data } = await api.put(`/clients/${id}`, normalizeClientBody(payload));
    return data?.data ?? data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  }
}
