import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware";
import { AuthService } from "../services/auth-services";

export interface RegisterPayload {
    Name: string;
    Email: string;
    password: string;
    role: "client" | "professional" | "manager";
    cnpjcpf: string;
    phone: string;
}

interface RegisterState {
    loading: boolean;
    error: string | null;
    onRegister: (payload: RegisterPayload) => Promise<void>;
}

type Persistence = (
    config: StateCreator<RegisterState>,
    options: PersistOptions<RegisterState>
) => StateCreator<RegisterState>;

export const useRegisterStore = create<RegisterState>()(
    (persist as Persistence)(
        (set) => ({
            loading: false,
            error: null,

            onRegister: async (payload) => {
                set({ loading: true, error: null });

                try {
                    await AuthService.register({ payload });
                    set({ loading: false });
                } catch (err: any) {
                    set({
                        loading: false,
                        error: err?.response?.data?.message ?? "Erro ao registrar",
                    });
                }
            },
        }),
        {
            name: "register-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
