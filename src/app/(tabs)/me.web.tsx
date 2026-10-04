'use client';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ARTICLES, getArticleBySlug } from '@shared/data/articles';
import BrandLogo from '@/components/BrandLogo';

const CITY_OPTIONS = [
  { id: 'danang', name: 'Дананг', emoji: '🏖️' },
  { id: 'nhatrang', name: 'Нячанг', emoji: '🌊' },
  { id: 'hcm', name: 'Хошимин', emoji: '🌆' },
  { id: 'hanoi', name: 'Ханой', emoji: '🏛️' },
  { id: 'phuquoc', name: 'Фукуок', emoji: '🏝️' },
];

const VISA_OPTIONS = [
  { id: 'free45', name: '45 дней (безвиз РФ)', days: 45 },
  { id: 'evisa90', name: '90 дней (E-visa)', days: 90 },
];

const CURRENCY_OPTIONS = [
  { id: 'RUB', name: 'Рубли (₽)', symbol: '₽' },
  { id: 'USD', name: 'Доллары ($)', symbol: '$' },
  { id: 'VND', name: 'Донги (₫)', symbol: '₫' },
  { id: 'USDT', name: 'USDT (₮)', symbol: '₮' },
];

function getTodayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days - 1);
  return d.toISOString().split('T')[0];
}

function daysDiff(targetStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MeWebScreen() {
  const [city, setCity] = useState('danang');
  const [visaType, setVisaType] = useState('free45');
  const [entryDate, setEntryDate] = useState('2026-09-25');
  const [departureDate, setDepartureDate] = useState('2026-11-05');
  const [currency, setCurrency] = useState('RUB');
  const [budgetUsd, setBudgetUsd] = useState('1200');

  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyTyphoons, setNotifyTyphoons] = useState(true);
  const [notifyVisa, setNotifyVisa] = useState(true);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('epats_user_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.city) setCity(parsed.city);
          if (parsed.visaType) setVisaType(parsed.visaType);
          if (parsed.entryDate) setEntryDate(parsed.entryDate);
          if (parsed.departureDate) setDepartureDate(parsed.departureDate);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.budgetUsd) setBudgetUsd(parsed.budgetUsd);
          if (parsed.notifyDaily !== undefined) setNotifyDaily(parsed.notifyDaily);
          if (parsed.notifyTyphoons !== undefined) setNotifyTyphoons(parsed.notifyTyphoons);
          if (parsed.notifyVisa !== undefined) setNotifyVisa(parsed.notifyVisa);
        }
        const favs = JSON.parse(localStorage.getItem('epats_fav_articles') || '[]');
        setFavorites(favs);
      } catch {}
    }
  }, []);

  const saveToLocalStorage = (patch: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('epats_user_settings') || '{}');
        const updated = { ...existing, ...patch };
        localStorage.setItem('epats_user_settings', JSON.stringify(updated));
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 1500);
      } catch {}
    }
  };

  // Visa calculation
  const totalVisaDays = visaType === 'free45' ? 45 : 90;
  const deadlineDate = addDays(entryDate, totalVisaDays);
  const daysRemaining = daysDiff(deadlineDate);
  const progressRatio = Math.max(0, Math.min(1, daysRemaining / totalVisaDays));
  const strokeDashoffset = 289 * (1 - progressRatio);

  const deadlineColor = daysRemaining > 14 ? '#10b981' : daysRemaining > 5 ? '#f59e0b' : '#ef4444';

  const favArticles = favorites.map(s => getArticleBySlug(s)).filter(Boolean);

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
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(255,107,74,0.12) 0%, rgba(147,51,234,0.06) 50%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Save Notification Toast */}
      {savedToast && (
        <div style={{
          position: 'fixed', bottom: 30, right: 30, zIndex: 100,
          background: 'rgba(16, 185, 129, 0.9)', backdropFilter: 'blur(10px)',
          color: '#fff', padding: '10px 20px', borderRadius: 999,
          fontWeight: 800, fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        }}>
          ✓ Настройки сохранены
        </div>
      )}

      {/* Top Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 7, 17, 0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div
            onClick={() => router.push('/' as any)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <BrandLogo size={34} />
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px' }}>
              epats<span style={{ color: '#ff6b4a' }}>.io</span>
            </span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => router.push('/' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc', padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ← Главная
            </button>
            <button
              onClick={() => router.push('/tools' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc', padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🛠️ Инструменты
            </button>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 20px', position: 'relative', zIndex: 1 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, color: '#64748b' }}>
          <div onClick={() => router.push('/' as any)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#fff', fontWeight: 800 }}>
            <BrandLogo size={18} />
            <span>epats.io</span>
          </div>
          <span>→</span>
          <span style={{ color: '#ff6b4a', fontWeight: 700 }}>Личный кабинет</span>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,107,74,0.12)', border: '1px solid rgba(255,107,74,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 16,
            fontSize: 12.5, color: '#ff8a65', fontWeight: 800,
          }}>
            🌴 Мой Вьетнам · Персональный профиль
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 14px', color: '#fff', lineHeight: 1.15 }}>
            Твой <span style={{ background: 'linear-gradient(135deg, #ff6b4a, #ff9a3c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>личный Вьетнам</span>
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 620, margin: '0 auto', lineHeight: 1.65 }}>
            Укажи дату въезда, тип визы и город — epats.io рассчитает точные дедлайны и настроит все сервисы под тебя.
          </p>
        </div>

        {/* ═══ TOP DASHBOARD BENTO: VISA RING & DEPARTURE COUNTDOWN ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>

          {/* Visa Ring Card */}
          <div className="epats-card" style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 26,
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', gap: 24,
          }}>
            {/* SVG Ring Counter */}
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                <circle
                  cx="55" cy="55" r="46" fill="none" stroke={deadlineColor} strokeWidth="9"
                  strokeDasharray="289" strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{daysRemaining}</span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>дней</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: deadlineColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {daysRemaining > 14 ? '✓ Виза активна' : daysRemaining > 5 ? '⚠️ Пора подавать e-visa' : '🚨 Срочно на визаран'}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                До {new Date(deadlineDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>
                Въезд {new Date(entryDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {totalVisaDays} дней
              </p>
              <button
                className="epats-btn"
                onClick={() => router.push('/tools/visa' as any)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '6px 12px', color: '#ff6b4a', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Маршруты визарана →
              </button>
            </div>
          </div>

          {/* Departure Card */}
          <div className="epats-card" style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 26,
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>✈️</span>
                <span style={{ fontSize: 12, color: '#1fd1c1', background: 'rgba(31,209,193,0.12)', padding: '3px 9px', borderRadius: 999, fontWeight: 800 }}>
                  Обратный отсчёт
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                Вылет / Визаран: {new Date(departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Осталось <strong>{Math.max(0, daysDiff(departureDate))}</strong> дней. За 7 дней и накануне бот пришлёт напоминание со списком документов.
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => router.push('/tools/checklist' as any)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '8px 14px', color: '#1fd1c1', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Открыть чеклист выезда →
              </button>
            </div>
          </div>

        </div>

        {/* ═══ INTERACTIVE SETTINGS FORM ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>

          {/* Visa Settings */}
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24, padding: 24,
          }}>
            <h3 style={{ fontSize: 16.5, fontWeight: 900, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🚌</span> Настройки визы
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Тип визы:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {VISA_OPTIONS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setVisaType(v.id); saveToLocalStorage({ visaType: v.id }); }}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 12, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                      background: visaType === v.id ? 'rgba(31,209,193,0.2)' : 'rgba(255,255,255,0.04)',
                      border: visaType === v.id ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: visaType === v.id ? '#1fd1c1' : '#94a3b8',
                    }}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Дата въезда в паспорт:</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => { setEntryDate(e.target.value); saveToLocalStorage({ entryDate: e.target.value }); }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Дата следующего вылета:</label>
              <input
                type="date"
                value={departureDate}
                onChange={e => { setDepartureDate(e.target.value); saveToLocalStorage({ departureDate: e.target.value }); }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* City & Currency Settings */}
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24, padding: 24,
          }}>
            <h3 style={{ fontSize: 16.5, fontWeight: 900, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏡</span> Город и валюта по умолчанию
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Твой город:</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CITY_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCity(c.id); saveToLocalStorage({ city: c.id }); }}
                    style={{
                      padding: '7px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                      background: city === c.id ? 'rgba(255,107,74,0.2)' : 'rgba(255,255,255,0.04)',
                      border: city === c.id ? '1px solid rgba(255,107,74,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: city === c.id ? '#ff8a65' : '#94a3b8',
                    }}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Основная валюта:</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CURRENCY_OPTIONS.map(cur => (
                  <button
                    key={cur.id}
                    onClick={() => { setCurrency(cur.id); saveToLocalStorage({ currency: cur.id }); }}
                    style={{
                      padding: '7px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                      background: currency === cur.id ? 'rgba(31,209,193,0.2)' : 'rgba(255,255,255,0.04)',
                      border: currency === cur.id ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: currency === cur.id ? '#1fd1c1' : '#94a3b8',
                    }}
                  >
                    {cur.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>Бюджет в месяц ($ USD):</label>
              <input
                type="number"
                value={budgetUsd}
                onChange={e => { setBudgetUsd(e.target.value); saveToLocalStorage({ budgetUsd: e.target.value }); }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          </div>

        </div>

        {/* ═══ TELEGRAM REMINDERS & FAVORITES ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>

          {/* Telegram Bot Reminders */}
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24, padding: 24,
          }}>
            <h3 style={{ fontSize: 16.5, fontWeight: 900, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💬</span> Уведомления бота (@epatsiobot)
            </h3>

            <div style={{ display: 'grid', gap: 14 }}>
              {[
                {
                  title: 'Утренняя сводка в 8:00',
                  desc: 'Погода, море, волны, курс донга и оставшиеся дни визы',
                  state: notifyDaily,
                  toggle: () => { setNotifyDaily(!notifyDaily); saveToLocalStorage({ notifyDaily: !notifyDaily }); },
                },
                {
                  title: 'Тайфуны и смог (GDACS & AQI)',
                  desc: 'Оповещение если циклон ближе 600 км или воздух хуже AQI 150',
                  state: notifyTyphoons,
                  toggle: () => { setNotifyTyphoons(!notifyTyphoons); saveToLocalStorage({ notifyTyphoons: !notifyTyphoons }); },
                },
                {
                  title: 'Окончание визы',
                  desc: 'Напоминание за 14, 7, 3 дня и накануне дедлайна',
                  state: notifyVisa,
                  toggle: () => { setNotifyVisa(!notifyVisa); saveToLocalStorage({ notifyVisa: !notifyVisa }); },
                },
              ].map(t => (
                <div
                  key={t.title}
                  onClick={t.toggle}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: '12px 14px', cursor: 'pointer',
                  }}
                >
                  <div style={{ paddingRight: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{t.desc}</div>
                  </div>
                  <div style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: t.state ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', flexShrink: 0, transition: 'background 0.2s ease',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, left: t.state ? 23 : 3,
                      transition: 'left 0.2s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarked / Favorite Articles */}
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24, padding: 24,
            display: 'flex', flexDirection: 'column',
          }}>
            <h3 style={{ fontSize: 16.5, fontWeight: 900, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>★</span> Избранные гайды
            </h3>

            {favArticles.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: '#64748b' }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>☆</span>
                <p style={{ fontSize: 13, textAlign: 'center', margin: 0 }}>
                  Вы пока не сохранили ни одной статьи.<br />Нажмите «В закладки» во время чтения любого гайда.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10, flex: 1 }}>
                {favArticles.map(a => (
                  <div
                    key={a!.slug}
                    onClick={() => router.push(`/article/${a!.slug}` as any)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{a!.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', flex: 1 }}>{a!.title}</span>
                    <span style={{ color: '#ff6b4a', fontSize: 12 }}>→</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push('/articles' as any)}
              style={{
                marginTop: 16, width: '100%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '9px', color: '#cbd5e1', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Смотреть все статьи ({ARTICLES.length}) →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
