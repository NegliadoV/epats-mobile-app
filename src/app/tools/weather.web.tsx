'use client';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { API_BASE } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth';

interface CityWeather {
  city: string;
  flag: string;
  id: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  emoji: string;
  windSpeed: number;
  pressure: number;
  precipitation?: number;
  waveHeight: number | null;
  waterTemp?: number | null;
  uvMax?: number | null;
  airQuality?: {
    aqi: number;
    pm25: number;
    pm10: number;
    label: string;
    color: string;
    maskAdvice: string;
    advice: string;
  };
  daily: {
    date: string;
    condition: string;
    emoji: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    windMax: number;
    uvMax: number | null;
  }[];
}

interface Storm {
  id: string;
  episode: number;
  name: string;
  alertLevel: 'Green' | 'Orange' | 'Red';
  lat: number;
  lon: number;
  maxWindKmh: number | null;
  severityText: string;
  updatedAt: string;
  reportUrl: string;
  distances: Record<string, number>;
  nearestCityId: string;
  nearestKm: number;
}

interface CityTyphoonRisk {
  cityId: string;
  cityName: string;
  flag: string;
  region: string;
  seasonPeak: string;
  threatLevel: 'calm' | 'monitoring' | 'warning' | 'alert';
  threatText: string;
  threatColor: string;
  nearestStorm: { name: string; km: number } | null;
  gustsKmh: number | null;
  rainTodayMm: number | null;
  floodRiskAreas: string[];
  advice: string;
}

interface TyphoonData {
  source: string;
  storms: Storm[] | null;
  cityRisks: CityTyphoonRisk[];
  historicBenchmarks: Record<string, any>;
  updatedAt: string;
}

const LEVEL_LABEL: Record<CityTyphoonRisk['threatLevel'], string> = {
  calm: '🟢 Спокойно',
  monitoring: '🟡 Следим',
  warning: '🟠 Внимание',
  alert: '🔴 Опасно',
};

const stormColor = (lvl: Storm['alertLevel']) => (lvl === 'Red' ? '#ef4444' : lvl === 'Orange' ? '#f97316' : '#f59e0b');

function fmtUpdated(iso: string): string {
  if (!iso) return '—';
  const d = new Date(/Z$|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
}

function stormKindRu(severityText: string): string {
  const t = severityText.toLowerCase();
  if (t.includes('typhoon') || t.includes('hurricane')) return 'Тайфун';
  if (t.includes('tropical storm')) return 'Тропический шторм';
  if (t.includes('depression')) return 'Тропическая депрессия';
  return 'Тропический циклон';
}

const SCALE_LEVELS = [
  {
    code: 'TD',
    name: 'Тропическая депрессия',
    wind: '< 62 км/ч',
    pressure: '> 1000 гПа',
    color: '#3b82f6',
    bike: 'Движение возможно, но на мостах ощущается боковой ветер. Осторожно на мокром асфальте.',
    power: 'Электричество и интернет стабильны, обрывов нет.',
    delivery: 'Grab, ShopeeFood и Be работают штатно (возможна небольшая наценка за дождь).',
    windows: 'Достаточно плотно закрыть окна и балконную дверь.',
    action: 'Зарядите пауэрбанк на всякий случай, следите за прогнозом.',
  },
  {
    code: 'TS',
    name: 'Тропический шторм',
    wind: '63 – 118 км/ч',
    pressure: '990 – 1000 гПа',
    color: '#eab308',
    bike: 'Опасно. Сильные шквалы могут сбить байк с траектории на мостах. Рекомендуется Grab такси.',
    power: 'Возможны кратковременные перебои со светом из-за упавших веток на локальные линии.',
    delivery: 'Доставки сокращают зону покрытия, время ожидания вырастает в 2–3 раза.',
    windows: 'Уберите с балконов сушилки, стулья и горшки — их сдувает ветром.',
    action: 'Купите 2–3 бутыли питьевой воды, запас продуктов на 2 дня.',
  },
  {
    code: 'CAT1_2',
    name: 'Тайфун Кат. 1–2 (Шторм)',
    wind: '119 – 177 км/ч',
    pressure: '965 – 989 гПа',
    color: '#f97316',
    bike: 'Категорически запрещено! Порывы ветра сбивают человека с ног, летают рекламные щиты.',
    power: 'Превентивное отключение электричества в прибрежных районах на 6–18 часов.',
    delivery: 'Grab и доставка еды полностью остановлены. Супермаркеты закрываются заблаговременно.',
    windows: 'Опустите рольставни. Если окна панорамные — зафиксируйте ручки, проложите полотенца.',
    action: 'Оставайтесь дома! Держите при себе фонари, документы в гермопакете, запас воды.',
  },
  {
    code: 'CAT3_4',
    name: 'Тайфун Кат. 3–4 (Разрушительный)',
    wind: '178 – 251 км/ч',
    pressure: '920 – 964 гПа',
    color: '#ef4444',
    bike: 'Смертельно опасно на открытом пространстве. Ветер срывает железные крыши.',
    power: 'Массовое отключение электросетей на 1–3 суток.',
    delivery: 'Город переходит в режим ЧС. Закрыты все магазины, аптеки, госпитали работают от генераторов.',
    windows: 'Стекла могут не выдержать перепада давления. Отойдите во внутренние помещения.',
    action: 'Строго следовать предписаниям властей и кондо. Не выходить на набережные!',
  },
  {
    code: 'CAT5',
    name: 'Супертайфун Кат. 5 (Yagi / Haiyan)',
    wind: '> 252 км/ч',
    pressure: '< 920 гПа',
    color: '#a855f7',
    bike: 'Катастрофическая сила. Полный запрет на выход из укрытий. Вырывает деревья.',
    power: 'Полный блэкаут региона. Ремонт инфраструктуры занимает до недели.',
    delivery: 'Чрезвычайное положение. Военные и спасательные службы распределяют помощь.',
    windows: 'Крупные витрины и незащищенные окна выдавливает шквалом.',
    action: 'Заблаговременная эвакуация из низменных прибрежных районов во внутренние капитальные здания.',
  },
];

const SAFETY_TIPS = [
  { icon: '🔋', title: 'Пауэрбанки и автономность', desc: 'Зарядите все аккумуляторы, ноутбуки и телефоны. При тайфуне электросети отключают превентивно на 6–24 часа.' },
  { icon: '💧', title: 'Запас питьевой воды и еды', desc: 'Купите минимум 2 бутыли по 19 литров воды и запас сухой еды / консервов на 3 дня. Доставки Grab и магазины закрываются.' },
  { icon: '🪟', title: 'Укрепление окон и балконов', desc: 'Уберите с балкона сушилки, стулья и горшки. Закройте плотно окна и опустите рольставни.' },
  { icon: '🛵', title: 'Безопасная парковка байка', desc: 'Не оставляйте скутер под деревьями или рекламными щитами. Загоните байк на подземную парковку кондоминиума.' },
];

export default function WeatherWebScreen() {
  const { settings } = useAuth();
  const [weatherData, setWeatherData] = useState<Record<string, CityWeather> | null>(null);
  const [typhoonData, setTyphoonData] = useState<TyphoonData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(settings?.city || 'danang');

  useEffect(() => {
    if (settings?.city) setSelectedCity(settings.city);
  }, [settings?.city]);
  const [activeScenario, setActiveScenario] = useState<'live' | 'yagi' | 'damrey'>('live');
  const [selectedScaleIndex, setSelectedScaleIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/weather`).then(r => r.json()),
      fetch(`${API_BASE}/api/typhoon`).then(r => r.json()),
    ])
      .then(([w, t]) => {
        if (w?.cities) setWeatherData(w.cities);
        if (t?.cityRisks) setTyphoonData(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeWeather = weatherData?.[selectedCity];
  const activeRisk = typhoonData?.cityRisks.find(r => r.cityId === selectedCity);
  const storms = typhoonData ? typhoonData.storms : null;
  const visibleStorms = (storms ?? []).filter(s => s.lat >= 8 && s.lat <= 23 && s.lon >= 102 && s.lon <= 119);

  const projectCoords = (lat: number, lon: number) => {
    const minLat = 8.0, maxLat = 23.0;
    const minLon = 102.0, maxLon = 119.0;
    const x = ((lon - minLon) / (maxLon - minLon)) * 500 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 390 + 15;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const CITY_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
    hanoi: { lat: 21.0285, lon: 105.8542, name: 'Ханой' },
    danang: { lat: 16.0544, lon: 108.2022, name: 'Дананг' },
    nhatrang: { lat: 12.2388, lon: 109.1967, name: 'Нячанг' },
    hcm: { lat: 10.8231, lon: 106.6297, name: 'Хошимин' },
    phuquoc: { lat: 10.2289, lon: 103.9572, name: 'Фукуок' },
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      backgroundColor: '#0c0714',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 90,
      boxSizing: 'border-box',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '600px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '8px 16px',
              color: '#f8fafc',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <BrandLogo size={20} />
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.wiki</span> → <span style={{ color: '#1fd1c1' }}>Погода & Радар</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 14,
            fontSize: 12, color: '#1fd1c1', fontWeight: 700,
          }}>
            🛰️ Open-Meteo · GDACS · Качество воздуха (AQI) · Волны и тайфуны
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            🌦️ Погода, качество воздуха и Радар тайфунов
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Точная температура, уровень смога (PM2.5), волны для купания и трекер активных циклонов в Южно-Китайском море (Biển Đông).
          </p>
        </div>

        {/* City Switcher Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { id: 'danang', label: '🏖️ Дананг' },
            { id: 'nhatrang', label: '🌊 Нячанг' },
            { id: 'hcm', label: '🌆 Хошимин' },
            { id: 'hanoi', label: '🏛️ Ханой' },
            { id: 'phuquoc', label: '🏝️ Фукуок' },
          ].map(c => {
            const active = selectedCity === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: active ? '1.5px solid #1fd1c1' : '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(31,209,193,0.16)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#1fd1c1' : '#cbd5e1',
                  fontWeight: active ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 0 16px rgba(31,209,193,0.2)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{c.label}</span>
                {weatherData?.[c.id] && (
                  <span style={{ fontSize: 12, fontWeight: 700, opacity: active ? 1 : 0.85 }}>
                    {weatherData[c.id].temp}° <span style={{ fontSize: 11, fontWeight: 500, color: active ? 'inherit' : '#64748b' }}>(ощущ. {weatherData[c.id].feelsLike}°)</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CURRENT CITY WEATHER CARD */}
        {loading || !activeWeather ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#94a3b8',
            borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            ⏳ Загрузка метеоданных со спутников...
          </div>
        ) : (
          <div style={{
            padding: '32px', marginBottom: 28,
            borderRadius: 24,
            background: 'rgba(25, 16, 38, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{activeWeather.flag}</span>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#fff' }}>
                      {activeWeather.city}
                    </h2>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      Сейчас во Вьетнаме
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 68, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {activeWeather.temp}°
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 40 }}>{activeWeather.emoji}</span>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                        {activeWeather.condition}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: Math.abs(activeWeather.feelsLike - activeWeather.temp) >= 3 ? 'rgba(245,158,11,0.14)' : 'rgba(31,209,193,0.12)',
                        border: '1px solid',
                        borderColor: Math.abs(activeWeather.feelsLike - activeWeather.temp) >= 3 ? 'rgba(245,158,11,0.35)' : 'rgba(31,209,193,0.3)',
                        color: Math.abs(activeWeather.feelsLike - activeWeather.temp) >= 3 ? '#f59e0b' : '#1fd1c1',
                        fontSize: 13,
                        fontWeight: 800,
                      }}>
                        <span>🌡️ Ощущается как <b>{activeWeather.feelsLike}°C</b></span>
                        {activeWeather.feelsLike !== activeWeather.temp && (
                          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>
                            ({activeWeather.feelsLike > activeWeather.temp ? `+${activeWeather.feelsLike - activeWeather.temp}° из-за влажности` : `${activeWeather.feelsLike - activeWeather.temp}°`})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {activeRisk && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: activeRisk.threatLevel === 'calm' ? 'rgba(31,209,193,0.1)' : 'rgba(245,158,11,0.12)',
                    border: '1px solid',
                    borderColor: activeRisk.threatLevel === 'calm' ? 'rgba(31,209,193,0.3)' : 'rgba(245,158,11,0.3)',
                    marginTop: 8,
                  }}>
                    <span style={{ fontSize: 13 }}>{activeRisk.threatText}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>· {activeRisk.seasonPeak}</span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  {
                    label: 'Ощущается как',
                    val: activeWeather.feelsLike + '°C',
                    icon: '🌡️',
                    sub: activeWeather.feelsLike > activeWeather.temp
                      ? `Жарче на +${activeWeather.feelsLike - activeWeather.temp}° из-за влажности ${activeWeather.humidity}%`
                      : 'Совпадает с фактической',
                    highlight: true,
                  },
                  { label: 'Влажность воздуха', val: activeWeather.humidity + '%', icon: '💧', sub: 'Тропический климат' },
                  { label: 'Скорость ветра', val: activeWeather.windSpeed + ' км/ч', icon: '💨', sub: 'Легкий бриз' },
                  { label: 'Давление', val: activeWeather.pressure + ' гПа', icon: '🧭', sub: 'Нормальное' },
                  {
                    label: activeWeather.waveHeight !== null ? 'Волны на море' : 'Осадки',
                    val: activeWeather.waveHeight !== null ? activeWeather.waveHeight + ' м' : (activeWeather.precipitation || 0) + ' мм',
                    icon: activeWeather.waveHeight !== null ? '🌊' : '🌧️',
                    sub: activeWeather.waveHeight !== null
                      ? (activeWeather.waveHeight < 0.8 ? 'Купание комфортно' : 'Осторожно, волны!') + (activeWeather.waterTemp != null ? ` · вода ${activeWeather.waterTemp}°` : '')
                      : 'Осадки за час',
                  },
                  {
                    label: 'УФ-индекс сегодня',
                    val: activeWeather.uvMax != null ? String(Math.round(activeWeather.uvMax)) : '—',
                    icon: '☀️',
                    sub: activeWeather.uvMax == null ? 'Нет данных'
                      : activeWeather.uvMax >= 8 ? 'Очень высокий — крем SPF 50'
                      : activeWeather.uvMax >= 6 ? 'Высокий — головной убор'
                      : 'Умеренный',
                  },
                ].map((m, idx) => (
                  <div key={idx} style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: (m as any).highlight ? 'rgba(31,209,193,0.1)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: (m as any).highlight ? 'rgba(31,209,193,0.3)' : 'rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: (m as any).highlight ? '#1fd1c1' : '#94a3b8', marginBottom: 4, fontWeight: (m as any).highlight ? 800 : 500 }}>
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: (m as any).highlight ? '#1fd1c1' : '#fff' }}>{m.val}</div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AQI Panel */}
            {activeWeather.airQuality && (
              <div style={{
                marginTop: 22,
                padding: '18px 20px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>🍃</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      Качество воздуха (AQI):
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: activeWeather.airQuality.color,
                      background: activeWeather.airQuality.color + '18',
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid ' + activeWeather.airQuality.color + '40',
                    }}>
                      Индекс {activeWeather.airQuality.aqi} · {activeWeather.airQuality.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                    {activeWeather.airQuality.advice}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 90 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>PM2.5</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{activeWeather.airQuality.pm25 ?? '—'} мкг/м³</div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 90 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>PM10</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{activeWeather.airQuality.pm10 ?? '—'} мкг/м³</div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>😷 Маска на байке</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1fd1c1' }}>{activeWeather.airQuality.maskAdvice}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {activeWeather.daily && activeWeather.daily.length > 0 && (
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  📅 Прогноз на 5 дней — {activeWeather.city}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  {activeWeather.daily.map((day, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>{day.date}</div>
                      <div style={{ fontSize: 26, marginBottom: 4 }}>{day.emoji}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                        {day.tempMax}° <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/ {day.tempMin}°</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        🌧️ {day.rainProb}% дождь
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERACTIVE TYPHOON RADAR */}
        <div style={{
          padding: 30, marginBottom: 32,
          borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 24 }}>🌀</span>
                <h2 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: 0 }}>
                  Интерактивный радар тайфунов Biển Đông
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                Активные циклоны по данным GDACS (ООН/ЕС) и архив крупнейших тайфунов
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveScenario('live')}
                style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: activeScenario === 'live' ? '1.5px solid #1fd1c1' : '1px solid rgba(255,255,255,0.1)',
                  background: activeScenario === 'live' ? 'rgba(31,209,193,0.16)' : 'rgba(255,255,255,0.04)',
                  color: activeScenario === 'live' ? '#1fd1c1' : '#94a3b8',
                }}
              >
                ● Сейчас (GDACS)
              </button>
              <button
                onClick={() => setActiveScenario('yagi')}
                style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: activeScenario === 'yagi' ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  background: activeScenario === 'yagi' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeScenario === 'yagi' ? '#ef4444' : '#94a3b8',
                }}
              >
                ⚡ Yagi (2024)
              </button>
              <button
                onClick={() => setActiveScenario('damrey')}
                style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: activeScenario === 'damrey' ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  background: activeScenario === 'damrey' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeScenario === 'damrey' ? '#f59e0b' : '#94a3b8',
                }}
              >
                🌊 Damrey (2017)
              </button>
            </div>
          </div>

          {/* SVG Radar Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 380,
            borderRadius: 16,
            background: 'linear-gradient(180deg, #07131e 0%, #0b1f30 100%)',
            border: '1px solid rgba(31,209,193,0.25)',
            overflow: 'hidden',
            marginBottom: 20,
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)',
          }}>
            <svg viewBox="0 0 520 400" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>
              <defs>
                <radialGradient id="stormEyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="100%" stopColor="#1fd1c1" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* Concentric Radar Grid Rings */}
              <circle cx="260" cy="200" r="70" fill="none" stroke="rgba(31,209,193,0.1)" strokeDasharray="3,3" />
              <circle cx="260" cy="200" r="130" fill="none" stroke="rgba(31,209,193,0.1)" strokeDasharray="4,4" />
              <circle cx="260" cy="200" r="190" fill="none" stroke="rgba(31,209,193,0.08)" strokeDasharray="4,4" />

              {/* Rotating Radar Sweep Beam */}
              <g className="animate-radar-spin" style={{ transformOrigin: '260px 200px' }}>
                <line x1="260" y1="200" x2="260" y2="0" stroke="rgba(31,209,193,0.5)" strokeWidth="1.5" />
                <path d="M 260 200 L 260 0 A 200 200 0 0 1 360 27 Z" fill="url(#radarSweepGrad)" />
              </g>

              <text x="320" y="32" fill="rgba(255,255,255,0.22)" fontSize="11" fontWeight="700" letterSpacing="2">
                BIỂN ĐÔNG / SOUTH CHINA SEA
              </text>

              {/* Hainan Island */}
              <path d="M 240 70 Q 265 65 275 85 Q 270 110 245 105 Q 230 95 240 70 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <text x="246" y="90" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">Хайнань</text>

              {/* Philippines Clue */}
              <path d="M 450 140 Q 480 180 470 260 Q 440 230 450 140 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x="446" y="200" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600">Филиппины</text>

              {/* Vietnam Coastline */}
              <path
                d="M 120 40 Q 150 45 170 58 Q 190 70 195 90 Q 175 110 182 135 Q 190 155 198 175 Q 210 200 215 225 Q 218 250 205 280 Q 190 310 170 330 Q 145 350 120 345 Q 95 340 90 320 Q 115 295 130 250 Q 135 210 125 150 Q 110 90 120 40 Z"
                fill="rgba(31,209,193, 0.08)"
                stroke="#1fd1c1"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Paracel / Spratly Islands */}
              <circle cx="310" cy="150" r="3" fill="#f59e0b" opacity="0.6" />
              <text x="318" y="153" fill="rgba(255,255,255,0.3)" fontSize="8">о-ва Парасель (Hoàng Sa)</text>
              <circle cx="340" cy="270" r="3" fill="#f59e0b" opacity="0.6" />
              <text x="348" y="273" fill="rgba(255,255,255,0.3)" fontSize="8">о-ва Спратли (Trường Sa)</text>

              {/* LIVE: GDACS Storms */}
              {activeScenario === 'live' && visibleStorms.map(s => {
                const p = projectCoords(s.lat, s.lon);
                const c = stormColor(s.alertLevel);
                return (
                  <g key={s.id}>
                    <circle cx={p.x} cy={p.y} r="28" fill="url(#stormEyeGlow)" />
                    <circle cx={p.x} cy={p.y} r="8" fill={c} stroke="#fff" strokeWidth="2" />
                    <text x={p.x - 30} y={p.y - 32} fill="#fff" fontSize="11" fontWeight="800" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
                      🌀 {s.name}
                    </text>
                    {s.maxWindKmh !== null && (
                      <text x={p.x - 30} y={p.y - 19} fill={c} fontSize="9" fontWeight="700">
                        Пик ветра: {s.maxWindKmh} км/ч
                      </text>
                    )}
                  </g>
                );
              })}

              {/* YAGI 2024 BENCHMARK */}
              {activeScenario === 'yagi' && (
                <g>
                  <path d="M 440 100 L 340 78 L 260 62 L 205 66 L 155 70" stroke="#ef4444" strokeWidth="3.5" fill="none" />
                  <circle cx="440" cy="100" r="6" fill="#ef4444" />
                  <circle cx="340" cy="78" r="8" fill="#a855f7" stroke="#fff" strokeWidth="1.5" />
                  <text x="310" y="98" fill="#a855f7" fontSize="9" fontWeight="800">Кат. 5 (260 км/ч)</text>
                  <circle cx="205" cy="66" r="9" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                  <text x="180" y="56" fill="#ef4444" fontSize="10" fontWeight="900">Landfall Хайфон</text>
                </g>
              )}

              {/* DAMREY 2017 BENCHMARK */}
              {activeScenario === 'damrey' && (
                <g>
                  <path d="M 430 250 L 330 248 L 245 252 L 210 255" stroke="#f59e0b" strokeWidth="3" fill="none" />
                  <circle cx="430" cy="250" r="5" fill="#f59e0b" />
                  <circle cx="210" cy="255" r="9" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                  <text x="125" y="258" fill="#ef4444" fontSize="10" fontWeight="900">Landfall Нячанг (165 км/ч)</text>
                </g>
              )}

              {/* CITY PINS */}
              {Object.entries(CITY_COORDS).map(([cityKey, info]) => {
                const pt = projectCoords(info.lat, info.lon);
                const isSelected = selectedCity === cityKey;
                return (
                  <g key={cityKey} onClick={() => setSelectedCity(cityKey)} style={{ cursor: 'pointer' }}>
                    {isSelected && (
                      <circle cx={pt.x} cy={pt.y} r="12" fill="none" stroke="#1fd1c1" strokeWidth="1.5" opacity="0.7">
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={pt.x} cy={pt.y}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? '#1fd1c1' : '#ffffff'}
                      stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.6)'}
                      strokeWidth={isSelected ? 2.5 : 1}
                    />
                    <text
                      x={pt.x + 8} y={pt.y + 4}
                      fill={isSelected ? '#1fd1c1' : '#e2e8f0'}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? '800' : '600'}
                      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.9))"
                    >
                      {info.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {activeScenario === 'live' && !loading && visibleStorms.length === 0 && (
              <div style={{
                position: 'absolute', top: 14, right: 14, maxWidth: 280,
                padding: '8px 12px', borderRadius: 10, background: 'rgba(11, 31, 48, 0.85)',
                border: '1px solid rgba(31,209,193,0.3)', fontSize: 11, lineHeight: 1.5, color: '#e2e8f0', zIndex: 3,
              }}>
                {storms === null
                  ? '⚪ Нет связи с GDACS'
                  : storms.length === 0
                  ? '🟢 Сейчас активных циклонов в регионе нет'
                  : `🌀 Активных циклонов: ${storms.length}`}
              </div>
            )}
          </div>

          {/* Scale Simulator */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
              📊 Шкала тайфунов Saffir-Simpson: последствия для экспата
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {SCALE_LEVELS.map((lvl, idx) => {
                const active = selectedScaleIndex === idx;
                return (
                  <button
                    key={lvl.code}
                    onClick={() => setSelectedScaleIndex(idx)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: '1.5px solid',
                      borderColor: active ? lvl.color : 'rgba(255,255,255,0.1)',
                      background: active ? lvl.color + '22' : 'rgba(255,255,255,0.02)',
                      color: active ? lvl.color : '#94a3b8',
                      fontWeight: active ? 800 : 600, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {lvl.name} ({lvl.wind})
                  </button>
                );
              })}
            </div>

            {(() => {
              const cur = SCALE_LEVELS[selectedScaleIndex];
              return (
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '16px', border: '1px solid ' + cur.color + '44' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: cur.color, marginBottom: 12 }}>
                    {cur.name} · <span style={{ fontSize: 13, color: '#94a3b8' }}>Ветер: {cur.wind}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <b style={{ color: '#fff', display: 'block', marginBottom: 2 }}>🛵 Поездки на байке</b>
                      <span style={{ color: '#94a3b8' }}>{cur.bike}</span>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <b style={{ color: '#fff', display: 'block', marginBottom: 2 }}>⚡ Электричество и 4G</b>
                      <span style={{ color: '#94a3b8' }}>{cur.power}</span>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <b style={{ color: '#fff', display: 'block', marginBottom: 2 }}>🍱 Grab & Доставка</b>
                      <span style={{ color: '#94a3b8' }}>{cur.delivery}</span>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <b style={{ color: '#fff', display: 'block', marginBottom: 2 }}>🪟 Окна и балконы</b>
                      <span style={{ color: '#94a3b8' }}>{cur.windows}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: cur.color + '15', fontSize: 12, color: '#fff' }}>
                    <b>🎯 Что делать экспату:</b> {cur.action}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Emergency numbers */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
            paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12,
          }}>
            <div>
              <b style={{ color: '#fff' }}>🚨 Экстренные службы Вьетнама:</b>{' '}
              <span style={{ color: '#1fd1c1', fontWeight: 800 }}>112</span> (Спасение при ЧС) ·{' '}
              <span style={{ color: '#38bdf8', fontWeight: 800 }}>113</span> (Полиция) ·{' '}
              <span style={{ color: '#ef4444', fontWeight: 800 }}>115</span> (Скорая)
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://nchmf.gov.vn" target="_blank" rel="noopener noreferrer" style={{ color: '#1fd1c1', textDecoration: 'none', fontWeight: 700 }}>
                NCHMF Vietnam ↗
              </a>
              <a href="https://www.windy.com/?15.2,112.5,6" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>
                Windy Live ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
