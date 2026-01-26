import { create, type StateCreator } from "zustand"
import { AuthService } from "../services/auth-services";
import {
  persist,
  createJSONStorage,
  type PersistOptions,
} from "zustand/middleware";


export interface User {
  id: number;
  name: string;
  email: string;
  empresaId?: number;
}

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean,
  onLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

type Persistence = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState>
) => StateCreator<AuthState>;


export const AuthStore = create<AuthState>()(
  (persist as Persistence)(
    (set): AuthState => ({
      user: null,
      token: null,
      loading: false,
      onLogin: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const res = await AuthService.login({ email, password });
          console.log(res)
          const { user, accessToken } = res;
          set({ user: user, token: accessToken });
          set({ loading: false })
        } catch (error) {
          set({ loading: false })
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    { name: "auth-storage", storage: createJSONStorage(() => sessionStorage) }
  )

)