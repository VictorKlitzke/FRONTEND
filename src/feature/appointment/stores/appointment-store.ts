import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppointmentService, type AppointmentDTO, type CreateAppointmentRequest, type UpdateAppointmentRequest } from "../services/appointment-service";

interface AppointmentState {
  appointments: AppointmentDTO[];
  loading: boolean;
  error: string | null;
  fetchByCompany: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createAppointment: (payload: CreateAppointmentRequest) => Promise<void>;
  updateAppointment: (id: number, payload: UpdateAppointmentRequest) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      appointments: [],
      loading: false,
      error: null,

      fetchByCompany: async () => {
        set({ loading: true, error: null });
        try {
          const data = await AppointmentService.getByCompany();
          set({ appointments: data, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao carregar agendamentos" });
        }
      },

      fetchById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await AppointmentService.getById(id);
          set({ loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao carregar agendamento" });
        }
      },

      createAppointment: async (payload: CreateAppointmentRequest) => {
        set({ loading: true, error: null });
        try {
          const created = await AppointmentService.create(payload);
          set((state) => ({ appointments: [...state.appointments, created], loading: false }));
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao criar agendamento" });
          throw err;
        }
      },

      updateAppointment: async (id: number, payload: UpdateAppointmentRequest) => {
        set({ loading: true, error: null });
        try {
          const updated = await AppointmentService.update(id, payload);
          set((state) => ({ appointments: state.appointments.map((a) => (a.id === id ? updated : a)), loading: false }));
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao atualizar agendamento" });
          throw err;
        }
      },

      deleteAppointment: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await AppointmentService.delete(id);
          set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id), loading: false }));
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? "Erro ao excluir agendamento" });
          throw err;
        }
      },
    }),
    { name: "appointment-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);
