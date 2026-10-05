import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── API-клиент к epats.io ─── */

function resolveApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }
  // В веб-превью в браузере
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.') || h.startsWith('172.')) {
      return `http://${h}:3000`;
    }
  }
  // На нативном Android / iOS в Expo Go (автоматически подхватывает IP хост-машины Metro)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.') || host === 'localhost' || host === '127.0.0.1')) {
      return `http://${host}:3000`;
    }
  }
  return 'https://epats.vercel.app';
}

export const API_BASE = resolveApiBase();
export const WEB_BASE = API_BASE;
const TOKEN_KEY = 'epats_session';

let sessionToken: string | null = null;

// SecureStore есть только на iOS/Android; в веб-превью храним токен в памяти
export async function loadToken(): Promise<string | null> {
  try {
    sessionToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    sessionToken = null;
  }
  return sessionToken;
}

export async function saveToken(token: string | null): Promise<void> {
  sessionToken = token;
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-Epats-Client', 'mobile');
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json() as Promise<T>;
}

/**
 * Данные с офлайн-кэшем: сразу отдаём последнее сохранённое значение,
 * затем обновляем из сети (и по интервалу). Курсы и погода доступны без интернета.
 */
export function useCached<T>(path: string, fallback: T, refreshMs?: number) {
  const [data, setData] = useState<T>(fallback);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fetched = useRef(false);
  const key = `cache:${path}`;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await api<T>(path);
      fetched.current = true;
      const ts = Date.now();
      setData(fresh);
      setUpdatedAt(ts);
      setOffline(false);
      AsyncStorage.setItem(key, JSON.stringify({ ts, data: fresh })).catch(() => {});
    } catch {
      setOffline(true);
    } finally {
      setRefreshing(false);
    }
  }, [path, key]);

  useEffect(() => {
    AsyncStorage.getItem(key).then(raw => {
      if (!raw || fetched.current) return; // сеть успела раньше — кэш не нужен
      try {
        const parsed = JSON.parse(raw) as { ts: number; data: T };
        setData(parsed.data);
        setUpdatedAt(parsed.ts);
      } catch {}
    }).catch(() => {});
    refresh();
    if (!refreshMs) return;
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [key, refresh, refreshMs]);

  return { data, updatedAt, offline, refreshing, refresh };
}
