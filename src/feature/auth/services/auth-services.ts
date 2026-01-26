import { api } from "../../../app/api"

export class AuthService {
  static async login(payload: { email: string, password: string }) {
    const response = await api.post('Auth/login', payload)
    console.log(response.data)
    return response.data
  }

  static async register(payload: { payload: { Name: string, Email: string, password: string, role: string, cnpjcpf: string, phone: string } }) {
    const data = await api.post('Auth/register', payload)
    return data.data
  }
}