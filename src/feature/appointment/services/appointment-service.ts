import { api } from "../../../app/api";

export interface AppointmentDTO {
  id?: number;
  companyId: number;
  professionalId: number;
  clientId: number;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  serviceId: number;
  /** Ordem do agendamento; o primeiro é o legado de `serviceId` quando houver. */
  serviceIds?: number[];
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

  const serviceIdsRaw = raw.serviceIds ?? raw.service_ids;
  let serviceIds: number[] | undefined;
  if (Array.isArray(serviceIdsRaw)) {
    serviceIds = serviceIdsRaw.map((n: unknown) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
  }

  const singleService = raw.serviceId ?? raw.service_id ?? 0;
  const resolvedServiceIds =
    serviceIds && serviceIds.length > 0
      ? serviceIds
      : singleService
        ? [Number(singleService)]
        : undefined;

  return {
    id: raw.id ?? raw.ID ?? undefined,
    companyId: raw.companyId ?? raw.company_id ?? 0,
    professionalId: raw.professionalId ?? raw.professional_id ?? 0,
    clientId: raw.clientId ?? raw.client_id ?? 0,
    clientFirstName: raw.clientFirstName ?? raw.client_first_name ?? null,
    clientLastName: raw.clientLastName ?? raw.client_last_name ?? null,
    serviceId: singleService,
    serviceIds: resolvedServiceIds,
    startAt: raw.startAt ?? raw.start_at ?? "",
    endAt: raw.endAt ?? raw.end_at ?? undefined,
    durationMinutes: raw.durationMinutes ?? raw.duration_minutes ?? 0,
    notes: raw.notes ?? raw.observation ?? undefined,
    active: raw.active ?? undefined,
  } as AppointmentDTO;
}
