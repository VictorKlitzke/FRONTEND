import { api } from "@/app/api";

/* =========================
   TYPES
========================= */

export interface ServicePackageDTO {
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
}

export interface CreateServicePackageDTO
  extends Omit<ServicePackageDTO, "id"> {}

export interface UpdateServicePackageDTO
  extends Partial<CreateServicePackageDTO> {}

/* =========================
   SERVICE PACKAGE
========================= */

// CREATE
export const createServicePackage = async (
  data: CreateServicePackageDTO
): Promise<ServicePackageDTO> => {
  const payload = {
    ...data,
    data_fim: data.data_fim && data.data_fim.trim() !== "" ? data.data_fim : null,
  };
  const response = await api.post("/service-packages", payload);
  return response.data;
};

export const getAllServicePackages = async (
export const getServicePackagesByCompany = async (
  companyId: number
): Promise<ServicePackageDTO[]> => {
  const response = await api.get(`/service-packages/company/${companyId}`);
  return response.data;
};

export const getServicePackagesByClient = async (
  clientId: number
): Promise<ServicePackageDTO[]> => {
  const response = await api.get(`/service-packages/client/${clientId}`);
  return response.data;
};

export const getServicePackageWithSessions = async (packageId: number) => {
  const response = await api.get(`/service-packages/${packageId}`);
  return response.data;
};

export const updateServicePackage = async (
  id: number,
  data: UpdateServicePackageDTO
): Promise<ServicePackageDTO> => {
  const response = await api.put(`/service-packages/${id}`, data);
  return response.data;
};

export const deleteServicePackage = async (id: number): Promise<void> => {
  await api.delete(`/service-packages/${id}`);
};


export const cancelServicePackageSession = async (
  packageId: number,
  sessionId: number
) => {
  const response = await api.patch(
    `/service-packages/${packageId}/session/${sessionId}/cancel`
  );
  return response.data;
};

export const rescheduleServicePackageSession = async (
  packageId: number,
  sessionId: number,
  newDate: string
) => {
  const response = await api.patch(
    `/service-packages/${packageId}/session/${sessionId}/reschedule`,
    { date: newDate }
  );
  return response.data;
};