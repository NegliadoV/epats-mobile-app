import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { api, loadToken, saveToken } from './api';

export interface PublicUser {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  has_photo: boolean;
}

export interface FavoriteItem {
  kind: string;
  ref: string;
}

interface MeResponse {
  user: PublicUser | null;
  settings: Record<string, unknown>;
  favorites: FavoriteItem[];
  configured: boolean;
}

type LoginState = 'idle' | 'waiting' | 'error';

interface AuthCtx {
  loading: boolean;
  user: PublicUser | null;
  me: MeResponse | null;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => Promise<boolean>;
  loginState: LoginState;
  login: () => Promise<void>;
  cancelLogin: () => void;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const POLL_MS = 2000;
const FAV_STORAGE_KEY = 'epats_fav_articles';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [localFavs, setLocalFavs] = useState<string[]>([]);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const loginToken = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load offline local favorites on mount
  useEffect(() => {
    AsyncStorage.getItem(FAV_STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) setLocalFavs(list);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await api<MeResponse>('/api/me');
      setMe(data);
      if (data.favorites && data.favorites.length > 0) {
        const serverFavSlugs = data.favorites.filter(f => f.kind === 'article').map(f => f.ref);
        setLocalFavs(prev => {
          const merged = Array.from(new Set([...prev, ...serverFavSlugs]));
          AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
          return merged;
        });
      }
      if (!data.user) await saveToken(null);
    } catch {
      // offline - keep existing state
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

  const isFavorite = useCallback((slug: string) => {
    return localFavs.includes(slug);
  }, [localFavs]);

  const toggleFavorite = useCallback(async (slug: string): Promise<boolean> => {
    const isCurrentlyFav = localFavs.includes(slug);
    const nextOn = !isCurrentlyFav;
    const nextList = nextOn ? [...localFavs, slug] : localFavs.filter(s => s !== slug);

    setLocalFavs(nextList);
    AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(nextList)).catch(() => {});

    if (me?.user) {
      try {
        await api('/api/me/favorites', {
          method: 'POST',
          body: JSON.stringify({ kind: 'article', ref: slug, on: nextOn }),
        });
      } catch {}
    }
    return nextOn;
  }, [localFavs, me?.user]);

  return (
    <Ctx.Provider value={{
      loading,
      user: me?.user ?? null,
      me,
      favorites: localFavs,
      isFavorite,
      toggleFavorite,
      loginState,
      login,
      cancelLogin,
      logout,
      reload,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
