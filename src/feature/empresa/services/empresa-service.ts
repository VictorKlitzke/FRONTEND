import { api } from "../../../app/api";

export interface EmpresaDTO {
    name: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    userId: number;
}

export class EmpresaService {
    static async createEmpresa(data: EmpresaDTO) {
        const response = await api.post('/Company/register', data);
        return response.data;
    }
}
