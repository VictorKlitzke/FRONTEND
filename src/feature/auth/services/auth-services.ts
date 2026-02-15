import { api } from "../../../app/api"

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: "cliente" | "profissional" | "admin";
  cnpjcpf: string;
  phone: string;
};

export class AuthService {
  static async login(payload: { email: string; password: string }) {
    const response = await api.post("auth/login", payload)
    return response.data
  }

  static async register(payload: RegisterPayload) {
    const { data } = await api.post("auth/register", payload)
    return data
  }
}