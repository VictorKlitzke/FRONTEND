import { api } from "../../../app/api";

export interface ProductDTO {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductRequest = Omit<ProductDTO, "id" | "createdAt" | "updatedAt" | "active">;
export type UpdateProductRequest = CreateProductRequest;

export class ProductService {
  static async getAll(): Promise<ProductDTO[]> {
    const { data } = await api.get(`/products`);
    return data.data ?? [];
  }

  static async getById(id: number): Promise<ProductDTO> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  }

  static async create(payload: CreateProductRequest): Promise<ProductDTO> {
    const { data } = await api.post(`/products`, payload);
    return data.data.status === 201 ? data.data : data;
  }

  static async update(id: number, payload: UpdateProductRequest): Promise<ProductDTO> {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
}
