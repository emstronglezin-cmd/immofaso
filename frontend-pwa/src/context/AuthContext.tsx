import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../models/types';
import { clearAuth, getToken, storeAuth } from '../services/api';
import {
  guest as guestApi,
  login as loginApi,
  logout as logoutApi,
  me as meApi,
  register as registerApi,
} from '../services/auth';
import type { LoginPayload, RegisterPayload } from '../services/auth';

const USER_KEY = 'immofaso_user';

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function cacheUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  continueAsGuest: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = getToken();
      if (token) {
        try {
          const current = await meApi();
          setUser(current);
          cacheUser(current);
        } catch {
          // Un guest n'a pas de compte en base : /auth/me renvoie 401.
          // On restaure alors la session invité mise en cache.
          const cached = readCachedUser();
          if (cached?.isGuest) {
            setUser(cached);
          } else {
            clearAuth();
            cacheUser(null);
          }
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    storeAuth(res);
    setUser(res.user);
    cacheUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await registerApi(payload);
    storeAuth(res);
    setUser(res.user);
    cacheUser(res.user);
    return res.user;
  }, []);

  const continueAsGuest = useCallback(async () => {
    const res = await guestApi();
    storeAuth(res);
    setUser(res.user);
    cacheUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      clearAuth();
      cacheUser(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isGuest: !!user?.isGuest,
      login,
      register,
      continueAsGuest,
      logout,
    }),
    [user, loading, login, register, continueAsGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}