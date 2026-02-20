import { api } from "@/app/api";

export interface AppointmentRequestDTO {
  id: number;
  company_id: number;
  client_id?: number | null;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  service_id?: number | null;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
  status: string;
  appointment_id?: number | null;
  created_at?: string;
}

export interface ApproveAppointmentRequestPayload {
  professionalId: number;
  clientId: number;
  serviceId: number;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  notes?: string | null;
}

export class AppointmentRequestService {
  static async getAll(status?: string): Promise<AppointmentRequestDTO[]> {
    const { data } = await api.get(`/appointment-requests`, { params: status ? { status } : undefined });
    const list = data?.dados ?? data?.data ?? data;
    return Array.isArray(list) ? list : [];
  }

  static async createPublic(payload: {
    companyId: number;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    serviceId?: number;
    professionalId?: number;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<AppointmentRequestDTO> {
    const { data } = await api.post(`/appointment-requests/public`, payload);
    return data?.dados ?? data?.data ?? data;
  }

  static async approve(id: number, payload: ApproveAppointmentRequestPayload): Promise<void> {
    await api.post(`/appointment-requests/${id}/approve`, payload);
  }

  static async reject(id: number): Promise<void> {
    await api.post(`/appointment-requests/${id}/reject`);
  }
}
