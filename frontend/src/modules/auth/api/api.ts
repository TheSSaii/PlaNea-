import { apiClient } from '../../../lib/axios';

type LoginDto = {
  email: string
  password: string
}

type RegisterDto = {
  name: string
  email: string
  password: string
}

// =========================
// AUTH
// =========================

export const loginUser = (data: LoginDto) =>
  apiClient.post('/auth/login', data).then(r => r.data)

export const registerUser = (data: RegisterDto) =>
  apiClient.post('/auth/register', data).then(r => r.data)

export default apiClient
