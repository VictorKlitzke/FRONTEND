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
        return data.data ?? null;
    }

    static async update(id: number, data: Omit<EmpresaDTO, "userId" | "id">): Promise<EmpresaDTO> {
        const { data: response } = await api.put(`/companies/${id}`, data);
        return response;
    }

    static async inactivate(id: number): Promise<void> {
        await api.patch(`/companies/${id}/inactivate`);
    }
}
