import { create } from "zustand";
import { ProfissionalService, type ProfissionalDTO } from "../services/profissional-service";

interface ProfissionalState {
    profissionais: ProfissionalDTO[];
    loading: boolean;
    loadProfissionais: (empresaId?: number) => Promise<void>;
    addProfissional: (data: ProfissionalDTO) => Promise<void>;
}

export const useProfissionalStore = create<ProfissionalState>((set, get) => ({
    profissionais: [],
    loading: false,
    loadProfissionais: async () => {
        set({ loading: true });
        try {
            const data = await ProfissionalService.getProfissionais();
            set({ profissionais: data });
        } catch (error) {
            console.error("Erro ao carregar profissionais", error);
            set({ profissionais: [] });
        } finally {
            set({ loading: false });
        }
    },
    addProfissional: async (data: ProfissionalDTO) => {
        set({ loading: true });
        try {
            const newProfissional = await ProfissionalService.createProfissional(data);
            set({ profissionais: [...get().profissionais, newProfissional] });
        } finally {
            set({ loading: false });
        }
    },
}));
