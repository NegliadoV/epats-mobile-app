'use client';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { ARTICLES, CATEGORIES, getFeaturedArticles } from '@shared/data/articles';
import { useRates, useWeather, useHistory } from '@/lib/data';
import BrandLogo from '@/components/BrandLogo';

const CITY_OPTIONS = [
  { id: 'danang', name: 'Дананг', emoji: '🏖️' },
  { id: 'nhatrang', name: 'Нячанг', emoji: '🌊' },
  { id: 'hcm', name: 'Хошимин', emoji: '🌆' },
  { id: 'hanoi', name: 'Ханой', emoji: '🏛️' },
  { id: 'phuquoc', name: 'Фукуок', emoji: '🏝️' },
];

const TOOLS = [
  {
    href: '/tools/calculator',
    icon: '🧮',
    title: 'Калькулятор бюджета',
    desc: 'Сколько стоит месяц жизни в рублях, донгах и долларах под твой город и состав семьи.',
    badge: 'Популярное',
    badgeColor: '#1fd1c1',
  },
  {
    href: '/tools/visa',
    icon: '🚌',
    title: 'Визаран и дедлайн визы',
    desc: 'Калькулятор 45 дней безвиза, e-visa 90 дней, маршруты Лао Бао, Мокбай, Каучео и чеклист.',
    badge: 'Must Have',
    badgeColor: '#1fd1c1',
  },
  {
    href: '/tools/electricity',
    icon: '⚡',
    title: 'Счёт за электричество EVN',
    desc: 'Сверка честного тарифа EVN со счетом лендлорда, расчет переплаты и шаблон для переписки.',
    badge: 'Новинка',
    badgeColor: '#f59e0b',
  },
  {
    href: '/tools/weather',
    icon: '🌦️',
    title: 'Погода, AQI и Радар тайфунов',
    desc: 'Точная температура, уровень смога PM2.5, морские волны и живой трекер циклонов в реальном времени.',
    badge: 'Live Radar',
    badgeColor: '#1fd1c1',
  },
  {
    href: '/tools/neighborhoods',
    icon: '🏡',
    title: 'Гид по районам и аренде',
    desc: 'Где жить экспату в Дананге, Нячанге, Сайгоне: оптоволокно, шум, стройки и цены на кондо.',
    badge: 'Карта',
    badgeColor: '#6366f1',
  },
  {
    href: '/tools/converter',
    icon: '💱',
    title: 'Конвертер валют и купюр',
    desc: 'Рубли, доллары, USDT и донги (VND). Официальные и Bybit P2P курсы, как отличить 20k от 500k.',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/tools/checklist',
    icon: '📋',
    title: 'Чеклист переезда',
    desc: 'Пошаговый план: сборы дома, в аэропорту, первые 3 дня и обустройство за месяц.',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/tools/cities',
    icon: '🏙️',
    title: 'Сравнение городов',
    desc: 'Дананг, Нячанг, Хошимин, Ханой, Фукуок — плюсы, минусы, ритм жизни и бюджеты.',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/tools/telegram',
    icon: '💬',
    title: 'Чаты экспатов',
    desc: 'Проверенные Telegram-сообщества взаимопомощи, жилья, обменов и медицины по городам.',
    badge: null,
    badgeColor: '',
  },
];

export default function HomeWebScreen() {
  const rates = useRates();
  const history = useHistory();
  const weather = useWeather();
  const [selectedCity, setSelectedCity] = useState('danang');

  const r = rates.data;
  const usdtVnd = Math.round(r.usdVnd * (r.usdtRub / r.usdRub));
  const w = weather.data?.cities?.[selectedCity];
  const featured = getFeaturedArticles().slice(0, 4);

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
      backgroundColor: '#080711',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 110,
      boxSizing: 'border-box',
    }}>
      {/* Background ambient radial glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '700px',
        background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.07) 50%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 7, 17, 0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto', padding: '0 20px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div
            onClick={() => router.push('/' as any)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <BrandLogo size={34} />
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px' }}>
              epats<span style={{ color: '#ff6b4a' }}>.io</span>
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => router.push('/tools' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              🛠️ Инструменты
            </button>
            <button
              onClick={() => router.push('/articles' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              📖 Статьи
            </button>
            <button
              onClick={() => router.push('/me' as any)}
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,74,0.2), rgba(255,154,60,0.15))',
                border: '1px solid rgba(255,107,74,0.4)',
                color: '#ff8a65',
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              👤 Мой Вьетнам
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>

        {/* ═══ HERO SECTION ═══ */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
          alignItems: 'center',
          marginBottom: 56,
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.35)',
              borderRadius: 999, padding: '6px 16px', marginBottom: 20,
              fontSize: 12.5, color: '#1fd1c1', fontWeight: 800,
            }}>
              <span className="animate-neon-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#1fd1c1', boxShadow: '0 0 10px #1fd1c1' }} />
              Вьетнам для своих · 2026
            </div>

            <h1 style={{
              fontSize: 'clamp(2.3rem, 5vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              margin: '0 0 20px',
              color: '#ffffff',
            }}>
              Живи у моря.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #ff6b4a 0%, #ff9a3c 50%, #1fd1c1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Мы разберёмся
              </span>{' '}
              с остальным.
            </h1>

            <p style={{
              fontSize: 16,
              color: '#94a3b8',
              lineHeight: 1.75,
              maxWidth: 520,
              margin: '0 0 32px',
            }}>
              Визаран, жильё, деньги, честный тариф электричества и проверенные чаты — прикладные инструменты и честные гайды от резидентов Дананга, Нячанга и Сайгона.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
              <button
                className="epats-btn"
                onClick={() => router.push('/tools/visa' as any)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b4a, #ff9a3c)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 24px',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 24px -6px rgba(255,107,74,0.5)',
                }}
              >
                🚌 Посчитать визаран
              </button>
              <button
                className="epats-btn"
                onClick={() => router.push('/tools' as any)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  padding: '14px 24px',
                  color: '#f8fafc',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  backdropFilter: 'blur(10px)',
                }}
              >
                🛠️ Все инструменты
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1fd1c1', lineHeight: 1 }}>45 дней</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Безвиз РФ во Вьетнам</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ff9a3c', lineHeight: 1 }}>9 тулов</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Калькуляторы и радар</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>15+ гайдов</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Проверено экспатами</div>
              </div>
            </div>
          </div>

          {/* Tropical Sea Retro Scene Card with Fluid Animations */}
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '1 / 1', maxWidth: 440, marginLeft: 'auto',
            borderRadius: 32, overflow: 'hidden',
            background: 'linear-gradient(180deg, #1f0b3b 0%, #52164a 38%, #e0485c 66%, #ffa138 100%)',
            boxShadow: '0 30px 70px -20px rgba(255,107,74,0.4), inset 0 0 0 1px rgba(255,255,255,0.15)',
          }}>
            {/* Twinkling Stars */}
            <svg viewBox="0 0 400 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
              {[[40, 40], [90, 70], [150, 30], [300, 50], [350, 90], [260, 20], [200, 80], [60, 120], [340, 140]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} fill="#fff" opacity={0.65}>
                  <animate attributeName="opacity" values="0.2;1;0.2" dur={`${2.5 + (i % 3)}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>

            {/* Floating Glowing Retro Sun */}
            <div
              className="animate-sun-float"
              style={{
                position: 'absolute', width: '56%', height: '56%', left: '22%', top: '20%',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #ffe066 0%, #ff5252 100%)',
                boxShadow: '0 0 90px rgba(255,160,50,0.65)',
              }}
            />

            {/* Drifting Waves */}
            <svg viewBox="0 0 800 160" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0, width: '200%', height: '32%' }} className="animate-wave-slow" aria-hidden="true">
              <path d="M0 40 Q100 15 200 40 T400 40 T600 40 T800 40 V160 H0z" fill="#1fd1c1" opacity="0.6" />
            </svg>
            <svg viewBox="0 0 800 160" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0, width: '200%', height: '24%' }} className="animate-wave" aria-hidden="true">
              <path d="M0 50 Q100 25 200 50 T400 50 T600 50 T800 50 V160 H0z" fill="#0fa89a" />
            </svg>
            <svg viewBox="0 0 800 160" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0, width: '200%', height: '16%' }} className="animate-wave-slow" aria-hidden="true">
              <path d="M0 60 Q100 35 200 60 T400 60 T600 60 T800 60 V160 H0z" fill="#082f3a" />
            </svg>

            {/* Swaying Tropical Palms */}
            <svg viewBox="0 0 200 300" style={{ position: 'absolute', left: '-4%', bottom: '4%', width: '48%' }} className="animate-palm-sway" aria-hidden="true">
              <g fill="#130826">
                <path d="M96 300c-6-70 0-140 22-196l8 3c-20 56-26 124-20 193z" />
                <path d="M120 104c-26-34-70-42-112-28 38-2 70 8 90 30-36-10-70-2-98 22 38-12 76-10 106-2z" />
                <path d="M120 104c14-40 54-62 98-56-38 8-64 24-80 50 30-20 64-22 98-8-40-2-74 8-104 24z" />
                <path d="M120 104c-4-38 10-72 42-96-18 30-26 58-22 90z" />
                <path d="M120 104c-22-26-30-58-20-96 6 34 14 62 32 90z" />
              </g>
            </svg>

            {/* Floating Interactive Badges */}
            <div
              className="animate-float-slow"
              style={{
                position: 'absolute', bottom: 18, left: 18, padding: '7px 14px', borderRadius: 12,
                background: 'rgba(12, 7, 20, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              📍 Đà Nẵng · 16°N
            </div>

            <div
              className="animate-float-slow-rev"
              style={{
                position: 'absolute', top: 18, right: 18, padding: '7px 14px', borderRadius: 999,
                background: 'rgba(31,209,193,0.22)', backdropFilter: 'blur(12px)', border: '1px solid rgba(31,209,193,0.5)',
                color: '#1fd1c1', fontSize: 11.5, fontWeight: 800,
                boxShadow: '0 8px 20px rgba(31,209,193,0.25)',
              }}
            >
              🌊 Тёплое море 30°C
            </div>
          </div>
        </section>

        {/* ═══ LIVE BENTO WIDGETS: RATES & WEATHER ═══ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 56 }}>

          {/* Currency Bento Card */}
          <div className="epats-card" style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="icon-spring" style={{ fontSize: 20 }}>💹</span>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0 }}>Курсы валют</h3>
              </div>
              <span style={{ fontSize: 12, color: '#1fd1c1', background: 'rgba(31,209,193,0.12)', padding: '3px 10px', borderRadius: 999, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="animate-neon-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1fd1c1', display: 'inline-block' }} />
                Live
              </span>
            </div>

            <div style={{ display: 'grid', gap: 10, marginBottom: 16, flex: 1 }}>
              {[
                { label: 'USD / RUB', value: `${r.usdRub.toFixed(1)} ₽`, sub: 'Биржевой' },
                { label: 'USDT / RUB', value: `${r.usdtRub.toFixed(1)} ₽`, sub: 'P2P' },
                { label: '1 000₫ / RUB', value: `${r.vnd1000Rub.toFixed(2)} ₽`, sub: '1 млн ₫ ≈ ' + Math.round(1000 * r.vnd1000Rub) + ' ₽' },
                { label: 'USD / VND', value: `${r.usdVnd.toLocaleString('ru-RU')} ₫`, sub: 'Официальный' },
                { label: 'USDT / VND', value: `${usdtVnd.toLocaleString('ru-RU')} ₫`, sub: 'P2P Bybit' },
              ].map(pair => (
                <div key={pair.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 12, padding: '10px 14px',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>{pair.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{pair.sub}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                    {pair.value}
                  </div>
                </div>
              ))}
            </div>

            {r.p2pSpreadPct && (
              <div style={{
                background: 'rgba(31,209,193,0.08)',
                border: '1px solid rgba(31,209,193,0.2)',
                borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                fontSize: 12.5, color: '#1fd1c1',
              }}>
                💡 Спред Bybit P2P: <strong>{r.p2pSpreadPct.toFixed(1)}%</strong>. Выгоднее менять рубли через USDT.
              </div>
            )}

            <button
              onClick={() => router.push('/tools/converter' as any)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px',
                color: '#ff6b4a', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              Открыть калькулятор валют →
            </button>
          </div>

          {/* Weather & Cyclone Bento Card */}
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🌦️</span>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0 }}>Погода & Радар</h3>
              </div>
              <span style={{ fontSize: 12, color: '#ff6b4a', background: 'rgba(255,107,74,0.12)', padding: '3px 9px', borderRadius: 999, fontWeight: 700 }}>
                GDACS трекер
              </span>
            </div>

            {/* City Tabs */}
            <div
              className="no-scrollbar"
              style={{
                display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
              }}
            >
              {CITY_OPTIONS.map(c => {
                const active = selectedCity === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCity(c.id)}
                    style={{
                      background: active ? 'rgba(31,209,193,0.2)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      color: active ? '#1fd1c1' : '#94a3b8',
                      padding: '5px 12px', borderRadius: 999,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {c.emoji} {c.name}
                  </button>
                );
              })}
            </div>

            {w ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {Math.round(w.temp)}°
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Ощущается как <strong style={{ color: '#ff9a3c' }}>{Math.round(w.feelsLike)}°</strong> · {w.condition}
                    </div>
                  </div>
                  <div style={{ fontSize: 50 }}>{w.emoji}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Ветер</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{Math.round(w.windSpeed)} км/ч</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Влажность</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{w.humidity}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Волны</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1fd1c1' }}>{w.waveHeight ?? 0.3} м</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>AQI</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: w.airQuality?.color ?? '#10b981' }}>
                      {w.airQuality?.aqi ?? 32}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#34d399',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                  Циклонов в акватории нет · Купание комфортно
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                Загрузка метеоданных Open-Meteo…
              </div>
            )}

            <button
              onClick={() => router.push('/tools/weather' as any)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px',
                color: '#1fd1c1', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              Смотреть радар тайфунов и прогноз на 7 дней →
            </button>
          </div>
        </section>

        {/* ═══ TOOLS SECTION ═══ */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12.5, color: '#1fd1c1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Прикладные сервисы
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#fff', margin: 0 }}>
                Все 9 инструментов
              </h2>
            </div>
            <button
              onClick={() => router.push('/tools' as any)}
              style={{
                background: 'transparent', border: 'none', color: '#ff6b4a',
                fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Все инструменты →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
            {TOOLS.map((tool, idx) => (
              <div
                key={tool.href}
                className="epats-card"
                onClick={() => router.push(tool.href as any)}
                style={{
                  borderRadius: 20,
                  background: 'rgba(22, 17, 36, 0.75)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: 22,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
              >
                {tool.badge && (
                  <span style={{
                    position: 'absolute', top: 18, right: 18,
                    fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                    background: tool.badgeColor + '20', color: tool.badgeColor,
                    border: '1px solid ' + tool.badgeColor + '40',
                  }}>
                    {tool.badge}
                  </span>
                )}
                <div className="icon-spring" style={{ fontSize: 36, marginBottom: 12 }}>{tool.icon}</div>
                <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
                  {tool.desc}
                </p>
                <span style={{ fontSize: 13, color: '#ff6b4a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Открыть →
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FEATURED ARTICLES ═══ */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12.5, color: '#ff9a3c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                База знаний
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#fff', margin: 0 }}>
                Главные гайды для жизни
              </h2>
            </div>
            <button
              onClick={() => router.push('/articles' as any)}
              style={{
                background: 'transparent', border: 'none', color: '#ff6b4a',
                fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Все статьи ({ARTICLES.length}) →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {featured.map(a => (
              <div
                key={a.slug}
                onClick={() => router.push(`/article/${a.slug}` as any)}
                style={{
                  borderRadius: 22,
                  background: 'rgba(22, 17, 36, 0.75)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: 24,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{a.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1fd1c1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {a.category}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
                    ⏱ {a.readTime} мин
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.35 }}>
                  {a.title}
                </h3>

                <p style={{
                  fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px', flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {a.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: 13, color: '#ff6b4a', fontWeight: 800 }}>
                    Читать →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CATEGORIES SECTION ═══ */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Куда дальше?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {CATEGORIES.map(cat => {
              const count = ARTICLES.filter(a => a.categorySlug === cat.slug).length;
              return (
                <div
                  key={cat.slug}
                  onClick={() => router.push('/articles' as any)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 26 }}>{cat.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{count} {count === 1 ? 'статья' : 'статей'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 32,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          color: '#64748b', fontSize: 13,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={24} />
            <strong style={{ color: '#fff' }}>epats.io</strong> · Журнал и сервисы для русскоязычных экспатов во Вьетнаме
          </div>
          <div>
            © 2026 epats.io · Сделано у моря
          </div>
        </footer>

      </main>
    </div>
  );
}
