import { api } from "../../../app/api";

export interface StockMovementDTO {
  id?: number;
  companyId: number;
  stockId: number;
  quantity: number;
  movementType: string; // "IN" | "OUT"
  notes?: string;
  createdAt?: string;
}

export type CreateStockMovementRequest = Omit<StockMovementDTO, "id" | "createdAt">;

export class StockMovementService {
  static async getByCompany(companyId: number): Promise<StockMovementDTO[]> {
    const { data } = await api.get(`/stockMovements/company/${companyId}`);
    const list = data?.dados ?? data?.data ?? data;
    return Array.isArray(list) ? list : [];
  }

  static async getByStock(stockId: number): Promise<StockMovementDTO[]> {
    const { data } = await api.get(`/stockMovements/stock/${stockId}`);
    const list = data?.dados ?? data?.data ?? data;
    return Array.isArray(list) ? list : [];
  }

  static async create(payload: CreateStockMovementRequest): Promise<StockMovementDTO> {
    const { data } = await api.post(`/stockMovements`, payload);
    return data?.dados ?? data?.data ?? data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/stockMovements/${id}`);
  }
}
