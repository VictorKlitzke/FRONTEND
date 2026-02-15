import { api } from "../../../app/api";

export interface AppointmentDTO {
  id?: number;
  companyId: number;
  professionalId: number;
  clientId: number;
  serviceId: number;
  startAt: string;
  endAt?: string;
  durationMinutes: number;
  notes?: string;
  active?: boolean;
}

export type CreateAppointmentRequest = Omit<AppointmentDTO, "id" | "active">;
export type UpdateAppointmentRequest = CreateAppointmentRequest;

export class AppointmentService {
  static async getByCompany(): Promise<AppointmentDTO[]> {
    const { data } = await api.get(`/appointment`);
    const list = data?.dados ?? data?.data ?? data;
    return Array.isArray(list) ? list.map(mapBackendAppointment) : [];
  }

  static async getById(id: number): Promise<AppointmentDTO> {
    const { data } = await api.get(`/appointment/${id}`);
    const item = data?.dados ?? data?.data ?? data;
    return mapBackendAppointment(item);
  }

  static async create(payload: CreateAppointmentRequest): Promise<AppointmentDTO> {
    console.log("Creating appointment with payload:", payload);
    const { data } = await api.post(`/appointment`, payload);
    const item = data?.dados ?? data?.data ?? data;
    return mapBackendAppointment(item);
  }

  static async update(id: number, payload: UpdateAppointmentRequest): Promise<AppointmentDTO> {
    const { data } = await api.put(`/appointment/${id}`, payload);
    const item = data?.dados ?? data?.data ?? data;
    return mapBackendAppointment(item);
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/appointment/${id}`);
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendAppointment(raw: any): AppointmentDTO {
  if (!raw) return {} as AppointmentDTO;

  return {
    id: raw.id ?? raw.ID ?? undefined,
    companyId: raw.companyId ?? raw.company_id ?? 0,
    professionalId: raw.professionalId ?? raw.professional_id ?? 0,
    clientId: raw.clientId ?? raw.client_id ?? 0,
    serviceId: raw.serviceId ?? raw.service_id ?? 0,
    startAt: raw.startAt ?? raw.start_at ?? "",
    endAt: raw.endAt ?? raw.end_at ?? undefined,
    durationMinutes: raw.durationMinutes ?? raw.duration_minutes ?? 0,
    notes: raw.notes ?? raw.observation ?? undefined,
    active: raw.active ?? undefined,
  } as AppointmentDTO;
}
