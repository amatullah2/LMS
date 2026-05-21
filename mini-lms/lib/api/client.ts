import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { SecureStorage } from '../storage/secure';

const BASE_URL = 'https://api.freeapi.app';
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — attach access token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await SecureStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle 401 + retry on network errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

      if (!config) return Promise.reject(error);

      // Network error or timeout → retry with backoff
      const isNetworkError = !error.response;
      const isRetriable = isNetworkError || error.response?.status === 503;
      config._retryCount = config._retryCount ?? 0;

      if (isRetriable && config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = Math.pow(2, config._retryCount) * 500;
        await new Promise((res) => setTimeout(res, delay));
        return client(config);
      }

      // 401 — clear tokens (token refresh not supported by freeapi)
      if (error.response?.status === 401) {
        await SecureStorage.clearAll();
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createClient();

// Typed helper that unwraps the freeapi response envelope
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get(url, { params });
  return res.data?.data ?? res.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post(url, body);
  return res.data?.data ?? res.data;
}
