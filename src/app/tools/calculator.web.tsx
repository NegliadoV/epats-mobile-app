'use client';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { API_BASE } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';

const CITIES = [
  { id: 'danang', name: 'Дананг', flag: '🏖️', desc: 'Пляж + IT хаб', factor: 1.0 },
  { id: 'nhatrang', name: 'Нячанг', flag: '🌊', desc: 'Русское комьюнити', factor: 0.93 },
  { id: 'hcm', name: 'Хошимин', flag: '🌆', desc: 'Бизнес мегаполис', factor: 1.25 },
  { id: 'hanoi', name: 'Ханой', flag: '🏛️', desc: 'Культурная столица', factor: 1.12 },
  { id: 'phuquoc', name: 'Фукуок', flag: '🏝️', desc: 'Тропический остров', factor: 1.18 },
] as const;

type CityId = typeof CITIES[number]['id'];

const LIFESTYLES = [
  {
    id: 'budget',
    name: 'Эконом',
    icon: '🎒',
    desc: 'Базовый',
    details: 'Студия / простая квартира, готовка дома, рынки, б/у байк, без излишеств',
    factor: 0.72,
  },
  {
    id: 'comfort',
    name: 'Комфорт',
    icon: '🛋️',
    desc: 'Оптимум',
    details: 'Кондоминиум с бассейном и охраной, кафе и доставка, хороший байк, спортзал, страховка',
    factor: 1.0,
  },
  {
    id: 'premium',
    name: 'Шикарно',
    icon: '💎',
    desc: 'Премиум',
    details: 'Вилла или видовой пентхаус, рестораны каждый день, такси Grab Car, приватные секции, спа',
    factor: 1.65,
  },
] as const;

type LifeId = typeof LIFESTYLES[number]['id'];

const FAMILY_OPTIONS = [
  {
    id: 'solo',
    name: 'Один',
    icon: '👤',
    sub: '1 взрослый',
    mults: { rent: 1.0, food: 1.0, transport: 1.0, visa: 1.0, insurance: 1.0, fun: 1.0 },
  },
  {
    id: 'couple',
    name: 'Пара',
    icon: '👫',
    sub: '2 взрослых',
    mults: { rent: 1.15, food: 1.7, transport: 1.4, visa: 2.0, insurance: 2.0, fun: 1.6 },
  },
  {
    id: 'family',
    name: 'Семья с ребёнком',
    icon: '👨‍👩‍👧',
    sub: '2 взр. + 1 ребёнок',
    mults: { rent: 1.35, food: 2.1, transport: 1.6, visa: 2.8, insurance: 2.3, fun: 2.0 },
  },
  {
    id: 'big_family',
    name: 'Большая семья',
    icon: '👨‍👩‍👧‍👦',
    sub: '2 взр. + 2+ детей',
    mults: { rent: 1.7, food: 2.8, transport: 2.0, visa: 3.8, insurance: 3.2, fun: 2.6 },
  },
] as const;

type FamId = typeof FAMILY_OPTIONS[number]['id'];

const BASE_CATEGORIES = [
  {
    key: 'rent',
    label: '🏠 Жильё и коммуналка',
    sub: 'Аренда кондоминиума, свет, вода, скоростной Wi-Fi',
    range: [8000, 13000] as [number, number],
  },
  {
    key: 'food',
    label: '🍜 Питание и продукты',
    sub: 'Супермаркеты (WinMart, Lotte), рынки, кафе 3-4 раза в неделю',
    range: [5500, 8500] as [number, number],
  },
  {
    key: 'transport',
    label: '🛵 Транспорт и бензин',
    sub: 'Аренда скутера, бензин, периодически Grab такси',
    range: [1800, 3200] as [number, number],
  },
  {
    key: 'visa',
    label: '📄 Визы и визаран',
    sub: 'Туристическая e-visa 90 дней, регулярный выезд на границу (бордерран)',
    range: [1000, 1500] as [number, number],
  },
  {
    key: 'insurance',
    label: '🏥 Медицина и аптеки',
    sub: 'Базовая страховка, визиты к врачу, сезонные лекарства',
    range: [900, 1800] as [number, number],
  },
  {
    key: 'fun',
    label: '🏖️ Досуг, спорт и развлечения',
    sub: 'Фитнес-клуб, пляжные кафе, массажи, детские кружки, поездки на выходные',
    range: [2500, 5000] as [number, number],
  },
];

const INITIAL_EXPENSES = [
  { label: 'Депозит за аренду жилья (1 месяц)', valUsd: '350 – 700 $' },
  { label: 'Покупка или залог за байк', valUsd: '150 – 500 $' },
  { label: 'Авиабилеты и трансфер из аэропорта', valUsd: '400 – 900 $' },
  { label: 'Оформление E-Visa (на каждого)', valUsd: '25 – 50 $' },
  { label: 'Сим-карты Viettel / Vinaphone', valUsd: '10 – 15 $' },
];

export default function CalculatorWebScreen() {
  const [rates, setRates] = useState({ usdRub: 83.5, usdVnd: 25940 });
  const [city, setCity] = useState<CityId>('danang');
  const [life, setLife] = useState<LifeId>('comfort');
  const [fam, setFam] = useState<FamId>('family');
  const [cur, setCur] = useState<'usd' | 'rub' | 'vnd'>('usd');
  const [luxuryTweak, setLuxuryTweak] = useState(50);

  useEffect(() => {
    fetch(`${API_BASE}/api/rates`)
      .then(r => r.json())
      .then(d => { if (d?.usdRub) setRates({ usdRub: d.usdRub, usdVnd: d.usdVnd }); })
      .catch(() => {});
  }, []);

  const TO_USD = 1000 / rates.usdVnd;
  const TO_RUB = (1000 * rates.usdRub) / rates.usdVnd;

  const cityObj = CITIES.find(c => c.id === city)!;
  const lifeObj = LIFESTYLES.find(l => l.id === life)!;
  const famObj = FAMILY_OPTIONS.find(f => f.id === fam)!;

  const tweakMult = 0.85 + (luxuryTweak / 100) * 0.33;
  const overallFactor = cityObj.factor * lifeObj.factor * tweakMult;

  const calculatedItems = BASE_CATEGORIES.map(cat => {
    const famMult = famObj.mults[cat.key as keyof typeof famObj.mults] || 1.0;
    const minVnd = Math.round(cat.range[0] * overallFactor * famMult);
    const maxVnd = Math.round(cat.range[1] * overallFactor * famMult);
    const midVnd = Math.round((minVnd + maxVnd) / 2);
    return { ...cat, minVnd, maxVnd, midVnd };
  });

  const totalMinVnd = calculatedItems.reduce((acc, it) => acc + it.minVnd, 0);
  const totalMaxVnd = calculatedItems.reduce((acc, it) => acc + it.maxVnd, 0);
  const totalMidVnd = Math.round((totalMinVnd + totalMaxVnd) / 2);

  function formatRange(minVnd: number, maxVnd: number) {
    if (cur === 'usd') {
      return `$${Math.round(minVnd * TO_USD).toLocaleString('ru-RU')} – $${Math.round(maxVnd * TO_USD).toLocaleString('ru-RU')}`;
    }
    if (cur === 'rub') {
      return `${Math.round(minVnd * TO_RUB).toLocaleString('ru-RU')} – ${Math.round(maxVnd * TO_RUB).toLocaleString('ru-RU')} ₽`;
    }
    return `${(minVnd / 1000).toFixed(1)}M – ${(maxVnd / 1000).toFixed(1)}M ₫`;
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 10, border: '1px solid',
    borderColor: active ? '#1fd1c1' : 'rgba(255,255,255,0.1)',
    background: active ? 'rgba(31,209,193,0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#1fd1c1' : '#cbd5e1',
    fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer',
    transition: 'all 0.15s ease', display: 'inline-flex', alignItems: 'center', gap: 6,
  });

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

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
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
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.io</span> → <span style={{ color: '#1fd1c1' }}>Калькулятор бюджета</span>
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
            🧮 Реалистичные расходы на жизнь · 2026 год
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Калькулятор стоимости жизни во Вьетнаме
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
            Цены в виде вилки «от — до» с учетом состава семьи, города и уровня комфорта на основе реального опыта экспатов.
          </p>
        </div>

        {/* Main Controls Card */}
        <div style={{
          padding: 28, marginBottom: 28,
          borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          {/* 1. City */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              1. Выберите город
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CITIES.map(c => (
                <button key={c.id} onClick={() => setCity(c.id)} style={btnStyle(city === c.id)}>
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>({c.desc})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Family */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              2. Состав семьи
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FAMILY_OPTIONS.map(f => (
                <button key={f.id} onClick={() => setFam(f.id)} style={btnStyle(fam === f.id)}>
                  <span>{f.icon}</span>
                  <span>{f.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>— {f.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lifestyle */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              3. Уровень жизни и комфорта
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
              {LIFESTYLES.map(l => {
                const isSelected = life === l.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => setLife(l.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 14, border: '1.5px solid',
                      borderColor: isSelected ? '#1fd1c1' : 'rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(31,209,193,0.12)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{l.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: isSelected ? '#1fd1c1' : '#fff' }}>
                        {l.name}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                      {l.details}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Slider */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>🎛️ Точная регулировка запросов:</span>
                <span style={{ color: '#1fd1c1', fontWeight: 700 }}>
                  {luxuryTweak < 30 ? 'Сдержанные траты' : luxuryTweak > 70 ? 'Без оглядки на чек' : 'Оптимальный баланс'} ({luxuryTweak}%)
                </span>
              </div>
              <input
                type="range" min="0" max="100" value={luxuryTweak}
                onChange={e => setLuxuryTweak(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1fd1c1', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* 4. Currency Switcher */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              4. Отображать в валюте
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'usd', label: '🇺🇸 Доллары ($)' },
                { id: 'rub', label: '🇷🇺 Рубли (₽)' },
                { id: 'vnd', label: '🇻🇳 Донги (₫)' },
              ].map(c => (
                <button key={c.id} onClick={() => setCur(c.id as any)} style={btnStyle(cur === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results: Breakdown and Total */}
        <div style={{
          padding: 28, marginBottom: 28,
          borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span>📊 Детальная разбивка — {cityObj.flag} {cityObj.name}</span>
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
                {famObj.name} · Уровень «{lifeObj.name}»
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(31,209,193,0.12)', color: '#1fd1c1', border: '1px solid rgba(31,209,193,0.3)' }}>
              Вилка цен «от — до»
            </span>
          </div>

          {/* Breakdown items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {calculatedItems.map(item => {
              const pct = Math.round((item.midVnd / totalMidVnd) * 100);
              const rangeStr = formatRange(item.minVnd, item.maxVnd);
              return (
                <div key={item.key} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#1fd1c1' }}>{rangeStr}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{pct}% бюджета</div>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #1fd1c1, #38bdf8)', borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Budget Card */}
          <div style={{
            marginTop: 24, padding: '24px', borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(31,209,193,0.14) 0%, rgba(6,78,59,0.25) 100%)',
            border: '1.5px solid rgba(31,209,193,0.4)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#1fd1c1', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              💰 Итоговый бюджет в месяц (вилка)
            </div>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginTop: 4, letterSpacing: '-0.8px' }}>
              {formatRange(totalMinVnd, totalMaxVnd)}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
              В день: ~{formatRange(Math.round(totalMinVnd / 30), Math.round(totalMaxVnd / 30))}
            </div>
          </div>
        </div>

        {/* Initial Relocation Expenses */}
        <div style={{
          padding: 28, borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
            <span>🛫 Первоначальные расходы на переезд (разово)</span>
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>
            Сумма, которую нужно иметь на руках при въезде помимо ежемесячного бюджета
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {INITIAL_EXPENSES.map((ex, idx) => (
              <div key={idx} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{ex.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1fd1c1' }}>{ex.valUsd}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
