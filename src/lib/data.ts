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

export const INITIAL_WEATHER: { cities: Record<string, CityWeather> } = {
  cities: {
    danang: {
      city: 'Дананг', flag: '🏖️', id: 'danang', temp: 29, feelsLike: 33, humidity: 76,
      condition: 'Переменная облачность', emoji: '🌤️', windSpeed: 14, waveHeight: 0.8, waterTemp: 27, uvMax: 7,
      airQuality: { aqi: 42, short: 'чистый', color: '#1fd1c1' },
      daily: [
        { date: new Date().toISOString(), condition: 'Переменная облачность', emoji: '🌤️', tempMax: 30, tempMin: 24, rainProb: 20, windMax: 16, uvMax: 7 },
      ],
    },
    nhatrang: {
      city: 'Нячанг', flag: '🌊', id: 'nhatrang', temp: 30, feelsLike: 34, humidity: 74,
      condition: 'Солнечно', emoji: '☀️', windSpeed: 12, waveHeight: 0.6, waterTemp: 28, uvMax: 8,
      airQuality: { aqi: 48, short: 'чистый', color: '#1fd1c1' },
      daily: [
        { date: new Date().toISOString(), condition: 'Солнечно', emoji: '☀️', tempMax: 31, tempMin: 25, rainProb: 10, windMax: 14, uvMax: 8 },
      ],
    },
    hcm: {
      city: 'Хошимин', flag: '🌆', id: 'hcm', temp: 33, feelsLike: 38, humidity: 70,
      condition: 'Жарко', emoji: '🌤️', windSpeed: 10, waveHeight: null, waterTemp: null, uvMax: 9,
      airQuality: { aqi: 75, short: 'умеренный', color: '#f59e0b' },
      daily: [
        { date: new Date().toISOString(), condition: 'Жарко', emoji: '🌤️', tempMax: 34, tempMin: 26, rainProb: 30, windMax: 12, uvMax: 9 },
      ],
    },
    hanoi: {
      city: 'Ханой', flag: '🏛️', id: 'hanoi', temp: 26, feelsLike: 27, humidity: 65,
      condition: 'Облачно', emoji: '⛅', windSpeed: 11, waveHeight: null, waterTemp: null, uvMax: 5,
      airQuality: { aqi: 92, short: 'умеренный', color: '#f59e0b' },
      daily: [
        { date: new Date().toISOString(), condition: 'Облачно', emoji: '⛅', tempMax: 27, tempMin: 21, rainProb: 15, windMax: 12, uvMax: 5 },
      ],
    },
    phuquoc: {
      city: 'Фукуок', flag: '🏝️', id: 'phuquoc', temp: 31, feelsLike: 35, humidity: 78,
      condition: 'Морской бриз', emoji: '🏖️', windSpeed: 16, waveHeight: 0.5, waterTemp: 29, uvMax: 8,
      airQuality: { aqi: 35, short: 'чистый', color: '#1fd1c1' },
      daily: [
        { date: new Date().toISOString(), condition: 'Морской бриз', emoji: '🏖️', tempMax: 31, tempMin: 26, rainProb: 20, windMax: 18, uvMax: 8 },
      ],
    },
  },
};

export const CITY_ORDER = ['danang', 'nhatrang', 'hcm', 'hanoi', 'phuquoc'];
export const CITY_NAMES: Record<string, string> = {
  danang: '🏖️ Дананг', nhatrang: '🌊 Нячанг', hcm: '🌆 Хошимин', hanoi: '🏛️ Ханой', phuquoc: '🏝️ Фукуок',
};

export const useWeather = () =>
  useCached<{ cities: Record<string, CityWeather> }>('/api/weather', INITIAL_WEATHER, 5 * 60_000);
