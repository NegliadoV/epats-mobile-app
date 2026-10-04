'use client';
import React from 'react';
import { router } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';

const CHATS = [
  {
    city: 'Нячанг', emoji: '🌊', color: '#1fd1c1',
    groups: [
      { name: 'Нячанг | Экспаты RU', type: 'Взаимопомощь', members: '12k+', link: 'https://t.me/nhatrang_expats_ru', verified: true },
      { name: 'Нячанг Аренда жилья RU', type: 'Аренда', members: '8k+', link: 'https://t.me/nhatrang_rent_ru', verified: true },
      { name: 'Нячанг Обмен VND/RUB', type: 'Обмен валют', members: '5k+', link: 'https://t.me/nhatrang_vnd_rub', verified: true },
      { name: 'Байки Нячанг без залога', type: 'Транспорт', members: '3k+', link: 'https://t.me/nhatrang_bikes', verified: false },
    ],
  },
  {
    city: 'Дананг', emoji: '🏖️', color: '#3b82f6',
    groups: [
      { name: 'Дананг Экспаты RU', type: 'Взаимопомощь', members: '9k+', link: 'https://t.me/danang_expats_ru', verified: true },
      { name: 'Дананг Аренда жилья', type: 'Аренда', members: '6k+', link: 'https://t.me/danang_rent_ru', verified: true },
      { name: 'Дананг IT & Digital Nomads', type: 'Работа/IT', members: '4k+', link: 'https://t.me/danang_it_ru', verified: false },
      { name: 'Дананг VND/RUB обмен', type: 'Обмен валют', members: '3k+', link: 'https://t.me/danang_exchange', verified: true },
    ],
  },
  {
    city: 'Хошимин', emoji: '🌆', color: '#f59e0b',
    groups: [
      { name: 'Сайгон Русские', type: 'Взаимопомощь', members: '15k+', link: 'https://t.me/saigon_ru', verified: true },
      { name: 'Сайгон Аренда RU', type: 'Аренда', members: '10k+', link: 'https://t.me/hcm_rent_ru', verified: true },
      { name: 'HCM Бизнес RU', type: 'Бизнес', members: '5k+', link: 'https://t.me/hcm_business_ru', verified: false },
    ],
  },
  {
    city: 'Все города (Общевьетнамские)', emoji: '🇻🇳', color: '#8b5cf6',
    groups: [
      { name: 'Вьетнам Россия | Визаран', type: 'Визы', members: '20k+', link: 'https://t.me/vietnam_vizarun', verified: true },
      { name: 'Вьетнам для россиян 2026', type: 'Общение', members: '30k+', link: 'https://t.me/vietnam_ru_2026', verified: true },
      { name: 'Русские во Вьетнаме | Медицина', type: 'Медицина', members: '8k+', link: 'https://t.me/vietnam_medicine_ru', verified: true },
      { name: 'VND/RUB/USDT Вьетнам P2P', type: 'Криптообмен', members: '12k+', link: 'https://t.me/vietnam_p2p_ru', verified: true },
      { name: 'Вьетнам Аренда байков RU', type: 'Транспорт', members: '6k+', link: 'https://t.me/vietnam_bikes_ru', verified: false },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  'Взаимопомощь': '#1fd1c1', 'Аренда': '#3b82f6', 'Обмен валют': '#f59e0b',
  'Транспорт': '#8b5cf6', 'Работа/IT': '#6366f1', 'Визы': '#a855f7',
  'Общение': '#1fd1c1', 'Медицина': '#ef4444', 'Криптообмен': '#f59e0b',
  'Бизнес': '#f97316',
};

export default function TelegramWebScreen() {
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
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '8px 16px', color: '#f8fafc',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <BrandLogo size={20} />
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.io</span> → <span style={{ color: '#1fd1c1' }}>Чаты экспатов</span>
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
            💬 Проверенные Telegram-сообщества Вьетнама · 2026
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Telegram-чаты экспатов во Вьетнаме
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Проверенные чаты и каналы — жильё без комиссий, визаран, медицина, обмен валют и комьюнити.
          </p>
        </div>

        {/* Telegram WebApp Mini App Showcase */}
        <div style={{
          padding: '28px', borderRadius: 20, marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(31,209,193,0.14) 0%, rgba(59,130,246,0.14) 100%)',
          border: '1.5px solid rgba(31,209,193,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ maxWidth: 600 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(31,209,193,0.2)', border: '1px solid #1fd1c1',
                color: '#1fd1c1', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8,
              }}>
                ⚡ Telegram WebApp (TWA)
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                🤖 epats.io работает прямо внутри Telegram!
              </h2>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                Запустите официального бота <strong>@epatsiobot</strong>: в чате доступна постоянная кнопка «🌴 Открыть epats.io». Калькулятор бюджета, Bybit P2P конвертер и радар погоды открываются прямо в Telegram в 1 клик!
              </p>
            </div>
            <a
              href="https://t.me/epatsiobot" target="_blank" rel="noopener noreferrer"
              style={{
                padding: '12px 22px', borderRadius: 12,
                background: '#1fd1c1', color: '#04201d',
                fontWeight: 900, fontSize: 14, textDecoration: 'none', textAlign: 'center',
                boxShadow: '0 4px 18px rgba(31,209,193,0.4)',
              }}
            >
              🚀 Запустить WebApp @epatsiobot
            </a>
          </div>
        </div>

        {/* Warning Callout */}
        <div style={{
          marginBottom: 28, padding: '14px 20px', borderRadius: 14,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          fontSize: 13, color: '#fbbf24', lineHeight: 1.6,
        }}>
          ⚠️ Всегда проверяйте репутацию обменников через отзывы в чатах, прежде чем переводить деньги. В проверенных чатах пользуйтесь услугами администраторов-гарантов.
        </div>

        {/* Cities Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {CHATS.map(section => (
            <div key={section.city}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>{section.emoji}</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{section.city}</h2>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {section.groups.map(group => (
                  <a
                    key={group.name}
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '18px 20px', borderRadius: 16,
                      background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
                      display: 'flex', flexDirection: 'column', gap: 10,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                        {group.name}
                      </span>
                      {group.verified && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(31,209,193,0.15)', color: '#1fd1c1', border: '1px solid rgba(31,209,193,0.3)', flexShrink: 0 }}>
                          ✓ Проверен
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        background: (TYPE_COLORS[group.type] || '#1fd1c1') + '18',
                        color: TYPE_COLORS[group.type] || '#1fd1c1',
                      }}>
                        {group.type}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        👥 {group.members}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
