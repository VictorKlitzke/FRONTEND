import { api } from "../../../app/api";

export interface ClientDTO {
  id?: number;
  name: string;
  phone?: string;
  origem?: string;
}

export type CreateClientRequest = Omit<ClientDTO, "id" | "active"> & { password?: string };
export type UpdateClientRequest = CreateClientRequest;

export class ClientService {
  static async getAll(): Promise<ClientDTO[]> {
    const { data } = await api.get(`/clients`);
    return data.data ?? [];
  }

  static async getById(id: number): Promise<ClientDTO> {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  }

  static async create(payload: CreateClientRequest): Promise<ClientDTO | boolean> {
    const response = await api.post(`/clients`, payload);
    return response.status === 201;
  }

  static async update(id: number, payload: UpdateClientRequest): Promise<ClientDTO> {
    console.log("Updating client", id, payload);
    const { data } = await api.put(`/clients/${id}`, payload);
    return data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  }
}
