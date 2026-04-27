import { create } from "zustand";
import {
  createServicePackage,
  deleteServicePackage,
  getServicePackagesByCompany,
  updateServicePackage,
} from "../services/service-package-service";
import type {
  CreateServicePackageDTO,
  ServicePackageDTO,
  UpdateServicePackageDTO,
} from "../services/service-package-service";


export type ServicePackage = ServicePackageDTO & { created_at?: string };


interface ServicePackageStore {
  packages: ServicePackage[];
  loading: boolean;

  fetchAll: (companyId: number) => Promise<void>;
  createPackage: (data: CreateServicePackageDTO) => Promise<void>;
  updatePackage: (id: number, data: UpdateServicePackageDTO) => Promise<void>;
  deletePackage: (id: number) => Promise<void>;
}

export const useServicePackageStore = create<ServicePackageStore>(
  (set, get) => ({
    packages: [],
    loading: false,

    fetchAll: async (companyId) => {
      set({ loading: true });
      try {
        const data = await getServicePackagesByCompany(companyId);
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
        await createServicePackage(data);
        const refreshed = await getServicePackagesByCompany(data.company_id);
        set({ packages: refreshed ?? [] });
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