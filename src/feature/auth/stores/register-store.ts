import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware";
import { AuthService, type RegisterPayload } from "../services/auth-services";

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
                    await AuthService.register(payload);
                    set({ loading: false });
                } catch (err) {
                    const message = err instanceof Error ? err.message : "Registration failed";
                    set({
                        loading: false,
                        error: message,
                    });
                    throw err;
                }
            },
        }),
        {
            name: "register-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
