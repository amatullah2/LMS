import { apiPost } from './client';
import type { LoginPayload, RegisterPayload, User } from '@/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<AuthResponse>('/api/v1/users/login', payload),

  // Register only returns the user — no tokens. Caller must login separately.
  register: (payload: RegisterPayload) =>
    apiPost<{ user: User }>('/api/v1/users/register', {
      ...payload,
      role: payload.role ?? 'USER',
    }),

  getProfile: () =>
    apiPost<AuthResponse>('/api/v1/users/self'),

  logout: () => apiPost<void>('/api/v1/users/logout'),
};
