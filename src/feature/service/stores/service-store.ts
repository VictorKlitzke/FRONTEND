import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ServiceService, type ServiceDTO, type CreateServiceRequest, type UpdateServiceRequest } from "../services/service-service";

interface ServiceState {
  services: ServiceDTO[];
  selected: ServiceDTO | null;
  loading: boolean;
  error: string | null;
  fetchByCompany: (companyId: number) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  fetchAll: () => Promise<void>;
  createService: (payload: CreateServiceRequest) => Promise<void>;
  updateService: (id: number, payload: UpdateServiceRequest) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      services: [],
      selected: null,
      loading: false,
      error: null,

      fetchByCompany: async (companyId: number) => {
        set({ loading: true, error: null });
        try {
          const data = await ServiceService.getByCompany(companyId);
          set({ services: data, loading: false });
        } catch {
          set({ loading: false, error: "Erro ao carregar serviços" });
        }
      },

      fetchAll: async () => {
        set({ loading: true, error: null });
        try {
          const storedEmpresa = sessionStorage.getItem("empresa-storage");
          const empresaIdFromStorage = storedEmpresa
            ? (JSON.parse(storedEmpresa)?.state?.company?.id as number | undefined)
            : undefined;
          const companyId = empresaIdFromStorage;
          if (!companyId) {
            set({ loading: false, error: "Empresa não encontrada" });
            return;
          }
          const data = await ServiceService.getAll(companyId);
          set({ services: data, loading: false });
        } catch {
          set({ loading: false, error: "Erro ao carregar serviços" });
        }
      },

      fetchById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const data = await ServiceService.getById(id);
          set({ selected: data, loading: false });
        } catch {
          set({ loading: false, error: "Erro ao carregar serviço" });
        }
      },

      createService: async (payload: CreateServiceRequest) => {
        set({ loading: true, error: null });
        try {
          const created = await ServiceService.create(payload);
          set((state) => ({ services: [...state.services, created], loading: false }));
        } catch {
          set({ loading: false, error: "Erro ao criar serviço" });
        }
      },

      updateService: async (id: number, payload: UpdateServiceRequest) => {
        set({ loading: true, error: null });
        try {
          const updated = await ServiceService.update(id, payload);
          set((state) => ({ services: state.services.map((s) => (s.id === id ? updated : s)), selected: state.selected?.id === id ? updated : state.selected, loading: false }));
        } catch {
          set({ loading: false, error: "Erro ao atualizar serviço" });
        }
      },

      deleteService: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await ServiceService.delete(id);
          set((state) => ({ services: state.services.filter((s) => s.id !== id), selected: state.selected?.id === id ? null : state.selected, loading: false }));
        } catch {
          set({ loading: false, error: "Erro ao excluir serviço" });
        }
      },
    }),
    { name: "service-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);
