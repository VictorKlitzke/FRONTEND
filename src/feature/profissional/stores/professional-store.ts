import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProfessionalService, type ProfessionalDTO, type CreateProfessionalRequest, type UpdateProfessionalRequest } from "../services/professional-service";

interface ProfessionalState {
  professionals: ProfessionalDTO[];
  selectedProfessional: ProfessionalDTO | null;
  loading: boolean;
  error: string | null;
  
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createProfessional: (payload: CreateProfessionalRequest) => Promise<void>;
  updateProfessional: (id: number, payload: UpdateProfessionalRequest) => Promise<void>;
  deleteProfessional: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProfessionalStore = create<ProfessionalState>()(
  persist(
    (set) => ({
      professionals: [],
      selectedProfessional: null,
      loading: false,
      error: null,

      fetchAll: async () => {
        set({ loading: true, error: null });
        try {
          const data = await ProfessionalService.getAll();
          set({ professionals: data, loading: false });
        } catch (err: any) {
          set({
            loading: false,
            error: err?.response?.data?.message ?? "Erro ao carregar profissionais",
          });
        }
      },

      fetchById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const data = await ProfessionalService.getById(id);
          set({ selectedProfessional: data, loading: false });
        } catch (err: any) {
          set({
            loading: false,
            error: err?.response?.data?.message ?? "Erro ao carregar profissional",
          });
        }
      },

      createProfessional: async (payload: CreateProfessionalRequest) => {
        set({ loading: true, error: null });
        try {
          const newProfessional = await ProfessionalService.create(payload);
          set((state) => ({
            professionals: [...state.professionals, newProfessional],
            loading: false,
          }));
        } catch (err: any) {
          set({
            loading: false,
            error: err?.response?.data?.message ?? "Erro ao criar profissional",
          });
          throw err;
        }
      },

      updateProfessional: async (id: number, payload: UpdateProfessionalRequest) => {
        set({ loading: true, error: null });
        try {
          const updated = await ProfessionalService.update(id, payload);
          set((state) => ({
            professionals: state.professionals.map((p) => (p.id === id ? updated : p)),
            selectedProfessional: state.selectedProfessional?.id === id ? updated : state.selectedProfessional,
            loading: false,
          }));
        } catch (err: any) {
          set({
            loading: false,
            error: err?.response?.data?.message ?? "Erro ao atualizar profissional",
          });
          throw err;
        }
      },

      deleteProfessional: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await ProfessionalService.delete(id);
          set((state) => ({
            professionals: state.professionals.filter((p) => p.id !== id),
            selectedProfessional: state.selectedProfessional?.id === id ? null : state.selectedProfessional,
            loading: false,
          }));
        } catch (err: any) {
          set({
            loading: false,
            error: err?.response?.data?.message ?? "Erro ao excluir profissional",
          });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "professional-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
