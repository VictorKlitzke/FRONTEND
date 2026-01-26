import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { EmpresaService, type EmpresaDTO } from "../services/empresa-service";

type EmpresaPayload = Omit<EmpresaDTO, "userId">;

interface Company {
    id: number;
    name: string;
    cnpj: string;
    // Add other fields if needed for the UI
}

interface EmpresaState {
    company: Company | null;
    loading: boolean;
    createEmpresa: (data: EmpresaPayload, userId: number) => Promise<void>;
}

export const useEmpresaStore = create<EmpresaState>()(
    persist(
        (set) => ({
            company: null,
            loading: false,
            createEmpresa: async (data: EmpresaPayload, userId: number) => {
                set({ loading: true });
                try {
                    const res = await EmpresaService.createEmpresa({ ...data, userId });
                    set({ company: res.company });
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: "empresa-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);