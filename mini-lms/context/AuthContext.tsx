import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi } from '@/lib/api/auth.api';
import { SecureStorage } from '@/lib/storage/secure';
import type { User, LoginPayload, RegisterPayload } from '@/types';

const DEMO_FALLBACK_ENABLED = true;
const DEMO_EMAIL = 'lmsdemo2026@gmail.com';
const DEMO_PASSWORD = 'LmsDemo@1';
const DEMO_ACCESS_TOKEN = 'demo-access-token';
const DEMO_REFRESH_TOKEN = 'demo-refresh-token';
const ENABLE_AUTH_LOGS = true;

function logAuth(event: string, details?: Record<string, unknown>) {
  if (!ENABLE_AUTH_LOGS) return;
  console.log(`[auth] ${event}`, details ?? {});
}

function maskPassword(password?: string) {
  if (!password) return '';
  return '*'.repeat(Math.max(6, Math.min(12, password.length)));
}

function buildDemoUser(payload: { email: string; username?: string }): User {
  const nameFromEmail = payload.email.split('@')[0] || 'demo_user';
  return {
    _id: 'demo-user',
    username: payload.username ?? nameFromEmail,
    email: payload.email,
    role: 'USER',
    createdAt: new Date().toISOString(),
  } as User;
}

async function completeDemoAuth(payload: { email: string; username?: string }) {
  const user = buildDemoUser(payload);
  await SecureStorage.setTokens(DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN);
  await SecureStorage.setUser(user);
  return { user, accessToken: DEMO_ACCESS_TOKEN, refreshToken: DEMO_REFRESH_TOKEN };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Auto-login on mount
  useEffect(() => {
    (async () => {
      try {
        const [token, user] = await Promise.all([
          SecureStorage.getAccessToken(),
          SecureStorage.getUser<User>(),
        ]);
        if (token && user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, accessToken: token, refreshToken: '' },
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const demoPasswordMatches = payload.password?.trim() === DEMO_PASSWORD;
      logAuth('login_attempt', {
        email: payload.email,
        normalizedEmail,
        hasPassword: Boolean(payload.password),
        demoPasswordMatches,
        demoFallbackEnabled: DEMO_FALLBACK_ENABLED,
      });
      if (DEMO_FALLBACK_ENABLED && normalizedEmail === DEMO_EMAIL && demoPasswordMatches) {
        logAuth('login_demo_fallback', { email: payload.email });
        const data = await completeDemoAuth({ email: payload.email });
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return;
      }
      const data = await authApi.login({ ...payload, email: normalizedEmail });
      logAuth('login_success', { userId: data.user?._id, email: data.user?.email });
      await SecureStorage.setTokens(data.accessToken, data.refreshToken);
      await SecureStorage.setUser(data.user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    } catch (err: unknown) {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const demoPasswordMatches = payload.password?.trim() === DEMO_PASSWORD;
      if (DEMO_FALLBACK_ENABLED && normalizedEmail === DEMO_EMAIL && demoPasswordMatches) {
        logAuth('login_demo_fallback_after_error', { email: payload.email });
        const data = await completeDemoAuth({ email: payload.email });
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return;
      }
      logAuth('login_error', {
        email: payload.email,
        password: maskPassword(payload.password),
        status: (err as { response?: { status?: number } })?.response?.status,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message,
      });
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const normalizedEmail = payload.email.trim().toLowerCase();
      logAuth('register_attempt', {
        email: payload.email,
        username: payload.username,
        demoFallbackEnabled: DEMO_FALLBACK_ENABLED,
      });
      if (DEMO_FALLBACK_ENABLED && normalizedEmail === DEMO_EMAIL) {
        logAuth('register_demo_fallback', { email: payload.email, username: payload.username });
        const data = await completeDemoAuth({ email: payload.email, username: payload.username });
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return;
      }
      // Step 1: register (returns user only, no tokens)
      await authApi.register({ ...payload, email: normalizedEmail });
      // Step 2: auto-login to obtain tokens
      const data = await authApi.login({ email: normalizedEmail, password: payload.password });
      logAuth('register_success', { userId: data.user?._id, email: data.user?.email });
      await SecureStorage.setTokens(data.accessToken, data.refreshToken);
      await SecureStorage.setUser(data.user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    } catch (err: unknown) {
      const normalizedEmail = payload.email.trim().toLowerCase();
      if (DEMO_FALLBACK_ENABLED && normalizedEmail === DEMO_EMAIL) {
        logAuth('register_demo_fallback_after_error', { email: payload.email, username: payload.username });
        const data = await completeDemoAuth({ email: payload.email, username: payload.username });
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return;
      }
      logAuth('register_error', {
        email: payload.email,
        username: payload.username,
        status: (err as { response?: { status?: number } })?.response?.status,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message,
      });
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout API errors
    } finally {
      await SecureStorage.clearAll();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const updateUser = useCallback((user: User) => dispatch({ type: 'UPDATE_USER', payload: user }), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
