import { api } from "../../../app/api"

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: "cliente" | "profissional" | "admin";
  cnpjcpf: string;
  phone: string;
};

export type VerifyEmailPayload = {
  email: string;
  verification_code: string;
};

export class AuthService {
  static async login(payload: { email: string; password: string }) {
    const { data } = await api.post("auth/login", payload)
    return data
  }

  static async me() {
    const { data } = await api.get("auth/me")
    return data
  }

  static async logout() {
    const { data } = await api.post("auth/logout")
    return data
  }

  static async register(payload: RegisterPayload) {
    const { data } = await api.post("auth/register", payload)
    return data
  }

  static async verifyEmail(payload: VerifyEmailPayload) {
    const { data } = await api.post("auth/verify-email", payload)
    return data
  }
}