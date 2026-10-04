'use client';
import React from 'react';
import { router } from 'expo-router';

const TOOLS = [
  {
    href: '/tools/calculator',
    icon: '🧮',
    title: 'Калькулятор стоимости жизни',
    desc: 'Узнай сколько нужно денег в месяц — для своего города, стиля жизни и состава семьи. VND, RUB и USD с учетом вилки цен.',
    badge: 'Популярное',
    badgeColor: '#1fd1c1',
    color: '#1fd1c1',
  },
  {
    href: '/tools/visa',
    icon: '🚌',
    title: 'Визаран и визовый калькулятор',
    desc: 'Все в одном: расчет дедлайна визы, дата подачи на e-visa, расчет бюджета поездки (USD/VND/RUB), чеклист документов и маршруты Лао Бао, Мокбай, Каучео.',
    badge: 'Все в одном',
    badgeColor: '#1fd1c1',
    color: '#1fd1c1',
  },
  {
    href: '/tools/electricity',
    icon: '⚡',
    title: 'Калькулятор счёта за электричество (EVN)',
    desc: 'Сравнение честного государственного тарифа EVN (6 прогрессивных ступеней + 8% НДС) со счетом от лендлорда. Расчет переплаты и готовое вежливое сообщение для хозяина.',
    badge: 'Новинка',
    badgeColor: '#f59e0b',
    color: '#f59e0b',
  },
  {
    href: '/tools/neighborhoods',
    icon: '🏡',
    title: 'Гид по районам и аренде жилья',
    desc: 'Где жить экспату в Дананге, Нячанге, Сайгоне, Ханое и на Фукуоке. Интерактивная карта, генераторы, оптоволокно и цены на аренду.',
    badge: 'Карта',
    badgeColor: '#6366f1',
    color: '#6366f1',
  },
  {
    href: '/tools/weather',
    icon: '🌦️',
    title: 'Погода, AQI и Радар тайфунов',
    desc: 'Живая температура, уровень смога PM2.5, морские волны и интерактивный спутниковый трекер тайфунов в Biển Đông.',
    badge: 'Live Radar',
    badgeColor: '#1fd1c1',
    color: '#1fd1c1',
  },
  {
    href: '/tools/converter',
    icon: '💱',
    title: 'Конвертер VND / RUB / USD / USDT',
    desc: 'Быстрый пересчёт вьетнамских донгов в рубли и доллары. Bybit P2P курсы и интерактивные графики валют.',
    badge: null,
    badgeColor: '',
    color: '#3b82f6',
  },
  {
    href: '/tools/checklist',
    icon: '📋',
    title: 'Чеклист переезда',
    desc: 'Пошаговый гайд: до вылета, в аэропорту, первые 3 дня, первый месяц. Прогресс сохраняется в браузере.',
    badge: null,
    badgeColor: '',
    color: '#8b5cf6',
  },
  {
    href: '/tools/cities',
    icon: '🏙️',
    title: 'Сравнение городов',
    desc: 'Дананг, Нячанг, Хошимин, Ханой, Фукуок — честное сравнение с плюсами, минусами и бюджетами.',
    badge: null,
    badgeColor: '',
    color: '#f59e0b',
  },
  {
    href: '/tools/telegram',
    icon: '💬',
    title: 'Telegram-чаты экспатов',
    desc: 'Проверенные чаты взаимопомощи, аренды, обменников и медицины для каждого города. Обновлено 2026.',
    badge: null,
    badgeColor: '',
    color: '#6366f1',
  },
];

export default function ToolsWebScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0714',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 110,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 14,
            fontSize: 12, color: '#1fd1c1', fontWeight: 700,
          }}>
            🛠️ Практические инструменты для жизни во Вьетнаме
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 14px', color: '#fff', lineHeight: 1.15 }}>
            Всё что нужно <span style={{ background: 'linear-gradient(135deg, #1fd1c1, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>экспату во Вьетнаме</span>
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Калькуляторы, радары, трекеры и гиды по районам — готовые прикладные инструменты, проверенные сотнями экспатов.
          </p>
        </div>

        {/* Tools Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
          {TOOLS.map(tool => (
            <div
              key={tool.href}
              onClick={() => router.push(tool.href as any)}
              style={{
                borderRadius: 24,
                background: 'rgba(25, 16, 38, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '28px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {tool.badge && (
                <span style={{
                  position: 'absolute', top: 18, right: 18,
                  fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                  background: tool.badgeColor + '18', color: tool.badgeColor,
                  border: '1px solid ' + tool.badgeColor + '40',
                }}>
                  {tool.badge}
                </span>
              )}
              <div style={{ fontSize: 44, marginBottom: 14 }}>{tool.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>
                {tool.title}
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: '0 0 20px', flex: 1 }}>
                {tool.desc}
              </p>
              <span style={{ fontSize: 13, color: tool.color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                Открыть инструмент →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
