import { create } from "zustand";
import { ProductService, type ProductDTO, type CreateProductRequest, type UpdateProductRequest } from "../services/product-service";

interface ProductState {
  products: ProductDTO[];
  selected: ProductDTO | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createProduct: (payload: CreateProductRequest) => Promise<void>;
  updateProduct: (id: number, payload: UpdateProductRequest) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await ProductService.getAll();
      set({ products: data, loading: false });
    } catch {
      set({ loading: false, error: "Erro ao carregar produtos" });
    }
  },

  fetchById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await ProductService.getById(id);
      set({ selected: data, loading: false });
    } catch {
      set({ loading: false, error: "Erro ao carregar produto" });
    }
  },

  createProduct: async (payload: CreateProductRequest) => {
    set({ loading: true, error: null });
    try {
      const created = await ProductService.create(payload);
      set((state) => ({ products: [...state.products, created], loading: false }));
    } catch {
      set({ loading: false, error: "Erro ao criar produto" });
    }
  },

  updateProduct: async (id: number, payload: UpdateProductRequest) => {
    set({ loading: true, error: null });
    try {
      const updated = await ProductService.update(id, payload);
      set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)), selected: state.selected?.id === id ? updated : state.selected, loading: false }));
    } catch {
      set({ loading: false, error: "Erro ao atualizar produto" });
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ProductService.delete(id);
      set((state) => ({ products: state.products.filter((p) => p.id !== id), selected: state.selected?.id === id ? null : state.selected, loading: false }));
    } catch {
      set({ loading: false, error: "Erro ao excluir produto" });
    }
  },
}));

