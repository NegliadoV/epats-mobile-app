import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { api, loadToken, saveToken } from './api';

export type CityId = 'danang' | 'nhatrang' | 'hcm' | 'hanoi' | 'phuquoc';
export type VisaTypeId = '45' | 'evisa90_single' | 'evisa90_multi' | 'phuquoc30';
export type CurrencyId = 'RUB' | 'USD' | 'USDT';
export type LifestyleId = 'budget' | 'comfort' | 'premium';
export type FamilyId = 'solo' | 'couple' | 'family' | 'big_family';

export interface UserSettings {
  city: CityId | null;
  visa_type: VisaTypeId | null;
  entry_date: string | null;
  departure_date: string | null;
  currency: CurrencyId | null;
  lifestyle: LifestyleId | null;
  family: FamilyId | null;
  budget_usd: number | null;
  notify_visa: boolean;
  notify_departure: boolean;
  notify_daily: boolean;
  notify_alerts: boolean;
}

export type SettingsPatch = Partial<UserSettings>;

export const DEFAULT_SETTINGS: UserSettings = {
  city: 'danang',
  visa_type: 'evisa90_single',
  entry_date: null,
  departure_date: null,
  currency: 'RUB',
  lifestyle: 'comfort',
  family: 'solo',
  budget_usd: 1200,
  notify_visa: true,
  notify_departure: true,
  notify_daily: false,
  notify_alerts: true,
};

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
  settings: UserSettings;
  favorites: FavoriteItem[];
  configured: boolean;
}

type LoginState = 'idle' | 'waiting' | 'error';

interface AuthCtx {
  loading: boolean;
  user: PublicUser | null;
  me: MeResponse | null;
  settings: UserSettings;
  saveSettings: (patch: SettingsPatch) => Promise<boolean>;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => Promise<boolean>;
  loginState: LoginState;
  login: () => Promise<void>;
  loginDemo: () => Promise<void>;
  cancelLogin: () => void;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const POLL_MS = 2000;
const FAV_STORAGE_KEY = 'epats_fav_articles';
const SETTINGS_STORAGE_KEY = 'epats_user_settings_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [localFavs, setLocalFavs] = useState<string[]>([]);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const loginToken = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load offline local favorites and settings on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(FAV_STORAGE_KEY),
      AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
    ]).then(([favRaw, setRaw]) => {
      if (favRaw) {
        try {
          const list = JSON.parse(favRaw);
          if (Array.isArray(list)) setLocalFavs(list);
        } catch {}
      }
      if (setRaw) {
        try {
          const parsed = JSON.parse(setRaw);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await api<MeResponse>('/api/me');
      setMe(data);

      // Синхронизация избранного с сервером
      if (data.favorites && data.favorites.length > 0) {
        const serverFavSlugs = data.favorites.filter(f => f.kind === 'article').map(f => f.ref);
        setLocalFavs(prev => {
          const merged = Array.from(new Set([...prev, ...serverFavSlugs]));
          AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
          return merged;
        });
      }

      // Синхронизация настроек и критериев с базой данных (Supabase)
      if (data.settings) {
        setSettings(prev => {
          const merged: UserSettings = { ...prev, ...data.settings };
          AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
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

  const loginDemo = useCallback(async () => {
    const demoUser: PublicUser = {
      id: 777777,
      first_name: 'Станислав',
      last_name: null,
      username: 'stanis',
      has_photo: false,
    };
    const demoSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      city: 'danang',
      entry_date: '2026-09-01',
      visa_type: 'evisa90_single',
      notify_visa: true,
    };
    await AsyncStorage.setItem('epats_demo_user', JSON.stringify({ user: demoUser, settings: demoSettings }));
    setMe({ user: demoUser, settings: demoSettings, favorites: [], configured: true });
    setSettings(demoSettings);
  }, []);

  const cancelLogin = useCallback(() => {
    stopPolling();
    loginToken.current = null;
    setLoginState('idle');
  }, [stopPolling]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('epats_demo_user');
    await saveToken(null);
    setMe(m => (m ? { ...m, user: null, favorites: [] } : m));
  }, []);

  const saveSettings = useCallback(async (patch: SettingsPatch): Promise<boolean> => {
    // 1. Оптимистичное сохранение в стейт
    setSettings(prev => {
      const next = { ...prev, ...patch };
      // 2. Сохранение в локальный офлайн-кэш на устройстве
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // 3. Если пользователь вошел — отправляем PATCH в Supabase через API
    if (me?.user) {
      try {
        const res = await api<{ ok: boolean; settings?: UserSettings }>('/api/me/settings', {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
        if (res.ok && res.settings) {
          setSettings(res.settings);
          AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(res.settings)).catch(() => {});
        }
        return true;
      } catch (err) {
        console.warn('[auth] settings sync to DB failed, kept offline', err);
        return false;
      }
    }
    return true;
  }, [me?.user]);

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
      settings,
      saveSettings,
      favorites: localFavs,
      isFavorite,
      toggleFavorite,
      loginState,
      login,
      loginDemo,
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
