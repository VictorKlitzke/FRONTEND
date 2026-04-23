import { create } from "zustand";
import { createServicePackage, deleteServicePackage, getAllServicePackages, updateServicePackage } from "../services/service-package-service";


export interface ServicePackage {
  id: number;
  client_id: number;
  company_id: number;
  service_id: number;
  quantidade_sessoes: number;
  frequencia: string;
  dia_semana: string;
  horario: string;
  data_inicio: string;
  data_fim?: string | null;
  created_at?: string;
}

export interface CreateServicePackageDTO {
  client_id: number;
  company_id: number;
  service_id: number;
  quantidade_sessoes: number;
  frequencia: string;
  dia_semana: string;
  horario: string;
  data_inicio: string;
  data_fim?: string | null;
}

export interface UpdateServicePackageDTO
  extends Partial<CreateServicePackageDTO> {}


interface ServicePackageStore {
  packages: ServicePackage[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  createPackage: (data: CreateServicePackageDTO) => Promise<void>;
  updatePackage: (id: number, data: UpdateServicePackageDTO) => Promise<void>;
  deletePackage: (id: number) => Promise<void>;
}

export const useServicePackageStore = create<ServicePackageStore>(
  (set, get) => ({
    packages: [],
    loading: false,

    fetchAll: async () => {
      set({ loading: true });
      try {
        const data = await getAllServicePackages();
        set({ packages: data ?? [] });
      } catch (error) {
        console.error("Erro ao buscar pacotes", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    createPackage: async (data) => {
      set({ loading: true });
      try {
        const created = await createServicePackage(data);

        set({
          packages: [created, ...get().packages],
        });
      } catch (error) {
        console.error("Erro ao criar pacote", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    updatePackage: async (id, data) => {
      set({ loading: true });
      try {
        const updated = await updateServicePackage(id, data);

        set({
          packages: get().packages.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        });
      } catch (error) {
        console.error("Erro ao atualizar pacote", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    deletePackage: async (id) => {
      set({ loading: true });
      try {
        await deleteServicePackage(id);

        set({
          packages: get().packages.filter((p) => p.id !== id),
        });
      } catch (error) {
        console.error("Erro ao deletar pacote", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },
  })
);