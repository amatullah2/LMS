import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'lms_access_token',
  REFRESH_TOKEN: 'lms_refresh_token',
  USER: 'lms_user',
} as const;

export const SecureStorage = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } catch {
      // SecureStore is not available on all platforms (e.g. web)
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },

  async setUser(user: object): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
    } catch {
      // SecureStore is not available on all platforms (e.g. web)
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      const raw = await SecureStore.getItemAsync(KEYS.USER);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(KEYS.USER),
      ]);
    } catch {
      // SecureStore is not available on all platforms (e.g. web)
    }
  },
};
