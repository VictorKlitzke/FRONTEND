import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_WHATSAPP_SERVICE_URL ?? "http://127.0.0.1:3001";
const normalizedBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const authToken = (import.meta.env.VITE_WHATSAPP_SERVICE_TOKEN ?? "agenda-pro-local-token").trim();

const whatsappApi = axios.create({
  baseURL: `${normalizedBaseUrl}/`,
  headers: {
    Accept: "application/json",
  },
});

whatsappApi.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export interface WhatsappCompanyStatus {
  ok: boolean;
  companyId: string;
  ready: boolean;
  connecting: boolean;
  hasQr: boolean;
  startupError: string | null;
}

export interface WhatsappCompanyQr {
  ok: boolean;
  companyId: string;
  qr: string | null;
}

export const WhatsappConnectionService = {
  async connect(companyId: number): Promise<WhatsappCompanyStatus> {
    const { data } = await whatsappApi.post<WhatsappCompanyStatus>(`companies/${companyId}/connect`);
    return data;
  },

  async status(companyId: number): Promise<WhatsappCompanyStatus> {
    const { data } = await whatsappApi.get<WhatsappCompanyStatus>(`companies/${companyId}/status`);
    return data;
  },

  async qr(companyId: number): Promise<WhatsappCompanyQr> {
    const { data } = await whatsappApi.get<WhatsappCompanyQr>(`companies/${companyId}/qr`);
    return data;
  },
};
