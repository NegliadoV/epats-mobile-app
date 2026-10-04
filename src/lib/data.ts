import { useCached } from './api';

/* ─── Курсы (тот же /api/rates, что и у сайта) ─── */

export interface Rates {
  usdRub: number;
  usdVnd: number;
  usdtRub: number;
  vndRub: number;
  vnd1000Rub: number;
  updatedAt: string;
  source: string;
  p2pUsdtRub?: number;
  p2pUsdtVnd?: number;
  p2pVndRub?: number;
  p2pRub1000Vnd?: number;
  p2pSpreadPct?: number;
}

export const INITIAL_RATES: Rates = {
  usdRub: 83.49, usdVnd: 25940, usdtRub: 83.85, vndRub: 0.003218, vnd1000Rub: 3.22,
  p2pUsdtRub: 85.35, p2pUsdtVnd: 26330, p2pVndRub: 308.5, p2pRub1000Vnd: 3.24, p2pSpreadPct: 1.8,
  updatedAt: '', source: 'cache',
};

export const useRates = () => useCached<Rates>('/api/rates', INITIAL_RATES, 60_000);

export type Cur = 'VND' | 'RUB' | 'USD' | 'USDT';
export const CURRENCIES: { id: Cur; flag: string; symbol: string; name: string }[] = [
  { id: 'VND', flag: '🇻🇳', symbol: '₫', name: 'Донг' },
  { id: 'RUB', flag: '🇷🇺', symbol: '₽', name: 'Рубль' },
  { id: 'USD', flag: '🇺🇸', symbol: '$', name: 'Доллар' },
  { id: 'USDT', flag: '🪙', symbol: '₮', name: 'Tether' },
];

/** Сколько единиц валюты за 1 USD */
function perUsd(cur: Cur, r: Rates): number {
  switch (cur) {
    case 'USD': return 1;
    case 'RUB': return r.usdRub;
    case 'VND': return r.usdVnd;
    case 'USDT': return r.usdRub / r.usdtRub; // USDT дороже/дешевле доллара на величину рыночной премии
  }
}

export function convert(amount: number, from: Cur, to: Cur, r: Rates): number {
  return (amount / perUsd(from, r)) * perUsd(to, r);
}

/* ─── История для спарклайна ─── */

export interface History {
  labels: string[];
  series: Record<'usdRub' | 'usdtRub' | 'vnd1000Rub' | 'usdVnd' | 'usdtVnd' | 'rubVnd', number[]>;
}
export const useHistory = () => useCached<History | null>('/api/history', null);

/* ─── Погода (тот же /api/weather) ─── */

export interface DailyForecast {
  date: string; condition: string; emoji: string;
  tempMax: number; tempMin: number; rainProb: number; windMax: number; uvMax: number | null;
}

export interface CityWeather {
  city: string; flag: string; id: string;
  temp: number; feelsLike: number; humidity: number;
  condition: string; emoji: string;
  windSpeed: number; waveHeight: number | null; waterTemp: number | null; uvMax: number | null;
  airQuality: { aqi: number; short: string; color: string } | null;
  daily: DailyForecast[];
}

export const useWeather = () =>
  useCached<{ cities: Record<string, CityWeather> } | null>('/api/weather', null, 5 * 60_000);
