import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── API-клиент к epats.wiki ─── */

function resolveApiBase(): string {
  // Если разработчик явно указал свой URL через env — используем его
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }
  // Для мобильного приложения (как в Expo Go, так и в standalone APK) всегда используем боевой сервер epats.wiki,
  // так как именно к нему подключены Supabase и Telegram-бот @epatsiobot
  return 'https://epats.wiki';
}

export const API_BASE = resolveApiBase();
export const WEB_BASE = API_BASE;
const TOKEN_KEY = 'epats_session';

let sessionToken: string | null = null;

// SecureStore есть на iOS/Android; также дублируем в AsyncStorage для надёжности
export async function loadToken(): Promise<string | null> {
  try {
    sessionToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    sessionToken = null;
  }
  if (!sessionToken) {
    try {
      sessionToken = await AsyncStorage.getItem(TOKEN_KEY);
    } catch {}
  }
  return sessionToken;
}

export async function saveToken(token: string | null): Promise<void> {
  sessionToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Epats-Client': 'mobile',
  };

  if (init.headers) {
    if (typeof (init.headers as any).forEach === 'function') {
      (init.headers as any).forEach((value: string, key: string) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, init.headers);
    }
  }

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`${res.status} ${path}: ${errorText}`);
  }
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
