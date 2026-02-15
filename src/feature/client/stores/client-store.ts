import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ClientService, type ClientDTO, type CreateClientRequest, type UpdateClientRequest } from "../services/client-service";

interface ClientState {
  clients: ClientDTO[];
  selected: ClientDTO | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createClient: (payload: CreateClientRequest) => Promise<void>;
  updateClient: (id: number, payload: UpdateClientRequest) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: [],
      selected: null,
      loading: false,
      error: null,

      fetchAll: async () => {
        set({ loading: true, error: null });
        try {
          const data = await ClientService.getAll();
          set({ clients: data, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao carregar clientes" });
        }
      },

      fetchById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const data = await ClientService.getById(id);
          set({ selected: data, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao carregar cliente" });
        }
      },

      createClient: async (payload: CreateClientRequest) => {
        set({ loading: true, error: null });
        try {
          const created = await ClientService.create(payload);
          // Se backend retorna boolean, força reload da listagem
          if (typeof created === "boolean") {
            await ClientService.getAll().then((data) => set({ clients: data, loading: false }));
          } else {
            set((state) => ({ clients: [...state.clients, created], loading: false }));
          }
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao criar cliente" });
          throw err;
        }
      },

      updateClient: async (id: number, payload: UpdateClientRequest) => {
        set({ loading: true, error: null });
        try {
          const updated = await ClientService.update(id, payload);
          set((state) => ({ clients: state.clients.map((c) => (c.id === id ? updated : c)), selected: state.selected?.id === id ? updated : state.selected, loading: false }));
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao atualizar cliente" });
          throw err;
        }
      },

      deleteClient: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await ClientService.delete(id);
          set((state) => ({ clients: state.clients.filter((c) => c.id !== id), selected: state.selected?.id === id ? null : state.selected, loading: false }));
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao excluir cliente" });
          throw err;
        }
      },
    }),
    { name: "client-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);
