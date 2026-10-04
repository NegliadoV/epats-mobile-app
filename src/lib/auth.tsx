import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { api, loadToken, saveToken } from './api';

/* ─── Вход через Telegram-бота (тот же флоу, что на сайте, но токен вместо cookie) ───
   1. POST /api/auth/start  → { url, loginToken }
   2. Открываем t.me/epatsiobot?start=login_… — пользователь жмёт «Подтвердить»
   3. GET  /api/auth/poll   (X-Epats-Login-Token) → { status: 'ok', token, user }
   4. Токен в SecureStore, дальше все запросы с Authorization: Bearer            */

export interface PublicUser {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  has_photo: boolean;
}

interface MeResponse {
  user: PublicUser | null;
  settings: Record<string, unknown>;
  favorites: { kind: string; ref: string }[];
  configured: boolean;
}

type LoginState = 'idle' | 'waiting' | 'error';

interface AuthCtx {
  loading: boolean;
  user: PublicUser | null;
  me: MeResponse | null;
  loginState: LoginState;
  login: () => Promise<void>;
  cancelLogin: () => void;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const POLL_MS = 2000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const loginToken = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await api<MeResponse>('/api/me');
      setMe(data);
      if (!data.user) await saveToken(null); // токен истёк/пользователь удалён
    } catch {
      // офлайн — оставляем как было
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToken().then(reload);
  }, [reload]);

  const stopPolling = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const poll = useCallback(async () => {
    if (!loginToken.current) return;
    try {
      const r = await api<{ status: string; token?: string }>('/api/auth/poll', {
        headers: { 'X-Epats-Login-Token': loginToken.current },
      });
      if (r.status === 'ok' && r.token) {
        stopPolling();
        loginToken.current = null;
        await saveToken(r.token);
        setLoginState('idle');
        await reload();
      } else if (r.status === 'expired' || r.status === 'error') {
        stopPolling();
        setLoginState('error');
      }
    } catch {}
  }, [reload, stopPolling]);

  // Вернулись из Telegram — проверяем сразу, не дожидаясь таймера
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => { if (s === 'active') poll(); });
    return () => { sub.remove(); stopPolling(); };
  }, [poll, stopPolling]);

  const login = useCallback(async () => {
    try {
      const r = await api<{ ok: boolean; url: string; loginToken?: string }>('/api/auth/start', { method: 'POST' });
      if (!r.ok || !r.loginToken) throw new Error('start failed');
      loginToken.current = r.loginToken;
      setLoginState('waiting');
      stopPolling();
      timer.current = setInterval(poll, POLL_MS);
      await Linking.openURL(r.url);
    } catch {
      setLoginState('error');
    }
  }, [poll, stopPolling]);

  const cancelLogin = useCallback(() => {
    stopPolling();
    loginToken.current = null;
    setLoginState('idle');
  }, [stopPolling]);

  const logout = useCallback(async () => {
    await saveToken(null);
    setMe(m => (m ? { ...m, user: null, favorites: [] } : m));
  }, []);

  return (
    <Ctx.Provider value={{ loading, user: me?.user ?? null, me, loginState, login, cancelLogin, logout, reload }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
