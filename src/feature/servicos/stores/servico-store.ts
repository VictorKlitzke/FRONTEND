import { create } from "zustand";
import { ServicoService, type ServicoDTO } from "../services/servico-service";

interface ServicoState {
    servicos: ServicoDTO[];
    loading: boolean;
    loadServicos: (empresaId?: number) => Promise<void>;
    addServico: (data: ServicoDTO) => Promise<void>;
}

export const useServicoStore = create<ServicoState>((set, get) => ({
    servicos: [],
    loading: false,
    loadServicos: async (empresaId?: number) => {
        set({ loading: true });
        try {
            const data = await ServicoService.getServicos({ empresaId });
            set({ servicos: data });
        } finally {
            set({ loading: false });
        }
    },
    addServico: async (data: ServicoDTO) => {
        set({ loading: true });
        try {
            await ServicoService.createServico(data);
            // Refresh list or append
            // Ideally we should append the new service
            const newServico = data; // In a real app, use response from createServico
            // Ideally we should reload to get the ID back, or use the response.
            // Let's assume createServico returns the created object
            // But for now let's just reload to be safe and simple
            // Or append if we trust the response.
            // Let's modify the service to return data and use it here.
            // I'll trust the loadServicos for now or improving addServico logic.
            // Re-fetching is safer for ID sync.
            if (data.empresaId) {
                await get().loadServicos(data.empresaId);
            }
        } finally {
            set({ loading: false });
        }
    },
}));
