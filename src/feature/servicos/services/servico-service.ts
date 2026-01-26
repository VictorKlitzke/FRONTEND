import { api } from "../../../app/api";

export interface ServicoDTO {
    id?: number;
    name: string;
    duration: number; // in minutes
    price: number;
    profissionalId?: number;
    empresaId?: number;
}

export class ServicoService {
    static async getServicos(params?: { empresaId?: number }) {
        const response = await api.get<ServicoDTO[]>('/servicos', { params });
        return response.data;
    }

    static async createServico(data: ServicoDTO) {
        const response = await api.post('/servicos', data);
        return response.data;
    }
}
