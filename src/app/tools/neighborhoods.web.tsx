'use client';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { NEIGHBORHOODS, NeighborhoodData } from '@/lib/neighborhoodsData';
import BrandLogo from '@/components/BrandLogo';

export default function NeighborhoodsWebScreen() {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [filterGenerator, setFilterGenerator] = useState<boolean>(false);
  const [filterFiber, setFilterFiber] = useState<boolean>(false);
  const [filterQuiet, setFilterQuiet] = useState<boolean>(false);

  const filteredList = NEIGHBORHOODS.filter(n => {
    if (selectedCity !== 'all' && n.cityId !== selectedCity) return false;
    if (selectedTag !== 'all' && !n.tags.includes(selectedTag)) return false;
    if (filterGenerator && !n.hasGenerator) return false;
    if (filterFiber && !n.hasFiber) return false;
    if (filterQuiet && !n.noConstruction) return false;
    return true;
  });

  const ALL_TAGS = ['all', 'Пляж', 'Кафе и коворкинги', 'Русское комьюнити', 'Семейный', 'Тишина', 'Премиум', 'Природа'];

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
      boxSizing: 'border-box',
      backgroundColor: '#0c0714',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 90,
    }}>
      {/* Background glow */}
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

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
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
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.io</span> → <span style={{ color: '#1fd1c1' }}>Карта жилья</span>
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
            🏡 Гид по районам Вьетнама · Цены 2026 · Генераторы и оптоволокно
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Карта районов и аренда жилья
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
            Где селиться в Дананге, Нячанге, Хошимине, Ханое и на Фукуоке: реальные цены кондо, уровень шума, близость к морю, резервные генераторы при тайфунах и оптоволокно для работы.
          </p>
        </div>

        {/* City Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { id: 'all', label: '🌏 Все города' },
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
                  padding: '9px 16px',
                  borderRadius: 12,
                  border: active ? '1.5px solid #1fd1c1' : '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(31,209,193,0.16)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#1fd1c1' : '#cbd5e1',
                  fontWeight: active ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Feature toggles */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24,
          padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => setFilterGenerator(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: filterGenerator ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              background: filterGenerator ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)',
              color: filterGenerator ? '#f59e0b' : '#94a3b8',
            }}
          >
            ⚡ Дизель-генератор (свет 24/7)
          </button>
          <button
            onClick={() => setFilterFiber(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: filterFiber ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: filterFiber ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
              color: filterFiber ? '#38bdf8' : '#94a3b8',
            }}
          >
            🌐 Оптоволокно FTTH 200+ Мбит
          </button>
          <button
            onClick={() => setFilterQuiet(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: filterQuiet ? '1.5px solid #1fd1c1' : '1px solid rgba(255,255,255,0.1)',
              background: filterQuiet ? 'rgba(31,209,193,0.2)' : 'rgba(255,255,255,0.03)',
              color: filterQuiet ? '#1fd1c1' : '#94a3b8',
            }}
          >
            🔇 Тишина / Без строек
          </button>
        </div>

        {/* Tags filter chips */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {ALL_TAGS.map(t => {
            const active = selectedTag === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: active ? '1px solid #1fd1c1' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(31,209,193,0.15)' : 'transparent',
                  color: active ? '#1fd1c1' : '#64748b',
                }}
              >
                {t === 'all' ? 'Все теги' : `#${t}`}
              </button>
            );
          })}
        </div>

        {/* Neighborhood Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
          {filteredList.map(n => (
            <div
              key={n.id}
              className="epats-card"
              style={{
                borderRadius: 20,
                background: 'rgba(25, 16, 38, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1fd1c1', textTransform: 'uppercase' }}>
                      {n.cityName}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>
                      {n.shortName}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: n.noiseColor,
                    background: n.noiseColor + '18', padding: '3px 8px', borderRadius: 8,
                    border: '1px solid ' + n.noiseColor + '40',
                  }}>
                    {n.noiseLevel}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
                  {n.vibe}
                </p>
              </div>

              {/* Price comparison cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Студия / 1-спальня</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#1fd1c1' }}>{n.studioPriceUsd}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>в месяц</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>2-спальная кв.</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#38bdf8' }}>{n.twoBedPriceUsd}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>в месяц</div>
                </div>
              </div>

              {/* Beach proximity & Tech specs */}
              <div style={{ fontSize: 12, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>📍 <b>Пляж:</b> {n.beachProximity}</div>
                {n.hasGenerator && <div>⚡ <b>Генератор 24/7:</b> {n.generatorDesc}</div>}
                {n.hasFiber && <div>🌐 <b>Интернет:</b> {n.fiberSpeed}</div>}
              </div>

              {/* Pros & Cons */}
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <b style={{ color: '#1fd1c1' }}>Плюсы:</b>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#94a3b8' }}>
                    {n.pros.map((p, idx) => <li key={idx}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <b style={{ color: '#f59e0b' }}>Нюансы:</b>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#94a3b8' }}>
                    {n.cons.map((c, idx) => <li key={idx}>{c}</li>)}
                  </ul>
                </div>
              </div>

              {/* Best for */}
              <div style={{
                marginTop: 'auto', padding: '10px 12px', borderRadius: 12,
                background: 'rgba(31,209,193,0.08)', border: '1px solid rgba(31,209,193,0.2)',
                fontSize: 12, color: '#fff',
              }}>
                🎯 <b>Идеально для:</b> {n.bestFor}
              </div>
            </div>
          ))}
        </div>

        {/* Rental Tips Checklist */}
        <div style={{
          padding: 28, borderRadius: 20,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
            💡 Чеклист перед подписанием договора аренды во Вьетнаме
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 13, color: '#94a3b8' }}>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <b style={{ color: '#fff', display: 'block', marginBottom: 4 }}>1. Депозит</b>
              Стандартный депозит — 1 месяц аренды. Возвращается в день выезда после осмотра квартиры.
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <b style={{ color: '#fff', display: 'block', marginBottom: 4 }}>2. Тариф на свет (EVN)</b>
              Проверьте цену кВт·ч: гостариф ~2 700 – 3 200 ₫. Лендлорды часто ставят 3 500 – 4 000 ₫.
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <b style={{ color: '#fff', display: 'block', marginBottom: 4 }}>3. Регистрация (Tạm trú)</b>
              Хозяин обязан зарегистрировать вас в полиции в течение 24 часов. Без этого возможен штраф при вылете.
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <b style={{ color: '#fff', display: 'block', marginBottom: 4 }}>4. Комиссия риелтору</b>
              Во Вьетнаме комиссию риелтору ВСЕГДА платит хозяин квартиры (лендлорд). С арендатора брать комиссию незаконно.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
