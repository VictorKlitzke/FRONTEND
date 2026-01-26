import { api } from "../../../app/api";

export interface ProfissionalDTO {
    id?: number;
    name: string;
    email?: string;
    phone: string;
    job: string;
    empresaId?: number;
}

export class ProfissionalService {
    static async getProfissionais(params?: { empresaId?: number }) {
        const response = await api.get<ProfissionalDTO[]>('/profissionais', { params });
        return response.data;
    }

    static async createProfissional(data: ProfissionalDTO) {
        const response = await api.post('/profissionais', data);
        return response.data;
    }
}
