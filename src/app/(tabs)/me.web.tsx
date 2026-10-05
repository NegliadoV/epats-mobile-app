'use client';
import React, { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { ARTICLES, getArticleBySlug } from '@shared/data/articles';
import BrandLogo from '@/components/BrandLogo';
import { useAuth, CityId, VisaTypeId, CurrencyId, LifestyleId, FamilyId } from '@/lib/auth';

const CITIES: { id: CityId; name: string; emoji: string }[] = [
  { id: 'danang', name: 'Дананг', emoji: '🏖️' },
  { id: 'nhatrang', name: 'Нячанг', emoji: '🌊' },
  { id: 'hcm', name: 'Хошимин', emoji: '🌆' },
  { id: 'hanoi', name: 'Ханой', emoji: '🏛️' },
  { id: 'phuquoc', name: 'Фукуок', emoji: '🏝️' },
];

const VISAS: { id: VisaTypeId; name: string; days: number }[] = [
  { id: '45', name: '45 дней (Безвиз)', days: 45 },
  { id: 'evisa90_single', name: 'E-Visa 90 дн. (1-кратная)', days: 90 },
  { id: 'evisa90_multi', name: 'E-Visa 90 дн. (Multi)', days: 90 },
  { id: 'phuquoc30', name: 'Фукуок 30 дней', days: 30 },
];

const CURRENCIES: { id: CurrencyId; label: string; symbol: string }[] = [
  { id: 'RUB', label: 'Рубли (₽)', symbol: '₽' },
  { id: 'USD', label: 'Доллары ($)', symbol: '$' },
  { id: 'USDT', label: 'USDT (₮)', symbol: '₮' },
];

const LIFESTYLES: { id: LifestyleId; label: string }[] = [
  { id: 'budget', label: '🎒 Эконом' },
  { id: 'comfort', label: '🛋️ Комфорт' },
  { id: 'premium', label: '💎 Премиум' },
];

const FAMILIES: { id: FamilyId; label: string }[] = [
  { id: 'solo', label: '👤 Один' },
  { id: 'couple', label: '👫 Пара' },
  { id: 'family', label: '👨‍👩‍👧 Семья' },
  { id: 'big_family', label: '👨‍👩‍👧‍👦 Большая семья' },
];

export default function MeWebScreen() {
  const { user, settings, saveSettings, loginState, login, cancelLogin, logout, favorites, toggleFavorite } = useAuth();
  const [entryInput, setEntryInput] = useState(settings.entry_date || '');
  const [savedToast, setSavedToast] = useState(false);

  // Sync entryInput if settings.entry_date changes externally
  React.useEffect(() => {
    if (settings.entry_date) setEntryInput(settings.entry_date);
  }, [settings.entry_date]);

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleSaveEntryDate = () => {
    const val = entryInput.trim();
    if (!val || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      saveSettings({ entry_date: val || null });
      showSaved();
    } else {
      alert('Используйте формат ГГГГ-ММ-ДД (например: 2026-03-15)');
    }
  };

  const setTodayEntry = () => {
    const iso = new Date().toISOString().slice(0, 10);
    setEntryInput(iso);
    saveSettings({ entry_date: iso });
    showSaved();
  };

  // Visa calculation
  const visaStatus = useMemo(() => {
    if (!settings.entry_date) return null;
    const entry = new Date(settings.entry_date);
    if (isNaN(entry.getTime())) return null;

    const opt = VISAS.find(v => v.id === settings.visa_type) || VISAS[1];
    const deadline = new Date(entry);
    deadline.setDate(deadline.getDate() + opt.days - 1);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progressRatio = Math.max(0, Math.min(1, daysLeft / opt.days));
    const strokeDashoffset = 289 * (1 - progressRatio);

    return {
      entry,
      deadline,
      daysLeft,
      opt,
      progressRatio,
      strokeDashoffset,
      deadlineStr: deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [settings.entry_date, settings.visa_type]);

  const favArticles = favorites.map(s => getArticleBySlug(s)).filter((a): a is NonNullable<typeof a> => !!a);

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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '700px',
        background: 'radial-gradient(ellipse at top, rgba(31, 209, 193, 0.12), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating Save Toast */}
      {savedToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          backgroundColor: '#1fd1c1',
          color: '#080711',
          padding: '10px 18px',
          borderRadius: '999px',
          fontWeight: 800,
          fontSize: '13px',
          boxShadow: '0 8px 24px rgba(31, 209, 193, 0.4)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInUp 0.3s ease',
        }}>
          ✓ Сохранено в БД
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px', maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandLogo size={32} />
            <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              epats<span style={{ color: '#ff6b4a' }}>.io</span>
            </span>
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: user ? '#1fd1c1' : '#94a3b8',
            backgroundColor: user ? 'rgba(31, 209, 193, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${user ? 'rgba(31, 209, 193, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            padding: '5px 12px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>{user ? '●' : '○'}</span>
            <span>{user ? 'БД синхронизирована' : 'Локальное хранилище'}</span>
          </div>
        </div>

        {/* 1. Profile / Telegram Authorization Card */}
        {user ? (
          <div style={{
            backgroundColor: 'rgba(18, 16, 38, 0.75)',
            border: '1px solid rgba(31, 209, 193, 0.35)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '20px',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(31, 209, 193, 0.15)',
                border: '2px solid #1fd1c1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                color: '#1fd1c1',
              }}>
                {user.first_name.slice(0, 1)}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                  {user.first_name} {user.last_name || ''}
                </div>
                {user.username && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    @{user.username}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#1fd1c1', fontWeight: 700, marginTop: '4px' }}>
                  ✓ Настройки привязаны к профилю
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Выйти
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(18, 16, 38, 0.75)',
            border: '1px solid rgba(42, 171, 238, 0.35)',
            borderRadius: '24px',
            padding: '24px 20px',
            marginBottom: '20px',
            backdropFilter: 'blur(16px)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>🌴</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Синхронизация профиля
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
              Войдите через Telegram — город, виза, даты и избранное синхронизируются с сервером и базой данных epats.io.
            </div>

            {loginState === 'waiting' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#2aabee' }}>
                  ⏳ Подтвердите вход в Telegram
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Нажмите кнопку «Войти» или команду /start в диалоге с @epatsiobot
                </div>
                <button
                  onClick={cancelLogin}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginTop: '6px',
                  }}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={login}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2aabee 0%, #229ed9 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 20px rgba(42, 171, 238, 0.35)',
                  }}
                >
                  <span>✈️</span> Войти через Telegram
                </button>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
                  Без паролей. Номер телефона остаётся скрытым.
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. VISA STATUS & TRACKER CARD */}
        <div style={{
          backgroundColor: 'rgba(18, 16, 38, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '22px',
          marginBottom: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🛂</span>
              <span style={{ fontSize: '16px', fontWeight: 800 }}>Моя виза и даты</span>
            </div>
            <button
              onClick={() => router.push('/tools/visa')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#1fd1c1',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Калькулятор →
            </button>
          </div>

          {visaStatus ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '18px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Осталось во Вьетнаме
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: visaStatus.daysLeft > 14 ? '#10b981' : visaStatus.daysLeft > 5 ? '#f59e0b' : '#ef4444',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {visaStatus.daysLeft > 0 ? `${visaStatus.daysLeft} дней` : 'Срок истёк!'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  до {visaStatus.deadlineStr}
                </div>
              </div>

              {/* Circular Gauge */}
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke={visaStatus.daysLeft > 14 ? '#10b981' : visaStatus.daysLeft > 5 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray="289"
                    strokeDashoffset={visaStatus.strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: '#f8fafc',
                }}>
                  {Math.round(visaStatus.progressRatio * 100)}%
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(255, 107, 74, 0.1)',
              border: '1px solid rgba(255, 107, 74, 0.3)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#f8fafc',
              lineHeight: 1.5,
            }}>
              Укажите дату въезда во Вьетнам ниже, чтобы активировать персональный таймер визы и напоминания о визаране!
            </div>
          )}

          {/* Visa Type Selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Тип визы
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VISAS.map(v => {
                const active = settings.visa_type === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { saveSettings({ visa_type: v.id }); showSaved(); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#080711' : '#cbd5e1',
                      border: `1px solid ${active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entry Date Input */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Дата въезда (штампа)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={entryInput}
                onChange={e => setEntryInput(e.target.value)}
                onBlur={handleSaveEntryDate}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={setTodayEntry}
                style={{
                  padding: '0 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(31, 209, 193, 0.15)',
                  border: '1px solid rgba(31, 209, 193, 0.35)',
                  color: '#1fd1c1',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Сегодня
              </button>
            </div>
          </div>
        </div>

        {/* 3. LIFESTYLE & PERSONAL CRITERIA CARD */}
        <div style={{
          backgroundColor: 'rgba(18, 16, 38, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '22px',
          marginBottom: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Мои предпочтения
          </div>

          {/* City */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Основной город
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CITIES.map(c => {
                const active = settings.city === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { saveSettings({ city: c.id }); showSaved(); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#080711' : '#cbd5e1',
                      border: `1px solid ${active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {c.emoji} {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Валюта расходов
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CURRENCIES.map(cr => {
                const active = settings.currency === cr.id;
                return (
                  <button
                    key={cr.id}
                    onClick={() => { saveSettings({ currency: cr.id }); showSaved(); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#080711' : '#cbd5e1',
                      border: `1px solid ${active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {cr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lifestyle */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Стиль жизни
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LIFESTYLES.map(lf => {
                const active = settings.lifestyle === lf.id;
                return (
                  <button
                    key={lf.id}
                    onClick={() => { saveSettings({ lifestyle: lf.id }); showSaved(); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#080711' : '#cbd5e1',
                      border: `1px solid ${active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {lf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Состав семьи
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FAMILIES.map(fm => {
                const active = settings.family === fm.id;
                return (
                  <button
                    key={fm.id}
                    onClick={() => { saveSettings({ family: fm.id }); showSaved(); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#080711' : '#cbd5e1',
                      border: `1px solid ${active ? '#1fd1c1' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {fm.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. NOTIFICATIONS */}
        <div style={{
          backgroundColor: 'rgba(18, 16, 38, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '22px',
          marginBottom: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔔</span> Уведомления и алерты
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Напоминания о визе</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>За 10, 5 и 3 дня до дедлайна визарана</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notify_visa}
              onChange={e => { saveSettings({ notify_visa: e.target.checked }); showSaved(); }}
              style={{ width: '20px', height: '20px', accentColor: '#1fd1c1', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Тайфуны и штормовые алерты</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Экстренные предупреждения по вашему городу</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notify_alerts}
              onChange={e => { saveSettings({ notify_alerts: e.target.checked }); showSaved(); }}
              style={{ width: '20px', height: '20px', accentColor: '#1fd1c1', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 5. FAVORITES */}
        <div style={{
          backgroundColor: 'rgba(18, 16, 38, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '22px',
          marginBottom: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⭐</span> Избранные статьи ({favArticles.length})
            </div>
            <button
              onClick={() => router.push('/articles')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ff6b4a',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Все статьи →
            </button>
          </div>

          {favArticles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {favArticles.map(a => (
                <div
                  key={a.slug}
                  onClick={() => router.push(`/article/${a.slug}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{a.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{a.title}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(a.slug);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
              У вас пока нет сохранённых статей. Нажмите ★ на любой статье в разделе «Статьи».
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
